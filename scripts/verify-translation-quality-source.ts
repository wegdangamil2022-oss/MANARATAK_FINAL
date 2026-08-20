import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const failures: string[] = [];
const passes: string[] = [];

function read(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), 'utf8');
}

function pass(message: string): void {
  passes.push(message);
}

function requireCondition(condition: boolean, message: string): void {
  if (condition) pass(message);
  else failures.push(message);
}

function requireIncludes(source: string, needle: string, message: string): void {
  requireCondition(source.includes(needle), message);
}

function dictionaryKeys(relativePath: string): Set<string> {
  const keys = new Set<string>();
  const source = read(relativePath);
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s{2}"([^"]+)"\s*:/);
    if (match) keys.add(match[1]);
  }
  requireCondition(keys.size > 0, `${relativePath}: dictionary keys detected`);
  requireCondition(!/^\s{2}"[^"]+"\s*:\s*""\s*,?\s*$/m.test(source), `${relativePath}: no blank dictionary values`);
  return keys;
}

function compareDictionaryPair(label: string, enPath: string, arPath: string): Set<string> {
  const enKeys = dictionaryKeys(enPath);
  const arKeys = dictionaryKeys(arPath);
  const onlyEn = [...enKeys].filter((key) => !arKeys.has(key));
  const onlyAr = [...arKeys].filter((key) => !enKeys.has(key));
  requireCondition(
    onlyEn.length === 0 && onlyAr.length === 0,
    `${label}: AR/EN dictionary key parity${onlyEn.length || onlyAr.length ? ` (only EN: ${onlyEn.join(', ') || '-'}; only AR: ${onlyAr.join(', ') || '-'})` : ''}`,
  );
  return enKeys;
}

function walkSourceFiles(directory: string): string[] {
  const absolute = resolve(ROOT, directory);
  const results: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const file = join(absolute, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      results.push(...walkSourceFiles(relative(ROOT, file)));
      continue;
    }
    if (['.ts', '.tsx'].includes(extname(file))) results.push(file);
  }
  return results;
}

function checkLiteralTranslationCalls(label: string, directory: string, keys: Set<string>): void {
  const missing = new Set<string>();
  const callPattern = /\bt\(\s*['"`]([^'"`$]+)['"`]\s*\)/g;
  for (const file of walkSourceFiles(directory)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(callPattern)) {
      if (!keys.has(match[1])) missing.add(`${relative(ROOT, file)}:${match[1]}`);
    }
  }
  requireCondition(
    missing.size === 0,
    `${label}: no missing literal translation keys / raw-key leakage candidates${missing.size ? ` (${[...missing].join(', ')})` : ''}`,
  );
}

function checkI18nProvider(relativePath: string, label: string): void {
  const source = read(relativePath);
  requireIncludes(source, 'getLocaleDirection(language)', `${label}: direction derives from locale contract`);
  requireIncludes(source, 'document.documentElement.lang = language', `${label}: document lang tracks locale`);
  requireIncludes(source, 'document.documentElement.dir = dir', `${label}: document direction tracks locale`);
}

function checkSourceOnlyEnvironment(): void {
  requireCondition(!process.env.DATABASE_URL, 'DATABASE_URL is unset for translation quality gate');
  requireCondition(process.env.DATABASE_MUTATIONS_ALLOWED === 'false', 'DATABASE_MUTATIONS_ALLOWED=false');
  requireCondition(process.env.DATABASE_ENVIRONMENT === 'source', 'DATABASE_ENVIRONMENT=source');
}

function checkLocaleContracts(): void {
  const shared = read('packages/shared/src/localization/locale.ts');
  requireIncludes(shared, "SUPPORTED_LOCALES = ['ar', 'en']", 'supported locales remain ar,en');
  requireIncludes(shared, "DEFAULT_LOCALE: SupportedLocale = 'ar'", 'default locale remains ar');
  requireIncludes(shared, "return locale === 'ar' ? 'rtl' : 'ltr'", 'AR/EN RTL/LTR contract remains explicit');
  requireIncludes(shared, "availability: 'MISSING'", 'missing-locale outcome remains explicit');

  const api = read('apps/api/src/presentation/api/locale/LocaleQueryContract.ts');
  requireIncludes(api, "UNSUPPORTED_LOCALE_ERROR_CODE = 'UNSUPPORTED_LOCALE'", 'API unsupported-locale error remains explicit');
  requireIncludes(api, 'isApplicationSupportedLocale', 'API locale validation uses application locale contract');
  requireIncludes(api, '.default(APPLICATION_DEFAULT_LOCALE)', 'API locale default uses application default contract');
}

function checkProjectionAndImportContracts(): void {
  const projection = read('packages/application/src/localization/ApplicationLocaleProjectionService.ts');
  for (const method of ['projectUniversity', 'projectMajor', 'projectInternationalTest']) {
    requireIncludes(projection, method, `application projection exposes ${method}`);
  }
  requireIncludes(projection, 'resolveLocalizedLocale', 'application projection uses canonical fallback resolver');

  const preparation = read('packages/application/src/translation-import/TranslationImportPreparationService.ts');
  requireIncludes(preparation, 'gateway.resolveExact(locator)', 'translation import resolves exact canonical target');
  requireIncludes(preparation, 'TRANSLATION_EXACT_IDENTITY_RESOLUTION_VIOLATION', 'translation import rejects identity mismatch');
  requireIncludes(preparation, 'TRANSLATION_CANONICAL_TARGET_NOT_FOUND', 'missing canonical target fails closed');
  requireIncludes(preparation, "const MAJOR_PUBLIC_ID = /^(MJR|MAS|DOC|FEL)-", 'protected Major-family public IDs remain exact-match inputs');
  requireIncludes(preparation, 'const UNIVERSITY_PUBLIC_ID = /^INS-', 'protected University public IDs remain exact-match inputs');
}

function checkSeoContracts(): void {
  const seo = read('apps/web/src/seo/localeSeo.ts');
  requireIncludes(seo, 'canonical: alternates[input.locale]', 'SEO canonical follows requested locale');
  requireIncludes(seo, 'xDefault: alternates.ar', 'SEO x-default remains Arabic');
  requireIncludes(seo, 'SUPPORTED_LOCALES.map', 'SEO creates all supported hreflang alternates');

  const component = read('apps/web/src/components/Seo.tsx');
  requireIncludes(component, "upsertAlternateLink('ar'", 'SEO component emits Arabic hreflang');
  requireIncludes(component, "upsertAlternateLink('en'", 'SEO component emits English hreflang');
  requireIncludes(component, "upsertAlternateLink('x-default'", 'SEO component emits x-default');
  requireIncludes(component, "upsertMeta('og:locale'", 'SEO component emits locale-aware metadata');

  const routing = read('apps/web/src/i18n/localeRouting.ts');
  requireIncludes(routing, 'localizePathname', 'localized route builder remains present');
  requireIncludes(routing, 'stripLocalePrefix', 'localized route normalization remains present');
}

checkSourceOnlyEnvironment();
const webKeys = compareDictionaryPair('Web UI', 'apps/web/src/i18n/en.ts', 'apps/web/src/i18n/ar.ts');
const adminKeys = compareDictionaryPair('Admin UI', 'apps/admin/src/i18n/en.ts', 'apps/admin/src/i18n/ar.ts');
checkLiteralTranslationCalls('Web UI', 'apps/web/src', webKeys);
checkLiteralTranslationCalls('Admin UI', 'apps/admin/src', adminKeys);
checkI18nProvider('apps/web/src/i18n/I18nProvider.tsx', 'Web UI');
checkI18nProvider('apps/admin/src/i18n/I18nProvider.tsx', 'Admin UI');
checkLocaleContracts();
checkProjectionAndImportContracts();
checkSeoContracts();

if (failures.length > 0) {
  process.stderr.write([
    'TRANSLATION_SOURCE_QUALITY_GATE = FAIL',
    ...passes.map((message) => `PASS: ${message}`),
    ...failures.map((message) => `FAIL: ${message}`),
  ].join('\n') + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write([
    'TRANSLATION_SOURCE_QUALITY_GATE = PASS',
    ...passes.map((message) => `PASS: ${message}`),
    'MIGRATIONS_APPLIED = 0',
    'CLOUD_SQL_MUTATIONS = 0',
    'PROTECTED_ID_REGENERATION = 0',
  ].join('\n') + '\n');
}

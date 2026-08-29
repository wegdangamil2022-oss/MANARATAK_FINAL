import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const featureRoot = resolve(process.cwd(), 'apps/web/src/features/public-template');
const themeSource = readFileSync(join(featureRoot, 'template.css'), 'utf8');

function publicTemplateSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return publicTemplateSources(path);
    if (!/\.(css|tsx)$/.test(entry.name) || entry.name === 'ManaratakLogo.tsx') return [];
    return [readFileSync(path, 'utf8')];
  });
}

describe('public brand theme contract', () => {
  it('defines semantic surfaces and readable roles for both themes', () => {
    expect(themeSource).toContain('.manaratak-public {');
    expect(themeSource).toContain('.dark .manaratak-public {');
    for (const token of [
      '--mn-page',
      '--mn-surface',
      '--mn-surface-elevated',
      '--mn-heading',
      '--mn-text',
      '--mn-text-muted',
      '--mn-primary',
      '--mn-accent',
      '--mn-focus',
    ]) {
      expect(themeSource.match(new RegExp(token, 'g'))?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('does not restore global important overrides or translucent white card surfaces', () => {
    const source = publicTemplateSources(featureRoot).join('\n');
    expect(source).not.toContain('!important');
    expect(source).not.toMatch(/bg-white\/(?:80|90|95)/);
  });

  it('keeps legacy green colors out of the public template', () => {
    const source = publicTemplateSources(featureRoot).join('\n');
    expect(source).not.toMatch(/#(?:01241b|033a2c|012219|043324|166551)/i);
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(resolve(process.cwd(), 'packages/infrastructure/prisma/schema.prisma'), 'utf8');
const migration = readFileSync(
  resolve(
    process.cwd(),
    'packages/infrastructure/prisma/migrations/20260820231500_normalize_scholarship_model/migration.sql',
  ),
  'utf8',
);

function modelBody(modelName: string): string {
  const match = schema.match(new RegExp(`model ${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  expect(match, `Prisma model ${modelName} should exist`).not.toBeNull();
  return match?.[1] ?? '';
}

describe('WP12-2 normalized Scholarship schema', () => {
  it('keeps the existing Scholarship identity and legacy JSON during expand', () => {
    const scholarship = modelBody('Scholarship');
    expect(scholarship).toMatch(/\bpublicId\s+String\s+@unique/);
    expect(scholarship).toMatch(/\boptionalFields\s+Json\?/);
    expect(scholarship).toMatch(/\bsourceLocale\s+String\?/);
    expect(scholarship).toMatch(/\bbenefits\s+ScholarshipBenefit\[\]/);
    expect(scholarship).toMatch(/\buniversityLinks\s+ScholarshipUniversityLink\[\]/);
  });

  it('defines all normalized child models with deterministic scholarship-scoped uniqueness', () => {
    const expectations: Array<[string, RegExp]> = [
      ['ScholarshipBenefit', /@@unique\(\[scholarshipId,\s*benefitKey\]\)/],
      ['ScholarshipDegreeTarget', /@@unique\(\[scholarshipId,\s*targetKey\]\)/],
      ['ScholarshipMajorTarget', /@@unique\(\[scholarshipId,\s*targetKey\]\)/],
      ['ScholarshipEligibilityItem', /@@unique\(\[scholarshipId,\s*itemKey\]\)/],
      ['ScholarshipRequiredDocument', /@@unique\(\[scholarshipId,\s*documentKey\]\)/],
      ['ScholarshipSourceEvidence', /@@unique\(\[scholarshipId,\s*evidenceKey\]\)/],
      ['ScholarshipUniversityLink', /@@unique\(\[scholarshipId,\s*linkKey\]\)/],
    ];

    for (const [model, uniquePattern] of expectations) {
      expect(modelBody(model)).toMatch(uniquePattern);
    }
  });

  it('uses nullable upstream canonical references instead of creating duplicate entities', () => {
    expect(modelBody('Scholarship')).toContain('ReferenceCountry?');
    expect(modelBody('ScholarshipBenefit')).toContain('ReferenceCurrency?');
    expect(modelBody('ScholarshipDegreeTarget')).toContain('DegreeLevel?');
    expect(modelBody('ScholarshipMajorTarget')).toContain('Major?');
    expect(modelBody('ScholarshipEligibilityItem')).toContain('InternationalTest?');
    expect(modelBody('ScholarshipUniversityLink')).toContain('University?');
    expect(modelBody('ScholarshipUniversityLink')).toContain('UniversityAcademicProgram?');
  });

  it('keeps the migration expand-only and free of data backfill operations', () => {
    expect(migration).not.toMatch(/\bDROP\s+(TABLE|COLUMN)\b/i);
    expect(migration).not.toMatch(/\bTRUNCATE\b/i);
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(migration).not.toMatch(/\bUPDATE\s+\S+\s+SET\b/i);
    expect(migration).toContain('CREATE TABLE "ScholarshipSourceEvidence"');
    expect(migration).toContain('ALTER TABLE "Scholarship" ADD COLUMN "sourceLocale"');
  });
});

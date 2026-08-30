import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../api/client';
import {
  loadPublishedScholarships,
  mapPublicScholarshipDto,
  resolvePublicTemplateDataMode,
} from './publicScholarshipDataSource';

describe('public scholarship data source', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps prototype mode explicit unless API mode is requested', () => {
    expect(resolvePublicTemplateDataMode(undefined)).toBe('prototype');
    expect(resolvePublicTemplateDataMode('prototype')).toBe('prototype');
    expect(resolvePublicTemplateDataMode('api')).toBe('api');
  });

  it('maps the canonical public projection without inventing featured state', () => {
    const mapped = mapPublicScholarshipDto(
      {
        publicId: 'scholarship-1',
        slug: 'published-scholarship',
        displayName: 'منحة منشورة',
        canonicalName: 'Published Scholarship',
        fundingCoverage: 'ممولة بالكامل',
        coverageDetails: 'الرسوم، السكن',
        eligibleMajorsOrFields: ['الهندسة', 'الطب'],
        degreeLevel: 'Bachelor, Master',
        studyCountry: 'المملكة المتحدة',
        targetUniversities: ['جامعة أكسفورد', 'جامعة كامبريدج'],
        applicationDeadline: '2027-01-31T00:00:00.000Z',
        applicationLink: 'https://example.edu/apply',
        eligibilityCriteria: 'كشف الدرجات، خطاب الدافع',
        updatedAt: '2026-08-31T00:00:00.000Z',
      },
      new Date('2026-08-31T00:00:00.000Z'),
    );

    expect(mapped.id).toBe('scholarship-1');
    expect(mapped.degreeLevel).toEqual(['بكالوريوس', 'ماجستير']);
    expect(mapped.financialCoverage).toEqual(['الرسوم', 'السكن']);
    expect(mapped.participatingUniversities).toHaveLength(2);
    expect(mapped.applicationUrl).toBe('https://example.edu/apply');
    expect(mapped.featured).toBe(false);
  });

  it('fails closed instead of returning prototype records when the API is unavailable', async () => {
    vi.spyOn(ApiClient, 'getScholarships').mockRejectedValue(new Error('unavailable'));

    await expect(loadPublishedScholarships()).rejects.toThrow('unavailable');
  });
});

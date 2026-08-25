import { describe, expect, it } from 'vitest';
import { UniversityPublicationReadinessPolicy } from '../../src/universities/UniversityPublicationReadinessPolicy';
import { UniversityImportCompletenessState, UniversityStatus } from '../../src/universities/universities';

describe('UniversityPublicationReadinessPolicy normalized program mappings', () => {
  it('blocks a CANONICALLY_MAPPED program whose canonical IDs are missing regardless of legacy status', () => {
    const result = new UniversityPublicationReadinessPolicy().evaluate({
      id: 'uni-1', publicId: 'INS-YEM-0001', slug: 'uni', canonicalName: 'University', canonicalDedupKey: 'uni', displayName: 'University',
      countryReferenceId: 'country-ye', status: UniversityStatus.READY_TO_PUBLISH,
      completenessStatus: UniversityImportCompletenessState.COMPLETE,
      academicPrograms: [{ universityRefId: 'INS-YEM-0001', sourceProgramName: 'Computer Science', degreeLevelCanonicalCode: '', status: 'PENDING', majorMappingState: 'CANONICALLY_MAPPED' }],
    });
    expect(result.blockingIssues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'UNIVERSITY_PROGRAM_MAJOR_REFERENCE_MISSING',
      'UNIVERSITY_PROGRAM_DEGREE_REFERENCE_MISSING',
    ]));
  });
});

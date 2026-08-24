import { UniversityNormalizedDetailsUpdate } from '@manaratak/domain';

export class UniversityCanonicalRelationshipValidator {
  constructor(private readonly client: any) {}

  async validate(details: UniversityNormalizedDetailsUpdate): Promise<void> {
    for (const campus of details.campuses ?? []) await this.validateCampus(campus);
    for (const program of details.academicPrograms ?? []) {
      if (!program.degreeLevelId) throw new Error('UNIVERSITY_PROGRAM_DEGREE_LEVEL_REQUIRED');
      await this.validateProgram(program.degreeLevelId, program.majorId, program.majorMappingState);
      for (const requirement of program.admissionRequirements ?? []) {
        await this.validateTest(
          requirement.internationalTestId,
          requirement.testVariantId,
          requirement.testVersionId,
        );
      }
    }
  }

  async validateCampus(input: {
    countryReferenceId?: string;
    regionReferenceId?: string;
    cityReferenceId?: string;
  }): Promise<void> {
    const country = input.countryReferenceId
      ? await this.client.referenceCountry.findUnique({
          where: { id: input.countryReferenceId },
          select: { iso2Code: true },
        })
      : null;
    if (input.countryReferenceId && !country)
      throw new Error('UNIVERSITY_CAMPUS_COUNTRY_NOT_FOUND');
    const region = input.regionReferenceId
      ? await this.client.administrativeRegion.findUnique({
          where: { id: input.regionReferenceId },
          select: { countryIso2Code: true },
        })
      : null;
    if (input.regionReferenceId && !region) throw new Error('UNIVERSITY_CAMPUS_REGION_NOT_FOUND');
    const city = input.cityReferenceId
      ? await this.client.referenceCity.findUnique({
          where: { id: input.cityReferenceId },
          select: { countryIso2Code: true, administrativeRegionId: true },
        })
      : null;
    if (input.cityReferenceId && !city) throw new Error('UNIVERSITY_CAMPUS_CITY_NOT_FOUND');
    if (country && region && country.iso2Code !== region.countryIso2Code)
      throw new Error('UNIVERSITY_CAMPUS_REGION_COUNTRY_MISMATCH');
    if (country && city && country.iso2Code !== city.countryIso2Code)
      throw new Error('UNIVERSITY_CAMPUS_CITY_COUNTRY_MISMATCH');
    if (region && city && city.administrativeRegionId !== input.regionReferenceId)
      throw new Error('UNIVERSITY_CAMPUS_CITY_REGION_MISMATCH');
  }

  async validateProgram(
    degreeLevelId: string,
    majorId?: string,
    mappingState?: string,
  ): Promise<void> {
    const degree = await this.client.degreeLevel.findUnique({
      where: { id: degreeLevelId },
      select: { id: true },
    });
    if (!degree) throw new Error('UNIVERSITY_PROGRAM_DEGREE_LEVEL_NOT_FOUND');
    if (!majorId) return;
    const major = await this.client.major.findUnique({
      where: { id: majorId },
      select: { id: true },
    });
    if (!major) throw new Error('UNIVERSITY_PROGRAM_MAJOR_NOT_FOUND');
    if (mappingState === 'CANONICALLY_MAPPED') {
      const profile = await this.client.majorLevelProfile.findFirst({
        where: { majorId, degreeLevelId },
        select: { id: true },
      });
      if (!profile) throw new Error('UNIVERSITY_PROGRAM_MAJOR_DEGREE_MISMATCH');
    }
  }

  async validateTest(testId: string, variantId?: string, versionId?: string): Promise<void> {
    const test = await this.client.internationalTest.findUnique({
      where: { id: testId },
      select: { id: true },
    });
    if (!test) throw new Error('UNIVERSITY_ADMISSION_TEST_NOT_FOUND');
    if (variantId) {
      const variant = await this.client.internationalTestVariant.findUnique({
        where: { id: variantId },
        select: { testId: true },
      });
      if (!variant) throw new Error('UNIVERSITY_ADMISSION_TEST_VARIANT_NOT_FOUND');
      if (variant.testId !== testId) throw new Error('UNIVERSITY_ADMISSION_TEST_VARIANT_MISMATCH');
    }
    if (versionId) {
      const version = await this.client.internationalTestVersion.findUnique({
        where: { id: versionId },
        select: { testId: true },
      });
      if (!version) throw new Error('UNIVERSITY_ADMISSION_TEST_VERSION_NOT_FOUND');
      if (version.testId !== testId) throw new Error('UNIVERSITY_ADMISSION_TEST_VERSION_MISMATCH');
    }
  }
}

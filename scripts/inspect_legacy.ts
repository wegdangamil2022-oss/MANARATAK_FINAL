import { PrismaClient } from '@prisma/client';

const SQL_USER = process.env.SQL_USER;
const SQL_PASSWORD = process.env.SQL_PASSWORD;
const SQL_HOST = process.env.SQL_HOST;
const SQL_DB_NAME = process.env.SQL_DB_NAME;
const encodedPassword = encodeURIComponent(SQL_PASSWORD!);
const url = `postgresql://${SQL_USER}:${encodedPassword}@localhost/${SQL_DB_NAME}?host=${SQL_HOST}`;
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function inspectLegacy() {
  const ids = ['test-bmat-med', 'test-csca-finance', 'test-cambridge-intl'];

  for (const id of ids) {
    const test = await prisma.internationalTest.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            contentBlocks: true,
            scoreScales: true,
            sessions: true,
            requirements: true,
            policies: true,
          }
        },
        variants: true,
        sections: true,
        fees: true,
        officialLinks: true,
        preparationMaterials: true,
        centers: true,
        countryRelationships: true,
        languageRelationships: true,
        academicTaxonomyRelationships: true,
        equivalencyMappings: true,
      }
    });

    console.log('====================================================');
    console.log('ID:', id);
    if (!test) {
      console.log('NOT FOUND IN DB');
      continue;
    }
    console.log('Status:', test.status);
    console.log('Canonical Name:', test.canonicalName);
    console.log('Slug:', test.slug);
    console.log('Versions count:', test.versions.length);
    const cbCount = test.versions.reduce((acc, v) => acc + v.contentBlocks.length, 0);
    console.log('ContentBlocks count:', cbCount);
    console.log('Variants:', test.variants.length);
    console.log('Sections:', test.sections.length);
    console.log('Fees:', test.fees.length);
    console.log('Official Links:', test.officialLinks.length);
    console.log('Preparation Materials:', test.preparationMaterials.length);
    console.log('Centers:', test.centers.length);
    console.log('Country Relationships:', test.countryRelationships.length);
    console.log('Language Relationships:', test.languageRelationships.length);
    console.log('Academic Taxonomy Relationships:', test.academicTaxonomyRelationships.length);
    console.log('Equivalency Mappings:', test.equivalencyMappings.length);

    try {
      const degreeRels: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "InternationalTestDegreeRelationship" WHERE "testId" = '${id}'`);
      console.log('Degree Relationships (raw sql):', degreeRels.length);
    } catch (e: any) {
      console.log('Degree Relationships error:', e.message);
    }

    if (id === 'test-cambridge-intl') {
      console.log('--- Cambridge Intl Details ---');
      console.log('Country Relationships:', JSON.stringify(test.countryRelationships, null, 2));
      console.log('Language Relationships:', JSON.stringify(test.languageRelationships, null, 2));
      console.log('Academic Taxonomy Relationships:', JSON.stringify(test.academicTaxonomyRelationships, null, 2));
      console.log('Equivalency Mappings:', JSON.stringify(test.equivalencyMappings, null, 2));
    }
  }

  // Also check supported status values in DB
  const statuses = await prisma.$queryRawUnsafe(`SELECT DISTINCT "status" FROM "InternationalTest"`);
  console.log('Statuses currently in DB:', statuses);

  // Check test-alevel-uk details to see if Cambridge relationships should transfer to it
  const alevel = await prisma.internationalTest.findUnique({
    where: { id: 'test-alevel-uk' },
    include: {
      countryRelationships: true,
      languageRelationships: true,
      academicTaxonomyRelationships: true,
      equivalencyMappings: true,
    }
  });
  console.log('====================================================');
  console.log('test-alevel-uk:', alevel ? {
    id: alevel.id,
    canonicalName: alevel.canonicalName,
    countryRelationships: alevel.countryRelationships.length,
    languageRelationships: alevel.languageRelationships.length,
    academicTaxonomyRelationships: alevel.academicTaxonomyRelationships.length,
    equivalencyMappings: alevel.equivalencyMappings.length
  } : 'NOT FOUND');
}

inspectLegacy().finally(() => prisma.$disconnect());

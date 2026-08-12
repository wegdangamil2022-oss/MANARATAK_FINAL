import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

// --- DATABASE CONNECTION ---
const { SQL_USER, SQL_PASSWORD, SQL_HOST, SQL_DB_NAME, SQL_ADMIN_USER, SQL_ADMIN_PASSWORD } = process.env;
let url = process.env.DATABASE_URL;
if (!url || url.includes('postgres-host')) {
    const user = SQL_ADMIN_USER || SQL_USER;
    const pass = SQL_ADMIN_PASSWORD || SQL_PASSWORD;
    const encodedPassword = encodeURIComponent(pass || '');
    url = `postgresql://${user}:${encodedPassword}@localhost/${SQL_DB_NAME}?host=${SQL_HOST}`;
}
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  console.log('=== STARTING COUNTRY AUDIT ===');

  // 1. READ ALL EXCEL FILES TO IDENTIFY ORIGINAL COUNTRIES
  const countriesDir = path.join(process.cwd(), 'workspace/reference-data/countries');
  const excelFiles = [
    'MANARATAK_Africa_Country_Records_Detailed.xlsx',
    'MANARATAK_Antarctica_Reference.xlsx',
    'MANARATAK_Asia_Country_Records_Detailed.xlsx',
    'MANARATAK_Europe_Country_Records_Detailed.xlsx',
    'MANARATAK_North_America_Country_Records_Detailed.xlsx',
    'MANARATAK_Oceania_Country_Records_Detailed.xlsx',
    'MANARATAK_South_America_Country_Records_Detailed.xlsx'
  ];

  const excelIso2s = new Set<string>();
  const excelCountryDetails = new Map<string, any>();

  for (const file of excelFiles) {
    const filePath = path.join(countriesDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Excel file not found: ${filePath}`);
      continue;
    }
    const buf = fs.readFileSync(filePath);
    const workbook = XLSX.read(buf);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    for (const row of rows) {
      const iso2 = row['رمز ISO ALPHA-2'];
      if (iso2) {
        excelIso2s.add(iso2);
        excelCountryDetails.set(iso2, {
          iso2,
          iso3: row['رمز ISO ALPHA-3'],
          nameEn: row['اسم الدولة بالإنجليزية'],
          nameAr: row['اسم الدولة بالعربية'],
          region: row['المنطقة'],
          subregion: row['المنطقة الفرعية'],
          file: file
        });
      }
    }
  }

  console.log(`Parsed ${excelIso2s.size} unique country ISO2 codes from Excel files.`);

  // 2. QUERY DATABASE COUNTRY, CITY AND REGION INFORMATION
  const dbCountries = await prisma.referenceCountry.findMany({
    orderBy: { iso2Code: 'asc' }
  });
  console.log(`Total ReferenceCountry rows in Database: ${dbCountries.length}`);

  const dbCities = await prisma.referenceCity.findMany();
  console.log(`Total ReferenceCity rows in Database: ${dbCities.length}`);

  const dbRegions = await prisma.administrativeRegion.findMany();
  console.log(`Total AdministrativeRegion rows in Database: ${dbRegions.length}`);

  // Create lookup map for city counts and region counts per countryIso2Code
  const cityCountMap = new Map<string, number>();
  for (const city of dbCities) {
    const code = city.countryIso2Code;
    cityCountMap.set(code, (cityCountMap.get(code) || 0) + 1);
  }

  const regionCountMap = new Map<string, number>();
  for (const reg of dbRegions) {
    const code = reg.countryIso2Code;
    regionCountMap.set(code, (regionCountMap.get(code) || 0) + 1);
  }

  // Find added countries (in database but not in original Excel files)
  const addedCountries: any[] = [];
  const intactOriginalCountries: any[] = [];
  
  for (const c of dbCountries) {
    const isOriginal = excelIso2s.has(c.iso2Code);
    const meta = c.metadata as any;
    const info = {
      id: c.id,
      iso2: c.iso2Code,
      iso3: c.iso3Code,
      nameEn: c.name,
      nameAr: meta?.nameAr || '',
      region: c.region,
      subregion: c.subregion,
      cities: cityCountMap.get(c.iso2Code) || 0,
      regions: regionCountMap.get(c.iso2Code) || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };

    if (isOriginal) {
      intactOriginalCountries.push(info);
    } else {
      addedCountries.push(info);
    }
  }

  console.log(`Database vs Excel:`);
  console.log(`- Intact Original Countries in DB: ${intactOriginalCountries.length}`);
  console.log(`- Added Countries in DB: ${addedCountries.length}`);

  // Print details of added countries
  console.log('\n--- DETAILED ADDED COUNTRIES REPORT ---');
  for (const ac of addedCountries) {
    console.log(`ISO2: ${ac.iso2} | ISO3: ${ac.iso3} | ID: ${ac.id} | Name: ${ac.nameEn} | NameAr: ${ac.nameAr} | Region: ${ac.region} | Subregion: ${ac.subregion} | Cities: ${ac.cities} | Regions: ${ac.regions}`);
  }

  // 3. AUDIT CONTINENT COUNTS
  const continentCounts: Record<string, number> = {};
  for (const c of dbCountries) {
    const r = c.region || 'NULL';
    continentCounts[r] = (continentCounts[r] || 0) + 1;
  }
  console.log('\n--- CURRENT DATABASE CONTINENT COUNTS ---');
  console.log(JSON.stringify(continentCounts, null, 2));

  // 4. CHECK FOR DUPLICATE COUNTRY IDENTITIES
  console.log('\n--- DUPLICATE IDENTITIES CHECK ---');
  const iso2List = dbCountries.map(c => c.iso2Code);
  const iso3List = dbCountries.map(c => c.iso3Code);
  const nameList = dbCountries.map(c => c.name.toLowerCase().trim());

  const dupIso2 = iso2List.filter((item, index) => iso2List.indexOf(item) !== index);
  const dupIso3 = iso3List.filter((item, index) => iso3List.indexOf(item) !== index);
  const dupNames = nameList.filter((item, index) => nameList.indexOf(item) !== index);

  console.log(`Duplicate ISO2 count: ${dupIso2.length} (${dupIso2.join(', ')})`);
  console.log(`Duplicate ISO3 count: ${dupIso3.length} (${dupIso3.join(', ')})`);
  console.log(`Duplicate Names count: ${dupNames.length} (${dupNames.join(', ')})`);

  // 5. AUDIT CONTINENT CLASSIFICATION CONFLICTS
  console.log('\n--- AUDITING CONTINENT CLASSIFICATION CONFLICTS ---');
  let conflictCount = 0;
  for (const c of dbCountries) {
    const excelInfo = excelCountryDetails.get(c.iso2Code);
    if (excelInfo) {
      // Map Americas to North/South America like import script does
      let expectedRegion = excelInfo.region;
      if (excelInfo.region === 'Americas') {
        if (excelInfo.subregion === 'South America') {
          expectedRegion = 'South America';
        } else {
          expectedRegion = 'North America';
        }
      }

      if (c.region !== expectedRegion) {
        conflictCount++;
        console.log(`Conflict [${c.iso2Code}] ${c.name}:`);
        console.log(`  - DB Region: ${c.region}`);
        console.log(`  - Excel Region: ${excelInfo.region}`);
        console.log(`  - Excel Subregion: ${excelInfo.subregion}`);
        console.log(`  - Expected mapped: ${expectedRegion}`);
      }
    }
  }
  console.log(`Total classification conflicts found: ${conflictCount}`);

  // Let's also check if there are any cities belonging to these countries where city.metadata.continent doesn't match country.region
  let cityContinentMismatchCount = 0;
  const sampleMismatches: any[] = [];
  for (const city of dbCities) {
    const country = dbCountries.find(c => c.iso2Code === city.countryIso2Code);
    if (country) {
      const cityMeta = city.metadata as any;
      const cityContinent = cityMeta?.continent;
      if (cityContinent && country.region !== cityContinent) {
        cityContinentMismatchCount++;
        if (sampleMismatches.length < 10) {
          sampleMismatches.push({
            cityId: city.id,
            cityName: city.name,
            country: country.iso2Code,
            countryRegion: country.region,
            cityContinent: cityContinent
          });
        }
      }
    }
  }
  console.log(`Total city metadata continent vs country region mismatches: ${cityContinentMismatchCount}`);
  if (sampleMismatches.length > 0) {
    console.log('Sample mismatches:');
    console.log(JSON.stringify(sampleMismatches, null, 2));
  }

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

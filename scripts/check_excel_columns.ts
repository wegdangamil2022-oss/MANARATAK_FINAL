import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const files = [
  path.join('workspace', 'reference-data', 'countries', 'MANARATAK_Asia_Country_Records_Detailed.xlsx'),
  path.join('workspace', 'reference-data', 'countries', 'MANARATAK_Europe_Country_Records_Detailed.xlsx')
];

for (const file of files) {
  console.log(`Checking ${file}...`);
  const buf = fs.readFileSync(file);
  const workbook = XLSX.read(buf);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Columns:', data[0]);
}

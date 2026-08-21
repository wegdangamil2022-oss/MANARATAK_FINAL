import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { CourseMasterArtifactParser } from '../../src/import-foundation/parsers/CourseMasterArtifactParser';

const HEADERS = [
  'No.',
  'Platform / University',
  'Course Name',
  'Direct Course URL',
  'Study Free',
  'Free Certificate',
  'Certificate Type',
  'Language',
  'Study Level',
  'Course Duration',
  'Short Course Topics (4)',
];

function workbookBytes(rows: unknown[][], sheetName = 'Courses'): Uint8Array {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  return new Uint8Array(
    XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true }),
  );
}

describe('CourseMasterArtifactParser', () => {
  it('parses exact course-master columns and preserves worksheet row numbers', () => {
    const bytes = workbookBytes([
      [1, 'Saylor University', 'Course A', 'https://learn.saylor.org/course/view.php?id=1', 'Yes', 'Yes', 'Certificate of Completion', 'English', 'Not officially specified', '10 hours', 'Business'],
      ['', '', '', '', '', '', '', '', '', '', ''],
      [2, 'Saylor University', 'Course B', 'https://learn.saylor.org/course/view.php?id=2', 'Yes', 'No', 'None', 'English', 'Not officially specified', '8 hours', 'Ethics'],
    ]);

    const result = CourseMasterArtifactParser.parse({
      bytes,
      originalFilename: 'courses.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      declaredByteSize: bytes.byteLength,
    });

    expect(result.rows.map((row) => row.sourceRowNumber)).toEqual([2, 4]);
    expect(result.ignoredBlankRows).toBe(1);
    expect(result.security?.archiveEntryCount).toBeGreaterThan(0);
  });

  it('requires the Courses sheet', () => {
    const bytes = workbookBytes([[1, 'x']], 'WrongSheet');
    expect(() =>
      CourseMasterArtifactParser.parse({
        bytes,
        originalFilename: 'courses.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        declaredByteSize: bytes.byteLength,
      }),
    ).toThrow('COURSE_MASTER_REQUIRED_SHEET_MISSING');
  });

  it('reports missing required headers', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['Course Name'], ['Course A']]),
      'Courses',
    );
    const bytes = new Uint8Array(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true }),
    );
    const result = CourseMasterArtifactParser.parse({
      bytes,
      originalFilename: 'courses.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      declaredByteSize: bytes.byteLength,
    });
    expect(result.rows).toHaveLength(0);
    expect(
      result.issues.some((issue) => issue.code === 'COURSE_MASTER_REQUIRED_COLUMN_MISSING'),
    ).toBe(true);
  });

  it('rejects formula cells', () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      HEADERS,
      [1, 'Saylor University', 'Course A', 'https://learn.saylor.org/course/view.php?id=1', 'Yes', 'Yes', 'Certificate', 'English', 'Level', '10h', 'Topic'],
    ]);
    sheet.C2 = { t: 'n', f: '1+1', v: 2 };
    XLSX.utils.book_append_sheet(workbook, sheet, 'Courses');
    const bytes = new Uint8Array(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true }),
    );
    const result = CourseMasterArtifactParser.parse({
      bytes,
      originalFilename: 'courses.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      declaredByteSize: bytes.byteLength,
    });
    expect(
      result.issues.some((issue) => issue.code === 'COURSE_XLSX_FORMULA_CELL_REJECTED'),
    ).toBe(true);
  });

  it('parses UTF-8 CSV with the same contract', () => {
    const csv = `${HEADERS.join(',')}\n1,Saylor University,Course A,https://learn.saylor.org/course/view.php?id=1,Yes,No,None,English,Not officially specified,10 hours,Topic`;
    const bytes = new TextEncoder().encode(csv);
    const result = CourseMasterArtifactParser.parse({
      bytes,
      originalFilename: 'courses.csv',
      mimeType: 'text/csv',
      declaredByteSize: bytes.byteLength,
    });
    expect(result.format).toBe('CSV');
    expect(result.rows).toHaveLength(1);
  });
});

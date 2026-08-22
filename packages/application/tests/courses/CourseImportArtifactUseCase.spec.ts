import { describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';
import {
  AssetLifecycleState,
  AssetStorageLocator,
  AssetStorageZone,
  ExternalCourseProviderImportStrategy,
  ExternalCourseProviderStatus,
} from '@manaratak/domain';
import { CourseImportArtifactUseCase } from '../../src/courses/use-cases/CourseImportArtifactUseCase';

const HEADERS = [
  'No.', 'Platform / University', 'Course Name', 'Direct Course URL', 'Study Free',
  'Free Certificate', 'Certificate Type', 'Language', 'Study Level', 'Course Duration',
  'Short Course Topics (4)',
];

function artifactBytes(rows: unknown[][] = [[
  1, 'Saylor University', 'Course A', 'https://learn.saylor.org/course/view.php?id=1', 'Yes', 'Yes', 'Certificate of Completion', 'English', 'Not officially specified', '10 hours', 'Business',
]]): Uint8Array {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      HEADERS,
      ...rows,
    ]),
    'Courses',
  );
  return new Uint8Array(
    XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true }),
  );
}

function formulaArtifactBytes(): Uint8Array {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, [
    1, 'Saylor University', 'Course A', 'https://learn.saylor.org/course/view.php?id=1', 'Yes', 'Yes',
    'Certificate of Completion', 'English', 'Not officially specified', '10 hours', 'Business',
  ]]);
  sheet.C2 = { t: 'n', f: '1+1', v: 2 };
  XLSX.utils.book_append_sheet(workbook, sheet, 'Courses');
  return new Uint8Array(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true }));
}

function fixture(existingArtifact = false, bytes = artifactBytes()) {
  const asset = {
    state: AssetLifecycleState.ACTIVE,
    locator: new AssetStorageLocator(AssetStorageZone.CLEAN, 'bucket', 'clean/courses.xlsx'),
    metadata: {
      originalFilename: 'courses.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      byteSize: bytes.byteLength,
    },
  };
  const provider = {
    id: 'provider-1',
    publicId: 'ecp-saylor',
    slug: 'saylor-university',
    canonicalName: 'Saylor University',
    normalizedCanonicalName: 'saylor university',
    displayName: 'Saylor University',
    status: ExternalCourseProviderStatus.APPROVED,
    sourceTrustLevel: 'OFFICIAL',
    importStrategy: ExternalCourseProviderImportStrategy.FILE,
    allowedDomains: ['learn.saylor.org'],
    aliases: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const stageNormalizedRows = vi.fn(async (input) => ({
    batch: { id: 'batch-new' },
    summary: { totalRecords: input.rows.length },
  }));

  const listRecords = vi.fn(async () => ({
    data: existingArtifact
      ? [{ batchId: 'batch-existing', rawPayload: { _artifactSha256: 'will-be-replaced' } }]
      : [],
    total: existingArtifact ? 1 : 0,
    page: 1,
    pageSize: 100,
  }));

  const useCase = new CourseImportArtifactUseCase(
    { findById: vi.fn(async () => asset) } as any,
    { read: vi.fn(async () => bytes) } as any,
    {
      resolveByName: vi.fn(async () => provider),
      isDomainApproved: vi.fn(async () => true),
    } as any,
    { stageNormalizedRows, listRecords } as any,
  );

  return { useCase, stageNormalizedRows, listRecords, bytes };
}

describe('CourseImportArtifactUseCase', () => {
  it('preflights without creating Phase 06 staging', async () => {
    const { useCase, stageNormalizedRows } = fixture();
    const result = await useCase.preflight({ assetId: 'asset-1' });
    expect(result.valid).toBe(true);
    expect(result.summary.rowsFound).toBe(1);
    expect(stageNormalizedRows).not.toHaveBeenCalled();
  });

  it('stages through Phase 06 and embeds artifact provenance plus worksheet row', async () => {
    const { useCase, stageNormalizedRows } = fixture();
    const result = await useCase.stage({ assetId: 'asset-1' });
    expect(result.duplicateArtifact).toBe(false);
    const input = stageNormalizedRows.mock.calls[0][0];
    expect(input.ownerDomain).toBe('COURSES');
    expect(input.rows[0]._artifactSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(input.rows[0]._worksheetRowNumber).toBe(2);
    expect(input.rows[0]._assetId).toBe('asset-1');
  });

  it('does not stage an exact artifact already present in Course import records', async () => {
    const { useCase, stageNormalizedRows, listRecords, bytes } = fixture();
    const crypto = await import('crypto');
    const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
    listRecords.mockResolvedValue({
      data: [{ batchId: 'batch-existing', rawPayload: { _artifactSha256: sha } }],
      total: 1,
      page: 1,
      pageSize: 100,
    });

    const result = await useCase.stage({ assetId: 'asset-1' });
    expect(result).toMatchObject({
      duplicateArtifact: true,
      existingBatchId: 'batch-existing',
    });
    expect(stageNormalizedRows).not.toHaveBeenCalled();
  });

  it('fails closed when parser detects a non-empty cell outside the 11-column contract', async () => {
    const bytes = artifactBytes([[
      1, 'Saylor University', 'Course A', 'https://learn.saylor.org/course/view.php?id=1', 'Yes', 'Yes',
      'Certificate of Completion', 'English', 'Not officially specified', '10 hours', 'Business', 'unexpected',
    ]]);
    const { useCase, stageNormalizedRows } = fixture(false, bytes);

    const preflight = await useCase.preflight({ assetId: 'asset-1' });
    expect(preflight.valid).toBe(false);
    expect(preflight.issues).toContainEqual(expect.objectContaining({
      code: 'COURSE_MASTER_ROW_COLUMN_COUNT_MISMATCH',
      rowNumber: 2,
    }));

    await expect(useCase.stage({ assetId: 'asset-1' })).rejects.toThrow('COURSE_ARTIFACT_PREFLIGHT_FAILED');
    expect(stageNormalizedRows).not.toHaveBeenCalled();
  });

  it('fails closed when the Courses sheet contains a formula cell', async () => {
    const { useCase, stageNormalizedRows } = fixture(false, formulaArtifactBytes());
    const preflight = await useCase.preflight({ assetId: 'asset-1' });
    expect(preflight.valid).toBe(false);
    expect(preflight.issues).toContainEqual(expect.objectContaining({
      code: 'COURSE_XLSX_FORMULA_CELL_REJECTED',
      rowNumber: 2,
    }));

    await expect(useCase.stage({ assetId: 'asset-1' })).rejects.toThrow('COURSE_ARTIFACT_PREFLIGHT_FAILED');
    expect(stageNormalizedRows).not.toHaveBeenCalled();
  });
});

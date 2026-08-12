import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { MajorFilters, PaginatedMajorResult } from '@manaratak/domain';

export interface CatalogItemDto {
  id: string;
  displayName: string;
  nameAr?: string;
  nameEn?: string;
  code: string;
  degreeLevel: string;
  catalogKind: string;
  targetDomain: string;
  collegeOrField?: string;
  academicFieldOrDiscipline?: string;
  collegeOrFaculty?: string;
  classificationCode?: string;
  sourceFileName?: string;
  status: string;
  completenessStatus?: string;
  sectionCount?: number;
  sourceType?: string;
  updatedAt?: string;
  hasDbDetails?: boolean;
}

export class Phase10CatalogRepository {
  private static cachedCatalog: { items: CatalogItemDto[], mtimeMs: number } | null = null;

  constructor(private readonly prisma: PrismaClient) {}

  public loadCatalog(): CatalogItemDto[] {

    const possiblePaths = [
      '/app/applet/workspace/catalog-index/phase10CatalogIndex.json',
    ];

    let currentDir = process.cwd();
    for (let i = 0; i < 6; i++) {
      possiblePaths.push(path.join(currentDir, 'workspace/catalog-index/phase10CatalogIndex.json'));
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }

    if (typeof __dirname !== 'undefined') {
      let dir = __dirname;
      for (let i = 0; i < 6; i++) {
        possiblePaths.push(path.join(dir, 'workspace/catalog-index/phase10CatalogIndex.json'));
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    }

    let items: CatalogItemDto[] = [];
    
    let currentMtimeMs = 0;

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const stats = fs.statSync(p);
          currentMtimeMs = stats.mtimeMs;
          
          if (Phase10CatalogRepository.cachedCatalog && Phase10CatalogRepository.cachedCatalog.mtimeMs === currentMtimeMs) {
            return Phase10CatalogRepository.cachedCatalog.items;
          }
          
          const content = fs.readFileSync(p, 'utf-8');
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
            break;
          }
        } catch (err) {
          console.error(`Failed reading catalog index at ${p}:`, err);
        }
      }
    }

    if (items.length > 0) {
      console.log('[Phase10CatalogRepository.loadCatalog] LOADED items count:', items.length);
      Phase10CatalogRepository.cachedCatalog = { items, mtimeMs: currentMtimeMs };
      return items;
    }
    
    throw new Error('Phase10CatalogRepository: Failed to load complete catalog index from any known path. Will not fallback to DB-only state.');
  }

  public async listCatalog(filters: MajorFilters & { catalog?: string }): Promise<PaginatedMajorResult<CatalogItemDto>> {
    const rawCatalog = this.loadCatalog();
    let filtered = rawCatalog;

    if (filters.degreeLevel) {
      const targetDeg = filters.degreeLevel.toUpperCase();
      filtered = filtered.filter((item) => {
        const k = (item.catalogKind || item.degreeLevel || '').toUpperCase();
        return k === targetDeg || (targetDeg === 'BACHELOR' && k === 'BACHELOR') ||
               (targetDeg === 'MASTER' && k === 'MASTER') ||
               (targetDeg === 'DOCTORATE' && k === 'DOCTORATE') ||
               (targetDeg === 'FELLOWSHIP' && k === 'FELLOWSHIP');
      });
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.completenessStatus) {
      filtered = filtered.filter((item) => item.completenessStatus === filters.completenessStatus);
    }

    if (filters.academicFieldOrDiscipline) {
      const field = filters.academicFieldOrDiscipline.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.collegeOrField && item.collegeOrField.toLowerCase().includes(field)) ||
        (item.academicFieldOrDiscipline && item.academicFieldOrDiscipline.toLowerCase().includes(field))
      );
    }

    if (filters.search) {
      const s = filters.search.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.code.toLowerCase().includes(s) ||
        item.displayName.toLowerCase().includes(s) ||
        (item.nameAr && item.nameAr.toLowerCase().includes(s)) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(s)) ||
        (item.collegeOrField && item.collegeOrField.toLowerCase().includes(s))
      );
    }

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 50));
    const start = (page - 1) * pageSize;
    const sourcePage = filtered.slice(start, start + pageSize);
    const pageCodes = sourcePage.map((item) => item.code);

    let dbProfiles: any[] = [];
    if (pageCodes.length > 0) {
      try {
        dbProfiles = await this.prisma.majorLevelProfile.findMany({
          where: { code: { in: pageCodes } },
          take: pageSize,
          select: {
            id: true,
            code: true,
            status: true,
            completenessStatus: true,
            displayName: true,
            localizedNameAr: true,
            localizedNameEn: true,
            metadata: true,
            updatedAt: true,
          }
        });
      } catch (err) {
        console.warn('Major catalog DB enrichment unavailable; returning source-only summaries', err);
      }
    }

    const dbMap = new Map(dbProfiles.filter((profile) => profile.code).map((profile) => [profile.code, profile]));
    const data = sourcePage.map((item) => {
      const dbProfile = dbMap.get(item.code);
      if (!dbProfile) return { ...item, hasDbDetails: false };
      const metadata = (dbProfile.metadata as Record<string, unknown>) || {};
      return {
        ...item,
        id: dbProfile.id,
        displayName: dbProfile.displayName || dbProfile.localizedNameAr || item.displayName,
        nameAr: dbProfile.localizedNameAr || item.nameAr,
        nameEn: dbProfile.localizedNameEn || item.nameEn,
        status: dbProfile.status || item.status,
        completenessStatus: dbProfile.completenessStatus || item.completenessStatus,
        sectionCount: typeof metadata.contentBlockCount === 'number' ? metadata.contentBlockCount : item.sectionCount,
        sourceType: typeof metadata.sourceImportMode === 'string' ? metadata.sourceImportMode : item.sourceType,
        hasDbDetails: true,
        updatedAt: dbProfile.updatedAt ? new Date(dbProfile.updatedAt).toISOString().split('T')[0] : item.updatedAt,
      };
    });

    return {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  }
}

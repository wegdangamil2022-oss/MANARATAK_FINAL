import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { MajorFilters, PaginatedMajorResult } from '@manaratak/domain';

export interface CatalogItemDto {
  id: string;
  profileId?: string;
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
  private static cachedCatalog: { items: CatalogItemDto[]; mtimeMs: number } | null = null;
  private static cachedDetails: Map<
    string,
    { sections: any[]; sourceFileName: string; collegeOrFaculty?: string }
  > | null = null;

  constructor(private readonly prisma: PrismaClient) {}

  public loadCatalog(): CatalogItemDto[] {
    const possiblePaths = [
      ...(process.env.MANARATAK_PHASE10_CATALOG_PATH
        ? [path.resolve(process.env.MANARATAK_PHASE10_CATALOG_PATH)]
        : []),
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

          if (
            Phase10CatalogRepository.cachedCatalog &&
            Phase10CatalogRepository.cachedCatalog.mtimeMs === currentMtimeMs
          ) {
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

    throw new Error(
      'Phase10CatalogRepository: Failed to load complete catalog index from any known path. Will not fallback to DB-only state.',
    );
  }

  public async listCatalog(
    filters: MajorFilters & { catalog?: string },
  ): Promise<PaginatedMajorResult<CatalogItemDto>> {
    const rawCatalog = this.loadCatalog();
    let filtered = rawCatalog;

    if (filters.degreeLevel) {
      const targetDeg = filters.degreeLevel.toUpperCase();
      filtered = filtered.filter((item) => {
        const k = (item.catalogKind || item.degreeLevel || '').toUpperCase();
        return (
          k === targetDeg ||
          (targetDeg === 'BACHELOR' && k === 'BACHELOR') ||
          (targetDeg === 'MASTER' && k === 'MASTER') ||
          (targetDeg === 'DOCTORATE' && k === 'DOCTORATE') ||
          (targetDeg === 'FELLOWSHIP' && k === 'FELLOWSHIP')
        );
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
      filtered = filtered.filter(
        (item) =>
          (item.collegeOrField && item.collegeOrField.toLowerCase().includes(field)) ||
          (item.academicFieldOrDiscipline &&
            item.academicFieldOrDiscipline.toLowerCase().includes(field)),
      );
    }

    if (filters.search) {
      const s = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(s) ||
          item.displayName.toLowerCase().includes(s) ||
          (item.nameAr && item.nameAr.toLowerCase().includes(s)) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(s)) ||
          (item.collegeOrField && item.collegeOrField.toLowerCase().includes(s)),
      );
    }

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 50));
    const start = (page - 1) * pageSize;
    const details = this.loadDetails();
    const sourcePage = filtered.slice(start, start + pageSize).map((item) => {
      const detail = details.get(item.code);
      return detail
        ? {
            ...item,
            collegeOrField: detail.collegeOrFaculty || item.collegeOrField,
            collegeOrFaculty: detail.collegeOrFaculty || item.collegeOrFaculty,
            sectionCount: detail.sections.length,
            sourceType: 'DETAIL_DOSSIER',
            sourceFileName: detail.sourceFileName,
          }
        : item;
    });
    const pageCodes = sourcePage.map((item) => item.code);

    let dbProfiles: any[] = [];
    if (pageCodes.length > 0) {
      try {
        dbProfiles = await this.prisma.majorLevelProfile.findMany({
          where: { code: { in: pageCodes } },
          take: pageSize,
          select: {
            id: true,
            majorId: true,
            code: true,
            status: true,
            completenessStatus: true,
            displayName: true,
            localizedNameAr: true,
            localizedNameEn: true,
            metadata: true,
            updatedAt: true,
          },
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') throw err;
        console.warn(
          'Major catalog DB enrichment unavailable; returning source-only summaries',
          err,
        );
      }
    }

    const dbMap = new Map(
      dbProfiles.filter((profile) => profile.code).map((profile) => [profile.code, profile]),
    );
    const data = sourcePage.map((item) => {
      const dbProfile = dbMap.get(item.code);
      if (!dbProfile) return { ...item, hasDbDetails: false };
      const metadata = (dbProfile.metadata as Record<string, unknown>) || {};
      return {
        ...item,
        id: dbProfile.majorId,
        profileId: dbProfile.id,
        displayName: dbProfile.displayName || dbProfile.localizedNameAr || item.displayName,
        nameAr: dbProfile.localizedNameAr || item.nameAr,
        nameEn: dbProfile.localizedNameEn || item.nameEn,
        status: dbProfile.status || item.status,
        completenessStatus: dbProfile.completenessStatus || item.completenessStatus,
        sectionCount:
          typeof metadata.contentBlockCount === 'number'
            ? metadata.contentBlockCount
            : item.sectionCount,
        sourceType:
          typeof metadata.sourceImportMode === 'string'
            ? metadata.sourceImportMode
            : item.sourceType,
        hasDbDetails: true,
        updatedAt: dbProfile.updatedAt
          ? new Date(dbProfile.updatedAt).toISOString().split('T')[0]
          : item.updatedAt,
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

  public getCatalogItem(id: string): CatalogItemDto | null {
    const code = id.replace(/^cat-/, '');
    const item = this.loadCatalog().find(
      (candidate) => candidate.id === id || candidate.code === code,
    );
    if (!item) return null;
    const detail = this.loadDetails().get(item.code);
    return {
      ...item,
      collegeOrField: detail?.collegeOrFaculty || item.collegeOrField,
      collegeOrFaculty: detail?.collegeOrFaculty || item.collegeOrFaculty,
      sectionCount: detail?.sections.length ?? item.sectionCount ?? 0,
      sourceType: detail ? 'DETAIL_DOSSIER' : item.sourceType,
      sourceFileName: detail?.sourceFileName || item.sourceFileName,
      hasDbDetails: false,
    };
  }

  public getCatalogContentSections(id: string): any[] {
    const code = id.replace(/^cat-/, '');
    return this.loadDetails().get(code)?.sections ?? [];
  }

  public getCatalogSource(id: string): any[] {
    const item = this.getCatalogItem(id);
    if (!item) return [];
    return [
      {
        sourceType: item.sourceType,
        sourceName: item.sourceFileName,
        sourceUri: `workspace/phase-10-major-detail-dossiers/${item.sourceFileName}`,
      },
    ];
  }

  public listCollegeFacets(degreeLevel?: string) {
    const target = degreeLevel?.toUpperCase();
    const groups = new Map<string, { name: string; degrees: Set<string>; majorCount: number }>();
    for (const base of this.loadCatalog()) {
      const detail = this.loadDetails().get(base.code);
      const item = detail
        ? {
            ...base,
            collegeOrField: detail.collegeOrFaculty || base.collegeOrField,
            collegeOrFaculty: detail.collegeOrFaculty || base.collegeOrFaculty,
          }
        : base;
      const degree = item.degreeLevel || item.catalogKind;
      if (target && degree.toUpperCase() !== target) continue;
      const name = item.collegeOrFaculty || item.collegeOrField || item.academicFieldOrDiscipline;
      if (!name?.trim()) continue;
      const current = groups.get(name) ?? { name, degrees: new Set<string>(), majorCount: 0 };
      current.degrees.add(degree);
      current.majorCount += 1;
      groups.set(name, current);
    }
    return [...groups.values()]
      .map((group) => ({
        name: group.name,
        supportedDegrees: [...group.degrees].sort(),
        majorCount: group.majorCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  private loadDetails() {
    if (Phase10CatalogRepository.cachedDetails) return Phase10CatalogRepository.cachedDetails;
    const result = new Map<
      string,
      { sections: any[]; sourceFileName: string; collegeOrFaculty?: string }
    >();
    const roots = this.findWorkspaceRoots()
      .map((root) => path.join(root, 'phase-10-major-detail-dossiers'))
      .filter((root) => fs.existsSync(root));
    for (const root of roots.slice(0, 1)) {
      for (const filePath of this.walkMarkdown(root)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const recordPattern = /^#\s+\d+\.\s+.+?(?=^#\s+\d+\.|(?![\s\S]))/gms;
        for (const match of content.matchAll(recordPattern)) {
          const record = match[0];
          const code = record.match(/\b(?:MJR|MAS|DOC|FEL)-\d{4}\b/)?.[0];
          if (!code) continue;
          const collegeOrFaculty = record
            .match(/^\|\s*(?:الكلية|المجال الأكاديمي|المجال المهني)\s*\|\s*([^|]+)\|/m)?.[1]
            ?.trim();
          const headings = [...record.matchAll(/^##\s+(.+)$/gm)];
          const sections = headings
            .map((heading, index) => {
              const start = (heading.index ?? 0) + heading[0].length;
              const end = headings[index + 1]?.index ?? record.length;
              return {
                id: `${code}-${index + 1}`,
                sectionKey: `${String(index + 1).padStart(2, '0')}-${heading[1].trim()}`,
                title: heading[1].replace(/^\d+(?:\.\d+)*[).:-]?\s*/, '').trim(),
                content: record.slice(start, end).trim(),
                reviewStatus: 'NEEDS_REVIEW',
              };
            })
            .filter((section) => section.content);
          result.set(code, { sections, sourceFileName: path.basename(filePath), collegeOrFaculty });
        }
      }
    }
    Phase10CatalogRepository.cachedDetails = result;
    return result;
  }

  private findWorkspaceRoots() {
    const roots: string[] = [];
    let current = process.cwd();
    for (let i = 0; i < 7; i++) {
      roots.push(path.join(current, 'workspace'));
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return roots;
  }
  private walkMarkdown(root: string): string[] {
    return fs
      .readdirSync(root, { withFileTypes: true })
      .flatMap((entry) =>
        entry.isDirectory()
          ? this.walkMarkdown(path.join(root, entry.name))
          : entry.name.toLowerCase().endsWith('.md')
            ? [path.join(root, entry.name)]
            : [],
      );
  }
}

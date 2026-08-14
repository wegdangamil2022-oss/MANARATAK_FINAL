import { Prisma, PrismaClient } from '@prisma/client';
import { AtomicPersistenceContext, ITransactionalUniversityRepository, IUniversityRepository } from '@manaratak/domain';

interface UniversityTransactionContext extends AtomicPersistenceContext { readonly transactionClient: Prisma.TransactionClient }

export class PrismaUniversityRepository implements ITransactionalUniversityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  withTransaction(context: AtomicPersistenceContext): IUniversityRepository {
    const transactionClient = (context as Partial<UniversityTransactionContext>).transactionClient;
    if (!context.boundaryId || !transactionClient) throw new Error('UNIVERSITY_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    return new PrismaUniversityRepository(transactionClient as unknown as PrismaClient);
  }

  async findById(id: string): Promise<any | null> {
    const record = await this.prisma.university.findUnique({ where: { id } });
    return record ? this.mapToDto(record) : null;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const record = await this.prisma.university.findUnique({ where: { slug } });
    return record ? this.mapToDto(record) : null;
  }

  async findByDedupKey(key: string): Promise<any | null> {
    const record = await this.prisma.university.findUnique({ where: { canonicalDedupKey: key } });
    return record ? this.mapToDto(record) : null;
  }

  async create(data: any): Promise<any> {
    const {
      publicId, slug, canonicalName, canonicalDedupKey, displayName, country, city,
      institutionType, officialWebsite, status, completenessStatus, sourceUrl, 
      officialSourceUrl, logoAssetId, foundedYear, sourceImportRecordId, optionalFields,
      ...rest
    } = data;
    
    const safeOptionalFields = {
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.university.create({
      data: {
        publicId, slug, canonicalName, canonicalDedupKey, displayName, country, city,
        institutionType, officialWebsite, status, completenessStatus, sourceUrl, 
        officialSourceUrl, logoAssetId, foundedYear, sourceImportRecordId,
        optionalFields: safeOptionalFields
      }
    });
    return this.mapToDto(record);
  }

  async update(id: string, updates: any): Promise<any> {
    const {
      id: _id, createdAt, updatedAt, publicId, slug, canonicalName, canonicalDedupKey,
      displayName, country, city, institutionType, officialWebsite, status, 
      completenessStatus, sourceUrl, officialSourceUrl, logoAssetId, foundedYear, 
      sourceImportRecordId, optionalFields,
      ...rest
    } = updates;
    
    const existing = await this.prisma.university.findUnique({ where: { id }});
    const existingOptional = (existing?.optionalFields as any) || {};

    const safeOptionalFields = {
      ...existingOptional,
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.university.update({
      where: { id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        country: country !== undefined ? country : undefined,
        city: city !== undefined ? city : undefined,
        institutionType: institutionType !== undefined ? institutionType : undefined,
        officialWebsite: officialWebsite !== undefined ? officialWebsite : undefined,
        status: status !== undefined ? status : undefined,
        completenessStatus: completenessStatus !== undefined ? completenessStatus : undefined,
        sourceUrl: sourceUrl !== undefined ? sourceUrl : undefined,
        officialSourceUrl: officialSourceUrl !== undefined ? officialSourceUrl : undefined,
        logoAssetId: logoAssetId !== undefined ? logoAssetId : undefined,
        foundedYear: foundedYear !== undefined ? foundedYear : undefined,
        sourceImportRecordId: sourceImportRecordId !== undefined ? sourceImportRecordId : undefined,
        optionalFields: safeOptionalFields
      }
    });
    return this.mapToDto(record);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.university.update({
      where: { id },
      data: { status }
    });
  }

  async list(filters: any): Promise<any> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 50));
    
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.country) where.country = filters.country;
    if (filters.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { canonicalName: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    const [data, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.university.count({ where })
    ]);
    
    return {
      data: data.map((d: any) => this.mapToDto(d)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async listPublished(filters: any): Promise<any> {
    return this.list({ ...filters, status: 'PUBLISHED' });
  }

  private mapToDto(record: any): any {
    const { optionalFields, ...rest } = record;
    return {
      ...rest,
      ...(typeof optionalFields === 'object' && optionalFields ? optionalFields : {})
    };
  }
}

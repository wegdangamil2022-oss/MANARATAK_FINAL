import { PrismaClient } from '@prisma/client';

export class PrismaScholarshipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<any | null> {
    const record = await this.prisma.scholarship.findUnique({ where: { id } });
    return record ? this.mapToDto(record) : null;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const record = await this.prisma.scholarship.findUnique({ where: { slug } });
    return record ? this.mapToDto(record) : null;
  }

  async findByDedupKey(key: string): Promise<any | null> {
    const record = await this.prisma.scholarship.findUnique({ where: { canonicalDedupKey: key } });
    return record ? this.mapToDto(record) : null;
  }

  async create(data: any): Promise<any> {
    const {
      publicId, slug, canonicalName, canonicalDedupKey, displayName, providerName,
      status, completenessStatus, amountMinorUnits, amountCurrencyCode, isFullyFunded,
      applicationDeadline, officialWebsite, sourceUrl, optionalFields,
      ...rest
    } = data;
    
    const safeOptionalFields = {
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.scholarship.create({
      data: {
        publicId, slug, canonicalName, canonicalDedupKey, displayName, providerName,
        status, completenessStatus, amountMinorUnits, amountCurrencyCode, isFullyFunded,
        applicationDeadline, officialWebsite, sourceUrl,
        optionalFields: safeOptionalFields
      }
    });
    return this.mapToDto(record);
  }

  async update(id: string, updates: any): Promise<any> {
    const {
      id: _id, createdAt, updatedAt, publicId, slug, canonicalName, canonicalDedupKey,
      displayName, providerName, status, completenessStatus, amountMinorUnits, 
      amountCurrencyCode, isFullyFunded, applicationDeadline, officialWebsite, sourceUrl,
      optionalFields,
      ...rest
    } = updates;
    
    const existing = await this.prisma.scholarship.findUnique({ where: { id }});
    const existingOptional = (existing?.optionalFields as any) || {};

    const safeOptionalFields = {
      ...existingOptional,
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.scholarship.update({
      where: { id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        providerName: providerName !== undefined ? providerName : undefined,
        status: status !== undefined ? status : undefined,
        completenessStatus: completenessStatus !== undefined ? completenessStatus : undefined,
        amountMinorUnits: amountMinorUnits !== undefined ? amountMinorUnits : undefined,
        amountCurrencyCode: amountCurrencyCode !== undefined ? amountCurrencyCode : undefined,
        isFullyFunded: isFullyFunded !== undefined ? isFullyFunded : undefined,
        applicationDeadline: applicationDeadline !== undefined ? applicationDeadline : undefined,
        officialWebsite: officialWebsite !== undefined ? officialWebsite : undefined,
        sourceUrl: sourceUrl !== undefined ? sourceUrl : undefined,
        optionalFields: safeOptionalFields
      }
    });
    return this.mapToDto(record);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.scholarship.update({
      where: { id },
      data: { status }
    });
  }

  async list(filters: any): Promise<any> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.country) where.optionalFields = { path: ['studyCountry'], equals: filters.country };
    
    const [data, total] = await Promise.all([
      this.prisma.scholarship.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.scholarship.count({ where })
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

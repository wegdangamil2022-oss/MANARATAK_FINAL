import { Identity, IIdentityRepository, ListIdentitiesCriteria } from '@manaratak/domain';
import { IdentityMapper } from './IdentityMapper';

export class PrismaIdentityRepository implements IIdentityRepository {
  constructor(private readonly prisma: any) {}

  private get delegate() {
    // If running in an environment without prisma generated models, this avoids hard crashing
    if (this.prisma && this.prisma.identityRecord) {
      return this.prisma.identityRecord;
    }
    // Fallback or test mock
    return (this.prisma as any).identityRecord || this.prisma;
  }

  public async findById(id: string): Promise<Identity | null> {
    const record = await this.delegate.findUnique({
      where: { id },
      include: { user: true, account: true }
    });
    if (!record) return null;
    return IdentityMapper.toDomain(record);
  }

  public async findByEmail(email: string): Promise<Identity | null> {
    const record = await this.delegate.findFirst({
      where: { user: { primaryEmail: { equals: email, mode: 'insensitive' } } },
      include: { user: true, account: true }
    });
    if (!record) return null;
    return IdentityMapper.toDomain(record);
  }

  public async findByPhone(phone: string): Promise<Identity | null> {
    const record = await this.delegate.findFirst({
      where: { user: { primaryPhone: phone } },
      include: { user: true, account: true }
    });
    if (!record) return null;
    return IdentityMapper.toDomain(record);
  }

  public async save(identity: Identity): Promise<void> {
    const data = IdentityMapper.toPersistence(identity);
    const id = data.id;
    
    const existing = await this.delegate.findUnique({ where: { id } });
    if (existing) {
      const { user, account, ...identityData } = data;
      await this.delegate.update({
        where: { id },
        data: {
          ...identityData,
          ...(user ? { user: { upsert: user } } : {}),
          ...(account ? { account: { upsert: account } } : {})
        }
      });
    } else {
      const { user, account, ...identityData } = data;
      await this.delegate.create({
        data: {
          ...identityData,
          ...(user ? { user: { create: user.create } } : {}),
          ...(account ? { account: { create: account.create } } : {})
        }
      });
    }
  }

  public async update(identity: Identity): Promise<void> {
    await this.save(identity);
  }

  public async delete(id: string): Promise<void> {
    await this.delegate.delete({ where: { id } });
  }

  public async findAll(): Promise<Identity[]> {
    const records = await this.delegate.findMany({
      include: { user: true, account: true }
    });
    return records.map((r: any) => IdentityMapper.toDomain(r));
  }

  public async isEmailUnique(email: string): Promise<boolean> {
    const existing = await this.delegate.findFirst({
      where: { user: { primaryEmail: email } },
      select: { id: true }
    });
    return !existing;
  }

  public async isPhoneUnique(phone: string): Promise<boolean> {
    const existing = await this.delegate.findFirst({
      where: { user: { primaryPhone: phone } },
      select: { id: true }
    });
    return !existing;
  }

  public async findPaged(criteria: ListIdentitiesCriteria): Promise<{ items: Identity[]; total: number }> {
    const where: any = {};
    if (criteria.type) {
      where.type = criteria.type;
    }
    if (criteria.status) {
      where.status = criteria.status;
    }

    const [total, records] = await Promise.all([
      this.delegate.count({ where }),
      this.delegate.findMany({
        where,
        take: criteria.limit !== undefined ? criteria.limit : 20,
        skip: criteria.offset !== undefined ? criteria.offset : 0,
        include: { user: true, account: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: records.map((r: any) => IdentityMapper.toDomain(r)),
      total
    };
  }
}

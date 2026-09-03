import { PrismaClient } from '@prisma/client';
import {
  CareerEmployerDto,
  CareerEmployerFilters,
  CareerJobFilters,
  CareerJobPostingDto,
  CareerJobStatus,
  CreateCareerEmployerDto,
  CreateCareerJobPostingDto,
  ICareerRepository,
  PaginatedCareerResult,
  UpdateCareerEmployerDto,
  CareerJobRepositoryUpdateDto,
} from '@manaratak/domain';

const record = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const strings = (value: unknown): string[] | null => Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : null;

export class PrismaCareerRepository implements ICareerRepository {
  constructor(private readonly prisma: PrismaClient) {}
  private employers() { return (this.prisma as any).careerEmployerRecord; }
  private jobs() { return (this.prisma as any).careerJobPostingRecord; }

  async createEmployer(data: CreateCareerEmployerDto) { return this.mapEmployer(await this.employers().create({ data })); }
  async updateEmployer(id: string, data: UpdateCareerEmployerDto) { return this.mapEmployer(await this.employers().update({ where: { id }, data })); }
  async findEmployerById(id: string) { const row = await this.employers().findUnique({ where: { id } }); return row ? this.mapEmployer(row) : null; }
  async findEmployerBySlug(slug: string) { const row = await this.employers().findUnique({ where: { slug } }); return row ? this.mapEmployer(row) : null; }
  async findEmployerByDedupKey(canonicalDedupKey: string) { const row = await this.employers().findUnique({ where: { canonicalDedupKey } }); return row ? this.mapEmployer(row) : null; }
  async listEmployers(filters: CareerEmployerFilters): Promise<PaginatedCareerResult<CareerEmployerDto>> {
    const page = Math.max(filters.page ?? 1, 1); const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
    const where: any = { verificationStatus: filters.verificationStatus, employerType: filters.employerType, countryReferenceId: filters.countryReferenceId };
    Object.keys(where).forEach(k => where[k] === undefined && delete where[k]);
    const [rows,total] = await Promise.all([this.employers().findMany({ where, orderBy: { updatedAt: 'desc' }, skip:(page-1)*pageSize, take:pageSize }), this.employers().count({where})]);
    return { data: rows.map((r:any)=>this.mapEmployer(r)), total, page, pageSize, totalPages: Math.ceil(total/pageSize) };
  }

  async createJob(data: CreateCareerJobPostingDto) { return this.mapJob(await this.jobs().create({ data, include: { employer: true } })); }
  async updateJob(id: string, data: CareerJobRepositoryUpdateDto) { return this.mapJob(await this.jobs().update({ where: { id }, data, include: { employer: true } })); }
  async findJobById(id: string) { const row=await this.jobs().findUnique({where:{id},include:{employer:true}}); return row?this.mapJob(row):null; }
  async findJobBySlug(slug: string) { const row=await this.jobs().findUnique({where:{slug},include:{employer:true}}); return row?this.mapJob(row):null; }
  async findJobByDedupKey(canonicalDedupKey: string) { const row=await this.jobs().findUnique({where:{canonicalDedupKey},include:{employer:true}}); return row?this.mapJob(row):null; }
  async updateJobStatus(id: string, status: CareerJobStatus): Promise<void> { await this.jobs().update({where:{id},data:{status}}); }
  async listJobs(filters: CareerJobFilters) { return this.listJobsInternal(filters, false); }
  async listPublishedJobs(filters: Omit<CareerJobFilters,'status'>) { return this.listJobsInternal({...filters,status:CareerJobStatus.PUBLISHED}, true); }
  private async listJobsInternal(filters: CareerJobFilters, _publishedOnly: boolean): Promise<PaginatedCareerResult<CareerJobPostingDto>> {
    const page=Math.max(filters.page??1,1); const pageSize=Math.min(Math.max(filters.pageSize??20,1),100);
    const where:any={status:filters.status,opportunityType:filters.opportunityType,employmentType:filters.employmentType,jobCategory:filters.jobCategory,countryReferenceId:filters.countryReferenceId,cityReferenceId:filters.cityReferenceId,employerId:filters.employerId};
    Object.keys(where).forEach(k=>where[k]===undefined&&delete where[k]);
    const [rows,total]=await Promise.all([this.jobs().findMany({where,include:{employer:true},orderBy:{updatedAt:'desc'},skip:(page-1)*pageSize,take:pageSize}),this.jobs().count({where})]);
    return {data:rows.map((r:any)=>this.mapJob(r)),total,page,pageSize,totalPages:Math.ceil(total/pageSize)};
  }

  private mapEmployer(row:any): CareerEmployerDto { return {...row, metadata:record(row.metadata)}; }
  private mapJob(row:any): CareerJobPostingDto { return {...row, salaryRange:record(row.salaryRange), requiredSkills:strings(row.requiredSkills), languageRequirements:strings(row.languageRequirements), metadata:record(row.metadata), employer: row.employer ? this.mapEmployer(row.employer) : undefined}; }
}

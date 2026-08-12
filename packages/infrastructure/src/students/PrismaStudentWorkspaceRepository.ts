import { randomUUID } from 'node:crypto';

export class PrismaStudentWorkspaceRepository {
  constructor(private readonly prisma: any) {}

  async findWorkspace(studentReferenceId: string) {
    return this.prisma.studentWorkspace.findUnique({ where: { studentReferenceId } });
  }

  async upsertWorkspace(data: any) {
    const { studentReferenceId, ...values } = data;
    return this.prisma.studentWorkspace.upsert({
      where: { studentReferenceId },
      create: { studentReferenceId, status: values.status || 'ACTIVE', ...values },
      update: values
    });
  }

  async getDashboardSummary(studentReferenceId: string) {
    const workspace = await this.prisma.studentWorkspace.findUnique({
      where: { studentReferenceId },
      include: { savedItems: { orderBy: { savedAt: 'desc' } } }
    });
    if (!workspace) return null;
    const { savedItems, ...workspaceDto } = workspace;
    return {
      workspace: workspaceDto,
      savedItems,
      certificateCount: null,
      activeCourseEnrollmentCount: null,
      completedCourseEnrollmentCount: null,
      capabilityStatus: {
        workspace: 'AVAILABLE',
        savedItems: 'AVAILABLE',
        certificates: 'NOT_CONFIGURED',
        courseEnrollments: 'NOT_CONFIGURED'
      }
    };
  }

  async saveItem(data: any) {
    await this.prisma.studentWorkspace.upsert({
      where: { studentReferenceId: data.studentReferenceId },
      create: { studentReferenceId: data.studentReferenceId, status: 'ACTIVE' },
      update: {}
    });
    const existing = await this.prisma.studentSavedItem.findFirst({
      where: {
        studentReferenceId: data.studentReferenceId,
        entityType: data.entityType,
        entityId: data.entityId
      }
    });
    if (existing) {
      return this.prisma.studentSavedItem.update({ where: { id: existing.id }, data });
    }
    return this.prisma.studentSavedItem.create({ data: { id: randomUUID(), ...data } });
  }

  async removeSavedItem(studentReferenceId: string, entityType: string, entityId: string) {
    await this.prisma.studentSavedItem.deleteMany({
      where: { studentReferenceId, entityType, entityId }
    });
  }

  async listSavedItems(studentReferenceId: string) {
    return this.prisma.studentSavedItem.findMany({
      where: { studentReferenceId },
      orderBy: { savedAt: 'desc' }
    });
  }
}

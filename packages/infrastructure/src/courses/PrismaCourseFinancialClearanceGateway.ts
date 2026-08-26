import { PrismaClient } from '@prisma/client';
import { ICourseFinancialClearanceGateway } from '@manaratak/domain';

/** Read-only Phase 13 consumer of Phase 19 payment truth. */
export class PrismaCourseFinancialClearanceGateway implements ICourseFinancialClearanceGateway {
  public constructor(private readonly prisma: PrismaClient) {}

  public async hasCourseFinancialClearance(courseId: string, studentReferenceId: string): Promise<boolean> {
    const invoice = await this.prisma.financeInvoiceRecord.findFirst({
      where: {
        originDomain: 'COURSE_ENROLLMENT',
        originReferenceId: courseId,
        studentReferenceId,
        status: 'PAID',
      },
      select: { id: true },
    });
    return Boolean(invoice);
  }
}

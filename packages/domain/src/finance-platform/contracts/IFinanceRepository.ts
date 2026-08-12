import {
  CreateFinanceInvoiceDto,
  CreateFinancePaymentDto,
  FinanceInvoiceDto,
  FinanceInvoiceFilters,
  FinancePaymentDto,
  PaginatedFinanceResult
} from '../entities';
import { InvoiceStatus, PaymentStatus } from '../enums';
import { MoneyAmount } from '../value-objects';

export interface IFinanceRepository {
  createInvoice(data: CreateFinanceInvoiceDto): Promise<FinanceInvoiceDto>;
  findInvoiceById(id: string): Promise<FinanceInvoiceDto | null>;
  findInvoiceByNumber(invoiceNumber: string): Promise<FinanceInvoiceDto | null>;
  listInvoices(filters: FinanceInvoiceFilters): Promise<PaginatedFinanceResult<FinanceInvoiceDto>>;
  updateInvoiceStatus(id: string, status: InvoiceStatus, timestamps?: { paidAt?: Date; voidedAt?: Date }): Promise<void>;
  updateInvoiceAmountDue(id: string, amountDue: MoneyAmount, status: InvoiceStatus, paidAt?: Date): Promise<void>;

  createPayment(data: CreateFinancePaymentDto): Promise<FinancePaymentDto>;
  findPaymentByIdempotencyKey(idempotencyKey: string): Promise<FinancePaymentDto | null>;
  listPaymentsForInvoice(invoiceId: string): Promise<FinancePaymentDto[]>;
  updatePaymentStatus(id: string, status: PaymentStatus, capturedAt?: Date, failureReason?: string | null): Promise<void>;
}

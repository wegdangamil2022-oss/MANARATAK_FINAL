import { describe, expect, it, vi } from 'vitest';
import { FinancePlatformUseCases } from '../../src/finance-platform/use-cases/FinancePlatformUseCases';

const usd = (amountMinorUnits: string) => ({ amountMinorUnits, currencyCode: 'USD', scale: 2 });
const identity = { actorId: 'finance-admin', correlationId: 'corr-1', idempotencyKey: 'idem-1' };

describe('FinancePlatformUseCases', () => {
  it('creates a server-calculated DRAFT invoice and never auto-issues', async () => {
    const repository = {
      createDraftInvoice: vi.fn(async (data) => ({ id: 'inv-1', status: 'DRAFT', ...data })),
    } as any;
    const result = await new FinancePlatformUseCases(repository).createDraftInvoice(
      {
        originDomain: 'LEARNING',
        originReferenceId: 'course-1',
        lineItems: [{ description: 'Course', quantity: 3, unitPrice: usd('1250') }],
      },
      identity,
    );
    expect(result.status).toBe('DRAFT');
    expect(result.totalAmount.amountMinorUnits).toBe('3750');
  });

  it('blocks edits after issuance and raw card numbers', async () => {
    const repository = {
      findInvoiceById: vi
        .fn()
        .mockResolvedValue({ id: 'inv-1', status: 'ISSUED', amountDue: usd('1000') }),
    } as any;
    const useCases = new FinancePlatformUseCases(repository);
    await expect(
      useCases.updateDraftInvoice(
        'inv-1',
        [{ description: 'X', quantity: 1, unitPrice: usd('1') }],
        identity,
      ),
    ).rejects.toThrow('DRAFT');
    await expect(
      useCases.capturePayment(
        { invoiceId: 'inv-1', amount: usd('100'), paymentMethodToken: '4242 4242 4242 4242' },
        identity,
      ),
    ).rejects.toThrow('Raw card PAN');
  });

  it('rejects overpayment before persistence', async () => {
    const repository = {
      findInvoiceById: vi
        .fn()
        .mockResolvedValue({ id: 'inv-1', status: 'ISSUED', amountDue: usd('1000') }),
    } as any;
    await expect(
      new FinancePlatformUseCases(repository).capturePayment(
        { invoiceId: 'inv-1', amount: usd('1001'), paymentMethodToken: 'tok_safe' },
        identity,
      ),
    ).rejects.toThrow('cannot exceed');
  });

  it('fails currency conversion closed without an approved historical rate', async () => {
    const repository = { findEffectiveExchangeRate: vi.fn().mockResolvedValue(null) } as any;
    await expect(
      new FinancePlatformUseCases(repository).convert({
        amount: usd('100'),
        targetCurrencyCode: 'SAR',
        targetScale: 2,
      }),
    ).rejects.toThrow('failed closed');
  });

  it('prevents maker self approval', async () => {
    const repository = {
      listApprovals: vi
        .fn()
        .mockResolvedValue([{ id: 'approval-1', makerId: 'finance-admin', decisions: [] }]),
    } as any;
    await expect(
      new FinancePlatformUseCases(repository).decideApproval(
        'approval-1',
        'APPROVE',
        'finance-admin',
        undefined,
        identity,
      ),
    ).rejects.toThrow('Maker');
  });
});

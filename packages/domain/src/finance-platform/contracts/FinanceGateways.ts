import { MoneyAmount } from '../value-objects';

export interface PaymentGatewayRequest {
  paymentReference: string;
  amount: MoneyAmount;
  paymentMethodToken: string;
  idempotencyKey: string;
}
export interface PaymentGatewayResult {
  status: 'AUTHORIZED' | 'CAPTURED' | 'FAILED';
  gatewayReference: string;
  safeMaskedMetadata?: Record<string, string>;
  failureCode?: string;
}
export interface IPaymentGateway {
  readonly providerKey: string;
  isConfigured(): boolean;
  authorize(request: PaymentGatewayRequest): Promise<PaymentGatewayResult>;
  capture(
    gatewayReference: string,
    amount: MoneyAmount,
    idempotencyKey: string,
  ): Promise<PaymentGatewayResult>;
  refund(
    gatewayReference: string,
    amount: MoneyAmount,
    idempotencyKey: string,
  ): Promise<PaymentGatewayResult>;
}
export interface IFxRateProvider {
  readonly providerKey: string;
  isConfigured(): boolean;
  fetchRate(
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<{
    numerator: string;
    denominator: string;
    providerReference: string;
    effectiveAt: Date;
  }>;
}
export interface IBankTransferGateway {
  readonly providerKey: string;
  isConfigured(): boolean;
  submit(
    transferReference: string,
    idempotencyKey: string,
  ): Promise<{ providerReference: string; status: 'PROCESSING' }>;
}

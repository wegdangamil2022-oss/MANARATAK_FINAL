import {
  IBankTransferGateway,
  IFxRateProvider,
  IPaymentGateway,
  MoneyAmount,
  PaymentGatewayRequest,
} from '@manaratak/domain';

export class EnvironmentPaymentGatewayAdapter implements IPaymentGateway {
  readonly providerKey: string;
  constructor(
    providerKey: string,
    private readonly secretEnvironmentVariable: string,
  ) {
    this.providerKey = providerKey;
  }
  isConfigured() {
    return Boolean(process.env[this.secretEnvironmentVariable]);
  }
  async authorize(_request: PaymentGatewayRequest): Promise<never> {
    throw this.unavailable();
  }
  async capture(
    _gatewayReference: string,
    _amount: MoneyAmount,
    _idempotencyKey: string,
  ): Promise<never> {
    throw this.unavailable();
  }
  async refund(
    _gatewayReference: string,
    _amount: MoneyAmount,
    _idempotencyKey: string,
  ): Promise<never> {
    throw this.unavailable();
  }
  private unavailable() {
    return new Error(
      this.isConfigured()
        ? `Payment provider ${this.providerKey} runtime transport is pending`
        : `PAYMENT_PROVIDER_NOT_CONFIGURED:${this.providerKey}`,
    );
  }
}

export class EnvironmentFxRateProviderAdapter implements IFxRateProvider {
  readonly providerKey: string;
  constructor(
    providerKey: string,
    private readonly secretEnvironmentVariable: string,
  ) {
    this.providerKey = providerKey;
  }
  isConfigured() {
    return Boolean(process.env[this.secretEnvironmentVariable]);
  }
  async fetchRate(_sourceCurrency: string, _targetCurrency: string): Promise<never> {
    throw new Error(
      this.isConfigured()
        ? `FX provider ${this.providerKey} runtime transport is pending`
        : `FX_PROVIDER_NOT_CONFIGURED:${this.providerKey}`,
    );
  }
}

export class EnvironmentBankTransferGatewayAdapter implements IBankTransferGateway {
  readonly providerKey: string;
  constructor(
    providerKey: string,
    private readonly secretEnvironmentVariable: string,
  ) {
    this.providerKey = providerKey;
  }
  isConfigured() {
    return Boolean(process.env[this.secretEnvironmentVariable]);
  }
  async submit(_transferReference: string, _idempotencyKey: string): Promise<never> {
    throw new Error(
      this.isConfigured()
        ? `Bank provider ${this.providerKey} runtime transport is pending`
        : `BANK_PROVIDER_NOT_CONFIGURED:${this.providerKey}`,
    );
  }
}

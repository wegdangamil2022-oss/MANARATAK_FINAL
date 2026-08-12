export interface MoneyAmount {
  amountMinorUnits: string;
  currencyCode: string;
  scale: number;
}

export function assertValidMoneyAmount(amount: MoneyAmount): void {
  if (!/^-?\d+$/.test(amount.amountMinorUnits)) {
    throw new Error('MoneyAmount.amountMinorUnits must be an integer string');
  }
  if (!/^[A-Z]{3}$/.test(amount.currencyCode)) {
    throw new Error('MoneyAmount.currencyCode must be an ISO 4217 uppercase code');
  }
  if (!Number.isInteger(amount.scale) || amount.scale < 0 || amount.scale > 6) {
    throw new Error('MoneyAmount.scale must be an integer between 0 and 6');
  }
}

export function assertSameCurrency(left: MoneyAmount, right: MoneyAmount): void {
  if (left.currencyCode !== right.currencyCode || left.scale !== right.scale) {
    throw new Error('Money amounts must share currencyCode and scale');
  }
}

export function addMoneyAmounts(amounts: readonly MoneyAmount[]): MoneyAmount {
  if (amounts.length === 0) {
    throw new Error('Cannot add an empty money amount collection');
  }

  const [first, ...rest] = amounts;
  assertValidMoneyAmount(first);

  const total = rest.reduce((sum, amount) => {
    assertValidMoneyAmount(amount);
    assertSameCurrency(first, amount);
    return sum + BigInt(amount.amountMinorUnits);
  }, BigInt(first.amountMinorUnits));

  return {
    amountMinorUnits: total.toString(),
    currencyCode: first.currencyCode,
    scale: first.scale
  };
}

export function multiplyMoneyAmount(amount: MoneyAmount, quantity: number): MoneyAmount {
  assertValidMoneyAmount(amount);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }

  return {
    amountMinorUnits: (BigInt(amount.amountMinorUnits) * BigInt(quantity)).toString(),
    currencyCode: amount.currencyCode,
    scale: amount.scale
  };
}

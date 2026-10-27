// Server-side price table (constitution C1): the client never sets amount or currency.
// The Arabic-track USDT amount converts SAR 50 at the fixed SAR/USD peg of 3.75, rounded up.
export const PRICE_TABLE = {
  individual: {
    ar: { amount: '50.00', currency: 'SAR', usdt: '13.34' },
    en: { amount: '15.00', currency: 'USD', usdt: '15.00' },
  },
};

export function priceFor(plan, track) {
  return PRICE_TABLE[plan]?.[track] ?? null;
}

/** Adds a random 0.0001–0.0999 suffix so each pending order has a unique on-chain amount. */
export function uniqueUsdtAmount(base, random) {
  const [whole, fraction = ''] = base.split('.');
  const units =
    BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0').slice(0, 4));
  return formatUnits(units + BigInt(random));
}

export function formatUnits(units) {
  const whole = units / 10000n;
  const fraction = (units % 10000n).toString().padStart(4, '0');
  return `${whole}.${fraction}`;
}

/** Converts a 4-decimal USDT string to BEP20 USDT base units (18 decimals). */
export function usdtToWei(amount) {
  const [whole, fraction = ''] = String(amount).split('.');
  const units =
    BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0').slice(0, 4));
  return units * 10n ** 14n;
}

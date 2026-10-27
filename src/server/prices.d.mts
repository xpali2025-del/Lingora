type Price = { amount: string; currency: string; usdt: string };

export const PRICE_TABLE: {
  individual: { ar: Price; en: Price };
};
export function priceFor(plan: string, track: string): Price | null;
export function uniqueUsdtAmount(base: string, random: number): string;
export function formatUnits(units: bigint): string;
export function usdtToWei(amount: string): bigint;

const ADDRESS = /^0x[0-9a-fA-F]{40}$/u;

/** Reads runtime settings; secrets live only in the hosting environment, never in the repository. */
export function readConfig(env = process.env) {
  const address = env.LINGORA_BEP20_ADDRESS?.trim() ?? '';
  const confirmations = Number(env.BSC_MIN_CONFIRMATIONS ?? 15);
  return {
    databaseUrl: env.DATABASE_URL?.trim() ?? '',
    adminToken: env.LINGORA_ADMIN_TOKEN?.trim() ?? '',
    codesKey: env.LINGORA_CODES_KEY?.trim() ?? '',
    // An incomplete or malformed address keeps crypto checkout disabled (OD-11).
    bep20Address: ADDRESS.test(address) ? address.toLowerCase() : null,
    bscRpcUrl: env.BSC_RPC_URL?.trim() || 'https://bsc-dataseed.bnbchain.org',
    minConfirmations:
      Number.isInteger(confirmations) && confirmations > 0 ? confirmations : 15,
  };
}

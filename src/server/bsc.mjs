// Verifies a USDT transfer on BNB Smart Chain (BEP20) directly from chain data; no API key is needed.
export const USDT_BSC = '0x55d398326f99059ff775485246999027b3197955';
const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const CLOCK_SKEW_SECONDS = 300;

export const TX_HASH = /^0x[0-9a-fA-F]{64}$/u;

async function rpc(rpcUrl, fetchImpl, method, params) {
  const response = await fetchImpl(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!response.ok)
    throw new Error(`BSC RPC ${method} failed: ${response.status}`);
  const body = await response.json();
  if (body.error)
    throw new Error(`BSC RPC ${method} error: ${body.error.message}`);
  return body.result;
}

/**
 * @returns {Promise<{ ok: true, blockNumber: number } | { ok: false, reason: string, confirmations?: number }>}
 */
export async function verifyUsdtTransfer({
  rpcUrl,
  txHash,
  toAddress,
  amountWei,
  notBefore,
  minConfirmations,
  fetchImpl = fetch,
}) {
  const receipt = await rpc(rpcUrl, fetchImpl, 'eth_getTransactionReceipt', [
    txHash,
  ]);
  if (!receipt) return { ok: false, reason: 'not_found' };
  if (receipt.status !== '0x1') return { ok: false, reason: 'failed' };
  const recipientTopic = `0x${toAddress.slice(2).toLowerCase().padStart(64, '0')}`;
  const matched = (receipt.logs ?? []).some(
    (log) =>
      log.address?.toLowerCase() === USDT_BSC &&
      log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC &&
      log.topics?.[2]?.toLowerCase() === recipientTopic &&
      BigInt(log.data) === amountWei,
  );
  if (!matched) return { ok: false, reason: 'no_match' };

  const blockNumber = Number(BigInt(receipt.blockNumber));
  const [latest, block] = await Promise.all([
    rpc(rpcUrl, fetchImpl, 'eth_blockNumber', []),
    rpc(rpcUrl, fetchImpl, 'eth_getBlockByNumber', [
      receipt.blockNumber,
      false,
    ]),
  ]);
  const timestamp = Number(BigInt(block.timestamp));
  if (timestamp + CLOCK_SKEW_SECONDS < Math.floor(notBefore.getTime() / 1000))
    return { ok: false, reason: 'before_order' };
  const confirmations = Number(BigInt(latest)) - blockNumber + 1;
  if (confirmations < minConfirmations)
    return { ok: false, reason: 'confirmations', confirmations };
  return { ok: true, blockNumber };
}

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'node:crypto';

function keyFrom(base64Key) {
  const key = Buffer.from(base64Key ?? '', 'base64');
  if (key.length !== 32)
    throw new Error('LINGORA_CODES_KEY must be 32 bytes encoded as base64.');
  return key;
}

/** Encrypts a redeem code or link at rest (constitution C4) with AES-256-GCM. */
export function encryptCode(code, base64Key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(base64Key), iv);
  const data = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
  return [
    'v1',
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    data.toString('base64'),
  ].join(':');
}

export function decryptCode(payload, base64Key) {
  const [version, iv, tag, data] = payload.split(':');
  if (version !== 'v1') throw new Error('Unknown code ciphertext version.');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    keyFrom(base64Key),
    Buffer.from(iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/** Keyed fingerprint that detects duplicate imports without storing plaintext. */
export function codeFingerprint(code, base64Key) {
  return createHmac('sha256', keyFrom(base64Key)).update(code).digest('hex');
}

import crypto from 'crypto';
import keys from '../../config/keys';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const DEFAULT_STEP_SECONDS = 30;
const DEFAULT_DIGITS = 6;

const normalizeCode = (code: string): string => code.replace(/\s+/g, '').trim();

const encodeBase32 = (buffer: Buffer): string => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

const decodeBase32 = (value: string): Buffer => {
  const cleaned = value.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let current = 0;
  const bytes: number[] = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) {
      continue;
    }

    current = (current << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((current >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

const getCounterBytes = (counter: number): Buffer => {
  const buffer = Buffer.alloc(8);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;
  buffer.writeUInt32BE(high, 0);
  buffer.writeUInt32BE(low, 4);
  return buffer;
};

const generateHotp = (secret: string, counter: number, digits = DEFAULT_DIGITS): string => {
  const secretBuffer = decodeBase32(secret);
  const counterBytes = getCounterBytes(counter);
  const hmac = crypto.createHmac('sha1', secretBuffer).update(counterBytes).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (code % 10 ** digits).toString();
  return otp.padStart(digits, '0');
};

const getTotpCounter = (timeMs: number, stepSeconds = DEFAULT_STEP_SECONDS): number => {
  return Math.floor(timeMs / 1000 / stepSeconds);
};

const getEncryptionKey = (): Buffer => {
  return crypto.createHash('sha256').update(keys.secretOrKey).digest();
};

export const generateTotpSecret = (): string => {
  return encodeBase32(crypto.randomBytes(20));
};

export const createTotpUri = (secret: string, email: string, issuer = 'Save A Stray'): string => {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${DEFAULT_DIGITS}&period=${DEFAULT_STEP_SECONDS}`;
};

export const generateTotpCode = (secret: string, timeMs = Date.now()): string => {
  return generateHotp(secret, getTotpCounter(timeMs));
};

export const verifyTotpCode = (secret: string, code: string, window = 1): boolean => {
  const normalizedCode = normalizeCode(code);
  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const now = Date.now();
  const baseCounter = getTotpCounter(now);

  for (let offset = -window; offset <= window; offset += 1) {
    const expected = generateHotp(secret, baseCounter + offset);
    if (expected === normalizedCode) {
      return true;
    }
  }

  return false;
};

export const encryptSecret = (secret: string): string => {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join('.');
};

export const decryptSecret = (encryptedSecret: string): string => {
  const [ivHex, tagHex, payloadHex] = encryptedSecret.split('.');
  if (!ivHex || !tagHex || !payloadHex) {
    throw new Error('Invalid encrypted secret format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const payload = Buffer.from(payloadHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return decrypted.toString('utf8');
};

export const generateBackupCodes = (count = 8): string[] => {
  const codes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
};

export const hashBackupCode = (code: string): string => {
  const normalized = normalizeCode(code).toUpperCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

export const verifyBackupCode = (providedCode: string, storedHashes: string[]): {
  isValid: boolean;
  remainingHashes: string[];
} => {
  const hash = hashBackupCode(providedCode);
  const index = storedHashes.indexOf(hash);
  if (index < 0) {
    return { isValid: false, remainingHashes: storedHashes };
  }

  const remainingHashes = storedHashes.filter((_, currentIndex) => currentIndex !== index);
  return {
    isValid: true,
    remainingHashes,
  };
};

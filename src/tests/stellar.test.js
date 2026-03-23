import { describe, it, expect } from 'vitest';
import {
  generateKeypair, keypairFromSecret,
  isValidPublicKey, isValidSecretKey,
  formatAddress, formatXLM,
} from '../utils/stellar.js';

describe('generateKeypair', () => {
  it('generates a public key starting with G', () => {
    const { publicKey } = generateKeypair();
    expect(publicKey.startsWith('G')).toBe(true);
  });
  it('generates a secret key starting with S', () => {
    const { secretKey } = generateKeypair();
    expect(secretKey.startsWith('S')).toBe(true);
  });
  it('generates unique keypairs each time', () => {
    const kp1 = generateKeypair();
    const kp2 = generateKeypair();
    expect(kp1.publicKey).not.toBe(kp2.publicKey);
  });
  it('secret key can reconstruct the public key', () => {
    const { publicKey, secretKey } = generateKeypair();
    expect(keypairFromSecret(secretKey).publicKey).toBe(publicKey);
  });
});

describe('keypairFromSecret', () => {
  it('restores a keypair from secret', () => {
    const { publicKey, secretKey } = generateKeypair();
    expect(keypairFromSecret(secretKey).publicKey).toBe(publicKey);
  });
  it('throws for invalid secret', () => {
    expect(() => keypairFromSecret('INVALID')).toThrow();
  });
  it('throws for empty string', () => {
    expect(() => keypairFromSecret('')).toThrow();
  });
});

describe('isValidPublicKey', () => {
  it('returns true for valid public key', () => {
    const { publicKey } = generateKeypair();
    expect(isValidPublicKey(publicKey)).toBe(true);
  });
  it('returns false for invalid string', () => {
    expect(isValidPublicKey('INVALID')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isValidPublicKey('')).toBe(false);
  });
  it('returns false for a secret key', () => {
    const { secretKey } = generateKeypair();
    expect(isValidPublicKey(secretKey)).toBe(false);
  });
  it('returns false for null', () => {
    expect(isValidPublicKey(null)).toBe(false);
  });
});

describe('isValidSecretKey', () => {
  it('returns true for valid secret key', () => {
    const { secretKey } = generateKeypair();
    expect(isValidSecretKey(secretKey)).toBe(true);
  });
  it('returns false for invalid string', () => {
    expect(isValidSecretKey('SINVALID')).toBe(false);
  });
  it('returns false for a public key', () => {
    const { publicKey } = generateKeypair();
    expect(isValidSecretKey(publicKey)).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isValidSecretKey('')).toBe(false);
  });
});

describe('formatAddress', () => {
  it('truncates a long address', () => {
    const { publicKey } = generateKeypair();
    expect(formatAddress(publicKey, 6)).toContain('...');
  });
  it('shows first and last N chars', () => {
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890ABCDEFGH';
    const f = formatAddress(addr, 4);
    expect(f.startsWith('GABC')).toBe(true);
    expect(f.endsWith('EFGH')).toBe(true);
  });
  it('returns full address if shorter than 2*chars', () => {
    expect(formatAddress('GABCDEF', 6)).toBe('GABCDEF');
  });
  it('handles null gracefully', () => {
    expect(formatAddress(null)).toBe(null);
  });
});

describe('formatXLM', () => {
  it('formats a number string', () => {
    expect(formatXLM('100')).toBe('100.00');
  });
  it('handles zero', () => {
    expect(formatXLM('0')).toBe('0.00');
  });
  it('returns default for NaN', () => {
    expect(formatXLM('abc')).toBe('0.0000000');
  });
  it('handles numeric input', () => {
    expect(formatXLM(50)).toBe('50.00');
  });
});

describe('Integration', () => {
  it('full keypair workflow', () => {
    const { publicKey, secretKey } = generateKeypair();
    expect(isValidPublicKey(publicKey)).toBe(true);
    expect(isValidSecretKey(secretKey)).toBe(true);
    expect(keypairFromSecret(secretKey).publicKey).toBe(publicKey);
    expect(formatAddress(publicKey)).toContain('...');
  });
  it('rejects cross-use of keys', () => {
    const { publicKey, secretKey } = generateKeypair();
    expect(isValidPublicKey(secretKey)).toBe(false);
    expect(isValidSecretKey(publicKey)).toBe(false);
  });
});

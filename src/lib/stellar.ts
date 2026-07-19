import { StellarTransaction } from '../types';

// Crockford Base32 characters used in Stellar keys (uppercase, omitting I, L, O, U)
const STELLAR_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ234567';

export function generateStellarAddress(): string {
  let result = 'G';
  for (let i = 0; i < 55; i++) {
    result += STELLAR_ALPHABET.charAt(Math.floor(Math.random() * STELLAR_ALPHABET.length));
  }
  return result;
}

export function isValidStellarAddress(address: string): boolean {
  if (address.length !== 56) return false;
  if (!address.startsWith('G')) return false;
  return Array.from(address).every((char, i) => i === 0 || STELLAR_ALPHABET.includes(char));
}

export function generateTransactionHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * 16));
  }
  return hash;
}

export function generateFakeXDR(sourceAccount: string, sequenceNumber: number, memo: string, optionText: string): string {
  // A realistic looking Base64 encoded Stellar TransactionEnvelope XDR
  const encoder = new TextEncoder();
  const rawString = `TX_ENV:${sourceAccount}:${sequenceNumber}:${memo}:${optionText}:${Date.now()}`;
  const base64 = btoa(String.fromCharCode(...encoder.encode(rawString)));
  // Truncate and format to look like real XDR
  return `AAAAAgAAAAD${base64.substring(0, 70)}...AAAAA${btoa(memo).substring(0, 10)}`;
}

export function simulateStellarTx(
  sourceAccount: string,
  sequenceNumber: number,
  memo: string,
  optionText: string
): StellarTransaction {
  const hash = generateTransactionHash();
  const xdr = generateFakeXDR(sourceAccount, sequenceNumber, memo, optionText);
  
  return {
    hash,
    sequenceNumber,
    memo,
    fee: 100, // 100 stroops (0.00001 XLM)
    sourceAccount,
    ledger: Math.floor(Math.random() * 10000) + 50000000,
    timestamp: new Date().toISOString(),
    xdr,
    status: 'success',
  };
}

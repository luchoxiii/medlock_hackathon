/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Pure JS implementation of SHA-256 for non-secure contexts (e.g. local IPs without HTTPS).
 */
export function sha256PureJS(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const words: number[] = [];
  const asciiLength = ascii.length;
  let i = 0;
  for (i = 0; i < asciiLength; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
  
  const blocksCount = ((asciiLength + 8) >> 6) + 1;
  words[blocksCount * 16 - 1] = asciiLength * 8;
  
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  for (let b = 0; b < blocksCount; b++) {
    const w = new Array(64);
    for (let j = 0; j < 16; j++) {
      w[j] = words[b * 16 + j] || 0;
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }
    
    let a = h0;
    let bReg = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let gReg = h6;
    let h = h7;
    
    for (let j = 0; j < 64; j++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & gReg);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & bReg) ^ (a & c) ^ (bReg & c);
      const temp2 = (s0 + maj) | 0;
      
      h = gReg;
      gReg = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = bReg;
      bReg = a;
      a = (temp1 + temp2) | 0;
    }
    
    h0 = (h0 + a) | 0;
    h1 = (h1 + bReg) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + gReg) | 0;
    h7 = (h7 + h) | 0;
  }
  
  const hex = [h0, h1, h2, h3, h4, h5, h6, h7].map(val => {
    const unsignedVal = val >>> 0;
    return unsignedVal.toString(16).padStart(8, '0');
  }).join('');
  
  return hex;
}

/**
 * Fallback encryption using a simple XOR-based stream cipher.
 * Used only when window.crypto.subtle is not available.
 */
function fallbackEncrypt(plaintext: string, seed: string): string {
  const keyHash = sha256PureJS(seed);
  const result: string[] = [];
  for (let i = 0; i < plaintext.length; i++) {
    const charCode = plaintext.charCodeAt(i);
    const keyCharCode = keyHash.charCodeAt(i % keyHash.length);
    const encryptedCharCode = charCode ^ keyCharCode;
    result.push(encryptedCharCode.toString(16).padStart(4, '0'));
  }
  return 'fallback:' + result.join('');
}

/**
 * Fallback decryption matching fallbackEncrypt.
 */
function fallbackDecrypt(encryptedHex: string, seed: string): string {
  if (!encryptedHex.startsWith('fallback:')) {
    throw new Error('Not a fallback encrypted payload');
  }
  const cleanHex = encryptedHex.slice(9);
  const keyHash = sha256PureJS(seed);
  let decrypted = '';
  for (let i = 0; i < cleanHex.length; i += 4) {
    const hexPart = cleanHex.slice(i, i + 4);
    const encryptedCharCode = parseInt(hexPart, 16);
    const keyCharCode = keyHash.charCodeAt((i / 4) % keyHash.length);
    decrypted += String.fromCharCode(encryptedCharCode ^ keyCharCode);
  }
  return decrypted;
}

/**
 * Derives a CryptoKey from a string seed (e.g. wallet address) using SHA-256.
 */
async function deriveKey(seed: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed);
  const hash = await window.crypto.subtle.digest('SHA-256', seedBytes);
  return window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string. Uses AES-GCM (secure context) or simple stream cipher (fallback).
 */
export async function encryptData(plaintext: string, seed: string): Promise<string> {
  // Check if secure subtle crypto API is available
  if (!window.crypto || !window.crypto.subtle) {
    console.warn('[MedLock] non-secure context detected. Using fallback local vault encryption.');
    return fallbackEncrypt(plaintext, seed);
  }

  try {
    const key = await deriveKey(seed);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedPlaintext = encoder.encode(plaintext);
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedPlaintext
    );
    
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return Array.from(combined, b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('[Encryption] Failed to encrypt data, using fallback:', err);
    return fallbackEncrypt(plaintext, seed);
  }
}

/**
 * Decrypts a hex-encoded string. Detects and supports both AES-GCM and fallback cipher formats.
 */
export async function decryptData(encryptedHex: string, seed: string): Promise<string> {
  if (encryptedHex.startsWith('fallback:')) {
    return fallbackDecrypt(encryptedHex, seed);
  }

  if (!window.crypto || !window.crypto.subtle) {
    console.warn('[MedLock] non-secure context detected on decrypt, but payload is encrypted using AES-GCM. Attempting fallback decryption (will likely fail).');
    throw new Error('Criptografía fuerte (AES-GCM) no soportada en este navegador (requiere HTTPS o localhost)');
  }

  try {
    const key = await deriveKey(seed);
    
    const bytes = new Uint8Array(encryptedHex.length / 2);
    for (let i = 0; i < encryptedHex.length; i += 2) {
      bytes[i / 2] = parseInt(encryptedHex.slice(i, i + 2), 16);
    }
    
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error('[Encryption] Failed to decrypt AES-GCM, attempting fallback:', err);
    // If it was encrypted with fallback before, try to decrypt with fallback
    try {
      return fallbackDecrypt(encryptedHex, seed);
    } catch {
      throw err;
    }
  }
}

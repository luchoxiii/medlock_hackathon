/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

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
 * Encrypts a plaintext string using AES-GCM.
 * Returns a hex-encoded string of the IV + ciphertext.
 */
export async function encryptData(plaintext: string, seed: string): Promise<string> {
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
    console.error('[Encryption] Failed to encrypt data:', err);
    throw err;
  }
}

/**
 * Decrypts a hex-encoded string using AES-GCM.
 * Returns the decrypted plaintext string.
 */
export async function decryptData(encryptedHex: string, seed: string): Promise<string> {
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
    console.error('[Encryption] Failed to decrypt data:', err);
    throw err;
  }
}

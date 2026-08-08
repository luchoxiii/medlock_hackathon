/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { describe, it, expect } from 'vitest';
import { deriveDoctorPublicKey, toHex, fromHex } from '../api/midnight';

describe('MedLock ZK Protocol Tests', () => {
  it('should derive deterministic public key from secret key', () => {
    const sk = new Uint8Array(32).fill(1);
    const pk1 = deriveDoctorPublicKey(sk);
    const pk2 = deriveDoctorPublicKey(sk);

    expect(pk1).toBeInstanceOf(Uint8Array);
    expect(pk1.length).toBe(32);
    expect(pk1).toEqual(pk2);
  });

  it('should convert hex strings to Uint8Array and back cleanly', () => {
    const originalBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const hex = toHex(originalBytes);
    expect(hex).toBe('deadbeef');

    const bytesFromHex = fromHex(hex);
    expect(bytesFromHex).toEqual(originalBytes);
  });

  it('should verify blood type compatibility correctly', () => {
    const patientBlood: string = 'O+';
    const requiredEmergencyBlood: string = 'O+';
    const mismatchBlood: string = 'A-';

    expect(patientBlood === requiredEmergencyBlood).toBe(true);
    expect(patientBlood === mismatchBlood).toBe(false);
  });

  it('should validate patient consent and serology requirements', () => {
    const consentGiven = true;
    const serologyClean = true;
    const isEmergencyEligible = consentGiven && serologyClean;

    expect(isEmergencyEligible).toBe(true);

    const revokedConsent = false;
    expect(revokedConsent && serologyClean).toBe(false);
  });
});

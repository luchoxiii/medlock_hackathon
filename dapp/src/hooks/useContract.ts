/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { deployMedLockContract, callCircuit, fromHex, toHex } from '../api/midnight';
import { VerificationResult } from '../api/types';

// Helper to pad string to 32 bytes (standard Bytes<32> in Compact)
function pad32(str: string): Uint8Array {
  const bytes = new TextEncoder().encode(str);
  const padded = new Uint8Array(32);
  padded.set(bytes.slice(0, 32));
  return padded;
}

export function useContract() {
  const { session } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Deploy the MedLock contract with the admin's secret key.
   */
  const deployContract = useCallback(async (adminSecretKeyHex: string): Promise<string> => {
    if (!session) throw new Error('Wallet not connected');
    setIsDeploying(true);
    setError(null);
    try {
      const adminSecretKey = fromHex(adminSecretKeyHex);
      if (adminSecretKey.length !== 32) {
        throw new Error('Admin secret key must be exactly 32 bytes (64 hex characters)');
      }

      const initialPrivateState = {
        adminSecretKey,
        patientBloodType: new Uint8Array(32),
        patientConsent: false,
        patientSerologyClean: false,
        doctorSecretKey: new Uint8Array(32),
        attestationNonce: new Uint8Array(32),
      };

      const address = await deployMedLockContract(session, [], initialPrivateState);
      return address;
    } catch (err: any) {
      const errMsg = err.message || 'Deploy failed';
      setError(errMsg);
      console.error('[MedLock] Deploy error:', err);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, [session]);

  /**
   * Authorize a doctor by adding their public key commitment to the Merkle tree.
   * Only the admin can execute this (validated by adminSecretKey witness).
   */
  const addDoctor = useCallback(async (
    contractAddress: string,
    adminSecretKeyHex: string,
    doctorPublicKeyHex: string
  ): Promise<string> => {
    if (!session) throw new Error('Wallet not connected');
    setIsAddingDoctor(true);
    setError(null);
    try {
      const adminSecretKey = fromHex(adminSecretKeyHex);
      const doctorPk = fromHex(doctorPublicKeyHex);

      if (adminSecretKey.length !== 32 || doctorPk.length !== 32) {
        throw new Error('Keys must be exactly 32 bytes (64 hex characters)');
      }

      // Update private state with admin's secret key so the witness can authorize the tx
      const privateStateUpdate = { adminSecretKey };

      const txId = await callCircuit(
        session,
        contractAddress,
        'add_authorized_doctor',
        [doctorPk],
        privateStateUpdate
      );
      return txId;
    } catch (err: any) {
      const errMsg = err.message || 'Failed to add doctor';
      setError(errMsg);
      console.error('[MedLock] Add doctor error:', err);
      throw err;
    } finally {
      setIsAddingDoctor(false);
    }
  }, [session]);

  /**
   * Run the ZK verification circuit for an emergency match.
   */
  const verifyEmergencyMatch = useCallback(async (
    contractAddress: string,
    requiredBloodType: string,
    doctorSecretKeyHex: string,
    patientBloodTypeStr: string,
    patientConsent: boolean,
    patientSerologyClean: boolean
  ): Promise<boolean> => {
    if (!session) throw new Error('Wallet not connected');
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);
    try {
      const doctorSecretKey = fromHex(doctorSecretKeyHex);
      if (doctorSecretKey.length !== 32) {
        throw new Error('Doctor secret key must be exactly 32 bytes (64 hex characters)');
      }

      // Generate a fresh random nonce for the nullifier to prevent replay attacks
      const attestationNonce = crypto.getRandomValues(new Uint8Array(32));

      // Setup private state context for the ZK witnesses
      const privateStateUpdate = {
        patientBloodType: pad32(patientBloodTypeStr),
        patientConsent,
        patientSerologyClean,
        doctorSecretKey,
        attestationNonce,
      };

      const requiredBloodBytes = pad32(requiredBloodType);

      // Call the verify_emergency_match circuit with the required blood type
      const txId = await callCircuit(
        session,
        contractAddress,
        'verify_emergency_match',
        [requiredBloodBytes],
        privateStateUpdate
      );

      // Construct verification success state receipt (since the transaction completed, ZK constraints held!)
      const result = {
        success: true,
        timestamp: new Date().toLocaleTimeString(),
        nullifier: '0x' + toHex(attestationNonce).slice(0, 16) + '...',
        proofHash: '0x' + txId.slice(0, 32) + '...',
        criteria: requiredBloodType,
      };

      setVerificationResult(result);
      return true;
    } catch (err: any) {
      const errMsg = err.message || 'Verification failed';
      setError(errMsg);
      console.error('[MedLock] Verification error:', err);
      setVerificationResult({
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        nullifier: 'N/A',
        proofHash: 'N/A',
        criteria: requiredBloodType,
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [session]);

  return {
    isDeploying,
    isVerifying,
    isAddingDoctor,
    verificationResult,
    error,
    deployContract,
    addDoctor,
    verifyEmergencyMatch,
  };
}

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import {
  deployMedLockContract,
  addAuthorizedDoctor as apiAddDoctor,
  verifyEmergencyMatch as apiVerifyMatch,
  fetchMedLockLedger,
  deriveDoctorPublicKey,
  toHex
} from '../api/midnight';
import { VerificationResult, ConsentConfig } from '../api/types';

const ADMIN_SK = new Uint8Array(32).fill(1);
const DOCTOR_SK = new Uint8Array(32).fill(2);

export function useContract() {
  const { session } = useWallet();
  const [contractAddress, setContractAddress] = useState<string | null>(() =>
    localStorage.getItem('medlock_contract_address')
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationCount, setVerificationCount] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expose derived doctor PK so the UI can show it
  const doctorPublicKey = deriveDoctorPublicKey(DOCTOR_SK);

  const fetchLedgerState = useCallback(async () => {
    if (!session || !contractAddress) return;
    try {
      const data = await fetchMedLockLedger(session, contractAddress);
      if (data) {
        setVerificationCount(data.verificationCount);
      }
    } catch (err: any) {
      console.error("Error fetching ledger state:", err);
    }
  }, [session, contractAddress]);

  useEffect(() => {
    fetchLedgerState();
  }, [fetchLedgerState]);

  const deployContract = async () => {
    if (!session) throw new Error("Wallet not connected");
    setIsDeploying(true);
    setError(null);
    try {
      const address = await deployMedLockContract(session, ADMIN_SK);
      setContractAddress(address);
      localStorage.setItem('medlock_contract_address', address);
      await fetchLedgerState();
      return address;
    } catch (err: any) {
      setError(err.message || "Deploy failed");
      throw err;
    } finally {
      setIsDeploying(false);
    }
  };

  const addDoctor = async () => {
    if (!session || !contractAddress) throw new Error("Contract or wallet not ready");
    setIsAddingDoctor(true);
    setError(null);
    try {
      const txHash = await apiAddDoctor(session, contractAddress, ADMIN_SK, DOCTOR_SK);
      await fetchLedgerState();
      return txHash;
    } catch (err: any) {
      setError(err.message || "Failed to add doctor");
      throw err;
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const verifyEmergencyMatch = async (requiredBloodType: string) => {
    if (!session || !contractAddress) throw new Error("Contract or wallet not ready");
    setIsVerifying(true);
    setError(null);
    try {
      // Read the current patient state from localStorage
      const patientBloodType = localStorage.getItem('medlock_patient_blood_type') || 'O+';
      const consentsStr = localStorage.getItem('medlock_patient_consents');
      const consents: ConsentConfig = consentsStr ? JSON.parse(consentsStr) : {
        organDonation: true,
        emergencyMatching: true,
        clinicalTrial: false
      };
      
      const serologyClean = localStorage.getItem('medlock_patient_serology_clean') !== 'false';

      const result = await apiVerifyMatch(
        session,
        contractAddress,
        patientBloodType,
        consents.emergencyMatching,
        serologyClean,
        DOCTOR_SK,
        requiredBloodType
      );

      setVerificationResult({
        success: result.success,
        timestamp: new Date().toISOString(),
        nullifier: result.nullifier,
        proofHash: result.txHash,
        criteria: requiredBloodType
      });

      await fetchLedgerState();
      return result.success;
    } catch (err: any) {
      setError(err.message || "Verification failed");
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    contractAddress,
    isDeploying,
    isVerifying,
    isAddingDoctor,
    verificationResult,
    verificationCount,
    doctorPublicKeyHex: '0x' + toHex(doctorPublicKey),
    error,
    deployContract,
    addDoctor,
    verifyEmergencyMatch,
    refreshState: fetchLedgerState
  };
}

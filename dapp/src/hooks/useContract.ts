/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { useState } from 'react';
import { stubDeployContract, stubVerifyEmergencyMatch } from '../api/midnight';
import { VerificationResult } from '../api/types';

export function useContract() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deployContract = async () => {
    setIsDeploying(true);
    try {
      await stubDeployContract();
      return "0x1234567890abcdef"; // stub
    } catch (err) {
      setError("Deploy failed");
      throw err;
    } finally {
      setIsDeploying(false);
    }
  };

  const verifyEmergencyMatch = async (bloodType: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await stubVerifyEmergencyMatch();
      const success = bloodType === 'O+'; // Mock success for demo
      setVerificationResult({
        success,
        timestamp: new Date().toISOString(),
        nullifier: '0x' + Math.random().toString(16).slice(2, 10),
        proofHash: '0x' + Math.random().toString(16).slice(2, 64),
        criteria: bloodType
      });
      return success;
    } catch (err) {
      setError("Verification failed");
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return { isDeploying, isVerifying, verificationResult, error, deployContract, verifyEmergencyMatch };
}

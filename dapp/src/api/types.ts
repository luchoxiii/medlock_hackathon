/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

export interface PatientData {
  bloodType: string;
  hlaType: string;
  serologyClean: boolean;
  donationConsent: boolean;
  clinicalTrialConsent: boolean;
  emergencyMatchConsent: boolean;
}

export interface DoctorAttestation {
  doctorName: string;
  institution: string;
  attestationType: string;
  timestamp: string;
  signature: string;
  verified: boolean;
}

export interface VerificationResult {
  success: boolean;
  timestamp: string;
  nullifier: string;
  proofHash: string;
  criteria: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  walletType: string | null;
  network: string | null;
}

export interface ConsentConfig {
  organDonation: boolean;
  emergencyMatching: boolean;
  clinicalTrial: boolean;
}

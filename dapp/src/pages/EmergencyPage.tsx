/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { ZKResultMatch } from '../components/ZKResultMatch';
import { useWallet } from '../hooks/useWallet';

// 64-character hex keys (32 bytes) for demo/testing
const DEFAULT_DOCTOR_SK = '0000000000000000000000000000000000000000000000000000000000000001';
const DUMMY_CONTRACT_ADDR = '0000000000000000000000000000000000000000000000000000000000000000';

export const EmergencyPage: React.FC = () => {
  const { verifyEmergencyMatch, isVerifying, verificationResult, error } = useContract();
  const { isConnected } = useWallet();

  // Query / Matching criteria
  const [requiredBloodType, setRequiredBloodType] = useState('O+');
  const [contractAddress, setContractAddress] = useState(DUMMY_CONTRACT_ADDR);

  // Private inputs (simulated patient records inside wallet & doctor signature key)
  const [doctorSk, setDoctorSk] = useState(DEFAULT_DOCTOR_SK);
  const [patientBloodType, setPatientBloodType] = useState('O+');
  const [patientConsent, setPatientConsent] = useState(true);
  const [patientSerology, setPatientSerology] = useState(true);

  const handleVerify = async () => {
    await verifyEmergencyMatch(
      contractAddress,
      requiredBloodType,
      doctorSk,
      patientBloodType,
      patientConsent,
      patientSerology
    );
  };

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Emergency Verification Scanner</h1>
        <p>Run zero-knowledge validation queries for critical matching</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Verification Console */}
        <div className="card">
          <h3 className="card-title">Verification Console</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', backgroundColor: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong>ZK Privacy Guarantee:</strong> This verification is calculated on-device. Zero patient identity or medical data is revealed. Only a boolean match receipt is output.
          </p>

          <div className="input-group">
            <label className="input-label">Contract Address</label>
            <input 
              type="text" 
              className="input" 
              value={contractAddress} 
              onChange={e => setContractAddress(e.target.value)} 
              disabled={isVerifying}
              placeholder="Enter deployed MedLock contract address"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Required Blood Type for Match</label>
            <select 
              className="input" 
              value={requiredBloodType} 
              onChange={e => setRequiredBloodType(e.target.value)} 
              disabled={isVerifying}
            >
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>

          <button 
            className="btn btn-success" 
            style={{ width: '100%', padding: '16px', fontSize: '1.125rem', marginTop: '12px' }} 
            onClick={handleVerify}
            disabled={!isConnected || isVerifying}
          >
            {isVerifying ? 'Generating ZK Proof...' : 'Initiate ZK Verification'}
          </button>

          {!isConnected && (
            <p style={{ color: 'var(--accent-orange)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center' }}>
              Please connect your wallet to initiate verification.
            </p>
          )}

          {error && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center' }}>
              Error: {error}
            </p>
          )}

          <ZKResultMatch result={verificationResult} isVerifying={isVerifying} />
        </div>

        {/* Private Witness Configuration (Simulating private state values) */}
        <div className="card">
          <h3 className="card-title">Private Witness Inputs</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Simulate different private patient credentials and doctor attestations stored locally in the wallet to test how the ZK circuit reacts.
          </p>

          <div className="input-group">
            <label className="input-label">Doctor Secret Key (Hex)</label>
            <input 
              type="text" 
              className="input" 
              value={doctorSk} 
              onChange={e => setDoctorSk(e.target.value)} 
              disabled={isVerifying}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Patient Blood Type (Private)</label>
            <select 
              className="input" 
              value={patientBloodType} 
              onChange={e => setPatientBloodType(e.target.value)} 
              disabled={isVerifying}
            >
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>

          <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Organ Donation Consent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Must be active for emergency matching</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={patientConsent} 
                onChange={e => setPatientConsent(e.target.checked)}
                disabled={isVerifying}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Clean Serology Check</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asserts patient serology has no flags</div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={patientSerology} 
                onChange={e => setPatientSerology(e.target.checked)}
                disabled={isVerifying}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

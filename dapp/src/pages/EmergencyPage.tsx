/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { ZKResultMatch } from '../components/ZKResultMatch';
import { useWallet } from '../hooks/useWallet';

export const EmergencyPage: React.FC = () => {
  const [bloodType, setBloodType] = useState('O+');
  const { verifyEmergencyMatch, isVerifying, verificationResult } = useContract();
  const { isConnected } = useWallet();

  const handleVerify = async () => {
    await verifyEmergencyMatch(bloodType);
  };

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Emergency Verification Scanner</h1>
        <p>Zero-knowledge queries for critical matching</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', backgroundColor: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong>Privacy Disclaimer:</strong> This verification reveals ZERO patient data. Only a boolean match result is published on-chain.
        </p>

        <div className="input-group">
          <label className="input-label">Required Blood Type for Patient Match</label>
          <select className="input" value={bloodType} onChange={e => setBloodType(e.target.value)} disabled={isVerifying}>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
            <option>O+</option><option>O-</option>
          </select>
        </div>

        <button 
          className="btn btn-success" 
          style={{ width: '100%', padding: '16px', fontSize: '1.125rem' }} 
          onClick={handleVerify}
          disabled={!isConnected || isVerifying}
        >
          {isVerifying ? 'Generating ZK Proof...' : 'Initiate ZK Verification'}
        </button>

        {!isConnected && (
          <p style={{ color: 'var(--accent-orange)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center' }}>
            Please connect wallet to initiate verification.
          </p>
        )}

        <ZKResultMatch result={verificationResult} isVerifying={isVerifying} />
      </div>
    </div>
  );
};

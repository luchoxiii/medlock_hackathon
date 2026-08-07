/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { PatientVault } from '../components/PatientVault';
import { useWallet } from '../hooks/useWallet';

export const PatientPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Patient Vault</h1>
        <p>Manage your medical credentials and privacy settings</p>
      </div>

      {!isConnected ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ marginBottom: '16px' }}>Wallet Not Connected</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please connect your Midnight wallet to access your vault.</p>
        </div>
      ) : (
        <PatientVault />
      )}
    </div>
  );
};

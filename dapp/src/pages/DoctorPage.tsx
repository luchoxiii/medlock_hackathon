/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { DoctorPortal } from '../components/DoctorPortal';
import { useWallet } from '../hooks/useWallet';

export const DoctorPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Medical Provider Portal</h1>
        <p>Issue verified attestations for your patients securely</p>
      </div>

      {!isConnected ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ marginBottom: '16px' }}>Wallet Not Connected</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please connect your Midnight wallet to access provider tools.</p>
        </div>
      ) : (
        <DoctorPortal />
      )}
    </div>
  );
};

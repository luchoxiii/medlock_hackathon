/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { ConsentToggles } from './ConsentToggles';
import { ConsentConfig } from '../api/types';
import { useWallet } from '../hooks/useWallet';

export const PatientVault: React.FC = () => {
  const { address } = useWallet();
  const [consents, setConsents] = useState<ConsentConfig>({
    organDonation: true,
    emergencyMatching: true,
    clinicalTrial: false
  });

  const handleConsentChange = (key: keyof ConsentConfig, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bento-grid">
      <div className="card">
        <h3 className="card-title">Identity Card</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Identity Secured by ZK</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Anon-{address?.slice(-4) || 'XXXX'}</div>
        <span className="badge badge-verified">Verified On-Chain</span>
      </div>

      <div className="card">
        <h3 className="card-title">Blood Profile</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>O+</div>
          <div>
            <div style={{ fontWeight: 600 }}>HLA: A2-B7-DR15</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Serology: Clean</div>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>All data stored in private state.</p>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="card-title">Privacy Console</h3>
        <ConsentToggles consents={consents} onChange={handleConsentChange} />
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>ZK Privacy Meter</span>
            <span style={{ color: 'var(--accent-green)' }}>Data Revealed: 0 bytes</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#E5E5EA', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-green)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

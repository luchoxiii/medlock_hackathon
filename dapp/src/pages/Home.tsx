/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="container section">
      <div className="page-header" style={{ marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem' }}>Your Health Data.<br/>Your Rules.</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          MedLock uses Midnight Network's zero-knowledge cryptography to secure your medical data while allowing provable sharing in emergencies.
        </p>
        <div style={{ marginTop: '32px' }}>
          <Link to="/patient" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
            Enter Vault
          </Link>
        </div>
      </div>

      <div className="bento-grid">
        <div className="card card-glass">
          <h3 className="card-title">Zero-Knowledge Privacy</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Prove attributes (like blood type compatibility) without revealing your actual medical records.</p>
        </div>
        <div className="card card-glass">
          <h3 className="card-title">Sovereign Data Vault</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You control who accesses what. Revoke permissions instantly on-chain.</p>
        </div>
        <div className="card card-glass">
          <h3 className="card-title">Emergency Verification</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Allow doctors to query emergency parameters safely during critical moments.</p>
        </div>
      </div>
    </div>
  );
};

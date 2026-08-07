/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';

export const DoctorPortal: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [bloodType, setBloodType] = useState('O+');

  return (
    <div className="bento-grid">
      <div className="card">
        <h3 className="card-title">Issue Attestation</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label className="input-label">Patient ID Hash or Address</label>
            <input className="input" type="text" placeholder="0x..." value={patientId} onChange={e => setPatientId(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Verified Blood Type</label>
            <select className="input" value={bloodType} onChange={e => setBloodType(e.target.value)}>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontWeight: 500 }}>Serology Clean</span>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }}>Sign & Issue Attestation</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Recent Attestations</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No attestations issued in this session.
        </div>
      </div>
    </div>
  );
};

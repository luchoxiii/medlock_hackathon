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
  const [bloodType, setBloodType] = useState(() => 
    localStorage.getItem('medlock_patient_blood_type') || 'O+'
  );
  const [serologyClean, setSerologyClean] = useState(() => 
    localStorage.getItem('medlock_patient_serology_clean') !== 'false'
  );
  const [consents, setConsents] = useState<ConsentConfig>(() => {
    const saved = localStorage.getItem('medlock_patient_consents');
    return saved ? JSON.parse(saved) : {
      organDonation: true,
      emergencyMatching: true,
      clinicalTrial: false
    };
  });

  const handleConsentChange = (key: keyof ConsentConfig, value: boolean) => {
    const nextConsents = { ...consents, [key]: value };
    setConsents(nextConsents);
    localStorage.setItem('medlock_patient_consents', JSON.stringify(nextConsents));
  };

  const handleBloodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setBloodType(newType);
    localStorage.setItem('medlock_patient_blood_type', newType);
  };

  const handleSerologyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isClean = e.target.checked;
    setSerologyClean(isClean);
    localStorage.setItem('medlock_patient_serology_clean', String(isClean));
  };

  return (
    <div className="bento-grid">
      <div className="card">
        <h3 className="card-title">Tarjeta de Identidad</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Identidad Protegida por ZK</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Anon-{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'XXXX'}
        </div>
        <span className="badge badge-verified">Verificado On-Chain</span>
      </div>

      <div className="card">
        <h3 className="card-title">Perfil Sanguíneo y Datos Médicos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select 
              value={bloodType} 
              onChange={handleBloodTypeChange}
              style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-red)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 8px', backgroundColor: 'var(--card-bg)' }}
            >
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
            <div>
              <div style={{ fontWeight: 600 }}>HLA: A2-B7-DR15</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expediente Médico Privado</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Prueba Serológica Limpia</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={serologyClean} onChange={handleSerologyChange} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Todos los datos se almacenan localmente en tu estado privado.</p>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="card-title">Consola de Privacidad</h3>
        <ConsentToggles consents={consents} onChange={handleConsentChange} />
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Medidor de Privacidad ZK</span>
            <span style={{ color: 'var(--accent-green)' }}>Datos Revelados: 0 bytes</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#E5E5EA', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-green)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

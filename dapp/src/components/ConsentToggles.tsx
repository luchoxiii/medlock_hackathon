/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { ConsentConfig } from '../api/types';

interface Props {
  consents: ConsentConfig;
  onChange: (key: keyof ConsentConfig, value: boolean) => void;
}

export const ConsentToggles: React.FC<Props> = ({ consents, onChange }) => {
  const renderToggle = (key: keyof ConsentConfig, label: string, desc: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{desc}</div>
      </div>
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={consents[key]} 
          onChange={(e) => onChange(key, e.target.checked)} 
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );

  return (
    <div>
      {renderToggle('organDonation', 'Donación de Órganos', 'Permitir a instituciones médicas verificar tu estatus de donante.')}
      {renderToggle('emergencyMatching', 'Coincidencia de Emergencia', 'Habilitar verificación ZK para emergencias sanguíneas y de tejidos.')}
      {renderToggle('clinicalTrial', 'Ensayos Clínicos', 'Permitir consultas anónimas para elegibilidad en ensayos clínicos.')}
    </div>
  );
};

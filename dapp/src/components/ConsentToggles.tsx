/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useEffect, useState } from 'react';
import { GranularConsentConfig, ConsentEntry } from '../api/types';

interface Props {
  consents: GranularConsentConfig;
  onChange: (key: keyof GranularConsentConfig, entry: ConsentEntry) => void;
}

const EXPIRATION_MS = {
  'permanent': Infinity,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export const ConsentToggles: React.FC<Props> = ({ consents, onChange }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isExpired = (entry: ConsentEntry) => {
    if (!entry.enabled || !entry.activatedAt || entry.expiration === 'permanent') return false;
    return entry.activatedAt + EXPIRATION_MS[entry.expiration] <= now;
  };

  useEffect(() => {
    // Auto-disable expired
    Object.keys(consents).forEach((k) => {
      const key = k as keyof GranularConsentConfig;
      const entry = consents[key];
      if (entry.enabled && isExpired(entry)) {
        onChange(key, { ...entry, enabled: false, activatedAt: null });
      }
    });
  }, [now, consents, onChange]);

  const getRemainingTime = (entry: ConsentEntry) => {
    if (!entry.enabled || !entry.activatedAt || entry.expiration === 'permanent') return null;
    const expiresAt = entry.activatedAt + EXPIRATION_MS[entry.expiration];
    const diff = expiresAt - now;
    if (diff <= 0) return 'Expirado';
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const d = Math.floor(h / 24);
    
    if (d > 0) return `Expira en ${d}d ${h % 24}h`;
    return `Expira en ${h}h ${m}m`;
  };

  const handleToggle = (key: keyof GranularConsentConfig, checked: boolean) => {
    const current = consents[key];
    onChange(key, {
      ...current,
      enabled: checked,
      activatedAt: checked ? Date.now() : null
    });
  };

  const handleExpirationChange = (key: keyof GranularConsentConfig, expiration: ConsentEntry['expiration']) => {
    const current = consents[key];
    onChange(key, {
      ...current,
      expiration,
      activatedAt: current.enabled ? Date.now() : current.activatedAt
    });
  };

  const renderToggle = (
    key: keyof GranularConsentConfig,
    emoji: string,
    label: string,
    desc: string
  ) => {
    const entry = consents[key];
    const expired = Boolean(entry.enabled && entry.activatedAt && entry.expiration !== 'permanent' && entry.activatedAt + EXPIRATION_MS[entry.expiration] <= now);
    const active = entry.enabled && !expired;
    const remainingTime = getRemainingTime(entry);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '12px',
        borderRadius: '12px',
        backgroundColor: active ? 'rgba(52, 199, 89, 0.05)' : 'var(--white)',
        border: `1px solid ${active ? 'var(--accent-green)' : 'var(--border-color)'}`,
        boxShadow: active ? '0 0 10px rgba(52, 199, 89, 0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '1.5rem' }}>{emoji}</div>
          <div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {label}
              {expired && <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--accent-red)', color: 'white', borderRadius: '4px' }}>Expirado</span>}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{desc}</div>
            {active && remainingTime && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px', fontWeight: 500 }}>
                {remainingTime}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={entry.expiration}
            onChange={(e) => handleExpirationChange(key, e.target.value as ConsentEntry['expiration'])}
            disabled={expired}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: expired ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="permanent">Permanente</option>
            <option value="24h">24 Horas</option>
            <option value="48h">48 Horas</option>
            <option value="7d">7 Días</option>
            <option value="30d">30 Días</option>
          </select>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => handleToggle(key, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h4 style={{ margin: '24px 0 12px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Acceso de Emergencia</h4>
      {renderToggle('emergencyMatching', '🚨', 'Coincidencia de Emergencia', 'Habilitar verificación ZK para emergencias sanguíneas y de tejidos.')}
      {renderToggle('traumatology', '🦴', 'Traumatología', 'Acceso a radiografías e historial de fracturas para atención urgente.')}
      {renderToggle('bloodTransfusion', '🩸', 'Transfusión de Sangre', 'Permitir acceso al grupo sanguíneo y anticuerpos en urgencias.')}
      {renderToggle('allergyHistory', '⚠️', 'Historial Alérgico', 'Compartir lista de alergias medicamentosas críticas.')}

      <h4 style={{ margin: '24px 0 12px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Investigación y Donación</h4>
      {renderToggle('organDonation', '🫀', 'Donación de Órganos', 'Permitir a instituciones médicas verificar tu estatus de donante.')}
      {renderToggle('clinicalTrial', '🔬', 'Ensayos Clínicos', 'Permitir consultas anónimas para elegibilidad en ensayos clínicos.')}
    </div>
  );
};

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
  const {
    contractAddress,
    verifyEmergencyMatch,
    isVerifying,
    verificationResult,
    verificationCount,
    error
  } = useContract();
  const { isConnected } = useWallet();

  const handleVerify = async () => {
    try {
      await verifyEmergencyMatch(bloodType);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Escáner de Verificación de Emergencia</h1>
        <p>Consultas de conocimiento cero para coincidencia crítica</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {contractAddress && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span>Contrato: <strong style={{ fontFamily: 'monospace' }}>{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</strong></span>
            <span>Verificaciones ZK Totales: <strong style={{ color: 'var(--accent-green)' }}>{verificationCount !== null ? Number(verificationCount) : '0'}</strong></span>
          </div>
        )}

        {!contractAddress && (
          <div style={{ color: 'var(--accent-orange)', backgroundColor: 'rgba(255, 149, 0, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--accent-orange)', marginBottom: '24px', fontSize: '0.9rem' }}>
            <strong>Advertencia:</strong> El contrato aún no está desplegado. Por favor ve al <strong>Portal del Proveedor Médico</strong> para desplegarlo y autorizar al médico.
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--accent-red)', backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--accent-red)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Error: {error}
          </div>
        )}

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', backgroundColor: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong>Aviso de Privacidad:</strong> Esta verificación revela CERO datos del paciente. Solamente se publica en la blockchain un resultado booleano de coincidencia.
        </p>

        <div className="input-group">
          <label className="input-label">Tipo de Sangre Requerido para Coincidencia del Paciente</label>
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
          disabled={!isConnected || isVerifying || !contractAddress}
        >
          {isVerifying ? 'Generando Prueba ZK...' : 'Iniciar Verificación ZK'}
        </button>

        {!isConnected && (
          <p style={{ color: 'var(--accent-orange)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center' }}>
            Por favor conecta tu wallet para iniciar la verificación.
          </p>
        )}

        <ZKResultMatch result={verificationResult} isVerifying={isVerifying} />
      </div>
    </div>
  );
};

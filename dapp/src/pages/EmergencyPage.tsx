/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { ZKProofVisualizer } from '../components/ZKProofVisualizer';
import { useWallet } from '../hooks/useWallet';
import { AuditTimeline } from '../components/AuditTimeline';

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
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1>Escáner de Verificación de Emergencia</h1>
        <p>Consultas de conocimiento cero para coincidencia sanitaria crítica en tiempo real</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Visual Scanner graphic & ZK workflow */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
            <img 
              src="/images/emergency_scanner.jpg" 
              alt="ZK Bio Scanner" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '20px' }}>
              <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>Flujo de Verificación Cero-Conocimiento</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                El escáner genera una prueba criptográfica ZK en tu dispositivo. Valida si la serología está limpia, si el paciente ha dado su consentimiento y si el grupo sanguíneo coincide sin transmitir jamás tus datos privados.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Scanner Form & Controls */}
        <div className="card">
          {contractAddress && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span>Contrato: <strong style={{ fontFamily: 'monospace' }}>{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</strong></span>
              <span>Verificaciones ZK: <strong style={{ color: 'var(--accent-green)' }}>{verificationCount !== null ? Number(verificationCount) : '0'}</strong></span>
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

          <ZKProofVisualizer result={verificationResult} isVerifying={isVerifying} />
        </div>
      </div>

      <AuditTimeline 
        currentResult={verificationResult}
        contractAddress={contractAddress}
        verificationCount={verificationCount}
      />
    </div>
  );
};

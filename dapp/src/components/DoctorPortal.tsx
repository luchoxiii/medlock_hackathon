/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { DoctorDirectory } from './DoctorDirectory';

interface IssuedAttestation {
  patientId: string;
  bloodType: string;
  serologyClean: boolean;
  timestamp: string;
  txHash?: string;
}

export const DoctorPortal: React.FC = () => {
  const {
    contractAddress,
    isDeploying,
    isAddingDoctor,
    isRevokingDoctor,
    doctorPublicKeyHex,
    error,
    deployContract,
    addDoctor,
    revokeDoctor
  } = useContract();

  const [patientId, setPatientId] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [serologyClean, setSerologyClean] = useState(true);
  const [recentAttestations, setRecentAttestations] = useState<IssuedAttestation[]>([]);
  const [deploySuccessMessage, setDeploySuccessMessage] = useState<string | null>(null);
  const [addDoctorSuccessMessage, setAddDoctorSuccessMessage] = useState<string | null>(null);
  const [attestationSuccessMessage, setAttestationSuccessMessage] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploySuccessMessage(null);
    try {
      const address = await deployContract();
      setDeploySuccessMessage(`Contrato desplegado con éxito en ${address}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddDoctor = async () => {
    setAddDoctorSuccessMessage(null);
    try {
      const txHash = await addDoctor();
      setAddDoctorSuccessMessage(`Médico autorizado con éxito en el contrato. Tx: ${txHash.slice(0, 10)}...`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleIssueAttestation = (e: React.FormEvent) => {
    e.preventDefault();
    setAttestationSuccessMessage(null);
    if (!patientId) return;

    // Simulate off-chain issuance by storing the data in localStorage for our mock/demo patient
    localStorage.setItem('medlock_patient_blood_type', bloodType);
    localStorage.setItem('medlock_patient_serology_clean', String(serologyClean));
    
    const newAttestation: IssuedAttestation = {
      patientId,
      bloodType,
      serologyClean,
      timestamp: new Date().toLocaleTimeString()
    };

    setRecentAttestations(prev => [newAttestation, ...prev]);
    setAttestationSuccessMessage(`¡Atestación firmada con éxito y guardada en la bóveda del Paciente!`);
    setPatientId('');
  };

  return (
    <div className="bento-grid">
      {/* Admin Controls */}
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="card-title">Consola de Administración</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Gestiona el contrato inteligente MedLock y las credenciales médicas</p>
        
        {error && (
          <div style={{ color: 'var(--accent-red)', marginBottom: '16px', fontSize: '0.875rem' }}>
            Error: {error}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dirección del Contrato MedLock</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: contractAddress ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
              {contractAddress || 'No Desplegado'}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Clave Pública del Médico (Derivada)</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {doctorPublicKeyHex.slice(0, 16)}...{doctorPublicKeyHex.slice(-8)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleDeploy} 
            disabled={isDeploying}
          >
            {isDeploying ? 'Desplegando Contrato...' : 'Desplegar Contrato MedLock'}
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={handleAddDoctor} 
            disabled={!contractAddress || isAddingDoctor}
          >
            {isAddingDoctor ? 'Autorizando Médico...' : 'Autorizar Médico en el Contrato'}
          </button>
        </div>

        {deploySuccessMessage && (
          <div style={{ color: 'var(--accent-green)', marginTop: '12px', fontSize: '0.875rem' }}>
            {deploySuccessMessage}
          </div>
        )}

        {addDoctorSuccessMessage && (
          <div style={{ color: 'var(--accent-green)', marginTop: '12px', fontSize: '0.875rem' }}>
            {addDoctorSuccessMessage}
          </div>
        )}
      </div>

      {/* Attestation Form */}
      <div className="card">
        <h3 className="card-title">Emitir Atestación Médica</h3>
        <form onSubmit={handleIssueAttestation}>
          <div className="input-group">
            <label className="input-label">Hash ID del Paciente o Dirección</label>
            <input 
              className="input" 
              type="text" 
              placeholder="ej. 0x..." 
              required
              value={patientId} 
              onChange={e => setPatientId(e.target.value)} 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Tipo de Sangre Verificado</label>
            <select className="input" value={bloodType} onChange={e => setBloodType(e.target.value)}>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontWeight: 500 }}>Prueba Serológica Limpia</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={serologyClean} onChange={e => setSerologyClean(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Firmar y Emitir Atestación
          </button>
        </form>

        {attestationSuccessMessage && (
          <div style={{ color: 'var(--accent-green)', marginTop: '12px', fontSize: '0.875rem', textAlign: 'center' }}>
            {attestationSuccessMessage}
          </div>
        )}
      </div>

      {/* Recent Attestations list */}
      <div className="card">
        <h3 className="card-title">Atestaciones Recientes</h3>
        {recentAttestations.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No se han emitido atestaciones en esta sesión.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAttestations.map((att, idx) => (
              <div key={idx} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Paciente: Anon-{att.patientId.slice(-4) || 'XXXX'}</span>
                  <span style={{ color: 'var(--accent-red)' }}>{att.bloodType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>Serología: {att.serologyClean ? 'Limpia' : 'Reactiva'}</span>
                  <span>{att.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DoctorDirectory 
        contractAddress={contractAddress}
        onAddDoctor={addDoctor}
        onRevokeDoctor={revokeDoctor}
        isAddingDoctor={isAddingDoctor}
        isRevokingDoctor={isRevokingDoctor}
        doctorPublicKeyHex={doctorPublicKeyHex}
      />
    </div>
  );
};

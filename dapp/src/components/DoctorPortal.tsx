/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';

const DEFAULT_ADMIN_SK = '0000000000000000000000000000000000000000000000000000000000000000';
const DEFAULT_DOCTOR_PK = '0000000000000000000000000000000000000000000000000000000000000001';

export const DoctorPortal: React.FC = () => {
  const { deployContract, addDoctor, isDeploying, isAddingDoctor, error } = useContract();

  // Deploy states
  const [adminSkDeploy, setAdminSkDeploy] = useState(DEFAULT_ADMIN_SK);
  const [deployedAddress, setDeployedAddress] = useState('');

  // Add Doctor states
  const [contractAddress, setContractAddress] = useState('');
  const [adminSkAuth, setAdminSkAuth] = useState(DEFAULT_ADMIN_SK);
  const [doctorPk, setDoctorPk] = useState(DEFAULT_DOCTOR_PK);
  const [doctorStatus, setDoctorStatus] = useState('');

  // Issue Attestation (Demo fields)
  const [patientId, setPatientId] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [serologyClean, setSerologyClean] = useState(true);
  const [attestationReceipt, setAttestationReceipt] = useState('');

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDeployedAddress('');
      const address = await deployContract(adminSkDeploy);
      setDeployedAddress(address);
      setContractAddress(address); // Pre-fill in Auth section
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDoctorStatus('');
      const txId = await addDoctor(contractAddress, adminSkAuth, doctorPk);
      setDoctorStatus(`Doctor added successfully! Tx ID: ${txId.slice(0, 20)}...`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueAttestation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setAttestationReceipt(
      `Attestation issued for Patient ${patientId.slice(0, 10)}... | Blood Type: ${bloodType} | Serology: ${
        serologyClean ? 'Clean' : 'Flags'
      } (Stored in local wallet)`
    );
  };

  return (
    <div className="bento-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {/* Smart Contract Registry & Administration */}
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="card-title">MedLock Registry Admin</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Deploy the ZK medical registry to Midnight Network and accredit authorized healthcare providers.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Deploy Section */}
          <form onSubmit={handleDeploy} style={{ borderRight: '1px solid var(--border-color)', paddingRight: '32px' }}>
            <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>1. Deploy New Contract</h4>
            <div className="input-group">
              <label className="input-label">Admin Secret Key (Hex)</label>
              <input 
                type="text" 
                className="input" 
                value={adminSkDeploy} 
                onChange={e => setAdminSkDeploy(e.target.value)} 
                disabled={isDeploying}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={isDeploying}
            >
              {isDeploying ? 'Deploying...' : 'Deploy MedLock Contract'}
            </button>
            {deployedAddress && (
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--accent-green)', wordBreak: 'break-all' }}>
                <strong>Deployed Address:</strong> {deployedAddress}
              </div>
            )}
          </form>

          {/* Add Doctor Section */}
          <form onSubmit={handleAddDoctor}>
            <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>2. Authorize Doctor</h4>
            <div className="input-group">
              <label className="input-label">MedLock Contract Address</label>
              <input 
                type="text" 
                className="input" 
                value={contractAddress} 
                onChange={e => setContractAddress(e.target.value)} 
                disabled={isAddingDoctor}
                placeholder="0x..."
              />
            </div>
            <div className="input-group">
              <label className="input-label">Admin Secret Key (Hex)</label>
              <input 
                type="text" 
                className="input" 
                value={adminSkAuth} 
                onChange={e => setAdminSkAuth(e.target.value)} 
                disabled={isAddingDoctor}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Doctor Public Key (Hex)</label>
              <input 
                type="text" 
                className="input" 
                value={doctorPk} 
                onChange={e => setDoctorPk(e.target.value)} 
                disabled={isAddingDoctor}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={isAddingDoctor}
            >
              {isAddingDoctor ? 'Authorizing...' : 'Accredit Doctor'}
            </button>
            {doctorStatus && (
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--accent-green)' }}>
                {doctorStatus}
              </div>
            )}
            {error && (
              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Attestation Form */}
      <div className="card">
        <h3 className="card-title">Issue Medical Attestation</h3>
        <form onSubmit={handleIssueAttestation}>
          <div className="input-group">
            <label className="input-label">Patient ID Hash or Address</label>
            <input 
              className="input" 
              type="text" 
              placeholder="0x..." 
              value={patientId} 
              onChange={e => setPatientId(e.target.value)} 
              required
            />
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
              <input 
                type="checkbox" 
                checked={serologyClean} 
                onChange={e => setSerologyClean(e.target.checked)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign & Issue Attestation</button>
        </form>

        {attestationReceipt && (
          <div style={{ marginTop: '20px', padding: '12px', fontSize: '0.85rem', color: 'var(--accent-blue)', backgroundColor: 'rgba(0,113,227,0.05)', borderRadius: '8px', border: '1px dashed var(--accent-blue)' }}>
            {attestationReceipt}
          </div>
        )}
      </div>

      {/* Recent Attestations */}
      <div className="card">
        <h3 className="card-title">Recent Attestations</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {attestationReceipt ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Patient Anon...</span>
                <span className="badge badge-verified">Issued</span>
              </div>
            </div>
          ) : (
            'No attestations issued in this session.'
          )}
        </div>
      </div>
    </div>
  );
};

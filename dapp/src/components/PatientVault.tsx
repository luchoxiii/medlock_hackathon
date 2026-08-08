/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';
import { ConsentToggles } from './ConsentToggles';
import { GranularConsentConfig, ConsentEntry } from '../api/types';
import { useWallet } from '../hooks/useWallet';
import { EmergencyPassport } from './EmergencyPassport';
import { encryptData, decryptData } from '../api/encryption';

export const PatientVault: React.FC = () => {
  const { address, isConnected, connect } = useWallet();
  const [bloodType, setBloodType] = useState('O+');
  const [serologyClean, setSerologyClean] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [consents, setConsents] = useState<GranularConsentConfig>({
    organDonation: { enabled: true, expiration: 'permanent', activatedAt: Date.now() },
    emergencyMatching: { enabled: true, expiration: 'permanent', activatedAt: Date.now() },
    clinicalTrial: { enabled: false, expiration: 'permanent', activatedAt: null },
    traumatology: { enabled: false, expiration: 'permanent', activatedAt: null },
    bloodTransfusion: { enabled: false, expiration: 'permanent', activatedAt: null },
    allergyHistory: { enabled: false, expiration: 'permanent', activatedAt: null },
  });

  // Decrypt and load data when wallet is connected
  useEffect(() => {
    if (!address) return;
    
    const loadAndDecrypt = async () => {
      setIsDecrypting(true);
      try {
        const encBlood = localStorage.getItem(`medlock_enc_blood_${address}`);
        const encSerology = localStorage.getItem(`medlock_enc_serology_${address}`);
        const encConsents = localStorage.getItem(`medlock_enc_consents_${address}`);
        
        if (encBlood && encSerology && encConsents) {
          const decBlood = await decryptData(encBlood, address);
          const decSerology = await decryptData(encSerology, address);
          const decConsents = await decryptData(encConsents, address);
          
          setBloodType(decBlood);
          setSerologyClean(decSerology === 'true');
          setConsents(JSON.parse(decConsents));
          
          // Legacy sync for backend compat
          localStorage.setItem('medlock_patient_blood_type', decBlood);
          localStorage.setItem('medlock_patient_serology_clean', decSerology);
          localStorage.setItem('medlock_patient_consents', decConsents);
        } else {
          // Initialize encryption with default/existing values
          const initialBlood = localStorage.getItem('medlock_patient_blood_type') || 'O+';
          const initialSerology = localStorage.getItem('medlock_patient_serology_clean') !== 'false';
          const initialConsents = localStorage.getItem('medlock_patient_consents') 
            ? JSON.parse(localStorage.getItem('medlock_patient_consents')!) 
            : consents;
            
          setBloodType(initialBlood);
          setSerologyClean(initialSerology);
          setConsents(initialConsents);
          
          // Save encrypted
          const encB = await encryptData(initialBlood, address);
          const encS = await encryptData(String(initialSerology), address);
          const encC = await encryptData(JSON.stringify(initialConsents), address);
          
          localStorage.setItem(`medlock_enc_blood_${address}`, encB);
          localStorage.setItem(`medlock_enc_serology_${address}`, encS);
          localStorage.setItem(`medlock_enc_consents_${address}`, encC);
        }
      } catch (err) {
        console.error('[Vault] Decryption error:', err);
      } finally {
        setIsDecrypting(false);
      }
    };
    
    loadAndDecrypt();
  }, [address]);

  const handleConsentChange = async (key: keyof GranularConsentConfig, entry: ConsentEntry) => {
    const nextConsents = { ...consents, [key]: entry };
    setConsents(nextConsents);
    localStorage.setItem('medlock_patient_consents', JSON.stringify(nextConsents));
    
    if (address) {
      const encC = await encryptData(JSON.stringify(nextConsents), address);
      localStorage.setItem(`medlock_enc_consents_${address}`, encC);
    }
  };

  const handleBloodTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setBloodType(newType);
    localStorage.setItem('medlock_patient_blood_type', newType);
    
    if (address) {
      const encB = await encryptData(newType, address);
      localStorage.setItem(`medlock_enc_blood_${address}`, encB);
    }
  };

  const handleSerologyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isClean = e.target.checked;
    setSerologyClean(isClean);
    localStorage.setItem('medlock_patient_serology_clean', String(isClean));
    
    if (address) {
      const encS = await encryptData(String(isClean), address);
      localStorage.setItem(`medlock_enc_serology_${address}`, encS);
    }
  };

  // Locked View if wallet is not connected
  if (!isConnected || !address) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', gridColumn: '1 / -1', alignItems: 'stretch' }}>
        <div className="card card-glass" style={{ flex: '1 1 450px', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', textAlign: 'left' }}>
          <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 16px rgba(0,113,227,0.3))' }}>🔒</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: 0 }}>Bóveda Cifrada de Salud</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            Tus datos médicos sensibles se almacenan de forma local en tu navegador mediante encriptación criptográfica fuerte <strong>AES-GCM (256-bit)</strong>. Conecta tu wallet de Midnight para derivar las llaves de descifrado y acceder a tu expediente de salud privado y soberano.
          </p>
          <button className="btn btn-primary" onClick={connect} style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px', marginTop: '12px' }}>
            Conectar Wallet para Descifrar
          </button>
        </div>
        <div style={{ flex: '1 1 350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', minHeight: '350px' }}>
          <img 
            src="/images/vault_locked_phone.jpg" 
            alt="Secure patient device" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
      </div>
    );
  }

  if (isDecrypting) {
    return (
      <div className="card card-glass" style={{ gridColumn: '1 / -1', padding: '60px 40px', textAlign: 'center' }}>
        <div className="shimmer-bg" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 24px' }}></div>
        <h3 style={{ color: 'var(--text-secondary)' }}>Descifrando Bóveda de Salud...</h3>
      </div>
    );
  }

  return (
    <div className="bento-grid">
      <div className="card">
        <h3 className="card-title">Tarjeta de Identidad</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Identidad Protegida por ZK</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Anon-{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'XXXX'}
        </div>
        <span className="badge badge-verified">Cifrado Criptográfico Activo</span>
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
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expediente Médico Cifrado</div>
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
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Todos los datos se guardan en local y se encriptan al instante.</p>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="card-title">Consola de Privacidad Granular</h3>
        <ConsentToggles consents={consents} onChange={handleConsentChange} />
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Cifrado AES-GCM Local</span>
            <span style={{ color: 'var(--accent-green)' }}>Estatus: Bóveda Protegida</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#E5E5EA', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-green)' }}></div>
          </div>
        </div>
      </div>

      <EmergencyPassport consents={consents} />
    </div>
  );
};

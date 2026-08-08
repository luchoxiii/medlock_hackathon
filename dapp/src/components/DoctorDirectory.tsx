/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';

export interface RegisteredDoctor {
  id: string;               // unique UUID
  publicKeyHex: string;     // derived public key hex
  name: string;             // doctor name
  specialty: string;        // specialty
  institution: string;      // hospital/clinic
  registeredAt: string;     // ISO timestamp
  txHash: string;           // on-chain tx hash
  status: 'active' | 'revoked' | 'pending';
  revokedAt?: string;       // ISO timestamp if revoked
}

interface DoctorDirectoryProps {
  contractAddress: string | null;
  onAddDoctor: () => Promise<string>;
  isAddingDoctor: boolean;
  doctorPublicKeyHex: string;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  contractAddress,
  onAddDoctor,
  isAddingDoctor,
  doctorPublicKeyHex
}) => {
  const [doctors, setDoctors] = useState<RegisteredDoctor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newInstitution, setNewInstitution] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('medlock_doctor_registry');
    if (saved) {
      setDoctors(JSON.parse(saved));
    } else {
      // Mock data for demo
      const mockDoctors: RegisteredDoctor[] = [
        {
          id: crypto.randomUUID(),
          publicKeyHex: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          name: 'Dr. Roberto Mendoza',
          specialty: 'Cardiología',
          institution: 'Hospital Central',
          registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          txHash: '0xabc123...',
          status: 'active'
        },
        {
          id: crypto.randomUUID(),
          publicKeyHex: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
          name: 'Dra. Ana Silva',
          specialty: 'Neurología',
          institution: 'Clínica San José',
          registeredAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          txHash: '0xdef456...',
          status: 'revoked',
          revokedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      setDoctors(mockDoctors);
      localStorage.setItem('medlock_doctor_registry', JSON.stringify(mockDoctors));
    }
  }, []);

  const saveDoctors = (newDoctors: RegisteredDoctor[]) => {
    setDoctors(newDoctors);
    localStorage.setItem('medlock_doctor_registry', JSON.stringify(newDoctors));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress) {
      alert('Debes desplegar el contrato primero.');
      return;
    }
    try {
      const txHash = await onAddDoctor();
      const newDoc: RegisteredDoctor = {
        id: crypto.randomUUID(),
        publicKeyHex: doctorPublicKeyHex,
        name: newName,
        specialty: newSpecialty,
        institution: newInstitution,
        registeredAt: new Date().toISOString(),
        txHash,
        status: 'active'
      };
      saveDoctors([newDoc, ...doctors]);
      setNewName('');
      setNewSpecialty('');
      setNewInstitution('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Error al autorizar médico');
    }
  };

  const handleRevoke = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas revocar a este médico?')) {
      const updated = doctors.map(d => 
        d.id === id ? { ...d, status: 'revoked' as const, revokedAt: new Date().toISOString() } : d
      );
      saveDoctors(updated);
    }
  };

  const handleReactivate = (id: string) => {
    const updated = doctors.map(d => 
      d.id === id ? { ...d, status: 'active' as const, revokedAt: undefined } : d
    );
    saveDoctors(updated);
  };

  const activeCount = doctors.filter(d => d.status === 'active').length;
  const revokedCount = doctors.filter(d => d.status === 'revoked').length;

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="card-title" style={{ marginBottom: 0 }}>👨‍⚕️ Directorio de Médicos Autorizados</h3>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} disabled={!contractAddress}>
          {showAddForm ? 'Cancelar' : '+ Nuevo Médico'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <div>Total: <strong style={{ color: 'var(--text-primary)' }}>{doctors.length}</strong></div>
        <div>Activos: <strong style={{ color: 'var(--accent-green)' }}>{activeCount}</strong></div>
        <div>Revocados: <strong style={{ color: 'var(--accent-red)' }}>{revokedCount}</strong></div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nombre del Médico</label>
              <input className="input" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej. Dr. Juan Pérez" />
            </div>
            <div className="input-group">
              <label className="input-label">Especialidad</label>
              <input className="input" required value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="Ej. Hematología" />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Institución</label>
              <input className="input" required value={newInstitution} onChange={e => setNewInstitution(e.target.value)} placeholder="Ej. Hospital General" />
            </div>
          </div>
          <button type="submit" className="btn btn-success" disabled={isAddingDoctor}>
            {isAddingDoctor ? 'Autorizando en Contrato...' : 'Registrar y Autorizar'}
          </button>
        </form>
      )}

      {doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          No hay médicos registrados. Utiliza la Consola de Administración para autorizar médicos.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <strong>Nota:</strong> La revocación on-chain requiere un circuito de actualización del MerkleTree. Actualmente se aplica a nivel de capa de aplicación.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px' }}>Médico</th>
                <th style={{ padding: '12px' }}>Institución</th>
                <th style={{ padding: '12px' }}>Clave Pública</th>
                <th style={{ padding: '12px' }}>Registro</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: doc.status === 'active' ? 'var(--accent-green)' : doc.status === 'revoked' ? 'var(--accent-red)' : 'orange'
                    }}></span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.specialty}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{doc.institution}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {doc.publicKeyHex.slice(0, 8)}...{doc.publicKeyHex.slice(-6)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                    {new Date(doc.registeredAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {doc.status === 'active' ? (
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }} onClick={() => handleRevoke(doc.id)}>
                        Revocar
                      </button>
                    ) : (
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }} onClick={() => handleReactivate(doc.id)}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

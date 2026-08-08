/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';

interface AnonymousDonor {
  anonId: string;
  bloodType: string;
  serologyClean: boolean;
  consentActive: boolean;
  registeredAt: string;
  lastVerified: string;
  zkCommitment: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const generateMockDonors = (): AnonymousDonor[] => {
  const donors: AnonymousDonor[] = [];
  const count = Math.floor(Math.random() * 5) + 8; // 8 to 12
  for (let i = 0; i < count; i++) {
    const id = Math.random().toString(16).substring(2, 6).toUpperCase();
    donors.push({
      anonId: `Donante-${id}`,
      bloodType: BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)],
      serologyClean: Math.random() > 0.2, // 80% clean
      consentActive: Math.random() > 0.1, // 90% active
      registeredAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      lastVerified: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      zkCommitment: '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)
    });
  }
  return donors;
};

const getCompatibleBloodTypes = (recipientType: string): string[] => {
  switch (recipientType) {
    case 'O-': return ['O-'];
    case 'O+': return ['O-', 'O+'];
    case 'A-': return ['O-', 'A-'];
    case 'A+': return ['O-', 'O+', 'A-', 'A+'];
    case 'B-': return ['O-', 'B-'];
    case 'B+': return ['O-', 'O+', 'B-', 'B+'];
    case 'AB-': return ['O-', 'A-', 'B-', 'AB-'];
    case 'AB+': return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    default: return [];
  }
};

export const DonorMatchmaker: React.FC = () => {
  const [donors, setDonors] = useState<AnonymousDonor[]>([]);
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState('O+');
  const [urgency, setUrgency] = useState('Crítica');
  const [requireClean, setRequireClean] = useState(true);
  const [requireConsent, setRequireConsent] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AnonymousDonor[] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('medlock_donor_pool');
    if (stored) {
      setDonors(JSON.parse(stored));
    } else {
      const mock = generateMockDonors();
      localStorage.setItem('medlock_donor_pool', JSON.stringify(mock));
      setDonors(mock);
    }
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setResults(null);
    setTimeout(() => {
      const compatibleTypes = getCompatibleBloodTypes(bloodTypeNeeded);
      const matched = donors.filter(d => {
        if (!compatibleTypes.includes(d.bloodType)) return false;
        if (requireClean && !d.serologyClean) return false;
        if (requireConsent && !d.consentActive) return false;
        return true;
      });
      setResults(matched);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="card" style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '8px' }}>🔍 Buscador de Donantes Compatibles (ZK Matchmaking)</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
        Busca donantes sin exponer la identidad ni dirección de los registrados
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="input-group">
          <label className="input-label">Tipo de sangre necesario</label>
          <select className="input" value={bloodTypeNeeded} onChange={e => setBloodTypeNeeded(e.target.value)}>
            {BLOOD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        
        <div className="input-group">
          <label className="input-label">Nivel de urgencia</label>
          <select className="input" value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option>Crítica</option>
            <option>Alta</option>
            <option>Normal</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={requireClean} 
            onChange={e => setRequireClean(e.target.checked)} 
            style={{ width: '18px', height: '18px' }}
          />
          <span>Solo serología limpia</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={requireConsent} 
            onChange={e => setRequireConsent(e.target.checked)} 
            style={{ width: '18px', height: '18px' }}
          />
          <span>Solo con consentimiento activo</span>
        </label>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} 
        onClick={handleSearch}
        disabled={isSearching}
      >
        {isSearching ? 'Ejecutando consulta ZK...' : 'Buscar Donantes ZK'}
      </button>

      {results !== null && !isSearching && (
        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0 }}>Resultados de la búsqueda</h4>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              backgroundColor: results.length > 0 ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
              color: results.length > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              {results.length} donantes compatibles encontrados de {donors.length} registrados
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', backgroundColor: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            Explicación de compatibilidad ZK: Los tipos de sangre compatibles con {bloodTypeNeeded} son {getCompatibleBloodTypes(bloodTypeNeeded).join(', ')}.
          </p>

          {results.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0' }}>
              No se encontraron donantes compatibles con los criterios especificados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((donor, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderLeft: `4px solid ${donor.serologyClean ? 'var(--accent-green)' : 'var(--accent-orange)'}`,
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{donor.anonId}</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: 'var(--accent-blue)', 
                        color: '#fff', 
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {donor.bloodType}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🛡️ Identidad Protegida por ZK
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Serología: </span>
                      <strong style={{ color: donor.serologyClean ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                        {donor.serologyClean ? '✅ Limpia' : '⚠️ Reactiva'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Última Verificación: </span>
                      <strong>{new Date(donor.lastVerified).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>ZK Commitment: </span>
                      <code style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px' }}>
                        {donor.zkCommitment.substring(0, 14)}...
                      </code>
                    </div>
                  </div>

                  <button className="btn btn-outline" style={{ marginTop: '8px', padding: '8px', fontSize: '0.9rem' }}>
                    Solicitar Verificación ZK
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

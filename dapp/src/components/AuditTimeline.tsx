/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';
import { VerificationResult } from '../api/types';

interface AuditTimelineProps {
  currentResult: VerificationResult | null;
  contractAddress: string | null;
  verificationCount: bigint | null;
}

interface AuditEvent {
  id: string;
  type: 'verification_success' | 'verification_fail' | 'contract_deploy' | 'doctor_authorized';
  timestamp: string;
  nullifier: string;
  proofHash: string;
  blockHash: string;
  criteria: string;
  status: 'confirmed' | 'pending';
}

const generateMockHash = () => Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);

function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'hace unos segundos';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-ES');
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ currentResult, contractAddress: _contractAddress }) => {
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'verifications' | 'deploys'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('medlock_audit_log');
    if (stored) {
      try {
        setAuditLog(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored audit log', e);
      }
    } else {
      // Simulate initial historical data
      const now = Date.now();
      const mockEvents: AuditEvent[] = [
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'verification_success',
          timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
          nullifier: generateMockHash(),
          proofHash: generateMockHash(),
          blockHash: generateMockHash(),
          criteria: 'O+',
          status: 'confirmed'
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'verification_fail',
          timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
          nullifier: generateMockHash(),
          proofHash: generateMockHash(),
          blockHash: generateMockHash(),
          criteria: 'A-',
          status: 'confirmed'
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'contract_deploy',
          timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
          nullifier: 'N/A',
          proofHash: 'N/A',
          blockHash: generateMockHash(),
          criteria: 'Despliegue inicial',
          status: 'confirmed'
        }
      ];
      setAuditLog(mockEvents);
      localStorage.setItem('medlock_audit_log', JSON.stringify(mockEvents));
    }
  }, []);

  useEffect(() => {
    if (currentResult) {
      const newEvent: AuditEvent = {
        id: Math.random().toString(36).substring(2, 9),
        type: currentResult.success ? 'verification_success' : 'verification_fail',
        timestamp: currentResult.timestamp,
        nullifier: currentResult.nullifier,
        proofHash: currentResult.proofHash,
        blockHash: generateMockHash(),
        criteria: currentResult.criteria,
        status: 'pending'
      };
      
      setAuditLog(prev => {
        // Prevent duplicate adds from React strict mode or quick updates
        if (prev.some(e => e.id === newEvent.id || (e.timestamp === newEvent.timestamp && e.type === newEvent.type))) {
          return prev;
        }
        const newLog = [newEvent, ...prev];
        localStorage.setItem('medlock_audit_log', JSON.stringify(newLog));
        return newLog;
      });

      // Simulate confirmation after 3 seconds
      setTimeout(() => {
        setAuditLog(prev => {
          const updated = prev.map(e => e.timestamp === newEvent.timestamp ? { ...e, status: 'confirmed' as const } : e);
          localStorage.setItem('medlock_audit_log', JSON.stringify(updated));
          return updated;
        });
      }, 3000);
    }
  }, [currentResult]);

  const clearHistory = () => {
    setAuditLog([]);
    localStorage.removeItem('medlock_audit_log');
  };

  const filteredLog = auditLog.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'verifications') return event.type === 'verification_success' || event.type === 'verification_fail';
    if (filter === 'deploys') return event.type === 'contract_deploy' || event.type === 'doctor_authorized';
    return true;
  });

  const getEventIcon = (type: AuditEvent['type']) => {
    switch (type) {
      case 'verification_success': return <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />;
      case 'verification_fail': return <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--accent-red)', boxShadow: '0 0 8px var(--accent-red)' }} />;
      case 'contract_deploy':
      case 'doctor_authorized': return <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }} />;
    }
  };

  const getEventBadge = (type: AuditEvent['type']) => {
    switch (type) {
      case 'verification_success': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 'bold' }}>Coincidencia Exitosa</span>;
      case 'verification_fail': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 'bold' }}>Sin Coincidencia</span>;
      case 'contract_deploy': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(10, 132, 255, 0.1)', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 'bold' }}>Contrato Desplegado</span>;
      case 'doctor_authorized': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(10, 132, 255, 0.1)', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 'bold' }}>Médico Autorizado</span>;
    }
  };

  return (
    <div className="card" style={{ marginTop: '32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>📋 Registro de Auditoría ZK</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Historial de verificaciones ancladas en la blockchain de Midnight</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ padding: '6px 12px', border: 'none', background: filter === 'all' ? 'var(--card-bg)' : 'transparent', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: filter === 'all' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('verifications')}
              style={{ padding: '6px 12px', border: 'none', background: filter === 'verifications' ? 'var(--card-bg)' : 'transparent', color: filter === 'verifications' ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: filter === 'verifications' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              Verificaciones
            </button>
            <button 
              onClick={() => setFilter('deploys')}
              style={{ padding: '6px 12px', border: 'none', background: filter === 'deploys' ? 'var(--card-bg)' : 'transparent', color: filter === 'deploys' ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: filter === 'deploys' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              Despliegues
            </button>
          </div>
          <button 
            onClick={clearHistory}
            className="btn btn-outline"
            style={{ padding: '8px 12px', fontSize: '0.875rem' }}
          >
            Limpiar Historial
          </button>
        </div>
      </div>

      {filteredLog.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-color)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          No hay eventos de auditoría registrados. Realiza una verificación ZK para comenzar.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '16px' }}>
          {/* Timeline vertical line */}
          <div style={{ position: 'absolute', left: '21.5px', top: '16px', bottom: '16px', width: '2px', backgroundColor: 'var(--border-color)', borderRadius: '2px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredLog.map((event, index) => (
              <div 
                key={event.id} 
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  animation: 'slideIn 0.3s ease-out',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both'
                }}
              >
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '13px', paddingTop: '6px' }}>
                  {getEventIcon(event.type)}
                </div>
                
                <div style={{ flex: 1, background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getEventBadge(event.type)}
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{timeAgo(event.timestamp)}</span>
                    </div>
                    {event.status === 'confirmed' ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}/> Confirmado
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-orange)', animation: 'pulse 1.5s infinite' }}/> Pendiente
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Criterio</span>
                      <strong style={{ fontSize: '0.875rem' }}>{event.criteria}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nulificador</span>
                      <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                        {event.nullifier.length > 10 ? `${event.nullifier.slice(0,6)}...${event.nullifier.slice(-4)}` : event.nullifier}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hash de Prueba</span>
                      <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                        {event.proofHash.length > 10 ? `${event.proofHash.slice(0,6)}...${event.proofHash.slice(-4)}` : event.proofHash}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hash de Bloque</span>
                      <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                        {event.blockHash.length > 10 ? `${event.blockHash.slice(0,6)}...${event.blockHash.slice(-4)}` : event.blockHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px) translateX(-10px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

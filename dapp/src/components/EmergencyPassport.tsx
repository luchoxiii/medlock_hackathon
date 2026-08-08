/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { GranularConsentConfig } from '../api/types';

interface EmergencyPassportProps {
  consents: GranularConsentConfig;
}

export const EmergencyPassport: React.FC<EmergencyPassportProps> = ({ consents }) => {
  const { address } = useWallet();
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(24 * 60 * 60 * 1000);
  const [consentHash, setConsentHash] = useState<string>('');
  
  // Calculate expiration
  const isExpired = timeLeft <= 0;

  const generateHash = async () => {
    const data = JSON.stringify(consents) + address + timestamp;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setConsentHash(hashHex.substring(0, 16));
  };

  useEffect(() => {
    generateHash();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - timestamp;
      const remaining = (24 * 60 * 60 * 1000) - elapsed;
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(timer);
  }, [timestamp, consents, address]);

  const anonId = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'XXXX';
  const qrData = `https://medlock.app/emergency?patient=${anonId}&t=${timestamp}&hash=${consentHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  const handleRegenerate = () => {
    setTimestamp(Date.now());
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MedLock Pasaporte de Emergencia',
          text: 'Acceso a mi historial médico de emergencia',
          url: qrData
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(qrData);
      alert('Enlace copiado al portapapeles');
    }
  };

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card" style={{ 
      gridColumn: '1 / -1', 
      background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,245,255,0.9) 100%)',
      backdropFilter: 'blur(10px)',
      border: isExpired ? '2px solid var(--accent-red)' : '2px solid transparent',
      backgroundImage: isExpired ? 'none' : 'linear-gradient(var(--card-bg), var(--card-bg)), linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
      backgroundOrigin: 'border-box',
      backgroundClip: isExpired ? 'padding-box' : 'padding-box, border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {!isExpired && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          boxShadow: '0 0 15px rgba(0, 122, 255, 0.3)',
          animation: 'pulse 2s infinite',
          pointerEvents: 'none',
          borderRadius: 'var(--radius-xl)'
        }} />
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 className="card-title" style={{ marginBottom: '8px' }}>Pasaporte Médico de Emergencia</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
          Muestra este código a personal médico para proveer acceso de solo lectura a tus datos vitales.
        </p>

        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <img 
            src={qrUrl} 
            alt="Emergency QR" 
            style={{ 
              width: '200px', 
              height: '200px',
              opacity: isExpired ? 0.3 : 1
            }} 
          />
          {isExpired && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--accent-red)',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              textAlign: 'center',
              width: '100%',
              background: 'rgba(255,255,255,0.8)',
              padding: '8px 0'
            }}>
              Pasaporte Expirado
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Anon-{anonId}
        </div>
        
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Generado: {new Date(timestamp).toLocaleString()}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: isExpired ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
          color: isExpired ? 'var(--accent-red)' : 'var(--accent-green)',
          marginBottom: '24px',
          fontWeight: 500
        }}>
          {isExpired ? (
            <span>Expirado</span>
          ) : (
            <span>Válido por: {formatTimeLeft(timeLeft)}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={handleRegenerate}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-blue)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Regenerar Pasaporte
          </button>
          
          <button 
            onClick={handleShare}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--accent-blue)',
              background: 'transparent',
              color: 'var(--accent-blue)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Compartir Enlace
          </button>
        </div>

        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8.24296C6.11303 6.00287 9.00695 4.74316 12.0159 4.74316C15.0249 4.74316 17.9188 6.00287 20.0318 8.24296"/>
            <path d="M6.88379 11.233C8.24356 9.79466 10.0903 8.98682 12.0223 8.98682C13.9542 8.98682 15.801 9.79466 17.1608 11.233"/>
            <path d="M9.81641 14.2709C10.4001 13.6543 11.1947 13.3076 12.0232 13.3076C12.8517 13.3076 13.6462 13.6543 14.23 14.2709"/>
            <path d="M12.5 17.5C12.5 17.7761 12.2761 18 12 18C11.7239 18 11.5 17.7761 11.5 17.5C11.5 17.2239 11.7239 17 12 17C12.2761 17 12.5 17.2239 12.5 17.5Z"/>
          </svg>
          Compatible con NFC
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 122, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); }
        }
      `}</style>
    </div>
  );
};

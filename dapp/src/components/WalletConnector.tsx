/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnector: React.FC = () => {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected && address) {
    const truncate = (str: string) => str.slice(0, 6) + '...' + str.slice(-4);
    return (
      <button className="btn btn-secondary" onClick={disconnect} title="Desconectar Wallet">
        <span className="status-dot status-connected"></span>
        {truncate(address)}
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn btn-primary" 
        onClick={connect} 
        disabled={isConnecting}
      >
        {isConnecting ? '🔓 Esperando Wallet...' : 'Conectar Wallet'}
      </button>
      {isConnecting && (
        <div style={{
          position: 'absolute',
          top: '115%',
          right: 0,
          whiteSpace: 'nowrap',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontSize: '0.825rem',
          padding: '10px 16px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          zIndex: 9999,
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1rem' }}>👆</span>
          <span>Abre tu extensión <strong>Lace / 1AM</strong> en la barra de tu navegador para autorizar.</span>
        </div>
      )}
    </div>
  );
};

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
      <button className="btn btn-secondary" onClick={disconnect}>
        <span className="status-dot status-connected"></span>
        {truncate(address)}
      </button>
    );
  }

  return (
    <button 
      className="btn btn-primary" 
      onClick={connect} 
      disabled={isConnecting}
    >
      {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
    </button>
  );
};

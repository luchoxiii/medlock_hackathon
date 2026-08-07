/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { detectWallet, connectWallet, ConnectedSession } from '../api/midnight';
import { WalletState } from '../api/types';

interface ExtendedWalletState extends WalletState {
  session: ConnectedSession | null;
}

interface WalletContextType extends ExtendedWalletState {
  isConnecting: boolean;
  walletStatus: 'checking' | 'detected' | 'not-found';
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExtendedWalletState>({
    address: null,
    isConnected: false,
    walletType: null,
    network: null,
    session: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');

  // Auto-detect wallet on mount
  useEffect(() => {
    detectWallet().then((wallet) => {
      setWalletStatus(wallet ? 'detected' : 'not-found');
    });
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const wallet = await detectWallet();
      if (!wallet) {
        setWalletStatus('not-found');
        throw new Error('No Midnight wallet found. Please install a wallet extension.');
      }

      const session = await connectWallet(wallet, 'preprod');

      setState({
        address: session.unshieldedAddress,
        isConnected: true,
        walletType: session.providers.walletProvider ? (wallet.name || 'Midnight Wallet') : 'Midnight Wallet',
        network: session.config.networkId,
        session,
      });
      setWalletStatus('detected');
      console.log('[MedLock] Connected:', session.unshieldedAddress);
    } catch (err) {
      console.error('[MedLock] Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      walletType: null,
      network: null,
      session: null,
    });
    console.log('[MedLock] Disconnected');
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, isConnecting, walletStatus, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { detectWallet, getAvailableWalletSync, connectWallet, ConnectedSession } from '../api/midnight';
import { WalletState } from '../api/types';

interface WalletContextType extends WalletState {
  isConnecting: boolean;
  walletStatus: 'checking' | 'detected' | 'not-found';
  session: ConnectedSession | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    walletType: null,
    network: null,
  });
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');

  // Auto-detect & auto-reconnect on mount if user was previously connected
  useEffect(() => {
    const shouldAutoConnect = localStorage.getItem('medlock_wallet_connected') === 'true';

    detectWallet().then((wallet) => {
      if (wallet) {
        setWalletStatus('detected');
        if (shouldAutoConnect) {
          connectWallet(wallet)
            .then(({ address, walletName, networkId, session: connectedSession }) => {
              setState({
                address,
                isConnected: true,
                walletType: walletName,
                network: networkId,
              });
              setSession(connectedSession);
            })
            .catch((err) => {
              console.warn('[MedLock] Quiet auto-connect skipped:', err?.message || err);
              localStorage.removeItem('medlock_wallet_connected');
            });
        }
      } else {
        setWalletStatus('not-found');
      }
    });
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      // 1. Detect wallet SYNCHRONOUSLY to preserve the user click gesture context.
      // This is critical for Chrome/Brave extensions to pop up their permission window immediately.
      let wallet = getAvailableWalletSync();
      if (!wallet) {
        wallet = await detectWallet();
      }

      if (!wallet) {
        setWalletStatus('not-found');
        alert('No se detectó ninguna wallet de Midnight (1AM o Lace). Por favor asegúrate de instalar y activar la extensión en tu navegador.');
        return;
      }

      // 2. Immediately call connectWallet which triggers the extension prompt modal directly
      const { address, walletName, networkId, session: connectedSession } = await connectWallet(wallet);

      setState({
        address,
        isConnected: true,
        walletType: walletName,
        network: networkId,
      });
      setSession(connectedSession);
      setWalletStatus('detected');
      localStorage.setItem('medlock_wallet_connected', 'true');
      console.log('[MedLock] Connected successfully:', address);
    } catch (err: any) {
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
    });
    setSession(null);
    localStorage.removeItem('medlock_wallet_connected');
    console.log('[MedLock] Disconnected');
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, isConnecting, walletStatus, session, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext';

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

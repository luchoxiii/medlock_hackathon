/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import '@midnight-ntwrk/dapp-connector-api';

const NETWORK_ID = 'preprod';

/**
 * Detect a Midnight wallet extension injected on window.midnight.
 * Wallets inject under UUID keys — always enumerate with Object.values().
 */
export async function detectWallet(): Promise<any | null> {
  let attempts = 0;
  return new Promise((resolve) => {
    const check = () => {
      const injected = (window as any).midnight;
      if (injected) {
        const wallets = Object.values(injected);
        if (wallets.length > 0) {
          resolve(wallets[0]);
          return;
        }
      }
      if (++attempts >= 50) {
        resolve(null);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

/**
 * Connect to a Midnight wallet and return the connected API + address.
 */
export async function connectWallet(
  wallet: any,
  networkId: string = NETWORK_ID
): Promise<{ address: string; walletName: string; networkId: string }> {
  // Connect to the specified network — prompts user for authorization
  const connectedApi = await wallet.connect(networkId);

  // Get the unshielded address
  const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

  // Optionally get service config for downstream SDK wiring
  const config = await connectedApi.getConfiguration();
  console.log('[MedLock] Wallet connected. Service config:', config);

  return {
    address: unshieldedAddress,
    walletName: wallet.name || 'Midnight Wallet',
    networkId
  };
}

// TODO: Contract deploy and call functions will be implemented
// when Compact contracts are compiled and ZK proving assets are available.

export async function stubDeployContract(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

export async function stubVerifyEmergencyMatch(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 3000));
}

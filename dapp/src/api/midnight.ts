/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey, ContractState } from '@midnight-ntwrk/compact-runtime';
import { LedgerParameters, ZswapChainState } from '@midnight-ntwrk/ledger-v8';

import { Contract } from '../managed/medlock';

const NETWORK_ID = 'preprod';

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider;
    proofProvider: { proveTx: (unprovenTx: any, _config: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

/**
 * Detect a Midnight wallet extension injected on window.midnight.
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
 * Connect to a Midnight wallet and build the providers session.
 */
export async function connectWallet(
  wallet: any,
  networkId: string = NETWORK_ID
): Promise<ConnectedSession> {
  // Connect to the specified network — prompts user for authorization
  const api = await wallet.connect(networkId);

  // Fetch configs, unshielded, and shielded addresses in parallel
  const [config, unshieldedAddress, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  // Set the network globally
  setNetworkId(config.networkId);

  // Load ZK assets from public assets directory
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/zk/medlock', window.location.origin).toString(),
    window.fetch.bind(window)
  );

  // Smoke-test ZK asset reachability
  zkConfigProvider.getZKIR('verify_emergency_match').then(
    (zkir) => console.log('[zkConfigProvider] verify_emergency_match ZKIR ok, length:', zkir?.length),
    (err) => console.error('[zkConfigProvider] verify_emergency_match ZKIR failed:', err)
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  // Custom proof provider wrapper passing cost model
  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const result = await api.submitTransaction(txHex);
      if (typeof result === 'string' && result) return result;
      if (result?.transactionId) return result.transactionId;
      if (result?.id) return result.id;
      return txHex.slice(0, 64);
    },
  };

  const publicDataProvider = createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri);
  const privateStateProvider = createPrivateStateProvider();

  return {
    api,
    config,
    providers: {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}

const witnesses = {
  adminSecretKey: (context: any) => [
    context.privateState,
    context.privateState.adminSecretKey || new Uint8Array(32),
  ],
  patientBloodType: (context: any) => [
    context.privateState,
    context.privateState.patientBloodType || new Uint8Array(32),
  ],
  patientConsent: (context: any) => [
    context.privateState,
    context.privateState.patientConsent !== undefined ? context.privateState.patientConsent : false,
  ],
  patientSerologyClean: (context: any) => [
    context.privateState,
    context.privateState.patientSerologyClean !== undefined ? context.privateState.patientSerologyClean : false,
  ],
  doctorSecretKey: (context: any) => [
    context.privateState,
    context.privateState.doctorSecretKey || new Uint8Array(32),
  ],
  attestationNonce: (context: any) => [
    context.privateState,
    context.privateState.attestationNonce || new Uint8Array(32),
  ],
  findDoctorPath: (context: any, leaf: Uint8Array) => {
    const path = context.ledger.authorizedDoctors.findPathForLeaf(leaf);
    if (!path) {
      // Fallback/dummy path of depth 16 if the doctor is not found in the ledger tree yet
      return [
        context.privateState,
        {
          leaf,
          path: Array.from({ length: 16 }, () => ({
            sibling: { field: 0n },
            goes_left: true,
          })),
        },
      ];
    }
    return [context.privateState, path];
  },
};

export const MEDLOCK_PRIVATE_STATE_ID = 'medlockPrivateState' as const;

/**
 * Compile/cache contract handle for deploy/call.
 */
function getCompiledContract() {
  return CompiledContract.make('medlock', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets('/zk/medlock')
  ) as any;
}

/**
 * Real deployment flow (low-level with private state persistence).
 */
export async function deployMedLockContract(
  session: ConnectedSession,
  constructorArgs: any[],
  initialPrivateStateData: any
): Promise<string> {
  const compiledContract = getCompiledContract();

  // Seed the privateStateProvider with the initial witness values
  await session.providers.privateStateProvider.set(MEDLOCK_PRIVATE_STATE_ID, initialPrivateStateData);

  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    {
      compiledContract,
      args: constructorArgs,
      signingKey: sampleSigningKey(),
      privateStateId: MEDLOCK_PRIVATE_STATE_ID,
    }
  );

  const contractAddress = deployTxData.public.contractAddress;

  await submitTxAsync(session.providers, {
    unprovenTx: deployTxData.private.unprovenTx,
    privateStateId: MEDLOCK_PRIVATE_STATE_ID,
  } as any);

  // Store contract address and signing keys
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);

  console.log('[MedLock] Contract deployed to:', contractAddress);

  // Poll indexer until it is indexed
  await waitForContractDeployment(session.providers.publicDataProvider, contractAddress);
  return contractAddress;
}

/**
 * Real circuit invocation flow.
 */
export async function callCircuit(
  session: ConnectedSession,
  contractAddress: string,
  circuitId: string,
  args: any[],
  updatedPrivateStateData?: any
): Promise<string> {
  const compiledContract = getCompiledContract();

  // Set the scope address on privateStateProvider
  await session.providers.privateStateProvider.setContractAddress(contractAddress);

  if (updatedPrivateStateData) {
    // Retrieve current private state, merge with updates, and save
    const currentState = await session.providers.privateStateProvider.get(MEDLOCK_PRIVATE_STATE_ID) || {};
    const newState = { ...(currentState as any), ...updatedPrivateStateData };
    await session.providers.privateStateProvider.set(MEDLOCK_PRIVATE_STATE_ID, newState);
  }

  const callTxData = await createUnprovenCallTx(session.providers, {
    compiledContract,
    contractAddress,
    circuitId,
    args,
    privateStateId: MEDLOCK_PRIVATE_STATE_ID,
  });

  const txId = await submitTxAsync(session.providers, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId,
    privateStateId: MEDLOCK_PRIVATE_STATE_ID,
  } as any);

  console.log(`[MedLock] Circuit ${circuitId} invoked. Tx ID:`, txId);
  return txId;
}

/**
 * In-memory Private State Provider.
 */
export function createPrivateStateProvider() {
  let scope = '';
  const stateStore = new Map<string, unknown>();
  const signingKeyStore = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;

  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, state: unknown) { stateStore.set(key(id), state); },
    async get(id: string) { return stateStore.get(key(id)) ?? null; },
    async remove(id: string) { stateStore.delete(key(id)); },
    async clear() { stateStore.clear(); },
    async setSigningKey(addr: string, k: unknown) { signingKeyStore.set(addr, k); },
    async getSigningKey(addr: string) { return signingKeyStore.get(addr) ?? null; },
    async removeSigningKey(addr: string) { signingKeyStore.delete(addr); },
    async clearSigningKeys() { signingKeyStore.clear(); },
    async exportPrivateStates(): Promise<never> { throw new Error('Not implemented.'); },
    async importPrivateStates(): Promise<never> { throw new Error('Not implemented.'); },
    async exportSigningKeys(): Promise<never> { throw new Error('Not implemented.'); },
    async importSigningKeys(): Promise<never> { throw new Error('Not implemented.'); },
  };
}

/**
 * Indexer Patched Public Data Provider (to avoid the offset: null bug).
 */
export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);

  async function queryLatest(query: string, address: string) {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);

      const action = await queryLatest(`
        query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`, contractAddress);
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
    async queryZSwapAndContractState(contractAddress: string, config?: any) {
      if (config) return base.queryZSwapAndContractState(contractAddress, config);

      const action = await queryLatest(`
        query LATEST_BOTH_STATE($address: HexEncoded!) {
          contractAction(address: $address) {
            state
            zswapState
            transaction { block { ledgerParameters } }
          }
        }`, contractAddress);

      if (!action?.zswapState) return null;
      return [
        ZswapChainState.deserialize(fromHex(action.zswapState)),
        ContractState.deserialize(fromHex(action.state)),
        action.transaction?.block?.ledgerParameters
          ? LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
          : LedgerParameters.initialParameters(),
      ] as any;
    },
  };
}

/**
 * Wait until a newly deployed contract appears in the indexer.
 */
export async function waitForContractDeployment(
  publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>,
  contractAddress: string,
  pollIntervalMs = 2000,
  maxAttempts = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await publicDataProvider.queryContractState(contractAddress);
    if (state?.data) return;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  throw new Error(`Contract not indexed after ${maxAttempts * pollIntervalMs}ms — check address or indexer lag`);
}

/**
 * Hex converters.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string from wallet.');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

import { ContractState } from '@midnight-ntwrk/compact-runtime';
import {
  createUnprovenDeployTx,
  submitTxAsync,
  submitCallTxAsync
} from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract as MedLockContract, ledger as medlockLedger } from '../managed/medlock';
import { CostModel, Transaction } from '@midnight-ntwrk/ledger-v8';

export const NETWORK_ID = 'undeployed';
export const PRIVATE_STATE_ID = 'medlock_private_state';
export const ZK_ASSET_PATH = '/zk/medlock';

export interface MedLockPrivateState {
  adminSecretKey: Uint8Array;
  patientBloodType: Uint8Array;
  patientConsent: boolean;
  patientSerologyClean: boolean;
  doctorSecretKey: Uint8Array;
  attestationNonce: Uint8Array;
}

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: { proveTx: (unprovenTx: any) => Promise<any> };
    walletProvider: any;
    midnightProvider: any;
  };
  unshieldedAddress: string;
  coinPublicKeyBytes: Uint8Array;
};

// Hex helpers
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

export function padStringTo32Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  bytes.set(encoded.slice(0, 32));
  return bytes;
}

function coinPublicKeyToBytes(pk: unknown): Uint8Array {
  if (pk instanceof Uint8Array) return pk.length === 32 ? pk : pk.slice(0, 32);
  if (typeof pk === 'string') {
    const hex = pk.startsWith('0x') ? pk.slice(2) : pk;
    if (hex.length === 64 && /^[0-9a-fA-F]+$/.test(hex)) return fromHex(hex);
    return new Uint8Array(32);
  }
  if (Array.isArray(pk)) return new Uint8Array(pk.length >= 32 ? pk.slice(0, 32) : [...pk, ...new Uint8Array(32 - pk.length)]);
  if (pk && typeof pk === 'object' && 'bytes' in (pk as any)) return coinPublicKeyToBytes((pk as any).bytes);
  return new Uint8Array(32);
}

/**
 * Synchronously detect a Midnight wallet extension injected on window.midnight.
 * Must be checked synchronously within user click events to preserve User Activation Context.
 */
export function getAvailableWalletSync(): any | null {
  const injected = (window as any).midnight;
  if (!injected) return null;

  // 1AM wallet (primary)
  if (injected['1am']) return injected['1am'];
  // Lace wallet injects as 'mnLace' or 'lace'
  if (injected['mnLace']) return injected['mnLace'];
  if (injected['lace']) return injected['lace'];
  if (injected['mn-wallet']) return injected['mn-wallet'];

  // Fallback: try any injected wallet
  const wallets = Object.values(injected);
  return wallets.length > 0 ? wallets[0] : null;
}

/**
 * Detect a Midnight wallet extension injected on window.midnight.
 */
export async function detectWallet(): Promise<any | null> {
  const syncWallet = getAvailableWalletSync();
  if (syncWallet) return syncWallet;

  let attempts = 0;
  return new Promise((resolve) => {
    const check = () => {
      const wallet = getAvailableWalletSync();
      if (wallet) {
        resolve(wallet);
        return;
      }
      if (++attempts >= 30) {
        resolve(null);
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });
}

/**
 * Helper: race a promise against a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label} no respondió en ${Math.round(ms / 1000)}s. Abre la extensión manualmente.`)), ms)
    ),
  ]);
}

/**
 * Try a single connect method (connect or enable) with a given network parameter.
 * Returns the API object or null if it failed.
 */
async function tryConnect(wallet: any, method: string, network?: string): Promise<any | null> {
  if (typeof wallet[method] !== 'function') return null;
  try {
    const api = network !== undefined
      ? await withTimeout(wallet[method](network), 30000, `wallet.${method}('${network}')`)
      : await withTimeout(wallet[method](), 30000, `wallet.${method}()`);
    if (api) return api;
  } catch (e: any) {
    console.log(`[MedLock] wallet.${method}(${network ?? ''}) →`, e?.message || e);
  }
  return null;
}

/**
 * Connect to a Midnight wallet and build the connected session.
 * Tries multiple strategies: connect() → enable() → connect(network) → enable(network)
 */
export async function connectWallet(
  wallet: any,
  preferredNetwork: string = 'preprod'
): Promise<{ address: string; walletName: string; networkId: string; session: ConnectedSession }> {
  let connectedApi: any;
  let activeNetwork = preferredNetwork;

  // Strategy 1: Parameterless connect / enable (Lace prefers this)
  connectedApi = await tryConnect(wallet, 'connect');
  if (!connectedApi) connectedApi = await tryConnect(wallet, 'enable');

  // Strategy 2: With network ID parameter
  if (!connectedApi) {
    const networksToTry = [preferredNetwork, 'preprod', 'preview', 'undeployed', 'mainnet'].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    for (const net of networksToTry) {
      connectedApi = await tryConnect(wallet, 'connect', net);
      if (connectedApi) { activeNetwork = net; break; }
      connectedApi = await tryConnect(wallet, 'enable', net);
      if (connectedApi) { activeNetwork = net; break; }
    }
  }

  if (!connectedApi) {
    throw new Error('No se pudo conectar. Asegúrate de que tu extensión Lace/1AM esté desbloqueada y en la red correcta.');
  }

  const session = await createConnectedSession(connectedApi);
  return {
    address: session.unshieldedAddress,
    walletName: wallet.name || 'Midnight Wallet',
    networkId: activeNetwork,
    session
  };
}

/**
 * Initialize all providers for a connected session.
 */
export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, rawUnshielded, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  const unshieldedAddress = typeof rawUnshielded === 'string'
    ? rawUnshielded
    : (rawUnshielded?.unshieldedAddress || String(rawUnshielded));

  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL(ZK_ASSET_PATH, window.location.origin).toString(),
    window.fetch.bind(window)
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any) {
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: any = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: any = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const result = await api.submitTransaction(txHex);
      if (typeof result === 'string' && result) return result;
      if (result?.transactionId) return result.transactionId;
      if (result?.id) return result.id;
      return txHex.slice(0, 64);
    },
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress,
    coinPublicKeyBytes: coinPublicKeyToBytes(shieldedAddress.shieldedCoinPublicKey),
  };
}

// Patched Public Data Provider to bypass GraphQL offset: null bug
export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);
  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);
      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
            contractAction(address: $address) { state }
          }`,
          variables: { address: contractAddress },
        }),
      });
      if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
      const payload = await res.json();
      if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
      const action = payload.data?.contractAction ?? null;
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
  };
}

// In-Memory Private State Provider
export function createPrivateStateProvider() {
  let scope = '';
  const stateStore = new Map<string, unknown>();
  const signingKeyStore = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;
  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, state: unknown) { stateStore.set(key(id), state); },
    async get(id: string) { return stateStore.get(key(id)) ?? null; },
    async remove(id: string) { stateStore.set(key(id), null); },
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

// Witnesses mapping
export const medlockWitnesses = {
  adminSecretKey: (context: any) => [context.privateState, context.privateState.adminSecretKey || new Uint8Array(32)] as [any, Uint8Array],
  patientBloodType: (context: any) => [context.privateState, context.privateState.patientBloodType || new Uint8Array(32)] as [any, Uint8Array],
  patientConsent: (context: any) => [context.privateState, context.privateState.patientConsent ?? false] as [any, boolean],
  patientSerologyClean: (context: any) => [context.privateState, context.privateState.patientSerologyClean ?? false] as [any, boolean],
  doctorSecretKey: (context: any) => [context.privateState, context.privateState.doctorSecretKey || new Uint8Array(32)] as [any, Uint8Array],
  attestationNonce: (context: any) => [context.privateState, context.privateState.attestationNonce || new Uint8Array(32)] as [any, Uint8Array],
  findDoctorPath: (context: any, leaf: Uint8Array) => {
    const path = context.ledger.authorizedDoctors.findPathForLeaf(leaf);
    if (!path) {
      throw new Error(`Doctor path not found for public key ${toHex(leaf)}`);
    }
    return [context.privateState, path] as [any, any];
  }
};

function getCompiledContract() {
  return CompiledContract.make('medlock', MedLockContract).pipe(
    CompiledContract.withWitnesses(medlockWitnesses),
    CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
  ) as any;
}

// Derives a public key using the internal helper on the contract instance
export function deriveDoctorPublicKey(doctorSecretKey: Uint8Array): Uint8Array {
  const instance = new MedLockContract(medlockWitnesses);
  return (instance as any)._derivePublicKey_0(doctorSecretKey);
}

/**
 * Deploys the MedLock contract.
 */
export async function deployMedLockContract(
  session: ConnectedSession,
  adminSecretKey: Uint8Array
): Promise<string> {
  const compiledContract = getCompiledContract();
  const initialPrivateState: MedLockPrivateState = {
    adminSecretKey,
    patientBloodType: new Uint8Array(32),
    patientConsent: false,
    patientSerologyClean: false,
    doctorSecretKey: new Uint8Array(32),
    attestationNonce: new Uint8Array(32)
  };

  const deployTxData = await (createUnprovenDeployTx as any)(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    { compiledContract, args: [], privateStateId: PRIVATE_STATE_ID, initialPrivateState, signingKey: sampleSigningKey() },
  );

  const contractAddress = deployTxData.public.contractAddress;
  await (submitTxAsync as any)(session.providers, { unprovenTx: deployTxData.private.unprovenTx });

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);

  return contractAddress;
}

/**
 * Registers an authorized doctor to the contract.
 */
export async function addAuthorizedDoctor(
  session: ConnectedSession,
  contractAddress: string,
  adminSecretKey: Uint8Array,
  doctorSecretKey: Uint8Array
): Promise<string> {
  // Update admin private state so it can be verified in the circuit
  const currentState = (await session.providers.privateStateProvider.get(PRIVATE_STATE_ID)) as MedLockPrivateState || {};
  const updatedPrivateState = {
    ...currentState,
    adminSecretKey
  };

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, updatedPrivateState);

  // Derive the doctor commitment (doctorPk)
  const doctorCommitment = deriveDoctorPublicKey(doctorSecretKey);

  const txData = await (submitCallTxAsync as any)(session.providers, {
    compiledContract: getCompiledContract(),
    contractAddress,
    circuitId: 'add_authorized_doctor',
    args: [doctorCommitment],
    privateStateId: PRIVATE_STATE_ID,
  });

  return txData.public.txHash || '';
}

/**
 * Triggers zero-knowledge verification for emergency matching.
 */
export async function verifyEmergencyMatch(
  session: ConnectedSession,
  contractAddress: string,
  patientBloodType: string,
  patientConsent: boolean,
  patientSerologyClean: boolean,
  doctorSecretKey: Uint8Array,
  requiredBloodType: string
): Promise<{ success: boolean; txHash: string; nullifier: string }> {
  const patientBloodTypeBytes = padStringTo32Bytes(patientBloodType);
  const requiredBloodTypeBytes = padStringTo32Bytes(requiredBloodType);
  
  // Random nonce for nullifier
  const attestationNonce = window.crypto.getRandomValues(new Uint8Array(32));

  // Set all private state values for the witnesses
  const currentState = (await session.providers.privateStateProvider.get(PRIVATE_STATE_ID)) as MedLockPrivateState || {};
  const updatedPrivateState: MedLockPrivateState = {
    ...currentState,
    patientBloodType: patientBloodTypeBytes,
    patientConsent,
    patientSerologyClean,
    doctorSecretKey,
    attestationNonce
  };

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, updatedPrivateState);

  // Submit the transaction to run the verification circuit
  const txData = await (submitCallTxAsync as any)(session.providers, {
    compiledContract: getCompiledContract(),
    contractAddress,
    circuitId: 'verify_emergency_match',
    args: [requiredBloodTypeBytes],
    privateStateId: PRIVATE_STATE_ID,
  });

  // Calculate the nullifier that will be on-chain to show the user
  const instance = new MedLockContract(medlockWitnesses);
  const nullifierBytes = (instance as any)._makeNullifier_0(doctorSecretKey, attestationNonce);

  return {
    success: true, // If submitCallTxAsync succeeds, it didn't throw (so criteria matched!)
    txHash: txData.public.txHash || '',
    nullifier: '0x' + toHex(nullifierBytes)
  };
}

/**
 * Polls the indexer for contract ledger data.
 */
export async function fetchMedLockLedger(
  session: ConnectedSession,
  contractAddress: string
): Promise<{ verificationCount: bigint; admin: string } | null> {
  const contractState = await session.providers.publicDataProvider.queryContractState(contractAddress);
  if (!contractState?.data) return null;
  
  const currentLedger = medlockLedger(contractState.data);
  return {
    verificationCount: currentLedger.verificationCount,
    admin: '0x' + toHex(currentLedger.admin)
  };
}

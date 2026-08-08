# MedLock — Sovereign Health Vault & ZK Verification Specification

This document provides a complete, structured, and machine-readable specification of the MedLock decentralized application (dApp). It is designed to be parsed by AI models, developers, or system architects to understand the exact data flows, cryptographic circuits, state variables, and component interfaces of the protocol.

---

## 1. Executive Summary

**MedLock** is a privacy-preserving emergency medical access protocol built on the **Midnight Network** (a zero-knowledge Cardano Partnerchain). It solves the critical tension between medical emergency access and patient data privacy:
- **The Problem**: In emergencies, medical staff need instant access to critical patient data (e.g., blood type, allergies, serology). Current systems either store this data in centralized, vulnerable databases or expose it publicly on blockchained ledgers.
- **The Solution**: MedLock stores patient data encrypted locally on the patient's device (Local-First). During emergencies, an authorized doctor can run a local Zero-Knowledge Proof (ZKP) verification query. The patient's device generates a ZKP proving blood compatibility, active consent, and doctor accreditation status. Only a boolean validation (`MATCH` / `NO MATCH`) and an anonymous transaction nullifier are written to the blockchain. **Zero raw clinical data is ever exposed, uploaded, or leaked on-chain or off-chain.**

---

## 2. Technical Architecture Overview

The system consists of three architectural layers:

```
┌────────────────────────────────────────────────────────┐
│                  FRONTEND (Client)                     │
│  - React 19 + TypeScript + Vite                        │
│  - Web Crypto API (AES-GCM 256-bit Local Encryption)   │
│  - Midnight.js SDK & DApp Connector (1AM / Lace)       │
└───────────────────────┬────────────────────────────────┘
                        │ Off-chain proofs (ZKP)
                        ▼
┌────────────────────────────────────────────────────────┐
│             DOCKER STACK (Local Proving)               │
│  - Midnight Proof Server (Client-side prover daemon)   │
└───────────────────────┬────────────────────────────────┘
                        │ Submits transaction
                        ▼
┌────────────────────────────────────────────────────────┐
│              MIDNIGHT BLOCKCHAIN (Ledger)              │
│  - Compact Smart Contract State Management             │
│  - On-chain Public State (Doctor Merkle Root, Set)      │
│  - On-chain Private State (Transaction Nullifiers)     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic State & Data Registry

### 3.1 Patient Data Visibility Matrix

| Data Field | Storage Location | Security Protocol | Exposure Level |
|:---|:---|:---|:---|
| **Patient Name / DNI** | Local Storage only | Encrypted | Never leaves device |
| **Blood Type & HLA** | Local Storage / ZK Witness | Encrypted | Proved inside ZK circuit; Never revealed |
| **Serology Status** | Local Storage / ZK Witness | Encrypted | Proved inside ZK circuit; Never revealed |
| **Donation Consent** | Local Storage / ZK Witness | Encrypted | Proved inside ZK circuit; Never revealed |
| **Doctor Attestation** | Local Storage / Merkle Proof | Cleartext JSON | Transmitted to Prover to verify credential root |
| **Doctor Accreditation** | Smart Contract State | Public Merkle Root | Verified cryptographically inside ZK circuit |
| **Revocation List** | Smart Contract State | Public `Set` | Verified inside ZK circuit to invalidate keys |
| **Nullifier Hash** | Smart Contract Ledger | Public SHA-256 Hash | Prevent double-submit / replay on-chain |

---

## 4. Smart Contract Specification (`medlock.compact`)

The smart contract is written in **Compact**, Midnight's zero-knowledge contract language.

### 4.1 On-Chain State Registers
- `doctorMerkleRoot: Cell<Hash>`: The root hash of the Merkle Tree containing public keys of all globally accredited doctors.
- `revokedDoctors: Set<Bytes<32>>`: A set containing the commitments (hashed public keys) of doctors whose access has been revoked by the administrator.

### 4.2 Circuit Definitions (ZK Functions)

#### A. `revoke_doctor` (Administrative circuit)
- **Input**: `doctorCommitment: Bytes<32>` (SHA-256 commitment of the doctor's public key).
- **Execution**: Inserts the commitment into the `revokedDoctors` set.
- **State Impact**: Updates the on-chain revoked set.

#### B. `verify_emergency_match` (Verification circuit)
- **Inputs (Public)**:
  - `requiredBloodType: Bytes<2>` (e.g., "O-")
  - `doctorPk: Bytes<32>` (Public key of the emergency doctor querying the data)
- **Inputs (Private / Witnesses)**:
  - `patientBloodType: Bytes<2>`
  - `patientSerologyClean: Boolean`
  - `patientConsents: GranularConsentConfig`
  - `doctorMerkleProof: MerkleProof` (Cryptographic proof that `doctorPk` belongs to the accredited `doctorMerkleRoot`)
- **Circuit Assertions (ZK Rules)**:
  1. **Accreditation Check**: Asserts that `doctorMerkleProof` resolves to the current on-chain `doctorMerkleRoot`.
  2. **Revocation Check**: Asserts that `doctorPk` is **NOT** a member of the on-chain `revokedDoctors` set.
  3. **Consent Check**: Asserts that the patient's `emergencyMatching` consent is set to `true` and the expiration timestamp is valid.
  4. **Blood Compatibility Check**: Evaluates if `patientBloodType` is compatible with `requiredBloodType` using a Boolean matrix.
  5. **Nullifier Generation**: Computes a unique nullifier hash `Hash(patientSecret + epoch)` to prevent replay attacks.
- **Output**: Returns a boolean `MATCH_SUCCESS` / `MATCH_FAILED` and publishes the nullifier on-chain.

---

## 5. Frontend & Component Specifications

### 5.1 Local Cryptographic Vault (`PatientVault.tsx`)
- **Purpose**: Encrypts and manages the patient's private medical card and granular consents locally.
- **State Derivation**:
  - Checks if the Midnight wallet (Lace / 1AM) is connected.
  - If disconnected: Locks the screen, displaying a glassmorphic shield UI indicating data is safely encrypted.
  - If connected: Uses the wallet's address/signature as a seed to derive a 256-bit symmetric key.
- **Encryption Algorithm**:
  - **Secure Context (Localhost/HTTPS)**: AES-GCM (256-bit) using Web Crypto API.
  - **Non-Secure Context (Local LAN/IP Testing)**: Automatic fallback to a pure JavaScript SHA-256 key-derivation and stream XOR cipher to avoid browser sandbox crashes.

### 5.2 Interactive ZK Proof Visualizer (`ZKProofVisualizer.tsx`)
- **Purpose**: Displays the status of client-side ZK proof compilation to the emergency responder.
- **Pipeline States**:
  1. **Witness Extraction (25% progress)**: Fetches encrypted consents and decrypts them. Resolves the doctor's Merkle Proof paths.
  2. **State Sanitization (50% progress)**: Masks raw medical values, preparing the public inputs for the ZK compiler.
  3. **Proof Generation (75% progress)**: Relays compiling data to the client's local Midnight Proof Server (`http://localhost:31801`) to generate the mathematical ZKP.
  4. **Nullifier Resolution (100% progress)**: Publishes the generated verification transaction to the Midnight blockchain.

### 5.3 Doctor Directory & Administrative Console (`DoctorDirectory.tsx`)
- **Purpose**: Allows hospital administrators to add accredited doctor keys to the Merkle Tree or revoke them on-chain.
- **Revocation Logic**:
  - Fetches the doctor's public key.
  - Calls `revokeAuthorizedDoctor()` from the contract hooks.
  - Triggers the Compact circuit `revoke_doctor`, writing the key to the public `revokedDoctors` ledger.

### 5.4 ZK Audit Timeline Ledger (`AuditTimeline.tsx`)
- **Purpose**: Provides a tamper-proof cryptographical history log of emergency access events.
- **Data Log Fields**:
  - `timestamp`: Relative date/time of access.
  - `eventType`: `Verification` / `Accreditation` / `Revocation`.
  - `txHash`: Truncated hash of the on-chain transaction.
  - `blockNumber`: Midnight blockchain block height.
  - `nullifier`: Verification nullifier proving compliance.

---

## 6. End-to-End Technical Data Flow

The following sequence details how an emergency query is executed:

```
[ER Doctor Page]                  [Patient Vault]               [Proof Server]             [Midnight Ledger]
       │                                 │                             │                           │
       │ 1. Request Match (O-)           │                             │                           │
       ├────────────────────────────────>│                             │                           │
       │                                 │ 2. Check Wallet Connected   │                           │
       │                                 │ 3. Decrypt consents & HLA   │                           │
       │                                 │                             │                           │
       │                                 │ 4. Send witnesses & inputs  │                           │
       │                                 ├────────────────────────────>│                           │
       │                                 │                             │ 5. Compile ZK Proof       │
       │                                 │                             │    - Verify signature     │
       │                                 │                             │    - Verify non-revocation│
       │                                 │                             │    - Evaluate blood matrix│
       │                                 │                             │                           │
       │                                 │                             │ 6. Send ZKP Transaction   │
       │                                 │                             ├──────────────────────────>│
       │                                 │                             │                           │ 7. Verify Proof
       │                                 │                             │                           │ 8. Record Nullifier
       │                                 │ 9. Return Boolean Match     │                           │
       │<────────────────────────────────┼─────────────────────────────┼───────────────────────────┤
       │                                 │                             │                           │
```

1. **Query Trigger**: The ER Doctor scans the patient's NFC/QR emergency passport. The portal requests a match verification for "O-" blood.
2. **Decryption**: The patient's local vault detects the session, derives the AES-GCM key, and decrypts the consents and blood type.
3. **ZKP Compile**: The patient's browser calls the Midnight Proof Server, supplying the doctor's credentials, the patient's parameters as witnesses, and the required blood type.
4. **On-Chain Assertion**: The Midnight blockchain evaluates the proof, checks that the doctor is not revoked on-chain, verifies the proof matches the authorized Merkle root, records the nullifier, and returns a transaction success token.
5. **Match Resolution**: The ER portal receives the success token and displays `COMPATIBLE` / `INCOMPATIBLE`. Raw medical details never leave the patient's device.

---

## 7. Build and Compilation Guide

### 7.1 Smart Contract Compilation
```bash
cd contract
compact compile src/medlock.compact build
```

### 7.2 Bindings Distribution
To update the DApp with compiled contract assets, the following directories must be synced:
- Copy TS bindings: `cp -R build/managed/medlock ../dapp/src/managed/`
- Copy Prover ZKIR binaries: `cp -R build/zkdir/medlock/* ../dapp/public/zk/medlock/`

### 7.3 Frontend Compilation & Optimization
```bash
cd dapp
npm install
npm run build
```
- Vite compiles and outputs chunks. The Ledger WASM engines (`@midnight-ntwrk/ledger-v8`) are loaded statically to avoid Vite WASM prototype mismatch errors.

# MedLock — Sovereign Health Vault & ZK Verification Protocol

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Midnight Network](https://img.shields.io/badge/Built_on-Midnight_Network-purple.svg)](https://midnight.network)

> 💡 **¿Buscando el Pitch de presentación?** Hemos preparado un documento exclusivo con la visión, los puntos fuertes y un **speech ganador de 2 minutos** para el hackathon. Léelo aquí: **[PITCH.md](file:///c:/Users/Denis/Desktop/medlock_hackathon/PITCH.md)**.

**MedLock** is a privacy-preserving medical data verification protocol built on [Midnight Network](https://midnight.network). It enables zero-knowledge verification of patient medical credentials (blood type, serology, organ donation consent) without revealing any raw personal or clinical data.

---

### 🚀 Fortalezas Clave (Highlights)

* **Privacidad Absoluta (ZK-Native):** Cero datos de salud en la blockchain. La información médica (como tu grupo sanguíneo o serología) nunca sale de tu dispositivo. La blockchain solo registra el resultado booleano (`SÍ` o `NO`).
* **Verificación de Autoridad Ciega:** Valida que una credencial fue firmada por un médico certificado mediante pruebas de Merkle Trees, sin revelar la identidad del médico que emitió la firma.
* **Pruebas en el Cliente (Client-Side Proving):** La prueba de conocimiento cero se computa localmente en el navegador, protegiendo tus datos de ataques de red.
* **Control Soberano:** El paciente decide qué activar, cuándo y quién puede verificar su información de compatibilidad.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              CLIENT / WALLET (Off-Chain)                 │
│                                                         │
│  [PATIENT VAULT]              [DOCTOR PORTAL]           │
│  - DNI / Identity             - Issue Attestations      │
│  - Blood Type & HLA           - Sign Medical Records    │
│  - Serology / Diagnoses       - Emergency ZK Scanner    │
│  - Privacy Consent Toggles                              │
│                                                         │
│              ↓ witness functions ↓                       │
│         [COMPACT ZK CIRCUIT]                            │
│         Computes ZKP locally in browser                 │
└─────────────────────┬───────────────────────────────────┘
                      │  Zero-Knowledge Proofs only
                      ▼
┌─────────────────────────────────────────────────────────┐
│              MIDNIGHT LEDGER (On-Chain)                  │
│                                                         │
│  [PUBLIC STATE]                [PROTECTED STATE]         │
│  - Authorized Doctors Root    - Nullifiers              │
│  - Revoked Doctors Set (Real) - Credential Commitments  │
│  - Verification Keys          - Validated Proof Log     │
└─────────────────────────────────────────────────────────┘
```

### What's Private vs. Public

| Data | Location | Visibility / Security |
|------|----------|-----------------------|
| Patient Name / DNI | Wallet only | Never leaves device |
| Blood Type & HLA | Encrypted Local Vault | **AES-GCM (256-bit)**, decrypted only with active Wallet |
| Serology Status | Encrypted Local Vault | **AES-GCM (256-bit)**, decrypted only with active Wallet |
| Donation Consent | Encrypted Local Vault | **AES-GCM (256-bit)**, decrypted only with active Wallet |
| Doctor Attestation | Wallet + Signature | Verified via Merkle proof |
| Authorized Doctors Root | On-chain (public) | Merkle root of accredited providers |
| Revoked Doctors List | On-chain (public) | Set of revoked doctor commitments preventing match verification |
| Verification Result | On-chain (public) | Boolean match (true/false) only |
| Nullifier | On-chain (public) | Anonymous hash preventing reuse |

## Core Cryptographic & Visual Features

### 🔒 Sovereign Local Vault (AES-GCM 256-bit)
To avoid plaintext exposure in the browser, the patient's local credentials, blood profile, and granular consents are encrypted on-the-fly using industrial-grade **AES-GCM (256-bit)**. 
- The decryption key is derived cryptographically from the connected Midnight Wallet address/signature.
- **Disconnected Lock**: Hides and locks the vault when the wallet is disconnected.
- **Local Network Fallback**: Automatically falls back to a pure JS SHA-256 and stream cipher when accessed over non-secure contexts (e.g., local IPs `192.168.x.x` without HTTPS) to ensure smooth multi-device testing.

### 🚫 On-Chain Doctor Revocation
Implements a real administrative revocation circuit on the blockchain. 
- Admins can submit a doctor's public key commitment to the on-chain `revokedDoctors` `Set`.
- The ZK circuit `verify_emergency_match` asserts that the validating doctor's credentials are not present in this revoked set.
- A revoked doctor's ZK proof generation will instantly fail mathematically on-device, blocking access to data.

### 📊 Interactive ZK Proof Visualizer
A real-time progress monitor inside the Emergency Scanner that visualizes the four critical phases of ZK proof generation:
1. **Witness Generation** (reading off-chain consents/attestations)
2. **State Sanitization** (masking private patient data)
3. **Midnight Proof Server Communication** (generating the ZKP)
4. **On-Chain Nullifier Publishing** (preventing transaction replay)

### 📁 ZK Audit Ledger
A persistent timeline log that tracks emergency access attempts, publishing block numbers, truncated verification hashes, and proof nullifiers to demonstrate compliance and auditing capabilities.

---

## Project Structure

```
medlock/
├── contract/                       # Compact Smart Contract
│   └── src/
│       └── medlock.compact         # ZK verification circuit
├── dapp/                           # React Frontend + Midnight.js
│   ├── src/
│   │   ├── api/                    # Cifrado (AES-GCM) & Midnight SDK
│   │   ├── components/             # React UI components (Visualizer, Directory, Vault)
│   │   ├── contexts/               # Wallet connection hooks
│   │   ├── hooks/                  # Contract interaction hooks
│   │   └── pages/                  # Route views (Emergency, Doctor, Home)
│   └── public/
│       └── zk/medlock/             # ZK proving assets (ZKIR, keys)
├── docker-compose.yml              # Local devnet + proof server
├── LICENSE                         # Apache 2.0
└── README.md                       # This file
```

## Tech Stack

- **Smart Contracts**: [Compact](https://docs.midnight.network/compact) (Midnight's ZK circuit language)
- **Blockchain**: [Midnight Network](https://midnight.network) (preprod / local devnet)
- **Frontend**: React 19 + TypeScript + Vite
- **Wallet**: 1AM / Lace via DApp Connector API
- **SDK**: `@midnight-ntwrk/midnight-js-*` packages
- **Styling**: Vanilla CSS (Apple-inspired glassmorphism & premium UI design system)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local proof server)
- Compact compiler (`compact` version `0.5.x`) — [installation guide](https://docs.midnight.network)
- 1AM or Lace wallet browser extension

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/luchoxiii/medlock_hackathon.git
cd medlock_hackathon
```

### 2. Compile the Smart Contract
Compile the Compact contract and generate the cryptographic artifacts:

```bash
cd contract
# Compile using Compact 0.5.1
compact compile src/medlock.compact build
```

Then, copy the generated TS/JS files and ZKIR binaries into the DApp directory structure:
```bash
# Copy contract bindings
cp -R build/managed/medlock ../dapp/src/managed/
# Copy ZK proving assets
cp -R build/zkdir/medlock/* ../dapp/public/zk/medlock/
```

### 3. Start the Proof Server & Devnet

```bash
cd ..
docker-compose up -d
```

### 4. Run the Frontend

```bash
cd dapp
npm install
npm run dev
```

Open `http://localhost:5173` (or the local network IP) to connect your wallet, decrypt your vault, register/revoke doctors, and run emergency scanners.

## ZK Verification Flow

1. **Patient** inputs medical data. It is encrypted locally using AES-GCM and stored.
2. **Doctor** issues a signed attestation (validating qualifications and hospital credentials) which the patient stores encrypted.
3. **ER Scanner** requests a match on criteria (e.g. O- blood compatibility).
4. **Compact ZK Circuit** runs in the user's browser:
   - Validates the doctor's signature.
   - Assures the doctor's key is not on the on-chain Revocation list.
   - Computes blood compatibility without revealing the patient's identity.
5. **Ledger Publish**: A cryptographically verifiable transaction log and nullifier are stored on the Midnight ledger.

## License

Licensed under the [Apache License 2.0](LICENSE).

## Team

Built with ❤️ for the Midnight Network Hackathon.


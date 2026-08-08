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
│  - Verification Keys          - Credential Commitments  │
│  - ZK Query Results           - Validated Proof Log     │
└─────────────────────────────────────────────────────────┘
```

### What's Private vs. Public

| Data | Location | Visibility |
|------|----------|------------|
| Patient Name / DNI | Wallet only | Never leaves device |
| Blood Type & HLA | Witness (off-chain) | ZK proven, never revealed |
| Serology Status | Witness (off-chain) | ZK proven, never revealed |
| Donation Consent | Witness (off-chain) | ZK proven, never revealed |
| Doctor Attestation | Wallet + Signature | Verified via Merkle proof |
| Authorized Doctors Root | On-chain (public) | Merkle root of accredited providers |
| Verification Result | On-chain (public) | Boolean match (true/false) only |
| Nullifier | On-chain (public) | Anonymous hash preventing reuse |

## Project Structure

```
medlock/
├── contract/                       # Compact Smart Contract
│   └── src/
│       └── medlock.compact         # ZK verification circuit
├── dapp/                           # React Frontend + Midnight.js
│   ├── src/
│   │   ├── api/                    # Midnight SDK integration
│   │   ├── components/             # React UI components
│   │   ├── contexts/               # Wallet state management
│   │   ├── hooks/                  # React hooks
│   │   └── pages/                  # Route pages
│   └── public/
│       └── zk/medlock/             # ZK proving assets
├── docker-compose.yml              # Local dev stack
├── LICENSE                         # Apache 2.0
└── README.md                       # This file
```

## Tech Stack

- **Smart Contracts**: [Compact](https://docs.midnight.network/compact) (Midnight's ZK circuit language)
- **Blockchain**: [Midnight Network](https://midnight.network) (preprod)
- **Frontend**: React 19 + TypeScript + Vite
- **Wallet**: 1AM / Lace via DApp Connector API
- **SDK**: `@midnight-ntwrk/midnight-js-*` packages
- **Styling**: Vanilla CSS (Apple-inspired design system)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local proof server)
- Compact compiler (`compactc`) — [installation guide](https://docs.midnight.network)
- 1AM or Lace wallet browser extension

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/luchoxiii/medlock_hackathon.git
cd medlock_hackathon
```

### 2. Compile the Contract

```bash
cd contract
compactc src/medlock.compact --out-dir build
```

### 3. Start Local Proof Server

```bash
docker-compose up -d
```

### 4. Run the Frontend

```bash
cd dapp
npm install
npm run dev
```

Open `http://localhost:5173` — connect your wallet and explore the Patient Vault, Doctor Portal, and Emergency Scanner.

## ZK Verification Flow

1. **Patient** loads medical data into their local wallet (never transmitted)
2. **Doctor** issues signed attestation → patient stores it locally
3. **Hospital ER** initiates emergency match query with required criteria
4. **Compact circuit** runs locally: verifies doctor signature against Merkle tree, checks blood type compatibility, validates consent — all in zero knowledge
5. **On-chain result**: only a boolean `MATCH` / `NO MATCH` and a nullifier are published. Zero raw data exposed.

## License

Licensed under the [Apache License 2.0](LICENSE).

## Team

Built for the Midnight Network Hackathon.

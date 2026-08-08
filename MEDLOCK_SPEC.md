# MedLock — Especificación de Bóveda de Salud Soberana y Protocolo de Verificación ZK

Este documento proporciona una especificación completa, estructurada y legible por máquinas de la aplicación descentralizada (dApp) MedLock. Está diseñado para ser analizado por modelos de IA, desarrolladores o arquitectos de sistemas con el fin de comprender los flujos de datos exactos, circuitos criptográficos, variables de estado e interfaces de componentes del protocolo.

---

## 1. Resumen Ejecutivo

**MedLock** es un protocolo de acceso médico de emergencia que preserva la privacidad del paciente, construido sobre la red **Midnight Network** (una cadena asociada de Cardano que utiliza pruebas de conocimiento cero). Resuelve la tensión crítica entre el acceso de emergencia a datos médicos y la privacidad del paciente:
- **El Problema**: En emergencias, el personal médico necesita acceso instantáneo a datos clínicos vitales (ej. tipo de sangre, alergias, serología). Los sistemas actuales almacenan estos datos en bases de datos centralizadas vulnerables o los exponen públicamente en blockchains tradicionales.
- **La Solución**: MedLock almacena los datos de los pacientes cifrados localmente en su propio dispositivo (Local-First). En una emergencia, un médico acreditado puede realizar una consulta de verificación local mediante Pruebas de Conocimiento Cero (ZKP). El dispositivo del paciente genera una ZKP que demuestra la compatibilidad sanguínea, el consentimiento activo y la acreditación del médico. Únicamente una validación booleana (`MATCH` / `NO MATCH`) y un nullifier de transacción anónimo se escriben en la blockchain. **Cero datos clínicos en texto plano son expuestos, transmitidos o filtrados en la red.**

---

## 2. Resumen de la Arquitectura Técnica

El sistema se compone de tres capas arquitectónicas:

```
┌────────────────────────────────────────────────────────┐
│                  FRONTEND (Cliente)                     │
│  - React 19 + TypeScript + Vite                        │
│  - Web Crypto API (Cifrado local AES-GCM de 256 bits)  │
│  - SDK Midnight.js y DApp Connector (1AM / Lace)       │
└───────────────────────┬────────────────────────────────┘
                        │ Pruebas fuera de cadena (ZKP)
                        ▼
┌────────────────────────────────────────────────────────┐
│             DOCKER STACK (Proving Local)               │
│  - Midnight Proof Server (Servicio de pruebas cliente) │
└───────────────────────┬────────────────────────────────┘
                        │ Envío de transacción
                        ▼
┌────────────────────────────────────────────────────────┐
│              MIDNIGHT BLOCKCHAIN (Ledger)              │
│  - Gestión de estado de contrato inteligente Compact   │
│  - Estado público on-chain (Merkle Root de médicos,   │
│    Set de revocaciones)                                │
│  - Estado privado on-chain (Nullifiers de transacciones)│
└────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Estado Criptográfico y Registro de Datos

### 3.1 Matriz de Visibilidad de Datos del Paciente

| Campo de Datos | Ubicación de Almacenamiento | Protocolo de Seguridad | Nivel de Exposición |
|:---|:---|:---|:---|
| **Nombre / DNI del Paciente** | Solo en Local Storage | Cifrado | Nunca sale del dispositivo |
| **Tipo de Sangre y HLA** | Local Storage / ZK Witness | Cifrado | Probado en el circuito ZK; Nunca revelado |
| **Estatus Serológico** | Local Storage / ZK Witness | Cifrado | Probado en el circuito ZK; Nunca revelado |
| **Consentimientos de Donación**| Local Storage / ZK Witness | Cifrado | Probado en el circuito ZK; Nunca revelado |
| **Acreditación del Médico** | Local Storage / Merkle Proof | JSON plano | Enviado al Prover para validar ruta Merkle |
| **Acreditación Médica General**| Estado del Contrato | Merkle Root Público | Verificado criptográficamente en circuito ZK |
| **Lista de Revocación** | Estado del Contrato | `Set` Público | Verificado en circuito ZK para invalidar llaves |
| **Hash del Nullifier** | Registro del Contrato | Hash SHA-256 Público | Evita doble envío o replay en la blockchain |

---

## 4. Especificación del Contrato Inteligente (`medlock.compact`)

El contrato inteligente está escrito en **Compact**, el lenguaje de circuitos de conocimiento cero de Midnight.

### 4.1 Registros de Estado On-Chain
- `doctorMerkleRoot: Cell<Hash>`: Hash raíz del Árbol de Merkle que contiene las claves públicas de todos los médicos acreditados a nivel global.
- `revokedDoctors: Set<Bytes<32>>`: Un conjunto (Set) que almacena los compromisos (hashes de claves públicas) de los médicos cuyo acceso ha sido revocado por el administrador.

### 4.2 Definiciones de Circuitos (Funciones ZK)

#### A. `revoke_doctor` (Circuito administrativo)
- **Entrada**: `doctorCommitment: Bytes<32>` (Compromiso SHA-256 de la clave pública del médico).
- **Ejecución**: Inserta el compromiso en el conjunto `revokedDoctors`.
- **Impacto de Estado**: Actualiza el set de revocados en la blockchain.

#### B. `verify_emergency_match` (Circuito de verificación)
- **Entradas Públicas**:
  - `requiredBloodType: Bytes<2>` (ej. "O-")
  - `doctorPk: Bytes<32>` (Clave pública del médico de emergencias que realiza la consulta)
- **Entradas Privadas (Testigos / Witnesses)**:
  - `patientBloodType: Bytes<2>`
  - `patientSerologyClean: Boolean`
  - `patientConsents: GranularConsentConfig`
  - `doctorMerkleProof: MerkleProof` (Prueba criptográfica de que `doctorPk` pertenece a la raíz `doctorMerkleRoot`)
- **Aserciones del Circuito (Reglas ZK)**:
  1. **Validación de Acreditación**: Comprueba que la prueba `doctorMerkleProof` resuelva hacia la raíz `doctorMerkleRoot` registrada on-chain.
  2. **Validación de Revocación**: Comprueba que `doctorPk` **NO** pertenezca al conjunto on-chain `revokedDoctors`.
  3. **Validación de Consentimiento**: Comprueba que el consentimiento `emergencyMatching` del paciente sea `true` y su marca de tiempo de expiración sea válida.
  4. **Validación de Compatibilidad Sanguínea**: Evalúa si `patientBloodType` es compatible con `requiredBloodType` a través de una matriz booleana.
  5. **Generación de Nullifier**: Calcula un hash único `Hash(patientSecret + epoch)` para prevenir ataques de repetición.
- **Salida**: Retorna un booleano `MATCH_SUCCESS` / `MATCH_FAILED` y publica el nullifier en el ledger on-chain.

---

## 5. Especificación de Componentes del Frontend

### 5.1 Bóveda Criptográfica Local (`PatientVault.tsx`)
- **Propósito**: Cifra y gestiona la tarjeta médica privada del paciente y sus consentimientos granulares de forma local.
- **Derivación de Estado**:
  - Detecta si la wallet de Midnight (Lace / 1AM) está conectada.
  - Si está desconectada: Bloquea la pantalla, mostrando una interfaz de escudo de cristal indicando que los datos están cifrados de forma segura.
  - Si está conectada: Utiliza la dirección/firma de la wallet como semilla para derivar una clave simétrica de 256 bits.
- **Algoritmo de Cifrado**:
  - **Contexto Seguro (Localhost/HTTPS)**: AES-GCM (256-bit) a través de la API Web Crypto.
  - **Contexto No Seguro (Redes Locales/IPs sin HTTPS)**: Fallback automático a SHA-256 puro en JS y cifrado de flujo XOR para evitar caídas en el entorno aislado del navegador.

### 5.2 Visualizador Interactivo de Pruebas ZK (`ZKProofVisualizer.tsx`)
- **Propósito**: Muestra en tiempo real el progreso de la compilación de la prueba ZK en el dispositivo para el personal médico.
- **Fases del Pipeline**:
  1. **Extracción de Testigos (25%)**: Descifra consentimientos locales y calcula las rutas del Merkle Proof del médico.
  2. **Sanitización de Estado (50%)**: Enmascara los datos clínicos, preparando los inputs públicos del circuito ZK.
  3. **Generación de Pruebas (75%)**: Transmite los datos al Midnight Proof Server local (`http://localhost:31801`) para compilar la ZKP.
  4. **Resolución en Cadena (100%)**: Publica la transacción de verificación en la blockchain de Midnight.

### 5.3 Directorio de Médicos y Consola Administrativa (`DoctorDirectory.tsx`)
- **Propósito**: Permite a los administradores de hospitales registrar médicos autorizados en el árbol Merkle o revocar su acceso en la blockchain.
- **Lógica de Revocación**:
  - Extrae la clave pública del médico.
  - Ejecuta la función `revokeAuthorizedDoctor()` a través de los hooks del contrato.
  - Activa el circuito Compact `revoke_doctor`, escribiendo el compromiso en el ledger público de revocaciones.

### 5.4 Registro de Auditoría ZK (`AuditTimeline.tsx`)
- **Propósito**: Proporciona un registro histórico criptográfico e inalterable de los accesos de emergencia.
- **Campos Registrados**:
  - `timestamp`: Fecha/hora relativa del acceso.
  - `eventType`: `Verification` / `Accreditation` / `Revocation`.
  - `txHash`: Hash truncado de la transacción on-chain.
  - `blockNumber`: Altura de bloque en la blockchain de Midnight.
  - `nullifier`: Nullifier de la prueba ZK para auditorías de cumplimiento.

---

## 6. Flujo de Datos Técnico de Extremo a Extremo

La siguiente secuencia detalla la ejecución de una consulta de emergencia:

```
[Médico Portal]                    [Bóveda Paciente]            [Proof Server]             [Midnight Ledger]
       │                                 │                             │                           │
       │ 1. Solicitar Match (O-)         │                             │                           │
       ├────────────────────────────────>│                             │                           │
       │                                 │ 2. Detectar Wallet y Llaves │                           │
       │                                 │ 3. Descifrar perfil y HLA   │                           │
       │                                 │                             │                           │
       │                                 │ 4. Enviar testigos e inputs │                           │
       │                                 ├────────────────────────────>│                           │
       │                                 │                             │ 5. Compilar Prueba ZK     │
       │                                 │                             │    - Verificar firma      │
       │                                 │                             │    - Validar no-revocado  │
       │                                 │                             │    - Correr matriz sangre │
       │                                 │                             │                           │
       │                                 │                             │ 6. Enviar Transacción ZKP │
       │                                 │                             ├──────────────────────────>│
       │                                 │                             │                           │ 7. Validar Prueba
       │                                 │                             │                           │ 8. Guardar Nullifier
       │                                 │ 9. Retornar Boolean Match   │                           │
       │<────────────────────────────────┼─────────────────────────────┼───────────────────────────┤
       │                                 │                             │                           │
```

1. **Gatillo de Consulta**: El médico de emergencias escanea el pasaporte NFC/QR. El portal solicita una verificación de compatibilidad para sangre "O-".
2. **Descifrado**: La bóveda local del paciente detecta la sesión, deriva la clave simétrica y descifra los consentimientos y el perfil sanguíneo.
3. **Compilación de ZKP**: El navegador del paciente invoca al Midnight Proof Server local, enviando las credenciales del médico, los datos privados del paciente como testigos y el tipo de sangre requerido.
4. **Verificación On-Chain**: La blockchain de Midnight evalúa la prueba matemática, verifica que el médico no esté revocado, comprueba que pertenezca al árbol de acreditados, asienta el nullifier en el ledger y retorna el éxito de la transacción.
5. **Resolución**: El portal médico recibe la confirmación y muestra `COMPATIBLE` o `INCOMPATIBLE`. Ningún dato médico privado salió jamás del dispositivo del paciente.

---

## 7. Guía de Construcción y Compilación

### 7.1 Compilación del Contrato Inteligente
```bash
cd contract
compact compile src/medlock.compact build
```

### 7.2 Distribución de Artefactos de Compilación
Para sincronizar el Frontend con el contrato inteligente compilado:
- Copiar enlaces de TypeScript: `cp -R build/managed/medlock ../dapp/src/managed/`
- Copiar binarios ZKIR del Prover: `cp -R build/zkdir/medlock/* ../dapp/public/zk/medlock/`

### 7.3 Compilación y Optimización del Frontend
```bash
cd dapp
npm install
npm run build
```
- Vite compila los recursos estáticos. Los motores WASM del Ledger (`@midnight-ntwrk/ledger-v8`) se importan de forma estática en la cabecera para evitar inconsistencias de prototipo de WebAssembly entre dependencias.

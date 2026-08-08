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

---

## 8. Guía de Interfaz (UI) y Flujo de Prueba para Evaluadores

Esta sección describe cómo navegar por la aplicación y ejecutar una demostración completa paso a paso, explicando qué hace cada botón y qué ocurre detrás de escena en la interfaz.

### 8.1 Barra de Navegación Global (Header)
- **Logotipo de MedLock y Badges**: Muestra el nombre del protocolo y un indicador de red dinámico (`Devnet / Local / Testnet`).
- **Botón "Conectar Wallet"**:
  - **Acción**: Abre la extensión del navegador (Lace o 1AM Wallet) para autenticar al usuario.
  - **Efecto Visual**: Al conectar, el botón se transforma en un chip de dirección truncada (ej. `Anon-3a1b...c9f2`) y habilita instantáneamente las pantallas privadas.

---

### 8.2 Página de Inicio (`Home.tsx`)
Diseñada con una estética de alta gama para captar la atención del usuario inicial:
- **Hero Section**: Introducción clara sobre el protocolo soberano de salud.
- **Tarjetas del Flujo ZK**: Tres secciones ilustradas en filas independientes con imágenes premium:
  1. **Bóveda del Paciente**: Explica el almacenamiento criptográfico en el cliente.
  2. **Portal del Médico**: Detalla la acreditación criptográfica de personal médico.
  3. **Escáner de Emergencia**: Explica cómo se desencadena la prueba de conocimiento cero.
- **Guía de Flujo Paso a Paso**: Un timeline visual que enseña al usuario cómo interactúan el paciente, el médico y el hospital.

---

### 8.3 Bóveda del Paciente (`PatientPage.tsx` / `PatientVault.tsx`)
El centro de control de privacidad del paciente.

#### A. Estado Desconectado (Vista de Bloqueo)
- **Qué ve el usuario**: Una tarjeta de cristal esmerilado con un candado animado.
- **Funcionalidad**: Indica al usuario que sus datos médicos locales están encriptados mediante **AES-GCM**.
- **Botón "Conectar Wallet para Descifrar"**: Lanza la autenticación. Impide que un usuario no autorizado visualice datos clínicos locales residuales.

#### B. Estado Conectado (Vista de Bóveda Activa)
- **Tarjeta de Identidad**: Muestra el identificador público derivado (`Anon-XXXX`).
- **Selector de Perfil Sanguíneo**:
  - **Acción**: Permite cambiar tu grupo sanguíneo (ej. `O+`, `AB-`).
  - **Detrás de escena**: Cada cambio genera una nueva clave en local y sobreescribe de inmediato el LocalStorage con el nuevo payload encriptado.
- **Switch "Prueba Serológica Limpia"**: Alterna el estatus de salud pública.
- **Consola de Privacidad Granular**: Lista de consentimientos específicos (ej. Donación de Órganos, Matchmaking de Emergencia, Ensayos Clínicos). 
- **Pasaporte Médico de Emergencia (`EmergencyPassport.tsx`)**:
  - **Qué ve el usuario**: Una tarjeta premium con un código QR dinámico y un temporizador de cuenta regresiva (24 horas).
  - **Botón "Regenerar Pasaporte"**: Cambia la marca de tiempo y recalcula el hash SHA-256 del consentimiento de forma instantánea.
  - **Botón "Compartir Enlace"**: Copia al portapapeles una URL de escaneo directo que transfiere la solicitud de acceso al portal médico de emergencias.

---

### 8.4 Portal del Médico (`DoctorPage.tsx` / `DoctorPortal.tsx`)
La consola administrativa de acreditaciones hospitalarias.

- **Botón "Desplegar Contrato MedLock"**:
  - **Acción**: Publica una nueva instancia del contrato inteligente Compact en la blockchain local/testnet de Midnight.
  - **Detrás de escena**: Utiliza tu wallet para pagar el DUST del despliegue y asentar la dirección del contrato en el estado local.
- **Directorio de Médicos Autorizados (`DoctorDirectory.tsx`)**:
  - **Botón "+ Nuevo Médico"**: Despliega un formulario para registrar un médico clínico introduciendo su nombre y clave pública hex.
  - **Botón "Acreditar en Blockchain"**: Lanza una transacción on-chain real que agrega al médico al árbol de Merkle del contrato.
  - **Botón "Revocar"**:
    - **Acción**: Lanza la llamada de revocación on-chain al contrato inteligente.
    - **Resultado**: La clave pública del médico se agrega a la lista de revocados del contrato, inhabilitando su firma de por vida de forma irreversible.

---

### 8.5 Escáner de Emergencia y Matchmaking (`EmergencyPage.tsx`)
La demostración práctica del protocolo de emergencia.

- **Selector "Elegir Médico que Consulta"**: Permite simular qué médico en el hospital está realizando la consulta (ej. seleccionar a un médico activo vs. un médico revocado para probar la seguridad del circuito).
- **Selector "Tipo de Sangre Requerido"**: Configura la demanda crítica de la sala de emergencias (ej. `O-` para transfusión universal).
- **Buscador de Donantes Compatibles (`DonorMatchmaker.tsx`)**:
  - **Acción**: Simula un pool de donantes locales anonimizados.
  - **Visual**: Muestra animaciones de escaneo ZK con luces de pulso y detecta candidatos aptos basándose en el tipo de sangre.
- **Botón "Iniciar Verificación ZK"**:
  - **Acción**: Dispara el motor de pruebas local (Midnight Proof Server).
  - **Timeline en Tiempo Real (`ZKProofVisualizer.tsx`)**: Muestra visualmente las 4 etapas de compilación de la prueba ZK en el navegador mediante barras de carga dinámicas.
  - **Resultado**:
    - Si el médico es válido, compatible y tiene consentimientos: Muestra un banner verde de **ACCESO PERMITIDO (MATCH SUCCESS)**.
    - Si el médico ha sido revocado o el tipo de sangre es incompatible: Muestra un banner rojo de **ACCESO DENEGADO (MATCH FAILED)**.
- **ZK Audit Timeline (`AuditTimeline.tsx`)**:
  - **Qué ve el usuario**: Una consola con todas las transacciones de auditoría.
  - **Interacción**: Permite filtrar las acciones on-chain y examinar los hashes de las transacciones y las claves de bloque generadas.

---

## 9. Guía de Prueba Paso a Paso (Demostración Recomendada)

Para demostrar todo el potencial de la dApp a un evaluador, sigue estos pasos:

1. **Conectar**: Haz clic en "Conectar Wallet" en la esquina superior derecha.
2. **Configurar Datos del Paciente**: Ve a la pestaña **Paciente**. Modifica tu tipo de sangre a `O-` y asegúrate de que el consentimiento de "Acceso de Emergencia" esté activo. Tu código QR del Pasaporte se actualizará de forma dinámica.
3. **Registrar un Médico**: Copia la dirección pública que se muestra en tu tarjeta de identidad de paciente. Ve a la pestaña **Médicos**, haz clic en "+ Nuevo Médico", pega la dirección y agrégalo. Haz clic en **Acreditar en Blockchain** (se emitirá una transacción de Midnight para registrar el Merkle Root).
4. **Ejecutar Escaneo de Emergencia**: Ve a la pestaña **Emergencias**. Selecciona el médico recién registrado en el dropdown. Elige como tipo de sangre requerido `O-`. Haz clic en **Iniciar Verificación ZK**. Observa las fases del visualizador ZK. El resultado será verde: **MATCH SUCCESS**.
5. **Probar la Revocación**: Regresa a la pestaña **Médicos** y haz clic en **Revocar** al lado de tu médico registrado. Espera a que la transacción se confirme en la blockchain.
6. **Intentar Escaneo con Médico Revocado**: Ve a la pestaña **Emergencias** e inicia una nueva verificación ZK con el mismo médico. El circuito Compact ZK detectará de inmediato la revocación on-chain y denegará el acceso: **MATCH FAILED**.
7. **Verificar Bitácora de Auditoría**: Examina el timeline al final de la página de emergencias para ver los registros inalterables y los nullifiers on-chain generados.


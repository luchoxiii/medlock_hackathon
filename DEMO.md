# MedLock — Guion de Grabación de Demostración del Producto (Demo Script)

Este documento contiene el guion paso a paso para grabar la demostración en video de MedLock de un solo tiro (un solo pase continuo) usando OBS. Está diseñado para durar entre 2 y 3 minutos, mostrando las capacidades de seguridad, la interfaz de usuario y los circuitos ZK.

---

## 🛠️ Fase 0: Preparación (Antes de presionar "Grabar")

Para asegurar que el video corra fluido y sin esperas incómodas:
1. Asegúrate de tener la extensión de tu wallet (Lace o 1AM) abierta y desbloqueada.
2. Abre la dApp en `http://localhost:5173/` en tu navegador.
3. Desconecta tu wallet temporalmente desde la interfaz si está conectada (para iniciar el video mostrando el estado "Desconectado" / "Bóveda Bloqueada").
4. Asegúrate de tener un contrato ya desplegado (deja la dirección del contrato guardada en la dApp) para evitar demoras de despliegue en vivo.
5. Registra y acredita a un médico (llámalo "Dr. Gabriel") usando tu dirección de wallet para simular el flujo rápido de éxito.

---

## 📹 Estructura del Video Paso a Paso (Toma Única)

### Paso 1: Introducción y la Página de Inicio (0:00 - 0:25)
- **Qué hacer**: Comienza en la pestaña **Inicio (Home)** de la dApp.
- **Qué mostrar en pantalla**: La página de inicio premium de MedLock. Haz un ligero scroll hacia abajo para mostrar las filas ilustrativas y las 3 secciones principales de la app.
- **Qué decir**:
  > *"Hola. Bienvenidos a la demostración de MedLock, un protocolo híbrido de acceso médico de emergencia que preserva la privacidad del paciente y funciona en conocimiento cero sobre Midnight Network. Vamos a ver cómo funciona de principio a fin."*

---

### Paso 2: La Bóveda de Privacidad Cifrada (0:25 - 0:55)
- **Qué hacer**: Haz clic en la pestaña **Paciente** en la barra de navegación superior.
- **Qué mostrar en pantalla**: La pantalla de bloqueo con el candado que indica: *"Bóveda Cifrada de Salud. Conecta tu wallet para descifrar..."*
- **Qué decir**:
  > *"Primero, ingresemos como pacientes. Al entrar a la Bóveda del Paciente sin conectar la wallet, la interfaz nos muestra que todos nuestros expedientes clínicos locales están completamente encriptados mediante criptografía simétrica fuerte AES-GCM, impidiendo cualquier acceso no autorizado."*
- **Qué hacer**: Haz clic en el botón azul **"Conectar Wallet para Descifrar"** (o "Conectar Wallet" en el menú superior) y acepta la firma en el popup de tu wallet.
- **Qué mostrar en pantalla**: La pantalla se actualiza instantáneamente tras conectar, cargando tu tarjeta de identidad anónima, tu selector de sangre (configurado en `O-`), tus consentimientos activos y el Pasaporte QR dinámico.
- **Qué decir**:
  > *"Al conectar nuestra wallet, derivamos criptográficamente las llaves de descifrado locales en el navegador. Ahora podemos ver y editar nuestro historial clínico de forma segura, gestionar nuestros consentimientos de privacidad de manera granular y ver nuestro Pasaporte de Emergencia QR, el cual cambia dinámicamente y expira cada 24 horas."*

---

### Paso 3: Acreditación y Revocación del Médico (0:55 - 1:30)
- **Qué hacer**: Haz clic en la pestaña **Médicos** de la barra de navegación.
- **Qué mostrar en pantalla**: El Directorio de Médicos Autorizados. Muestra la tabla donde ya tienes al "Dr. Gabriel" acreditado con estatus `Activo` en color verde.
- **Qué decir**:
  > *"Pasemos al Portal de Médicos. Los hospitales y administradores pueden registrar médicos en un árbol de Merkle on-chain. Aquí tenemos al Dr. Gabriel registrado como activo. Pero para este hackathon hemos implementado una característica de seguridad única: la revocación de credenciales on-chain en tiempo real mediante un circuito administrativo de conocimiento cero."*
- **Qué hacer**: Haz clic en el botón rojo **"Revocar"** al lado del Dr. Gabriel. (Acepta la alerta de confirmación del navegador).
- **Qué mostrar en pantalla**: El estatus del Dr. Gabriel cambia visualmente en la tabla a `revoked` en color rojo. Se añade un registro al timeline o se muestra una alerta del hash de la transacción on-chain de revocación en la red de Midnight.
- **Qué decir**:
  > *"Con un solo clic, acabamos de revocar on-chain al Dr. Gabriel. Su compromiso público ha sido agregado al Set de revocación del contrato inteligente en la blockchain, inhabilitando su firma digital de forma inmediata e irreversible."*

---

### Paso 4: El Escáner de Emergencia y la Prueba ZK (1:30 - 2:20)
- **Qué hacer**: Haz clic en la pestaña **Emergencias** de la barra de navegación.
- **Qué mostrar en pantalla**: La consola del Escáner de Emergencia. Selecciona al "Dr. Gabriel" en el menú desplegable del médico que consulta. Configura la sangre requerida en `O-`.
- **Qué decir**:
  > *"Ahora simulamos un escenario de emergencia en un hospital. El paramédico escanea el código QR del paciente e intenta solicitar compatibilidad sanguínea para sangre 'O-'. Vamos a simular la consulta usando la llave del Dr. Gabriel que acabamos de revocar on-chain. Iniciamos la verificación ZK."*
- **Qué hacer**: Haz clic en el botón azul **"Iniciar Verificación ZK"**.
- **Qué mostrar en pantalla**: El **ZK Proof Visualizer** se activa y sus barras de carga avanzan por las 4 fases: *Generación de Testigos → Sanitización de Datos → Proof Server → Nullifier*. En segundos, el proceso finaliza y arroja un banner rojo grande: **ACCESO DENEGADO (MATCH FAILED)**.
- **Qué decir**:
  > *"Como pueden observar, el visualizador ZK muestra en tiempo real cómo el dispositivo del paciente evalúa los datos clínicos en local. El circuito Compact ZK detectó que el médico consultor se encuentra en la lista de revocación on-chain y rechazó la prueba matemática de inmediato. El acceso ha sido denegado y nuestros datos privados están protegidos."*

---

### Paso 5: Registro de Auditoría y Cierre (2:20 - 2:45)
- **Qué hacer**: Haz scroll hacia abajo para mostrar la sección **Bitácora de Auditoría Criptográfica**.
- **Qué mostrar en pantalla**: El historial de auditoría mostrando la última transacción fallida con su respectivo bloque de Midnight y su nullifier hash único.
- **Qué decir**:
  > *"Finalmente, en la parte inferior, la red asienta un registro de auditoría inalterable con hashes de bloque y nullifiers criptográficos únicos que prueban el cumplimiento legal del protocolo sin revelar jamás datos clínicos. MedLock demuestra el poder de las pruebas de conocimiento cero en Midnight Network para proteger vidas garantizando la privacidad absoluta del paciente. Muchas gracias."*
- **Qué hacer**: Detén la grabación en OBS. Tu video de demostración estará listo.

# MedLock — Guía de Preparación para la Entrevista con el Jurado (Q&A Prep)

Esta guía está diseñada para que el equipo de **4 personas** domine el Pitch privado de 5 minutos con los jueces del Hackathon. El objetivo es **comprender los conceptos mediante analogías** en lugar de memorizarlos, permitiendo responder con fluidez y naturalidad según el rol de cada integrante.

---

## ⏱️ 1. Estructura Estratégica de la Entrevista (5 Minutos)

El tiempo es extremadamente limitado. No divaguen. Apliquen la regla de oro: **Respuestas de máximo 40 segundos**.
- **Minuto 1: El Pitch de Elevador (Elevator Pitch)** -> Liderado por el Presentador de Producto.
- **Minuto 2: Demostración Rápida** -> Liderado por el Diseñador/Demo.
- **Minutos 3 a 5: Preguntas del Jurado (Q&A)** -> Respuestas distribuidas de inmediato al rol correspondiente.

---

## 👥 2. Asignación de Roles (Quién responde qué)

Dividan el conocimiento para que no se pisen al hablar y demuestren coordinación de equipo:

### 👤 Integrante 1: Líder de Producto y Cumplimiento (Product & BizDev)
- **Foco**: El problema del mundo real, el valor de negocio, usabilidad, regulaciones (HIPAA/GDPR) y visión de futuro.
- **Tu mentalidad**: *"Nosotros salvamos vidas en salas de urgencias protegiendo al 100% el derecho a la privacidad del paciente."*

### 👤 Integrante 2: Ingeniero de Blockchain y Criptografía (Compact & ZK Engineer)
- **Foco**: El contrato inteligente en Compact, los circuitos de conocimiento cero, el árbol de Merkle de acreditación y el Set de revocación on-chain.
- **Tu mentalidad**: *"La blockchain de Midnight solo valida matemáticas (pruebas de consistencia). Ningún dato clínico se expone al ledger."*

### 👤 Integrante 3: Desarrollador Frontend e Integración (Frontend & Security)
- **Foco**: Cifrado local AES-GCM en el cliente, la integración de Midnight.js SDK, el manejo de wallets y el mecanismo de fallback para redes locales.
- **Tu mentalidad**: *"Los datos se cifran localmente usando la llave de la wallet. El servidor de pruebas corre en el navegador del usuario."*

### 👤 Integrante 4: Diseñador de UX y Demostración (UX & Proving Flow)
- **Foco**: La experiencia del médico de emergencias, el visualizador interactivo del pipeline ZK y el historial de auditoría criptográfica.
- **Tu mentalidad**: *"Traducimos la complejidad de la criptografía de Midnight en una interfaz simple y rápida para médicos bajo estrés."*

---

## 💡 3. Conceptos Clave Explicados con Analogías

No memoricen definiciones técnicas complejas. Utilicen estas analogías para explicar el funcionamiento ante los jueces:

### A. ¿Qué es Midnight y por qué lo usamos?
- **La explicación formal**: Midnight es una blockchain híbrida que combina un ledger público con un estado privado protegido criptográficamente mediante tokens de datos confidenciales.
- **La analogía**: *Es como una discoteca con un guardia de seguridad. Para entrar, el guardia necesita comprobar que eres mayor de edad (Ledger Público / Regla), pero tú no necesitas mostrarle tu identificación ni decirle tu nombre (Estado Privado). Solo le demuestras criptográficamente que cumples la regla.*

### B. ¿Qué es un "Nullifier" (Anulador)?
- **La explicación formal**: Es un hash único generado a partir de una clave secreta y la transacción actual para evitar la doble presentación de una prueba ZK sin revelar la identidad de la cuenta emisora.
- **La analogía**: *Es como una entrada de cine cortada a la mitad. El cine (la blockchain) registra que la entrada número #456 ya entró para que nadie la copie y la vuelva a usar (doble gasto), pero el cine no sabe quién compró esa entrada.*

### C. ¿Qué es el "Proof Server" (Servidor de Pruebas)?
- **La explicación formal**: Es un motor local fuera de cadena (off-chain) que toma los testigos privados del usuario y compila la prueba matemática ZK en el cliente antes de mandarla a la red.
- **La analogía**: *Es como cocinar en casa. Tú tienes los ingredientes secretos en tu cocina (tu computadora). Cocinas el plato en tu horno privado (Proof Server) y solo le llevas el plato terminado (la prueba matemática ZK) al restaurante (la blockchain) para que lo pruebe. El restaurante sabe que el plato está delicioso, pero nunca vio tu receta secreta.*

---

## ❓ 4. Banco de Preguntas y Respuestas Clínicas/Técnicas

Prepárense para estas preguntas habituales de los jurados de Midnight y de negocio:

### 💼 Categoría A: Negocio y Producto (Responde Integrante 1)

#### P: ¿Por qué un hospital adoptaría esto en lugar de una base de datos privada en la nube?
> *"Porque las bases de datos centralizadas son el objetivo número uno de hackeos de registros médicos (ransomware). MedLock ofrece un enfoque soberano 'Local-First'. Los datos clínicos residen encriptados en los dispositivos de los pacientes. Al eliminar la base de datos centralizada de datos médicos en texto plano, eliminamos el riesgo de hackeos masivos de raíz y cumplimos automáticamente con normativas HIPAA y GDPR."*

#### P: ¿Cómo accede un médico a los datos si el paciente llega inconsciente a urgencias?
> *"El pasaporte de emergencia QR/NFC del paciente puede estar en una tarjeta física en su billetera o en su teléfono. Al escanearlo, el paramédico solicita el acceso. Si el paciente configuró previamente su consentimiento de 'Urgencia' en su bóveda, el sistema genera la prueba ZK automáticamente. Si no hay consentimiento explícito de emergencias, el circuito matemático rechaza la consulta, respetando la voluntad soberana del paciente."*

---

### ⛓️ Categoría B: Blockchain y ZK (Responde Integrante 2)

#### P: ¿Cómo saben que el médico que consulta realmente está autorizado si no revelan su identidad?
> *"El hospital publica en la blockchain la raíz de un Árbol de Merkle que contiene las claves públicas de todos sus médicos autorizados. En el circuito ZK escrito en Compact, el médico proporciona como testigo (private input) su firma y su ruta Merkle. El circuito verifica matemáticamente que pertenece al árbol autorizado sin revelar la llave pública específica del médico consultor en la transacción."*

#### P: Si el contrato es inmutable en la blockchain, ¿cómo revocan a un médico?
> *"Aunque el árbol de Merkle original es inmutable para esa época, implementamos un circuito de revocación real on-chain. El administrador del hospital añade el compromiso del médico revocado a un conjunto público (`revokedDoctors` tipo `Set`). El circuito ZK de emergencia realiza una comprobación obligatoria: si el médico consultor está presente en el conjunto de revocados, el circuito falla la aserción y aborta la generación de la prueba."*

---

### 💻 Categoría C: Implementación y Frontend (Responde Integrante 3)

#### P: Si los datos se encriptan con la wallet, ¿qué pasa si el usuario pierde acceso o cambia de dispositivo?
> *"El cifrado local AES-GCM se deriva criptográficamente de la semilla de la wallet de Midnight. Si el paciente cambia de dispositivo, solo debe restaurar su wallet Lace/1AM con su frase semilla. Al reconectar la dApp, la llave simétrica se deriva nuevamente a partir de la firma y descifra los datos respaldados localmente en segundos."*

#### P: ¿Cómo funciona el cifrado en navegadores antiguos o entornos de red locales de prueba?
> *"Diseñamos un mecanismo de protección doble. En contextos seguros (localhost o HTTPS), la dApp corre criptografía de hardware AES-GCM mediante la Web Crypto API. Si se prueba en una red local con IPs ordinarias sin HTTPS para pruebas multidispositivo, el sistema cuenta con un fallback automático que ejecuta un hash SHA-256 y un cifrado de flujo XOR nativo en Javascript para evitar fallos de seguridad o pantallas blancas."*

---

### 🎨 Categoría D: UX y Flujo Visual (Responde Integrante 4)

#### P: ¿Por qué es necesario un visualizador de pruebas ZK en la interfaz del médico?
> *"Generar una prueba de conocimiento cero requiere poder de cómputo y toma unos segundos. El ZK Proof Visualizer educa al personal médico y de emergencias mostrando exactamente qué fase criptográfica está ocurriendo en el dispositivo (Extracción de testigos -> Sanitización de datos -> Proof Server -> Ledger). Esto reduce la ansiedad del usuario bajo estrés y demuestra que la privacidad se está validando en tiempo real."*

#### P: ¿Qué utilidad tiene la bitácora de auditoría si los datos son anónimos?
> *"La bitácora ZK Audit Ledger registra de forma persistente cada intento de verificación. Almacena las marcas de tiempo, la altura de bloque en la red Midnight y los hashes de transacción. Esto permite al hospital contar con un registro inalterable para cumplimiento legal, demostrando ante reguladores que solo se consultó la información bajo emergencias validadas por pruebas ZK exitosas."*

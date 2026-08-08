# MedLock — Propuesta de Presentación (Pitch Deck Slide-by-Slide)

Este documento contiene la estructura y el guion diapositiva por diapositiva (Slide-by-Slide) para la presentación de **MedLock** ante los jueces del Hackathon. Está optimizado para captar el interés técnico y de negocio en un tiempo limitado (3 a 5 minutos).

---

## Diapositiva 1: Portada (El Nacimiento de MedLock)
- **Título**: MedLock
- **Subtítulo**: Bóveda de Salud Soberana y Protocolo de Verificación en Conocimiento Cero (ZK)
- **Diseño Visual**: Fondo oscuro premium (azul noche y verde esmeralda) con el logotipo de MedLock brillante. Un gráfico abstracto de un escudo con un candado entrelazado con una cadena de bloques y un símbolo de primeros auxilios.
- **Contenido en Pantalla**:
  - Soberanía de Datos Clínicos.
  - Verificación ZK en Tiempo Real.
  - Construido sobre Midnight Network.
- **Guion del Orador**:
  > *"Hola a todos. Hoy queremos presentarles MedLock: un protocolo de acceso médico de emergencia que preserva la privacidad del paciente y devuelve la soberanía absoluta de la salud a las personas, utilizando criptografía de conocimiento cero de última generación en Midnight Network."*

---

## Diapositiva 2: El Problema (Privacidad vs. Emergencias)
- **Título**: El Dilema Crítico de la Salud
- **Diseño Visual**: Pantalla dividida. A la izquierda: un titular de fuga de datos en bases de datos hospitalarias centralizadas. A la derecha: una ambulancia en una situación crítica donde el médico no tiene acceso al tipo de sangre del paciente.
- **Contenido en Pantalla**:
  - **Fugas de Datos**: Las historias clínicas son los datos más valiosos y hackeados del mercado negro.
  - **Inaccesibilidad**: En emergencias, el retraso al identificar tipos de sangre o alergias cuesta vidas.
  - **Exposición Pública**: Las blockchains tradicionales exponen los expedientes clínicos en texto plano al validar transacciones.
- **Guion del Orador**:
  > *"En el sector salud nos enfrentamos a una contradicción crítica. Por un lado, las filtraciones de bases de datos médicas centralizadas exponen la intimidad de millones de pacientes todos los años. Por el otro, en una sala de emergencias, no tener acceso inmediato al historial clínico de una persona inconsciente puede costar vidas. Hasta hoy, la única opción era elegir entre seguridad absoluta o privacidad total. MedLock elimina ese dilema."*

---

## Diapositiva 3: La Solución (Bóveda Soberana ZK)
- **Título**: Privacidad Absoluta, Acceso Instantáneo
- **Diseño Visual**: Tres pilares interactivos con íconos premium:
  1. **Almacenamiento Local-First** (candado en dispositivo).
  2. **Acreditación Criptográfica** (firma digital de médicos).
  3. **Verificación ZK en la Blockchain** (Midnight Ledger).
- **Contenido en Pantalla**:
  - **Cero Datos On-Chain**: Los registros de salud nunca tocan la blockchain en texto plano.
  - **Cómputo en el Cliente**: Las pruebas de conocimiento cero se compilan en el dispositivo del paciente.
  - **Consentimiento Activo**: El paciente controla qué se verifica, cuándo y quién lo verifica.
- **Guion del Orador**:
  > *"¿Cómo lo hacemos? MedLock es un protocolo local-first. Los datos de salud del paciente se guardan encriptados en su dispositivo y nunca se suben a ningún servidor. Cuando un médico requiere verificar compatibilidad sanguínea o alergias, el dispositivo del paciente genera una prueba de conocimiento cero. La blockchain valida matemáticamente que el médico está acreditado y que los datos son compatibles, sin revelar jamás la identidad ni el historial clínico del paciente."*

---

## Diapositiva 4: Bóveda del Paciente y Pasaporte QR
- **Título**: Tu Identidad de Salud Criptográfica
- **Diseño Visual**: Maqueta (mockup) del smartphone del paciente mostrando el panel de control de consentimientos y el Pasaporte de Emergencia QR con el temporizador de cuenta regresiva (24 horas).
- **Contenido en Pantalla**:
  - **Cifrado Local Fuerte**: AES-GCM (256 bits) derivado de la firma de la wallet.
  - **Consola de Consentimiento Granular**: Habilitación selectiva para donaciones, emergencias o ensayos clínicos.
  - **Pasaporte Dinámico**: Código QR autogenerado, firmado criptográficamente, válido por 24 horas y compatible con NFC.
- **Guion del Orador**:
  > *"El paciente gestiona su salud desde su Bóveda de Privacidad. Sus registros se encriptan localmente con el algoritmo AES-GCM de 256 bits, usando una llave derivada de su firma de wallet. Desde aquí, puede configurar consentimientos granulares y generar su Pasaporte Médico QR, un código dinámico firmado que es compatible con NFC y expira a las 24 horas para evitar copias maliciosas."*

---

## Diapositiva 5: Acreditación y Revocación On-Chain
- **Título**: Control Criptográfico de Personal Médico
- **Diseño Visual**: Gráfico simplificado de un Árbol de Merkle de médicos autorizados y una lista on-chain roja de revocaciones (Set) que bloquea el circuito ZK.
- **Contenido en Pantalla**:
  - **Raíz Merkle On-Chain**: Agrupa las llaves públicas de todos los doctores acreditados por el hospital.
  - **Revocación en Tiempo Real**: Circuito Compact administrativo `revoke_doctor`.
  - **Invalidez Inmediata**: Las firmas de médicos revocados fallan al instante en la prueba matemática ZK.
- **Guion del Orador**:
  > *"Para evitar usurpaciones de identidad, MedLock utiliza un árbol de Merkle on-chain de médicos autorizados. Pero fuimos más allá para esta hackathon: implementamos un circuito real de revocación. Si la licencia de un médico expira o es revocada por el hospital, su compromiso se agrega al conjunto de revocaciones en la blockchain. Al instante, cualquier intento de generar una prueba ZK con su llave fallará matemáticamente en el dispositivo del paciente."*

---

## Diapositiva 6: Demostración: Escáner de Emergencia
- **Título**: Cómputo ZK en Acción
- **Diseño Visual**: Captura del ZK Proof Visualizer mostrando las barras de progreso del motor de pruebas (testigos → sanitización → proof server → nullifier) y los banners de **MATCH SUCCESS** (verde) y **MATCH FAILED** (rojo).
- **Contenido en Pantalla**:
  - **Visualización en Tiempo Real**: Desglose de fases de la prueba de conocimiento cero.
  - **Evaluación Sin Fugas**: Validación del médico, validez de consentimiento y compatibilidad de sangre.
  - **Resultado Booleano**: Solo un `Sí` o `No` se publica y almacena en el registro de auditoría.
- **Guion del Orador**:
  > *"En una sala de emergencias, el médico escanea el Pasaporte QR. La dApp inicia el proceso de generación ZK y muestra de forma interactiva cada etapa del pipeline criptográfico: extracción de testigos privados, sanitización, envío al Proof Server y publicación del nullifier. Si todo es correcto, se obtiene un 'MATCH SUCCESS' en verde. Si el médico fue revocado o la sangre no es compatible, se muestra 'MATCH FAILED' en rojo, protegiendo al paciente."*

---

## Diapositiva 7: Especificación Técnica y Midnight
- **Título**: Arquitectura de Privacidad con Midnight Network
- **Diseño Visual**: Diagrama de arquitectura técnica conectando el Contrato Inteligente Compact, los bindings compilados y el Proof Server local de Midnight.
- **Contenido en Pantalla**:
  - **Contrato Compact**: Circuito lógico ZK compilado e instalado localmente.
  - **Prueba en Cliente**: Integración con el SDK de Midnight.js para la delegación de pruebas.
  - **Nullifier On-Chain**: Hash único registrado en la blockchain que evita la reutilización de pruebas sin revelar datos.
- **Guion del Orador**:
  > *"Técnicamente, MedLock corre sobre Midnight Network utilizando contratos en Compact. El compilador genera los circuitos ZK y los bindings que se ejecutan en el navegador del paciente mediante Midnight.js. Para proteger el anonimato del paciente y evitar que se trace su historial de emergencias en la blockchain, el circuito genera un nullifier criptográfico único que se registra on-chain en cada verificación, bloqueando ataques de repetición."*

---

## Diapositiva 8: Bitácora de Cumplimiento (ZK Audit Ledger)
- **Título**: Auditoría Transparente y Regulación HIPAA/GDPR
- **Diseño Visual**: Tabla del registro histórico de auditoría mostrando marcas de tiempo, transacciones de verificación reales en bloques de Midnight y nullifiers anonimizados.
- **Contenido en Pantalla**:
  - **Historial Inalterable**: Registro persistente de accesos médicos de emergencia.
  - **Cumplimiento Normativo**: Alineación automática con normativas internacionales de protección de datos de salud.
  - **Hash de Transacción Real**: Transacciones en la testnet pública verificables en exploradores.
- **Guion del Orador**:
  > *"Gracias a la arquitectura híbrida de Midnight, MedLock permite cumplir con normativas estrictas como HIPAA y GDPR. Los hospitales cuentan con una bitácora de auditoría inalterable on-chain donde se registran las transacciones de verificación y nullifiers. Esto demuestra legalmente que se realizaron comprobaciones de compatibilidad antes de una intervención médica de emergencia, sin necesidad de almacenar datos clínicos legibles en texto plano."*

---

## Diapositiva 9: Futuro y Modelo de Negocio
- **Título**: Escalabilidad y Adopción en Redes de Salud
- **Diseño Visual**: Gráfico de proyección que muestra la integración con sistemas ERP de hospitales tradicionales (Sistemas HL7/FHIR) e interfaces de aseguradoras de salud.
- **Contenido en Pantalla**:
  - **Integración API**: Conexión nativa con sistemas de registro médico electrónico (EHR).
  - **Dispositivos Físicos**: Pasaportes de emergencia grabados en tarjetas físicas NFC.
  - **Modelo SaaS / B2B**: Licenciamiento del protocolo de validación criptográfica para redes de hospitales y aseguradoras de salud.
- **Guion del Orador**:
  > *"MedLock no es solo un prototipo; está diseñado para escalar. Nuestro modelo se basa en licenciar la API de verificación a redes de hospitales y aseguradoras de salud, integrándose con sistemas de historial clínico electrónico actuales (HL7/FHIR). En el futuro, los pacientes podrán llevar su Pasaporte de Emergencia criptográfico en tarjetas físicas con chips NFC pasivos, legibles por cualquier smartphone de emergencias médicas en segundos."*

---

## Diapositiva 10: Cierre (MedLock: Soberanía que Salva Vidas)
- **Título**: MedLock
- **Subtítulo**: Protegiendo Vidas, Garantizando la Soberanía de tu Salud.
- **Diseño Visual**: Repetición del logotipo premium de MedLock con enlaces al código fuente del repositorio y datos de contacto de los desarrolladores del equipo.
- **Contenido en Pantalla**:
  - **Código Abierto**: Licencia Apache 2.0.
  - **100% Funcional**: Smart Contract Compact y dApp listos para producción.
  - **Repositorio**: `github.com/luchoxiii/medlock_hackathon`
- **Guion del Orador**:
  > *"MedLock demuestra que la tecnología blockchain y las pruebas de conocimiento cero pueden resolver problemas reales del mundo físico, salvando vidas en salas de emergencia sin comprometer un solo byte de la privacidad y soberanía de los pacientes. Muchas gracias. Estamos listos para sus preguntas."*

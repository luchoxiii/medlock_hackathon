/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="container section">
      {/* Hero Section */}
      <div className="page-header" style={{ marginBottom: '56px', paddingTop: '20px' }}>
        <span 
          className="badge badge-verified" 
          style={{ 
            marginBottom: '20px', 
            display: 'inline-flex', 
            padding: '6px 14px', 
            fontSize: '0.825rem',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '30px'
          }}
        >
          🛡️ Impulsado por Criptografía ZK de Midnight Network
        </span>
        <h1 style={{ fontSize: '3.75rem', lineHeight: '1.08', marginBottom: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Tus Datos Médicos.<br/>
          <span style={{ background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tus Reglas.
          </span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto 36px auto', fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          MedLock protege tus antecedentes médicos con conocimiento cero. Demuestra compatibilidad en emergencias sin jamás exponer tu identidad ni tu historial completo.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/patient" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.0625rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)' }}>
            Ingresar a la Bóveda
          </Link>
          <Link to="/emergency" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1.0625rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            Probar Escáner ZK
          </Link>
        </div>
      </div>

      {/* Hero Banner Visual */}
      <div style={{ position: 'relative', marginBottom: '80px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: '1px solid var(--border-color)' }}>
        <img 
          src="/images/hero_banner.jpg" 
          alt="MedLock ZK Shield" 
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '520px', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: '24px 32px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>0 Bytes</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Datos Revelados en Nube</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34C759' }}>100% ZK-SNARK</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Pruebas de Conocimiento Cero</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>&lt; 2s</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Tiempo de Generación</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FF9500' }}>Midnight</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Ledger de Privacidad Activa</div>
          </div>
        </div>
      </div>

      {/* Row Features Section (Extended with images & alternates) */}
      <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.02em' }}>
        ¿Cómo MedLock redefine la seguridad médica?
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', marginBottom: '100px' }}>
        {/* Feature 1: Privacy ZK (Text Left, Image Right) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '2.5rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.018em' }}>Privacidad Absoluta con Zero Knowledge</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
              Utilizando la tecnología ZK-SNARK de Midnight Network, puedes demostrar que tu tipo de sangre coincide con los requisitos médicos o que tu historial de enfermedades infecciosas está limpio, sin revelar en ningún momento quién eres, qué otras condiciones tienes, ni exponer tu historial completo.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <li>• Oculta completamente tu identidad civil y wallet en la verificación.</li>
              <li>• Firmas criptográficas locales sin subir datos médicos al servidor.</li>
              <li>• Pruebas matemáticas infalsificables auditadas en la blockchain.</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 480px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
            <img 
              src="/images/home_privacy.jpg" 
              alt="ZK Privacy Shield" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Feature 2: Sovereign Vault (Image Left, Text Right) */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '48px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 480px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
            <img 
              src="/images/home_vault.jpg" 
              alt="Sovereign Data Vault" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '2.5rem' }}>🔑</div>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.018em' }}>Bóveda de Datos Soberana</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
              En MedLock, tú eres el dueño absoluto de tu clave criptográfica privada. No existen bases de datos centrales vulnerables a hackeos. Tu información sensible vive exclusivamente bajo tu custodia en tu dispositivo local, permitiéndote gestionar el consentimiento en cualquier momento.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <li>• Almacenamiento local encriptado y control soberano de llaves.</li>
              <li>• Consentimientos granulares con expiración temporal configurables por ti.</li>
              <li>• Autorización y revocación instantánea de médicos autorizados.</li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Emergency verification (Text Left, Image Right) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '2.5rem' }}>🚑</div>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.018em' }}>Verificación de Emergencia Instantánea</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
              En una situación crítica donde cada segundo cuenta, los paramédicos o servicios médicos pueden escanear tu pasaporte QR de emergencia. Este QR provee un enlace dinámico de verificación criptográfica que valida tu coincidencia de datos sanitarios vitales de forma segura en segundos.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <li>• Generación de QR temporal firmado dinámicamente.</li>
              <li>• Compatible con etiquetas físicas de identificación médica NFC.</li>
              <li>• Acceso inmediato sin revelar datos privados colaterales del paciente.</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 480px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
            <img 
              src="/images/home_emergency.jpg" 
              alt="Emergency Medical Scan" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </div>

      {/* Step by step process info card */}
      <div className="card card-glass" style={{ padding: '48px 36px', marginBottom: '80px', borderRadius: '28px' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '40px', letterSpacing: '-0.025em' }}>
          ¿Cómo funciona el flujo de validación ZK?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Paso 1</div>
            <h4 style={{ fontWeight: 600 }}>Emisión Médica</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Un doctor registrado firma tu atestación médica (ej: tipo de sangre) en base a pruebas clínicas oficiales.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>Paso 2</div>
            <h4 style={{ fontWeight: 600 }}>Bóveda Local</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              La atestación firmada se almacena localmente y se genera el compromiso ZK (commitment) encriptado.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-orange)' }}>Paso 3</div>
            <h4 style={{ fontWeight: 600 }}>Consentimiento</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Configuras la caducidad temporal de tus permisos médicos y generas tu pasaporte QR de emergencia.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>Paso 4</div>
            <h4 style={{ fontWeight: 600 }}>Prueba ZK</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Cualquier entidad escanea tu QR e inicia el circuito ZK en tiempo real para verificar compatibilidad sin exponer tu ID.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Open Source hackathon notice */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge badge-verified">Código Abierto Apache 2.0</span>
          <span className="badge" style={{ backgroundColor: 'rgba(88, 86, 214, 0.1)', color: '#5856D6' }}>Midnight preprod</span>
          <span className="badge" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)', color: '#FF9500' }}>Cardano Partnerchain</span>
        </div>
        <p style={{ maxWidth: '640px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          MedLock participa en el Hackathon de Midnight Network. Todo nuestro código fuente y contratos inteligentes Compact son libres, auditables e independientes de servidores centrales de datos.
        </p>
      </div>
    </div>
  );
};

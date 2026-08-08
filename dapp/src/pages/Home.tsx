/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="container section">
      <div className="page-header" style={{ marginBottom: '48px' }}>
        <span className="badge badge-verified" style={{ marginBottom: '16px', display: 'inline-block' }}>
          🛡️ Impulsado por Criptografía ZK de Midnight Network
        </span>
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '20px' }}>
          Tus Datos Médicos.<br/>
          <span style={{ background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tus Reglas.
          </span>
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto 32px auto', fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
          MedLock protege tus antecedentes médicos con conocimiento cero. Demuestra compatibilidad en emergencias sin jamás exponer tu identidad ni tu historial completo.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/patient" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.125rem' }}>
            Ingresar a la Bóveda
          </Link>
          <Link to="/emergency" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1.125rem' }}>
            Probar Escáner ZK
          </Link>
        </div>
      </div>

      {/* Hero Banner Visual */}
      <div style={{ position: 'relative', marginBottom: '60px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid var(--border-color)' }}>
        <img 
          src="/images/hero_banner.jpg" 
          alt="MedLock ZK Shield" 
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '480px', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '20px 28px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#007AFF' }}>0 Bytes</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Datos Privados Revelados</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34C759' }}>100% ZK</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pruebas de Conocimiento Cero</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#5856D6' }}>&lt; 1s</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tiempo de Verificación</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF9500' }}>Midnight</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Blockchain Descentralizada</div>
          </div>
        </div>
      </div>

      <div className="bento-grid">
        <div className="card card-glass">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔒</div>
          <h3 className="card-title">Privacidad de Conocimiento Cero</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Demuestra atributos críticos (como compatibilidad sanguínea o serología limpia) sin revelar tu historial clínico real.</p>
        </div>
        <div className="card card-glass">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔑</div>
          <h3 className="card-title">Bóveda Soberana de Datos</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Tú eres el único dueño de tu llave. Controla y revoca permisos de acceso de médicos instantáneamente en la blockchain.</p>
        </div>
        <div className="card card-glass">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🚑</div>
          <h3 className="card-title">Verificación de Emergencia</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Permite a los servicios de urgencia validar compatibilidad en segundos durante situaciones críticas sin comprometer tu privacidad.</p>
        </div>
      </div>
    </div>
  );
};

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="container section">
      <div className="page-header" style={{ marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem' }}>Tus Datos Médicos.<br/>Tus Reglas.</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          MedLock utiliza la criptografía de conocimiento cero de Midnight Network para asegurar tus datos médicos permitiendo compartirlos de forma verificable en emergencias.
        </p>
        <div style={{ marginTop: '32px' }}>
          <Link to="/patient" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
            Ingresar a la Bóveda
          </Link>
        </div>
      </div>

      <div className="bento-grid">
        <div className="card card-glass">
          <h3 className="card-title">Privacidad de Conocimiento Cero</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Demuestra atributos (como compatibilidad sanguínea) sin revelar tus registros médicos reales.</p>
        </div>
        <div className="card card-glass">
          <h3 className="card-title">Bóveda Soberana de Datos</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Tú controlas quién accede a qué. Revoca permisos instantáneamente en la blockchain.</p>
        </div>
        <div className="card card-glass">
          <h3 className="card-title">Verificación de Emergencia</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Permite a los médicos consultar parámetros de emergencia de forma segura en momentos críticos.</p>
        </div>
      </div>
    </div>
  );
};

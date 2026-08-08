/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STEPS = [
  {
    path: '/',
    step: 1,
    title: 'Paso 1: Visión e Inicio',
    desc: 'Conecta tu wallet de Midnight y conoce la arquitectura de privacidad ZK.',
    nextPath: '/patient',
    nextLabel: 'Ir al Paciente ➔'
  },
  {
    path: '/patient',
    step: 2,
    title: 'Paso 2: Bóveda del Paciente',
    desc: 'Configura tus datos médicos y consentimientos en tu estado privado local.',
    prevPath: '/',
    nextPath: '/doctor',
    nextLabel: 'Ir a Administración Médica ➔'
  },
  {
    path: '/doctor',
    step: 3,
    title: 'Paso 3: Portal Médico & Admin',
    desc: 'Despliega el contrato en Midnight y autoriza la clave del doctor en el Merkle tree.',
    prevPath: '/patient',
    nextPath: '/emergency',
    nextLabel: 'Probar Escáner ZK ➔'
  },
  {
    path: '/emergency',
    step: 4,
    title: 'Paso 4: Escáner de Emergencia',
    desc: 'Ejecuta el circuito ZK off-chain y verifica la coincidencia sin exponer tus datos.',
    prevPath: '/doctor',
    nextPath: '/',
    nextLabel: 'Reiniciar Tour ↺'
  }
];

export const DemoTourBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const currentStepInfo = STEPS.find(s => s.path === location.pathname) || STEPS[0];

  if (dismissed) {
    return (
      <div style={{ backgroundColor: '#F2F2F7', padding: '6px 16px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
        <button 
          onClick={() => setDismissed(false)} 
          style={{ background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer', fontWeight: 600 }}
        >
          ✨ Mostrar Guía de Demostración del Hackathon
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'rgba(242, 242, 247, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px',
      fontSize: '0.875rem'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ backgroundColor: '#007AFF', color: 'white', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
            DEMO HACKATHON • {currentStepInfo.step}/4
          </span>
          <div>
            <strong>{currentStepInfo.title}:</strong> <span style={{ color: 'var(--text-secondary)' }}>{currentStepInfo.desc}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentStepInfo.prevPath && (
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(currentStepInfo.prevPath!)}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              ← Anterior
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(currentStepInfo.nextPath)}
            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
          >
            {currentStepInfo.nextLabel}
          </button>
          <button 
            onClick={() => setDismissed(true)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', marginLeft: '8px' }}
            title="Ocultar guía demo"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

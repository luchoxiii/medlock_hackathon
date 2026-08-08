/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React, { useState, useEffect } from 'react';
import { VerificationResult } from '../api/types';

interface ZKProofVisualizerProps {
  isVerifying: boolean;
  result: VerificationResult | null;
}

export const ZKProofVisualizer: React.FC<ZKProofVisualizerProps> = ({ isVerifying, result }) => {
  const [currentStage, setCurrentStage] = useState<number>(-1);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    if (isVerifying) {
      setCurrentStage(0);
      timers.push(setTimeout(() => setCurrentStage(1), 1500));
      timers.push(setTimeout(() => setCurrentStage(2), 2500)); // 1.5s + 1s
      timers.push(setTimeout(() => setCurrentStage(3), 5500)); // 2.5s + 3s
    } else if (currentStage >= 0) {
      // When isVerifying becomes false after being true, complete all stages
      setCurrentStage(4);
    }
    return () => timers.forEach(clearTimeout);
  }, [isVerifying]);

  const stages = [
    {
      title: 'Generando Witnesses Locales',
      description: 'Recolectando datos privados del estado local del paciente...',
      icon: '🔐'
    },
    {
      title: 'Sanitizando Estado Confidencial',
      description: 'Eliminando datos sensibles del payload público...',
      icon: '🧹'
    },
    {
      title: 'Ejecución ZK en Proof Server',
      description: 'El servidor de pruebas genera la prueba criptográfica SNARK...',
      icon: '⚡'
    },
    {
      title: 'Emisión de Nullifier',
      description: 'Publicando nullifier anónimo en la blockchain...',
      icon: '🎯'
    }
  ];

  if (!isVerifying && !result && currentStage === -1) {
    return null;
  }

  return (
    <>
      <style>{`
        .zk-visualizer-card {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          color: white;
          border-radius: var(--radius-xl, 16px);
          padding: 24px;
          margin-top: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        .zk-stage-row {
          display: flex;
          position: relative;
          margin-bottom: 24px;
        }

        .zk-stage-row:last-child {
          margin-bottom: 0;
        }

        .zk-connector {
          position: absolute;
          left: 20px;
          top: 40px;
          bottom: -24px;
          width: 2px;
          background-color: rgba(255, 255, 255, 0.1);
          z-index: 1;
        }

        .zk-stage-row:last-child .zk-connector {
          display: none;
        }

        .zk-icon-container {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background-color: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .zk-stage-pending .zk-icon-container {
          background-color: rgba(255, 255, 255, 0.05);
          opacity: 0.5;
        }
        .zk-stage-pending .zk-stage-content {
          opacity: 0.5;
        }

        .zk-stage-active .zk-icon-container {
          border-color: var(--accent-blue, #0A84FF);
          background-color: rgba(10, 132, 255, 0.1);
          animation: pulse-glow 1.5s infinite;
        }

        .zk-stage-complete .zk-icon-container {
          background-color: var(--accent-green, #34C759);
          border-color: var(--accent-green, #34C759);
          color: white;
        }

        .zk-stage-content {
          margin-left: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: opacity 0.3s ease;
        }

        .zk-stage-title {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .zk-stage-description {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .zk-progress-bar-container {
          height: 4px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .zk-progress-bar {
          height: 100%;
          width: 0%;
          background-color: var(--accent-blue, #0A84FF);
          border-radius: 2px;
        }

        .zk-stage-active .zk-progress-bar {
          animation: progress-fill 2s ease-in-out forwards;
        }

        .zk-stage-complete .zk-progress-bar {
          width: 100%;
          background-color: var(--accent-green, #34C759);
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(10, 132, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(10, 132, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(10, 132, 255, 0); }
        }

        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }

        .zk-result-banner {
          margin-top: 24px;
          animation: fade-in 0.5s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {(isVerifying || currentStage >= 0) && (!result || currentStage < 4) && (
        <div className="zk-visualizer-card">
          <h4 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: 600 }}>Proceso de Generación ZK</h4>
          {stages.map((stage, index) => {
            let statusClass = 'zk-stage-pending';
            if (currentStage === index) statusClass = 'zk-stage-active';
            if (currentStage > index) statusClass = 'zk-stage-complete';

            return (
              <div key={index} className={`zk-stage-row ${statusClass}`}>
                <div className="zk-connector"></div>
                <div className="zk-icon-container">
                  {currentStage > index ? '✓' : stage.icon}
                </div>
                <div className="zk-stage-content">
                  <div className="zk-stage-title">{stage.title}</div>
                  <div className="zk-stage-description">{stage.description}</div>
                  {currentStage === index && (
                    <div className="zk-progress-bar-container">
                      <div className="zk-progress-bar"></div>
                    </div>
                  )}
                  {currentStage > index && (
                    <div className="zk-progress-bar-container">
                      <div className="zk-progress-bar" style={{ width: '100%', backgroundColor: 'var(--accent-green, #34C759)' }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentStage === 4 && result && (
        <div className="zk-result-banner">
          {result.success ? (
            <div className="zk-banner zk-banner-success">
              <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>✓ VERIFICACIÓN EXITOSA — COINCIDENCIA ENCONTRADA</h4>
              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Criterio:</strong> {result.criteria}</div>
                <div><strong>Nullifier:</strong> {result.nullifier}</div>
                <div><strong>Proof Hash:</strong> {result.proofHash}</div>
                <div><strong>Marca de Tiempo:</strong> {result.timestamp}</div>
              </div>
            </div>
          ) : (
            <div className="zk-banner zk-banner-fail">
              <h4 style={{ fontSize: '1.25rem' }}>✕ VERIFICACIÓN FALLIDA — SIN COINCIDENCIA</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>La prueba de conocimiento cero generó un resultado negativo para el criterio: {result.criteria}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

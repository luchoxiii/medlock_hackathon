/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { VerificationResult } from '../api/types';

interface Props {
  result: VerificationResult | null;
  isVerifying: boolean;
}

export const ZKResultMatch: React.FC<Props> = ({ result, isVerifying }) => {
  if (isVerifying) {
    return (
      <div className="zk-banner shimmer-bg" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        Generando Prueba ZK...
      </div>
    );
  }

  if (!result) return null;

  if (result.success) {
    return (
      <div className="zk-banner zk-banner-success">
        <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>✓ VERIFICACIÓN EXITOSA — COINCIDENCIA ENCONTRADA</h4>
        <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div><strong>Criterio:</strong> {result.criteria}</div>
          <div><strong>Nullifier:</strong> {result.nullifier}</div>
          <div><strong>Proof Hash:</strong> {result.proofHash}</div>
          <div><strong>Marca de Tiempo:</strong> {result.timestamp}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="zk-banner zk-banner-fail">
      <h4 style={{ fontSize: '1.25rem' }}>✕ VERIFICACIÓN FALLIDA — SIN COINCIDENCIA</h4>
      <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>La prueba de conocimiento cero generó un resultado negativo para el criterio: {result.criteria}</p>
    </div>
  );
};

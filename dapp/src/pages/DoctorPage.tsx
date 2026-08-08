/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { DoctorPortal } from '../components/DoctorPortal';
import { useWallet } from '../hooks/useWallet';

export const DoctorPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Portal del Proveedor Médico</h1>
        <p>Emite atestaciones verificadas para tus pacientes de forma segura</p>
      </div>

      {!isConnected ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ marginBottom: '16px' }}>Wallet No Conectada</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Por favor conecta tu wallet de Midnight para acceder a las herramientas del proveedor.</p>
        </div>
      ) : (
        <DoctorPortal />
      )}
    </div>
  );
};

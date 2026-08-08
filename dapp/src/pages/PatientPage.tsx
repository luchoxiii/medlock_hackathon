/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { PatientVault } from '../components/PatientVault';
import { useWallet } from '../hooks/useWallet';

export const PatientPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="container section">
      <div className="page-header">
        <h1>Bóveda del Paciente</h1>
        <p>Gestiona tus credenciales médicas y configuraciones de privacidad</p>
      </div>

      {!isConnected ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ marginBottom: '16px' }}>Wallet No Conectada</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Por favor conecta tu wallet de Midnight para acceder a tu bóveda.</p>
        </div>
      ) : (
        <PatientVault />
      )}
    </div>
  );
};

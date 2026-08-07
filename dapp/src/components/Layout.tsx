/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { WalletConnector } from './WalletConnector';

export const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          ◉ MedLock
        </Link>
        <div className="navbar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/patient" className={`nav-link ${location.pathname === '/patient' ? 'active' : ''}`}>Patient</Link>
          <Link to="/doctor" className={`nav-link ${location.pathname === '/doctor' ? 'active' : ''}`}>Doctor</Link>
          <Link to="/emergency" className={`nav-link ${location.pathname === '/emergency' ? 'active' : ''}`}>Emergency</Link>
        </div>
        <WalletConnector />
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <p>Built on Midnight Network • Apache 2.0 License • Sovereignty through ZK Cryptography</p>
      </footer>
    </div>
  );
};

/*
 * Copyright 2026 MedLock
 * Licensed under the Apache License, Version 2.0
 */


import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { PatientPage } from './pages/PatientPage';
import { DoctorPage } from './pages/DoctorPage';
import { EmergencyPage } from './pages/EmergencyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="patient" element={<PatientPage />} />
        <Route path="doctor" element={<DoctorPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
      </Route>
    </Routes>
  );
}

export default App;

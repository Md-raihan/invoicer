/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { CreateInvoice } from './pages/CreateInvoice';
import { CreateBill } from './pages/CreateBill';
import { CreatePayslip } from './pages/CreatePayslip';
import { CreateResume } from './pages/CreateResume';
import { CreateLicense } from './pages/CreateLicense';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<CreateInvoice />} />
              <Route path="invoices/:id/edit" element={<CreateInvoice />} />
              <Route path="bills/new" element={<CreateBill />} />
              <Route path="payslips/new" element={<CreatePayslip />} />
              <Route path="resumes/new" element={<CreateResume />} />
              <Route path="licenses/new" element={<CreateLicense />} />
              <Route path="clients" element={<Clients />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );
}

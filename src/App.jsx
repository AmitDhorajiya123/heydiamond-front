import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />

              {/* Inventory - Diamond management with sync */}
              <Route path="/inventory" element={
                <ProtectedRoute adminOnly><Inventory /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
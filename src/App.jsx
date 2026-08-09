import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* Vendor Routes (Reusing components for demo) */}
          <Route path="/vendor/dashboard" element={<Dashboard />} />
          <Route path="/vendor/inventory" element={<Inventory />} />
          <Route path="/vendor/orders" element={<Dashboard />} />
          <Route path="/vendor/settings" element={<Settings />} />

          {/* User Routes (Reusing components for demo) */}
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user/search" element={<Inventory />} />
          <Route path="/user/orders" element={<Dashboard />} />
          <Route path="/user/profile" element={<Settings />} />

          {/* Legacy routes fallback */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminPanel from './panels/admin/AdminPanel';
import VendorPanel from './panels/vendor/VendorPanel';
import UserPanel from './panels/user/UserPanel';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Role-based Panels */}
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/vendor/*" element={<VendorPanel />} />
          <Route path="/user/*" element={<UserPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

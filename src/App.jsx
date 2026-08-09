import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import NewArrivals from './pages/NewArrivals';
import Orders from './pages/Orders';
import HoldRequests from './pages/HoldRequests';
import Cart from './pages/Cart';
import Compare from './pages/Compare';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/hold-requests" element={<HoldRequests />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

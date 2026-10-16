import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Category from './pages/Category';
import BgmBlackOption from './pages/BgmBlackOption';
import Clarity from './pages/Clarity';
import Color from './pages/Color';
import FinishGrade from './pages/FinishGrade';
import Fluorescence from './pages/Fluorescence';
import Lab from './pages/Lab';
import Location from './pages/Location';
import Shape from './pages/Shape';
import SizeRange from './pages/SizeRange';
import Subcategory from './pages/Subcategory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            {/* Master pages - admin only */}
            <Route path="/category" element={
              <ProtectedRoute adminOnly><Category /></ProtectedRoute>
            } />
            <Route path="/bgm-black-option" element={
              <ProtectedRoute adminOnly><BgmBlackOption /></ProtectedRoute>
            } />
            <Route path="/clarity" element={
              <ProtectedRoute adminOnly><Clarity /></ProtectedRoute>
            } />
            <Route path="/color" element={
              <ProtectedRoute adminOnly><Color /></ProtectedRoute>
            } />
            <Route path="/finish-grade" element={
              <ProtectedRoute adminOnly><FinishGrade /></ProtectedRoute>
            } />
            <Route path="/fluorescence" element={
              <ProtectedRoute adminOnly><Fluorescence /></ProtectedRoute>
            } />
            <Route path="/lab" element={
              <ProtectedRoute adminOnly><Lab /></ProtectedRoute>
            } />
            <Route path="/location" element={
              <ProtectedRoute adminOnly><Location /></ProtectedRoute>
            } />
            <Route path="/shape" element={
              <ProtectedRoute adminOnly><Shape /></ProtectedRoute>
            } />
            <Route path="/size-range" element={
              <ProtectedRoute adminOnly><SizeRange /></ProtectedRoute>
            } />
            <Route path="/subcategory" element={
              <ProtectedRoute adminOnly><Subcategory /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

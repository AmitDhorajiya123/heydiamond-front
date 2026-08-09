import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Gem, Users, Settings } from 'lucide-react';
import Layout from '../../components/Layout';
import Dashboard from '../../pages/Dashboard';
import Inventory from '../../pages/Inventory';
import UsersPage from '../../pages/Users';
import SettingsPage from '../../pages/Settings';

const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <Gem size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const AdminPanel = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout role="Admin" title="Admin Dashboard" links={adminLinks}><Dashboard /></Layout>} />
            <Route path="/inventory" element={<Layout role="Admin" title="Full Inventory" links={adminLinks}><Inventory /></Layout>} />
            <Route path="/users" element={<Layout role="Admin" title="User Management" links={adminLinks}><UsersPage /></Layout>} />
            <Route path="/settings" element={<Layout role="Admin" title="System Settings" links={adminLinks}><SettingsPage /></Layout>} />
        </Routes>
    );
};

export default AdminPanel;

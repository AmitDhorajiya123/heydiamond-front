import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Gem, User } from 'lucide-react';
import Layout from '../../components/Layout';
import Dashboard from '../../pages/Dashboard';
import Inventory from '../../pages/Inventory';

const vendorLinks = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/vendor/inventory', label: 'My Diamonds', icon: <Gem size={20} /> },
    { path: '/vendor/profile', label: 'Profile', icon: <User size={20} /> },
];

const VendorPanel = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout role="Vendor" title="Vendor Dashboard" links={vendorLinks}><Dashboard /></Layout>} />
            <Route path="/inventory" element={<Layout role="Vendor" title="My Diamonds" links={vendorLinks}><Inventory /></Layout>} />
            <Route path="/profile" element={<Layout role="Vendor" title="Vendor Profile" links={vendorLinks}><div style={{ padding: '32px' }}>Profile Settings Coming Soon</div></Layout>} />
        </Routes>
    );
};

export default VendorPanel;

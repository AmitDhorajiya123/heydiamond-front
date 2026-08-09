import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Heart, User } from 'lucide-react';
import Layout from '../../components/Layout';
import Inventory from '../../pages/Inventory';

const userLinks = [
    { path: '/user/dashboard', label: 'Browse Diamonds', icon: <LayoutDashboard size={20} /> },
    { path: '/user/wishlist', label: 'My Wishlist', icon: <Heart size={20} /> },
    { path: '/user/profile', label: 'Profile', icon: <User size={20} /> },
];

const UserPanel = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout role="User" title="Browse Diamonds" links={userLinks}><Inventory /></Layout>} />
            <Route path="/wishlist" element={<Layout role="User" title="My Wishlist" links={userLinks}><div style={{ padding: '32px' }}>Wishlist Coming Soon</div></Layout>} />
            <Route path="/profile" element={<Layout role="User" title="User Profile" links={userLinks}><div style={{ padding: '32px' }}>Profile Settings Coming Soon</div></Layout>} />
        </Routes>
    );
};

export default UserPanel;

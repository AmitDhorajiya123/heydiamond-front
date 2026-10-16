import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guards a route. `adminOnly` restricts master pages to admin users.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, booting } = useAuth();
    const location = useLocation();

    if (booting) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
                color: 'var(--color-text-light)',
                backgroundColor: '#f8f5f2',
            }}>
                <Loader2 size={28} className="spin" />
                <span style={{ fontSize: '14px' }}>Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;

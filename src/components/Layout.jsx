import React from 'react';
import {
    LayoutDashboard,
    Gem,
    Users,
    Settings,
    LogOut,
    Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Layout = ({ children, title }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Hey Diamond" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/inventory" className={`nav-item ${isActive('/inventory')}`}>
                        <Gem size={20} />
                        <span>Inventory</span>
                    </Link>
                    <Link to="/users" className={`nav-item ${isActive('/users')}`}>
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>
                <div className="sidebar-nav" style={{ flex: 'none', borderTop: '1px solid var(--color-input-border)' }}>
                    <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <h1 className="header-title">{title}</h1>
                    <div className="header-actions">
                        <button className="action-btn">
                            <Bell size={20} />
                        </button>
                        <div className="user-profile">
                            <div className="avatar">A</div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

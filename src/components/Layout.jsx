import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Layout = ({ children, title, role, links }) => {
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
                <div style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-input-border)' }}>
                    {role} Panel
                </div>
                <nav className="sidebar-nav">
                    {links.map((link, index) => (
                        <Link key={index} to={link.path} className={`nav-item ${isActive(link.path)}`}>
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
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
                            <div className="avatar">{role.charAt(0)}</div>
                            <div className="user-info">
                                <span className="user-name">Test {role}</span>
                                <span className="user-role">{role}</span>
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

import React from 'react';
import {
    LayoutDashboard,
    Gem,
    Users,
    Settings,
    LogOut,
    Bell,
    Search,
    ShoppingCart,
    User as UserIcon,
    Package
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Layout = ({ children, title }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'admin';

    const handleLogout = () => {
        // Clear role from localStorage on logout
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Define navigation links based on role
    const getNavLinks = () => {
        switch (role) {
            case 'vendor':
                return [
                    { path: '/vendor/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                    { path: '/vendor/inventory', icon: <Package size={20} />, label: 'My Inventory' },
                    { path: '/vendor/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
                    { path: '/vendor/settings', icon: <Settings size={20} />, label: 'Settings' },
                ];
            case 'user':
                return [
                    { path: '/user/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                    { path: '/user/search', icon: <Search size={20} />, label: 'Search Diamonds' },
                    { path: '/user/orders', icon: <ShoppingCart size={20} />, label: 'My Orders' },
                    { path: '/user/profile', icon: <UserIcon size={20} />, label: 'Profile' },
                ];
            case 'admin':
            default:
                return [
                    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                    { path: '/admin/inventory', icon: <Gem size={20} />, label: 'All Inventory' },
                    { path: '/admin/users', icon: <Users size={20} />, label: 'Manage Users' },
                    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
                ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Hey Diamond" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path} className={`nav-item ${isActive(link.path)}`}>
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
                            <div className="avatar">{role.charAt(0).toUpperCase()}</div>
                            <div className="user-info">
                                <span className="user-name">{role === 'admin' ? 'Admin User' : role === 'vendor' ? 'Vendor Account' : 'Customer'}</span>
                                <span className="user-role" style={{ textTransform: 'capitalize' }}>{role}</span>
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

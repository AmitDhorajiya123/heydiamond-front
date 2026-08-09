import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Search,
    Package,
    ShoppingCart,
    Clock,
    LogOut,
    Bell,
    Phone,
    Menu,
    User,
    Mail,
    GitCompare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
        const saved = localStorage.getItem('sidebarMinimized');
        return saved === 'true';
    });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebarMinimized', isSidebarMinimized);
    }, [isSidebarMinimized]);

    const handleLogout = () => {
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className={`dashboard-layout ${isSidebarMinimized ? 'sidebar-minimized' : ''} ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
            {/* Overlay for mobile sidebar */}
            {isMobileSidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/favicon.png" alt="Hey Diamond" className="sidebar-logo-minimized" style={{ maxHeight: '32px', width: 'auto' }} />
                    <img src="/logo.png" alt="Hey Diamond" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`} title="Dashboard">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/inventory" className={`nav-item ${isActive('/inventory')}`} title="Diamonds Search">
                        <Search size={20} />
                        <span>Diamonds Search</span>
                    </Link>
                    <Link to="/new-arrivals" className={`nav-item ${isActive('/new-arrivals')}`} title="New Arrival Stock">
                        <Package size={20} />
                        <span>New Arrival Stock</span>
                    </Link>
                    <Link to="/orders" className={`nav-item ${isActive('/orders')}`} title="My Order">
                        <ShoppingCart size={20} />
                        <span>My Order</span>
                    </Link>
                    <Link to="/hold-requests" className={`nav-item ${isActive('/hold-requests')}`} title="My Hold Request">
                        <Clock size={20} />
                        <span>My Hold Request</span>
                    </Link>
                    <Link to="/cart" className={`nav-item ${isActive('/cart')}`} title="My Cart">
                        <ShoppingCart size={20} />
                        <span>My Cart</span>
                    </Link>
                    <Link to="/compare" className={`nav-item ${isActive('/compare')}`} title="View Compare">
                        <GitCompare size={20} />
                        <span>View Compare</span>
                    </Link>
                </nav>
                <div className="sidebar-nav" style={{ flex: 'none', borderTop: '1px solid var(--color-input-border)' }}>
                    <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }} title="Log Out">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
                <button
                    className="sidebar-edge-toggle"
                    onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                >
                    {isSidebarMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <button className="mobile-menu-toggle" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
                            <Menu size={24} />
                        </button>
                        <div className="header-search">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search..." />
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="seller-detail">
                            <strong>Your Seller Detail:</strong>
                            <div className="seller-info">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> Lalji Chovatiya</span>
                                <span>/</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> 6353388010</span>
                                <span>/</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> anand@heydiamond.com</span>
                            </div>
                        </div>

                        <div className="header-icons">
                            <button className="icon-btn">
                                <Bell size={18} />
                                <span className="badge">0</span>
                            </button>
                            <button className="icon-btn">
                                <Phone size={18} />
                            </button>
                            <button className="icon-btn">
                                <ShoppingCart size={18} />
                                <span className="badge">0</span>
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--color-input-border)', paddingLeft: '16px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span>LC</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }} className="user-profile-text">
                                <span style={{ color: 'var(--color-text-light)' }}>Welcome,</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Lalji Chovatiya</span>
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

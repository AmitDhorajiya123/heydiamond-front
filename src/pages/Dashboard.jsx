import React, { useState } from 'react';
import {
    LayoutDashboard,
    Gem,
    Users,
    Settings,
    LogOut,
    Search,
    Bell,
    MoreVertical,
    Edit,
    Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';

// Mock Data for Diamond Inventory
const diamondData = [
    { id: 'DIA-1001', shape: 'Round', carat: 1.05, color: 'D', clarity: 'FL', cut: 'Excellent', price: '$12,500', status: 'Available' },
    { id: 'DIA-1002', shape: 'Princess', carat: 2.10, color: 'E', clarity: 'VVS1', cut: 'Very Good', price: '$18,200', status: 'Reserved' },
    { id: 'DIA-1003', shape: 'Emerald', carat: 1.50, color: 'F', clarity: 'VS1', cut: 'Excellent', price: '$9,800', status: 'Available' },
    { id: 'DIA-1004', shape: 'Oval', carat: 3.00, color: 'G', clarity: 'VS2', cut: 'Good', price: '$24,000', status: 'Sold' },
    { id: 'DIA-1005', shape: 'Cushion', carat: 1.20, color: 'D', clarity: 'IF', cut: 'Excellent', price: '$14,100', status: 'Available' },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        // In a real app, clear tokens here
        navigate('/login');
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available': return 'status-available';
            case 'Sold': return 'status-sold';
            case 'Reserved': return 'status-reserved';
            default: return '';
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Hey Diamond" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/inventory" className="nav-item">
                        <Gem size={20} />
                        <span>Inventory</span>
                    </Link>
                    <Link to="/users" className="nav-item">
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
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
                    <h1 className="header-title">Diamond Inventory</h1>
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
                    <div className="table-container">
                        <div className="table-header">
                            <h2 className="table-title">Recent Listings</h2>
                            <div className="table-actions">
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search diamonds..."
                                        style={{ paddingLeft: '36px' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="submit-button" style={{ margin: 0, padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}>
                                    Add Diamond
                                </button>
                            </div>
                        </div>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Shape</th>
                                    <th>Carat</th>
                                    <th>Color</th>
                                    <th>Clarity</th>
                                    <th>Cut</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diamondData.map((diamond) => (
                                    <tr key={diamond.id}>
                                        <td style={{ fontWeight: 500 }}>{diamond.id}</td>
                                        <td>{diamond.shape}</td>
                                        <td>{diamond.carat}</td>
                                        <td>{diamond.color}</td>
                                        <td>{diamond.clarity}</td>
                                        <td>{diamond.cut}</td>
                                        <td style={{ fontWeight: 600 }}>{diamond.price}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(diamond.status)}`}>
                                                {diamond.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="action-btn"><Edit size={16} /></button>
                                            <button className="action-btn"><Trash2 size={16} /></button>
                                            <button className="action-btn"><MoreVertical size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

import React, { useState } from 'react';
import { Search, MoreVertical, Edit, Trash2, Shield, User } from 'lucide-react';
import Layout from '../components/Layout';

const usersData = [
    { id: 'USR-001', name: 'Amit Dhorajiya', email: 'admin@example.com', role: 'Super Admin', status: 'Active', joined: '2026-01-15' },
    { id: 'USR-002', name: 'John Smith', email: 'john@example.com', role: 'Vendor', status: 'Active', joined: '2026-03-22' },
    { id: 'USR-003', name: 'Sarah Connor', email: 'sarah@example.com', role: 'Operator', status: 'Inactive', joined: '2026-05-10' },
    { id: 'USR-004', name: 'Michael Doe', email: 'michael@example.com', role: 'Vendor', status: 'Active', joined: '2026-06-05' },
];

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusClass = (status) => {
        return status === 'Active' ? 'status-available' : 'status-sold';
    };

    return (
        <Layout title="User Management">
            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">System Users</h2>
                    <div className="table-actions">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users..."
                                style={{ paddingLeft: '36px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="submit-button" style={{ margin: 0, padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}>
                            Add New User
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.map((user) => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: 500 }}>{user.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                            <User size={16} />
                                        </div>
                                        {user.name}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {user.role === 'Super Admin' && <Shield size={14} color="var(--color-primary)" />}
                                        {user.role}
                                    </div>
                                </td>
                                <td>{user.joined}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                                        {user.status}
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
        </Layout>
    );
};

export default Users;

import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import Layout from '../components/Layout';

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Layout title="My Orders">
            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">My Orders</h2>
                    <div className="table-actions">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search orders..."
                                style={{ paddingLeft: '36px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="action-btn-secondary" style={{ padding: '8px 16px', margin: 0 }}>
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                You have no orders yet.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Orders;

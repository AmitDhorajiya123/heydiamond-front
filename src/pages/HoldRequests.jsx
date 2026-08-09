import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import Layout from '../components/Layout';

const HoldRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Layout title="My Hold Requests">
            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">My Hold Requests</h2>
                    <div className="table-actions">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search requests..."
                                style={{ paddingLeft: '36px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Stone ID</th>
                            <th>Date Requested</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                <Clock size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <div>No hold requests found.</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default HoldRequests;

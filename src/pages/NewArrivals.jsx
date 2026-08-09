import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';

const NewArrivals = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Layout title="New Arrival Stock">
            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">New Arrival Stock</h2>
                    <div className="table-actions">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search stones..."
                                style={{ paddingLeft: '36px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="action-btn-secondary" style={{ padding: '8px 16px', margin: 0 }}>
                            <Filter size={16} /> Filter
                        </button>
                        <button className="action-btn-secondary" style={{ padding: '8px 16px', margin: 0 }}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Stone ID</th>
                            <th>Shape</th>
                            <th>Carat</th>
                            <th>Color</th>
                            <th>Clarity</th>
                            <th>Cut</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                No new arrivals found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default NewArrivals;

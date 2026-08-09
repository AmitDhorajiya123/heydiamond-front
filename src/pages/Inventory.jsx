import React, { useState } from 'react';
import { Search, MoreVertical, Edit, Trash2, Filter } from 'lucide-react';
import Layout from '../components/Layout';

const inventoryData = [
    { id: 'DIA-1001', stockNo: 'STK-001', shape: 'Round', carat: 1.05, color: 'D', clarity: 'FL', cut: 'Excellent', polish: 'Excellent', symmetry: 'Excellent', fluor: 'None', price: '$12,500', status: 'Available' },
    { id: 'DIA-1002', stockNo: 'STK-002', shape: 'Princess', carat: 2.10, color: 'E', clarity: 'VVS1', cut: 'Very Good', polish: 'Excellent', symmetry: 'Very Good', fluor: 'Faint', price: '$18,200', status: 'Reserved' },
    { id: 'DIA-1003', stockNo: 'STK-003', shape: 'Emerald', carat: 1.50, color: 'F', clarity: 'VS1', cut: 'Excellent', polish: 'Very Good', symmetry: 'Excellent', fluor: 'None', price: '$9,800', status: 'Available' },
    { id: 'DIA-1004', stockNo: 'STK-004', shape: 'Oval', carat: 3.00, color: 'G', clarity: 'VS2', cut: 'Good', polish: 'Good', symmetry: 'Good', fluor: 'Medium', price: '$24,000', status: 'Sold' },
    { id: 'DIA-1005', stockNo: 'STK-005', shape: 'Cushion', carat: 1.20, color: 'D', clarity: 'IF', cut: 'Excellent', polish: 'Excellent', symmetry: 'Excellent', fluor: 'None', price: '$14,100', status: 'Available' },
];

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available': return 'status-available';
            case 'Sold': return 'status-sold';
            case 'Reserved': return 'status-reserved';
            default: return '';
        }
    };

    return (
        <Layout title="Full Inventory">
            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">All Diamonds</h2>
                    <div className="table-actions">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search inventory..."
                                style={{ paddingLeft: '36px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="action-btn" style={{ border: '1px solid var(--color-input-border)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} /> Filters
                        </button>
                        <button className="submit-button" style={{ margin: 0, padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}>
                            Import Data
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table className="data-table" style={{ minWidth: 'max-content' }}>
                        <thead>
                            <tr>
                                <th style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#faf8f5' }}>ID</th>
                                <th style={{ position: 'sticky', left: '80px', zIndex: 2, backgroundColor: '#faf8f5' }}>Stock No</th>
                                <th>Shape</th>
                                <th>Carat</th>
                                <th>Color</th>
                                <th>Clarity</th>
                                <th>Cut</th>
                                <th>Polish</th>
                                <th>Symmetry</th>
                                <th>Fluor</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ position: 'sticky', right: 0, zIndex: 2, backgroundColor: '#faf8f5', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.map((diamond) => (
                                <tr key={diamond.id} style={{ backgroundColor: '#ffffff' }}>
                                    <td style={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'inherit', fontWeight: 500 }}>{diamond.id}</td>
                                    <td style={{ position: 'sticky', left: '80px', zIndex: 1, backgroundColor: 'inherit' }}>{diamond.stockNo}</td>
                                    <td>{diamond.shape}</td>
                                    <td>{diamond.carat}</td>
                                    <td>{diamond.color}</td>
                                    <td>{diamond.clarity}</td>
                                    <td>{diamond.cut}</td>
                                    <td>{diamond.polish}</td>
                                    <td>{diamond.symmetry}</td>
                                    <td>{diamond.fluor}</td>
                                    <td style={{ fontWeight: 600 }}>{diamond.price}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(diamond.status)}`}>
                                            {diamond.status}
                                        </span>
                                    </td>
                                    <td style={{ position: 'sticky', right: 0, zIndex: 1, backgroundColor: 'inherit', textAlign: 'right' }}>
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
        </Layout>
    );
};

export default Inventory;

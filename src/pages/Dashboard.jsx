import React from 'react';
import { Gem, ShoppingCart, Package } from 'lucide-react';
import Layout from '../components/Layout';

const summaryData = [
    { count: '12592', label: 'ROUND' },
    { count: '4', label: 'PRINCESS' },
    { count: '12', label: 'PEAR' },
    { count: '1', label: 'CUSHION' },
    { count: '199', label: 'OVAL' },
    { count: '4', label: 'EMERALD' },
    { count: '35', label: 'RADIANT' },
    { count: '41', label: 'MARQUISE' },
    { count: '4', label: 'SQUARE C...' },
];

const Dashboard = () => {
    return (
        <Layout>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-dark)', marginBottom: '20px' }}>Dashboard</h2>

            <div className="dashboard-grid">
                {summaryData.map((item, index) => (
                    <div className="summary-card" key={index}>
                        <div className="summary-info">
                            <span className="summary-count">{item.count}</span>
                            <span className="summary-label">{item.label}</span>
                        </div>
                        <Gem className="summary-icon" />
                    </div>
                ))}
            </div>

            <div className="dashboard-grid" style={{ marginTop: '20px' }}>
                <div className="summary-card">
                    <div className="summary-info">
                        <span className="summary-label" style={{ color: 'var(--color-text-dark)', fontSize: '14px', borderBottom: '2px solid var(--color-text-dark)', paddingBottom: '4px', marginBottom: '12px', display: 'inline-block' }}>My Cart</span>
                        <span className="summary-count">0</span>
                    </div>
                    <ShoppingCart className="summary-icon" style={{ opacity: 0.2 }} />
                </div>

                <div className="summary-card">
                    <div className="summary-info">
                        <span className="summary-label" style={{ color: 'var(--color-text-dark)', fontSize: '14px', borderBottom: '2px solid var(--color-text-dark)', paddingBottom: '4px', marginBottom: '12px', display: 'inline-block' }}>New Arrivals</span>
                        <span className="summary-count">3362</span>
                    </div>
                    <Package className="summary-icon" style={{ opacity: 0.2 }} />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

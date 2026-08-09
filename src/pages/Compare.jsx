import React from 'react';
import { GitCompare, Plus } from 'lucide-react';
import Layout from '../components/Layout';

const Compare = () => {
    return (
        <Layout title="View Compare">
            <div className="table-container" style={{ padding: '40px', textAlign: 'center' }}>
                <GitCompare size={64} style={{ color: 'var(--color-primary)', opacity: 0.2, margin: '0 auto 24px' }} />
                <h2 className="table-title" style={{ marginBottom: '12px' }}>No stones to compare</h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px' }}>
                    Select stones from the inventory to compare their specifications side-by-side.
                </p>
                <button className="action-btn-secondary" style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Add Stones to Compare
                </button>
            </div>
        </Layout>
    );
};

export default Compare;

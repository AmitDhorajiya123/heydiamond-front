import React, { useEffect, useState } from 'react';
import {
    Package,
    Gem,
    Layers,
    Diamond,
    Flower2,
    Droplet,
    Microscope,
    Shapes,
    Scale,
    Tag,
    Loader2,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import Layout from '../components/Layout';
import dashboardApi from '../apis/dashboard';
import { useToast } from '../context/ToastContext';

const iconMap = {
    categories: Package,
    bgm_black_options: Gem,
    clarities: Layers,
    colors: Diamond,
    finish_grades: Flower2,
    fluorescences: Droplet,
    labs: Microscope,
    shapes: Shapes,
    size_ranges: Scale,
    subcategories: Tag,
};

const labelMap = {
    categories: 'Categories',
    bgm_black_options: 'BGM / Black Options',
    clarities: 'Clarities',
    colors: 'Colors',
    finish_grades: 'Finish Grades',
    fluorescences: 'Fluorescences',
    labs: 'Labs',
    shapes: 'Shapes',
    size_ranges: 'Size Ranges',
    subcategories: 'Subcategories',
};

const Dashboard = () => {
    const { showToast } = useToast();
    const [counts, setCounts] = useState({});
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCounts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardApi.getCounts();
            if (res?.success && res?.data?.counts) {
                setCounts(res.data.counts);
                setTotal(res.data.total || 0);
            } else {
                throw new Error(res?.message || 'Failed to load counts');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load dashboard counts';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    // Compute card data for display
    const cardEntries = Object.entries(labelMap).map(([key, label]) => ({
        key,
        label,
        count: counts[key] ?? 0,
        Icon: iconMap[key] || Package,
    }));

    return (
        <Layout>
            {/* Toast/Error notifications are handled by ToastProvider */}

            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--color-text-dark)',
                    fontFamily: 'var(--font-serif)',
                    marginBottom: '8px'
                }}>
                    Dashboard
                </h2>
                <p style={{ color: 'var(--color-text-light)', fontSize: '14px' }}>
                    Overview of all master data records
                </p>
            </div>

            {loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    color: 'var(--color-text-light)',
                    gap: '12px'
                }}>
                    <Loader2 size={24} className="spin" />
                    <span>Loading dashboard data...</span>
                </div>
            )}

            {!loading && error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#d93025',
                    backgroundColor: '#fce8e6',
                    border: '1px solid #f5c6cb',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button
                        onClick={fetchCounts}
                        style={{
                            marginLeft: 'auto',
                            padding: '6px 12px',
                            border: '1px solid #d93025',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#d93025',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Total summary card */}
                    {/* <div style={{
                        marginBottom: '24px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #7a5e43 100%)',
                        borderRadius: '16px',
                        color: '#fff',
                        boxShadow: '0 8px 24px rgba(151, 117, 84, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Total Master Records
                                </div>
                                <div style={{ fontSize: '42px', fontWeight: '700', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                                    {total.toLocaleString()}
                                </div>
                            </div>
                            <div style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(8px)'
                            }}>
                                <Gem size={32} />
                            </div>
                        </div>
                    </div> */}

                    {/* Individual count cards */}
                    <div className="dashboard-grid">
                        {cardEntries.map(({ key, label, count, Icon }) => (
                            <div className="summary-card" key={key} style={{
                                borderLeft: '4px solid var(--color-primary)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}>
                                <div className="summary-info">
                                    <span className="summary-count">{count.toLocaleString()}</span>
                                    <span className="summary-label">{label}</span>
                                </div>
                                <Icon className="summary-icon" style={{ opacity: 0.2 }} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;
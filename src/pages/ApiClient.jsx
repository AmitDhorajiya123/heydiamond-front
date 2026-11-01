import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import diamondApi from '../apis/diamond';

const ApiClientPage = () => {
    const [apiClients, setApiClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedApiId, setSelectedApiId] = useState('');

    const loadApiClients = async () => {
        setLoading(true);
        try {
            const response = await diamondApi.apiClients();
            let payload = response;
            if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                payload = response.data;
            }
            const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
            setApiClients(list);
            if (!selectedApiId && list.length) {
                setSelectedApiId(String(list[0].id));
            }
        } catch (err) {
            console.error('Failed to load API clients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApiClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addApiClient = async () => {
        const name = window.prompt('Enter API name:', 'My API');
        const url = window.prompt('Enter API URL:', 'https://');
        if (!name || !url) return;

        try {
            const response = await diamondApi.createApiClient({ name, url });
            if (response?.success) {
                await loadApiClients();
            }
        } catch (err) {
            console.error('Failed to create API client:', err);
        }
    };

    const removeApiClient = async (id) => {
        try {
            const response = await diamondApi.deleteApiClient(id);
            if (response?.success) {
                await loadApiClients();
                if (String(selectedApiId) === String(id)) {
                    setSelectedApiId('');
                }
            }
        } catch (err) {
            console.error('Failed to delete API client:', err);
        }
    };

    return (
        <Layout>
            <div className="table-header">
                <h1 className="table-title">API / FTP Client</h1>
                <div className="table-actions">
                    <button className="submit-button secondary" onClick={addApiClient} disabled={false}>
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Add API
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '140px' }}>API Name</th>
                                <th style={{ width: '420px' }}>API URL</th>
                                <th style={{ width: '110px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiClients.map((client) => (
                                <tr key={client.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={14} />
                                            <strong>{client.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{client.url}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start' }}>
                                            <button className="action-btn" onClick={() => setSelectedApiId(String(client.id))}>
                                                Use
                                            </button>
                                            <button className="action-btn" onClick={() => removeApiClient(client.id)}>
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && apiClients.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                        No API clients configured.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ApiClientPage;

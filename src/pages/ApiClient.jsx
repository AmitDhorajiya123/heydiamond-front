import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, Pencil, X, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import diamondApi from '../apis/diamond';
import { useToast } from '../context/ToastContext';

const emptyForm = { name: '', url: '', markup: '' };

const ApiClientPage = () => {
    const { showToast } = useToast();

    const [apiClients, setApiClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Add / edit modal
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    // Delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

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
        } catch (err) {
            console.error('Failed to load API clients:', err);
            showToast('Failed to load API clients.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApiClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
        setFormOpen(true);
    };

    const openEdit = (client) => {
        setEditingId(client.id);
        setForm({
            name: client.name || '',
            url: client.url || '',
            markup: client.markup !== undefined && client.markup !== null ? String(client.markup) : '',
        });
        setFormError('');
        setFormOpen(true);
    };

    const closeForm = () => {
        if (saving) return;
        setFormOpen(false);
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const name = form.name.trim();
        const url = form.url.trim();
        const markup = form.markup === '' ? 0 : Number(form.markup);

        if (!name) {
            setFormError('API name is required.');
            return;
        }
        if (!url) {
            setFormError('API URL is required.');
            return;
        }
        if (Number.isNaN(markup) || markup < 0) {
            setFormError('Markup must be a valid percentage (0 or more).');
            return;
        }

        setSaving(true);
        try {
            const payload = { name, url, markup };

            if (editingId) {
                await diamondApi.updateApiClient(editingId, payload);
                showToast('API client updated successfully.', 'success');
            } else {
                await diamondApi.createApiClient(payload);
                showToast('API client created successfully.', 'success');
            }

            setFormOpen(false);
            setEditingId(null);
            setForm(emptyForm);
            await loadApiClients();
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to save API client.';
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await diamondApi.deleteApiClient(deleteTarget.id);
            showToast('API client deleted successfully.', 'success');
            setDeleteTarget(null);
            await loadApiClients();
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to delete API client.';
            showToast(message, 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Layout>
            <div className="table-header">
                <h1 className="table-title">API / FTP Client</h1>
                <div className="table-actions">
                    <button className="submit-button secondary" onClick={openCreate}>
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
                                <th style={{ width: '200px' }}>API Name</th>
                                <th style={{ width: '420px' }}>API URL</th>
                                <th style={{ width: '130px' }}>Markup %</th>
                                <th style={{ width: '160px' }}>Actions</th>
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
                                        <span className="status-badge status-available">
                                            {Number(client.markup || 0).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start' }}>
                                            <button
                                                className="action-btn"
                                                onClick={() => openEdit(client)}
                                                title="Edit API client"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={() => setDeleteTarget(client)}
                                                title="Delete API client"
                                                style={{ color: '#d93025' }}
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && apiClients.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                        No API clients configured.
                                    </td>
                                </tr>
                            )}
                            {loading && apiClients.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit API Client Modal */}
            {formOpen && (
                <div className="modal-overlay" onClick={closeForm}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId ? 'Edit API Client' : 'Add API Client'}</h2>
                            <button type="button" className="modal-close" onClick={closeForm}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">
                                        API Name <span className="required">*</span>
                                    </label>
                                    <input
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. NoMDiamonds"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        API URL <span className="required">*</span>
                                    </label>
                                    <input
                                        className="form-input"
                                        value={form.url}
                                        onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://example.com/api/diamonds"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Markup Margin (%)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.markup}
                                        onChange={(e) => setForm((prev) => ({ ...prev, markup: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--color-text-light)' }}>
                                        Percentage added to $/ct and total price on the inventory listing.
                                    </p>
                                </div>

                                {formError && <p className="form-error">{formError}</p>}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="submit-button secondary"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="submit-button" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        editingId ? 'Update' : 'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
                    <div className="modal-container modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete API Client</h2>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => !deleting && setDeleteTarget(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="submit-button secondary"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="submit-button danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Layout>
    );
};

export default ApiClientPage;

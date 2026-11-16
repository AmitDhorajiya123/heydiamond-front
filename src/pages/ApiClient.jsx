import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, Pencil, X, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import diamondApi from '../apis/diamond';
import { useToast } from '../context/ToastContext';

const createEmptyForm = () => ({
    name: '',
    url: '',
    markup: '',
    markups: [],
});

const emptyRange = { min_value: '', max_value: '', markup: '' };

const formatRangeValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatRange = (range) => {
    const min = formatRangeValue(range.min_value);
    const hasMax = range.max_value !== null && range.max_value !== undefined && range.max_value !== '';
    return hasMax ? `${min} – ${formatRangeValue(range.max_value)}` : `${min}+`;
};

const parseOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
};

const ApiClientPage = () => {
    const { showToast } = useToast();

    const [apiClients, setApiClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Add / edit modal
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(createEmptyForm);
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
        setForm(createEmptyForm());
        setFormError('');
        setFormOpen(true);
    };

    const openEdit = (client) => {
        setEditingId(client.encrypted_id);
        setForm({
            name: client.name || '',
            url: client.url || '',
            markup: client.markup !== undefined && client.markup !== null ? String(client.markup) : '',
            markups: Array.isArray(client.markups)
                ? client.markups.map((range) => ({
                    min_value: range.min_value !== undefined && range.min_value !== null ? String(range.min_value) : '',
                    max_value: range.max_value !== undefined && range.max_value !== null ? String(range.max_value) : '',
                    markup: range.markup !== undefined && range.markup !== null ? String(range.markup) : '',
                }))
                : [],
        });
        setFormError('');
        setFormOpen(true);
    };

    const closeForm = () => {
        if (saving) return;
        setFormOpen(false);
        setEditingId(null);
        setForm(createEmptyForm());
        setFormError('');
    };

    const addRange = () => {
        setForm((prev) => ({ ...prev, markups: [...prev.markups, { ...emptyRange }] }));
    };

    const updateRange = (index, key, value) => {
        setForm((prev) => ({
            ...prev,
            markups: prev.markups.map((range, rangeIndex) => (
                rangeIndex === index ? { ...range, [key]: value } : range
            )),
        }));
    };

    const removeRange = (index) => {
        setForm((prev) => ({
            ...prev,
            markups: prev.markups.filter((_, rangeIndex) => rangeIndex !== index),
        }));
    };

    const applyStandardTiers = () => {
        setForm((prev) => ({
            ...prev,
            markups: [
                { min_value: '0', max_value: '100', markup: '' },
                { min_value: '101', max_value: '200', markup: '' },
                { min_value: '201', max_value: '300', markup: '' },
                { min_value: '301', max_value: '', markup: '' },
            ],
        }));
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
            setFormError('Default markup must be a valid percentage (0 or more).');
            return;
        }

        // Validate every range before sending it to the backend.
        let ranges = [];
        try {
            ranges = form.markups.map((range, index) => {
                const min = parseOptionalNumber(range.min_value);
                const max = parseOptionalNumber(range.max_value);
                const rangeMarkup = parseOptionalNumber(range.markup);

                if (min === null || Number.isNaN(min) || min < 0) {
                    throw new Error(`Range ${index + 1}: enter a valid "From" value.`);
                }
                if (max !== null && (Number.isNaN(max) || max < min)) {
                    throw new Error(`Range ${index + 1}: "To" must be greater than or equal to "From".`);
                }
                if (rangeMarkup === null || Number.isNaN(rangeMarkup) || rangeMarkup < 0) {
                    throw new Error(`Range ${index + 1}: enter a valid markup %.`);
                }

                return { min, max, markup: rangeMarkup };
            });
        } catch (err) {
            setFormError(err.message);
            return;
        }

        const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);

        for (let index = 1; index < sortedRanges.length; index += 1) {
            const previous = sortedRanges[index - 1];

            if (previous.max === null) {
                setFormError('Only the last range can have an empty "To" value.');
                return;
            }
            if (sortedRanges[index].min <= previous.max) {
                setFormError('Markup ranges must not overlap.');
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                name,
                url,
                markup,
                markups: sortedRanges.map((range) => ({
                    min_value: range.min,
                    max_value: range.max,
                    markup: range.markup,
                })),
            };

            if (editingId) {
                await diamondApi.updateApiClient(editingId, payload);
                showToast('API client updated successfully.', 'success');
            } else {
                await diamondApi.createApiClient(payload);
                showToast('API client created successfully.', 'success');
            }

            setFormOpen(false);
            setEditingId(null);
            setForm(createEmptyForm());
            await loadApiClients();
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Failed to save API client.';
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await diamondApi.deleteApiClient(deleteTarget.encrypted_id);
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
                                <th style={{ width: '180px' }}>API Name</th>
                                <th style={{ width: '360px' }}>API URL</th>
                                <th style={{ width: '250px' }}>Markup Ranges ($/ct)</th>
                                <th style={{ width: '160px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiClients.map((client) => (
                                <tr key={client.encrypted_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={14} />
                                            <strong>{client.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{client.url}</td>
                                    <td>
                                        {Array.isArray(client.markups) && client.markups.length > 0 ? (
                                            <div className="markup-range-summary">
                                                {client.markups.slice(0, 4).map((range, index) => (
                                                    <div className="markup-range-summary-row" key={range.id ?? index}>
                                                        <span>{formatRange(range)}</span>
                                                        <strong>{Number(range.markup || 0).toFixed(2)}%</strong>
                                                    </div>
                                                ))}
                                                {client.markups.length > 4 && (
                                                    <span className="markup-range-more">
                                                        +{client.markups.length - 4} more range{client.markups.length - 4 === 1 ? '' : 's'}
                                                    </span>
                                                )}
                                                <span className="markup-range-default">
                                                    Default: {Number(client.markup || 0).toFixed(2)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="status-badge status-available">
                                                {Number(client.markup || 0).toFixed(2)}%
                                            </span>
                                        )}
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
                    <div className="modal-container modal-wide" onClick={(e) => e.stopPropagation()}>
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
                                    <label className="form-label">Default Markup (%)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.markup}
                                        onChange={(e) => setForm((prev) => ({ ...prev, markup: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                    <p className="form-help">
                                        Used when a diamond does not match any range below.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <div className="markup-ranges-header">
                                        <div>
                                            <label className="form-label" style={{ marginBottom: 0 }}>
                                                Markup Ranges ($/ct)
                                            </label>
                                            <p className="form-help" style={{ margin: '4px 0 0' }}>
                                                The matched range&apos;s % is added to both $/ct and Total $.
                                            </p>
                                        </div>
                                        <div className="markup-ranges-actions">
                                            <button type="button" className="markup-range-btn" onClick={applyStandardTiers}>
                                                Standard tiers
                                            </button>
                                            <button type="button" className="markup-range-btn primary" onClick={addRange}>
                                                <Plus size={12} style={{ marginRight: '4px' }} />
                                                Add range
                                            </button>
                                        </div>
                                    </div>

                                    {form.markups.length > 0 ? (
                                        <div className="markup-ranges-table">
                                            <div className="markup-range-labels">
                                                <span>From ($/ct)</span>
                                                <span>To ($/ct)</span>
                                                <span>Markup (%)</span>
                                                <span />
                                            </div>
                                            {form.markups.map((range, index) => (
                                                <div className="markup-range-row" key={index}>
                                                    <input
                                                        className="form-input"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={range.min_value}
                                                        onChange={(e) => updateRange(index, 'min_value', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                    <input
                                                        className="form-input"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={range.max_value}
                                                        onChange={(e) => updateRange(index, 'max_value', e.target.value)}
                                                        placeholder="All"
                                                    />
                                                    <input
                                                        className="form-input"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={range.markup}
                                                        onChange={(e) => updateRange(index, 'markup', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="markup-range-remove"
                                                        onClick={() => removeRange(index)}
                                                        title="Remove range"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="markup-ranges-empty">
                                            No ranges configured. The default markup is used for every diamond.
                                        </p>
                                    )}
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

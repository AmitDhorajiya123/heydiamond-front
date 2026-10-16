import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Layout from './Layout';
import ToastContainer from './Toast';
import ConfirmModal from './ConfirmModal';
import ToggleSwitch from './ToggleSwitch';

/**
 * Generic CRUD page for `mst_*` masters.
 *
 * config = {
 *   title: 'Clarity Management',          // page heading
 *   singular: 'Clarity',                 // used in toasts / modal titles
 *   addButtonLabel: 'Add Clarity',
 *   displayField: 'clarity_code',        // shown in delete confirm message
 *   idKey: 'encrypted_id',               // row identity for update/delete/toggle
 *   api: { list, create, update, remove }, // (params) / (data) / (id, data) / (id)
 *   fields: [
 *     { key, label, required, maxLength, placeholder, mono },
 *     { key, label, type: 'number', min, placeholder },
 *     { key, label, type: 'decimal', required, min, step, placeholder },
 *     { key, label, type: 'select', required, valueType: 'number',
 *       options: [{ value, label }], placeholder },
 *   ],
 * }
 *
 * `is_active` is never part of the form - it is managed only via the
 * status toggle column, same as Category / BGM Black Option.
 */
const MasterPage = ({ config }) => {
    const { title, singular, addButtonLabel, displayField, api, fields, idKey = 'encrypted_id' } = config;

    const getId = (item) => item?.[idKey];

    const emptyForm = () => {
        const form = {};
        fields.forEach((f) => { form[f.key] = ''; });
        return form;
    };

    // Table data and pagination state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [total, setTotal] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state (only data fields - no is_active in modal)
    const [formData, setFormData] = useState(emptyForm);

    // Validation errors
    const [formErrors, setFormErrors] = useState({});

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Delete confirmation modal state
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        item: null,
        loading: false,
    });

    // Toggle status loading state (for individual rows)
    const [togglingId, setTogglingId] = useState(null);

    // Add toast helper
    const showToast = (message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Fetch items
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
            };

            const response = await api.list(params);

            if (response.success && response.data) {
                const data = response.data;
                setItems(data.data || data);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);
                setTotal(data.total || 0);
                setPerPage(data.per_page || perPage);
            } else if (Array.isArray(response)) {
                setItems(response);
            } else if (response.data && Array.isArray(response.data)) {
                setItems(response.data);
            }
        } catch (err) {
            console.error(`Error fetching ${singular} list:`, err);
            showToast(err.response?.data?.message || `Failed to load ${singular} list`, 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form (mirrors backend Store request rules)
    const validateForm = () => {
        const errors = {};

        fields.forEach((field) => {
            const rawValue = formData[field.key];
            const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

            if (field.type === 'number') {
                if (value === '' || value === null || value === undefined) {
                    if (field.required) {
                        errors[field.key] = `${field.label} is required`;
                    }
                } else if (!Number.isInteger(Number(value))) {
                    errors[field.key] = `${field.label} must be a valid number`;
                } else if (field.min !== undefined && Number(value) < field.min) {
                    errors[field.key] = `${field.label} must be at least ${field.min}`;
                }
                return;
            }

            if (field.type === 'decimal') {
                if (value === '' || value === null || value === undefined) {
                    if (field.required) {
                        errors[field.key] = `${field.label} is required`;
                    }
                } else if (!Number.isFinite(Number(value))) {
                    errors[field.key] = `${field.label} must be a valid number`;
                } else if (field.min !== undefined && Number(value) < field.min) {
                    errors[field.key] = `${field.label} must be at least ${field.min}`;
                }
                return;
            }

            if (field.type === 'select') {
                if (value === '' || value === null || value === undefined) {
                    if (field.required) {
                        errors[field.key] = `Please select ${field.label.toLowerCase()}`;
                    }
                } else if (field.valueType === 'number' && !Number.isFinite(Number(value))) {
                    errors[field.key] = `${field.label} must be a valid selection`;
                }
                return;
            }

            if (field.required && !value) {
                errors[field.key] = `${field.label} is required`;
            } else if (value && field.maxLength && value.length > field.maxLength) {
                errors[field.key] = `${field.label} must not exceed ${field.maxLength} characters`;
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const buildPayload = (forUpdate = false) => {
        const payload = {};
        fields.forEach((field) => {
            const rawValue = formData[field.key];
            if (field.type === 'number') {
                // Omit empty numbers so backend defaults / existing values apply
                if (rawValue === '' || rawValue === null || rawValue === undefined) return;
                const num = Number(rawValue);
                // On update skip unchanged values (also avoids false unique errors)
                if (forUpdate && editingItem && Number(editingItem[field.key]) === num) return;
                payload[field.key] = num;
                return;
            }
            if (field.type === 'decimal') {
                // Omit empty decimals so backend defaults / existing values apply
                if (rawValue === '' || rawValue === null || rawValue === undefined) return;
                const num = Number(rawValue);
                // On update skip unchanged values (also avoids false unique errors)
                if (forUpdate && editingItem && Number(editingItem[field.key]) === num) return;
                payload[field.key] = num;
                return;
            }
            if (field.type === 'select') {
                if (rawValue === '' || rawValue === null || rawValue === undefined) return;
                const coerced = field.valueType === 'number' ? Number(rawValue) : rawValue;
                // On update skip unchanged values
                if (forUpdate && editingItem) {
                    const original = editingItem[field.key];
                    if (String(original ?? '') === String(rawValue ?? '')) return;
                }
                payload[field.key] = coerced;
                return;
            }
            const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
            if (forUpdate && editingItem) {
                // Skip unchanged fields on update. Backend `ignore()` receives the
                // encrypted id, so re-sending an unchanged unique code would fail
                // unique validation against its own record.
                const original = editingItem[field.key];
                const originalNorm = original === null || original === undefined ? '' : String(original).trim();
                if (originalNorm === (value ?? '')) return;
            }
            payload[field.key] = value;
        });
        return payload;
    };

    // Open modal for adding new item
    const handleAdd = () => {
        setIsEditing(false);
        setEditingItem(null);
        setFormData(emptyForm());
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Open modal for editing item
    const handleEdit = (item) => {
        setIsEditing(true);
        setEditingItem(item);
        const form = {};
        fields.forEach((f) => {
            const value = item[f.key];
            form[f.key] = value === null || value === undefined ? '' : String(value);
        });
        setFormData(form);
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingItem(null);
        setFormData(emptyForm());
        setFormErrors({});
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Only data fields - never is_active (backend defaults active on create).
            // On update only changed fields are sent (see buildPayload).
            const isUpdate = isEditing && editingItem;
            const payload = buildPayload(isUpdate);

            if (isUpdate && Object.keys(payload).length === 0) {
                showToast('No changes to save', 'info');
                handleCloseModal();
                return;
            }

            let response;
            if (isUpdate) {
                response = await api.update(getId(editingItem), payload);
            } else {
                response = await api.create(payload);
            }

            if (response.success) {
                showToast(response.message || (isEditing ? `${singular} updated successfully` : `${singular} created successfully`), 'success');
                handleCloseModal();
                fetchItems();
            } else {
                showToast(response.message || 'Operation failed', 'error');
                // Handle validation errors from server
                if (response.errors) {
                    setFormErrors(response.errors);
                }
            }
        } catch (err) {
            console.error(`Error saving ${singular}:`, err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showToast(err.response.data.message || 'Validation failed', 'error');
            } else {
                showToast(err.response?.data?.message || `Failed to save ${singular}`, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle toggle active/inactive status
    const handleToggleStatus = async (item) => {
        const newStatus = !item.is_active;
        setTogglingId(getId(item));

        try {
            const response = await api.update(getId(item), {
                is_active: newStatus,
            });

            if (response.success) {
                // Update local state optimistically
                setItems(prev => prev.map(row =>
                    getId(row) === getId(item)
                        ? { ...row, is_active: newStatus, modified_date: new Date().toISOString() }
                        : row
                ));
                showToast(response.message || `${singular} ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            } else {
                showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    // Open delete confirmation modal
    const handleOpenDeleteConfirm = (item) => {
        setDeleteConfirm({
            isOpen: true,
            item,
            loading: false,
        });
    };

    // Close delete confirmation modal
    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm({
            isOpen: false,
            item: null,
            loading: false,
        });
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        const { item } = deleteConfirm;
        if (!item) return;

        setDeleteConfirm(prev => ({ ...prev, loading: true }));

        try {
            const response = await api.remove(getId(item));

            if (response.success) {
                showToast(response.message || `${singular} deleted successfully`, 'success');
                handleCloseDeleteConfirm();
                fetchItems();
            } else {
                showToast(response.message || `Failed to delete ${singular}`, 'error');
                handleCloseDeleteConfirm();
            }
        } catch (err) {
            console.error(`Error deleting ${singular}:`, err);
            showToast(err.response?.data?.message || `Failed to delete ${singular}`, 'error');
            handleCloseDeleteConfirm();
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate row number based on pagination
    const getRowNumber = (index) => {
        return (currentPage - 1) * perPage + index + 1;
    };

    // Resolve display value for a cell (select fields show the option label)
    const displayValue = (field, item) => {
        if (field.type === 'select' && Array.isArray(field.options)) {
            const opt = field.options.find((o) => String(o.value) === String(item[field.key]));
            if (opt) return opt.label;
        }
        const v = item[field.key];
        return v === null || v === undefined || v === '' ? '-' : String(v);
    };

    return (
        <Layout>
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Page Header */}
            <div className="table-header">
                <h1 className="table-title">{title}</h1>
                <div className="table-actions">
                    <button
                        className="submit-button"
                        onClick={handleAdd}
                        disabled={loading}
                    >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        {addButtonLabel}
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                        <Loader2 size={24} className="spin" style={{ marginBottom: '12px' }} />
                        <p>Loading {title.toLowerCase()}...</p>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                {fields.map((field) => (
                                    <th key={field.key}>{field.label}</th>
                                ))}
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '180px' }}>Created</th>
                                <th style={{ width: '180px' }}>Modified</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={fields.length + 5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                        {loading ? 'Loading...' : `No ${title.toLowerCase().replace(' management', '')} found`}
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={getId(item) || index}>
                                        <td style={{ textAlign: 'center', color: 'var(--color-text-light)', fontWeight: 500 }}>
                                            {getRowNumber(index)}
                                        </td>
                                        {fields.map((field) => (
                                            <td
                                                key={field.key}
                                                style={field.mono ? { fontFamily: 'monospace', fontSize: '12px' } : undefined}
                                            >
                                                {displayValue(field, item)}
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center' }}>
                                            <ToggleSwitch
                                                isActive={item.is_active}
                                                onChange={() => handleToggleStatus(item)}
                                                disabled={loading || submitting}
                                                loading={togglingId === getId(item)}
                                            />
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(item.created_date)}</td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(item.modified_date) || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleEdit(item)}
                                                    title="Edit"
                                                    disabled={loading || submitting}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleOpenDeleteConfirm(item)}
                                                    title="Delete"
                                                    disabled={loading || submitting}
                                                    style={{ color: '#d93025' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 24px',
                        borderTop: '1px solid var(--color-input-border)',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>
                            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} entries
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className="action-btn-secondary"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                style={{ padding: '8px 12px' }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                                let pageNum;
                                if (lastPage <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= lastPage - 2) {
                                    pageNum = lastPage - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`action-btn-secondary ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading}
                                        style={{
                                            padding: '8px 12px',
                                            minWidth: '40px',
                                            backgroundColor: currentPage === pageNum ? 'var(--color-primary)' : 'transparent',
                                            color: currentPage === pageNum ? '#fff' : 'var(--color-text-dark)',
                                            borderColor: currentPage === pageNum ? 'var(--color-primary)' : 'var(--color-input-border)'
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                className="action-btn-secondary"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage || loading}
                                style={{ padding: '8px 12px' }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditing ? `Edit ${singular}` : addButtonLabel}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {fields.map((field, fieldIndex) => (
                                    <div className="form-group" key={field.key}>
                                        <label htmlFor={field.key} className="form-label">
                                            {field.label} {field.required && <span className="required">*</span>}
                                        </label>
                                        {field.type === 'select' ? (
                                            <select
                                                id={field.key}
                                                name={field.key}
                                                className={`form-input ${formErrors[field.key] ? 'error' : ''}`}
                                                value={formData[field.key]}
                                                onChange={handleInputChange}
                                                disabled={submitting}
                                                autoFocus={fieldIndex === 0}
                                            >
                                                <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                                                {(field.options || []).map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' || field.type === 'decimal' ? 'number' : 'text'}
                                                id={field.key}
                                                name={field.key}
                                                className={`form-input ${formErrors[field.key] ? 'error' : ''}`}
                                                value={formData[field.key]}
                                                onChange={handleInputChange}
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                maxLength={field.maxLength}
                                                min={field.min}
                                                step={field.type === 'decimal' ? (field.step || 'any') : (field.type === 'number' ? 1 : undefined)}
                                                disabled={submitting}
                                                autoFocus={fieldIndex === 0}
                                            />
                                        )}
                                        {formErrors[field.key] && (
                                            <span className="form-error">{formErrors[field.key]}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="submit-button secondary"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        isEditing ? 'Update' : 'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleConfirmDelete}
                title={`Delete ${singular}`}
                message={`Are you sure you want to delete "${deleteConfirm.item?.[displayField]}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={deleteConfirm.loading}
                variant="danger"
            />
        </Layout>
    );
};

export default MasterPage;

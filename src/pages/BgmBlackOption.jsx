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
import Layout from '../components/Layout';
import ToastContainer from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import ToggleSwitch from '../components/ToggleSwitch';
import bgmBlackOptionApi from '../apis/bgmBlackOption';

const BgmBlackOption = () => {
    // Table data and pagination state
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [total, setTotal] = useState(0);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state (only code and name - no is_active in modal)
    const [formData, setFormData] = useState({
        option_code: '',
        option_name: '',
    });

    // Validation errors
    const [formErrors, setFormErrors] = useState({});

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Delete confirmation modal state
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        option: null,
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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch options
    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
            };
            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            const response = await bgmBlackOptionApi.getOptions(params);

            if (response.success && response.data) {
                const data = response.data;
                setOptions(data.data || data);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);
                setTotal(data.total || 0);
                setPerPage(data.per_page || perPage);
            } else if (Array.isArray(response)) {
                setOptions(response);
            } else if (response.data && Array.isArray(response.data)) {
                setOptions(response.data);
            }
        } catch (err) {
            console.error('Error fetching BGM/Black options:', err);
            showToast(err.response?.data?.message || 'Failed to load BGM/Black options', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

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

    // Validate form (mirrors StoreMstBgmBlackOptionRequest rules)
    const validateForm = () => {
        const errors = {};

        if (!formData.option_code.trim()) {
            errors.option_code = 'Option code is required';
        } else if (formData.option_code.length > 50) {
            errors.option_code = 'Option code must not exceed 50 characters';
        }

        if (!formData.option_name.trim()) {
            errors.option_name = 'Option name is required';
        } else if (formData.option_name.length > 100) {
            errors.option_name = 'Option name must not exceed 100 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open modal for adding new option
    const handleAddOption = () => {
        setIsEditing(false);
        setEditingOption(null);
        setFormData({
            option_code: '',
            option_name: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Open modal for editing option
    const handleEditOption = (option) => {
        setIsEditing(true);
        setEditingOption(option);
        setFormData({
            option_code: option.option_code || '',
            option_name: option.option_name || '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingOption(null);
        setFormData({
            option_code: '',
            option_name: '',
        });
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
            // Only send option_code and option_name - don't send is_active
            // Backend handles default active status on create
            const payload = {
                option_code: formData.option_code.trim(),
                option_name: formData.option_name.trim(),
            };

            let response;
            if (isEditing && editingOption) {
                response = await bgmBlackOptionApi.updateOption(editingOption.encrypted_id, payload);
            } else {
                response = await bgmBlackOptionApi.createOption(payload);
            }

            if (response.success) {
                showToast(response.message || (isEditing ? 'BGM/Black option updated successfully' : 'BGM/Black option created successfully'), 'success');
                handleCloseModal();
                fetchOptions();
            } else {
                showToast(response.message || 'Operation failed', 'error');
                // Handle validation errors from server
                if (response.errors) {
                    setFormErrors(response.errors);
                }
            }
        } catch (err) {
            console.error('Error saving BGM/Black option:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showToast(err.response.data.message || 'Validation failed', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to save BGM/Black option', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle toggle active/inactive status
    const handleToggleStatus = async (option) => {
        const newStatus = !option.is_active;
        setTogglingId(option.encrypted_id);

        try {
            // Use updateOption with only is_active field
            const response = await bgmBlackOptionApi.updateOption(option.encrypted_id, {
                is_active: newStatus,
            });

            if (response.success) {
                // Update local state optimistically
                setOptions(prev => prev.map(opt =>
                    opt.encrypted_id === option.encrypted_id
                        ? { ...opt, is_active: newStatus, modified_date: new Date().toISOString() }
                        : opt
                ));
                showToast(response.message || `BGM/Black option ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
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
    const handleOpenDeleteConfirm = (option) => {
        setDeleteConfirm({
            isOpen: true,
            option,
            loading: false,
        });
    };

    // Close delete confirmation modal
    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm({
            isOpen: false,
            option: null,
            loading: false,
        });
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        const { option } = deleteConfirm;
        if (!option) return;

        setDeleteConfirm(prev => ({ ...prev, loading: true }));

        try {
            const response = await bgmBlackOptionApi.deleteOption(option.encrypted_id);

            if (response.success) {
                showToast(response.message || 'BGM/Black option deleted successfully', 'success');
                handleCloseDeleteConfirm();
                fetchOptions();
            } else {
                showToast(response.message || 'Failed to delete BGM/Black option', 'error');
                handleCloseDeleteConfirm();
            }
        } catch (err) {
            console.error('Error deleting BGM/Black option:', err);
            showToast(err.response?.data?.message || 'Failed to delete BGM/Black option', 'error');
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

    return (
        <Layout>
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Page Header */}
            <div className="table-header">
                <h1 className="table-title">BGM / Black Option Management</h1>
                <div className="table-actions">
                    <button
                        className="submit-button"
                        onClick={handleAddOption}
                        disabled={loading}
                    >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Add Option
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                        <Loader2 size={24} className="spin" style={{ marginBottom: '12px' }} />
                        <p>Loading BGM/Black options...</p>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '180px' }}>Created</th>
                                <th style={{ width: '180px' }}>Modified</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {options.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                        {loading ? 'Loading...' : 'No BGM/Black options found'}
                                    </td>
                                </tr>
                            ) : (
                                options.map((option, index) => (
                                    <tr key={option.encrypted_id || option.option_id || index}>
                                        <td style={{ textAlign: 'center', color: 'var(--color-text-light)', fontWeight: 500 }}>
                                            {getRowNumber(index)}
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{option.option_code}</td>
                                        <td>{option.option_name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <ToggleSwitch
                                                isActive={option.is_active}
                                                onChange={() => handleToggleStatus(option)}
                                                disabled={loading || submitting}
                                                loading={togglingId === option.encrypted_id}
                                            />
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(option.created_date)}</td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(option.modified_date) || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleEditOption(option)}
                                                    title="Edit"
                                                    disabled={loading || submitting}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleOpenDeleteConfirm(option)}
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
                            <h2 className="modal-title">{isEditing ? 'Edit BGM/Black Option' : 'Add BGM/Black Option'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="option_code" className="form-label">
                                        Option Code <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="option_code"
                                        name="option_code"
                                        className={`form-input ${formErrors.option_code ? 'error' : ''}`}
                                        value={formData.option_code}
                                        onChange={handleInputChange}
                                        placeholder="Enter option code (e.g. NO_BGM)"
                                        maxLength={50}
                                        disabled={submitting}
                                        autoFocus
                                    />
                                    {formErrors.option_code && (
                                        <span className="form-error">{formErrors.option_code}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="option_name" className="form-label">
                                        Option Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="option_name"
                                        name="option_name"
                                        className={`form-input ${formErrors.option_name ? 'error' : ''}`}
                                        value={formData.option_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter option name"
                                        maxLength={100}
                                        disabled={submitting}
                                    />
                                    {formErrors.option_name && (
                                        <span className="form-error">{formErrors.option_name}</span>
                                    )}
                                </div>
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
                title="Delete BGM/Black Option"
                message={`Are you sure you want to delete "${deleteConfirm.option?.option_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={deleteConfirm.loading}
                variant="danger"
            />
        </Layout>
    );
};

export default BgmBlackOption;

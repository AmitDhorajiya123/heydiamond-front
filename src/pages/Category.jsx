import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import Layout from '../components/Layout';
import categoryApi from '../apis/category';

// Toast Notification Component
const ToastContainer = ({ toasts, onRemove }) => (
    <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
                <div className="toast-content">
                    <div className="toast-icon">
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'info' && <AlertCircle size={20} />}
                    </div>
                    <span className="toast-message">{toast.message}</span>
                </div>
                <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Close">
                    <X size={16} />
                </button>
            </div>
        ))}
    </div>
);

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, loading, variant }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: '1.5' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="submit-button secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        type="button"
                        className={`submit-button ${variant === 'danger' ? 'danger' : ''}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                {confirmText || 'Confirm'}
                            </>
                        ) : (
                            confirmText || 'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Category = () => {
    // Table data and pagination state
    const [categories, setCategories] = useState([]);
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
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state (only code and name - no is_active in modal)
    const [formData, setFormData] = useState({
        category_code: '',
        category_name: '',
    });

    // Validation errors
    const [formErrors, setFormErrors] = useState({});

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Delete confirmation modal state
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        category: null,
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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
            };
            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            const response = await categoryApi.getCategories(params);

            if (response.success && response.data) {
                const data = response.data;
                setCategories(data.data || data);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);
                setTotal(data.total || 0);
                setPerPage(data.per_page || perPage);
            } else if (Array.isArray(response)) {
                setCategories(response);
            } else if (response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            showToast(err.response?.data?.message || 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.category_code.trim()) {
            errors.category_code = 'Category code is required';
        } else if (formData.category_code.length > 50) {
            errors.category_code = 'Category code must not exceed 50 characters';
        }

        if (!formData.category_name.trim()) {
            errors.category_name = 'Category name is required';
        } else if (formData.category_name.length > 100) {
            errors.category_name = 'Category name must not exceed 100 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open modal for adding new category
    const handleAddCategory = () => {
        setIsEditing(false);
        setEditingCategory(null);
        setFormData({
            category_code: '',
            category_name: '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Open modal for editing category
    const handleEditCategory = (category) => {
        setIsEditing(true);
        setEditingCategory(category);
        setFormData({
            category_code: category.category_code || '',
            category_name: category.category_name || '',
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingCategory(null);
        setFormData({
            category_code: '',
            category_name: '',
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
            // Only send category_code and category_name - don't send is_active
            // Backend handles default active status on create
            const payload = {
                category_code: formData.category_code.trim(),
                category_name: formData.category_name.trim(),
            };

            let response;
            if (isEditing && editingCategory) {
                response = await categoryApi.updateCategory(editingCategory.encrypted_id, payload);
            } else {
                response = await categoryApi.createCategory(payload);
            }

            if (response.success) {
                showToast(response.message || (isEditing ? 'Category updated successfully' : 'Category created successfully'), 'success');
                handleCloseModal();
                fetchCategories();
            } else {
                showToast(response.message || 'Operation failed', 'error');
                // Handle validation errors from server
                if (response.errors) {
                    setFormErrors(response.errors);
                }
            }
        } catch (err) {
            console.error('Error saving category:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showToast(err.response.data.message || 'Validation failed', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to save category', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle toggle active/inactive status
    const handleToggleStatus = async (category) => {
        const newStatus = !category.is_active;
        setTogglingId(category.encrypted_id);

        try {
            // Use updateCategory with only is_active field
            const response = await categoryApi.updateCategory(category.encrypted_id, {
                is_active: newStatus,
            });

            if (response.success) {
                // Update local state optimistically
                setCategories(prev => prev.map(cat => 
                    cat.encrypted_id === category.encrypted_id 
                        ? { ...cat, is_active: newStatus, modified_date: new Date().toISOString() }
                        : cat
                ));
                showToast(response.message || `Category ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
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
    const handleOpenDeleteConfirm = (category) => {
        setDeleteConfirm({
            isOpen: true,
            category,
            loading: false,
        });
    };

    // Close delete confirmation modal
    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm({
            isOpen: false,
            category: null,
            loading: false,
        });
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        const { category } = deleteConfirm;
        if (!category) return;

        setDeleteConfirm(prev => ({ ...prev, loading: true }));

        try {
            const response = await categoryApi.deleteCategory(category.encrypted_id);

            if (response.success) {
                showToast(response.message || 'Category deleted successfully', 'success');
                handleCloseDeleteConfirm();
                fetchCategories();
            } else {
                showToast(response.message || 'Failed to delete category', 'error');
                handleCloseDeleteConfirm();
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            showToast(err.response?.data?.message || 'Failed to delete category', 'error');
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

    // Toggle Switch Component
    const ToggleSwitch = ({ isActive, onChange, disabled, loading }) => (
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={isActive}
                onChange={onChange}
                disabled={disabled || loading}
                className="toggle-input"
            />
            <span className={`toggle-slider ${isActive ? 'active' : ''}`}></span>
        </label>
    );

    return (
        <Layout>
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Page Header */}
            <div className="table-header">
                <h1 className="table-title">Category Management</h1>
                <div className="table-actions">
                    <button
                        className="submit-button"
                        onClick={handleAddCategory}
                        disabled={loading}
                    >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                        <Loader2 size={24} className="spin" style={{ marginBottom: '12px' }} />
                        <p>Loading categories...</p>
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
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                        {loading ? 'Loading...' : 'No categories found'}
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.encrypted_id || category.category_id || index}>
                                        <td style={{ textAlign: 'center', color: 'var(--color-text-light)', fontWeight: 500 }}>
                                            {getRowNumber(index)}
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{category.category_code}</td>
                                        <td>{category.category_name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <ToggleSwitch
                                                isActive={category.is_active}
                                                onChange={() => handleToggleStatus(category)}
                                                disabled={loading || submitting}
                                                loading={togglingId === category.encrypted_id}
                                            />
                                        </td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(category.created_date)}</td>
                                        <td style={{ fontSize: '12px' }}>{formatDate(category.modified_date) || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleEditCategory(category)}
                                                    title="Edit"
                                                    disabled={loading || submitting}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleOpenDeleteConfirm(category)}
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
                            <h2 className="modal-title">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="category_code" className="form-label">
                                        Category Code <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="category_code"
                                        name="category_code"
                                        className={`form-input ${formErrors.category_code ? 'error' : ''}`}
                                        value={formData.category_code}
                                        onChange={handleInputChange}
                                        placeholder="Enter category code"
                                        maxLength={50}
                                        disabled={submitting}
                                        autoFocus
                                    />
                                    {formErrors.category_code && (
                                        <span className="form-error">{formErrors.category_code}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category_name" className="form-label">
                                        Category Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="category_name"
                                        name="category_name"
                                        className={`form-input ${formErrors.category_name ? 'error' : ''}`}
                                        value={formData.category_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter category name"
                                        maxLength={100}
                                        disabled={submitting}
                                    />
                                    {formErrors.category_name && (
                                        <span className="form-error">{formErrors.category_name}</span>
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
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteConfirm.category?.category_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={deleteConfirm.loading}
                variant="danger"
            />

            <style jsx>{`
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

export default Category;
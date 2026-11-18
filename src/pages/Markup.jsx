import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Loader2,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
    User,
    X,
} from 'lucide-react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import CustomerSearchSelect from '../components/CustomerSearchSelect';
import customerMarkupApi from '../apis/customerMarkup';
import { useToast } from '../context/ToastContext';

const emptyRange = { min_value: '', max_value: '', white_markup: '', color_markup: '' };

const createEmptyForm = () => ({
    markup: '',
    markups: [],
});

const customerToForm = (customer) => ({
    markup: customer.markup !== undefined && customer.markup !== null ? String(customer.markup) : '',
    markups: Array.isArray(customer.markups)
        ? customer.markups.map((range) => {
            // Older payloads used a single `markup`; use it for both columns.
            const legacy = range.markup !== undefined && range.markup !== null ? String(range.markup) : '';

            return {
                min_value: range.min_value !== undefined && range.min_value !== null ? String(range.min_value) : '',
                max_value: range.max_value !== undefined && range.max_value !== null ? String(range.max_value) : '',
                white_markup: range.white_markup !== undefined && range.white_markup !== null ? String(range.white_markup) : legacy,
                color_markup: range.color_markup !== undefined && range.color_markup !== null ? String(range.color_markup) : legacy,
            };
        })
        : [],
});

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

// Keep a single decimal point and digits only. This avoids the browser
// number-input quirk that drops the dot while typing values like 0.50.
const sanitizeDecimalInput = (value) => {
    let next = String(value).replace(/[^0-9.]/g, '');
    const firstDot = next.indexOf('.');
    if (firstDot !== -1) {
        next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '');
    }
    return next;
};

// Percentages are capped at 100 so a typo can never produce an invalid markup.
const MAX_MARKUP_PERCENT = 100;

const sanitizePercentageInput = (value) => {
    const clean = sanitizeDecimalInput(value);

    if (clean === '') return '';

    const number = Number(clean);
    if (Number.isFinite(number) && number > MAX_MARKUP_PERCENT) {
        return String(MAX_MARKUP_PERCENT);
    }

    return clean;
};

const hasRangeValue = (range) => (
    [range.min_value, range.max_value, range.white_markup, range.color_markup]
        .some((value) => value !== '' && value !== null && value !== undefined)
);

const rangeMarkupError = (range, index) => {
    if (!hasRangeValue(range)) {
        return null;
    }

    const min = parseOptionalNumber(range.min_value);
    const max = parseOptionalNumber(range.max_value);

    // Blank fields are optional and fall back to sensible defaults.
    if (min !== null && (Number.isNaN(min) || min < 0)) {
        return `Range ${index + 1}: enter a valid "From" value.`;
    }
    if (max !== null && (Number.isNaN(max) || max < min || (min === null && max < 0))) {
        return `Range ${index + 1}: "To" must be greater than or equal to "From".`;
    }

    for (const [key, label] of [['white_markup', 'White'], ['color_markup', 'Color']]) {
        const value = parseOptionalNumber(range[key]);

        if (value !== null && (Number.isNaN(value) || value < 0)) {
            return `Range ${index + 1}: enter a valid ${label} markup %.`;
        }
        if (value !== null && value > MAX_MARKUP_PERCENT) {
            return `Range ${index + 1}: ${label} markup cannot exceed ${MAX_MARKUP_PERCENT}%.`;
        }
    }

    return null;
};

const MarkupPage = () => {
    const { showToast } = useToast();

    // Listing state
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [form, setForm] = useState(createEmptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false);

    const abortRef = useRef(null);

    const fetchCustomers = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const response = await customerMarkupApi.list({
                search: debouncedSearch,
                page,
                per_page: perPage,
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            let payload = response;
            if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                payload = response.data;
            }

            const list = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.data) ? payload.data : []);
            const meta = response?.meta || payload?.meta || {};

            if (!controller.signal.aborted) {
                setCustomers(list);
                setLastPage(meta.last_page || 1);
                setTotal(meta.total || list.length);
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                console.error('Failed to load customers:', err);
                showToast('Failed to load customers.', 'error');
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [debouncedSearch, page, perPage, sortBy, sortOrder, showToast]);

    useEffect(() => {
        fetchCustomers();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchCustomers]);

    // Debounce the search box and reset to the first page.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setPage(1);
    };

    const handlePerPageChange = (event) => {
        setPerPage(Number(event.target.value));
        setPage(1);
    };

    const openAddModal = () => {
        setModalMode('add');
        setSelectedCustomer(null);
        setForm(createEmptyForm());
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (customer) => {
        setModalMode('edit');
        setSelectedCustomer(customer);
        setForm(customerToForm(customer));
        setFormError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setSelectedCustomer(null);
        setForm(createEmptyForm());
        setFormError('');
    };

    const closeModalAfterSave = () => {
        setModalOpen(false);
        setSelectedCustomer(null);
        setForm(createEmptyForm());
        setFormError('');
    };

    const handleCustomerSelect = async (customer) => {
        if (!customer) {
            setSelectedCustomer(null);
            setForm(createEmptyForm());
            return;
        }

        if (Array.isArray(customer.markups)) {
            setSelectedCustomer(customer);
            setForm(customerToForm(customer));
            return;
        }

        // Lightweight option from the picker: load the full markup config.
        setSelectedCustomer(customer);
        setForm(createEmptyForm());
        setCustomerLoading(true);

        try {
            const response = await customerMarkupApi.get(customer.encrypted_id);
            const full = response?.data && typeof response.data === 'object' ? response.data : customer;
            setSelectedCustomer(full);
            setForm(customerToForm(full));
        } catch (err) {
            console.error('Failed to load customer markup:', err);
            showToast('Failed to load customer markup.', 'error');
            setSelectedCustomer(null);
            setForm(createEmptyForm());
        } finally {
            setCustomerLoading(false);
        }
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
                { ...emptyRange, min_value: '0', max_value: '0.49' },
                { ...emptyRange, min_value: '0.50', max_value: '0.99' },
                { ...emptyRange, min_value: '1.00', max_value: '1.49' },
                { ...emptyRange, min_value: '1.50', max_value: '' },
            ],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        if (!selectedCustomer) {
            setFormError('Select a customer first.');
            return;
        }

        const markup = form.markup === '' ? 0 : Number(form.markup);

        if (Number.isNaN(markup) || markup < 0) {
            setFormError('Default markup must be a valid percentage (0 or more).');
            return;
        }
        if (markup > MAX_MARKUP_PERCENT) {
            setFormError(`Default markup cannot exceed ${MAX_MARKUP_PERCENT}%.`);
            return;
        }

        // Validate every range before sending it to the backend.
        let ranges = [];
        try {
            ranges = form.markups
                .map((range, index) => {
                    // Empty rows are optional: skip them instead of showing an error.
                    if (!hasRangeValue(range)) {
                        return null;
                    }

                    const error = rangeMarkupError(range, index);

                    if (error) {
                        throw new Error(error);
                    }

                    const min = parseOptionalNumber(range.min_value);
                    const whiteMarkup = parseOptionalNumber(range.white_markup);
                    const colorMarkup = parseOptionalNumber(range.color_markup);

                    return {
                        min: min === null ? 0 : min,
                        max: parseOptionalNumber(range.max_value),
                        whiteMarkup: whiteMarkup === null ? 0 : whiteMarkup,
                        colorMarkup: colorMarkup === null ? 0 : colorMarkup,
                    };
                })
                .filter(Boolean);
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
            await customerMarkupApi.update(selectedCustomer.encrypted_id, {
                markup,
                markups: sortedRanges.map((range) => ({
                    min_value: range.min,
                    max_value: range.max,
                    white_markup: range.whiteMarkup,
                    color_markup: range.colorMarkup,
                })),
            });

            showToast('Customer markup saved successfully.', 'success');
            closeModalAfterSave();
            fetchCustomers();
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Failed to save customer markup.';
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    const sortButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: 0,
        border: 'none',
        background: 'none',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
    };

    return (
        <Layout>
            <div className="table-header">
                <div>
                    <h1 className="table-title">Customer Markup</h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-light)' }}>
                        Set one global markup per customer. It applies to every diamond shown to that customer.
                    </p>
                </div>
                <button type="button" className="submit-button" onClick={openAddModal}>
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    Add Markup
                </button>
            </div>

            <div className="table-container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '16px' }}>
                    <div className="search-wrapper" style={{ maxWidth: '380px' }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by customer name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="inventory-per-page">
                        <span>Show</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="inventory-per-page-select"
                            disabled={loading}
                            aria-label="Select number of entries per page"
                        >
                            {[10, 25, 50, 100].map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <span>entries</span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '220px' }}>
                                    <button type="button" style={sortButtonStyle} onClick={() => handleSort('name')}>
                                        Customer {renderSortIcon('name')}
                                    </button>
                                </th>
                                <th style={{ width: '260px' }}>
                                    <button type="button" style={sortButtonStyle} onClick={() => handleSort('email')}>
                                        Email {renderSortIcon('email')}
                                    </button>
                                </th>
                                <th style={{ width: '150px' }}>
                                    <button type="button" style={sortButtonStyle} onClick={() => handleSort('markup')}>
                                        Default Markup {renderSortIcon('markup')}
                                    </button>
                                </th>
                                <th>Markup Ranges (Carat Weight)</th>
                                <th style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.encrypted_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={14} />
                                            <strong>{customer.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '12px' }}>{customer.email}</td>
                                    <td>
                                        <span className="status-badge status-available">
                                            {Number(customer.markup || 0).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td>
                                        {Array.isArray(customer.markups) && customer.markups.length > 0 ? (
                                            <div className="markup-range-summary">
                                                {customer.markups.slice(0, 4).map((range, index) => (
                                                    <div className="markup-range-summary-row" key={index}>
                                                        <span>{formatRange(range)}</span>
                                                        <strong>
                                                            W {Number(range.white_markup ?? 0).toFixed(2)}%
                                                            {' · '}
                                                            C {Number(range.color_markup ?? 0).toFixed(2)}%
                                                        </strong>
                                                    </div>
                                                ))}
                                                {customer.markups.length > 4 && (
                                                    <span className="markup-range-more">
                                                        +{customer.markups.length - 4} more range{customer.markups.length - 4 === 1 ? '' : 's'}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                                                No ranges configured
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="action-btn"
                                            onClick={() => openEditModal(customer)}
                                            title="Edit customer markup"
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {loading && customers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        Loading...
                                    </td>
                                </tr>
                            )}

                            {!loading && customers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={page}
                totalPages={lastPage}
                totalItems={total}
                perPage={perPage}
                onPageChange={setPage}
                loading={loading}
                showPerPage={false}
            />

            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container modal-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {modalMode === 'edit' ? 'Edit Customer Markup' : 'Add Customer Markup'}
                            </h2>
                            <button type="button" className="modal-close" onClick={closeModal} disabled={saving}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">
                                        Customer <span className="required">*</span>
                                    </label>
                                    <CustomerSearchSelect
                                        selectedCustomer={selectedCustomer}
                                        onChange={handleCustomerSelect}
                                        placeholder="Search customer by name or email"
                                        disabled={saving || customerLoading}
                                        autoFocus={modalMode === 'add'}
                                    />
                                    <p className="form-help">
                                        Only users with the customer role are listed here.
                                    </p>
                                    {customerLoading && (
                                        <p className="form-help">Loading customer markup...</p>
                                    )}
                                </div>

                                {selectedCustomer && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Default Markup (%)</label>
                                            <input
                                                className={`form-input ${Number(form.markup) > MAX_MARKUP_PERCENT ? 'invalid-percent' : ''}`}
                                                type="text"
                                                inputMode="decimal"
                                                value={form.markup}
                                                onChange={(e) => setForm((prev) => ({ ...prev, markup: sanitizePercentageInput(e.target.value) }))}
                                                placeholder="0.00"
                                                disabled={saving || customerLoading}
                                            />
                                            <p className="form-help">
                                                Fallback for both white and fancy-color diamonds when no range matches. Maximum {MAX_MARKUP_PERCENT}%.
                                            </p>
                                        </div>

                                        <div className="form-group">
                                            <div className="markup-ranges-header">
                                                <div>
                                                    <label className="form-label" style={{ marginBottom: 0 }}>
                                                        Markup Ranges (Carat Weight)
                                                    </label>
                                                    <p className="form-help" style={{ margin: '4px 0 0' }}>
                                                        Ranges are matched on carat weight. White % applies to D-Z stones; Color % applies to fancy-color stones. Both are added to $/ct and Total $.
                                                    </p>
                                                </div>
                                                <div className="markup-ranges-actions">
                                                    <button
                                                        type="button"
                                                        className="markup-range-btn"
                                                        onClick={applyStandardTiers}
                                                        disabled={saving || customerLoading}
                                                    >
                                                        Standard tiers
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="markup-range-btn primary"
                                                        onClick={addRange}
                                                        disabled={saving || customerLoading}
                                                    >
                                                        <Plus size={12} style={{ marginRight: '4px' }} />
                                                        Add range
                                                    </button>
                                                </div>
                                            </div>

                                            {form.markups.length > 0 ? (
                                                <div className="markup-ranges-table">
                                                    <div className="markup-range-labels">
                                                        <span>From (ct)</span>
                                                        <span>To (ct)</span>
                                                        <span>White %</span>
                                                        <span>Color %</span>
                                                        <span />
                                                    </div>
                                                    {form.markups.map((range, index) => {
                                                        const rowError = rangeMarkupError(range, index);

                                                        return (
                                                            <div className={`markup-range-item ${rowError ? 'invalid' : ''}`} key={index}>
                                                                <div className="markup-range-row">
                                                                    <input
                                                                        className="form-input"
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={range.min_value}
                                                                        onChange={(e) => updateRange(index, 'min_value', sanitizeDecimalInput(e.target.value))}
                                                                        placeholder="0"
                                                                        disabled={saving || customerLoading}
                                                                    />
                                                                    <input
                                                                        className="form-input"
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={range.max_value}
                                                                        onChange={(e) => updateRange(index, 'max_value', sanitizeDecimalInput(e.target.value))}
                                                                        placeholder="All"
                                                                        disabled={saving || customerLoading}
                                                                    />
                                                                    <input
                                                                        className="form-input"
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={range.white_markup}
                                                                        onChange={(e) => updateRange(index, 'white_markup', sanitizePercentageInput(e.target.value))}
                                                                        placeholder="0.00"
                                                                        disabled={saving || customerLoading}
                                                                    />
                                                                    <input
                                                                        className="form-input"
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={range.color_markup}
                                                                        onChange={(e) => updateRange(index, 'color_markup', sanitizePercentageInput(e.target.value))}
                                                                        placeholder="0.00"
                                                                        disabled={saving || customerLoading}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="markup-range-remove"
                                                                        onClick={() => removeRange(index)}
                                                                        title="Remove range"
                                                                        disabled={saving || customerLoading}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                                {rowError && (
                                                                    <p className="markup-range-error">{rowError}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="markup-ranges-empty">
                                                    No ranges configured. The default markup is used for every white and fancy-color diamond.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {formError && <p className="form-error">{formError}</p>}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="submit-button secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={saving || customerLoading || !selectedCustomer}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} style={{ marginRight: '8px' }} />
                                            Save Markup
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MarkupPage;

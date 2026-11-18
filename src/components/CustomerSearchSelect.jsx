import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import customerMarkupApi from '../apis/customerMarkup';

/**
 * Searchable customer picker backed by the lightweight options endpoint.
 * It never loads the full customer list, so it stays fast with large data.
 * Options carry encrypted IDs only.
 */
const CustomerSearchSelect = ({
    selectedCustomer = null,
    onChange,
    placeholder = 'Search customer by name or email',
    allowClear = false,
    disabled = false,
    autoFocus = false,
}) => {
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState(false);
    const [options, setOptions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef(null);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    const selectedLabel = selectedCustomer
        ? `${selectedCustomer.name}${selectedCustomer.email ? ` (${selectedCustomer.email})` : ''}`
        : '';
    const displayValue = editing ? query : (selectedLabel || query);

    const fetchOptions = useCallback(async (search) => {
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const response = await customerMarkupApi.options({ search, limit: 20 });
            let payload = response;

            if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                payload = response.data;
            }

            const list = Array.isArray(payload)
                ? payload
                : (Array.isArray(payload?.data) ? payload.data : []);

            if (!controller.signal.aborted) {
                setOptions(list);
                setActiveIndex(list.length ? 0 : -1);
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                console.error('Failed to load customers:', err);
                setOptions([]);
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    // Fetch when the picker opens, and debounce typing.
    useEffect(() => {
        if (!open) return undefined;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            fetchOptions(query.trim());
        }, query.trim() ? 300 : 0);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, open, fetchOptions]);

    // Close on outside click and restore the selected label.
    useEffect(() => {
        const handleMouseDown = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
                setEditing(false);
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    // Cancel pending requests and timers on unmount.
    useEffect(() => () => {
        if (abortRef.current) abortRef.current.abort();
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const handleSelect = (customer) => {
        onChange(customer);
        setQuery('');
        setEditing(false);
        setOpen(false);
        setActiveIndex(-1);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
        setEditing(false);
        setOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter') {
            if (open && activeIndex >= 0 && options[activeIndex]) {
                event.preventDefault();
                handleSelect(options[activeIndex]);
            }
        } else if (event.key === 'Escape') {
            setOpen(false);
            setEditing(false);
            setQuery('');
        }
    };

    return (
        <div className="customer-search-select" ref={wrapperRef}>
            <div className="customer-search-input-wrapper">
                <Search size={15} className="customer-search-icon" />
                <input
                    className="form-input customer-search-input"
                    type="text"
                    value={displayValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setEditing(true);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        setOpen(true);
                        setEditing(true);
                        setQuery('');
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    autoComplete="off"
                />
                {allowClear && selectedCustomer && !loading && (
                    <button
                        type="button"
                        className="customer-search-clear"
                        onClick={handleClear}
                        title="Clear customer"
                        disabled={disabled}
                    >
                        <X size={14} />
                    </button>
                )}
                {loading && <Loader2 size={14} className="customer-search-loading" />}
            </div>

            {open && (
                <div className="customer-search-dropdown">
                    {allowClear && (
                        <button
                            type="button"
                            className="customer-search-option customer-search-option-clear"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                        >
                            <span className="customer-search-option-name">All Customers</span>
                        </button>
                    )}

                    {options.map((customer, index) => (
                        <button
                            type="button"
                            key={customer.encrypted_id}
                            className={`customer-search-option ${index === activeIndex ? 'active' : ''}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(customer)}
                        >
                            <span className="customer-search-option-name">{customer.name}</span>
                            <span className="customer-search-option-email">{customer.email}</span>
                        </button>
                    ))}

                    {!loading && options.length === 0 && (
                        <div className="customer-search-empty">No customers found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerSearchSelect;

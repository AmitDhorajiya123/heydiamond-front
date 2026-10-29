import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    Image as ImageIcon,
    Video,
    Play,
    Download,
    Columns,
    ExternalLink,
    CheckSquare,
    Square,
    Filter,
    ArrowLeft
} from 'lucide-react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import diamondApi from '../apis/diamond';
import { useToast } from '../context/ToastContext';

// Media Preview Modal Component
const MediaPreviewModal = ({ isOpen, onClose, media }) => {
    if (!isOpen || !media) return null;

    const { type, url, title } = media;
    const [useIframeFallback, setUseIframeFallback] = useState(false);
    const [mediaError, setMediaError] = useState(false);

    useEffect(() => {
        setUseIframeFallback(false);
        setMediaError(false);
    }, [url]);

    // Check if the URL is clearly a direct video file extension (.mp4, .webm, .mov, etc.)
    const cleanUrl = (url || '').split('?')[0].toLowerCase();
    const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);

    // Diamond videos (like VDB, Segoma, Vision360, YouTube, etc.) are web players, so they require an iframe.
    const shouldRenderIframe = (type === 'video' && !isDirectVideo) || useIframeFallback || type === 'iframe';

    return (
        <div className="media-modal-overlay" onClick={onClose}>
            <div className="media-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="media-modal-header">
                    <h3 className="media-modal-title">{title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {type === 'video' && (
                            <button
                                type="button"
                                onClick={() => setUseIframeFallback(prev => !prev)}
                                title={shouldRenderIframe ? "Switch to Video Player" : "Switch to 360/Web Player"}
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    padding: '5px 12px',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    cursor: 'pointer'
                                }}
                            >
                                {shouldRenderIframe ? "Switch to MP4 Player" : "Switch to 360/Web View"}
                            </button>
                        )}
                        <button className="media-modal-close" onClick={onClose} aria-label="Close modal">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="media-modal-body">
                    {type === 'image' && url && !mediaError && (
                        <img
                            src={url}
                            alt={title}
                            className="media-preview-image"
                            onError={() => setMediaError(true)}
                        />
                    )}

                    {type === 'video' && url && !shouldRenderIframe && !mediaError && (
                        <video
                            className="media-preview-video"
                            controls
                            autoPlay
                            playsInline
                            crossOrigin="anonymous"
                            src={url}
                            onError={() => {
                                // If direct video fails to decode (e.g. web page URL), automatically switch to iframe viewer
                                setUseIframeFallback(true);
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {shouldRenderIframe && url && !mediaError && (
                        <iframe 
                            className="media-preview-iframe" 
                            src={url} 
                            title={title}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            style={{
                                width: '100%',
                                height: '70vh',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: '#000000'
                            }}
                        />
                    )}

                    {(!url || mediaError) && (
                        <div className="media-placeholder">
                            <AlertCircle size={48} style={{ color: 'var(--color-text-light)' }} />
                            <p style={{ marginTop: '12px', color: '#ffffff' }}>
                                {mediaError ? 'Unable to load media directly in modal' : 'No media available'}
                            </p>
                            {url && (
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="media-download-link"
                                    style={{ marginTop: '16px' }}
                                >
                                    <ExternalLink size={16} style={{ marginRight: '6px' }} />
                                    Open Link Directly in New Tab
                                </a>
                            )}
                        </div>
                    )}
                </div>
                {url && (
                    <div className="media-modal-footer">
                        <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="media-download-link"
                        >
                            <ExternalLink size={16} style={{ marginRight: '6px' }} />
                            Open in new tab
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

// Column Visibility Modal Component
const ColumnVisibilityModal = ({ isOpen, onClose, columns, visibleColumns, onToggleColumn, onSelectAll, onSelectNone }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Column Visibility</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="column-visibility-actions" style={{ display: 'flex', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-input-border)' }}>
                        <button
                            type="button"
                            className="submit-button secondary"
                            onClick={onSelectAll}
                            style={{ flex: 1 }}
                        >
                            <CheckSquare size={14} style={{ marginRight: '6px' }} />
                            Select All
                        </button>
                        <button
                            type="button"
                            className="submit-button secondary"
                            onClick={onSelectNone}
                            style={{ flex: 1 }}
                        >
                            <Square size={14} style={{ marginRight: '6px' }} />
                            Select None
                        </button>
                    </div>
                    {columns.map((col) => (
                        <label key={col.key} className="column-toggle-label">
                            <input
                                type="checkbox"
                                checked={visibleColumns.includes(col.key)}
                                onChange={() => onToggleColumn(col.key)}
                                className="column-toggle-input"
                            />
                            <span className="column-toggle-text">{col.label}</span>
                        </label>
                    ))}
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="submit-button"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// Define all available columns - EXACT match to Laravel blade template column order
// Defined outside component so it's available for useState initializer
const allColumns = [
    // Core Identification (matching Laravel table order)
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'stockNo', label: 'Stock No', width: '130px', required: true },
    { key: 'status', label: 'Status', width: '100px' },
    
    // Basic Diamond Info
    { key: 'shape', label: 'Shape', width: '100px' },
    { key: 'Diamond_Type', label: 'Diamond Type', width: '120px' },
    { key: 'weight', label: 'Weight (ct)', width: '90px' },
    { key: 'color', label: 'Color', width: '80px' },
    { key: 'clarity', label: 'Clarity', width: '80px' },
    { key: 'cut', label: 'Cut', width: '80px' },
    { key: 'polish', label: 'Polish', width: '80px' },
    { key: 'symmetry', label: 'Symmetry', width: '90px' },
    
    // Fluorescence
    { key: 'fluorescenceIntensity', label: 'Fluor. Intensity', width: '110px' },
    { key: 'fluorescenceColor', label: 'Fluor. Color', width: '100px' },
    
    // Measurements
    { key: 'measurements', label: 'Measurements', width: '140px' },
    { key: 'shade', label: 'Shade', width: '90px' },
    { key: 'BGM', label: 'BGM', width: '70px' },
    { key: 'milky', label: 'Milky', width: '70px' },
    { key: 'eyeClean', label: 'Eye Clean', width: '80px' },
    
    // Certification
    { key: 'lab', label: 'Lab', width: '80px' },
    { key: 'reportNo', label: 'Report No', width: '120px' },
    { key: 'reportDate', label: 'Report Date', width: '120px' },
    { key: 'location', label: 'Location', width: '100px' },
    
    // Treatment & Proportions
    { key: 'treatment', label: 'Treatment', width: '100px' },
    { key: 'ratio', label: 'Ratio', width: '70px' },
    { key: 'growthType', label: 'Growth Type', width: '100px' },
    { key: 'rapPricePerCt', label: 'Rap $/ct', width: '100px' },
    
    // Proportions
    { key: 'depth', label: 'Depth %', width: '80px' },
    { key: 'table', label: 'Table %', width: '80px' },
    { key: 'girdleThin', label: 'Girdle Thin', width: '100px' },
    { key: 'girdleThick', label: 'Girdle Thick', width: '100px' },
    { key: 'gridlePer', label: 'Girdle %', width: '80px' },
    { key: 'girdleCondition', label: 'Girdle Cond.', width: '100px' },
    { key: 'culetSize', label: 'Culet Size', width: '90px' },
    { key: 'ciletCondition', label: 'Culet Cond.', width: '90px' },
    { key: 'crownHeight', label: 'Crown Height', width: '100px' },
    { key: 'crownAngle', label: 'Crown Angle', width: '100px' },
    { key: 'pavilionDepth', label: 'Pavilion Depth', width: '110px' },
    { key: 'pavilionAngle', label: 'Pavilion Angle', width: '110px' },
    { key: 'starLength', label: 'Star Length', width: '100px' },
    
    // Inscriptions
    { key: 'inscription', label: 'Inscription', width: '100px' },
    { key: 'laserInscription', label: 'Laser Inscription', width: '130px' },
    
    // Certificate Details
    { key: 'certiComment', label: 'Cert Comment', width: '140px' },
    { key: 'keyToSymbole', label: 'Key to Symbols', width: '120px' },
    
    // Inclusions
    { key: 'inclusion', label: 'Inclusion', width: '100px' },
    { key: 'whiteInclusion', label: 'White Incl.', width: '100px' },
    { key: 'blackInclusion', label: 'Black Incl.', width: '100px' },
    { key: 'openInclusion', label: 'Open Incl.', width: '100px' },
    
    // Fancy Color
    { key: 'fancyColor', label: 'Fancy Color', width: '100px' },
    { key: 'fancyColorIntensity', label: 'Fancy Intensity', width: '120px' },
    { key: 'fancyColorOvertone', label: 'Fancy Overtone', width: '120px' },
    
    // Origin
    { key: 'country', label: 'Country', width: '100px' },
    { key: 'state', label: 'State', width: '100px' },
    { key: 'city', label: 'City', width: '100px' },
    
    // CertiFile (file preview)
    { key: 'certiFile', label: 'Certificate', width: '90px', media: 'file' },
    
    // Videos
    { key: 'videoLink', label: 'Video', width: '90px', media: 'video' },
    { key: 'vdbVideo', label: 'VDB Video', width: '100px', media: 'video' },
    
    // Images
    { key: 'imageLink', label: 'Main Image', width: '90px', media: 'image' },
    { key: 'heartImage', label: 'Heart Image', width: '100px', media: 'image' },
    { key: 'arrowImage', label: 'Arrow Image', width: '100px', media: 'image' },
    { key: 'assetImage', label: 'Asset Image', width: '100px', media: 'image' },
    { key: 'heartAndArrow', label: 'H&A Image', width: '100px', media: 'image' },
    
    // Additional Characteristics
    { key: 'luster', label: 'Luster', width: '80px' },
    { key: 'brand', label: 'Brand', width: '100px' },
    { key: 'origin', label: 'Origin', width: '100px' },
    { key: 'COP', label: 'COP', width: '70px' },
    { key: 'DNA', label: 'DNA', width: '180px' },
    
    // More Videos
    { key: 'handyVideo', label: 'Handy Video', width: '100px', media: 'video' },
    { key: 'supplierComment', label: 'Supplier Comment', width: '140px' },
    { key: 'tinge', label: 'Tinge', width: '80px' },
    { key: 'memberComment', label: 'Member Comment', width: '140px' },
    
    // Pair
    { key: 'isPair', label: 'Is Pair', width: '80px' },
    { key: 'pairStock', label: 'Pair Stock', width: '100px' },
    
    // More Videos
    { key: 'tweezerVideo', label: 'Tweezer Video', width: '110px', media: 'video' },
    
    // Dimensions
    { key: 'length', label: 'Length', width: '80px' },
    { key: 'height', label: 'Height', width: '80px' },
    { key: 'width', label: 'Width', width: '80px' },
    
    // Pricing
    { key: 'pricePerCt', label: '$/ct', width: '90px' },
    { key: 'totalPrice', label: 'Total $', width: '100px' },
    { key: 'discount', label: 'Discount %', width: '90px' },
    { key: 'exclusive', label: 'Exclusive', width: '90px' },
    
    // Date And Time (created_at)
    { key: 'created_at', label: 'Date And Time', width: '140px' },
    { key: 'updated_at', label: 'Updated', width: '140px' },
];

const APPLIED_FILTERS_KEY = 'hd_inventory_applied_filters';
const FILTER_FORM_KEY = 'hd_inventory_filters';

const loadAppliedFilters = () => {
    try {
        const raw = sessionStorage.getItem(APPLIED_FILTERS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

// Backward compatibility: read filters from a legacy URL (?shape=...)
const parseLegacyFilters = (searchParams) => {
    const initialFilters = {};

    ['shape', 'color', 'clarity', 'cut', 'polish', 'symmetry',
        'fluorescenceIntensity', 'fluorescenceColor', 'lab', 'location', 'status',
        'heartAndArrow', 'shade', 'milky', 'blackInclusion', 'whiteInclusion',
        'symbols'].forEach((key) => {
        const value = searchParams.get(key);
        if (value) {
            const values = value.split(',').map((v) => v.trim()).filter(Boolean);
            if (values.length) initialFilters[key] = values;
        }
    });

    ['weightMin', 'weightMax', 'pricePerCtMin', 'pricePerCtMax',
        'totalPriceMin', 'totalPriceMax',
        'depthMin', 'depthMax', 'tableMin', 'tableMax', 'ratioMin', 'ratioMax',
        'lengthMin', 'lengthMax', 'widthMin', 'widthMax', 'heightMin', 'heightMax',
        'crownAngleMin', 'crownAngleMax', 'crownHeightMin', 'crownHeightMax',
        'pavilionAngleMin', 'pavilionAngleMax', 'pavilionDepthMin', 'pavilionDepthMax',
        'keyToSymbole', 'symbolMode',
        'noBgm', 'noBlack',
        'availableOnly', 'newOnly', 'offerOnly', 'upcomingOnly',
        'search'].forEach((key) => {
        const value = searchParams.get(key);
        if (value) initialFilters[key] = value;
    });

    return initialFilters;
};

const Inventory = () => {
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Table data and pagination state
    const [diamonds, setDiamonds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const [total, setTotal] = useState(0);

    // Search input stays empty; filters arrive via navigation state / sessionStorage
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState(() => {
        // 1) Filters passed with navigate('/inventory', { state: { appliedFilters } })
        if (location.state?.appliedFilters && typeof location.state.appliedFilters === 'object') {
            return location.state.appliedFilters;
        }

        // 2) Filters kept for this tab (survives refresh)
        const stored = loadAppliedFilters();
        if (stored && typeof stored === 'object') {
            return stored;
        }

        // 3) Legacy URL query params
        return parseLegacyFilters(new URLSearchParams(location.search || ''));
    });

    // Sorting state
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');

    // Column visibility - Show ALL columns by default (like Yajra DataTables)
    const [visibleColumns, setVisibleColumns] = useState(() => 
        allColumns.map(c => c.key)
    );
    const [showColumnModal, setShowColumnModal] = useState(false);

    // Media preview modal
    const [mediaPreview, setMediaPreview] = useState(null);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        diamond: null,
        loading: false,
    });

    // Debounce search: wait until the user stops typing before querying
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);

            // Typing overrides the Stock ID filter from the filter page.
            // Clear it in the same batch as the debounced search so the first
            // keystroke does not trigger an extra immediate request.
            if (searchTerm.trim() !== '') {
                setFilters((prev) => {
                    if (!Object.prototype.hasOwnProperty.call(prev, 'search')) {
                        return prev;
                    }
                    const next = { ...prev };
                    delete next.search;
                    return next;
                });
            }
        }, 700);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const abortControllerRef = useRef(null);
    const drawCounterRef = useRef(1);

    // Fetch diamonds
    const fetchDiamonds = useCallback(async () => {
        // Cancel any pending request to prevent race conditions during rapid pagination
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const sortColumnIndex = allColumns.findIndex(c => c.key === sortBy);
            const currentDraw = drawCounterRef.current++;

            // Support BOTH Yajra DataTables parameters (start, length, draw, order)
            // AND standard Laravel pagination parameters (page, per_page, limit, sort_by)
            const params = {
                // Yajra DataTables offset and length
                draw: currentDraw,
                start: (currentPage - 1) * perPage,
                length: perPage,

                // Standard Laravel pagination
                page: currentPage,
                per_page: perPage,
                limit: perPage,

                // Standard sorting
                sort_by: sortBy,
                sort_order: sortOrder,
            };

            // Yajra ordering
            if (sortColumnIndex >= 0) {
                params['order[0][column]'] = sortColumnIndex;
                params['order[0][dir]'] = sortOrder;
                params[`columns[${sortColumnIndex}][data]`] = sortBy;
                params[`columns[${sortColumnIndex}][name]`] = sortBy;
            }

            // Search query (standard Laravel + Yajra compatible)
            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            // Custom filters (multi-value arrays and single-value ranges/flags)
            Object.entries(filters).forEach(([key, value]) => {
                // The filter page's "Stock ID / Certificate #" filter must stay
                // limited to stockNo/reportNo, so it cannot reuse the global
                // datatable `search` parameter.
                const paramKey = key === 'search' ? 'stockSearch' : key;

                if (Array.isArray(value)) {
                    if (value.length) params[paramKey] = value;
                } else if (value !== '' && value !== null && value !== undefined) {
                    params[paramKey] = value;
                }
            });

            const response = await diamondApi.search(params, { signal: controller.signal });

            // Extract the payload (handles direct Yajra response or wrapped { success: true, data: { ... } })
            let payload = response;
            if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                payload = response.data;
            }

            // 1. Extract the items array
            let items = [];
            if (Array.isArray(payload.data)) {
                items = payload.data;
            } else if (Array.isArray(response.data)) {
                items = response.data;
            } else if (Array.isArray(payload)) {
                items = payload;
            } else if (Array.isArray(response)) {
                items = response;
            }

            // 2. Extract total records from all possible Yajra and Laravel pagination structures
            const candidateTotal =
                payload?.recordsFiltered ??
                payload?.recordsTotal ??
                response?.recordsFiltered ??
                response?.recordsTotal ??
                response?.data?.recordsFiltered ??
                response?.data?.recordsTotal ??
                payload?.total ??
                response?.total ??
                response?.data?.total ??
                payload?.meta?.total ??
                response?.meta?.total ??
                payload?.total_count ??
                response?.total_count ??
                payload?.totalRecords ??
                response?.totalRecords;

            const totalRecords = candidateTotal !== undefined && candidateTotal !== null && !isNaN(Number(candidateTotal))
                ? Number(candidateTotal)
                : items.length;

            // 3. Extract or compute last page and current page
            const activePerPage = perPage || 25;
            const calculatedLastPage = Math.max(1, Math.ceil(totalRecords / activePerPage));
            const activeLastPage = Number(payload?.last_page || response?.last_page || response?.data?.last_page) || calculatedLastPage;
            const activeCurrentPage = Number(payload?.current_page || response?.current_page || response?.data?.current_page) || currentPage;

            setDiamonds(items);
            setTotal(totalRecords);
            setLastPage(activeLastPage);
            setCurrentPage(activeCurrentPage);
        } catch (err) {
            // Ignore canceled requests
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Error fetching diamonds:', err);
            showToast(err.response?.data?.message || 'Failed to load diamonds', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearchTerm, filters, sortBy, sortOrder, showToast]);

    useEffect(() => {
        fetchDiamonds();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchDiamonds]);

    // Handle sync
    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await diamondApi.sync();
            if (response.success) {
                showToast(response.message || 'Diamonds synced successfully!', 'success');
                fetchDiamonds();
            } else {
                showToast(response.message || 'Sync failed', 'error');
            }
        } catch (err) {
            console.error('Sync error:', err);
            showToast(err.response?.data?.message || 'Sync failed', 'error');
        } finally {
            setSyncing(false);
        }
    };

    // Handle sort
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Column visibility toggle
    const toggleColumn = (key) => {
        setVisibleColumns(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key) 
                : [...prev, key]
        );
    };

    // Clear all filters and reset to page 1
    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setCurrentPage(1);
        // Forget the selection kept for the filter page, otherwise
        // "Back to Filters" would bring back the cleared filters
        sessionStorage.removeItem(FILTER_FORM_KEY);
        sessionStorage.removeItem(APPLIED_FILTERS_KEY);
        // Remove the navigation state too, so a refresh does not restore them
        navigate('/inventory', { replace: true, state: {} });
    };

    // Navigate back to filter page; the form is restored from sessionStorage
    const goBackToFilters = () => {
        navigate('/inventory/filter');
    };

    // Media preview
    const openMediaPreview = (type, url, title) => {
        if (url) {
            setMediaPreview({ type, url, title });
        }
    };

    // Delete confirmation
    const handleOpenDeleteConfirm = (diamond) => {
        setDeleteConfirm({
            isOpen: true,
            diamond,
            loading: false,
        });
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm({
            isOpen: false,
            diamond: null,
            loading: false,
        });
    };

    const handleConfirmDelete = async () => {
        const { diamond } = deleteConfirm;
        if (!diamond) return;

        setDeleteConfirm(prev => ({ ...prev, loading: true }));

        try {
            const response = await diamondApi.remove(diamond.id);
            if (response.success) {
                showToast(response.message || 'Diamond deleted successfully', 'success');
                handleCloseDeleteConfirm();
                fetchDiamonds();
            } else {
                showToast(response.message || 'Failed to delete diamond', 'error');
                handleCloseDeleteConfirm();
            }
        } catch (err) {
            console.error('Error deleting diamond:', err);
            showToast(err.response?.data?.message || 'Failed to delete diamond', 'error');
            handleCloseDeleteConfirm();
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

    // Format currency
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-';
        const num = Number(value);
        if (isNaN(num)) return String(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    // Format weight
    const formatWeight = (value) => {
        if (!value && value !== 0) return '-';
        const num = Number(value);
        if (isNaN(num)) return String(value);
        return num.toFixed(2) + ' ct';
    };

    // Render cell content
    const renderCell = (diamond, column) => {
        const value = diamond[column.key];
        
        if (!value && value !== 0) return <span style={{ color: 'var(--color-text-light)' }}>-</span>;

        // Media columns
        if (column.media === 'image' && value) {
            return (
                <button
                    className="media-preview-btn"
                    onClick={() => openMediaPreview('image', value, `${diamond.stockNo} - Image`)}
                    title="View image"
                >
                    <ImageIcon size={16} />
                </button>
            );
        }
        
        if (column.media === 'video' && value) {
            return (
                <button
                    className="media-preview-btn"
                    onClick={() => openMediaPreview('video', value, `${diamond.stockNo} - Video`)}
                    title="View video"
                >
                    <Video size={16} />
                </button>
            );
        }
        
        if (column.media === 'file' && value) {
            return (
                <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="media-preview-btn"
                    title="View certificate"
                >
                    <Download size={16} />
                </a>
            );
        }
        
        if (column.media === 'iframe' && value) {
            return (
                <button
                    className="media-preview-btn"
                    onClick={() => openMediaPreview('iframe', value, `${diamond.stockNo} - Video`)}
                    title="View video"
                >
                    <Play size={16} />
                </button>
            );
        }

        // Format specific columns
        switch (column.key) {
            case 'weight':
                return <span style={{ fontFamily: 'monospace' }}>{formatWeight(value)}</span>;
            case 'pricePerCt':
            case 'totalPrice':
            case 'rapPricePerCt':
                return <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{formatCurrency(value)}</span>;
            case 'discount':
                return <span style={{ fontFamily: 'monospace' }}>{Number(value).toFixed(1)}%</span>;
            case 'created_at':
            case 'updated_at':
            case 'reportDate':
                return <span style={{ fontSize: '11px' }}>{formatDate(value)}</span>;
            case 'depth':
            case 'table':
            case 'gridlePer':
            case 'ratio':
            case 'crownHeight':
            case 'crownAngle':
            case 'pavilionDepth':
            case 'pavilionAngle':
            case 'starLength':
            case 'length':
            case 'width':
            case 'height':
            case 'girdleThin':
            case 'girdleThick':
            case 'crownHeight':
            case 'crownAngle':
            case 'pavilionDepth':
            case 'pavilionAngle':
                return <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{String(value)}</span>;
            case 'status':
                return (
                    <span className={`status-badge ${value?.toLowerCase() === 'available' ? 'status-available' : value?.toLowerCase() === 'sold' ? 'status-sold' : value?.toLowerCase() === 'reserved' ? 'status-reserved' : 'status-default'}`}>
                        {value}
                    </span>
                );
            case 'isPair':
                return (
                    <span className={`status-badge ${value === '1' || value === true || value === 'true' ? 'status-available' : 'status-default'}`}>
                        {value === '1' || value === true || value === 'true' ? 'Yes' : 'No'}
                    </span>
                );
            case 'exclusive':
                return (
                    <span className={`status-badge ${value === 'yes' || value === '1' || value === true || value === 'true' ? 'status-available' : 'status-default'}`}>
                        {value}
                    </span>
                );
            case 'milky':
            case 'eyeClean':
            case 'BGM':
                return (
                    <span className={`status-badge ${value === 'YES' || value === 'yes' || value === '1' || value === true ? 'status-available' : 'status-default'}`}>
                        {value}
                    </span>
                );
            case 'DNA':
                return (
                    <a
                        href={`/inventory/dna/${diamond.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dna-view-link"
                        title="View Full DNA in a new tab"
                    >
                        <ExternalLink size={12} />
                        <span>View DNA</span>
                    </a>
                );
            default:
                return <span title={String(value)}>{String(value).length > 35 ? String(value).substring(0, 35) + '...' : String(value)}</span>;
        }
    };

    return (
        <Layout>
            {/* Page Header */}
            <div className="table-header">
                <h1 className="table-title">Diamond Inventory</h1>
                <div className="table-actions">
                    {/* <button
                        className="submit-button secondary"
                        onClick={() => setShowColumnModal(true)}
                        disabled={loading}
                        title="Column Visibility"
                    >
                        <Columns size={16} style={{ marginRight: '8px' }} />
                        Columns
                    </button> */}
                    <button
                        className="submit-button"
                        onClick={handleSync}
                        disabled={loading || syncing}
                    >
                        <RefreshCw size={16} style={{ marginRight: '8px' }} className={syncing ? 'spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Diamonds'}
                    </button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="filters-bar inventory-toolbar">
                <div className="inventory-toolbar-left">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search all columns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="inventory-per-page">
                        <span>Show</span>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="inventory-per-page-select"
                            disabled={loading}
                            aria-label="Select number of entries per page"
                        >
                            {[10, 25, 50, 100, 200].map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <span>entries</span>
                    </div>
                </div>

                <div className="filters-wrapper">
                    <button
                        className="filter-clear-btn back-to-filters"
                        onClick={goBackToFilters}
                        disabled={loading}
                    >
                        <ArrowLeft size={14} style={{ marginRight: '4px' }} />
                        Back to Filters
                    </button>
                    {Object.keys(filters).length > 0 && (
                        <button
                            className="filter-clear-btn"
                            onClick={clearFilters}
                            disabled={loading || !Object.values(filters).some(v => v)}
                        >
                            <X size={14} style={{ marginRight: '4px' }} />
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                {allColumns
                                    .filter(col => visibleColumns.includes(col.key) || col.required)
                                    .map((column) => (
                                        <th
                                            key={column.key}
                                            style={{ 
                                                width: column.width,
                                                cursor: 'default',
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <div className="th-content">
                                                <span>{column.label}</span>
                                            </div>
                                        </th>
                                    ))}
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diamonds.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.filter(v => allColumns.some(c => c.key === v && !c.required)).length + 2} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                                        {loading ? (
                                            <>
                                                <Loader2 size={24} className="spin" style={{ marginBottom: '12px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                                                <p>Loading diamonds...</p>
                                            </>
                                        ) : (
                                            'No diamonds found'
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                diamonds.map((diamond, index) => (
                                    <tr key={diamond.id}>
                                        {allColumns
                                            .filter(col => visibleColumns.includes(col.key) || col.required)
                                            .map((column) => (
                                                <td key={column.key} style={{ 
                                                    fontSize: column.key === 'stockNo' ? '12px' : '11px',
                                                    fontFamily: column.key === 'stockNo' || column.key === 'weight' || column.key === 'pricePerCt' || column.key === 'totalPrice' ? 'monospace' : 'inherit'
                                                }}>
                                                    {renderCell(diamond, column)}
                                                </td>
                                            ))}
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start' }}>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleOpenDeleteConfirm(diamond)}
                                                    title="Delete"
                                                    disabled={loading}
                                                    style={{ color: '#d93025' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modern Enterprise Pagination (Optimized for millions of records) */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    totalItems={total}
                    perPage={perPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                    }}
                    loading={loading}
                    showPerPage={false}
                    showInfo={true}
                    showQuickJump={true}
                />
            </div>

            {/* Media Preview Modal */}
            {mediaPreview && (
                <MediaPreviewModal
                    isOpen={true}
                    onClose={() => setMediaPreview(null)}
                    media={mediaPreview}
                />
            )}

            {/* Column Visibility Modal */}
            <ColumnVisibilityModal
                isOpen={showColumnModal}
                onClose={() => setShowColumnModal(false)}
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                onSelectAll={() => setVisibleColumns(allColumns.map(c => c.key))}
                onSelectNone={() => setVisibleColumns(['stockNo', 'status'])}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="modal-overlay" onClick={handleCloseDeleteConfirm}>
                    <div className="modal-container modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Diamond</h2>
                            <button className="modal-close" onClick={handleCloseDeleteConfirm}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: '1.5' }}>
                                Are you sure you want to delete diamond <strong>{deleteConfirm.diamond?.stockNo}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="submit-button secondary"
                                onClick={handleCloseDeleteConfirm}
                                disabled={deleteConfirm.loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="submit-button danger"
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirm.loading}
                            >
                                {deleteConfirm.loading ? (
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

export default Inventory;
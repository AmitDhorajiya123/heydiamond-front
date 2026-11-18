import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    X,
    Plus,
    Search,
    Star,
    Eye,
    ImageOff,
    TrendingUp,
} from 'lucide-react';
import Layout from '../components/Layout';
import dashboardApi from '../apis/dashboard';
import diamondApi from '../apis/diamond';
import featuredAdsApi from '../apis/featuredAds';
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

const MAX_ADS = 3;

// Prefer the certificate verification URL stored on the diamond record.
// Older rows without that link fall back to a lab-specific report lookup.
const reportUrlFor = (diamond) => {
    const cert = typeof diamond?.certiFile === 'string' ? diamond.certiFile.trim() : '';

    if (cert) return cert;

    const reportNo = diamond?.reportNo;
    if (!reportNo) return null;

    const lab = String(diamond.lab || '').toUpperCase();
    const encoded = encodeURIComponent(reportNo);

    if (lab.includes('IGI')) return `https://www.igi.org/verify-your-report/?r=${encoded}`;
    if (lab.includes('GIA')) return `https://www.gia.edu/report-check?reportno=${encoded}`;
    if (lab.includes('GCAL')) return `https://www.gcalusa.com/certificate-search.html?certificate_id=${encoded}`;
    if (lab.includes('SGL')) return `https://www.sglindia.net/certificate-verification/?reportno=${encoded}`;

    return `https://www.gia.edu/report-check?reportno=${encoded}`;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (val) => (val !== null && val !== undefined && val !== '' ? val : '–');
const fmtPrice = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '–';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};
const fmtPriceShort = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '–';
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Parse the stored measurement string (e.g. "9.80 * 9.85 * 5.97") into
// [length, width, depth] in millimetres, with per-column fallbacks.
const measurementParts = (diamond) => {
    const raw = typeof diamond.measurements === 'string' ? diamond.measurements.trim() : '';
    if (raw) {
        const parts = raw.split(/\s*[*x×]\s*/i).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) return parts.slice(0, 3);
    }

    return [diamond.length, diamond.width, diamond.height || diamond.depth]
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(String);
};

const fmtMm = (val) => {
    if (val === null || val === undefined || val === '') return '–';
    return `${val} mm`;
};

// ─── Ad Card (active slot) ───────────────────────────────────────────────────
const FeaturedAdCard = ({ diamond, onRemove }) => {
    const [imgErr, setImgErr] = useState(false);
    const img = diamond.imageLink || diamond.assetImage || diamond.heartImage || null;
    const [mLength, mWidth, mDepth] = measurementParts(diamond);

    return (
        <div className="featured-ad-card">
            {/* Card header */}
            <div className="featured-ad-card-header">
                <span className="featured-ad-badge">
                    <span className="sparkle-dot" />
                    Featured Ad
                </span>
                <button
                    className="featured-ad-remove-btn"
                    title="Remove from featured"
                    onClick={() => onRemove(diamond.ad_encrypted_id || diamond.encrypted_id)}
                >
                    <X size={12} />
                </button>
            </div>

            {/* Image */}
            <div className="featured-ad-media">
                {img && !imgErr ? (
                    <img
                        className="featured-ad-img"
                        src={img}
                        alt={diamond.stockNo}
                        onError={() => setImgErr(true)}
                    />
                ) : (
                    <div className="featured-ad-media-fallback">
                        <Gem size={40} />
                        <span style={{ fontSize: 11 }}>No Image</span>
                    </div>
                )}
                {diamond.status && (
                    <span className="featured-ad-status-pill">{diamond.status}</span>
                )}
            </div>

            {/* Content */}
            <div className="featured-ad-content">
                <div className="featured-ad-stock-row">
                    <span className="featured-ad-stock-num">#{fmt(diamond.stockNo)}</span>
                    {diamond.lab && (
                        <span className="featured-ad-lab-badge">{diamond.lab}</span>
                    )}
                </div>

                <div className="featured-ad-title">
                    {[diamond.shape, diamond.weight ? `${parseFloat(diamond.weight).toFixed(2)} ct` : null]
                        .filter(Boolean)
                        .join(' — ') || 'Diamond'}
                </div>

                {/* 4Cs specs */}
                <div className="featured-ad-specs-grid">
                    {[
                        { label: 'Carat', val: diamond.weight ? parseFloat(diamond.weight).toFixed(2) : '–' },
                        { label: 'Color', val: fmt(diamond.color) },
                        { label: 'Clarity', val: fmt(diamond.clarity) },
                        { label: 'Cut', val: fmt(diamond.cut) },
                    ].map(({ label, val }) => (
                        <div key={label} className="featured-ad-spec-item">
                            <span className="featured-ad-spec-label">{label}</span>
                            <span className="featured-ad-spec-val">{val}</span>
                        </div>
                    ))}
                </div>

                {/* Extra specs row: Polish, Symmetry, Fluorescence */}
                <div className="featured-ad-specs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 14 }}>
                    {[
                        { label: 'Polish', val: fmt(diamond.polish) },
                        { label: 'Sym', val: fmt(diamond.symmetry) },
                        { label: 'Fluor', val: fmt(diamond.fluorescenceIntensity) },
                    ].map(({ label, val }) => (
                        <div key={label} className="featured-ad-spec-item">
                            <span className="featured-ad-spec-label">{label}</span>
                            <span className="featured-ad-spec-val">{val}</span>
                        </div>
                    ))}
                </div>

                {/* Measurement row: Length, Width, Depth (mm) */}
                <div className="featured-ad-specs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 14 }}>
                    {[
                        { label: 'Length', val: fmtMm(mLength) },
                        { label: 'Width', val: fmtMm(mWidth) },
                        { label: 'Depth', val: fmtMm(mDepth) },
                    ].map(({ label, val }) => (
                        <div key={label} className="featured-ad-spec-item">
                            <span className="featured-ad-spec-label">{label}</span>
                            <span className="featured-ad-spec-val">{val}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div className="featured-ad-pricing-box">
                    <div className="featured-ad-price-unit">
                        <span className="featured-ad-price-unit-label">$/ct</span>
                        <span className="featured-ad-price-unit-val">{fmtPriceShort(diamond.pricePerCt)}</span>
                    </div>
                    <div className="featured-ad-price-total">
                        <span className="featured-ad-price-total-label">Total Price</span>
                        <div className="featured-ad-price-total-val">{fmtPrice(diamond.totalPrice)}</div>
                    </div>
                </div>

                {/* Footer action */}
                <div className="featured-ad-footer-action">
                    {reportUrlFor(diamond) ? (
                        <a
                            href={reportUrlFor(diamond)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="featured-ad-view-btn"
                        >
                            <Eye size={13} /> View Report
                        </a>
                    ) : (
                        <button className="featured-ad-view-btn" disabled style={{ opacity: 0.45, cursor: 'default' }}>
                            <Eye size={13} /> No Report
                        </button>
                    )}
                    {diamond.location && (
                        <span style={{
                            fontSize: 11,
                            color: 'var(--color-text-light)',
                            alignSelf: 'center',
                            paddingLeft: 6,
                            whiteSpace: 'nowrap',
                        }}>
                            📍 {diamond.location}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Empty Slot Card ──────────────────────────────────────────────────────────
const EmptySlotCard = ({ slotIndex, onOpen }) => (
    <div
        className="featured-ad-empty-card"
        role="button"
        tabIndex={0}
        aria-label={`Add diamond to slot ${slotIndex}`}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
    >
        <div className="featured-ad-empty-icon-circle">
            <Plus size={24} />
        </div>
        <div className="featured-ad-empty-title">Empty Ad Slot {slotIndex} of {MAX_ADS}</div>
        <p className="featured-ad-empty-desc">
            Select a diamond from your inventory to feature it here as a promotional ad.
        </p>
        <span className="featured-ad-empty-btn">
            <Plus size={13} /> Add Diamond
        </span>
    </div>
);

// Separate sub-component so each row can have its own state (thumbErr)
const SelectorItem = ({ d, img, alreadySelected, maxReached, onSelect, selectedAd }) => {
    const [thumbErr, setThumbErr] = useState(false);
    return (
        <div className={`featured-selector-item${alreadySelected ? ' is-selected' : ''}`}>
            <div className="featured-selector-item-left">
                <div className="featured-selector-item-thumb">
                    {img && !thumbErr ? (
                        <img src={img} alt={d.stockNo} onError={() => setThumbErr(true)} />
                    ) : (
                        <Gem size={20} />
                    )}
                </div>
                <div className="featured-selector-item-info">
                    <div className="featured-selector-item-stock">
                        {d.stockNo || '—'}
                        {alreadySelected && (
                            <span style={{
                                fontSize: 10,
                                background: '#e6f4ea',
                                color: '#1e7e34',
                                padding: '1px 6px',
                                borderRadius: 10,
                                fontWeight: 700,
                            }}>
                                ✓ Featured
                            </span>
                        )}
                    </div>
                    <div className="featured-selector-item-sub">
                        {d.shape && <span className="featured-selector-item-badge">{d.shape}</span>}
                        {d.weight && <span>{parseFloat(d.weight).toFixed(2)} ct</span>}
                        {d.color && <span>Color: <strong>{d.color}</strong></span>}
                        {d.clarity && <span>Clarity: <strong>{d.clarity}</strong></span>}
                        {d.lab && <span style={{ color: '#1967d2', fontWeight: 600 }}>{d.lab}</span>}
                        {d.status && (
                            <span style={{ color: (d.status || '').toLowerCase() === 'available' ? '#2d7a2d' : '#777', fontSize: 11 }}>
                                ● {d.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="featured-selector-item-right">
                <div className="featured-selector-item-price">
                    <div className="featured-selector-item-price-val">{fmtPrice(d.totalPrice)}</div>
                    <div className="featured-selector-item-price-unit">
                        {d.pricePerCt ? `${fmtPriceShort(d.pricePerCt)}/ct` : ''}
                    </div>
                </div>
                {alreadySelected ? (
                    <button
                        className="featured-selector-pick-btn"
                        style={{ background: '#d93025' }}
                        onClick={() => onSelect(selectedAd || d, true)}
                    >
                        Remove
                    </button>
                ) : (
                    <button
                        className="featured-selector-pick-btn"
                        disabled={maxReached}
                        onClick={() => onSelect(d, false)}
                    >
                        {maxReached ? 'Max 3' : '+ Feature'}
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Diamond Selector Modal with Infinite Scroll ─────────────────────────────
// Props:
//   diamonds      – currently loaded items
//   total         – server total record count
//   loading       – initial page load spinner
//   loadingMore   – bottom sentinel spinner
//   onLoadMore    – callback to fetch next page
//   searchQuery   – live input value (display only)
//   onSearch      – handler that debounces + hits server
const DiamondSelectorModal = ({
    isOpen, onClose, onSelect, selectedAds,
    diamonds, total, loading, loadingMore, onLoadMore,
    searchQuery, onSearch,
}) => {
    // Sentinel ref for IntersectionObserver
    const sentinelRef = useRef(null);
    const observerRef = useRef(null);

    // Attach / re-attach observer whenever the sentinel or loadingMore changes
    useEffect(() => {
        if (!isOpen) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [isOpen, loadingMore, loading, onLoadMore]);

    if (!isOpen) return null;

    const hasMore = diamonds.length < total;

    return (
        <div className="featured-selector-modal-overlay" onClick={onClose}>
            <div className="featured-selector-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="featured-selector-header">
                    <div>
                        <h2 className="featured-selector-header-title">Select Diamond for Feature Ad</h2>
                        <p className="featured-selector-header-subtitle">
                            Choose up to {MAX_ADS} diamonds · {Object.keys(selectedAds).length}/{MAX_ADS} selected
                        </p>
                    </div>
                    <button className="featured-selector-close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Search bar */}
                <div className="featured-selector-search-bar">
                    <div className="featured-selector-search-input-wrap">
                        <Search size={15} className="featured-selector-search-icon" />
                        <input
                            type="text"
                            className="featured-selector-search-input"
                            placeholder="Search by Stock No, Shape, Color, Clarity, Lab…"
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearch('')}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#999',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="featured-selector-body">
                    {/* Initial loading spinner */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 12, color: 'var(--color-text-light)' }}>
                            <Loader2 size={20} className="spin" />
                            <span>Loading diamonds…</span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && diamonds.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-light)' }}>
                            <ImageOff size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontWeight: 600 }}>No diamonds found</p>
                            <p style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</p>
                        </div>
                    )}

                    {/* Diamond list */}
                    {!loading && diamonds.map((d) => {
                        // Encrypted IDs are randomised per response, so match on
                        // the stable stock number instead.
                        const key = d.stockNo || d.encrypted_id;
                        const ad = selectedAds[key];

                        return (
                            <SelectorItem
                                key={key}
                                d={d}
                                img={d.imageLink || d.assetImage || null}
                                alreadySelected={!!ad}
                                maxReached={Object.keys(selectedAds).length >= MAX_ADS}
                                onSelect={onSelect}
                                selectedAd={ad}
                            />
                        );
                    })}

                    {/* Sentinel div — watched by IntersectionObserver */}
                    {!loading && hasMore && (
                        <div ref={sentinelRef} style={{ height: 1 }} />
                    )}

                    {/* Load-more spinner (bottom of list) */}
                    {loadingMore && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 8, color: 'var(--color-text-light)' }}>
                            <Loader2 size={16} className="spin" />
                            <span style={{ fontSize: 13 }}>Loading more…</span>
                        </div>
                    )}

                    {/* End-of-list message */}
                    {!loading && !hasMore && diamonds.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--color-text-light)', borderTop: '1px solid #f0eae3' }}>
                            ✓ All {total.toLocaleString()} diamonds loaded
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="featured-selector-footer">
                    <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
                        Showing <strong>{diamonds.length.toLocaleString()}</strong> of <strong>{total.toLocaleString()}</strong> diamonds
                        {searchQuery && <span style={{ marginLeft: 6, color: 'var(--color-primary)' }}>· filtered</span>}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '9px 20px',
                            borderRadius: 8,
                            border: '1px solid var(--color-input-border)',
                            background: '#fff',
                            color: 'var(--color-text-dark)',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
    const { showToast } = useToast();

    // Master counts state
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Featured ads state — persisted in the database
    const [featuredDiamonds, setFeaturedDiamonds] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);

    // ── Selector modal state ──
    const [targetSlot, setTargetSlot] = useState(null); // clicked empty slot, if any
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectorDiamonds, setSelectorDiamonds] = useState([]);
    const [selectorTotal, setSelectorTotal] = useState(0);
    const [selectorPage, setSelectorPage] = useState(1);
    const [selectorLoading, setSelectorLoading] = useState(false);    // initial load
    const [selectorLoadingMore, setSelectorLoadingMore] = useState(false); // pagination
    const [selectorSearch, setSelectorSearch] = useState('');          // raw input
    const [selectorQuery, setSelectorQuery] = useState('');            // debounced query sent to API
    const selectorAbortRef = useRef(null);
    const SELECTOR_PER_PAGE = 25;

    // Load featured ads from the database
    const fetchFeaturedAds = useCallback(async () => {
        setFeaturedLoading(true);
        try {
            const res = await featuredAdsApi.list();
            const items = Array.isArray(res?.data) ? res.data : [];
            setFeaturedDiamonds(items.slice(0, MAX_ADS));
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load featured ads';
            showToast(msg, 'error');
        } finally {
            setFeaturedLoading(false);
        }
    }, [showToast]);

    // Fetch dashboard counts
    const fetchCounts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await dashboardApi.getCounts();
            if (res?.success && res?.data?.counts) {
                setCounts(res.data.counts);
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
        fetchFeaturedAds();
    }, [fetchFeaturedAds]);

    // ── Core function: fetch one page of diamonds for the selector ──
    const fetchSelectorPage = useCallback(async (page, query, append) => {
        // Cancel previous in-flight request
        if (selectorAbortRef.current) selectorAbortRef.current.abort();
        const controller = new AbortController();
        selectorAbortRef.current = controller;

        if (append) {
            setSelectorLoadingMore(true);
        } else {
            setSelectorLoading(true);
            if (!append) setSelectorDiamonds([]);
        }

        try {
            const start = (page - 1) * SELECTOR_PER_PAGE;
            const res = await diamondApi.list({
                per_page: SELECTOR_PER_PAGE,
                page,
                length: SELECTOR_PER_PAGE,
                start,
                draw: page,
                // Server-side search — works with Yajra and plain Laravel
                'search[value]': query,
                search: query,
            }, { signal: controller.signal });

            if (controller.signal.aborted) return;

            // Parse response (handles both Yajra DataTables and standard Laravel)
            const payload = res?.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : res;
            const items = Array.isArray(payload?.data) ? payload.data
                : Array.isArray(res?.data) ? res.data
                : Array.isArray(res) ? res
                : [];

            const rawTotal =
                payload?.recordsFiltered ?? payload?.recordsTotal ??
                payload?.total ?? res?.total ?? res?.recordsFiltered ?? res?.recordsTotal ??
                payload?.meta?.total ?? items.length;
            const totalCount = Number(rawTotal) || items.length;

            setSelectorTotal(totalCount);
            setSelectorDiamonds((prev) => append ? [...prev, ...items] : items);
            setSelectorPage(page);
        } catch (err) {
            if (err.name === 'AbortError' || err.name === 'CanceledError') return;
            showToast('Failed to load diamonds', 'error');
        } finally {
            setSelectorLoading(false);
            setSelectorLoadingMore(false);
        }
    }, []);

    // ── Debounce search input → triggers server fetch ──
    useEffect(() => {
        const timer = setTimeout(() => {
            setSelectorQuery(selectorSearch);
        }, 350);
        return () => clearTimeout(timer);
    }, [selectorSearch]);

    // ── When debounced query changes (and modal is open): reset & reload ──
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!selectorOpen) return;
        fetchSelectorPage(1, selectorQuery, false);
    }, [selectorQuery, selectorOpen]);

    // ── Open selector: reset state and fetch page 1 ──
    const openSelector = useCallback((slot) => {
        setTargetSlot(slot || null);
        setSelectorOpen(true);
        setSelectorDiamonds([]);
        setSelectorPage(1);
        setSelectorTotal(0);
        setSelectorSearch('');
        setSelectorQuery('');
        // fetchSelectorPage will fire via the selectorOpen useEffect above
    }, []);

    // ── Infinite scroll: load next page ──
    const handleLoadMore = useCallback(() => {
        const hasMore = selectorDiamonds.length < selectorTotal;
        if (!hasMore || selectorLoadingMore || selectorLoading) return;
        fetchSelectorPage(selectorPage + 1, selectorQuery, true);
    }, [selectorDiamonds.length, selectorTotal, selectorLoadingMore, selectorLoading, selectorPage, selectorQuery, fetchSelectorPage]);

    // Handle add / remove inside modal
    const handleSelectorPick = async (diamond, isRemove) => {
        const stockKey = diamond.stockNo || diamond.encrypted_id;

        if (isRemove) {
            try {
                await featuredAdsApi.remove(diamond.ad_encrypted_id || diamond.encrypted_id);
                setFeaturedDiamonds((prev) => prev.filter((d) => (d.stockNo || d.encrypted_id) !== stockKey));
                showToast('Diamond removed from featured ads', 'info');
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to remove featured ad', 'error');
            }
            return;
        }
        if (featuredDiamonds.length >= MAX_ADS) {
            showToast(`Maximum ${MAX_ADS} featured diamonds allowed`, 'warning');
            return;
        }
        // Encrypted IDs change on every response; stock number is the stable key.
        if (featuredDiamonds.some((d) => (d.stockNo || d.encrypted_id) === stockKey)) {
            showToast('This diamond is already featured.', 'warning');
            return;
        }

        try {
            const res = await featuredAdsApi.add(diamond.encrypted_id, targetSlot);
            const added = res?.data && !Array.isArray(res.data) ? res.data : diamond;
            setTargetSlot(null);
            setFeaturedDiamonds((prev) => (
                prev.some((d) => (d.stockNo || d.encrypted_id) === (added.stockNo || added.encrypted_id))
                    ? prev
                    : [...prev, added]
            ));
            showToast(`"${diamond.stockNo}" added to featured ads`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add featured ad', 'error');
        }
    };

    // Remove directly from ad card × button
    const handleRemoveAd = async (adEncryptedId) => {
        try {
            await featuredAdsApi.remove(adEncryptedId);
            setFeaturedDiamonds((prev) => prev.filter((d) => d.ad_encrypted_id !== adEncryptedId));
            showToast('Diamond removed from featured ads', 'info');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to remove featured ad', 'error');
        }
    };

    // Build strict 3-slot array from each ad's fixed position. Empty slots stay
    // empty when an ad is removed — later slots never shift forward.
    const slots = Array.from(
        { length: MAX_ADS },
        (_, i) => featuredDiamonds.find((d) => Number(d.position) === i + 1) || null
    );

    // Safety net for any record saved without a valid slot number.
    featuredDiamonds.forEach((d) => {
        const pos = Number(d.position);
        if (!Number.isInteger(pos) || pos < 1 || pos > MAX_ADS || !slots.includes(d)) {
            const free = slots.indexOf(null);
            if (free !== -1) slots[free] = d;
        }
    });

    // Master counts card entries
    const cardEntries = Object.entries(labelMap).map(([key, label]) => ({
        key,
        label,
        count: counts[key] ?? 0,
        Icon: iconMap[key] || Package,
    }));

    // Keyed by stable stock number, holding the full featured-ad record so the
    // Remove action can use its encrypted ad ID.
    const selectedAds = featuredDiamonds.reduce((map, d) => {
        map[d.stockNo || d.encrypted_id] = d;
        return map;
    }, {});

    return (
        <Layout>
            {/* Page title */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--color-text-dark)',
                    fontFamily: 'var(--font-serif)',
                    marginBottom: '8px',
                }}>
                    Dashboard
                </h2>
                <p style={{ color: 'var(--color-text-light)', fontSize: '14px' }}>
                    Overview of all master data records
                </p>
            </div>

            {/* ──────────── FEATURED DIAMOND ADS SHOWCASE ──────────── */}
            <div className="featured-showcase-section">
                <div className="featured-showcase-header">
                    <div className="featured-showcase-title-area">
                        <div className="featured-showcase-icon-wrap">
                            <Star size={20} />
                        </div>
                        <div>
                            <h3 className="featured-showcase-title">Featured Diamond Ads</h3>
                            <p className="featured-showcase-subtitle">
                                Pin up to {MAX_ADS} diamonds to showcase them as promotional ads
                            </p>
                        </div>
                    </div>

                    <div className="featured-showcase-actions">
                        <span className="featured-slots-counter">
                            <TrendingUp size={14} />
                            Slots used:&nbsp;
                            <span className="counter-pill">{featuredDiamonds.length} / {MAX_ADS}</span>
                        </span>
                        <button
                            className="featured-add-btn"
                            disabled={featuredLoading || featuredDiamonds.length >= MAX_ADS}
                            onClick={() => openSelector()}
                        >
                            <Plus size={15} />
                            {featuredLoading
                                ? 'Loading...'
                                : featuredDiamonds.length >= MAX_ADS
                                    ? 'All Slots Filled'
                                    : 'Add Diamond'}
                        </button>
                    </div>
                </div>

                {/* 3-slot uniform grid — always renders all 3 boxes */}
                <div className="featured-ads-grid">
                    {slots.map((diamond, idx) =>
                        diamond ? (
                            <FeaturedAdCard
                                key={diamond.encrypted_id}
                                diamond={diamond}
                                onRemove={handleRemoveAd}
                            />
                        ) : (
                            <EmptySlotCard
                                key={`empty-${idx}`}
                                slotIndex={idx + 1}
                                onOpen={() => openSelector(idx + 1)}
                            />
                        )
                    )}
                </div>
            </div>

            {/* ──────────── LOADING ──────────── */}
            {loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    color: 'var(--color-text-light)',
                    gap: '12px',
                }}>
                    <Loader2 size={24} className="spin" />
                    <span>Loading dashboard data…</span>
                </div>
            )}

            {/* ──────────── ERROR ──────────── */}
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
                    marginBottom: '24px',
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
                            fontSize: '13px',
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ──────────── MASTER COUNTS GRID ──────────── */}
            {!loading && !error && (
                <div className="dashboard-grid">
                    {cardEntries.map(({ key, label, count, Icon }) => (
                        <div
                            className="summary-card"
                            key={key}
                            style={{
                                borderLeft: '4px solid var(--color-primary)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer',
                            }}
                        >
                            <div className="summary-info">
                                <span className="summary-count">{count.toLocaleString()}</span>
                                <span className="summary-label">{label}</span>
                            </div>
                            <Icon className="summary-icon" style={{ opacity: 0.2 }} />
                        </div>
                    ))}
                </div>
            )}

            {/* ──────────── DIAMOND SELECTOR MODAL ──────────── */}
            <DiamondSelectorModal
                isOpen={selectorOpen}
                onClose={() => { setSelectorOpen(false); }}
                onSelect={handleSelectorPick}
                selectedAds={selectedAds}
                diamonds={selectorDiamonds}
                total={selectorTotal}
                loading={selectorLoading}
                loadingMore={selectorLoadingMore}
                onLoadMore={handleLoadMore}
                searchQuery={selectorSearch}
                onSearch={setSelectorSearch}
            />
        </Layout>
    );
};

export default Dashboard;
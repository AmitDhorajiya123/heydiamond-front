import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/Layout';
import { SHAPE_ICONS } from '../components/shapeIcons';

/* ------------------------------------------------------------------ */
/* Shape icons (reference diamond-shape glyphs)                        */
/* ------------------------------------------------------------------ */
const ShapeIcon = ({ type }) => {
    const glyph = SHAPE_ICONS[type] || SHAPE_ICONS.Other;
    if (!glyph) return null;

    return (
        <svg
            viewBox={`0 0 ${glyph.width} 1024`}
            preserveAspectRatio="xMidYMid meet"
            fill="currentColor"
            aria-hidden="true"
        >
            <g transform="translate(0, 960) scale(1, -1)">
                <path d={glyph.d} />
            </g>
        </svg>
    );
};

/* ------------------------------------------------------------------ */
/* Static filter choices (matching the reference layout)               */
/* ------------------------------------------------------------------ */
const SHAPES = [
    { label: 'Round', value: 'Round' },
    { label: 'Oval', value: 'Oval' },
    { label: 'Pear', value: 'Pear' },
    { label: 'Cush Mod', value: 'Cushion' },
    { label: 'Cush Brill', value: 'Cushion Brilliant' },
    { label: 'Emerald', value: 'Emerald' },
    { label: 'Radiant', value: 'Radiant' },
    { label: 'Princess', value: 'Princess' },
    { label: 'Asscher', value: 'Asscher' },
    { label: 'Square', value: 'Square' },
    { label: 'Marquise', value: 'Marquise' },
    { label: 'Heart', value: 'Heart' },
    { label: 'Trilliant', value: 'Trilliant' },
    { label: 'Euro Cut', value: 'Euro Cut' },
    { label: 'Old Miner', value: 'Old Miner' },
    { label: 'Briolette', value: 'Briolette' },
    { label: 'Rose Cut', value: 'Rose Cut' },
    { label: 'Lozenge', value: 'Lozenge' },
    { label: 'Baguette', value: 'Baguette' },
    { label: 'Tap Bag', value: 'Tapered Baguette' },
    { label: 'Half Moon', value: 'Half Moon' },
    { label: 'Flanders', value: 'Flanders' },
    { label: 'Trapezoid', value: 'Trapezoid' },
    { label: 'Bullets', value: 'Bullets' },
    { label: 'Kite', value: 'Kite' },
    { label: 'Shield', value: 'Shield' },
    { label: 'Star', value: 'Star' },
    { label: 'Pentagonal', value: 'Pentagonal' },
    { label: 'Hexagonal', value: 'Hexagonal' },
    { label: 'Octagonal', value: 'Octagonal' },
    { label: 'Other', value: 'Other' },
];

const SHAPE_VALUES = SHAPES.map((shape) => shape.value);

const COLORS = [
    'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'FANCY',
];

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];

const FINISH_GRADES = ['EX', 'VG', 'GD'];

const FLUORESCENCE = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'V.STRONG'];

const GRADING_REPORTS = ['IGI', 'RK', 'GIA', 'HRD', 'Other'];

const LOCATIONS = ['INDIA', 'HK', 'BELGIUM', 'USA', 'DUBAI', 'Other'];

const SIZE_OPTIONS = [
    { label: '30s', min: 0.30, max: 0.39 },
    { label: '40s', min: 0.40, max: 0.49 },
    { label: '50s-60s', min: 0.50, max: 0.69 },
    { label: '70s-80s', min: 0.70, max: 0.89 },
    { label: '90s', min: 0.90, max: 0.99 },
    { label: '1ct', min: 1.00, max: 1.49 },
    { label: '1.5ct', min: 1.50, max: 1.99 },
    { label: '2ct', min: 2.00, max: 2.49 },
    { label: '3ct', min: 3.00, max: 3.49 },
    { label: '4ct', min: 4.00, max: 4.49 },
    { label: '5ct', min: 5.00, max: 5.49 },
    { label: '6-7ct', min: 6.00, max: 7.99 },
    { label: '8-9ct', min: 8.00, max: 9.99 },
    { label: '10ct +', min: 10.00, max: null },
];

const emptyFilters = {
    shapes: [],
    colors: [],
    clarities: [],
    sizes: [],
    polish: [],
    symmetry: [],
    fluorescence: [],
    labs: [],
    locations: [],
};

const emptyAdvance = {
    depthMin: '',
    depthMax: '',
    tableMin: '',
    tableMax: '',
    lengthMin: '',
    lengthMax: '',
    widthMin: '',
    widthMax: '',
    heightMin: '',
    heightMax: '',
    ratioMin: '',
    ratioMax: '',
    pricePerCtMin: '',
    pricePerCtMax: '',
    totalPriceMin: '',
    totalPriceMax: '',
    heartAndArrow: [],
    shade: [],
    milky: [],
    tableBlack: [],
    sideBlack: [],
    crownAngleMin: '',
    crownAngleMax: '',
    crownHeightMin: '',
    crownHeightMax: '',
    pavilionAngleMin: '',
    pavilionAngleMax: '',
    pavilionDepthMin: '',
    pavilionDepthMax: '',
    keyToSymbole: '',
};

const HEARTS_ARROWS = ['EX', 'VG', 'NN'];
const COLOR_SHADES = ['NN', 'VLB', 'LB', 'MB', 'MT'];
const MILKY_OPTIONS = ['NN', 'VL', 'LIGHT', 'MED'];
const BLACK_OPTIONS = ['N', 'PP', 'MIN', 'MED', 'MAJ'];

const KEY_SYMBOLS = [
    'Brown patch of color', 'Bruise', 'Cavity', 'Chip',
    'Cloud', 'Crystal', 'Etch Channel', 'Extra Facet',
    'Feather', 'Indented Inscription', 'Indented Natural', 'Internal Graining',
    'Knot', 'Manufacturing Remnant', 'Minor Details of Polish', 'Natural',
    'Needle', 'Pinpoint', 'Surface Graining', 'Twinning Wisp',
];

const SYMBOL_MODES = [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Do not contains' },
    { value: 'only_contains', label: 'Only Contains' },
];

/* Saved filter state so returning from the results table keeps every selection */
const SAVED_FILTERS_KEY = 'hd_inventory_filters';
const APPLIED_FILTERS_KEY = 'hd_inventory_applied_filters';

const loadSavedFilters = () => {
    try {
        const raw = sessionStorage.getItem(SAVED_FILTERS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

const commaList = (params, key) => {
    const raw = params.get(key);
    if (!raw) return [];
    return raw.split(',').map((v) => v.trim()).filter(Boolean);
};

const knownOnly = (values, allowed) => values.filter((v) => allowed.includes(v));

/* Try to map a weight range back to the general size tiles */
const restoreSizes = (weightMin, weightMax) => {
    const minNum = weightMin !== '' ? parseFloat(weightMin) : null;
    const maxNum = weightMax !== '' ? parseFloat(weightMax) : null;
    const tol = 0.001;
    const upperOf = (option) => (option.max === null ? Infinity : option.max);

    if ((minNum === null || Number.isNaN(minNum)) && (maxNum === null || Number.isNaN(maxNum))) {
        return { sizes: [], sizeTab: 'general', specificWeight: { min: '', max: '' } };
    }

    if (minNum !== null && !Number.isNaN(minNum)) {
        if (maxNum !== null && !Number.isNaN(maxNum)) {
            const inside = SIZE_OPTIONS.filter((o) => o.min >= minNum - tol && upperOf(o) <= maxNum + tol);
            if (inside.length) {
                const startsAtMin = Math.abs(inside[0].min - minNum) < tol;
                const endsAtMax = Math.abs(upperOf(inside[inside.length - 1]) - maxNum) < tol;
                const contiguous = inside.every(
                    (o, i) => i === 0 || Math.abs(upperOf(inside[i - 1]) + 0.01 - o.min) < tol
                );
                if (startsAtMin && endsAtMax && contiguous) {
                    return {
                        sizes: inside.map((o) => o.label),
                        sizeTab: 'general',
                        specificWeight: { min: '', max: '' },
                    };
                }
            }
        } else {
            const openEnded = SIZE_OPTIONS.find((o) => o.max === null && Math.abs(o.min - minNum) < tol);
            if (openEnded) {
                return {
                    sizes: [openEnded.label],
                    sizeTab: 'general',
                    specificWeight: { min: '', max: '' },
                };
            }
        }
    }

    return {
        sizes: [],
        sizeTab: 'specific',
        specificWeight: { min: weightMin, max: weightMax },
    };
};

/* Fallback when there is no saved state: rebuild the form from the URL */
const parseFiltersFromParams = (params) => {
    const weightMin = params.get('weightMin') || '';
    const weightMax = params.get('weightMax') || '';
    const sizeState = restoreSizes(weightMin, weightMax);

    const filters = {
        ...emptyFilters,
        shapes: knownOnly(commaList(params, 'shape'), SHAPE_VALUES),
        colors: knownOnly(commaList(params, 'color'), COLORS),
        clarities: knownOnly(commaList(params, 'clarity'), CLARITIES),
        sizes: sizeState.sizes,
        polish: knownOnly(commaList(params, 'polish'), FINISH_GRADES),
        symmetry: knownOnly(commaList(params, 'symmetry'), FINISH_GRADES),
        fluorescence: knownOnly(commaList(params, 'fluorescenceIntensity'), FLUORESCENCE),
        labs: knownOnly(commaList(params, 'lab'), GRADING_REPORTS),
        locations: knownOnly(commaList(params, 'location'), LOCATIONS),
    };

    const adv = { ...emptyAdvance };
    Object.keys(emptyAdvance).forEach((key) => {
        if (Array.isArray(emptyAdvance[key])) return;
        const value = params.get(key);
        if (value !== null) adv[key] = value;
    });
    adv.heartAndArrow = commaList(params, 'heartAndArrow');
    adv.shade = commaList(params, 'shade');
    adv.milky = commaList(params, 'milky');
    adv.tableBlack = commaList(params, 'blackInclusion');
    adv.sideBlack = commaList(params, 'whiteInclusion');

    const hasAdv = Object.entries(adv).some(([, value]) => (
        Array.isArray(value) ? value.length > 0 : value !== ''
    ));
    const keySymbols = commaList(params, 'symbols');

    return {
        filters,
        stockId: params.get('search') || '',
        flags: {
            available: params.get('availableOnly') === '1',
            newStone: params.get('newOnly') === '1',
            offer: params.get('offerOnly') === '1',
            upcoming: params.get('upcomingOnly') === '1',
        },
        noBgm: params.get('noBgm') === '1',
        noBlack: params.get('noBlack') === '1',
        sizeTab: sizeState.sizeTab,
        finishTab: 'general',
        specificWeight: sizeState.specificWeight,
        adv,
        keySymbolMode: params.get('symbolMode') || 'contains',
        keySymbols,
        advanceOpen: hasAdv,
        symbolsOpen: keySymbols.length > 0,
    };
};

const InventoryFilter = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /* Prefer the selection saved when Search was pressed, otherwise rebuild from the URL */
    const initialState = useMemo(() => loadSavedFilters() || parseFiltersFromParams(searchParams), []);

    const [filters, setFilters] = useState(() => {
        const next = { ...emptyFilters, ...(initialState.filters || {}) };
        next.shapes = knownOnly(next.shapes || [], SHAPE_VALUES);
        return next;
    });
    const [stockId, setStockId] = useState(() => initialState.stockId || '');
    const [flags, setFlags] = useState(() => ({
        available: false,
        newStone: false,
        offer: false,
        upcoming: false,
        ...(initialState.flags || {}),
    }));
    const [noBgm, setNoBgm] = useState(() => Boolean(initialState.noBgm));
    const [noBlack, setNoBlack] = useState(() => Boolean(initialState.noBlack));
    const [sizeTab, setSizeTab] = useState(() => initialState.sizeTab || 'general');
    const [finishTab, setFinishTab] = useState(() => initialState.finishTab || 'general');
    const [specificWeight, setSpecificWeight] = useState(() => initialState.specificWeight || { min: '', max: '' });
    const [advanceOpen, setAdvanceOpen] = useState(() => Boolean(initialState.advanceOpen));
    const [adv, setAdv] = useState(() => ({ ...emptyAdvance, ...(initialState.adv || {}) }));
    const [symbolsOpen, setSymbolsOpen] = useState(() => Boolean(initialState.symbolsOpen));
    const [keySymbolMode, setKeySymbolMode] = useState(() => initialState.keySymbolMode || 'contains');
    const [keySymbols, setKeySymbols] = useState(() => initialState.keySymbols || []);

    /* Toggle a tile inside a group */
    const toggle = (group, value) => {
        setFilters((prev) => {
            const current = prev[group] || [];
            const exists = current.includes(value);
            return {
                ...prev,
                [group]: exists ? current.filter((v) => v !== value) : [...current, value],
            };
        });
    };

    /* Toggle an advanced tile */
    const toggleAdv = (group, value) => {
        setAdv((prev) => {
            const current = prev[group] || [];
            const exists = current.includes(value);
            return {
                ...prev,
                [group]: exists ? current.filter((v) => v !== value) : [...current, value],
            };
        });
    };

    /* Toggle a Key to Symbols checkbox */
    const toggleSymbol = (value) => {
        setKeySymbols((prev) => (
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        ));
    };

    const resetAll = () => {
        setFilters(emptyFilters);
        setStockId('');
        setFlags({ available: false, newStone: false, offer: false, upcoming: false });
        setNoBgm(false);
        setNoBlack(false);
        setSpecificWeight({ min: '', max: '' });
        setAdv(emptyAdvance);
        setKeySymbols([]);
        setKeySymbolMode('contains');
        sessionStorage.removeItem(SAVED_FILTERS_KEY);
    };

    const handleSearch = () => {
        /* Payload for the API - sent in the POST body, never in the URL */
        const appliedFilters = {};

        /* Multi-value groups */
        if (filters.shapes.length) appliedFilters.shape = filters.shapes;
        if (filters.colors.length) appliedFilters.color = filters.colors;
        if (filters.clarities.length) appliedFilters.clarity = filters.clarities;
        if (filters.polish.length) appliedFilters.polish = filters.polish;
        if (filters.symmetry.length) appliedFilters.symmetry = filters.symmetry;
        if (filters.fluorescence.length) appliedFilters.fluorescenceIntensity = filters.fluorescence;
        if (filters.labs.length) appliedFilters.lab = filters.labs;
        if (filters.locations.length) appliedFilters.location = filters.locations;

        /* Stock id / certificate number */
        if (stockId.trim()) appliedFilters.search = stockId.trim();

        /* Weight */
        if (sizeTab === 'specific') {
            if (specificWeight.min !== '') appliedFilters.weightMin = specificWeight.min;
            if (specificWeight.max !== '') appliedFilters.weightMax = specificWeight.max;
        } else if (filters.sizes.length) {
            const selected = SIZE_OPTIONS.filter((o) => filters.sizes.includes(o.label));
            const mins = selected.map((o) => o.min);
            const maxes = selected.map((o) => o.max).filter((v) => v !== null && v !== undefined);
            if (mins.length) appliedFilters.weightMin = String(Math.min(...mins));
            if (maxes.length) appliedFilters.weightMax = String(Math.max(...maxes));
        }

        /* Boolean flags */
        if (noBgm) appliedFilters.noBgm = 1;
        if (noBlack) appliedFilters.noBlack = 1;
        if (flags.available) appliedFilters.availableOnly = 1;
        if (flags.newStone) appliedFilters.newOnly = 1;
        if (flags.offer) appliedFilters.offerOnly = 1;
        if (flags.upcoming) appliedFilters.upcomingOnly = 1;

        /* Advanced search - numeric ranges */
        const numericRanges = [
            ['depthMin', 'depthMax'],
            ['tableMin', 'tableMax'],
            ['lengthMin', 'lengthMax'],
            ['widthMin', 'widthMax'],
            ['heightMin', 'heightMax'],
            ['ratioMin', 'ratioMax'],
            ['pricePerCtMin', 'pricePerCtMax'],
            ['totalPriceMin', 'totalPriceMax'],
            ['crownAngleMin', 'crownAngleMax'],
            ['crownHeightMin', 'crownHeightMax'],
            ['pavilionAngleMin', 'pavilionAngleMax'],
            ['pavilionDepthMin', 'pavilionDepthMax'],
        ];
        numericRanges.forEach(([minKey, maxKey]) => {
            if (adv[minKey] !== '') appliedFilters[minKey] = adv[minKey];
            if (adv[maxKey] !== '') appliedFilters[maxKey] = adv[maxKey];
        });

        /* Advanced search - tile groups */
        if (adv.heartAndArrow.length) appliedFilters.heartAndArrow = adv.heartAndArrow;
        if (adv.shade.length) appliedFilters.shade = adv.shade;
        if (adv.milky.length) appliedFilters.milky = adv.milky;
        if (adv.tableBlack.length) appliedFilters.blackInclusion = adv.tableBlack;
        if (adv.sideBlack.length) appliedFilters.whiteInclusion = adv.sideBlack;

        /* Advanced search - key to symbols */
        if (adv.keyToSymbole.trim()) appliedFilters.keyToSymbole = adv.keyToSymbole.trim();

        /* Key to Symbols include/exclude checkboxes */
        if (keySymbols.length) {
            appliedFilters.symbols = keySymbols;
            appliedFilters.symbolMode = keySymbolMode;
        }

        /* Remember the form so "Back to Filters" restores every selection,
           and keep the applied payload for a page refresh */
        try {
            sessionStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify({
                filters,
                stockId,
                flags,
                noBgm,
                noBlack,
                sizeTab,
                finishTab,
                specificWeight,
                adv,
                keySymbolMode,
                keySymbols,
                advanceOpen,
                symbolsOpen,
            }));
            sessionStorage.setItem(APPLIED_FILTERS_KEY, JSON.stringify(appliedFilters));
        } catch (error) {
            /* storage may be unavailable - ignore */
        }

        navigate('/inventory', { state: { appliedFilters } });
    };

    /* Renders a group of small square tiles */
    const renderTiles = (group, values) => (
        <div className="invfilter-tilegroup">
            {values.map((value) => (
                <button
                    type="button"
                    key={value}
                    className={`invfilter-tile ${filters[group].includes(value) ? 'active' : ''}`}
                    onClick={() => toggle(group, value)}
                >
                    {value}
                </button>
            ))}
        </div>
    );

    const renderSubtabs = (active, onChange) => (
        <div className="invfilter-subtabs">
            <span
                className={`invfilter-subtab ${active === 'general' ? 'active' : ''}`}
                onClick={() => onChange('general')}
            >
                General
            </span>
            <span className="invfilter-subtab-sep">|</span>
            <span
                className={`invfilter-subtab ${active === 'specific' ? 'active' : ''}`}
                onClick={() => onChange('specific')}
            >
                Specific
            </span>
        </div>
    );

    /* Advanced: tile group */
    const renderAdvTiles = (group, values) => (
        <div className="invfilter-tilegroup">
            {values.map((value) => (
                <button
                    type="button"
                    key={value}
                    className={`invfilter-tile ${adv[group].includes(value) ? 'active' : ''}`}
                    onClick={() => toggleAdv(group, value)}
                >
                    {value}
                </button>
            ))}
        </div>
    );

    /* Advanced: from/to range field */
    const renderAdvRange = (label, minKey, maxKey) => (
        <div className="adv-field" key={minKey}>
            <label className="adv-label">{label}</label>
            <div className="adv-range">
                <input
                    type="number"
                    className="adv-input"
                    placeholder="From"
                    step="any"
                    value={adv[minKey]}
                    onChange={(e) => setAdv((p) => ({ ...p, [minKey]: e.target.value }))}
                />
                <input
                    type="number"
                    className="adv-input"
                    placeholder="To"
                    step="any"
                    value={adv[maxKey]}
                    onChange={(e) => setAdv((p) => ({ ...p, [maxKey]: e.target.value }))}
                />
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="invfilter-page">
                {/* Sticky action bar */}
                <div className="invfilter-topbar">
                    <button
                        type="button"
                        className="invfilter-icon-btn"
                        onClick={() => navigate(-1)}
                        title="Go back"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div className="invfilter-actions">
                        <button
                            type="button"
                            className="invfilter-reset"
                            onClick={resetAll}
                            title="Reset all filters"
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>

                        <button type="button" className="invfilter-search-btn" onClick={handleSearch}>
                            <Search size={17} />
                            Search
                        </button>
                    </div>
                </div>

                {/* Filter panel */}
                <div className="invfilter-panel">
                    {/* Shape */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Shape</span>
                        </div>
                        <div className="invfilter-content">
                            <div className="invfilter-shape-grid">
                                {SHAPES.map(({ label, value }) => (
                                    <button
                                        type="button"
                                        key={value}
                                        className={`invfilter-shape-tile ${filters.shapes.includes(value) ? 'active' : ''}`}
                                        onClick={() => toggle('shapes', value)}
                                        title={label}
                                    >
                                        <ShapeIcon type={label} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stock id / certificate + stone flags */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Stock ID / Certificate #</span>
                        </div>
                        <div className="invfilter-content invfilter-content-between">
                            <input
                                type="text"
                                className="invfilter-text"
                                placeholder=""
                                value={stockId}
                                onChange={(e) => setStockId(e.target.value)}
                            />
                            <div className="invfilter-checks">
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={flags.available}
                                        onChange={(e) => setFlags((p) => ({ ...p, available: e.target.checked }))}
                                    />
                                    Available Stones Only
                                </label>
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={flags.newStone}
                                        onChange={(e) => setFlags((p) => ({ ...p, newStone: e.target.checked }))}
                                    />
                                    New Stones Only
                                </label>
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={flags.offer}
                                        onChange={(e) => setFlags((p) => ({ ...p, offer: e.target.checked }))}
                                    />
                                    Offer Stones Only
                                </label>
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={flags.upcoming}
                                        onChange={(e) => setFlags((p) => ({ ...p, upcoming: e.target.checked }))}
                                    />
                                    Upcoming Stones Only
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Size */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Size</span>
                            {renderSubtabs(sizeTab, setSizeTab)}
                        </div>
                        <div className="invfilter-content">
                            {sizeTab === 'general' ? (
                                <div className="invfilter-tilegroup">
                                    {SIZE_OPTIONS.map((size) => (
                                        <button
                                            type="button"
                                            key={size.label}
                                            className={`invfilter-tile ${filters.sizes.includes(size.label) ? 'active' : ''}`}
                                            onClick={() => toggle('sizes', size.label)}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="invfilter-range">
                                    <input
                                        type="number"
                                        className="invfilter-number"
                                        placeholder="Min ct"
                                        step="0.01"
                                        min="0"
                                        value={specificWeight.min}
                                        onChange={(e) => setSpecificWeight((p) => ({ ...p, min: e.target.value }))}
                                    />
                                    <span className="invfilter-range-to">to</span>
                                    <input
                                        type="number"
                                        className="invfilter-number"
                                        placeholder="Max ct"
                                        step="0.01"
                                        min="0"
                                        value={specificWeight.max}
                                        onChange={(e) => setSpecificWeight((p) => ({ ...p, max: e.target.value }))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Color</span>
                        </div>
                        <div className="invfilter-content">{renderTiles('colors', COLORS)}</div>
                    </div>

                    {/* Clarity */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Clarity</span>
                        </div>
                        <div className="invfilter-content">{renderTiles('clarities', CLARITIES)}</div>
                    </div>

                    {/* Finish */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Finish</span>
                            {renderSubtabs(finishTab, setFinishTab)}
                        </div>
                        <div className="invfilter-content">
                            <span className="invfilter-inline-label">Pol.</span>
                            {renderTiles('polish', FINISH_GRADES)}
                            <span className="invfilter-inline-label invfilter-inline-label-spaced">Sym.</span>
                            {renderTiles('symmetry', FINISH_GRADES)}
                        </div>
                    </div>

                    {/* Fluorescence intensity */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Fluorescence Intensity</span>
                        </div>
                        <div className="invfilter-content invfilter-content-between">
                            {renderTiles('fluorescence', FLUORESCENCE)}
                            <div className="invfilter-checks">
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={noBgm}
                                        onChange={(e) => setNoBgm(e.target.checked)}
                                    />
                                    No BGM
                                </label>
                                <label className="invfilter-check">
                                    <input
                                        type="checkbox"
                                        checked={noBlack}
                                        onChange={(e) => setNoBlack(e.target.checked)}
                                    />
                                    No Black
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Grading report + location */}
                    <div className="invfilter-row">
                        <div className="invfilter-label-col">
                            <span className="invfilter-label">Grading Report</span>
                        </div>
                        <div className="invfilter-content">
                            {renderTiles('labs', GRADING_REPORTS)}
                            <span className="invfilter-inline-label invfilter-inline-label-location">Location</span>
                            {renderTiles('locations', LOCATIONS)}
                        </div>
                    </div>

                    {/* ============ Advance Search (collapsed by default) ============ */}
                    <div className="invfilter-advance">
                        <button
                            type="button"
                            className="invfilter-advance-header"
                            onClick={() => setAdvanceOpen((v) => !v)}
                            aria-expanded={advanceOpen}
                        >
                            <span className="invfilter-advance-title">Advance Search</span>
                            <span className="invfilter-advance-chevron">
                                {advanceOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                        </button>

                        {advanceOpen && (
                            <div className="invfilter-advance-body">
                                {/* Percentage */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Percentage</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-2">
                                            {renderAdvRange('Depth %', 'depthMin', 'depthMax')}
                                            {renderAdvRange('Table %', 'tableMin', 'tableMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Metric */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Metric</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-3">
                                            {renderAdvRange('Length', 'lengthMin', 'lengthMax')}
                                            {renderAdvRange('Width', 'widthMin', 'widthMax')}
                                            {renderAdvRange('Depth', 'heightMin', 'heightMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Ratio */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Ratio</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-2">
                                            {renderAdvRange('Ratio', 'ratioMin', 'ratioMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Price Criteria */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Price Criteria</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-2">
                                            {renderAdvRange('Price Per Carat', 'pricePerCtMin', 'pricePerCtMax')}
                                            {renderAdvRange('Stone Price', 'totalPriceMin', 'totalPriceMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Hearts & Arrows */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Hearts &amp; Arrows</span>
                                    </div>
                                    <div className="invfilter-content">
                                        {renderAdvTiles('heartAndArrow', HEARTS_ARROWS)}
                                    </div>
                                </div>

                                {/* Color Shade + Milky */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Color Shade</span>
                                    </div>
                                    <div className="invfilter-content">
                                        {renderAdvTiles('shade', COLOR_SHADES)}
                                        <span className="invfilter-inline-label invfilter-inline-label-location">Milky</span>
                                        {renderAdvTiles('milky', MILKY_OPTIONS)}
                                    </div>
                                </div>

                                {/* Table Black + Side Black */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Table Black</span>
                                    </div>
                                    <div className="invfilter-content">
                                        {renderAdvTiles('tableBlack', BLACK_OPTIONS)}
                                        <span className="invfilter-inline-label invfilter-inline-label-location">Side Black</span>
                                        {renderAdvTiles('sideBlack', BLACK_OPTIONS)}
                                    </div>
                                </div>

                                {/* Crown Angle + Crown % */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Crown Angle</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-2">
                                            {renderAdvRange('Crown Angle', 'crownAngleMin', 'crownAngleMax')}
                                            {renderAdvRange('Crown %', 'crownHeightMin', 'crownHeightMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Pavilion Angle + Pavilion % */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Pavilion Angle</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <div className="invfilter-advance-grid cols-2">
                                            {renderAdvRange('Pavilion Angle', 'pavilionAngleMin', 'pavilionAngleMax')}
                                            {renderAdvRange('Pavilion %', 'pavilionDepthMin', 'pavilionDepthMax')}
                                        </div>
                                    </div>
                                </div>

                                {/* Key to Symbols */}
                                <div className="invfilter-row">
                                    <div className="invfilter-label-col">
                                        <span className="invfilter-label">Key to Symbols</span>
                                    </div>
                                    <div className="invfilter-content">
                                        <input
                                            type="text"
                                            className="invfilter-text"
                                            placeholder="Search inclusion / symbol"
                                            value={adv.keyToSymbole}
                                            onChange={(e) => setAdv((p) => ({ ...p, keyToSymbole: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============ Key to Symbols (collapsible) ============ */}
                    <div className="invfilter-advance invfilter-symbols">
                        <button
                            type="button"
                            className="invfilter-advance-header"
                            onClick={() => setSymbolsOpen((v) => !v)}
                            aria-expanded={symbolsOpen}
                        >
                            <span className="invfilter-advance-title">Key to Symbols</span>
                            <span className="invfilter-advance-chevron">
                                {symbolsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </span>
                        </button>

                        {symbolsOpen && (
                            <div className="invfilter-symbols-body">
                                <div className="invfilter-symbol-modes">
                                    {SYMBOL_MODES.map((mode) => (
                                        <label key={mode.value} className="invfilter-symbol-mode">
                                            <input
                                                type="radio"
                                                name="invfilter-symbol-mode"
                                                value={mode.value}
                                                checked={keySymbolMode === mode.value}
                                                onChange={() => setKeySymbolMode(mode.value)}
                                            />
                                            <span>{mode.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="invfilter-symbol-grid">
                                    {KEY_SYMBOLS.map((symbol) => (
                                        <label key={symbol} className="invfilter-symbol-check">
                                            <input
                                                type="checkbox"
                                                checked={keySymbols.includes(symbol)}
                                                onChange={() => toggleSymbol(symbol)}
                                            />
                                            <span>{symbol}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .invfilter-page {
                    max-width: 1500px;
                    margin: 0 auto;
                    padding: 4px 0 24px;
                }

                /* ---------- sticky top action bar ---------- */
                .invfilter-topbar {
                    position: sticky;
                    /* offset the .page-content top padding so it sticks flush under the header */
                    top: -32px;
                    z-index: 30;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 12px 0;
                    margin-bottom: 8px;
                    background: #f8f5f2;
                    box-shadow: 0 10px 12px -14px rgba(0, 0, 0, 0.35);
                }

                .invfilter-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: nowrap;
                }

                .invfilter-reset {
                    height: 42px;
                    padding: 0 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #fff;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    color: var(--color-text-light);
                    font-size: 13.5px;
                    font-family: inherit;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: border-color 0.15s, color 0.15s;
                }

                .invfilter-reset:hover {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }

                .invfilter-icon-btn {
                    width: 42px;
                    height: 42px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    background: #fff;
                    color: var(--color-text-dark);
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                }

                .invfilter-icon-btn:hover {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }

                .invfilter-icon-btn.star.active {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: #fff;
                }

                .invfilter-search-btn {
                    height: 42px;
                    padding: 0 28px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    border-radius: 6px;
                    background: var(--color-primary);
                    color: #fff;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
                    transition: background 0.15s;
                }

                .invfilter-search-btn:hover {
                    background: var(--color-primary-hover);
                }

                /* ---------- panel & rows ---------- */
                .invfilter-panel {
                    background: #fff;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .invfilter-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 18px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-input-border);
                }

                .invfilter-row:last-child {
                    border-bottom: none;
                }

                .invfilter-label-col {
                    flex: 0 0 190px;
                    width: 190px;
                    padding-top: 9px;
                }

                .invfilter-label {
                    display: block;
                    font-size: 15px;
                    color: var(--color-text-dark);
                    line-height: 1.3;
                }

                .invfilter-subtabs {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 3px;
                    font-size: 12.5px;
                }

                .invfilter-subtab {
                    color: var(--color-text-light);
                    cursor: pointer;
                    user-select: none;
                }

                .invfilter-subtab:hover {
                    color: var(--color-primary);
                }

                .invfilter-subtab.active {
                    color: var(--color-primary);
                    font-weight: 500;
                }

                .invfilter-subtab-sep {
                    color: #c9bfb5;
                }

                .invfilter-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                }

                .invfilter-content-between {
                    justify-content: space-between;
                }

                /* ---------- small tiles ---------- */
                .invfilter-tilegroup {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                }

                .invfilter-tile {
                    min-width: 58px;
                    height: 36px;
                    padding: 0 13px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid transparent;
                    border-radius: 4px;
                    background: #f1efec;
                    color: #33302c;
                    font-family: inherit;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }

                .invfilter-tile:hover {
                    background: #e7e2dc;
                }

                .invfilter-tile.active {
                    background: var(--color-primary);
                    color: #fff;
                }

                /* ---------- shape tiles ---------- */
                .invfilter-shape-grid {
                    width: 100%;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
                    gap: 10px;
                }

                .invfilter-shape-tile {
                    width: 100%;
                    min-height: 96px;
                    padding: 8px 4px 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    background: #f2f0ed;
                    color: #4a443e;
                    font-family: inherit;
                    font-size: 12.5px;
                    line-height: 1.15;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s, border-color 0.15s;
                }

                .invfilter-shape-tile svg {
                    width: 54px;
                    height: 54px;
                    flex: none;
                }

                .invfilter-shape-tile span {
                    text-align: center;
                    white-space: nowrap;
                }

                .invfilter-shape-tile:hover {
                    background: #e9e4dd;
                    border-color: #d8cfc4;
                    color: var(--color-primary);
                }

                .invfilter-shape-tile.active {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: #fff;
                }

                .invfilter-shape-tile:focus-visible {
                    outline: 2px solid var(--color-primary);
                    outline-offset: 2px;
                }

                /* ---------- inputs ---------- */
                .invfilter-text {
                    height: 38px;
                    width: 420px;
                    max-width: 100%;
                    padding: 0 12px;
                    border: 1px solid #cdc6bf;
                    border-radius: 4px;
                    background: #fff;
                    color: var(--color-text-dark);
                    font-family: inherit;
                    font-size: 14px;
                    outline: none;
                }

                .invfilter-text:focus {
                    border-color: var(--color-primary);
                }

                .invfilter-range {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .invfilter-number {
                    height: 38px;
                    width: 130px;
                    padding: 0 12px;
                    border: 1px solid #cdc6bf;
                    border-radius: 4px;
                    background: #fff;
                    color: var(--color-text-dark);
                    font-family: inherit;
                    font-size: 14px;
                    outline: none;
                }

                .invfilter-number:focus {
                    border-color: var(--color-primary);
                }

                .invfilter-range-to {
                    font-size: 13px;
                    color: var(--color-text-light);
                }

                /* ---------- checkboxes ---------- */
                .invfilter-checks {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px 26px;
                }

                .invfilter-check {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13.5px;
                    color: var(--color-text-dark);
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                }

                .invfilter-check input[type="checkbox"] {
                    width: 15px;
                    height: 15px;
                    accent-color: var(--color-primary);
                    cursor: pointer;
                }

                /* ---------- inline labels ---------- */
                .invfilter-inline-label {
                    font-size: 13.5px;
                    color: var(--color-text-dark);
                    margin-left: 8px;
                }

                .invfilter-inline-label-spaced {
                    margin-left: 34px;
                }

                .invfilter-inline-label-location {
                    margin-left: 40px;
                }

                /* ---------- advance search ---------- */
                .invfilter-advance {
                    border-top: 1px solid var(--color-input-border);
                }

                .invfilter-advance-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 20px;
                    background: var(--color-primary);
                    border: none;
                    color: #fff;
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.2px;
                    cursor: pointer;
                }

                .invfilter-advance-header:hover {
                    background: var(--color-primary-hover);
                }

                .invfilter-advance-chevron {
                    width: 28px;
                    height: 28px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.18);
                }

                .invfilter-advance-body {
                    background: #fff;
                }

                .invfilter-advance-body .invfilter-row:last-child {
                    border-bottom: none;
                }

                .invfilter-advance-grid {
                    width: 100%;
                    display: grid;
                    gap: 16px 28px;
                }

                .invfilter-advance-grid.cols-2 {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .invfilter-advance-grid.cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }

                .adv-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    min-width: 0;
                }

                .adv-label {
                    font-size: 13px;
                    color: var(--color-text-dark);
                }

                .adv-range {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .adv-input {
                    flex: 1;
                    min-width: 0;
                    height: 38px;
                    padding: 0 12px;
                    border: 1px solid #cdc6bf;
                    border-radius: 4px;
                    background: #fff;
                    color: var(--color-text-dark);
                    font-family: inherit;
                    font-size: 13.5px;
                    outline: none;
                }

                .adv-input:focus {
                    border-color: var(--color-primary);
                }

                /* ---------- key to symbols ---------- */
                .invfilter-symbols-body {
                    padding: 18px 20px 22px;
                    background: #fff;
                }

                .invfilter-symbol-modes {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px 48px;
                    margin-bottom: 18px;
                }

                .invfilter-symbol-mode,
                .invfilter-symbol-check {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13.5px;
                    color: var(--color-text-dark);
                    line-height: 1.35;
                    cursor: pointer;
                }

                .invfilter-symbol-mode input,
                .invfilter-symbol-check input {
                    flex: 0 0 auto;
                    width: 16px;
                    height: 16px;
                    margin: 0;
                    accent-color: var(--color-primary);
                    cursor: pointer;
                }

                .invfilter-symbol-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 14px 24px;
                }

                /* ---------- responsive ---------- */
                @media (max-width: 900px) {
                    .invfilter-row {
                        flex-direction: column;
                        gap: 10px;
                        padding: 14px;
                    }

                    .invfilter-label-col {
                        flex: none;
                        width: 100%;
                        padding-top: 0;
                    }

                    .invfilter-content {
                        width: 100%;
                    }

                    .invfilter-text {
                        width: 100%;
                    }

                    .invfilter-content-between {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .invfilter-advance-grid.cols-2,
                    .invfilter-advance-grid.cols-3 {
                        grid-template-columns: 1fr;
                    }

                    .invfilter-symbol-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .invfilter-topbar {
                        /* .page-content padding drops to 16px at this breakpoint */
                        top: -16px;
                    }
                }

                @media (max-width: 576px) {
                    .invfilter-topbar {
                        padding: 10px 0;
                    }

                    .invfilter-shape-grid {
                        grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
                        gap: 8px;
                    }

                    .invfilter-shape-tile {
                        min-height: 88px;
                        font-size: 12px;
                    }

                    .invfilter-shape-tile svg {
                        width: 48px;
                        height: 48px;
                    }

                    .invfilter-symbol-modes {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .invfilter-symbol-grid {
                        grid-template-columns: 1fr;
                    }

                    .invfilter-actions {
                        gap: 8px;
                    }

                    .invfilter-icon-btn {
                        width: 38px;
                        height: 38px;
                    }

                    .invfilter-reset {
                        height: 38px;
                        padding: 0 14px;
                        font-size: 13px;
                    }

                    .invfilter-search-btn {
                        height: 38px;
                        padding: 0 18px;
                        font-size: 13px;
                    }
                }
            `}</style>
        </Layout>
    );
};

export default InventoryFilter;

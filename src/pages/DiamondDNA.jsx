import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Share2,
    Copy,
    FileText,
    Play,
    Image as ImageIcon,
    Gem,
    Ruler,
    Eye,
} from 'lucide-react';
import Layout from '../components/Layout';
import { diamondApi } from '../apis/diamond';
import { useToast } from '../context/ToastContext';

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */
const clean = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\s+/g, ' ').trim();
};

const nz = (value) => clean(value) || 'N/A';

const upper = (value) => clean(value).toUpperCase();

const money = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return 'N/A';
    const number = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(number)) return 'N/A';
    const isWhole = Number.isInteger(number);
    return `$${number.toLocaleString('en-US', {
        minimumFractionDigits: isWhole ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatDate = (value) => {
    const text = clean(value);
    if (!text || text === '0000-00-00') return 'N/A';
    const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const date = dateOnly
        ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
        : new Date(text);
    if (Number.isNaN(date.getTime())) return text;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatComment = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/\r/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const weightLabel = (value) => {
    const raw = clean(value);
    const number = Number(raw);
    return raw !== '' && Number.isFinite(number) ? `${number.toFixed(2)}Ct` : nz(value);
};

const colorLabel = (diamond) => {
    const base = clean(diamond.color);
    if (/fancy/i.test(base)) {
        const parts = [diamond.fancyColorIntensity, diamond.fancyColor, diamond.fancyColorOvertone]
            .map(clean)
            .filter(Boolean);
        return (parts.length ? parts.join(' ') : base).toUpperCase();
    }
    return base.toUpperCase();
};

const titleLabel = (diamond) => [
    upper(diamond.shape),
    weightLabel(diamond.weight),
    colorLabel(diamond),
    upper(diamond.clarity),
    upper(diamond.polish),
    upper(diamond.symmetry),
].filter(Boolean).join(' ');

const isDirectVideo = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(url || ''));

const certificateAvailable = (diamond) => Boolean(clean(diamond.certiFile));

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */
const Field = ({ label, value }) => (
    <div className="dna-field">
        <span className="dna-field-label">{label}</span>
        <span className="dna-field-value">{value === '' || value === null || value === undefined ? 'N/A' : value}</span>
    </div>
);

const SectionTitle = ({ icon, children }) => (
    <div className="dna-section-head">
        {icon}
        <span>{children}</span>
    </div>
);

const EmptyMedia = ({ text, icon }) => (
    <div className="dna-media-empty">
        {icon}
        <span>{text}</span>
    </div>
);

const DiamondDNA = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [diamond, setDiamond] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mediaTab, setMediaTab] = useState('image');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            setImageError(false);

            try {
                const response = await diamondApi.get(id);
                const payload = response?.data ?? response;
                if (!cancelled) {
                    setDiamond(payload);
                    const hasImage = Boolean(
                        clean(payload.imageLink) || clean(payload.assetImage) || clean(payload.heartImage)
                    );
                    const hasVideo = Boolean(
                        clean(payload.videoLink) || clean(payload.vdbVideo) || clean(payload.handyVideo) || clean(payload.tweezerVideo)
                    );
                    setMediaTab(hasImage || !hasVideo ? 'image' : 'video');
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(requestError?.response?.data?.message || 'Unable to load this diamond.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => { cancelled = true; };
    }, [id]);

    const goBack = () => {
        const historyIndex = window.history.state?.idx ?? 0;
        if (historyIndex > 0) navigate(-1);
        else navigate('/inventory');
    };

    if (loading) {
        return (
            <Layout>
                <div className="dna-state">
                    <Loader2 size={30} className="spin" />
                    <span>Loading diamond DNA…</span>
                </div>
            </Layout>
        );
    }

    if (error || !diamond) {
        return (
            <Layout>
                <div className="dna-state dna-state-error">
                    <AlertCircle size={30} />
                    <span>{error || 'Diamond not found.'}</span>
                    <button type="button" className="dna-action" onClick={goBack}>
                        <ArrowLeft size={15} />
                        Back to Inventory
                    </button>
                </div>
            </Layout>
        );
    }

    const image = clean(diamond.imageLink) || clean(diamond.assetImage) || clean(diamond.heartImage);
    const directVideo = [diamond.vdbVideo, diamond.handyVideo, diamond.tweezerVideo].find(isDirectVideo);
    const videoSource = directVideo || clean(diamond.videoLink);
    const tweezerSource = clean(diamond.tweezerVideo);
    const handySource = clean(diamond.handyVideo);
    const comment = formatComment(diamond.certiComment);

    const stoneFields = [
        ['Stone Type', upper(diamond.Diamond_Type)],
        ['Shape', upper(diamond.shape)],
        ['Lab Shape', upper(diamond.shape)],
        ['Carat', weightLabel(diamond.weight)],
        ['Color', colorLabel(diamond)],
        ['Clarity', upper(diamond.clarity)],
        ['Cut', nz(diamond.cut)],
        ['Polish', upper(diamond.polish)],
        ['Symmetry', upper(diamond.symmetry)],
        ['Location', diamond.location],
        ['Growth Type', diamond.growthType],
        ['Shade', diamond.shade],
        ['Lab', diamond.lab],
        ['Cert No', diamond.reportNo],
        ['Report Date', formatDate(diamond.reportDate)],
        ['Certificate', certificateAvailable(diamond) ? 'Available' : 'N/A'],
        ['Fluorescence', diamond.fluorescenceIntensity],
        ['Fluorescence Color', diamond.fluorescenceColor],
        ['Inscription', diamond.inscription],
    ];

    const mmFields = [
        ['MM', diamond.measurements],
        ['Length (mm)', diamond.length],
        ['Width (mm)', diamond.width],
        ['Height (mm)', diamond.height],
        ['Depth (%)', diamond.depth],
        ['Table (%)', diamond.table],
        ['Ratio', diamond.ratio],
        ['Cr. Angle', diamond.crownAngle],
        ['Cr. Height', diamond.crownHeight],
        ['Pv. Angle', diamond.pavilionAngle],
        ['Pv. Height / Depth', diamond.pavilionDepth],
        ['Girdle', [diamond.girdleThin, diamond.girdleThick, diamond.girdleCondition].map(clean).filter(Boolean).join(', ')],
        ['Girdle Thin', diamond.girdleThin],
        ['Girdle Thick', diamond.girdleThick],
        ['Girdle Condition', diamond.girdleCondition],
        ['Culet Size', diamond.culetSize],
        ['Culet Condition', diamond.ciletCondition],
        ['Star Length', diamond.starLength],
        ['Heart & Arrow', diamond.heartAndArrow || 'No'],
    ];

    const inclusionFields = [
        ['Eye Clean (%)', diamond.eyeClean],
        ['Key To Symbols', diamond.keyToSymbole],
    ];

    const detailsText = [
        titleLabel(diamond),
        `Stock No: ${nz(diamond.stockNo)}`,
        nz(diamond.status),
        `Shade: ${nz(diamond.shade)}`,
        `Lab: ${nz(diamond.lab)}`,
        `Report #${nz(diamond.reportNo)}`,
        `Total Price: ${money(diamond.totalPrice)}`,
        `Rap /Ct: ${money(diamond.rapPricePerCt)}`,
        `Price /Ct: ${money(diamond.pricePerCt)}`,
        `Discount: ${clean(diamond.discount) !== '' ? `${clean(diamond.discount)}%` : 'N/A'}`,
        '',
        'Stone Details',
        ...stoneFields.map(([label, value]) => `${label}: ${nz(value)}`),
        '',
        'MM',
        ...mmFields.map(([label, value]) => `${label}: ${nz(value)}`),
        '',
        'Inclusion',
        ...inclusionFields.map(([label, value]) => `${label}: ${nz(value)}`),
        `Certificate Comment: ${comment || 'N/A'}`,
    ].join('\n');

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: `DNA - ${nz(diamond.stockNo)}`, url });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }
        try {
            if (!navigator.clipboard) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard!', 'success');
        } catch {
            showToast('Unable to share this link.', 'error');
        }
    };

    const copyDetails = async () => {
        try {
            if (!navigator.clipboard) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(detailsText);
            showToast('DNA details copied to clipboard!', 'success');
        } catch {
            showToast('Unable to copy details.', 'error');
        }
    };

    const openCertificate = () => {
        if (!certificateAvailable(diamond)) return;
        window.open(diamond.certiFile, '_blank', 'noopener,noreferrer');
    };

    const mediaTabs = [
        { key: 'video', label: 'Video', available: Boolean(videoSource) },
        { key: 'image', label: 'Image', available: Boolean(image) },
        { key: 'tweezer', label: 'Tweezer', available: Boolean(tweezerSource) },
        { key: 'handy', label: 'Handy', available: Boolean(handySource) },
    ];

    const renderMedia = () => {
        if (mediaTab === 'image') {
            if (!image || imageError) {
                return <EmptyMedia icon={<ImageIcon size={26} />} text="No image available" />;
            }
            return (
                <img
                    src={image}
                    alt={`${nz(diamond.stockNo)} diamond`}
                    className="dna-media-image"
                    onError={() => setImageError(true)}
                />
            );
        }

        const source = mediaTab === 'video'
            ? videoSource
            : mediaTab === 'tweezer'
                ? tweezerSource
                : handySource;
        const label = mediaTab === 'video' ? '360° video' : mediaTab === 'tweezer' ? 'tweezer video' : 'handy video';

        if (!source) {
            return <EmptyMedia icon={<Play size={26} />} text={`No ${label} available`} />;
        }

        if (isDirectVideo(source)) {
            return (
                <video
                    className="dna-media-video"
                    src={source}
                    controls
                    playsInline
                    poster={image || undefined}
                />
            );
        }

        return (
            <>
                {image && !imageError ? (
                    <img
                        src={image}
                        alt={`${nz(diamond.stockNo)} preview`}
                        className="dna-media-image dna-media-image-dim"
                        onError={() => setImageError(true)}
                    />
                ) : null}
                <a
                    className="dna-media-overlay"
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="dna-media-play"><Play size={20} /></span>
                    <span>Open {label}</span>
                </a>
            </>
        );
    };

    return (
        <Layout>
            <div className="dna-page">
                <div className="dna-topbar">
                    <button type="button" className="dna-back" onClick={goBack}>
                        <ArrowLeft size={16} />
                        Back to Inventory
                    </button>
                    <span className="dna-crumb">Stone Details</span>
                </div>

                <div className="dna-card">
                    {/* ---------- header ---------- */}
                    <div className="dna-header">
                        <div className="dna-head-main">
                            <h1 className="dna-title">{titleLabel(diamond)}</h1>

                            <div className="dna-sub">
                                <span className="dna-stock">Stock No: <strong>{nz(diamond.stockNo)}</strong></span>
                                <span className={`dna-status ${clean(diamond.status).toLowerCase() === 'available' ? 'is-available' : ''}`}>
                                    {nz(diamond.status)}
                                </span>
                                <span className="dna-shade">
                                    {clean(diamond.shade) && clean(diamond.shade).toLowerCase() !== 'none'
                                        ? clean(diamond.shade)
                                        : 'No Shade'}
                                </span>
                            </div>

                            <div className="dna-chips">
                                {clean(diamond.lab) ? <span className="dna-chip">{clean(diamond.lab)}</span> : null}
                                {clean(diamond.reportNo) ? (
                                    <span className="dna-chip">Report #{clean(diamond.reportNo)}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="dna-head-price">
                            <div className="dna-total">
                                <span className="dna-total-label">Total Price</span>
                                <span className="dna-total-value">{money(diamond.totalPrice)}</span>
                            </div>
                            <div className="dna-metrics">
                                <div className="dna-metric">
                                    <span>Rap /Ct</span>
                                    <strong>{money(diamond.rapPricePerCt)}</strong>
                                </div>
                                <div className="dna-metric">
                                    <span>Price /Ct</span>
                                    <strong>{money(diamond.pricePerCt)}</strong>
                                </div>
                                <div className="dna-metric">
                                    <span>Discount</span>
                                    <strong>{clean(diamond.discount) !== '' ? `${clean(diamond.discount)}%` : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---------- body ---------- */}
                    <div className="dna-body">
                        <aside className="dna-media-panel">
                            <SectionTitle icon={<Gem size={13} />}>Diamond View</SectionTitle>

                            <div className="dna-media-tabs">
                                {mediaTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`dna-media-tab ${mediaTab === tab.key ? 'active' : ''}`}
                                        disabled={!tab.available && tab.key !== 'image'}
                                        onClick={() => setMediaTab(tab.key)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="dna-media-stage">
                                {renderMedia()}
                            </div>

                            <div className="dna-media-actions">
                                <button
                                    type="button"
                                    className="dna-action"
                                    onClick={openCertificate}
                                    disabled={!certificateAvailable(diamond)}
                                >
                                    <FileText size={14} />
                                    Certificate
                                </button>
                                <button type="button" className="dna-action" onClick={share}>
                                    <Share2 size={14} />
                                    Share
                                </button>
                                <button type="button" className="dna-action" onClick={copyDetails}>
                                    <Copy size={14} />
                                    Copy Details
                                </button>
                            </div>
                        </aside>

                        <div className="dna-sections">
                            <section className="dna-section">
                                <SectionTitle icon={<Gem size={13} />}>Stone Details</SectionTitle>
                                <div className="dna-section-body">
                                    <div className="dna-grid">
                                        {stoneFields.map(([label, value]) => (
                                            <Field key={label} label={label} value={value} />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="dna-section">
                                <SectionTitle icon={<Ruler size={13} />}>MM</SectionTitle>
                                <div className="dna-section-body">
                                    <div className="dna-grid">
                                        {mmFields.map(([label, value]) => (
                                            <Field key={label} label={label} value={value} />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="dna-section">
                                <SectionTitle icon={<Eye size={13} />}>Inclusion</SectionTitle>
                                <div className="dna-section-body">
                                    <div className="dna-grid">
                                        {inclusionFields.map(([label, value]) => (
                                            <Field key={label} label={label} value={value} />
                                        ))}
                                        <div className="dna-field dna-field-wide">
                                            <span className="dna-field-label">Certificate Comment</span>
                                            <span className="dna-field-value dna-comment">{comment || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .dna-page {
                    max-width: 1180px;
                    margin: 0 auto;
                    padding: 4px 0 24px;
                }

                .dna-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                }

                .dna-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    height: 38px;
                    padding: 0 14px;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    background: #fff;
                    color: var(--color-text-light);
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                    transition: border-color 0.15s, color 0.15s;
                }

                .dna-back:hover {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }

                .dna-crumb {
                    font-family: var(--font-serif);
                    font-size: 20px;
                    color: var(--color-text-dark);
                }

                .dna-card {
                    background: #fff;
                    border: 1px solid var(--color-input-border);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 8px 26px rgba(13, 9, 10, 0.05);
                }

                /* ---------- header ---------- */
                .dna-header {
                    display: flex;
                    align-items: stretch;
                    border-bottom: 1px solid var(--color-input-border);
                }

                .dna-head-main {
                    flex: 1 1 auto;
                    min-width: 0;
                    padding: 22px 26px;
                }

                .dna-title {
                    font-family: var(--font-sans);
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                    line-height: 1.25;
                    color: var(--color-text-dark);
                    word-break: break-word;
                }

                .dna-sub {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px 16px;
                    margin-top: 9px;
                    font-size: 12px;
                    color: var(--color-text-light);
                }

                .dna-stock strong {
                    color: var(--color-text-dark);
                    font-weight: 600;
                }

                .dna-status {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 9px;
                    border-radius: 999px;
                    background: #f4efe9;
                    color: var(--color-text-light);
                    font-size: 10.5px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .dna-status.is-available {
                    background: #e6f4ea;
                    color: #1e7b45;
                }

                .dna-shade {
                    font-size: 11px;
                    color: var(--color-text-light);
                }

                .dna-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 14px;
                }

                .dna-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 11px;
                    border: 1px solid var(--color-input-border);
                    border-radius: 999px;
                    background: #fbf8f4;
                    font-size: 11px;
                    color: var(--color-text-light);
                    letter-spacing: 0.02em;
                }

                .dna-head-price {
                    flex: 0 0 360px;
                    display: flex;
                    flex-direction: column;
                    border-left: 1px solid var(--color-input-border);
                }

                .dna-total {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 6px;
                    padding: 22px 26px;
                    border-bottom: 1px solid var(--color-input-border);
                }

                .dna-total-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--color-text-light);
                }

                .dna-total-value {
                    font-size: 26px;
                    font-weight: 700;
                    line-height: 1;
                    color: var(--color-primary);
                }

                .dna-metrics {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    flex: 1;
                }

                .dna-metric {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    padding: 12px 6px;
                    border-left: 1px solid var(--color-input-border);
                }

                .dna-metric:first-child {
                    border-left: none;
                }

                .dna-metric span {
                    font-size: 9.5px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--color-text-light);
                }

                .dna-metric strong {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--color-text-dark);
                }

                /* ---------- body ---------- */
                .dna-body {
                    display: grid;
                    grid-template-columns: 380px minmax(0, 1fr);
                }

                .dna-media-panel {
                    padding: 16px;
                    border-right: 1px solid var(--color-input-border);
                    min-width: 0;
                }

                .dna-media-panel .dna-section-head {
                    padding: 0 0 12px;
                    background: transparent;
                    border: none;
                }

                .dna-media-tabs {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .dna-media-tab {
                    padding: 9px 4px;
                    border: none;
                    border-right: 1px solid var(--color-input-border);
                    background: #fff;
                    color: var(--color-text-light);
                    font-family: inherit;
                    font-size: 11.5px;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }

                .dna-media-tab:last-child {
                    border-right: none;
                }

                .dna-media-tab:disabled {
                    color: #c9bfb5;
                    cursor: not-allowed;
                }

                .dna-media-tab.active {
                    background: var(--color-primary);
                    color: #fff;
                }

                .dna-media-stage {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    aspect-ratio: 1 / 1;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    background: #0f0d0c;
                    overflow: hidden;
                }

                .dna-media-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                }

                .dna-media-image-dim {
                    opacity: 0.5;
                }

                .dna-media-video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    background: #000;
                }

                .dna-media-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: #a99f95;
                    font-size: 12px;
                }

                .dna-media-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    background: rgba(15, 13, 12, 0.55);
                    color: #fff;
                    font-size: 12.5px;
                    text-decoration: none;
                    transition: background 0.15s;
                }

                .dna-media-overlay:hover {
                    background: rgba(15, 13, 12, 0.7);
                }

                .dna-media-play {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    background: rgba(255, 255, 255, 0.12);
                }

                .dna-media-actions {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 8px;
                    margin-top: 12px;
                }

                .dna-action {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    height: 38px;
                    padding: 0 8px;
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    background: #fff;
                    color: var(--color-text-dark);
                    font-family: inherit;
                    font-size: 11.5px;
                    font-weight: 500;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: border-color 0.15s, color 0.15s;
                }

                .dna-action:hover:not(:disabled) {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }

                .dna-action:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                /* ---------- sections ---------- */
                .dna-sections {
                    min-width: 0;
                }

                .dna-section + .dna-section {
                    border-top: 1px solid var(--color-input-border);
                }

                .dna-section-head {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 18px;
                    background: #faf7f3;
                    border-bottom: 1px solid var(--color-input-border);
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--color-text-light);
                }

                .dna-section-body {
                    padding: 18px;
                }

                .dna-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px 20px;
                }

                .dna-field {
                    min-width: 0;
                }

                .dna-field-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 4px;
                    font-size: 9.5px;
                    font-weight: 600;
                    letter-spacing: 0.09em;
                    text-transform: uppercase;
                    color: var(--color-text-light);
                }

                .dna-field-label::before {
                    content: '';
                    width: 4px;
                    height: 4px;
                    flex: 0 0 auto;
                    background: var(--color-primary);
                }

                .dna-field-value {
                    display: block;
                    font-size: 12.5px;
                    font-weight: 600;
                    line-height: 1.4;
                    color: var(--color-text-dark);
                    word-break: break-word;
                }

                .dna-field-wide {
                    grid-column: 1 / -1;
                }

                .dna-comment {
                    font-weight: 400;
                    white-space: pre-line;
                    color: var(--color-text-light);
                }

                /* ---------- states ---------- */
                .dna-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    min-height: 320px;
                    color: var(--color-text-light);
                    font-size: 13px;
                }

                .dna-state-error {
                    color: #b23c32;
                }

                .dna-state-error .dna-action {
                    color: var(--color-text-dark);
                }

                /* ---------- responsive ---------- */
                @media (max-width: 1200px) {
                    .dna-header {
                        flex-direction: column;
                    }

                    .dna-head-price {
                        flex: none;
                        border-left: none;
                        border-top: 1px solid var(--color-input-border);
                    }

                    .dna-total {
                        align-items: flex-start;
                        padding: 16px 22px;
                    }

                    .dna-body {
                        grid-template-columns: 1fr;
                    }

                    .dna-media-panel {
                        border-right: none;
                        border-bottom: 1px solid var(--color-input-border);
                    }

                    .dna-media-stage {
                        aspect-ratio: 16 / 9;
                        max-height: 460px;
                    }
                }

                @media (max-width: 768px) {
                    .dna-crumb {
                        font-size: 17px;
                    }

                    .dna-head-main {
                        padding: 16px;
                    }

                    .dna-title {
                        font-size: 20px;
                    }

                    .dna-total {
                        padding: 14px 16px;
                    }

                    .dna-total-value {
                        font-size: 22px;
                    }

                    .dna-metric {
                        padding: 10px 4px;
                    }

                    .dna-section-body {
                        padding: 14px;
                    }

                    .dna-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 14px 16px;
                    }

                    .dna-media-actions {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }

                    .dna-action {
                        font-size: 10.5px;
                        gap: 4px;
                        padding: 0 4px;
                    }
                }

                @media (max-width: 480px) {
                    .dna-grid {
                        grid-template-columns: 1fr;
                    }

                    .dna-media-actions {
                        grid-template-columns: 1fr;
                    }

                    .dna-action {
                        height: 36px;
                        font-size: 12px;
                    }
                }
            `}</style>
        </Layout>
    );
};

export default DiamondDNA;

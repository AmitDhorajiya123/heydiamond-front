import React, { useState } from 'react';
import { Search, RotateCcw, ChevronDown, Bookmark, MapPin, Gem } from 'lucide-react';
import Layout from '../components/Layout';
import '../css/Search.css';

const shapes = [
    { id: 'round', label: 'ROUND' },
    { id: 'princess', label: 'PRINCESS' },
    { id: 'pear', label: 'PEAR' },
    { id: 'cushion', label: 'CUSHION' },
    { id: 'heart', label: 'HEART' },
    { id: 'oval', label: 'OVAL' },
    { id: 'emerald', label: 'EMERALD' },
    { id: 'radiant', label: 'RADIANT' },
    { id: 'trilliant', label: 'TRILLIANT' },
    { id: 'rose', label: 'ROSE' },
    { id: 'asscher', label: 'ASSCHER' },
    { id: 'marquise', label: 'MARQUISE' }
];

const colors = ['D', 'E', 'F', 'G', 'H', 'I'];
const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2'];
const cutPolSym = ['3EX', '3VG+', '3VG-'];
const fluorescence = ['NONE', 'FNT', 'MED', 'STG', 'VST', 'SLT', 'VSL'];
const labs = ['GIA', 'IGI', 'NONE'];
const growthTypes = ['CVD', 'HPHT'];

const Inventory = () => {
    const [selectedShape, setSelectedShape] = useState('oval');
    const [selectedClarity, setSelectedClarity] = useState('VS2');
    const [selectedLocation, setSelectedLocation] = useState('SURAT');

    return (
        <Layout title="Search Stones">
            <div className="search-container">
                <h2 className="search-title">Search Stones</h2>

                {/* Location Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Location</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options" style={{ justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['SURAT', 'NY', 'MUMBAI', 'USA JEW'].map(loc => (
                                <button
                                    key={loc}
                                    className={`filter-btn ${selectedLocation === loc ? 'active' : ''}`}
                                    onClick={() => setSelectedLocation(loc)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <MapPin size={14} /> {loc}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="filter-btn active" style={{ borderRadius: '20px 0 0 20px', margin: 0, borderRight: 'none' }}>All</button>
                            <button className="filter-btn" style={{ borderRadius: '0 20px 20px 0', margin: 0, backgroundColor: '#008b8b', color: 'white', borderColor: '#008b8b' }}>BookMarked</button>
                        </div>
                    </div>
                </div>

                {/* Shape Row */}
                <div className="filter-row">
                    <div className="shape-options">
                        {shapes.map(shape => (
                            <button
                                key={shape.id}
                                className={`shape-btn ${selectedShape === shape.id ? 'active' : ''}`}
                                onClick={() => setSelectedShape(shape.id)}
                            >
                                <Gem className="shape-icon" />
                                <span className="shape-label">{shape.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Size Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Size<br />(Carats)</span>
                    </div>
                    <div className="filter-options" style={{ flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                            <div className="range-inputs">
                                <div className="range-input-wrapper">
                                    <label>From</label>
                                    <input type="text" className="range-input" placeholder="0.00" />
                                </div>
                                <div className="range-input-wrapper">
                                    <label>To</label>
                                    <input type="text" className="range-input" placeholder="0.00" />
                                </div>
                            </div>
                            <button className="reset-btn" style={{ marginBottom: '10px' }}><RotateCcw size={12} /> Reset</button>

                            <div style={{ marginLeft: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span className="filter-label">StoneNo./Certificate No.</span>
                                <div style={{ position: 'relative' }}>
                                    <input type="text" className="search-large-input" placeholder="Enter Stone/Cert. number" />
                                    <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                                </div>
                                <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="filter-btn active" style={{ borderBottom: '2px solid var(--color-primary)', borderRadius: 0, padding: '4px 8px', background: 'none', color: 'var(--color-text-dark)' }}>0.000 - 0.220</button>
                            <button className="filter-btn" style={{ border: 'none', background: 'none' }}>0.230 - 0.290</button>
                            <button className="filter-btn" style={{ border: 'none', background: 'none' }}>0.300 - 0.390</button>
                            <button className="filter-btn" style={{ border: 'none', background: 'none' }}>0.400 - 0.490</button>
                        </div>
                    </div>
                </div>

                {/* Color Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Color</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options">
                        {colors.map(c => (
                            <button key={c} className="filter-btn">{c}</button>
                        ))}
                    </div>
                </div>

                {/* Clarity Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Clarity</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options">
                        {clarities.map(c => (
                            <button
                                key={c}
                                className={`filter-btn ${selectedClarity === c ? 'active' : ''}`}
                                onClick={() => setSelectedClarity(c)}
                                style={selectedClarity === c ? { backgroundColor: 'transparent', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cut-Pol-Sym Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Cut-Pol-Sym</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options" style={{ alignItems: 'center' }}>
                        {cutPolSym.map(c => (
                            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" /> {c}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Fluorescence Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Fluorescence</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options">
                        {fluorescence.map(f => (
                            <button key={f} className="filter-btn">{f}</button>
                        ))}
                    </div>
                </div>

                {/* Lab & Growth Type Row */}
                <div className="filter-row">
                    <div className="filter-label-group">
                        <span className="filter-label">Lab</span>
                        <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                    </div>
                    <div className="filter-options" style={{ alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {labs.map(l => (
                                <button key={l} className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #ccc' }}></div> {l}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
                            <div className="filter-label-group" style={{ width: 'auto' }}>
                                <span className="filter-label">Growth Type</span>
                                <button className="reset-btn"><RotateCcw size={12} /> Reset</button>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {growthTypes.map(g => (
                                    <button key={g} className="filter-btn">{g}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accordions */}
                <div className="accordion">
                    <div className="accordion-header">
                        <span>Advance Search</span>
                        <ChevronDown size={20} />
                    </div>
                </div>

                <div className="accordion">
                    <div className="accordion-header">
                        <span>Key to Symbols</span>
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="sticky-bottom-bar">
                <button className="action-btn-secondary" style={{ borderColor: '#008b8b', color: '#008b8b' }}>
                    <Search size={18} /> Search Diamonds (12838)
                </button>
                <button className="action-btn-secondary">
                    <Bookmark size={18} /> Saved & Search
                </button>
                <button className="action-btn-secondary" style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-input-border)' }}>
                    <RotateCcw size={18} /> Reset
                </button>
            </div>
        </Layout>
    );
};

export default Inventory;

import React from 'react';
import Layout from '../components/Layout';
import { Save } from 'lucide-react';

const Settings = () => {
    return (
        <Layout title="System Settings">
            <div className="table-container" style={{ padding: '32px', maxWidth: '800px' }}>
                <h2 className="table-title" style={{ marginBottom: '24px' }}>General Settings</h2>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="settings-grid">
                        <div className="input-group">
                            <label htmlFor="siteName">Site Name</label>
                            <div className="input-wrapper">
                                <input type="text" id="siteName" defaultValue="Hey Diamond" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="supportEmail">Support Email</label>
                            <div className="input-wrapper">
                                <input type="email" id="supportEmail" defaultValue="support@heydiamond.com" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="currency">Default Currency</label>
                            <div className="input-wrapper">
                                <select id="currency" style={{ width: '100%', padding: '14px 16px', border: '1px solid var(--color-input-border)', borderRadius: '12px', backgroundColor: 'var(--color-input-bg)', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-dark)', outline: 'none' }}>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="timezone">Timezone</label>
                            <div className="input-wrapper">
                                <select id="timezone" style={{ width: '100%', padding: '14px 16px', border: '1px solid var(--color-input-border)', borderRadius: '12px', backgroundColor: 'var(--color-input-bg)', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-dark)', outline: 'none' }}>
                                    <option value="UTC">UTC</option>
                                    <option value="EST">Eastern Standard Time (EST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="submit-button" style={{ margin: 0, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Settings;

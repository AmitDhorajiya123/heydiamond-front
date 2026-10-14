import React from 'react';

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

export default ToggleSwitch;

import React from 'react';

// This is a placeholder for shared components like custom buttons, inputs, etc.
const Button = ({ children, onClick, type = "button", className = "" }) => {
    return (
        <button type={type} onClick={onClick} className={`submit-button ${className}`}>
            {children}
        </button>
    );
};

export default Button;

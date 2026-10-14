import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const ToastContainer = ({ toasts, onRemove }) => (
    <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
                <div className="toast-content">
                    <div className="toast-icon">
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'info' && <AlertCircle size={20} />}
                    </div>
                    <span className="toast-message">{toast.message}</span>
                </div>
                <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Close">
                    <X size={16} />
                </button>
            </div>
        ))}
    </div>
);

export default ToastContainer;

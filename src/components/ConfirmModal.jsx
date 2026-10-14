import React from 'react';
import { X, Loader2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, loading, variant }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ margin: 0, color: 'var(--color-text-dark)', lineHeight: '1.5' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="submit-button secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        type="button"
                        className={`submit-button ${variant === 'danger' ? 'danger' : ''}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                                {confirmText || 'Confirm'}
                            </>
                        ) : (
                            confirmText || 'Confirm'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

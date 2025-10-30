import React, { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    // Optional: disable closing on overlay click
    closeOnOverlay?: boolean;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'Confirm',
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    closeOnOverlay = true,
}) => {
    // key handling: Esc closes
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
                return;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="cdlg" role="dialog" aria-modal="true" aria-labelledby="cdlg-title">
            <div
                className="cdlg__overlay"
                onClick={() => closeOnOverlay && onCancel()}
                data-testid="confirm-overlay"
            />
            <div className="cdlg__panel">
                <header className="cdlg__header">
                    <h2 id="cdlg-title" className="cdlg__title">{title}</h2>
                </header>

                {description ? (
                    <div className="cdlg__body" id="cdlg-desc">
                        <p>{description}</p>
                    </div>
                ) : null}

                <footer className="cdlg__footer">
                    <button
                        type="button"
                        className="cdlg__btn cdlg__btn--secondary"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="cdlg__btn cdlg__btn--primary"
                        onClick={onConfirm}
                        autoFocus
                        aria-label={confirmText}
                    >
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );

};

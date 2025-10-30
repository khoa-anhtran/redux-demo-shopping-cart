import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export type StatusKind = 'success' | 'error' | 'info' | 'loading'

type Props = {
    open: boolean
    kind?: StatusKind
    title?: string
    message?: string
    primaryText?: string         // ignored for loading
    onClose: () => void          // called on OK/overlay/Esc (if enabled)
    closeOnOverlay?: boolean     // default: false for loading, true otherwise
    container?: HTMLElement | null
}

export default function StatusOverlay({
    open,
    kind = 'info',
    title = 'Status',
    message,
    primaryText = 'OK',
    onClose,
    closeOnOverlay,
    container,
}: Props) {
    const panelRef = useRef<HTMLDivElement>(null)
    const lastFocused = useRef<HTMLElement | null>(null)
    const isLoading = kind === 'loading'
    const overlayClose = closeOnOverlay ?? !isLoading
    const role: 'dialog' | 'alertdialog' = kind === 'error' ? 'alertdialog' : 'dialog'

    // lock scroll + restore focus
    useEffect(() => {
        if (!open) return
        lastFocused.current = document.activeElement as HTMLElement | null
        const prev = document.documentElement.style.overflow
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.documentElement.style.overflow = prev
            lastFocused.current?.focus()
        }
    }, [open])

    // Esc to close (not typical for loading, so off unless overlayClose is true)
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && overlayClose) onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, overlayClose, onClose])

    if (!open) return null

    const icon = { success: '✓', error: '✕', info: 'ℹ' }[kind as Exclude<StatusKind, 'loading'>]

    return <div
        className={`sdlg sdlg--square sdlg--${kind}`}
        role={role}
        aria-modal="true"
        aria-labelledby="sovl-title"
        aria-describedby={message ? 'sovl-desc' : undefined}
        aria-busy={isLoading ? 'true' : undefined}
    >
        <div
            className="sdlg__overlay"
            onClick={() => overlayClose && onClose()}
            data-testid="status-overlay"
        />
        <div className="sdlg__panel" ref={panelRef}>
            <div className="sdlg__center">
                {isLoading ? (
                    <div className="ldlg__spinner" aria-hidden="true">
                        <div className="ldlg__ring" />
                    </div>
                ) : (
                    <div className="sdlg__glyph" aria-hidden="true">{icon}</div>
                )}

                <h2 id="sovl-title" className="sdlg__title">{title}</h2>
                {message ? <p id="sovl-desc" className="sdlg__msg">{message}</p> : null}
            </div>

            {!isLoading && (
                <div className="sdlg__actions">
                    <button
                        type="button"
                        className="sdlg__btn"
                        onClick={onClose}
                        autoFocus
                    >
                        {primaryText}
                    </button>
                </div>
            )}
        </div>
    </div>

}

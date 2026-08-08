/**
 * providerWarning.tsx
 *
 * The one-time notice shown when a provider with known limitations is enabled.
 *
 * The Yandex and Apple versions of this were two nearly identical blocks in
 * mapContainer — 155 lines whose only real differences were the title, the body
 * and a 20px width. Adding a third provider meant copying it a third time.
 */

'use client';

import { useEffect } from 'react';
import { PROVIDER_WARNINGS, type WarnedProvider } from '@/hooks/useProviderWarnings';

interface ProviderWarningProps {
    provider: WarnedProvider;
    onDismiss: () => void;
}

export default function ProviderWarning({ provider, onDismiss }: ProviderWarningProps) {
    const warning = PROVIDER_WARNINGS[provider];
    const caveats = 'caveats' in warning ? warning.caveats : undefined;

    // Escape closes the dialog. The previous version could only be dismissed by
    // clicking, which left keyboard users stuck behind a modal overlay.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onDismiss();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onDismiss]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                animation: 'fadeIn 0.3s ease',
            }}
            onClick={onDismiss}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="provider-warning-title"
                style={{
                    background: '#fefbf1',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    maxWidth: '420px',
                    width: '90%',
                    fontFamily: 'var(--font-geist-sans, sans-serif)',
                    color: 'var(--sr-text, #333)',
                    textAlign: 'center',
                    animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">
                    ⚠️
                </div>
                <h3
                    id="provider-warning-title"
                    style={{
                        margin: '0 0 16px 0',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: 'var(--sr-primary, #9b4434)',
                    }}
                >
                    {warning.title}
                </h3>
                <div
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        color: 'var(--sr-text-light, #666)',
                        textAlign: caveats ? 'left' : 'center',
                    }}
                >
                    <p style={{ margin: caveats ? '0 0 12px 0' : 0 }}>{warning.body}</p>
                    {/* listStyleType is explicit because Tailwind's preflight sets
                        `list-style: none` on every ul, and these caveats only read
                        as a list if they keep their bullets. */}
                    {caveats && (
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                            {caveats.map((caveat) => (
                                <li key={caveat}>{caveat}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    type="button"
                    autoFocus
                    onClick={onDismiss}
                    style={{
                        background: 'var(--sr-primary, #9b4434)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(event) => {
                        event.currentTarget.style.background = '#7a3429';
                    }}
                    onMouseOut={(event) => {
                        event.currentTarget.style.background = 'var(--sr-primary, #9b4434)';
                    }}
                >
                    I understand
                </button>
            </div>
        </div>
    );
}

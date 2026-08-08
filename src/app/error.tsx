/**
 * error.tsx
 *
 * Error boundary for the whole app.
 *
 * There was none. The map layers fetch tiles from six providers over
 * undocumented endpoints that change without notice — when one of them throws
 * during render, the result was a blank white page with no way back and nothing
 * reported. This at least names the problem and offers a way out.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Kept until there is real error reporting: without it a crash in
        // production leaves no trace at all.
        console.error('Unhandled error:', error);
    }, [error]);

    return (
        <div className="status-page">
            <h1 className="status-title">Something went wrong</h1>
            <p className="status-body">
                The page hit an error it could not recover from on its own. Trying again often works
                — the coverage layers depend on external providers that occasionally fail.
            </p>
            {error.digest && <p className="status-detail">Reference: {error.digest}</p>}
            <div className="status-actions">
                <button type="button" onClick={reset} className="status-button">
                    Try again
                </button>
                <Link href="/" className="status-link">
                    Back to home
                </Link>
            </div>
        </div>
    );
}

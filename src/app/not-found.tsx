/**
 * not-found.tsx
 *
 * Replaces Next's default 404, which is an unstyled black-on-white page with no
 * navigation — a dead end for anyone arriving on a stale link, and now that the
 * site has a sitemap and shareable map URLs there will be more of those.
 */

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="status-page">
            <h1 className="status-title">Page not found</h1>
            <p className="status-body">
                This URL does not exist. If you followed a shared map link, it may have been
                truncated — those carry the view after a <code>#</code> and some clients cut it off.
            </p>
            <div className="status-actions">
                <Link href="/map" className="status-button">
                    Open the map
                </Link>
                <Link href="/" className="status-link">
                    Back to home
                </Link>
            </div>
        </div>
    );
}

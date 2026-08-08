/**
 * loading.tsx
 *
 * Shown while a route segment streams in. Without it a navigation looks like
 * nothing happened until the new page is ready.
 */

export default function Loading() {
    return (
        <div className="status-page">
            <div className="status-spinner" role="status" aria-label="Loading" />
        </div>
    );
}

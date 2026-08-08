/**
 * siteHeader.tsx
 *
 * The header was copy-pasted into the home and analytics pages, differing only
 * in which links it showed. One component with a `current` prop instead, so the
 * two cannot drift apart.
 */

import Link from 'next/link';
import Image from 'next/image';

const LINKS = [
    { href: '/', label: 'Home' },
    { href: '/map', label: 'Map' },
    { href: '/analytics', label: 'Analytics' },
] as const;

interface SiteHeaderProps {
    /** The page being displayed; it is dropped from the nav. */
    current: '/' | '/map' | '/analytics';
}

export default function SiteHeader({ current }: SiteHeaderProps) {
    return (
        <header className="py-[5px]">
            <div className="container flex items-center justify-between">
                <Link href="/" className="relative block h-[50px]">
                    <Image
                        src="/images/logo.png"
                        alt="StreetRadar"
                        width={50}
                        height={50}
                        priority
                        className="h-full w-auto"
                    />
                </Link>
                <nav className="flex gap-9">
                    {LINKS.filter((link) => link.href !== current).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-ink-light hover:text-primary font-medium transition-colors duration-300"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}

/**
 * siteFooter.tsx
 *
 * Shared footer. Also the one place that states how old the coverage data is,
 * so a visitor who reaches the bottom of any page knows.
 */

import Image from 'next/image';
import { formatCoverageMonth, newestCoverageDate, oldestCoverageDate } from '@/lib/site';

export default function SiteFooter() {
    const oldest = oldestCoverageDate();
    const newest = newestCoverageDate();

    return (
        <footer className="border-t border-black/5 bg-white/30 py-10">
            <div className="container flex items-center justify-between gap-5 max-md:flex-col max-md:text-center">
                <div className="flex items-center gap-4">
                    <div className="relative h-[35px]">
                        <Image
                            src="/images/logo.png"
                            alt="StreetRadar"
                            width={35}
                            height={35}
                            className="h-full w-auto"
                        />
                    </div>
                    <span className="text-ink-light text-sm">
                        © {new Date().getFullYear()} StreetRadar v0.1
                    </span>
                </div>
                {/* Null when every collected layer is switched off — the site is
                    then only showing live provider layers, which have no rebuild
                    date to apologise for. */}
                {oldest && (
                    <span className="text-ink-light text-sm">
                        Coverage data {formatCoverageMonth(oldest)}
                        {newest !== oldest && ' or newer'}
                    </span>
                )}
            </div>
        </footer>
    );
}

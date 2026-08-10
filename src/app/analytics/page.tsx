/**
 * analytics/page.tsx
 *
 * Coverage statistics and charts.
 *
 * First page converted from inline styles to Tailwind. It was the right one to
 * start with: entirely inline, self-contained, and nothing on it touches the
 * Leaflet map, so the conversion cannot break map behaviour.
 *
 * Two conventions this page establishes for the rest:
 *   - colours come from the @theme tokens in globals.css, so `text-primary`
 *     rather than a repeated hex or a var() fallback chain
 *   - hover states are `hover:` variants rather than onMouseOver handlers
 *     writing to style, which is what the cards used to do
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import CoverageChartWithControls from '@/components/charts/CoverageChartWithControls';
import SiteHeader from '@/components/layout/siteHeader';
import SiteFooter from '@/components/layout/siteFooter';
import { COVERAGE_UPDATED, formatCoverageMonth } from '@/lib/site';

export const metadata: Metadata = {
    title: 'Coverage Statistics',
    description:
        'How Street View coverage has grown over time, by provider and by country. Built from coverage data collected directly from each provider.',
    alternates: { canonical: '/analytics' },
};

const upcomingFeatures = [
    {
        icon: '🍎',
        title: 'Apple Look Around Coverage',
        description:
            'Comprehensive analysis of Apple Look Around availability, including kilometers covered and panorama count by country and region.',
    },
    {
        icon: '🌍',
        title: 'Global Statistics',
        description:
            'Interactive world map showing coverage density, total kilometers, and availability statistics for each provider. (Coming later)',
    },
];

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader current="/analytics" />

            <main className="py-20">
                <div className="container">
                    <div className="mb-20 text-center">
                        <h1 className="from-primary to-secondary mb-6 bg-gradient-to-br bg-clip-text text-5xl leading-[1.6] font-bold text-transparent">
                            Analytics &amp; Statistics
                        </h1>
                        {/* Says how old the underlying data is. The pipeline has not
                            run since September 2025, and a coverage site that
                            presents year-old figures as current is worse than one
                            that dates them. */}
                        <p className="text-ink-light text-sm">
                            Coverage data last updated {formatCoverageMonth(COVERAGE_UPDATED.apple)}
                        </p>
                    </div>

                    <section className="mb-15 rounded-2xl border border-black/5 bg-white/60 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <h2 className="text-primary mb-6 text-center text-[28px] font-semibold">
                            Street View Coverage Evolution
                        </h2>
                        <CoverageChartWithControls
                            height={500}
                            showLegend={true}
                            interactive={true}
                            title=""
                        />
                    </section>

                    <section>
                        <h3 className="text-ink mb-10 text-center text-2xl font-semibold">
                            What&apos;s Coming
                        </h3>

                        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[30px]">
                            {upcomingFeatures.map((feature) => (
                                <article
                                    key={feature.title}
                                    className="rounded-xl border border-black/5 bg-white/60 p-[30px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                                >
                                    <div
                                        className="mb-4 text-[32px] leading-[1.6]"
                                        aria-hidden="true"
                                    >
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-ink mb-3 text-lg font-semibold">
                                        {feature.title}
                                    </h4>
                                    <p className="text-ink-light text-sm leading-[1.5]">
                                        {feature.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="mt-20 text-center">
                        <p className="text-ink-light mb-5">
                            In the meantime, explore our interactive Map
                        </p>
                        <Link
                            href="/map"
                            className="bg-primary hover:bg-primary-dark inline-block rounded-lg px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Explore Map →
                        </Link>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}

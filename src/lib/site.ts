/**
 * site.ts
 *
 * Single source of truth for facts about the deployment that several places
 * need to agree on: the canonical origin, the provider list, and how fresh the
 * coverage data actually is.
 */

/**
 * Canonical origin, used for absolute URLs in metadata, the sitemap and
 * Open Graph tags. Vercel exposes the deployment host but not the production
 * domain, so this is set explicitly rather than inferred.
 */
export const SITE_URL = 'https://streetradar.app';

export const SITE_NAME = 'StreetRadar';

/**
 * When the coverage data was last rebuilt, per provider.
 *
 * This is displayed to visitors. The pipeline has not run since September 2025,
 * and a coverage map that silently presents year-old data as current is worse
 * than one that says how old it is. Update these when a refresh lands.
 */
export const COVERAGE_UPDATED: Record<string, string> = {
    apple: '2025-02',
    ja: '2025-09',
    naver: '2025-09',
};

/**
 * The providers shown on the map, and — importantly — how each layer is served.
 *
 * `live` layers are requested by the visitor's browser from the provider on
 * demand; nothing is stored here and there is no freshness date to give.
 * `collected` layers are built from coverage we gathered ourselves, so they
 * carry a date from COVERAGE_UPDATED and go stale between pipeline runs.
 *
 * The distinction matters to a visitor trying to work out why one layer is
 * current and another is a year old, so it is stated on the map page rather
 * than left for them to guess.
 */
export interface Provider {
    id: string;
    name: string;
    /** One sentence a visitor who has never heard of it can use. */
    blurb: string;
    source: 'live' | 'collected';
    logo: string;
    /** Short form for badges and tight UI, where the full name will not fit. */
    shortName: string;
}

export const PROVIDERS: Provider[] = [
    {
        id: 'google',
        logo: '/images/providers/google.svg',
        shortName: 'Google',
        name: 'Google Street View',
        blurb: 'The largest network by far, covering most of the road network in over 100 countries.',
        source: 'live',
    },
    {
        id: 'apple',
        logo: '/images/providers/apple.svg',
        shortName: 'Apple',
        name: 'Apple Look Around',
        blurb: "Apple's equivalent, launched in 2019 and still limited to a few dozen countries.",
        source: 'collected',
    },
    {
        id: 'bing',
        logo: '/images/providers/bing.svg',
        shortName: 'Bing',
        name: 'Bing Streetside',
        blurb: "Microsoft's network, concentrated in North America and Western Europe.",
        source: 'live',
    },
    {
        id: 'yandex',
        logo: '/images/providers/yandex.svg',
        shortName: 'Yandex',
        name: 'Yandex Panoramas',
        blurb: 'The most detailed coverage of Russia, Central Asia and the Caucasus.',
        source: 'live',
    },
    {
        id: 'naver',
        logo: '/images/providers/naver.svg',
        shortName: 'Naver',
        name: 'Naver Street View',
        blurb: 'Dense coverage of South Korea, where Google’s is restricted.',
        source: 'collected',
    },
    {
        id: 'ja',
        logo: '/images/providers/ja.svg',
        shortName: 'Já 360',
        name: 'Já 360',
        blurb: 'An Icelandic directory service whose imagery covers 59.6% of the road network.',
        source: 'collected',
    },
];

/**
 * Providers switched off at build time, as a comma-separated list of the ids
 * above — `NEXT_PUBLIC_DISABLED_PROVIDERS=ja,naver`.
 *
 * This exists so that a provider can be taken off the site without a code
 * change: set the variable in Vercel, redeploy, done in about a minute. Six
 * providers are reached through undocumented endpoints, and if any of them ever
 * asks us to stop, the ability to comply immediately is worth more than the
 * layer is. Without it the only options are a rushed commit or taking the whole
 * site down.
 *
 * NEXT_PUBLIC_ because the map is client-rendered, so the value is inlined into
 * the bundle at build time rather than read at runtime. That is the trade for
 * not having to run a config service.
 *
 * A disabled provider is filtered out of the layer list, the layer control, the
 * click-detection query, and the URL hash — so no request to it can originate
 * from the deployed site, and an old shared link cannot switch it back on.
 */
const DISABLED_PROVIDERS: ReadonlySet<string> = new Set(
    (process.env.NEXT_PUBLIC_DISABLED_PROVIDERS ?? '')
        .split(',')
        .map((id) => id.trim().toLowerCase())
        .filter(Boolean)
);

/** Whether a provider id (`google`, `apple`, `ja`, …) is currently served. */
export function isProviderEnabled(id: string): boolean {
    return !DISABLED_PROVIDERS.has(id.toLowerCase());
}

/** PROVIDERS minus anything switched off. Use this for anything user-facing. */
export const ENABLED_PROVIDERS: Provider[] = PROVIDERS.filter((provider) =>
    isProviderEnabled(provider.id)
);

/** "A, B and C" — for prose that has to name the providers. */
export function listProviderNames(providers: Provider[] = ENABLED_PROVIDERS): string {
    const names = providers.map((provider) => provider.name);
    if (names.length <= 1) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Derived rather than written out, so that switching a provider off also stops
 * the site claiming to cover it in its own meta description, Open Graph tags and
 * structured data. Those strings are what search engines and social platforms
 * cache, so a stale one outlives the deploy that caused it.
 */
export const SITE_DESCRIPTION = `See where Street View imagery exists worldwide. Coverage from ${listProviderNames()} on a single map.`;

/**
 * The oldest of the per-provider dates — what the site as a whole can claim.
 *
 * Only counts providers still switched on: if the layer whose data is oldest
 * gets disabled, the footer would otherwise keep apologising for data that is
 * no longer being served.
 */
export function oldestCoverageDate(): string | null {
    return enabledCoverageDates()[0] ?? null;
}

/** The newest of the per-provider dates, for deciding whether "or newer" applies. */
export function newestCoverageDate(): string | null {
    const dates = enabledCoverageDates();
    return dates[dates.length - 1] ?? null;
}

/** Sorted rebuild dates of the collected providers that are still switched on. */
function enabledCoverageDates(): string[] {
    return Object.entries(COVERAGE_UPDATED)
        .filter(([id]) => isProviderEnabled(id))
        .map(([, date]) => date)
        .sort();
}

/** Renders a YYYY-MM string as "February 2025". */
export function formatCoverageMonth(yearMonth: string): string {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * page.tsx
 *
 * Home page: what the site is, a way into the map, and which providers are
 * covered.
 *
 * Converted from the class-based styles in globals.css to Tailwind. The map
 * preview's four coordinated hover effects — the card lifts, the image scales,
 * an overlay fades in, the button slides up — are now driven by a single
 * `group` on the card rather than four descendant selectors.
 *
 * Server component: no state, no client JS.
 */

import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/siteHeader';
import SiteFooter from '@/components/layout/siteFooter';

const PROVIDERS = [
    { id: 'google', name: 'Google Street View', logo: '/images/providers/google.svg' },
    { id: 'apple', name: 'Apple Look Around', logo: '/images/providers/apple.svg' },
    { id: 'bing', name: 'Bing Streetside', logo: '/images/providers/bing.svg' },
    { id: 'yandex', name: 'Yandex Panoramas', logo: '/images/providers/yandex.svg' },
    { id: 'naver', name: 'Naver Street View', logo: '/images/providers/naver.svg' },
    { id: 'ja', name: 'Já 360 Street View', logo: '/images/providers/ja.svg' },
];

export default function Home() {
    return (
        <div>
            <SiteHeader current="/" />

            <section className="py-20 text-center">
                <div className="container">
                    <h1 className="from-primary to-secondary mb-6 bg-gradient-to-br bg-clip-text text-[64px] leading-[1.6] font-bold text-transparent max-md:text-[40px]">
                        StreetRadar
                    </h1>
                    <p className="text-ink-light mx-auto max-w-[600px] text-xl leading-[1.6] max-md:text-lg">
                        Discover street-level imagery from around the world in one seamless
                        interface
                    </p>
                </div>
            </section>

            <section className="pt-10 pb-25">
                <div className="container">
                    <Link href="/map" className="group block">
                        <div className="relative overflow-hidden rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 group-hover:-translate-y-[5px]">
                            {/* Background image lives in CSS so it can use image-set()
                                to serve AVIF with a WebP fallback. */}
                            <div className="map-image aspect-video w-full transition-transform duration-600 group-hover:scale-[1.03]" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <span className="bg-background text-ink translate-y-[10px] rounded-[30px] px-6 py-3 font-medium transition-transform duration-300 group-hover:translate-y-0">
                                    Explore Map
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            <section className="py-20">
                <div className="container">
                    <h2 className="text-ink mb-[50px] text-center text-[32px] leading-[1.6] font-bold">
                        Supported Providers
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[30px] max-md:grid-cols-1">
                        {PROVIDERS.map((provider) => (
                            <div
                                key={provider.id}
                                className="odd:hover:border-l-primary even:hover:border-l-secondary flex items-center rounded-lg bg-white/50 p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:border-l-[3px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
                            >
                                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
                                    <Image
                                        src={provider.logo}
                                        alt=""
                                        width={24}
                                        height={24}
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="font-medium">{provider.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}

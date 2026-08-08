/**
 * opengraph-image.tsx
 *
 * Generates the preview card for shares on Reddit, Discord, Slack and X.
 *
 * The site had no Open Graph tags at all, so every link to it rendered as bare
 * text. For a product whose whole value is visual, that quietly killed sharing
 * in exactly the communities most likely to care.
 *
 * Drawn rather than served as a static file so the provider list and coverage
 * date stay in step with the code.
 */

import { ImageResponse } from 'next/og';
import { SITE_NAME, formatCoverageMonth, oldestCoverageDate } from '@/lib/site';

export const alt = 'StreetRadar — Street View coverage from six providers on one map';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The palette the site already uses, from globals.css.
const BACKGROUND = '#fefbf1';
const PRIMARY = '#9b4434';
const SECONDARY = '#337b81';
const TEXT = '#333333';
const TEXT_LIGHT = '#666666';

const PROVIDERS = ['Google', 'Apple', 'Bing', 'Yandex', 'Naver', 'Já 360'];

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: BACKGROUND,
                    padding: '72px 80px',
                }}
            >
                {/* A hairline of the two brand colours across the top */}
                <div style={{ display: 'flex', height: 8, width: '100%' }}>
                    <div style={{ flex: 1, background: PRIMARY }} />
                    <div style={{ flex: 1, background: SECONDARY }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div
                        style={{
                            fontSize: 92,
                            fontWeight: 700,
                            color: PRIMARY,
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {SITE_NAME}
                    </div>
                    <div
                        style={{
                            fontSize: 38,
                            color: TEXT,
                            lineHeight: 1.3,
                            maxWidth: 900,
                        }}
                    >
                        See where Street View imagery exists worldwide — six providers on one map.
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {PROVIDERS.map((name) => (
                            <div
                                key={name}
                                style={{
                                    display: 'flex',
                                    fontSize: 26,
                                    color: SECONDARY,
                                    border: `2px solid ${SECONDARY}`,
                                    borderRadius: 999,
                                    padding: '8px 22px',
                                }}
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', fontSize: 24, color: TEXT_LIGHT }}>
                        streetradar.app · coverage data {formatCoverageMonth(oldestCoverageDate())}
                    </div>
                </div>
            </div>
        ),
        size
    );
}

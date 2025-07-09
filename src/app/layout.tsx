/**
 * layout.tsx
 * 
 * Main layout of the StreetRadar application.
 * 
 * This file defines the base HTML structure that wraps all application pages.
 * It includes:
 * - Application metadata (title, description)
 * - Font imports
 * - Base HTML structure (html, body)
 * - Global CSS classes
 * 
 * In Next.js, this layout is applied to all routes within the app/ directory.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Configuration of Geist fonts (sans-serif) and Geist Mono (monospace)
// These fonts will be available via CSS variables --font-geist-sans and --font-geist-mono
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

// Application metadata (title, description)
export const metadata: Metadata = {
    title: 'StreetRadar - Interactive Street View Coverage Map',
    description: 'Discover Street View coverage worldwide. Find panoramas from Google, Bing, Yandex and Apple in one place.',
    icons: {
        icon: '/images/logo_no_bg.png',
        shortcut: '/images/logo_no_bg.png',
        apple: '/images/logo_no_bg.png',
    },
};

/**
 * Root layout component that wraps all application pages
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
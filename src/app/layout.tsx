/**
 * layout.tsx
 * 
 * Layout principal de l'application StreetRadar.
 * 
 * Ce fichier définit la structure HTML de base qui enveloppe toutes les pages de l'application.
 * Il inclut :
 * - Les métadonnées de l'application (titre, description)
 * - L'importation des polices de caractères
 * - La structure HTML de base (html, body)
 * - Des classes CSS globales
 * 
 * Dans Next.js, ce layout est appliqué à toutes les routes au sein du répertoire app/.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Configuration des polices Geist (sans-serif) et Geist Mono (monospace)
// Ces polices seront disponibles via les variables CSS --font-geist-sans et --font-geist-mono
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

// Métadonnées de l'application (titre, description)
// Note: À mettre à jour avec les valeurs spécifiques à StreetRadar
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
 * Composant de layout racine qui enveloppe toutes les pages de l'application
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
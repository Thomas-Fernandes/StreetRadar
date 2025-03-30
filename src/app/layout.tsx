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
    title: 'StreetRadar - Carte interactive de couverture Street View',
    description: 'Visualisez la couverture mondiale des services de Street View (Google, Apple, Bing, etc.)',
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
        <html lang="fr">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
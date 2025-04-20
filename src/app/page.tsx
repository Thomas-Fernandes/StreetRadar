/**
 * page.tsx
 * 
 * Main home page of the StreetRadar application.
 * 
 * This page serves as the entry point for users and presents the main features
 * of the application. It includes several sections:
 * - A header with logo and navigation
 * - A hero section with title and description
 * - A visual preview of the map that links to the full map page
 * - A presentation of supported Street View providers
 * - A minimalist footer
 */

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const providers = [
    { 
      id: 'google', 
      name: 'Google Street View', 
      logoSrc: '/images/providers/google.svg',
      logoAlt: 'Google Logo' 
    },
    { 
      id: 'apple', 
      name: 'Apple Look Around', 
      logoSrc: '/images/providers/apple.svg',
      logoAlt: 'Apple Logo' 
    },
    { 
      id: 'bing', 
      name: 'Bing Streetside', 
      logoSrc: '/images/providers/bing.svg',
      logoAlt: 'Bing Logo' 
    },
    { 
      id: 'yandex', 
      name: 'Yandex Panoramas', 
      logoSrc: '/images/providers/yandex.svg',
      logoAlt: 'Yandex Logo' 
    }
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <Image 
              src="/images/logo.png" 
              alt="StreetRadar Logo" 
              width={50} 
              height={50} 
              priority
            />
          </div>
          <nav className="nav">
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/api" className="nav-link">API</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="title">StreetRadar</h1>
          <p className="subtitle">Discover street-level imagery from around the world in one seamless interface</p>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <Link href="/map" className="map-link">
            <div className="map-container">
              <div className="map-image">
                {/* Background image set in CSS */}
              </div>
              <div className="map-overlay">
                <span className="explore-btn">Explore Map</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
      
      {/* Providers Section */}
      <section className="providers-section">
        <div className="container">
          <h2 className="section-title">Supported Providers</h2>
          <div className="providers">
            {providers.map((provider) => (
              <div key={provider.id} className="provider">
                <div className="provider-icon">
                  <Image 
                    src={provider.logoSrc}
                    alt={provider.logoAlt}
                    width={24}
                    height={24}
                  />
                </div>
                <span className="provider-name">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="logo small">
            <Image 
              src="/images/logo.png" 
              alt="StreetRadar Logo" 
              width={35} 
              height={35} 
            />
          </div>
          <span className="copyright">© {new Date().getFullYear()} StreetRadar</span>
        </div>
      </footer>
    </div>
  );
}
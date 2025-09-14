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
 * - A footer with visitor stats and version number
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useVisitorStats } from '@/hooks/useVisitorStats';

export default function Home() {
  const visitorStats = useVisitorStats();
  
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
    },
    { 
      id: 'naver', 
      name: 'Naver Street View', 
      logoSrc: '/images/providers/naver.svg',
      logoAlt: 'Naver Logo' 
    },
    { 
      id: 'ja', 
      name: 'Já 360 Street View', 
      logoSrc: '/images/providers/ja.svg',
      logoAlt: 'Já 360 Logo' 
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
            <Link href="/map" className="nav-link">Map</Link>
            <Link href="/analytics" className="nav-link">Analytics</Link>
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
          <div className="footer-content">
            <div className="footer-left">
              <div className="logo small">
                <Image 
                  src="/images/logo.png" 
                  alt="StreetRadar Logo" 
                  width={35} 
                  height={35} 
                />
              </div>
              <span className="copyright">© {new Date().getFullYear()} StreetRadar v0.1</span>
            </div>
            
            <div className="visitor-stats">
              {visitorStats.loading ? (
                <div className="stats-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading stats...</span>
                </div>
              ) : visitorStats.error ? (
                <div className="stats-error">
                  <span>Stats unavailable</span>
                </div>
              ) : (
                <div className="stats-display">
                  <div className="stats-main">
                    <span className="stats-number">{visitorStats.total.toLocaleString()}</span>
                    <span className="stats-label">Page Views</span>
                  </div>
                  <div className="stats-breakdown">
                    <div className="stat-item">
                      <span className="stat-value">{visitorStats.thisWeek}</span>
                      <span className="stat-period">this week</span>
                    </div>
                    <div className="stat-divider">•</div>
                    <div className="stat-item">
                      <span className="stat-value">{visitorStats.thisMonth}</span>
                      <span className="stat-period">this month</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
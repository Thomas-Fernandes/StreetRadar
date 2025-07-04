/**
 * analytics/page.tsx
 * 
 * Analytics page for StreetRadar showing data visualizations and statistics
 * about Street View coverage worldwide.
 * 
 * This page will feature:
 * - Coverage statistics by provider (Apple, Google, Bing, Yandex)
 * - Kilometers covered per country
 * - Number of panoramas available
 * - Interactive charts and data visualizations
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import CoverageChart from '@/components/charts/CoverageChart';

export default function AnalyticsPage() {
  const upcomingFeatures = [
    {
      icon: '🍎',
      title: 'Apple Look Around Coverage',
      description: 'Comprehensive analysis of Apple Look Around availability, including kilometers covered and panorama count by country and region.'
    },
    {
      icon: '🌍',
      title: 'Global Statistics',
      description: 'Interactive world map showing coverage density, total kilometers, and availability statistics for each provider. (Coming later)'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background, #fefbf1)' }}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <Link href="/" className="logo">
            <Image 
              src="/images/logo.png" 
              alt="StreetRadar Logo" 
              width={50} 
              height={50} 
              priority
            />
          </Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/map" className="nav-link">Map</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '80px 0' }}>
        <div className="container">
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--primary, #9b4434), var(--secondary, #337b81))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Analytics &amp; Statistics
            </h1>
          </div>

          {/* Coverage Evolution Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '60px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              marginBottom: '24px',
              color: 'var(--primary, #9b4434)',
              textAlign: 'center'
            }}>
              Street View Coverage Evolution
            </h2>
            <CoverageChart height={500} showLegend={true} interactive={true} title="" />
          </div>

          {/* Upcoming Features */}
          <div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              textAlign: 'center',
              marginBottom: '40px',
              color: 'var(--text, #333333)'
            }}>
              What&apos;s Coming
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '30px' 
            }}>
              {upcomingFeatures.map((feature, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  padding: '30px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
                  <h4 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: 'var(--text, #333333)'
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-light, #666666)',
                    lineHeight: '1.5',
                    margin: '0'
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--text-light, #666666)',
              marginBottom: '20px'
            }}>
              In the meantime, explore our interactive Map
            </p>
            <Link 
              href="/map" 
              style={{
                background: 'var(--primary, #9b4434)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'inline-block'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#7a3429';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--primary, #9b4434)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Explore Map →
            </Link>
          </div>
        </div>
      </main>

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
          <span className="copyright">© {new Date().getFullYear()} StreetRadar v0.1</span>
        </div>
      </footer>
    </div>
  );
}
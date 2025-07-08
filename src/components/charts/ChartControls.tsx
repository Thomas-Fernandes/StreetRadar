/**
 * ChartControls.tsx
 * 
 * Simplified control panel for chart filtering with only provider selection
 * Designed to match StreetRadar's visual identity
 */

'use client';

import React from 'react';

export interface ChartFilters {
  provider: string;
  metric: 'distance' | 'panoramas';
}

interface ChartControlsProps {
  filters: ChartFilters;
  onFiltersChange: (filters: ChartFilters) => void;
  className?: string;
}

const ChartControls: React.FC<ChartControlsProps> = ({ 
  filters, 
  onFiltersChange, 
  className = '' 
}) => {
  const handleFilterChange = (key: keyof ChartFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const controlStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--sr-text, #333333)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-geist-sans, sans-serif)',
    minWidth: '120px',
    textAlign: 'center' as const,
  };

  const activeControlStyle = {
    ...controlStyle,
    backgroundColor: 'var(--sr-primary, #9b4434)',
    color: 'white',
    borderColor: 'var(--sr-primary, #9b4434)',
  };

  const containerStyle = {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
    flexShrink: 0,
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    minWidth: '140px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--sr-text-light, #666666)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap' as const,
  };

  const providers = [
    { key: 'apple', label: 'Apple', available: true },
    { key: 'google', label: 'Google', available: false },
    { key: 'bing', label: 'Bing', available: false },
    { key: 'all', label: 'All', available: false },
  ];

  const metrics = [
    { key: 'distance', label: 'Distance (km)', icon: '📏', available: true },
    { key: 'panoramas', label: 'Panoramas', icon: '📸', available: true },
  ];

  return (
    <div className={className} style={containerStyle}>
      {/* Metric Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Metric</label>
        <div style={buttonGroupStyle}>
          {metrics.map((metric) => (
            <button
              key={metric.key}
              disabled={!metric.available}
              onClick={() => metric.available && handleFilterChange('metric', metric.key)}
              style={{
                ...(filters.metric === metric.key ? activeControlStyle : controlStyle),
                opacity: metric.available ? 1 : 0.5,
                cursor: metric.available ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: '140px',
              }}
              onMouseEnter={(e) => {
                if (metric.available && filters.metric !== metric.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 68, 52, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--sr-primary, #9b4434)';
                }
              }}
              onMouseLeave={(e) => {
                if (metric.available && filters.metric !== metric.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }
              }}
              title={`Show coverage by ${metric.label.toLowerCase()}`}
            >
              <span>{metric.icon}</span>
              <span>{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Provider Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Provider</label>
        <div style={buttonGroupStyle}>
          {providers.map((provider) => (
            <button
              key={provider.key}
              disabled={!provider.available}
              onClick={() => provider.available && handleFilterChange('provider', provider.key)}
              style={{
                ...(filters.provider === provider.key ? activeControlStyle : controlStyle),
                opacity: provider.available ? 1 : 0.5,
                cursor: provider.available ? 'pointer' : 'not-allowed',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (provider.available && filters.provider !== provider.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 68, 52, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--sr-primary, #9b4434)';
                }
              }}
              onMouseLeave={(e) => {
                if (provider.available && filters.provider !== provider.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }
              }}
              title={provider.available ? `Filter by ${provider.label}` : `${provider.label} - Coming Soon`}
            >
              {provider.label}
              {!provider.available && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--sr-secondary, #337b81)',
                  color: 'white',
                  fontSize: '8px',
                  padding: '2px 4px',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}>
                  SOON
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartControls; 
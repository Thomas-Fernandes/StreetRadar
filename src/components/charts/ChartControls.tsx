/**
 * ChartControls.tsx
 * 
 * Modern control panel for chart filtering with provider, grouping, and period selection
 * Designed to match StreetRadar's visual identity
 */

'use client';

import React from 'react';

// Toast component for showing notifications
const Toast: React.FC<{ message: string; onClose: () => void; show: boolean }> = ({ message, onClose, show }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#f44336',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10000,
        fontSize: '14px',
        fontFamily: 'var(--font-geist-sans, sans-serif)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideInFromRight 0.3s ease',
        maxWidth: '300px'
      }}
    >
      <span>⚠️</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          marginLeft: 'auto'
        }}
      >
        ×
      </button>
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Country selector dropdown component
const CountrySelector: React.FC<{
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  availableCountries: string[];
}> = ({ selectedCountries, onCountriesChange, availableCountries }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      // Remove country
      onCountriesChange(selectedCountries.filter(c => c !== country));
    } else {
      // Add country if limit not reached
      if (selectedCountries.length >= 10) {
        setShowToast(true);
        return;
      }
      onCountriesChange([...selectedCountries, country]);
    }
  };

  const formatCountryName = (country: string) => {
    // Capitalize and format country names
    const formatted = country.charAt(0).toUpperCase() + country.slice(1);
    
    // Handle special cases
    const nameMap: { [key: string]: string } = {
      'usa': 'United States',
      'england': 'England',
      'scotland': 'Scotland',
      'czechrepublic': 'Czech Republic',
      'newzealand': 'New Zealand',
      'hongkong': 'Hong Kong'
    };
    
    return nameMap[country] || formatted;
  };

  // Sort countries alphabetically by formatted name
  const sortedCountries = [...availableCountries].sort((a, b) => 
    formatCountryName(a).localeCompare(formatCountryName(b))
  );

  const selectedText = selectedCountries.length === 0 
    ? 'All Countries' 
    : selectedCountries.length === 1 
      ? formatCountryName(selectedCountries[0])
      : `${selectedCountries.length} countries selected`;

  const controlStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--sr-text, #333333)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-geist-sans, sans-serif)',
    minWidth: '160px',
    textAlign: 'left' as const,
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={controlStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(155, 68, 52, 0.1)';
            e.currentTarget.style.borderColor = 'var(--sr-primary, #9b4434)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedText}
          </span>
          <span style={{ 
            marginLeft: '8px',
            transform: `rotate(${isOpen ? '180deg' : '0deg'})`,
            transition: 'transform 0.2s ease',
            fontSize: '12px'
          }}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              background: 'white',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
          >
            {/* "All Countries" option */}
            <div
              onClick={() => {
                onCountriesChange([]);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'var(--font-geist-sans, sans-serif)',
                background: selectedCountries.length === 0 ? 'rgba(155, 68, 52, 0.1)' : 'transparent',
                color: selectedCountries.length === 0 ? 'var(--sr-primary, #9b4434)' : 'var(--sr-text, #333)',
                fontWeight: selectedCountries.length === 0 ? '500' : 'normal',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                if (selectedCountries.length !== 0) {
                  e.currentTarget.style.background = 'rgba(155, 68, 52, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCountries.length !== 0) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              All Countries
            </div>

            {/* Individual countries */}
            {sortedCountries.map((country) => {
              const isSelected = selectedCountries.includes(country);
              return (
                <div
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'var(--font-geist-sans, sans-serif)',
                    background: isSelected ? 'rgba(155, 68, 52, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--sr-primary, #9b4434)' : 'var(--sr-text, #333)',
                    fontWeight: isSelected ? '500' : 'normal',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(155, 68, 52, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isSelected ? 'var(--sr-primary, #9b4434)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '3px',
                    background: isSelected ? 'var(--sr-primary, #9b4434)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px'
                  }}>
                    {isSelected ? '✓' : ''}
                  </span>
                  {formatCountryName(country)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast
        message="Maximum 10 countries can be selected"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export interface ChartFilters {
  provider: string;
  groupBy: 'country' | 'continent';
  period: 'all' | 'last12months' | 'last24months' | 'last3years';
  countries: string[];
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
  const [availableCountries, setAvailableCountries] = React.useState<string[]>([]);

  // Load available countries from data
  React.useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/data/coverage_stats.json');
        const data = await response.json();
        const uniqueCountries = [...new Set(data.map((item: any) => item.country))] as string[];
        setAvailableCountries(uniqueCountries.sort());
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    loadCountries();
  }, []);

  const handleFilterChange = (key: keyof ChartFilters, value: string | string[]) => {
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
    marginBottom: '16px',
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

  const groupByOptions = [
    { key: 'country', label: 'Country' },
    { key: 'continent', label: 'Continent' },
  ];

  const periodOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'last3years', label: 'Last 3 Years' },
    { key: 'last24months', label: 'Last 24 Months' },
    { key: 'last12months', label: 'Last 12 Months' },
  ];

  return (
    <div className={className} style={containerStyle}>
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

      {/* Group By Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Group By</label>
        <div style={buttonGroupStyle}>
          {groupByOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleFilterChange('groupBy', option.key)}
              style={filters.groupBy === option.key ? activeControlStyle : controlStyle}
              onMouseEnter={(e) => {
                if (filters.groupBy !== option.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 68, 52, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--sr-primary, #9b4434)';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.groupBy !== option.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Countries Selection - Only show when groupBy is 'country' */}
      {filters.groupBy === 'country' && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Countries (max 10)</label>
          <CountrySelector
            selectedCountries={filters.countries}
            onCountriesChange={(countries) => handleFilterChange('countries', countries)}
            availableCountries={availableCountries}
          />
        </div>
      )}

      {/* Period Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Period</label>
        <div style={buttonGroupStyle}>
          {periodOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleFilterChange('period', option.key)}
              style={filters.period === option.key ? activeControlStyle : controlStyle}
              onMouseEnter={(e) => {
                if (filters.period !== option.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 68, 52, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--sr-primary, #9b4434)';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.period !== option.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartControls; 
/**
 * CountryBarChart.tsx
 * 
 * Horizontal bar chart component for displaying Street View coverage by country
 * Filtered by selected continent with scrollable list to show all countries
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartFilters } from './ChartControls';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CoverageData {
  month: number;
  year: number;
  country: string;
  continent: string;
  km_traces: number;
  trace_count: number;
  panorama_count: number;
}

interface CountryBarChartProps {
  height?: number;
  title?: string;
  filters?: ChartFilters;
  selectedContinent?: string;
  selectedCountry?: string;
  onCountryClick?: (country: string) => void;
}

const CountryBarChart: React.FC<CountryBarChartProps> = ({ 
  height = 400, 
  filters,
  selectedContinent,
  selectedCountry,
  onCountryClick
}) => {
  const [allCountries, setAllCountries] = useState<{country: string, total: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // StreetRadar color palette
  const colors = {
    primary: '#9b4434',
    secondary: '#337b81',
    background: '#fefbf1',
    text: '#333333',
    textLight: '#666666',
    countries: [
      'rgba(155, 68, 52, 0.8)',   // Primary
      'rgba(51, 123, 129, 0.8)',  // Secondary
      'rgba(102, 102, 102, 0.8)', // Gray
      'rgba(231, 76, 60, 0.8)',   // Red
      'rgba(52, 152, 219, 0.8)',  // Blue
      'rgba(46, 204, 113, 0.8)',  // Green
      'rgba(155, 89, 182, 0.8)',  // Purple
      'rgba(241, 196, 15, 0.8)',  // Yellow
    ]
  };

  const processDataForChart = useCallback((data: CoverageData[]) => {
    // Filter data by selected continent
    let filteredData = data;
    if (selectedContinent) {
      filteredData = data.filter(item => 
        item.continent.toLowerCase() === selectedContinent.toLowerCase()
      );
    }

    // Group data by country and sum total coverage
    const countryTotals: { [country: string]: number } = {};
    
    filteredData.forEach(item => {
      if (!countryTotals[item.country]) {
        countryTotals[item.country] = 0;
      }
      // Use the selected metric (distance or panoramas)
      const value = filters?.metric === 'panoramas' ? item.panorama_count : item.km_traces;
      countryTotals[item.country] += value;
    });

    // Sort countries by total coverage (descending) - show ALL countries
    const sortedCountries = Object.entries(countryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([country, total]) => ({
        country: country.charAt(0).toUpperCase() + country.slice(1),
        total
      }));

    return sortedCountries;
  }, [filters, selectedContinent]);

  const loadCoverageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/data/coverage_stats.json');
      if (!response.ok) {
        throw new Error('Failed to load coverage data');
      }

      const data: CoverageData[] = await response.json();
      const processedData = processDataForChart(data);
      setAllCountries(processedData);
    } catch (err) {
      console.error('Error loading coverage data:', err);
      setError('Failed to load coverage data');
    } finally {
      setLoading(false);
    }
  }, [processDataForChart]);

  useEffect(() => {
    loadCoverageData();
  }, [loadCoverageData]);

  const getCountryColor = (index: number) => {
    return colors.countries[index % colors.countries.length];
  };

  const getCountryBorderColor = (index: number) => {
    return getCountryColor(index).replace('0.8', '1');
  };

  const getContinentAdjective = (continent: string) => {
    const adjectives: { [key: string]: string } = {
      'europe': 'European',
      'asia': 'Asian', 
      'africa': 'African',
      'north america': 'North American',
      'south america': 'South American',
      'oceania': 'Oceanic',
      'antarctica': 'Antarctic'
    };
    return adjectives[continent.toLowerCase()] || continent.charAt(0).toUpperCase() + continent.slice(1);
  };

  if (loading) {
    return (
      <div style={{ 
        height: height === 0 ? '100%' : `${height}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        border: '2px dashed rgba(155, 68, 52, 0.2)',
      }}>
        <div style={{ textAlign: 'center', color: colors.textLight }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid rgba(155, 68, 52, 0.2)',
            borderTop: '3px solid #9b4434',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
            Loading countries...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: height === 0 ? '100%' : `${height}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderRadius: '12px',
        border: '2px dashed rgba(231, 76, 60, 0.3)',
      }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
            ❌ {error}
          </p>
        </div>
      </div>
    );
  }

  // Show message when no continent is selected
  if (!selectedContinent) {
    return (
      <div style={{ 
        height: height === 0 ? '100%' : `${height}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: colors.textLight }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
            📊 Select a continent to view countries
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
            Click on a bar in the left chart
          </p>
        </div>
      </div>
    );
  }

  // Find the maximum value for percentage calculation
  const maxValue = Math.max(...allCountries.map(c => c.total));

  return (
    <div style={{ 
      height: height === 0 ? '100%' : `${height}px`, 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(155, 68, 52, 0.1)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(155, 68, 52, 0.1)',
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 'bold',
          color: colors.primary,
          fontFamily: 'var(--font-geist-sans, sans-serif)',
        }}>
          {getContinentAdjective(selectedContinent)} Countries
        </h4>
        <span style={{
          fontSize: '12px',
          color: colors.textLight,
          fontFamily: 'var(--font-geist-sans, sans-serif)',
        }}>
          {allCountries.length} countries
        </span>
      </div>

      {/* Scrollable country list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '4px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.primary} transparent`,
      }}>
        <style>
          {`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: ${colors.primary};
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: ${colors.secondary};
            }
          `}
        </style>
        {allCountries.map((countryData, index) => {
          const percentage = (countryData.total / maxValue) * 100;
          const color = getCountryColor(index);
          const borderColor = getCountryBorderColor(index);
          const isSelected = selectedCountry && 
            countryData.country.toLowerCase() === selectedCountry.toLowerCase();
          
          return (
            <div
              key={countryData.country}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: isSelected 
                  ? 'rgba(155, 68, 52, 0.1)' 
                  : 'rgba(255, 255, 255, 0.5)',
                border: isSelected 
                  ? '2px solid rgba(155, 68, 52, 0.3)' 
                  : '1px solid rgba(155, 68, 52, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 8px rgba(155, 68, 52, 0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(155, 68, 52, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onClick={() => onCountryClick?.(countryData.country)}
            >
                             {/* Country name */}
               <div style={{
                 width: '120px',
                 fontSize: '12px',
                 fontWeight: 'bold',
                 color: isSelected ? colors.primary : colors.text,
                 fontFamily: 'var(--font-geist-sans, sans-serif)',
                 textOverflow: 'ellipsis',
                 overflow: 'hidden',
                 whiteSpace: 'nowrap',
               }}>
                 {countryData.country}
               </div>

              {/* Progress bar */}
              <div style={{
                flex: 1,
                margin: '0 12px',
                height: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                                 <div style={{
                   width: `${percentage}%`,
                   height: '100%',
                   backgroundColor: isSelected ? colors.primary : color,
                   borderRadius: '8px',
                   transition: 'all 0.3s ease',
                   border: `1px solid ${isSelected ? colors.primary : borderColor}`,
                 }} />
              </div>

                             {/* Value */}
               <div style={{
                 width: '80px',
                 fontSize: '11px',
                 fontWeight: 'normal',
                 color: colors.textLight,
                 fontFamily: 'var(--font-geist-sans, sans-serif)',
                 textAlign: 'right',
               }}>
                 {countryData.total.toFixed(1).replace(/\.0$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{filters?.metric === 'panoramas' ? '' : ' km'}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CountryBarChart; 
/**
 * ContinentBarChart.tsx
 * 
 * Scrollable list component for displaying Street View coverage by continent
 * Supports click interaction to select a continent with modern custom design
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChartFilters } from './ChartControls';

interface CoverageData {
  month: number;
  year: number;
  country: string;
  continent: string;
  km_traces: number;
  trace_count: number;
  panorama_count: number;
}

interface ContinentBarChartProps {
  height?: number;
  title?: string;
  filters?: ChartFilters;
  onContinentClick?: (continent: string) => void;
  selectedContinent?: string;
}

const ContinentBarChart: React.FC<ContinentBarChartProps> = ({ 
  height = 400, 
  title = "Coverage by Continent",
  filters,
  onContinentClick,
  selectedContinent
}) => {
  const [allContinents, setAllContinents] = useState<{continent: string, total: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // StreetRadar color palette
  const colors = {
    primary: '#9b4434',
    secondary: '#337b81',
    background: '#fefbf1',
    text: '#333333',
    textLight: '#666666',
    continents: [
      'rgba(155, 68, 52, 0.8)',   // Primary
      'rgba(51, 123, 129, 0.8)',  // Secondary
      'rgba(102, 102, 102, 0.8)', // Gray
      'rgba(231, 76, 60, 0.8)',   // Red
      'rgba(52, 152, 219, 0.8)',  // Blue
      'rgba(46, 204, 113, 0.8)',  // Green
      'rgba(155, 89, 182, 0.8)',  // Purple
    ]
  };

  useEffect(() => {
    loadCoverageData();
  }, [filters]);

  const loadCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/data/coverage_stats.json');
      if (!response.ok) {
        throw new Error('Failed to load coverage data');
      }

      const data: CoverageData[] = await response.json();
      const processedData = processDataForChart(data);
      setAllContinents(processedData);
    } catch (err) {
      console.error('Error loading coverage data:', err);
      setError('Failed to load coverage data');
    } finally {
      setLoading(false);
    }
  };

  const processDataForChart = (data: CoverageData[]) => {
    // Group data by continent and sum total coverage
    const continentTotals: { [continent: string]: number } = {};
    
    data.forEach(item => {
      if (!continentTotals[item.continent]) {
        continentTotals[item.continent] = 0;
      }
      continentTotals[item.continent] += item.km_traces;
    });

    // Sort continents by total coverage (descending) - show ALL continents
    const sortedContinents = Object.entries(continentTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([continent, total]) => ({
        continent: continent.charAt(0).toUpperCase() + continent.slice(1),
        total
      }));

    return sortedContinents;
  };

  const getContinentColor = (index: number) => {
    return colors.continents[index % colors.continents.length];
  };

  const getContinentBorderColor = (index: number) => {
    return getContinentColor(index).replace('0.8', '1');
  };

  const handleContinentClick = (continent: string) => {
    if (onContinentClick) {
      onContinentClick(continent.toLowerCase());
    }
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
            Loading continents...
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

  // Find the maximum value for percentage calculation
  const maxValue = Math.max(...allContinents.map(c => c.total));

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
          Global Coverage by Continent
        </h4>
        <span style={{
          fontSize: '12px',
          color: colors.textLight,
          fontFamily: 'var(--font-geist-sans, sans-serif)',
        }}>
          {allContinents.length} continents
        </span>
      </div>

      {/* Scrollable continent list */}
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
        {allContinents.map((continentData, index) => {
          const percentage = (continentData.total / maxValue) * 100;
          const color = getContinentColor(index);
          const borderColor = getContinentBorderColor(index);
          const isSelected = selectedContinent && 
            continentData.continent.toLowerCase() === selectedContinent.toLowerCase();
          
          return (
            <div
              key={continentData.continent}
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
              onClick={() => handleContinentClick(continentData.continent)}
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
            >
              {/* Continent name */}
              <div style={{
                width: '120px',
                fontSize: '12px',
                fontWeight: isSelected ? 'bold' : 'bold',
                color: isSelected ? colors.primary : colors.text,
                fontFamily: 'var(--font-geist-sans, sans-serif)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}>
                {continentData.continent}
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
                color: isSelected ? colors.primary : colors.textLight,
                fontFamily: 'var(--font-geist-sans, sans-serif)',
                textAlign: 'right',
              }}>
                {continentData.total.toLocaleString()} km
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinentBarChart; 
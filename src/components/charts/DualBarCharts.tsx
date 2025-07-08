/**
 * DualBarCharts.tsx
 * 
 * Container component that displays continent and country bar charts side by side
 * Handles interaction between the two charts
 */

'use client';

import React, { useState, useEffect } from 'react';
import ContinentBarChart from './ContinentBarChart';
import CountryBarChart from './CountryBarChart';
import ChartControls, { ChartFilters } from './ChartControls';

interface CoverageData {
  month: number;
  year: number;
  country: string;
  continent: string;
  km_traces: number;
  trace_count: number;
  panorama_count: number;
}

interface DualBarChartsProps {
  height?: number;
  className?: string;
  filters?: ChartFilters;
  onFiltersChange?: (filters: ChartFilters) => void;
  selectedCountry?: string;
  onCountrySelect?: (country: string) => void;
}

const DualBarCharts: React.FC<DualBarChartsProps> = ({
  height = 500,
  className = "",
  filters,
  onFiltersChange,
  selectedCountry,
  onCountrySelect
}) => {
  // Use internal state only if no filters prop is provided
  const [internalFilters, setInternalFilters] = useState<ChartFilters>({
    provider: 'apple',
    metric: 'distance'
  });
  
  const [selectedContinent, setSelectedContinent] = useState<string>('');
  const [internalSelectedCountry, setInternalSelectedCountry] = useState<string>('');

  // Use provided state or internal state
  const currentFilters = filters || internalFilters;
  const currentSelectedCountry = selectedCountry !== undefined ? selectedCountry : internalSelectedCountry;

  // Load data and set default continent (most covered one) on mount
  useEffect(() => {
    const loadDefaultContinent = async () => {
      try {
        const response = await fetch('/data/coverage_stats.json');
        if (!response.ok) return;

        const data: CoverageData[] = await response.json();
        
        // Calculate continent totals
        const continentTotals: { [continent: string]: number } = {};
        data.forEach(item => {
          if (!continentTotals[item.continent]) {
            continentTotals[item.continent] = 0;
          }
          continentTotals[item.continent] += item.km_traces;
        });

        // Find continent with most coverage
        const topContinent = Object.entries(continentTotals)
          .sort(([,a], [,b]) => b - a)[0];
        
        if (topContinent) {
          setSelectedContinent(topContinent[0]);
        }
      } catch (error) {
        console.error('Error loading default continent:', error);
      }
    };

    loadDefaultContinent();
  }, []);

  const handleFiltersChange = (newFilters: ChartFilters) => {
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    } else {
      setInternalFilters(newFilters);
    }
  };

  const handleContinentClick = (continent: string) => {
    setSelectedContinent(continent);
    // Reset country selection when continent changes
    if (onCountrySelect) {
      onCountrySelect('');
    } else {
      setInternalSelectedCountry('');
    }
  };

  const handleCountryClick = (country: string) => {
    if (onCountrySelect) {
      onCountrySelect(currentSelectedCountry === country ? '' : country);
    } else {
      setInternalSelectedCountry(currentSelectedCountry === country ? '' : country);
    }
  };

  return (
    <div className={className} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 0 
    }}>
      {/* Controls - only show if no external filters are provided */}
      {!filters && (
        <ChartControls 
          filters={currentFilters} 
          onFiltersChange={handleFiltersChange}
        />
      )}
      
      {/* Charts Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        minHeight: 0,
        alignItems: 'stretch',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Left Chart - Continents */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <ContinentBarChart
            height={0}
            title=""
            filters={currentFilters}
            onContinentClick={handleContinentClick}
            selectedContinent={selectedContinent}
          />
        </div>

        {/* Right Chart - Countries */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <CountryBarChart
            height={0}
            title=""
            filters={currentFilters}
            selectedContinent={selectedContinent}
            selectedCountry={currentSelectedCountry}
            onCountryClick={handleCountryClick}
          />
        </div>
      </div>


    </div>
  );
};

export default DualBarCharts; 
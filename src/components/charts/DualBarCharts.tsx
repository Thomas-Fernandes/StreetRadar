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
}

const DualBarCharts: React.FC<DualBarChartsProps> = ({
  height = 500,
  className = ""
}) => {
  const [filters, setFilters] = useState<ChartFilters>({
    provider: 'apple',
    metric: 'distance'
  });
  const [selectedContinent, setSelectedContinent] = useState<string>('');

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
    setFilters(newFilters);
  };

  const handleContinentClick = (continent: string) => {
    setSelectedContinent(continent);
  };

  return (
    <div className={className} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 0 
    }}>
      {/* Controls */}
      <ChartControls 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
      />
      
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
            filters={filters}
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
            filters={filters}
            selectedContinent={selectedContinent}
          />
        </div>
      </div>


    </div>
  );
};

export default DualBarCharts; 
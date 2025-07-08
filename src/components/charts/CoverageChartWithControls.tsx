/**
 * CoverageChartWithControls.tsx
 * 
 * Container component that displays dual horizontal bar charts and timeline
 * Shows continent and country coverage with interactive selection plus evolution over time
 */

'use client';

import React, { useState, useEffect } from 'react';
import DualBarCharts from './DualBarCharts';
import TimelineChart from './TimelineChart';
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

interface CoverageChartWithControlsProps {
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  title?: string;
  className?: string;
}

const CoverageChartWithControls: React.FC<CoverageChartWithControlsProps> = ({
  height = 500,
  showLegend = true,
  interactive = true,
  title = "Street View Coverage Analysis",
  className = ""
}) => {
  const [filters, setFilters] = useState<ChartFilters>({
    provider: 'apple',
    metric: 'distance'
  });
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const handleFiltersChange = (newFilters: ChartFilters) => {
    setFilters(newFilters);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className={`charts-container ${className}`}>
      {/* Controls at the top */}
      <ChartControls 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
      />
      
      {/* Top row: Dual bar charts side by side */}
      <div className="charts-row">
        <div className="chart-section">
          <h3 className="chart-section-title">Coverage by Region</h3>
          <div className="chart-section-content">
            <DualBarCharts
              height={0}
              className=""
              filters={filters}
              selectedCountry={selectedCountry}
              onCountrySelect={handleCountrySelect}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom row: Timeline chart */}
      <div className="timeline-chart-section">
        <h3 className="chart-section-title">
          {selectedCountry ? `${selectedCountry} - Coverage Evolution Over Time` : 'Coverage Evolution Over Time'}
        </h3>
        <TimelineChart
          height={0}
          title=""
          showLegend={true}
          interactive={interactive}
          className=""
          filters={filters}
          selectedCountry={selectedCountry}
        />
      </div>
    </div>
  );
};

export default CoverageChartWithControls; 
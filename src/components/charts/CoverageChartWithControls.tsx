/**
 * CoverageChartWithControls.tsx
 * 
 * Container component that combines chart controls and coverage chart
 * Manages the filter state and passes it to both components
 */

'use client';

import React, { useState } from 'react';
import ChartControls, { ChartFilters } from './ChartControls';
import CoverageChart from './CoverageChart';

interface CoverageChartWithControlsProps {
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  title?: string;
  className?: string;
}

const CoverageChartWithControls: React.FC<CoverageChartWithControlsProps> = ({
  height = 400,
  showLegend = true,
  interactive = true,
  title = "Street View Coverage Evolution",
  className = ""
}) => {
  const [filters, setFilters] = useState<ChartFilters>({
    provider: 'apple',
    groupBy: 'country',
    period: 'all',
    countries: []
  });

  const handleFiltersChange = (newFilters: ChartFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className={className} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 0 
    }}>
      <ChartControls 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
      />
      <div style={{ 
        flex: 1, 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CoverageChart
          height={height}
          showLegend={showLegend}
          interactive={interactive}
          title={title}
          filters={filters}
        />
      </div>
    </div>
  );
};

export default CoverageChartWithControls; 
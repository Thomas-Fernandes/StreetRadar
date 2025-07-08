/**
 * CoverageChartWithControls.tsx
 * 
 * Container component that displays dual horizontal bar charts and timeline
 * Shows continent and country coverage with interactive selection plus evolution over time
 */

'use client';

import React from 'react';
import DualBarCharts from './DualBarCharts';
import TimelineChart from './TimelineChart';

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
  return (
    <div className={`charts-container ${className}`}>
      {/* Top row: Dual bar charts side by side */}
      <div className="charts-row">
        <div className="chart-section">
          <h3 className="chart-section-title">Coverage by Region</h3>
          <div className="chart-section-content">
            <DualBarCharts
              height={0}
              className=""
            />
          </div>
        </div>
      </div>
      
      {/* Bottom row: Timeline chart */}
      <div className="timeline-chart-section">
        <h3 className="chart-section-title">Coverage Evolution Over Time</h3>
        <TimelineChart
          height={0}
          title=""
          showLegend={true}
          interactive={interactive}
          className=""
        />
      </div>
    </div>
  );
};

export default CoverageChartWithControls; 
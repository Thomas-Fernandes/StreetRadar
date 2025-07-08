/**
 * ContinentBarChart.tsx
 * 
 * Horizontal bar chart component for displaying Street View coverage by continent
 * Supports click interaction to select a continent
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

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
      setChartData(processedData);
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

    // Sort continents by total coverage (descending)
    const sortedContinents = Object.entries(continentTotals)
      .sort(([,a], [,b]) => b - a);

    const labels = sortedContinents.map(([continent]) => 
      continent.charAt(0).toUpperCase() + continent.slice(1)
    );
    const dataValues = sortedContinents.map(([,total]) => total);

    // Create colors array with highlighted selected continent
    const backgroundColors = labels.map((continent, index) => {
      const isSelected = selectedContinent && 
        continent.toLowerCase() === selectedContinent.toLowerCase();
      return isSelected 
        ? colors.primary 
        : colors.continents[index % colors.continents.length];
    });

    const borderColors = backgroundColors.map(color => 
      color.replace('0.8', '1')
    );

    return {
      labels,
      datasets: [{
        label: 'Coverage (km)',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 40,
      }]
    };
  };

  const handleChartClick = (event: any, elements: any[]) => {
    if (elements.length > 0 && onContinentClick) {
      const index = elements[0].index;
      const continent = chartData.labels[index].toLowerCase();
      onContinentClick(continent);
    }
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: colors.background,
        titleColor: colors.primary,
        bodyColor: colors.text,
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'var(--font-geist-sans, sans-serif)',
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'var(--font-geist-sans, sans-serif)',
          size: 12,
          weight: 'normal' as const,
        },
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.x;
            return `${value.toLocaleString()} km coverage`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 11,
            weight: 'normal' as const,
          },
          color: colors.textLight,
          callback: function(value: any) {
            return value.toLocaleString() + ' km';
          },
        },
        border: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 12,
            weight: 'bold' as const,
          },
          color: colors.text,
        },
        border: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      intersect: false,
    },
    onHover: (event: any, elements: any[]) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
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

  return (
    <div style={{ 
      height: height === 0 ? '100%' : `${height}px`, 
      width: '100%',
    }}>
      {chartData && <Bar ref={chartRef} data={chartData} options={options} />}
    </div>
  );
};

export default ContinentBarChart; 
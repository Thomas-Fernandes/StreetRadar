/**
 * CountryBarChart.tsx
 * 
 * Horizontal bar chart component for displaying Street View coverage by country
 * Filtered by selected continent
 */

'use client';

import React, { useEffect, useState } from 'react';
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

interface CountryBarChartProps {
  height?: number;
  title?: string;
  filters?: ChartFilters;
  selectedContinent?: string;
}

const CountryBarChart: React.FC<CountryBarChartProps> = ({ 
  height = 400, 
  title = "Coverage by Country",
  filters,
  selectedContinent
}) => {
  const [chartData, setChartData] = useState<any>(null);
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

  useEffect(() => {
    loadCoverageData();
  }, [filters, selectedContinent]);

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
      countryTotals[item.country] += item.km_traces;
    });

    // Sort countries by total coverage (descending) and limit to top 10
    const sortedCountries = Object.entries(countryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const labels = sortedCountries.map(([country]) => 
      country.charAt(0).toUpperCase() + country.slice(1)
    );
    const dataValues = sortedCountries.map(([,total]) => total);

    // Create gradient colors
    const backgroundColors = labels.map((_, index) => 
      colors.countries[index % colors.countries.length]
    );

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
        barThickness: 30,
      }]
    };
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
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

  return (
    <div style={{ 
      height: height === 0 ? '100%' : `${height}px`, 
      width: '100%',
    }}>
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default CountryBarChart; 
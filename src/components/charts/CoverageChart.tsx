/**
 * CoverageChart.tsx
 * 
 * Modern area chart component for displaying Street View coverage evolution over time
 * Uses Chart.js with a design perfectly integrated with StreetRadar's visual identity
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ChartFilters } from './ChartControls';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
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

interface CoverageChartProps {
  height?: number;
  title?: string;
  showLegend?: boolean;
  interactive?: boolean;
  filters?: ChartFilters;
}

const CoverageChart: React.FC<CoverageChartProps> = ({ 
  height = 400, 
  title = "Street View Coverage Evolution",
  showLegend = true,
  interactive = true,
  filters
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
      'rgba(155, 68, 52, 0.8)',   // Primary color for main country
      'rgba(51, 123, 129, 0.8)',  // Secondary color
      'rgba(102, 102, 102, 0.8)', // Gray for others
      'rgba(231, 76, 60, 0.8)',   // Red accent
      'rgba(52, 152, 219, 0.8)',  // Blue accent
      'rgba(46, 204, 113, 0.8)',  // Green accent
      'rgba(155, 89, 182, 0.8)',  // Purple accent
      'rgba(241, 196, 15, 0.8)',  // Yellow accent
    ]
  };

  useEffect(() => {
    loadCoverageData();
  }, [filters]);

  const loadCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load coverage data from the JSON file
      const response = await fetch('/data/coverage_stats.json');
      if (!response.ok) {
        throw new Error('Failed to load coverage data');
      }

      const data: CoverageData[] = await response.json();
      
      // Process data for the chart
      const processedData = processDataForChart(data, filters);
      setChartData(processedData);
    } catch (err) {
      console.error('Error loading coverage data:', err);
      setError('Failed to load coverage data');
    } finally {
      setLoading(false);
    }
  };

  const processDataForChart = (data: CoverageData[], filters?: ChartFilters) => {
    // Apply filters to data
    let filteredData = data;

    // Filter by period
    if (filters?.period && filters.period !== 'all') {
      const currentDate = new Date();
      let cutoffDate = new Date();
      
      switch (filters.period) {
        case 'last12months':
          cutoffDate.setMonth(currentDate.getMonth() - 12);
          break;
        case 'last24months':
          cutoffDate.setMonth(currentDate.getMonth() - 24);
          break;
        case 'last3years':
          cutoffDate.setFullYear(currentDate.getFullYear() - 3);
          break;
      }
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.year, item.month - 1, 1);
        return itemDate >= cutoffDate;
      });
    }

    // Filter by countries if specific countries are selected
    if (filters?.countries && filters.countries.length > 0) {
      filteredData = filteredData.filter(item => 
        filters.countries.includes(item.country)
      );
    }

    // Group data by date and region (country or continent)
    const groupedByDate: { [key: string]: { [region: string]: number } } = {};
    const groupByField = filters?.groupBy || 'country';
    
    filteredData.forEach(item => {
      const date = new Date(item.year, item.month - 1, 1);
      const dateKey = date.toISOString().substring(0, 7); // YYYY-MM format
      const regionKey = groupByField === 'continent' ? item.continent : item.country;
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      
      if (!groupedByDate[dateKey][regionKey]) {
        groupedByDate[dateKey][regionKey] = 0;
      }
      
      groupedByDate[dateKey][regionKey] += item.km_traces;
    });

    // Get top regions by total coverage
    const regionTotals: { [region: string]: number } = {};
    Object.values(groupedByDate).forEach(dateData => {
      Object.entries(dateData).forEach(([region, km]) => {
        regionTotals[region] = (regionTotals[region] || 0) + km;
      });
    });

    // Determine how many regions to show based on filters
    const maxRegions = (filters?.countries && filters.countries.length > 0 && filters.countries.length <= 10) 
      ? filters.countries.length 
      : Math.min(7, Object.keys(regionTotals).length);

    const topRegions = Object.entries(regionTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxRegions)
      .map(([region]) => region);

    // Create datasets for each top region
    const labels = Object.keys(groupedByDate).sort();
    const datasets = topRegions.map((region: string, index: number) => {
      const regionData = labels.map(date => {
        let cumulativeTotal = 0;
        // Calculate cumulative total up to this date
        for (const labelDate of labels) {
          if (labelDate <= date) {
            cumulativeTotal += groupedByDate[labelDate][region] || 0;
          }
        }
        return cumulativeTotal;
      });

      return {
        label: region.charAt(0).toUpperCase() + region.slice(1),
        data: regionData,
        backgroundColor: colors.countries[index] || colors.countries[colors.countries.length - 1],
        borderColor: colors.countries[index]?.replace('0.8', '1') || colors.countries[colors.countries.length - 1].replace('0.8', '1'),
        borderWidth: 2,
        fill: index === 0 ? 'origin' : `-${index}`, // Stack areas
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.background,
        pointBorderWidth: 2,
      };
    });

    return {
      labels: labels.map(label => {
        const [year, month] = label.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
      }),
      datasets
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: height === 0 ? false : true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'var(--font-geist-sans, sans-serif)',
          size: 18,
          weight: 'bold' as const,
        },
        color: colors.primary,
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        display: showLegend,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 12,
            weight: 'normal' as const,
          },
          color: colors.text,
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: interactive,
        backgroundColor: colors.background,
        titleColor: colors.primary,
        bodyColor: colors.text,
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
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
          title: (context: TooltipItem<'line'>[]) => {
            const date = context[0].parsed.x;
            return new Date(date).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long' 
            });
          },
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString()} km`;
          },
          footer: (tooltipItems: TooltipItem<'line'>[]) => {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total.toLocaleString()} km`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 11,
            weight: 'normal' as const,
          },
          color: colors.textLight,
          maxTicksLimit: 8,
        },
        border: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        stacked: true,
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
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      },
    },
  };

  if (loading) {
    return (
      <div style={{ 
        height: `${height}px`, 
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
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: `${height}px`, 
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
      position: 'relative' 
    }}>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default CoverageChart; 
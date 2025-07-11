/**
 * TimelineChart.tsx
 * 
 * Component that displays coverage evolution over time as a line chart
 * Shows cumulative coverage growth by month/year
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  TooltipItem,
} from 'chart.js';
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
  TimeScale,
  Filler
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

interface TimelineChartProps {
  height?: number;
  title?: string;
  showLegend?: boolean;
  interactive?: boolean;
  className?: string;
  filters?: ChartFilters;
  selectedCountry?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  height = 400,
  title,
  showLegend = true,
  interactive = true,
  className = "",
  filters,
  selectedCountry
}) => {
  const [chartData, setChartData] = useState<{
    labels: Date[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean | string;
      tension: number;
      borderWidth: number;
      pointRadius: number;
      pointHoverRadius: number;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointBorderWidth: number;
      pointHoverBackgroundColor?: string;
      pointHoverBorderColor?: string;
      pointHoverBorderWidth?: number;
      borderDash?: number[];
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // StreetRadar color palette
  const colors = {
    primary: '#9b4434',
    secondary: '#337b81',
    background: '#fefbf1',
    text: '#333333',
    textLight: '#666666',
    gradient: {
      start: 'rgba(155, 68, 52, 0.3)',
      end: 'rgba(155, 68, 52, 0.05)',
    }
  };

  const processDataForTimeline = useCallback((data: CoverageData[]) => {
    // Filter by country if one is selected
    let filteredData = data;
    if (selectedCountry) {
      filteredData = data.filter(item => 
        item.country.toLowerCase() === selectedCountry.toLowerCase()
      );
    }

    // Group data by month/year and calculate total coverage based on selected metric
    const monthlyTotals: { [key: string]: number } = {};
    
    filteredData.forEach(item => {
      const date = new Date(item.year, item.month - 1, 1);
      const dateKey = date.toISOString().substring(0, 7); // YYYY-MM format
      
      if (!monthlyTotals[dateKey]) {
        monthlyTotals[dateKey] = 0;
      }
      
      // Use the selected metric (distance or panoramas)
      const value = filters?.metric === 'panoramas' ? item.panorama_count : item.km_traces;
      monthlyTotals[dateKey] += value;
    });

    // Sort dates and calculate cumulative totals
    const sortedDates = Object.keys(monthlyTotals).sort();
    let cumulativeTotal = 0;
    const cumulativeData: { date: Date; total: number; monthly: number }[] = [];

    sortedDates.forEach(dateKey => {
      const monthly = monthlyTotals[dateKey];
      cumulativeTotal += monthly;
      const [year, month] = dateKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      cumulativeData.push({
        date,
        total: cumulativeTotal,
        monthly
      });
    });

    // Dynamic labels based on metric and country selection
    const isPanoramas = filters?.metric === 'panoramas';
    const countryPrefix = selectedCountry ? `${selectedCountry} - ` : '';
    const totalLabel = isPanoramas ? `${countryPrefix}Total Panoramas` : `${countryPrefix}Total Coverage`;
    const monthlyLabel = isPanoramas ? `${countryPrefix}Monthly Panoramas` : `${countryPrefix}Monthly Addition`;

    return {
      labels: cumulativeData.map(item => item.date),
      datasets: [
        {
          label: totalLabel,
          data: cumulativeData.map(item => item.total),
          borderColor: colors.primary,
          backgroundColor: colors.gradient.start,
          fill: 'origin',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: colors.background,
          pointBorderColor: colors.primary,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: colors.primary,
          pointHoverBorderColor: colors.background,
          pointHoverBorderWidth: 3,
        },
        {
          label: monthlyLabel,
          data: cumulativeData.map(item => item.monthly),
          borderColor: colors.secondary,
          backgroundColor: 'rgba(51, 123, 129, 0.1)',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: colors.background,
          pointBorderColor: colors.secondary,
          pointBorderWidth: 2,
          borderDash: [5, 5],
        }
      ]
    };
  }, [filters, selectedCountry]);

  const loadTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/data/coverage_stats.json');
      if (!response.ok) {
        throw new Error('Failed to load coverage data');
      }

      const data: CoverageData[] = await response.json();
      const processedData = processDataForTimeline(data);
      setChartData(processedData);
    } catch (err) {
      console.error('Error loading timeline data:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  }, [processDataForTimeline]);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]);

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
        text: title || `${selectedCountry ? `${selectedCountry} - ` : ''}${filters?.metric === 'panoramas' ? 'Panoramas' : 'Coverage'} Evolution Timeline`,
        font: {
          family: 'var(--font-geist-sans, sans-serif)',
          size: 20,
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
            return new Date(date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            });
          },
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y;
            const label = context.dataset.label;
            const unit = filters?.metric === 'panoramas' ? '' : ' km';
            return `${label}: ${value.toLocaleString()}${unit}`;
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
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 11,
            weight: 'normal' as const,
          },
          color: colors.textLight,
          maxTicksLimit: 10,
        },
        border: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          font: {
            family: 'var(--font-geist-sans, sans-serif)',
            size: 11,
            weight: 'normal' as const,
          },
          color: colors.textLight,
          callback: function(value: string | number) {
            const unit = filters?.metric === 'panoramas' ? '' : ' km';
            return value.toLocaleString() + unit;
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
      <div className={className} style={{ 
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
            Chargement de la timeline...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ 
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
    <div className={className} style={{ 
      height: height === 0 ? 'calc(100% - 50px)' : `${height}px`, 
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '10px 0'
    }}>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default TimelineChart; 
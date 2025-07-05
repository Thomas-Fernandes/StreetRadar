/**
 * StatisticsPanel.tsx
 * 
 * Component for displaying coverage statistics on the map.
 * Shows total coverage, provider breakdown, and filtering options.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { StatisticsService } from '../../services/statisticsService';
import CoverageChart from '../charts/CoverageChart';
import CoverageChartWithControls from '../charts/CoverageChartWithControls';

interface StatisticsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Statistics panel component that displays coverage metrics and analytics
 */
export default function StatisticsPanel({ isOpen, onToggle }: StatisticsPanelProps) {
  const [totalKilometers, setTotalKilometers] = useState<string>('--');
  const [totalPanoramaCount, setTotalPanoramaCount] = useState<string>('--');
  const [providerBreakdown, setProviderBreakdown] = useState<{ [provider: string]: { kilometers: string; panoramaCount: string } }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState<boolean>(false);

  // Load statistics when component mounts or when panel opens
  useEffect(() => {
    if (isOpen && loading) {
      loadStatistics();
    }
  }, [isOpen, loading]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [kilometers, panoramaCount, breakdown] = await Promise.all([
        StatisticsService.getTotalKilometers(),
        StatisticsService.getTotalPanoramaCount(),
        StatisticsService.getProviderBreakdown()
      ]);
      
      setTotalKilometers(kilometers);
      setTotalPanoramaCount(panoramaCount);
      setProviderBreakdown(breakdown);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Failed to load statistics');
      setTotalKilometers('Error');
      setTotalPanoramaCount('Error');
      setProviderBreakdown({});
    } finally {
      setLoading(false);
    }
  };

  // Toggle chart modal
  const toggleChartsExpansion = () => {
    setIsChartModalOpen(!isChartModalOpen);
  };

  // Add/remove body class when chart modal opens/closes
  useEffect(() => {
    if (isChartModalOpen) {
      document.body.classList.add('chart-modal-open');
    } else {
      document.body.classList.remove('chart-modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('chart-modal-open');
    };
  }, [isChartModalOpen]);

  return (
    <>
      {/* Statistics button - shows when panel is closed */}
      {!isOpen && (
        <div className="statistics-button-container">
          <button
            className="statistics-button"
            onClick={onToggle}
            title="Open Statistics Panel"
          >
            📊
          </button>
          <div className="statistics-button-tooltip">
            Statistics
          </div>
        </div>
      )}
      
      {/* Statistics panel */}
      <div className={`statistics-panel ${isOpen ? 'open' : ''}`}>
        <div 
          className={`statistics-panel-header ${isOpen ? '' : 'collapsed'}`}
          onClick={onToggle}
        >
          <div className="header-icon-container">
            <span className="header-stats-icon">📊</span>
            <span>Statistics</span>
          </div>
          <span className={`arrow-icon ${isOpen ? '' : 'collapsed'}`}></span>
        </div>
      
      {isOpen && (
        <div className="statistics-container">
          {/* Total Coverage Section */}
          <div className="stats-section">
            <h3 className="stats-section-title">Total Coverage</h3>
            <div className="stats-metrics">
              <div className="stat-item">
                <span className="stat-label">Total Kilometers</span>
                <span className="stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : `${totalKilometers} km`}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Panorama Count</span>
                <span className="stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : totalPanoramaCount}
                </span>
              </div>
            </div>
          </div>

          {/* Provider Breakdown Section */}
          <div className="stats-section">
            <h3 className="stats-section-title">Provider Breakdown</h3>
            <div className="provider-stats">
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator google"></span>
                  <span className="provider-stat-name">Google</span>
                </div>
                <span className="provider-stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : 
                    providerBreakdown.Google ? providerBreakdown.Google.kilometers : 'Coming Soon'}
                </span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator bing"></span>
                  <span className="provider-stat-name">Bing</span>
                </div>
                <span className="provider-stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : 
                    providerBreakdown.Bing ? providerBreakdown.Bing.kilometers : 'Coming Soon'}
                </span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator apple"></span>
                  <span className="provider-stat-name">Apple</span>
                </div>
                <span className="provider-stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : 
                    providerBreakdown.Apple ? `${providerBreakdown.Apple.kilometers} km` : '-- km'}
                </span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator yandex"></span>
                  <span className="provider-stat-name">Yandex</span>
                </div>
                <span className="provider-stat-value">
                  {loading ? 'Loading...' : error ? 'Error' : 
                    providerBreakdown.Yandex ? providerBreakdown.Yandex.kilometers : 'Coming Soon'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="stats-section charts-section">
            <h3 className="stats-section-title">Coverage Trends</h3>
            <div 
              className="chart-preview"
              onClick={toggleChartsExpansion}
              title="Click to view chart in full screen"
            >
              <div className="chart-preview-content">
                <CoverageChart height={120} showLegend={false} interactive={false} title="" />
                <div className="chart-expand-hint">Click to expand</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Modal */}
      {isChartModalOpen && (
        <div className="chart-modal-overlay" onClick={toggleChartsExpansion}>
          <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h2 className="chart-modal-title">Coverage Trends</h2>
              <button 
                className="chart-modal-close"
                onClick={toggleChartsExpansion}
                title="Close chart"
              >
                ✕
              </button>
            </div>
            <div className="chart-modal-body">
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                <CoverageChartWithControls height={0} showLegend={true} interactive={true} title="" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
} 
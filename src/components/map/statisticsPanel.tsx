/**
 * StatisticsPanel.tsx
 * 
 * Component for displaying coverage statistics on the map.
 * Shows total coverage, provider breakdown, and filtering options.
 */

'use client';

import React from 'react';

interface StatisticsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Statistics panel component that displays coverage metrics and analytics
 */
export default function StatisticsPanel({ isOpen, onToggle }: StatisticsPanelProps) {
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
                <span className="stat-value">-- km</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Panorama Count</span>
                <span className="stat-value">--</span>
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
                <span className="provider-stat-value">-- km</span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator bing"></span>
                  <span className="provider-stat-name">Bing</span>
                </div>
                <span className="provider-stat-value">-- km</span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator yandex"></span>
                  <span className="provider-stat-name">Yandex</span>
                </div>
                <span className="provider-stat-value">-- km</span>
              </div>
              <div className="provider-stat-item">
                <div className="provider-stat-header">
                  <span className="provider-color-indicator apple"></span>
                  <span className="provider-stat-name">Apple</span>
                </div>
                <span className="provider-stat-value">-- km</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="stats-section">
            <h3 className="stats-section-title">Filters</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label className="filter-label">Country</label>
                <select className="filter-select" disabled>
                  <option>All Countries</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Continent</label>
                <select className="filter-select" disabled>
                  <option>All Continents</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Year</label>
                <select className="filter-select" disabled>
                  <option>All Years</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Provider</label>
                <select className="filter-select" disabled>
                  <option>All Providers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="stats-section">
            <h3 className="stats-section-title">Charts</h3>
            <div className="charts-placeholder">
              <div className="chart-placeholder">
                <span>📈 Coverage Trends</span>
                <p>Chart will be displayed here</p>
              </div>
              <div className="chart-placeholder">
                <span>🗺️ Geographic Distribution</span>
                <p>Chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
} 
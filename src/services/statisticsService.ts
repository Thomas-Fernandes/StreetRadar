/**
 * statisticsService.ts
 * 
 * Service for calculating and managing coverage statistics from the data.
 * This service processes the coverage_stats.json file to provide aggregated metrics.
 */

// Interface for coverage data structure
export interface CoverageStatsEntry {
  month: number;
  year: number;
  country: string;
  continent: string;
  km_traces: number;
  trace_count: number;
  panorama_count: number;
}

// Interface for calculated statistics
export interface CoverageStatistics {
  totalKilometers: number;
  totalPanoramaCount: number;
  totalTraceCount: number;
  providerBreakdown: {
    [provider: string]: {
      kilometers: number;
      panoramaCount: number;
    };
  };
  countryBreakdown: {
    [country: string]: {
      kilometers: number;
      panoramaCount: number;
    };
  };
  continentBreakdown: {
    [continent: string]: {
      kilometers: number;
      panoramaCount: number;
    };
  };
  yearBreakdown: {
    [year: string]: {
      kilometers: number;
      panoramaCount: number;
    };
  };
}

export class StatisticsService {
  private static coverageData: CoverageStatsEntry[] | null = null;
  private static cachedStatistics: CoverageStatistics | null = null;

  /**
   * Loads coverage data from the JSON file
   */
  static async loadCoverageData(): Promise<CoverageStatsEntry[]> {
    if (this.coverageData) {
      return this.coverageData;
    }

    try {
      const response = await fetch('/data/coverage_stats.json');
      if (!response.ok) {
        throw new Error(`Failed to load coverage data: ${response.status}`);
      }
      
      this.coverageData = await response.json();
      if (!this.coverageData) {
        throw new Error('Coverage data is null');
      }
      return this.coverageData;
    } catch (error) {
      console.error('Error loading coverage data:', error);
      throw error;
    }
  }

  /**
   * Calculates comprehensive statistics from the coverage data
   */
  static async calculateStatistics(): Promise<CoverageStatistics> {
    if (this.cachedStatistics) {
      return this.cachedStatistics;
    }

         const data = await this.loadCoverageData();
     if (!data) {
       throw new Error('Failed to load coverage data');
     }
    
    const statistics: CoverageStatistics = {
      totalKilometers: 0,
      totalPanoramaCount: 0,
      totalTraceCount: 0,
      providerBreakdown: {},
      countryBreakdown: {},
      continentBreakdown: {},
      yearBreakdown: {}
    };

    // Process each entry in the coverage data
    data.forEach(entry => {
      // Add to totals
      statistics.totalKilometers += entry.km_traces;
      statistics.totalPanoramaCount += entry.panorama_count;
      statistics.totalTraceCount += entry.trace_count;

      // Country breakdown
      if (!statistics.countryBreakdown[entry.country]) {
        statistics.countryBreakdown[entry.country] = {
          kilometers: 0,
          panoramaCount: 0
        };
      }
      statistics.countryBreakdown[entry.country].kilometers += entry.km_traces;
      statistics.countryBreakdown[entry.country].panoramaCount += entry.panorama_count;

      // Continent breakdown
      if (!statistics.continentBreakdown[entry.continent]) {
        statistics.continentBreakdown[entry.continent] = {
          kilometers: 0,
          panoramaCount: 0
        };
      }
      statistics.continentBreakdown[entry.continent].kilometers += entry.km_traces;
      statistics.continentBreakdown[entry.continent].panoramaCount += entry.panorama_count;

      // Year breakdown
      const year = entry.year.toString();
      if (!statistics.yearBreakdown[year]) {
        statistics.yearBreakdown[year] = {
          kilometers: 0,
          panoramaCount: 0
        };
      }
      statistics.yearBreakdown[year].kilometers += entry.km_traces;
      statistics.yearBreakdown[year].panoramaCount += entry.panorama_count;
    });

    // Current data is Apple-only. Other providers will be added in the future.
    statistics.providerBreakdown = {
      'Apple': {
        kilometers: statistics.totalKilometers, // All current data is Apple
        panoramaCount: statistics.totalPanoramaCount
      },
      'Google': {
        kilometers: 0, // Coming soon
        panoramaCount: 0
      },
      'Bing': {
        kilometers: 0, // Coming soon
        panoramaCount: 0
      },
      'Yandex': {
        kilometers: 0, // Coming soon
        panoramaCount: 0
      }
    };

    this.cachedStatistics = statistics;
    return statistics;
  }

  /**
   * Gets total kilometers with proper formatting
   */
  static async getTotalKilometers(): Promise<string> {
    const stats = await this.calculateStatistics();
    return this.formatNumber(stats.totalKilometers);
  }

  /**
   * Gets total panorama count with proper formatting
   */
  static async getTotalPanoramaCount(): Promise<string> {
    const stats = await this.calculateStatistics();
    return this.formatNumber(stats.totalPanoramaCount);
  }

  /**
   * Gets provider breakdown for the statistics panel
   */
  static async getProviderBreakdown(): Promise<{ [provider: string]: { kilometers: string; panoramaCount: string } }> {
    const stats = await this.calculateStatistics();
    const formattedBreakdown: { [provider: string]: { kilometers: string; panoramaCount: string } } = {};

    Object.entries(stats.providerBreakdown).forEach(([provider, data]) => {
      if (data.kilometers === 0 && data.panoramaCount === 0) {
        // Show "Coming Soon" for providers with no data
        formattedBreakdown[provider] = {
          kilometers: 'Coming Soon',
          panoramaCount: 'Coming Soon'
        };
      } else {
        // Show actual formatted numbers for providers with data
        formattedBreakdown[provider] = {
          kilometers: this.formatNumber(data.kilometers),
          panoramaCount: this.formatNumber(data.panoramaCount)
        };
      }
    });

    return formattedBreakdown;
  }

  /**
   * Formats numbers with spaces as thousand separators
   */
  private static formatNumber(num: number): string {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /**
   * Clears the cache to force recalculation on next request
   */
  static clearCache(): void {
    this.cachedStatistics = null;
    this.coverageData = null;
  }
} 
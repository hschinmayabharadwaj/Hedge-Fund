import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from session storage or wherever you store it
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Market Data API
export const marketAPI = {
  // Get single stock quote
  getQuote: async (symbol) => {
    try {
      const response = await apiClient.get(`/api/v1/market/quote/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  },

  // Get multiple quotes
  getMultipleQuotes: async (symbols) => {
    try {
      const symbolsString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await apiClient.get('/api/v1/market/quotes', {
        params: { symbols: symbolsString }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  },

  // Get historical data
  getHistoricalData: async (symbol, period = '1y', interval = '1d') => {
    try {
      const response = await apiClient.get(`/api/v1/market/historical/${symbol}`, {
        params: { period, interval }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  },

  // Get portfolio summary
  getPortfolioSummary: async (positions) => {
    try {
      const response = await apiClient.post('/api/v1/market/portfolio/summary', {
        positions
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  // Get market indices
  getMarketIndices: async () => {
    try {
      const response = await apiClient.get('/api/v1/market/indices');
      return response.data;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  },

  // Get sector performance
  getSectorPerformance: async () => {
    try {
      const response = await apiClient.get('/api/v1/market/sectors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  },

  // Get trending stocks
  getTrendingStocks: async (limit = 10) => {
    try {
      const response = await apiClient.get('/api/v1/market/trending', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await apiClient.get('/api/v1/market/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },

  // Get dashboard KPIs
  getDashboardKPIs: async () => {
    try {
      const response = await apiClient.get('/api/v1/market/dashboard/kpis');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  },
};

// Sample portfolio positions for demo
export const SAMPLE_PORTFOLIO = [
  { symbol: 'AAPL', shares: 100, avg_cost: 150.00 },
  { symbol: 'MSFT', shares: 50, avg_cost: 300.00 },
  { symbol: 'GOOGL', shares: 30, avg_cost: 2500.00 },
  { symbol: 'TSLA', shares: 20, avg_cost: 200.00 },
  { symbol: 'NVDA', shares: 40, avg_cost: 400.00 },
];

// Helper function to format currency
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Helper function to format percentage
export const formatPercent = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Helper function to format large numbers
export const formatNumber = (value) => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

export default apiClient;

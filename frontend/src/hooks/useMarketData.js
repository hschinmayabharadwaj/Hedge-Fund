"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for fetching and refreshing data at intervals
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 60000 = 1 minute)
 * @param {boolean} enabled - Whether auto-refresh is enabled
 * @param {Array} dependencies - Dependencies to trigger re-fetch
 */
export const useMarketData = (
  fetchFunction,
  refreshInterval = 60000,
  enabled = true,
  dependencies = []
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  }, [fetchFunction]);

  // Initial fetch and setup interval
  useEffect(() => {
    if (!enabled) return;

    // Fetch immediately
    fetchData();

    // Setup interval for auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval, enabled, ...dependencies]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  };
};

/**
 * Hook for managing multiple market data streams
 */
export const useMultipleMarketData = (configs = []) => {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = {};
      const errs = {};

      await Promise.allSettled(
        configs.map(async ({ key, fetchFunction }) => {
          try {
            const data = await fetchFunction();
            results[key] = data;
          } catch (error) {
            errs[key] = error.message;
          }
        })
      );

      setAllData(results);
      setErrors(errs);
      setLoading(false);
    };

    fetchAll();
  }, [configs.length]);

  return { allData, loading, errors };
};

/**
 * Hook for WebSocket real-time updates (future implementation)
 */
export const useWebSocketMarketData = (symbols = []) => {
  const [quotes, setQuotes] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // WebSocket implementation would go here
    // For now, we'll use polling with useMarketData hook
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbols]);

  return { quotes, connected };
};

/**
 * Hook to detect if data is stale
 */
export const useDataFreshness = (lastUpdated, maxAge = 120000) => {
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!lastUpdated) return;

    const checkFreshness = () => {
      const age = Date.now() - new Date(lastUpdated).getTime();
      setIsStale(age > maxAge);
    };

    checkFreshness();
    const interval = setInterval(checkFreshness, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastUpdated, maxAge]);

  return isStale;
};

export default useMarketData;

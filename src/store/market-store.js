"use client";

import { create } from "zustand";

export const useMarketStore = create((set, get) => ({
  marketData: {},
  predictions: {},
  portfolio: null,
  loading: false,
  error: null,
  wsConnected: false,

  setMarketData: (symbol, data) =>
    set((state) => ({
      marketData: { ...state.marketData, [symbol]: data },
    })),

  setPredictions: (agentId, prediction) =>
    set((state) => ({
      predictions: { ...state.predictions, [agentId]: prediction },
    })),

  setPortfolio: (portfolio) => set({ portfolio }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  fetchMarketData: async (symbol) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/market?symbol=${symbol}`);
      const data = await res.json();
      set((state) => ({
        marketData: { ...state.marketData, [symbol]: data },
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPortfolio: async () => {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      set({ portfolio: data });
    } catch (err) {
      set({ error: err.message });
    }
  },
}));

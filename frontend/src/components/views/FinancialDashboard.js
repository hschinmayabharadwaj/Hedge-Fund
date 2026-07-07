"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { KPIWidget, MiniKPIWidget } from '@/components/widgets/KPIWidget';
import { AreaChartWidget, PieChartWidget } from '@/components/widgets/ChartWidgets';
import { Icon } from '@/components/ui/Icon';
import { marketAPI, SAMPLE_PORTFOLIO, formatCurrency, formatPercent } from '@/services/marketApi';
import useMarketData from '@/hooks/useMarketData';
import { format } from 'date-fns';

export default function FinancialDashboard() {
  const [timeframe, setTimeframe] = useState('1M');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard KPIs
  const {
    data: kpiData,
    loading: kpiLoading,
    lastUpdated: kpiLastUpdated,
    refresh: refreshKPIs
  } = useMarketData(
    useCallback(() => marketAPI.getDashboardKPIs(), []),
    60000, // Refresh every minute
    true
  );

  // Fetch portfolio data
  const {
    data: portfolioData,
    loading: portfolioLoading,
    refresh: refreshPortfolio
  } = useMarketData(
    useCallback(() => marketAPI.getPortfolioSummary(SAMPLE_PORTFOLIO), []),
    60000,
    true
  );

  // Fetch sector performance
  const {
    data: sectorData,
    loading: sectorLoading,
  } = useMarketData(
    useCallback(() => marketAPI.getSectorPerformance(), []),
    300000 // Refresh every 5 minutes
  );

  // Fetch market indices
  const {
    data: indicesData,
    loading: indicesLoading,
  } = useMarketData(
    useCallback(() => marketAPI.getMarketIndices(), []),
    60000
  );

  // Fetch historical data for chart
  const {
    data: chartData,
    loading: chartLoading,
  } = useMarketData(
    useCallback(() => marketAPI.getHistoricalData('AAPL', timeframe, '1d'), [timeframe]),
    0, // Only fetch on timeframe change
    true,
    [timeframe]
  );

  // Manual refresh all
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshKPIs(),
      refreshPortfolio(),
    ]);
    setRefreshing(false);
  };

  // Prepare sector chart data
  const sectorChartData = sectorData?.sectors?.map(s => ({
    name: s.name,
    value: Math.abs(s.change_percent)
  })) || [];

  // Prepare portfolio positions for display
  const portfolioPositions = portfolioData?.positions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-headline-lg font-bold text-gradient-primary mb-2">
            Financial Dashboard
          </h1>
          <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-glow" />
              <span>Live Market Data</span>
            </div>
            {kpiLastUpdated && (
              <>
                <span>•</span>
                <span>Updated {format(kpiLastUpdated, 'HH:mm:ss')}</span>
              </>
            )}
          </div>
        </div>
        <motion.button
          onClick={handleRefreshAll}
          disabled={refreshing}
          className="glass-surface px-4 py-2 rounded-xl flex items-center gap-2 hover-lift disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon 
            name="refresh" 
            size={18} 
            className={refreshing ? 'animate-spin' : ''}
          />
          <span className="text-label-md">Refresh</span>
        </motion.button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <KPIWidget
          title="Total Portfolio Value"
          value={portfolioData?.total_value || 0}
          change={portfolioData?.total_day_change}
          changePercent={portfolioData?.total_day_change_percent}
          icon="wallet"
          loading={portfolioLoading}
          insight={false}
        />
        <KPIWidget
          title="Daily P&L"
          value={portfolioData?.total_day_change || 0}
          changePercent={portfolioData?.total_day_change_percent}
          icon="trending-up"
          loading={portfolioLoading}
          trend={portfolioData?.total_day_change >= 0 ? 'up' : 'down'}
        />
        <KPIWidget
          title="Total Return"
          value={portfolioData?.total_pl || 0}
          changePercent={portfolioData?.total_pl_percent}
          icon="activity"
          loading={portfolioLoading}
          trend={portfolioData?.total_pl >= 0 ? 'up' : 'down'}
          insight={true}
        />
        <KPIWidget
          title="Portfolio Positions"
          value={portfolioPositions.length}
          icon="briefcase"
          loading={portfolioLoading}
          prefix=""
          suffix=" Assets"
          decimals={0}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <AreaChartWidget
            title="Portfolio Performance"
            data={chartData || []}
            loading={chartLoading}
            showTimeframe={true}
            timeframes={['1D', '1W', '1M', '3M', '6M', '1Y']}
            onTimeframeChange={setTimeframe}
            height={350}
          />
        </div>

        {/* Sector Allocation */}
        <div>
          <PieChartWidget
            title="Sector Allocation"
            data={sectorChartData}
            loading={sectorLoading}
            height={350}
          />
        </div>
      </div>

      {/* Market Indices */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Icon name="activity" size={20} className="text-primary" />
          <h3 className="text-title-md font-semibold text-on-surface">Market Indices</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicesLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-high animate-pulse rounded-xl" />
              ))}
            </>
          ) : (
            indicesData?.indices && Object.entries(indicesData.indices).map(([name, data]) => (
              <MiniKPIWidget
                key={name}
                label={name}
                value={formatCurrency(data.price)}
                icon="line-chart"
                trend={data.change >= 0 ? 'up' : 'down'}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Holdings Table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="briefcase" size={20} className="text-primary" />
              <h3 className="text-title-md font-semibold text-on-surface">Portfolio Holdings</h3>
            </div>
            <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-medium text-label-sm">
              {portfolioPositions.length} Positions
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant/30">
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-left">Symbol</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Shares</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Avg Cost</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Current Price</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Market Value</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Total P&L</th>
                <th className="text-label-md text-on-surface-variant font-semibold py-4 px-6 text-right">Day Change</th>
              </tr>
            </thead>
            <tbody>
              {portfolioLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/20">
                      <td colSpan={7} className="py-4 px-6">
                        <div className="h-8 bg-surface-container-high animate-pulse rounded" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                portfolioPositions.map((position, i) => (
                  <motion.tr
                    key={position.symbol}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-low/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-title-sm">{position.symbol}</span>
                        {position.unrealized_pl >= 0 && (
                          <motion.span 
                            className="w-1.5 h-1.5 rounded-full bg-secondary"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-data-mono-md">{position.shares}</td>
                    <td className="py-4 px-6 text-right font-data-mono-md">{formatCurrency(position.avg_cost)}</td>
                    <td className="py-4 px-6 text-right font-data-mono-md">{formatCurrency(position.current_price)}</td>
                    <td className="py-4 px-6 text-right font-data-mono-md font-bold">{formatCurrency(position.market_value)}</td>
                    <td className={`py-4 px-6 text-right font-data-mono-md font-bold ${position.unrealized_pl >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                      {formatCurrency(position.unrealized_pl)} ({formatPercent(position.unrealized_pl_percent)})
                    </td>
                    <td className={`py-4 px-6 text-right font-data-mono-md ${position.day_change >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                      <div className="flex items-center justify-end gap-1">
                        <Icon 
                          name={position.day_change >= 0 ? 'trending-up' : 'trending-down'} 
                          size={14} 
                        />
                        {formatCurrency(Math.abs(position.day_change))}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Sector Performance Table */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Icon name="layers" size={20} className="text-primary" />
          <h3 className="text-title-md font-semibold text-on-surface">Sector Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectorLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-container-high animate-pulse rounded-xl" />
              ))}
            </>
          ) : (
            sectorData?.sectors?.slice(0, 9).map((sector, i) => (
              <motion.div
                key={sector.name}
                className="glass-surface p-4 rounded-xl hover-lift"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-body-sm text-on-surface-variant">{sector.name}</p>
                    <p className="text-title-sm font-bold text-on-surface">{sector.symbol}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-title-sm font-bold flex items-center gap-1 ${sector.change_percent >= 0 ? 'text-secondary' : 'text-tertiary'}`}>
                      <Icon name={sector.change_percent >= 0 ? 'trending-up' : 'trending-down'} size={16} />
                      {formatPercent(sector.change_percent)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

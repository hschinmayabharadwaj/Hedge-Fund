"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { TimeframeToggle } from '../ui/Card';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const AreaChartWidget = ({
  title,
  data = [],
  height = 300,
  showTimeframe = true,
  timeframes = ['1D', '1W', '1M', '3M', '1Y'],
  onTimeframeChange,
  loading = false,
  className = ''
}) => {
  const [timeframe, setTimeframe] = useState('1M');

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  const series = [{
    name: 'Value',
    data: data.map(d => ({
      x: d.date || d.x,
      y: d.value || d.close || d.y
    }))
  }];

  const options = {
    chart: {
      type: 'area',
      height: height,
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: 'transparent',
      foreColor: '#94A3B8'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#22C55E']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#22C55E',
            opacity: 0.4
          },
          {
            offset: 100,
            color: '#22C55E',
            opacity: 0.05
          }
        ]
      }
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace'
        }
      },
      axisBorder: {
        color: '#334155'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace'
        },
        formatter: (value) => {
          return '$' + value.toFixed(2);
        }
      }
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace'
      },
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => {
          return '$' + value.toFixed(2);
        }
      }
    },
    theme: {
      mode: 'dark'
    }
  };

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Icon name="line-chart" size={20} className="text-primary" />
          <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        </div>
        {showTimeframe && (
          <TimeframeToggle
            options={timeframes}
            value={timeframe}
            onChange={handleTimeframeChange}
          />
        )}
      </div>

      {loading ? (
        <div className="w-full animate-pulse bg-surface-container-high rounded" style={{ height: `${height}px` }} />
      ) : (
        <Chart
          options={options}
          series={series}
          type="area"
          height={height}
        />
      )}
    </motion.div>
  );
};

export const CandlestickChartWidget = ({
  title,
  data = [],
  height = 400,
  loading = false,
  className = ''
}) => {
  const series = [{
    name: 'Price',
    data: data.map(d => ({
      x: new Date(d.date),
      y: [d.open, d.high, d.low, d.close]
    }))
  }];

  const options = {
    chart: {
      type: 'candlestick',
      height: height,
      background: 'transparent',
      foreColor: '#94A3B8',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22C55E',
          downward: '#EF4444'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '11px'
        },
        formatter: (value) => '$' + value.toFixed(2)
      }
    },
    grid: {
      borderColor: '#334155'
    },
    tooltip: {
      theme: 'dark'
    },
    theme: {
      mode: 'dark'
    }
  };

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon name="bar-chart" size={20} className="text-primary" />
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
      </div>

      {loading ? (
        <div className="w-full animate-pulse bg-surface-container-high rounded" style={{ height: `${height}px` }} />
      ) : (
        <Chart
          options={options}
          series={series}
          type="candlestick"
          height={height}
        />
      )}
    </motion.div>
  );
};

export const PieChartWidget = ({
  title,
  data = [],
  height = 350,
  loading = false,
  className = ''
}) => {
  const series = data.map(d => d.value || d.percentage);
  const labels = data.map(d => d.name || d.label);

  const options = {
    chart: {
      type: 'pie',
      height: height,
      background: 'transparent'
    },
    labels: labels,
    colors: ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#06B6D4', '#EC4899'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#F8FAFC',
        useSeriesColors: false
      },
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600
      },
      formatter: (val) => {
        return val.toFixed(1) + '%';
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#1E293B']
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value) => value.toFixed(2) + '%'
      }
    },
    theme: {
      mode: 'dark'
    }
  };

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon name="pie-chart" size={20} className="text-primary" />
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
      </div>

      {loading ? (
        <div className="w-full animate-pulse bg-surface-container-high rounded" style={{ height: `${height}px` }} />
      ) : (
        <Chart
          options={options}
          series={series}
          type="pie"
          height={height}
        />
      )}
    </motion.div>
  );
};

"use client";

import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { formatCurrency, formatPercent } from '@/services/marketApi';
import CountUp from 'react-countup';

export const KPIWidget = ({ 
  title, 
  value, 
  change, 
  changePercent,
  icon, 
  trend = 'neutral',
  loading = false,
  prefix = '$',
  suffix = '',
  decimals = 2,
  insight,
  className = ''
}) => {
  const isPositive = trend === 'up' || (changePercent !== undefined && changePercent > 0);
  const isNegative = trend === 'down' || (changePercent !== undefined && changePercent < 0);

  const trendColor = isPositive 
    ? 'text-secondary' 
    : isNegative 
    ? 'text-tertiary' 
    : 'text-on-surface-variant';

  const bgGradient = isPositive
    ? 'from-secondary/10 to-secondary/5'
    : isNegative
    ? 'from-tertiary/10 to-tertiary/5'
    : 'from-primary/10 to-primary/5';

  return (
    <motion.div
      className={`glass-card gradient-border p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {insight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple to-transparent opacity-60" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {insight && <Icon name="zap" size={14} className="text-accent-purple" />}
          <span className="text-label-md text-on-surface-variant uppercase tracking-wide">
            {title}
          </span>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${bgGradient}`}>
          <Icon name={icon} size={20} className={trendColor} />
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="h-10 bg-surface-container-high animate-pulse rounded" />
        ) : (
          <div className="font-data-mono-lg font-bold text-on-surface text-3xl">
            {prefix}
            <CountUp
              end={typeof value === 'number' ? value : 0}
              decimals={decimals}
              duration={1.5}
              separator=","
            />
            {suffix}
          </div>
        )}

        {(change !== undefined || changePercent !== undefined) && (
          <div className={`flex items-center gap-2 font-data-mono-md ${trendColor}`}>
            <Icon 
              name={isPositive ? 'trending-up' : isNegative ? 'trending-down' : 'minus'} 
              size={16} 
            />
            <span>
              {change !== undefined && (
                <span>{formatCurrency(Math.abs(change))} </span>
              )}
              {changePercent !== undefined && (
                <span>({formatPercent(changePercent)})</span>
              )}
            </span>
          </div>
        )}

        {insight && (
          <div className="text-body-xs text-accent-purple mt-2 flex items-center gap-1">
            <Icon name="info" size={12} />
            <span>AI Insight Available</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MiniKPIWidget = ({
  label,
  value,
  icon,
  trend,
  loading = false
}) => {
  return (
    <motion.div
      className="flex items-center justify-between p-4 glass-surface rounded-xl hover-lift"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-surface-container-high">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">{label}</p>
          {loading ? (
            <div className="h-6 w-20 bg-surface-container-high animate-pulse rounded mt-1" />
          ) : (
            <p className="text-title-md font-bold text-on-surface">{value}</p>
          )}
        </div>
      </div>
      {trend && (
        <Icon 
          name={trend === 'up' ? 'trending-up' : 'trending-down'} 
          size={20}
          className={trend === 'up' ? 'text-secondary' : 'text-tertiary'}
        />
      )}
    </motion.div>
  );
};

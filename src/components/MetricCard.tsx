'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: boolean;
  format?: 'currency' | 'percent' | 'number' | 'text';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function MetricCard({ 
  label, 
  value, 
  subtext, 
  trend, 
  alert = false,
  format = 'currency',
  size = 'medium',
  className = ''
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return val.toLocaleString('en-GB', {
          style: 'currency',
          currency: 'GBP',
          maximumFractionDigits: 0,
        });
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'number':
        return val.toLocaleString('en-GB');
      default:
        return String(val);
    }
  };

  const sizeClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6',
  };

  const valueClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div 
      className={`
        bg-[#111111] border rounded-xl transition-all duration-300
        hover:border-[#333333] hover:bg-[#151515]
        ${alert ? 'border-[#C94A4A]/30 bg-[#C94A4A]/5' : 'border-[#262626]'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#737373] font-medium">
          {label}
        </p>
        {trend && (
          <TrendIcon 
            size={14} 
            className={`
              ${trend === 'up' ? 'text-[#4A9C6D]' : ''}
              ${trend === 'down' ? 'text-[#C94A4A]' : ''}
              ${trend === 'neutral' ? 'text-[#737373]' : ''}
            `}
          />
        )}
      </div>
      
      <p 
        className={`
          font-light tracking-tight font-tabular
          ${valueClasses[size]}
          ${alert ? 'text-[#C94A4A]' : 'text-[#F8F7F5]'}
        `}
      >
        {formatValue(value)}
      </p>
      
      {subtext && (
        <p className="text-sm text-[#737373] mt-2">{subtext}</p>
      )}
    </div>
  );
}


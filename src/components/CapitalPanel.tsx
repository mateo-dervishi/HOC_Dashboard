'use client';

import { CapitalData } from '@/lib/types';
import { MetricCard } from './MetricCard';
import { Wallet, TrendingDown, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface CapitalPanelProps {
  data: CapitalData;
}

export function CapitalPanel({ data }: CapitalPanelProps) {
  const runwayColor = data.runwayMonths > 6 ? '#4A9C6D' : data.runwayMonths > 3 ? '#D4A84B' : '#C94A4A';
  const runwayLabel = data.runwayMonths > 6 ? 'Healthy' : data.runwayMonths > 3 ? 'Caution' : 'Critical';
  const capitalRemainingAlert = (data.remaining / data.totalRaised) < 0.2;

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase flex items-center gap-2">
          <Wallet size={14} className="text-[#C9A962]" />
          Capital & Cash Position
        </h2>
      </div>

      {/* Primary Metric - Total Raised */}
      <div className="mb-6 pb-6 border-b border-[#1F1F1F]">
        <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1">Total Capital Raised</p>
        <p className="text-4xl font-light text-[#F8F7F5] font-tabular tracking-tight">
          {data.totalRaised.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Deployment Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#A3A3A3]">Capital Deployed</span>
          <span className="text-sm text-[#F8F7F5] font-tabular">
            {data.deployed.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            <span className="text-[#525252] ml-2">({data.deployedPercent.toFixed(0)}%)</span>
          </span>
        </div>
        <div className="h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#C9A962] to-[#A68B4B] rounded-full transition-all duration-500"
            style={{ width: `${data.deployedPercent}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${capitalRemainingAlert ? 'bg-[#C94A4A]/5 border-[#C94A4A]/20' : 'bg-[#0A0A0A] border-[#1F1F1F]'}`}>
          <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1">Capital Remaining</p>
          <p className={`text-xl font-light font-tabular ${capitalRemainingAlert ? 'text-[#C94A4A]' : 'text-[#F8F7F5]'}`}>
            {data.remaining.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
          {capitalRemainingAlert && (
            <p className="text-[10px] text-[#C94A4A] mt-1 flex items-center gap-1">
              <AlertTriangle size={10} />
              Below 20% threshold
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <TrendingDown size={10} />
            Monthly Burn Rate
          </p>
          <p className="text-xl font-light text-[#F8F7F5] font-tabular">
            {data.burnRate.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Runway Indicator */}
      <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
              <Clock size={10} />
              Runway
            </p>
            <p className="text-2xl font-light text-[#F8F7F5] font-tabular">
              {data.runwayMonths} <span className="text-sm text-[#525252]">months</span>
            </p>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${runwayColor}15`,
              color: runwayColor,
              border: `1px solid ${runwayColor}30`
            }}
          >
            {runwayLabel}
          </div>
        </div>
        
        {/* Runway visual */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: i < data.runwayMonths ? runwayColor : '#1F1F1F',
                opacity: i < data.runwayMonths ? 1 : 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Next Major Expense */}
      <div className="p-4 rounded-lg bg-[#C9A962]/5 border border-[#C9A962]/20">
        <p className="text-[10px] uppercase tracking-wider text-[#C9A962] mb-2 flex items-center gap-1">
          <ArrowRight size={10} />
          Next Major Expense
        </p>
        <p className="text-sm text-[#F8F7F5] mb-1">{data.nextMajorExpense.description}</p>
        <p className="text-lg font-light text-[#C9A962] font-tabular">
          {data.nextMajorExpense.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}


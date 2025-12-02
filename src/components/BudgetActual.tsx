'use client';

import { BudgetData } from '@/lib/types';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface BudgetActualProps {
  data: BudgetData;
}

export function BudgetActual({ data }: BudgetActualProps) {
  const chartData = data.byCategory.map(cat => ({
    category: cat.category.length > 12 ? cat.category.substring(0, 12) + '...' : cat.category,
    fullCategory: cat.category,
    Budget: cat.budgeted,
    Actual: cat.actual,
    Forecast: cat.forecast,
    variance: cat.variance,
    variancePercent: cat.variancePercent,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isUnder = item.variance >= 0;
      
      return (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-[#F8F7F5] mb-2">{item.fullCategory}</p>
          <div className="space-y-1 text-xs">
            <p className="text-[#5B8DEF]">
              Budget: {item.Budget.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            </p>
            <p className="text-[#C9A962]">
              Actual: {item.Actual.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            </p>
            <p className="text-[#737373]">
              Forecast: {item.Forecast.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            </p>
            <p className={`mt-2 pt-2 border-t border-[#333333] ${isUnder ? 'text-[#4A9C6D]' : 'text-[#C94A4A]'}`}>
              Variance: {item.variance.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })} ({item.variancePercent.toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-3">
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase mb-6 flex items-center gap-2">
        <PieChart size={14} className="text-[#C9A962]" />
        Budget vs Actual
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Budgeted</p>
          <p className="text-lg font-light text-[#5B8DEF] font-tabular">
            {data.budgetedTotal.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Actual Spend</p>
          <p className="text-lg font-light text-[#C9A962] font-tabular">
            {data.actualSpend.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Forecast</p>
          <p className="text-lg font-light text-[#737373] font-tabular">
            {data.forecast.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className={`p-3 rounded-lg border ${data.variance >= 0 ? 'bg-[#4A9C6D]/5 border-[#4A9C6D]/20' : 'bg-[#C94A4A]/5 border-[#C94A4A]/20'}`}>
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            {data.variance >= 0 ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
            Variance
          </p>
          <p className={`text-lg font-light font-tabular ${data.variance >= 0 ? 'text-[#4A9C6D]' : 'text-[#C94A4A]'}`}>
            {data.variance >= 0 ? '+' : ''}{data.variance.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            <span className="text-xs ml-1">({data.variancePercent.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            barGap={2}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
            <XAxis 
              dataKey="category" 
              tick={{ fill: '#525252', fontSize: 10 }}
              axisLine={{ stroke: '#1F1F1F' }}
              tickLine={{ stroke: '#1F1F1F' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#525252', fontSize: 10 }}
              axisLine={{ stroke: '#1F1F1F' }}
              tickLine={{ stroke: '#1F1F1F' }}
              tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}
              iconType="square"
              iconSize={8}
            />
            <Bar dataKey="Budget" fill="#5B8DEF" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Actual" fill="#C9A962" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Forecast" fill="#525252" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6 pt-6 border-t border-[#1F1F1F]">
        <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-3">Variance by Category</p>
        <div className="space-y-2">
          {data.byCategory.map((cat, idx) => {
            const isPositive = cat.variance >= 0;
            return (
              <div key={idx} className="flex items-center justify-between py-2 hover:bg-[#0A0A0A] px-2 rounded transition-colors">
                <span className="text-xs text-[#A3A3A3]">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-tabular ${isPositive ? 'text-[#4A9C6D]' : 'text-[#C94A4A]'}`}>
                    {isPositive ? '+' : ''}{cat.variance.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
                  </span>
                  <span className={`text-[10px] font-tabular ${isPositive ? 'text-[#4A9C6D]' : 'text-[#C94A4A]'}`}>
                    {isPositive ? '↓' : '↑'} {Math.abs(cat.variancePercent).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


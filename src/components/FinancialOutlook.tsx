'use client';

import { FinancialData } from '@/lib/types';
import { TrendingUp, Target, Calendar, Percent, Building, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface FinancialOutlookProps {
  data: FinancialData;
}

export function FinancialOutlook({ data }: FinancialOutlookProps) {
  const chartData = data.revenueProjections.map((proj, idx) => ({
    month: proj.month.replace('Month ', 'M'),
    fullMonth: proj.month,
    revenue: proj.revenue,
    isBreakEven: proj.isBreakEven,
  }));

  const breakEvenIndex = chartData.findIndex(d => d.isBreakEven);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-[#F8F7F5] mb-1">{item.fullMonth}</p>
          <p className="text-[#C9A962]">
            {item.revenue.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
          {item.isBreakEven && (
            <p className="text-[10px] text-[#4A9C6D] mt-1 flex items-center gap-1">
              <Target size={10} />
              Break-even point
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-5">
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase mb-6 flex items-center gap-2">
        <TrendingUp size={14} className="text-[#C9A962]" />
        Financial Outlook
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <Calendar size={9} />
            Month 1 Target
          </p>
          <p className="text-lg font-light text-[#F8F7F5] font-tabular">
            {data.month1Target.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <Target size={9} />
            Year 1 Projection
          </p>
          <p className="text-lg font-light text-[#C9A962] font-tabular">
            {data.year1Target.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#4A9C6D]/5 border border-[#4A9C6D]/20">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Break-even</p>
          <p className="text-lg font-light text-[#4A9C6D] font-tabular">
            {data.breakEvenMonth}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <Percent size={9} />
            Target Margin
          </p>
          <p className="text-lg font-light text-[#F8F7F5] font-tabular">
            {data.grossMarginTarget}%
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="h-[200px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C9A962" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#525252', fontSize: 10 }}
              axisLine={{ stroke: '#1F1F1F' }}
              tickLine={{ stroke: '#1F1F1F' }}
            />
            <YAxis 
              tick={{ fill: '#525252', fontSize: 10 }}
              axisLine={{ stroke: '#1F1F1F' }}
              tickLine={{ stroke: '#1F1F1F' }}
              tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333333', strokeDasharray: '5 5' }} />
            
            {/* Break-even reference line */}
            {breakEvenIndex >= 0 && (
              <ReferenceLine 
                x={chartData[breakEvenIndex].month} 
                stroke="#4A9C6D" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'Break-even', 
                  position: 'top',
                  fill: '#4A9C6D',
                  fontSize: 10
                }}
              />
            )}
            
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#C9A962" 
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.isBreakEven) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={6} 
                      fill="#4A9C6D" 
                      stroke="#0A0A0A"
                      strokeWidth={2}
                    />
                  );
                }
                return <circle cx={cx} cy={cy} r={3} fill="#C9A962" />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* B2B vs B2C Split */}
      {data.b2bSplit && data.b2cSplit && (
        <div className="pt-4 border-t border-[#1F1F1F]">
          <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-3">Revenue Split Target</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                  <Building size={10} />
                  B2B
                </span>
                <span className="text-xs text-[#F8F7F5] font-tabular">{data.b2bSplit}%</span>
              </div>
              <div className="h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5B8DEF] rounded-full"
                  style={{ width: `${data.b2bSplit}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                  <ShoppingCart size={10} />
                  B2C
                </span>
                <span className="text-xs text-[#F8F7F5] font-tabular">{data.b2cSplit}%</span>
              </div>
              <div className="h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C9A962] rounded-full"
                  style={{ width: `${data.b2cSplit}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


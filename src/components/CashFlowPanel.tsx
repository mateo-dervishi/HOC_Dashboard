'use client';

import { useState } from 'react';
import { Wallet, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface MonthlyProjection {
  month: string;
  outgoings: number;
  details: { item: string; amount: number }[];
  closingBalance: number;
}

interface CashFlowPanelProps {
  capitalRaised: number;
  capitalDeployed: number;
  projections: MonthlyProjection[];
  burnRate: number;
}

export function CashFlowPanel({ capitalRaised, capitalDeployed, projections, burnRate }: CashFlowPanelProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  
  const remaining = capitalRaised - capitalDeployed;
  const runwayMonths = burnRate > 0 ? Math.floor(remaining / burnRate) : 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-GB', { 
      style: 'currency', 
      currency: 'GBP', 
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in">
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase mb-6 flex items-center gap-2">
        <Wallet size={14} className="text-[#C9A962]" />
        Cash Flow & Monthly Outgoings
      </h2>

      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Capital Raised</p>
          <p className="text-lg font-light text-[#C9A962] font-tabular">{formatCurrency(capitalRaised)}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Deployed</p>
          <p className="text-lg font-light text-[#F8F7F5] font-tabular">{formatCurrency(capitalDeployed)}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1">Remaining</p>
          <p className="text-lg font-light text-[#4A9C6D] font-tabular">{formatCurrency(remaining)}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <TrendingDown size={9} />
            Est. Monthly Burn
          </p>
          <p className="text-lg font-light text-[#D4A84B] font-tabular">{formatCurrency(burnRate)}</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-3 flex items-center gap-2">
          <Calendar size={10} />
          Monthly Projections
        </p>
        
        {projections.map((proj, idx) => {
          const isExpanded = expandedMonth === proj.month;
          const isFirstMajorPayment = proj.outgoings > 100000;
          
          return (
            <div 
              key={idx}
              className={`
                rounded-lg border transition-all
                ${isFirstMajorPayment ? 'border-[#C9A962]/30 bg-[#C9A962]/5' : 'border-[#1F1F1F] bg-[#0A0A0A]'}
              `}
            >
              <button
                onClick={() => setExpandedMonth(isExpanded ? null : proj.month)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-[#111111] transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#F8F7F5]">{proj.month}</span>
                  {isFirstMajorPayment && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-[#C9A962]/20 text-[#C9A962] uppercase tracking-wider">
                      Major Payment
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#525252]">Outgoings</p>
                    <p className={`text-sm font-tabular ${isFirstMajorPayment ? 'text-[#C9A962]' : 'text-[#C94A4A]'}`}>
                      -{formatCurrency(proj.outgoings)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#525252]">Closing Balance</p>
                    <p className="text-sm font-tabular text-[#4A9C6D]">{formatCurrency(proj.closingBalance)}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-[#525252]" />
                  ) : (
                    <ChevronDown size={14} className="text-[#525252]" />
                  )}
                </div>
              </button>
              
              {isExpanded && proj.details.length > 0 && (
                <div className="px-3 pb-3 border-t border-[#1F1F1F]">
                  <div className="pt-3 space-y-1">
                    {proj.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#111111]">
                        <span className="text-xs text-[#A3A3A3]">{detail.item}</span>
                        <span className="text-xs font-tabular text-[#F8F7F5]">{formatCurrency(detail.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Runway Indicator */}
      <div className="mt-6 p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1">Estimated Runway</p>
            <p className="text-xl font-light text-[#F8F7F5] font-tabular">
              {runwayMonths} <span className="text-sm text-[#525252]">months</span>
            </p>
          </div>
          <div 
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              runwayMonths > 12 ? 'bg-[#4A9C6D]/15 text-[#4A9C6D] border border-[#4A9C6D]/30' :
              runwayMonths > 6 ? 'bg-[#D4A84B]/15 text-[#D4A84B] border border-[#D4A84B]/30' :
              'bg-[#C94A4A]/15 text-[#C94A4A] border border-[#C94A4A]/30'
            }`}
          >
            {runwayMonths > 12 ? 'Healthy' : runwayMonths > 6 ? 'Monitor' : 'Critical'}
          </div>
        </div>
      </div>
    </div>
  );
}


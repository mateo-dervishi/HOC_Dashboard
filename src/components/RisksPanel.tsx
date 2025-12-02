'use client';

import { useState } from 'react';
import { RisksData, Risk } from '@/lib/types';
import { RAGBadge, RAGSummary } from './RAGBadge';
import { AlertTriangle, ChevronDown, ChevronUp, AlertCircle, HelpCircle, User, Shield } from 'lucide-react';

interface RisksPanelProps {
  data: RisksData;
}

function RiskItem({ risk, isExpanded, onToggle }: { risk: Risk; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div 
      className={`
        rounded-lg border transition-all duration-200
        ${risk.status === 'Closed' ? 'opacity-50' : ''}
        ${risk.rag === 'Red' ? 'border-[#C94A4A]/20 bg-[#C94A4A]/5' : 
          risk.rag === 'Amber' ? 'border-[#D4A84B]/20 bg-[#D4A84B]/5' : 
          'border-[#1F1F1F] bg-[#0A0A0A]'}
      `}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <RAGBadge status={risk.rag} size="medium" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[#F8F7F5]">{risk.name}</p>
            {risk.isBlocker && (
              <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-[#C94A4A]/20 text-[#C94A4A] border border-[#C94A4A]/30">
                Blocker
              </span>
            )}
            {risk.isPendingDecision && (
              <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30">
                Decision Required
              </span>
            )}
          </div>
          <p className="text-xs text-[#737373] line-clamp-1">{risk.description}</p>
        </div>
        
        {isExpanded ? (
          <ChevronUp size={16} className="text-[#525252] flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[#525252] flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#1F1F1F] mt-0">
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
                <AlertCircle size={10} />
                Description
              </p>
              <p className="text-sm text-[#A3A3A3]">{risk.description}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
                <Shield size={10} />
                Mitigation
              </p>
              <p className="text-sm text-[#A3A3A3]">{risk.mitigation}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1F1F1F]">
            <div className="flex items-center gap-1">
              <User size={12} className="text-[#525252]" />
              <span className="text-xs text-[#737373]">Owner:</span>
              <span className="text-xs text-[#A3A3A3]">{risk.owner}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded ${risk.status === 'Open' ? 'bg-[#D4A84B]/10 text-[#D4A84B]' : 'bg-[#4A9C6D]/10 text-[#4A9C6D]'}`}>
                {risk.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RisksPanel({ data }: RisksPanelProps) {
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'Red' | 'Amber' | 'Green'>('all');

  const toggleRisk = (id: string) => {
    setExpandedRisks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredRisks = data.items.filter(risk => {
    if (filter === 'all') return risk.status === 'Open';
    return risk.rag === filter && risk.status === 'Open';
  });

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#C9A962]" />
          Risks & Issues
        </h2>
        <RAGSummary red={data.red} amber={data.amber} green={data.green} />
      </div>

      {/* Key Counts */}
      <div className="flex gap-3 mb-6">
        {data.activeBlockers > 0 && (
          <div className="flex-1 p-3 rounded-lg bg-[#C94A4A]/5 border border-[#C94A4A]/20">
            <p className="text-[10px] uppercase tracking-wider text-[#C94A4A] mb-1 flex items-center gap-1">
              <AlertCircle size={10} />
              Active Blockers
            </p>
            <p className="text-2xl font-light text-[#C94A4A] font-tabular">{data.activeBlockers}</p>
          </div>
        )}
        {data.pendingDecisions > 0 && (
          <div className="flex-1 p-3 rounded-lg bg-[#5B8DEF]/5 border border-[#5B8DEF]/20">
            <p className="text-[10px] uppercase tracking-wider text-[#5B8DEF] mb-1 flex items-center gap-1">
              <HelpCircle size={10} />
              Pending Decisions
            </p>
            <p className="text-2xl font-light text-[#5B8DEF] font-tabular">{data.pendingDecisions}</p>
          </div>
        )}
        {data.activeBlockers === 0 && data.pendingDecisions === 0 && (
          <div className="flex-1 p-3 rounded-lg bg-[#4A9C6D]/5 border border-[#4A9C6D]/20">
            <p className="text-[10px] uppercase tracking-wider text-[#4A9C6D] mb-1">Status</p>
            <p className="text-sm text-[#4A9C6D]">No active blockers or pending decisions</p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'Red', 'Amber', 'Green'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === f 
                ? 'bg-[#C9A962] text-[#0A0A0A]' 
                : 'bg-[#1A1A1A] text-[#737373] hover:bg-[#252525] hover:text-[#A3A3A3]'}
            `}
          >
            {f === 'all' ? 'All Open' : f}
            <span className="ml-1.5 opacity-70">
              ({f === 'all' 
                ? data.red + data.amber + data.green 
                : f === 'Red' ? data.red : f === 'Amber' ? data.amber : data.green})
            </span>
          </button>
        ))}
      </div>

      {/* Risk List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredRisks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#525252]">No {filter === 'all' ? 'open' : filter.toLowerCase()} risks</p>
          </div>
        ) : (
          filteredRisks.map(risk => (
            <RiskItem
              key={risk.id}
              risk={risk}
              isExpanded={expandedRisks.has(risk.id)}
              onToggle={() => toggleRisk(risk.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}


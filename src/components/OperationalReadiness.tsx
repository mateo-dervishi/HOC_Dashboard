'use client';

import { OperationalData } from '@/lib/types';
import { Settings, Users, Package, Globe, Database, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';

interface OperationalReadinessProps {
  data: OperationalData;
}

type StatusType = 'Ready' | 'In Progress' | 'Not Started' | 'Planned' | 'In Development' | 'Live';

function StatusBadge({ status }: { status: StatusType }) {
  const config = {
    'Ready': { icon: CheckCircle2, color: '#4A9C6D', bg: 'bg-[#4A9C6D]/10', border: 'border-[#4A9C6D]/20' },
    'Live': { icon: CheckCircle2, color: '#4A9C6D', bg: 'bg-[#4A9C6D]/10', border: 'border-[#4A9C6D]/20' },
    'In Progress': { icon: Clock, color: '#D4A84B', bg: 'bg-[#D4A84B]/10', border: 'border-[#D4A84B]/20' },
    'In Development': { icon: Clock, color: '#D4A84B', bg: 'bg-[#D4A84B]/10', border: 'border-[#D4A84B]/20' },
    'Planned': { icon: Clock, color: '#5B8DEF', bg: 'bg-[#5B8DEF]/10', border: 'border-[#5B8DEF]/20' },
    'Not Started': { icon: XCircle, color: '#737373', bg: 'bg-[#737373]/10', border: 'border-[#737373]/20' },
  };

  const { icon: Icon, color, bg, border } = config[status] || config['Not Started'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg} border ${border}`}>
      <Icon size={12} style={{ color }} />
      <span className="text-[10px] font-medium" style={{ color }}>{status}</span>
    </div>
  );
}

function ReadinessItem({ 
  icon: Icon, 
  label, 
  value, 
  total, 
  status,
  showProgress = false 
}: { 
  icon: React.ElementType;
  label: string;
  value: number | string;
  total?: number;
  status?: StatusType;
  showProgress?: boolean;
}) {
  const progress = total ? (Number(value) / total) * 100 : 0;
  
  return (
    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#333333] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[#C9A962]" />
          <span className="text-xs text-[#737373] uppercase tracking-wider">{label}</span>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      
      <div className="mt-3">
        {total ? (
          <>
            <p className="text-xl font-light text-[#F8F7F5] font-tabular">
              {value} <span className="text-sm text-[#525252]">/ {total}</span>
            </p>
            {showProgress && (
              <div className="mt-2 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4A9C6D] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-xl font-light text-[#F8F7F5] font-tabular">{value}</p>
        )}
      </div>
    </div>
  );
}

export function OperationalReadiness({ data }: OperationalReadinessProps) {
  // Calculate overall readiness score
  const items = [
    { ready: data.suppliersConfirmed >= data.suppliersTotal * 0.8 },
    { ready: data.productsInCatalogue > 500 },
    { ready: data.staffHired >= data.staffRequired },
    { ready: data.websiteStatus === 'Live' },
    { ready: data.inventorySystemStatus === 'Live' },
  ];
  const readyCount = items.filter(i => i.ready).length;
  const overallPercent = (readyCount / items.length) * 100;

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase flex items-center gap-2">
          <Settings size={14} className="text-[#C9A962]" />
          Operational Readiness
        </h2>
        
        {/* Overall Score */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#525252]">Overall</span>
          <div className="w-24 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${overallPercent}%`,
                backgroundColor: overallPercent >= 80 ? '#4A9C6D' : overallPercent >= 50 ? '#D4A84B' : '#C94A4A'
              }}
            />
          </div>
          <span className="text-xs text-[#737373] font-tabular">{readyCount}/{items.length}</span>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-2 gap-3">
        <ReadinessItem 
          icon={Truck}
          label="Suppliers Confirmed"
          value={data.suppliersConfirmed}
          total={data.suppliersTotal}
          showProgress
        />
        
        <ReadinessItem 
          icon={Package}
          label="Products in Catalogue"
          value={data.productsInCatalogue.toLocaleString()}
        />
        
        <ReadinessItem 
          icon={Users}
          label="Staff Hired"
          value={data.staffHired}
          total={data.staffRequired}
          showProgress
        />
        
        <ReadinessItem 
          icon={Globe}
          label="Website"
          value=""
          status={data.websiteStatus as StatusType}
        />
        
        <ReadinessItem 
          icon={Database}
          label="Inventory System"
          value=""
          status={data.inventorySystemStatus as StatusType}
        />
        
        {/* Additional placeholder for visual balance */}
        <div className="p-4 rounded-lg bg-[#0A0A0A]/50 border border-dashed border-[#1F1F1F] flex items-center justify-center">
          <p className="text-[10px] text-[#525252] uppercase tracking-wider">More metrics coming</p>
        </div>
      </div>
    </div>
  );
}


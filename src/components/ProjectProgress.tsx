'use client';

import { ProjectData } from '@/lib/types';
import { ProgressRing } from './ProgressRing';
import { Building2, Warehouse, Calendar, Clock, CheckCircle2, Circle, Info } from 'lucide-react';

interface ProjectProgressProps {
  showroom: ProjectData;
  warehouse: ProjectData;
}

function ProjectCard({ 
  data, 
  title, 
  icon: Icon,
  note
}: { 
  data: ProjectData; 
  title: string; 
  icon: React.ElementType;
  note?: string;
}) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 p-5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={16} className="text-[#C9A962]" />
            <h3 className="text-sm font-medium text-[#F8F7F5]">{title}</h3>
          </div>
          <p className="text-xs text-[#525252]">{data.location}</p>
        </div>
        <ProgressRing progress={data.completionPercent} size={80} strokeWidth={6} />
      </div>

      {/* Target Date & Countdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#111111]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <Calendar size={9} />
            Target Date
          </p>
          <p className="text-sm text-[#F8F7F5] font-tabular">{formatDate(data.targetDate)}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#111111]">
          <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-1 flex items-center gap-1">
            <Clock size={9} />
            Days Remaining
          </p>
          <p className="text-sm text-[#F8F7F5] font-tabular">{data.daysRemaining}</p>
        </div>
      </div>

      {/* Note if present */}
      {note && (
        <div className="mb-4 p-2 rounded bg-[#D4A84B]/10 border border-[#D4A84B]/20">
          <p className="text-[10px] text-[#D4A84B] flex items-center gap-1">
            <Info size={10} />
            {note}
          </p>
        </div>
      )}

      {/* Milestones */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-3">Milestones</p>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {data.milestones.map((milestone, index) => (
            <div 
              key={index}
              className={`
                flex items-start gap-3 p-2 rounded-lg transition-colors
                ${milestone.complete ? 'bg-[#4A9C6D]/5' : 'hover:bg-[#1A1A1A]'}
              `}
            >
              {milestone.complete ? (
                <CheckCircle2 size={14} className="text-[#4A9C6D] mt-0.5 flex-shrink-0" />
              ) : (
                <div className="relative mt-0.5 flex-shrink-0">
                  <Circle size={14} className="text-[#333333]" />
                  {milestone.statusPercent > 0 && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ opacity: milestone.statusPercent / 100 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#D4A84B]" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${milestone.complete ? 'text-[#737373]' : 'text-[#F8F7F5]'}`}>
                  {milestone.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {milestone.targetDate && (
                    <span className="text-[9px] text-[#525252]">
                      {formatDate(milestone.targetDate)}
                    </span>
                  )}
                  {!milestone.complete && milestone.statusPercent > 0 && (
                    <span className="text-[9px] text-[#D4A84B]">
                      {milestone.statusPercent}%
                    </span>
                  )}
                </div>
                {milestone.notes && (
                  <p className="text-[9px] text-[#525252] mt-1 italic">{milestone.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectProgress({ showroom, warehouse }: ProjectProgressProps) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in stagger-2">
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase mb-6 flex items-center gap-2">
        <Building2 size={14} className="text-[#C9A962]" />
        Project Progress
      </h2>

      <div className="flex gap-4">
        <ProjectCard 
          data={showroom} 
          title="Showroom" 
          icon={Building2}
        />
        <ProjectCard 
          data={warehouse} 
          title="Warehouse" 
          icon={Warehouse}
          note="Refurbishment managed by landlord"
        />
      </div>
    </div>
  );
}


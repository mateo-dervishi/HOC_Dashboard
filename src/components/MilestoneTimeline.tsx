'use client';

import { useState } from 'react';
import { ProjectData, Milestone } from '@/lib/types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  AlertTriangle,
  Pause,
  ChevronDown,
  ChevronUp,
  Building2,
  Warehouse,
  MapPin,
  Info
} from 'lucide-react';

interface MilestoneTimelineProps {
  showroom: ProjectData;
  warehouse: ProjectData;
}

interface TimelineCardProps {
  project: ProjectData;
  title: string;
  icon: React.ElementType;
  isPaused?: boolean;
  pauseReason?: string;
}

function TimelineCard({ project, title, icon: Icon, isPaused = false, pauseReason }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatShortDate = (date: Date | null) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate timeline stats
  const completedMilestones = project.milestones.filter(m => m.complete).length;
  const totalMilestones = project.milestones.length;
  const nextMilestone = project.milestones.find(m => !m.complete);
  
  // Find the current position on timeline (0-100%)
  const timelineProgress = totalMilestones > 0 
    ? (completedMilestones / totalMilestones) * 100 
    : 0;

  // Get status color
  const getStatusColor = () => {
    if (isPaused) return '#D4A84B';
    if (project.completionPercent >= 75) return '#4A9C6D';
    if (project.completionPercent >= 40) return '#5B8DEF';
    return '#C9A962';
  };

  const statusColor = getStatusColor();

  // Calculate days until next milestone
  const getDaysUntil = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`
      bg-[#0A0A0A] border rounded-xl overflow-hidden transition-all duration-300
      ${isPaused ? 'border-[#D4A84B]/30' : 'border-[#1F1F1F]'}
    `}>
      {/* Header */}
      <div 
        className="p-5 cursor-pointer hover:bg-[#111111] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${statusColor}15` }}
            >
              <Icon size={20} style={{ color: statusColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-[#F8F7F5]">{title}</h3>
                {isPaused && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4A84B]/15 border border-[#D4A84B]/30">
                    <Pause size={10} className="text-[#D4A84B]" />
                    <span className="text-[9px] uppercase tracking-wider text-[#D4A84B] font-medium">Paused</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#525252] flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                {project.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Circle */}
            <div className="text-right">
              <p className="text-2xl font-light text-[#F8F7F5] font-tabular">
                {Math.round(project.completionPercent)}%
              </p>
              <p className="text-[10px] text-[#525252] uppercase tracking-wider">Complete</p>
            </div>
            
            {isExpanded ? (
              <ChevronUp size={16} className="text-[#525252]" />
            ) : (
              <ChevronDown size={16} className="text-[#525252]" />
            )}
          </div>
        </div>

        {/* Pause reason banner */}
        {isPaused && pauseReason && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#D4A84B]/10 border border-[#D4A84B]/20">
            <p className="text-xs text-[#D4A84B] flex items-center gap-2">
              <Info size={12} />
              {pauseReason}
            </p>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2.5 rounded-lg bg-[#111111]">
            <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-0.5">Target</p>
            <p className="text-sm text-[#F8F7F5] font-tabular">{formatDate(project.targetDate)}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111111]">
            <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-0.5">Days Left</p>
            <p className={`text-sm font-tabular ${project.daysRemaining < 30 ? 'text-[#D4A84B]' : 'text-[#F8F7F5]'}`}>
              {project.daysRemaining}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#111111]">
            <p className="text-[9px] uppercase tracking-wider text-[#525252] mb-0.5">Milestones</p>
            <p className="text-sm text-[#F8F7F5] font-tabular">
              {completedMilestones} / {totalMilestones}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#1F1F1F]">
          {/* Visual Timeline */}
          <div className="pt-5 pb-2">
            <div className="relative">
              {/* Timeline Track */}
              <div className="absolute top-[22px] left-[18px] right-[18px] h-0.5 bg-[#1F1F1F]">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${timelineProgress}%`,
                    backgroundColor: statusColor 
                  }}
                />
              </div>

              {/* Milestone Points */}
              <div className="relative flex justify-between">
                {project.milestones.map((milestone, idx) => {
                  const daysUntil = getDaysUntil(milestone.targetDate);
                  const isOverdue = daysUntil !== null && daysUntil < 0 && !milestone.complete;
                  const isUpcoming = daysUntil !== null && daysUntil >= 0 && daysUntil <= 14 && !milestone.complete;
                  const isCurrent = !milestone.complete && idx === completedMilestones;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex flex-col items-center"
                      style={{ width: `${100 / project.milestones.length}%` }}
                    >
                      {/* Milestone Node */}
                      <div 
                        className={`
                          relative z-10 w-11 h-11 rounded-full flex items-center justify-center
                          transition-all duration-300
                          ${milestone.complete 
                            ? 'bg-[#4A9C6D]' 
                            : isCurrent
                              ? `bg-[#111111] border-2`
                              : 'bg-[#1A1A1A] border border-[#333333]'
                          }
                          ${isOverdue ? 'border-[#C94A4A]' : ''}
                          ${isUpcoming && !isOverdue ? 'border-[#D4A84B]' : ''}
                          ${isCurrent && !isOverdue && !isUpcoming ? `border-[${statusColor}]` : ''}
                        `}
                        style={isCurrent && !isOverdue && !isUpcoming ? { borderColor: statusColor } : {}}
                      >
                        {milestone.complete ? (
                          <CheckCircle2 size={18} className="text-white" />
                        ) : isOverdue ? (
                          <AlertTriangle size={16} className="text-[#C94A4A]" />
                        ) : isCurrent ? (
                          <div 
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: statusColor }}
                          />
                        ) : (
                          <Circle size={14} className="text-[#525252]" />
                        )}
                        
                        {/* Progress indicator for in-progress milestones */}
                        {!milestone.complete && milestone.statusPercent > 0 && (
                          <svg className="absolute inset-0 w-11 h-11 -rotate-90">
                            <circle
                              cx="22"
                              cy="22"
                              r="19"
                              fill="none"
                              stroke={statusColor}
                              strokeWidth="2"
                              strokeDasharray={`${(milestone.statusPercent / 100) * 119.38} 119.38`}
                              strokeLinecap="round"
                              opacity="0.5"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Milestone Label */}
                      <div className="mt-3 text-center px-1">
                        <p className={`
                          text-[10px] font-medium leading-tight
                          ${milestone.complete ? 'text-[#737373]' : 'text-[#F8F7F5]'}
                        `}>
                          {milestone.name.length > 20 
                            ? milestone.name.substring(0, 18) + '...' 
                            : milestone.name
                          }
                        </p>
                        <p className={`
                          text-[9px] mt-1 font-tabular
                          ${isOverdue ? 'text-[#C94A4A]' : 'text-[#525252]'}
                        `}>
                          {milestone.complete && milestone.actualDate 
                            ? `✓ ${formatShortDate(milestone.actualDate)}`
                            : formatShortDate(milestone.targetDate)
                          }
                        </p>
                        {!milestone.complete && milestone.statusPercent > 0 && (
                          <p className="text-[9px] text-[#D4A84B] mt-0.5">
                            {milestone.statusPercent}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next Milestone Highlight */}
          {nextMilestone && !isPaused && (
            <div className="mt-4 p-3 rounded-lg bg-[#111111] border border-[#1F1F1F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: statusColor }} />
                  <span className="text-xs text-[#737373]">Next Milestone:</span>
                  <span className="text-sm text-[#F8F7F5]">{nextMilestone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {nextMilestone.statusPercent > 0 && (
                    <span className="text-xs text-[#D4A84B]">{nextMilestone.statusPercent}% done</span>
                  )}
                  <span className="text-xs text-[#525252]">
                    {formatDate(nextMilestone.targetDate)}
                  </span>
                </div>
              </div>
              {nextMilestone.notes && (
                <p className="text-xs text-[#525252] mt-2 pl-5">{nextMilestone.notes}</p>
              )}
            </div>
          )}

          {/* Detailed Milestone List */}
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-2">All Milestones</p>
            <div className="space-y-1">
              {project.milestones.map((milestone, idx) => {
                const daysUntil = getDaysUntil(milestone.targetDate);
                const isOverdue = daysUntil !== null && daysUntil < 0 && !milestone.complete;
                
                return (
                  <div 
                    key={idx}
                    className={`
                      flex items-center justify-between py-2 px-3 rounded-lg
                      ${milestone.complete ? 'bg-[#4A9C6D]/5' : 'hover:bg-[#111111]'}
                      transition-colors
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {milestone.complete ? (
                        <CheckCircle2 size={14} className="text-[#4A9C6D]" />
                      ) : isOverdue ? (
                        <AlertTriangle size={14} className="text-[#C94A4A]" />
                      ) : (
                        <Circle size={14} className="text-[#333333]" />
                      )}
                      <span className={`text-sm ${milestone.complete ? 'text-[#737373]' : 'text-[#F8F7F5]'}`}>
                        {milestone.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {!milestone.complete && milestone.statusPercent > 0 && (
                        <span className="text-[#D4A84B]">{milestone.statusPercent}%</span>
                      )}
                      <span className={`font-tabular ${isOverdue ? 'text-[#C94A4A]' : 'text-[#525252]'}`}>
                        {milestone.complete && milestone.actualDate
                          ? formatDate(milestone.actualDate)
                          : formatDate(milestone.targetDate)
                        }
                      </span>
                      {milestone.complete && (
                        <span className="text-[#4A9C6D]">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MilestoneTimeline({ showroom, warehouse }: MilestoneTimelineProps) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] text-[#737373] uppercase flex items-center gap-2">
          <Calendar size={14} className="text-[#C9A962]" />
          Project Milestones & Timeline
        </h2>
        <div className="flex items-center gap-4 text-[10px] text-[#525252]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#4A9C6D]" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#D4A84B]" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#333333]" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <TimelineCard 
          project={warehouse}
          title="Warehouse"
          icon={Warehouse}
          isPaused={warehouse.isPaused}
          pauseReason={warehouse.pauseReason}
        />
        
        <TimelineCard 
          project={showroom}
          title="Showroom"
          icon={Building2}
          isPaused={showroom.isPaused}
          pauseReason={showroom.pauseReason}
        />
      </div>
    </div>
  );
}


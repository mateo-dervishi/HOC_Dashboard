'use client';

interface RAGBadgeProps {
  status: 'Red' | 'Amber' | 'Green';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  count?: number;
}

export function RAGBadge({ 
  status, 
  size = 'medium', 
  showLabel = false,
  count
}: RAGBadgeProps) {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  const colorClasses = {
    Red: 'bg-[#C94A4A]',
    Amber: 'bg-[#D4A84B]',
    Green: 'bg-[#4A9C6D]',
  };

  const bgClasses = {
    Red: 'bg-[#C94A4A]/15 border-[#C94A4A]/30',
    Amber: 'bg-[#D4A84B]/15 border-[#D4A84B]/30',
    Green: 'bg-[#4A9C6D]/15 border-[#4A9C6D]/30',
  };

  const textClasses = {
    Red: 'text-[#C94A4A]',
    Amber: 'text-[#D4A84B]',
    Green: 'text-[#4A9C6D]',
  };

  if (showLabel || count !== undefined) {
    return (
      <div 
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
          ${bgClasses[status]}
        `}
      >
        <span className={`${sizeClasses[size]} rounded-full ${colorClasses[status]}`} />
        <span className={`text-sm font-medium ${textClasses[status]}`}>
          {count !== undefined ? count : status}
        </span>
      </div>
    );
  }

  return (
    <span 
      className={`
        inline-block rounded-full
        ${sizeClasses[size]}
        ${colorClasses[status]}
      `}
    />
  );
}

interface RAGSummaryProps {
  red: number;
  amber: number;
  green: number;
}

export function RAGSummary({ red, amber, green }: RAGSummaryProps) {
  return (
    <div className="flex items-center gap-3">
      <RAGBadge status="Red" showLabel count={red} />
      <RAGBadge status="Amber" showLabel count={amber} />
      <RAGBadge status="Green" showLabel count={green} />
    </div>
  );
}


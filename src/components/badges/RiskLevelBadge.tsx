import { cn } from '@/lib/utils';
import { RISK_STYLES } from '@/lib/style-constants';

interface RiskLevelBadgeProps {
  level: string;
  className?: string;
}

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        RISK_STYLES[level] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {level}
    </span>
  );
}

import { cn } from '@/lib/utils';
import { Rocket, AlertCircle } from 'lucide-react';

interface FlagBadgeProps {
  value: boolean;
  variant: 'launch-critical' | 'needs-review';
  className?: string;
}

const CONFIG = {
  'launch-critical': {
    label: 'Launch-Critical',
    icon: Rocket,
    activeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  'needs-review': {
    label: 'Needs Review',
    icon: AlertCircle,
    activeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  },
} as const;

export function FlagBadge({ value, variant, className }: FlagBadgeProps) {
  if (!value) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const { label, icon: Icon, activeClass } = CONFIG[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        activeClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulationDisclaimerProps {
  className?: string;
}

/**
 * Red simulation-mode disclaimer banner.
 * Used on pages with simulated approve/reject/return actions
 * to make clear that no real approval has occurred.
 */
export function SimulationDisclaimer({ className }: SimulationDisclaimerProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3', className)}>
      <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
      <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
        <strong>Simulation mode:</strong> Actions demonstrated here do not modify active regulatory data. This is a workflow demonstration for governance readiness.
      </p>
    </div>
  );
}

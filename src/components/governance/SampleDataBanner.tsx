import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleDataBannerProps {
  className?: string;
}

/**
 * Persistent banner that clarifies governance page content is sample/demo data.
 * Prevents mock regulatory content from being mistaken for validated legal guidance.
 */
export function SampleDataBanner({ className }: SampleDataBannerProps) {
  return (
    <div data-sample-banner className={cn('flex items-start gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3', className)}>
      <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
      <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
        <strong>Sample data:</strong> Regulatory content shown on this page is illustrative demonstration data. It has not been validated for legal or compliance use.
      </p>
    </div>
  );
}

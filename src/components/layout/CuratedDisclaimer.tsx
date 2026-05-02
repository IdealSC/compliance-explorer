import { Info } from 'lucide-react';

export function CuratedDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        This is a curated view based on workbook metadata and keyword matching logic.
        It is not a legal applicability determination. Requirements may appear in
        multiple views based on overlapping criteria.
      </p>
    </div>
  );
}

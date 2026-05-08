'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGaps } from '@/lib/data';

export default function GapsPage() {
  const gaps = React.useMemo(() => getGaps(), []);
  const openGaps = gaps.filter((g) => g.status !== 'Closed');
  const closedGaps = gaps.filter((g) => g.status === 'Closed');

  const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2 };
  const sortedGaps = [...openGaps].sort(
    (a, b) => (priorityOrder[a.priority ?? ''] ?? 3) - (priorityOrder[b.priority ?? ''] ?? 3)
  );

  const priorityColors: Record<string, string> = {
    Critical: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
    High: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
    Medium: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gaps & Action Items"
        description="Open questions, missing information, and action items that require resolution before regulatory readiness."
        badge={{
          label: `${openGaps.length} open · ${closedGaps.length} closed`,
          variant: 'secondary',
        }}
      />

      <div className="space-y-3">
        {sortedGaps.map((gap) => (
          <Card key={gap.gapId} size="sm">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-sm">
                    <span className="font-mono text-xs text-primary mr-2">
                      {gap.gapId}
                    </span>
                    {gap.gapQuestion}
                  </CardTitle>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {gap.priority && (
                    <Badge
                      variant="outline"
                      className={priorityColors[gap.priority] ?? ''}
                    >
                      {gap.priority}
                    </Badge>
                  )}
                  {gap.gapCategory && (
                    <Badge variant="secondary">{gap.gapCategory}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {gap.whyItMatters && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Why It Matters
                  </span>
                  <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                    {gap.whyItMatters}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {gap.suggestedOwner && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Suggested Owner
                    </span>
                    <p className="mt-0.5 text-xs text-foreground">{gap.suggestedOwner}</p>
                  </div>
                )}
                {gap.sourceBasis && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Source Basis
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{gap.sourceBasis}</p>
                  </div>
                )}
              </div>

              {gap.appTreatment && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    App Treatment
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {gap.appTreatment}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

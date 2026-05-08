'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCrosswalks, getRequirementMap } from '@/lib/data';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import type { Crosswalk, Requirement } from '@/types';

export default function CrosswalkPage() {
  const crosswalks = React.useMemo(() => getCrosswalks(), []);
  const requirementMap = React.useMemo(() => getRequirementMap(), []);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Parse linked requirement IDs from each crosswalk.
  // IDs may be CM-0001 format, REQ-001 format, or freetext filter logic.
  const getLinkedRequirements = React.useCallback(
    (cw: Crosswalk): Requirement[] => {
      if (!cw.linkedMatrixRowIdsFilterLogic) return [];
      // Try to extract CM-xxxx or REQ-xxx style IDs
      const idPattern = /\b(CM-\d{4}|REQ-\d{3,})\b/gi;
      const matches = cw.linkedMatrixRowIdsFilterLogic.match(idPattern);
      if (!matches || matches.length === 0) return [];
      return matches
        .map((id) => requirementMap.get(id.toUpperCase()))
        .filter((r): r is Requirement => r !== undefined);
    },
    [requirementMap]
  );

  const handleReqClick = (req: Requirement) => {
    setSelectedReq(req);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Standards Crosswalk"
        description="How different regulatory frameworks, standards, and guidance documents connect across SCOR phases and business functions."
        badge={{
          label: `${crosswalks.length} crosswalk areas`,
          variant: 'secondary',
        }}
      />

      {/* Crosswalk cards */}
      <div className="space-y-3">
        {crosswalks.map((cw) => {
          const isExpanded = expandedId === cw.crosswalkId;
          const linkedReqs = isExpanded ? getLinkedRequirements(cw) : [];

          return (
            <Card key={cw.crosswalkId} size="sm">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-sm">
                      <span className="font-mono text-xs text-primary mr-2">
                        {cw.crosswalkId}
                      </span>
                      {cw.crosswalkArea}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cw.businessMeaning}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {cw.primaryScorPhase && (
                      <Badge variant="outline">{cw.primaryScorPhase}</Badge>
                    )}
                    {cw.primaryPersonaViewer && (
                      <Badge variant="secondary">{cw.primaryPersonaViewer}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Linked laws/standards */}
                {cw.linkedLawsStandardsGuidance && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Linked Standards
                    </span>
                    <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                      {cw.linkedLawsStandardsGuidance}
                    </p>
                  </div>
                )}

                {/* Primary evidence/control */}
                {cw.primaryEvidenceControl && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Primary Evidence / Control
                    </span>
                    <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                      {cw.primaryEvidenceControl}
                    </p>
                  </div>
                )}

                {/* Source coverage */}
                {cw.sourceCoverage && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Source Coverage
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {cw.sourceCoverage}
                    </p>
                  </div>
                )}

                {/* Expandable linked requirements */}
                {cw.linkedMatrixRowIdsFilterLogic && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : cw.crosswalkId)
                      }
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {isExpanded
                        ? 'Hide linked requirements'
                        : 'Show linked requirements →'}
                    </button>

                    {isExpanded && linkedReqs.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-l-2 border-primary/20 pl-3">
                        {linkedReqs.map((req) => (
                          <button
                            key={req.matrixRowId}
                            type="button"
                            onClick={() => handleReqClick(req)}
                            className="flex items-start gap-2 text-left hover:bg-accent/50 rounded px-2 py-1.5 w-full transition-colors"
                          >
                            <span className="font-mono text-[10px] text-primary font-bold shrink-0 mt-px">
                              {req.matrixRowId}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                              {req.uiDisplaySummary || req.level3RequirementArea}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {isExpanded && linkedReqs.length === 0 && (
                      <div className="mt-2 text-xs text-muted-foreground italic space-y-1">
                        <p>No parseable requirement IDs found.</p>
                        {cw.linkedMatrixRowIdsFilterLogic && (
                          <p className="text-[10px] not-italic text-muted-foreground/70">
                            Filter logic: {cw.linkedMatrixRowIdsFilterLogic}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

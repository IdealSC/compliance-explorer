'use client';
import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExposureLevelBadge } from '@/components/badges/ExposureLevelBadge';
import { ReadinessStatusBadge } from '@/components/badges/ReadinessStatusBadge';
import { ActionPriorityBadge } from '@/components/badges/ActionBadges';
import { ImpactSeverityBadge } from '@/components/badges/ImpactSeverityBadge';
import {
  TrendingUp, AlertTriangle, ShieldAlert, FileWarning,
  Clock, Scale, Database, ActivitySquare, Users, ArrowRight,
  Shield, ClipboardCheck, ExternalLink, Info,
} from 'lucide-react';
import type { HealthScore, RiskIndicators, FunctionExposure, ImpactSummaryItem, ControlEvidenceSummary, ActionSummary, SourceDqSummary, ReadinessArea, RecommendedAction } from '@/lib/executiveMetrics';

/* ── Score Card ──────────────────────────────────────────────── */
function ScoreCard({ s }: { s: HealthScore }) {
  const color = s.score >= 80 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : s.score >= 40 ? 'text-orange-600' : 'text-red-600';
  const ring = s.score >= 80 ? 'ring-emerald-200 dark:ring-emerald-900' : s.score >= 60 ? 'ring-amber-200 dark:ring-amber-900' : s.score >= 40 ? 'ring-orange-200 dark:ring-orange-900' : 'ring-red-200 dark:ring-red-900';
  return (
    <Card className={`ring-1 ${ring}`}>
      <CardContent className="p-3 text-center space-y-1">
        <div className={`text-2xl font-bold ${color}`}>{s.score}%</div>
        <div className="text-xs font-semibold">{s.label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{s.description}</div>
      </CardContent>
    </Card>
  );
}

/* ── Metric Pill ─────────────────────────────────────────────── */
function MetricPill({ label, value, icon, variant = 'default' }: { label: string; value: number; icon: React.ReactNode; variant?: 'default' | 'red' | 'amber' }) {
  const bg = variant === 'red' && value > 0 ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20' : variant === 'amber' && value > 0 ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' : '';
  return (
    <Card className={bg}>
      <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </CardContent>
    </Card>
  );
}

/* ── Section Header ──────────────────────────────────────────── */
export function SectionHeader({ title, id }: { title: string; id?: string }) {
  return <h2 id={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-8 first:mt-0">{title}</h2>;
}

/* ── Health Scores Grid ──────────────────────────────────────── */
export function HealthScoresGrid({ scores }: { scores: HealthScore[] }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{scores.map(s => <ScoreCard key={s.label} s={s} />)}</div>;
}

/* ── Risk Indicators Grid ────────────────────────────────────── */
export function RiskIndicatorsGrid({ ri }: { ri: RiskIndicators }) {
  const items: { label: string; value: number; icon: React.ReactNode; variant: 'default' | 'red' | 'amber' }[] = [
    { label: 'Critical / High Risks', value: ri.criticalRisks, icon: <AlertTriangle className="h-4 w-4" />, variant: 'red' },
    { label: 'High-Risk Obligations', value: ri.highRiskObligations, icon: <Scale className="h-4 w-4" />, variant: 'amber' },
    { label: 'Deficient Controls', value: ri.deficientControls, icon: <ShieldAlert className="h-4 w-4" />, variant: 'red' },
    { label: 'Controls Needing Review', value: ri.controlsNeedingReview, icon: <Shield className="h-4 w-4" />, variant: 'amber' },
    { label: 'Missing Evidence', value: ri.missingEvidence, icon: <FileWarning className="h-4 w-4" />, variant: 'red' },
    { label: 'Expired Evidence', value: ri.expiredEvidence, icon: <Clock className="h-4 w-4" />, variant: 'amber' },
    { label: 'Rejected Evidence', value: ri.rejectedEvidence, icon: <FileWarning className="h-4 w-4" />, variant: 'red' },
    { label: 'Overdue Actions', value: ri.overdueActions, icon: <ClipboardCheck className="h-4 w-4" />, variant: 'red' },
    { label: 'Pending Impacts', value: ri.pendingImpacts, icon: <TrendingUp className="h-4 w-4" />, variant: 'amber' },
    { label: 'Legal Review Required', value: ri.legalReviewRequired, icon: <Scale className="h-4 w-4" />, variant: 'amber' },
    { label: 'Source Validation Gaps', value: ri.sourceValidationGaps, icon: <Database className="h-4 w-4" />, variant: 'amber' },
    { label: 'Open DQ Issues', value: ri.openDqIssues, icon: <ActivitySquare className="h-4 w-4" />, variant: 'amber' },
  ];
  return <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">{items.map(i => <MetricPill key={i.label} {...i} />)}</div>;
}

/* ── Function Exposure Cards ─────────────────────────────────── */
export function FunctionExposureGrid({ fns }: { fns: FunctionExposure[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {fns.map(fn => {
        const hasData = fn.openActions + fn.missingEvidence + fn.deficientControls + fn.highRiskObligations + fn.dqIssues > 0;
        return (
          <Card key={fn.name} className={!hasData ? 'opacity-60' : ''}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{fn.name}</span>
                <ExposureLevelBadge level={fn.exposureLevel} />
              </div>
              {hasData ? (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <span className="text-muted-foreground">Open actions</span><span className="font-medium text-right">{fn.openActions}</span>
                    <span className="text-muted-foreground">Overdue</span><span className="font-medium text-right">{fn.overdueActions}</span>
                    <span className="text-muted-foreground">Missing evidence</span><span className="font-medium text-right">{fn.missingEvidence}</span>
                    <span className="text-muted-foreground">Expired evidence</span><span className="font-medium text-right">{fn.expiredEvidence}</span>
                    <span className="text-muted-foreground">Deficient controls</span><span className="font-medium text-right">{fn.deficientControls}</span>
                    <span className="text-muted-foreground">High-risk obligations</span><span className="font-medium text-right">{fn.highRiskObligations}</span>
                    <span className="text-muted-foreground">Regulatory impacts</span><span className="font-medium text-right">{fn.regulatoryImpacts}</span>
                    <span className="text-muted-foreground">DQ issues</span><span className="font-medium text-right">{fn.dqIssues}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic border-t pt-1.5">{fn.recommendedFocus}</p>
                </>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No sample records currently match this function. This does not mean there are no real-world obligations or risks for this function.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Impact Summary Table ────────────────────────────────────── */
export function ImpactSummaryTable({ items }: { items: ImpactSummaryItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground italic">No impact analyses recorded.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="border-b text-left text-muted-foreground">
          <th className="py-2 pr-3">Title</th><th className="py-2 pr-3">Severity</th><th className="py-2 pr-3">Status</th>
          <th className="py-2 pr-3">Effective</th><th className="py-2 pr-3">Obligations</th><th className="py-2 pr-3">Controls</th>
          <th className="py-2 pr-3">Evidence</th><th className="py-2 pr-3">Legal</th><th className="py-2">Attention</th>
        </tr></thead>
        <tbody>{items.map(i => (
          <tr key={i.id} className="border-b last:border-0">
            <td className="py-2 pr-3 font-medium max-w-[200px] truncate">{i.title}</td>
            <td className="py-2 pr-3"><ImpactSeverityBadge severity={i.severity} /></td>
            <td className="py-2 pr-3 capitalize">{i.status}</td>
            <td className="py-2 pr-3">{i.effectiveDate ?? '—'}</td>
            <td className="py-2 pr-3 text-center">{i.obligationCount}</td>
            <td className="py-2 pr-3 text-center">{i.controlCount}</td>
            <td className="py-2 pr-3 text-center">{i.evidenceCount}</td>
            <td className="py-2 pr-3">{i.legalReviewRequired ? <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">Yes</Badge> : '—'}</td>
            <td className="py-2 text-[10px] text-muted-foreground">{i.attention}</td>
          </tr>
        ))}</tbody>
      </table>
      <div className="mt-2 flex gap-3 text-[10px]">
        <Link href="/impact-analysis" className="text-primary hover:underline flex items-center gap-1">Impact Analysis <ExternalLink className="h-3 w-3" /></Link>
        <Link href="/regulatory-updates" className="text-primary hover:underline flex items-center gap-1">Regulatory Updates <ExternalLink className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

/* ── Controls & Evidence Summary ─────────────────────────────── */
export function ControlEvidenceSection({ ce }: { ce: ControlEvidenceSummary }) {
  const items = [
    ['Total Controls', ce.totalControls], ['Deficient', ce.deficientControls], ['Needs Review', ce.controlsNeedingReview], ['High Risk', ce.highRiskControls],
    ['Total Evidence', ce.totalEvidence], ['Missing', ce.missingEvidence], ['Expired', ce.expiredEvidence], ['Rejected', ce.rejectedEvidence], ['Due Soon', ce.evidenceDueSoon],
  ] as const;
  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {items.map(([label, val]) => (
          <Card key={label}><CardContent className="p-3 text-center"><div className="text-lg font-bold">{val}</div><div className="text-[10px] text-muted-foreground">{label}</div></CardContent></Card>
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[10px]">
        <Link href="/controls-evidence" className="text-primary hover:underline flex items-center gap-1">Controls & Evidence <ExternalLink className="h-3 w-3" /></Link>
        <Link href="/action-center" className="text-primary hover:underline flex items-center gap-1">Action Center <ExternalLink className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

/* ── Owner Action Summary ────────────────────────────────────── */
export function ActionSummarySection({ as: a }: { as: ActionSummary }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[['Open', a.totalOpen], ['Critical', a.critical], ['High', a.high], ['Overdue', a.overdue], ['Blocked', a.blocked], ['Due Soon', a.dueSoon]].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-3 text-center"><div className="text-lg font-bold">{v as number}</div><div className="text-[10px] text-muted-foreground">{l as string}</div></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-4">
        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Top Action Burden</h4>
        {a.topBurden.length > 0 ? (
          <div className="space-y-1.5">{a.topBurden.map(o => (
            <div key={o.name} className="flex justify-between text-xs"><span className="text-muted-foreground">{o.name}</span><span className="font-medium">{o.count} actions</span></div>
          ))}</div>
        ) : <p className="text-[10px] text-muted-foreground italic">No open actions.</p>}
      </CardContent></Card>
      <div className="lg:col-span-2 text-[10px]"><Link href="/action-center" className="text-primary hover:underline flex items-center gap-1">Action Center <ExternalLink className="h-3 w-3" /></Link></div>
    </div>
  );
}

/* ── Source & DQ Summary ─────────────────────────────────────── */
export function SourceDqSection({ sd }: { sd: SourceDqSummary }) {
  const items = [
    ['Pending Validation', sd.pendingValidation], ['Legal Review Needed', sd.legalReviewNeeded], ['Incomplete Metadata', sd.incompleteMetadata],
    ['Low Confidence', sd.lowConfidence], ['Stale Reviews', sd.staleReviews], ['Missing Source Refs', sd.missingSourceRefs],
    ['Missing Controls', sd.missingControls], ['Missing Evidence', sd.missingEvidence], ['Version Gaps', sd.versionGaps], ['Audit Gaps', sd.auditGaps],
  ] as const;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(([l, v]) => (
          <Card key={l}><CardContent className="p-3 text-center"><div className="text-lg font-bold">{v}</div><div className="text-[10px] text-muted-foreground">{l}</div></CardContent></Card>
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[10px]">
        <Link href="/source-registry" className="text-primary hover:underline flex items-center gap-1">Source Registry <ExternalLink className="h-3 w-3" /></Link>
        <Link href="/data-quality" className="text-primary hover:underline flex items-center gap-1">Data Quality <ExternalLink className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

/* ── Governance Readiness ────────────────────────────────────── */
export function GovernanceReadinessGrid({ areas }: { areas: ReadinessArea[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {areas.map(a => (
        <Card key={a.area}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold">{a.area}</span><ReadinessStatusBadge status={a.status} /></div>
            <p className="text-[10px] text-muted-foreground">{a.explanation}</p>
            <p className="text-[10px] italic text-muted-foreground border-t pt-1.5">{a.nextStep}</p>
            <Link href={a.href} className="text-[10px] text-primary hover:underline flex items-center gap-1">View details <ExternalLink className="h-2.5 w-2.5" /></Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Executive Recommended Actions ───────────────────────────── */
export function RecommendedActionsList({ actions }: { actions: RecommendedAction[] }) {
  if (actions.length === 0) return <p className="text-sm text-muted-foreground italic">No recommended actions at this time.</p>;
  return (
    <div className="space-y-3">
      {actions.map((a, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-bold">{i + 1}</span>
                <h4 className="text-sm font-semibold">{a.title}</h4>
              </div>
              <ActionPriorityBadge priority={a.priority} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{a.whyItMatters}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] mb-2">
              <div><span className="text-muted-foreground">Function: </span><span className="font-medium">{a.businessFunction}</span></div>
              <div><span className="text-muted-foreground">Owner: </span><span className="font-medium">{a.owner}</span></div>
              <div><span className="text-muted-foreground">Risk: </span><span className="font-medium">{a.relatedRisk}</span></div>
              <div><Link href={a.relatedHref} className="text-primary hover:underline flex items-center gap-1">{a.relatedPage} <ExternalLink className="h-2.5 w-2.5" /></Link></div>
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowRight className="h-3 w-3" /><span className="italic">{a.nextStep}</span></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Cross-Links Footer ──────────────────────────────────────── */
const CROSS_LINKS = [
  { href: '/action-center', label: 'Action Center' }, { href: '/controls-evidence', label: 'Controls & Evidence' },
  { href: '/impact-analysis', label: 'Impact Analysis' }, { href: '/regulatory-updates', label: 'Regulatory Updates' },
  { href: '/source-registry', label: 'Source Registry' }, { href: '/data-quality', label: 'Data Quality' },
  { href: '/reports', label: 'Reports' }, { href: '/obligations', label: 'Obligations' },
  { href: '/business-functions', label: 'Business Functions' }, { href: '/review-approval', label: 'Review & Approval' },
  { href: '/version-history', label: 'Version History' }, { href: '/audit-log', label: 'Audit Log' },
];

export function CrossLinksFooter() {
  return (
    <div className="flex flex-wrap gap-2">
      {CROSS_LINKS.map(l => (
        <Link key={l.href} href={l.href} className="text-[10px] text-primary hover:underline px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors">{l.label}</Link>
      ))}
    </div>
  );
}

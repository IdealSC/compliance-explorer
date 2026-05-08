import { Gauge, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SampleDataBanner } from '@/components/governance/SampleDataBanner';
import { GovernanceWarningBanner } from '@/components/governance/GovernanceWarningBanner';
import { computeExecutiveMetrics } from '@/lib/executiveMetrics';
import {
  SectionHeader,
  HealthScoresGrid,
  RiskIndicatorsGrid,
  FunctionExposureGrid,
  ImpactSummaryTable,
  ControlEvidenceSection,
  ActionSummarySection,
  SourceDqSection,
  GovernanceReadinessGrid,
  RecommendedActionsList,
  CrossLinksFooter,
} from '@/components/executive/ExecutiveSections';

const SUMMARY_TEXT: Record<string, string> = {
  healthy: 'Compliance health is currently strong. Key indicators — evidence readiness, control effectiveness, source validation, and regulatory change management — are within acceptable thresholds. Continue monitoring and maintaining operational discipline.',
  moderate: 'Compliance health is currently moderate, with elevated exposure driven by missing evidence, deficient controls, pending regulatory impact reviews, and source validation gaps. Leadership attention is recommended on the prioritized action items below.',
  at_risk: 'Compliance health is at risk. Multiple critical indicators — including deficient controls, missing evidence, overdue owner actions, and unresolved regulatory impacts — require immediate leadership attention and escalation.',
  exposed: 'Compliance health indicates significant exposure. Critical gaps exist across controls, evidence, regulatory change management, and governance readiness. Executive intervention is strongly recommended.',
};

export default function ExecutiveDashboardPage() {
  const m = computeExecutiveMetrics();

  return (
    <div className="space-y-6">
      <SampleDataBanner />
      <GovernanceWarningBanner>
        This executive dashboard is a read-only summary view. It does not edit, approve, reject, publish, or mutate any controlled reference data, operational data, or governance records. Health scores are directional indicators — not legal compliance determinations.
      </GovernanceWarningBanner>

      {/* ── Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Executive Dashboard"
        description="Leadership-ready compliance health overview."
        badge={{ label: `Health: ${m.overallHealth}%`, variant: 'secondary' }}
      />

      {/* ── Executive Summary ─────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3">
        <Gauge className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm leading-relaxed">{SUMMARY_TEXT[m.healthLevel]}</p>
          <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
            <Info className="h-3 w-3" />
            This dashboard is a sample/demo executive view based on operational indicators. It is not a legal compliance determination, certification, or audit opinion.
          </p>
        </div>
      </div>

      {/* ── Health Scores ─────────────────────────────────────── */}
      <section>
        <SectionHeader title="Compliance Health Scores" id="health-scores" />
        <HealthScoresGrid scores={m.healthScores} />
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Health scores are directional indicators based on sample operational data. They are not legal conclusions or compliance certifications.
        </p>
      </section>

      {/* ── Top Risk Indicators ───────────────────────────────── */}
      <section>
        <SectionHeader title="Top Risk Indicators" id="risk-indicators" />
        <RiskIndicatorsGrid ri={m.riskIndicators} />
      </section>

      {/* ── Business Function Exposure ────────────────────────── */}
      <section>
        <SectionHeader title="Business Function Exposure" id="function-exposure" />
        <FunctionExposureGrid fns={m.functionExposures} />
      </section>

      {/* ── Regulatory Change Impact ──────────────────────────── */}
      <section>
        <SectionHeader title="Regulatory Change Impact Summary" id="reg-impact" />
        <ImpactSummaryTable items={m.impactSummary} />
      </section>

      {/* ── Controls & Evidence ───────────────────────────────── */}
      <section>
        <SectionHeader title="Controls & Evidence Health" id="controls-evidence" />
        <ControlEvidenceSection ce={m.controlEvidence} />
      </section>

      {/* ── Owner Actions ─────────────────────────────────────── */}
      <section>
        <SectionHeader title="Owner Action Summary" id="action-summary" />
        <ActionSummarySection as={m.actionSummary} />
      </section>

      {/* ── Source & Data Quality ─────────────────────────────── */}
      <section>
        <SectionHeader title="Source & Data Quality" id="source-dq" />
        <SourceDqSection sd={m.sourceDq} />
      </section>

      {/* ── Governance Readiness ──────────────────────────────── */}
      <section>
        <SectionHeader title="Governance Readiness" id="gov-readiness" />
        <GovernanceReadinessGrid areas={m.readinessAreas} />
      </section>

      {/* ── Recommended Actions ───────────────────────────────── */}
      <section>
        <SectionHeader title="Executive Recommended Actions" id="exec-actions" />
        <RecommendedActionsList actions={m.recommendedActions} />
      </section>

      {/* ── Cross-Links ───────────────────────────────────────── */}
      <section>
        <SectionHeader title="Detailed Operating Pages" id="cross-links" />
        <CrossLinksFooter />
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="pt-2 pb-4 space-y-1">
        <p className="text-[10px] text-muted-foreground">
          Pilot v1.0 · Executive compliance health overview · Sample/demo data only · Not a legal compliance determination
        </p>
        <p className="text-[10px] text-muted-foreground">
          This dashboard is read-only. It does not edit, approve, reject, publish, or mutate any controlled reference data or operational data.
        </p>
      </div>
    </div>
  );
}

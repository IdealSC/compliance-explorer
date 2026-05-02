'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  List, Truck, Rocket, AlertTriangle, FileCheck,
  ArrowRight, Shield, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { TableScrollWrapper } from '@/components/tables/TableScrollWrapper';
import { SeverityBadge, FlagBadge } from '@/components/badges';
import { getRequirements, getRisks, getEvidence, getRequirementMap } from '@/lib/data';
import type { Requirement, Risk } from '@/types';

/* ── Color palette ────────────────────────────────────────── */
const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  primary: '#6366f1',
  accent1: '#06b6d4',
  accent2: '#8b5cf6',
  accent3: '#10b981',
  accent4: '#f43f5e',
  accent5: '#3b82f6',
  muted: '#94a3b8',
};

const CHART_PALETTE = [
  COLORS.primary, COLORS.accent1, COLORS.accent3, COLORS.high,
  COLORS.accent2, COLORS.accent4, COLORS.accent5, COLORS.medium,
  COLORS.muted, '#d946ef',
];

/* ── Status badge (inline for risk preview) ───────────────── */
function MiniStatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const lower = value.toLowerCase();
  let style = 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400';
  if (lower.includes('required') || lower.includes('pending')) {
    style = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-snug ${style}`}>
      {value.length > 25 ? value.slice(0, 25) + '…' : value}
    </span>
  );
}

/* ── Data preparation helpers ─────────────────────────────── */
function countBy(items: Requirement[], field: keyof Requirement): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const raw = item[field];
    const key = typeof raw === 'string' && raw.trim() ? raw.trim() : 'Not specified';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/* ── Custom Recharts tooltip ──────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-bold text-primary">{payload[0].value} requirements</p>
    </div>
  );
}

/* ── Page component ──────────────────────────────────────── */
export default function DashboardPage() {
  const requirements = React.useMemo(() => getRequirements(), []);
  const risks = React.useMemo(() => getRisks(), []);
  const evidence = React.useMemo(() => getEvidence(), []);
  const reqMap = React.useMemo(() => getRequirementMap(), []);

  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const openDrawer = (req: Requirement) => {
    setSelectedReq(req);
    setDrawerOpen(true);
  };

  /* ── KPI calculations ──────────────────────────────────── */
  const kpis = React.useMemo(() => {
    const total = requirements.length;
    const launchCritical = requirements.filter((r) => r.launchCriticalFlag).length;
    const critHigh = requirements.filter(
      (r) => r.severityPriority === 'Critical' || r.severityPriority === 'High'
    ).length;
    const needsReview = requirements.filter((r) => r.needsReviewFlag).length;
    return { total, launchCritical, critHigh, needsReview, risks: risks.length, evidence: evidence.length };
  }, [requirements, risks, evidence]);

  /* ── Chart data ─────────────────────────────────────────── */
  const scorData = React.useMemo(() => {
    const order = ['PLAN', 'SOURCE', 'MAKE', 'DELIVER', 'RETURN', 'ENABLE'];
    const data = countBy(requirements, 'scorPhase');
    return order.map((phase) => ({
      name: phase,
      value: data.find((d) => d.name === phase)?.value || 0,
    }));
  }, [requirements]);

  const severityData = React.useMemo(() => {
    const order = ['Critical', 'High', 'Medium'];
    const data = countBy(requirements, 'severityPriority');
    return order.map((s) => ({
      name: s,
      value: data.find((d) => d.name === s)?.value || 0,
    }));
  }, [requirements]);

  const jurisdictionData = React.useMemo(
    () => countBy(requirements, 'jurisdictionRegion').slice(0, 8),
    [requirements]
  );

  const lifecycleData = React.useMemo(
    () => countBy(requirements, 'lifecycleStage').slice(0, 8),
    [requirements]
  );

  /* ── Risk preview (top 5 Critical) ─────────────────────── */
  const topRisks = React.useMemo(
    () => risks.filter((r) => r.severityPriority === 'Critical').slice(0, 5),
    [risks]
  );

  /* ── Needs Review preview ──────────────────────────────── */
  const needsReviewRows = React.useMemo(
    () => requirements.filter((r) => r.needsReviewFlag).slice(0, 8),
    [requirements]
  );

  /* ── Navigation cards config ───────────────────────────── */
  const navCards = [
    {
      title: 'All Requirements',
      description: 'Full compliance matrix with search, filters, and sortable columns.',
      count: requirements.length,
      unit: 'requirements',
      href: '/requirements',
      icon: List,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Supply Chain View',
      description: 'Curated obligations relevant to supply chain operations leaders.',
      count: requirements.filter((r) =>
        r.primaryPersonaViewer === 'Supply Chain Leader' ||
        r.businessFunctionImpacted?.toLowerCase().includes('supply chain')
      ).length,
      unit: 'obligations',
      href: '/supply-chain',
      icon: Truck,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Launch-Critical',
      description: 'Requirements flagged as critical for commercial launch readiness.',
      count: kpis.launchCritical,
      unit: 'obligations',
      href: '/launch-critical',
      icon: Rocket,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Highest Risk',
      description: 'The most critical, complex, or high-impact compliance risks.',
      count: risks.length,
      unit: 'risks',
      href: '/risks',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Evidence',
      description: 'Documentation, records, and proof points needed for compliance.',
      count: evidence.length,
      unit: 'evidence items',
      href: '/evidence',
      icon: FileCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ══════════════════════════════════════════════════════
          1. HERO / INTRO SECTION
          ══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-start gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary mt-0.5 shrink-0" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Regulatory Compliance Explorer
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground max-w-3xl">
              A role-based compliance and launch-readiness navigation tool for pharmaceutical
              supply chain, quality, regulatory, legal, manufacturing, procurement, and digital
              operations leaders.
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20 px-4 py-2.5">
          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            <span className="font-semibold">Pilot disclaimer:</span> This is a compliance
            decision-support and navigation tool. It is not a validated GxP system, legal
            advice engine, QMS, or system of record.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. EXECUTIVE KPI CARDS
          ══════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Executive Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Requirements', value: kpis.total, href: '/requirements', accent: 'border-l-indigo-500' },
            { label: 'Launch-Critical', value: kpis.launchCritical, href: '/launch-critical', accent: 'border-l-rose-500' },
            { label: 'High / Critical', value: kpis.critHigh, href: '/requirements', accent: 'border-l-orange-500' },
            { label: 'Needs Review', value: kpis.needsReview, href: '/requirements', accent: 'border-l-amber-500' },
            { label: 'Highest Risks', value: kpis.risks, href: '/risks', accent: 'border-l-red-500' },
            { label: 'Evidence Items', value: kpis.evidence, href: '/evidence', accent: 'border-l-emerald-500' },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`group flex flex-col gap-0.5 overflow-hidden rounded-xl bg-card py-3 px-4 text-card-foreground ring-1 ring-foreground/10 border-l-4 ${card.accent} transition-all hover:ring-primary/30 hover:shadow-sm`}
            >
              <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {card.value}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. PRIORITY NAVIGATION CARDS
          ══════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Explore Views
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-foreground">
                    {card.count}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{card.unit}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. CHARTS / VISUAL SUMMARIES
          ══════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Compliance Landscape
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* SCOR Phase */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Requirements by SCOR Phase</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scorData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {scorData.map((_, i) => (
                      <Cell key={`scor-${i}`} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Requirements by Severity / Priority</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {severityData.map((entry, i) => (
                      <Cell
                        key={`sev-${i}`}
                        fill={
                          entry.name === 'Critical' ? COLORS.critical :
                          entry.name === 'High' ? COLORS.high :
                          COLORS.medium
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Jurisdiction */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Requirements by Jurisdiction / Region</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={jurisdictionData} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    width={140}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24} fill={COLORS.accent5} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lifecycle Stage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Requirements by Lifecycle Stage</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={lifecycleData} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    width={180}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24} fill={COLORS.accent2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. HIGHEST RISK PREVIEW (Top 5)
          ══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Top Critical Risks
          </h2>
          <Link
            href="/risks"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all risks
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <TableScrollWrapper stickyFirstCol>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Risk ID</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Risk Theme Category</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Primary Function</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Severity</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Mitigation Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Linked Req</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.map((risk) => {
                    const linked = risk.linkedMatrixRowId ? reqMap.get(risk.linkedMatrixRowId) : null;
                    return (
                      <tr
                        key={risk.riskId}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                          {risk.riskId}
                        </td>
                        <td className="px-4 py-2.5">{risk.riskThemeCategory || '—'}</td>
                        <td className="px-4 py-2.5">{risk.primaryFunction || '—'}</td>
                        <td className="px-4 py-2.5">
                          <SeverityBadge severity={risk.severityPriority} />
                        </td>
                        <td className="px-4 py-2.5">
                          <MiniStatusBadge value={risk.mitigationStatus} />
                        </td>
                        <td className="px-4 py-2.5">
                          {linked ? (
                            <button
                              onClick={() => openDrawer(linked)}
                              className="inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                            >
                              {risk.linkedMatrixRowId}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              {risk.linkedMatrixRowId || '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScrollWrapper>
          </CardContent>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. NEEDS REVIEW PREVIEW
          ══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Needs Review ({kpis.needsReview})
          </h2>
          <Link
            href="/requirements"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all requirements
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <TableScrollWrapper stickyFirstCol>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Matrix Row ID</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Regulatory Domain</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground max-w-[320px]">Summary</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Severity</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Launch-Critical</th>
                  </tr>
                </thead>
                <tbody>
                  {needsReviewRows.map((req) => (
                    <tr
                      key={req.matrixRowId}
                      onClick={() => openDrawer(req)}
                      className="border-b last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-2.5 font-mono font-semibold text-primary">
                        {req.matrixRowId}
                      </td>
                      <td className="px-4 py-2.5">{req.regulatoryDomain || '—'}</td>
                      <td className="px-4 py-2.5 max-w-[320px]">
                        <span className="line-clamp-1">{req.uiDisplaySummary || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <SeverityBadge severity={req.severityPriority} />
                      </td>
                      <td className="px-4 py-2.5">
                        <MiniStatusBadge value={req.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <FlagBadge value={req.launchCriticalFlag} variant="launch-critical" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollWrapper>
          </CardContent>
        </Card>
      </section>

      {/* ── RequirementDrawer (shared) ───────────────────── */}
      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

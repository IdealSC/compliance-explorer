'use client';

import Link from 'next/link';
import {
  Scale,
  Layers,
  Users,
  AlertTriangle,
  FileCheck,
  GitCompare,
  CircleAlert,
  BookOpen,
} from 'lucide-react';

interface FlowItem {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  description: string;
}

interface OperatingMapFlowProps {
  items: FlowItem[];
}

export function OperatingMapFlow({ items }: OperatingMapFlowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flow-card flow-connector group/flow relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center ring-1 ring-transparent`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/flow:bg-primary/20">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {item.value}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
              {item.label}
            </span>
            <span className="text-[10px] text-muted-foreground/70 leading-tight hidden sm:block">
              {item.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* Pre-defined flow item sets */

export function getTopFlowItems(counts: {
  obligations: number;
  scorPhases: number;
  functions: number;
  risks: number;
}): FlowItem[] {
  return [
    {
      label: 'Obligations',
      value: counts.obligations,
      icon: Scale,
      href: '/obligations',
      description: 'Laws, regulations, frameworks',
    },
    {
      label: 'SCOR Phases',
      value: counts.scorPhases,
      icon: Layers,
      href: '/obligations',
      description: 'Plan · Source · Make · Deliver',
    },
    {
      label: 'Business Functions',
      value: counts.functions,
      icon: Users,
      href: '/business-functions',
      description: 'Who needs to know & act',
    },
    {
      label: 'Risk Items',
      value: counts.risks,
      icon: AlertTriangle,
      href: '/risks',
      description: 'Highest-impact risks',
    },
  ];
}

export function getBottomFlowItems(counts: {
  evidence: number;
  crosswalks: number;
  gaps: number;
  sources: number;
}): FlowItem[] {
  return [
    {
      label: 'Evidence Items',
      value: counts.evidence,
      icon: FileCheck,
      href: '/evidence',
      description: 'Required documentation',
    },
    {
      label: 'Crosswalk Areas',
      value: counts.crosswalks,
      icon: GitCompare,
      href: '/crosswalk',
      description: 'Framework connections',
    },
    {
      label: 'Open Gaps',
      value: counts.gaps,
      icon: CircleAlert,
      href: '/gaps',
      description: 'Action items & questions',
    },
    {
      label: 'Sources',
      value: counts.sources,
      icon: BookOpen,
      href: '/sources',
      description: 'Regulatory source documents',
    },
  ];
}

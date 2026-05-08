import Link from 'next/link';
import {
  Map,
  BookOpen,
  Filter,
  Users,
  Library,
  Workflow,
} from 'lucide-react';

interface EntryDoor {
  href: string;
  label: string;
  description: string;
  bestFor: string;
  cta: string;
  icon: React.ElementType;
}

const entryDoors: EntryDoor[] = [
  {
    href: '/map',
    label: 'Landscape Map',
    description:
      'See how supply chain work connects across Plan, Source, Make, and Deliver.',
    bestFor: 'I need the big picture.',
    cta: 'Open Landscape Map',
    icon: Map,
  },
  {
    href: '/topics',
    label: 'Topics',
    description:
      'Look up a regulatory topic quickly and understand what it means for supply chain.',
    bestFor: 'A term came up in a meeting and I need to orient fast.',
    cta: 'Browse Topics',
    icon: BookOpen,
  },
  {
    href: '/applicability',
    label: 'What Applies to Us',
    description:
      'Filter requirements by jurisdiction, entity role, and lifecycle stage.',
    bestFor: 'What changes because of our role, market, or lifecycle stage?',
    cta: 'Check Applicability',
    icon: Filter,
  },
  {
    href: '/ownership',
    label: 'Ownership by Role',
    description:
      'Clarify what supply chain owns directly and where other functions or partners own adjacent responsibilities.',
    bestFor: 'Who owns this, and where is the handoff?',
    cta: 'View Ownership',
    icon: Users,
  },
  {
    href: '/sources',
    label: 'Sources & Standards',
    description:
      'Trace topics back to the regulators, standards, and source materials behind them.',
    bestFor: 'Where does this expectation come from?',
    cta: 'View Sources',
    icon: Library,
  },
  {
    href: '/map',
    label: 'Supply Chain Workstreams',
    description:
      'Orient by practical supply chain workstream: packaging, serialization, cold chain, distribution, returns, recalls, shortages, and outsourced manufacturing.',
    bestFor: 'What regulatory neighborhoods surround this workstream?',
    cta: 'Explore Workstreams',
    icon: Workflow,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-8 sm:pt-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight max-w-3xl">
          The regulatory landscape for biopharma supply chain execution.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A focused orientation tool for supply chain leaders moving from
          clinical development toward commercial execution. Understand what
          your function is accountable for, where ownership crosses into
          Quality, Regulatory, Manufacturing, Distribution, Legal, and
          partners, and which sources shape the work.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Start with the Landscape Map
          </Link>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Browse Topics
          </Link>
          <Link
            href="/applicability"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            See What Applies to Us
          </Link>
        </div>
      </section>

      {/* Entry Doors */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-6">
          Choose the lens that matches the question in front of you.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entryDoors.map((door) => {
            const Icon = door.icon;
            return (
              <Link
                key={door.label}
                href={door.href}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-base">{door.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {door.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground/80 italic">
                  Best for: &ldquo;{door.bestFor}&rdquo;
                </p>
                <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
                  {door.cta} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Landscape Preview */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-2">
          What the regulated supply chain touches
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Biopharma supply chain execution sits inside multiple regulatory
          neighborhoods. This map gives you a practical way to see the terrain.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              phase: 'Plan',
              topics: [
                'Supply planning',
                'Shortages and supply continuity',
                'Commercial readiness handoffs',
              ],
            },
            {
              phase: 'Source',
              topics: [
                'Supplier qualification touchpoints',
                'CDMO and 3PL relationships',
                'Importer and distributor role clarity',
              ],
            },
            {
              phase: 'Make',
              topics: [
                'Packaging',
                'Labeling and artwork',
                'Serialization',
                'Release and disposition handoffs',
              ],
            },
            {
              phase: 'Deliver',
              topics: [
                'Distribution',
                'Cold chain',
                'Returns',
                'Recalls',
                'Controlled temperature transport',
              ],
            },
          ].map(({ phase, topics }) => (
            <div
              key={phase}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-sm mb-3">{phase}</h3>
              <ul className="space-y-1.5">
                {topics.map((topic) => (
                  <li
                    key={topic}
                    className="text-sm text-muted-foreground leading-snug"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/map"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Full Landscape Map →
          </Link>
        </div>
      </section>

      {/* Common Paths */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-6">
          Common questions this tool helps answer
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              question: 'What does supply chain actually own here?',
              route: '/ownership',
            },
            {
              question: 'Does this apply in the US, EU, or both?',
              route: '/applicability',
            },
            {
              question:
                'What changes before and after commercial approval?',
              route: '/applicability',
            },
            {
              question: 'What is the source behind this expectation?',
              route: '/sources',
            },
            {
              question: 'What related topics should I understand next?',
              route: '/topics',
            },
          ].map(({ question, route }) => (
            <Link
              key={question}
              href={route}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{question}&rdquo;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Source Credibility */}
      <section className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          Source-backed, but built for orientation.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Compliance Explorer connects topics to relevant regulators,
          standards, and source materials. Sources are visible when needed,
          but the primary experience is designed for fast orientation and
          cross-functional supply chain leadership.
        </p>
        <p className="mt-4 text-xs text-muted-foreground/70">
          FDA · EMA · European Commission · USP · ICH · GDP / GMP references
          · Product and distribution standards
        </p>
        <div className="mt-4">
          <Link
            href="/sources"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Source Library →
          </Link>
        </div>
      </section>
    </div>
  );
}

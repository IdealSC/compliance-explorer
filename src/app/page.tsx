import Link from 'next/link';
import {
  Map,
  BookOpen,
  Filter,
  Users,
  Library,
  Workflow,
  ArrowRight,
  Globe,
  Building2,
  Clock,
  ChevronRight,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────── */

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
    href: '/map/workstreams',
    label: 'Supply Chain Workstreams',
    description:
      'Orient by practical supply chain workstream: packaging, serialization, cold chain, distribution, returns, recalls, shortages, and outsourced manufacturing.',
    bestFor: 'What regulatory neighborhoods surround this workstream?',
    cta: 'Explore Workstreams',
    icon: Workflow,
  },
];

const landscapeColumns = [
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
];

const commonPaths = [
  {
    question: 'What does supply chain actually own here?',
    route: '/ownership',
  },
  {
    question: 'Does this apply in the US, EU, or both?',
    route: '/applicability',
  },
  {
    question: 'What changes before and after commercial approval?',
    route: '/applicability/lifecycle',
  },
  {
    question: 'What is the source behind this expectation?',
    route: '/sources',
  },
  {
    question: 'What related topics should I understand next?',
    route: '/topics',
  },
];

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="home-page">
      {/* ── 1. Hero Orientation ────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-container">
          <h1 className="home-hero-headline">
            The regulatory landscape for biopharma supply chain execution.
          </h1>
          <p className="home-hero-body">
            A focused orientation tool for supply chain leaders moving from
            clinical development toward commercial execution. Understand what
            your function is accountable for, where ownership crosses into
            Quality, Regulatory, Manufacturing, Distribution, Legal, and
            partners, and which sources shape the work.
          </p>
          <div className="home-hero-actions">
            <Link href="/map" className="home-btn-primary">
              Start with the Landscape Map
              <ArrowRight className="home-btn-icon" aria-hidden="true" />
            </Link>
            <Link href="/topics" className="home-btn-secondary">
              Browse Topics
            </Link>
            <Link href="/applicability" className="home-btn-tertiary">
              See What Applies to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Operating Context Display ───────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-context-bar">
            <div className="home-context-header">
              <span className="home-context-label">Set your operating context</span>
            </div>
            <div className="home-context-pills">
              <span className="home-context-pill">
                <Globe className="home-context-pill-icon" aria-hidden="true" />
                US + EU
              </span>
              <span className="home-context-pill">
                <Building2 className="home-context-pill-icon" aria-hidden="true" />
                NDA Holder
              </span>
              <span className="home-context-pill">
                <Clock className="home-context-pill-icon" aria-hidden="true" />
                Pre-commercial
              </span>
            </div>
            <p className="home-context-supporting">
              Your context changes which requirements are emphasized, who owns
              the work, and which handoffs matter most. You can change this
              anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Six Entry Doors ─────────────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <h2 className="home-section-headline">
            Choose the lens that matches the question in front of you.
          </h2>
          <div className="home-doors-grid">
            {entryDoors.map((door) => {
              const Icon = door.icon;
              return (
                <Link
                  key={door.label}
                  href={door.href}
                  className="home-door-card"
                >
                  <div className="home-door-header">
                    <div className="home-door-icon-wrap">
                      <Icon className="home-door-icon" aria-hidden="true" />
                    </div>
                    <h3 className="home-door-label">{door.label}</h3>
                  </div>
                  <p className="home-door-description">{door.description}</p>
                  <p className="home-door-best-for">
                    Best for: &ldquo;{door.bestFor}&rdquo;
                  </p>
                  <span className="home-door-cta">
                    {door.cta}
                    <ChevronRight className="home-door-cta-icon" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Landscape Preview ───────────────────────────────────── */}
      <section className="home-section home-landscape-section">
        <div className="home-container">
          <h2 className="home-section-headline">
            What the regulated supply chain touches
          </h2>
          <p className="home-section-subline">
            Biopharma supply chain execution sits inside multiple regulatory
            neighborhoods. This map gives you a practical way to see the terrain
            without turning the product into a compliance database.
          </p>
          <div className="home-landscape-grid">
            {landscapeColumns.map(({ phase, topics }) => (
              <div key={phase} className="home-landscape-column">
                <h3 className="home-landscape-phase">{phase}</h3>
                <ul className="home-landscape-topics">
                  {topics.map((topic) => (
                    <li key={topic} className="home-landscape-topic">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="home-section-cta-wrap">
            <Link href="/map" className="home-section-cta">
              View Full Landscape Map
              <ArrowRight className="home-btn-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Common Question-Based Paths ─────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <h2 className="home-section-headline">
            Common questions this tool helps answer
          </h2>
          <div className="home-paths-grid">
            {commonPaths.map(({ question, route }) => (
              <Link key={question} href={route} className="home-path-card">
                <span className="home-path-question">
                  &ldquo;{question}&rdquo;
                </span>
                <ChevronRight
                  className="home-path-arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Source Credibility Strip ─────────────────────────────── */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-credibility-strip">
            <h2 className="home-credibility-headline">
              Source-backed, but built for orientation.
            </h2>
            <p className="home-credibility-body">
              Compliance Explorer connects topics to relevant regulators,
              standards, and source materials. Sources are visible when needed,
              but the primary experience is designed for fast orientation and
              cross-functional supply chain leadership.
            </p>
            <p className="home-credibility-sources">
              FDA · EMA · European Commission · USP · ICH · GDP / GMP
              references · Product and distribution standards
            </p>
            <Link href="/sources/library" className="home-section-cta">
              View Source Library
              <ArrowRight className="home-btn-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

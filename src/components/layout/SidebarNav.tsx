'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Rocket,
  AlertTriangle,
  FileCheck,
  List,
  Shield,
  Menu,
  X,
  Network,
  Users,
  GitCompare,
  CircleAlert,
  BookOpen,
  History,
  ClipboardList,
  ScrollText,
  FileDiff,
  CheckSquare,
  BarChart3,
  ClipboardCheck,
  FileSpreadsheet,
  Database,
  ActivitySquare,
  Gauge,
  Clock,
  Inbox,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoUserPanel } from '@/components/auth/DemoUserPanel';
import * as React from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string | null; // null = no section header (top-level)
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: null,
    items: [
      { href: '/', label: 'Operating Map', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Explore',
    items: [
      { href: '/obligations', label: 'Obligation Matrix', icon: Network },
      { href: '/business-functions', label: 'Business Functions', icon: Users },
      { href: '/crosswalk', label: 'Standards Crosswalk', icon: GitCompare },
      { href: '/requirements', label: 'All Requirements', icon: List },
    ],
  },
  {
    title: 'Monitor',
    items: [
      { href: '/executive-dashboard', label: 'Executive Dashboard', icon: Gauge },
      { href: '/action-center', label: 'Action Center', icon: ClipboardCheck },
      { href: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
      { href: '/controls-evidence', label: 'Controls & Evidence Ownership', icon: Shield },
      { href: '/risks', label: 'Risk Register', icon: AlertTriangle },
    ],
  },
  {
    title: 'Curated Views',
    items: [
      { href: '/supply-chain', label: 'Supply Chain', icon: Truck },
      { href: '/launch-critical', label: 'Launch-Critical', icon: Rocket },
    ],
  },
  {
    title: 'Governance',
    items: [
      { href: '/regulatory-updates', label: 'Regulatory Updates', icon: ScrollText },
      { href: '/impact-analysis', label: 'Impact Analysis', icon: BarChart3 },
      { href: '/draft-mapping', label: 'Draft Workspace', icon: FileDiff },
      { href: '/review-approval', label: 'Review & Approval', icon: CheckSquare },
      { href: '/version-history', label: 'Version History', icon: History },
      { href: '/as-of-trace', label: 'As-Of Trace', icon: Clock },
      { href: '/audit-log', label: 'Audit Log', icon: ClipboardList },
      { href: '/source-intake', label: 'Source Intake', icon: Inbox },
      { href: '/source-registry', label: 'Source Registry', icon: Database },
      { href: '/data-quality', label: 'Data Quality & Validation', icon: ActivitySquare },
      { href: '/ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
      { href: '/validation-workbench', label: 'Validation Workbench', icon: ShieldCheck },
    ],
  },
  {
    title: 'Legacy Reference',
    items: [
      { href: '/evidence', label: 'Evidence Register (Legacy)', icon: FileCheck },
      { href: '/gaps', label: 'Gaps & Actions (Legacy)', icon: CircleAlert },
      { href: '/sources', label: 'Source Inventory (Legacy)', icon: BookOpen },
    ],
  },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {navSections.map((section, si) => (
        <div key={si}>
          {section.title && (
            <div className="nav-section-label">{section.title}</div>
          )}
          {section.items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile nav on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3"
        role="banner"
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
        <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold">Compliance Operating Map</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-nav"
        className={cn(
          'lg:hidden fixed top-[52px] left-0 bottom-0 z-30 w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-border transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
          <NavLinks pathname={pathname} />
        </nav>
        <DemoUserPanel />
      </aside>

      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-5">
          <Shield className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold leading-tight">Compliance Operating Map</p>
            <p className="text-xs text-muted-foreground">Regulatory intelligence pilot</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </nav>

        {/* User panel */}
        <DemoUserPanel />
      </aside>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Database,
  CheckSquare,
  Activity,
  Archive,
  Compass,
  Inbox,
  ClipboardList,
  ShieldCheck,
  ScrollText,
  ActivitySquare,
  History,
  ClipboardCheck,
  FileDiff,
  CircleAlert,
  Gauge,
  FileCheck,
  BookOpen,
  AlertTriangle,
  Network,
  GitCompare,
  Shield,
  BarChart3,
  FileSpreadsheet,
  Rocket,
  Truck,
  Sparkles,
  Users,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoUserPanel } from '@/components/auth/DemoUserPanel';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNavSections: NavSection[] = [
  {
    title: 'Content',
    items: [
      { href: '/admin/content/drafts', label: 'Topic Drafts', icon: FileDiff },
      { href: '/admin/content/requirements', label: 'Requirement Records', icon: List },
    ],
  },
  {
    title: 'Sources',
    items: [
      { href: '/admin/sources/intake', label: 'Source Intake', icon: Inbox },
      { href: '/admin/sources/registry', label: 'Source Registry', icon: Database },
      { href: '/admin/sources/trace', label: 'As-Of Trace', icon: ClipboardList },
    ],
  },
  {
    title: 'Review',
    items: [
      { href: '/admin/review/approval', label: 'Review & Approval', icon: CheckSquare },
      { href: '/admin/review/validation', label: 'Validation Workbench', icon: ShieldCheck },
    ],
  },
  {
    title: 'Monitor',
    items: [
      { href: '/admin/monitor/updates', label: 'Regulatory Updates', icon: ScrollText },
      { href: '/admin/monitor/quality', label: 'Data Quality', icon: ActivitySquare },
      { href: '/admin/monitor/history', label: 'Version History', icon: History },
      { href: '/admin/monitor/audit', label: 'Audit Log', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Legacy',
    items: [
      { href: '/admin/legacy/evidence', label: 'Evidence Register', icon: FileCheck },
      { href: '/admin/legacy/gaps', label: 'Gaps & Actions', icon: CircleAlert },
      { href: '/admin/legacy/dashboard', label: 'Executive Dashboard', icon: Gauge },
      { href: '/admin/legacy/action-center', label: 'Action Center', icon: ClipboardCheck },
      { href: '/admin/legacy/obligations', label: 'Obligation Matrix', icon: Network },
      { href: '/admin/legacy/crosswalk', label: 'Standards Crosswalk', icon: GitCompare },
      { href: '/admin/legacy/risks', label: 'Risk Register', icon: AlertTriangle },
      { href: '/admin/legacy/controls', label: 'Controls & Evidence', icon: Shield },
      { href: '/admin/legacy/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
      { href: '/admin/legacy/impact', label: 'Impact Analysis', icon: BarChart3 },
      { href: '/admin/legacy/launch-critical', label: 'Launch-Critical', icon: Rocket },
      { href: '/admin/legacy/supply-chain', label: 'Supply Chain View', icon: Truck },
      { href: '/admin/legacy/ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
      { href: '/admin/legacy/business-functions', label: 'Business Functions', icon: Users },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0"
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <Compass className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold leading-tight">
            ISC Compliance Explorer
          </p>
          <p className="text-xs text-muted-foreground">
            ▸ Admin
          </p>
        </div>
      </div>

      {/* Admin home link */}
      <div className="px-3 pt-4 pb-1">
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/admin'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
          Editor Workspace
        </Link>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto" aria-label="Admin navigation">
        {adminNavSections.map((section) => (
          <div key={section.title}>
            <div className="nav-section-label">{section.title}</div>
            {section.items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
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
      </nav>

      {/* View public site link */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← View Public Site
        </Link>
      </div>

      {/* User panel */}
      <DemoUserPanel />
    </aside>
  );
}

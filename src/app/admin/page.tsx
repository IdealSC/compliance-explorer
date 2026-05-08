import Link from 'next/link';
import type { Metadata } from 'next';
import {
  FileText,
  Database,
  CheckSquare,
  Activity,
  Archive,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editor Workspace — ISC Compliance Explorer Admin',
  description: 'Admin workspace for managing compliance content, sources, review, and monitoring.',
};

const adminCategories = [
  {
    title: 'Content',
    href: '/admin/content/drafts',
    description: 'Topic drafts, requirement records, source records.',
    icon: FileText,
  },
  {
    title: 'Sources',
    href: '/admin/sources/intake',
    description: 'Source intake, registry, validation, as-of trace.',
    icon: Database,
  },
  {
    title: 'Review',
    href: '/admin/review/approval',
    description: 'Review queue, approval status, validation workbench.',
    icon: CheckSquare,
  },
  {
    title: 'Monitor',
    href: '/admin/monitor/updates',
    description: 'Regulatory updates, data quality, version history, audit log.',
    icon: Activity,
  },
  {
    title: 'Legacy',
    href: '/admin/legacy/dashboard',
    description: 'Legacy reference surfaces from earlier phases.',
    icon: Archive,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editor Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage compliance content, sources, review workflows, and system monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                <h2 className="font-semibold">{cat.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

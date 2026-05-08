'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export interface QuickViewItem {
  label: string;
  description: string;
  count: number;
  countLabel: string;
  icon: LucideIcon;
  href: string;
}

interface QuickViewGridProps {
  items: QuickViewItem[];
}

export function QuickViewGrid({ items }: QuickViewGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="quick-view-card group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 ring-1 ring-transparent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.count} {item.countLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

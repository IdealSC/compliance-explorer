'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SummaryCard {
  label: string;
  value: number;
  /** Optional accent: 'default' | 'critical' | 'warning' | 'info' */
  accent?: 'default' | 'critical' | 'warning' | 'info';
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

const ACCENT_STYLES: Record<string, string> = {
  default: 'border-l-primary/50',
  critical: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-violet-500',
};

export function SummaryCards({ cards }: SummaryCardsProps) {
  const colClass =
    cards.length <= 4 ? 'sm:grid-cols-4' :
    cards.length === 5 ? 'sm:grid-cols-5' :
    'sm:grid-cols-3 lg:grid-cols-6';

  return (
    <div className={`grid grid-cols-2 ${colClass} gap-3`}>
      {cards.map((card) => (
        <Card
          key={card.label}
          size="sm"
          className={cn(
            'border-l-4',
            ACCENT_STYLES[card.accent || 'default']
          )}
        >
          <CardContent className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

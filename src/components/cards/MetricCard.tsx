'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'red' | 'amber';
}

export function MetricCard({ label, value, icon, variant = 'default' }: MetricCardProps) {
  return (
    <Card className={`${
      variant === 'red' && value > 0 ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20' :
      variant === 'amber' && value > 0 ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' :
      ''
    }`}>
      <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </CardContent>
    </Card>
  );
}

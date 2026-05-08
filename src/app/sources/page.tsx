import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sources & Standards — ISC Compliance Explorer',
  description:
    'Trace topics back to regulators, standards, and source materials.',
};

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sources & Standards
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Trace topics back to the regulators, standards, and source
          materials behind them. Compliance Explorer connects topics to
          relevant sources so you can see where expectations come from
          without turning the experience into a regulation database.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Sources & Standards content will be implemented in a future phase.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Back to Start Here
        </Link>
      </div>
    </div>
  );
}

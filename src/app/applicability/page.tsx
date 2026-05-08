import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Applies to Us — ISC Compliance Explorer',
  description:
    'Filter requirements by jurisdiction, entity role, and lifecycle stage.',
};

export default function ApplicabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          What Applies to Us
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Understand which requirements are relevant based on jurisdiction,
          entity role, and lifecycle stage. Filter by your operating context
          to see what changes for NDA holders, MAHs, importers, distributors,
          3PLs, or CDMO relationships.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Applicability views will be implemented in a future phase.
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

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ownership by Role — ISC Compliance Explorer',
  description:
    'Clarify what supply chain owns and where other functions own adjacent work.',
};

export default function OwnershipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Ownership by Role
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Clarify what supply chain owns directly and where other functions
          or partners own adjacent responsibilities. See ownership
          boundaries for Head of Supply Chain, Supply Planning, Package
          Engineering, Serialization, Distribution, Cold Chain, and more.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Ownership views will be implemented in a future phase.
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

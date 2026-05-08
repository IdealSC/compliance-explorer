import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topics — ISC Compliance Explorer',
  description:
    'Look up a regulatory topic and understand what it means for supply chain.',
};

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Look up a regulatory topic quickly and understand what it means for
          supply chain. Each topic page provides a 90-second scan and
          5-minute read covering ownership, applicability, regulatory chain,
          and connected topics.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Topic pages will be implemented in a future phase.
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

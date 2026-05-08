import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Landscape Map — ISC Compliance Explorer',
  description:
    'See how supply chain work connects across Plan, Source, Make, and Deliver.',
};

export default function LandscapeMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Landscape Map
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          See how supply chain work connects across Plan, Source, Make, and
          Deliver. The landscape map provides a visual orientation surface
          showing how regulated biopharma supply chain work connects to
          regulatory expectations.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Landscape Map content will be implemented in a future phase.
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

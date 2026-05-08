import Link from 'next/link';
import { Workflow, ArrowLeft } from 'lucide-react';

export default function WorkstreamsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link
        href="/map"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Landscape Map
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <Workflow className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Supply Chain Workstreams
        </h1>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-xl">
        Orient by practical supply chain workstream — packaging, serialization,
        cold chain, distribution, returns, recalls, shortages, and outsourced
        manufacturing. See which regulatory neighborhoods surround each
        workstream.
      </p>
      <p className="text-sm text-muted-foreground/60 italic">
        This page will be populated in a future phase.
      </p>
    </div>
  );
}

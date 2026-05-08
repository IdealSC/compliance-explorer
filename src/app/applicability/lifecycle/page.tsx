import Link from 'next/link';
import { Filter, ArrowLeft } from 'lucide-react';

export default function LifecyclePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link
        href="/applicability"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to What Applies to Us
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lifecycle Stage Applicability
        </h1>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-xl">
        Understand what changes before and after commercial approval. See which
        requirements shift as your product moves through clinical development,
        pre-approval, launch, and post-market stages.
      </p>
      <p className="text-sm text-muted-foreground/60 italic">
        This page will be populated in a future phase.
      </p>
    </div>
  );
}

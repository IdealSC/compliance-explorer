import Link from 'next/link';
import { Library, ArrowLeft } from 'lucide-react';

export default function SourceLibraryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link
        href="/sources"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sources &amp; Standards
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <Library className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Source Library
        </h1>
      </div>
      <p className="text-muted-foreground leading-relaxed max-w-xl">
        Browse the full library of regulatory source materials referenced across
        Compliance Explorer — laws, regulations, guidance documents, standards,
        and industry references.
      </p>
      <p className="text-sm text-muted-foreground/60 italic">
        This page will be populated in a future phase.
      </p>
    </div>
  );
}

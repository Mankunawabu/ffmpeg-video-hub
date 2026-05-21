import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResultsDashboard } from "@/components/results-dashboard";

export default function ResultsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* ── PAGE HEADER ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-900 dark:via-neutral-950 dark:to-blue-950/20 p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Hasil Kompresi
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Dashboard Hasil & Riwayat
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            Seluruh data dihitung dari hasil kompresi nyata yang tersimpan di storage lokal JSON.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center gap-3 py-16 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            <span className="text-sm">Memuat dashboard hasil…</span>
          </div>
        }
      >
        <ResultsDashboard />
      </Suspense>
    </div>
  );
}

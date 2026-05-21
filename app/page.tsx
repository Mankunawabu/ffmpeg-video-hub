"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  Upload, Film, HardDrive, TrendingDown, Zap, ArrowRight,
  FileVideo, Clock, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";

type RecordItem = {
  id: string;
  originalName: string;
  processedAt: string;
  status: "berhasil" | "gagal";
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  percentageSaving: number;
  processTimeMs: number;
};

type HistoryStats = {
  totalKompresi: number;
  rataRataCompressionRatio: number;
  rataRataPenghematan: number;
};

type HistoryResponse = {
  ok: boolean;
  records: RecordItem[];
  stats: HistoryStats;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const }
  })
};

export default function HomePage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((json: HistoryResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const records = data?.records ?? [];
  const stats = data?.stats;
  const isEmpty = !loading && records.length === 0;

  // Chart data — size comparison for latest 7
  const chartSizeData = records.slice(0, 7).reverse().map((r) => ({
    name: r.originalName.length > 12 ? r.originalName.slice(0, 12) + "…" : r.originalName,
    "Asli (MB)": parseFloat((r.originalSizeBytes / 1024 / 1024).toFixed(2)),
    "Hasil (MB)": parseFloat((r.compressedSizeBytes / 1024 / 1024).toFixed(2)),
  }));

  // Chart data — saving per session
  const chartSavingData = records.slice(0, 10).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    penghematan: parseFloat(r.percentageSaving.toFixed(1)),
  }));

  const totalOriginal = records.reduce((s, r) => s + r.originalSizeBytes, 0);
  const totalCompressed = records.reduce((s, r) => s + r.compressedSizeBytes, 0);
  const totalSaved = totalOriginal - totalCompressed;

  return (
    <div className="space-y-8 pb-12">

      {/* ── HERO ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 dark:from-neutral-900 dark:via-neutral-950 dark:to-emerald-950/20 p-8 md:p-10"
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl dark:bg-teal-500/10" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              FFmpeg Video Hub — Live Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Analitik Hasil <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Kompresi Video
              </span>
            </h1>
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Data ringkasan dihitung langsung dari seluruh riwayat kompresi yang telah berhasil dijalankan melalui FFmpeg.
            </p>
          </div>
          <div className="flex w-full md:w-auto shrink-0 items-center justify-end gap-3 sm:justify-start">
            <Link href="/compress" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex-1 sm:flex-none whitespace-nowrap">
              <Upload className="h-4 w-4 shrink-0" />
              Mulai Kompres
            </Link>
            <Link href="/results" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 px-5 py-3 text-sm font-semibold transition-all flex-1 sm:flex-none whitespace-nowrap">
              Lihat Riwayat <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm">Memuat data dari storage lokal…</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Kompresi",
                value: isEmpty ? "0" : `${stats?.totalKompresi ?? 0}`,
                unit: "video",
                icon: Film,
                color: "emerald",
                glow: "rgba(16,185,129,0.15)",
              },
              {
                label: "Total Dihemat",
                value: isEmpty ? "0 B" : formatBytes(totalSaved),
                unit: "ruang disk",
                icon: HardDrive,
                color: "teal",
                glow: "rgba(20,184,166,0.15)",
              },
              {
                label: "Avg. Penghematan",
                value: isEmpty ? "0%" : `${(stats?.rataRataPenghematan ?? 0).toFixed(1)}%`,
                unit: "per video",
                icon: TrendingDown,
                color: "blue",
                glow: "rgba(59,130,246,0.15)",
              },
              {
                label: "Avg. Rasio Kompresi",
                value: isEmpty ? "0x" : `${(stats?.rataRataCompressionRatio ?? 0).toFixed(2)}x`,
                unit: "lebih kecil",
                icon: Zap,
                color: "violet",
                glow: "rgba(139,92,246,0.15)",
              },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6 transition-all hover:-translate-y-0.5"
                style={{
                  boxShadow: `0 0 0 1px transparent`,
                  transition: "box-shadow .3s, transform .3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${kpi.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px transparent`;
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{kpi.value}</p>
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{kpi.unit}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-500`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── CHARTS ───────────────────────────────────── */}
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/30 py-20 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100 dark:bg-white/5 text-neutral-400">
                <FileVideo className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">Belum ada data kompresi</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Grafik dan analitik akan otomatis muncul setelah Anda menjalankan kompresi video pertama.
                </p>
              </div>
              <Link href="/compress" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Upload className="h-4 w-4" /> Kompres Video Sekarang
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Size comparison area chart */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6"
              >
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Perbandingan Ukuran (7 Terakhir)</p>
                    <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">Asli vs Hasil Kompresi</h2>
                  </div>
                  <span className="text-xs rounded-full border border-neutral-200 dark:border-white/10 px-2.5 py-1 text-neutral-500 dark:text-neutral-400">MB</span>
                </div>
                <div className="mt-5 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartSizeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gOri" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gKom" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.08)" />
                      <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,10,10,0.85)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Area type="monotone" dataKey="Asli (MB)" stroke="#94a3b8" strokeWidth={2} fill="url(#gOri)" />
                      <Area type="monotone" dataKey="Hasil (MB)" stroke="#10b981" strokeWidth={2.5} fill="url(#gKom)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-slate-400" />Asli</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-emerald-500" />Kompresi</span>
                </div>
              </motion.div>

              {/* Saving bar chart */}
              <motion.div
                custom={5}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6"
              >
                <div className="mb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Penghematan per Sesi (10 Terakhir)</p>
                  <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">% Ruang yang Dihemat</h2>
                </div>
                <div className="mt-5 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartSavingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.08)" />
                      <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip
                        cursor={{ fill: "rgba(16,185,129,0.06)" }}
                        contentStyle={{
                          background: "rgba(10,10,10,0.85)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                        formatter={(v) => v !== undefined ? [`${v}%`, "Penghematan"] : ["–", "Penghematan"]}
                      />
                      <Bar dataKey="penghematan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* ── RECENT RECORDS TABLE ────────────────────── */}
          {records.length > 0 && (
            <motion.div
              custom={6}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-white/[0.04]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Riwayat</p>
                  <h2 className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">5 Kompresi Terakhir</h2>
                </div>
                <Link href="/results" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-white/[0.04] text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th className="px-6 py-3 font-medium">Berkas</th>
                      <th className="px-4 py-3 font-medium">Asli</th>
                      <th className="px-4 py-3 font-medium">Hasil</th>
                      <th className="px-4 py-3 font-medium">Hemat</th>
                      <th className="px-4 py-3 font-medium">Waktu</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 5).map((r) => (
                      <tr key={r.id} className="border-b border-neutral-50 dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                              <FileVideo className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-neutral-900 dark:text-white max-w-[140px] truncate">{r.originalName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{formatBytes(r.originalSizeBytes)}</td>
                        <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400">{formatBytes(r.compressedSizeBytes)}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <TrendingDown className="h-3.5 w-3.5" />
                            {r.percentageSaving.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-neutral-500 dark:text-neutral-500">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {(r.processTimeMs / 1000).toFixed(1)}s
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {r.status === "berhasil" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Berhasil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" /> Gagal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

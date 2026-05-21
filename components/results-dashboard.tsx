"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  Download, PlayCircle, Loader2, TrendingDown, HardDrive,
  Timer, BarChart2, CheckCircle2, AlertCircle, FileVideo, ChevronRight
} from "lucide-react";
import { BeforeAfterVideo } from "@/components/before-after-video";
import {
  formatBytes,
  formatCompressionRatio,
  formatPercentage,
  formatProcessTime
} from "@/lib/metrics";

type RecordItem = {
  id: string;
  originalName: string;
  storedName: string;
  outputName: string;
  uploadedAt: string;
  processedAt: string;
  status: "berhasil" | "gagal";
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  percentageSaving: number;
  processTimeMs: number;
  durationSeconds?: number;
  resolution?: string;
  mimeType?: string;
  extension?: string;
  previewUrl: string;
  downloadUrl: string;
};

type HistoryResponse = {
  ok: boolean;
  records: RecordItem[];
  selected: RecordItem | null;
  stats: {
    totalKompresi: number;
    rataRataCompressionRatio: number;
    rataRataPenghematan: number;
  };
};

export function ResultsDashboard() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(selectedId);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 5;
  const totalRecords = data?.records?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentRecords = (data?.records || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      setLoading(true);
      const url = activeId ? `/api/history?id=${encodeURIComponent(activeId)}` : "/api/history";
      const response = await fetch(url);
      const json = (await response.json()) as HistoryResponse;
      if (active) {
        setData(json);
        setLoading(false);
      }
    }
    void loadHistory();
    return () => { active = false; };
  }, [activeId]);

  const selected = data?.selected ?? data?.records?.[0] ?? null;

  const compressedPercent = selected
    ? Math.max(6, (selected.compressedSizeBytes / selected.originalSizeBytes) * 100)
    : 0;

  const kpis = useMemo(() => {
    if (!selected) return [];
    return [
      { label: "Ukuran Asli", value: formatBytes(selected.originalSizeBytes), icon: HardDrive, color: "text-neutral-500" },
      { label: "Ukuran Hasil", value: formatBytes(selected.compressedSizeBytes), icon: HardDrive, color: "text-emerald-500" },
      { label: "Rasio Kompresi", value: `${formatCompressionRatio(selected.compressionRatio)}x`, icon: BarChart2, color: "text-blue-500" },
      { label: "Penghematan", value: formatPercentage(selected.percentageSaving), icon: TrendingDown, color: "text-emerald-500" },
      { label: "Waktu Proses", value: formatProcessTime(selected.processTimeMs), icon: Timer, color: "text-violet-500" },
      {
        label: "Status", value: selected.status === "berhasil" ? "Berhasil" : "Gagal",
        icon: selected.status === "berhasil" ? CheckCircle2 : AlertCircle,
        color: selected.status === "berhasil" ? "text-emerald-500" : "text-red-500"
      },
    ];
  }, [selected]);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm">Memuat data hasil kompresi…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Selected item KPIs */}
          {selected ? (
            <>
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex items-center gap-4 rounded-2xl border border-neutral-100 dark:border-white/[0.05] bg-neutral-50 dark:bg-white/[0.02] px-5 py-4"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/5 ${kpi.color}`}>
                      <kpi.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{kpi.label}</p>
                      <p className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">{kpi.value}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                {/* Size Comparison */}
                <Card>
                  <CardHeader>
                    <Badge>Perbandingan</Badge>
                    <CardTitle className="mt-2">Perbandingan ukuran berkas</CardTitle>
                    <CardDescription>Visualisasi ukuran sebelum dan sesudah kompresi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-600 dark:text-neutral-400">Ukuran asli</span>
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">{formatBytes(selected.originalSizeBytes)}</span>
                        </div>
                        <Progress value={100} />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">Ukuran hasil kompresi</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBytes(selected.compressedSizeBytes)}</span>
                        </div>
                        <Progress value={compressedPercent} />
                      </div>
                    </div>
                    <div className="grid gap-3 grid-cols-2">
                      {[
                        { label: "Compression Ratio", value: `${formatCompressionRatio(selected.compressionRatio)}x`, color: "text-blue-600 dark:text-blue-400" },
                        { label: "Penghematan Disk", value: formatPercentage(selected.percentageSaving), color: "text-emerald-600 dark:text-emerald-400" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-neutral-100 dark:border-white/[0.05] bg-neutral-50 dark:bg-white/[0.02] p-4">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                          <p className={`mt-1.5 text-2xl font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Video Preview */}
                <Card>
                  <CardHeader>
                    <Badge>Pratinjau</Badge>
                    <CardTitle className="mt-2">Pratinjau hasil kompresi</CardTitle>
                    <CardDescription>Video dapat diputar, dicari, dan ditampilkan penuh</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <BeforeAfterVideo 
                      originalUrl={`/api/media/uploads/${selected.storedName}`}
                      compressedUrl={selected.previewUrl}
                    />
                    <div className="grid gap-2.5 grid-cols-2">
                      <a href={selected.previewUrl} target="_blank" rel="noreferrer" className="block">
                        <Button variant="outline" className="w-full">
                          <PlayCircle className="h-4 w-4" /> Tab Baru
                        </Button>
                      </a>
                      <a href={selected.downloadUrl} className="block">
                        <Button className="w-full">
                          <Download className="h-4 w-4" /> Unduh
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          ) : null}

          {/* History Table */}
          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            {/* Table */}
            <Card>
              <CardHeader>
                <Badge>Riwayat</Badge>
                <CardTitle className="mt-2">Daftar proses kompresi</CardTitle>
                <CardDescription>Klik baris untuk melihat detail & pratinjau</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {(data?.records || []).length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-400">
                      <FileVideo className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">Belum ada riwayat kompresi</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Data akan muncul setelah Anda menyelesaikan kompresi video.</p>
                    </div>
                    <Link href="/compress">
                      <Button size="sm">Mulai Kompres Video</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-b-3xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-white/[0.04] text-left">
                          {["Berkas", "Ukuran Awal", "Hasil", "Hemat", "Status"].map((h) => (
                            <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={`border-b border-neutral-50 dark:border-white/[0.03] cursor-pointer transition-colors ${
                              (activeId ?? data?.records?.[0]?.id) === item.id
                                ? "bg-emerald-50 dark:bg-emerald-500/5"
                                : "hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                  <FileVideo className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium text-neutral-900 dark:text-white max-w-[120px] truncate">{item.originalName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400 text-xs">{formatBytes(item.originalSizeBytes)}</td>
                            <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400 text-xs">{formatBytes(item.compressedSizeBytes)}</td>
                            <td className="px-5 py-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatPercentage(item.percentageSaving)}</td>
                            <td className="px-5 py-3.5">
                              {item.status === "berhasil" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                                  <AlertCircle className="h-2.5 w-2.5" /> Gagal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-white/[0.04] px-5 py-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Menampilkan {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalRecords)} dari {totalRecords}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 px-3 text-xs"
                          >
                            Prev
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-8 px-3 text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <Badge>Ringkasan</Badge>
                <CardTitle className="mt-2">Ikhtisar data</CardTitle>
                <CardDescription>Dihitung dari seluruh riwayat yang tersimpan secara lokal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Jumlah Kompresi", value: `${data?.stats.totalKompresi ?? 0} video` },
                  { label: "Rata-rata Rasio", value: `${formatCompressionRatio(data?.stats.rataRataCompressionRatio ?? 0)}x` },
                  { label: "Rata-rata Penghematan", value: formatPercentage(data?.stats.rataRataPenghematan ?? 0) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-neutral-100 dark:border-white/[0.05] bg-neutral-50 dark:bg-white/[0.02] px-4 py-3.5">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.label}</p>
                    <p className="text-base font-bold text-neutral-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Video,
  FileText,
  Clock3,
  Ruler,
  BadgeCheck,
  AlertCircle,
  PlayCircle,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/providers";
import { BeforeAfterVideo } from "@/components/before-after-video";
import {
  formatBytes,
  formatCompressionRatio,
  formatDuration,
  formatPercentage,
  formatProcessTime
} from "@/lib/metrics";
import { validateVideoFile } from "@/lib/validator";

type UploadedFileInfo = {
  id: string;
  originalName: string;
  storedName: string;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  extension: string;
  uploadedAt: string;
  durationSeconds: number | null;
  resolution: string | null;
  previewUrl: string;
};

type CompressionRecord = {
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
  originalSizeFormatted?: string;
  compressedSizeFormatted?: string;
};

type StreamEvent =
  | { type: "log"; message: string }
  | { type: "result"; message: string; record: CompressionRecord }
  | { type: "error"; message: string };

export default function CompressPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Menunggu file video untuk diunggah..."
  ]);
  const [result, setResult] = useState<CompressionRecord | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const logScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs]);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
      type: selectedFile.type || "-",
      extension: selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase()
    };
  }, [selectedFile]);

  async function handleUpload(file: File) {
    const validation = validateVideoFile(file);
    if (!validation.ok) {
      toast({ title: "Validasi gagal", description: validation.message, variant: "danger" });
      setLogs((current) => [...current, `Validasi gagal: ${validation.message}`]);
      return;
    }

    setIsUploading(true);
    setResult(null);
    setSelectedPreview(null);
    setLogs([
      "Memvalidasi file...",
      "Mengunggah file ke server..."
    ]);
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Upload gagal");
      }

      const info = data.file as UploadedFileInfo;
      setUploadedInfo(info);
      setSelectedPreview(info.previewUrl);
      setSelectedFile(file);
      setLogs((current) => [...current, "File berhasil diunggah.", "Menganalisis metadata video..."]);
      setProgress(35);
      toast({ title: "Upload berhasil", description: "File video siap dikompresi.", variant: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload gagal";
      toast({ title: "Upload gagal", description: message, variant: "danger" });
      setLogs((current) => [...current, `Upload gagal: ${message}`]);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileSelection(file: File | null) {
    if (!file) return;
    await handleUpload(file);
  }

  async function handleCompress() {
    if (!uploadedInfo) {
      toast({
        title: "File video tidak boleh kosong",
        description: "Silakan unggah video terlebih dahulu.",
        variant: "danger"
      });
      return;
    }

    setIsCompressing(true);
    setProgress(45);
    setLogs((current) => [
      ...current,
      "Memulai proses kompresi FFmpeg...",
      "Menerapkan encoder libvpx-vp9...",
      "Menerapkan encoder audio libopus...",
      "Mengatur bitrate video 0.33 Mbps...",
      "Mengatur bitrate audio 96 kbps..."
    ]);

    try {
      const response = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storedName: uploadedInfo.storedName,
          originalName: uploadedInfo.originalName,
          uploadedAt: uploadedInfo.uploadedAt,
          fileId: uploadedInfo.id,
          mimeType: uploadedInfo.mimeType,
          extension: uploadedInfo.extension
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || "Kompresi gagal");
      }

      if (!response.body) {
        throw new Error("Respons kompresi tidak tersedia");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const event = JSON.parse(part) as StreamEvent;
          if (event.type === "log") {
            setLogs((current) => [...current, event.message]);
            setProgress((current) => Math.min(92, current + 7));
          }

          if (event.type === "result") {
            setResult(event.record);
            setLogs((current) => [...current, event.message, "Kompresi selesai."]);
            setProgress(100);
            setSelectedPreview(event.record.previewUrl);
            toast({
              title: "Kompresi berhasil",
              description: "Video hasil kompresi siap diputar dan diunduh.",
              variant: "success"
            });
            router.push(`/results?id=${encodeURIComponent(event.record.id)}`);
          }

          if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kompresi gagal";
      toast({ title: "Kompresi gagal", description: message, variant: "danger" });
      setLogs((current) => [...current, `Kompresi gagal: ${message}`]);
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    void handleFileSelection(file);
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── PAGE HEADER ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/[0.06] bg-gradient-to-br from-neutral-50 via-white to-teal-50/30 dark:from-neutral-900 dark:via-neutral-950 dark:to-teal-950/20 p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/10" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Modul Kompresi
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Kompresi Video dengan FFmpeg
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Unggah berkas video, sistem akan memvalidasi dan mengompresi menggunakan encoder libvpx-vp9.
          </p>
        </div>
      </div>

      {/* ── UPLOAD + FILE INFO ──────────────────── */}
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Upload Zone */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant={fileSummary ? "default" : "secondary"}>Langkah 1</Badge>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Unggah Berkas</span>
            </div>
            <CardTitle>Unggah berkas video</CardTitle>
            <CardDescription>Format yang didukung: MP4, AVI, MKV — maks. 100 MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`group relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                  : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] hover:border-emerald-400/60 dark:hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5"
              }`}
            >
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${dragActive ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-110" : "bg-neutral-100 dark:bg-white/5 text-neutral-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500"}`}>
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {dragActive ? "Lepaskan berkas di sini" : "Seret & lepas, atau klik untuk memilih"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">MP4, AVI, MKV · Maksimum 100 MB</p>
                </div>
                <Input
                  type="file"
                  accept=".mp4,.avi,.mkv,video/mp4,video/x-msvideo,video/x-matroska"
                  className="hidden"
                  onChange={(event) => void handleFileSelection(event.target.files?.[0] ?? null)}
                />
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Pilih Berkas
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Validasi Berkas", desc: "MIME, ekstensi, ukuran, dan integritas berkas diperiksa sebelum diproses." },
                { label: "Penyimpanan", desc: "Berkas video disimpan dan diproses secara aman dalam sistem." }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-neutral-100 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{item.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Info + Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant={fileSummary ? "default" : "secondary"}>Langkah 2</Badge>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Eksekusi</span>
            </div>
            <CardTitle>Detail berkas & kompresi</CardTitle>
            <CardDescription>Metadata muncul otomatis setelah berkas diunggah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Nama Berkas", value: uploadedInfo?.originalName || "—" },
                { label: "Ukuran", value: uploadedInfo?.sizeFormatted || "—" },
                { label: "Format", value: uploadedInfo?.extension?.toUpperCase() || "—" },
                { label: "Waktu Upload", value: uploadedInfo ? new Date(uploadedInfo.uploadedAt).toLocaleTimeString("id-ID") : "—" },
                { label: "Durasi", value: uploadedInfo?.durationSeconds ? formatDuration(uploadedInfo.durationSeconds) : "—" },
                { label: "Resolusi", value: uploadedInfo?.resolution || "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-neutral-100 dark:border-white/[0.05] bg-neutral-50 dark:bg-white/[0.02] px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">Progress Kompresi</span>
                <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* Status pill */}
            {fileSummary ? (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Siap: {fileSummary.name} ({fileSummary.size})
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Belum ada berkas yang dipilih</p>
              </div>
            )}

            <Button
              onClick={() => void handleCompress()}
              disabled={!uploadedInfo || isUploading || isCompressing}
              className="w-full"
              size="lg"
            >
              {isCompressing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Kompresi Berjalan…</>
              ) : isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah…</>
              ) : (
                <><BadgeCheck className="h-4 w-4" /> Jalankan Kompresi</>
              )}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ── LOG + PREVIEW ───────────────────────── */}
      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        {/* Process Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={fileSummary ? "default" : "secondary"}>Terminal</Badge>
                <CardTitle className="mt-2">Log Proses FFmpeg</CardTitle>
                <CardDescription>Setiap langkah dicatat secara real-time</CardDescription>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={logScrollRef}
              className="font-mono max-h-[360px] overflow-auto rounded-2xl border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-[#080808] p-4 text-xs scrollbar-hidden shadow-inner"
            >
              {logs.map((line, index) => (
                <div key={`${line}-${index}`} className="flex gap-2 mb-1.5 leading-relaxed">
                  <span className="shrink-0 text-neutral-400 dark:text-neutral-600">[{String(index + 1).padStart(2, "0")}]</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{line}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <Badge variant={fileSummary ? "default" : "secondary"}>Pratinjau</Badge>
            <CardTitle className="mt-2">Pratinjau hasil kompresi</CardTitle>
            <CardDescription>Video hasil kompresi dapat diputar langsung di sini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPreview && uploadedInfo ? (
              <BeforeAfterVideo 
                originalUrl={`/api/media/uploads/${uploadedInfo.storedName}`}
                compressedUrl={selectedPreview}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-400">
                  <Video className="h-5 w-5" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Pratinjau muncul setelah kompresi selesai</p>
              </div>
            )}

            {result ? (
              <div className="grid gap-2.5 md:grid-cols-2">
                <a href={result.previewUrl} target="_blank" rel="noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    <PlayCircle className="h-4 w-4" /> Pratinjau Tab Baru
                  </Button>
                </a>
                <a href={result.downloadUrl} className="block">
                  <Button className="w-full">
                    <Download className="h-4 w-4" /> Unduh Hasil
                  </Button>
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

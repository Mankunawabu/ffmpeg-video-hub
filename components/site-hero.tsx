"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Download,
  PlayCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function SiteHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95))] p-8 md:p-12 lg:p-14">
      <div className="absolute inset-0 bg-hero-grid opacity-[0.09] [mask-image:linear-gradient(180deg,black,transparent_90%)]" />
      <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <Badge className="mb-5">Aplikasi Kompresi Video</Badge>
          <h2 className="max-w-3xl font-[var(--font-space)] text-4xl leading-[1.05] tracking-tight text-slate-950 md:text-6xl">
            Sistem Kompresi Video Berbasis Web Menggunakan FFmpeg
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            Aplikasi ini menyediakan dua modul utama, yaitu kompresi video dan hasil kompresi, untuk
            mendukung demonstrasi, dokumentasi, dan pengujian fungsional proyek.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/compress">
              <Button size="lg">
                Akses Modul Kompresi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/results">
              <Button variant="outline" size="lg">
                Akses Hasil Kompresi
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Validasi berkas
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-sky-600" />
              Proses FFmpeg
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-[1.75rem] border p-6 md:p-7"
        >
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Ikhtisar modul
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { icon: UploadCloud, title: "Unggah Berkas", desc: "Proses validasi dan pengiriman file ke server." },
                { icon: Scissors, title: "Kompresi FFmpeg", desc: "Encoding video dan audio dilakukan secara nyata." },
                { icon: PlayCircle, title: "Pratinjau Hasil", desc: "Video hasil kompresi dapat diputar melalui browser." },
                { icon: Download, title: "Unduh Berkas", desc: "Hasil kompresi tersedia untuk diunduh." },
                { icon: BarChart3, title: "Analisis Metrik", desc: "Ukuran awal, ukuran akhir, dan rasio kompresi dihitung." },
                { icon: BadgeCheck, title: "Validasi", desc: "Berkas diperiksa sebelum diproses lebih lanjut." }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              { label: "Fokus", value: "Dua modul utama" },
              { label: "Output", value: "Video terkompresi" },
              { label: "Format", value: "WebM" },
              { label: "Metrik", value: "Rasio dan penghematan" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

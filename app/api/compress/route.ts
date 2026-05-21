import path from "path";
import { NextResponse } from "next/server";
import { compressVideoWithFfmpeg } from "@/lib/ffmpeg";
import { calculateMetrics, formatBytes } from "@/lib/metrics";
import {
  appendHistory,
  ensureStorage,
  getHistoryById,
  getStoragePaths,
  readHistory
} from "@/lib/storage";
import { extractVideoMetadata } from "@/lib/metadata";

export const runtime = "nodejs";

type CompressRequestBody = {
  storedName: string;
  originalName: string;
  uploadedAt?: string;
  fileId: string;
  mimeType?: string;
  extension?: string;
};

function streamEvent(controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
}

export async function POST(request: Request) {
  await ensureStorage();
  const body = (await request.json()) as CompressRequestBody;
  const uploadPath = path.join(getStoragePaths().uploads, body.storedName);

  if (!body.storedName || !body.fileId) {
    return NextResponse.json({ ok: false, message: "Data file tidak valid" }, { status: 400 });
  }

  const fs = await import("fs/promises");
  try {
    await fs.access(uploadPath);
  } catch {
    return NextResponse.json({ ok: false, message: "File sumber tidak ditemukan" }, { status: 404 });
  }

  const history = await readHistory();
  const existing = await getHistoryById(body.fileId);
  if (existing?.status === "berhasil") {
    const stream = new ReadableStream({
      start(controller) {
        streamEvent(controller, {
          type: "result",
          message: "Kompresi selesai.",
          record: existing
        });
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }

  const inputFile = history.find((item) => item.id === body.fileId);
  const originalName = body.originalName || inputFile?.originalName || body.storedName;

  const responseStream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now();
      try {
        streamEvent(controller, { type: "log", message: "Memvalidasi file..." });
        streamEvent(controller, { type: "log", message: "Mengunggah file ke server..." });
        streamEvent(controller, { type: "log", message: "Menganalisis metadata video..." });

        const metadata = await extractVideoMetadata(uploadPath);
        streamEvent(controller, { type: "log", message: "Memulai proses kompresi FFmpeg..." });
        streamEvent(controller, { type: "log", message: "Menerapkan encoder libvpx-vp9..." });
        streamEvent(controller, { type: "log", message: "Menerapkan encoder audio libopus..." });
        streamEvent(controller, { type: "log", message: "Mengatur bitrate video 0.33 Mbps..." });
        streamEvent(controller, { type: "log", message: "Mengatur bitrate audio 96 kbps..." });

        const outputBaseName = body.fileId;
        const compression = await compressVideoWithFfmpeg(
          {
            sourcePath: uploadPath,
            outputBaseName
          },
          (message) => streamEvent(controller, { type: "log", message })
        );

        streamEvent(controller, { type: "log", message: "Menyimpan hasil video..." });

        const compressedStats = await fs.stat(compression.outputPath);
        const originalStats = await fs.stat(uploadPath);
        const metrics = calculateMetrics(
          originalStats.size,
          compressedStats.size,
          Date.now() - startedAt
        );

        streamEvent(controller, { type: "log", message: "Menghitung metrik kompresi..." });

        const record = {
          id: body.fileId,
          originalName,
          storedName: body.storedName,
          outputName: `${body.fileId}.webm`,
          uploadedAt: body.uploadedAt || new Date().toISOString(),
          processedAt: new Date().toISOString(),
          status: "berhasil" as const,
          originalSizeBytes: metrics.originalSizeBytes,
          compressedSizeBytes: metrics.compressedSizeBytes,
          compressionRatio: metrics.compressionRatio,
          percentageSaving: metrics.percentageSaving,
          processTimeMs: metrics.processTimeMs,
          durationSeconds: metadata.durationSeconds ?? undefined,
          resolution: metadata.resolution ?? undefined,
          mimeType: body.mimeType,
          extension: body.extension,
          previewUrl: `/api/media/compressed/${encodeURIComponent(`${body.fileId}.webm`)}`,
          downloadUrl: `/api/media/compressed/${encodeURIComponent(`${body.fileId}.webm`)}?download=1`
        };

        await appendHistory(record);

        streamEvent(controller, {
          type: "result",
          message: "Kompresi selesai.",
          record: {
            ...record,
            originalSizeFormatted: formatBytes(record.originalSizeBytes),
            compressedSizeFormatted: formatBytes(record.compressedSizeBytes)
          }
        });
        controller.close();
      } catch (error) {
        streamEvent(controller, {
          type: "error",
          message: error instanceof Error ? error.message : "Proses kompresi gagal"
        });
        controller.close();
      }
    }
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

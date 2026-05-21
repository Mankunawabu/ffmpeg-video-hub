import path from "path";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ensureStorage, getStoragePaths, writeBuffer } from "@/lib/storage";
import {
  getExtension,
  sanitizeFileName,
  validateVideoFile
} from "@/lib/validator";
import { extractVideoMetadata, initFfmpeg } from "@/lib/metadata";
import { formatBytes } from "@/lib/metrics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureStorage();
  initFfmpeg();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "File video tidak boleh kosong" }, { status: 400 });
  }

  const validation = validateVideoFile(file);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, message: validation.message }, { status: 400 });
  }

  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const originalName = sanitizeFileName(file.name);
  const extension = getExtension(originalName);
  const storedName = `${id}${extension}`;
  const uploadPath = path.join(getStoragePaths().uploads, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeBuffer(uploadPath, buffer);

  const metadata = await extractVideoMetadata(uploadPath);

  return NextResponse.json({
    ok: true,
    file: {
      id,
      originalName,
      storedName,
      sizeBytes: file.size,
      sizeFormatted: formatBytes(file.size),
      mimeType: file.type || "video/octet-stream",
      extension,
      uploadedAt: new Date().toISOString(),
      durationSeconds: metadata.durationSeconds,
      resolution: metadata.resolution,
      previewUrl: `/api/media/uploads/${encodeURIComponent(storedName)}`
    }
  });
}

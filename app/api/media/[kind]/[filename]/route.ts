import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { getStoragePaths } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: { kind: string; filename: string } }
) {
  const { kind, filename } = context.params;
  const allowKinds = new Set(["uploads", "compressed"]);

  if (!allowKinds.has(kind)) {
    return NextResponse.json({ ok: false, message: "Jenis file tidak diizinkan" }, { status: 403 });
  }

  const filePath = path.join(getStoragePaths()[kind as "uploads" | "compressed"], filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ ok: false, message: "File tidak ditemukan" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  const readable = Readable.toWeb(stream) as ReadableStream;
  const download = new URL(request.url).searchParams.get("download") === "1";
  const contentType = filename.endsWith(".webm") ? "video/webm" : "application/octet-stream";

  return new Response(readable, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

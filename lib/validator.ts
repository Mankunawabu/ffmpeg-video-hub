export const allowedExtensions = [".mp4", ".avi", ".mkv"];

export const allowedMimeTypes = new Set([
  "video/mp4",
  "video/x-msvideo",
  "video/x-matroska",
  "video/avi",
  "video/webm"
]);

export function sanitizeFileName(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getExtension(fileName: string) {
  return fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
}

export function isValidVideoExtension(fileName: string) {
  return allowedExtensions.includes(getExtension(fileName));
}

export function isValidVideoMimeType(mimeType: string) {
  return mimeType.startsWith("video/") || allowedMimeTypes.has(mimeType);
}

export function validateVideoFile(
  file: { name: string; size: number; type: string } | null | undefined
) {
  if (!file || file.size === 0) {
    return { ok: false, message: "File video tidak boleh kosong" };
  }

  if (file.size > 100 * 1024 * 1024) {
    return { ok: false, message: "Ukuran file maksimal 100MB" };
  }

  const extensionValid = isValidVideoExtension(file.name);
  const mimeValid = isValidVideoMimeType(file.type || "");

  if (!extensionValid || !mimeValid) {
    return { ok: false, message: "Format file harus berupa video" };
  }

  return { ok: true, message: "Valid" };
}

import type { CompressionMetrics } from "@/lib/types";

export function calculateMetrics(
  originalSizeBytes: number,
  compressedSizeBytes: number,
  processTimeMs: number
): CompressionMetrics {
  const safeCompressed = Math.max(1, compressedSizeBytes);
  const compressionRatio = originalSizeBytes / safeCompressed;
  const percentageSaving = 100 - (compressedSizeBytes / Math.max(1, originalSizeBytes)) * 100;

  return {
    originalSizeBytes,
    compressedSizeBytes,
    compressionRatio,
    percentageSaving,
    processTimeMs
  };
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

export function formatFileSize(bytes: number) {
  return formatBytes(bytes);
}

export function formatCompressionRatio(value: number) {
  return value.toFixed(2);
}

export function formatPercentage(value: number) {
  return `${Math.max(0, value).toFixed(2)}%`;
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "-";
  const rounded = Math.floor(seconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatProcessTime(ms: number) {
  return `${(ms / 1000).toFixed(2)} detik`;
}

export type CompressionHistoryRecord = {
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

export type UploadInfo = {
  id: string;
  originalName: string;
  storedName: string;
  sizeBytes: number;
  mimeType: string;
  extension: string;
  uploadedAt: string;
  durationSeconds: number | null;
  resolution: string | null;
  previewUrl: string;
};

export type CompressionMetrics = {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  percentageSaving: number;
  processTimeMs: number;
};

export type HistoryStats = {
  totalKompresi: number;
  rataRataCompressionRatio: number;
  rataRataPenghematan: number;
};

import fs from "fs/promises";
import path from "path";
import type { CompressionHistoryRecord, HistoryStats } from "@/lib/types";

const root = process.cwd();
const storageDirs = {
  uploads: path.join(root, "uploads"),
  compressed: path.join(root, "compressed"),
  temp: path.join(root, "temp"),
  data: path.join(root, "data")
};
const historyFile = path.join(storageDirs.data, "history.json");

export async function ensureStorage() {
  await Promise.all([
    fs.mkdir(storageDirs.uploads, { recursive: true }),
    fs.mkdir(storageDirs.compressed, { recursive: true }),
    fs.mkdir(storageDirs.temp, { recursive: true }),
    fs.mkdir(storageDirs.data, { recursive: true })
  ]);

  try {
    await fs.access(historyFile);
  } catch {
    await fs.writeFile(historyFile, "[]", "utf8");
  }
}

export function getStoragePaths() {
  return storageDirs;
}

export async function readHistory(): Promise<CompressionHistoryRecord[]> {
  await ensureStorage();
  const raw = await fs.readFile(historyFile, "utf8");
  try {
    return JSON.parse(raw) as CompressionHistoryRecord[];
  } catch {
    return [];
  }
}

export async function writeHistory(records: CompressionHistoryRecord[]) {
  await ensureStorage();
  await fs.writeFile(historyFile, JSON.stringify(records, null, 2), "utf8");
}

export async function appendHistory(record: CompressionHistoryRecord) {
  const records = await readHistory();
  records.unshift(record);
  await writeHistory(records);
  return record;
}

export async function getHistoryById(id: string) {
  const records = await readHistory();
  return records.find((record) => record.id === id) ?? null;
}

export async function getHistoryStats(records?: CompressionHistoryRecord[]): Promise<HistoryStats> {
  const source = records ?? (await readHistory());
  if (source.length === 0) {
    return {
      totalKompresi: 0,
      rataRataCompressionRatio: 0,
      rataRataPenghematan: 0
    };
  }

  const totalRatio = source.reduce((sum, item) => sum + item.compressionRatio, 0);
  const totalSaving = source.reduce((sum, item) => sum + item.percentageSaving, 0);

  return {
    totalKompresi: source.length,
    rataRataCompressionRatio: totalRatio / source.length,
    rataRataPenghematan: totalSaving / source.length
  };
}

export async function deleteFileIfExists(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing files
  }
}

export async function moveFile(source: string, target: string) {
  await fs.rename(source, target);
}

export async function writeBuffer(filePath: string, buffer: Buffer) {
  await fs.writeFile(filePath, buffer);
}

export async function readBuffer(filePath: string) {
  return fs.readFile(filePath);
}

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}


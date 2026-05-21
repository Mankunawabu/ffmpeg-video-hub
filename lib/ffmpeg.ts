import fs from "fs/promises";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { initFfmpeg } from "@/lib/metadata";
import { deleteFileIfExists, getStoragePaths } from "@/lib/storage";

initFfmpeg();

export type CompressionJobInput = {
  sourcePath: string;
  outputBaseName: string;
};

export async function compressVideoWithFfmpeg(
  input: CompressionJobInput,
  onLog?: (message: string) => void
) {
  const { temp, compressed } = getStoragePaths();
  const tempOutput = path.join(temp, `${input.outputBaseName}.webm`);
  const finalOutput = path.join(compressed, `${input.outputBaseName}.webm`);

  await fs.mkdir(temp, { recursive: true });
  await fs.mkdir(compressed, { recursive: true });
  await deleteFileIfExists(tempOutput);
  await deleteFileIfExists(finalOutput);

  return new Promise<{ outputPath: string }>((resolve, reject) => {
    const command = ffmpeg(input.sourcePath)
      .output(tempOutput)
      .outputOptions(["-c:v libvpx-vp9", "-b:v 0.33M", "-c:a libopus", "-b:a 96k"])
      .format("webm")
      .on("start", () => onLog?.("Memulai proses kompresi FFmpeg..."))
      .on("codecData", () => onLog?.("Menganalisis metadata video..."))
      .on("progress", (progress: { percent?: number }) => {
        if (progress.percent) {
          onLog?.(`Memproses kompresi... ${progress.percent.toFixed(0)}%`);
        } else {
          onLog?.("Memproses kompresi...");
        }
      })
      .on("end", async () => {
        try {
          await deleteFileIfExists(finalOutput);
          await fs.rename(tempOutput, finalOutput);
          resolve({ outputPath: finalOutput });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", async (error: unknown) => {
        await deleteFileIfExists(tempOutput);
        reject(error);
      });

    command.run();
  });
}

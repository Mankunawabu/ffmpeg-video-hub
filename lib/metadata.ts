import path from "path";
import { createRequire } from "module";
import ffmpeg from "fluent-ffmpeg";

let initialized = false;
const require = createRequire(import.meta.url);

export function initFfmpeg() {
  if (initialized) return;

  const ffmpegStatic = require("ffmpeg-static") as string | null;
  if (typeof ffmpegStatic === "string" && ffmpegStatic.length > 0) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  const ffprobeStatic = require("ffprobe-static") as { path?: string };
  const ffprobePath = ffprobeStatic?.path;
  if (ffprobePath) {
    ffmpeg.setFfprobePath(path.resolve(ffprobePath));
  }

  initialized = true;
}

export type VideoMetadata = {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  resolution: string | null;
  formatName: string | null;
};

export async function extractVideoMetadata(filePath: string): Promise<VideoMetadata> {
  initFfmpeg();

  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (error: unknown, data: any) => {
      if (error) {
        resolve({
          durationSeconds: null,
          width: null,
          height: null,
          resolution: null,
          formatName: null
        });
        return;
      }

      const stream = data.streams.find((item: { codec_type?: string; width?: number; height?: number }) => item.codec_type === "video");
      const duration = data.format.duration ? Number(data.format.duration) : null;
      const width = stream?.width ?? null;
      const height = stream?.height ?? null;

      resolve({
        durationSeconds: duration,
        width,
        height,
        resolution: width && height ? `${width}x${height}` : null,
        formatName: data.format.format_name ?? null
      });
    });
  });
}

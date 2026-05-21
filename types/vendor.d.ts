declare module "fluent-ffmpeg" {
  const ffmpeg: any;
  export default ffmpeg;
}

declare module "ffprobe-static" {
  const value: { path?: string };
  export default value;
}

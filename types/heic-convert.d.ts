declare module "heic-convert" {
  export interface ConvertOptions {
    buffer: ArrayBuffer | Uint8Array | Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }
  function convert(options: ConvertOptions): Promise<Uint8Array>;
  export default convert;
}

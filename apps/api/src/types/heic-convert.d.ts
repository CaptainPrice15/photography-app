declare module "heic-convert" {
  interface ConvertOptions {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }

  export default function convert(options: ConvertOptions): Promise<Buffer>;
  export function all(options: ConvertOptions & { all: true }): Promise<Buffer[]>;
}

import sharp from "sharp";

/** Render an SVG to a square PNG `size` pixels wide. */
export function pngFromSvg(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 72 * (size / 64) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Wrap one PNG in an ICO container, which every browser reads as favicon.ico. */
export function icoFromPng(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size % 256, 6); // width; 0 means 256
  header.writeUInt8(size % 256, 7); // height
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(header.length, 18); // image offset
  return Buffer.concat([header, png]);
}

/** A build-time file as a response body. */
export function file(body: Buffer | string, type: string): Response {
  return new Response(typeof body === "string" ? body : new Uint8Array(body), {
    headers: { "Content-Type": type },
  });
}

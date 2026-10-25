/**
 * Generate the fixture's local image assets.
 *
 * #31 requires local assets and deterministic inputs. Rather than commit opaque
 * binaries, the images are generated from this script so anyone can reproduce
 * them byte-for-byte and see exactly what they contain.
 *
 * Pure Node (zlib only), no dependency added. The sizes are not arbitrary:
 * SourceFaviconImage treats a loaded image of <= 16x16 as a failed lookup and
 * swaps in a globe icon, so the 16x16 and 64x64 pair is what makes that
 * threshold testable against real decoded dimensions rather than a stubbed
 * naturalWidth.
 *
 * Usage: node validation/friend-text-media-baseline/tools/make-assets.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// Vite copies `<root>/public` verbatim into the build output; anything else is
// only emitted if a module imports it. Putting the assets anywhere else makes
// them 404 at runtime -- which initially made BOTH favicon cases show the globe
// fallback and the 16x16 assertion pass for entirely the wrong reason.
const ASSETS = join(HERE, "../browser/fixture/public/assets");

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
};

/** Solid-colour RGB PNG of the given size. */
const png = (width, height, [r, g, b]) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // One filter byte (0 = None) per scanline, then RGB triplets.
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const px = row + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

mkdirSync(ASSETS, { recursive: true });

const files = [
  // Exactly the SourceFaviconImage threshold: treated as a failed lookup.
  ["favicon-16.png", png(16, 16, [0x30, 0x60, 0xc0])],
  // Comfortably above it: treated as a real favicon.
  ["favicon-64.png", png(64, 64, [0x20, 0xa0, 0x60])],
  // General-purpose image for Image / ImageText / ImageGallery / markdown.
  ["photo-320x180.png", png(320, 180, [0x88, 0x55, 0xcc])],
];

for (const [name, bytes] of files) {
  writeFileSync(join(ASSETS, name), bytes);
  console.log(`${name.padEnd(22)} ${String(bytes.length).padStart(6)} bytes`);
}
console.log(`\nwrote ${files.length} assets to browser/fixture/public/assets/`);

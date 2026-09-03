// ───────────────────────────────────────────────────────────────────
// MODULE:    pixel-hash.test
// COMPONENT: the same picture, encoded two different ways
// ───────────────────────────────────────────────────────────────────
//
// The fact this module exists to answer: two PNGs of the same pixels do not carry the same
// bytes, because Chrome's own encoder is not guaranteed byte-reproducible run to run. A
// file-byte hash reads that as a change. This suite builds two byte-different encodings of one
// pixel grid by hand — one filtered per scanline, one not — and asserts pixelHash() reads them
// as the same picture; a byte hash of the same two buffers would not.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { decodePng, pixelHash } from "./pixel-hash.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. TEST-ONLY PNG ENCODER
// ───────────────────────────────────────────────────────────────────

// A minimal 8-bit, non-interlaced PNG writer. Exists only so this suite can construct two
// byte-different files that decode to the identical pixel grid — the production pipeline never
// encodes a PNG itself, Chrome does.
const CRC_TABLE = (() => {
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

/** Encodes an RGB pixel grid as a PNG. `filtered` picks the Sub filter (1) over None (0) on
 * every scanline after the first, so `filtered: true` and `filtered: false` produce two
 * different byte streams for the identical pixels. */
function encodeRgbPng(width, height, pixels, filtered) {
  const stride = width * 3;
  const withFilter = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const useFilter = filtered && y > 0 ? 1 : 0;
    withFilter[y * (stride + 1)] = useFilter;
    for (let x = 0; x < stride; x += 1) {
      const raw = pixels[y * stride + x];
      const left = useFilter === 1 && x >= 3 ? pixels[y * stride + x - 3] : 0;
      withFilter[y * (stride + 1) + 1 + x] = (raw - left) & 0xff;
    }
  }
  const idat = deflateSync(withFilter);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A 32x32 RGB grid: a red left half, a blue right half — enough structure that a coarse grid
 * can distinguish "this picture" from a mutated one. */
function twoToneGrid(width, height) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = (y * width + x) * 3;
      if (x < width / 2) {
        pixels[at] = 200; pixels[at + 1] = 20; pixels[at + 2] = 20;
      } else {
        pixels[at] = 20; pixels[at + 1] = 20; pixels[at + 2] = 200;
      }
    }
  }
  return pixels;
}

// ───────────────────────────────────────────────────────────────────
// 3. SAME PICTURE, DIFFERENT BYTES
// ───────────────────────────────────────────────────────────────────

describe("pixelHash reads the same picture as the same picture", () => {
  it("hashes two byte-different encodings of the same pixels identically", () => {
    const pixels = twoToneGrid(32, 32);
    const none = encodeRgbPng(32, 32, pixels, false);
    const sub = encodeRgbPng(32, 32, pixels, true);

    expect(none.equals(sub)).toBe(false);
    expect(createHash("sha256").update(none).digest("hex")).not.toBe(
      createHash("sha256").update(sub).digest("hex")
    );

    expect(pixelHash(none)).toBe(pixelHash(sub));
  });

  it("tolerates a one-unit jitter on a handful of pixels, the antialiasing case", () => {
    const width = 32;
    const height = 32;
    const pixels = twoToneGrid(width, height);
    const jittered = Buffer.from(pixels);
    for (let i = 0; i < 40; i += 1) {
      const at = (i * 7) % jittered.length;
      jittered[at] = Math.max(0, Math.min(255, jittered[at] + (i % 2 === 0 ? 1 : -1)));
    }
    const base = encodeRgbPng(width, height, pixels, true);
    const withJitter = encodeRgbPng(width, height, jittered, true);
    expect(pixelHash(base)).toBe(pixelHash(withJitter));
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. A DIFFERENT PICTURE
// ───────────────────────────────────────────────────────────────────

describe("pixelHash still tells two different pictures apart", () => {
  it("changes when a real block of the image is repainted", () => {
    const width = 32;
    const height = 32;
    const pixels = twoToneGrid(width, height);
    const mutated = Buffer.from(pixels);
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const at = (y * width + x) * 3;
        mutated[at] = 20; mutated[at + 1] = 200; mutated[at + 2] = 20;
      }
    }
    const base = encodeRgbPng(width, height, pixels, true);
    const changed = encodeRgbPng(width, height, mutated, true);
    expect(pixelHash(base)).not.toBe(pixelHash(changed));
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. UNREADABLE INPUT
// ───────────────────────────────────────────────────────────────────

describe("decodePng and pixelHash on input this pipeline never produces", () => {
  it("returns null rather than guessing at a non-PNG buffer", () => {
    expect(decodePng(Buffer.from("not a png"))).toBeNull();
    expect(pixelHash(Buffer.from("not a png"))).toBeNull();
  });
});

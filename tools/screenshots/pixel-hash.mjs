#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    pixel-hash
// COMPONENT: decoded-PNG content hash — tolerant to encoder and antialiasing jitter
// ───────────────────────────────────────────────────────────────────

/**
 * Hashes a screenshot by its decoded pixels, not its file bytes.
 *
 * The capture harness rasterises through GPU-accelerated Chrome and re-encodes through its own
 * PNG encoder on every run; neither is guaranteed byte-reproducible even when nothing on the page
 * changed — capture.mjs's own comment documents the same fact for the reason its manifest already
 * carries a layoutHash instead of a byte hash. A file-byte hash (or a raw git diff) reads that
 * noise as a change; decoding first removes the encoder's contribution, but the raster itself can
 * still drift a pixel's channel value by a unit or two at an antialiased edge between two runs of
 * the identical page.
 *
 * So this hash is computed over a coarse, quantised summary of the decoded image rather than the
 * raw pixel bytes: the image is divided into a fixed grid, each cell's channels are averaged, and
 * the average is rounded down into wide buckets before hashing. A one- or two-unit rendering
 * jitter on a few pixels moves a cell's average by a fraction of a bucket and hashes the same; a
 * real paint change — a new fill colour, an added or removed element — shifts many cells by whole
 * buckets and hashes differently.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

// Channel counts for the colour types this pipeline's captures ever use — greyscale, RGB, and
// either with alpha. An indexed or 16-bit PNG is out of scope, the same boundary verify.mjs's
// flatColour() already draws, and decodePng() reports it unreadable rather than guessing.
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

// A grid this coarse absorbs a few pixels of antialiasing jitter per cell while still separating
// a real paint change: the smallest scenario captured is tens of pixels on a side, well above
// GRID x GRID cells.
const GRID = 16;

// Rounds each cell average down into 32 buckets (8-bit >> 3). Wide enough that a jitter of a
// couple of units never crosses a bucket edge; narrow enough that a real colour change — the
// `.mod-cta` accent fill this phase itself added is roughly a 100-unit swing on a channel —
// crosses several.
const BUCKET_BITS = 3;

// ───────────────────────────────────────────────────────────────────
// 3. PNG DECODE
// ───────────────────────────────────────────────────────────────────

/**
 * Decodes an 8-bit, non-interlaced PNG into its raw pixel bytes.
 *
 * Shared by verify.mjs (which asks whether the picture is flat) and capture.mjs / this module
 * (which ask what the picture contains), so the un-filter pass — PNG's, not this program's — is
 * written once. Returns null for anything this pipeline's captures never produce (indexed or
 * 16-bit colour, interlacing) rather than guessing at an unsupported layout.
 */
export function decodePng(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) return null;

  let width = 0;
  let height = 0;
  let depth = 0;
  let type = 0;
  let interlace = 0;
  const idat = [];
  for (let at = 8; at + 8 <= buf.length;) {
    const len = buf.readUInt32BE(at);
    const tag = buf.toString("ascii", at + 4, at + 8);
    const body = buf.subarray(at + 8, at + 8 + len);
    if (tag === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8];
      type = body[9];
      interlace = body[12];
    } else if (tag === "IDAT") idat.push(body);
    else if (tag === "IEND") break;
    at += 12 + len;
  }
  if (depth !== 8 || interlace !== 0 || !(type in CHANNELS) || width === 0 || height === 0) {
    return null;
  }

  const channels = CHANNELS[type];
  const stride = width * channels;
  try {
    const raw = inflateSync(Buffer.concat(idat));
    const pixels = Buffer.alloc(stride * height);
    let prev = Buffer.alloc(stride);
    let read = 0;
    for (let y = 0; y < height; y += 1) {
      const filter = raw[read];
      read += 1;
      const line = Buffer.from(raw.subarray(read, read + stride));
      read += stride;
      // Un-filter in place. The four predictors are PNG's, not this program's; a is the pixel to
      // the left, b the one above, c the one above-left, each zero off the edge.
      for (let x = 0; x < stride; x += 1) {
        const a = x >= channels ? line[x - channels] : 0;
        const b = prev[x];
        const c = x >= channels ? prev[x - channels] : 0;
        if (filter === 1) line[x] = (line[x] + a) & 0xff;
        else if (filter === 2) line[x] = (line[x] + b) & 0xff;
        else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 0xff;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
        }
      }
      line.copy(pixels, y * stride);
      prev = line;
    }
    return { width, height, channels, pixels };
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. CONTENT HASH
// ───────────────────────────────────────────────────────────────────

/**
 * Hashes a PNG's decoded content on a coarse, jitter-tolerant grid.
 *
 * Returns null for a PNG decodePng() cannot read, the same "I could not read it" signal
 * flatColour() uses in verify.mjs — a missing pixelHash must read as missing, never as a false
 * match against another missing pixelHash.
 */
export function pixelHash(buf) {
  const image = decodePng(buf);
  if (!image) return null;
  const { width, height, channels, pixels } = image;

  const cols = Math.min(GRID, width);
  const rows = Math.min(GRID, height);
  const cellW = width / cols;
  const cellH = height / rows;
  const summary = Buffer.alloc(cols * rows * channels);

  for (let cy = 0; cy < rows; cy += 1) {
    const y0 = Math.floor(cy * cellH);
    const y1 = Math.max(y0 + 1, Math.floor((cy + 1) * cellH));
    for (let cx = 0; cx < cols; cx += 1) {
      const x0 = Math.floor(cx * cellW);
      const x1 = Math.max(x0 + 1, Math.floor((cx + 1) * cellW));
      const totals = new Array(channels).fill(0);
      let count = 0;
      for (let y = y0; y < y1; y += 1) {
        const rowStart = y * width * channels;
        for (let x = x0; x < x1; x += 1) {
          const at = rowStart + x * channels;
          for (let ch = 0; ch < channels; ch += 1) totals[ch] += pixels[at + ch];
          count += 1;
        }
      }
      const at = (cy * cols + cx) * channels;
      for (let ch = 0; ch < channels; ch += 1) {
        summary[at + ch] = Math.round(totals[ch] / count) >> BUCKET_BITS;
      }
    }
  }
  return createHash("sha256").update(summary).digest("hex").slice(0, 12);
}

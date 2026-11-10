#!/usr/bin/env node
// Clean the ridge edge of a hand-made hero front layer (#26):
//
//   node scripts/trim-hero-edge.mjs [front] [out]
//
// A cut-out made by hand can leave slivers of the light sky along the ridge and
// between its pinnacles. They are invisible on the photo's own sky and show as
// light dashes once the sky behind is darkened. Starting from the transparent
// sky, this spreads into every touching pixel that still looks like sky (light
// and not warm), makes it transparent, and softens the new edge. The lake is as
// light as the sky but does not touch it, so it stays.
//
// Run it once per new cut: the file is re-encoded each time, and a further run
// can nibble a few more pixels.
import { renameSync } from "node:fs";
import sharp from "sharp";

const [input = "src/assets/hero/front.webp", output = input] =
  process.argv.slice(2);

/** Above this luminance (0-255) a pixel next to the sky is sky, not mountain. */
const SKY_LUMA = 135;
/** Alpha below this counts as already transparent. */
const CLEAR = 8;

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const alphaAt = (p) => data[p * 4 + 3];
const looksLikeSky = (p) => {
  const i = p * 4;
  const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  return luma > SKY_LUMA && data[i + 2] >= data[i] - 6;
};
const neighbours = (p) => {
  const x = p % width;
  const result = [];
  if (x > 0) result.push(p - 1);
  if (x < width - 1) result.push(p + 1);
  if (p >= width) result.push(p - width);
  if (p < width * (height - 1)) result.push(p + width);
  return result;
};

// Flood from the transparent pixels into touching sky-coloured ones.
const queue = [];
for (let p = 0; p < width * height; p++) {
  if (alphaAt(p) <= CLEAR) queue.push(p);
}
const cleared = [];
for (let head = 0; head < queue.length; head++) {
  for (const next of neighbours(queue[head])) {
    if (alphaAt(next) <= CLEAR || !looksLikeSky(next)) continue;
    data[next * 4 + 3] = 0;
    cleared.push(next);
    queue.push(next);
  }
}

// Soften the new edge: what touches a cleared pixel is at most half opaque.
for (const p of cleared) {
  for (const next of neighbours(p)) {
    if (alphaAt(next) > 128) data[next * 4 + 3] = 128;
  }
}

const temporary = `${output}.tmp`;
await sharp(data, { raw: { width, height, channels: 4 } })
  .webp({ quality: 92, alphaQuality: 100, effort: 5 })
  .toFile(temporary);
renameSync(temporary, output);
console.log(
  `Trimmed ${input} (${width}x${height}): ${cleared.length} sky pixels removed.`,
);

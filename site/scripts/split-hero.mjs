#!/usr/bin/env node
// Split the hero photo into two layers the page scrolls at different speeds (#21):
//
//   node scripts/split-hero.mjs [photo] [out-dir]
//
// - sky.webp: the sky alone, continued smoothly behind the mountains, so nothing
//   opens up when the layers shift against each other.
// - front.webp: everything from the ridge down (mountains, meadow, lake, Amy) on a
//   transparent sky. The ridge edge keeps its anti-aliasing, with the sky's tint
//   taken out of the edge pixels so no light halo shows over the title.
//
// It relies on what makes this photo easy to cut: a smooth, light sky above dark
// mountains. A different photo needs a look at the result before it ships.
import sharp from "sharp";

const [photo = "src/assets/hero/photo.webp", outDir = "src/assets/hero"] =
  process.argv.slice(2);

/** Below this luminance (0-255) a pixel is ridge, not sky. */
const RIDGE_LUMA = 110;
/** Dark pixels in a row needed to call it the ridge, so a stray speck isn't one. */
const RIDGE_RUN = 4;
/** Rows below the ridge still treated as edge, where alpha may be partial. */
const EDGE_ROWS = 6;
/** Sky rows kept clear of the ridge when fitting the sky. */
const SKY_MARGIN = 6;
/** A row needs this many sky pixels for its own fit; lower rows reuse the last. */
const MIN_ROW_SAMPLES = 300;
/** Rows averaged either side when smoothing the sky fit. */
const SMOOTH_ROWS = 12;

const { data, info } = await sharp(photo)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const at = (x, y) => (y * width + x) * 3;
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// 1. The ridge: per column, the first row of a run of dark pixels.
const ridge = new Int32Array(width);
for (let x = 0; x < width; x++) {
  let run = 0;
  ridge[x] = height;
  for (let y = 0; y < height; y++) {
    const i = at(x, y);
    run = luma(data[i], data[i + 1], data[i + 2]) < RIDGE_LUMA ? run + 1 : 0;
    if (run === RIDGE_RUN) {
      ridge[x] = y - RIDGE_RUN + 1;
      break;
    }
  }
}

// 2. The sky: per row, a straight-line fit across the width for each channel,
//    from the pixels clear of the ridge; rows with too few pixels reuse the last
//    good fit, and the fits are smoothed down the rows.
const fits = [];
let lastFit;
for (let y = 0; y < height; y++) {
  let n = 0;
  const s = { u: 0, uu: 0, c: [0, 0, 0], uc: [0, 0, 0] };
  for (let x = 0; x < width; x++) {
    if (y >= ridge[x] - SKY_MARGIN) continue;
    const u = x / (width - 1);
    const i = at(x, y);
    n++;
    s.u += u;
    s.uu += u * u;
    for (let k = 0; k < 3; k++) {
      s.c[k] += data[i + k];
      s.uc[k] += u * data[i + k];
    }
  }
  if (n >= MIN_ROW_SAMPLES) {
    const det = n * s.uu - s.u * s.u;
    lastFit = [0, 1, 2].map((k) => {
      const slope = (n * s.uc[k] - s.u * s.c[k]) / det;
      return [(s.c[k] - slope * s.u) / n, slope];
    });
  }
  fits.push(lastFit);
}
const firstFit = fits.find(Boolean);
for (let y = 0; y < height && !fits[y]; y++) fits[y] = firstFit;
const smooth = fits.map((_, y) => {
  const from = Math.max(0, y - SMOOTH_ROWS);
  const to = Math.min(height - 1, y + SMOOTH_ROWS);
  return [0, 1, 2].map((k) =>
    [0, 1].map((p) => {
      let sum = 0;
      for (let r = from; r <= to; r++) sum += fits[r][k][p];
      return sum / (to - from + 1);
    }),
  );
});
const skyAt = (x, y, k) => {
  const [a, b] = smooth[y][k];
  return a + b * (x / (width - 1));
};

// 3. Both layers.
const sky = Buffer.alloc(width * height * 3);
const front = Buffer.alloc(width * height * 4);
let residual = 0;
let residualCount = 0;
for (let x = 0; x < width; x++) {
  // The ridge's own colour, just below its edge, for edge pixels too faint to unmix.
  const below = at(x, Math.min(height - 1, ridge[x] + EDGE_ROWS + 4));
  const ridgeColour = [data[below], data[below + 1], data[below + 2]];
  for (let y = 0; y < height; y++) {
    const i = at(x, y);
    const o = (y * width + x) * 4;
    const s = [0, 1, 2].map((k) => skyAt(x, y, k));
    for (let k = 0; k < 3; k++) sky[i + k] = Math.round(s[k]);

    let alpha = 1;
    if (y <= ridge[x] + EDGE_ROWS) {
      const skyLuma = luma(...s);
      const ridgeLuma = luma(...ridgeColour);
      const here = luma(data[i], data[i + 1], data[i + 2]);
      // Grain in the sky reads as a few levels; ignore that much before the edge starts.
      alpha = Math.min(
        1,
        Math.max(0, (skyLuma - here - 4) / (skyLuma - ridgeLuma - 8)),
      );
      if (y < ridge[x] - SKY_MARGIN) {
        residual += (here - skyLuma) ** 2;
        residualCount++;
      }
    }
    for (let k = 0; k < 3; k++) {
      // Unmix: the photo's pixel is alpha * colour + (1 - alpha) * sky.
      const colour =
        alpha > 0.1
          ? (data[i + k] - (1 - alpha) * s[k]) / alpha
          : ridgeColour[k];
      front[o + k] = Math.round(Math.min(255, Math.max(0, colour)));
    }
    front[o + 3] = Math.round(alpha * 255);
  }
}

await sharp(sky, { raw: { width, height, channels: 3 } })
  .webp({ quality: 90 })
  .toFile(`${outDir}/sky.webp`);
await sharp(front, { raw: { width, height, channels: 4 } })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(`${outDir}/front.webp`);

const highest = Math.min(...ridge);
console.log(
  `Split ${photo} (${width}x${height}): ridge from row ${highest} (x ${ridge.indexOf(highest)}) to row ${Math.max(...ridge)}; sky fit residual ${Math.sqrt(residual / residualCount).toFixed(2)} levels.`,
);
console.log(
  `Ridge every 100 px: ${Array.from({ length: Math.ceil(width / 100) }, (_, n) => `${n * 100}:${ridge[n * 100]}`).join(" ")}`,
);

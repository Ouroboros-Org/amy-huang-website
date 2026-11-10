import satori from "satori";
// Static cuts of the site's font: satori reads WOFF, not the variable WOFF2 the page uses.
import thinFont from "@fontsource/sora/files/sora-latin-300-normal.woff?inline";
import regularFont from "@fontsource/sora/files/sora-latin-400-normal.woff?inline";
import semiBoldFont from "@fontsource/sora/files/sora-latin-600-normal.woff?inline";
import boldFont from "@fontsource/sora/files/sora-latin-700-normal.woff?inline";

/** Vite inlines the fonts as data URLs; satori wants their bytes. */
function bytes(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

const fonts = (
  [
    [300, thinFont],
    [400, regularFont],
    [600, semiBoldFont],
    [700, boldFont],
  ] as const
).map(([weight, file]) => ({
  name: "Sora",
  data: bytes(file),
  weight,
  style: "normal" as const,
}));

/**
 * Lay out a tree of elements in Sora and draw it as SVG, its text as outlines,
 * so the result needs no font wherever it is shown.
 */
export function draw(
  node: Parameters<typeof satori>[0],
  { width, height }: { width: number; height: number },
): Promise<string> {
  return satori(node, { width, height, fonts });
}

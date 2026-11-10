import type { APIRoute } from "astro";
import { renderIcon } from "../lib/icon";
import { file, icoFromPng, pngFromSvg } from "../lib/raster";
import { getSite } from "../lib/site";

/** For browsers and tools that ask for /favicon.ico rather than the SVG. */
export const GET: APIRoute = async () => {
  const { settings } = await getSite();
  const svg = await renderIcon(settings.name[0], { rounded: true });
  return file(icoFromPng(await pngFromSvg(svg, 32), 32), "image/x-icon");
};

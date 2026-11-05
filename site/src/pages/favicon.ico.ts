import type { APIRoute } from "astro";
import { iconSvg } from "../lib/brand";
import { file, icoFromPng, pngFromSvg } from "../lib/raster";

/** For browsers and tools that ask for /favicon.ico rather than the SVG. */
export const GET: APIRoute = async () => {
  const png = await pngFromSvg(iconSvg({ rounded: true }), 32);
  return file(icoFromPng(png, 32), "image/x-icon");
};

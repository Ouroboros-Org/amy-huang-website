import type { APIRoute } from "astro";
import { iconSvg } from "../lib/brand";
import { file, pngFromSvg } from "../lib/raster";

/** The icon a phone uses when the site is added to its home screen. */
export const GET: APIRoute = async () =>
  file(await pngFromSvg(iconSvg({ rounded: false }), 180), "image/png");

import type { APIRoute } from "astro";
import { renderIcon } from "../lib/icon";
import { file, pngFromSvg } from "../lib/raster";
import { getSite } from "../lib/site";

/** The icon a phone uses when the site is added to its home screen. */
export const GET: APIRoute = async () => {
  const { settings } = await getSite();
  const svg = await renderIcon(settings.name[0], { rounded: false });
  return file(await pngFromSvg(svg, 180), "image/png");
};

import type { APIRoute } from "astro";
import { renderIcon } from "../lib/icon";
import { file } from "../lib/raster";
import { getSite } from "../lib/site";

export const GET: APIRoute = async () => {
  const { settings } = await getSite();
  return file(
    await renderIcon(settings.name[0], { rounded: true }),
    "image/svg+xml",
  );
};

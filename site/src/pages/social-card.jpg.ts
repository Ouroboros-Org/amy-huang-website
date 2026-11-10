import type { APIRoute } from "astro";
import { file } from "../lib/raster";
import { getSite } from "../lib/site";
import { renderSocialCard } from "../lib/social-card";

export const GET: APIRoute = async () => {
  const { settings } = await getSite();
  return file(await renderSocialCard(settings), "image/jpeg");
};

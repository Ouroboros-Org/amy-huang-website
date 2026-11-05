import type { APIRoute } from "astro";
import { iconSvg } from "../lib/brand";
import { file } from "../lib/raster";

export const GET: APIRoute = () =>
  file(iconSvg({ rounded: true }), "image/svg+xml");

// @ts-check
import { defineConfig } from "astro/config";

// Vercel reports the production domain at build time, on preview deploys too. It
// makes the canonical URL and the social card's address absolute. Builds outside
// Vercel leave those two out.
const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

// https://astro.build/config
export default defineConfig({
  site: domain ? `https://${domain}` : undefined,
});

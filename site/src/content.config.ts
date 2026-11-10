import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

/** A card's or section's media: a looping video (MP4, with `poster`) or a still. */
const background = z.object({
  type: z.enum(["video", "still"]),
  src: z.string(),
  /** A portrait cut for phones. */
  portrait: z.string().optional(),
  poster: z.string().optional(),
  portraitPoster: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().default(""),
});

const channel = z.enum(["whatsapp", "email", "instagram"]);

/**
 * The page's sections, one Markdown file each, in `order`. The body holds a
 * short paragraph in Amy's voice; the frontmatter holds the parts the layout
 * places separately. `draft: true` marks words that aren't hers yet.
 *
 * - `layout: stop` (the default) is one thing she does: a work card, a step in
 *   the offerings and a page of its own at `/<file name>/`.
 * - `layout: about` and `layout: contact` are the two sections of that name.
 */
const chapters = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/chapters" }),
  schema: z.object({
    order: z.number().int().positive(),
    /** The section's heading. */
    title: z.string(),
    layout: z.enum(["stop", "about", "contact"]).default("stop"),
    /** A stop's one-word name, large on its card. */
    nav: z.string().optional(),
    /** A stop's short description, small above its name on the card. */
    kicker: z.string().optional(),
    lead: z.string().optional(),
    /** A short note in Amy's handwriting. */
    note: z.string().optional(),
    /** A short announcement, shown as a small pill. */
    badge: z.string().optional(),
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .max(4)
      .default([]),
    cta: z
      .object({ label: z.string(), channel, message: z.string().optional() })
      .optional(),
    background: background.optional(),
    /** Describes the about section's photo (src/assets/about/photo.webp). */
    photoAlt: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

/** Site-wide details: who, where, how to reach her, and the hero's words. */
const settings = defineCollection({
  loader: file("./src/content/settings.json"),
  schema: z.object({
    name: z.string(),
    /** What she is, in a few words, under her name in the top bar. */
    role: z.string(),
    line: z.string(),
    currentlyIn: z.string(),
    replyNote: z.string(),
    contact: z.object({
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      instagram: z.string().optional(),
    }),
    weddingsUrl: z.url().optional(),
    /**
     * The opening: her motto, set wide over the video (one line per sentence on
     * narrow screens), the crafts beneath it, and the video's description.
     */
    hero: z.object({
      motto: z.string(),
      crafts: z.array(z.string()).min(1),
      alt: z.string(),
    }),
  }),
});

export const collections = { chapters, settings };

import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * One layer's media, with an optional portrait cut for phones. For a cut-out or
 * the hero, `src` is the base path of the stacked-alpha files that
 * scripts/encode-alpha.sh writes (`<src>.av1.mp4`, `.hevc.mp4`, `.poster.webp`).
 */
const media = z.object({
  src: z.string(),
  portrait: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().default(""),
});

const background = media.extend({
  /** A looping video (MP4, with `poster`) or a still image. */
  type: z.enum(["video", "still"]),
  poster: z.string().optional(),
  portraitPoster: z.string().optional(),
});

const channel = z.enum(["whatsapp", "email", "instagram"]);

/**
 * The journey's chapters, one Markdown file each, in `order`. The body holds a
 * short paragraph in Amy's voice; the frontmatter holds the layers and the parts
 * the layout places separately. `draft: true` marks words that aren't hers yet.
 */
const chapters = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/chapters" }),
  schema: z.object({
    order: z.number().int().positive(),
    title: z.string(),
    /** Label in the hero's chapter index; chapters without one stay off it. */
    nav: z.string().optional(),
    layout: z.enum(["chapter", "contact"]).default("chapter"),
    /** Share of the scroll, in viewport heights. */
    length: z.number().positive().default(1.5),
    reveal: z.enum(["circle", "under"]).default("circle"),
    revealAt: z.string().optional(),
    lead: z.string().optional(),
    note: z.string().optional(),
    sticky: z.string().optional(),
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .max(4)
      .default([]),
    cta: z
      .object({ label: z.string(), channel, message: z.string().optional() })
      .optional(),
    background: background.optional(),
    cutout: media.optional(),
    draft: z.boolean().default(true),
  }),
});

/** Site-wide details: who, where, how to reach her, and the hero's opening. */
const settings = defineCollection({
  loader: file("./src/content/settings.json"),
  schema: z.object({
    name: z.string(),
    line: z.string(),
    currentlyIn: z.string(),
    replyNote: z.string(),
    contact: z.object({
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      instagram: z.string().optional(),
    }),
    weddingsUrl: z.url().optional(),
    hero: media,
  }),
});

export const collections = { chapters, settings };

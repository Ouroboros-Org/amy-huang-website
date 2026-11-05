import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const image = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
});

const channel = z.enum(["whatsapp", "email", "instagram"]);

/**
 * The diary's spreads, one Markdown file each. The body holds Amy's first-person
 * paragraphs; the frontmatter holds everything the layout places separately.
 * `draft: true` marks text that is still a placeholder for her own words.
 */
const spreads = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/spreads" }),
  schema: z.object({
    title: z.string(),
    page: z.number().int().positive(),
    /** The line on the contents page; spreads without one stay off it. */
    contents: z.string().optional(),
    starred: z.boolean().default(false),
    /** A short note in Amy's hand near the heading. */
    note: z.string().optional(),
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    sticky: z.string().optional(),
    list: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .default([]),
    cta: z
      .object({ label: z.string(), channel, message: z.string().optional() })
      .optional(),
    media: z.array(image).default([]),
    draft: z.boolean().default(true),
  }),
});

/** Site-wide details: who, where, and how to reach her. */
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
    cover: z.object({ still: image, cutout: image }),
  }),
});

export const collections = { spreads, settings };

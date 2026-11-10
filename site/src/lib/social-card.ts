import { readFile } from "node:fs/promises";
import { publicDir } from "astro:config/server";
import sharp from "sharp";
import { CARD_HEIGHT, CARD_WIDTH, palette } from "./brand";
import { draw } from "./satori";

/**
 * The hero's first frame, which the page shows before the video plays. It is
 * re-encoded with the video (scripts/encode-loop.sh), so the card follows it.
 */
const STILL = "media/hero/amy.poster.webp";

/** Night (--night) at an opacity, for the shade over the still. */
const night = (alpha: number) => `rgba(12, 13, 16, ${alpha})`;

/** Letter spacing in the hero's film-title manner, as a share of the size. */
const MOTTO_TRACK = 0.6;
const CRAFTS_TRACK = 0.45;

/** Spacing adds a gap after the last letter too; one before the first evens it. */
function tracked(size: number, track: number) {
  return { letterSpacing: size * track, paddingLeft: size * track };
}

/** Says what the card shows, for readers who can't see it. */
export function socialCardAlt({
  name,
  role,
  hero,
}: {
  name: string;
  role: string;
  hero: { motto: string; crafts: string[] };
}): string {
  return `${name}, ${role}: “${hero.motto}” ${hero.crafts.join(" · ")}. Over a still from her video.`;
}

/**
 * The picture a shared link previews with: the opening screen of the home
 * page. Her video's first frame under the hero's night shade, her name and
 * role where the top bar sets them, and the motto (a sentence a line, as on
 * phones, so it stays legible when the preview is small) above her crafts.
 * Built from settings.json, so it follows her edits.
 */
export async function renderSocialCard({
  name,
  role,
  hero,
}: {
  name: string;
  role: string;
  hero: { motto: string; crafts: string[] };
}): Promise<Buffer> {
  const sentences = hero.motto.split(/(?<=[.!?])\s+/);
  const mottoSize = 44;
  const craftsSize = 20;

  const shade = (background: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundImage: background,
      },
    },
  });

  const words = await draw(
    {
      type: "div",
      props: {
        style: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          position: "relative",
          color: palette.light,
          fontFamily: "Sora",
        },
        children: [
          // The hero's shade: night deepest at the top and foot, and behind the
          // words, which sit above her so they never cross the fire.
          shade(
            `linear-gradient(to bottom, ${night(0.62)}, ${night(0.3)} 30%, ${night(0.22)} 70%, ${night(0.55)})`,
          ),
          shade(
            `radial-gradient(42% 48% at 50% 34%, ${night(0.45)}, ${night(0)})`,
          ),
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: 52,
                top: 40,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: 26, fontWeight: 600, lineHeight: 1.2 },
                    children: name,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 20,
                      lineHeight: 1.3,
                      color: palette.lightMuted,
                    },
                    children: role,
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: 0,
                right: 0,
                top: 128,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              },
              children: [
                ...sentences.map((sentence) => ({
                  type: "div",
                  props: {
                    style: {
                      fontSize: mottoSize,
                      fontWeight: 300,
                      lineHeight: 1.55,
                      ...tracked(mottoSize, MOTTO_TRACK),
                    },
                    children: sentence.toUpperCase(),
                  },
                })),
                // The crafts with dots between them; the dots aren't tracked, so
                // they sit midway.
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: craftsSize * 1.1,
                      marginTop: 18,
                      fontSize: craftsSize,
                      fontWeight: 400,
                      color: "rgba(245, 245, 245, 0.88)",
                    },
                    children: hero.crafts.flatMap((craft, index) => [
                      ...(index > 0
                        ? [{ type: "div", props: { children: "·" } }]
                        : []),
                      {
                        type: "div",
                        props: {
                          style: {
                            letterSpacing: craftsSize * CRAFTS_TRACK,
                            marginRight: -craftsSize * CRAFTS_TRACK,
                          },
                          children: craft.toUpperCase(),
                        },
                      },
                    ]),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: CARD_WIDTH, height: CARD_HEIGHT },
  );

  const still = await readFile(new URL(STILL, publicDir));
  return (
    sharp(still)
      // Anchored at the top: what little is cut comes off the grass at the foot,
      // which sets her lower and leaves the words room above her fire.
      .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "cover", position: "top" })
      .composite([{ input: Buffer.from(words) }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  );
}

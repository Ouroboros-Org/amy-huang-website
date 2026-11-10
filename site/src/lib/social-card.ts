import satori from "satori";
import sharp from "sharp";
// Static cuts of the site's grotesk: satori reads WOFF, not the variable WOFF2 the page uses.
import regularFont from "@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-400-normal.woff?inline";
import boldFont from "@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-700-normal.woff?inline";
import { CARD_HEIGHT, CARD_WIDTH, palette } from "./brand";

/** Vite inlines the fonts as data URLs; satori wants their bytes. */
function bytes(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

/**
 * The picture a shared link previews with: her name and line beside a lit
 * opening. Built from settings.json, so it follows her edits.
 */
export async function renderSocialCard({
  name,
  line,
}: {
  name: string;
  line: string;
}): Promise<Buffer> {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          display: "flex",
          position: "relative",
          backgroundColor: palette.night,
          backgroundImage: `radial-gradient(circle at 80% 50%, #1e2027 0%, ${palette.night} 60%)`,
          color: palette.text,
          fontFamily: "Schibsted Grotesk",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: 770,
                top: 85,
                width: 460,
                height: 460,
                borderRadius: 230,
                border: "3px solid rgba(255, 232, 222, 0.8)",
                backgroundImage: `radial-gradient(circle, #ff9473 0%, ${palette.signal} 45%, #e5583b 100%)`,
                boxShadow: "0 0 160px 24px rgba(249, 108, 74, 0.3)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: 80,
                top: 0,
                bottom: 0,
                width: 620,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 116,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    },
                    children: name,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      marginTop: 36,
                      fontSize: 42,
                      lineHeight: 1.25,
                      color: palette.text2,
                    },
                    children: line,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fonts: [
        {
          name: "Schibsted Grotesk",
          data: bytes(regularFont),
          weight: 400,
          style: "normal",
        },
        {
          name: "Schibsted Grotesk",
          data: bytes(boldFont),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

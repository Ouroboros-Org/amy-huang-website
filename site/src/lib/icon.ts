import { palette } from "./brand";
import { draw } from "./satori";

/** Night (--night) at an opacity. */
const night = (alpha: number) => `rgba(12, 13, 16, ${alpha})`;

/**
 * The icon, as the footer in small: the initial of her wordmark, bold, over
 * night that melts into the footer's glow of fire and dusk at the foot.
 * `rounded` gives the browser-tab version its own corners; the home-screen
 * version stays square because phones round it themselves.
 */
export function renderIcon(
  initial: string,
  { rounded }: { rounded: boolean },
): Promise<string> {
  const size = 64;
  const layer = (backgroundImage: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: size,
        height: size,
        backgroundImage,
      },
    },
  });
  return draw(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          borderRadius: rounded ? 14 : 0,
          backgroundColor: palette.night,
          fontFamily: "Sora",
        },
        children: [
          layer(`linear-gradient(90deg, ${palette.glow.join(", ")})`),
          // The footer's fade: solid night over the top, easing out to the foot.
          layer(
            `linear-gradient(to bottom, ${night(1)} 0%, ${night(1)} 34%, ${night(0.72)} 58%, ${night(0.2)} 84%, ${night(0)} 100%)`,
          ),
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                marginTop: -2,
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1,
                color: palette.wordmark,
              },
              children: initial,
            },
          },
        ],
      },
    },
    { width: size, height: size },
  );
}

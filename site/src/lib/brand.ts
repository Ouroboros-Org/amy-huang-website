/**
 * The site's mark and colours for images rendered at build time: the icons and
 * the social card. The mark is the hero's opening, lit from inside. tokens.css
 * holds the OKLCH originals of these colours; keep the two in step.
 */
export const palette = {
  /** --night */
  night: "#0c0d10",
  /** --text */
  text: "#f5f5f5",
  /** --text-2 */
  text2: "#b4b7be",
  /** --signal */
  signal: "#f96c4a",
};

/** The social card's size: the 1.91:1 that link previews expect. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/**
 * The icon as SVG. `rounded` gives the browser-tab version its own corners;
 * the home-screen version stays square because phones round it themselves.
 */
export function iconSvg({ rounded }: { rounded: boolean }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="light">
      <stop offset="0" stop-color="#ff9473"/>
      <stop offset="0.45" stop-color="${palette.signal}"/>
      <stop offset="1" stop-color="#e5583b"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="${palette.night}"/>
  <circle cx="32" cy="32" r="20" fill="url(#light)" stroke="#ffe8de" stroke-opacity="0.85" stroke-width="2.5"/>
</svg>
`;
}

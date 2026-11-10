/**
 * The site's colours for code that can't read CSS: the icon and the social
 * card, rendered at build time (icon.ts, social-card.ts), and the footer's
 * shader (scripts/footer-shader.ts). tokens.css holds the OKLCH originals of
 * these colours; keep the two in step.
 */
export const palette = {
  /** --bg */
  page: "#e7e8ea",
  /** --night */
  night: "#0c0d10",
  /** --on-media */
  light: "#f5f5f5",
  /** Muted light type on night. */
  lightMuted: "#b4b7be",
  /** The footer's wordmark, oklch(0.92 0 0). */
  wordmark: "#e4e4e4",
  /** --signal */
  signal: "#f96c4a",
  /** --glow-1 to --glow-5: fire into dusk, the footer's five stops (the theme's own). */
  glow: ["#f5794a", "#f56078", "#e9569a", "#9a5fd0", "#5a4ec8"],
};

/** The social card's size: the 1.91:1 that link previews expect. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/**
 * The site's colours for code that can't read CSS: the icon and the social
 * card, rendered at build time (icon.ts, social-card.ts). tokens.css holds the
 * OKLCH originals of most of these colours; keep the two in step.
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
  /** The icon's initial, oklch(0.92 0 0). */
  wordmark: "#e4e4e4",
  /** --signal */
  signal: "#f96c4a",
  /** Fire into dusk, the glow at the icon's foot (the theme's footer colours). */
  glow: ["#f5794a", "#f56078", "#e9569a", "#9a5fd0", "#5a4ec8"],
};

/** The social card's size: the 1.91:1 that link previews expect. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

import "stacked-alpha-video";

/**
 * Plays `[data-alpha-video]` loops only while they are on screen, and keeps the
 * poster whenever playback isn't wanted or isn't allowed: reduced motion, or a
 * refused play(), as iOS Low Power Mode does.
 *
 * `data-state` is "poster" until the first frame plays, then "playing"; "refused"
 * records a refused play() and keeps the poster.
 */
export function initAlphaVideos(root: ParentNode = document): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const holder = entry.target as HTMLElement;
        const video = holder.querySelector("video");
        if (!video) continue;
        if (entry.isIntersecting && !reduceMotion.matches) {
          video.play().catch((error: DOMException) => {
            // An AbortError only means a pause() overtook this play().
            if (error.name === "NotAllowedError") {
              holder.dataset.state = "refused";
            }
          });
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: "50% 0px" },
  );

  for (const holder of root.querySelectorAll<HTMLElement>(
    "[data-alpha-video]",
  )) {
    const video = holder.querySelector("video");
    if (!video) continue;
    video.addEventListener("playing", () => (holder.dataset.state = "playing"));
    observer.observe(holder);
  }
}

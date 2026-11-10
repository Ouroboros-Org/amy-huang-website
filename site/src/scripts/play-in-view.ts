import { bindMedia, pauseMedia, playMedia } from "./media";
import { motionAllowed, onMotionChange } from "./motion";

/**
 * Plays each video (`[data-media]`) only while it is on screen and motion is
 * allowed, and pauses it otherwise, so off-screen cards never decode.
 */
export function initPlayInView(): void {
  const holders = [...document.querySelectorAll<HTMLElement>("[data-media]")];
  if (holders.length === 0 || !("IntersectionObserver" in window)) return;
  bindMedia(document);

  const inView = new Set<HTMLElement>();
  const sync = (holder: HTMLElement) => {
    const parent = holder.parentElement ?? holder;
    if (motionAllowed() && inView.has(holder)) playMedia(parent);
    else pauseMedia(parent);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const holder = entry.target as HTMLElement;
        if (entry.isIntersecting) inView.add(holder);
        else inView.delete(holder);
        sync(holder);
      }
    },
    { threshold: 0.25 },
  );
  for (const holder of holders) observer.observe(holder);
  onMotionChange(() => holders.forEach(sync));
}

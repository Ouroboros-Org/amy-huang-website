import "stacked-alpha-video";

/**
 * Playback for the journey's videos: plain background loops and stacked-alpha
 * cut-outs alike. A holder's `data-state` is "poster" until its first frame
 * plays, then "playing"; "refused" records a refused play() (iOS Low Power Mode,
 * data saver) and keeps the poster.
 */
export function bindMedia(root: ParentNode): void {
  for (const holder of root.querySelectorAll<HTMLElement>("[data-media]")) {
    const video = holder.querySelector("video");
    video?.addEventListener(
      "playing",
      () => (holder.dataset.state = "playing"),
    );
  }
}

export function playMedia(root: ParentNode): void {
  for (const holder of root.querySelectorAll<HTMLElement>("[data-media]")) {
    const video = holder.querySelector("video");
    if (!video || !video.paused) continue;
    video.play().catch((error: DOMException) => {
      // An AbortError only means a pause() overtook this play().
      if (error.name === "NotAllowedError") holder.dataset.state = "refused";
    });
  }
}

export function pauseMedia(root: ParentNode): void {
  for (const video of root.querySelectorAll<HTMLVideoElement>(
    "[data-media] video",
  )) {
    if (!video.paused) video.pause();
  }
}

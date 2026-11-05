import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned, scroll-scrubbed scenes built from independent layers.
 *
 * A `[data-scene]` element pins while the reader scrolls `data-length` viewport
 * heights (default 1.5). Each `[data-layer]` inside it has its own windows on the
 * scene's progress (0 = pinned, 1 = released):
 *
 * - `data-in` (JSON GSAP vars) and `data-in-window="start end"`: the layer animates
 *   from these values to its rendered state.
 * - `data-out` and `data-out-window`: the layer animates from its rendered state to
 *   these values.
 *
 * The HTML is the finished composition. Motion only starts once this script runs and
 * the reader allows motion, so without it every layer is simply visible.
 */
export function initScenes(root: ParentNode = document): gsap.MatchMedia {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    for (const scene of root.querySelectorAll<HTMLElement>("[data-scene]")) {
      buildScene(scene);
    }
  });
  return media;
}

function buildScene(scene: HTMLElement): void {
  const length = Number(scene.dataset.length ?? 1.5);
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: `+=${length * 100}%`,
      pin: true,
      scrub: true,
    },
  });
  for (const layer of scene.querySelectorAll<HTMLElement>("[data-layer]")) {
    const enter = layer.dataset.in;
    if (enter) {
      const [start, end] = parseWindow(layer.dataset.inWindow, [0, 0.3]);
      timeline.from(
        layer,
        { ...parseVars(enter), duration: end - start },
        start,
      );
    }
    const exit = layer.dataset.out;
    if (exit) {
      const [start, end] = parseWindow(layer.dataset.outWindow, [0.8, 1]);
      timeline.to(layer, { ...parseVars(exit), duration: end - start }, start);
    }
  }
  // Keep progress 0..1 mapped to the whole pin, even when no layer reaches the end.
  timeline.set({}, {}, 1);
}

function parseWindow(
  value: string | undefined,
  fallback: [number, number],
): [number, number] {
  if (!value) return fallback;
  const [start, end] = value.trim().split(/\s+/).map(Number);
  if (!(start >= 0 && end <= 1 && start < end)) {
    throw new Error(
      `Invalid layer window "${value}": use "start end" within 0..1`,
    );
  }
  return [start, end];
}

function parseVars(value: string): gsap.TweenVars {
  return JSON.parse(value) as gsap.TweenVars;
}

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bindMedia, pauseMedia, playMedia } from "./media";
import { motionAllowed, onMotionChange } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The full-screen video journey.
 *
 * The HTML is a plain stack of full-screen chapters (`[data-chapter]` inside
 * `[data-journey]`), which is what readers get without JavaScript, with reduced
 * motion, or with motion paused. When motion is allowed, the journey becomes one
 * pinned stage: chapters lie on top of each other and a single scrubbed timeline
 * moves through them.
 *
 * - `data-length` on a chapter: its share of the scroll, in viewport heights.
 * - `data-reveal="circle"` (default) opens the chapter over the previous one through
 *   a growing circle centred at `data-reveal-at` ("50% 50%"). `"under"` places it
 *   beneath the previous chapter from the start, which then has to clear the way
 *   itself, as the hero does by zooming through its opening.
 * - `[data-layer]` elements animate on their own windows of their chapter's stretch:
 *   `data-in` / `data-in-window` from the given GSAP vars to the rendered state, and
 *   `data-out` / `data-out-window` from the rendered state to the given vars.
 *
 * Only chapters on screen play their videos, so at most two decode at once.
 */

interface Segment {
  chapter: HTMLElement;
  start: number;
  end: number;
  length: number;
  revealEnd: number;
  /** When the chapter is on screen, in timeline units. */
  shownFrom: number;
  shownTo: number;
}

const REVEAL_SHARE = 0.35;
const SETTLED_SHARE = 0.8;

export function initJourney(): void {
  const root = document.querySelector<HTMLElement>("[data-journey]");
  if (!root) return;
  bindMedia(root);

  let context: gsap.Context | undefined;
  let journey:
    { segments: Segment[]; total: number; trigger: ScrollTrigger } | undefined;

  const build = () => {
    context?.revert();
    context = undefined;
    journey = undefined;
    root.classList.remove("journey--live");
    pauseMedia(root);
    if (motionAllowed()) {
      root.classList.add("journey--live");
      context = gsap.context(() => {
        journey = buildTimeline(root);
      });
    }
    ScrollTrigger.refresh();
  };

  const scrollToChapter = (chapter: HTMLElement, smooth: boolean) => {
    const segment = journey?.segments.find((s) => s.chapter === chapter);
    if (!journey || !segment) {
      chapter.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      return;
    }
    const { trigger, total } = journey;
    // Land where the chapter has settled: its text and notes are in by then.
    const at =
      segment.start === 0 ? 0 : segment.start + SETTLED_SHARE * segment.length;
    const top = trigger.start + (at / total) * (trigger.end - trigger.start);
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };

  build();
  onMotionChange(build);

  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    const target = link && document.getElementById(link.hash.slice(1));
    if (!target || !journey || !target.matches("[data-chapter]")) return;
    event.preventDefault();
    history.replaceState(null, "", link.hash);
    scrollToChapter(target, true);
  });

  // Keyboard users can tab into a chapter that is currently covered: bring it up.
  root.addEventListener("focusin", (event) => {
    const chapter = (event.target as Element).closest<HTMLElement>(
      "[data-chapter]",
    );
    if (chapter && journey && chapter.dataset.active !== "true") {
      scrollToChapter(chapter, false);
    }
  });

  const initial =
    location.hash && document.getElementById(location.hash.slice(1));
  if (initial && initial.matches("[data-chapter]"))
    scrollToChapter(initial, false);
}

function buildTimeline(root: HTMLElement) {
  const chapters = [
    ...root.querySelectorAll<HTMLElement>(":scope > [data-chapter]"),
  ];

  let cursor = 0;
  const segments: Segment[] = chapters.map((chapter) => {
    const length = Number(chapter.dataset.length ?? 1.5);
    const start = cursor;
    cursor += length;
    const reveals = start > 0 && chapter.dataset.reveal !== "under";
    return {
      chapter,
      start,
      end: start + length,
      length,
      revealEnd: reveals ? start + REVEAL_SHARE * length : start,
      shownFrom: chapter.dataset.reveal === "under" ? 0 : start,
      shownTo: Number.POSITIVE_INFINITY,
    };
  });
  const total = cursor;

  // A chapter leaves the screen once the next one has fully covered it, or, when
  // the next lies under it, once its own stretch ends.
  segments.forEach((segment, index) => {
    const next = segments[index + 1];
    if (next) {
      segment.shownTo =
        next.chapter.dataset.reveal === "under" ? segment.end : next.revealEnd;
    }
  });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${total * window.innerHeight}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => showActive(segments, self.progress * total),
    },
  });

  segments.forEach((segment, index) => {
    const { chapter } = segment;
    const next = segments[index + 1];
    const clearsTheWay = next?.chapter.dataset.reveal === "under";
    gsap.set(chapter, { zIndex: clearsTheWay ? 100 + index : index + 1 });

    if (segment.revealEnd > segment.start) {
      const at = chapter.dataset.revealAt ?? "50% 50%";
      timeline.fromTo(
        chapter,
        { clipPath: `circle(0% at ${at})` },
        {
          clipPath: `circle(150% at ${at})`,
          duration: segment.revealEnd - segment.start,
          ease: "power2.in",
        },
        segment.start,
      );
    }
    if (clearsTheWay) {
      // Fade rather than hide, so its text stays available to screen readers.
      timeline.set(chapter, { opacity: 0, pointerEvents: "none" }, segment.end);
    }

    for (const layer of chapter.querySelectorAll<HTMLElement>("[data-layer]")) {
      addLayer(timeline, layer, segment);
    }
  });
  timeline.set({}, {}, total);

  const trigger = timeline.scrollTrigger!;
  showActive(segments, trigger.progress * total);
  return { segments, total, trigger };
}

function addLayer(
  timeline: gsap.core.Timeline,
  layer: HTMLElement,
  segment: Segment,
): void {
  const at = (fraction: number) => segment.start + fraction * segment.length;
  if (layer.dataset.in) {
    const [from, to] = parseWindow(layer.dataset.inWindow, [0, 0.3]);
    timeline.from(
      layer,
      { ...parseVars(layer.dataset.in), duration: at(to) - at(from) },
      at(from),
    );
  }
  if (layer.dataset.out) {
    const [from, to] = parseWindow(layer.dataset.outWindow, [0.8, 1]);
    timeline.to(
      layer,
      { ...parseVars(layer.dataset.out), duration: at(to) - at(from) },
      at(from),
    );
  }
}

function showActive(segments: Segment[], time: number): void {
  for (const { chapter, shownFrom, shownTo } of segments) {
    const active = time >= shownFrom && time <= shownTo;
    if ((chapter.dataset.active === "true") === active) continue;
    chapter.dataset.active = String(active);
    if (active) playMedia(chapter);
    else pauseMedia(chapter);
  }
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

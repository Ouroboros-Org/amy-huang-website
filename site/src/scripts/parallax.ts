import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whileMotion } from "./live";

gsap.registerPlugin(ScrollTrigger);

/**
 * Soft drift, tied to the scroll position: a `[data-drift]` layer slides by
 * that many percent of its own height, from minus to plus, while its
 * `[data-drift-root]` crosses the screen. The layer should be larger than its
 * root by at least that much on each side.
 *
 * Built only while motion is allowed; otherwise the layers stay where the HTML
 * puts them.
 */
export function initParallax(): void {
  const drifts = [...document.querySelectorAll<HTMLElement>("[data-drift]")];
  if (drifts.length === 0) return;

  whileMotion(() => {
    const context = gsap.context(() => {
      for (const layer of drifts) {
        const amount = Number(layer.dataset.drift);
        gsap.fromTo(
          layer,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: layer.closest("[data-drift-root]") ?? layer,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    });
    return () => context.revert();
  });
}

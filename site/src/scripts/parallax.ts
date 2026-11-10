import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whileMotion } from "./live";

gsap.registerPlugin(ScrollTrigger);

/**
 * Soft parallax, two kinds, both tied to the scroll position:
 *
 * - Inside a `[data-parallax-root]` at the top of the page, each `[data-parallax]`
 *   layer lags behind the page by its factor while the root scrolls out of view:
 *   0 moves with the page, 0.45 travels 45% less. The root should clip its overflow.
 * - A `[data-drift]` layer slides by that many percent of its own height, from
 *   minus to plus, while its `[data-drift-root]` crosses the screen. The layer
 *   should be larger than its root by at least that much on each side.
 *
 * Built only while motion is allowed; otherwise the layers stay where the HTML
 * puts them.
 */
export function initParallax(): void {
  const roots = [
    ...document.querySelectorAll<HTMLElement>("[data-parallax-root]"),
  ];
  const drifts = [...document.querySelectorAll<HTMLElement>("[data-drift]")];
  if (roots.length === 0 && drifts.length === 0) return;

  whileMotion(() => {
    const context = gsap.context(() => {
      for (const root of roots) {
        for (const layer of root.querySelectorAll<HTMLElement>(
          "[data-parallax]",
        )) {
          const factor = Number(layer.dataset.parallax);
          gsap.to(layer, {
            y: () => factor * root.offsetHeight,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }
      }
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

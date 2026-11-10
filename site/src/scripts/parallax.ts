import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed, onMotionChange } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Soft parallax. Inside a `[data-parallax-root]`, each `[data-parallax]` layer lags
 * behind the page by its factor while the root scrolls out of view: 0 moves with
 * the page, 0.45 travels 45% less. The root should clip its overflow.
 *
 * Built only while motion is allowed; otherwise the layers stay where the HTML
 * puts them.
 */
export function initParallax(): void {
  const roots = [
    ...document.querySelectorAll<HTMLElement>("[data-parallax-root]"),
  ];
  if (roots.length === 0) return;

  let context: gsap.Context | undefined;
  const build = () => {
    context?.revert();
    context = undefined;
    if (!motionAllowed()) return;
    context = gsap.context(() => {
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
    });
  };

  build();
  onMotionChange(build);
}

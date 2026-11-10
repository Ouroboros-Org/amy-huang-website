import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whileMotion } from "./live";

gsap.registerPlugin(ScrollTrigger);

/** Where each card flies to, as an angle around the centre, in degrees. */
const ANGLES = [200, 20, 290, 110, 160, 340, 245, 65, 180, 0, 315, 135];
/** Share of the scroll one card's flight takes; the rest staggers their starts. */
const FLIGHT = 0.42;

/**
 * The gallery pin (`[data-gallery]`): while the section is pinned, each card
 * starts small at the centre of the screen and flies outward past its edge,
 * growing as it comes, one after another. Scroll position drives it, so it
 * stops where the reader stops.
 */
export function initGallery(): void {
  const section = document.querySelector<HTMLElement>("[data-gallery]");
  if (!section) return;
  const cards = [
    ...section.querySelectorAll<HTMLElement>("[data-gallery-card]"),
  ];

  whileMotion(() => {
    section.classList.add("gallery--live");
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((card, index) => {
        const angle = (ANGLES[index % ANGLES.length] * Math.PI) / 180;
        // Far enough to clear the screen in any direction, at full size.
        const reach = () =>
          0.62 * Math.hypot(window.innerWidth, window.innerHeight) +
          card.offsetWidth;
        const start = (index / cards.length) * (1 - FLIGHT);
        timeline.fromTo(
          card,
          {
            x: () => Math.cos(angle) * reach() * 0.03,
            y: () => Math.sin(angle) * reach() * 0.03,
            scale: 0.1,
          },
          {
            x: () => Math.cos(angle) * reach(),
            y: () => Math.sin(angle) * reach(),
            scale: 1.5,
            duration: FLIGHT,
            ease: "power2.in",
          },
          start,
        );
        timeline.fromTo(
          card,
          { opacity: 0 },
          { opacity: 1, duration: FLIGHT * 0.18 },
          start,
        );
      });
      timeline.set({}, {}, 1);
    });
    return () => {
      context.revert();
      section.classList.remove("gallery--live");
      ScrollTrigger.refresh();
    };
  });
}

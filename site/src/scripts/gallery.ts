import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whileMotion } from "./live";

gsap.registerPlugin(ScrollTrigger);

/** Each card flies out a golden angle round from the last, so they spread evenly. */
const GOLDEN_ANGLE = 137.5;
/** Share of the flight one card's journey takes; the rest staggers their starts. */
const FLIGHT = 0.42;
/**
 * How far into the flight the section arrives: the screen is already full of
 * pictures, some close and large, some still small at the centre.
 */
const ARRIVE = 0.5;

/**
 * The gallery pin (`[data-gallery]`): while the section is pinned, each card
 * starts small at the centre of the screen and flies outward past its edge,
 * growing as it comes, one after another. The section arrives with the flight
 * under way and leaves once the last card has gone, so it opens full and ends
 * on the sentence alone. Scroll position drives it, so it stops where the
 * reader stops.
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
      const flight = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
      });
      cards.forEach((card, index) => {
        const angle = ((200 + index * GOLDEN_ANGLE) * Math.PI) / 180;
        // Far enough to clear the screen in any direction, at full size.
        const reach = () =>
          0.62 * Math.hypot(window.innerWidth, window.innerHeight) +
          card.offsetWidth;
        const start = (index / cards.length) * (1 - FLIGHT);
        flight.fromTo(
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
        flight.fromTo(
          card,
          { opacity: 0 },
          { opacity: 1, duration: FLIGHT * 0.18 },
          start,
        );
      });
      flight.set({}, {}, 1);

      // The scroll runs the flight from ARRIVE to its end. Before the pin, as
      // the section comes up the screen, it holds the arrival.
      gsap.fromTo(
        flight,
        { progress: ARRIVE },
        {
          progress: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    });
    return () => {
      context.revert();
      section.classList.remove("gallery--live");
      ScrollTrigger.refresh();
    };
  });
}

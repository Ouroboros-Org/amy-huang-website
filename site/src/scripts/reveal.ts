import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whileMotion } from "./live";

gsap.registerPlugin(ScrollTrigger);

/**
 * Text that comes into focus as it scrolls into view, as in the theme:
 *
 * - `data-reveal` on a heading sharpens it word by word.
 * - `data-reveal="block"` sharpens the whole element at once.
 *
 * Scroll position drives it. With motion off the text is simply there.
 */
export function initReveal(): void {
  const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (targets.length === 0) return;

  whileMotion(() => {
    const originals = new Map<HTMLElement, string>();
    const context = gsap.context(() => {
      for (const target of targets) {
        const trigger = {
          trigger: target,
          start: "top 88%",
          end: "top 40%",
          scrub: true,
        };
        if (target.dataset.reveal === "block") {
          gsap.from(target, {
            opacity: 0,
            filter: "blur(10px)",
            y: 24,
            ease: "none",
            scrollTrigger: trigger,
          });
          continue;
        }
        originals.set(target, target.innerHTML);
        gsap.from(splitWords(target), {
          opacity: 0.12,
          filter: "blur(8px)",
          stagger: 0.1,
          ease: "none",
          scrollTrigger: trigger,
        });
      }
    });
    return () => {
      context.revert();
      for (const [target, html] of originals) target.innerHTML = html;
    };
  });
}

/** Wrap each word of the element's text in a span, keeping the spaces between. */
function splitWords(root: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const text of texts) {
    const fragment = document.createDocumentFragment();
    for (const part of (text.textContent ?? "").split(/(\s+)/)) {
      if (part === "") continue;
      if (/^\s+$/.test(part)) {
        fragment.append(" ");
        continue;
      }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      word.textContent = part;
      words.push(word);
      fragment.append(word);
    }
    text.replaceWith(fragment);
  }
  return words;
}

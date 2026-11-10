import { whileMotion } from "./live";

/** Screens of scrolling each offering gets while the section is pinned. */
const STEP = 0.6;

/**
 * The offerings switcher (`[data-switcher]`, see components/Offerings.astro):
 * while its screen is pinned, scrolling steps through the offerings. The current
 * name is marked, its panel shows, the counter follows and a line fills. Scroll
 * position drives it, so nothing moves on its own.
 */
export function initSwitcher(): void {
  const section = document.querySelector<HTMLElement>("[data-switcher]");
  const track = section?.querySelector<HTMLElement>("[data-switcher-track]");
  if (!section || !track) return;
  const names = [
    ...section.querySelectorAll<HTMLElement>("[data-switcher-name]"),
  ];
  const panels = [
    ...section.querySelectorAll<HTMLElement>("[data-switcher-panel]"),
  ];
  const fill = section.querySelector<HTMLElement>("[data-switcher-fill]");
  const count = section.querySelector<HTMLElement>("[data-switcher-count]");
  if (panels.length === 0) return;

  whileMotion(() => {
    section.classList.add("offer--live");
    const layout = () => {
      track.style.height = `${window.innerHeight * (1 + STEP * panels.length)}px`;
    };
    const update = () => {
      const { top, height } = track.getBoundingClientRect();
      const through = Math.min(
        1,
        Math.max(0, -top / (height - window.innerHeight)),
      );
      const current = Math.min(
        panels.length - 1,
        Math.floor(through * panels.length),
      );
      panels.forEach((panel, index) =>
        panel.toggleAttribute("data-active", index === current),
      );
      names.forEach((name, index) => {
        if (index === current) name.setAttribute("aria-current", "true");
        else name.removeAttribute("aria-current");
      });
      if (fill) fill.style.transform = `scaleX(${through})`;
      if (count) count.textContent = String(current + 1).padStart(2, "0");
    };
    const resize = () => {
      layout();
      update();
    };

    resize();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
      section.classList.remove("offer--live");
      track.style.height = "";
      panels.forEach((panel) => panel.removeAttribute("data-active"));
      names.forEach((name) => name.removeAttribute("aria-current"));
      if (fill) fill.style.transform = "";
    };
  });
}

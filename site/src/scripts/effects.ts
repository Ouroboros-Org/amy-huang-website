import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initCarousel } from "./carousel";
import { initFooterShader } from "./footer-shader";
import { initGallery } from "./gallery";
import { onMotionChange } from "./motion";
import { initParallax } from "./parallax";
import { initReveal } from "./reveal";
import { initSwitcher } from "./switcher";

/**
 * Everything on the page that moves, started together. Each effect builds
 * itself only while motion is allowed and puts the page back when it isn't.
 */
export function initEffects(): void {
  // The effects that change the page's length come first, so the scroll-tied
  // ones after them measure the final layout.
  initGallery();
  initCarousel();
  initSwitcher();
  initParallax();
  initReveal();
  initFooterShader();
  if (document.querySelector("[data-media]")) {
    void import("./play-in-view").then(({ initPlayInView }) =>
      initPlayInView(),
    );
  }
  ScrollTrigger.refresh();
  // Registered last, so it runs after every effect has rebuilt or reverted.
  onMotionChange(() => ScrollTrigger.refresh());
}

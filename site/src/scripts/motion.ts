/**
 * Whether the page may move: the reader's reduced-motion setting, plus the
 * site's own pause control, remembered per browser. Everything that animates or
 * plays video asks here and listens for changes.
 */
const STORAGE_KEY = "motion-paused";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const listeners = new Set<() => void>();

let paused = readPaused();

function readPaused(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function notify(): void {
  document.documentElement.dataset.motion = motionAllowed() ? "on" : "off";
  for (const listener of listeners) listener();
}

export function motionAllowed(): boolean {
  return !reduceMotion.matches && !paused;
}

export function motionPaused(): boolean {
  return paused;
}

export function setMotionPaused(value: boolean): void {
  paused = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Private windows may refuse storage; the choice then lasts for this page only.
  }
  notify();
}

export function onMotionChange(listener: () => void): void {
  listeners.add(listener);
}

reduceMotion.addEventListener("change", notify);
document.documentElement.dataset.motion = motionAllowed() ? "on" : "off";

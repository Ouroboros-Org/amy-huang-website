import { motionAllowed, onMotionChange } from "./motion";

/**
 * Run an effect only while motion is allowed. `setup` builds it and may return
 * its teardown; the effect is torn down when motion is paused or reduced and
 * built again when motion comes back.
 */
export function whileMotion(setup: () => (() => void) | void): void {
  let teardown: (() => void) | void;
  const sync = () => {
    teardown?.();
    teardown = undefined;
    if (motionAllowed()) teardown = setup();
  };
  sync();
  onMotionChange(sync);
}

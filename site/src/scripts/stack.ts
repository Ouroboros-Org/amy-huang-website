import { palette } from "../lib/brand";
import { whileMotion } from "./live";

/**
 * The work cards, live (`[data-stack]`, see components/Stops.astro).
 *
 * One screen pins while the cards scroll through it, one card per card-height of
 * scrolling, so they move at native scroll speed. A canvas draws the cards'
 * pictures through a lens: a slight pinch, a little colour split toward the
 * edges of the screen, and a slow water wobble. All three swell with scroll speed and settle
 * when the reader stops. The cards' words stay HTML, moved in step.
 *
 * It needs WebGL. Without it, or with motion off, the cards keep their plain
 * stacking layout.
 */

/** Card size as a share of the stage, and the gap between cards. */
const CARD_WIDTH = 0.8;
const CARD_HEIGHT = 0.7;
const GAP = 0.07;
/** On phones the card takes the width, less this margin in CSS pixels. */
const PHONE_MARGIN = 16;
const PHONE = 768;
/** Draw at most this many device pixels per CSS pixel. */
const MAX_DPR = 1.5;
/** Pictures are drawn into textures no wider than this. */
const MAX_TEXTURE = 1440;
/** Cards per second of scrolling at which the effects are at their fullest. */
const FULL_SPEED = 2.4;
/** Night over the pictures, as the plain cards' scrim. */
const SCRIM = 0.5;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec2 uCard;
uniform float uRadius;
uniform float uPitch;
uniform float uShift;
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform vec2 uSize0;
uniform vec2 uSize1;
uniform vec2 uSize2;
uniform vec3 uOn;
uniform float uTime;
uniform float uVel;
uniform vec3 uBg;
uniform vec3 uNight;
uniform float uScrim;

// Radial lens around the centre of the screen; negative k pinches the sides in.
vec2 lens(vec2 uv, float k) {
  float aspect = uRes.x / uRes.y;
  vec2 c = uv - 0.5;
  c.x *= aspect;
  c *= 1.0 + k * dot(c, c);
  c.x /= aspect;
  return c + 0.5;
}

float roundBox(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// One card centred at height cy: its picture, cropped to cover, and its mask.
vec4 card(vec2 px, float cy, sampler2D tex, vec2 size) {
  vec2 p = px - vec2(uRes.x * 0.5, cy);
  float mask = 1.0 - smoothstep(-0.75, 0.75, roundBox(p, uCard * 0.5, uRadius));
  float cardAspect = uCard.x / uCard.y;
  float imageAspect = size.x / size.y;
  vec2 crop = cardAspect > imageAspect
    ? vec2(1.0, imageAspect / cardAspect)
    : vec2(cardAspect / imageAspect, 1.0);
  vec2 uv = clamp(p / uCard * crop + 0.5, 0.0, 1.0);
  return vec4(mix(texture2D(tex, uv).rgb, uNight, uScrim), mask);
}

vec4 scene(vec2 px) {
  float cy = uRes.y * 0.5 - uShift * uPitch;
  vec4 a = card(px, cy, uTex0, uSize0);
  vec4 b = card(px, cy + uPitch, uTex1, uSize1);
  vec4 c = card(px, cy + 2.0 * uPitch, uTex2, uSize2);
  a.a *= uOn.x;
  b.a *= uOn.y;
  c.a *= uOn.z;
  vec3 colour = mix(mix(a.rgb, b.rgb, b.a), c.rgb, c.a);
  return vec4(colour, max(a.a, max(b.a, c.a)));
}

void main() {
  // Water: two slow waves each way, a touch at rest and more while scrolling.
  float wobble = 0.0007 + 0.0045 * uVel;
  vec2 uv = vUv + wobble * vec2(
    sin(vUv.y * 13.0 + uTime * 0.8) + 0.5 * sin(vUv.y * 29.0 - uTime * 1.2),
    cos(vUv.x * 11.0 + uTime * 0.6) + 0.5 * cos(vUv.x * 23.0 + uTime * 1.0)
  );
  // Lens, with red and blue bent a little less and more than green. The cards
  // keep one outline (green's), so the split colours the pictures, not their edges.
  float k = -(0.05 + 0.2 * uVel);
  float split = 0.006 + 0.03 * uVel;
  vec4 r = scene(lens(uv, k - split) * uRes);
  vec4 g = scene(lens(uv, k) * uRes);
  vec4 b = scene(lens(uv, k + split) * uRes);
  gl_FragColor = vec4(mix(uBg, vec3(r.r, g.g, b.b), g.a), 1.0);
}`;

interface Picture {
  texture: WebGLTexture;
  width: number;
  height: number;
  /** A playing video refreshes its texture every frame. */
  video?: HTMLVideoElement;
}

export function initStack(): void {
  const section = document.querySelector<HTMLElement>("[data-stack]");
  const track = section?.querySelector<HTMLElement>("[data-stack-track]");
  const stage = section?.querySelector<HTMLElement>("[data-stack-stage]");
  const canvas = section?.querySelector<HTMLCanvasElement>(
    "[data-stack-canvas]",
  );
  if (!section || !track || !stage || !canvas) return;
  const cards = [...section.querySelectorAll<HTMLElement>("[data-stack-card]")];
  const ticks = [
    ...section.querySelectorAll<HTMLButtonElement>("[data-stack-tick]"),
  ];
  if (cards.length === 0) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  const program = gl && createProgram(gl);
  if (!gl || !program) return;

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  gl.uniform3fv(uniform("uBg"), rgb(palette.page));
  gl.uniform3fv(uniform("uNight"), rgb(palette.night));
  gl.uniform1f(uniform("uScrim"), SCRIM);
  [0, 1, 2].forEach((unit) => gl.uniform1i(uniform(`uTex${unit}`), unit));

  const pictures = cards.map((card) => loadPicture(gl, card));
  let lost = false;
  canvas.addEventListener("webglcontextlost", () => (lost = true));

  whileMotion(() => {
    if (lost) return;
    section.classList.add("stops--live");

    let pitch = 1;
    let frame = 0;
    let running = false;
    let lastProgress = 0;
    let lastTime = performance.now();
    let speed = 0;
    const started = performance.now();

    const layout = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const cardWidth =
        width < PHONE ? width - 2 * PHONE_MARGIN : width * CARD_WIDTH;
      const cardHeight = height * CARD_HEIGHT;
      pitch = cardHeight + height * GAP;
      track.style.height = `${height + (cards.length - 1) * pitch}px`;
      stage.style.setProperty("--card-w", `${cardWidth}px`);
      stage.style.setProperty("--card-h", `${cardHeight}px`);

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniform("uRes"), canvas.width, canvas.height);
      gl.uniform2f(uniform("uCard"), cardWidth * dpr, cardHeight * dpr);
      gl.uniform1f(uniform("uPitch"), pitch * dpr);
      const radius = parseFloat(getComputedStyle(cards[0]).borderRadius) || 20;
      gl.uniform1f(uniform("uRadius"), radius * dpr);
    };

    /** How far through the cards the page has scrolled: 0 at the first, n-1 at the last. */
    const progress = () =>
      Math.min(
        cards.length - 1,
        Math.max(0, -track.getBoundingClientRect().top / pitch),
      );

    const draw = (now: number) => {
      const at = progress();
      const seconds = Math.max(0.001, (now - lastTime) / 1000);
      const target = Math.min(
        1,
        Math.abs(at - lastProgress) / seconds / FULL_SPEED,
      );
      speed += (target - speed) * 0.12;
      lastProgress = at;
      lastTime = now;

      cards.forEach((card, index) => {
        card.style.transform = `translate3d(0, ${(index - at) * pitch}px, 0)`;
      });
      const current = Math.round(at);
      ticks.forEach((tick, index) => {
        if (index === current) tick.setAttribute("aria-current", "true");
        else tick.removeAttribute("aria-current");
      });

      const first = Math.min(cards.length - 1, Math.floor(at));
      const on = [0, 0, 0];
      for (let unit = 0; unit < 3; unit++) {
        const picture = pictures[first + unit];
        if (!picture) continue;
        on[unit] = 1;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, picture.texture);
        refreshVideo(gl, picture);
        gl.uniform2f(uniform(`uSize${unit}`), picture.width, picture.height);
      }
      gl.uniform3f(uniform("uOn"), on[0], on[1], on[2]);
      gl.uniform1f(uniform("uShift"), at - first);
      gl.uniform1f(uniform("uTime"), (now - started) / 1000);
      gl.uniform1f(uniform("uVel"), speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const onScreen = () => {
      const { top, bottom } = stage.getBoundingClientRect();
      return bottom > 0 && top < window.innerHeight;
    };
    const tick = (now: number) => {
      if (lost || !onScreen()) {
        running = false;
        return;
      }
      draw(now);
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (running || !onScreen()) return;
      running = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      layout();
      draw(performance.now());
    };
    const scrollTo = (index: number) => {
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + index * pitch });
    };
    const onTick = (event: Event) =>
      scrollTo(ticks.indexOf(event.currentTarget as HTMLButtonElement));
    // Tabbing to a card that is off screen brings it to the middle.
    const onFocus = (event: FocusEvent) => {
      const index = cards.findIndex((card) =>
        card.contains(event.target as Node),
      );
      if (index >= 0 && Math.abs(index - progress()) > 0.5) scrollTo(index);
    };

    layout();
    draw(performance.now());
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", resize);
    ticks.forEach((button) => button.addEventListener("click", onTick));
    stage.addEventListener("focusin", onFocus);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", resize);
      ticks.forEach((button) => button.removeEventListener("click", onTick));
      stage.removeEventListener("focusin", onFocus);
      section.classList.remove("stops--live");
      track.style.height = "";
      cards.forEach((card) => (card.style.transform = ""));
    };
  });
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/** A card's picture as a texture: night until its image has loaded. */
function loadPicture(gl: WebGLRenderingContext, card: HTMLElement): Picture {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  for (const [name, value] of [
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, name, value);
  }
  const night = rgb(palette.night).map((channel) => Math.round(channel * 255));
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([...night, 255]),
  );
  const picture: Picture = {
    texture,
    width: 1,
    height: 1,
    video: card.querySelector("video") ?? undefined,
  };

  const image = card.querySelector("img");
  if (image) {
    // Through a 2D canvas: it sizes vector placeholders and caps large photos.
    const upload = () => {
      const naturalWidth = image.naturalWidth || image.width || 1500;
      const naturalHeight = image.naturalHeight || image.height || 1000;
      const scale = Math.min(1, MAX_TEXTURE / naturalWidth);
      const raster = document.createElement("canvas");
      raster.width = Math.round(naturalWidth * scale);
      raster.height = Math.round(naturalHeight * scale);
      try {
        raster
          .getContext("2d")
          ?.drawImage(image, 0, 0, raster.width, raster.height);
      } catch {
        return; // A broken image keeps the card night-coloured.
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        raster,
      );
      picture.width = raster.width;
      picture.height = raster.height;
    };
    // A vector placeholder can be complete and still report no natural size.
    if (image.complete) upload();
    else image.addEventListener("load", upload, { once: true });
  }
  return picture;
}

/** While a card's video plays, its current frame is the card's picture. */
function refreshVideo(gl: WebGLRenderingContext, picture: Picture): void {
  const { video } = picture;
  if (!video || video.paused || video.readyState < 2) return;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  picture.width = video.videoWidth;
  picture.height = video.videoHeight;
}

function rgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

import { whileMotion } from "./live";

/*
 * The work cards, live (`[data-carousel]`, see components/Stops.astro).
 *
 * The project carousel of the Elias Vent theme (src/scripts/carousel.ts in
 * https://github.com/agnilem/elias-vent-astro, MIT, © 2026 Alex Prokhorov; see
 * THIRD-PARTY-NOTICES.md). Adapted here: the pictures come from the cards' own
 * <img> (or a playing <video>), the sizes from the cards' CSS, and it runs only
 * while motion is allowed. The colour split is stronger than the theme's and
 * splits each card's outline as well as its picture, so it shows on any
 * picture, flat ones included.
 *
 * The stage pins; one smoothed scroll value drives the pictures, drawn as
 * planes mapped onto a cylinder, and the cards' words together. The words move
 * one to one and rise in letter by letter; the pictures trail slightly. A
 * liquid wobble and a colour split swell with scroll speed. Without WebGL, or
 * with motion off, the cards keep their plain layout.
 */
const CFG = {
  baseTilt: 0,
  skewStrength: 0,
  curve: 1.4,
  parallax: 0.8,
  smoothness: 0.16,
  distortion: 2.6,
  chroma: 2.2,
  radius: 20,
  tint: 0.4,
};
/** Pictures are drawn into textures no wider than this. */
const MAX_TEXTURE = 1600;
/** Room around each plane, in CSS pixels, for its split outline. */
const FRINGE = 40;

const VERT = `
attribute vec2 aPos;
uniform vec2 uHalf;
uniform vec2 uRes;
uniform float uTiltZ;
uniform float uSkewY;
uniform float uAngle;
uniform float uRadius;
uniform float uPersp;
uniform float uShiftX;
varying vec2 vUv;
void main(){
  vUv = vec2(aPos.x * 0.5 + 0.5, aPos.y * 0.5 + 0.5);
  vec2 lp = vec2(aPos.x * uHalf.x, aPos.y * uHalf.y);
  lp.y += uSkewY * lp.x;
  float cs = cos(uTiltZ), sn = sin(uTiltZ);
  vec2 rp = vec2(lp.x * cs - lp.y * sn, lp.x * sn + lp.y * cs);
  float ang = uAngle + rp.y / uRadius;
  float wx = rp.x;
  float wy = uRadius * sin(ang);
  float wz = uRadius * (1.0 - cos(ang));
  float scale = uPersp / (uPersp - wz);
  float clipX = (wx * scale - uShiftX) / (uRes.x * 0.5);
  float clipY = (wy * scale) / (uRes.y * 0.5);
  gl_Position = vec4(clipX, clipY, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uImgA;
uniform float uBoxA;
uniform float uTime;
uniform float uAmp;
uniform float uChroma;
uniform float uVel;
uniform float uTint;
uniform vec2 uPlanePx;
uniform vec2 uQuadPx;
uniform float uRadiusPx;
uniform float uFlip;
vec4 tx(vec2 uv){
  return texture2D(uTex, vec2(uv.x, mix(uv.y, 1.0 - uv.y, uFlip)));
}
vec2 cover(vec2 uv, float ia, float ba){
  vec2 s = ia > ba ? vec2(ba/ia, 1.0) : vec2(1.0, ia/ba);
  return (uv - 0.5) * s + 0.5;
}
float edge(vec2 p){
  vec2 halfP = uPlanePx * 0.5;
  float rr = min(uRadiusPx, min(halfP.x, halfP.y));
  vec2 q = abs(p) - (halfP - vec2(rr));
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr;
  return 1.0 - smoothstep(0.0, 1.5, d);
}
void main(){
  // The quad is a fringe larger than the picture; pv is the place on the picture.
  vec2 pv = (vUv - 0.5) * uQuadPx / uPlanePx + 0.5;
  vec2 uv = cover(pv, uImgA, uBoxA);
  float mv = min(abs(uVel), 3.0);
  float v = uAmp * (0.28 + mv * 0.85);
  vec2 flow;
  flow.x = sin(uv.y * 9.0 + uTime * 1.3) * 0.012 * v;
  flow.y = cos(uv.x * 7.0 - uTime * 1.05) * 0.012 * v;
  uv += flow;
  float ch = uChroma * (0.003 + mv * 0.004);
  vec2 dir = vec2(ch, ch * 0.35);
  float r = tx(uv + dir).r;
  float g = tx(uv).g;
  float b = tx(uv - dir).b;
  vec3 col = vec3(r, g, b) * (1.0 - uTint);
  // The outline splits the same way: red and blue copies of the card's edge,
  // faint at rest and wider with speed.
  float es = uChroma * (0.0015 + mv * 0.004);
  vec2 shift = vec2(es, es * 0.35) * uPlanePx;
  vec2 p = (pv - 0.5) * uPlanePx;
  vec3 mask = vec3(edge(p + shift), edge(p), edge(p - shift));
  float alpha = max(mask.r, max(mask.g, mask.b));
  gl_FragColor = vec4(col * mask / max(alpha, 0.0001), alpha);
}`;

interface Picture {
  texture: WebGLTexture;
  /** Width over height; 0 until the picture has loaded. */
  aspect: number;
  /** A playing video refreshes its texture every frame. */
  video?: HTMLVideoElement;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function initCarousel(): void {
  const section = document.querySelector<HTMLElement>("[data-carousel]");
  const stage = section?.querySelector<HTMLElement>("[data-carousel-stage]");
  const canvas = section?.querySelector<HTMLCanvasElement>(
    "[data-carousel-canvas]",
  );
  if (!section || !stage || !canvas) return;
  const slides = [
    ...section.querySelectorAll<HTMLElement>("[data-carousel-slide]"),
  ];
  const buttons = [
    ...section.querySelectorAll<HTMLButtonElement>("[data-carousel-goto]"),
  ];
  const bars = section.querySelector<HTMLElement>("[data-carousel-bars]");
  const box = slides[0]?.querySelector<HTMLElement>(".slide__media");
  if (slides.length === 0 || !box) return;

  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: false,
    });
  } catch {
    gl = null;
  }
  const program = gl && createProgram(gl);
  if (!gl || !program) return;
  const context = gl;

  context.useProgram(program);
  context.enable(context.BLEND);
  context.blendFuncSeparate(
    context.SRC_ALPHA,
    context.ONE_MINUS_SRC_ALPHA,
    context.ONE,
    context.ONE_MINUS_SRC_ALPHA,
  );
  // Each plane is a strip of rows, so it can bend around the cylinder.
  const SEGMENTS = 26;
  const vertices: number[] = [];
  for (let row = 0; row < SEGMENTS; row++) {
    const y0 = -1 + (2 * row) / SEGMENTS;
    const y1 = -1 + (2 * (row + 1)) / SEGMENTS;
    vertices.push(-1, y0, 1, y0, -1, y1, -1, y1, 1, y0, 1, y1);
  }
  const vertexCount = vertices.length / 2;
  context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer());
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(vertices),
    context.STATIC_DRAW,
  );
  const position = context.getAttribLocation(program, "aPos");
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
  const uniform = (name: string) => context.getUniformLocation(program, name);
  const u = {
    half: uniform("uHalf"),
    res: uniform("uRes"),
    tiltZ: uniform("uTiltZ"),
    skewY: uniform("uSkewY"),
    angle: uniform("uAngle"),
    radius: uniform("uRadius"),
    persp: uniform("uPersp"),
    shiftX: uniform("uShiftX"),
    tex: uniform("uTex"),
    flip: uniform("uFlip"),
    imgA: uniform("uImgA"),
    boxA: uniform("uBoxA"),
    time: uniform("uTime"),
    amp: uniform("uAmp"),
    chroma: uniform("uChroma"),
    vel: uniform("uVel"),
    tint: uniform("uTint"),
    planePx: uniform("uPlanePx"),
    quadPx: uniform("uQuadPx"),
    radiusPx: uniform("uRadiusPx"),
  };
  // Every upload flips its rows, so the shader never has to.
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
  const pictures = slides.map((slide) => loadPicture(context, slide));
  let lost = false;
  canvas.addEventListener("webglcontextlost", () => (lost = true));

  whileMotion(() => {
    if (lost) return;
    section.classList.add("stops--live");

    const n = slides.length;
    let W = 0;
    let H = 0;
    let planeW = 0;
    let planeH = 0;
    let spacing = 75;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      context.viewport(0, 0, canvas.width, canvas.height);
      planeW = box.offsetWidth;
      planeH = box.offsetHeight;
      spacing =
        parseFloat(getComputedStyle(section).getPropertyValue("--sp")) || 75;
    };
    resize();
    const step = () => (clamp(spacing, 40, 300) / 100) * H;

    let active = -1;
    const setActive = (index: number) => {
      active = index;
      slides.forEach((slide, at) => {
        if (at === index) slide.dataset.active = "";
        else delete slide.dataset.active;
      });
      buttons.forEach((button, at) => {
        if (at === index) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    };
    setActive(0);

    const { baseTilt, skewStrength, curve, parallax, smoothness } = CFG;
    const ease = clamp(smoothness, 0.02, 1);
    const imageEase = clamp(ease * (1 - 0.75 * clamp(parallax, 0, 1)), 0.02, 1);
    let smooth: number | null = null;
    let smoothImage: number | null = null;
    let last = 0;
    let velocity = 0;
    let raf = 0;
    let running = false;
    let inView = true;
    const started = performance.now();

    const frame = () => {
      if (W !== canvas.clientWidth || H !== canvas.clientHeight) resize();
      const t = (performance.now() - started) / 1000;
      const target = -section.getBoundingClientRect().top;
      if (smooth === null) smooth = target;
      if (smoothImage === null) smoothImage = target;
      smooth += (target - smooth) * ease;
      smoothImage += (target - smoothImage) * imageEase;
      const s = smooth;
      velocity += (s - last - velocity) * 0.1;
      last = s;
      const skew = clamp(velocity * 0.02 * skewStrength, -0.5, 0.5);

      const theta = (baseTilt * Math.PI) / 180 + skew * 0.35;
      const arc = clamp(curve, 0, 2) * 0.9;
      const R = arc > 0.001 ? H / arc : H * 1000;
      const pitch = step();
      if (bars) {
        const past = clamp((s - (n - 1) * pitch) / (pitch * 0.5), 0, 1);
        bars.style.opacity = String(1 - past);
      }

      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);

      let best = 0;
      let bestDistance = Infinity;
      const draws: { offset: number; picture: Picture }[] = [];
      for (let index = 0; index < n; index++) {
        const offset = index * pitch - s;
        slides[index].style.transform = `translate3d(0, ${offset}px, 0)`;
        if (Math.abs(offset) < bestDistance) {
          bestDistance = Math.abs(offset);
          best = index;
        }
        const imageOffset = index * pitch - smoothImage;
        if (imageOffset < -1.6 * H || imageOffset > 1.6 * H) continue;
        const picture = pictures[index];
        if (picture.aspect > 0) draws.push({ offset: imageOffset, picture });
      }
      draws.sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));
      context.uniform2f(u.res, W, H);
      context.uniform1f(u.shiftX, 0);
      context.uniform2f(u.half, planeW / 2 + FRINGE, planeH / 2 + FRINGE);
      context.uniform2f(u.planePx, planeW, planeH);
      context.uniform2f(u.quadPx, planeW + 2 * FRINGE, planeH + 2 * FRINGE);
      context.uniform1f(u.radiusPx, CFG.radius);
      context.uniform1f(u.tiltZ, theta);
      context.uniform1f(u.skewY, Math.tan(skew * 0.6));
      context.uniform1f(u.radius, R);
      context.uniform1f(u.persp, H * 2.2);
      context.uniform1f(u.boxA, planeW / planeH);
      context.uniform1f(u.time, t);
      context.uniform1f(u.amp, CFG.distortion);
      context.uniform1f(u.chroma, CFG.chroma);
      context.uniform1f(u.vel, velocity * 0.03);
      context.uniform1f(u.tint, CFG.tint);
      context.uniform1f(u.flip, 0);
      context.activeTexture(context.TEXTURE0);
      context.uniform1i(u.tex, 0);
      for (const draw of draws) {
        context.uniform1f(u.angle, -draw.offset / R);
        context.bindTexture(context.TEXTURE_2D, draw.picture.texture);
        refreshVideo(context, draw.picture);
        context.uniform1f(u.imgA, draw.picture.aspect);
        context.drawArrays(context.TRIANGLES, 0, vertexCount);
      }

      // Switch only when clearly closer, so the midpoint doesn't flicker.
      if (
        best !== active &&
        bestDistance < Math.abs(active * pitch - s) - pitch * 0.15
      ) {
        setActive(best);
      }

      if (inView && !lost) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (inView) start();
      },
      { threshold: 0 },
    );
    observer.observe(section);

    const scrollTo = (index: number) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + index * step() });
    };
    const onGoto = (event: Event) =>
      scrollTo(buttons.indexOf(event.currentTarget as HTMLButtonElement));
    // Tabbing to a card that is off screen brings it to the middle.
    const onFocus = (event: FocusEvent) => {
      const index = slides.findIndex((slide) =>
        slide.contains(event.target as Node),
      );
      if (index >= 0 && index !== active) scrollTo(index);
    };

    start();
    window.addEventListener("resize", resize);
    buttons.forEach((button) => button.addEventListener("click", onGoto));
    stage.addEventListener("focusin", onFocus);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      observer.disconnect();
      window.removeEventListener("resize", resize);
      buttons.forEach((button) => button.removeEventListener("click", onGoto));
      stage.removeEventListener("focusin", onFocus);
      section.classList.remove("stops--live");
      slides.forEach((slide) => (slide.style.transform = ""));
      if (bars) bars.style.opacity = "";
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
  const vertex = compile(gl.VERTEX_SHADER, VERT);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/** A card's picture as a texture, filled once its image has loaded. */
function loadPicture(gl: WebGLRenderingContext, slide: HTMLElement): Picture {
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
  const picture: Picture = {
    texture,
    aspect: 0,
    video: slide.querySelector("video") ?? undefined,
  };

  const image = slide.querySelector("img");
  if (image) {
    // Through a 2D canvas: it sizes vector placeholders and caps large photos.
    const upload = () => {
      const width = image.naturalWidth || image.width || 1500;
      const height = image.naturalHeight || image.height || 1000;
      const scale = Math.min(1, MAX_TEXTURE / width);
      const raster = document.createElement("canvas");
      raster.width = Math.round(width * scale);
      raster.height = Math.round(height * scale);
      try {
        raster
          .getContext("2d")
          ?.drawImage(image, 0, 0, raster.width, raster.height);
      } catch {
        return; // A broken image leaves the card without a picture.
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
      picture.aspect = raster.width / raster.height;
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
  picture.aspect = video.videoWidth / video.videoHeight;
}

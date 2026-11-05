import assert from "node:assert/strict";
import { test } from "node:test";
import { findPlaceholders, isNoindex, sourceOf } from "./check-launch.mjs";

const page = (body) =>
  `<!doctype html><html><head><title>t</title></head><body><main>${body}</main></body></html>`;

test("a complete page has no findings", () => {
  const html = page(
    `<section id="top"><h1>Amy Huang</h1><img src="/media/amy/cover.avif" alt="Amy"></section>` +
      `<section id="teaching"><h2>I teach kung fu</h2><p>Classes in Chiang Mai.</p>` +
      `<a href="https://wa.me/66123">WhatsApp</a></section>`,
  );
  assert.deepEqual(findPlaceholders(html), []);
});

test("finds each kind of placeholder and the section it is in", () => {
  const html = page(
    `<section id="top"><img src="/media/test/still.svg" alt=""></section>` +
      `<section id="teaching" data-draft><p>Kids [confirm]</p>` +
      `<span data-placeholder="contact detail">WhatsApp</span></section>` +
      `<section id="hair"><img src="/media/placeholder/hair-after.svg" alt=""></section>`,
  );
  const found = findPlaceholders(html).map(
    ({ section, kind, detail }) => `${section} ${kind} ${detail}`,
  );
  assert.deepEqual(found, [
    "teaching draft chapter is still marked draft: true",
    "teaching placeholder contact detail",
    "top media /media/test/still.svg",
    "hair media /media/placeholder/hair-after.svg",
    "teaching bracketed [confirm]",
  ]);
});

test("maps sections to the content files they come from", () => {
  assert.equal(sourceOf("top"), "src/content/settings.json");
  assert.equal(sourceOf("drone"), "src/content/chapters/drone.md");
  assert.equal(sourceOf(""), "");
});

test("ignores brackets in scripts, styles and attributes, decodes entities in text", () => {
  const html = page(
    `<section id="intro"><script>const a = [1, 2];</script><style>a[href]{}</style>` +
      `<img alt="[not visible text]" src="/media/amy/a.avif">` +
      `<p>Training since &#91;year&#93;</p></section>`,
  );
  assert.deepEqual(
    findPlaceholders(html).map((f) => f.detail),
    ["[year]"],
  );
});

test("reports a repeated placeholder once per section", () => {
  const html = page(
    `<section id="contact"><span data-placeholder="contact detail">Email</span>` +
      `<span data-placeholder="contact detail">Instagram</span></section>`,
  );
  assert.equal(findPlaceholders(html).length, 1);
});

test("recognises noindex work benches", () => {
  assert.equal(isNoindex(`<meta name="robots" content="noindex">`), true);
  assert.equal(isNoindex(`<meta name="description" content="x">`), false);
});

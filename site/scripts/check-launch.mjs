#!/usr/bin/env node
// Refuse to publish while placeholder content remains (#13).
//
//   node scripts/check-launch.mjs [dist] [--production-only]
//
// With --production-only it runs only when VERCEL_ENV is "production", so preview
// deploys (for review) still build while a production deploy refuses to publish.
// Before launch, while the production address is still a *.vercel.app one, it lists
// what is left without failing: those builds are noindex (src/layouts/Base.astro),
// so work in progress can be looked at there. Attaching the real domain turns the
// refusal on.
//
// Reads every built page except noindex ones and reports, per section and the content
// file it comes from:
// - chapters still marked `draft: true` (rendered as data-draft)
// - stand-ins marked data-placeholder (contact buttons, tape scans, intro reel, …)
// - media served from public/media/placeholder/ or public/media/test/
// - bracketed text such as "[year]", which marks facts Amy still has to confirm
// Exits 1 when anything is left, so a deploy can't publish it.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER_MEDIA = /\/media\/(?:placeholder|test)\/[^"'\s,)]*/g;
const BRACKETED = /\[[^\]\n]{1,200}\]/g;

/**
 * The content file a section's words come from. The hero and the footer come
 * from the settings; a stop's overview card (`card-<id>`) and every other
 * section come from the chapter of that id.
 */
export function sourceOf(sectionId) {
  if (!sectionId) return "";
  if (sectionId === "top" || sectionId === "footer") {
    return "src/content/settings.json";
  }
  const chapter = sectionId.startsWith("card-")
    ? sectionId.slice("card-".length)
    : sectionId;
  return `src/content/chapters/${chapter}.md`;
}

export function isNoindex(html) {
  return /<meta[^>]+name=["']?robots["']?[^>]+content=["'][^"']*noindex/i.test(
    html,
  );
}

/** Every placeholder left in one built page, as { section, source, kind, detail }. */
export function findPlaceholders(html) {
  const page = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, (m) => " ".repeat(m.length))
    .replace(/<style\b[\s\S]*?<\/style>/gi, (m) => " ".repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));

  const sections = [
    ...page.matchAll(
      /<(?:section|header|article|footer)\b[^>]*\sid="([^"]+)"/g,
    ),
  ].map((match) => ({ start: match.index, id: match[1] }));
  const sectionAt = (index) =>
    sections.filter((section) => section.start <= index).at(-1)?.id ?? "";

  const findings = [];
  const add = (index, kind, detail) => {
    const section = sectionAt(index);
    findings.push({ section, source: sourceOf(section), kind, detail });
  };

  for (const match of page.matchAll(/<[a-z][^>]*\sdata-draft(?=[\s=>])/gi)) {
    add(match.index, "draft", "chapter is still marked draft: true");
  }
  for (const match of page.matchAll(/\sdata-placeholder="([^"]*)"/g)) {
    add(match.index, "placeholder", match[1]);
  }
  for (const match of page.matchAll(
    /\s(?:src|href|poster|srcset|style)="([^"]*)"/g,
  )) {
    for (const media of match[1].matchAll(PLACEHOLDER_MEDIA)) {
      add(match.index, "media", media[0]);
    }
  }
  for (const match of page.matchAll(/>([^<]+)</g)) {
    const text = decodeEntities(match[1]);
    for (const bracket of text.matchAll(BRACKETED)) {
      add(match.index, "bracketed", bracket[0]);
    }
  }

  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.section}|${finding.kind}|${finding.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

/** Whether a production address is Vercel's own, not the site's real domain. */
export function isPrelaunchDomain(domain) {
  return (domain ?? "").toLowerCase().endsWith(".vercel.app");
}

function main(dist = "dist", { enforce = true } = {}) {
  let pages = 0;
  let total = 0;
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, "utf8");
    // Before launch every page is noindex, so that can't tell work benches apart.
    if (enforce && isNoindex(html)) continue;
    pages += 1;
    const findings = findPlaceholders(html);
    if (findings.length === 0) continue;
    total += findings.length;
    console.log(
      `\n${relative(dist, file)}: ${findings.length} left to replace`,
    );
    for (const { section, source, kind, detail } of findings) {
      const where = section
        ? `#${section}${source ? ` (${source})` : ""}`
        : "page";
      console.log(`  ${where}  ${kind}: ${detail}`);
    }
  }
  if (pages === 0) {
    console.error(
      `No publishable pages found in ${dist}. Build the site first.`,
    );
    return 2;
  }
  if (total > 0 && !enforce) {
    console.log(
      `\nLaunch check not enforced: ${total} placeholders in ${pages} page(s). The production address is still a vercel.app one and the pages are noindex. Attaching the real domain turns the refusal on.`,
    );
    return 0;
  }
  if (total > 0) {
    console.log(
      `\nLaunch check failed: ${total} placeholders in ${pages} page(s).`,
    );
    return 1;
  }
  console.log(`Launch check passed: ${pages} page(s) without placeholders.`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const productionOnly = args.includes("--production-only");
  const dist = args.find((arg) => !arg.startsWith("--"));
  if (productionOnly && process.env.VERCEL_ENV !== "production") {
    console.log(
      `Launch check skipped: VERCEL_ENV is ${process.env.VERCEL_ENV ?? "unset"}, not production.`,
    );
    process.exit(0);
  }
  const enforce = !(
    productionOnly &&
    isPrelaunchDomain(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  );
  process.exit(main(dist, { enforce }));
}

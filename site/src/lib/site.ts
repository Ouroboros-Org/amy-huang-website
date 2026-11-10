import { getCollection, getEntry } from "astro:content";

/**
 * Everything the page needs from the content files: the site settings, the
 * chapters in journey order, and the chapter index derived from them.
 */
export async function getSite() {
  const settingsEntry = await getEntry("settings", "site");
  if (!settingsEntry) {
    throw new Error("src/content/settings.json needs an entry with id 'site'");
  }
  const chapters = (await getCollection("chapters")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const index = chapters.flatMap((chapter) =>
    chapter.data.nav
      ? [{ label: chapter.data.nav, href: `#${chapter.id}` }]
      : [],
  );
  return { settings: settingsEntry.data, chapters, index };
}

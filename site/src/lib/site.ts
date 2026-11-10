import { getCollection, getEntry } from "astro:content";

/**
 * Everything the page needs from the content files: the site settings, the
 * things Amy does (the stops) in order, and the about and contact sections.
 */
export async function getSite() {
  const settingsEntry = await getEntry("settings", "site");
  if (!settingsEntry) {
    throw new Error("src/content/settings.json needs an entry with id 'site'");
  }
  const chapters = (await getCollection("chapters")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const only = (layout: "about" | "contact") => {
    const entry = chapters.find((chapter) => chapter.data.layout === layout);
    if (!entry) {
      throw new Error(
        `src/content/chapters needs one file with layout: ${layout}`,
      );
    }
    return entry;
  };
  return {
    settings: settingsEntry.data,
    stops: chapters.filter((chapter) => chapter.data.layout === "stop"),
    about: only("about"),
    contact: only("contact"),
  };
}

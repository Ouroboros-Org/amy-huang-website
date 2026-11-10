import { getCollection, getEntry } from "astro:content";

/**
 * Everything the pages need from the content files: the site settings, the
 * things Amy does (the stops) in order, the about and contact sections, and
 * the links for the top bar and the footer.
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
  const about = only("about");
  const contact = only("contact");
  // Root-relative, so they work from the offering pages too.
  const bar = [
    { label: "What I do", href: "/#work" },
    { label: "About", href: `/#${about.id}` },
  ];
  return {
    settings: settingsEntry.data,
    stops: chapters.filter((chapter) => chapter.data.layout === "stop"),
    about,
    contact,
    links: {
      bar,
      footer: [...bar, { label: "Say hi", href: `#${contact.id}` }],
    },
  };
}

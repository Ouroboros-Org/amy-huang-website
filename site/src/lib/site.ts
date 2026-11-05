import { getCollection, getEntry } from "astro:content";

/**
 * Everything a page needs from the content files: the site settings, the spreads
 * in page order, and the contents-page entries derived from them.
 */
export async function getSite() {
  const settingsEntry = await getEntry("settings", "site");
  if (!settingsEntry) {
    throw new Error("src/content/settings.json needs an entry with id 'site'");
  }
  const spreads = (await getCollection("spreads")).sort(
    (a, b) => a.data.page - b.data.page,
  );
  const contents = spreads.flatMap((spread) =>
    spread.data.contents
      ? [
          {
            title: spread.data.contents,
            page: spread.data.page,
            href: `#${spread.id}`,
            starred: spread.data.starred,
          },
        ]
      : [],
  );
  const spread = (id: string) => {
    const found = spreads.find((entry) => entry.id === id);
    if (!found) throw new Error(`Missing spread src/content/spreads/${id}.md`);
    return found;
  };
  return { settings: settingsEntry.data, spreads, contents, spread };
}

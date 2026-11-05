# Site

Amy Huang's one-page website: a static [Astro](https://docs.astro.build) build with
pinned, layered scroll scenes ([GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/))
and transparent video loops ([`stacked-alpha-video`](https://github.com/jakearchibald/stacked-alpha-video)).

## Work on it

Use the Node version in `.node-version` (24.22.2), then from this folder:

| Command                | Does                                                                                 |
| :--------------------- | :----------------------------------------------------------------------------------- |
| `npm ci`               | Install the locked dependencies.                                                     |
| `npm run dev`          | Start the dev server at http://localhost:4321.                                       |
| `npm run verify`       | Type-check, check formatting, run the tests and build, as CI does.                   |
| `npm run format`       | Apply Prettier formatting.                                                           |
| `npm run build`        | Build the static site into `dist/`.                                                  |
| `npm test`             | Run the script tests (`scripts/*.test.mjs`).                                         |
| `npm run check:launch` | After a build: list every placeholder left on public pages; fails until none remain. |
| `npm run media:test`   | Regenerate the synthetic test clip in `public/media/test/`.                          |

Two pages are work benches, marked `noindex` and not linked from the site:
`/lab` tests the scene engine and transparent video, and `/tiles` shows the style
tiles Amy reviews (#3): the grotesk shortlist on the same cover, the colours and a
night page.

## Structure

| Path                                                                                       | Holds                                                                                                                   |
| :----------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`                                                                               | Routes: `index.astro` (the site), `tiles.astro` and `lab.astro` (work benches).                                         |
| `src/layouts/Base.astro`                                                                   | The document shell, fonts and global styles.                                                                            |
| `src/styles/tokens.css`                                                                    | Design tokens: colour, type scale, spacing and ruling, grid, tilt set, shadows, motion.                                 |
| `src/styles/global.css`                                                                    | Base typography, the `.grid` skeleton and the `.hand` voice.                                                            |
| `src/components/Paper.astro`                                                               | A diary sheet: lined, graph, plain, kraft or night, with an optional scanned texture.                                   |
| `src/components/Print.astro`, `Tape.astro`                                                 | A taped photo print; tape takes a scan or shows a marked placeholder.                                                   |
| `src/components/StickyNote.astro`                                                          | A note in Amy's hand.                                                                                                   |
| `src/components/Contents.astro`                                                            | The contents page that is the site's navigation.                                                                        |
| `src/components/ContactLinks.astro`                                                        | WhatsApp, email and Instagram; missing details render as placeholders.                                                  |
| `src/components/Cover.astro`                                                               | The first screen: name, line, contact, taped print with the cut-out, contents.                                          |
| `src/components/AlphaVideo.astro`                                                          | Markup for one transparent loop: poster, AV1 and HEVC sources.                                                          |
| `src/scripts/scenes.ts`                                                                    | Pinned scenes whose `[data-layer]` children animate on their own scroll windows.                                        |
| `src/scripts/alpha-video.ts`                                                               | Plays transparent loops only on screen; keeps the poster when playback isn't allowed.                                   |
| `src/content/spreads/*.md`                                                                 | One file per spread: Amy's paragraphs in the body, title, facts, captions, call to action and media in the frontmatter. |
| `src/content/settings.json`                                                                | Name, line, "currently in", contact details, wedding-site link, cover media.                                            |
| `src/content.config.ts`                                                                    | The schema both are checked against at build time.                                                                      |
| `src/lib/site.ts`, `contact.ts`                                                            | Loading the content in page order; building WhatsApp, email and Instagram links.                                        |
| `src/components/spreads/`                                                                  | One layout per spread: intro, teaching, performing (night page), hair, drone, contact.                                  |
| `src/components/Spread.astro`, `SpreadTitle.astro`                                         | A spread's paper, page number and grid; its heading with Amy's note.                                                    |
| `src/components/Pile.astro`, `FactsTable.astro`, `PhoneFrame.astro`, `ContactAction.astro` | A pile of taped prints, the facts table, the intro-reel frame, one contact button.                                      |
| `scripts/encode-alpha.sh`                                                                  | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.                                           |
| `public/media/test/`                                                                       | The synthetic test clip and placeholder still. Real media is served from a CDN.                                         |

## Edit the content

Words and media live in `src/content/`, not in the layout code:

- Change a spread's text in its Markdown file. Text in `[brackets]` is a placeholder for
  something Amy still has to confirm, and `draft: true` marks a spread whose words are
  not hers yet.
- Add contact details in `settings.json` (`whatsapp` as an international number,
  `email`, `instagram` as the handle). Until a detail is there, its button renders as a
  dashed placeholder.
- Media paths point into `public/media/`. The images in `public/media/placeholder/` are
  labelled stand-ins.

## Design rules in code

- Fonts are self-hosted: Schibsted Grotesk by default, the other shortlist fonts only on
  `/tiles`, and Shantell Sans as the stand-in for Amy's handwriting font.
- `.hand` is for Amy's voice only, at 20px or larger; never body copy, prices or contact details.
- Scrapbook tilts come only from the `--tilt-*` set. Materials (paper grain, tape) come from
  scans; until a scan exists the component renders a plain, `data-placeholder` stand-in.
- `--signal` is for contact actions and Amy's star marks only. On night pages `Paper` swaps
  in a lighter signal so text and buttons keep at least 4.5:1 contrast.

## Transparent video

A clip of Amy is cut out into a master with an alpha channel (ProRes 4444 or a PNG
sequence), then encoded with `scripts/encode-alpha.sh <master> <output-base>`, which
needs ffmpeg with libaom-av1, libx265 and libwebp. The output is three files:
`<base>.av1.mp4`, `<base>.hevc.mp4` and `<base>.poster.webp`, used through
`<AlphaVideo src="<base>" …>`.

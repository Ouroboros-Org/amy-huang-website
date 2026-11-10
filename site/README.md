# Site

Amy Huang's website: one light, single page about what she does. A static
[Astro](https://docs.astro.build) build styled after the
[Elias Vent theme](https://elias-vent.startfrom.co/), rebuilt here on a light grey
background. It opens on a layered photo of Amy with her name tucked behind the mountain
peaks, then shows each thing she does as a large card, who she is, each offering step by
step, and how to reach her. The theme's own files, text and images aren't used.

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
| `npm run media:test`   | Regenerate the synthetic test media in `public/media/test/`.                         |
| `npm run media:hero`   | Split the hero photo into its sky and front layers (`src/assets/hero/`).             |

## Deploy

The site deploys on [Vercel](https://vercel.com) from this folder (the project's Root
Directory is `site`). `vercel.json` sets the build to `npm run build:vercel`:

- **Preview deploys** (every branch and pull request) build normally, placeholders and all,
  so Amy can review work in progress.
- **Production deploys before launch**, while the production address is still a
  `*.vercel.app` one, also build with placeholders. Every page carries `noindex`, and the
  launch check lists what is left without failing.
- **Production deploys on the real domain** run the launch check after the build and fail
  while any placeholder remains (#13), so a draft can't be published. Attaching the
  domain in Vercel is what turns this on.

`vercel.json` also caches the hashed `/_astro/` files for a year and `/media/` for a day,
and sets baseline security headers. Node is pinned to 24.x in `package.json`, matching
`.node-version` and CI.

Vercel reports the production domain at build time (`VERCEL_PROJECT_PRODUCTION_URL`, set on
previews too), and `astro.config.mjs` makes it the site's address. The canonical URL and
the social card's address in link previews are built from it. A build outside Vercel
leaves those two out. Vercel serves the built `404.html` for unknown paths.

## How the page works

From top to bottom:

- **Top bar:** her name and role, the section links, the pause-motion control and "Say hi".
  It stays on screen over a blurred strip of the page colour.
- **Hero:** Amy's photo in two layers inside a rounded card, with the title between them:
  the sky behind, then "I'm Amy", then the mountains, meadow and lake, then the
  subheadline. All four are placed on a stage with the photo's 4:5 proportions, so the
  title meets the ridge on any screen. Her line sits under the card.
- **What I do:** one large card per offering. Each card sticks below the top bar and the
  next slides up over it (`position: sticky`, no script). A card links to its block in the
  details.
- **About:** a large statement, her paragraph beside a picture, and facts as rows.
- **Ticker:** a slow band of the offerings' names. It is decorative and hidden from
  assistive technology.
- **Step by step:** one block per offering with its lead, her words, facts and booking
  action. On wide screens a list of the offerings stays beside the blocks and marks the
  one crossing the middle of the screen.
- **Contact and footer:** the ways to reach her, then where she is, the section links and
  her name as a wordmark.

Motion:

- **When motion is allowed**, `scripts/parallax.ts` lets the hero's sky and title lag
  behind the mountains as the hero scrolls away, so the title sinks behind the peaks. The
  ticker moves, in-page links glide, and `scripts/play-in-view.ts` plays a card's video
  while the card is on screen.
- **Without JavaScript, with reduced motion, or with motion paused** (the control in the
  top bar), the hero and the ticker are still, videos show their posters, and every
  section is complete and readable.

## Structure

| Path                                                                         | Holds                                                                                                |
| :--------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `src/content/chapters/*.md`                                                  | One file per section: each offering (`layout: stop`), plus `about` and `contact`.                    |
| `src/content/settings.json`                                                  | Name, role, line, "currently in", contact details, wedding-site link, the hero's words.              |
| `src/content.config.ts`                                                      | The schema both are checked against at build time.                                                   |
| `src/pages/index.astro`                                                      | The page, section by section.                                                                        |
| `src/pages/404.astro`                                                        | The page for unknown addresses, with a way back.                                                     |
| `src/pages/social-card.png.ts`, `src/lib/social-card.ts`                     | The picture shared links preview with: her name and line, rendered at build time.                    |
| `src/pages/favicon.svg.ts`, `favicon.ico.ts`, `apple-touch-icon.png.ts`      | The icon for browser tabs and phone home screens, from the one drawing in `src/lib/brand.ts`.        |
| `src/components/TopBar.astro`, `Footer.astro`                                | The fixed bar and the page's end.                                                                    |
| `src/components/Hero.astro`, `src/assets/hero/`                              | The opening photo in layers, with the title between them.                                            |
| `src/components/Stops.astro`, `StopDetails.astro`                            | The offerings as stacking cards, and step by step.                                                   |
| `src/components/About.astro`, `Contact.astro`, `Ticker.astro`                | The sections of those names.                                                                         |
| `src/components/FactRows.astro`, `ContactAction.astro`, `ContactLinks.astro` | Facts as hairline rows; the contact pills.                                                           |
| `src/components/BackgroundMedia.astro`                                       | A video or still that fills its card, with portrait cuts and posters.                                |
| `src/components/AlphaVideo.astro`                                            | Transparent video. Not on the page at the moment; kept for the cut-outs of Amy (#5).                 |
| `src/scripts/parallax.ts`, `play-in-view.ts`, `motion.ts`, `media.ts`        | The hero's parallax, video playback while on screen, the motion setting, and the playback helpers.   |
| `src/lib/site.ts`, `contact.ts`                                              | Loading the content in order; building WhatsApp, email and Instagram links.                          |
| `src/lib/brand.ts`, `raster.ts`                                              | The icon, and the colours of build-time images (kept in step with `tokens.css`); PNG and ICO output. |
| `src/styles/tokens.css`, `global.css`                                        | The palette, type scale, spacing and shapes; base styles.                                            |
| `scripts/split-hero.mjs`                                                     | Splits the hero photo into a sky layer and a front layer along the ridge.                            |
| `scripts/encode-alpha.sh`                                                    | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.                        |
| `scripts/check-launch.mjs`                                                   | The launch check (#13).                                                                              |
| `public/media/test/`, `public/media/placeholder/`                            | Synthetic test clips and labelled placeholder images.                                                |

## Edit the content

Words and media live in `src/content/`, not in the layout code:

- Change a section's text in its Markdown file. Text in `[brackets]` is a placeholder for
  something Amy still has to confirm, and `draft: true` marks a section whose words are not
  hers yet. Quote frontmatter values that contain `: `.
- An offering's card shows its `kicker` (small) and `nav` (large) over its `background`,
  a `video` or a `still` with an optional `portrait` cut for phones. Its block in the
  details shows `title`, `note` (in her handwriting), `lead`, the body, `badge`, `facts`
  and `cta`.
- To add an offering, add a Markdown file with the next `order`. It gets a card, a block
  and a place in the ticker.
- Add contact details in `settings.json` (`whatsapp` as an international number, `email`,
  `instagram` as the handle). Until a detail is there, its button renders as a dashed
  placeholder.
- The link preview shows `name` and `line` from `settings.json`, so editing them updates it
  on the next build. Apps that already fetched the preview may keep the old one for a while.

## Design rules in code

- A light grey page (`--bg`) with near-black text at 14.7:1 and muted text at 6:1. Photos
  and video are the dark surfaces, with light type over a scrim.
- The signal colour is for contact actions only, with night text on it at 6.8:1.
- Type is Sora, self-hosted: semi-bold headings with tight tracking, and small caps
  captions that are never tracked out. Shantell Sans stands in for Amy's handwriting.
  `.hand` is for her voice only, at 20px or larger, never for body copy, prices or contact
  details, and at most one note per section.
- Media sits in cards with a 1.25rem radius. Buttons are pills.
- Motion only moves `transform`; native scroll speed, no scroll-jacking; a pause control
  stops all motion and video (WCAG 2.2.2).

## Transparent video

Not used on the page at the moment. A clip of Amy is cut out into a master with an alpha
channel (ProRes 4444 or a PNG sequence), then encoded with
`scripts/encode-alpha.sh <master> <output-base>`, which needs ffmpeg with libaom-av1,
libx265 and libwebp. The output is `<base>.av1.mp4`, `<base>.hevc.mp4` and
`<base>.poster.webp`, which `AlphaVideo.astro` plays from `<base>`. The layer delivery
spec is on #2.

## Hero photo

`src/assets/hero/photo.webp` is the source. `npm run media:hero` splits it into
`sky.webp` (the sky alone, continued smoothly behind the mountains so nothing opens up
when the layers shift) and `front.webp` (everything from the ridge down, on a
transparent sky). The split finds the ridge as the first run of dark pixels in each
column, so it suits a light sky over dark mountains; check the result of any other photo
before it ships. Astro serves both layers as AVIF and WebP at the widths the screen
needs. The title's position in `Hero.astro` (its baseline 22.75% down the photo) belongs
to this photo, as does the subheadline's place on the mountain face.

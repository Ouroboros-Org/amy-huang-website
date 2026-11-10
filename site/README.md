# Site

Amy Huang's website: one full-screen journey through what she does. A static
[Astro](https://docs.astro.build) build that opens on a layered photo of Amy, her name
tucked behind the mountain peaks, then moves through chapters made of layers
(background, transparent cut-out of Amy, clean type, and a light personality layer in
her handwriting), each moving on its own scroll timing with
[GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
Transparent video uses [`stacked-alpha-video`](https://github.com/jakearchibald/stacked-alpha-video).

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
`.node-version` and CI. Media served from the same deployment needs no CORS setup for the
WebGL video player; a separate media host would.

Vercel reports the production domain at build time (`VERCEL_PROJECT_PRODUCTION_URL`, set on
previews too), and `astro.config.mjs` makes it the site's address. The canonical URL and
the social card's address in link previews are built from it. A build outside Vercel
leaves those two out. Vercel serves the built `404.html` for unknown paths.

## How the journey works

- **The hero** is Amy's photo in two layers with the title between them: the sky behind,
  then "I'm Amy", then the mountains, meadow and lake, then the subheadline. All four are
  placed on a stage with the photo's 4:5 proportions, so the title meets the ridge on
  any screen. When motion is allowed, `scripts/parallax.ts` lets the sky and the title
  lag behind the mountains as the hero scrolls away, so the title sinks behind the peaks.
- **Without JavaScript, with reduced motion, or with motion paused** (the control in the
  top bar), the hero is still and the chapters are a plain stack of full-screen sections,
  each complete and readable, with video posters instead of playback.
- **When motion is allowed**, `scripts/journey.ts` turns the chapters into one pinned
  stage: each chapter opens over the previous one through a growing circle. Each chapter's layers animate on their own
  windows of its scroll stretch. Only chapters on screen play video, so at most two
  decode at once.
- Links to `#chapter` ids scroll to where that chapter has settled; tabbing into a covered
  chapter brings it up.
- Phones in portrait get the `portrait` cut of each layer when there is one.

## Structure

| Path                                                                           | Holds                                                                                                      |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `src/content/chapters/*.md`                                                    | One file per chapter: layers, title, lead, facts, notes and call to action; a short paragraph in the body. |
| `src/content/settings.json`                                                    | Name, line, "currently in", contact details, wedding-site link, the hero's words.                          |
| `src/content.config.ts`                                                        | The schema both are checked against at build time.                                                         |
| `src/pages/index.astro`                                                        | The page: top bar, hero, chapters, contact.                                                                |
| `src/pages/404.astro`                                                          | The page for unknown addresses, with a way back.                                                           |
| `src/pages/social-card.png.ts`, `src/lib/social-card.ts`                       | The picture shared links preview with: her name and line, rendered at build time.                          |
| `src/pages/favicon.svg.ts`, `favicon.ico.ts`, `apple-touch-icon.png.ts`        | The icon for browser tabs and phone home screens, from the one drawing in `src/lib/brand.ts`.              |
| `src/components/Hero.astro`, `src/assets/hero/`                                | The opening photo in layers, with the title between them.                                                  |
| `src/components/Chapter.astro`                                                 | A chapter's layers and their scroll windows.                                                               |
| `src/components/ContactChapter.astro`                                          | The calm last chapter and the footer.                                                                      |
| `src/components/TopBar.astro`                                                  | Name, "Say hi", and the pause-motion control.                                                              |
| `src/components/AlphaVideo.astro`, `BackgroundMedia.astro`                     | Transparent video layers and full-screen backgrounds, with portrait cuts and posters.                      |
| `src/components/ContactAction.astro`, `ContactLinks.astro`, `StickyNote.astro` | Contact buttons and the sticky-note personality piece.                                                     |
| `src/scripts/journey.ts`, `parallax.ts`, `motion.ts`, `media.ts`               | The journey engine, the hero's parallax, the motion setting, and video playback.                           |
| `src/lib/site.ts`, `contact.ts`                                                | Loading the content in order; building WhatsApp, email and Instagram links.                                |
| `src/lib/brand.ts`, `raster.ts`                                                | The icon, and the colours of build-time images (kept in step with `tokens.css`); PNG and ICO output.       |
| `scripts/split-hero.mjs`                                                       | Splits the hero photo into a sky layer and a front layer along the ridge.                                  |
| `scripts/encode-alpha.sh`                                                      | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.                              |
| `scripts/check-launch.mjs`                                                     | The launch check (#13).                                                                                    |
| `public/media/test/`, `public/media/placeholder/`                              | Synthetic test clips and labelled placeholder images. Real media is served from a CDN.                     |

## Edit the content

Words and media live in `src/content/`, not in the layout code:

- Change a chapter's text in its Markdown file. Text in `[brackets]` is a placeholder for
  something Amy still has to confirm, and `draft: true` marks a chapter whose words are not
  hers yet. Quote frontmatter values that contain `: `.
- Each chapter's `background` (a `video` or a `still`) and `cutout` take a `portrait`
  cut for phones. `length` sets how much scroll the chapter gets, in screen heights.
- Add contact details in `settings.json` (`whatsapp` as an international number, `email`,
  `instagram` as the handle). Until a detail is there, its button renders as a dashed
  placeholder.
- The link preview shows `name` and `line` from `settings.json`, so editing them updates it
  on the next build. Apps that already fetched the preview may keep the old one for a while.

## Design rules in code

- Dark first: clean grotesk type over video with a scrim; the signal colour is for contact
  actions only and reads at 6.8:1 on the night background.
- Fonts are self-hosted: Schibsted Grotesk, and Shantell Sans as the stand-in for Amy's
  handwriting font. `.hand` is for her voice only, at 20px or larger, never for body copy,
  prices or contact details.
- Personality is a layer, not the layout: a note or a sticky per chapter at most, placed
  clear of the cut-out.
- Motion only moves `transform`, `opacity` and `clip-path`; native scroll speed, no
  scroll-jacking; a pause control stops all motion and video (WCAG 2.2.2).

## Transparent video

A clip of Amy is cut out into a master with an alpha channel
(ProRes 4444 or a PNG sequence), then encoded with
`scripts/encode-alpha.sh <master> <output-base>`, which needs ffmpeg with libaom-av1,
libx265 and libwebp. The output is `<base>.av1.mp4`, `<base>.hevc.mp4` and
`<base>.poster.webp`; reference `<base>` as a chapter's `cutout.src` (and the portrait
cut's base as `cutout.portrait`). The layer delivery spec is on #2.

## Hero photo

`src/assets/hero/photo.webp` is the source. `npm run media:hero` splits it into
`sky.webp` (the sky alone, continued smoothly behind the mountains so nothing opens up
when the layers shift) and `front.webp` (everything from the ridge down, on a
transparent sky). The split finds the ridge as the first run of dark pixels in each
column, so it suits a light sky over dark mountains; check the result of any other photo
before it ships. Astro serves both layers as AVIF and WebP at the widths the screen
needs. The title's position in `Hero.astro` (its baseline 22.75% down the photo) belongs
to this photo, as does the subheadline's place on the mountain face.

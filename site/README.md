# Site

Amy Huang's website: a home page about what she does and one page per offering. A static
[Astro](https://docs.astro.build) build that follows the
[Elias Vent theme](https://elias-vent.startfrom.co/) in layout, style and behaviour,
rebuilt here on a light grey background. The theme's own code, shaders, text and images
aren't used.

## Work on it

Use the Node version in `.node-version` (24.22.2), then from this folder:

| Command                   | Does                                                                                 |
| :------------------------ | :----------------------------------------------------------------------------------- |
| `npm ci`                  | Install the locked dependencies.                                                     |
| `npm run dev`             | Start the dev server at http://localhost:4321.                                       |
| `npm run verify`          | Type-check, check formatting, run the tests and build, as CI does.                   |
| `npm run format`          | Apply Prettier formatting.                                                           |
| `npm run build`           | Build the static site into `dist/`.                                                  |
| `npm test`                | Run the script tests (`scripts/*.test.mjs`).                                         |
| `npm run check:launch`    | After a build: list every placeholder left on public pages; fails until none remain. |
| `npm run media:test`      | Regenerate the synthetic test media in `public/media/test/`.                         |
| `npm run media:hero`      | Split the hero photo into sky and front layers. Overwrites `front.webp`.             |
| `npm run media:hero-edge` | Clean the ridge edge of a hand-made `front.webp`.                                    |

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

## How the home page works

From top to bottom:

- **Top bar:** her name and role, the section links, the pause-motion control and "Say hi".
  Over the light page it is a blurred strip of the page colour with dark type. Over the
  hero, the about photo and the footer it turns clear with light type.
- **Hero:** Amy's photo in two layers, edge to edge and 1.4 screens tall, with the title
  between them: the sky behind, then "I'M AMY" in white capitals, then the mountains,
  meadow and lake, then the subheadline. The sky is darkened toward dusk so the white type
  reads. All layers sit on a stage with the photo's 4:5 proportions, so the main peak
  always reaches into the title. A handwritten "scroll" and a bobbing arrow sit at the foot
  of the first screen.
- **Gallery pin:** her line in the middle of the screen while pictures fly outward past
  it. The section is 3.2 screens long and pins for the flight.
- **About:** full-screen over the photo of Amy with her staff: a large statement, her
  paragraph, and a handwritten note pointing at her. Facts follow as rows.
- **Work cards:** one per offering, each a picture with its name and a handwritten note,
  linking to the offering's page. One screen pins while the cards scroll through it, and a
  canvas draws the pictures through a soft lens (see "The lens" below).
- **Ticker:** a slow band of the offerings' names. It is decorative and hidden from
  assistive technology.
- **Step by step:** one screen pins and steps through the offerings: the names on the
  left, the current one's picture, lead and facts on the right, a counter and a line that
  fills. Names and panels link to the offering pages.
- **Contact and footer:** the ways to reach her, then a night footer with the accent
  glowing up from below, the links and her name as a wordmark.

Each offering also has its own page at `/<file name>/` (`src/pages/[stop].astro`): name,
facts, picture, what it is, her words with the booking action, then the next offering and
the contact section.

### Motion

Everything that moves loads late (`components/Effects.astro`, `scripts/effects.ts`) and
only while motion is allowed:

| Script        | Does                                                                          |
| :------------ | :---------------------------------------------------------------------------- |
| `parallax.ts` | The hero's sky and title lag behind the mountains; the about photo drifts.    |
| `gallery.ts`  | The gallery's pictures fly outward while the section is pinned.               |
| `reveal.ts`   | The about and contact headings sharpen word by word as they scroll into view. |
| `stack.ts`    | The work cards scroll through a pinned screen, drawn through the lens.        |
| `switcher.ts` | The pinned step through the offerings.                                        |

**Without JavaScript, with reduced motion, or with motion paused** (the control in the
top bar), each of these falls back to plain HTML: a still hero, the gallery's sentence
above a grid of its pictures, the about text simply there, the work cards as a sticky
stack, and the offerings as a grid of panels. Pausing also stops the scroll cue, the
ticker and the footer's glow.

### The lens

`scripts/stack.ts` draws the work cards' pictures on one WebGL canvas:

- a slight pinch, so the cards' sides bow inward
- a colour split, red and blue bent a little less and more than green, strongest toward
  the edges of the screen
- a slow water wobble

All three are faint at rest and swell with scroll speed. The cards' words stay HTML and
move in step. Pictures are read from the cards' own `<img>` (or a playing `<video>`), so
the plain stack and the canvas always show the same media. Without WebGL the plain stack
stays.

## Structure

| Path                                                                         | Holds                                                                                             |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `src/content/chapters/*.md`                                                  | One file per section: each offering (`layout: stop`), plus `about` and `contact`.                 |
| `src/content/settings.json`                                                  | Name, role, line, "currently in", contact details, wedding-site link, the hero's words.           |
| `src/content.config.ts`                                                      | The schema both are checked against at build time.                                                |
| `src/pages/index.astro`, `[stop].astro`                                      | The home page, and the page each offering gets.                                                   |
| `src/pages/404.astro`                                                        | The page for unknown addresses, with a way back.                                                  |
| `src/pages/social-card.png.ts`, `src/lib/social-card.ts`                     | The picture shared links preview with: her name and line, rendered at build time.                 |
| `src/pages/favicon.svg.ts`, `favicon.ico.ts`, `apple-touch-icon.png.ts`      | The icon for browser tabs and phone home screens, from the one drawing in `src/lib/brand.ts`.     |
| `src/components/TopBar.astro`, `Footer.astro`                                | The fixed bar and the page's end.                                                                 |
| `src/components/Hero.astro`, `src/assets/hero/`                              | The opening photo in layers, with the title between them.                                         |
| `src/components/Gallery.astro`                                               | The gallery pin.                                                                                  |
| `src/components/About.astro`, `src/assets/about/`                            | The about section and its photo.                                                                  |
| `src/components/Stops.astro`, `Offerings.astro`                              | The work cards, and the step through the offerings.                                               |
| `src/components/Contact.astro`, `Ticker.astro`                               | The sections of those names.                                                                      |
| `src/components/FactRows.astro`, `ContactAction.astro`, `ContactLinks.astro` | Facts as hairline rows; the contact pills.                                                        |
| `src/components/BackgroundMedia.astro`                                       | A video or still that fills its card, with portrait cuts and posters.                             |
| `src/components/Effects.astro`, `src/scripts/`                               | The late loader for motion, and the scripts above plus `motion.ts`, `live.ts`, `play-in-view.ts`. |
| `src/components/AlphaVideo.astro`                                            | Transparent video. Not on the page at the moment; kept for the cut-outs of Amy (#5).              |
| `src/lib/site.ts`, `contact.ts`                                              | Loading the content in order; building WhatsApp, email and Instagram links.                       |
| `src/lib/brand.ts`, `raster.ts`                                              | The icon, and colours for code that can't read CSS (kept in step with `tokens.css`); PNG and ICO. |
| `src/styles/tokens.css`, `global.css`                                        | The palette, type scale, spacing and shapes; base styles.                                         |
| `scripts/split-hero.mjs`, `trim-hero-edge.mjs`                               | Splitting the hero photo into layers; cleaning the edge of a hand-made front layer.               |
| `scripts/encode-alpha.sh`                                                    | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.                     |
| `scripts/check-launch.mjs`                                                   | The launch check (#13).                                                                           |
| `public/media/test/`, `public/media/placeholder/`                            | Synthetic test clips and labelled placeholder images.                                             |

## Edit the content

Words and media live in `src/content/`, not in the layout code:

- Change a section's text in its Markdown file. Text in `[brackets]` is a placeholder for
  something Amy still has to confirm, and `draft: true` marks a section whose words are not
  hers yet. Quote frontmatter values that contain `: `.
- An offering's work card shows its `kicker` (small), `nav` (large) and `note` (in her
  handwriting) over its `background`, a `video` or a `still` with an optional `portrait`
  cut for phones. Its page shows all of that plus `title`, `lead`, the body, `badge`,
  `facts` and `cta`.
- To add an offering, add a Markdown file with the next `order`. It gets a work card, a
  step, a place in the ticker and the gallery, and a page at `/<file name>/`.
- The gallery's sentence is `line` in `settings.json`; the part after its last comma is
  set muted.
- Add contact details in `settings.json` (`whatsapp` as an international number, `email`,
  `instagram` as the handle). Until a detail is there, its button renders as a dashed
  placeholder.
- The link preview shows `name` and `line` from `settings.json`, so editing them updates it
  on the next build. Apps that already fetched the preview may keep the old one for a while.

## Design rules in code

- A light grey page (`--bg`) with near-black text at 14.7:1 and muted text at 6:1. Photos,
  video and the footer are the dark surfaces, with light type over a shade.
- The accent (`--signal`) fills contact actions, with night text on it at 6.8:1, and marks
  hover and active states. Deepened (`--ink`, 5.8:1 on the page) it colours her
  handwriting, the active tick and the progress line. With its neighbours (`--glow-1` to
  `--glow-5`, fire into dusk) it lights the footer.
- Type is Sora, self-hosted: semi-bold headings with tight tracking, and small caps
  captions that are never tracked out. Shantell Sans stands in for Amy's handwriting.
  `.hand` is for her voice only, at 20px or larger, never for body copy, prices or contact
  details, and at most one note per section.
- Media sits in cards with a 1.25rem radius. Buttons are pills.
- Scroll-tied motion follows the scroll position at native speed, with no scroll-jacking.
  The only things that move on their own are the scroll cue, the ticker, the footer's glow
  and the lens's water wobble. A pause control stops all of them and all video
  (WCAG 2.2.2).

## Transparent video

Not used on the page at the moment. A clip of Amy is cut out into a master with an alpha
channel (ProRes 4444 or a PNG sequence), then encoded with
`scripts/encode-alpha.sh <master> <output-base>`, which needs ffmpeg with libaom-av1,
libx265 and libwebp. The output is `<base>.av1.mp4`, `<base>.hevc.mp4` and
`<base>.poster.webp`, which `AlphaVideo.astro` plays from `<base>`. The layer delivery
spec is on #2.

## Hero photo

`src/assets/hero/` holds three files:

- `photo.webp`: the source photo, 1600×2000.
- `sky.webp`: the sky alone, continued smoothly behind the mountains so nothing opens up
  when the layers shift. `npm run media:hero` makes it from the photo.
- `front.webp`: everything from the ridge down, on a transparent sky. The current one is a
  hand-made cut at 2496×3120, cleaned with `npm run media:hero-edge`.

`npm run media:hero` also writes a `front.webp`, cut automatically at the photo's size. It
finds the ridge as the first run of dark pixels in each column, so it suits a light sky
over dark mountains. It would replace the hand-made cut, so run it only to start over.

`npm run media:hero-edge` removes the slivers of light sky a hand-made cut leaves along the
ridge. They don't show on the photo's own sky, but they show as light dashes against the
darkened one. Run it once on each new cut.

Astro serves the layers as AVIF and WebP at the widths the screen needs. The title's
position in `Hero.astro` (the main peak's tip, 20.5% down the photo) belongs to this
photo, as does the subheadline's place on the mountain face.

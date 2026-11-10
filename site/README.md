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
| `npm run media:loop`      | Encode a full-screen video (the intro, the hero) for the page. See "Videos".         |
| `npm run media:cut-intro` | Cut the intro from its Pexels clips. See "Videos".                                   |

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

- **Intro:** on the first load of a visit, five seconds of busy cities at night, cut
  faster and faster and ending on a traffic light switching to red, play once, full
  screen, while the page loads behind it, with a hairline filling at the foot as a loader would.
  A click or tap (or scrolling, or Escape, Enter, Space, the arrows down) skips it. It
  cuts hard to the hero. It doesn't play again in the same tab, when coming from another
  page of the site, on a link to a section, with reduced motion, motion paused or data
  saver on, or without JavaScript (`components/Intro.astro`).
- **Top bar:** her name and role, the section links, the pause-motion control and "Say hi".
  Over the light page it is a blurred strip of the page colour with dark type. Over the
  hero, the about photo, the work cards and the footer it turns clear with light type.
- **Hero:** one screen of Amy's video, looping, under a night shade, with her motto set
  like a film title (thin capitals, widely spaced) and her crafts beneath, separated by
  dots. After the intro it breathes in: the video comes into focus from a blur, then,
  later and slower, the motto fades in, grows and opens its letters out, then the crafts
  and the hairline arrow at the foot. The video and the words hold still while the page
  scrolls up over them, and the words fade out as their letters open wider; with motion
  off the hero scrolls with the page. On narrow screens each sentence takes a line.
- **Gallery pin:** her line in the middle of the screen while pictures fly outward past
  it: Amy's photos, stills from the hero's video, and the offerings' pictures. It arrives
  halfway into the flight, the screen already full, and ends on the line alone. The
  section is 2.4 screens long and pins for the flight.
- **About:** full-screen over the photo of Amy with her staff: a large statement, her
  paragraph, and a handwritten note pointing at her.
- **Work cards:** the theme's project carousel, on night: one card per offering, its
  picture darkened, its kind, its name and a round arrow, linking to the offering's page.
  One screen pins while the cards roll past on a slight cylinder, drawn on a canvas (see
  "The work cards" below).
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

| Script             | Does                                                                          |
| :----------------- | :---------------------------------------------------------------------------- |
| `parallax.ts`      | The about photo drifts.                                                       |
| `gallery.ts`       | The gallery's pictures fly outward while the section is pinned.               |
| `reveal.ts`        | The about and contact headings sharpen word by word as they scroll into view. |
| `carousel.ts`      | The work cards roll past a pinned screen, drawn on a canvas.                  |
| `switcher.ts`      | The pinned step through the offerings.                                        |
| `footer-shader.ts` | The footer's liquid gradient.                                                 |

The intro and the hero carry their own small scripts, which load with the page.

**Without JavaScript, with reduced motion, or with motion paused** (the control in the
top bar), each of these falls back to plain HTML: no intro, the hero's video resting on
its first frame, the gallery's sentence above a grid of its pictures, the about text
simply there, each work card a screen with its picture centred, and the offerings as a
grid of panels. The footer keeps a CSS glow of the same colours, or holds the shader on
one frame. Pausing also stops the scroll cue and the ticker.

### The work cards

`scripts/carousel.ts` is the Elias Vent theme's project carousel (MIT, see
`THIRD-PARTY-NOTICES.md`) with its measures: each picture 80% of the screen wide and 68%
high (84% and 58% below 1200px, 92% and 50% below 810px), 75% of a screen of scrolling per
card (60% on phones). It draws each picture as a plane on a slight cylinder, so the card in
the middle is nearly flat and the ones leaving bend away, plus:

- a slow liquid wobble
- a colour split, red and blue pulled apart in the picture and along each card's outline,
  so it shows on flat pictures too; stronger than the theme's

Both are faint at rest and swell with scroll speed. The words move one to one with the
scroll; the pictures trail slightly. The current card's name rises in letter by letter,
and a column of bars on the right shows and picks the card. Pictures are read from the
cards' own `<img>` (or a playing `<video>`), so the plain layout and the canvas always show
the same media. Without WebGL the plain layout stays.

### The footer

`scripts/footer-shader.ts` is the theme's footer shader (MIT, a port of Framer's "Liquid
Gradient"), with its settings and its five colours, fire into dusk (`--glow-1` to
`--glow-5`, `palette.glow` in `brand.ts`). It starts when the footer is two screens away,
draws at half resolution only while on screen, and the pointer pushes it a little. Night
covers the top seventh of the footer and fades out toward the foot, as in the theme.

## Structure

| Path                                                                    | Holds                                                                                             |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `src/content/chapters/*.md`                                             | One file per section: each offering (`layout: stop`), plus `about` and `contact`.                 |
| `src/content/settings.json`                                             | Name, role, line, "currently in", contact details, wedding-site link, the hero's words.           |
| `src/content.config.ts`                                                 | The schema both are checked against at build time.                                                |
| `src/pages/index.astro`, `[stop].astro`                                 | The home page, and the page each offering gets.                                                   |
| `src/pages/404.astro`                                                   | The page for unknown addresses, with a way back.                                                  |
| `src/pages/social-card.png.ts`, `src/lib/social-card.ts`                | The picture shared links preview with: her name and line, rendered at build time.                 |
| `src/pages/favicon.svg.ts`, `favicon.ico.ts`, `apple-touch-icon.png.ts` | The icon for browser tabs and phone home screens, from the one drawing in `src/lib/brand.ts`.     |
| `src/components/TopBar.astro`, `Footer.astro`                           | The fixed bar and the page's end.                                                                 |
| `src/components/Intro.astro`, `public/media/intro/`                     | The cities at night, played once before the hero.                                                 |
| `src/components/Hero.astro`, `public/media/hero/`                       | The opening video, with the motto and crafts over it.                                             |
| `src/components/Gallery.astro`, `src/assets/gallery/`                   | The gallery pin, and its photos and stills from the hero's video.                                 |
| `src/components/About.astro`, `src/assets/about/`                       | The about section and its photo.                                                                  |
| `src/components/Stops.astro`, `Offerings.astro`                         | The work cards, and the step through the offerings.                                               |
| `src/components/Contact.astro`, `Ticker.astro`                          | The sections of those names.                                                                      |
| `src/components/ContactAction.astro`, `ContactLinks.astro`              | The contact pills.                                                                                |
| `src/components/BackgroundMedia.astro`                                  | A video or still that fills its card, with portrait cuts and posters.                             |
| `src/components/Effects.astro`, `src/scripts/`                          | The late loader for motion, and the scripts above plus `motion.ts`, `live.ts`, `play-in-view.ts`. |
| `src/components/AlphaVideo.astro`                                       | Transparent video. Not on the page at the moment; kept for the cut-outs of Amy (#5).              |
| `src/lib/site.ts`, `contact.ts`                                         | Loading the content in order; building WhatsApp, email and Instagram links.                       |
| `src/lib/brand.ts`, `raster.ts`                                         | The icon, and colours for code that can't read CSS (kept in step with `tokens.css`); PNG and ICO. |
| `src/styles/tokens.css`, `global.css`                                   | The palette, type scale, spacing and shapes; base styles.                                         |
| `scripts/encode-loop.sh`                                                | Encodes a full-screen video into the WebMs, MP4s and poster the page plays.                       |
| `scripts/cut-intro.sh`                                                  | Cuts the intro's master from its Pexels clips.                                                    |
| `scripts/encode-alpha.sh`                                               | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.                     |
| `THIRD-PARTY-NOTICES.md`                                                | The licence of the theme code the work cards and the footer are adapted from; the intro's clips.  |
| `scripts/check-launch.mjs`                                              | The launch check (#13).                                                                           |
| `public/media/test/`, `public/media/placeholder/`                       | Synthetic test clips and labelled placeholder images.                                             |

## Edit the content

Words and media live in `src/content/`, not in the layout code:

- Change a section's text in its Markdown file. Text in `[brackets]` is a placeholder for
  something Amy still has to confirm, and `draft: true` marks a section whose words are not
  hers yet. Quote frontmatter values that contain `: `.
- An offering's work card shows its `kicker` (small) and `nav` (large) over its
  `background`, a `video` or a `still` with an optional `portrait` cut for phones. Its page
  shows all of that plus `note` (in her handwriting), `title`, `lead`, the body, `badge`,
  `facts` and `cta`.
- To add an offering, add a Markdown file with the next `order`. It gets a work card, a
  step, a place in the ticker and the gallery, and a page at `/<file name>/`.
- The gallery's sentence is `line` in `settings.json`; the part after its last comma is
  set muted.
- Add contact details in `settings.json` (`whatsapp` as an international number, `email`,
  `instagram` as the handle). Until a detail is there, its button renders as a dashed
  placeholder.
- The hero's words are `hero` in `settings.json`: `motto` (each sentence keeps to one
  line), `crafts` (shown with dots between them) and `alt`, which describes the video.
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
  captions that are never tracked out. The one exception is the hero, set like a film
  title: thin capitals spaced wide. Shantell Sans stands in for Amy's handwriting.
  `.hand` is for her voice only, at 20px or larger, never for body copy, prices or contact
  details, and at most one note per section.
- Media sits in cards with a 1.25rem radius. Buttons are pills.
- Scroll-tied motion follows the scroll position, with no scroll-jacking; the work cards
  ease after it, as in the theme. The only things that move on their own are the intro,
  the hero's video and its breath in, the scroll cue, the ticker, the footer's gradient and
  the work cards' wobble. A pause control stops all of them and all video (WCAG 2.2.2).

## Transparent video

Not used on the page at the moment. A clip of Amy is cut out into a master with an alpha
channel (ProRes 4444 or a PNG sequence), then encoded with
`scripts/encode-alpha.sh <master> <output-base>`, which needs ffmpeg with libaom-av1,
libx265 and libwebp. The output is `<base>.av1.mp4`, `<base>.hevc.mp4` and
`<base>.poster.webp`, which `AlphaVideo.astro` plays from `<base>`. The layer delivery
spec is on #2.

## Videos

The intro (`public/media/intro/city*`) is a 5-second cut of Pexels clips (listed in
`THIRD-PARTY-NOTICES.md`): `npm run media:cut-intro -- <clips dir> <master.mp4>` writes
the master from the clips saved as `<Pexels id>.mp4`, and the script lists each shot's
clip, size, in-point and speed. The hero (`public/media/hero/amy*`) is the footage as
supplied, not cut or changed.

Both are encoded for the web with
`npm run media:loop -- <source> <output base> [crf] [webm crf]`, which writes
`<base>.webm` and `<base>.mp4` (1920 wide), `<base>-720.webm` and `<base>-720.mp4` (1280
wide, for screens up to 60rem) and `<base>.poster.webp` (the first frame), without sound.
The WebMs are VP9; the MP4s are H.264, the fallback for browsers without VP9. The city
uses crf 30 for the MP4s (2.4 MB) and 46 for the WebMs (2.0 MB, 1.3 MB at 720p), which
look alike. Amy's loop uses crf 28 (6.2 MB) and plays only its MP4s so far. Clips,
masters and sources stay out of the repository.

The gallery's `src/assets/gallery/amy-*.webp` are stills from the hero's video, one or two
from each of its shots. `lake.webp` is the mountain-lake photo that opened the page before.

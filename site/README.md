# Site

Amy Huang's one-page website: a static [Astro](https://docs.astro.build) build with
pinned, layered scroll scenes ([GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/))
and transparent video loops ([`stacked-alpha-video`](https://github.com/jakearchibald/stacked-alpha-video)).

## Work on it

Use the Node version in `.node-version` (24.22.2), then from this folder:

| Command              | Does                                                        |
| :------------------- | :---------------------------------------------------------- |
| `npm ci`             | Install the locked dependencies.                            |
| `npm run dev`        | Start the dev server at http://localhost:4321.              |
| `npm run verify`     | Type-check, check formatting and build, as CI does.         |
| `npm run format`     | Apply Prettier formatting.                                  |
| `npm run build`      | Build the static site into `dist/`.                         |
| `npm run media:test` | Regenerate the synthetic test clip in `public/media/test/`. |

`/lab` is a test bench for the scene engine and transparent video; it is marked
`noindex` and is not linked from the site.

## Structure

| Path                              | Holds                                                                                 |
| :-------------------------------- | :------------------------------------------------------------------------------------ |
| `src/pages/`                      | Routes: `index.astro` (the site) and `lab.astro` (the test bench).                    |
| `src/layouts/Base.astro`          | The document shell and global styles.                                                 |
| `src/scripts/scenes.ts`           | Pinned scenes whose `[data-layer]` children animate on their own scroll windows.      |
| `src/scripts/alpha-video.ts`      | Plays transparent loops only on screen; keeps the poster when playback isn't allowed. |
| `src/components/AlphaVideo.astro` | Markup for one transparent loop: poster, AV1 and HEVC sources.                        |
| `scripts/encode-alpha.sh`         | Encodes a master clip with alpha into the stacked AV1, HEVC and poster files.         |
| `public/media/test/`              | The synthetic test clip and placeholder still. Real media is served from a CDN.       |

## Transparent video

A clip of Amy is cut out into a master with an alpha channel (ProRes 4444 or a PNG
sequence), then encoded with `scripts/encode-alpha.sh <master> <output-base>`, which
needs ffmpeg with libaom-av1, libx265 and libwebp. The output is three files:
`<base>.av1.mp4`, `<base>.hevc.mp4` and `<base>.poster.webp`, used through
`<AlphaVideo src="<base>" …>`.

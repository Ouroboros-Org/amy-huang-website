# Amy Huang website: design outline

> **Draft, local only.** Written 2026-11-05 and not posted anywhere yet. Once Marc approves it, it becomes the 0.0.1 outcome Issues and a handbook page (§12). Sources are in the appendix.

> **Direction changed 2026-11-05 (Marc):** the paper-scrapbook page below is superseded by a
> **full-screen video journey**. A dark, neutral hero with a central opening zooms into
> layered video chapters (background, cut-out of Amy, clean type), one per thing she does,
> on mobile and desktop. Clean and video-first up front; the diary voice, handwriting and
> doodles become a light personality layer on top. Still valid from this outline: the
> brief (§1), the reference analysis (§2), the layer and choreography rules (§4), content
> and assets (§7), the technical approach (§8), accessibility and performance (§9), the
> design-skill rules (§10). Superseded: the paper ground, the spread storyboard (§5) and
> the paper-first visual language (§6). The live direction is recorded on #3.

---

## 0. In one breath

- **Concept: "Amy's diary, in motion."** A one-page scroll that reads like her personal scrapbook: real photos taped onto a Swiss grid, her handwriting and doodles annotating them, and cut-out video of her stepping out of the photos.
- **Rework of the reference.** The Dribbble shot fakes depth with one uniform zoom over a single video. We split every scene into separate **layers**: a paper ground, a large background still, an alpha cut-out video, paper objects, ink doodles and type. Each layer **zooms, moves and fades on its own scroll timeline**.
- **Grid underneath, mess on top.** Swiss rules carry the structure: grid, one grotesk, flush-left text, a contents page and one signal colour. The scrapbook layer (rotation, tape, scribbles, wavy lines) may break it on purpose. Every scrapbook material is real, scanned or photographed; nothing is faked in CSS or drawn by an agent.
- **Everything visible at once on arrival** (Marc's point in the meeting): the first screen already shows all of her offerings and all contact routes. The scroll adds depth and is never needed to find anything.
- **Built for the footage she actually has.** Cut-outs get a white "scissor-cut" sticker border that hides imperfect mattes, and phone clips live in polaroid and phone frames. Pro footage is saved for the big stills, and fire is keyed from black rather than cut out.
- **Proven tech path:**
  - Stacked-alpha video (one AV1 file and one HEVC file per clip) works in every major browser.
  - The clips loop on their own while GSAP ScrollTrigger moves the layers.
  - The site is a static Astro build with videos on a CDN.

---

## 1. What the meeting tells the design

Only the design-relevant points from the kickoff call.

| Signal from the call | Design consequence |
|---|---|
| Wants to look **professional**, "go from hobby to profession", replacing a bare Linktree | Clear offer statements, real details per service, a confident type system; no "under construction" feel |
| Wants it **authentic, personable, not too professional**: "they meet me and I'm this playful person" | First-person voice, her handwriting, playful doodles; the structure must not read like a corporate template |
| "It's just a **reference board**… look at it for minutes and know how to contact me" | One page, a scannable contents page up front, contact always one tap away; no deep page tree for now |
| Contact goes through **email, WhatsApp, Instagram** | Three big contact affordances, no long contact form |
| **Teaching martial arts and performing** are the top two; hair and drone photography come next. Fire show and Shaolin kung fu are named | Order and visual weight: Teaching, Performing (fire and Shaolin), Hair, Drone. Wedding hair in Canada becomes a link out to her existing site |
| Wants **"flowy, wavy, creative, not as solid structured"**, not "too much like a book" | Swiss stays invisible as the skeleton; the visible surface is loose, rotated, hand-drawn and wavy. Avoid the reference's elegant editorial "book" look |
| Marc's pitch: **whimsical, hand-drawn, notebook, her handwriting**; Amy: "I like that" | Handwriting font and scanned words from Amy, a hand-drawn doodle kit, real notebook materials |
| **Greg's diary** (Diary of a Wimpy Kid) vibe, first person; Amy: "I'm down for that" | First-person "Hi, I'm Amy" copy, doodles that comment on real photos, humour. Use the *device*, not the book's look or font |
| Her **intro reel** (talking to camera) is the vibe she wants; "real people and real stuff" | Her intro reel gets a place near the top, framed as a phone or polaroid video with a tap for sound |
| **Mostly phone-quality footage**, a few pro shots, pro kung fu photos and video arriving "in a couple of months"; lots of hair material | Scrapbook framing (small, taped, polaroid and phone frames) absorbs phone quality. Pro shots go to the large layers. Leave slots where new pro media drops in |
| **AI-edited images OK** as long as it still looks like her and isn't obviously AI | AI only for photographer-style fixes: extending aspect ratios, crops, angles, upscaling, background removal. Never her face or body. Amy approves each one |
| **Wants to edit things herself** later | Content lives in editable files with a light CMS, not hard-coded in animation code (§8) |
| **Goal in 2–3 years: teach online**, probably live classes; cal.com mentioned | "Teaching" is a content collection that can later gain classes and booking. Leave an "online classes, soon" slot now |
| **Timeline**: "something solid" by **January or February** | A working first version by end of January 2027 (§11) |
| Doesn't want to write about herself in the third person; wants **realism, not cliché** | Amy drafts in the first person, we edit. The design never relies on long copy |

### Design principles derived from it

1. **Her, not her services.** The character comes first and the offerings hang off her (Marc: build it "around you as the character").
2. **Find everything in five seconds, then enjoy it for five minutes.** Contents and contact are visible on load, and the layered scroll is the reward.
3. **Real over polished.** Phone footage, handwriting and a little mess are features. Polish goes into the structure (grid, type, spacing), not into the surface.
4. **Playful but professional.** Every whimsical element sits on a strict grid and next to a clear fact: what, for whom, where, how to book.
5. **Room to grow.** Sections are collections; teaching can later become a platform without a redesign.

---

## 2. Reference analysis: the "Araf" Dribbble shot

The source is a 16 s, 1600×1200, 24 fps screen recording of a photographer and casting portfolio concept. The logo reads "Araf"/"Eraf"; *araf* means "limbo", which matches the "between Reality & Dream" theme. Frames are in [reference-frames/](reference-frames/): the contact sheets `sheet_1.png` (0–8 s) and `sheet_2.png` (8–16 s), `zoom.png` (the window zoom at 6 fps), `wipe.png` (the panel wipe), and the full frames `hero_full.png` and `works_full.png`. They are someone else's design and are for internal reference only; don't commit them.

### Timeline

| t (s) | On screen | Motion |
|---|---|---|
| 0.0–1.2 | Dark interior, a round porthole window, a silhouette sitting on the ledge. Through the window, a dream-graded video of a woman in a rapeseed field | Headline lines rise from masks, staggered: "between" → "Reality" → "&" → "Dream" (~1 s) |
| 1.2–4.8 | Hero at rest. Display serif headline, ghost outline numerals "✻2021", a vertical "SCROLL DOWN" ring, a tracked-caps tagline, a thin-caps nav (About, Works, Casting, Contact \| Instagram) | Only the window video plays |
| 4.8–6.8 | **Zoom through the window.** Everything scales up around the window centre: frame, silhouette and type exit outward. The film scratches and dust fade away, and the grade shifts from muted "dream" to saturated "reality" | One uniform scale about one origin; the layers move in lockstep |
| 6.8–9.6 | Full-bleed field video with the headline "Push *the* Envelope", a short paragraph, metadata ("FIELD OF MIND, 12 JUNE 2021"), "See collection", and a circular "Explore works" button | Masked line reveal again |
| 9.6–10.6 | A dark "Works" panel **wipes in from the right** over the video | Hard-edged horizontal wipe |
| 10.6–14.6 | Works: per collection, a cluster of 4–6 photos at mixed sizes, a display-serif title overlapping a photo, a letter-spaced date, two short paragraphs and "See collection →" | Vertical scroll with mild parallax; images move faster than the text |
| 14.6–16.0 | Crossfade back to the hero (presentation loop) | Fade |

### What to keep

- **One strong threshold metaphor** (the window between reality and dream) that the first scroll physically moves through.
- **Masked line reveals** for headlines: cheap, crisp, readable.
- **A grade change as storytelling** (dream → reality) rather than decoration.
- **Asymmetric collage clusters** with mixed image sizes and the title overlapping an image.
- **Restraint in the type pairing**: one expressive face, one quiet face.

### What to change for Amy

- **Fake depth.** The "layers" move together because it is one plate scaled about one point. We want true layers with independent rates and timings.
- **Dark, luxurious, editorial "book" look.** That is exactly what Amy said she doesn't want. Ours is daylight paper with "night pages" only where fire lives.
- **Needs cinematic pro footage everywhere.** Amy has little of that; ours must work with phone clips.
- **Tiny low-contrast body text, ghost numerals, tracked-caps labels.** These fail legibility, and the design skills list them as generic AI tells (§10).
- **Generic navigation** (About, Works, Casting). We use her own contents page: what she does, in her words.
- **Hard wipe between sections.** Ours uses physical paper transitions: a sheet sliding over, a page turn, tape coming off.

---

## 3. Concept: "Amy's diary, in motion"

**One line:** You open Amy's travel diary. Each spread is one part of her life, and she literally steps out of the photos to tell you about it.

### Swiss × scrapbook: the contract

| Swiss (the skeleton, always obeyed) | Scrapbook (the surface, allowed to break the skeleton) |
|---|---|
| 12-column grid with a visible baseline, shown as notebook ruling | Photos rotated ±1–4°, taped or clipped, overlapping columns |
| One grotesk, flush left and ragged right, a strict size scale | Handwritten notes in Amy's hand, set loose and slightly rotated |
| A diary **contents page** (plain titles, dot leaders, page numbers) and plain section titles | Hand-drawn arrows, circles, underlines, "that's me!" notes |
| One signal colour (the notebook's red margin line, pushed toward fire) | Paper, tape, sticky notes and ticket stubs in their real, scanned colours |
| Generous, measured white space | Clutter clustered in deliberate "piles", never spread evenly |
| Facts in plain words: what, who, where, how | Asides and jokes in the margins |

**Rule 1: anchor the mess.** Every scrapbook element is *anchored* to the grid: by an edge, a baseline or a column. It looks messy but is placed precisely. That is what keeps it professional.

**Rule 2: don't mix the two inside one element.** A block is either Swiss (facts table, contents, contact) or scrapbook (photo pile, note, doodle). This resolves the design skills' warning that Swiss styles don't suit playful creative portfolios: Swiss gets the skeleton, scrapbook gets the materials.

**Rule 3: spend the boldness in one place.** The S0 → S1 "into the photo" move is the one authored signature. Only 2–3 spreads are pinned scroll scenes; the rest scroll normally with light touches.

**Rule 4: real materials only.** Paper, tape, polaroids and torn edges are scans or photos of real objects. Doodles are drawn by a human hand (Amy, or Marc in her style). No CSS-striped "washi tape", no `clip-path` torn edges, no noise filters, no agent-drawn "sketchy" SVG. The design skills flag every one of those as a fake.

### The diary device (Greg's diary, done our way)

- First person and casual, with short entries. The doodles comment on the real photos ("this is me pretending I'm not scared of fire").
- Taken from the device: the voice, simple ballpoint stick-figure doodles, lined paper, captions that undercut the polish.
- **Not taken**: the book's look, its licensed handwriting font, its characters or cover design. Everything hand-drawn comes from Amy's own hand or is drawn for her.

### The scissor-cut sticker

Amy's video cut-outs carry a **white paper border**, as if cut from a photo with scissors and stuck on: the matte expanded by a few pixels and filled white, with a soft shadow. It is the scrapbook answer to imperfect mattes from phone footage, because the border hides 1–3 px edge errors, motion-blur halos and stray hair. It also makes her instantly readable over busy stills.

### Reference → ours

| Reference ("Araf") | Ours |
|---|---|
| Porthole window as the threshold | **A taped photo print as the threshold.** The scroll zooms into the photo, and later pulls back to show it was a page in her diary |
| One plate scaled about one origin | Five or more independent layers, each with its own scroll window, rate and easing |
| Silhouette inside the image | Amy as a scissor-cut sticker video that steps out of the print's frame |
| Dark interior, film scratches, a dream grade | Daylight paper; **"night pages"** (black paper, white gel pen) only for fire |
| A Didone display serif and tracked caps | One Swiss grotesk for structure plus Amy's handwriting for voice |
| Collage clusters on black | Collage piles taped on paper with handwritten captions, still aligned to the grid |
| A horizontal panel wipe | A paper sheet slides over with a scanned torn edge; a page turn for day → night |
| Ghost numerals "✻2021" | A diary contents page with page numbers that works as navigation; no "01 / 02" eyebrow labels |
| About, Works, Casting, Contact | Notebook divider tabs: Teach, Perform, Hair, Fly, Say hi |

---

## 4. The layer system

### Z-stack (per scene)

| z | Layer | Content | Typical motion |
|---|---|---|---|
| 0 | **Paper ground** | A scanned paper sheet with ruling or grid and a red margin line | Static; changes per spread (lined, graph, kraft, black) |
| 1 | **Background still** | Large pro photo or AI-extended still (location, stage, landscape), sometimes as a taped print | Slow zoom (scale 1.15 → 1.0 or the reverse), early fade in or out, ~0.3× scroll rate |
| 2 | **Atmosphere** | A light leak, embers (fire scenes only) | Opacity only |
| 3 | **Subject video** | A stacked-alpha cut-out loop of Amy with the sticker border, or fire footage keyed from black | Its own scale and translate at ~1.0×, often **persists into the next scene** |
| 4 | **Paper objects** | Scanned tape, polaroid frames, stickers, ticket stubs, sticky notes, paper clips | A "slap on": quick scale 1.08 → 1 with a slight rotation settle; soft, realistic shadows |
| 5 | **Ink** | Hand-drawn doodles, arrows, underlines, handwritten notes | Draw-on (stroke reveal) tied to scroll |
| 6 | **Type** | Grotesk headlines and body text on the grid | Masked line rise, slightly faster than the page (~1.1×) |
| 7 | **UI** | Divider tabs, contact buttons, a **pause-motion toggle**, a sound toggle | Fixed; never animated by scroll |

### Choreography rules (what "asynchronous" means here)

1. **Each layer gets its own scroll window** inside a pinned scene (for example the background from 0–100 %, type from 10–40 %, ink from 45–75 %). Layers never all start and end together.
2. **Depth sets the rate.** Background ≈ 0.3×, subject ≈ 1×, type and ink ≈ 1.1–1.2×. That gives real parallax instead of a lockstep zoom.
3. **At most two layers in motion at once.** Async must read as a sequence, not chaos.
4. **Handoffs overlap.** The next scene's background fades in *under* the current subject before the current one's type has left, so there is never a blank frame and never a full-screen crossfade.
5. **Amy is the thread.** Her cut-out often survives a scene change (she stays, the world changes behind her). That is the opposite of the reference, where the subject is replaced.
6. **Scroll controls position; video plays on its own.** Cut-out loops of 4–8 s play in real time (martial arts reads badly in reverse or in stutters), and scroll moves, scales and fades them. Scrubbing frames by scroll is allowed for at most one signature moment of 3 s or less.
7. **Content is visible by default.** The HTML renders the final composed state. Scripts set the "before" states only once they have loaded and motion is allowed, so no text or contact detail depends on an animation running.
8. **Exits are faster than entrances.** No bounce or elastic easing anywhere.

### Example timing: scene "I teach kung fu" (pinned for about 1.5 viewport heights)

```
progress  0%        20%        40%        60%        80%       100%
bg still  [== fade in under prev subject ==][----- slow zoom 1.12 -> 1.0 -----]
subject   [persists from prev]-[clip swap]-[== scale 0.92 -> 1.0, rise 4vh ==]
type      .........[== "I teach kung fu" lines rise ==].............[fade]
ink       ...................[== arrow + "that's me!" draws ==]...........
objects   ...............................[slap: polaroid, tape]..........
next bg   .........................................................[== in ==]
```

### Threshold transitions (the signature moves)

- **Into the photo** (cover → intro): the taped photo on the cover grows, its tape and border scale off-screen, and we are "inside". Amy's sticker cut-out grows more slowly than the photo, so she separates from it in depth. The rework of the reference's window zoom.
- **Out of the photo** (end of a scene): pull back so the full-bleed image shrinks into a print on the page and the tape slaps on. It tells the visitor "this was a diary entry".
- **Page turn to night** (into Performing): the paper flips or slides to black paper, the ink switches from ballpoint blue to white gel pen, and embers start.
- **Sheet over** (small sections): a fresh sheet with a scanned torn top edge slides up over the previous one with a soft shadow.

---

## 5. Storyboard

Each scene is a "spread" of the diary. Desktop first; mobile notes in §9. Spread titles are plain ("I teach kung fu"). The page number sits in the page corner like a real diary page, never as an eyebrow label above the heading.

### S0 Cover and contents (first screen, no scroll needed)

```
+--------------------------------------------------------------------------+
| |  Teach   Perform   Hair   Fly   Say hi                     [pause] [sound] |
| |                                                                          |
| |  hi, I'm  (handwritten)          +---tape-------------+                  |
| |  AMY HUANG                       |                    |   Contents       |
| |                                  |   big still        |   Teaching kung fu ...... 2 *
| |  I teach kung fu, perform        |        _           |   Performing ........... 3 *
| |  with fire, and travel a lot.    |   Amy sticker-cut  |   Hair ................. 4
| |                                  |   video steps out ---+  Drone photography .... 5
| |  [WhatsApp] [Email] [Instagram]  +--------------------+   Say hi ............... 6
| |                                       sticky: "currently in Chiang Mai"   |
+--------------------------------------------------------------------------+
  | = red margin line     * = Amy's handwritten star on her top two
```

- Left: a large handwritten "hi, I'm" over a big grotesk **AMY HUANG**, with one plain line under it (placeholder; Amy writes it).
- Centre: a taped photo print (big background still) with **Amy's sticker-cut video stepping out of its frame**: a short loop such as a bow, or a stance into a kick.
- Right: the **contents page** with dot leaders and page numbers. Each line jumps to its spread.
- A sticky note "currently in: Chiang Mai" that she can edit, which also suits her travel life.
- Always visible: WhatsApp, email and Instagram, styled as scanned stickers or ticket stubs.

### S1 "Hi, I'm Amy" (intro, pinned: the signature move)

- The "into the photo" threshold. Inside: her **intro reel** in a phone or polaroid frame, with a handwritten "tap for sound".
- 3–5 short first-person lines in the grotesk, plus margin doodles.
- Small proof row: years practising, places taught, styles. These are taped "facts", not a CV.

### S2 "I teach kung fu" (primary offer, pinned)

- Background: a training location still. Subject: her cut-out continuing from S1 into a teaching move.
- A **Swiss facts table** on lined paper: what (Shaolin kung fu, forms, self-defence…), who (kids, adults, beginners), formats (private, group, workshops), where (wherever she is; travel). Content from Amy.
- Doodles: stick-figure stance diagrams, the Greg's-diary signature.
- Sticky note: "online classes, coming soon". This is the expansion slot and later becomes a booking link (cal.com).
- CTA: "Book a class on WhatsApp", with a hand-drawn arrow pointing at it (no "→" glyphs on buttons).

### S3 "I perform" (fire and Shaolin, pinned)

- **Page turn to night pages.** Fire footage keyed from black, embers, and white gel-pen notes.
- Performance types as a plain list (fire show, Shaolin demo, events and festivals), each with a taped polaroid video loop.
- A collage pile with mixed sizes, adapted from the reference's Works clusters: rotated, taped, captioned by hand.
- CTA: "Book a show".

### S4 "I also do hair" (normal scroll)

- Back to day paper with a "sheet over" transition.
- A before/after photo-booth strip, a scrapbook pile of her hair work, and a small link "weddings in Canada: my wedding site".

### S5 "And I fly drones" (normal scroll)

- "Out of the photo": start full-bleed aerial, then pull back into a print on a hand-drawn travel map with pins for where she has been.
- A small gallery grid and a short line on what she offers.

### S6 "Say hi" (contact, deliberately calm: equal edges, one main action, no motion)

- A big grotesk "Say hi." with a handwritten arrow to three large buttons: WhatsApp, email, Instagram.
- A handwritten "I usually reply within a day or two" (Amy to confirm the wording).
- Footer: her signature, "currently in", © year, and the Canada weddings link.

---

## 6. Visual language

### Grid and spacing

- Desktop 12 columns, tablet 8, mobile 4. An 8 px base unit, with the ruling at 24–32 px so the baseline grid *is* the notebook ruling.
- One rotation set for scrapbook objects: −4°, −2°, −1°, +1°, +2°, +3°. Each element keeps a fixed angle, never a random one per render.
- More space above a heading than below it. Body measure 45–75 characters.

### Typography

- **One grotesk does every readable job**: headings, body, navigation, contact, the contents page. Two or three weights only, nothing heavier than semibold. A modular scale with each step at least 1.25× the last, display at most about 6rem, letter-spacing no tighter than −0.04em. Use `text-wrap: balance` on headings and `pretty` on body text, and set `font-synthesis: none`.
- **Shortlist to test in the style tiles.** Free: Albert Sans, Rethink Sans, Schibsted Grotesk. Paid, more truly Swiss (licence budget is an open decision): a Klim or Dinamo grotesk such as Söhne or ABC Diatype.
- **Avoid**, because the design skills list them as reflex picks: Inter, Helvetica or Arial as defaults, Space Grotesk, Instrument Sans, DM Sans, Outfit, Plus Jakarta.
- **Handwriting has exactly one job: Amy's voice.** That means notes, dates, captions, arrows and "hi, I'm". It comes from a font built from her real handwriting (Calligraphr or similar), plus scanned words for the hero moments. Use Shantell Sans as the placeholder until her font exists. Keep handwriting at 20 px or larger, never for body text, prices, buttons or contact details, and always mirror it in real text for screen readers.
- **No** tracked all-caps labels, eyebrow labels above headings, italic-serif accents or one coloured word inside a headline.

### Colour

Take the colour from a **real notebook**, scanned rather than invented. That deliberately avoids the "cream background with terracotta accent" look that every skill flags as AI-made.

| Token | Starting value (refine by sampling the scans) | Use |
|---|---|---|
| `--paper` | about `oklch(0.97 0.006 240)`: cool notebook white, not cream | Day ground (the scanned texture carries the real tone) |
| `--rule` | about `oklch(0.82 0.05 240)` | Ruling and grid lines |
| `--ink` | about `oklch(0.30 0.09 262)`: ballpoint blue-black | Doodles and handwriting |
| `--text` | about `oklch(0.22 0.012 262)`: near-black tinted toward the ink, never pure #000 | Grotesk text |
| `--signal` | about `oklch(0.60 0.20 30)`: margin red pushed toward fire | Margin line and contact actions **only** |
| `--night` / `--gel` | about `oklch(0.16 0.006 262)` / `oklch(0.97 0 0)` | Night pages / white gel pen |

- The interface stays 90–95 % neutral; colour comes from Amy's photos.
- Use one light shared grade across phone and pro footage so they sit together.
- Put text on a photo only over a calm area or on a paper scrap, never directly on a busy image.

### Materials kit (all scanned or photographed)

- **Paper:** lined, graph, kraft and black sheets; torn-edge strips; sticky notes.
- **Fasteners:** 2–3 real washi tapes, masking tape, paper clips, staples.
- **Frames:** polaroid, photo-booth strip, phone frame, ticket stub.
- **Prep:** shoot or scan everything flat on a scanner. Cut it out with real alpha (AVIF or WebP), and keep shadows soft and believable, never hard offset shadows.

### Doodle and annotation kit

- **Pieces:** arrows (curly, straight, looping), circles and underlines, stars, stick-figure kung fu stances, flame doodles, and a small Amy avatar.
- **Hand:** drawn by a human. Draw them with a stylus in a vector app so each stroke stays a path, which makes the scroll draw-on possible. A scanned doodle can instead be revealed with a mask along a traced path.
- **Style:** one pen weight (ballpoint, about 2 px, slightly shaky) so they read as one hand.

### Motion language

- **Scroll mapping:** scrubbed timelines follow the scroll position directly, with native scroll speed, no smoothing library and no scroll-jacking. Inside a timeline, layers may ease gently.
- **Time-based micro-motion** (hover, tap, the sticker "slap") uses an ease-out curve such as `cubic-bezier(0.16, 1, 0.3, 1)`:
  - 100–150 ms for feedback
  - 150–300 ms for state changes
  - at most 500–800 ms for the one authored entrance
- **Headlines:** masked line rise, staggered by 60–90 ms per line, used only in the pinned spreads. A fade-and-slide-up on every section is a known AI tell.
- **Ink:** a stroke draw-on linked to scroll.
- **Thresholds:** zoom with depth separation, a page turn, a sheet sliding over.
- **Properties:** only `transform` and `opacity` animate. Apply `will-change` only during the motion, and stop loops when they are off screen.

---

## 7. Content and assets

### Request from Amy

1. **A shared footage folder** (iCloud): everything; we pick. Flag favourites.
2. **A handwriting sample**: an alphabet template and a short word list ("hi", "I'm", "me!", "this is", "currently in", numbers 0–9, arrows), in a black fine-liner on white paper.
3. **Per offering, 5–10 lines in her own words**: what it is, who it's for, formats, where, and how to book. Rough is fine; we edit together.
4. **Her intro reel** (the original file, not the Instagram re-encode).
5. **Facts**: years practising, lineage or school, places taught and performed, languages.
6. **New pro kung fu photos and video** when they arrive (in the next couple of months).
7. **Real scrapbook bits**, if she has them: tickets, stickers or tape from her travels, to scan.

### Shot list for cut-outs (if she can film anything new)

- Phone on a tripod, 60 fps with a fast shutter (less motion blur makes cleaner mattes), full body in frame with margin on all sides, a plain contrasting background, good light.
- 3–6 s moves with a clean silhouette that loop: a bow, a stance, a kick, a staff spin, a wave to camera, pointing at the text.
- Fire: shot at night against open dark sky, with nothing else lit, so it can be keyed from black instead of cut out.

### Cut-out pipeline

1. **Pick** 3–6 s clips with a clean silhouette.
2. **Matte:**
   - After Effects Object Matte (since 26.2) or DaVinci Resolve Studio Magic Mask, then a manual clean-up pass on hair and blur.
   - Open models such as MatAnyone 2 handle hair best, but its licence appears to be non-commercial; check it before use.
3. **Fire:** key it from black with an "unmult" step (brightness becomes alpha) instead of matting it.
4. **Master:** export ProRes 4444 with alpha, then add the sticker border (matte grown by a few pixels and filled white).
5. **Encode** to stacked alpha (§8, appendix A) and grab a still frame as an AVIF poster.

**Quality bar:** delivered at 720p, where small edge errors disappear, and checked frame by frame on the fast moves.

### Copy voice

- First person and present tense; short sentences; at most one joke per section; facts stated plainly.
- Amy drafts and Marc edits for rhythm. No third person, no "passionate about…" clichés.
- No em-dash habit, no "X. No Y." slogans, no "A · B · C" meta lines: the design skills list these as AI-copy tells.

### AI use rules (from the meeting)

- Allowed: extending a background to a wider aspect ratio, reframing or cropping, upscaling phone footage, background removal, colour matching.
- Not allowed: changing her face, body or movements; generating scenes she wasn't in.
- Amy approves every AI-touched asset before it ships.

---

## 8. Technical approach

| Concern | Decision | Why |
|---|---|---|
| Site | **Astro 6, static output.** Scripts only on the scroll scenes | One page now; content collections and server routes are available later for teaching. Cloudflare acquired the Astro team in January 2026 and Astro stays open source |
| Scroll choreography | **GSAP ScrollTrigger**: one pinned, scrubbed timeline per pinned spread, each layer with its own position and easing | Free for commercial use since April 2025, including every plugin. The most practical tool for async multi-layer zoom, fade and pin |
| Smooth scroll | **None** (no Lenis) at first | Smoothing is the main source of scroll-jacking complaints, especially on touch devices |
| CSS scroll-driven animations | Only for small decorative extras, behind `@supports (animation-timeline: scroll())` | Baseline since 2026-10-27, but older Safari and Firefox still lack it |
| Alpha video | **Stacked alpha**: colour and matte packed into one ordinary video, composited in WebGL with Jake Archibald's `<stacked-alpha-video>` component (about 2 kB) | The only route that works on iOS Safari, Android Chrome and desktop from one pipeline. Safari still has no VP9 alpha (WebKit bug 275908 is open), and native HEVC alpha is Safari-only and about 3× larger |
| Codecs | AV1 stacked first, HEVC stacked as fallback, chosen with `MediaCapabilities.decodingInfo()` (`powerEfficient`) | In Archibald's test the same clip was about 460 kB as stacked AV1, 1.1 MB as stacked HEVC, and 3.4 MB as native HEVC alpha. Apple decodes AV1 in hardware only on A17 Pro, M3 and newer, so the rest get HEVC |
| Video behaviour | `muted playsinline loop`; if `play()` is rejected (iOS Low Power Mode), keep the AVIF poster | iOS Low Power Mode blocks autoplay, and WebKit treats that as intended |
| Fire | Keyed from black into stacked alpha, the same pipeline as the cut-outs | `mix-blend-mode: screen` over video is buggy in Safari inside positioned containers (WebKit bug 286619) |
| Hosting | Static files on a CDN (Cloudflare Pages + R2, or Bunny CDN) with long cache times | Adaptive streaming adds nothing for 5 s loops, and HLS pipelines drop native alpha. Keep Stream, Mux or Bunny Stream for long teaching videos later |
| Content | Astro content collections (Markdown and JSON) from day one; **Keystatic** as the editing UI in 0.1.x | Git-based, free and integrated with Astro, though its README still says experimental. Sanity is the upgrade path if a teaching catalogue grows. Videos stay out of the CMS |
| Contact and booking | Plain links (`wa.me`, `mailto:`, Instagram) now; a cal.com embed for classes later | No back end or form needed for v1 |

---

## 9. Mobile, accessibility, performance

### Mobile

- Her phone footage is vertical, which fits mobile natively.
- Use fewer layers (ground, still, subject, type), shorter pins, and one cut-out per scene. Doodles appear in their final state.
- Check at 1440, 1024, 768 and 390 px wide.

### Budgets (starting targets; confirm in the 0.0.1 prototype)

| Item | Target |
|---|---|
| Cut-out loop, mobile | ≤ 720×1280 colour (720×2560 stacked), 24–30 fps, 4–8 s, about 1–1.5 MB AV1 or up to 2.5 MB HEVC |
| Cut-out loop, desktop | ≤ 1080 px wide |
| Background still | AVIF or WebP, responsive sizes, about 150–250 kB on mobile |
| Concurrent decoding | At most 2 videos playing; pause off-screen; attach the source within about one viewport (IntersectionObserver); `preload="none"` below the fold |
| Largest Contentful Paint | The background still or headline with `fetchpriority="high"`; an AVIF still of the cut-out shows until the first video frame. A WebGL canvas doesn't count as an LCP element |
| Frame rate | 60 fps target; simplify the scene if it drops below 50 |
| Pins | About 1–1.5 viewport heights each; 2–3 pinned spreads in total |

### Accessibility and fallbacks

- **A pause-motion toggle** in the UI layer stops all loops and scroll animation. WCAG 2.2.2 requires one for loops over 5 s; honouring reduced motion alone is not enough.
- **`prefers-reduced-motion`:** a static composition with videos paused on their posters, and fades only (fewer, gentler animations, not a broken page).
- **Fall back to stills** when `play()` is rejected, Save-Data is on, or the device can't decode efficiently.
- **Real text** everywhere, with handwriting mirrored in accessible text. Check contrast on paper and on night pages, keep focus states visible, and render everything in the HTML from the start (§4, rule 7).
- **No scroll hijacking.** Scroll speed stays native, and the contents page and tabs let people jump anywhere.

---

## 10. What we take from the design skills

### What was inspected

These are the actual SKILL.md and reference files on GitHub, read but not installed.

- **impeccable** (pbakaus/impeccable, about 103k stars, v4.8): 24 commands and a 62-rule slop detector.
- **frontend-design** in anthropics/skills.
- **taste-skill** (Leonxlnx/taste-skill).
- **ui-ux-pro-max** (nextlevelbuilder/ui-ux-pro-max-skill).
- **hallmark** (Nutlope/hallmark): only its font and "playful" files.
- **pskill:** no design skill by that name was found. The literal matches are a Windows process killer and unrelated personal collections. ui-ux-pro-max is the closest guess, at low confidence. **We need the link.**

### What we adopt

- **The brief wins** (impeccable): a pinned aesthetic like scrapbook overrides the generic "overused look" warnings. But commit to the whole world, not its softest version: paper is "the smallest corner" of a diary world. Hence real materials, night pages, tickets, maps.
- **Experience mode for portfolios** (impeccable): the artifact leads from the first viewport and the interface recedes.
- **Real cut-outs, never geometric masks** standing in for a person's outline (impeccable). That means a real alpha matte, hence the sticker cut-out.
- **Plan before building** (Anthropic): name the colours, type roles and wireframes, then check them against the brief. This outline is that plan.
- **Spend boldness in one place** (Anthropic): the into-the-photo move.
- **Calm, honest contact block** (taste-skill): equal edges, one main action, plain copy, real photos. Applied only to S6 and the facts tables, not the cinematic spreads, where its bans on parallax and tilt would kill the concept.
- **Swiss is for structure, not for playful brands** (ui-ux-pro-max). That is exactly why it owns only the skeleton here.

### Where the skills conflict with the scrapbook direction, and what we do

| Conflict | Resolution |
|---|---|
| impeccable (Codex build) bans hand-drawn-look SVG, "doodle" classes and noise grain | Ban **fake** hand-drawn work, not hand-drawn work. Doodles are drawn by a person; grain comes from scanned paper |
| taste-skill bans reveals, parallax, tilted and overlapping elements | Apply it to the info and contact blocks only |
| ui-ux-pro-max's "Minimal Swiss" pairs Inter with Inter | Use a grotesk with more character from the shortlist (§6) |

### Review workflow (run at style tiles, at the prototype, and before launch)

1. **impeccable `critique`.**
   - Start with: could an unrelated brand use this design unchanged? If yes, it fails.
   - Score Nielsen's heuristics 0–4 (two of them can be n/a for a portfolio), then check cognitive load and the emotional arc (where the visit peaks and how it ends).
   - Walk through it as personas: a festival booker, a parent looking for kids' classes, a wedding client from Canada. Rank issues P0–P3.
   - Do the visual review before running any detector.
2. **impeccable `audit`** for accessibility, performance, theming and responsive behaviour.
3. **impeccable `polish`**, fixing in order: broken things, missing states, hierarchy and responsiveness, visual and motion detail, cleanup.
4. **Squint test**, and **remove one accessory before shipping** (Anthropic).
5. **Screenshots** after the animations settle, at most two inspection rounds per change.
6. **Optional later:** `npx impeccable detect <url>` runs the 62-rule scan. It needs a package install, which hasn't been approved yet.

### AI-slop tells this site must not show

1. A cream background, a serif headline with an italic accent, a terracotta accent.
2. Eyebrow labels above headings, tracked all-caps text, "01 / 02 / 03" section numbering.
3. The same fade-up on every section; bounce easing.
4. Identical rounded cards, icon tiles above headings, nested cards, coloured side stripes.
5. Agent-drawn "sketchy" SVG, noise filters, CSS torn edges, circular masks around Amy.
6. CSS-striped washi tape; hard offset shadows on polaroids.
7. Copy tells: em-dash habits, "X. No Y." slogans, buzzwords, "→" on every button, one coloured word in a headline.
8. Emoji as icons, gradient text, glows.
9. Content that stays invisible until a scroll script runs.

---

## 11. Plan on the project horizons

The dna-template horizons are `0.0.1` (soon), `0.0.2` (after), `0.1.x` (later) and `1.x.x` (some time). These Issues are **proposed, not posted**.

### 0.0.1: Direction and one proven scene (November – early December 2026)

- **Outcome: design direction approved by Amy.**
  - Covers 2–3 style tiles (paper, type shortlist, colour, doodle samples, the sticker cut-out) and the annotated S0–S6 storyboard.
  - *Acceptance:* Amy picks a direction and names what to change, and an impeccable `critique` round is recorded.
- **Outcome: asset request sent and first assets in.**
  - *Acceptance:* the footage folder is shared, the handwriting sample is received, and the per-offering notes are drafted.
- **Outcome: layered-scroll prototype of S0 → S1**, with one real sticker cut-out made through the full pipeline (matte, ProRes master, stacked AV1 and HEVC).
  - *Acceptance:* plays with transparency in Safari (iOS and macOS), Chrome (Android and desktop) and Firefox, at 60 fps on a mid-range Android phone and an iPhone.
  - *Acceptance:* the reduced-motion and Low Power Mode fallbacks are readable, and the pause toggle works.
- **Outcome: site scaffold and deploy preview** (Astro, GSAP, stacked-alpha component).
  - *Acceptance:* a preview URL builds from `main`, and `dna check` runs the site's build and lint checks.

### 0.0.2: Complete first version (December 2026 – January 2027)

- All spreads S0–S6 with real content, mobile layout, reduced motion, the contact links and the Canada weddings link.
- Amy's handwriting font, the scanned materials kit and the doodle kit produced.
- Launch on her domain.
  - *Acceptance:* Amy signs off, the impeccable `audit` passes, and performance and accessibility meet the budgets in §9.

### 0.1.x: Her own edits and new media (early 2027)

- Keystatic editing for text, photos and "currently in".
- Drop in the pro kung fu photos and video when they arrive.
- A simple analytics view of visits and contact clicks.

### 1.x.x: Online teaching (2028–2029)

- Classes as a collection, cal.com booking, possibly payments, and longer videos through a streaming service.

---

## 12. Open decisions

1. **Domain and hosting.** Does she own a domain already? Cloudflare or Bunny for the CDN?
2. **Grotesk licence.** A free shortlist font, or a paid Swiss grotesk?
3. **Matting tool.** After Effects subscription, DaVinci Resolve Studio licence, or an open model (licence check needed)?
4. **Hero clip.** Which existing clip is clean enough for the S0 cut-out? This decides whether we need a new shoot.
5. **Signal colour.** The notebook margin red toward fire (recommended), or one of her brand colours if she has any.
6. **Sound.** Intro reel muted with tap-to-unmute (recommended), or never autoplay.
7. **Hair positioning.** How much weight do hair and weddings get against teaching and performing?
8. **Language.** English only, or also German or Thai later?
9. **"pskill".** Which repo was meant? (§10)
10. **Where this outline lives** once approved: split into the 0.0.1 Issues above, with §3–§6 moved into a handbook page.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Cut-out quality from phone footage (motion blur, hair, fabric) | Pick short clips with clean silhouettes, film at 60 fps with a fast shutter, deliver at 720p, use the sticker border, film a few new clips |
| The scrapbook mess erodes the professional read | The anchoring and no-mixing rules (§3), one signal colour, facts tables, critique rounds (§10) |
| Mobile performance with stacked video | AV1 or HEVC chosen by `powerEfficient`, at most 2 decoding, one video per scene on mobile, posters, fallback to stills |
| iOS Low Power Mode blocks autoplay | Posters are designed as finished compositions, so the page still works as a scrapbook of stills |
| Faked materials slip in under time pressure | Rule 4 (§3): scan real objects first, so the kit exists before any page is built |
| Content arrives late | Design with placeholders sized to the real constraints; the structure doesn't depend on long copy |
| Scroll animation annoys or hides content | Contents on the first screen, native scroll speed, short pins, content visible by default, a pause toggle |
| Keystatic is still marked experimental | Content lives in plain collections, so the CMS can be swapped (Decap or Sanity) without touching the design |

---

## Appendix A: stacked-alpha encode (from Jake Archibald's method)

```bash
# Shared filter: pack colour (top) and alpha (bottom) into one opaque frame
F=(-filter_complex '[0:v]format=pix_fmts=yuva444p[m];[m]split[m][a];[a]alphaextract[a];[m][a]vstack' -pix_fmt yuv420p -an)

# AV1, two-pass (primary)
ffmpeg -i master.mov "${F[@]}" -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 1 -f null /dev/null
ffmpeg -i master.mov "${F[@]}" -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 2 -movflags +faststart cutout.av1.mp4

# HEVC (fallback)
ffmpeg -i master.mov "${F[@]}" -c:v libx265 -preset veryslow -crf 30 -tag:v hvc1 -movflags +faststart cutout.hevc.mp4

# Only for a scroll-scrubbed signature moment (<= 3 s, 720p): add -g 1 so every frame is a keyframe
```

Tune the CRF values per clip; check the edges and use the component's `premultipliedalpha` option if the edges look dark.

## Appendix B: sources

- **Reference:** the Dribbble upload `cdn.dribbble.com/userupload/34366425/…` (16 s screen recording), analysed frame by frame.
- **Design skills:**
  - github.com/pbakaus/impeccable
  - github.com/anthropics/skills (frontend-design)
  - github.com/Leonxlnx/taste-skill
  - github.com/nextlevelbuilder/ui-ux-pro-max-skill
  - github.com/Nutlope/hallmark
- **Alpha video:**
  - jakearchibald.com/2024/video-with-transparency
  - github.com/jakearchibald/stacked-alpha-video
  - bugs.webkit.org 275908 (VP9 alpha in Safari), 286619 (blend modes over video), 216887 (Low Power Mode autoplay), 200949 (lost seeks)
  - rotato.app/blog/transparent-videos-for-the-web
  - bitmovin.com/apple-av1-support
- **Scroll:**
  - gsap.com/community/standard-license
  - webflow.com/updates/gsap-becomes-free
  - web-platform-dx web-features explorer (scroll-driven animations)
  - MDN Firefox 159 release notes
  - nngroup.com/articles/scrolljacking-101
- **Matting:**
  - MatAnyone 2 project page
  - FudanCVL/SAM2Matting
  - CG Channel on After Effects 26.2
  - Blackmagic forum (Magic Mask 2)
  - ProVideo Coalition on Unmult
- **Performance and accessibility:**
  - web.dev/articles/lcp
  - debugbear.com/blog/optimize-video-lcp
  - w3c/wcag issue 3766
- **Stack:**
  - Business Wire, Cloudflare acquires Astro (2026-01-16)
  - Keystatic vs TinaCMS comparison (luckymedia.dev)
  - Apple HLS authoring specification
  - Cloudflare Stream docs

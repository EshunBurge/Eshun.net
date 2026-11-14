# eshun.net

The personal portfolio of **Eshun Burge**, rebuilt as a hand-made static site.

The pages and menu are the original eshun.net's, in the same order and at the same URLs. What
changed is how it looks and reads: light greys for reading, a charcoal frame (the menu bar, the
home page's train, the closing band and the footer), pink kept for accents, one typeface
(Archivo) at sizes you can read, one plain menu bar, and a big silver train that pulls into the
home page under her name. Every section has a plain title and no line of subtext under it.

The train runs through the whole site. It pulls in under the title of every main page, in front
of a city at night that rises behind the words and along a lit guideway, with a "Now arriving · Platform N" sign on a split-flap
digit above the title. The four kinds of work and the photo collections are rail tickets (the
collections with a little poster of each destination, punched once you've visited); each
collection's page opens with a split-flap board and its own ticket, and ends with the next stops
as tickets. The home page's numbers sit on split-flap flaps, every project's facts are printed on a
ticket, the About page draws each organisation's roles as stations on a route, a tiny train rides
the menu bar as you scroll, and every page ends at "End of the line" in front of the city with a
train that takes you back to the top. Every project page has the same parts: its facts, a big
picture, Overview, Highlights, How I made it, What I learned, and a gallery.

| Menu             | URL                   | What's on it                                                                  |
| ---------------- | --------------------- | ----------------------------------------------------------------------------- |
| Home             | `/`                   | Name, one line and the train; four numbers; the four kinds of work; four featured projects; the research; "Hi, I'm Eshun"; leadership and awards side by side; Tesh Technology; photographs |
| Software Design  | `/software-design/`   | Every software project as a card (18), with filters (websites, software, apps), the awards for it and the languages and tools |
| Graphic Design   | `/graphic-design/`    | Every design project, with filters (branding, event branding, print), the awards for it and the tools |
| Science Projects | `/science-projects/`  | The research projects, the research she wants to do, and the science-fair record |
| Just for Fun     | `/just-for-fun/`      | The nine photo collections as tickets (plus a mystery stop that deals a random photo), the CAD model, piano and swimming |
| About Me         | `/about/`             | The story, education, every role, every award, skills, résumé and CV, where to connect |
| Links            | `/links/`             | Every profile in one list (the page social bios point to)                     |
| Contact          | `/contact/`           | Quick facts, a form that posts to the old site's Formspree endpoint, and every channel |

Below the menu pages, as on the original site:

- **A page per project** at its original URL (`/neuroassist/`, `/ecomatch/`, `/back-to-impact/`,
  `/pediatric-diabetes-ml/`, `/flip-cards/`, …), plus new pages for Aflare, GreenerPick, BlockSAT,
  In Another Life (the Sunbeam Tampa hackathon winner) and the Ramble Ventures Marketing
  Dashboard.
- **A page per photo collection** (`/photography-france/` … `/photography-other/`), each opening
  with a split-flap board, and the CAD model (`/space-cruiser/`, now a project page like the
  rest). Collections without photos yet say so.
- **The three live-demo pages** at their original addresses (`/neruoassistdemo/`,
  `/ecomatchdemo/`, `/rambleventuresmarketingdemo/`).
- **Redirects** for duplicate or retired WordPress URLs (`/photography/`, `/machine-learning/`,
  `/design/`, `/experience/`, …), so old links keep working.

Getting around: the menu bar is on every page (below 1100px wide a Menu button opens the same
eight pages, and it works even without JavaScript); every page below the top level starts with a
"← Section" link back up; project pages end with previous and next; and every page ends with big
tiles for the other kinds of work.

## Run it

Requires **Node 20+**. No `npm install` is needed to build or develop.

```bash
npm run dev      # build + serve on http://localhost:4173, rebuilds when you save
npm run build    # write the site to dist/
npm run check    # verify links, #anchors, alt text, one <h1> per page, no phone numbers
npm run preview  # a portable copy in preview/site/ with relative links, for sharing a draft
```

The preview copy opens from any folder or file host. It ships two image sizes instead of four,
leaves out the redirect pages, links out to the live demos instead of embedding them, and its
contact form shows a note instead of sending.

To add or replace images you'll also need the one dev dependency (`sharp`):

```bash
npm install
npm run images   # turns assets-src/** into responsive WebP in public/img/
```

## How it's built

Plain HTML, CSS and JavaScript with no framework. A small Node script (`scripts/build.mjs`)
renders the pages from data and templates, so the menu, footer and styles live in one place
instead of being pasted into every page.

```
src/
  data/          ← edit content here
    site.js        name, the menu, the four kinds of work, channels, the Links page
    projects.js    every project: software, research, design
    archive.js     roles, awards, science-fair record, skills
    photos.js      photographs, the photo collections, the CAD model
    about.js       the About Me story and "Currently"
  templates/     ← page layouts (JS template literals, auto-escaped)
    layout.js      <head>, the menu bar, the phone menu, the "Let's build something" band, the footer
    line-art.js    the big train
    city.js        the city at night (img/line/city-*.svg, lights-*.svg) and the platform floor
    tickets.js     the ticket covers (a poster per destination) and the small train
    partials.js    page heads, back links, cards, tiles, previous/next, figures, facts
    pages/*.js     home, category, project, just-for-fun, about, contact, links, demos, 404
    routes.js      every URL the build writes + redirects for old URLs
  styles/        ← numbered CSS partials, concatenated in order (01-tokens.css holds the colours)
  scripts/       ← browser JavaScript (native ES modules)
    main.js        the menu, filters, image viewer, email, demos; loads page modules on demand
    core/line.js   the menu-bar train, the end of the line, the express, the night sky
    core/sound.js  the express's horn and the rush of air (Web Audio, no sound files)
    modules/       train.js (the train leaving as you scroll), city.js (the city's depth as you
                   scroll or move the mouse), board.js (split-flap), tickets.js (tilt and
                   punched tickets), contact.js (the form)
public/          ← copied as-is: the font, optimised images, favicons, docs/ (résumé and CV)
assets-src/      ← original images (git-ignored); feed for `npm run images`
scripts/         ← build, dev server, checks, image pipeline
```

### Common edits

- **Change a fact or a sentence:** edit the matching file in `src/data/`. Everything on the site
  comes from there. Education, the research interest and Tesh Technology are in `about.js`; the
  languages and tools are `tools` in `archive.js`.
- **Add a project:** add an entry to `src/data/projects.js` with a `layout` (`software`,
  `research`, `design` or `fun`). Projects appear in the order they're listed.
- **Fill in a project page:** every page has Overview, Highlights, How I made it and What I
  learned. Their content is the project's `body`, `highlights`, `process` and `learned`; most of
  the extra detail lives in the `DETAILS` list near the end of `projects.js`. A section with
  nothing in it yet shows "coming soon" until it's filled in.
- **Add photographs:** put the originals in `assets-src/photo/<collection>/`, run `npm run images`,
  then add them to `frames` in `src/data/photos.js` with the `set` (collection) they belong to.
  The collection page and its ticket fill themselves in, and the mystery ticket deals from every
  collection. EXIF and GPS data are stripped automatically. The collections are France,
  Switzerland, Italy, Austria, Czechia, Germany, Florida, Cars and Other (the old TSA collection,
  whose URL redirects to `/photography-other/`).
- **Change what the home page shows:** the lists at the top of `src/templates/pages/home.js`
  pick the four featured projects, the current roles and the selected awards. The picture on
  each kind-of-work tile is its `cover` in `src/data/site.js`.
- **Change a colour:** `src/styles/01-tokens.css`. The light greys are `--bg`, `--bg-2` and
  `--card`; the charcoal frame's values are under `.tone-dark`. Pink fills are `--pink`; pink
  words and links are `--pink-text` (darker on light grey so it stays readable).
- **Résumé and CV:** `public/docs/BurgeEshunResume.pdf` and `public/docs/BurgeEshunCV.pdf`. The
  links in the footer and on About Me appear only while those files exist. The copies here have
  the home address and phone number removed.

## Motion and accessibility

- On the home page the train (a maglev: silver over graphite, a neon pink stripe, floating on a
  pink glow) glides in to the platform with its headlamps on. Once it stops the cabins brighten,
  the doors slide open and light spills onto the platform; every few seconds a pulse of light
  runs along the stripe. Scroll down and the doors close and it pulls away to the right; scroll
  back up and it's waiting again.
- Behind it, the city at night rises over the words: the far side of town pale in the haze,
  downtown's glass and stone towers (a spire, stepped setbacks, an Art Deco crown, floodlit
  crowns, slanted and pyramid tops), and the blocks just behind the platform, with water tanks on
  their roofs. The towers have a lit side and a dark side, floors lit the way offices and flats
  are at night, and red aircraft lights that blink; the city glows pink at its foot and is
  reflected in the platform floor. The three layers drift apart as you scroll or move the mouse,
  so the city has depth. It's drawn at build time (`src/templates/city.js`): change a layer's
  colours, window grid, how its floors are lit or the height of the skyline in `LAYERS`. The
  same city stands behind every main page's title and each collection's ticket, and a quieter
  strip of it runs along the call to action, the 404 and the footer.
- Images open larger in a viewer (arrow keys, swipe, Esc). Filters on the category pages are
  buttons. The phone menu traps focus and closes with Esc.
- Easter eggs: type “choo” (or the Konami code) on any page for an express; visit after 7 pm for stars over the city; tickets for the
  collections you've visited get punched (remembered in your browser only); the console says
  hello. Sound only ever plays after a key is pressed.
- With `prefers-reduced-motion` nothing moves. Nothing waits to be scrolled into view: every page
  is complete as soon as it loads. Without JavaScript every page still reads in full, the Menu
  button still opens the menu, and the filters and the demo "Load" button simply don't appear.
- A page opened from a link starts at its top (or at its `#anchor`), even inside a frame that
  tries to put the previous page's scroll position back (a small inline script in `layout.js`;
  it lets go as soon as the reader scrolls, taps or types).
- Text is at least 16px everywhere; body text is 18px. Every colour pair meets WCAG AA contrast.

## Deploying

The repo includes `.github/workflows/deploy.yml`. It builds the site, runs `npm run check`
and publishes `dist/` to **GitHub Pages** every time `main` changes.

1. Push this folder to a new GitHub repository.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. **Custom domain (eshun.net):** under Settings → Pages, enter `eshun.net`. Then, in
   Cloudflare DNS, replace the records that point at WordPress with the
   [GitHub Pages records](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
   Do this last, once you're happy with the preview.
4. **No custom domain yet?** The site will live at `https://<user>.github.io/<repo>/`. Add a
   repository variable `BASE_PATH` set to `/<repo>/` (Settings → Secrets and variables →
   Actions → Variables) so every link includes that prefix.

`dist/` is plain static files, so Cloudflare Pages, Netlify or Vercel work too: use build
command `node scripts/build.mjs` and output directory `dist`.

## Credits

- Type: Archivo (SIL Open Font License), self-hosted from `public/fonts/`.
- Photographs, screenshots, design work and project write-ups are by Eshun Burge, taken from the
  previous eshun.net, its media library, her résumé and CV, and her GitHub repositories (Aflare,
  BlockSAT, GreenerPick, TheGoats, ramble-ventures-marketing and FlipCards). The train and the
  city behind it were drawn for this redesign.

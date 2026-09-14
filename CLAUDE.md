# Project context

Personal site for Gunnar Bozentko (CSCI 498E/598E Project 1). Plain HTML/CSS/JS,
no build step, deployed via GitHub Pages from `main` at the repo root.

Repo must stay named `GunnarBozentko.github.io` — renaming it breaks every
relative path and moves the site off the root URL.

## Who this is for

BS Statistics, Colorado School of Mines, magna cum laude, Aug 2022–May 2026.
Now in the 4+1 Data Science graduate program there. Arsenal FC supporter, plays
soccer, skis and is logging every place skied.

## Site structure

- `index.html` — About/home: bio, hobby tags, fun facts, links to the other
  two pages.
- `skiing.html` + `skiing.js` — renders `data/ski-log.csv` as an interactive
  Leaflet map (dark Esri tiles, star marker on the highest-elevation resort),
  a horizontal elevation bar chart, and the original table — in that order.
  Map/chart dedup rows by resort name (`buildResorts()`); the table still
  renders raw per-visit rows. Each of the three sections independently shows
  its own empty-state if it doesn't have enough data yet (see the
  degradation table in the plan file, or just read `skiing.js` — it's
  short).
- `resume.html` + `resume.js` — renders `data/resume.csv` grouped by
  `section`. Generic — adding a new `section` value in the CSV (e.g.
  "Projects") just works, no code change needed.
- `csv.js` — shared minimal CSV parser (handles quoted fields), used by both
  data pages. Don't duplicate this logic per-page.
- `style.css` — single stylesheet, dark theme, shared by all pages.

**Leaflet**: loaded via CDN (`unpkg.com/leaflet@1.9.4`, SRI-hashed) in
`skiing.html` only. Tile provider is Esri "World Dark Gray Base"
(`server.arcgisonline.com/.../World_Dark_Gray_Base/...`), not the more
commonly-recommended CARTO dark tiles — CARTO now requires an API key (see
`TROUBLESHOOTING.md`, 2026-09-10 entry). If Esri ever breaks the same way,
that entry documents how to re-check and what to look for.

Both data pages fetch their CSV client-side, so **content updates never require
touching HTML/JS** — just edit the CSV. This only works served over http(s)
(`python3 -m http.server 8000` or the live Pages URL); opening the HTML files
directly via `file://` will fail fetch() with a CORS-style error, by design of
the browser, not a bug.

## Design system

- **Palette**: dark theme (`--bg: #0b0d10`, `--surface: #14171c`). One accent,
  Arsenal red (`--accent: #ff4d4d` for links, `--accent-strong: #ef0107` for
  the solid button) — used sparingly, per RESOURCES.md rule 5. Don't add more
  colors without a reason.
- **Type**: Space Grotesk (headings/wordmark/dates) + Inter (body), loaded via
  Google Fonts `<link>` in every page's `<head>`. Big scale jumps (h1 ~3.5rem
  vs body 1.125rem), per RESOURCES.md rule 4.
- **Spacing**: 8px scale via CSS custom properties (`--space-1` through
  `--space-12`). Use these, not arbitrary values.
- **Line length**: capped at 65ch (75ch on the two data pages, via
  `main.wide`) — keep this on any new page.

## Data files

- `data/ski-log.csv` — columns: `resort, state_or_country, date, notes, lat,
  lon, elevation_ft`. Currently empty (header only). `lat`/`lon` are decimal
  degrees; `elevation_ft` is a plain integer (no unit suffix, stays
  numeric). Rows can be added incrementally with some fields blank — the
  map/chart skip what they can't use and the table always shows everything.
- `data/resume.csv` — columns: `section, title, organization, location,
  start_date, end_date, description` (description bullets separated by `;`).
  Filled in with real content: Education, Experience (NAWCAD AI Engineer
  internship, Wiland internship, Mines TA role), Projects, Skills, Awards
  (DOD SMART Scholarship, Presidential Scholar, UBS Scholarship).

## Status as of 2026-09-10

Done:
- Repo scaffolding, `.nojekyll`, GitHub Pages live and confirmed working.
- Three-page structure + dark design system built and locally verified.
- Ski page v2 built: interactive dark map (Leaflet + Esri tiles), star
  marker + matching star glyph on the highest-elevation resort, elevation
  bar chart, original table kept for date/notes detail. Verified with
  temporary test data in a real browser, then reverted to header-only
  before committing (no fake resorts in the committed CSV).
- `data/resume.csv` filled in via interview with real work history, awards,
  and projects (source: an old resume PDF the user shared plus a new 2026
  NAWCAD internship described in chat). Confirmed with the user in-browser.
- Fun facts added to `index.html` (dogs/cat, club soccer, hobbies, favorite
  Arsenal player, Rubik's cube, Rocket League rank) via interview.
- LinkedIn link added to the footer on all three pages.
- `TROUBLESHOOTING.md` started, four real entries logged.
- `data/ski-log.csv` has real rows now: Stratton Mountain (2009–2026),
  Copper Mountain (2022–2025), Jackson Hole (2025–2026).
- Resume content revised via interview: added real Mines coursework (MATH
  538, DSCI 570/560/561, CSCI 598, MATH 440 w/ OpenMP+MPI), dropped the
  activities line, added Shapely and an "Agentic AI Tools" skill (Claude
  Code, GitHub Copilot), filled in award dates, and removed the UBS
  Scholarship and Presidential Scholar entries (the latter cut specifically
  to make the one-page PDF fit).
- **PDF resume**: built. `resume-print.html` + `resume-print.js` render a
  print-styled, light-background view of `data/resume.csv` (same data
  source as `resume.html`, so it can't drift) with a contact header
  (phone/email/LinkedIn/GitHub) and a "Download / Print PDF" button that
  calls `window.print()`. Linked from `resume.html` via a "Download PDF"
  button. Verified in a real browser and with actual `--print-to-pdf`
  output — fits on one page as of 2026-09-13.

Not done yet:
- No real photo yet — `index.html` references `assets/photo.jpg`, which
  doesn't exist. The `<img>` fails gracefully (hides itself via `onerror`)
  until it's added.
- `DECISIONS.md` is still unanswered (all five questions are placeholders).
  Q2 (fork in the road) has real material now — interactive Leaflet map vs.
  a simpler static graphic — but the user should write the answer
  themselves, not have it filled in for them.
- `verification/` folder doesn't exist yet — per README.md, this is a
  one-time deliverable done near the end, not something to update on every
  change.
- No video yet.

## Future design direction (hero shell)

The user shared a reference image they like for a future redesign of the
homepage hero/shell: a dark, cinematic hero with a **low-poly wireframe
mountain** as the centerpiece — a triangulated mesh/constellation made of
connected dots and thin lines (like a 3D point-cloud or network-graph
render of a mountain ridge), glowing warm-orange accent dots at some
vertices, set against near-black. Minimal top nav, a two-column text
block flanking the mountain (headline + short copy on one side, a stat or
secondary blurb on the other), and a row of small feature/stat blocks
along the bottom.

Why it's a good fit here specifically: the low-poly mountain visual
maps directly onto the ski theme (elevation, peaks, the star-marker
motif already used on the ski map), so it's not just "look cool," it's
on-brand. This is a bigger visual swing than the current clean-but-safe
shell (see the "does this look AI-generated" conversation from
2026-09-10) — a good candidate for the site's "one bold move" if/when
the user wants to revisit the shell. Likely implementation: an SVG or
canvas-drawn low-poly mesh (hand-built points/triangles, or a small
generative script), not a photo — keep it as inline SVG/CSS to stay
build-step-free. Don't start this unprompted; the user will bring it up
when ready.

## Working conventions

- This is a class assignment: judgment and process matter more than the
  code. Don't over-scope — three pages, no framework, no build step, is the
  deliberate choice (see DECISIONS.md fork-in-the-road question once
  answered).
- Verify claims before reporting them done: curl routes, trace parser logic,
  actually load pages. See README.md's "never trust an agent result you have
  not given it a way to check."

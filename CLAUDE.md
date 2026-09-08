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

- `index.html` — About/home: bio, hobby tags, links to the other two pages.
- `skiing.html` + `skiing.js` — renders `data/ski-log.csv` as a table.
- `resume.html` + `resume.js` — renders `data/resume.csv` grouped by `section`.
- `csv.js` — shared minimal CSV parser (handles quoted fields), used by both
  data pages. Don't duplicate this logic per-page.
- `style.css` — single stylesheet, dark theme, shared by all pages.

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

- `data/ski-log.csv` — columns: `resort, state_or_country, date, notes`.
  Currently empty (header only). User fills this in over time.
- `data/resume.csv` — columns: `section, title, organization, location,
  start_date, end_date, description` (description bullets separated by `;`).
  Education rows are filled in; Experience/Skills/Awards are placeholders.

## Status as of 2026-09-08

Done:
- Repo scaffolding, `.nojekyll`, GitHub Pages live and confirmed working.
- Three-page structure + dark design system built and locally verified
  (all routes 200, CSV parser logic traced correct, empty-states render).
- Placeholder CSVs created for ski log and resume.

Not done yet:
- `data/ski-log.csv` and `data/resume.csv` still need to be filled in by
  the user (they know their own history better than an agent should guess).
- No real photo yet — `index.html` references `assets/photo.jpg`, which
  doesn't exist. The `<img>` fails gracefully (hides itself via `onerror`)
  until it's added.
- Ski *map* (visual, pins on a map) is a deliberate v2 — the CSV table is
  the v1. Don't build the map unprompted; ask what mapping approach the user
  wants (Leaflet + free tile layer is the likely fit for a no-build static
  site) when they're ready for it.
- `DECISIONS.md` is still unanswered (all five questions are placeholders).
- `verification/` folder doesn't exist yet — per README.md, this is a
  one-time deliverable done near the end, not something to update on every
  change.
- No video yet.

## Working conventions

- This is a class assignment: judgment and process matter more than the
  code. Don't over-scope — three pages, no framework, no build step, is the
  deliberate choice (see DECISIONS.md fork-in-the-road question once
  answered).
- Verify claims before reporting them done: curl routes, trace parser logic,
  actually load pages. See README.md's "never trust an agent result you have
  not given it a way to check."

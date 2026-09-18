# Troubleshooting log

Running notes on things that broke, why, and how they got fixed. Not a
graded deliverable — just a working log so the same issue doesn't cost
twice the time the second time. See `README.md`'s "When it breaks"
section for the common, expected failure modes; this file is for
anything encountered beyond those.

---

## 2026-09-08 — Live site showed unstyled page (no dark theme, no accent color)

**What happened:** Pushed the dark-theme redesign, opened
`https://gunnarbozentko.github.io` in an already-open browser tab, and
saw a plain black-and-white unstyled page — bulleted nav, default link
colors, no fonts, no accent red.

**How it was diagnosed:** `curl`'d the live URLs directly. `style.css`
returned 200 and its content matched what was pushed, so the deploy
itself was correct — the problem was isolated to that one browser tab.

**Fix:** Hard refresh (`Ctrl+Shift+R`). Confirmed working after.

**Cause:** Stale browser cache in that tab — matches the README's
warning that GitHub Pages / browsers can cache for up to ~10 minutes.
An incognito window would have shown the same thing without needing
the reasoning above.

---

## 2026-09-10 — CARTO's free dark map tiles now require an API key

**What happened:** While planning the ski map feature, the obvious
choice for a free no-signup dark basemap was CARTO's well-known
`basemaps.cartocdn.com/dark_all/...` tile URL — it's the answer in
most tutorials. Curled a tile directly before writing any code and
got back an "API KEY REQUIRED" watermark image instead of an actual
map tile.

**How it was caught:** Verified the tile provider live with `curl`
before committing to it in code, rather than trusting memory/docs.
Also checked Stadia Maps as a second common alternative — it returned
HTTP 401 without a registered API key, so it's not a real no-signup
option either despite its reputation.

**Fix:** Used Esri's "World Dark Gray Base" tiles instead
(`server.arcgisonline.com/.../World_Dark_Gray_Base/...`) — confirmed
live with `curl` to return real 200 image tiles, no key required.
It's a medium-dark neutral gray rather than pure black, so it's not a
pixel-perfect match to the site's `--bg`, but it reads as "dark theme."

**Cause:** Free tile providers change their terms over time; a
provider being free and keyless as of when a tutorial or guide was
written doesn't mean it still is. Whenever the code depends on a
third-party service, verify it live before/while implementing, not
just from documentation or training data.

---

## 2026-09-13 — Headless Chrome PDF page counts were misleading while tuning `resume-print.html`

**What happened:** While tightening the print CSS in `resume-print.html`
to fit the resume on one page, repeated `chrome --headless
--print-to-pdf` runs kept showing 2 pages even after several rounds of
shrinking fonts and spacing, with the overflow amount not shrinking
proportionally to the CSS changes.

**How it was diagnosed:** Extracted actual page text with `pypdf`
instead of trusting a page count alone. Command-line `--print-to-pdf`
was applying Chrome's default print-dialog behavior — a date/title/URL
header and footer on every page — which the page's own `@page` CSS
margin doesn't suppress from the command line (a `--print-to-pdf-no-header`
flag exists but had no effect on this Chrome build). That ate real
vertical space on every test render.

**Fix:** Stopped trying to fully automate the fit-to-one-page
verification and instead cut content (removed a resume entry) to get
real margin, then confirmed with `pypdf` page-text extraction that the
final content itself (not just page count) ends on page 1.

**Cause:** A person using the actual "Download / Print PDF" button
gets Chrome's normal print dialog, where "Headers and footers" is a
visible checkbox they control — so this discrepancy is specific to
headless/scripted PDF generation, not something end users will
necessarily hit. Worth knowing if this page's print CSS gets tuned
again: don't trust a headless page-count alone as ground truth.

---

## 2026-09-18 — `chrome --window-size` silently gave the wrong viewport during mobile testing

**What happened:** While checking the homepage at a 375px mobile
width, a headless Chrome screenshot taken with `--window-size=375,900`
showed the nav and hero paragraph clipped mid-word at the right edge,
looking exactly like a horizontal-overflow bug.

**How it was diagnosed:** Before "fixing" anything, queried the actual
rendered viewport with `document.documentElement.clientWidth` over the
DevTools Protocol — it came back `489`, not `375`. The `--window-size`
flag wasn't being honored by that Chrome build, so the screenshot was
a 375px-wide crop of a wider, correctly-laid-out page, not the mobile
page itself.

**Fix:** Used `Emulation.setDeviceMetricsOverride` over CDP instead of
the command-line flag to force a true 375px viewport. Re-tested: zero
horizontal overflow (`scrollWidth === clientWidth === 375`) on all
three pages.

**Cause:** Same lesson as the 2026-09-13 PDF entry — a headless Chrome
flag's stated behavior isn't ground truth until the actual rendered
state is queried. `--window-size` looked correct (no error, screenshot
produced) while silently measuring the wrong thing.

---

## 2026-09-18 — Fact-wheel tap on mobile appeared to do nothing

**What happened:** On a touch device, tapping a segment in the "Fun
facts" wheel briefly seemed to work and then immediately reverted to
the center name face, so it looked like tapping did nothing at all.

**How it was diagnosed:** Simulated a real touch tap over CDP
(`Input.dispatchTouchEvent`) and confirmed the fact *did* display right
after the tap. It only reverted when a synthetic `mouseleave`-style
event followed shortly after — mobile browsers commonly fire ghost
hover/leave events right after a tap for elements with `:hover`
behavior, which was cancelling the tap's own effect almost instantly.

**Fix:** Added a `pinned` state in `facts-wheel.js` — a tapped segment
stays shown regardless of hover/blur events until the same segment is
tapped again or a different one is chosen. Desktop hover-preview
behavior is unchanged.

**Cause:** The original interaction model was hover-only (`mouseenter`
/ `mouseleave`) with click just re-using the same show function, with
no accounting for touch devices synthesizing mouse events after a tap.

---

## 2026-09-18 — Fun facts with no real photo yet showed no text either

**What happened:** On the mobile accordion view of "Fun facts",
expanding Rubik's cube, Rocket League, or Golf showed nothing at all,
while Pets/Soccer/Arsenal/Hobbies (which have real photos) worked
fine.

**How it was diagnosed:** User reported the specific broken entries
directly. Inspecting the generated markup in `facts-wheel.js` showed
the `<img>`'s `onerror` handler was `this.parentElement.style.display
= 'none'` — hiding the whole `.facts-list__body` wrapper, which also
contains the fact's `<p>` text, not just the broken image.

**Fix:** Changed the handler to `this.style.display = 'none'`, so a
missing photo only hides itself, matching the pattern already used for
the hero avatar and the Interests photo grid.

**Cause:** Copy-paste inconsistency between the working "hide only the
image" pattern used elsewhere and this one spot, which hid the whole
container instead. Only visible for facts without a photo file yet, so
it didn't show up until real content (a text-only fact) hit that
code path.

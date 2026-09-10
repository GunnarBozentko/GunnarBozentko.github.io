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

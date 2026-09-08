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

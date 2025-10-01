# TT Racing — GitHub Pages Package

This zip contains:
- `index.html` — your saved portal (v13.7) with a tiny auto-loader that reads `data.json`.
- `data.json` — your latest race results (this week).
- `README.md` — these instructions.

## How to update your GitHub repo

1) On GitHub, open your repo (e.g., `rotang90/TT-Racing` or your chosen one).
2) Click **Add file → Upload files**.
3) Drag-and-drop the three files from this zip (`index.html`, `data.json`, `README.md`) into the repo root. Confirm **Commit changes**.
4) Make sure **Settings → Pages** is set to **Deploy from a branch → main → /(root)**.
5) Visit your site:
   - Normal load: `https://<your-username>.github.io/<your-repo>/`
   - **Force refresh from data.json** after you’ve updated results: append `?refresh=1`
     - Example: `https://<your-username>.github.io/<your-repo>/?refresh=1`
     - This seeds localStorage from the newest `data.json` and reloads once so the table reflects the latest results immediately.

## Notes

- Day-to-day visits (without `?refresh=1`) keep whatever is already saved in the browser’s local storage (fast for your friends).
- Any time you upload a new `data.json`, just revisit with `?refresh=1` once to push the new data to everyone (their first load after your update will refresh to the new data).

Enjoy and ping me if you want this to always hard-load from `data.json` (read-only viewer) instead of using local storage.
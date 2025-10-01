# TT Racing League — Read-Only Portal (v15.1)

This is a **read‑only** viewer for your TT Racing League data. It pulls `data.json` from the same folder (GitHub repo root) and lets visitors click between **tabs** and **seasons** without being able to edit anything.

## 🧩 Files
- `index.html` — the app shell
- `styles.css` — minimal styling
- `app.js` — fetches data and renders tabs/season UI
- `data.json` — your league data (you can overwrite this with your latest export)

## 🚀 One‑time GitHub Pages setup
1. Create a **new repository** on GitHub (e.g., `TT-Racing-Portal`).
2. **Upload** all files from this folder (`index.html`, `styles.css`, `app.js`, `data.json`).
3. Commit the changes.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
6. Set **Branch** to `main` and **/ (root)**. Save.
7. After it builds, your site will be live at a URL like:  
   `https://<your-username>.github.io/TT-Racing-Portal/`

> If the page shows but there’s **no data**, make sure `data.json` exists in the **same folder** as `index.html` in the repo, and refresh the page (hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`).

## 🔁 Updating your data later
1. Export or prepare your latest `data.json`.
2. In your GitHub repo, click **Add file → Upload files**, and upload the new `data.json` (replacing the old one).
3. Commit. Refresh your GitHub Pages site.

## 📝 Notes
- The portal uses only static files (HTML/CSS/JS) and works on GitHub Pages.
- JSON keys used: `seasons[]`, `activeSeasonIndex`, `drivers`, `schedule`, `results`, `points`, and optional flags `qDNP`, `dnf`, `includeInStats`, and per‑race `adjustments`.
- **DNF / DNP handling**: If a driver has `dnf: true` for a race, they earn **0 race points**. If `qDNP: true`, they earn **0 qualifying points** for that race.
- **includeInStats** (per schedule item): if `false`, that round is excluded from standings calculations; if the flag is missing, the round is counted.

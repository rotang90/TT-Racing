# TT Racing — Read‑Only Viewer

This build keeps your portal's look, keeps **Theme**, allows switching **Season** and **Tabs**, but blocks edits:
- Hidden: New/Clone/Rename/Reorder/Delete Season, Import.
- Disabled: inputs, checkboxes, drag/drop on Results/Drivers.
- Always fetches `data.json` and reloads when it changes.

## Deploy
1) Upload `index.html` and `data.json` (replace) to your repo root and commit to `main`.
2) Ensure GitHub Pages → Deploy from branch → `main` → root.
3) Share the Pages URL. A badge bottom-left shows “Read-only viewer” and last sync time.

Tip: After you upload a new `data.json`, open the site once with `?v=2` to nudge caches.
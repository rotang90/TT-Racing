# TT Racing — Always-Up-To-Date Viewer

This package **always checks** `data.json` and reloads the page if your results changed, so your friends see the latest automatically.

## Deploy
1) Upload `index.html` and `data.json` to your repo root (replace existing).
2) Commit to `main`. Ensure GitHub Pages is set to Deploy from branch → `main` → root.
3) Visit your site normally. The page will auto-sync to the newest results.

## Manual refresh
There is a **Refresh Data** button (bottom-right). Clicking it forces a check now.

## Troubleshooting (friends not seeing updates)
- Have them hard-reload: Windows `Ctrl+Shift+R`, Mac `Cmd+Shift+R`.
- Or clear storage for the site: open DevTools → Application/Storage → Clear site data.
- Direct link to trigger clean load: add `?v=` with a new number, e.g., `...?v=2`.

This viewer stores a small meta hash of your `data.json`. When your JSON changes, everyone’s page updates itself.
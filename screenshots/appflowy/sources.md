# AppFlowy — official image sources

Recorded before commit, per REQ-007 / AC-008. Every image below was fetched from a domain on the
approved list (`appflowy.io` redirects permanently to `appflowy.com`, which the operator's list
names as `appflowy.io`; `docs.appflowy.io`; `github.com/AppFlowy-IO`) on 2026-09-05. None required a
login; nothing behind a paywall or account was touched.

## Licence position

AppFlowy's `appflowy.com/terms` page carries no explicit media-reuse or press-kit grant (checked
2026-09-05; no "trademark" or "screenshot licence" clause beyond a generic structured-data
`screenshot` field pointing at their own OG image). AppFlowy's client code is open source
(AGPL-3.0), but that licenses the software, not the marketing imagery or blog illustrations, which
are separate assets. **Position: terms unclear.** Each file below is a marketing or blog image
AppFlowy itself serves publicly to represent its own product; it is committed here for internal,
non-commercial product-comparison reference, sourced and attributed by URL, not represented as
freely licensed. If a stricter reading is wanted, the fix is to delete the four files and keep only
this citation list — nothing else in the packet depends on the bytes being present.

## Images

| File | Shows | Source URL | Fetched | Note |
|------|-------|------------|---------|------|
| `appflowy-board-official.webp` | Kanban/board view ("Project Tracker" demo) | https://appflowy.com/ (homepage asset `project-tracking.94a5c1eb.webp`) | 2026-09-05 | Current marketing render, live homepage at fetch time |
| `appflowy-table-official.webp` | Grid/table view ("Core Engineering Tasks" demo) | https://appflowy.com/ (homepage asset `projects.f2c7abf3.webp`) | 2026-09-05 | Current marketing render, live homepage at fetch time |
| `appflowy-calendar-official.png` | Calendar view (month grid, "Book List" demo) | https://appflowy.com/blog/creating-a-calendar-view-for-the-appflowy-database | 2026-09-05 | From a 2023 AppFlowy blog post about building the calendar view. UI chrome is visibly older than the installed 0.14.1 build — kept because it is the only official calendar image found on an approved domain; the installed-app capture in this same folder shows the current UI |
| `appflowy-properties-official.png` | Record-detail / property-editing popup | https://appflowy.com/blog/creating-a-calendar-view-for-the-appflowy-database | 2026-09-05 | Same 2023 post, same UI-age caveat as the calendar image above |

The GitHub README (`raw.githubusercontent.com/AppFlowy-IO/AppFlowy/main/README.md`) embeds board and
grid screenshots at `appflowy.com/_next/static/media/tasks.*.png` and `.../Grid.*.png`, but those
Next.js build-hashed paths had already rotated off the live site by the time of fetch (verified
404 on 2026-09-05) — the README itself is stale against the current deploy. The homepage versions
above were fetched live instead and show the same views.

## Views not found on an approved domain

- **Gallery**: `appflowy.com/terms`'s structured data lists "Grid, Kanban, Calendar, Gallery, List,
  Feed, Chart" as database views, so the product has one, but no official gallery screenshot was
  found on `appflowy.com`, `docs.appflowy.io`, or the GitHub README within the time spent searching.
  Not fetched. The installed-app capture in this folder covers it if the local build exposes the
  view.
- **Timeline / gantt**: not listed among AppFlowy's own database-view names anywhere checked
  (homepage, terms structured data, docs, README). Recorded as **not applicable** — the product does
  not have this view.

# Anytype mobile — official image sources

Every image in this folder was fetched anonymously (no login, nothing behind a paywall or
account) from a domain on the approved list — `apps.apple.com` (via Apple's public iTunes
Search/Lookup API, which serves the same App Store listing assets), `play.google.com`, and
`github.com/anyproto` — on 2026-09-05. Screenshots were requested at their native resolution
(the store CDN's unscaled `0x0ss`/`=s0` variant); nothing here is upscaled or edited.

## App identity confirmed before fetching

Both stores list the same app: bundle/package id `io.anytype.app`, developer "Any Association",
named "Anytype - The Everything App" (App Store) / "Anytype" (Google Play). Confirmed via
`https://itunes.apple.com/lookup?id=6449487029&country=us` (`trackId 6449487029`, `bundleId
io.anytype.app`) before any image was fetched — a same-named "Anytype for Business" listing
(`id6787477074`) exists and was excluded as a different, non-consumer app.

## Licence position

**Position: terms unclear**, same as the desktop `screenshots/anytype/sources.md` finding —
`anytype.io/terms`, `anytype.io/press`, and `anytype.io/brand` all 404, and no App Store/Play
Store terms-of-service grant redistribution of listing assets. The one partial exception: the
`github` rows below come from `anyproto/anytype-swift`, a repo carrying its own `LICENSE.md`
("Any Source Available License 1.0"). That license explicitly covers "the Software"; it does not
say whether `docs/` README image assets count as "the Software", so this is not treated as a
clearer grant — the same "terms unclear, retained for internal comparison" position applies to
every file below. Each image is committed for internal, non-commercial product-comparison
reference inside this repository, sourced and attributed by URL, not represented as freely
licensed. If a stricter reading is wanted, the fix is to delete the 20 files and keep only this
citation list — nothing else in the packet depends on the bytes being present.

## Images

### iOS — Apple App Store (apps.apple.com)

Fetched via the public iTunes Lookup API (`itunes.apple.com/lookup?id=6449487029`), which mirrors
the same `screenshotUrls` shown on the listing page itself; each URL's `bb.jpg` size suffix was
replaced with `0x0ss.jpg` to get the CDN's native (not upscaled) resolution, confirmed at
1242×2208 per file.

| File | Shows | Source URL (listing) | Fetched |
|------|-------|------------------------|---------|
| `anytype-mobile-official-ios-01-hero.png` | Title card: "Life without the cloud — No lock-in, No middleman" | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-02-objecttypes.png` | Object-type list: Chats, Notes, Bookmarks, Tasks, Files — "End-to-End encrypted / Peer-To-Peer synced / Works offline" | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-03-spaces.png` | "Share in channels, keep life separate" — the Spaces list | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-04-chats.png` | "Chats that do more" — a chat thread with inline tasks/notes | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-05-pages.png` | "Build pages your way" — a page mixing text, a table, and a quick-view block | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-06-lists.png` | "Make lists" — a Meal Plan list with typed columns | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |
| `anytype-mobile-official-ios-07-organize.png` | "Everything in its place" — sidebar of pages/lists/files | https://apps.apple.com/us/app/anytype-the-everything-app/id6449487029 | 2026-09-05 |

### Android — Google Play (play.google.com)

Fetched by parsing the public listing page's screenshot `<img srcset>` entries
(`data-screenshot-index="0"`..`"6"`) and requesting each base image id at `=s0` (native
resolution, no explicit upscale), confirmed at 1080×1920 per file. Same seven subjects as the
iOS set — Google Play and the App Store use the same marketing creative, re-exported per store.

| File | Shows | Source URL (listing) | Fetched |
|------|-------|------------------------|---------|
| `anytype-mobile-official-android-01-hero.png` | Title card: "Life without the cloud — No lock-in, No middleman" | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-02-objecttypes.png` | Object-type list: Chats, Notes, Bookmarks, Tasks, Files | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-03-spaces.png` | "Share in channels, keep life separate" — the Spaces list | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-04-chats.png` | "Chats that do more" — a chat thread with inline tasks/notes | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-05-pages.png` | "Build pages your way" — a page mixing text, a table, and a quick-view block | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-06-lists.png` | "Make lists" — a Meal Plan list with typed columns | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |
| `anytype-mobile-official-android-07-organize.png` | "Everything in its place" — sidebar of pages/lists/files | https://play.google.com/store/apps/details?id=io.anytype.app | 2026-09-05 |

### GitHub — anyproto/anytype-swift README (github.com/anyproto)

Fetched from `docs/assets/screenshots/` in the `anyproto/anytype-swift` repo (the official iOS
client's source), confirmed embedded live in that repo's own `README.md` "Screenshots" section
(`develop` branch) before fetching — a 7th asset in the same folder, `01-features.png`, is
present but **not referenced by the README** and was excluded as not clearly used, per the "skip
anything not clearly official" rule. Native resolution, 1242×2688 per file (iPhone Pro Max frame,
larger than the App Store's own listing export of the same creative).

| File | Shows | Source URL | Fetched |
|------|-------|------------|---------|
| `anytype-mobile-official-github-01-hero.png` | Same "Life without the cloud" title card, from `docs/assets/screenshots/00-hero.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |
| `anytype-mobile-official-github-02-spaces.png` | Same Spaces card, from `docs/assets/screenshots/02-spaces.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |
| `anytype-mobile-official-github-03-chats.png` | Same Chats card, from `docs/assets/screenshots/03-chats.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |
| `anytype-mobile-official-github-04-pages.png` | Same Pages card, from `docs/assets/screenshots/04-pages.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |
| `anytype-mobile-official-github-05-lists.png` | Same Lists card, from `docs/assets/screenshots/05-lists.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |
| `anytype-mobile-official-github-06-organize.png` | Same Organize card, from `docs/assets/screenshots/06-organize.png` | https://github.com/anyproto/anytype-swift/blob/develop/README.md | 2026-09-05 |

**20 files total, 8.3 MB**: 7 iOS (App Store) + 7 Android (Google Play) + 6 GitHub (anytype-swift
README) — well under the 40 MB budget for this pass. GitHub carries 6, not 7, because its
`objecttypes` equivalent asset is not README-referenced (see above).

## Skipped — not clearly official

- `docs.anytype.io` — searched for a mobile-specific screenshots page; none found (the docs cover
  desktop/web organize/views/properties pages already captured in the sibling `screenshots/
  anytype/` folder). Nothing fetched from this domain for this pass.
- `anytype.io` (marketing site) — no dedicated mobile-app screenshot gallery found distinct from
  the App Store/Play listing creative already captured above.
- `anyproto/anytype-kotlin` — repo confirmed to exist with `docs/` and `fastlane/` directories,
  but neither contains a screenshots folder and the README has no embedded images at all
  (build-instructions only, checked against branch `main`). Nothing fetched for Android from
  GitHub.
- iPad screenshots on the App Store listing (7 available at `ipadScreenshotUrls`) — out of scope:
  the operator asked for **mobile** screenshots, and iPad is a tablet form factor, not phone.
- `anytype-swift`'s `docs/assets/screenshots/01-features.png` — present in the repo but not
  referenced by the live README, so not "clearly official" per this packet's inclusion bar.

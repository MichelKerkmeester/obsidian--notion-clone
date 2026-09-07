# ClickUp — capture index

Everything in this folder is a reference capture for comparing our board, view and property
surfaces against ClickUp. It is not tracked by `tools/screenshots/manifest.json` — see the packet
note at the bottom of this file for why. Unlike the Anytype folder, nothing here was captured from a
locally installed app: every file is a **Mobbin library screenshot**, fetched through the Mobbin MCP
and named so that its Mobbin screen page can be reconstructed from the filename alone.

**6,478 files, 3,435 unique screens** — 357 iOS and 3,078 web, with no screen shared between the two
platforms. Every image is cited by `mobbin_url` in one of the four index files below; citation is
per-file, not per-folder.

## Layout — how to find a capture

Grouped by platform, then by the surface the screen was found under. The filename carries its own
context, so a citation by name resolves without this table:

| Folder | Holds | How to find it |
|--------|-------|-----------------|
| `ios/flows/<journey>/` | 464 files across **112 journeys**, one folder per Mobbin flow, files ordered by Mobbin's own `position` | Pick the journey folder by name (e.g. `creating-a-task-1ba7e785/`); the trailing 8 characters are the flow id |
| `ios/<surface>/` | 79 files — `tasks` (18), `views` (13), `collaboration` (13), `navigation` (9), `menus` (9), `dialogs` (5), `settings` (3), `editors` (3), `ai` (3), `states` (1), `onboarding` (1), `docs` (1) | Anything that is not part of a journey |
| `web/flows/<journey>/` | 3,571 files across **609 journeys**, same shape as iOS | Pick the journey folder by name; trailing 8 characters are the flow id |
| `web/<surface>/` | 2,364 files — `tasks` (491), `settings` (355), `views` (186), `ai` (173), `forms` (142), `chat` (126), `dashboards` (119), `whiteboard` (104), `time-tracking` (89), `database` (88), `onboarding` (75), `docs` (74), `collaboration` (71), `reports` (63), `automations` (57), `menus` (56), `navigation` (40), `extra` (35), `marketing` (10), `dialogs` (9), `states` (1) | Grep the filename prefix for a surface, e.g. `clickup-web-menus-` for every menu capture |

Filenames are `clickup-<platform>-<group>-<slug>-<screenid>.webp` for grouped screens and
`clickup-<platform>-flow-<flow-slug>-<position>-<screenid>.webp` inside a journey. **The screen id is
the last 36 characters before `.webp`**, so the citation for any file is
`https://mobbin.com/screens/<screenid>` — derivable without opening an index.

### Per-file index (citation for every image)

The full per-file tables are split out of this README so it stays readable; together they cover all
6,478 files:

| Index | Rows | Covers |
|-------|------|--------|
| [`index-ios-screens.md`](index-ios-screens.md) | 79 | every grouped iOS screen, with its Mobbin URL |
| [`index-ios-flows.md`](index-ios-flows.md) | 464 | every iOS journey — flow name, Mobbin flow page, Mobbin actions, then each screen in order |
| [`index-web-screens.md`](index-web-screens.md) | 2,364 | every grouped web screen, with its Mobbin URL |
| [`index-web-flows.md`](index-web-flows.md) | 3,571 | every web journey, same shape as the iOS flow index |

## Provenance

- **Source**: [Mobbin](https://mobbin.com), through its official MCP server (`api.mobbin.com/mcp`),
  reached via this repo's Code Mode manual `mobbin`. Read-only tools only — `search_screens` and
  `search_flows`. Nothing was scraped from the website and no page was automated.
- **App pages**: [ClickUp iOS](https://mobbin.com/apps/click-up-ios-1483e5b8-4f27-4bc5-b5c6-30382b3fc2dd/70ff6957-a097-4f2e-a52f-bdbc61d888db/screens)
  · [ClickUp web](https://mobbin.com/apps/click-up-web-e771ffff-184f-43c8-a9e1-5714961e8b8e/f585fd63-bb91-4073-b805-7bbda04af8e2/screens)
- **Capture date**: 2026-09-06, continuing past midnight into 2026-09-07. An earlier leg of the same
  harvest ran on 2026-09-06 evening and was cut short by a session cap; its files were kept and
  extended rather than re-fetched.
- **App version**: **not recorded — Mobbin's MCP tools do not return one.** `search_screens` returns
  only `{ id, image_url, mobbin_url, app_name, platform }` and `search_flows` adds flow name,
  actions and per-screen positions. Any version claim here would be invented, so none is made. The
  web captures show a workspace built for Mobbin's own capture pass ("AS Mobbin", "Alex Smith"), and
  several screens are dated Oct–Nov 2025 in-product.
- **Image format**: `webp`, as returned (`image_format: "webp"`). iOS screens are 299×678, web
  screens 768×521 — Mobbin's own delivery sizes, not re-encoded here. Every file carries Mobbin's
  "ClickUp · curated by Mobbin" footer bar.
- **Credentials**: the operator's existing Mobbin OAuth session, already authorized in this runtime.
  No credential was created, stored or written into this repository.

### Query set

Screens were swept with app-scoped natural-language queries, one surface per query:

| Platform | Screen queries | Journey queries |
|----------|---------------|-----------------|
| iOS | 96 (`ClickUp <surface>` — home, sidebar, search, tab bar, my tasks, list/board/calendar/timeline/table views, task detail, pickers, filters, sorts, group-by, docs, whiteboard, notepad, forms, sheets, menus, inbox, chat, dashboards, goals, sprints, settings, onboarding, templates, AI, empty/error/loading states, paywall, and 8 deliberately broad sweeps) | 132 |
| web | 150 (the same surfaces plus workload, mind map, map, ClickApps, statuses, task types, members, billing, API/webhooks, autopilot agents, command palette, bulk-action bar, toasts, tours) | 132 |

The 132 journey queries per platform were four lists run in sequence: 20 core journeys, 24
follow-ups, 36 finer-grained ones, and **52 mined from Mobbin's own ClickUp action taxonomy** — the
`actions` field on already-harvested flows (`Adding & Creating`, `Editing & Updating`,
`Filtering & Sorting`, `Showing & Hiding`, `Turning On/Off`, `Saving to Collection`, … 53 categories
in all). Querying Mobbin's vocabulary rather than guessed phrasing found 59 web journeys the three
hand-written lists had missed.

**3,110 Mobbin tool calls** are recorded across 96 saved payloads (iOS: 134 deep-mode screen calls,
534 standard-mode, 378 flow calls; web: 403 deep, 1,034 standard, 627 flow), plus four short probe
executions run to establish the method.

## How these were harvested

Every call went through Code Mode (`mcp__code_mode__call_tool_chain`), and each execution ran a
**scripted loop over many queries** rather than one query per model turn — the queries, the
pagination and the rate limiting all live inside the executed JavaScript. Each execution capped
itself at 38 calls with a 3.1 s minimum interval, and at most two executions ran at once, holding
the whole harvest under the documented 60-requests-per-minute limit with margin.

Downloads ran immediately after each execution as a parallel `curl` loop (`xargs -P 8`) over the
returned `image_url` list, so a killed session never lost more than one batch.

### The `deep` vs `standard` finding

`search_screens` takes a `mode`. The first two thirds of this harvest used `mode: "deep"`, which the
tool documents as an AI-scored relevance pipeline. Measured against this app, **`deep` returns a
bounded set of roughly 15 screens per query**: excluding those 15 and asking again returns *nothing*
(verified at exclude-list sizes of 300, 600 and 1,200 — all returned zero). `mode: "standard"`
paginates properly through `exclude_screen_ids`, yielding **up to ~105 screens per query**, about
7× the depth.

So the entire query set was re-swept in `standard` mode. That is also what makes the completeness
claim below measurable rather than assumed.

## Saturation — how we know the sweep is done

The stopping rule was three consecutive queries adding zero new screen ids. Both platforms cleared it
by a wide margin on the final `standard`-mode pass, which re-ran every query at 7× the depth of the
pass that had originally found them:

| Platform | Final-pass calls | Screen rows returned | **New screens** |
|----------|-----------------|----------------------|-----------------|
| iOS | 534 | 6,378 | **0** |
| web | 1,034 | 13,369 | **113** |

The iOS result is the strong one: 96 queries re-run at full depth returned thousands of screen ids
and *every single one was already on disk*. Journey sweeps converged the same way — the final iOS
flow round found 1 new journey across 98 calls, and the final web flow round's yield curve ran
12 → 19 → 6 → 9 → 6 → 7 → 0.

This bounds completeness to **what these two tools expose for these queries**. It is not a claim
that Mobbin's ClickUp library contains exactly 3,435 screens; a surface nobody thought to name in
246 queries would not appear here.

## What the grouping does and does not mean

**Non-flow groups are classified by content; flows stay grouped by flow name.** The harvest
originally filed every non-flow file under the Mobbin query that returned it, and Mobbin's relevance
is loose — an early spot check of ten images found two sitting under a heading their content only
partly matched (a Goals "Type of Target" modal filed under `views/add-view`; an Email Integration
Signatures pane filed under `settings/api`). On 2026-09-07 every one of the 2,443 non-flow files on
both platforms (79 iOS, 2,364 web) was opened individually and reassigned to the group its screen
primarily shows — never the group its originating query implied. 1,669 files moved (51 iOS, 1,618
web); [`reclassification-2026-09-07.tsv`](reclassification-2026-09-07.tsv) records every move with
its old path, new path and a one-line reason. Six web groups from the original query set (`editors`,
`misc`, `empty-states`, `filters`, `notifications`, `upgrade`) emptied out entirely once their
contents were re-homed by content, and twelve new web groups (`forms`, `whiteboard`,
`time-tracking`, `database`, `docs`, `collaboration`, `reports`, `automations`, `extra`,
`marketing`, `dialogs`, `states`) absorbed screens that a query-derived heading had obscured. iOS
moved less: three groups emptied (`chat`, `filters`, `notifications`) and five appeared
(`collaboration`, `menus`, `dialogs`, `states`, `docs`). The `<slug>` inside a filename still names the query that found the screen, so it will
often disagree with the folder — that is the record of where the file came from, not a claim about
what it shows. Files under `flows/` were not reclassified: their folder is the Mobbin flow name,
which is already a reading of the sequence rather than a search term, and `*/flows/**` was frozen
for this pass.

The dominant judgment call across the pass: a screen's rich-text toolbar, custom-field editor or
cover picker looks identical whether it is opened from a Doc, a Task description, or a Dashboard
widget — only the surrounding chrome (breadcrumb, sidebar, "Milestone" badge) says which. Duplicate
screen ids recurring across the original query-derived folders let each ambiguous case be
cross-checked against every other copy of the same screen before it was filed.

Treat the folder as a verified reading of the screen, not a guess. The screen id and its Mobbin page
remain the authoritative record for what app version it shows.

### Census before and after

| Platform | Before (query-derived groups) | After (content-verified groups) | Files moved |
|----------|-------------------------------|----------------------------------|------------:|
| iOS | `navigation` (29), `tasks` (15), `views` (15), `editors` (10), `settings` (4), `filters` (2), `ai`/`chat`/`notifications`/`onboarding` (1 each) — 10 groups | `tasks` (18), `views` (13), `collaboration` (13), `navigation` (9), `menus` (9), `dialogs` (5), `settings` (3), `editors` (3), `ai` (3), `states`/`onboarding`/`docs` (1 each) — 12 groups | 51 |
| web | `settings` (416), `editors` (332), `tasks` (307), `misc` (197), `views` (164), `navigation` (162), `onboarding` (150), `chat` (134), `dashboards` (127), `menus` (124), `ai` (100), `empty-states` (69), `notifications` (42), `filters` (30), `upgrade` (10) — 15 groups | `tasks` (491), `settings` (355), `views` (186), `ai` (173), `forms` (142), `chat` (126), `dashboards` (119), `whiteboard` (104), `time-tracking` (89), `database` (88), `onboarding` (75), `docs` (74), `collaboration` (71), `reports` (63), `automations` (57), `menus` (56), `navigation` (40), `extra` (35), `marketing` (10), `dialogs` (9), `states` (1) — 21 groups | 1,618 |

Both platforms hold the same file count before and after (79 iOS, 2,364 web) — reclassification
moves files between group folders, it never adds, deletes, or touches `*/flows/**`.

### Why the file count exceeds the screen count

6,478 files hold 3,435 unique screens, because a screen is stored once per context it appears in:

| | iOS | web |
|---|---|---|
| In one journey only | 234 | 1,921 |
| In two or more journeys | 44 | 260 |
| In both a journey and a surface group | 78 | 784 |
| In a surface group only | 1 | 113 |

This duplication is deliberate and was **not** collapsed: a journey folder is an ordered sequence,
and deleting a screen from it because the same screen appears in another journey would break the
sequence the folder exists to record. Deduplicating by screen id is a one-liner against the
filenames if a flat set is ever wanted. What the harvest *does* prevent is the accidental kind — the
final download path skips any screen id already present anywhere under its platform, so re-running an
old query list under a new group name cannot produce a second copy.

## Known limits

- **No app version, and no capture date per screen.** Neither tool returns them (see Provenance).
- **`search_sections` was not used.** It is the third read tool on the manual, but it searches
  *website* sections by `site_name` and takes no platform — it answers a different question than
  "what does ClickUp's product UI look like", so it was out of scope for this harvest.
- **`limit` above ~15 returns nothing.** Both `deep` and `standard` returned zero results at
  `limit: 50`, so 15 is the working ceiling and every call used it.
- **Non-flow grouping was content-verified on 2026-09-07**; flow grouping is still the Mobbin flow
  name, as described above.
- **The content pass is accurate but not perfect.** A landing audit opened 20 files stratified across
  all 33 groups and found 18 filed correctly and 2 misfiled — both from the `views` sweep, both now
  under `web/whiteboard/`: an image proofing/annotation viewer and a Board view showing a
  "Protect view" modal. `web/whiteboard/` also holds a tail of `mentions`, `upload`, `tour-tooltip`
  and `dark-mode` files that are the same image-proofing viewer rather than a whiteboard canvas, so
  it is the least reliable group here; its core (the `whiteboard`, `whiteboard-objects`, `draw` and
  `mind-map` slugs, 66 of 104 files) is sound.
- **605 of the 1,669 ledger rows carry a templated reason.** The `web/editors`, `web/settings` and
  `web/tasks` batches record `reclassified by content: <slug> screen -> <group>` instead of a
  description of the image. The move itself is recorded exactly; the reason column just says less
  for those rows than for the other 1,064.
- **iOS is genuinely thinner than web** (357 vs 3,078 screens). That is Mobbin's library, not a gap
  in the sweep — the iOS query set is 96 queries deep and returned nothing new on its final pass.
- **One transport error in the whole harvest**: `MCP operation on 'mobbin:stdio' timed out after
  30s.` on a single iOS screen query, which the loop recorded and skipped. No 401, no OAuth
  challenge, and no 429 rate-limit response occurred at any point.

## Sourcing position

Mobbin is a **paid, licensed library**; these images were retrieved with the operator's authorized
Pro-or-above MCP session, which is the access path Mobbin itself documents for agents. That is a
narrower position than the Anytype folder's public documentation images, and worth stating plainly:
these files are committed for internal, non-commercial product-comparison reference inside this
repository, each attributed to its Mobbin screen page, and are **not** represented as freely
licensed or redistributable. Mobbin's own screenshots carry its "curated by Mobbin" watermark, which
is preserved on every file. If a stricter reading is ever wanted, the images can be deleted and the
four index files kept — they cite every screen by URL, so nothing that depends on this harvest
depends on the bytes being present.

## Manifest

Like the Anytype captures, nothing here has a `tools/screenshots/manifest.json` entry —
`manifest-schema.mjs` still accepts only `group: "project-manager"` for `source: "reference"`, and
`npm run screenshots:verify` walks `manifest.scenarios`, so it does not see this folder.
`screenshots/manifest.json` was not touched by this harvest.

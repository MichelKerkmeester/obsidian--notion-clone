---
title: "Tasks: Competitor References and Closer PM Alignment"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "competitor reference tasks"
  - "047 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Competitor References and Closer PM Alignment

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Record the licence and attribution position for each image source, per product, before anything is downloaded. **Done, 2026-09-05, via `screenshots/anytype/sources.md` (and, at the time, `screenshots/appflowy/sources.md`) rather than `scratch/licence-positions.md` — CHK-042 asks for a committed record rather than a scratch note, so the position lives beside the images it covers. Every official image's source URL and licence position ("terms unclear" — no press-kit grant found — cited by URL, retained for internal comparison) is recorded before its commit. AppFlowy's `sources.md` was later removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003**
- [x] T002 [B] Get the operator's go-ahead to install the two Homebrew casks — `anytype` 0.56.5 and `appflowy` 0.14.1, neither installed today. Installation is a scoped mutation. **Done, 2026-09-05: both casks installed via Homebrew (confirmed `brew list --cask --versions` → `anytype 0.56.5`, `appflowy 0.14.1`). First launch attempt hung indefinitely at `dyld_start` for the agent (Console/`sample` evidence in the session log) even after clearing the `com.apple.quarantine` attribute; the operator then opened both apps by hand on their own MacBook and the capture pass ran against those windows. AppFlowy was later removed from the reference set entirely — `decision-record.md` ADR-003 — after its captures had already been taken**
- [ ] T003 [P] Read `037/acceptance-criteria.md` AC-007 and `038/tasks.md` T12 so the comparison style is copied rather than reinvented
- [ ] T004 [P] Record the pre-change baseline: board and gantt capture hashes, `screenshots:verify`'s entry count, and the gate's lane list (`scratch/baseline.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T005 Write the negative control FIRST and observe it red against the current schema: a reference entry grouped `anytype` is rejected today by `manifest-schema.mjs:118` (`tools/screenshots/manifest-schema.test.mjs`)
- [ ] T006 Widen the reference contract — the group allowlist at `:118` and `REFERENCE_RENDERERS` at `:52` — and decide what `referenceOf` means for a capture with no constructed counterpart (`tools/screenshots/manifest-schema.mjs`)
- [ ] T007 Give `verify.mjs` a deterministic class for a capture with no in-repo source, distinct from `vendor-unavailable`, which means an unavailable source rather than no source (`tools/screenshots/verify.mjs`)
- [x] T008 Capture Anytype: board, table, calendar, timeline — official product images AND the installed app (`screenshots/anytype/`). **Done, 2026-09-05, in two phases. Official: 5 docs.anytype.io images (board/table/calendar/gallery/properties; no timeline — product has none). Phase 1 (keyboard-only, before Accessibility was granted): 18 dark-theme captures via `Cmd+K`/`Cmd+N`/`/`/arrows — search, slash menu, object creation, one Grid view, Settings→Account, shipped Welcome/Playground pages. Phase 2 (after the operator forbade OS-level clicks entirely and asked for Chrome DevTools Protocol instead): quit Anytype, relaunched with `--remote-debugging-port=9222`, drove it over raw CDP WebSocket JSON-RPC (`Runtime.evaluate` + `el.click()`, `Page.captureScreenshot`) — a DOM click dispatched by the page's own JS never touches the OS pointer or focus. This reached all 6 set layouts (Grid/Gallery/List/Kanban/Calendar/Graph), the view-settings panel, filter property/value pickers, the relation editor, the new-object type picker, and an object's context menu (13 more captures, 31 installed-app total). Light theme stayed unreachable — Settings' `Cmd+,` is an Electron main-process menu accelerator, invisible to CDP's renderer-scoped `Input.dispatchKeyEvent`. The `notion-clone-reference-demo` page and all its objects were deleted (Move to Bin) via the same click-free CDP method before this commit; the operator's separate 20-iteration deep-research UX/logic-extraction run (`decision-record.md` ADR-001) is a different, parallel leg this task did not execute. A shared mock-data catalogue the operator asked to seed the sets from had not landed on `origin/main` after 30 minutes of polling, so the layout/filter/relation captures above use the existing small demo dataset instead. `tools/mock-data/catalogue.json` landed later at `74313a7e` (10 use cases, 326 records, 28 typed columns each) — loading it into ten correctly-typed sets was assessed as out of scope for this session's remaining budget (roughly 280 relation-type decisions plus several thousand cell writes, each its own CDP/DOM operation) and is recorded as explicit follow-up rather than attempted and left half-done. Full list and reasons: `screenshots/anytype/README.md`. **Follow-up, 2026-09-05**: a separate pass added 20 official Anytype *mobile* images (App Store 7, Google Play 7, `anyproto/anytype-swift` GitHub README 6) to `screenshots/anytype/mobile-official/` — no installed-app mobile capture, since Anytype's mobile clients were not installed for either pass. Sources, licence position (same "terms unclear" finding), and per-file provenance: `screenshots/anytype/mobile-official/sources.md`; folder summary: `screenshots/anytype/README.md`** **Menus and dropdowns, 2026-09-05**: a further pass captured **every menu, dropdown, popover and inline editor the Anytype desktop app opens** — 150 distinct menus, each in light and dark, each both clipped to its bounding box and as a full window (600 files, `screenshots/anytype/menus/`), driven by a new crawler `tools/mock-data/anytype/menus.mjs` that opens each menu, photographs it, then walks one level into every submenu. Per context: set controls bar 59 (view list, view settings and its four rows, all six layouts with every per-layout sub-picker, a filter per relation format with its condition list, the date filter's calendar and its relative tab, sorts and direction, the New-object menu, the grid column-header menu), grid cell editors 12 (one per relation format), object page 25, navigation 37 (vault, space, widgets, sync, history, graph, and every settings page this build ships with its selects), kanban 5, calendar 4, gallery 4, list 4. Six items could not be opened and each is recorded with its exact reason in `screenshots/anytype/README.md` — the controls-bar sort icon dispatches no menu on either a DOM click or a real CDP mouse event; `.icon.plusBlockAdd` fires without mounting a menu; the checkbox relation sits below the properties panel's fold so its editor measures a negative height; a `contextmenu` on a property row opens nothing; Settings → Membership has no entry in a never-signed-in build; and the Name grid cell opens the object instead of editing. The demo space is unchanged — the six view names are re-read against `views-report.json` at both ends of every run, all mutating captures happen on one throwaway view the sweep creates and removes, cell values are read before and after each editor opens, and the crawler carries a destructive/mutating refusal list the submenu walker consults before every hover**

      **Addendum, 2026-09-05 — both gaps this task recorded are now closed.** The catalogue load ran
      in a later session: ten sets, 326/326 records, 60 views and 120
      captures, built over Anytype's **local HTTP API** on `localhost:31009` rather than cell by cell
      over CDP, which is why the effort estimate above was wrong by an order of magnitude. **The
      light-theme finding above is also falsified:** the theme is not only reachable from the
      renderer, it needs no navigation at all —
      `window.Electron.Api(window.Electron.winId(), 'setTheme', [''])` is exactly what the Settings
      UI calls (`Action.themeSet` -> `Renderer.send('setTheme', id)`), and `''`/`'dark'`/`'system'`
      are its three values. Both themes are captured. See the "Catalogue sets" section of
      `screenshots/anytype/README.md`.
- [x] T009 [P] Capture AppFlowy: board, table, calendar, timeline — official product images AND the installed app (`screenshots/appflowy/`). **Done, 2026-09-05, then reversed the same day. Official: 4 appflowy.com images (board/table/calendar/properties; no timeline — not among the product's documented view types). Installed (0.14.1, the operator's own running window): the shipped `To-dos` database's populated Board/Kanban view, plus the `Cmd+P` search palette and the native `About AppFlowy` dialog. AppFlowy is Flutter (no DOM, no CDP target), so the CDP escape hatch used for Anytype in phase 2 did not apply here — Grid/Calendar/Gallery of a database, an expanded card's property sheet, and Settings/Appearance stayed unreachable once OS-level clicks were forbidden. The operator first asked to skip the two remaining installed-view rows (table, calendar) and the CSV-import seed — `decision-record.md` ADR-002 — then, later the same day, removed AppFlowy from the reference set entirely: **"let's ditch AppFlowy screenshots"** — `decision-record.md` ADR-003, superseding ADR-002. `screenshots/appflowy/` (images, `README.md`, `sources.md`) was deleted; the CSVs stay in `tools/mock-data/csv/` as product-neutral fixtures, reworded away from AppFlowy-specific framing**
- [ ] T010 Write the manifest entries with provenance: source, app version, capture date, in `screenshots/project-manager/`'s entry shape (`screenshots/manifest.json`). **Not done, deliberately: `manifest-schema.mjs:52,118` accepts only `group: "project-manager"` and `pm-kanban`/`pm-gantt` as reference renderers — confirmed by reading the schema, not assumed. No entry for `anytype` can pass validation without T006's contract widening, which is the other leg of this packet (AppFlowy is no longer part of this task — `decision-record.md` ADR-003). `screenshots/manifest.json` is untouched; provenance instead lives in `screenshots/anytype/sources.md` (official images) and `README.md` (installed captures)**
- [x] T011 [P] Describe the new root and where its contents came from. **Done, 2026-09-05, via `screenshots/anytype/README.md` rather than the top-level `screenshots/README.md` — that file is generated by `npm run screenshots` ("Do not edit by hand — this file and every image below are rewritten on each capture") and only documents `manifest.scenarios` entries, which these captures deliberately are not (see T010). A per-folder README is the durable home for this provenance. (An `appflowy/README.md` was also written this way, then removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003.)**
- [ ] T012 Run the board comparison against Project Manager: named elements, measured values, a numbered gap or a zero — the shape `038`'s T12 used (`scratch/board-comparison.md`)
- [ ] T013 Run the gantt comparison the same way, the shape `037`'s AC-007 used (`scratch/gantt-comparison.md`)
- [ ] T014 Close each measured gap with a before and an after number; disposition the ones not closed with a reason (`src/views/board-renderer.ts`, `src/views/calendar-timeline-renderer.ts`, `styles.css`)
- [x] T015 Record any capture row that could not be taken as uncaptured WITH its reason. An absent capture reported as zero gaps is the failure this phase is written against. **Done, 2026-09-05: `screenshots/anytype/README.md` carries a "Views not captured, and why" section — timeline/gantt is "not applicable" (confirmed absent from Anytype's own documentation) while Gallery-of-the-demo, property editor, filter/sort, view switcher, context menus, hover states and light theme are recorded as "not reachable" with the specific permission error behind it. The `notion-clone-reference-demo` page also could not be deleted for the same reason (no keyboard path to Anytype's click-driven Bin) and is flagged for the operator to remove by hand. (An equivalent AppFlowy README existed briefly and was removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003.)**
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T016 Run the negative control against the widened schema and confirm it still goes red
- [ ] T017 `npm run screenshots:verify` and confirm every new capture is accounted for, not skipped
- [ ] T018 `npm run gate`, exit status read from `$?` and not through a pipe
- [ ] T019 Compare board and gantt capture hashes against T004's baseline; any move must be explained by a named gap from T012 or T013, never rebaselined silently
- [ ] T020 Read our board and gantt beside all three reference sets at both themes, by hand
- [ ] T021 Leave §4 rows 37 and 38 open. They close on the operator's own vault comparison and an agent never ticks an operator row
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every acceptance criterion is `Met`, `Waived` or `Superseded`, except AC-007 which is the operator's
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **The ruling**: See `../roadmap.md` §4 rows 37 and 38, and §6A
- **Comparison style**: See `../037-timeline-gantt-port/acceptance-criteria.md` AC-007 and `../038-board-kanban-port/tasks.md` T12
- **Decisions**: See `decision-record.md` ADR-001 (Anytype research-cap override), ADR-002 (AppFlowy installed captures skipped; Anytype demo space persistent — superseded), and ADR-003 (AppFlowy removed from the reference set entirely, superseding ADR-002)
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Licence position recorded per image source before any download. **Done — see T001**
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` clean; `npm run lint:tools` green
- [ ] CHK-011 [P0] The widened schema still rejects a malformed entry, proven by a negative control
- [ ] CHK-012 [P1] `verify.mjs`'s new class is deterministic — an entry never flips between classes
- [ ] CHK-013 [P1] No fidelity fix lands without a measured gap behind it
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met except the operator's
- [ ] CHK-021 [P0] `npm run screenshots:verify` accounts for every new capture rather than skipping it
- [ ] CHK-022 [P1] Board and gantt capture hashes compared against the baseline, not re-run
- [ ] CHK-023 [P1] Uncaptured rows recorded as uncaptured, with reasons
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding classed: the schema widening is `matrix/evidence`, each fidelity gap is `instance-only` until a second surface shows the same shape.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n 'project-manager|pm-kanban|pm-gantt' tools/screenshots tools/live` — every place the reference contract is written down.
- [ ] CHK-FIX-003 [P0] Consumer inventory for `REFERENCE_RENDERERS`, `captureRootFor` and `referenceOf`.
- [ ] CHK-FIX-004 [P0] The schema is a parser over external input; adversarial cases cover an unknown group, an unknown renderer, a missing `referenceOf` and a path escaping its root.
- [ ] CHK-FIX-005 [P1] Matrix axes listed: product x surface x source, 16 rows, with uncaptured rows named.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix sha.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:phase-mobile -->
## Phase 4: Anytype mobile reference captures (ADR-005)

- [x] T022 Build the open-source Anytype iOS client for the simulator, without a GitHub `read:packages` token and without a local Go build of the middleware. **Done, 2026-09-05: `anyproto/anytype-swift` cloned at `77ef5ea2` into the gitignored `specs/context/anytype-swift/`; the pinned middleware `v0.50.21-nightly.20260824.1` pulled as a public release asset (`ios_framework_*.tar.gz`) from `anyproto/anytype-heart` after both the tokened and anonymous Packages-registry requests returned 401. `make generate-middle` was unnecessary — all 679 generated protobuf Swift files are committed. `xcodebuild -scheme Anytype -configuration Debug -destination 'id=94E4B156-…' CODE_SIGNING_ALLOWED=NO build` → `** BUILD SUCCEEDED **`, first attempt**
- [x] T023 Give the simulator a touch input path that never moves the Mac's pointer or takes focus. **Done, 2026-09-05: `simctl` has no tap, so an `AnytypeDriverUITests` UI-test target was added to the vendored project with the `xcodeproj` gem (1.27.0) and holds one long-lived test polling `/tmp/anytype-driver/req.json` for `tap`/`tapLabel`/`type`/`swipe`/`drag`/`labels` against `XCUIApplication(bundleIdentifier:)`. Captures use `xcrun simctl io booted screenshot`, which renders from the device — `Simulator.app` was never launched**
- [x] T024 Put the desktop's `notion-clone-reference-demo` catalogue on the phone without using the operator's recovery phrase or account. **Done, 2026-09-05: a new local vault was created through the app's own onboarding; the desktop generated an invite over CDP (`spaceShare` → "Add members via link" → Copy link → `navigator.clipboard.readText()`); the simulator opened it and sent a join request; the desktop approved it over CDP as **Editor**, including the `Are you sure?` confirmation popup that the permission select alone does not commit. `GET /v1/spaces/<id>/members` then read `role=editor status=active`, and all ten collections and 326 records appeared on the phone**
- [x] T025 Record why `simctl openurl` could not carry the invite, with a negative control rather than an assumption. **Done, 2026-09-05: SpringBoard's "Open in Anytype Dev?" prompt is confirmed and nothing reaches the app. `anytype://networkConfig?config=probe` — whose only effect is a local toast needing no network — produced no toast either, so the failure is delivery, not the invite. The invite instead arrives through a five-line `#if DEBUG` patch in the clone's `SpaceHubCoordinatorViewModel.setup()` reading `ANYTYPE_JOIN_CID`/`ANYTYPE_JOIN_KEY`, which opens the app's own join sheet and changes no captured screen**
- [x] T026 Capture every mobile sheet, picker and menu reachable, in both appearances (`screenshots/anytype/mobile/`). **Done, 2026-09-05: 59 states × light and dark = 118 files, switched with `simctl ui booted appearance` without leaving the state. Covers the space hub and space settings, search and its type filter, quick capture, all four set layouts, the view switcher and its edit mode, Edit view with layout/properties/filters/sorts, the gallery card-size and image-preview pickers, the kanban group-by and column sheets, the new-object template sheet, icon and cover pickers, the object `···` menu and its submenu, the relations panel, the type property editor, the add-property sheet with all eleven formats, the format picker, and a cell editor per format**
- [x] T027 Index the mobile captures with the app version, the clone commit and how each was reached; list what is unreachable with the exact reason. **Done, 2026-09-05: `screenshots/anytype/README.md` "Mobile (iOS Simulator)" — provenance table, the build recipe, the driver contract and its two traps (the accessibility tree stacks presented sheets; `isHittable` is false for rows inside one), the join procedure, per-capture tables, and the unreachable list. iOS has **no Calendar and no Graph layout** (the view switcher marks Calendar `Unsupported`); the checkbox cell toggles in place with no sheet; `file` columns hold no values by design; the QR join needs a camera the simulator lacks**
- [x] T028 Leave the shared space as it was found, apart from the intended invite and membership. **Done, 2026-09-05: two empty `Untitled` Page objects created by stray taps were deleted over the API and the space read back 382 objects, 0 untitled; the affected capture was retaken. No filter, sort, layout or view name was committed — the Filters sheet still reads "No filters" and no relation was created. The invite link and the Editor membership are intentional and their rollback is written down in ADR-005**
<!-- /ANCHOR:phase-mobile -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No credential used to obtain any competitor image; anything behind a login is out of scope. **Done — every official image fetched anonymously from `docs.anytype.io` or `appflowy.com`, no auth**
- [x] CHK-031 [P0] Downloaded images inspected before commit; nothing is fetched into the repository unreviewed. **Done — every official image and every installed-app capture was opened and read (Read tool) before being placed in its destination folder**
- [ ] CHK-032 [P1] The widened schema still rejects a `file` path escaping its capture root
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized
- [x] CHK-041 [P1] `screenshots/README.md` describes the new root and its provenance. **Done via `screenshots/anytype/README.md` instead of the generated top-level file — see T011 for why. (An `appflowy/README.md` existed briefly and was removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003.)**
- [ ] CHK-042 [P2] `../roadmap.md` §4 rows 37/38 updated with what was measured — without ticking them
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Comparison working files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned of throwaway files before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 2/9 |
| P1 Items | 12 | 2/12 |
| P2 Items | 2 | 0/2 |

**Verification Date**: 2026-09-05, capture legs only (T001, T002, T008, T009, T011, T015, T022-T028, CHK-003, CHK-030, CHK-031, CHK-041) — the desktop capture leg in the morning, the Anytype mobile leg (ADR-005) in the afternoon. The contract-widening and fidelity-comparison rows (T005-T007, T012-T014, T016-T020 and their matching CHK rows) are a separate leg of this packet and remain unrun.
<!-- /ANCHOR:summary -->

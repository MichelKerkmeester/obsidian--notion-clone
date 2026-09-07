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
- [x] T003 [P] Read `037/acceptance-criteria.md` AC-007 and `038/tasks.md` T12 so the comparison style is copied rather than reinvented. **Done, 2026-09-06**: AC-007's shape is named elements, measured device-pixel values, a numbered gap or a zero, split into an in-repo half (captures vs. reference SOURCE) and an operator-only vault half never ticked by an agent
- [x] T004 [P] Record the pre-change baseline: board and gantt capture hashes, `screenshots:verify`'s entry count, and the gate's lane list (`scratch/baseline.md`). **Done, 2026-09-06**: 108 notion-clone board/timeline hashes plus the 8 `reference-gantt-*` hashes recorded, `screenshots:verify` at 558 entries, `pm-gantt-*` at 56 distinct classes, 26 gate lanes named from `tools/gate.mjs`
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 Write the negative control FIRST and observe it red against the current schema: a reference entry grouped `anytype` is rejected today by `manifest-schema.mjs:118` (`tools/screenshots/manifest-schema.test.mjs`). **Done, 2026-09-06.** New suite (5 cases): a well-formed `project-manager` reference entry passes; `group: "anytype"`, an out-of-allowlist `renderer`, and a missing `referenceOf` are each rejected today, confirmed by running the suite before writing this note. A sixth case was found while building the fixture, not assumed: `file`'s `startsWith` check is textual, so a value carrying a literal `..` segment still reads as prefixed by its capture root even though the resolved path escapes it — recorded as the suite's fifth (passing, documents-today's-gap) case rather than fixed, since closing it was read as coupled to the same widening. **Closed 2026-09-06 by the verification leg, red first:** the coupling does not hold — the widening decides which `group` and `renderer` values a reference entry may carry, and says nothing about where its `file` lands. Both escape cases (the reference root and the constructed root) were flipped to assert rejection and observed red (`2 failed | 4 passed`), then a five-line guard beside the prefix test — reject a `file` whose path segments include `..` — turned them green (`6 passed`, exit 0). Paths are never normalised, only rejected: every path the capture run writes is built from a root and a basename, so a `..` is never a legitimate spelling and rewriting one would hide whatever produced it
- [ ] T006 Widen the reference contract — the group allowlist at `:118` and `REFERENCE_RENDERERS` at `:52` — and decide what `referenceOf` means for a capture with no constructed counterpart (`tools/screenshots/manifest-schema.mjs`). **Left this leg, one-line reason:** `referenceOf`'s meaning for a capture with no constructed counterpart is an undecided design question (`spec.md`'s own open question, `acceptance-criteria.md` AC-002/AC-004 both `Unmet` on it) inseparable from how a real Anytype entry gets classified — exactly the dependency this leg's brief excludes; a partial widen (group only, renderer/referenceOf untouched) would pass one check only to dead-end at the next, which is the "loosens without a purpose" shape D3 warns against
- [ ] T007 Give `verify.mjs` a deterministic class for a capture with no in-repo source, distinct from `vendor-unavailable`, which means an unavailable source rather than no source (`tools/screenshots/verify.mjs`). **Left this leg, one-line reason:** the classification this task names only has a real capture to classify once T006 lands and T010 writes an entry for one — attempting it now means inventing a class with nothing in the manifest to exercise it, the same speculative-code risk T006 was deferred to avoid
- [x] T008 Capture Anytype: board, table, calendar, timeline — official product images AND the installed app (`screenshots/anytype/`). **Done, 2026-09-05, in two phases. Official: 5 docs.anytype.io images (board/table/calendar/gallery/properties; no timeline — product has none). Phase 1 (keyboard-only, before Accessibility was granted): 18 dark-theme captures via `Cmd+K`/`Cmd+N`/`/`/arrows — search, slash menu, object creation, one Grid view, Settings→Account, shipped Welcome/Playground pages. Phase 2 (after the operator forbade OS-level clicks entirely and asked for Chrome DevTools Protocol instead): quit Anytype, relaunched with `--remote-debugging-port=9222`, drove it over raw CDP WebSocket JSON-RPC (`Runtime.evaluate` + `el.click()`, `Page.captureScreenshot`) — a DOM click dispatched by the page's own JS never touches the OS pointer or focus. This reached all 6 set layouts (Grid/Gallery/List/Kanban/Calendar/Graph), the view-settings panel, filter property/value pickers, the relation editor, the new-object type picker, and an object's context menu (13 more captures, 31 installed-app total). Light theme stayed unreachable — Settings' `Cmd+,` is an Electron main-process menu accelerator, invisible to CDP's renderer-scoped `Input.dispatchKeyEvent`. The `notion-clone-reference-demo` page and all its objects were deleted (Move to Bin) via the same click-free CDP method before this commit; the operator's separate 20-iteration deep-research UX/logic-extraction run (`decision-record.md` ADR-001) is a different, parallel leg this task did not execute. A shared mock-data catalogue the operator asked to seed the sets from had not landed on `origin/main` after 30 minutes of polling, so the layout/filter/relation captures above use the existing small demo dataset instead. `tools/mock-data/catalogue.json` landed later at `74313a7e` (10 use cases, 326 records, 28 typed columns each) — loading it into ten correctly-typed sets was assessed as out of scope for this session's remaining budget (roughly 280 relation-type decisions plus several thousand cell writes, each its own CDP/DOM operation) and is recorded as explicit follow-up rather than attempted and left half-done. Full list and reasons: `screenshots/anytype/README.md`. **Follow-up, 2026-09-05**: a separate pass added 20 official Anytype *mobile* images (App Store 7, Google Play 7, `anyproto/anytype-swift` GitHub README 6) to `screenshots/anytype/mobile/official/` — no installed-app mobile capture, since Anytype's mobile clients were not installed for either pass. Sources, licence position (same "terms unclear" finding), and per-file provenance: `screenshots/anytype/mobile/official/sources.md`; folder summary: `screenshots/anytype/README.md`** **Menus and dropdowns, 2026-09-05**: a further pass captured **every menu, dropdown, popover and inline editor the Anytype desktop app opens** — 150 distinct menus, each in light and dark, each both clipped to its bounding box and as a full window (600 files, `screenshots/anytype/desktop/menus/`), driven by a new crawler `tools/mock-data/anytype/menus.mjs` that opens each menu, photographs it, then walks one level into every submenu. Per context: set controls bar 59 (view list, view settings and its four rows, all six layouts with every per-layout sub-picker, a filter per relation format with its condition list, the date filter's calendar and its relative tab, sorts and direction, the New-object menu, the grid column-header menu), grid cell editors 12 (one per relation format), object page 25, navigation 37 (vault, space, widgets, sync, history, graph, and every settings page this build ships with its selects), kanban 5, calendar 4, gallery 4, list 4. Six items could not be opened and each is recorded with its exact reason in `screenshots/anytype/README.md` — the controls-bar sort icon dispatches no menu on either a DOM click or a real CDP mouse event; `.icon.plusBlockAdd` fires without mounting a menu; the checkbox relation sits below the properties panel's fold so its editor measures a negative height; a `contextmenu` on a property row opens nothing; Settings → Membership has no entry in a never-signed-in build; and the Name grid cell opens the object instead of editing. The demo space is unchanged — the six view names are re-read against `views-report.json` at both ends of every run, all mutating captures happen on one throwaway view the sweep creates and removes, cell values are read before and after each editor opens, and the crawler carries a destructive/mutating refusal list the submenu walker consults before every hover**

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
- [ ] T012 ~~Run the board comparison against Project Manager~~ **SUPERSEDED 2026-09-05 ~22:45 — do not run.** The operator retargeted the board to Anytype (*"Board UI/UX should almost be 1:1 Anytype"*, clarified *"Board + calendar to Anytype; gantt stays PM"*), so this comparison would measure divergence from a reference the board is no longer meant to match. The board's rebuild is `../056-board-anytype-parity/`, and its own T001 is a capture true-up against Anytype rather than a fidelity pass against Project Manager. The leg that had started was stopped the same night: two uncommitted files in worktree `impl-047-align`, disposable. See `decision-record.md` ADR-007 and `../roadmap.md` §7.12. `scratch/board-comparison.md` is not written
- [x] T013 Run the gantt comparison, the shape `037`'s AC-007 used (`scratch/gantt-comparison.md`). **Done, 2026-09-06.** Read the vendored source in full (`TimelineConfig.ts`, `GanttHeaderRenderer.ts`, `GanttTaskBarRenderer.ts`, `GanttRenderer.ts`, `TaskLabelRenderer.ts`, `gantt.css` + its `widgets.css`/`utilities.css`/`table.css` companion rules) against ours (`calendar-timeline-renderer.ts`'s `renderGantt*` family, `styles.css`'s `.pm-gantt-*` block): every named constant, CSS rule and marker geometry is identical — zero code/CSS divergence, independently confirming the prior fresh reviewer's byte-faithful finding. Opened `screenshots/project-manager/reference-gantt-*.png` beside `screenshots/notion-clone/views/constructed-timeline*.png` (desktop/mobile × light/dark × base/subtask) and measured two visible differences in device pixels: task-bar/progress/milestone/label-dot colour (reference `rgb(138,148,160)` vs ours `rgb(90,103,215)`, both back-computed from the 40%-opacity swatch) and the phone label column (reference has no phone branch, measured 280px unconditional; ours measured 160px, phone-only, a 120px/42.9% reduction that truncates the title on rows carrying a progress badge). Full table: `scratch/gantt-comparison.md`. **Re-read 2026-09-06 by a fresh verification leg, and the count is corrected: five visible differences, not two.** The two above hold, with one number replaced — the phone chart width is **86 CSS px**, measured off the PNG, not the ~122px estimated here (that figure omitted the container padding and the 4px resize handle). Three more were found: the progress badge's inset from the label pane's right edge (121 dev / 60.5 CSS reference against 73 / 36.5 ours, from the hover-only add-subtask affordance the obsidian stub renders as a bare `<button>`); the whole-widget inset (16/16 CSS reference against 40/48 ours, from `.note-database-container`'s 24px inline padding, which is also what puts every timeline x 8 dev px left of the reference's); and text weight (13-17% fewer ink pixels throughout, from `styles.css:36`'s `-webkit-font-smoothing: antialiased`). None is a value in the two files this leg may touch, so the *nothing to fix* verdict survives and only the count changes. The committed table is `implementation-summary.md` § The gantt comparison, since `scratch/` is gitignored
- [x] T014 Close each measured **gantt** gap with a before and an after number; disposition the ones not closed with a reason (`src/views/calendar-timeline-renderer.ts`, `styles.css`). **Done, 2026-09-06: zero gaps to close, both measured differences dispositioned.** Colour: `resolveGanttBarColor` (`calendar-timeline-renderer.ts:1892`) already runs the identical fallback chain the reference's own `renderTaskBar` uses (`statusConfig?.color ?? --interactive-accent`) — the RGB difference is the bench fixture behind `constructed-timeline` carrying no per-row status colour, not a rendering defect; inventing a fixture colour to match one screenshot would fabricate a value with nothing behind it (goal.md D5/D6). A second, narrower finding surfaced and is named but out of this leg's file scope: the two capture *rigs'* own `--interactive-accent` constants differ (`tools/screenshots/theme.css` vs the reference host page) — **refuted 2026-09-06 with a receipt: both hosts load the same `tools/screenshots/theme.css` (`reference-scenarios.mjs:95`), and the reference's own dependency-arrow pixels read `rgb(61,64,108)`, identical to ours. The reference's grey is `#8a94a0`, its `ProjectConfig.ts:4` FALLBACK_COLOR, not a differently-seeded accent**. Phone label width: kept at 160px (accessibility/usability exception) — the reference's unconditional 280px on the same 402px-CSS mobile viewport would leave roughly 122px for the actual chart, under one `day`-scale unit width, i.e. an unusable mobile timeline; 160px is the value `037`'s own AC-007 already measured and accepted. No code change; `src/views/board-renderer.ts` was never touched, consistent with its removal from this task's file list
- [x] T015 Record any capture row that could not be taken as uncaptured WITH its reason. An absent capture reported as zero gaps is the failure this phase is written against. **Done, 2026-09-05: `screenshots/anytype/README.md` carries a "Views not captured, and why" section — timeline/gantt is "not applicable" (confirmed absent from Anytype's own documentation) while Gallery-of-the-demo, property editor, filter/sort, view switcher, context menus, hover states and light theme are recorded as "not reachable" with the specific permission error behind it. The `notion-clone-reference-demo` page also could not be deleted for the same reason (no keyboard path to Anytype's click-driven Bin) and is flagged for the operator to remove by hand. (An equivalent AppFlowy README existed briefly and was removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003.)**
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T016 Run the negative control against the widened schema and confirm it still goes red. **Left this leg, one-line reason:** T006 (the widening) did not land this leg, so there is no widened schema to run this control against; T005's own suite already pins the pre-widening red
- [x] T017 `npm run screenshots:verify` and confirm every new capture is accounted for, not skipped. **Done, 2026-09-06:** exit 0, "558 entries match their sources, and none is blank or identical across themes" — unchanged from T004's baseline, since this leg added a schema test file and doc edits, no capture
- [x] T018 `npm run gate`, exit status read from `$?` and not through a pipe. **Done, 2026-09-06** — see the gap table and command summary in this session's final report
- [x] T019 Compare board and gantt capture hashes against T004's baseline; any move must be explained by a named gap from T012 or T013, never rebaselined silently. **Done, 2026-09-06:** re-hashed every file in `scratch/notion-clone-board-gantt-hashes-baseline.txt` and all 8 `reference-gantt-*.png` — 0 moved, matching T014's "no code change" outcome exactly
- [x] T020 Read our board and gantt beside all three reference sets at both themes, by hand. **Done for the gantt** (this leg's scope) **against Project Manager, the gantt's only reference** — desktop/mobile × light/dark × base/subtask, `scratch/gantt-comparison.md`. Not done against Anytype: the capture sweep holds six set layouts and no gantt among them (no Anytype timeline exists to read beside), and the board is `056`'s, not this leg's, per ADR-007
- [x] T029 Verify the gantt comparison against the capture pixels rather than against its own prose, and record whatever it missed. **Done, 2026-09-06.** Decoded all eight `reference-gantt-*.png` beside their `referenceOf` twins (`constructed-timeline*`), desktop and phone, dark and light, base and subtask, with a PNG decoder rather than by eye. **Confirmed:** the geometry is identical to the pixel — row pitch 88 dev, header 112 (48 month + 64 week), label pane 560, resize handle 8, bar height 56, the eight bar widths row for row, the 60% progress fill at 27 of 44, the milestone diamond at 1053 core px, the today line and its diamond with identical colour histograms, and the dependency arrows whose per-colour pixel counts sum across the two sides (reference 2270 bar + 404 link = our 2674). The `.pm-gantt-*` block was also diffed rule by rule against the vendored `gantt.css`: 51 rules, 50 declaration-for-declaration identical, the 51st our own phone touch-target override whose base rule matches too. **Refuted:** the two-differences count (five, not two — the badge inset, the container inset and text weight were missed), the differently-seeded `--interactive-accent` sub-finding (both hosts load the same `theme.css`; the reference's own arrow pixels read `rgb(61,64,108)`, identical to ours), and the ~122px phone chart estimate (measured 86 CSS px). Every difference and its mechanism: `implementation-summary.md` § The gantt comparison. No `src/` or `styles.css` change, and all eight reference PNGs stay pixelHash-identical
- [ ] T021 Leave §4 rows 37 and 38 open. They close on the operator's own vault comparison and an agent never ticks an operator row. **Left open, as required** — not ticked; `../roadmap.md` §4 rows 37/38 are unedited by this leg
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
- [x] CHK-013 [P1] No fidelity fix lands without a measured gap behind it. **Done — the gantt leg landed zero fidelity fixes; both measured differences (colour, phone label width) are dispositioned with a device-pixel/RGB number, not fixed, per T013/T014**
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

<!-- ANCHOR:phase-mobbin -->
## Phase 5: Mobbin reference harvests (2026-09-06 amendment)

One app landed and verified before the next opens. Never a parallel fan-out across apps.

- [x] T030 [B] Harvest Notion (iOS + web) via Mobbin, Fable 5.1 medium through the second login,
      into `screenshots/notion/{ios,web}/<group>/` with a `README.md` index; landed by a fresh
      verifier before T031 opens.
      **Done and landed 2026-09-06** from `worktrees/148-harvest-notion`, on the operator's words
      "let fresh fable (medium) orchestrator through claude2 use sonnet agents to harvest all
      screenshots from Notion that can be harvested from Mobbin". **3647 `webp` files — iOS 1315
      files (801 unique screens, 149 flows), web 2332 files (1540 unique screens, 323 flows)** —
      pulled by the **scripted loop** method (one Code Mode execution per batch, both platform lanes
      together, under 40 requests a minute) through the Mobbin MCP: `search_screens` deep mode with
      an accumulating `exclude_screen_ids`, plus `search_flows`. 583 requests counted, no 401 and no
      429, two 30 s timeouts whose queries succeeded on a later call. Grouped by platform and by the
      query that returned each screen (`navigation/`, `views/`, `database/`, `editors/`, `menus/`,
      `sheets/`, `settings/`, `collaboration/`, `onboarding/`, `states/`, `extra/`, `flows/<flow>/`);
      `screenshots/notion/README.md` holds the layout, provenance, query sets and a per-file
      `mobbin_url` row for every image, with `ios/harvest.json` and `web/harvest.json` as the
      machine-readable ledgers. Verified before landing: README index and disk agree 1:1 on all 3647
      paths, every file is a valid RIFF/WebP with no truncation and none under 1 KB, no screen id
      repeats inside a folder, 14 images opened and read (iOS phone chrome, web desktop chrome, all
      Notion, all carrying the Mobbin footer). The in-flight counts this row used to carry (1,510 at
      10:27, 1,679 at 10:50) are superseded by the landed total. Two claim corrections made in the
      README before landing: the folder groups are query-derived, not content-verified (5 of 9 web
      spot-checks sit in a group they do not depict), and the request-ledger breakdown itemizes 168
      of the 278 iOS and 136 of the 297 web requests
- [x] T030a Reclassify the Notion non-flow captures by what each image shows, replacing the
      query-derived grouping T030 landed.
      **Done 2026-09-06.** All 1,205 non-flow files (iOS 610, web 595) were opened and judged by
      content against a fixed vocabulary, and **862 moved** — iOS 372, web 490 — with the group
      token inside each filename renamed to match while the screen-id suffix stayed. iOS
      destinations: 126 ai, 85 editors, 63 database, 38 collaboration, 17 sheets, 10 settings,
      8 views, 7 onboarding, 6 navigation, 6 marketing, 5 states, 1 menus. Web destinations:
      109 ai, 105 editors, 62 database, 60 collaboration, 43 settings, 42 onboarding, 39 views,
      23 marketing, 3 menus, 3 extra, 1 states. Two groups were added (`ai`, `marketing`) and
      `ios/extra` emptied. `flows/` was left alone: its folder is the Mobbin flow name, already a
      reading of the sequence rather than a search term. Ledger:
      `screenshots/notion/reclassification-2026-09-06.tsv` — old path, new path, one-line reason per
      move. `screenshots/notion/README.md` was regenerated: layout table counts, the grouping
      paragraph, and all 3647 per-file index rows repointed to their new paths with the `mobbin_url`
      and query columns intact. Verified: 3647 files on disk before and after, no duplicate path,
      index and disk agree 1:1, `screenshots/manifest.json` untouched and
      `node tools/screenshots/verify.mjs` exit 0, and 33 of the web moves re-opened independently
      and confirmed
- [x] T031 [B] Harvest Evernote (iOS + web) via Mobbin, same orchestration, into
      `screenshots/evernote/{ios,web}/<group>/`; landed by a fresh verifier before T032 opens.
      **Done and landed 2026-09-06** from `worktrees/149-harvest-evernote`, on the operator's words
      "harvest all screenshots from Evernote that can be harvested from Mobbin". **1,557 `webp` files
      — iOS 555 files (345 unique screens: 105 search screens in 17 group folders plus 105 flows in
      450 files), web 1,002 files (724 unique screens: 105 search screens in 15 group folders plus
      170 flows in 897 files across 136 flow-name folders)** — pulled by the same **scripted loop**
      method as T030 through the Mobbin MCP: `search_screens` standard mode with an accumulating
      `exclude_screen_ids`, plus `search_flows` paged at its maximum `limit` of 10. 135 requests
      counted (11 screen + 44 flow calls on iOS, 11 + 51 on web, 18 orchestrator probes), no 401 and
      no 429; one mid-run input-validation error (`search_flows` caps `limit` at 10 and returns the
      violation as a string) was corrected before the flow sweep. Unlike Notion, the search index
      exposed only 105 screens per platform: one query returned all of them and a bare `Evernote`
      query with every known id excluded then returned nothing, so the groups are **content-derived,
      not query-derived** — each file was filed and described from the image, and six group files
      opened at landing all sat in a folder they depict. `screenshots/evernote/README.md` holds the
      layout, provenance, query sets and a per-file `mobbin_url` row for every image. Verified before
      landing: README index and disk agree 1:1 on all 1,557 paths with the URL id matching each
      filename, every file is a valid RIFF/WebP (1,544 VP8, 13 VP8X) and none under 1 KB, no screen
      id repeats inside a folder, every iOS file is 299x678 and every web file 768x521, the folder is
      30 MB, and ten images were opened and read (iOS phone chrome, web desktop chrome, all Evernote,
      all carrying the Mobbin footer). One claim corrected in the README before landing: the
      provenance said a few web captures differ in size, and none does. App version unknown — neither
      Mobbin tool returns one and the app pages 403 without a browser session
- [x] T032 [B] Harvest Fibery (web only) via Mobbin, same orchestration, into
      `screenshots/fibery/web/<group>/`; landed by a fresh verifier before T033 opens.
      **Done and landed 2026-09-06** from `worktrees/150-harvest-fibery`, on the operator's words
      "let fresh fable (medium) orchestrator through claude2 use sonnet agents to harvest all
      screenshots from Fibery that can be harvested from Mobbin" — web only, so there is no `ios/`
      lane. **1,800 `webp` files, 860 distinct screen ids** — `web/navigation/` 105,
      `web/screens/` 597, `web/flows/` 1,098 files across 233 flow folders; 700 ids appear both
      standalone and inside a flow, 158 only inside a flow. Pulled across two sessions (the first
      was cut off by a session cap after 1,755 downloads; the second fetched the 45 it had found
      but not downloaded, then re-swept to convergence) through the Mobbin MCP: `search_screens`
      (55 app-scoped surface queries, `mode: "standard"`, `limit: 15`) and `search_flows` (28
      journey queries, paged to `has_next_page`). The sweep stopped after nine consecutive screen
      queries and eight consecutive flow queries returned only known ids. No 401 and no 429. Two
      things worth keeping: an `exclude_screen_ids` list of ~860 ids makes the API return zero
      screens silently, so exclusion is per query with client-side dedup; and Mobbin serves 768 px
      WebP previews with its footer strip, not full-resolution captures. Verified before landing:
      `screenshots/fibery/README.md` and disk agree 1:1 on all 1,800 paths with no duplicate path
      and every row carrying an `https://mobbin.com` URL, every file is a valid RIFF/WebP with none
      under 1 KB and every one 768 px wide, no screen id repeats inside a folder, the folder is
      38.6 MB, and twelve images were opened and read (all Fibery desktop web chrome, all carrying
      the Mobbin footer). One shape correction to the claim it landed under: the index is
      **per file for the 702 non-flow captures and per flow folder for the 1,098 flow files** —
      a flow's single `mobbin_url` cites every file in its folder — and the README says so rather
      than claiming a row per image. `screenshots/manifest.json` is untouched and
      `node tools/screenshots/verify.mjs` exits 0, for the same schema reason as Anytype (T034).
      Grouping is query-derived, not content-verified: `web/screens/` is deliberately flat, so the
      T035 reclassification pass is owed here in full
- [x] T033 [B] Harvest ClickUp (iOS + web) via Mobbin, same orchestration, into
      `screenshots/clickup/{ios,web}/<group>/`; landed by a fresh verifier.
      **Done, 2026-09-06 into 2026-09-07** — operator's words: *"let fresh fable (medium) orchestrator through claude2 use sonnet agents to same for clickup but ask a opus xhigh to orchestrate that"*. **6,478 files, 3,435 unique screens** in `screenshots/clickup/` — **iOS 543 files / 357 screens / 112 journeys**, **web 5,935 files / 3,078 screens / 609 journeys**, no screen shared across platforms. Retrieved through the Mobbin MCP's two read tools (`search_screens`, `search_flows`) via Code Mode only, in scripted per-execution loops capped at 38 calls with a 3.1 s interval and at most two concurrent Sonnet agents, holding well under the documented 60/min limit: **3,110 recorded calls across 96 saved payloads**, one transport error in the whole run (`MCP operation on 'mobbin:stdio' timed out after 30s.`), zero 401s, zero OAuth challenges, zero 429s. **The finding that made completeness measurable: `mode: "deep"` returns a bounded ~15 screens per query — excluding those 15 returns nothing at exclude sizes 300/600/1,200 — while `mode: "standard"` paginates to ~105, about 7×.** The whole query set (96 iOS, 150 web surface queries; 132 journey queries per platform, 52 of them mined from Mobbin's own 53-category ClickUp action taxonomy) was therefore re-swept in `standard` mode as the saturation test: iOS returned 6,378 rows over 534 calls for **0 new screens**, web 13,369 rows over 1,034 calls for **113**. Ten images were opened and read before commit; all ten are genuine ClickUp screens, and two whose content only partly matches their folder are named in the README — grouping records the query that surfaced a screen, not a verified reading of it. Index: `screenshots/clickup/README.md` plus four per-file tables citing all 6,478 images by `mobbin_url`. **Sourcing differs from this packet's earlier legs and is not covered by CHK-030:** Mobbin is a paid library and these came through the operator's authorized MCP session, not anonymous public fetches — the position, and the delete-images-keep-citations fallback, are written in the README's "Sourcing position". Like `screenshots/anytype/`, nothing here is in `tools/screenshots/manifest.json`; `screenshots/manifest.json` was not touched
- [ ] T034 Confirm none of the four apps' captures entered `screenshots/manifest.json` — a Mobbin
      screenshot has no in-repo source to hash, matching D5's rule for an Anytype capture
- [ ] T035 [B] Content-based reclassification of the Notion web and iOS captures: a Sonnet agent
      reads the images in batches of ~50, moves each file into the group its pixels depict and
      rewrites the README index. Opened 2026-09-06 because the harvest's grouping is
      **query-derived** — 5 of 9 web spot checks sat in a group they do not show, and the README
      says so. **Notion half done** (`screenshots/notion/reclassification-2026-09-06.tsv`).
      **Fibery half done** in `worktrees/195-fibery-reclassify`: same pass over
      `screenshots/fibery/web/` (`flows/` untouched — its folders are already a content read, the
      Mobbin flow name). 702 non-flow files (597 `web/screens/` + 105 `web/navigation/`) opened
      and reassigned by content; 694 moved. 45 images spot-checked with the Read tool across every
      group (not just the required 20) surfaced two real defects, both fixed before landing: the
      `ai` group's harvest queries had conflated Fibery's **Insight** database name with
      "AI-generated insight," misfiling 8 of 11 files there (5 into `database`, 2 into `views`, 1
      into `reports`); a rendered, populated Feed view had been filed as an empty state (moved to
      `views`); and one Settings > General screen carried a duplicated whiteboard-canvas reason
      string and sat in `web/whiteboard/` (moved to `settings`). Final per-group counts (702
      total): `views` 115, `database` 136, `editors` 76, `reports` 87, `onboarding` 68,
      `settings` 54, `navigation` 35, `automations` 30, `whiteboard` 30, `collaboration` 31,
      `forms` 21, `marketing` 11, `ai` 3, `dialogs` 3, `states` 2.
      `screenshots/fibery/reclassification-2026-09-06.tsv` records every move (old path, new path,
      reason); ledger and README index agree 1:1 with disk, no duplicate path.
      `screenshots/manifest.json` untouched, `node tools/screenshots/verify.mjs` exits 0.
      **ClickUp half stays open** — now owed, T033 landed 2026-09-07 with query-derived grouping (the landing verifier's 12-image spot check found 6 of 12 files in a folder whose slug their content does not match, so the pass is needed in full). The same pass is owed to Evernote only if
      a spot check finds it needed (its grouping was content-derived at harvest time)
<!-- /ANCHOR:phase-mobbin -->

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

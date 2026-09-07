---
title: "Implementation Summary: Competitor References and Closer PM Alignment"
description: "Nothing has run yet. This records the state the packet opens against, including the contract that currently blocks it."
trigger_phrases:
  - "implementation summary"
  - "047 summary"
  - "competitor reference summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-07T00:00:00Z"
    last_updated_by: "clickup-reclassification"
    recent_action: "Reclassified 2,443 non-flow ClickUp captures by content (T035 ClickUp half)"
    next_safe_action: "Write the negative control red-first against the current schema"
    blockers:
      - "manifest-schema.mjs rejects any reference group but project-manager"
    key_files:
      - "tools/screenshots/manifest-schema.mjs"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 047-competitor-references-and-pm-alignment |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the packet opens against, read from the working tree at
`3a8df24c` and from `brew` on 2026-09-05.

### Opening measurements

- `screenshots/` has two roots today: `notion-clone/` (our own captures) and `project-manager/`
  (16 reference PNGs — gantt and kanban, subtask variants, desktop and mobile, light and dark).
- `screenshots/manifest.json` carries **546** scenario entries. **16** are references, under four
  ids: `reference-gantt`, `reference-gantt-subtask`, `reference-kanban`, `reference-kanban-subtask`.
- Those reference entries are **rendered from vendored source**. `reference-gantt`'s `sources` array
  names `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts` and a dozen more real files,
  which is what `verify.mjs` hashes for freshness.
- **`tools/screenshots/manifest-schema.mjs:118` rejects any reference entry whose `group` is not
  `"project-manager"`**, and `:52` limits `REFERENCE_RENDERERS` to `pm-kanban` and `pm-gantt`. A
  capture under `screenshots/anytype/` cannot enter the manifest today.
- `:108-126` also requires a `referenceOf` naming the constructed scenario the entry mirrors. An
  Anytype capture has no constructed counterpart.
- `brew info --cask anytype` → **0.56.5**, `auto_updates`, **Not installed**.
  `brew info --cask appflowy` → **0.14.1**, **Not installed**.
- Prior fidelity measurements, both green and both preceding the operator's verdict: `037`'s AC-007
  matched **60 of 60** `pm-gantt-*` classes with zero divergence at `30c4b746`; `038`'s T12 matched
  **14** carried-forward elements to the pixel at `c563f08`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/screenshots/manifest-schema.test.mjs` | Added | The reference-entry negative control, written red-first against the un-widened contract |
| `tools/screenshots/manifest-schema.mjs` | Edited | Rejects a `file` whose path climbs out of its capture root through a `..` segment |
| `screenshots/fibery/` | Added | 1,800 Mobbin preview captures of Fibery web (860 distinct screen ids: 105 sidebar, 597 standalone, 1,098 across 233 flows) with a README index citing a `mobbin_url` for every capture; untracked by the manifest like Anytype — `tasks.md` T032 |
| `screenshots/clickup/` | Added | T033's ClickUp reference harvest — 6,478 Mobbin captures (iOS 543 / 357 unique screens / 112 journeys; web 5,935 / 3,078 / 609), a README carrying provenance and the saturation evidence, and four per-file index tables citing every image by `mobbin_url`. Non-flow groups (79 iOS, 2,364 web) were content-reclassified by T035 on 2026-09-07 — see that task and the ClickUp reclassification pass section below |

No file under `src/` and no rule in `styles.css` was touched. The gantt comparison below is the
reason: it found nothing in either file to change. The ClickUp harvest (T033) is reference material
only: it adds one new top-level capture folder, stays outside `tools/screenshots/manifest.json`
exactly as `screenshots/anytype/` does, and its completeness rests on a re-sweep in Mobbin's
`standard` search mode — which paginates to ~105 screens per query against `deep` mode's bounded ~15
— returning **0** new iOS screens over 534 calls and 113 new web screens over 1,034.

### Notion reference captures (2026-09-06)

`screenshots/notion/` now holds 3647 Notion screens harvested from Mobbin (iOS 1315 files, 801 unique; web 2332 files, 1540 unique; 472 flows), each cited by `mobbin_url` in `screenshots/notion/README.md`, untracked by the manifest like `anytype/` — T030. The 1205 non-flow files were then opened one by one and regrouped by what each screen shows, moving 862 of them and adding an `ai` and a `marketing` group — T030a, ledger `screenshots/notion/reclassification-2026-09-06.tsv`. So a folder now names the content, while the `<slug>` inside a filename still names the Mobbin query that found the screen and will often disagree with it; `flows/` stays grouped by flow name.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

### The gantt comparison, measured in device pixels

`scratch/gantt-comparison.md` is gitignored, so the table it holds is reproduced here, where it is
committed. Every number below was read off the PNGs with a decoder, not estimated from a viewer.
Desktop is 2880x1800 device px over a 1440x900 CSS viewport; phone is 804x1748 over 402x874. Both
at DPR 2, so **CSS = device / 2**. Reference is `screenshots/project-manager/reference-gantt-*.png`;
ours is `screenshots/notion-clone/views/constructed-timeline-*.png`, the twin its manifest entry
names in `referenceOf`. All four device x theme pairs were opened, plus the four subtask pairs.

#### Identical, measured rather than asserted

| Element | Reference | Ours |
|---------|-----------|------|
| Row pitch | 88 dev / 44 CSS | 88 / 44 |
| Header height, month band, week band | 112 / 56, 48 / 24, 64 / 32 | same |
| Label pane width, desktop | 560 / 280 | 560 / 280 |
| Resize handle | 8 / 4 | 8 / 4 |
| Bar height | 56 / 28 | 56 / 28 |
| Bar widths, rows 0-7 | 67, 48, 67, 111, 157, 199, 243, 287 dev | same, row for row |
| Bar vertical run, row 0 | y 242-297 | y 242-297 |
| Progress fill at 60% | 27 dev of a 44 dev bar | 27 of 44 |
| Milestone diamond | 48x85 dev bbox, 1053 core px | same, to the pixel count |
| Today line | 2 dev core, `rgb(176,58,62)` | same |
| Today diamond | 71x37 dev bbox | same, identical colour histogram |
| Dependency arrows | bbox and per-colour pixel counts | same (ref 2270 bar + 404 link = our 2674) |
| Week column pitch | 308 dev / 154 CSS, i.e. 22 CSS/day | same |
| Month tint edges, relative to today | -1056 and +308 dev | same |
| Status dot | 16 dev / 8 CSS, pane-relative x 60 | same |
| Subtask indentation, rows 0-4 | pane-relative 16, 96, 96, 60, 60 | same |

Every timeline x in ours lands exactly **8 dev / 4 CSS** left of the reference's, and both windows
sit centred on today at exactly 50% of their own chart width. That single offset is D3 below, not a
geometry difference.

#### Five differences, and what produces each

| # | Difference | Reference | Ours | Mechanism |
|---|------------|-----------|------|-----------|
| D1 | Bar, progress, milestone, status dot and group-header label colour | bar `rgb(73,77,82)`, progress `rgb(132,141,152)`, dot and group label `rgb(138,148,160)` — all `#8a94a0` at the SVG opacities. Light: `rgb(208,212,217)` / `rgb(145,154,165)` / `rgb(138,148,160)` | bar `rgb(61,64,108)`, progress `rgb(103,111,213)`, dot `rgb(154,155,158)` (`--text-muted`), group label `rgb(107,116,224)` (`--interactive-accent`). Light: `rgb(189,194,239)` / `rgb(100,112,218)` / `rgb(110,118,129)` | The reference's `resolveProjectConfig` runs `withInUseExtras` (`ProjectConfig.ts:23-28`), which mints a status entry at `FALLBACK_COLOR = '#8a94a0'` for every in-use status id, so `GanttTaskBarRenderer.ts:31`'s `statusConfig?.color ?? --interactive-accent` never reaches its accent branch. Our timeline bench carries no status column at all, so `resolveGanttBarColor` (`calendar-timeline-renderer.ts:1892`) takes the accent and `resolveGanttStatusColor` (`:1898`) takes `--text-muted`. Both fallback chains are the same shape; only the reference reaches a colour first. Already recorded in `tools/bench/reference-fixture.ts`'s `config.statuses` comment |
| D2 | The progress badge's inset from the label pane's right edge | 121 dev / 60.5 CSS | 73 dev / 36.5 CSS | The hover-only add-subtask affordance after the badge. `TaskLabelRenderer.ts:130-138` builds it through PM's `IconButton` -> `ExtraButtonComponent`, and the harness stub (`tools/storybook/obsidian-stub.mjs:241-249`) returns a bare `<button>` without Obsidian's `clickable-icon extra-setting-button` classes, so it lays out at ~46.5 CSS of UA button box. Ours writes those class names itself (`calendar-timeline-renderer.ts:1017`) and `theme.css` sizes it to ~22.5 CSS. A harness stand-in gap, not a port defect: on device both are the same `ExtraButtonComponent`. Rows with no badge match within 1 dev px, in both themes and both variants |
| D3 | Whole-widget inset | 16 CSS left, 16 right; the view spans 1408 of 1440 CSS. Phone 16 / 16 | 40 left, 48 right; 1352 CSS. Phone 28 / 36 | Our capture mounts inside `.note-database-container`, whose `--db-container-padding-inline: var(--db-space-8)` is 24px (`styles.css:52`, `:863`). The reference page mounts `.pm-root` straight into `#shot` and has no analogue. Host chrome, not gantt geometry — it is what produces the uniform 8 dev x-offset above. The extra 8 CSS on our right beyond the 24 is **inferred** to be a reserved scroll gutter, not measured to a rule |
| D4 | Text weight | 555 ink px / 79 297 ink mass on a row label; 394 / 34 753 on the `60%` badge; 485 / 48 225 on `TASK`; 163 core px on `W10` | 480 / 60 060; 339 / 26 624; 447 / 40 217; 128 | Same bbox, same position, same colour, 13-17% fewer ink pixels and 25-30% less ink mass throughout. `styles.css:36` sets `-webkit-font-smoothing: antialiased` on `.db-surface`; the reference page loads no stylesheet of ours and renders at the browser default. The `TASK` header also sits 4 dev / 2 CSS higher in ours (bbox y 182-198 against 185-202) though the pane and its padding are byte-identical — **inferred** to be the same host-stylesheet scope, not measured to a rule |
| D5 | Phone label column | 560 dev / 280 CSS, unconditional (`TimelineConfig.ts:7`, `LABEL_WIDTH = 280`) | 320 dev / 160 CSS, phone only (`calendar-timeline-renderer.ts:72`, `GANTT_LABEL_PHONE_WIDTH`) | Deliberate, and now measured on both sides rather than estimated: on the same 402 CSS px viewport the reference leaves the chart **172 dev / 86 CSS**, under four `week`-scale day units; ours leaves **348 dev / 174 CSS**. The cost of ours is title truncation on rows carrying a progress badge (`row-0` renders `row...`). Kept |

None of the five is a value in `src/views/calendar-timeline-renderer.ts` or in the `.pm-gantt-*`
block of `styles.css`, which is why this leg changed neither. That block was also diffed rule by
rule against the vendored `gantt.css`: **51 rules, 50 declaration-for-declaration identical**, the
51st being our own phone touch-target override on the resize handle, whose base rule is identical
too. The pinned constants agree with the pixels: `ROW_HEIGHT 44`, `HEADER_HEIGHT 56`,
`LABEL_WIDTH 280`, `BAR_PADDING 8` (44 - 16 = the 28 CSS bar measured), week `DAY_WIDTH 22`.

#### Three claims from the comparison leg, corrected

1. **"Zero divergence, two differences"** is refuted on its count, not on its verdict. D2, D3 and
   D4 are visible differences the leg did not list. None of them is a defect in the port, and each
   traces to a file outside the two the leg was allowed to touch — which is why the verdict of
   *nothing to fix in the gantt* survives, and why the count does not.
2. **"The two capture rigs seed `--interactive-accent` with different constants"** is refuted with
   a receipt. Both hosts load the same `tools/screenshots/theme.css`, and the reference's own
   dependency-arrow pixels read `rgb(61,64,108)` — identical to ours. The reference's grey is
   `#8a94a0` from its own fallback palette, not a differently-seeded accent.
3. **"~122px for the chart"** on the phone was an estimate that omitted the container padding and
   the resize handle. Measured: **86 CSS px**. The number is worse than the leg claimed, so the D5
   exception rests on firmer ground than it was given.

#### Evernote captures, 2026-09-06

`screenshots/evernote/` now holds the Evernote iOS and web references harvested from Mobbin's MCP search tools (T031): 105 search screens per platform, 105 iOS and 170 web flows, 1,557 files, each cited by Mobbin URL in its README; the harvest ran as scripted Code Mode loops, and a bare `Evernote` query with every known id excluded returned nothing on both platforms, so 105 per platform is the whole search index rather than a sample. Unlike the Notion harvest, the group folders are content-derived: one query returned every screen, so each file was filed and described from the image, and six group files opened at landing all sat in a folder they depict.

#### Fibery captures, 2026-09-06

`screenshots/fibery/` now holds the Fibery web references harvested from Mobbin's MCP search tools (T032): 1,800 files carrying 860 distinct screen ids — 105 sidebar screens, 597 standalone screens and 1,098 files across 233 flow folders, with 700 ids filed both standalone and inside a flow and 158 only inside a flow. Web only, so there is no `ios/` lane. The index in `screenshots/fibery/README.md` is **per file for the 702 non-flow captures and per flow folder for the 1,098 flow files**, a flow's single `mobbin_url` citing every image in its folder; at landing the index and disk agreed 1:1 on all 1,800 paths, every file was a valid RIFF/WebP 768 px wide, and twelve images opened at random were Fibery desktop chrome with the Mobbin footer. Unlike Evernote and like the first Notion pass, the grouping is query-derived rather than content-verified — `web/screens/` is deliberately flat because a screen is reached by many queries.

#### Fibery reclassification pass, 2026-09-06 (T035)

The 702 non-flow files (597 `web/screens/` + 105 `web/navigation/`) were each opened with the Read tool and refiled into the group its content actually shows, the same method as the Notion pass; `web/flows/` (1,098 files, 233 folders) was left alone because its folder name is already a content read (the Mobbin flow name). 694 files moved; 8 `web/navigation/` files were already correctly grouped and kept their path. `screenshots/fibery/reclassification-2026-09-06.tsv` records every move (old path, new path, reason) and agrees 1:1 with both the git renames and the corrected README index — no duplicate path either side.

45 images were spot-checked with the Read tool across every group (more than double the required 20), and it surfaced two real defects rather than zero, both fixed before landing rather than reported and left: the harvest's `ai` group had conflated Fibery's **Insight** database name with "AI-generated insight" — 8 of its 11 files showed no AI feature at all (5 moved to `database` as view-configuration popovers, 2 to `views` as plain rendered list views, 1 to `reports` as a report wizard); a rendered, populated Feed view had been filed as an empty state (moved to `views`); and one Settings > General screen carried a reason string duplicated from a neighboring whiteboard capture and sat in `web/whiteboard/` (moved to `settings`). Final per-group counts (702 total, unchanged): `navigation` 35, `views` 115, `database` 136, `editors` 76, `reports` 87, `onboarding` 68, `settings` 54, `automations` 30, `whiteboard` 30, `collaboration` 31, `forms` 21, `marketing` 11, `ai` 3, `states` 2, `dialogs` 3. `screenshots/manifest.json` is untouched and `node tools/screenshots/verify.mjs` exits 0.

#### ClickUp reclassification pass, 2026-09-07 (T035)

Done in `worktrees/204-clickup-reclassify`, on the same content-based methodology as the Notion and
Fibery passes. All 2,443 non-flow ClickUp captures (79 iOS, 2,364 web) were opened individually with
the Read tool, in batches, against a running ledger written to a scratchpad file so a crash would
lose no classified work; `*/flows/**` (464 iOS + 3,571 web files across 721 journey folders) stayed
untouched, since a flow's folder name is already a content read via the Mobbin flow name, not a
search-query artifact.

1,669 files moved (51 iOS, 1,618 web) — `screenshots/clickup/reclassification-2026-09-07.tsv`
records every move (old path, new path, one-line reason). Five query-derived web groups emptied
entirely once their contents were re-homed by content (`misc`, `empty-states`, `filters`,
`notifications`, `upgrade`); six new content groups opened to hold what those queries had obscured
(`database`, `automations`, `forms`, `docs`, `whiteboard`, `time-tracking`, `reports`).

Final per-group counts — **iOS** (79 total): `tasks` 18, `views` 13, `collaboration` 13,
`navigation` 9, `menus` 9, `dialogs` 5, `settings` 3, `editors` 3, `ai` 3, `states` 1, `onboarding`
1, `docs` 1. **web** (2,364 total): `tasks` 491, `settings` 355, `views` 186, `ai` 173, `forms` 142,
`chat` 126, `dashboards` 119, `whiteboard` 104, `time-tracking` 89, `database` 88, `onboarding` 75,
`docs` 74, `collaboration` 71, `reports` 63, `automations` 57, `menus` 56, `navigation` 40, `extra`
35, `marketing` 10, `dialogs` 9, `states` 1.

The recurring judgment call across the pass: a rich-text toolbar, a custom-field editor or a cover
picker looks pixel-identical whether it was opened from a Doc, a Task description, or a Dashboard
widget — only the surrounding chrome (breadcrumb, sidebar, a "Milestone" type badge) says which.
Duplicate screen ids recurring across the original query-derived folders (the same screen downloaded
once per query context, per the harvest's own dedup rule) let every ambiguous case be cross-checked
against every other copy of the same screen before it was filed; three cross-checks caught and
corrected an earlier misclassification within this same pass (an AI StandUp screen initially filed
as `collaboration`, a My Tasks aggregate view initially filed as `navigation`, and a Chat channel
screen initially filed as `extra` from a batch-read transcription slip) before the ledger and disk
were finalized.

`screenshots/clickup/README.md` was regenerated with the new layout table, a before/after census,
and a content-classification section explaining the method and its limits (mirroring the Notion and
Fibery READMEs); `index-ios-screens.md` and `index-web-screens.md` were regenerated from disk so
every row's `Group` column matches the file's final folder. Both `*-flows.md` indexes were left
untouched — `*/flows/**` was never moved. README, both screen indexes and disk agree 1:1 on all
2,443 non-flow paths, no duplicate path. `screenshots/manifest.json` is untouched and
`node tools/screenshots/verify.mjs` exits 0.

T034 was verified across all five competitor-reference folders in the same pass:
`grep -c '"screenshots/(notion|fibery|clickup|anytype|evernote)/' screenshots/manifest.json` returns
0. T035's ClickUp half is now closed; the same pass is owed to Evernote only if a spot check finds
it needed, since its harvest grouping was content-derived at capture time.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Contract first, captures second | Nothing can enter the manifest until the reference contract widens, and widening it after the captures exist creates pressure to widen it too far |
| A negative control before the widening | "Still rejects" is a comparison, and a control that only ever ran against the old schema proves nothing about the new one |
| Both image sources | The operator asked for official product images and the installed apps. Marketing renders and real app screenshots show different things and neither substitutes |
| Uncaptured rows are recorded as uncaptured | An absent capture reported as zero gaps is this program's founding failure in miniature |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh --strict` on this folder | Not yet run |
| `npm run gate` | Not yet run |
| `npm run screenshots:verify` | Not yet run against an enlarged manifest |
| Negative control on the widened schema | Not yet written |
| Operator reads the board and timeline | Not yet — and only the operator closes AC-007 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The freshness model has no answer for an external screenshot.** Every reference today is
   rendered from vendored source and hashed. A competitor screenshot has no source at all, and
   `vendor-unavailable` means an unavailable source rather than no source. Widening the lane
   honestly is in scope; inventing a fake `sources` entry to satisfy it is not.
2. **"Align closer" may not resolve to a measurement.** Both prior comparisons found zero
   divergence on what they carried. If the second pass finds zero too, the gap is in the scope of
   what was ported rather than in its fidelity — and that is a conversation with the operator, not
   a fix this packet can make.
3. **`anytype` auto-updates.** A capture drifts from the app silently. Recording the version in the
   entry is the mitigation, not a fix.
<!-- /ANCHOR:limitations -->

---

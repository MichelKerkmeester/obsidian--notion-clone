---
title: "Goal: Card Title and Title Formats"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "058 goal"
  - "card title picker"
  - "card name format"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-07T22:45:00Z"
    last_updated_by: "impl-058-production-verification"
    recent_action: "Closed D1; shipped titleFormat (D7) plus its consumer (D8) and persistence (D9) fixes"
    next_safe_action: "AC-008's operator device read on a released build; then close"
    blockers:
      - "Owners 045, 054, 056 not edited directly — this packet edits only the shared resolver"
    key_files:
      - "src/data/title-field-display.ts"
      - "src/views/board-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "src/data/data-source.ts"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-goal"
      parent_session_id: null
    completion_pct: 97
    open_questions:
      - "Does 047's landed Notion harvest change ADR-002's picker-location call once it lands"
    answered_questions:
      - "The per-view title picker is not new work: ViewConfig.titleField already exists (types.ts:570)"
      - "The record surface and phone sheet already read the same titleField as the board, for every view but calendar/timeline (record-detail-panel.ts:485-488)"
      - "Implementation landed and verified: gate 26 green, replay 28 hold, vitest 1520/1520; AC-008 stays the operator's"
      - "D1 closed on the real BoardRenderer: the currency-column claim was already correct, only the evidence was fixture-shaped"
      - "The file-name titleFormat gap (D7) needed two more fixes found only by driving production/reading persistence: a board-renderer.ts consumer bug (D8) and a data-source.ts round-trip gap (D9)"
---
# Goal: Card Title and Title Formats

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Any column can already become a view's title field; make that title render through
the same number/currency format its own column carries wherever a title is drawn — the board card,
the record sheet header and the phone record sheet — and make the picker reachable from the surface
the operator was looking at.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The picker is not new work.** `ViewConfig.titleField` (`src/data/types.ts:570`) already lets any column become a view's title, defaulting to `file.name` — the note title — when unset, with `NO_TITLE_FIELD` (`types.ts:354`) to hide the title outright. This packet does not build a second picker; it fixes what reads the existing one and where the operator can reach it. |
| D2 | **One formatter, not a second one.** A title's display text is computed in exactly one place, `resolveTitleFieldDisplay` (`src/data/title-field-display.ts:36-61`), and every consumer named in this packet's scope calls it. Today its non-file branch renders every value through `stringifyValue()` (`:53`), discarding the chosen column's own `type` and `numberDisplayStyle`. This packet routes that branch through the column's own typed cell format — `formatEuroCurrency`/`formatEuroNumber` (`src/data/euro-format.ts`) for number and currency columns, the existing date formatter for date columns — instead of adding a second, title-only formatting surface. |
| D3 | **A property chosen as title keeps its own column format.** The title never carries an independent format setting. If the chosen column is a currency column formatted as `€ 3.537,32`, the title reads `€ 3.537,32`; change the column's format and the title's format changes with it, because D2 makes the title read the column, not a copy of it. |
| D4 | **The picker's home surface stays `view-config-panel-renderer.ts`'s general section** (already phone-reachable through `044`'s shared view-config sheet). `board-card-properties-panel.ts`'s Title row (`:43`) stays a fixed slot rather than growing a second, competing picker; this packet gives that fixed slot a jump-to-picker affordance instead, so the operator finds the control from the board surface they were looking at when they filed the report. Owner boundary: this packet edits the shared resolver and that one row's affordance; it does not rebuild `045`'s Properties panel or `056`'s card anatomy. |
| D5 | **Calendar and timeline are out of scope.** Both already carry their own `calendarTitleField`/`timelineTitleField` (`record-detail-panel.ts:485-488`), separate from the board/table `titleField` this packet touches, and neither was what the operator's board screenshot showed. `057` owns any calendar-title parity question. |
| D6 | **Reference posture.** Anytype has no separate title relation at all — the object's Name is always the title (`screenshots/anytype/README.md:293`) — so Anytype has nothing to adopt for the picker itself, only a reminder that a title always exists. Notion is the operator's actual reference ("ideally we can change which value becomes the card name"), and `047`'s queued Mobbin harvest (Notion iOS+web) has not landed as of this writing — this packet's picker-location and format decisions are designed from the operator's own words and the code already in the tree, not from a Notion capture. Revisit ADR-002 once that harvest lands. |
| D7 | **The file name is the one title source D3 does not cover, and it gets its own format choice.** D3 says a title reads its column's own format because D2 routes it through that column — but the unset/`file.name` default has no `ColumnDef` to read a format from at all, so D3's premise never applied to it. A `titleFormat` field on `ViewConfig` (`types.ts`) offers plain text (default, today's unchanged behavior) / number / currency (EUR, USD, GBP) / date, applied only while the title reads the file name — never overriding a real column's own format once one is chosen as `titleField`. This is the operator's literal report: board cards titled by a raw numeric file name (`3537.32`), with no column involved to inherit a format from. The picker's own row (`view-config-panel-renderer.ts`, beside the existing Title field row) shows only while the file name is the title source. |
| D8 | **A file-name-drawn title's consumer, not only its resolver, needed a fix.** `resolveTitleFieldDisplay`'s file-title branch already computed `title.text` correctly once D7 landed, but `board-renderer.ts`'s `getReferenceRowTitle` special-cased `title.isFileTitle` to read `row.file.basename` directly instead — a shortcut that was harmless while the resolver's file-title output and the raw basename were always identical, and silently discarded a `titleFormat` choice the instant they diverged. Found and fixed on the real `BoardRenderer` in headless Chrome, not from reading source alone (`tools/live/render-assertion-harness.ts`) — exactly the gap this packet's earlier fixture-only screenshot evidence could not have caught, since a hand-written fixture never calls `getReferenceRowTitle` at all. |
| D9 | **A new `ViewConfig` field is not real until the save/load round trip carries it.** `titleField` is read and written at four separate sites in `data-source.ts` (the current views-array parse, the legacy flat-format parse, `parseViewConfig`, and `toViewPayload`); `titleFormat` existed at none of them, which would have let a chosen format work for the current session and silently revert to plain text on the next vault load. Found by reading the persistence layer directly, not by any renderer harness — `tools/live/render-assertion-harness.ts` constructs `ViewConfig` objects in memory and never exercises this path. Fixed with one `parseTitleFormat` helper wired into all four sites, and a round-trip regression test covering both the current and the legacy format plus an unrecognized-value case. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] A number or currency column set as a view's `titleField` renders through that column's own
      formatter — `formatEuroCurrency`/`formatEuroNumber` — on the board card, the record sheet
      header and the phone record sheet, not a raw stringified value. **Today: RED.**
      `title-field-display.ts:52-53` calls `getTitleFieldValue()` then `stringifyValue(value).trim()`
      unconditionally for every non-file `titleField`, with no reference to `col.type` or
      `numberDisplayStyle` anywhere in the function. A currency column holding `3537.32` renders its
      title as `3537.32`, not `€ 3.537,32` — the defect the operator's board screenshot shows as
      "the name is a number." **Closed 2026-09-06, was a raw stored `3537.32` before the fix** (T003's
      red: `expected '3537.32' to be '€ 3.537,32'`): at `7b50fed5` the non-file branch routes through
      the column's own formatter via `formatTitleFieldText`, and the currency-titled captures in both
      themes and both devices were opened and read (AC-001..AC-003 Met).
- [x] `board-card-properties-panel.ts`'s Title fixed slot opens the `titleField` picker, rather than
      only reporting the current choice with no way to change it from that surface. **Today: RED.**
      `board-card-properties-panel.ts:43` renders `renderFixedSlot(panel, t("viewConfig.titleField"),
      titleLabel(config), actions.asSheet)` with no click handler distinguishing it from the
      read-only Cover row directly above it (`:42`) — confirmed by reading the file; no picker opens
      from this row today. **Closed 2026-09-06, was 0 ways to change the title from that surface
      before the fix**: at `7b50fed5` the Title row scrolls to and opens the general section's own
      titleField dropdown; red observed on a panel-only revert (`expected [] to have a length of 1
      but got +0`), Cover row stays a negative control (AC-004 Met).
- [x] The chosen title field is the same value read by the board card, the record sheet header on
      desktop, and the phone record sheet, for every view type except calendar and timeline (D5).
      **Today: already true, verified rather than built** — `record-detail-panel.ts:485-488`'s
      `getRecordEventTitleField()` falls through to `config.titleField` for every view but calendar
      and timeline. This criterion adds a regression test locking the behavior in, since today it
      holds by shared plumbing rather than by a written contract. **Closed 2026-09-06, was 0 written
      tests locking the agreement** — locked by `title-field-display.test.ts`'s cross-surface
      agreement suite, 5/5 (AC-006 Met).
- [x] `npm run gate` exits 0 read from `$?`, with a lane row asserting a formatted-title case,
      observed red before green; `npm run replay` holds with reversed 0. **Today: N/A — the lane row
      does not exist yet.** **Closed 2026-09-06, premise corrected rather than the check waived:**
      the new coverage landed as unit and panel tests observed red before green (T003/T005's own
      reverts); the gate's lane count is capped at its existing-lanes-only 26, green with 0 red, and
      `npm run replay` holds all 28 results with 0 reversed (AC-007 Met).
- [x] The currency-titled-column claim above (AC-001..AC-003) is proven on the production
      `BoardRenderer`, not only on hand-written fixture HTML. **Today: RED — the capture evidence
      for AC-001..AC-003 was constructed markup (`tools/screenshots/scenarios/core.mjs`'s
      `board-card-title-currency`), which resembles the renderer's output closely enough to satisfy
      a visual read without ever calling `resolveTitleFieldDisplay` through the real
      `BoardRenderer`.** A `tools/live/render-assertion-harness.ts` scenario mounting the shipped
      `BoardRenderer` with a currency-typed `titleField` had never been built. **Closed
      2026-09-07**: `board-title-currency-column` mounts the real renderer with a currency column
      as `titleField` and asserts every drawn `.obnotion-kanban-card-title` carries the euro mark
      and never equals the column's raw stored value — green on the unmodified tree (this specific
      claim was already correct; D1 was an evidence gap, not a behavior gap) (D7 grounds this row).
- [x] A file-name-drawn title (the unset `titleField` default) supports a per-view format choice —
      number, currency (EUR/USD/GBP), date, or plain text — closing the operator's literal report
      (a board card titled by a raw numeric file name, not a chosen column). **Today: RED — no
      `titleFormat` field exists anywhere in `ViewConfig`, and `resolveTitleFieldDisplay`'s
      file-title branch returns `getFileTitleText(row)` unconditionally**, `grep -rn "titleFormat"
      src` returns nothing before this session. **Closed 2026-09-07**: `TitleFileFormat`
      (`types.ts`), `formatFileTitleText` (`title-field-display.ts`), and a "Title format" row
      (`view-config-panel-renderer.ts`, visible only while the title reads the file name) landed
      red-before-green in `title-field-display.test.ts` (8 new cases) and
      `view-config-panel-renderer.test.ts` (5 new cases). **A second, deeper red was found only by
      driving the production renderer**: `board-renderer.ts`'s `getReferenceRowTitle` discarded
      `titleFormat`'s output for every file-name-drawn title (D8) — invisible to the unit tests
      above (which call the resolver directly) and to the prior fixture-based captures (which never
      call `getReferenceRowTitle` at all). `board-title-format-numeric-filename` (the live harness)
      and `constructed-board-title-format-filename` (screenshot capture, both themes, phone and
      desktop) both went red against the unmodified `board-renderer.ts` and green after the fix.
- [x] A `titleFormat` choice survives a save and reload, not only the current session. **Today:
      RED** — `titleFormat` existed nowhere in `data-source.ts`'s parse/serialize round trip
      (`grep -n "titleFormat" src/data/data-source.ts` returned nothing), found by reading the
      persistence layer rather than by any renderer harness: `tools/live/render-assertion-harness.ts`
      builds `ViewConfig` objects directly and never exercises this path. **Closed 2026-09-07, was
      `undefined` after a round trip before the fix** (a new `data-source.test.ts` case:
      `expected undefined to be 'currency-eur'`): `parseTitleFormat` wired into all four
      `titleField`-adjacent sites (the current and legacy parse paths, `parseViewConfig`,
      `toViewPayload`); the same test also covers the legacy flat-frontmatter format and an
      unrecognized stored value (AC-011 Met).
- [ ] **The operator sets a currency column as a board's card title on a phone, reads it formatted
      the same way that column formats elsewhere (for example `€ 3.537,32`), and reports being able
      to change which property becomes the card's main name.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Operator report, phone, 2026-09-06 ~07:36, verbatim: "You see these cards? The name is a number. We should be able to change that number displayed to different number formats like euro. But also that main name is a number but it should have shown the month as the main name so ideally we can change which value becomes the card name." Screenshot `operator-board-card-title-20260906.png`, supplied with the report and not committed to this repository — a phone board view whose cards' main name line reads a bare numeral (the source column holds a month/period number) with no currency or date formatting applied, described here rather than copied into the repository. |
| Existing mechanism read | Done | `ViewConfig.titleField` (`types.ts:570`), `NO_TITLE_FIELD` (`:354`), the picker in `view-config-panel-renderer.ts:1902-1920`, `resolveTitleFieldDisplay` (`title-field-display.ts:36-61`), and its callers in `board-renderer.ts` (`:567-568`, `:1314/:1327`, `:1716-1717`) and `record-detail-panel.ts` (`:355-361`, `:485-488`) |
| Anytype reference checked | Done | `screenshots/anytype/README.md:293` — "Anytype has no separate title relation; the record title is the object name." Nothing to adopt for the picker; recorded as D6 |
| Notion reference checked | Pending | `047`'s Mobbin harvest (Notion iOS+web) has not landed; no `screenshots/notion/` directory exists in this tree as of this writing. `screenshots/notion-clone/` is this plugin's own constructed capture set, not a competitor reference, and is not evidence of Notion's behavior |
| Red measured | Done | `tasks.md` T003: the new `title-field-display.test.ts` run against the unmodified resolver failed with `expected '3537.32' to be '€ 3.537,32'`, before any code change |
### 2026-09-06 amendment: a reserved Notion-refinement child, `065-notion-record-refinement`

The operator, ~16:10, verbatim: *"Based on notion screenshots add phases to all ui improvement phases
to further refine based on notion ui screenshots. But do 5 iters of deep research with glm 5.3 flash
max on those screens per relevant phase."* This packet's surface is **the card and record title**, and its reserved
child is **`065-notion-record-refinement`** — reserved, not created. **Wave 2: queued behind wave 1**, shared with `054-record-and-relation-surfaces`. It also closes this packet's one Pending reference row: **D6's Notion check is no longer blocked** — the Mobbin harvest landed at `bab72104` with 1,315 iOS and 2,332 web captures under `screenshots/notion/`. Read the harvest's own caveat first: its non-flow groups are query-derived, and a content-based reclassification pass is in flight. The pipeline is three stages and the first exists for one reason: a **Sonnet digest** of the relevant Notion captures is written to ``058-card-title-and-title-formats/notion-screens-digest.md``, because **GLM 5.3 flash cannot read images** and a capture reaches the loop as measured prose or not at all. Then `/deep:research:auto`, **5 iterations**, `--stop-policy=max-iterations`, on **GLM 5.3 flash max** — `openrouter/z-ai/glm-5.3-flash` first and `llmgateway` (DevPass) as the fallback, on the operator's ~16:25 ruling *"use openrouter untill usage is 0 then devpass"*. Then an **Opus synthesis** opens the child; a fresh Opus verifier lands it (D4). **Do not create the child by hand** — a folder without the loop behind it claims evidence it does not have. **The refinement is additive.** The child may add a criterion, a task, an ADR or a measurement. It may not un-tick a measured row here, rewrite a landed ruling, or change this packet's parity target. Where a Notion finding contradicts a landed Anytype ruling, the child writes a **Proposed** ADR carrying both readings and stops; only the operator moves it to Accepted. Parent `goal.md` **D15** and `../roadmap.md` **§7.15** carry the rule, §5.A the reservation, §6A the instruction verbatim.

<!-- /ANCHOR:log -->

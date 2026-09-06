---
title: "Task Breakdown: Notion Table Refinement"
description: "Nineteen rows from the Notion table research synthesis, each carrying the threshold it closes and the value already observed red on this tree, with the operator's 2026-09-06 18:32 rulings folded in."
trigger_phrases:
  - "062 tasks"
  - "notion table refinement tasks"
  - "freeze task"
  - "table guard tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Notion Table Refinement

<!-- SPECKIT_LEVEL: 3 -->

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

Every row carries two things: the **threshold** it closes on, and the **red-first anchor** — the
value already failing on this tree at `94f03c88`, with its `file:line`. Each red was observed during
this packet's opening rather than carried from the research report, which matters here because the
research's second-ranked item had already been fixed on `main` by the time the loop ended.

Operator rows are marked `[B]` with the owner named, and **an agent never ticks one**.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1 — Leg 1: guards on the already-haves

No visual change. Five behaviours that are already at or ahead of Notion and have nothing holding
them there. Written first per `050` ADR-004: assert what is missing **and** separately assert what
already works, so it cannot regress. Every row extends an existing lane —
`tools/live/render-assertions.mjs` — and none creates a new one.

- [x] **T001 [P] Guard the footer's zero-row skip and its phone touch floor**
      (`tools/live/render-assertions.mjs`).
      **Threshold:** a table with zero rows renders no footer; a table with rows renders one
      `+ Calculate` trigger per column, each computing at least 44px min-height under `.is-phone`.
      **Observed red:** neither is asserted anywhere. The skip is one bare statement,
      `if (rows.length === 0) return` (`src/views/table-renderer.ts:804`), and the floor is one rule,
      `.is-phone .note-database-container .db-table-footer-trigger { min-height: 44px }`
      (`styles.css:8486-8488`). **Controls:** remove the return; drop the rule. Notion: `6055725d`,
      `101392c7`, `20a95974` — the digest's own "closest parity" call.
- [x] **T002 [P] Guard the header row's composition** (`tools/live/render-assertions.mjs`).
      **Threshold:** every column header carries a type icon, a label, a menu target, and — where a
      sort rule applies — an ordinal with the matching `aria-sort`.
      **Observed red:** unasserted. `renderPropertyTypeIcon(content, col)` at
      `src/views/table-renderer.ts:633`, the label at `:634`, the sort ordinal and `aria-sort` at
      `:635-646`. **Control:** drop the `renderPropertyTypeIcon` call. Notion: P1 — `19745d87`,
      `35c64a84`, `3b3c3c26`. Ours is **ahead**: Notion's captures put sort state on the chip row
      (`7e310dca`), not in the header.
- [x] **T003 [P] Guard inline multi-select chips and the measurer's cap**
      (`tools/live/render-assertions.mjs`).
      **Threshold:** chips render inline in `.db-multi-select-values` with 4px gaps, and the
      auto-fit width for a multi-select column is `min(Σ(badge + 14) + gaps + 20, 560)`.
      **Observed red:** unasserted. Chips at `src/views/cell-renderer.ts:470-498`, measurer at
      `src/views/column-width.ts:118-125`. **Controls:** stack the chips in a block container;
      remove the 560 cap. Notion: P3 — `21d71e5f`. This closes the digest's own open question §6 Q1.
- [x] **T004 [P] Guard per-option pill colour** (`tools/live/render-assertions.mjs`).
      **Threshold:** two rows with different status or select values in the same column compute
      different badge colours. **Observed red:** unasserted;
      `src/views/cell-renderer.ts:453-468` resolves the colour per option.
      **Control:** force one colour for the column. Notion: `8d6dcf3b`, `6673816d`.
- [x] **T005 [P] Guard the conditional row tint's paint path**
      (`tools/live/render-assertions.mjs`).
      **Threshold:** a row carrying `.db-conditional-format` computes the tint on its `td`
      backgrounds, not only on the `tr`. **Observed red:** unasserted, and this is the row the
      digest read as absent. `applyConditionalFormat` sets `--db-conditional-format-bg` on the `tr`
      (`src/data/conditional-formatting.ts:168-206`), wired at `src/views/table-renderer.ts:85`,
      `:866`, `:911`; `tr.db-conditional-format > td` paints it (`styles.css:1317-1319`).
      **Control:** delete the `td` paint rule — the `tr` still carries the variable and nothing
      shows, which is exactly the failure a `tr`-only assertion would miss. Notion: `142cef4e`,
      `3b3c3c26`, opt-in per `b184ec4c`.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2 — Leg 2: freeze, the one structural adoption

- [x] **T010 Add `frozenColumnKeys` to the view config** (`src/data/types.ts`).
      **Threshold:** `ViewConfig.frozenColumnKeys?: string[]` beside `columnWidths` (`:531`),
      surviving serialise → parse unchanged, and inert when it names a column that no longer exists
      (NFR-R01). **Observed red:** no such field; `ViewConfig` carries `wrapText` at `:527` and
      `columnWidths` at `:531` and nothing else related.
- [x] **T011 Add the freeze action and its menu row** (`src/views/column-menu.ts`).
      **Threshold:** `freezeColumn(col, frozen)` on `ColumnMenuActions`, and one menu row beside the
      wrap row carrying a per-column checked state that persists.
      **Observed red:** `ColumnMenuActions` declares twenty-five actions across `:38-63` and no
      freeze among them; the wrap row sits at `:194-213`, the width rows at `:219-227`. A
      case-insensitive `freeze|frozen` sweep of `src/` and `styles.css` returns only `Object.freeze`,
      a frozen render clock and one prose comment — **zero** hits on a column. Notion: `74fe28d3`,
      `039351aa`, worded *"Freeze up to and including this column"* (digest P7).
- [x] **T012 Make frozen columns stick** (`src/views/table-renderer.ts`, `styles.css`).
      **Threshold:** a frozen `th` and its `td`s compute `position: sticky` with `left` equal to the
      sum of the preceding frozen columns' widths within **±1px** in the render harness; the last frozen
      column paints **no** right-edge shadow at `scrollLeft === 0` and a soft token-derived shadow
      once the table is scrolled sideways, so content is visibly passing *under* the frozen column
      rather than beside it; unfreezing collapses the offset to 0.
      **Desktop only** — the phone switches to content-driven auto layout with no horizontal
      overflow (`styles.css:21021-21035`), and the reason is stated in the code comment rather than
      left as a silent no-phone (`050` D3). **Observed red:** no sticky rule for a column anywhere;
      `.db-table thead` is the only sticky block (`styles.css:5425-5429`). **The visual design is
      ours, marked inference** — no capture in the 98-screen read shows a frozen state (digest P7,
      §6 Q3), so nothing here is copied and the shadow value derives from our own tokens under ADR-004,
      measured in **both** themes. **ADR-005 is Accepted** — operator, 2026-09-06 18:32, verbatim:
      *"Subtle shadow when scrolled past"*; desktop-only stays.
- [x] **T013 Pin the round-trip** (`src/data/`, unit).
      **Threshold:** `frozenColumnKeys` survives serialise → parse; an unknown key is preserved
      rather than dropped, so a downgrade does not destroy the setting.
      **Observed red:** the field does not exist, so there is nothing to round-trip.

## Phase 2b — Leg 3: the quality-of-life batch

Independent of each other. They share `styles.css` and serialize through the parent's CSS lane.

- [x] **T020 [P] Give a date an end** (`src/views/record-surface/cell-editor-date.ts`,
      `src/views/cell-renderer.ts`).
      **Threshold:** an optional end value, an *End date* row in the picker, and a cell that renders
      both ends in one string. Malformed cases from `spec.md` §8 render without throwing.
      **Observed red:** no end or range concept in any of the 546 lines of `cell-editor-date.ts`,
      and `renderDate` formats exactly one value (`src/views/cell-renderer.ts:537-541`). Notion:
      `bd482935`. Timezone and Remind rows are out of scope.
- [x] **T021 Bring the four type registries into step**
      (`src/data/types.ts`, `src/views/record-surface/type-picker.ts`,
      `src/views/property-type-icon.ts`, `src/data/column-types.ts`, `src/views/column-menu.ts`).
      **Threshold:** **twenty-one** types, one glyph and one label each, the four registries the
      same length and the same members, and the grouped submenu's slice boundaries corrected so the
      new types land in the right group. The eight added are **Person, URL, Email, Phone, created
      time, created by, last edited time, last edited by** — every type on `af7a18b0`'s canonical
      list that our union lacks (digest §P2). Notion's Formula and Rollup are already ours as
      `computed` and `rollup`, and Files & media as `files`, so the set is eight and not more.
      Each row ships **enabled with a real renderer behind it**; the four audit types are read-only
      and computed from the note. **Observed red: thirteen, in four places that must move
      together** — the union at `src/data/types.ts:82`, `PROPERTY_TYPES` at
      `src/views/record-surface/type-picker.ts:28-32`, `PROPERTY_TYPE_ICON_NAMES` at
      `src/views/property-type-icon.ts:32-46`, `COLUMN_TYPE_LABELS` at
      `src/data/column-types.ts:135-151`; the submenu slices `PROPERTY_TYPES` at 6 and 9
      (`src/views/column-menu.ts:262-264`), so a bare append lands in Advanced whatever it is. The
      guard is part of the row: one assertion that the four lists agree. Notion: `af7a18b0`,
      `7f2dbda0`, `3b3c3c26`. **ADR-007 Accepted, option 1 widened** — operator, 2026-09-06 18:32,
      verbatim: *"All types or add more as needed"*. The research's estimate of eighteen is
      superseded; the count is **13 → 21**.
- [x] **T021a Settle Person's vault value source in writing, before its renderer**
      (`decision-record.md` of the implementing packet).
      **Threshold:** an ADR that names whether a Person value stores a wikilink to a person note or
      plain text, and that states the storage shape, the cell rendering and the editor that follow
      from it. Written **before** the Person renderer exists, not alongside it.
      **Why it is a row and not a block:** an Obsidian vault has no user directory, so unlike the
      other seven types Person has no obvious value source (ADR-007's own constraint). The operator
      recorded it as an open implementation decision rather than a gate — the other seven types do
      not wait on it, and T021 can land them first.
- [x] **T022 [P] Make the resize handle visible on header hover** (`styles.css`).
      **Threshold:** the handle's computed background changes on `th:hover`, from a token-derived
      colour clearing 3:1 non-text contrast in **both** themes (`050` ADR-005,
      `../design-system.md` §12). **Observed red:** `.db-resize-handle` (`styles.css:5655-5663`) is
      a 4px absolutely-positioned strip with `cursor: col-resize` and **no background declaration
      and no `:hover` rule anywhere in the file** — it paints nothing at any time. Notion:
      `d53b3912`, where the grip becomes visible on selection.
- [x] **T023 [P] Add the *Show vertical lines* view switch**
      (`src/data/types.ts`, `styles.css`).
      **Threshold:** switch off ⇒ no `td` computes a right border; switch on ⇒ the computed borders
      are unchanged from today. **Observed red:** unconditional. `.db-table th, .db-table td`
      declares `border-right: 1px solid var(--db-border-subtle)` with no gate
      (`styles.css:5414-5421`, the declaration at `:5416`). Notion: `d3acf726`. **This row's first
      read also owes an answer on the sixth P10 toggle, *Show data source title*** — the loop did
      not locate it and deliberately did not guess.
- [x] **T024 [P] Render an empty visible property as empty in the peek**
      (`src/views/table-record-peek.ts`).
      **Threshold:** a muted placeholder for an empty visible property in the docked peek; **table
      cells unchanged**. **Observed red:** `valueEl.textContent = text` with `text` empty
      (`src/views/table-record-peek.ts:357-360`) renders a label and a blank. Notion: `050083af`,
      **page-view only** — Notion's own table cells are blank exactly as ours are
      (`src/views/cell-renderer.ts:263-264`, `styles.css:6766-6771`), so changing the cells would
      break parity rather than create it.
- [x] **T025 Give a view a configured add-row noun**
      (`src/data/types.ts`, `src/views/table-renderer.ts`, the view-settings surface,
      i18n × 3 locales).
      **Threshold:** a per-view noun on `ViewConfig` that survives serialise → parse; `+ New <noun>`
      where it is set, today's string where it is unset, empty or whitespace-only — with no trailing
      space in the fallback; the `+ New` framing and its fallback present in all three locales. The
      noun itself is reader-authored text and is **not** a translation key; the framing around it
      is. **Observed red:** fixed. `` `+ ${t("toolbar.new")}` `` at
      `src/views/table-renderer.ts:982`. Notion varies it by data source — `+ New page`
      (`19745d87`) against `+ New task` (`e33466b4`), which is a data-source concept an Obsidian
      vault does not have — hence a configured noun rather than a derived one. **ADR-006 Accepted** —
      operator, 2026-09-06 18:32, verbatim: *"Per-view configured noun, fallback 'New'"*.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3 — Leg 4: harness, captures and the device read

- [x] **T030 Register two capture scenarios for the two new visual states**
      (`tools/screenshots/scenarios/core.mjs`).
      **Threshold:** `table-frozen-column` and `table-vertical-lines-off`, each in dark and light,
      registered in the same change that creates the state, with a `sources` list naming every file
      the capture actually depicts. **Observed red:** neither state exists, so neither is
      photographed; the file carries `table-wrap-off` at `:31` and its `-on` pair as the pattern to
      follow. A registered-but-uncaptured scenario is reported as a failure, which is the property
      that keeps this honest.
- [x] **T031 Recapture, and read the movers by scenario** (`npm run screenshots`).
      **Threshold:** every capture whose content changed is opened and looked at; the protected
      entries are `pixelHash`-identical; byte-only re-encodes are restored to their committed bytes
      rather than recommitted as churn. **Observed red:** the border gate in T023 moves every table
      capture, and a count alone cannot tell a real regression from an encode.
- [x] **T032 Take the gate** (`npm run gate`, `npx tsc --noEmit`, `npm run build`,
      `npx vitest run`, `npm run screenshots:verify`).
      **Threshold:** each exits 0 with its output and exit status read directly, not through a pipe.
      Every new lane row is green on the tree and red under its own control, **both observed**.
- [ ] **T033 [B] The operator's device read** — **operator-owned, never ticked by an agent.**
      Three questions no harness in this repository answers.
      **(a) The frozen column mid-scroll on iOS.** WebKit's sticky-inside-table behaviour is not
      something the render harness stands in for, and no capture of a frozen state exists anywhere
      to compare against (digest P7, §6 Q3).
      **(b) Every new colour in dark theme.** Zero of the 102 opened screens are dark (digest
      preamble, §6 Q6), so the divider, the handle line and any tint are unverified there by
      construction.
      **(c) The title-cell affordance at 390px.** Notion lets its OPEN pill overlap the tail of a
      long title rather than truncating first (`19745d87`, `35c64a84`, `d9d61160`); ours is a
      button — always-visible on touch, hover-labelled on desktop
      (`src/views/table-record-peek.ts:86-114`, touch branch `:102-104`) — inside a phone `td`
      capped at 60vw with ellipsis (`styles.css:21029-21035`). Whether it steals title width,
      overlaps the ellipsis or collides with the link hit area **was not measured by the loop, and
      no number is guessed here**. The check: the button stays inside its own inline box, the
      ellipsis lands on the text, and the two hit areas are disjoint. **This row owes its own
      threshold before it can be read.**
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- Every row in `acceptance-criteria.md` is `Met`, `Waived` with an ADR or `Superseded` with an ADR,
  except AC-009 which only the operator closes.
- ADR-003, ADR-005, ADR-006 and ADR-007 have moved from Proposed to a recorded decision. **All four
  were ruled on 2026-09-06 18:32 and no row in this packet is blocked on the operator any more**,
  except AC-009 / T033, which are a device read rather than a decision.
- Person's value source has its own ADR, written before the Person renderer (T021a).
- The `064` pointer in ADR-003 has been carried into `064`'s own tasks once that packet exists.
- `npm run gate` exits 0 and the three build gates with it.
- The two new capture scenarios exist, are current, and have been looked at.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Document | What it holds |
|----------|---------------|
| `goal.md` | The durable directive and the nine binding criteria |
| `spec.md` | Scope, requirements, risks, open questions |
| `acceptance-criteria.md` | The measurable form of the criteria, with the red value per row |
| `decision-record.md` | ADR-001 to ADR-007 |
| `../053-toolbar-and-view-controls/research/research.md` | The research of record, 5 iterations, 26 findings |
| `../053-toolbar-and-view-controls/notion-screens-digest.md` | The Notion source of record, 98 screen ids |
| `../roadmap.md` §5.A, §6A, §7.15 | Where this phase sits and the rule it lands under |
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
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] N/A — no input crosses a trust boundary here. Recorded rather than silently skipped
- [ ] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 0/12 |
| P1 Items | 15 | 0/15 |
| P2 Items | 6 | 0/6 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented (if applicable)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response time targets met (NFR-P01)
- [ ] CHK-111 [P1] Throughput targets met (NFR-P02)
- [ ] CHK-112 [P2] Load testing completed
- [ ] CHK-113 [P2] Performance benchmarks documented
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured (if applicable)
- [ ] CHK-122 [P1] Monitoring/alerting configured
- [ ] CHK-123 [P1] Runbook created
- [ ] CHK-124 [P2] Deployment runbook reviewed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review completed
- [ ] CHK-131 [P1] Dependency licenses compatible
- [ ] CHK-132 [P2] OWASP Top 10 checklist completed
- [ ] CHK-133 [P2] Data handling compliant with requirements
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation complete (if applicable)
- [ ] CHK-142 [P2] User-facing documentation updated
- [ ] CHK-143 [P2] Knowledge transfer documented
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Technical Lead | [ ] Approved | |
| Operator | Product Owner | [ ] Approved | |
| Operator | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->

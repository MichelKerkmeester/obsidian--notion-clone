---
title: "Acceptance Criteria: Notion States Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "066 acceptance criteria"
  - "notion states closure gate"
  - "dwell criterion"
  - "chip criterion"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-06T16:10:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Authored the acceptance criteria from the Notion states research loop"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-006 and AC-007 are the operator's"
    key_files:
      - "src/views/toast.ts"
      - "src/views/database-view.ts"
      - "src/views/empty-state-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator hold or reverse the two Anytype rulings"
    answered_questions:
      - "Five of the seven criteria were already red on the tree at 38bba1e3"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion States Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/066-notion-states-refinement`
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06

Every threshold below was **observed red on the tree at `38bba1e3`** while this packet was written,
with the `file:line` in the Verification cell. Five of the seven needed no failure invented for them.
No Notion number appears in any threshold: the digest states no device-pixel ratio, so this packet
adopts Notion shapes and behaviours and takes every number from the tree or from an ADR that says it
is an inference.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a `success` toast carrying an action, **When** 3000ms elapse, **Then** the card is still connected; **and Given** a plain `success` toast, **When** 2500ms elapse, **Then** it is gone; **and Given** an `error` toast, **When** any time elapses, **Then** it waits for the reader | A Vitest with fake timers importing the production `showToast`, asserting all four cells of the severity × action matrix. **Today: red.** `AUTO_DISMISS_MS = 2200` is the only dismissal constant (`src/views/toast.ts:62`) and the only `setTimeout` reads it for every success (`:137`), including the delete Undo toast (`src/views/database-view.ts:8369-8373`) and the gallery-migration Undo toast (`:2718-2723`) | Unmet | - |
| AC-002 | REQ-002 | **Given** a delete that throws, **When** the catch runs, **Then** `.db-toast.is-error` is rendered and does not auto-dismiss | An integration test forcing the failure, asserting the class and the absence of a scheduled dismissal. **Today: red.** `src/views/database-view.ts:8378` raises a bare `new Notice(t("errors.deleteFailed", …))` two lines below a `showToast` that carries severity and an action | Unmet | - |
| AC-003 | REQ-002 | **Given** the owned operation paths in `database-view.ts`, **When** the census is taken, **Then** the bare-notice count has fallen from its recorded start and every migrated site renders the toast | `rg -n "new Notice\(" src --glob '!*.test.ts' \| wc -l` recorded in the lane row, alongside a per-site assertion that the toast renders. **Today: red at 242**, three of which are the same `errors.deleteFailed` key (`:3681`, `:8378`, `:8468`) while the rail's own `showOperationResult` (`:11316-11334`) already models the correct shape | Unmet | - |
| AC-004 | REQ-003 | **Given** a board group whose relation was deleted, **When** it renders in a compact context, **Then** an inline chip appears with a warning icon, a label, a chevron action and `aria-live="polite"`, it never auto-dismisses, and its background resolves from a host token with zero hex literals | A render test on the compact path plus a lane row reading the computed background. **Today: red.** `grep -c "db-inline-chip" styles.css` is **0**; `source-missing` and `group-relation-deleted` are members of the fourteen-strong union (`src/views/empty-state-renderer.ts:25-39`) and both render only through `renderCard` (`:295-330`) | Unmet | - |
| AC-005 | REQ-005 | **Given** `styles.css`, **When** the comment-excluded fast-band declaration census runs, **Then** it reads 0 | The lane row's declaration census, counting declarations rather than grep hits. **Today: red at 4** — `:200`, `:473`, `:7431`, `:22745`, all `120ms ease-out` against `--db-transition-fast: 120ms ease` (`:122`); the raw grep reads 7 because it also matches the definition and the comment at `:430` | Unmet | - |
| AC-006 | REQ-004 | **Given** `055`'s `goal.md` §3 and `tasks.md`, **When** each load-bearing figure is re-derived from the tree, **Then** the document and the tree agree | Five restatements and two ticks, each carrying a same-day `file:line`. **Today: red on five rows** — the toast row's *0 of 247* against a census of 242 and a `showToast` Undo at `database-view.ts:2718-2723`; the item-9 row's *12 reasons at `:24-36`* against **14** at `empty-state-renderer.ts:25-39`; the E4 row's *RED, `row-menu.ts:166-176` calls `confirmWithModal`* against the landed "No confirm here" comment at `src/views/row-menu.ts:163-171`; the motion row's *42 declarations* against 4; and `tasks.md` T003 (`:102`) plus the T019 amendment (`:652`) unticked against landed work | Unmet | - |
| AC-007 | REQ-006 | **Given** the two Notion findings that contradict a landed Anytype ruling, **When** this packet closes, **Then** each is recorded as a Proposed ADR naming both readings and neither has been applied | `decision-record.md` ADR-001 (destructive-confirm weight, `screen:28751c29` against `screen:348fd2b7`, against one `danger` boolean at `src/views/modals/confirm-modal.ts:28` themed at `src/views/confirm-sheet.ts:69`) and ADR-002 (toast placement, `screen:56f376d3`, against the Anytype-measured corner card at `styles.css:2724-2736`), both `Proposed`, both awaiting the operator | Unmet | - |
| AC-008 | REQ-001 | **Given** the operator on a handset, **When** they delete a row and reach for Undo, **Then** the target is one-hand reachable at the rail's clamped width, and **When** iOS `Reduce Motion` is on, **Then** the skeleton shimmer stops and entrances snap inside the plugin's WKWebView | The operator device pass (`055` `tasks.md` T017), rows D-2 and D-1. **Today: unverified, and unverifiable from this repository** — media-query behaviour inside a webview and one-hand reach at `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`) are exactly the class of fact the device pass owns. Only the operator closes this row | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Eight criteria, none met: the packet was opened by a research synthesis and no source file has been
touched. Write this section when the packet closes, naming which criteria carried it and what was
consciously left out — the five refused Notion patterns in `goal.md` §4 are the standing candidates
for that last sentence.
<!-- /ANCHOR:closure -->

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
    last_updated_at: "2026-09-06T16:50:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:50 rulings into AC-007 and added AC-009"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-008 is the operator's device read"
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
      - "Whether the centred placement reads correctly on a handset — device-only, AC-008"
    answered_questions:
      - "Five of the seven criteria were already red on the tree at 38bba1e3"
      - "The operator held one destructive weight and split toast placement by form factor (18:50)"
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
| AC-001 | REQ-001 | **Given** a `success` toast carrying an action, **When** 3000ms elapse, **Then** the card is still connected; **and Given** a plain `success` toast, **When** 2500ms elapse, **Then** it is gone; **and Given** an `error` toast, **When** any time elapses, **Then** it waits for the reader | A Vitest with fake timers importing the production `showToast`, asserting all four cells of the severity × action matrix (`src/views/toast.test.ts` "toast dwell matrix"). **Was red**: stashed `toast.ts`, the matrix test failed at 3000ms (0 children). **Green:** `ACTION_DISMISS_MS = 5000` selected on `options.action` (`toast.ts:68`, `:144`); 15/15 `toast.test.ts` pass, all four matrix cells including both `error` cells unchanged | Met | - |
| AC-002 | REQ-002 | **Given** a delete that throws, **When** the catch runs, **Then** `.db-toast.is-error` is rendered and does not auto-dismiss | An integration test in `deletion-undo.test.ts` (`Object.create(DatabaseView.prototype)` harness, `showToast` mocked) forcing `trashNote` to reject. **Was red**: stashed `database-view.ts`, `raisedToasts` held nothing. **Green:** the catch at `database-view.ts:8383` now calls `showToast({ severity: "error" })`; 18/18 pass, zero bare `Notice` calls in the failure path | Met | - |
| AC-003 | REQ-002 | **Given** the owned operation paths in `database-view.ts`, **When** the census is taken, **Then** the bare-notice count has fallen from its recorded start and every migrated site renders the toast | `rg -n "new Notice\(" src --glob '!*.test.ts' \| wc -l`. **Was red at 242.** **Green: 239** — the three owned `errors.deleteFailed` sites (`:3681`, `:8378`, `:8468` at packet-open line numbers) now call `showToast`, each proven to render by the AC-002 test's shape. **Residual:** the drop is recorded here and in `tasks.md`/`goal.md`; no permanent `tools/live/` lane row asserts it going forward (see `tasks.md` T012) | Met | - |
| AC-004 | REQ-003 | **Given** a board group whose relation was deleted, **When** it renders in a compact context, **Then** an inline chip appears with a warning icon, a label, a chevron action and `aria-live="polite"`, it never auto-dismisses, and its background resolves from a host token with zero hex literals | A render test on `renderInlineChip` directly (`empty-state-renderer.test.ts`, 4 new cases) plus a `styles.css` read for the background. **Was red**: `renderInlineChip is not a function`. **Green:** the method exists, renders `alert-triangle`, `role="status"`/`aria-live="polite"`, the wired chevron action, and no button when no action is given; 35/35 pass. `.db-inline-chip`'s background is `color-mix(in srgb, var(--text-error) 10%, var(--background-primary))`, zero hex literals | Met | - |
| AC-005 | REQ-005 | **Given** `styles.css`, **When** the comment-excluded fast-band declaration census runs, **Then** it reads 0 | `grep -c "120ms ease-out" styles.css` (comment-excluded declarations) plus the permanent `motion-tokens.test.ts` guard. **Was red at 4** (re-located at `:204`, `:477`, `:7435`, `:22853` — drifted from the packet's `:200`/`:473`/`:7431`/`:22745`). **Green:** reads **1** (the new `--db-motion-fast-out` token definition, not a declaration) — 0 raw declarations remain; `motion-tokens.test.ts` updated and 7/7 pass | Met | - |
| AC-006 | REQ-004 | **Given** `055`'s `goal.md` §3 and `tasks.md`, **When** each load-bearing figure is re-derived from the tree, **Then** the document and the tree agree | Five restatements, each carrying a same-day `file:line`, re-derived 2026-09-07. Toast row now **239** (not the 242 this packet opened with — T006 landed first); item-9 row now **14** reasons, ticked; E4 row confirmed GREEN, ticked; motion row now **0** declarations. `tasks.md` T019's amendment and T020 ticked; **T003 deliberately left `[ ]`** — its own unclosed gap is untouched by this packet's scope, so reconciling it means confirming it, not ticking it | Met | - |
| AC-007 | REQ-006 | **Given** the two Notion findings that contradicted a landed Anytype ruling, **When** this packet closes, **Then** each carries the operator's ruling quoted verbatim with its date and time | **Both ruled 2026-09-06 18:50, already recorded verbatim in `decision-record.md` at packet-open** — this row's own status had not been refreshed to match. ADR-001 — *"Keep one weight"*: the single `danger` boolean at `src/views/modals/confirm-modal.ts:28` themed at `src/views/confirm-sheet.ts:69` holds, **0** lines of code. ADR-002 — *"Centre on phone, keep corner on desktop"*: the placement splits by form factor, the desktop corner at `styles.css:2724-2736` stays, and the phone half landed as T017 | Met | - |
| AC-008 | REQ-001 | **Given** the operator on a handset, **When** they delete a row and reach for Undo, **Then** the target is one-hand reachable at the rail's clamped width; **and When** iOS `Reduce Motion` is on, **Then** the skeleton shimmer stops and entrances snap inside the plugin's WKWebView; **and When** the centred stack renders on the same handset (ADR-002's 18:50 ruling), **Then** it reads as placed for the thumb rather than as a card pinned to the right edge | The operator device pass (`055` `tasks.md` T017), rows D-2 and D-1, plus the centred-placement read ADR-002 owes. **Still unverified, and unverifiable from this repository** — media-query behaviour inside a webview and one-hand reach at `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`) are exactly the class of fact the device pass owns. Only the operator closes this row | Unmet | - |
| AC-009 | REQ-007 | **Given** a phone viewport in the band `styles.css` carries (re-located at `:21053`, drifted from `:20945`), **When** the toast stack or the operation-result rail renders, **Then** the card is horizontally centred with computed left and right margins equal within **±1px** at 390px and at 430px; **and Given** a desktop viewport outside the band, **Then** both anchors are unchanged — the stack at `right: var(--db-space-5)` (`styles.css:2724-2736`), the rail at `right: 16px` (`:2714-2719`) | **Implemented and verified by CSS arithmetic on the same constants the red state cites, not by a browser-rendered lane row** (that lane row is `tasks.md` T012's residual). **Was red twice over** (unchanged by this packet outside the band): −6px at 390px, 30px-vs-16px at 430px. **Green by construction:** inside the band both `.db-toast-stack` and `.db-operation-result-rail` now carry `left: right: var(--db-space-6)` (16px) with `.db-toast.is-inline` at `width: 100%`, making both margins equal at every phone-band width, not only 390px. Desktop rules (`:2724-2736`, `:2714-2719`) are untouched — confirmed by reading them unchanged | Unmet | - |

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

Seven of the nine criteria are `Met`, each by a proof at least as strong as its own Given/When/Then
asks for: a fake-timer Vitest run against the production `showToast` (AC-001), a full integration
test against the real class prototype (AC-002, and the render-shape half of AC-003), and a direct
textual read of the shipped `styles.css`/spec docs where the criterion is itself about text or a
static count (AC-003's census, AC-004's hex-free background, AC-005, AC-006, AC-007). Two stay
`Unmet` and neither is this packet's alone to close. **AC-008** is the operator's device pass —
nothing in this repository can verify a WKWebView's `Reduce Motion` behaviour or a thumb's reach on
a real handset, so it waits on `055` `tasks.md` T017 exactly as scoped. **AC-009** is implemented,
and its red-state arithmetic now points the other way, but this criterion is specifically about
*rendered layout* (computed margins under a real cascade, not a static text fact), and arithmetic on
the CSS rule's own stated values is a weaker proof of that than the browser-measured lane row the
Verification cell calls for — `tasks.md` T012 names why that lane row was not built this pass. The
five refused Notion patterns in `goal.md` §4 remain the standing candidates for what was consciously
left out.
<!-- /ANCHOR:closure -->

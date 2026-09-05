---
title: "Acceptance Criteria: Phone Sheet Alignment"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "044 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-05T04:50:00Z"
    last_updated_by: "code-agent"
    recent_action: "Trued AC-001/002/003/005 to the closing leg"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-006 is operator-only; nothing in this repository can close it"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Phone Sheet Alignment

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/044-phone-sheet-alignment
**Level:** 2
**Status:** Draft
**Date:** 2026-09-04
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the shipped phone build, **When** every body-mounted surface that presents as a bottom sheet is enumerated, **Then** each one reached the screen through `applySheetChrome` and none built its own sheet-like container directly. **Failing value today: `db-mobile-column-width-panel` does not** — `src/views/database-view.ts:11412` calls `doc.body.createDiv` and `rg -n 'applySheetChrome' src/views/database-view.ts` returns nothing. | A fresh review at 07be64fe found the old verification cell's `rg -n 'body\.createDiv' src` stale: it matches a local variable named `body` (`board-renderer.ts`'s card-body helpers) and never actually proved "no hit outside the sheet module". True check: `rg -n 'doc\.body\.createDiv\|document\.body\.createDiv' src/views` (excluding tests/stories) lists exactly six producers — `owned-menu.ts`, `option-color-picker.ts`, `icon-picker-popover.ts`, `column-menu.ts`'s subpopover, and `column-width.ts` (backdrop + panel) — and each calls `applySheetChrome` or `positionToolbarPopover` (which calls it) before returning, confirmed by `rg -n 'applySheetChrome\(\|positionToolbarPopover\(' <file>` on each; `tools/live/sheet-grammar.mjs`'s `surface` column proves it live for the four this closing leg registered (owned-menu, date-picker, icon-picker, option-color-picker) plus `column-width`, all green | Met | - |
| AC-002 | REQ-002 | **Given** the column-width adjuster open on a 390x844 phone page, **When** its DOM is measured, **Then** it carries all eight grammar columns `sheet-grammar.ts` reports — spec.md's seven (surface, handle, header with a close affordance over 44px, padded rows, segmented choices, keyboard inset, safe-area inset) plus dropdown conformance as an eighth reported column. **Failing value today: 0 of 8** — the operator's screenshot shows a bare strip with a title at x=0 and a slider bleeding off the left edge. | `sheet-grammar.mjs` row for `column-width`: 8/8 PASS (landed by `worktrees/039-column-width-sheet`; safe-area restored as the true seventh column and dropdown kept as an eighth by this closing leg's predicate rewrite, re-run green); `panel-column-width-sheet-mobile-{dark,light}.png` read by hand | Met | - |
| AC-003 | REQ-003 | **Given** a sheet containing a text or numeric field, **When** the field takes focus and `visualViewport` height is reduced to emulate the keyboard, **Then** the sheet's bottom edge sits above the reduced viewport bottom and the focused field's rect is fully inside the visible area. **Negative control:** with the inset publisher disabled, the same measurement must place the field below the reduced bottom. | `verify-placement.mjs`'s keyboard leg (`node tools/storybook/verify-placement.mjs`, "with no keyboard the sheet still sits on the viewport floor" + "selection bar clears the keyboard the host reports" + the column-width adjuster's own red-then-green keyboard proof, T005/T006's evidence) — trued at HEAD 07be64fe to 373 total checks (373, not 403: 006-list-view-deprecation and other main legs removed superseded assertions since this AC was last counted); this closing leg re-ran it at 370/373, 3 declared reds unrelated to this criterion — the pre-existing paint-contained-widget clip, 016's own accepted grab-band shortfall, and one class-overlap finding this leg's own close-target fix produced on the owned menu, none of them the keyboard-inset check | Met | - |
| AC-004 | REQ-004 | **Given** the settings sheet open on a phone, **When** the grab band is dragged past the flick threshold, **Then** the sheet closes; **and When** its body is measured, **Then** no label wraps against its control and no description text is clipped at the right edge. **Failing value today: the drag does nothing, and the operator's screenshot shows "Leave empty to scan" cut at the right edge.** | Landed by `worktrees/040-settings-sheet` (T007's evidence: `.db-view-config-body` scroll-host split, `renderSheetClose` 44px close routed through `overlayStack.dismissPanel`); `sheet-rebuild.mjs`'s "settings sheet chrome survives its own scroll" case, red-then-green | Met | - |
| AC-005 | REQ-005, REQ-007, REQ-008 | **Given** every instance the inventory ranks, **When** `sheet-grammar` runs in the gate, **Then** it exits 0 with one row per instance per element; **and When** one element is removed from one conforming surface, **Then** the check goes red on that surface alone and green again once restored by hash. | A fresh review at 07be64fe found REQ-007's four dropdown families (owned-menu, icon-picker, option-color-picker, date-picker) absent from the registry, and three of the seven predicates vacuous by construction (`hasSharedDropdownRows` = no `<select>`; `hasSegmentedToggleRows` true when no surface ever uses `.db-segmented`; `hasPaddedRows` = any one `.db-panel-row`). This closing leg rewrote all three to measure or check every match rather than one, added `hasSafeAreaInset` as the true seventh spec.md column (restoring it in place of the lane's own substituted "shared dropdown"), kept dropdown as an eighth reported column, and registered the four families with a header via `createSheetHeader` per the operator's "header everywhere" amendment (superseding REQ-007's original no-title menu variant). Two geometry checks were added to the lane itself (close target ≥44×44, no descendant past the surface's right edge) since no structural predicate can see either — both went red on the settings sheet and the new date-picker before their fixes, exactly the "must go red" proof this AC asks for. `npm run gate` exit 0; `tools/live/sheet-grammar.mjs`: 13 surfaces × 8 columns PASS, every close target 44×44, no surface overflows its own right edge, negative control (handle removed from sort-panel) red-on-that-row-alone then green again on re-mount | Met | - |
| AC-006 | REQ-002, REQ-004, REQ-005 | **Given** a released build installed on the operator's iPhone, **When** the operator opens the column-width adjuster, the settings sheet and the Add view sheet, **Then** each reads as aligned with the other sheets and the settings sheet closes from its handle. Only the operator closes this row; a green gate has already been shown insufficient on this program. **The 0.0.23 report has now landed, and it is a failing one, not merely unconfirmed: the operator's fuller words, "it is possible to add property, sort etc. But all should be debugged, refined, perfected," read the column-width sheet, the settings sheet and the Add view sheet as still failing on this build. Re-asked after 0.0.24.** | Operator report against 0.0.23 (07:02 CEST), recorded on `../roadmap.md` §4 rows 40, 41 and 43, re-asked after 0.0.24 (`origin/main` `28b505f3`) | Unmet | - |
| AC-007 | REQ-006 | **Given** `specs/006-list-view-deprecation/002-hide-and-migrate` has landed, **When** the Add view picker is enumerated, **Then** it carries no **List view** row. Stays open while `006` is unstarted; this phase owns the assertion, not the removal. | `006-list-view-deprecation` landed (`e0e1c568`, withdrew list from `getViewTypeOptions()`); `sheet-grammar.mjs` add-view row: `add-view — no List view row: true`; `add-view-popover-layout.test.ts` asserts the fixture never draws it back in | Met | - |

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

**Closeable:** No — AC-006 only

Six of seven criteria are `Met`, each with observed evidence rather than a reading of the source.
AC-006 is the one this repository cannot close by construction: it is the operator's own device
report against a named release, and that asymmetry is the point of the phase — every previous sheet
fix on this program passed its own gate and still reached the operator broken. The packet stays open
on AC-006 alone until that report lands.
<!-- /ANCHOR:closure -->

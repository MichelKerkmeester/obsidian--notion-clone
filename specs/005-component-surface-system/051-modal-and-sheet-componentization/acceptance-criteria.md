---
title: "Acceptance Criteria: Modal and Sheet Componentization"
description: "The criteria this packet must satisfy before it may be closed, one threshold per requirement, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "051 acceptance criteria"
  - "shell primitive closure gate"
  - "modal componentization ac"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T14:50:00Z"
    last_updated_by: "adr-answers-051-053"
    recent_action: "Recorded the operator's fullscreen and sub-page answers; thresholds unchanged"
    next_safe_action: "Execute T001, the surface inventory, against ADR-002 and ADR-004"
    blockers:
      - "AC-009 gates the geometry rows: they read from 050's design-trueup.md rather than from a fresh capture pass"
      - "AC-010 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/surface-shell.ts"
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/confirm-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Fullscreen survives only for the formula workbench (ADR-004, Accepted); the other three fullscreen subclasses become modal/sheet"
      - "A registered stacked pair may become an in-place sub-page where the Anytype capture shows it, per pair (ADR-002, Accepted)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Modal and Sheet Componentization

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/051-modal-and-sheet-componentization
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-001 through AC-008 align to REQ-001 through REQ-008. AC-009 is the design-evidence row, AC-010
the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390×844 profile with a navbar present. Every threshold carries a failing value
observed on HEAD before the fix (goal D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the modal and sheet family, **When** the legs complete, **Then** exactly one site decides a surface's chrome, **or** each survivor carries a written reason in `modal-surface-inventory.md` | Count of chrome-deciding sites against the recorded baseline of **4** (`db-modal.ts:92-113` plus the three direct `attachSheetChromeToModal` callers at `src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`); each survivor's inventory row cited. Today: **4** | Unmet | - |
| AC-002 | REQ-002 | **Given** a surface presented as a sheet, **Then** its title comes from a declared value, and the heading scrape runs only for surfaces that declare none — with that number counted, not assumed | Declared-title count against a baseline of **0 of 20**; the scrape's invocation counted at runtime in the lane. Today: **0 declared, 20 scraped** (`getSheetTitle`, `db-modal.ts:83-88`) | Unmet | - |
| AC-003 | REQ-003 | **Given** a shell with a sub-page, **When** the sub-page is pushed by pointer, by keyboard and on a phone, **Then** the frame's body and header change in place with a back affordance and the parent's bounding box moves by **\|Δ\| ≤ 1px**; **and When** a picker is opened from a shell, **Then** it opens as its own surface and the parent stays undimmed | Lane row driving all three push paths and the picker path; negative control: push as a stacked child instead, require the box to move and the lane to go red. Today: **no shell affordance exists**, so 0 of 4 paths are assertable | Unmet | - |
| AC-004 | REQ-004 | **Given** the census, **Then** every surface carries an inventory row with all six cells filled — surface → shell role → presentation → changes → Anytype pattern (capture filename or named gap) → stays ours — and no census surface is absent | The inventory's row set diffed against the census in `goal.md` §3; every cited capture resolves under `screenshots/anytype/`. Today: **the file does not exist**; census is 20 subclasses + 3 outliers + 12 header sites | Unmet | - |
| AC-005 | REQ-005 | **Given** every destructive path in `src/`, **Then** each routes through one exported confirm primitive carrying `044`'s seven grammar elements, and no second confirm implementation exists | Grammar lane on the confirm sheet (**7 of 7**); a count of confirm implementations → **1**. Today: **0 of 7 asserted and 0 exported primitives** — `openAndWait` (`modals/confirm-modal.ts:45`, entry `:98`) is correct but is not the family's exported confirm, which is why `053` ADR-003 and `055` D1 both name one that does not exist | Unmet | - |
| AC-006 | REQ-006 | **Given** the shell's rendered geometry, **Then** radius **8px**, padding **16px**/**8px**, divider clearance **8px**, row height **28px**, `panel` width **360px**, phone close **44px** — each read from a named value, with every former per-surface literal named or reasoned | Geometry lane measuring the rendered values; a count of geometry literals in the shell path → **0**. Today: **per-surface literals, no shell geometry**. The **28px** deviation from the 4/8/12/16/24/32 scale is named rather than absorbed: it is simultaneously the measured Anytype row height and our own `design-system.md` §9 coarse-pointer floor | Unmet | - |
| AC-007 | REQ-007 | **Given** the shell's motion, **Then** enter is **200ms `ease-out`** and exit **150ms `ease-in`**, and every surface the shell produces honours `prefers-reduced-motion` | Motion lane plus the reduced-motion assertion; the exit value's provenance recorded — **150ms is the closest in-band value to `047`'s source-read 0.1s**, which sits below the 120ms floor for direct feedback and would read as a cut rather than a dismissal (`design-trueup.md` §4). Today: **per-surface literals** | Unmet | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate >/tmp/gate.log 2>&1; echo $?` runs, **Then** it reads **0** with one permanent lane row per shell deliverable, each negative control observed red then green; `npm run replay` holds with reversed **0**; the **12** registered `sheet-grammar` surfaces and **31** registered stacked pairs stay green | The gate log and the recorded red observations in `checklist.md` C10; the surface and pair counts read from `tools/live/sheet-grammar.mjs`. Today: **the shell's lane rows do not exist** | Unmet | - |
| AC-009 | REQ-003, REQ-006, REQ-007 | **Given** every adopted Anytype behaviour and value in this packet, **Then** each names the row in `../050-anytype-adoption/design-trueup.md` it was read from, and each behaviour that document marks **design inferred from source code, not seen** carries that label here | The inventory's Anytype column read against the true-up's §2 table, REQ-002 and §4. **This packet consumes `050`'s capture read rather than repeating it** — that is `050` ADR-003's regime, and a row claiming capture evidence the true-up does not carry fails this criterion | Unmet | - |
| AC-010 | REQ-001, REQ-003, REQ-005 | **Given** a released build, **When** the operator opens a modal, a sheet, a sub-page and a destructive confirm on iOS and on desktop, **Then** they read as one surface family — debugged, refined, perfected | The operator's own words. **Only the operator closes this row; nothing in this repository can** (parent D3) | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation: the point of a waiver is that someone recorded the reasoning, so
an unbacked waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Every row is open, which is correct for a packet authored the day its census was counted. AC-001 is
the headline — four places decide chrome and the count is the whole argument. AC-005 is the row two
sibling packets are waiting on: both `053` and `055` name a confirm primitive nobody exports yet.
AC-009 is the honesty row: this packet designs against `050`'s capture read and must not claim
evidence that read does not carry. AC-010 is the operator's and is the only row that closes the ask
behind the phase.
<!-- /ANCHOR:closure -->

---
title: "Feature Specification: Sheet Inline Edit Alignment"
description: "Tapping a value in the phone record sheet opened an editor below its label's line and overhanging the row beneath. One mechanism, both defects. A fresh review then corrected three claims, one of which leaves a second inline editor still off-centre."
trigger_phrases:
  - "sheet inline edit alignment"
  - "cell line edit popover"
  - "record sheet editor centre line"
  - "title rename editor offset"
  - "021 inline edit"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/021-sheet-inline-edit-alignment"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Host token read from Obsidian 1.13.4: 15px on desktop, user text size on mobile"
    next_safe_action: "The operator taps a value and the title on device"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-021"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Does the title editor get its own offset, or does the correction become per-anchor?"
    answered_questions:
      - "The sheet opens five editors, not four, and two of them are inline"
      - "The 1px residue is sheet-only; desktop measures 0.00 displacement in both axes"
---
# Feature Specification: Sheet Inline Edit Alignment

> Phase chain: parent [`../spec.md`](../spec.md). **Shipped, with one measured residue still open.**
> The `setPosition` box-conversion defect this phase isolated lives in `popover-position.ts`, one of
> the modules [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md)
> shows the story catalogue cannot see.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Reported from a phone: tapping a value in the record sheet leaves the edit input sitting below the
line its label is on. The screenshot carries a second defect the report does not mention and which is
the worse of the two — the input is taller than the row it belongs to, so its bottom edge lies over
the row beneath it.

Both come from one mechanism, so both are one fix.

**A fresh review after shipping corrected three claims.** Every measured number in this phase
reproduced exactly under an independent probe, including the negative control. Three claims *around*
those numbers did not, and the most consequential is that the sheet opens **five** editors rather
than four — **two of them inline**. The second inline editor is the title's rename popover. It
receives both new declarations and gets a correction derived from the wrong line box, which leaves it
2.4px off centre instead of centred. That is an improvement on the 9.0px it started at, and it is
still wrong, and it is **open**.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 021-sheet-inline-edit-alignment |
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Partial |
| **Created** | 2026-08-30 |
| **Shipped** | 2026-08-30 (`0ff9f9a`) |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Open** | The title rename editor is 2.4px off its own centre line |
| **CSS lane** | **Held and released twice.** Three declarations plus one token swap, all under `.db-record-detail-panel.db-mobile-bottom-sheet` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Tapping a value in the phone record sheet opens an editor 6.6px below the line the value sat on, and
2.5px past the bottom of the row that contains it. The second defect was not reported and is worse:
an editor overhanging the next row is ambiguous about what it is editing.

### Why It Matters

The record sheet is the phone's primary editing surface. An editor that does not sit where the value
was is a surface that reads as broken on first contact, and the overhang means a mis-tap is a
plausible reading of what the user sees.

### Goals

- The inline editor shares its label's centre line.
- The inline editor stays inside its row.
- The inline editor meets the 44px thumb floor the sheet's other editor already holds.
- Desktop is unchanged, and frozen so a leak fails rather than being discovered later.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The number and currency editor, `.db-cell-edit-popover.db-cell-line-edit-popover`, on the phone
  record sheet.
- Three declarations plus one token swap under `.db-record-detail-panel.db-mobile-bottom-sheet`.
- A harness section that opens the sheet and taps each editable value through the shipped renderer.

### Out of Scope

- The desktop record panel, which has the same defect. Excluded deliberately, and criterion 5 freezes
  its numbers so a later phase must update them.
- The three non-inline editors, which are deliberately different affordances.
- The `setPosition` box-conversion defect. Isolated here, named, not fixed.

### What The Editor Actually Is

The first job was deciding whether the editor is an ordinary flex child of the row or an overlay,
because the two want opposite fixes and the row already declares `align-items: center`. It is an
overlay.

**The sheet opens five editors, and two of them are inline.** This corrects an earlier count of four
that appeared in the original write-up of this phase; that claim is withdrawn.

| field type | editor | shape | inline? |
| --- | --- | --- | --- |
| number, currency | `.db-cell-edit-popover.db-cell-line-edit-popover` | absolutely positioned, sized to the value it replaces, placed on it | **yes** |
| the record's title | the same single-line popover class, hosted inside the panel | absolutely positioned, placed on the title | **yes** |
| text, files | `.db-cell-edit-popover.is-mobile.is-inline-overlay` | full sheet width, docked below the row | no |
| date, datetime | the same, plus `.db-date-edit-popover` | full width, docked below the row | no |
| select, status, multi-select | `.db-cell-option-popover` | a list popover | no |

The three docked and list editors are deliberately different affordances and have no business on the
value's centre line. The two inline editors do. This phase measured and fixed the first; **the second
was not measured and its scoping argument explicitly excluded it**, while the declarations reached it
anyway.

Measured, on the phone sheet, through the shipped `CellRenderer`: `position: absolute`, parent is the
sheet panel, and not a flex child of the row. That decides the fix. An out-of-flow box cannot make its
row grow, so "the row contains the editor" has to be bought by sizing the editor to the row rather
than by letting the row stretch.

### The Mechanism

`CellRenderer.editSingleLinePopover` builds the editor and hands it to `positionTextEditPopover`,
which puts the popover's **top** edge on the anchor's **top** edge. In a table that reads correctly,
because a `<td>` and its editor are nearly the same height. In the sheet the anchor is
`.db-board-card-value` — a 21.6px line of text centred in a 44px row — and the editor is 34.8px. So
the editor hangs 6.6px lower than the value it replaced, and its bottom passes the row's.

The offset is arithmetic, not chance: it is half the difference between the two heights, plus the
sheet's own 1px border. That predicts the defect grows with the editor, which is why the device
screenshot shows a far larger overlap than a harness loading only `styles.css` does — Obsidian's
`app.css` gives every input a box of its own and is not present here.

**And it predicts the open residue.** The correction is derived from the value's line box at 21.6px.
The title's line box is 18.85px, so the correct offset there is −12.6px rather than the −11.2px it
inherits. Measured on the title: 9.0px off-centre before, **2.4px after**.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority | State |
|---|---|---|---|
| REQ-001 | The inline editor sits on its label's centre line. | P0 | Met for the value editor |
| REQ-002 | The inline editor stays inside its row. | P0 | Met for the value editor |
| REQ-003 | The inline editor meets the 44px thumb floor. | P0 | Met |
| REQ-004 | The fix holds when a host stylesheet inflates every input. | P0 | Met |
| REQ-005 | Desktop editor geometry is frozen and asserted against a leak. | P0 | Met |
| REQ-006 | Every check drives the shipped open-and-edit path; nothing builds an editor by hand. | P0 | Met |
| REQ-007 | **Both** inline editors sit on their own centre line, each derived from its own anchor's line box. | P0 | **Open** — the title editor is 2.4px off |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Each measured through the real open-and-edit path — the shipped `openRecordDetailPanel` with its
`editCell` wired to the shipped `CellRenderer`, and a click on the value element. Failing numbers are
from the tree as received. Full traceability in [`acceptance-criteria.md`](acceptance-criteria.md).

| # | criterion | threshold | before | after |
| --- | --- | --- | --- | --- |
| 1 | the inline editor sits on its label's centre line | <= 1px | **7.6px** | 1.0px |
| 2 | the inline editor stays inside its row | <= 1px overhang | **2.5px** below the row | 0.5px |
| 3 | the inline editor meets the 44px thumb floor | >= 44px | **34.8px** | 44px |
| 4 | criteria 1 and 2 hold when the host stylesheet inflates every input | <= 1px each | **15.2px / 17.7px** | 1.0px / 0.5px |
| 5 | the desktop panel's editor geometry is unchanged | exact, ±0.5px | 34.8px / 8px / 12px | 34.8px / 8px / 12px |
| 6 | **the title's rename editor sits on its own centre line** | <= 1px | **9.0px** | **2.4px — open** |

The residue in 1 and 2 is the sheet's own `border-top`, and is not sub-pixel noise. `setPosition`
writes a child's `top` as an offset from the container's **border** box while `position: absolute`
resolves it against the **padding** box, so a popover the sheet hosts lands one border-width low and
one right. That is named in §12 rather than fixed here.

Criterion 4 is a stress test, not a claim about what Obsidian sets. Its point is that the fix holds as
the input grows rather than only at the height this harness happens to build.

Criterion 6 is the one a fresh review added. It was not a criterion of the shipped work and the
surface was explicitly excluded from it, which is precisely why it went unmeasured.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk ID | Description | Impact | Likelihood | Mitigation | Outcome |
|---|---|---|---|---|---|
| R-001 | A sheet-scoped rule leaks to desktop | H | M | Criterion 5 freezes the desktop rectangle | **Fired.** The input rule did leak; the first version of criterion 5 could not see it. See §8 |
| R-002 | A literal repeated across three declarations drifts | M | M | `--db-sheet-row-min-height` declared once on the sheet | Held |
| R-003 | A host stylesheet inflates the input and pushes it back out of the row | M | H | The input carries the popover's height rather than setting its own; criterion 4 | Held |
| R-004 | An inline editor the phase did not enumerate receives the declarations | **H** | M | none at the time — the count was wrong | **Fired.** The title editor is 2.4px off; REQ-007 open |
| R-005 | A concurrent session's edits to the shared harness file are lost or mixed in | M | H | Re-verification by content rather than by check count | Held. See `implementation-summary.md` |

**Dependencies.** The css lane, acquired and released twice. `verify-placement.mjs`, which a
concurrent session was editing throughout.

**Dependents.** None. `025` cites this phase's `setPosition` finding as an example of a defect living
in a module the story catalogue cannot see.

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-R01 | Every check drives the shipped path. Nothing in the new harness section builds an editor by hand. |
| NFR-R02 | A negative control that survives unscoping is not a control. Criterion 5's first version did not survive one. |
| NFR-M01 | One literal, one declaration. Three rules have to agree on the row height and two of them derive a negative margin from it. |
| NFR-M02 | Comment hygiene: no spec paths, phase numbers or task ids in `styles.css`. |

---

## 8. EDGE CASES

- **The harness cannot see the title editor**, for two independent reasons: it stubs the rename entry
  point as a no-op, and the trigger is a double-click rather than a click. **Either alone would have
  hidden it.** That is why criterion 6 could not have failed here, and why it took an independent
  probe to find.
- **A negative control that passes for the wrong reason.** Criterion 5 originally asserted the desktop
  editor's `margin-top` was still `0px`. Unscoping both new selectors — the mistake it exists to catch
  — left `margin-top` reading `0px` anyway: `--db-sheet-row-min-height` is declared only on the sheet,
  so off it the declaration is invalid at computed-value time and falls back to the initial value.
  Meanwhile the input rule **did** leak and shrank the desktop editor from 34.8px to 31px. The check
  now measures the rectangle and under the same control reports `31/6.1/8.2` against the frozen
  `34.8/8/12`, and the run exits 1.
- **The two bottom-docked overlays are anchored by their bottom edge**, so the border-width
  displacement pushes them in the opposite vertical direction. "Low and right" describes the
  top-positioned editors only.
- **No screenshot shows an open editor**, so no capture could have moved. The capture named for the
  desktop panel renders the sheet presentation at desktop width, so the surface criterion 5 freezes
  has no capture at all.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 12/25 | Three declarations and one token swap, plus a 267-line harness section |
| Risk | 16/25 | A shared placement helper with desktop callers; a shared harness file under concurrent edit |
| Research | 15/20 | The overlay-versus-flex-child question and the offset arithmetic both had to be derived |
| Multi-Agent | 9/15 | A second session held the same harness file throughout |
| Coordination | 10/15 | Holds the css lane; hands a finding to `025` |
| **Total** | **62/100** | **Level 3** |

---

## 10. RISK MATRIX

See §6, which carries outcomes. Two risks fired and both are recorded rather than smoothed: the
desktop leak that the first negative control could not see, and the fifth editor nobody counted.

---

## 11. USER STORIES

### US-001: Edit the value where the value is (Priority: P0)

**As an** operator tapping a number on the phone sheet, **I want** the editor to appear on the line the
value was on and inside its row, **so that** it is unambiguous which field I am editing.

**Acceptance:** criteria 1, 2, 3, 4.

### US-002: Desktop is not collateral (Priority: P0)

**As a** desktop user, **I want** the phone fix to leave my panel alone, **so that** a mobile repair
is not a desktop regression.

**Acceptance:** criterion 5.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- **Does the title editor get its own offset, or does the correction become per-anchor?** The
  vertical correction is currently one value derived from the value's 21.6px line box. The title's is
  18.85px and needs −12.6px rather than −11.2px. A second literal is the small answer; deriving the
  offset from whichever anchor the popover was placed on is the general one. **REQ-007, open.**

### Named, measured, and not this phase's to fix

- **`setPosition` converts to the wrong box.** It offsets from the container's border box while
  `absolute` resolves against the padding box. `fixedContainingBlock` in the same file already
  compensates for exactly this on the leaf, with a comment describing it as "a silent offset of
  exactly the border width" — the sheet path never got the same treatment. **This is sheet-only, not
  desktop-wide**: the sheet chrome stamps the container class onto the panel itself, so the nearest
  matching ancestor *is* the panel and that panel has a border. On desktop the same lookup finds the
  real container, which has none, and displacement measures **0.00 in both axes**. What survives is
  that repairing the shared helper would touch desktop callers — a different claim from desktop being
  affected today.
- **The desktop record panel has the same alignment defect.** Its editor is 34.8px top-aligned onto an
  18.8px value inside a 26.8px row: 8px below the label's centre line and 12px past the row.
  Criterion 5 freezes those numbers, so a phase that fixes desktop has to update them.
- **The sheet's date editor runs off the screen.** On a 390x844 phone the date popover opens 438.9px
  tall below its row and reaches y=1001, with the sheet's own bottom at 848.8. The text editor is
  193px and lands at y=844.3 on the same viewport — inside, but with nothing to spare.
- **The type shrinks at the moment of tap.** The resting value renders at the large step and the input
  that replaces it at the medium one, two steps down, while the box simultaneously grows from 21.6px
  to 44px. This phase enlarged the box and left the type, **widening the mismatch it inherited**.
- **The inline editor's font is 13px, and 16px is the iOS zoom floor.** The value it replaces is 16px,
  and the comment on that rule says it "is also the size below which iOS zooms the whole page when
  this cell becomes an input on tap". The input that appears on that tap is `--db-font-md`, 13px, so
  the protection the comment claims is not delivered. Left alone: raising it makes the editor taller
  and interacts with everything above, and it is not what was reported.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) · [`tasks.md`](tasks.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../025-story-coverage-blindness/spec.md`](../025-story-coverage-blindness/spec.md) — `popover-position.ts` is one of the thirteen modules the story gate cannot see

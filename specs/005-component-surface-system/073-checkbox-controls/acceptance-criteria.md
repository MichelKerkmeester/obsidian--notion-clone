---
title: "Acceptance Criteria: Checkbox Controls (Size and Radio Removal)"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "073 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Checkbox Controls (Size and Radio Removal)

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 073-checkbox-controls
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the app's full source tree, When grepped for radio-shaped controls (`type="radio"`, circular-toggle classes), Then the inventory table's row count matches | Inventory table cross-checked against grep count | **Met** — the tasks.md producer inventory names 3 radio producers (toolbar placement, column-width presets, computed-sync cards); the independent grep over `src/**.ts` finds exactly those 3. The 13-byte-jitter/78-content capture recount in the css-lane release is a different mechanism and agrees there is nothing else | 
| AC-002 | REQ-002 | Given each inventoried boolean radio-style control, When converted, Then it renders and behaves as a checkbox | Before/after capture per control | **Met** — radios 3 → 0 measured by the control-geometry pass (touch-targets, third pass) over the board card, the table and the view-config panel: 0 elements with `role=radio` or `type=radio` remain in the three mounts. The computed-sync native radios are the captured before/after pair (constructed-view-config-desktop-*, both themes); the placement/preset/segmented controls were glyphs-only, so their conversion is text-level (role=checkbox + aria-checked, asserted by column-width.test.ts:158 and the computed-sync card assertions in view-config-panel-renderer.test.ts) | 
| AC-003 | REQ-003 | Given the Notion/Anytype reference, When phone checkbox size is measured, Then the implemented size matches within a documented tolerance | Measurement table, before/after capture | **Met** — measured, not eyeballed: 94 production-rendered checkbox glyphs painted 28×28 before (the pointer:coarse minimum) and 14–18px after, hit area 40×40 → 44×44 and above, all under a forced-coarse 390×844 page; the band, the tolerance and the -15px inset arithmetic are the documented assumptions in decision-record.md. The 91-keeper recapture (css-lane release) is the visual before/after | 
| AC-004 | REQ-004 | Given the Database Testbed board's "Pinned" control (R3 evidence), When `070` restores property reads and this packet lands, Then the control renders as a checkbox showing its real value | Board recapture | **Met** — 070 landed at a75a1ae2 before this packet; the control-geometry board mount (capture-sized typed rows) reads 36 checkbox-property fields, 18 checked, 0 fields rendering a bare `0` — the value slot renders only the shared checkbox (property-row.ts's checkbox branch), so the screenshot's `0` does not reproduce. The board card's glyph is the reference's 14px circle at reference size, within the 44px target; the recaptured constructed-board-* captures are the evidence | 
| AC-005 | REQ-003 | Given the shipped fix, the operator confirms on their own phone that checkboxes are the right size and no radio inputs remain | Operator device check — **operator-owned, never ticked by an agent** | Unmet — the operator's R3 evidence came from their own device; this packet cannot confirm it for them |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

AC-001 through AC-004 are Met with recorded evidence (see the table above). The one open
criterion is AC-005, the operator's own device confirmation, which no agent can tick. Until it
returns, the packet is evidence-complete but not closed.
<!-- /ANCHOR:closure -->

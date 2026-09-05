---
title: "Implementation Summary: Modal and Sheet Componentization"
description: "What this packet has produced so far — T001's capture read and the four packet rows it corrected — and what remains unbuilt, which is all of the code."
trigger_phrases:
  - "051 implementation summary"
  - "shell primitive progress"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T15:45:00Z"
    last_updated_by: "design-agent"
    recent_action: "Landed T001 and trued the packet rows against it"
    next_safe_action: "Execute T002, the red measurement, against design-trueup.md"
    blockers:
      - "No code has changed; every criterion except AC-004 is Unmet"
      - "T010 stays blocked on spec.md §11's second open question, which no capture can answer"
    key_files:
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/design-trueup.md"
      - "screenshots/anytype/README.md"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/db-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-impl"
      parent_session_id: null
    completion_pct: 5
    open_questions:
      - "Do the three FuzzySuggestModal subclasses join the shell or stay Obsidian-native behind a shim?"
    answered_questions:
      - "ADR-002's per-pair list: two of thirty-one registered pairs convert to an in-place sub-page"
      - "AC-003's tolerance is per-axis: width and anchored edge hold, cross-axis extent does not"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 051-modal-and-sheet-componentization |
| **Status** | Draft |
| **Completed** | Not complete — opened 2026-09-05, T001 landed the same day |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**No product code has changed.** One task has landed, T001, and it is the packet's evidence task:
`design-trueup.md`, the surface inventory the packet drafted as `modal-surface-inventory.md` and
which changed its filename and nothing else.

What it contains:

- **35 census rows** — the 20 `extends DbModal` subclasses, the 3 `FuzzySuggestModal` subclasses
  outside `DbModal`, the 12 independent `createSheetHeader` sites — each with surface, shell role,
  presentation, changes, the Anytype capture filename or the named gap, and what stays ours. Twenty
  five name a capture; **ten carry "design inferred from source code, not seen"** and mean it.
- **The per-pair ADR-002 ruling** for all thirty-one registered stacked pairs. Two convert to an
  in-place sub-page; twenty-nine keep `048`'s stacking, ten of those because nothing equivalent was
  captured.
- **The measured value tables**, desktop and phone. The desktop half was re-measured off a second
  capture set and came back identical to `050`'s. The phone half had never been measured, because
  `050` was written before the 118 iOS captures landed.
- **Nine contradictions**, each named with the file that shows it, eight resolved in the capture's
  favour and one against — which is why ADR-005 exists.

**What that changed in the packet.** Four rows, all inside existing requirements: REQ-003 gained a
third navigation move and lost a tolerance nobody could have observed failing; REQ-004 is Met;
REQ-006 gained the phone half of the shell's geometry; ADR-002 gained its list. ADR-005 is new.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

T001 opened the capture files rather than citing them. 151 desktop states in `screenshots/anytype/`,
600 menu files in `screenshots/anytype/desktop/menus/`, 118 iOS sheet files in
`screenshots/anytype/mobile/`, plus our own renders under `screenshots/notion-clone/`. Panel edges
were found by scanning for the border colour, row pitch by ink-band grouping, colours by per-pixel
sampling, contrast by computation from the sampled hex, and the scrim by dividing the luminance of
the same bands with and without the sheet present. The iOS files are 1206 × 2622 at 3×, so every
phone number is stated in pt after dividing by three; a number taken off those files without that
division is wrong by 3× and the row heights read as 150.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Where |
|---|---|
| The sheet engine stays and the shell composes it | ADR-001 (Proposed) |
| A sub-page replaces in place, per pair, with the list of two converts out of thirty-one | ADR-002 (Accepted) |
| The confirm primitive is this packet's and is the only one | ADR-003 |
| `fullscreen` survives only for the formula workbench | ADR-004 (Accepted) |
| `044`'s 44px phone close survives every contradicting capture, because the handle it would be replaced by measures 2.21:1 | ADR-005 (Accepted) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| `validate.sh <this folder> --strict` | first `RESULT:` PASSED |
| Every cited capture resolves under `screenshots/anytype/` | 35 of 35 rows, and all 31 pair rows |
| Census row set diffed against `goal.md` §3 | 20 + 3 + 12 = 35, no surface absent |
| Gate, replay, captures | **Not run — no code has changed.** They are leg boundaries and there have been no legs |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **All of the code remains unwritten.** `surface-shell.ts` does not exist; four sites still decide
  chrome; twenty of twenty surfaces still have their titles scraped; no confirm primitive is
  exported, which is why `053` and `055` both name one that is not there.
- **Ten of the thirty-five rows have no reference at all**, including row 1, the confirm — the
  subject of AC-005. No destructive confirm appears in the 118 iOS states or the 600 menu files, and
  the desktop crawler refuses destructive actions by name. Their designs stay inferred from source.
- **`spec.md` §11's second open question is unanswerable from captures.** Whether the three
  `FuzzySuggestModal` subclasses join the shell or stay Obsidian-native behind a shim is a question
  about our host application, and the reference has no host. T010 stays blocked.
- **One measured value carries a real regression surface.** The phone frame's 8pt inset moves every
  `sheet-grammar` selector that reads a sheet's rect, so it may only land in the leg that updates
  those rows, never earlier.
- **No timing was measured and none could be.** Every motion figure remains `050` §4's reconciled
  band, labelled as a source read. A static capture carries no duration.
<!-- /ANCHOR:limitations -->

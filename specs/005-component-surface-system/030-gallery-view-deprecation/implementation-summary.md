---
title: "Implementation Summary: Gallery View Deprecation"
description: "The gallery is withdrawn from every picker and the renderer is kept, because the view type is written into vault files."
trigger_phrases:
  - "030 implementation summary"
  - "gallery deprecation status"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/030-gallery-view-deprecation"
    last_updated_at: "2026-09-01T03:20:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Importer stops minting galleries; existing ones migrate to board on open with an undo"
    next_safe_action: "Operator opens a migrated gallery on device and tries the undo"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030-impl"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "How long to leave the migration in place before the renderer has no callers left"
    answered_questions:
      - "Withdraw before deleting: the type is persisted, so removal is a data decision"
      - "A vault file still saying gallery migrates to board on open, undoably, rather than to table"
      - "The .base importer was still minting galleries; withdrawal from the pickers did not cover it"
---
# Implementation Summary: Gallery View Deprecation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 030-gallery-view-deprecation |
| **Level** | 3 |
| **Status** | In progress — withdrawn from every picker, no longer minted by the importer, and migrated on open with an undo; the renderer is deliberately kept |
| **State** | Gate 19 green, exit 0; tsc, build and vitest exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

**The gallery is no longer offered anywhere, no longer produced anywhere, and every existing
gallery still opens — as a board, undoably.**

Withdrawn from all three surfaces that offered it: the add-view menu, the view-type change menu,
and the view-config panel's type picker. The renderer, its bench, its captures and its coverage are
untouched, and that is load-bearing rather than incidental: it is what an undo returns to.

**Two things changed on 2026-09-01.** The `.base` importer mapped a `cards` view to `gallery`, so
the plugin kept minting new ones while the pickers refused to offer them — it imports as a board
now, with the cover field landing on `boardImageField`. And an existing gallery migrates the first
time its view renders: `board`, not `table`, because it is the only other surface that draws a cover
image through the same `resolveCoverImage` call.

**A database that already IS a gallery still sees the option in its own picker.** Without that, its
type control would display a value it does not list, and the control would read as broken.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. WHY WITHDRAW RATHER THAN DELETE

`gallery` is a value in a persisted union. It is not only code in this repository — it is a string
sitting in users' vault files. Deleting the renderer without deciding what those configurations do
on upgrade turns a feature removal into data that no longer opens.

So the phase is split at the line where the risk changes:

| | Risk | Reversible |
|---|---|---|
| Withdraw from the pickers | none — nothing that exists stops working | yes, by removing one filter |
| Delete the renderer and the union entry | every vault file saying `gallery` | no, once a release ships |

The first half is done, and the second is no longer waiting on a question about the operator's
data. Migrating on open answers it by making it not matter: whatever a vault holds, opening it
produces a board and offers the way back. What the deletion now waits on is evidence rather than an
answer — once nothing migrates and nothing imports as a gallery, the renderer has no callers.

**The reservation is recorded rather than smoothed: this is a write caused by a read.** Opening a
view changes it. What makes that the reversible default is that it is one labelled undo step, the
gallery's own fields stay on the view so the undo restores the surface exactly, and the renderer is
still shipped.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| Nothing offers it | Filtered in `getViewTypeOptions` and in the view-config picker; asserted by the add-view test, which now requires "Gallery view" to be absent from the drawn rows |
| An existing gallery keeps its picker | The filter is conditional on the current type, so a gallery database still lists it |
| The union is intact | The test asserts **7** types exist and **6** are offered — the entry is present and withdrawn, which is the distinction the whole decision rests on |
| Renderers unchanged | None touched. The only capture that moved is the add-view menu, which no longer draws a Gallery row |
| Gates | `npx tsc --noEmit`, `npm run build`, `npx vitest run` exit 0 — **582 tests** on 2026-09-01. `npm run gate` **20 green**, exit 0 from `$?` |
| Nothing mints a gallery | The `.base` importer maps `cards` to `board`; asserted by the type union check and by tsc, which rejected the stale `viewType === "gallery"` comparison the moment the mapping moved |
| The migration is reversible | 7 unit cases, most of them about what is NOT changed. Two watched failing: stripping the gallery fields, and reversing the plan's field preference. A third control passed and deleted code — a guard against overwriting an existing `boardImageField` could only re-write the value the plan had already chosen |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

**No gallery database has been opened on the operator's device.** The claim that existing views
keep working rests on not having changed the renderer, which is strong but is not the same as
having seen one open.

**The deletion is not done**, so the phase's larger measured footprint — 786 lines, 41 files, 4
captures, a bench and a runner — is all still present.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DECISIONS

| Item | Note |
|---|---|
| Withdraw before deleting | The type is persisted in vault files, so removal is a data decision rather than a code one. Withdrawing carries no data risk and is undone by deleting one filter |
| The current type is exempt from the filter | A gallery database still lists `gallery` in its own picker. Filtering unconditionally would leave that control showing a value absent from its own options |
| The coverage-ratchet row is not applicable yet | It belongs to the deletion. The renderer still exists and is still covered, so there is no new floor to publish |
| A guard count moved, and why | The placement lane required at least 8 rows in the add-view menu as an empty-set guard. One fewer view type means 7. The floor followed the surface rather than pinning a count the check was never about |
<!-- /ANCHOR:decisions -->

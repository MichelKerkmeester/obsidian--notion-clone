---
title: "Goal: Gallery View Deprecation"
description: "What would make this phase worth having done, and the criteria that decide it."
trigger_phrases:
  - "030 goal"
  - "gallery deprecation goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/030-gallery-view-deprecation"
    last_updated_at: "2026-08-31T14:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Importer stops minting galleries; existing ones migrate to board on open with an undo"
    next_safe_action: "Operator opens a migrated gallery on device and tries the undo"
    blockers:
      - "The migration shape for existing gallery-configured databases is undecided"
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030-goal"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "Migrate an existing gallery to board, to table, or refuse with an explanation?"
    answered_questions:
      - "The board is the control: it is the gallery's structural twin and must render unchanged"
---
# Goal: Gallery View Deprecation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The gallery view no longer exists in the plugin, and no user who had one is left
with a database that will not open.

**Why the second half is not optional.** A view type is a string in the user's own vault files, not
only code in this repository. Deleting the renderer is easy; deciding what an existing
gallery-configured database does on upgrade is the work. A deprecation that ships without that
decision converts a feature removal into corrupted-looking data, which is precisely the class of
outcome this packet exists to prevent.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The board is the control. If the board renders unchanged, the deletion stayed inside the gallery. |
| D2 | Delete the renderer, bench, runner, captures, stories and assertion scenario **together**. A half-removed view is worse than either state. |
| D3 | The coverage ratchet is lowered deliberately, with its reason recorded beside the number — never by deleting a scenario and letting the check find out. |
| D4 | Shared code is not gallery-owned. `card-field-renderer.ts` serves every non-table view; touching it is out of scope. |
| D5 | Nothing starts before the operator answers the migration question. The answer changes the size of the work by roughly a file count. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] The migration decision is recorded in this folder, and implemented. **Decided in three parts,
      2026-09-01: keep rendering, stop minting, migrate on open with an undo.**
      **1. Keep rendering.** `gallery` is a value in a persisted union — it is written into vault
      files — so deleting the renderer would leave every database already configured as one unable
      to open. The renderer stays shipped. That is also what makes the undo below mean anything: an
      undone view renders exactly as it always did.
      **2. Stop minting.** Withdrawing the type from the pickers was only half of it. The `.base`
      importer still mapped a `cards` view to `gallery` (`main.ts:1524`), so the plugin kept
      producing new galleries — and a deprecation that migrates on open would have spent its first
      act undoing an import from a minute earlier. `cards` now imports as **board**, with the cover
      field landing on `boardImageField`.
      **3. Migrate on open, with an undo.** An existing gallery becomes a board the first time its
      view renders. `board` is the target rather than `table` because it is the only other surface
      that draws a cover image — the same `resolveCoverImage` call with its own field — so the cards
      keep their covers and their shape. Without this, deleting the renderer later would coerce
      those views through the unknown-type path to `table`: a card grid becoming a spreadsheet with
      no warning and no way back.
      **The reservation, stated rather than buried: this is a write caused by a read.** Opening a
      view changes it. Three things make it the reversible default rather than a liberty — it is one
      undo step labelled as itself (`undo.galleryMigration`), the gallery's own fields are left on
      the view so the undo restores the surface exactly, and the renderer is still shipped. A notice
      names what happened and says undo keeps it a gallery. It runs once per view id per session,
      because `refresh` runs on every scroll and a migration that re-applied would fight the undo it
      just asked for.
      **Watched failing.** Stripping the gallery fields on migrate reddens *keeps the gallery's own
      fields on the view*; reversing the plan's preference reddens *does not overwrite a board image
      field the view already carries*. A third control passed and removed code: guarding the write
      against an existing `boardImageField` could only ever re-write the same value the plan had
      already chosen, so the guard was doing no work and is gone.
- [ ] A database previously configured as a gallery opens on the operator's device. **Only the
      operator closes this row.**
- [x] No surface offers gallery as a choice, **and no path produces one.** Withdrawn from the
      add-view menu, the view-type change menu and the view-config picker. A database that already
      IS a gallery still sees the option in its own picker, or that control would display a value it
      does not list. **The second half was missing until 2026-09-01:** the `.base` importer mapped
      `cards` to `gallery`, so "no surface offers it" was true of the pickers and false of the
      plugin. It imports as a board now.
- [x] The board renders unchanged — captures byte-identical, or every difference explained. **Met** —
      no renderer was touched. The only capture that changed is the add-view menu, which no longer
      draws a Gallery row.
- [ ] Renderer coverage publishes its new floor, and the ratchet passes at it. **Not applicable
      while the renderer ships** — it still exists and is still covered, and the migration's undo
      depends on it continuing to. This row belongs to the deletion, which is now gated on evidence
      rather than on a question: once no view migrates on open for a while, nothing is producing
      galleries and the renderer has no callers left. It is left unticked rather than marked
      not-applicable, because the figure is ticked over total and inventing an exemption would
      inflate it.
- [x] `npm run gate` exits 0, read from `$?` and not through a pipe. **20 green, re-run 2026-09-01.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Nothing has started.** The phase was opened on operator instruction and is blocked on one
decision, deliberately.

### Measured footprint, not estimated

| Item | Count |
|---|---|
| `gallery-renderer.ts` | 786 lines |
| Files mentioning gallery across `src/` and `tools/` | 41 |
| Gallery screenshot captures | 4 |
| Benches and runners | `gallery-render-bench.ts`, `run-gallery.mjs` |
| Production-render assertion scenarios | 2 (file-view and embed bags) |

Complexity scored 81/100 at 94% confidence — architectural plus API change, 900 LOC, 41 files. The
scorer also recommends decomposing into 3 sub-phases; that is recorded rather than acted on,
because this folder is already a child of a phase parent and nesting another parent needs both
qualification thresholds met independently.

### The interaction nobody would predict

The gallery gained a production-renderer assertion in `../026` in the same session this phase was
opened, taking coverage from 2 of 22 to 6 of 22. Removing the gallery necessarily takes it to 5,
and that ratchet **fails closed on a decrease** — it exits 1 before stamping.

That is the check working, not an obstacle. The floor has to come down as a deliberate act with a
recorded reason, which is exactly what a ratchet is for.
<!-- /ANCHOR:log -->

---
title: "Feature Specification: Deprecate the Gallery View"
description: "Remove the gallery view from the plugin, including the migration path for databases already configured to use it and the gate coverage that currently counts it."
trigger_phrases:
  - "gallery deprecation"
  - "remove gallery view"
  - "030 gallery"
  - "deprecate gallery"
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
      - "Undecided: what happens to a user's existing gallery-configured view on upgrade"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-030"
      parent_session_id: null
    completion_pct: 67
    open_questions:
      - "Does an existing gallery view migrate to board, to table, or refuse to open?"
      - "Is the gallery removed from the type union, or kept as an accepted-but-redirected value?"
    answered_questions:
      - "Removing gallery drops renderer coverage 6 of 22 to 5 of 22, and the ratchet fails closed on a decrease"
---
# Feature Specification: Deprecate the Gallery View

> Phase chain: parent [`../spec.md`](../spec.md). Opened on operator instruction. **Not startable
> until §7's first question is answered** — the migration shape decides whether this is a deletion
> or a deletion plus a data path.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 030-gallery-view-deprecation |
| **Level** | 3 |
| **Status** | **In progress — withdrawn, not deleted.** The gallery is gone from the add-view menu, the view-type change menu and the view-config picker; the renderer is untouched so a database already configured as one still opens. Open: the deletion itself, and the operator confirming an existing gallery view on device |
| **Complexity** | 81/100, confidence 94% — 900 LOC, 41 files, architectural + API change |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

The operator has decided the gallery view should not exist. This phase removes it.

**A deprecation is not a deletion, and conflating them is the risk here.** The gallery is a value in
a persisted type union, so it is not only code in this repository — it is a string sitting in
users' vault files. `DatabaseViewType` at `src/data/types.ts:238` is
`"table" | "board" | "gallery" | "list" | "chart" | "calendar" | "timeline"`, and any database
already configured as a gallery has `gallery` written into its own configuration. Deleting the
renderer without deciding what those configurations do on upgrade turns a feature removal into
data that no longer opens.

**Measured footprint**, from the tree rather than estimated: `gallery-renderer.ts` is 786 lines,
**41 files** across `src/` and `tools/` mention gallery, there are **4** gallery screenshot
captures, and the view has a bench (`tools/bench/gallery-render-bench.ts`) and a runner.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.**

- The renderer and its action bag, and the host wiring that constructs it in both the file view and
  the embed.
- The gallery entries in the view-type union, the view picker, the add-view sheet, and any
  per-view configuration the gallery alone uses (card size).
- Its bench and runner, its screenshot scenarios and captures, its story coverage entries, and its
  scenario in the production-render assertion harness.
- The migration decided in §7 for databases already configured as gallery.

**Out of scope.**

- The board view, which is the gallery's structural twin and shares its card pipeline. Removing
  shared code that the board still uses is the failure mode this exclusion exists to prevent:
  `card-field-renderer.ts` serves every non-table view and is not gallery-owned.
- Any renderer other than the gallery's.
- The deprecation of any other view type. This phase is one view.

**Explicitly noted, not assumed.** The gallery was added to the production-render assertion harness
in `../026-production-render-assertions` during the same session this phase was opened, taking
renderer coverage to 6 of 22. Removing the gallery necessarily takes it to 5 of 22, and that check
**fails closed on a decrease** — it exits 1 before stamping when `constructed < published`. That is
correct behaviour, not an obstacle to work around: the ratchet has to be lowered deliberately, in
this phase, with the reason recorded, rather than by deleting the scenario and letting the check
discover it.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | A database already configured as a gallery opens without error after the upgrade, on the path decided in §7. |
| REQ-002 | No surface offers gallery as a choice: not the view picker, not the add-view sheet, not any menu. |
| REQ-003 | The gallery renderer, its bench, its runner, its captures and its assertion scenario are removed together, not piecemeal. |
| REQ-004 | The renderer-coverage ratchet is lowered to its new floor deliberately, with the reason recorded beside the number. |
| REQ-005 | The board view is unaffected: it renders identically before and after, proven rather than assumed. |
| REQ-006 | `npm run gate` exits 0 from the final state, read from `$?` rather than through a pipe. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [ ] An existing gallery-configured database opens on the operator's device and shows something
      coherent. **Only the operator closes this.**
- [ ] `grep -rn "gallery" src/` returns nothing outside the migration path decided in §7.
- [ ] The board view's captures are byte-identical before and after, or every difference is
      explained.
- [ ] Renderer coverage publishes its new floor and the ratchet passes at that floor.
- [ ] `npm run screenshots:verify` is green with the gallery scenarios removed rather than stale.
- [ ] `npm run gate` exits 0.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS

| Risk | Likelihood | Mitigation |
|---|---|---|
| A user's gallery database stops opening | **High if §7 is skipped** | §7 is a blocking question; nothing starts before it is answered |
| Shared card code deleted as if gallery-owned | Med | `card-field-renderer.ts` serves every non-table view; the board is the control — if the board still renders, the deletion stayed inside the gallery |
| Coverage ratchet lowered silently | Med | REQ-004 makes lowering it an explicit, reasoned act rather than a side effect |
| Gallery removed from the union while old configs still carry the string | Med | §7 decides whether the union keeps the value as accepted-but-redirected |
<!-- /ANCHOR:risks -->

---

## 6. THE BOARD IS THE CONTROL

The gallery and the board are structural twins: one card per row, appended in a loop to a single
container, both rendering through `card-field-renderer.ts`. That makes the board the natural
control for this deletion. Any change that also moves the board is a change that left the gallery's
own code and entered shared code.

This is the same control shape the packet already uses for the table against the row-loop views,
and it is cheap: the board's captures and its production-render assertion already exist.

---

## 7. THE QUESTION THAT DECIDES THE SIZE OF THIS WORK

**What happens to a database the user has already configured as a gallery?**

Three answers, and they are not equivalent in cost:

1. **Migrate to board.** The closest surviving view — same card shape, same field pipeline. A
   config rewrite on load, and the user's data keeps a recognisable presentation. Largest change,
   smallest surprise.
2. **Migrate to table.** The default view and the only one never reported freezing. Safest to
   render, least like what the user chose.
3. **Refuse and fall back.** Keep `gallery` accepted in the union, render the empty state with an
   explanation, and let the user pick. Smallest change, and it puts a dead end in front of a user
   who did nothing wrong.

**The operator decides.** It is recorded here rather than chosen, because the answer changes
whether this phase writes a migration or only deletes files — and because a deprecation that
silently breaks existing data is the exact failure this packet exists to stop shipping.

---

## RELATED DOCUMENTS

- Parent spec: [`../spec.md`](../spec.md)
- Coverage ratchet this phase lowers: [`../026-production-render-assertions/goal.md`](../026-production-render-assertions/goal.md)
- The gallery's per-card hoist, still live in the renderer being removed: [`../028-remaining-freezes/goal.md`](../028-remaining-freezes/goal.md)

---

## 8. AI EXECUTION PROTOCOL

Lives in [`plan.md`](plan.md) §5, which is where the contract expects it and therefore where a
reader and the validator both look. Kept in one place rather than copied here, because two copies
of an execution protocol drift and the wrong one gets followed.

---

## 9. ON THE DECLARED LEVEL

Scored 81/100, which is Level 3, and the phase carries the Level 3 doc set.

**The `COMPLEXITY_MATCH` warning is expected and is not a defect to resolve.** It reports zero
phases against a Level 3 minimum of two, because the scorer also recommends decomposing this work
into three sub-phases. That is declined deliberately: this folder is already a child of a phase
parent, and nesting another phase parent requires **both** qualification thresholds to be met
independently — meeting one of them plus a suggestion is not enough. The decomposition is recorded
in `goal.md`'s log as a possibility rather than acted on, and the warning stands as the honest
signal that a judgment was made here rather than a rule followed.

---
title: "Goal: Gallery Usage and Migration Audit"
description: "The durable directive this phase executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "gallery audit goal"
  - "007 phase 1 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-05T08:10:00Z"
    last_updated_by: "audit-run"
    recent_action: "Ran the full gallery usage and migration audit; all criteria met"
    next_safe_action: "002-settings-redirect-and-migrate can start from this phase's findings"
    blockers: []
    key_files:
      - "implementation-summary.md"
      - "scratch/surface-list.md"
      - "scratch/declared-losses.md"
      - "src/main.ts"
      - "src/data/data-source.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-goal"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "Does gallery leave DatabaseViewType, or stay accepted-but-redirected like list? Recommend: stay accepted-but-redirected, matching 006's ADR-001, decided by 003."
    answered_questions:
      - "How many gallery views does the operator's vault hold? 0, confirmed by a successful read."
      - "Does anything outside the renderer read the six gallery* config fields? Yes for two (aspect ratio, fit — the board's equivalents read them identically); no for the other four."
---
# Goal: Gallery Usage and Migration Audit

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Name everything the gallery touches — every surface that mints it, every check that
measures it, and every setting a board cannot carry — before anything is redirected or deleted.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | This phase is **read-only**. It changes no source file. A deprecation that starts by deleting is how a persisted union value becomes a data loss. |
| D2 | The output is an **enumeration, not an opinion**. Every gallery setting without a board equivalent is named here, so a user meets a declared loss rather than discovers an undeclared one. |
| D3 | The surface sweep does **not** stop at the literal `"gallery"`. `030` did, and two minting surfaces survived it. Every `viewType` assignment and every `DatabaseViewType` narrowing is read. |
| D4 | Capture entries are classified **per scenario, not per id**. Four of the six gallery-touching ids also mount the board; deleting them wholesale in `003` would remove board coverage. |
| D5 | The vault count is reported or its absence is reported. **A zero that is really an absence of evidence is a failure of this phase**, not a finding. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md` §4 (the parent inventory), `../goal.md`, then this folder's `spec.md`
and `plan.md`.

**It gates `002`.** The redirect cannot know what it is closing until this has run, so `002` does
not start on an audit that is partly written.

**Precedence.** The parent's decisions outrank anything here; this document outranks any summary of
it, including a roadmap row. Name a conflict rather than resolving it silently. Where this audit and
the parent's `spec.md` §4 disagree, **this is right and the parent row is the defect**.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today so the check
has a value to move from.

- [x] Every surface that accepts, mints or coerces `viewType: "gallery"` is enumerated with file and
      line. **Done: `scratch/surface-list.md`. The sweep found a second accepting surface beyond
      `main.ts:146`/`:182` — `data-source.ts:1527-1529`'s `parseViewType()` — and confirmed the
      `.base` importer fix and three (not two) already-closed minting surfaces, `settings.ts:79`
      being the one neither `030` nor this packet's draft had named.**
- [x] Every measurement of the gallery is enumerated: the coverage pins, the bench and its driver,
      the constructed scenario, the capture scenarios, the render-assertion harness, the placement
      checks and the unit specs. **Done: `scratch/measurement-inventory.md`, cross-checked against
      `rg -il gallery tools` returning 31 files.**
- [x] All 24 gallery-touching capture entries are classified gallery-only or board-shared, with the
      board contribution named for each shared one. **Done: `scratch/capture-classification.md`. 2
      ids (8 entries) gallery-only; 4 ids (16 entries) board-shared, each confirmed by reading the
      scenario's own `html()`, not inferred from its `sources` array.**
- [x] Every gallery setting with no board equivalent is named and dispositioned as carried or as a
      declared loss. **Done: `scratch/declared-losses.md`. 1 of 6 fields fully carried, 2 have an
      equivalent the migration does not yet carry, 2 are genuine losses, 1 is a softenable loss.**
- [x] The vault count is recorded, or the vault is recorded as unreadable from this session.
      **Done: 0 gallery-configured views in the operator's vault, confirmed by a successful read of
      its one `db_view: true` file (5 views enumerated by name and type, none `gallery`).**
- [x] `002` can implement the redirect without reading a source file this audit did not name, and
      `003` can remove the measurement surface without finding one it missed.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent packet opened 2026-09-05 from the operator's ruling; `../spec.md` PHASE DOCUMENTATION MAP |
| Surface enumeration | Done | `tasks.md` T004, T005; `scratch/surface-list.md`. Found a second accepting surface and a third already-closed minting surface beyond the parent's inventory |
| Capture classification | Done | `tasks.md` T006; `scratch/capture-classification.md`. 2 gallery-only ids, 4 board-shared |
| Measurement enumeration | Done | `tasks.md` T007; `scratch/measurement-inventory.md` |
| Declared-loss list | Done | `tasks.md` T008; `scratch/declared-losses.md`. 1 carried, 2 fixable gaps, 2 real losses, 1 softenable loss |
| Vault count | Done | `tasks.md` T009. 0 gallery views, confirmed by a successful read |

### Deviations and findings

| Item | Note |
|------|------|
| Numbered `001`, not `005` | `006-list-view-deprecation` numbers its deprecation children from `005` because `000`-`004` are superseded ClickUp children cited by path. This packet has no superseded children, so `001` is free. The mirror is of the shape, not the numbering. |
| Two minting surfaces are named before the sweep runs | They are already known from `006`'s audit of the parallel list case and from reading `main.ts`. Naming them in advance is not the same as having swept — T004 still runs, and finding only these two would itself be a result worth recording. |
| The embedded-codeblock asymmetry is inherited twice | `applyGalleryMigration` has one call site. `006` recorded the identical gap for the list and left it to a child. T010 records it here as a finding rather than as a fix — and found that `006` already built the shape to close it, for `list`, in the same file (`embedded-database-renderer.ts:776-800`), giving `002` a transplant target |
| A second accepting surface exists beyond the one the parent named | `data-source.ts:1527-1529`'s `parseViewType()` also accepts `gallery`, feeding the primary per-file frontmatter read path. Neither it nor `main.ts:146`/`:182` can be closed the way `006` safely closed the parallel `list` exemption, because gallery's migration target differs from the unknown-type fallback where list's does not |
| T014's parent correction is documented, not applied to `../spec.md` | This dispatch's write authority covers this child folder plus the parent's `roadmap.md` row, not `spec.md`. Both corrections are written up in full in `implementation-summary.md` §7 and applied to `roadmap.md`'s row for this child instead |
<!-- /ANCHOR:log -->

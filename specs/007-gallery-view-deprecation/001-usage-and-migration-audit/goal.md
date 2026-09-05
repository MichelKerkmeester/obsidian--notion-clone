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
    last_updated_at: "2026-09-05T06:58:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the durable directive for the audit phase"
    next_safe_action: "Run T004: enumerate every surface that accepts or mints gallery"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
      - "src/main.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How many gallery views does the operator's vault hold?"
      - "Does anything outside the renderer read the six gallery* config fields?"
    answered_questions: []
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

- [ ] Every surface that accepts, mints or coerces `viewType: "gallery"` is enumerated with file and
      line. **Today: `030` recorded two picker filters and nothing else; two minting surfaces
      (`main.ts:146`/`:182`) is known to have survived it, a second candidate this packet's draft
      named — the `.base` importer — turned out to be already fixed at `main.ts:1577`, and the
      sweep may find more.**
- [ ] Every measurement of the gallery is enumerated: the coverage pins, the bench and its driver,
      the constructed scenario, the capture scenarios, the render-assertion harness, the placement
      checks and the unit specs. **Today: 31 `tools/` files carry the string and nothing separates
      the ones that measure from the ones that merely mention.**
- [ ] All 24 gallery-touching capture entries are classified gallery-only or board-shared, with the
      board contribution named for each shared one. **Today: 4 of the 6 ids are board-shared and
      nothing records which.**
- [ ] Every gallery setting with no board equivalent is named and dispositioned as carried or as a
      declared loss. **Today: `gallery-migration.ts`'s own header names the cover carry-over and
      nothing enumerates the other five fields.**
- [ ] The vault count is recorded, or the vault is recorded as unreadable from this session.
      **Today: unknown, and `006`'s equivalent audit answered it for the list by reading the
      operator's own testbed vault.**
- [ ] `002` can implement the redirect without reading a source file this audit did not name, and
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
| Surface enumeration | Not started | `tasks.md` T004, T005 |
| Capture classification | Not started | `tasks.md` T006 |
| Measurement enumeration | Not started | `tasks.md` T007 |
| Declared-loss list | Not started | `tasks.md` T008 |
| Vault count | Not started | `tasks.md` T009 |

### Deviations and findings

| Item | Note |
|------|------|
| Numbered `001`, not `005` | `006-list-view-deprecation` numbers its deprecation children from `005` because `000`-`004` are superseded ClickUp children cited by path. This packet has no superseded children, so `001` is free. The mirror is of the shape, not the numbering. |
| Two minting surfaces are named before the sweep runs | They are already known from `006`'s audit of the parallel list case and from reading `main.ts`. Naming them in advance is not the same as having swept — T004 still runs, and finding only these two would itself be a result worth recording. |
| The embedded-codeblock asymmetry is inherited twice | `applyGalleryMigration` has one call site. `006` recorded the identical gap for the list and left it to a child. T010 records it here as a finding rather than as a fix. |
<!-- /ANCHOR:log -->

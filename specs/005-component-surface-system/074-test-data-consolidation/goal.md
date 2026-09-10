---
title: "Goal: Test Data Consolidation"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "074 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/074-test-data-consolidation"
    last_updated_at: "2026-09-10T20:16:33Z"
    last_updated_by: "folder-ruling-leg"
    recent_action: "Folder ruling landed: vault write emits one folder; adopted by the operator; gate 28/0"
    next_safe_action: "Await the fresh verifier; the Finance databases' on-device read stays the operator's row"
    blockers:
      - "The Finance databases' on-device read is the operator's row; the adoption of the consolidated shape happened by the operator's own action on 2026-09-10 (backup noted in the 005 handover)"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "074-test-data-consolidation-scaffold"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "Surviving view types: table, board, calendar, timeline, chart (decision-record ADR-0001)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Test Data Consolidation

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** One big consolidated testbed database replaces the project's scattered fixture datasets, and the operator's Finance databases remain the second dataset, visible again once 070 lands.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The operator's own `Database Testbed/` folder is operator-owned; this packet proposes the consolidated shape but does not overwrite it without the operator's own action |
| D2 | "Restored" means visible again, not recovered — 070's diagnosis already found the Finance frontmatter intact on disk |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Every test/fixture dataset the project ships or seeds inventoried — the Dataset Inventory table in the packet's `tasks.md`, counts read from the files themselves; the catalogue was 10 databases and roughly 326 records when this opened
- [x] One consolidated testbed database designed and built, covering every surviving view/column/grouping/filter/sort/formula/relation — 36 records, 28 columns, five surviving view types plus the deliberately sorted-and-filtered second table; no non-default sort and no non-empty filter existed in the generated notes before the fix; the survivors question answered as decision-record ADR-0001, the coverage as ADR-0004
- [x] Capture, story and phone-smoke harnesses migrated onto the one consolidated database, each re-verified against its own pass/fail criteria — every catalogue mount repointed; the suite was 1672 tests, now 1678 with the registry's six; the constructed, bench, smoke and story bodies reference no use case and stay, as their lanes' measured subjects (ADR-0003); every criterion re-measured, none loosened
- [ ] Finance databases confirmed visible once 070 lands, documented as the kept second dataset — code-side proven and documented (ADR-0005, the cold-cache lane, `testbed-proposal.md`); the on-device read of the operator's own Finance databases is the operator's row and this leg does not tick it
- [x] The 2026-09-09 ~20:48 ruling (0.0.36: *"Also clean testbed only 1 database with table and board views"*): the testbed's view definitions are exactly one table view and one board view — RED: 2 failed | 6 passed, the view count was 6 [table, board, calendar, timeline, chart, table] → GREEN 8/8, full vitest 1587/1587, gate 27/0; recorded as AC-005, which amends the six-view coverage this criterion's second bullet recorded
- [x] The 2026-09-10 ~20:55 ruling (*"Testbed has ton of folder on iis still i wanted only 1 folder / database"*): the folder the generator's vault write produces is exactly one — the consolidated note at the testbed root, the records inside it, `README.md`/`Attachments/` untouched, the Finance folder never written — RED `consolidation.test.mjs` 2 failed | 9 passed (the note still sat in a nested `Testbed/` wrapper, the very folder the operator's hand consolidation had removed; the Finance-untouched and note-view-bytes assertions already held) → GREEN 11/11, registry + `catalogue.test.mjs` 31/31, full `vitest` 1617/1617; adoption smoke: first run 37 written (1 note + 36 records) into exactly one folder, `viewType` exactly 1×table + 1×board, Finance bytes untouched, second run 0 written; `tsc` 0, `build` 0, `sheet-grammar` 0, `render-assertions` 0, `verify-placement` 0, evidence 16/16, gate 28/0 exit 0; recorded as AC-006, which amends the proposal's premise that the generator never writes the root note
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Implementation leg, 2026-09-08 | Done | The consolidation landed in the worktree: ten fixture databases → one Testbed (36 records), the 070 Finance fixture kept as the second dataset, every mount repointed; registry suite 4-of-6 red → 6/6 green; vitest 153/1672 → 154/1678; the full ladder and the gate (27 green, 0 declared red) all exit 0; details, deviations and the capture disposition in the packet's `implementation-summary.md` and `decision-record.md` |

| Folder-ruling leg, 2026-09-10 | Done | The vault write's shape: the shared path helpers answer the testbed root itself (`emit-obsidian.ts`), `emitObsidian` asserts the one-database invariant, the stray report derives its produced folders from the write set; RED→GREEN and the adoption smoke as AC-006 records; the operator's vault consolidated by hand the same day (nine sub-database folders removed, backup kept) |

### Deviations and findings

| Item | Note |
|------|------|
| Found: the capture, story and smoke bodies the spec's scope lists were never separate fixtures | The scenario markup, the constructed lane's small dataset, the bench volume and the story files reference no catalogue use case — read, not assumed — so they stayed, and the spec's “Files to Change” overcounted them; recorded as decision-record ADR-0003 rather than silently narrowing the scope |
| Found: no committed capture moved | The consolidated dataset feeds no PNG — the capture corpus photographs scenario markup, constructed states and the reference benches; swept twice per the fixture-changing discipline, three single-channel-unit jitter flips restored by the second run (decision-record ADR-0006) |
| Note: the Anytype report JSONs and `screenshots/anytype/` still describe the last physical ten-set load | This packet cannot re-run the application; the loaders already iterate the one-database catalogue, and `anytype/README.md` says so — the next physical `load.mjs --reset` refreshes them |
| Found: stories needed no repoint | Every story constructs its own components inline; the “catalogue” in their headers is the story-coverage sense of the word — verified import-by-import |
<!-- /ANCHOR:log -->

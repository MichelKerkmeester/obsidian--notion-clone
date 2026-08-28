---
title: "Task Breakdown: Screenshot Freshness Enforcement"
description: "Task breakdown for the freshness gate: fingerprint helper, per-entry comparison, four failure categories, registry comparison for never-captured scenarios, exit contract, JSON mode, absent-manifest guard, and the Screenshot Currency repository rule."
trigger_phrases:
  - "freshness enforcement tasks"
  - "verify.mjs task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/003-freshness-enforcement"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the freshness gate task breakdown"
    next_safe_action: "Await orchestrator compiler, build, test and verify gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "screenshot-system-003"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Screenshot Freshness Enforcement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning | Time Estimate |
|---|---|---|
| `[S]` | Small task | < 30 minutes |
| `[M]` | Medium task | 30–90 minutes |
| `[L]` | Large task | > 90 minutes |
| `- [ ]` | Incomplete task (unstarted) | — |
| `- [/]` | In progress task | — |
| `- [x]` | Completed task | — |

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [S] Enumerate the four ways a screenshot can be wrong before writing the check, so each gets its own list and its own remedy (REQ-001, REQ-003, REQ-007, REQ-008) [EVIDENCE: tools/screenshots/verify.mjs:47 declares stale, missingFile and missingSource, plus the uncaptured set at :66]
- [x] T002 [S] Reject image-byte comparison against the unpinned Chrome version and record the reasoning in the file header (`tools/screenshots/verify.mjs:10-12`) (REQ-002)
- [x] T003 [S] Confirm the manifest shape the harness writes, so the check reads a stable record (`tools/screenshots/capture.mjs:116-128` writes `id`, `file`, `sources`, `sourceHashes` per entry) (REQ-001)
- [x] T004 [S] Confirm the harness appends `styles.css` to every entry, so a stylesheet edit needs no special case in the check (`tools/screenshots/capture.mjs:124`) (REQ-009)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 [S] Write the repository-relative `hash` helper returning a 12-character SHA-256 prefix, or `null` for an absent file (`tools/screenshots/verify.mjs:28-32`) (REQ-002, REQ-008)
- [x] T006 [S] Guard on the manifest existing, exiting 1 with the capture command rather than a parse error (`tools/screenshots/verify.mjs:37-41`) (REQ-011)
- [x] T007 [S] Check each entry's image exists first, and skip its source comparison when it does not, so one problem produces one line (`tools/screenshots/verify.mjs:48-51`) (REQ-007)
- [x] T008 [M] Re-hash every key of each entry's `sourceHashes` and sort the result into `stale` or `missingSource` (`tools/screenshots/verify.mjs:52-59`) (REQ-001, REQ-008)
- [x] T009 [S] Import `SCENARIOS` and report every registered id absent from the manifest, so an unphotographed surface cannot pass silently (`tools/screenshots/verify.mjs:22, 64-65`) (REQ-003)
- [x] T010 [S] Sum the four categories into a single problem count driving both the report and the exit code (`tools/screenshots/verify.mjs:67`) (REQ-004)
- [x] T011 [S] Add `--json` emitting the four lists plus an `ok` flag (`tools/screenshots/verify.mjs:35, 69-70`) (REQ-010)
- [x] T012 [S] Print the success line with the entry count, so a green run is distinguishable from a run that checked nothing (`tools/screenshots/verify.mjs:71-72`) (REQ-012)
- [x] T013 [M] Print the grouped failure report — each category with its count and every affected path — ending with the refresh command (`tools/screenshots/verify.mjs:73-91`) (REQ-005)
- [x] T014 [S] Exit 0 when the problem count is 0 and 1 otherwise, so the check can gate a commit (`tools/screenshots/verify.mjs:93`) (REQ-004)
- [x] T015 [S] Record beside the registry comparison why an uncaptured scenario is as bad as a stale one, and why it is the easier mistake to make (`tools/screenshots/verify.mjs:62-63`) (REQ-003)
- [x] T016 [M] Add the Screenshot Currency section to `.claude/CLAUDE.md`: run `npm run screenshots:verify` before claiming UI work complete, add a scenario in the same change as a new surface, and look at the changed images (REQ-006)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T017 [M] Run the negative control: append a comment to `src/views/BoardRenderer.ts`, confirm `npm run screenshots:verify` exits 1 naming exactly `screenshots/views/board-view-dark.png` and `screenshots/views/board-view-light.png`, then revert and confirm exit 0 with `16 entries match their sources` (REQ-001, REQ-004, REQ-005)
- [x] T018 [S] Confirm the manifest carries `styles.css` on every entry, so a stylesheet edit stales all of them (`screenshots/manifest.json` holds the key on 16/16 entries) (REQ-009)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T019 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` — **not run in this session; the orchestrator verifies this gate**
- [ ] T020 [S] Run Vitest unit test suite `npx vitest run` — **not run in this session; the orchestrator verifies this gate**
- [ ] T021 [S] Run production bundle build `npm run build` — **not run in this session; the orchestrator verifies this gate**
- [ ] T022 [S] Re-run the freshness gate `npm run screenshots:verify` on the final tree — **not run in this session; the orchestrator verifies this gate**
- [ ] T023 [S] Exercise the remaining three failure categories — deleted image, deleted source, uncaptured scenario — against a scratch tree — **not run in this session; only the stale category was exercised by the negative control**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | A source change marks its screenshots stale | T001, T003, T008, T017 |
| REQ-002 | Staleness is judged on fingerprints, not image bytes | T002, T005 |
| REQ-003 | A registered but uncaptured scenario is a failure | T001, T009, T015 |
| REQ-004 | The check can gate a commit | T010, T014, T017 |
| REQ-005 | A failure names exactly what to look at | T013, T017 |
| REQ-006 | The rule is written into the repository instructions | T016 |
| REQ-007 | A deleted screenshot is detected | T001, T007 |
| REQ-008 | A deleted source is distinguished from a changed one | T001, T005, T008 |
| REQ-009 | A stylesheet edit marks every capture | T004, T018 |
| REQ-010 | The check is usable by a machine | T011 |
| REQ-011 | A missing manifest fails clearly | T006 |
| REQ-012 | The passing message states what was checked | T012 |

<!-- /ANCHOR:cross-refs -->

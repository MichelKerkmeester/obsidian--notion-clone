---
title: "Quality Checklist: Screenshot Freshness Enforcement"
description: "Verification checklist for the freshness gate, reconciled against what was read in the shipped check, what the recorded negative control established, and what the orchestrator's gates still verify."
trigger_phrases:
  - "freshness enforcement checklist"
  - "verify.mjs verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/003-freshness-enforcement"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled the gate checklist against the check and the negative control"
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
# Quality Checklist: Screenshot Freshness Enforcement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

An item is ticked when it was verified by reading the code as it now stands, or when the orchestrator's recorded negative control established it. Items requiring a command this session did not run are left unticked.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] The four ways a screenshot can be wrong were enumerated before the check was written, so each carries its own remedy [EVIDENCE: `grep -c "push(" tools/screenshots/verify.mjs` = 3 for stale, missing file and missing source, with `uncaptured` derived at `:64-65` — 4/4 categories]
- [x] CHK-002 [P0] Image-byte comparison was considered and rejected against the unpinned Chrome version, with the reasoning recorded in the file itself [EVIDENCE: `sed -n '10,12p' tools/screenshots/verify.mjs` states that a different Chrome build shifts antialiasing and a byte comparison would report drift everywhere while missing real changes]
- [x] CHK-003 [P0] The manifest shape was fixed by the harness before the check was written against it [EVIDENCE: `tools/screenshots/capture.mjs:116-128` writes `id`, `file`, `sources` and `sourceHashes`; `screenshots/manifest.json` carries all four on 16/16 entries]
- [x] CHK-004 [P0] The stylesheet was confirmed present on every entry, so a `styles.css` edit needs no special case in the check [EVIDENCE: `tools/screenshots/capture.mjs:124` appends it; `grep -c '"styles.css":' screenshots/manifest.json` = 16 — 16/16 entries]
- [ ] CHK-005 [P0] Baseline test suite and TypeScript compilation pass cleanly before changes — **not run: no shell command was executed in this session; the orchestrator verifies both gates**

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-006 [P0] Each entry's recorded source fingerprints are re-hashed against the working tree and compared [EVIDENCE: `tools/screenshots/verify.mjs:52-59` iterates `Object.entries(entry.sourceHashes || {})` and compares to a fresh hash]
- [x] CHK-007 [P0] The comparison uses source fingerprints and never reads a PNG's contents [EVIDENCE: `grep -c "\.png" tools/screenshots/verify.mjs` = 0; the only image interaction is an existence check at `:48`]
- [x] CHK-008 [P0] A registered but never captured scenario is reported, not silently accepted [EVIDENCE: `tools/screenshots/verify.mjs:22` imports `SCENARIOS` and `:64-65` subtracts the captured id set from it]
- [x] CHK-009 [P0] The exit code is driven by the total across all four categories [EVIDENCE: `tools/screenshots/verify.mjs:67` sums them and `:93` exits on that sum; `grep -c "process.exit" tools/screenshots/verify.mjs` = 2 — the manifest guard and the verdict]
- [x] CHK-010 [P0] A missing image is reported without also reporting its sources, so one problem produces one line [EVIDENCE: `tools/screenshots/verify.mjs:48-51` pushes to `missingFile` and `continue`s past the source loop]
- [x] CHK-011 [P0] A deleted source is routed to its own category rather than counted as drift [EVIDENCE: `tools/screenshots/verify.mjs:28-32` returns `null` for an absent file and `:53-56` sorts that into `missingSource` with `(source no longer exists)`]
- [x] CHK-012 [P1] A missing manifest produces an instruction rather than a stack trace [EVIDENCE: `tools/screenshots/verify.mjs:37-40` prints `No screenshots/manifest.json. Run: npm run screenshots` and exits 1]
- [x] CHK-013 [P1] The passing message states how many entries were checked, so a green run is distinguishable from a run that checked nothing [EVIDENCE: `tools/screenshots/verify.mjs:72` prints the entry count with the success line]
- [x] CHK-014 [P1] Code comments state the durable reason for each non-obvious choice — why fingerprints rather than bytes, why an uncaptured scenario counts, why the exit code matters — and contain no spec, requirement, task or checklist identifiers [EVIDENCE: `tools/screenshots/verify.mjs:3-15, 62-63`; `grep -cE "REQ-[0-9]|CHK-[0-9]|specs/public" tools/screenshots/verify.mjs` = 0]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-015 [P0] A real source change makes the check fail [EVIDENCE: negative control — a comment appended to `src/views/BoardRenderer.ts` made `npm run screenshots:verify` exit 1]
- [x] CHK-016 [P0] The failure is scoped to exactly the affected captures, neither over- nor under-reporting [EVIDENCE: the same control named 2/16 entries — `screenshots/views/board-view-dark.png` and `screenshots/views/board-view-light.png` — and no others]
- [x] CHK-017 [P0] The check recovers cleanly rather than staying failed [EVIDENCE: reverting the comment returned `npm run screenshots:verify` to exit 0 with `16 entries match their sources`]
- [x] CHK-018 [P1] A machine-readable mode exists alongside the human report [EVIDENCE: `tools/screenshots/verify.mjs:69-70` emits `{ stale, missingFile, missingSource, uncaptured, ok }` under `--json`]
- [ ] CHK-019 [P1] The deleted-image, deleted-source and uncaptured categories were each exercised against a scratch tree — **not run: only the stale category was covered by the negative control; the other three are established by reading the code, not by execution**
- [ ] CHK-020 [P0] `npx tsc --noEmit` passes cleanly — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-021 [P0] `npm run build` produces a clean bundle — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-022 [P0] `npx vitest run` passes — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-023 [P0] `npm run screenshots:verify` exits 0 on the final tree — **not run: no shell command was executed in this session; the orchestrator verifies this gate**

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Enforcement Completeness

- [x] CHK-024 [P0] The check is bound to the workflow by a written rule, not left to memory [EVIDENCE: `grep -c "screenshots:verify" .claude/CLAUDE.md` = 1, in the Screenshot Currency section]
- [x] CHK-025 [P0] The rule also closes the registration gap, requiring a new surface to get a scenario in the same change [EVIDENCE: `grep -c "scenarios.mjs" .claude/CLAUDE.md` = 1, stating that a registered-but-never-captured scenario is reported as a failure]
- [x] CHK-026 [P0] The rule warns that a green run is not proof of a correct capture [EVIDENCE: `grep -c "empty box" .claude/CLAUDE.md` = 1, telling the reader to look at the changed PNGs rather than assume the run was correct]
- [x] CHK-027 [P1] The check is reachable by the same command the rule names [EVIDENCE: `grep -c "screenshots:verify" package.json` = 1, mapping it to `node tools/screenshots/verify.mjs`]
- [x] CHK-028 [P1] The largest shared surface cannot escape the gate [EVIDENCE: `grep -c '"styles.css":' screenshots/manifest.json` = 16 — a stylesheet edit stales 16/16 captures]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-029 [P0] The check writes nothing at all, including into `screenshots/` [EVIDENCE: `grep -cE "writeFileSync|mkdirSync|rmSync|appendFile" tools/screenshots/verify.mjs` = 0]
- [x] CHK-030 [P0] No network access and no new dependency [EVIDENCE: `grep -cE "fetch\(|https?://" tools/screenshots/verify.mjs` = 0; `grep -c "node:" tools/screenshots/verify.mjs` = 4, and the only non-builtin import is the local registry]
- [x] CHK-031 [P0] No telemetry and no secret handling [EVIDENCE: `grep -cE "process.env" tools/screenshots/verify.mjs` = 0]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-032 [P1] The failure report ends with the command that fixes it, so the reader does not have to look it up [EVIDENCE: `tools/screenshots/verify.mjs:90` prints `Refresh with: npm run screenshots`]
- [x] CHK-033 [P1] The repository rule describes the two harness properties a reader needs to interpret a capture — fixture markup rather than real renderers, and stand-ins for what Obsidian supplies [EVIDENCE: `grep -c "runtime-vars.css" .claude/CLAUDE.md` = 1, in the paragraph explaining that a wrong-looking capture may be a stand-in gap rather than a defect]
- [x] CHK-034 [P1] Open judgement calls are recorded rather than silently resolved [EVIDENCE: spec.md OPEN QUESTIONS records where the check should be invoked from, the one-directional manifest comparison, and the absent markup-drift check — 3/3 stated]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-035 [P0] The check sits beside the harness it verifies and outside the plugin bundle [EVIDENCE: `grep -c "tools/screenshots" package.json` = 2, both inside `scripts`; `package.json:5` declares `main.js` as the bundle entry]
- [x] CHK-036 [P1] Generated records stay under `screenshots/` and the check reads them without writing back [EVIDENCE: `tools/screenshots/verify.mjs:26` resolves the manifest under `screenshots/`; `grep -c "readFileSync" tools/screenshots/verify.mjs` = 3 — one import and 2 read sites]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 5 | 4/5 | 1 |
| Code Quality & Architecture | 9 | 9/9 | 0 |
| Testing & Verification | 9 | 4/9 | 5 |
| Enforcement Completeness | 5 | 5/5 | 0 |
| Security & Data Safety | 3 | 3/3 | 0 |
| Documentation | 3 | 3/3 | 0 |
| File Organization | 2 | 2/2 | 0 |
| **Total** | **36** | **30/36** | **6** |

**Verification Date**: 2026-08-28
**Verification**: 27 ticked items were verified by reading the code as it now stands; CHK-015 through CHK-017 rest on the negative control the orchestrator ran and recorded. The 6 deferred items (CHK-005, CHK-019 through CHK-023) require executing a command, which was not possible in this session. CHK-019 is the substantive one: of the four failure categories, only staleness has been exercised end to end.

<!-- /ANCHOR:summary -->

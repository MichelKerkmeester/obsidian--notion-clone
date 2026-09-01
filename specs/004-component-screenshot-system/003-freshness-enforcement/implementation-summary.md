---
title: "Implementation Summary: Screenshot Freshness Enforcement"
description: "What was delivered for the freshness gate: fingerprint comparison over the manifest across four failure categories, a non-zero exit that can gate a commit, a JSON mode, the Screenshot Currency repository rule, and the negative control that established the scoping is correct."
trigger_phrases:
  - "freshness enforcement implementation summary"
  - "screenshot gate negative control"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/003-freshness-enforcement"
    last_updated_at: "2026-08-28T13:52:15.236Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded delivered gate scope and the negative control result"
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
# Implementation Summary: Screenshot Freshness Enforcement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 003-freshness-enforcement |
| **Theme** | The mechanism that keeps captures current: fingerprint check, four failure categories, repository rule |
| **Status** | Complete pending orchestrator gates |
| **Completion Pct** | 100% of implementation; 1 of 4 failure categories exercised end to end |
| **Requirements** | 12 defined (6 P0, 6 P1) |
| **Tasks** | 23 planned (18 completed, 5 deferred to the orchestrator or to a scratch-tree exercise) |
| **Target Deliverables** | `tools/screenshots/verify.mjs`, the Screenshot Currency rule in `.claude/CLAUDE.md`, and the manifest contract they rely on |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **A fingerprint comparison, not a pixel comparison.** `tools/screenshots/verify.mjs:28-32` hashes each source file the manifest names and compares it against the value recorded at capture time. The reasoning is in the file header at `:10-12`: the harness drives an unpinned system Chrome, re-rendering on a different build shifts antialiasing by a pixel, and a byte comparison would report drift on every machine while missing a real change captured on the same one. Fingerprints invert both failure modes.
2. **Four failure categories, each with its own remedy.** `STALE` when a recorded hash no longer matches (`:57`), `MISSING FILE` when an entry's image is gone (`:49`), `MISSING SOURCE` when a named source no longer exists (`:55`), and `NEVER CAPTURED` when a registered scenario has no manifest entry (`:64-65`). Each is printed as its own list with a count and every affected path.
3. **The never-captured path.** `verify.mjs:22` imports `SCENARIOS` directly and `:64-65` subtracts the manifest's ids from it. The comment beside it records why: a scenario added but never photographed is just as stale as a changed one, and it is the easier mistake to make, because the registry edit and the capture run are separate steps.
4. **One problem count driving everything.** `verify.mjs:67` sums the four lists; `:93` exits 0 when the sum is 0 and 1 otherwise. That single number decides both the report shape and the exit code, so there is no path where a failure prints and the process still succeeds.
5. **A missing-image short circuit.** An entry whose image is gone is reported and its source loop skipped (`:48-51`), so a deleted screenshot produces one line rather than one per source.
6. **A distinct signal for a deleted source.** `hash` returns `null` for an absent file, and `:53-56` routes that to `MISSING SOURCE` with `(source no longer exists)` rather than counting it as drift. The two need different fixes: one is a recapture, the other is a registry correction.
7. **Guardrails on the record itself.** A missing manifest exits 1 with `No screenshots/manifest.json. Run: npm run screenshots` (`:37-40`) rather than a parse error. The passing message states the entry count (`:72`), so a green run is distinguishable from a run that checked nothing.
8. **A machine-readable mode.** `--json` emits `{ stale, missingFile, missingSource, uncaptured, ok }` (`:69-70`), keeping the exit contract identical.
9. **A failure report that ends with the fix.** Every non-JSON failure closes with `Refresh with: npm run screenshots` (`:90`).
10. **Blanket coverage of the stylesheet.** The harness appends `styles.css` to every entry's `sourceHashes` (`tools/screenshots/capture.mjs:124`), so a stylesheet edit stales all 16 captures rather than none. This needs no special case in the check.
11. **The rule that binds it to the work.** `.claude/CLAUDE.md` carries a Screenshot Currency section requiring `npm run screenshots:verify` before UI work is claimed complete, requiring a new view, component or state to get a scenario in the same change, and telling the reader to look at the changed PNGs rather than assume the run was correct — a capture can succeed and still photograph an empty box. It also states the two harness properties a reader needs to interpret a capture: the fixtures are hand-written rather than driven through the real renderers, and `theme.css` and `runtime-vars.css` stand in for what Obsidian supplies.
12. **A generated index that cannot fall behind.** `screenshots/README.md` is written from the manifest on every full capture, so the human-facing document and the machine-facing record are the same data.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: Fingerprint helper and the per-entry comparison loop.
- **Phase 2**: Category separation, including the registry comparison for uncaptured scenarios.
- **Phase 3**: Problem count, report shapes, and the exit contract.
- **Phase 4**: Absent-manifest guard and the recorded reasoning for fingerprints over bytes.
- **Phase 5**: The Screenshot Currency rule in `.claude/CLAUDE.md`.
- **Phase 6**: The negative control, recorded below; the repository gates are left to the orchestrator.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **Compare sources, not images.** With an unpinned Chrome, image bytes are noise. Source fingerprints are the thing that actually determines whether a screenshot still depicts the code.
- **Four categories rather than a boolean.** The value of a failing check is in what it tells you to do next, and the four failures have four different fixes.
- **Import the registry directly.** The check could have compared the manifest against itself. Reading `SCENARIOS` is what makes an unphotographed surface a failure rather than an absence nobody notices.
- **Exit code as the interface.** The script does one thing and says so through its status, which keeps it usable from a hook, from CI, or by hand, without deciding which.
- **A rule, not just a script.** A check nobody runs enforces nothing. The `.claude/CLAUDE.md` section is what makes running it a precondition rather than an option.
- **Accept false positives from whitespace edits.** A trivial change to a renderer stales its captures. That costs a capture run; the opposite error costs a wrong screenshot sitting in the documentation.
- **One-directional comparison.** The check looks for registry entries missing from the manifest, not the reverse. An orphaned manifest entry is harmless and clears itself on the next full run.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **The missing-source category was not in the original design.** It emerged from `hash` needing a return value for an absent file. Folding it into `STALE` would have told the reader to recapture when the real fix is to correct the scenario's `sources`, so it earned its own list.
- **The check reports uncaptured scenarios, which is arguably the registry's problem rather than the manifest's.** It lives here because this is where the two records meet, and because that gap has no other detector.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

### Negative control (run and recorded by the orchestrator)

Appending a comment to `src/views/BoardRenderer.ts` made `npm run screenshots:verify` exit 1 and name exactly two files:

```
screenshots/views/board-view-dark.png
screenshots/views/board-view-light.png
```

The two board captures and nothing else — not the table captures, which do not declare that renderer, and not the gallery or list captures, which share `CardFieldRenderer.ts` but not `BoardRenderer.ts`. Reverting the comment returned the check to exit 0 with `16 entries match their sources`.

That control establishes four properties at once: the fingerprint comparison detects a real change, the source lists scope the failure correctly at 2/16 entries, the exit code flips, and the state is not sticky.

### Remaining gates

**These were not run in this session — no shell command was executed. The orchestrator runs them.**

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run

# 4. Freshness gate on the final tree
npm run screenshots:verify
```

### Verification Checklist
- [x] Source fingerprints are re-hashed and compared per entry (`tools/screenshots/verify.mjs:52-59`).
- [x] No PNG contents are read: `grep -c "\.png" tools/screenshots/verify.mjs` = 0.
- [x] A registered but uncaptured scenario is reported (`tools/screenshots/verify.mjs:22, 64-65`).
- [x] The exit code is driven by the total across all four categories (`tools/screenshots/verify.mjs:67, 93`).
- [x] A deleted source is distinguished from a changed one (`tools/screenshots/verify.mjs:28-32, 53-56`).
- [x] A missing manifest exits with an instruction (`tools/screenshots/verify.mjs:37-40`).
- [x] A stylesheet edit stales every capture: `grep -c '"styles.css":' screenshots/manifest.json` = 16.
- [x] The rule is written into the repository instructions: `grep -c "screenshots:verify" .claude/CLAUDE.md` = 1.
- [x] The check writes nothing: `grep -cE "writeFileSync|mkdirSync|rmSync|appendFile" tools/screenshots/verify.mjs` = 0.
- [x] Negative control passed: exit 1 naming 2/16 entries, exit 0 after revert.
- [ ] The deleted-image, deleted-source and uncaptured categories exercised against a scratch tree — not run; established by reading the code only.
- [ ] `npx tsc --noEmit` exit code 0 — orchestrator verifies.
- [ ] `npm run build` exit code 0 — orchestrator verifies.
- [ ] `npx vitest run` passes — orchestrator verifies.
- [ ] `npm run screenshots:verify` exits 0 on the final tree — orchestrator verifies.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Speed** | No browser launched, no image bytes read | Source inspection | Verified by source inspection |
| **Determinism** | Same tree yields the same verdict | Source inspection: nothing depends on rendering | Verified by source inspection |
| **Write Safety** | 0 writes of any kind | Source inspection of all fs call sites | Verified by source inspection |
| **Network Isolation** | 0 network requests | Source inspection | Verified by source inspection |
| **Blast Radius Accuracy** | A change names exactly its own captures | Negative control on `BoardRenderer.ts` | Verified: 2/16 entries named |
| **Category Coverage** | All 4 failure paths exercised | Scratch-tree exercise | **1 of 4 exercised — stale only** |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not run — orchestrator verifies** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The gate proves a capture is current, not that it is correct.** Fingerprints establish that no source has changed since the picture was taken. They say nothing about whether the fixture markup ever resembled the renderer, or whether the capture photographed an empty box. The repository rule compensates by telling the reader to look at the changed images.
- **Markup drift has no detector.** A fixture can diverge from what the renderers emit and the check will stay green indefinitely. The comment in `tools/screenshots/scenarios.mjs` refers to a structure check in `verify.mjs` that the shipped file does not implement.
- **An incomplete `sources` list produces a screenshot that goes stale less often than it should.** Nothing verifies that a scenario names every file it depicts. `styles.css` is covered automatically; per-renderer accuracy is a promise.
- **Three of the four failure categories are established by reading the code rather than by execution.** Only staleness was exercised end to end by the negative control.
- **The check runs only when invoked.** It is not wired into a git hook or a CI job; the binding is the repository instruction, which depends on the reader following it.
- **A whitespace-only edit to a renderer stales its captures.** Accepted deliberately: a needless capture run is cheaper than a wrong screenshot passing as documentation.

<!-- /ANCHOR:limitations -->

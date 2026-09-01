---
title: "Implementation Plan: Screenshot Freshness Enforcement"
description: "Plan for the freshness gate: fingerprint comparison over the capture manifest across four failure categories, a non-zero exit that can gate a commit, a JSON mode, and the repository rule that binds the check to the workflow."
trigger_phrases:
  - "freshness enforcement plan"
  - "verify.mjs plan"
  - "screenshot gate exit code"
  - "screenshot currency rule plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/003-freshness-enforcement"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the freshness gate plan against the shipped verify script"
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
# Implementation Plan: Screenshot Freshness Enforcement

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | Node ESM (`.mjs`) |
| **Framework** | `node:fs`, `node:crypto`, `node:path`, `node:url`. No external package |
| **Storage** | Reads `screenshots/manifest.json` and the working tree; writes nothing |
| **Testing** | A negative control: change a source, confirm the check names exactly the affected captures, revert, confirm it passes |

### Overview
The gate exists because a promise to remember is not enforceable and a failing check is. Everything else follows from choosing the right thing to compare.

**Fingerprints, not pixels.** The intuitive check re-renders and diffs images. That is wrong for this system: the harness drives an unpinned system Chrome, and a different Chrome build shifts antialiasing by a pixel. A byte comparison would report drift on every machine that is not the one that took the picture, while missing a real change captured on the same machine. Comparing a recorded SHA-256 of each source file against the working tree inverts both failure modes: it is silent on rendering noise and loud on the thing that actually invalidates a screenshot.

**Four categories, not one boolean.** A screenshot can be wrong in four distinct ways, and they need different fixes. Its source changed (recapture). Its image is gone (recapture). Its source is gone (fix the registry). It was registered and never captured (run the capture). Reporting them separately means the failure message tells the reader what to do.

**The never-captured case earns its own path.** It is the easiest mistake in the whole system, because adding a registry entry and running the capture are separate steps, and it is invisible without a check: the registry claims the surface is covered and no image exists. So the check imports the registry directly and compares ids against the manifest.

**An exit code, then a rule.** The script exits 1 on any problem, which makes it usable as a commit gate. The rule in `.claude/CLAUDE.md` is what actually connects it to the work: run it before claiming UI work complete, register a new surface in the same change, and look at the changed images rather than trusting the exit code.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] The manifest shape was fixed by the harness first, so the check reads a stable record: `id`, `file`, `sources`, `sourceHashes` per entry.
- [x] The pixel-comparison alternative was considered and rejected against the unpinned Chrome version, with the reasoning recorded in the file header (`tools/screenshots/verify.mjs:10-12`).
- [x] The four failure categories were enumerated before writing the check, so each gets its own list and its own message.
- [x] The harness was confirmed to append `styles.css` to every entry's `sourceHashes`, so a stylesheet edit is covered without a special case (`tools/screenshots/capture.mjs:124`).

### Definition of Done
- [x] Each entry's recorded source hashes are compared against fresh hashes of the working tree.
- [x] Stale, missing-file, missing-source and never-captured are reported separately with counts and paths.
- [x] The process exits 0 only when all four categories are empty.
- [x] `--json` emits the four lists plus an `ok` flag.
- [x] An absent manifest produces an instruction, not a stack trace.
- [x] The passing message states how many entries were checked.
- [x] `.claude/CLAUDE.md` carries the Screenshot Currency rule.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify` — **not run in this session; the orchestrator verifies these gates.**

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Recorded-fingerprint comparison.** The capture writes what it saw; the check re-reads and compares. Nothing about the check depends on rendering, which is what makes it fast, deterministic, and immune to the noise that would make a pixel check useless here.

### Key Components

| Component | Role |
|---|---|
| `hash` (`verify.mjs:28-32`) | 12-character SHA-256 prefix of a repository-relative file, `null` when absent |
| Manifest guard (`verify.mjs:37-41`) | Exits 1 with the capture command when the record does not exist |
| Entry loop (`verify.mjs:47-60`) | Missing-file check first, then per-source comparison into `stale` or `missingSource` |
| Registry comparison (`verify.mjs:64-65`) | Set of captured ids against `SCENARIOS`, yielding `uncaptured` |
| Problem total (`verify.mjs:67`) | Sum across all four lists, driving both the report shape and the exit code |
| Reporter (`verify.mjs:69-91`) | JSON mode, the success line with its entry count, or the four grouped lists plus the refresh command |
| Screenshot Currency rule (`.claude/CLAUDE.md`) | Requires the check before UI work is claimed done and a scenario in the same change as a new surface |

### Data Flow
`npm run screenshots:verify` invokes `verify.mjs`, which reads `screenshots/manifest.json` and imports `SCENARIOS`. For each manifest entry it first checks the image exists; if it does, it re-hashes every key of `sourceHashes` against the working tree and sorts each result into `stale` or `missingSource`. It then subtracts the manifest's ids from the registry's ids to produce `uncaptured`. The four lists are summed; the report is printed as JSON, as a success line, or as grouped failures ending in `Refresh with: npm run screenshots`; and the process exits on the sum.

### Failure Category Contract

| Category | Trigger | Fix |
|---|---|---|
| `STALE` | A recorded source hash differs from the working tree | `npm run screenshots` |
| `MISSING FILE` | A manifest entry's image is not on disk | `npm run screenshots` |
| `MISSING SOURCE` | A named source file no longer exists | Correct the scenario's `sources`, then recapture |
| `NEVER CAPTURED` | A registered scenario id is absent from the manifest | `npm run screenshots` |

### Mobile/iCloud Safety Notes
The check performs no writes at all, not even to `screenshots/`. It reads text files, hashes them, and prints. It never runs inside Obsidian and never touches a vault.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Comparison Core
Write the repository-relative `hash` helper returning `null` for an absent file, and the per-entry loop that checks the image first and then each recorded source hash.

### Phase 2: Category Separation
Split results into `stale`, `missingFile` and `missingSource` so each failure carries its own remedy, and add the registry comparison producing `uncaptured`.

### Phase 3: Reporting and Exit Contract
Sum the four lists, print either JSON, the success line with its entry count, or the grouped failure report ending in the refresh command, and exit on the sum.

### Phase 4: Guardrails
Add the absent-manifest guard with its instruction, and record in the file header why fingerprints are compared instead of image bytes.

### Phase 5: Workflow Binding
Add the Screenshot Currency section to `.claude/CLAUDE.md`: run the check before claiming UI work complete, add a scenario in the same change as a new surface, and look at the changed images because a capture can succeed and still photograph an empty box.

### Phase 6: Verification
Negative control, then the repository gates. Not runnable in this session; the orchestrator executes them.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The check is verified by a negative control rather than by a unit suite, because the property that matters is end to end: does a real edit to a real file produce exactly the right failure?

**The control that was run.** Appending a comment to `src/views/BoardRenderer.ts` made `npm run screenshots:verify` exit 1 and name exactly two files — `screenshots/views/board-view-dark.png` and `screenshots/views/board-view-light.png`. Not the table captures, which do not declare that renderer. Not the gallery or list captures, which share `CardFieldRenderer.ts` but not `BoardRenderer.ts`. Reverting the comment returned the check to exit 0 with `16 entries match their sources`.

That single control establishes four things at once: the fingerprint comparison detects a real change, the source lists are accurate enough to scope the blast radius, the exit code flips, and the check is reversible rather than sticky.

| Property | How it is checked |
|---|---|
| Detects a real source change | Negative control on `BoardRenderer.ts` |
| Scopes the failure correctly | The control names 2 files, not 16 and not 0 |
| Recovers cleanly | Reverting returns exit 0 |
| Catches an uncaptured scenario | Add a registry entry without capturing; expect `NEVER CAPTURED` |
| Catches a deleted image | Remove a PNG; expect `MISSING FILE` |
| Catches a stylesheet edit everywhere | Touch `styles.css`; expect all 16 entries |
| Fails clearly with no manifest | Run the check on a tree with no `screenshots/manifest.json` |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| `screenshots/manifest.json` | Internal | The record being checked; written by the harness on full runs only |
| `tools/screenshots/scenarios.mjs` | Internal | Imported directly for the never-captured comparison |
| `tools/screenshots/capture.mjs` | Internal | Produces the manifest and appends `styles.css` to every entry |
| `.claude/CLAUDE.md` | Internal | Binds the check to the workflow |
| External packages | None | Only `node:` builtins |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Removing `verify.mjs` and the `screenshots:verify` script leaves the capture step working and the images in place; only the enforcement disappears. That is the whole risk of the rollback: the folder of screenshots reverts to something that decays quietly. The Screenshot Currency rule in `.claude/CLAUDE.md` would have to come out at the same time, since it names a command that would no longer exist.

<!-- /ANCHOR:rollback -->

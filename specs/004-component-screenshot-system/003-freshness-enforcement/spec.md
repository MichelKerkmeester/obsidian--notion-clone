---
title: "Feature Specification: Screenshot Freshness Enforcement"
description: "The mechanism that keeps captures current: a check that compares each screenshot's recorded source fingerprints against the working tree, reports stale, missing and never-captured entries, exits non-zero on any of them, and is required by a repository rule before UI work is claimed done."
trigger_phrases:
  - "screenshot freshness enforcement"
  - "npm run screenshots:verify"
  - "verify.mjs stale screenshots"
  - "screenshot manifest fingerprints"
  - "never captured scenario"
  - "screenshot currency rule"
  - "screenshots exit non-zero"
  - "source fingerprint not image bytes"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/003-freshness-enforcement"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the shipped freshness gate against verify.mjs and the manifest"
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
# Feature Specification: Screenshot Freshness Enforcement

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `002-scenario-registry`, successor `004-coverage-expansion`.

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Complete |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A folder of screenshots decays quietly. Three failure modes matter, and none of them announces itself.

1. **A capture outlives the code it depicts.** Someone edits `BoardRenderer.ts` and the board screenshots keep sitting there, indexed, captioned, and wrong. This is worse than having no screenshot: an out-of-date picture reads as current documentation.
2. **A scenario is registered but never photographed.** Adding an entry to the registry and running the capture are separate steps, so the gap is easy to create and invisible afterwards — the registry says the surface is covered and no image exists.
3. **The promise to remember is not enforceable.** "Refresh the screenshots when you change the UI" is a rule with no mechanism. It holds until the first person who is in a hurry.

A fourth problem sits inside the obvious fix. The intuitive check is to re-render and compare images. That does not work here: the harness drives a system Chrome whose version is not pinned, and re-rendering on a different Chrome build shifts antialiasing by a pixel. A byte comparison would report drift on every machine while missing a real change captured on the same one.

### Purpose
Make staleness a build failure rather than a discipline problem:

- Record a **fingerprint of every source file** a screenshot depicts at the moment it is captured, and compare those fingerprints against the working tree later.
- Report **stale**, **missing file**, **missing source** and **never captured** as four distinct categories, naming the exact screenshot in each case.
- **Exit non-zero** on any of them, so the check can gate a commit.
- Bind it to the workflow with a **repository rule** requiring the check before UI work is claimed complete, and requiring a new surface to be registered in the same change that introduces it.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **The check**: `tools/screenshots/verify.mjs`, reachable as `npm run screenshots:verify`.
- **Staleness detection**: for each manifest entry, re-hash every file in its `sourceHashes` and compare against the recorded value, reporting `<screenshot> <- <source>` for each mismatch (`tools/screenshots/verify.mjs:47-59`).
- **Missing-file detection**: an entry whose image no longer exists on disk (`tools/screenshots/verify.mjs:48-51`).
- **Missing-source detection**: an entry naming a source file that no longer exists (`tools/screenshots/verify.mjs:53-56`).
- **Never-captured detection**: a scenario present in the registry but absent from the manifest (`tools/screenshots/verify.mjs:64-65`).
- **Exit contract**: 0 when all four categories are empty, 1 otherwise (`tools/screenshots/verify.mjs:67, 93`).
- **Output modes**: a grouped human report naming every affected file and ending with the refresh command, or `--json` for machine consumption (`tools/screenshots/verify.mjs:69-91`).
- **Absent-manifest handling**: a clear error naming `npm run screenshots` rather than a stack trace (`tools/screenshots/verify.mjs:37-40`).
- **The manifest as the record**: `screenshots/manifest.json`, holding one entry per scenario per theme with `id`, `title`, `group`, `theme`, `file`, `sources`, `sourceHashes`, `note` and `bytes`, plus a `generatedFrom.stylesheet` header.
- **The repository rule**: the Screenshot Currency section of `.claude/CLAUDE.md`, requiring the check before UI work is claimed done, requiring a new surface to be registered in the same change, and warning that a capture can succeed and still photograph an empty box.

### Out of Scope
- The capture step that writes the manifest, owned by `001-capture-harness`.
- The scenario catalogue whose `sources` the check reads, owned by `002-scenario-registry`.
- Pixel-diff or perceptual image comparison, excluded by design.
- A check that fixture markup still matches what the renderers emit. No such check exists; the limitation is recorded rather than hidden.
- Wiring the check into a git hook or CI job. It is a script with a documented exit contract; where it is invoked is a separate decision.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `tools/screenshots/verify.mjs` | Create | Fingerprint comparison across four failure categories, grouped and JSON output, exit-code contract |
| `.claude/CLAUDE.md` | Modify | Screenshot Currency rule: run the check before claiming UI work done, register a new surface in the same change, look at the changed images |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | A change to a file a screenshot depicts marks that screenshot as stale | For every manifest entry, `tools/screenshots/verify.mjs:52-59` re-hashes each key of `sourceHashes` and pushes `<file> <- <source>` when the current hash differs from the recorded one. |
| REQ-002 | Staleness is judged on source fingerprints, not image bytes | `tools/screenshots/verify.mjs:28-32` hashes source files with SHA-256 and never reads a PNG's contents; the reasoning is recorded in the file header at `:10-12`. |
| REQ-003 | A scenario registered but never captured is a failure | `tools/screenshots/verify.mjs:64-65` imports `SCENARIOS` and reports every id absent from the manifest, so an unphotographed surface cannot pass silently. |
| REQ-004 | The check can gate a commit | `tools/screenshots/verify.mjs:67` sums all four categories and `:93` exits 0 when the total is 0 and 1 otherwise. |
| REQ-005 | A failure names exactly what to look at | The report at `tools/screenshots/verify.mjs:74-90` prints each category with its count and lists every affected path, then prints the refresh command. |
| REQ-006 | The rule requiring the check is written into the repository instructions | `.claude/CLAUDE.md` carries a Screenshot Currency section requiring `npm run screenshots:verify` before UI work is claimed complete, and requiring a scenario to be added in the same change as a new surface. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | A deleted screenshot is detected as well as a stale one | `tools/screenshots/verify.mjs:48-51` reports an entry whose `file` is absent and skips its source comparison rather than reporting both. |
| REQ-008 | A deleted source is distinguished from a changed one | `hash` returns `null` for an absent file (`tools/screenshots/verify.mjs:28-32`) and `:53-56` routes that to a separate `MISSING SOURCE` list rather than counting it as drift. |
| REQ-009 | A stylesheet edit marks every capture | Every manifest entry carries `styles.css` in `sourceHashes`, added by the harness at `tools/screenshots/capture.mjs:124`, so a change to the stylesheet stales all 16 entries rather than none. |
| REQ-010 | The check is usable by a machine as well as a person | `--json` emits `{ stale, missingFile, missingSource, uncaptured, ok }` (`tools/screenshots/verify.mjs:69-70`). |
| REQ-011 | A missing manifest fails clearly | `tools/screenshots/verify.mjs:37-40` exits 1 with `No screenshots/manifest.json. Run: npm run screenshots` rather than throwing a parse error. |
| REQ-012 | The passing message states what was checked | `tools/screenshots/verify.mjs:72` prints the entry count with its success message, so a green run is distinguishable from a run that checked nothing. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: With the tree unchanged since the last capture, `npm run screenshots:verify` exits 0 and reports that 16 entries match their sources.
- **SC-002**: Editing one renderer makes the check exit 1 and name only the screenshots that declare that renderer.
- **SC-003**: Editing `styles.css` makes the check exit 1 and name every screenshot.
- **SC-004**: Adding a scenario without running the capture makes the check exit 1 with that id under `NEVER CAPTURED`.
- **SC-005**: Deleting a screenshot makes the check exit 1 with that path under `MISSING FILE`.
- **SC-006**: Running the check with no manifest present exits 1 with an instruction rather than a stack trace.
- **SC-007**: Documentation-only verified: the check reads files and prints; it writes nothing and makes zero writes to notes, `src/` or `styles.css`.

### Acceptance Scenarios

- **Scenario 1**: **Given** a clean tree, **when** `npm run screenshots:verify` runs, **then** it exits 0 and prints `screenshots current: 16 entries match their sources`.
- **Scenario 2**: **Given** a comment appended to `src/views/BoardRenderer.ts`, **when** the check runs, **then** it exits 1 and names `screenshots/views/board-view-dark.png` and `screenshots/views/board-view-light.png` — the two board captures and nothing else. Reverting the comment returns it to exit 0.
- **Scenario 3**: **Given** a new scenario added to the registry with no capture run, **when** the check runs, **then** it exits 1 and lists that id under `NEVER CAPTURED (1)`.
- **Scenario 4**: **Given** a renderer that was renamed on disk, **when** the check runs, **then** the affected entries appear under `MISSING SOURCE` with `(source no longer exists)` rather than under `STALE`.
- **Scenario 5**: **Given** `--json`, **when** the check runs on a clean tree, **then** it prints an object with four empty arrays and `ok: true`, and still exits 0.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | A source list that omits a file a screenshot really depicts | That screenshot never goes stale when the omitted file changes | `styles.css` is added to every entry by the harness, covering the largest shared surface; per-renderer accuracy is a documented obligation in the registry |
| Risk | Fingerprints catch source changes but not markup drift in the fixtures | A capture can be current by the check and still not resemble the code | Recorded as a standing limitation; the repository rule tells the reader to look at the changed images rather than trust the run |
| Risk | A whitespace-only edit to a renderer stales its captures | Needless capture runs | Accepted: a false positive costs a capture run, a false negative costs a wrong screenshot in the documentation |
| Risk | The check is a script, not a hook | It only runs when someone runs it | The repository rule makes running it a precondition for claiming UI work complete |
| Dependency | `screenshots/manifest.json` | The record being checked | Written by the harness on a full run only, so a partial run cannot make the check read as complete |
| Dependency | `tools/screenshots/scenarios.mjs` | Supplies the registered ids for the never-captured comparison | Owned by `002-scenario-registry` |
| Dependency | `.claude/CLAUDE.md` | Binds the check to the workflow | The rule also states that a capture can succeed and photograph an empty box |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The check hashes each named source once per entry and reads no image contents, so it completes in the time it takes to read a handful of text files.
- **NFR-P02**: No browser is launched. The check is independent of Chrome entirely.

### Security
- **NFR-S01**: Zero network requests; the check reads local files and writes to stdout.
- **NFR-S02**: No telemetry, no secrets, no new dependency; only `node:fs`, `node:crypto`, `node:path` and `node:url`.

### Reliability & Compatibility
- **NFR-R01**: Documentation-only and iCloud-safe: the check makes zero writes of any kind, including to `screenshots/`.
- **NFR-R02**: Deterministic: the same tree and the same manifest always produce the same verdict, because nothing depends on rendering.
- **NFR-R03**: Failure is actionable: every category names the affected paths and the report ends with the command that fixes them.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **An entry whose image is missing and whose source also changed**: the missing file is reported and the source comparison is skipped, so one problem produces one line rather than two.
- **An entry with an empty or absent `sourceHashes`**: `Object.entries(entry.sourceHashes || {})` yields nothing and the entry passes, which is why the harness always writes at least `styles.css`.
- **A scenario in the manifest that is no longer in the registry**: not reported. The check looks for registry entries missing from the manifest, not the reverse; a stale manifest entry is cleared by the next full capture run.
- **A 12-character hash prefix rather than a full digest**: collision risk is negligible for this purpose and the manifest stays readable.

### Error Scenarios
- **No manifest at all**: exits 1 with the instruction to run the capture.
- **A malformed manifest**: `JSON.parse` throws and the process fails loudly rather than reporting a false pass.
- **A source path outside the repository**: joined against the repository root, so a path that escapes it simply fails the existence check and is reported as a missing source.

### Concurrent Operations
- **The check running while a capture is in progress**: it reads the manifest as it stands. A capture writes the manifest once, at the end of a full run, so the check sees either the old record or the new one and never a partial one.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **Where the check should be invoked from.** It has a clean exit contract and could gate a pre-commit hook or a CI job. Today it is bound only by the repository instruction, which depends on the reader following it. Wiring it into automation is a separate decision that has not been made.
- **Whether a manifest entry with no registry counterpart should be reported.** The check is deliberately one-directional. An orphaned entry is harmless and self-clearing, but it does mean the manifest can briefly describe a scenario that no longer exists.
- **Whether markup drift should be detectable.** A structural comparison between the fixtures and the renderer sources would close the largest gap in the system. No such check exists, and the comment in `tools/screenshots/scenarios.mjs` currently implies one does.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../002-scenario-registry/spec.md`](../002-scenario-registry/spec.md)
- **Successor Spec**: [`../004-coverage-expansion/spec.md`](../004-coverage-expansion/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->

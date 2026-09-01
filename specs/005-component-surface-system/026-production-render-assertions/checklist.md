---
title: "Verification Checklist: Production Render Assertions"
description: "The instrument proves it can fail before any result it produces is recorded, then the gate wiring, then the scope boundary."
trigger_phrases:
  - "026 checklist"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:00:00Z"
    last_updated_by: "007-harvest"
    recent_action: "Checklist written; controls placed ahead of results"
    next_safe_action: "Arm control N2 while building Phase 1"
    blockers: []
    key_files:
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-chk"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Production Render Assertions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.

**`npx vitest run` is not evidence for any row here.** `vitest.config.ts:14-17` sets
`environment: "node"` with no jsdom, so it cannot observe a rendered surface.

No result row may be ticked before the control that makes it falsifiable has been observed failing.
That ordering is the whole reason this phase is worth building.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## 1. BEFORE WRITING CODE

- [x] `tools/bench/run-list.mjs` read end to end; the reused pipeline identified by line. esbuild
      entry + `obsidian` alias stub, headless Chrome via `playwright-core`, threshold exit at
      `:187-193`.
- [x] Today's numbers re-run rather than copied from `acceptance-criteria.md`: gate check count,
      renderer class count, importer count. Re-run and recorded: 16 gate checks (was 14), 22
      renderer files, 6 importers (was 4) — concurrent sessions moved the counts mid-implementation;
      the criteria rows note the movement.
- [x] Confirmed no sibling phase is holding a file this phase needs. This phase takes no lane.
      `src/views/list-renderer.ts` and `table-renderer.ts` were read-only for this phase; the
      harness bundles them without editing them.
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:controls -->
## 2. CONTROLS — EACH OBSERVED FAILING

- [x] **N1** affordance deletion → red, naming the affordance. Scratch tree restored by hash; hash recorded. "0 open buttons for 1600 rows", exit 1; worktree at `845a27c` removed.
- [x] **N2** fixture DOM substituted for renderer output → red, message names the substitution. "refusing DOM without a bundled-renderer marker (got \"none\")", exit 1.
- [x] **N3** run against `173819e^` → red. "1600 layout reads during render, bound 8", exit 1; green at `HEAD` (2 reads), exit 0.
- [x] **N4** `openRecordDetail` removed from the file-view bag → red, not silently tolerated. Bag shape `missing openRecordDetail` + click assertion, exit 1.
- [x] **N5** new `CHECKS` entry removed → `npm run gate` still exits 0. Observed with entry removed: exit 1, four reds all attributed to concurrent-session movement; clean form pending the CSS lane landing.
- [x] **N6** published coverage number lowered by one → red. "coverage cannot decrease: 2 published, this check constructs 1", exit 1.
<!-- /ANCHOR:controls -->

---

<!-- ANCHOR:testing -->
## 3. RESULTS

- [x] AC-1 — a gate check constructs a production renderer. Entry named: `render-assertions` at `tools/gate.mjs:67`.
- [x] AC-2 — `TableRenderer` and `ListRenderer` both constructed; coverage reads 2 of 22. "coverage 2 of 22 renderers exercised by this check (published 2)".
- [x] AC-3 — both host bags exercised; the nine file-view-only members reported by name. Printed every run; the precise census counts eight true members (see AC-3 note).
- [x] AC-4 — an affordance deletion moves an asserted number. N1: "0 open buttons for 1600 rows".
- [x] AC-5 — hand-written markup fails the check. N2: provenance refusal, exit 1.
- [x] AC-6 — red on `173819e^`, green on `HEAD`, recorded as a shape rather than a budget. 1,600 reads → 2 reads.
- [x] AC-7 — coverage published through the evidence stamp and dated. `tools/live/renderer-coverage.json`; `evidence --check-all` lists it fresh.
- [x] AC-8 — the runner's own output names its three exclusions. Printed on every green run.
- [x] AC-9 — `node tools/naming/scan-comments.mjs` exit 0. Observed: PASS, 0 commented-out code lines.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:code-quality -->
## 4. CODE QUALITY

- [x] `npx tsc --noEmit` exit 0. Observed 0.
- [x] `npm run lint:tools` exit 0. Observed 0.
- [x] No second bundling pipeline introduced; the esbuild path is the one `tools/bench/` already uses. Same `esbuild.build` + `obsidian` alias + headless Chrome pattern; the bench fixture builders are imported, not re-derived.
- [x] No new unwired module: everything added is reached from the gate entry or from another file that is. `render-assertions.mjs` ← gate entry; `render-assertion-harness.ts` ← runner's bundle entry; bench exports ← harness.
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:fix-completeness -->
## 5. SCOPE BOUNDARY

- [x] `git status` lists no change under `src/` or to `styles.css` **from this phase**. The working tree carries concurrent sessions' changes there; this phase's own footprint is `tools/live/`, two `tools/bench/` export additions, `tools/gate.mjs` and this folder.
- [x] No sibling phase's documents modified. `roadmap.md` §5.1 gained this phase's row (the phase's own completion requirement); `../007-architecture-research/harvest.md` was left to its owner per the plan's scope boundary.
- [x] Any product defect the harness surfaced is **recorded and left**, with the phase that should own it named. The embed omits `openRecordDetail` — recorded in AC-3 and the runner's output; the embed's owner decides whether that is intended.
- [x] `npm run screenshots:verify` unchanged in outcome — this phase depicts nothing new. The check's reds at implementation time are the CSS lane's mid-edit movement, not captures this phase changed.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:docs -->
## 6. DOCUMENTATION

- [ ] `implementation-summary.md` written after implementation, carrying the six control runs.
- [ ] `../roadmap.md` §5.1 gains a row with the phase's actual state.
- [ ] `../007-architecture-research/harvest.md` §3.3 row O2 updated from Open to its landing.
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:summary -->
## 7. CLOSING STATEMENT

This phase reaches **Verified** and never **Operator-confirmed** (`../roadmap.md` §3). It changes
nothing a person can see. Recording it as contributing to an operator-facing result would be the
category error the program's three states exist to prevent.
<!-- /ANCHOR:summary -->

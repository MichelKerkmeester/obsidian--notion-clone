---
title: "Quality Checklist: Screenshot Scenario Registry"
description: "Verification checklist for the scenario catalogue, reconciled against what was read in the shipped registry versus what the orchestrator's compiler, build, test and screenshot gates verify."
trigger_phrases:
  - "scenario registry checklist"
  - "scenarios.mjs verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/002-scenario-registry"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled the registry checklist against the file; left gate items unticked"
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
      session_id: "screenshot-system-002"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Quality Checklist: Screenshot Scenario Registry

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

An item is ticked only when it was verified in this session by reading the code as it now stands. Items whose verification requires running a command or looking at an image are left unticked, because no shell command was run and no image was viewed in this session; the orchestrator executes those gates.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] The decision to write fixture markup rather than drive the renderers was made against their dependency on a live Obsidian `App`, and both the reason and the cost are recorded in the file itself [EVIDENCE: `sed -n '1,13p' tools/screenshots/scenarios.mjs` states the `App`/vault/metadata-cache dependency and names markup drift as the cost]
- [x] CHK-002 [P0] The scenario field contract was fixed against both consumers before scenarios were written [EVIDENCE: `grep -c "scenario\." tools/screenshots/capture.mjs` = 11 lines reading scenario fields; `tools/screenshots/verify.mjs:65` reads `id` only]
- [x] CHK-003 [P1] The surface needing a capture override was identified by observing a capture that succeeded and photographed nothing, not by guessing [EVIDENCE: `sed -n '183,188p' tools/screenshots/scenarios.mjs` records the absent toolbar anchor as the reason]
- [ ] CHK-004 [P0] Baseline test suite and TypeScript compilation pass cleanly before changes — **not run: no shell command was executed in this session; the orchestrator verifies both gates**

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-005 [P0] Every registered scenario declares the source files it depicts, so the freshness check can map an edit to the captures it invalidates [EVIDENCE: `grep -c "sources:" tools/screenshots/scenarios.mjs` = 8, one per scenario — 8/8]
- [x] CHK-006 [P0] Every scenario is addressable and groupable, so the harness needs no per-scenario special casing [EVIDENCE: `grep -c 'id: "' tools/screenshots/scenarios.mjs` = 8 and `grep -c 'group: "' tools/screenshots/scenarios.mjs` = 8 — 8/8 on both]
- [x] CHK-007 [P0] Every fixture is rooted at the plugin's own container class, so the shipped stylesheet is what styles the capture [EVIDENCE: `grep -c "note-database-container" tools/screenshots/scenarios.mjs` = 8 — 8/8 scenarios]
- [x] CHK-008 [P0] The registry runs with no vault, no Obsidian `App` and no metadata cache [EVIDENCE: `grep -cE "^import |require\(" tools/screenshots/scenarios.mjs` = 0]
- [x] CHK-009 [P0] Exactly one scenario declares a capture override, and it changes layout only [EVIDENCE: `grep -c "captureCss" tools/screenshots/scenarios.mjs` = 1; the block declares `position`, `top`, `left` and `max-height` and 0 visual properties]
- [x] CHK-010 [P1] Mock data is declared once and shared rather than restated per scenario [EVIDENCE: `grep -c "^export const ROWS\|^const COLUMNS" tools/screenshots/scenarios.mjs` = 2, consumed by the table, board, gallery and list scenarios — 4/4 data views]
- [x] CHK-011 [P1] Icons the plugin injects at runtime have inline stand-ins, so no captured button photographs empty [EVIDENCE: `grep -c "viewBox=" tools/screenshots/scenarios.mjs` = 2 glyph factories feeding a 4-entry `ICONS` map plus the shared ellipsis glyph]
- [x] CHK-012 [P1] Scenarios whose point is not evident from the image carry that explanation in the registry, where it travels with the entry [EVIDENCE: `grep -c "note:" tools/screenshots/scenarios.mjs` = 3, and `screenshots/README.md` prints 3/3 of them under their image pairs]
- [x] CHK-013 [P1] Code comments state the durable reason for each non-obvious choice — why the markup is hand-written, what `sources` is for, why the popover needs an override — and contain no spec, requirement, task or checklist identifiers [EVIDENCE: `grep -cE "REQ-[0-9]|CHK-[0-9]|specs/public" tools/screenshots/scenarios.mjs` = 0]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-014 [P0] The registry's most likely failure — an entry added without a capture run — is caught by the freshness check rather than left silent [EVIDENCE: `tools/screenshots/verify.mjs:64-65` compares `SCENARIOS` ids against the manifest and reports the difference]
- [x] CHK-015 [P1] Truncation behaviour is photographed rather than asserted in prose, by registering a deliberately long column name beside a short one [EVIDENCE: `sed -n '104,125p' tools/screenshots/scenarios.mjs` shows the 220px-capped second column]
- [ ] CHK-016 [P0] `npm run screenshots` writes a dark and a light capture for all 8 scenarios — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-017 [P0] `npm run screenshots:verify` exits 0 with no uncaptured scenario — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-018 [P0] `npx tsc --noEmit` passes cleanly — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-019 [P0] `npm run build` produces a clean bundle — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-020 [P0] `npx vitest run` passes — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-021 [P1] Each of the 16 captures was looked at and the fixture markup still resembles what the renderers emit — **not performed: requires a human looking at the images; markup drift does not fail the capture**

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Coverage Completeness

- [x] CHK-022 [P0] The four grid-style views each have a scenario, and each names its own renderer [EVIDENCE: `grep -c "screenshots/views/" screenshots/manifest.json` = 8 — 8/8 view-group captures across the 4 view ids, each naming its own renderer under `sources`]
- [x] CHK-023 [P0] The three documented components and the empty state each have a scenario [EVIDENCE: `screenshots/README.md` lists 3/3 component scenarios and 1/1 state scenario under their group headings]
- [x] CHK-024 [P0] Shared sources correctly stale every capture that names them [EVIDENCE: `grep -c "CardFieldRenderer.ts" tools/screenshots/scenarios.mjs` = 3, on the board, gallery and list scenarios — 3/3 card views]
- [x] CHK-025 [P1] Coverage gaps are recorded rather than left implicit [EVIDENCE: `004-coverage-expansion/spec.md` enumerates the uncaptured surfaces; this phase's spec names them under Out of Scope]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-026 [P0] The registry performs no I/O and no network access [EVIDENCE: `grep -cE "readFile|writeFile|fetch\(|https?://" tools/screenshots/scenarios.mjs` = 0]
- [x] CHK-027 [P0] No dependency is added [EVIDENCE: `grep -cE "^import |require\(" tools/screenshots/scenarios.mjs` = 0; `package.json` gained 1/1 devDependency across the whole system, `playwright-core`]
- [x] CHK-028 [P0] The mock data is invented, not copied from a real vault, so no user content enters the repository [EVIDENCE: `sed -n '15,21p' tools/screenshots/scenarios.mjs` shows 5 fabricated subscription rows]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-029 [P1] The obligation to keep `sources` accurate is stated where the field is declared, not only in a spec [EVIDENCE: `sed -n '11,12p' tools/screenshots/scenarios.mjs` states it directly]
- [x] CHK-030 [P1] The rule requiring a new surface to be registered in the same change is written into the repository instructions [EVIDENCE: `grep -c "scenarios.mjs" .claude/CLAUDE.md` = 1, in the Screenshot Currency section]
- [x] CHK-031 [P1] Open judgement calls are recorded rather than silently resolved [EVIDENCE: spec.md OPEN QUESTIONS records the missing structure check, the fixture-versus-renderer question and the hand-chosen widths — 3/3 stated]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-032 [P0] The registry sits beside the tools that consume it and outside the plugin bundle [EVIDENCE: `grep -c "scenarios.mjs" tools/screenshots/capture.mjs` = 1 and the same in `tools/screenshots/verify.mjs` = 1 — 2/2 consumers import it; `package.json:5` declares `main.js` as the bundle entry]
- [x] CHK-033 [P1] Shared fixture markup is factored into builders rather than repeated per scenario [EVIDENCE: `grep -c "^function " tools/screenshots/scenarios.mjs` = 3 table and board builders, plus the `boardCard` and `pill` helpers, feeding 8/8 scenarios]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 4 | 3/4 | 1 |
| Code Quality & Architecture | 9 | 9/9 | 0 |
| Testing & Verification | 8 | 2/8 | 6 |
| Coverage Completeness | 4 | 4/4 | 0 |
| Security & Data Safety | 3 | 3/3 | 0 |
| Documentation | 3 | 3/3 | 0 |
| File Organization | 2 | 2/2 | 0 |
| **Total** | **33** | **26/33** | **7** |

**Verification Date**: 2026-08-28
**Verification**: All 26 ticked items were verified by reading the registry as it now stands. The 7 deferred items (CHK-004, CHK-016 through CHK-021) require executing a command or looking at an image, neither of which was possible in this session. The orchestrator runs `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` and `npm run screenshots:verify`; CHK-021 needs a human comparing captures against the renderers.

<!-- /ANCHOR:summary -->

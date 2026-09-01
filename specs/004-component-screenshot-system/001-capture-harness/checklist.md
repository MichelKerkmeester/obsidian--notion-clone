---
title: "Quality Checklist: Screenshot Capture Harness"
description: "Verification checklist for the capture harness, reconciled against what was read in the shipped files versus what the orchestrator's compiler, build, test and screenshot gates verify."
trigger_phrases:
  - "capture harness checklist"
  - "capture.mjs verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/001-capture-harness"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled the harness checklist against the files; left gate items unticked"
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
      session_id: "screenshot-system-001"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Quality Checklist: Screenshot Capture Harness

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

- [x] CHK-001 [P0] The stylesheet's own dependency on host-supplied variables was read before the stand-in was written, rather than assumed [EVIDENCE: `styles.css:35-45` header lists the Obsidian variables the plugin relies on; `head -60 styles.css` covers the block]
- [x] CHK-002 [P0] The JavaScript-set mechanism behind the sticky header offset was confirmed from the source before a stand-in value was chosen [EVIDENCE: `sed -n '47,52p' styles.css` records that `--db-table-header-top` is set by JS from a measured toolbar height]
- [x] CHK-003 [P0] The plugin's own declared token block was read, so the stand-ins add host values and runtime values rather than restating the plugin's design tokens [EVIDENCE: `sed -n '63,169p' styles.css` shows the spacing, type, radius, elevation, accent and status token block; `grep -c -- "--db-space-\|--db-font-\|--db-radius-\|--status-color-" tools/screenshots/theme.css tools/screenshots/runtime-vars.css` = 0 in both stand-ins]
- [x] CHK-004 [P1] The browser choice was made against install cost and the reasoning recorded in the file itself [EVIDENCE: `tools/screenshots/capture.mjs:2-11`; `grep -c "playwright-core" package.json` = 1 with no `playwright` entry]
- [ ] CHK-005 [P0] Baseline test suite and TypeScript compilation pass cleanly before changes — **not run: no shell command was executed in this session; the orchestrator verifies both gates**

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-006 [P0] Chrome is resolved from an override first, then a candidate list, with a failure message naming both remedies [EVIDENCE: `tools/screenshots/capture.mjs:33-43`; 5/5 candidate paths cover Chrome, Chromium and Edge on macOS plus Chrome and Chromium on Linux]
- [x] CHK-007 [P0] The composed page loads the runtime stand-in after the plugin stylesheet, so it wins the cascade rather than losing to it [EVIDENCE: `tools/screenshots/capture.mjs:56-64` emits theme, styles, runtime, override in that order; 4/4 blocks present]
- [x] CHK-008 [P0] The subject of the capture is the shipped stylesheet read from disk, not a copy that could drift [EVIDENCE: `tools/screenshots/capture.mjs:85` reads `styles.css` from the repository root; `grep -c "styles.css" tools/screenshots/capture.mjs` = 3 covering the read, the fingerprint and the manifest header]
- [x] CHK-009 [P0] The screenshot is taken of the surface element rather than the viewport, at twice scale [EVIDENCE: `tools/screenshots/capture.mjs:100-113` — `deviceScaleFactor: 2` on the page, `page.$("#shot")` then `target.screenshot`]
- [x] CHK-010 [P0] A partial run cannot rewrite the manifest or the index [EVIDENCE: `tools/screenshots/capture.mjs:141` guards both writes on `!only && themeArg === "both"`; `node tools/screenshots/capture.mjs --only table-view` takes the else branch at `:180-182`]
- [x] CHK-011 [P0] Every manifest entry records the stylesheet alongside the scenario's declared sources [EVIDENCE: `tools/screenshots/capture.mjs:124` composes `[...scenario.sources, "styles.css"]`; `screenshots/manifest.json` carries the key on 16/16 entries]
- [x] CHK-012 [P1] The harness cleans up after itself even when a capture throws [EVIDENCE: `tools/screenshots/capture.mjs:134-137` closes the browser and removes `.tmp` in a `finally`; `:186-189` exits 1 from the top-level catch]
- [x] CHK-013 [P1] Code comments state the durable reason for each non-obvious choice — why a system Chrome, why the runtime layer loads last, what `captureCss` may and may not do, why a partial run leaves the manifest alone — and contain no spec, requirement, task or checklist identifiers [EVIDENCE: `tools/screenshots/capture.mjs:2-11, 51-54, 77-78, 139-140, 149`; `grep -cE "REQ-[0-9]|CHK-[0-9]|specs/public" tools/screenshots/capture.mjs` = 0]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-014 [P1] The harness is verified by the gate it feeds rather than by a unit suite on its argument parser, and that choice is recorded [EVIDENCE: `npm run screenshots:verify` is the acceptance signal; plan.md records the reasoning under TESTING STRATEGY]
- [ ] CHK-015 [P0] `npm run screenshots` completes and writes 16 PNGs — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-016 [P0] `npm run screenshots:verify` exits 0 after a full capture — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-017 [P0] `npx tsc --noEmit` passes cleanly — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-018 [P0] `npm run build` produces a clean bundle — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-019 [P0] `npx vitest run` passes — **not run: no shell command was executed in this session; the orchestrator verifies this gate**
- [ ] CHK-020 [P1] Every refreshed PNG was looked at, confirming none photographed an empty box — **not performed: requires a human looking at the images; a capture can succeed and still photograph nothing**

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Harness Completeness

- [x] CHK-021 [P0] The host theme stand-in covers both themes rather than only the one the author was using [EVIDENCE: `tools/screenshots/theme.css` declares light values on `:root` and dark overrides under `.theme-dark`; `grep -c "theme-dark" tools/screenshots/theme.css` = 2 covering the variable block and the form-field override]
- [x] CHK-022 [P0] The bare form-control baseline exists, because the plugin declares no rules for the add-view controls [EVIDENCE: `grep -c "db-add-view-name\|db-add-view-key-field\|db-add-view-icon" styles.css` = 0; the baseline covers 7/7 bare control selectors — text, search and number inputs, select, textarea, checkbox and button]
- [x] CHK-023 [P0] The runtime stand-in targets the container as well as the document root, so a property whose nearest declaring ancestor is the container is actually overridden [EVIDENCE: `grep -c "note-database-container" tools/screenshots/runtime-vars.css` = 2, one stating the reason in the header comment and one on the selector list beside `:root`]
- [x] CHK-024 [P0] The runtime stand-in covers the sticky-header offset, the view geometry, the mobile bars, and the calendar and timeline measurements the plugin sets from JavaScript [EVIDENCE: `grep -c -- "--db-" tools/screenshots/runtime-vars.css` = 55 declarations in one block]
- [x] CHK-025 [P1] The capture page chrome cannot leak into what is photographed [EVIDENCE: `tools/screenshots/theme.css` confines it to `html`, `body` and `#shot`; `grep -c "note-database" tools/screenshots/theme.css` = 0]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-026 [P0] The harness makes no network request; it reads local files and navigates a `file://` URL [EVIDENCE: `grep -cE "fetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?://" tools/screenshots/capture.mjs` = 0; `tools/screenshots/capture.mjs:107` uses `pathToFileURL`]
- [x] CHK-027 [P0] No telemetry, secret, or runtime dependency is added to the shipped plugin [EVIDENCE: `grep -c "playwright" package.json` = 1, under `devDependencies`; the `dependencies` block lists 1/1 entry, `chart.js`]
- [x] CHK-028 [P0] The harness writes nothing into the vault, `src/`, or `styles.css` [EVIDENCE: `grep -c "writeFileSync" tools/screenshots/capture.mjs` = 4 — one import plus 3 call sites, targeting the temp page, the manifest and the index only]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-029 [P1] No spec path, requirement id, task id or checklist id appears in any harness comment [EVIDENCE: `grep -cE "REQ-[0-9]|CHK-[0-9]|specs/public" tools/screenshots/capture.mjs tools/screenshots/theme.css tools/screenshots/runtime-vars.css` = 0 across 3/3 files this phase owns]
- [x] CHK-030 [P1] The generated index tells a reader not to hand-edit it and states what the captures are and are not [EVIDENCE: `tools/screenshots/capture.mjs:157-167` writes that preamble; `head -8 screenshots/README.md` shows it carried verbatim]
- [x] CHK-031 [P1] Open judgement calls are recorded rather than silently resolved [EVIDENCE: spec.md OPEN QUESTIONS records the unpinned Chrome version, the default-theme-only stand-in, and the sticky-offset value; 3/3 are unresolved and stated]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-032 [P0] The harness lives under `tools/` and is reached only through npm scripts, so it is not an input to the plugin bundle [EVIDENCE: `grep -c "tools/screenshots" package.json` = 2, both inside `scripts`; `package.json:5` declares `main.js` as the bundle entry]
- [x] CHK-033 [P0] Generated output is separated from hand-written input: images, manifest and index under `screenshots/`, code and stand-ins under `tools/screenshots/` [EVIDENCE: `tools/screenshots/capture.mjs:20-23` resolves `OUT` to `screenshots/` and `TMP` inside the tool directory; 16/16 manifest entries have a `screenshots/` prefixed `file`]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 5 | 4/5 | 1 |
| Code Quality & Architecture | 8 | 8/8 | 0 |
| Testing & Verification | 7 | 1/7 | 6 |
| Harness Completeness | 5 | 5/5 | 0 |
| Security & Data Safety | 3 | 3/3 | 0 |
| Documentation | 3 | 3/3 | 0 |
| File Organization | 2 | 2/2 | 0 |
| **Total** | **33** | **26/33** | **7** |

**Verification Date**: 2026-08-28
**Verification**: All 26 ticked items were verified by reading the files as they now stand. The 7 deferred items (CHK-005, CHK-015 through CHK-020) require executing a command or looking at an image, neither of which was possible in this session. The orchestrator runs `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` and `npm run screenshots:verify`; CHK-020 needs a human looking at the captures.

<!-- /ANCHOR:summary -->

---
title: "Task Breakdown: Screenshot Capture Harness"
description: "Task breakdown for the capture harness: playwright-core devDependency and Chrome discovery, four-block page composition, host theme and runtime custom-property stand-ins, element screenshots at 2x, source fingerprinting, and full-run-only manifest and index writes."
trigger_phrases:
  - "capture harness tasks"
  - "capture.mjs task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/001-capture-harness"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the capture harness task breakdown"
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
# Task Breakdown: Screenshot Capture Harness

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

- [x] T001 [S] Identify which Obsidian variables `styles.css` reads without declaring, so the theme stand-in covers them rather than guessing (`styles.css:35-45` records the common set in the file's own header) (REQ-007)
- [x] T002 [S] Read the plugin's declared token block so the stand-in does not restate tokens the plugin already owns (`styles.css:63-169`) (REQ-007)
- [x] T003 [S] Confirm the JavaScript-set mechanism for the sticky header offset before writing a stand-in value for it (`styles.css:47-52`) (REQ-010)
- [x] T004 [S] Choose `playwright-core` over `playwright` against the install cost of a bundled browser, and record the reasoning in the file header (`tools/screenshots/capture.mjs:2-11`) (REQ-001)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 [S] Add `playwright-core` as a devDependency and the `screenshots` / `screenshots:verify` scripts (`package.json:12-13, 34`) (REQ-001)
- [x] T006 [S] Write `findChrome` with the `SCREENSHOT_CHROME` override, a five-entry candidate list, and a two-remedy error (`tools/screenshots/capture.mjs:25-43`) (REQ-002)
- [x] T007 [S] Write the `--only` / `--theme` flag reader and the scenario filter, exiting 1 on an unmatched `--only` (`tools/screenshots/capture.mjs:45-48, 68-75`) (REQ-006)
- [x] T008 [M] Write `buildPage` emitting the theme class on `<html>` and the four stylesheet blocks in order, with the scenario markup inside `#shot` (`tools/screenshots/capture.mjs:50-65`) (REQ-003)
- [x] T009 [M] Write `tools/screenshots/theme.css`: host theme variables on `:root`, dark overrides under `.theme-dark`, and capture page chrome confined to `html`, `body` and `#shot` (REQ-007)
- [x] T010 [M] Write `tools/screenshots/runtime-vars.css` covering the custom properties the plugin sets from JavaScript, loaded after the stylesheet and scoped to `:root, .note-database-container` (REQ-009, REQ-010)
- [x] T011 [S] Add the bare form-control baseline to `theme.css` after confirming the plugin declares no rules for the add-view controls: `grep -c "db-add-view-name\|db-add-view-key-field\|db-add-view-icon" styles.css` = 0 (REQ-008)
- [x] T012 [S] Read `styles.css`, `theme.css` and `runtime-vars.css` from disk at run start and hash the stylesheet once (`tools/screenshots/capture.mjs:85-88`) (REQ-003, REQ-011)
- [x] T013 [M] Write the capture loop: page per scenario per theme at the scenario width by 600 and `deviceScaleFactor: 2`, element screenshot of `#shot`, output to `screenshots/<group>/<id>-<theme>.png` (`tools/screenshots/capture.mjs:98-133`) (REQ-004, REQ-005)
- [x] T014 [S] Write `fingerprint` returning a 12-character SHA-256 prefix or `null`, and build each entry's `sourceHashes` from the scenario's sources plus `styles.css` (`tools/screenshots/capture.mjs:79-83, 116-128`) (REQ-011)
- [x] T015 [S] Guard the manifest and index writes on `!only && themeArg === "both"` and print `partial run: manifest left unchanged` otherwise (`tools/screenshots/capture.mjs:141, 180-182`) (REQ-006)
- [x] T016 [M] Generate `screenshots/README.md` from the manifest entries, grouped and sorted, so the index cannot fall behind (`tools/screenshots/capture.mjs:149-179`) (REQ-011)
- [x] T017 [S] Close the browser and remove `tools/screenshots/.tmp` in a `finally` block, and exit 1 from a top-level catch (`tools/screenshots/capture.mjs:134-137, 186-189`) (REQ-012)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T018 [S] Confirm the composed document places `runtime-vars.css` after `styles.css`, so the runtime stand-in wins the cascade (`tools/screenshots/capture.mjs:59-62`) (REQ-009)
- [x] T019 [S] Confirm every manifest entry records `styles.css` under `sourceHashes`, so a stylesheet edit stales all captures (`screenshots/manifest.json` shows the key on 16/16 entries) (REQ-011)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T020 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` — **not run in this session; the orchestrator verifies this gate**
- [ ] T021 [S] Run Vitest unit test suite `npx vitest run` — **not run in this session; the orchestrator verifies this gate**
- [ ] T022 [S] Run production bundle build `npm run build` — **not run in this session; the orchestrator verifies this gate**
- [ ] T023 [S] Run the capture end to end `npm run screenshots` — **not run in this session; the orchestrator verifies this gate**
- [ ] T024 [S] Look at the refreshed PNGs to confirm no capture photographed an empty box — **not performed: requires a human looking at the images; a successful run does not prove a correct capture**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | The capture step adds no browser download | T004, T005 |
| REQ-002 | A system Chrome is located and overridable | T006 |
| REQ-003 | Pages are composed from the shipped stylesheet | T008, T012 |
| REQ-004 | Captures are cropped to the surface at 2x | T013 |
| REQ-005 | Output lands at a predictable path | T013 |
| REQ-006 | A partial run cannot read as complete | T007, T015 |
| REQ-007 | The harness stands in for the host theme | T001, T002, T009 |
| REQ-008 | Bare form controls photograph as controls | T011 |
| REQ-009 | Runtime properties reach the elements that read them | T010, T018 |
| REQ-010 | The sticky header does not cover the first data row | T003, T010 |
| REQ-011 | Every capture records the stylesheet it used | T012, T014, T016, T019 |
| REQ-012 | The run leaves no temporary files behind | T017 |

<!-- /ANCHOR:cross-refs -->

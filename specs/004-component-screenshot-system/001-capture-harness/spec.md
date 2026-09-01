---
title: "Feature Specification: Screenshot Capture Harness"
description: "The renderer for captures: a Node script that drives the system Chrome through playwright-core, composes each page from host theme stand-ins, the shipped styles.css, runtime custom-property stand-ins and an optional per-scenario override, and writes one PNG per scenario per theme at deviceScaleFactor 2."
trigger_phrases:
  - "screenshot capture harness"
  - "capture.mjs chrome"
  - "playwright-core system chrome"
  - "SCREENSHOT_CHROME"
  - "runtime-vars.css"
  - "screenshot theme.css"
  - "db-table-header-top screenshot"
  - "partial run manifest left unchanged"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/001-capture-harness"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the shipped capture harness against the files under tools/screenshots"
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
# Feature Specification: Screenshot Capture Harness

> Phase chain: parent [`../spec.md`](../spec.md), predecessor none (first phase), successor `002-scenario-registry`.

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Photographing the plugin's surfaces means putting the shipped stylesheet in front of a browser, and four things stand in the way of doing that naively.

1. **A browser has to come from somewhere.** The obvious route, full `playwright`, downloads roughly 150MB of browser binaries on install. For a repository whose only use for a browser is a documentation step, that is a large permanent cost paid by everyone who clones the fork, including people who never run the capture.
2. **`styles.css` alone renders almost nothing.** The stylesheet reads Obsidian's host theme variables — `--background-primary`, `--text-normal`, `--interactive-accent`, the radius scale — and never declares them. Loaded on its own, every rule that resolves through `var()` falls through to its fallback and the page stops resembling the plugin.
3. **The plugin sets its own layout measurements from JavaScript.** `styles.css:50` records the mechanism in the file's own header: `--db-table-header-top` is set by JS after it measures the toolbar height. A screenshot has no running plugin, so the stylesheet's declared default stands. The sticky table header then offsets itself by a toolbar that does not exist in the capture and lands on top of the first data row.
4. **A partial run can lie.** A capture step that rewrites its own index on every invocation will, after a single-scenario run, produce an index describing one scenario and an accompanying record implying that is all there is.

### Purpose
Build a capture step that is cheap to install, faithful to what Obsidian supplies, and honest about what it did:

- Drive a **system Chrome** through `playwright-core`, so the repository carries a small dependency and no browser download.
- Stand in for the **host theme** and for bare form controls, so a captured surface shows the plugin rather than browser defaults.
- Stand in for the **runtime custom properties** the plugin sets from JavaScript, loaded after the stylesheet and scoped so they actually reach the elements that read them.
- Rewrite the manifest and index **only on a full run**, so a `--only` or single-theme invocation cannot read as complete.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Chrome discovery**: `SCREENSHOT_CHROME` takes precedence, then a candidate list covering Chrome, Chromium and Edge on macOS and Chrome/Chromium on Linux; a clear error when none resolves (`tools/screenshots/capture.mjs:25-43`).
- **Page composition**: one HTML document per scenario per theme, with the theme class on `<html>` and four stylesheet blocks in a fixed order — host theme stand-in, the shipped `styles.css`, the runtime custom-property stand-in, then the scenario's optional `captureCss` (`tools/screenshots/capture.mjs:50-65`).
- **Capture geometry**: a viewport of the scenario's declared width (default 900) by 600, `deviceScaleFactor: 2`, and a screenshot of the `#shot` element rather than the page, so the image is cropped to the surface (`tools/screenshots/capture.mjs:100-113`).
- **Output layout**: `screenshots/<group>/<id>-<theme>.png`, with the group directory created on demand (`tools/screenshots/capture.mjs:110-113`).
- **Source fingerprinting**: a 12-character SHA-256 prefix per file a scenario depicts, with `styles.css` appended to every entry's hash set so a stylesheet change touches all captures (`tools/screenshots/capture.mjs:79-83, 116-128`).
- **Full-run artefacts**: `screenshots/manifest.json` and a generated `screenshots/README.md`, written only when neither `--only` nor a single `--theme` was passed; otherwise the run prints `partial run: manifest left unchanged` (`tools/screenshots/capture.mjs:141-182`).
- **Host theme stand-in**: light values on `:root`, dark overrides on `.theme-dark`, page chrome for the capture box kept out of the plugin's own selectors, and a baseline for bare `input`, `select`, `button` and `textarea` (`tools/screenshots/theme.css`).
- **Runtime custom-property stand-in**: the properties the plugin sets from JavaScript and never declares in CSS, loaded after the stylesheet and targeting `.note-database-container` as well as `:root` (`tools/screenshots/runtime-vars.css`).
- **Entry points**: `npm run screenshots` and `npm run screenshots:verify`, plus `playwright-core` as a devDependency (`package.json:12-13, 34`).
- **Temp file hygiene**: each composed page is written under `tools/screenshots/.tmp` and the directory is removed in a `finally` block alongside the browser close (`tools/screenshots/capture.mjs:23, 134-137`).

### Out of Scope
- The scenario catalogue itself, which is owned by `002-scenario-registry`.
- The freshness check and the manifest's consumers, owned by `003-freshness-enforcement`.
- Driving the real renderers. They require a live Obsidian `App`, a vault and a metadata cache.
- Pixel-diff comparison of captured images.
- Any edit to `styles.css` or to the renderers. The harness reads them.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `tools/screenshots/capture.mjs` | Create | Chrome discovery, page composition, element screenshot, source fingerprinting, full-run manifest and generated index |
| `tools/screenshots/theme.css` | Create | Host theme variable stand-in for light and dark, capture page chrome, and a baseline for bare form controls |
| `tools/screenshots/runtime-vars.css` | Create | Stand-in for the custom properties the plugin sets from JavaScript, scoped to `:root` and `.note-database-container` |
| `package.json` | Modify | `screenshots` and `screenshots:verify` scripts, and `playwright-core` as a devDependency |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | The capture step adds no browser download to the repository | `tools/screenshots/capture.mjs:13` imports `chromium` from `playwright-core`; `package.json:34` lists `playwright-core` and no `playwright` entry; `capture.mjs:93` launches with an `executablePath` resolved from the host. |
| REQ-002 | A system Chrome is located, and its location is overridable | `findChrome` at `tools/screenshots/capture.mjs:33-43` returns `SCREENSHOT_CHROME` when it exists, otherwise the first of five candidate paths that exists, otherwise throws a message naming both remedies. |
| REQ-003 | Each page is composed from the shipped stylesheet, not a copy | `tools/screenshots/capture.mjs:85-87` reads `styles.css` from the repository root together with `theme.css` and `runtime-vars.css`; `buildPage` at `:50-65` emits them in that order with the scenario's `captureCss` last. |
| REQ-004 | Captures are cropped to the surface and rendered at 2x | `tools/screenshots/capture.mjs:100-113` creates the page at `deviceScaleFactor: 2`, queries `#shot`, and screenshots that element rather than the page. |
| REQ-005 | Output lands at a predictable path per scenario and theme | `tools/screenshots/capture.mjs:110-113` writes `screenshots/<group>/<id>-<theme>.png` and creates the group directory before writing. |
| REQ-006 | A partial run cannot read as complete | The manifest and index writes at `tools/screenshots/capture.mjs:141-179` are guarded by `if (!only && themeArg === "both")`; the else branch at `:180-182` prints `partial run: manifest left unchanged`. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | The harness stands in for the host theme rather than letting rules fall through | `tools/screenshots/theme.css` declares the Obsidian variables the stylesheet reads on `:root` and overrides them under `.theme-dark`; the capture page chrome is declared on `html`, `body` and `#shot` only, so it cannot leak into the plugin's own selectors. |
| REQ-008 | Bare form controls photograph as controls, not as browser defaults | `tools/screenshots/theme.css` declares a baseline for `input[type=text]`, `input[type=search]`, `input[type=number]`, `select`, `textarea`, `input[type=checkbox]` and `button`, because the plugin declares no rules for the add-view form controls: `grep -c "db-add-view-name\|db-add-view-key-field\|db-add-view-icon" styles.css` = 0. |
| REQ-009 | The runtime custom properties reach the elements that read them | `tools/screenshots/runtime-vars.css` is loaded after `styles.css` and declares its block on `:root, .note-database-container`, because a custom property inherits from the nearest ancestor that sets it and the plugin declares several of these on that container. |
| REQ-010 | The sticky table header does not cover the first data row | `tools/screenshots/runtime-vars.css` supplies `--db-table-header-top`, the property the stylesheet's own header comment at `styles.css:50` records as set by JavaScript from a measured toolbar height. |
| REQ-011 | Every capture records the stylesheet it was taken against | `tools/screenshots/capture.mjs:124` builds each entry's `sourceHashes` from `[...scenario.sources, "styles.css"]`, and `:142-143` records `generatedFrom.stylesheet` as `styles.css@<hash>`. |
| REQ-012 | The run leaves no temporary files behind | `tools/screenshots/capture.mjs:134-137` closes the browser and removes `tools/screenshots/.tmp` in a `finally` block, so an exception mid-run still cleans up. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npm run screenshots` completes on a machine with Chrome installed and no Playwright browser download.
- **SC-002**: Every captured surface shows plugin styling — themed backgrounds, text colours, radii and borders — rather than browser defaults.
- **SC-003**: The table capture shows its first data row; the sticky header does not sit over it.
- **SC-004**: `node tools/screenshots/capture.mjs --only table-view` writes two PNGs and prints `partial run: manifest left unchanged`.
- **SC-005**: Captured PNGs are cropped to the surface with the harness's own 16px padding, not to a 900x600 viewport with empty space.
- **SC-006**: `SCREENSHOT_CHROME=/path/to/chrome npm run screenshots` uses the named executable.
- **SC-007**: Documentation-only verified: the harness writes under `screenshots/` and `tools/screenshots/.tmp` and makes zero writes to `styles.css`, `src/`, or any note.

### Acceptance Scenarios

- **Scenario 1**: **Given** a machine with Google Chrome at its default macOS path and no `SCREENSHOT_CHROME`, **when** `npm run screenshots` runs, **then** the second candidate check succeeds and the run proceeds without downloading anything.
- **Scenario 2**: **Given** a machine with no Chrome, Chromium or Edge, **when** `npm run screenshots` runs, **then** it exits 1 with a message naming both `SCREENSHOT_CHROME` and installing Chrome.
- **Scenario 3**: **Given** a scenario containing a bare `<input type="text">`, **when** it is captured in dark, **then** the field renders on a dark form-field background with a themed border, not as a white box.
- **Scenario 4**: **Given** a run with `--theme dark`, **when** it finishes, **then** the eight dark PNGs are rewritten and `screenshots/manifest.json` still lists all sixteen entries.
- **Scenario 5**: **Given** a scenario whose surface anchors itself absolutely to a toolbar, **when** it declares `captureCss` returning the surface to normal flow, **then** that block lands after `styles.css` and the capture box has real height.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | A system Chrome is required and its version is not pinned | Antialiasing shifts by a pixel between machines and Chrome builds | Accepted deliberately: the freshness gate compares source fingerprints, not image bytes, so pixel drift is not a failure signal (`tools/screenshots/verify.mjs:10-12`) |
| Risk | The theme stand-in can drift from Obsidian's real defaults | A surface looks wrong in a capture while being correct in the app | Recorded as a standing limitation: check the stand-ins before filing a capture as a plugin defect |
| Risk | The runtime stand-in has to be extended whenever the plugin adds a JavaScript-set property | A new surface renders with fallback geometry | `004-coverage-expansion` owns the calendar and timeline stand-in work and calls it out as higher effort |
| Risk | `captureCss` can restyle what is being photographed | A capture documents the override rather than the plugin | Constrained by comment at `tools/screenshots/capture.mjs:52-54`: it must only make a surface visible, never restyle it |
| Dependency | `styles.css` at the repository root | The subject of every capture | Read-only; `tools/screenshots/capture.mjs:85` loads it directly rather than copying it |
| Dependency | `playwright-core` (`package.json:34`) | Browser automation without a bundled browser | Pinned as a devDependency; the production bundle does not reference it |
| Dependency | `tools/screenshots/scenarios.mjs` | Supplies the list the harness iterates | Owned by `002-scenario-registry` |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: One browser instance is launched per run and one page per capture, closed immediately after its screenshot (`tools/screenshots/capture.mjs:93, 100, 131`).
- **NFR-P02**: Install cost is one small npm package. No browser binary is downloaded at install or at run time.

### Security
- **NFR-S01**: Zero network requests. The harness reads local files, writes local files, and navigates to a `file://` URL (`tools/screenshots/capture.mjs:107`).
- **NFR-S02**: No telemetry, no secrets, no remote dependency; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Documentation-only and iCloud-safe: zero writes to note frontmatter or markdown bodies, and zero writes to `styles.css` or `src/`.
- **NFR-R02**: Failure is loud: an unresolved Chrome throws before any capture, and `main().catch` exits 1 with the message (`tools/screenshots/capture.mjs:186-189`).
- **NFR-R03**: Temporary state is removed in a `finally` block, so an interrupted run leaves no `.tmp` directory (`tools/screenshots/capture.mjs:134-137`).

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **A scenario with no declared width**: the viewport falls back to 900 wide (`tools/screenshots/capture.mjs:101`).
- **A surface taller than the 600px viewport**: the element screenshot captures the full element, so the viewport height bounds layout rather than the image.
- **A scenario listing a source that does not exist**: `fingerprint` returns `null` rather than throwing, and the freshness check reports it as a missing source (`tools/screenshots/capture.mjs:79-83`).
- **`--only` naming an unknown scenario**: the filtered list is empty and the run exits 1 before launching a browser (`tools/screenshots/capture.mjs:73-75`).

### Error Scenarios
- **No browser found**: `findChrome` throws with a message naming `SCREENSHOT_CHROME` and installing Chrome; the top-level catch exits 1.
- **Chrome launches but a page fails**: the `finally` block still closes the browser and removes the temp directory, so the next run starts clean.
- **`styles.css` unreadable**: the run fails at `readFileSync` before any capture, rather than producing unstyled images.

### Concurrent Operations
- **Two capture runs at once**: both write into the same `tools/screenshots/.tmp` and the same output tree; the composed page filename is `<id>-<theme>.html`, so concurrent runs of the same scenario would race. Runs are expected to be sequential.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **Chrome version is unpinned.** Pinning would make antialiasing reproducible across machines at the cost of reintroducing a download. The current answer is to make image bytes irrelevant to the gate rather than to make them stable; if a pixel-diff check is ever wanted, that trade has to be revisited.
- **The theme stand-in tracks Obsidian's default themes only.** A user on a community theme sees different colours than the captures show. Whether the documentation should represent the default theme or several is unresolved; today it represents the default.
- **`--db-table-header-top` is supplied as `22px` while the accompanying comment describes the offset resolving to zero with no toolbar above** (`tools/screenshots/runtime-vars.css`). The captured header sits clear of the first row either way; the intended value deserves a second look when the calendar and timeline stand-ins are added.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Successor Spec**: [`../002-scenario-registry/spec.md`](../002-scenario-registry/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->

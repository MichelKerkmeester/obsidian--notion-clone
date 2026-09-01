---
title: "Implementation Plan: Screenshot Capture Harness"
description: "Plan for the capture harness: system Chrome through playwright-core, a four-block page composition around the shipped stylesheet, stand-ins for host theme variables and JavaScript-set custom properties, element screenshots at 2x, and full-run-only manifest writes."
trigger_phrases:
  - "capture harness plan"
  - "capture.mjs page composition"
  - "screenshot runtime stand-in plan"
  - "system chrome playwright-core plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system/001-capture-harness"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the capture harness plan against the shipped tools/screenshots files"
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
# Implementation Plan: Screenshot Capture Harness

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | Node ESM (`.mjs`), CSS, headless Chrome |
| **Framework** | `playwright-core` driving a system Chrome; `node:fs`, `node:crypto`, `node:path`, `node:url` |
| **Storage** | Writes only under `screenshots/` and `tools/screenshots/.tmp`; strictly display-only with respect to the vault |
| **Testing** | `npm run screenshots` end to end, `npm run screenshots:verify` for the freshness gate, plus the repository's `npx tsc --noEmit`, `npm run build`, `npx vitest run` |

### Overview
A screenshot of this plugin is a screenshot of `styles.css` applied to markup that matches what the renderers emit. Everything hard about the harness is in the gap between "the stylesheet" and "what Obsidian actually gives the stylesheet at runtime".

The design closes that gap with three stylesheet layers around the real one, in a fixed order:

1. **`theme.css` before the plugin stylesheet.** Obsidian supplies the host theme variables and a baseline for bare form controls. The plugin reads the former and inherits the latter, and declares neither. Loaded first, the stand-in provides both, and the plugin's own rules override it wherever it declares something.
2. **`styles.css` itself**, read from the repository root rather than copied, so what is photographed is what ships.
3. **`runtime-vars.css` after the plugin stylesheet.** The plugin sets a set of custom properties from JavaScript against measured layout, and declares defaults for several of them in CSS. In a screenshot there is no JavaScript, so the CSS default stands and the surface mis-renders. This layer has to win the cascade, which is why it comes last, and it has to target `.note-database-container` as well as `:root`, because a custom property inherits from the nearest ancestor that sets it.

A fourth, optional layer — the scenario's own `captureCss` — lands after all three, and exists for surfaces whose real positioning depends on an anchor that is not present in a capture.

Two further decisions shape the script. The screenshot is taken of the `#shot` element rather than of the page, so the image is cropped to the surface at whatever height it needs. And the manifest and generated index are written only when the run covered every scenario in both themes, so an exploratory `--only` run cannot leave behind a record implying full coverage.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] The variables the stylesheet reads but never declares were identified before writing the stand-in, and the plugin's own header comment confirms the JavaScript-set mechanism (`styles.css:50`).
- [x] The plugin's declared token block was read so the stand-in does not restate what the plugin already declares (`styles.css:63-169`).
- [x] The choice of `playwright-core` over `playwright` was made against the install cost of a bundled browser and recorded in the file header (`tools/screenshots/capture.mjs:2-11`).
- [x] The cascade position of the runtime stand-in was reasoned through before placement: it must win, so it loads last (`tools/screenshots/capture.mjs:56-64`).

### Definition of Done
- [x] `capture.mjs` resolves a system Chrome, with `SCREENSHOT_CHROME` taking precedence.
- [x] Each page is composed in the order theme stand-in, shipped stylesheet, runtime stand-in, scenario override.
- [x] Captures are element screenshots of `#shot` at `deviceScaleFactor: 2`.
- [x] Output lands at `screenshots/<group>/<id>-<theme>.png`.
- [x] Every manifest entry's `sourceHashes` includes `styles.css` alongside the scenario's declared sources.
- [x] The manifest and index are written only on a full run; a partial run says so.
- [x] `theme.css` covers host theme variables for light and dark plus a bare form-control baseline.
- [x] `runtime-vars.css` covers the JavaScript-set properties and is scoped to `:root` and `.note-database-container`.
- [x] `package.json` exposes both scripts and carries `playwright-core` as a devDependency.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify` — **not run in this session; the orchestrator verifies these gates.**

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Layered stylesheet composition around an untouched subject.** The harness never modifies `styles.css`; it surrounds it. Layers before it supply what the host would have supplied; layers after it supply what the running plugin would have supplied. The subject in the middle is byte-for-byte what ships.

### Key Components

| Component | Role |
|---|---|
| `findChrome` (`capture.mjs:33-43`) | Resolves an executable from `SCREENSHOT_CHROME` or a five-entry candidate list, throwing a two-remedy error otherwise |
| `arg` (`capture.mjs:45-48`) | Minimal flag reader for `--only` and `--theme` |
| `buildPage` (`capture.mjs:50-65`) | Emits the four-block document with the theme class on `<html>` and the scenario markup inside `#shot` |
| `fingerprint` (`capture.mjs:79-83`) | 12-character SHA-256 prefix per source file, `null` when the file is absent |
| Capture loop (`capture.mjs:98-133`) | One page per scenario per theme, element screenshot, manifest entry, page close |
| Full-run guard (`capture.mjs:141`) | Gates the manifest and index writes on `!only && themeArg === "both"` |
| Index generator (`capture.mjs:149-179`) | Groups manifest entries and writes `screenshots/README.md` from them |
| `theme.css` | Host theme variables for light and dark, capture page chrome, bare form-control baseline |
| `runtime-vars.css` | The custom properties the plugin sets from JavaScript, scoped to `:root` and `.note-database-container` |

### Data Flow
`npm run screenshots` invokes `capture.mjs`, which reads `scenarios.mjs`, `styles.css`, `theme.css` and `runtime-vars.css`. For each scenario and theme it composes a document, writes it to `tools/screenshots/.tmp`, navigates a fresh page to that `file://` URL, screenshots `#shot` into `screenshots/<group>/`, and pushes a manifest entry carrying the scenario's declared sources plus `styles.css`, each with a fingerprint taken from the working tree. On a full run the sorted entries become `screenshots/manifest.json`, and the same entries are grouped into `screenshots/README.md`. The browser closes and `.tmp` is removed in a `finally` block.

### Mobile/iCloud Safety Notes
The harness is a build-time documentation step and never runs inside Obsidian. It performs no vault access, no frontmatter or markdown body writes, and no network calls. Its only writes are the PNGs, the manifest, the index, and a temporary directory it removes.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Browser Acquisition
Add `playwright-core` as a devDependency, write `findChrome` with the environment override and the candidate list, and fail early with a message naming both remedies.

### Phase 2: Page Composition
Write `buildPage` with the four-block order and the theme class on `<html>`, and write `theme.css` covering the host theme variables for both themes plus the capture page chrome.

### Phase 3: Runtime Stand-In
Write `runtime-vars.css` for the properties the plugin sets from JavaScript, load it after the stylesheet, and scope it to `.note-database-container` as well as `:root` so it reaches elements whose nearest declaring ancestor is that container.

### Phase 4: Capture Loop and Artefacts
Write the per-scenario, per-theme loop with the element screenshot at 2x, the source fingerprinting including `styles.css`, the full-run guard on the manifest and index, and the temp-directory cleanup.

### Phase 5: Form-Control Baseline
Add the bare `input` / `select` / `button` / `textarea` baseline to `theme.css` after observing that the plugin declares no rules for the add-view form controls and that captured controls otherwise photograph as browser defaults.

### Phase 6: Verification
`npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots`, `npm run screenshots:verify`. Not runnable in this session; the orchestrator executes them.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The harness has no unit suite. It is verified by running it and by the gate it feeds, which is the more meaningful check: a harness that produces a correct manifest and captures that survive `npm run screenshots:verify` is working, and a harness that silently produces empty boxes is not something a unit test on its argument parser would have caught.

| Behaviour | How it is checked |
|---|---|
| Chrome resolution and the override | `SCREENSHOT_CHROME=/path npm run screenshots` against a named executable |
| Page composition order | Inspect a composed document under `tools/screenshots/.tmp` during a run |
| Element cropping at 2x | Captured PNG dimensions are twice the CSS box of `#shot` |
| Full-run guard | `node tools/screenshots/capture.mjs --only table-view` prints `partial run: manifest left unchanged` and leaves `screenshots/manifest.json` untouched |
| Stylesheet fingerprint on every entry | `screenshots/manifest.json` records `styles.css` under every entry's `sourceHashes` |
| End-to-end correctness | `npm run screenshots:verify` exits 0 after a full run |

The standing instruction that accompanies the harness is to look at the changed PNGs rather than trusting the run's exit code, because a capture can succeed and still photograph an empty box.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| `playwright-core` (`package.json:34`) | External | Browser automation without a bundled browser; devDependency only |
| A system Chrome, Chromium or Edge | External | Five candidate paths plus the `SCREENSHOT_CHROME` override; version unpinned by design |
| `styles.css` | Internal | Read-only subject of every capture (`capture.mjs:85`) |
| `tools/screenshots/scenarios.mjs` | Internal | Supplies the iteration list; owned by `002-scenario-registry` |
| `tools/screenshots/verify.mjs` | Internal | Consumes the manifest this phase writes; owned by `003-freshness-enforcement` |
| Node ESM and `node:` builtins | External | `fs`, `crypto`, `path`, `url`; no polyfills |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The harness is additive and isolated. Removing `tools/screenshots/`, the two `package.json` scripts, the `playwright-core` devDependency and the `screenshots/` tree returns the repository to its prior state; nothing under `src/` or in `styles.css` depends on any of it. A partial rollback that keeps the registry or the freshness check without the harness is not viable: both read files this phase produces.

<!-- /ANCHOR:rollback -->

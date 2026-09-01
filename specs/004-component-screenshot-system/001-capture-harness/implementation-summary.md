---
title: "Implementation Summary: Screenshot Capture Harness"
description: "What was delivered for the capture harness: system Chrome through playwright-core, a four-block page composition around the shipped stylesheet, host theme and runtime custom-property stand-ins, element screenshots at 2x, source fingerprinting, and full-run-only manifest and index writes."
trigger_phrases:
  - "capture harness implementation summary"
  - "screenshot harness what was built"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/001-capture-harness"
    last_updated_at: "2026-08-28T13:52:14.056Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded delivered harness scope and the gates left to the orchestrator"
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
# Implementation Summary: Screenshot Capture Harness

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 001-capture-harness |
| **Theme** | The renderer for captures: browser acquisition, page composition, runtime stand-ins, output artefacts |
| **Status** | Complete pending orchestrator gates |
| **Completion Pct** | 100% of implementation; 0 of 5 verification gates run in-session |
| **Requirements** | 12 defined (6 P0, 6 P1) |
| **Tasks** | 24 planned (19 completed, 5 deferred to the orchestrator or to a visual check) |
| **Target Deliverables** | `capture.mjs`, `theme.css`, `runtime-vars.css`, two npm scripts, one devDependency |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **A browser without a download.** `tools/screenshots/capture.mjs:13` imports `chromium` from `playwright-core`, added as a devDependency at `package.json:34`. Full `playwright` would have pulled roughly 150MB of browser binaries onto every clone of the fork for the sake of a documentation step. The trade is recorded in the file's own header at `capture.mjs:2-11`: a different Chrome build can shift antialiasing by a pixel, which is precisely why the freshness gate compares source fingerprints rather than image bytes.
2. **Chrome discovery with an override.** `findChrome` (`capture.mjs:33-43`) honours `SCREENSHOT_CHROME` when it points at a file that exists, then tries five candidate paths covering Chrome, Chromium and Edge on macOS and Chrome and Chromium on Linux, then throws a message naming both remedies.
3. **Four-block page composition.** `buildPage` (`capture.mjs:50-65`) puts the theme class on `<html>` and emits, in order: the host theme stand-in, the shipped `styles.css` read from the repository root, the runtime custom-property stand-in, and the scenario's optional `captureCss`. The scenario markup goes inside `#shot`.
4. **A host theme stand-in.** `tools/screenshots/theme.css` declares the Obsidian variables the plugin reads but never declares — backgrounds, text colours, interactive colours, radii, scrollbar and divider colours — with light values on `:root` and dark overrides under `.theme-dark`. Page chrome for the capture box is confined to `html`, `body` and `#shot`, so it cannot leak into what is being photographed.
5. **A form-control baseline.** The plugin styles the add-view popover's fields through the form's own descendant rules and declares nothing for the controls themselves: `grep -c "db-add-view-name\|db-add-view-key-field\|db-add-view-icon" styles.css` = 0. In Obsidian those controls inherit the host's styling; in a bare page they fall back to the browser default and photograph as white boxes on a dark surface. The baseline in `theme.css` covers text, search and number inputs, `select`, `textarea`, `input[type=checkbox]` and `button`.
6. **A runtime custom-property stand-in.** `tools/screenshots/runtime-vars.css` supplies the properties the plugin sets from JavaScript against measured layout and never declares in CSS — sticky-header offsets, header height, board and gallery geometry, card field widths, status and conditional-format colours, mobile bar heights, and the calendar and timeline measurements. It is loaded **after** the plugin stylesheet, because it has to win, and it targets `.note-database-container` as well as `:root`, because a custom property inherits from the nearest ancestor that sets it and the plugin declares several of these on that container. A `:root`-only override never reaches the element.
7. **The concrete reason this is not cosmetic.** `styles.css:47-52` documents that `--db-table-header-top` is set by JavaScript from a measured toolbar height. A screenshot has no running plugin, so the declared default stands, the sticky table header offsets itself by a toolbar that does not exist in the capture, and it lands on top of the first data row.
8. **Element screenshots at 2x.** Each capture opens a page at the scenario's declared width (default 900) by 600 with `deviceScaleFactor: 2`, queries `#shot`, and screenshots that element rather than the page (`capture.mjs:100-113`), so the image is cropped to the surface at whatever height it needs.
9. **Predictable output and source fingerprints.** Images land at `screenshots/<group>/<id>-<theme>.png` with the group directory created on demand. Each manifest entry records a 12-character SHA-256 prefix for every file the scenario depicts, with `styles.css` appended to that list at `capture.mjs:124`, so a stylesheet edit marks every capture rather than none.
10. **Full-run-only artefacts.** `screenshots/manifest.json` and the generated `screenshots/README.md` are written only when `!only && themeArg === "both"` (`capture.mjs:141`). A `--only` or single-theme run prints `partial run: manifest left unchanged`. Rewriting on every run would let an exploratory single-scenario capture leave behind a record implying full coverage.
11. **A generated index.** `screenshots/README.md` is built from the manifest entries rather than hand-written (`capture.mjs:149-179`), grouped and sorted, with each scenario's note and source list underneath its dark and light pair — so the index cannot fall behind the images it describes.
12. **Cleanup that survives a failure.** The browser close and the removal of `tools/screenshots/.tmp` happen in a `finally` block (`capture.mjs:134-137`), and a top-level catch exits 1 with the message (`capture.mjs:186-189`).

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: `playwright-core` devDependency, npm scripts, Chrome discovery with the environment override.
- **Phase 2**: Page composition and the host theme stand-in for both themes.
- **Phase 3**: Runtime custom-property stand-in, loaded last and scoped to the container as well as the root.
- **Phase 4**: Capture loop, source fingerprinting, full-run guard, generated index, temp cleanup.
- **Phase 5**: Bare form-control baseline, added after observing captured controls falling back to browser defaults.
- **Phase 6**: Verification — left to the orchestrator; no shell command was run in this session.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **System Chrome over a bundled browser.** Install weight is paid by every clone; reproducible antialiasing is worth less than that, especially once the gate is defined over fingerprints instead of pixels.
- **Surround the stylesheet, never edit it.** The subject of the capture is the shipped file read from disk. A copy would drift, and a modified copy would document something that does not ship.
- **The runtime stand-in loads last.** It is overriding the plugin's own CSS defaults, so cascade position is the whole mechanism. Placing it before `styles.css` would have made it a no-op for every property the plugin declares.
- **The runtime stand-in targets the container too.** Custom-property inheritance starts at the nearest declaring ancestor. Several of these are declared on `.note-database-container`, so a `:root`-only block never reaches the elements that read them.
- **`captureCss` may reveal, not restyle.** The constraint is written into the code at `capture.mjs:51-54`: a scenario override exists to give a surface height or flow it would have had against a live anchor, never to change how it looks.
- **Element screenshot, not page screenshot.** Cropping to `#shot` keeps the image tight to the surface and makes the viewport a layout constraint rather than an image boundary.
- **Partial runs stay quiet.** The manifest is the record of what exists; a run that captured a subset has no business rewriting it.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **The form-control baseline was not in the original design.** It was added after captured `input` and `select` elements photographed as browser defaults. Without it the add-view popover capture misrepresents the UI rather than documenting it, so the baseline is part of standing in for Obsidian rather than a cosmetic extra.
- **`runtime-vars.css` grew well past the sticky-header case that motivated it.** The header offset was the visible failure; auditing for the same class of problem produced 55 declarations covering board, gallery, mobile, calendar and timeline geometry. The calendar and timeline entries are declared but not yet exercised, because no scenario photographs those views — `004-coverage-expansion` owns that.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

The following gates verify delivery. **None of them were run in this session — no shell command was executed. The orchestrator runs all of them.**

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run

# 4. Capture end to end
npm run screenshots

# 5. Freshness gate
npm run screenshots:verify
```

### Verification Checklist
- [x] Chrome is resolved from `SCREENSHOT_CHROME` first, then 5/5 candidate paths, then a two-remedy error (`tools/screenshots/capture.mjs:33-43`).
- [x] The composed page emits 4/4 stylesheet blocks with the runtime stand-in after the plugin stylesheet (`tools/screenshots/capture.mjs:56-64`).
- [x] The shipped `styles.css` is read from the repository root rather than copied (`tools/screenshots/capture.mjs:85`).
- [x] Captures are element screenshots of `#shot` at `deviceScaleFactor: 2` (`tools/screenshots/capture.mjs:100-113`).
- [x] Every manifest entry records `styles.css` beside the scenario's sources — 16/16 entries in `screenshots/manifest.json` (`tools/screenshots/capture.mjs:124`).
- [x] The manifest and index writes are guarded on a full run (`tools/screenshots/capture.mjs:141, 180-182`).
- [x] The runtime stand-in declares 55 properties on `:root, .note-database-container`: `grep -c -- "--db-" tools/screenshots/runtime-vars.css` = 55.
- [x] The form-control baseline exists because the plugin declares none: `grep -c "db-add-view-name\|db-add-view-key-field\|db-add-view-icon" styles.css` = 0.
- [x] Cleanup runs in a `finally` block and the process exits 1 on failure (`tools/screenshots/capture.mjs:134-137, 186-189`).
- [ ] `npx tsc --noEmit` exit code 0 — orchestrator verifies.
- [ ] `npm run build` exit code 0 — orchestrator verifies.
- [ ] `npx vitest run` passes — orchestrator verifies.
- [ ] `npm run screenshots` writes 16 PNGs — orchestrator verifies.
- [ ] `npm run screenshots:verify` exits 0 — orchestrator verifies.
- [ ] Every refreshed PNG was looked at — needs a human; a capture can succeed and still photograph an empty box.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Install Weight** | No browser binary downloaded | `package.json` devDependency review | Verified by source inspection |
| **Network Isolation** | 0 network requests | Source inspection of `capture.mjs` | Verified by source inspection |
| **Vault Safety** | 0 writes to notes, `src/` or `styles.css` | Source inspection of all `writeFileSync` call sites | Verified by source inspection |
| **Cleanup** | No `.tmp` left after a failed run | Source inspection of the `finally` block | Verified by source inspection |
| **Capture Fidelity** | Surfaces show plugin styling, not browser defaults | Looking at the captured PNGs | **Not performed — needs a human** |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not run — orchestrator verifies** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The harness stands in for Obsidian, so a surface that looks wrong may be a gap in the stand-ins rather than a plugin defect.** `theme.css` and `runtime-vars.css` are hand-maintained approximations of what the host and the running plugin supply. Check which before filing a capture as a bug.
- **A system Chrome is required and its version is not pinned.** `SCREENSHOT_CHROME` overrides the path. Antialiasing varies between Chrome builds, so images captured on two machines will differ slightly even with identical inputs.
- **The theme stand-in tracks Obsidian's default light and dark themes only.** A user running a community theme sees different colours than the captures show.
- **The runtime stand-in has to be extended by hand.** Nothing detects that the plugin has started setting a new custom property from JavaScript; a new surface simply renders with fallback geometry until someone notices and adds the value.
- **`--db-table-header-top` is supplied as `22px` while the comment beside it describes the offset resolving to zero with no toolbar above.** The captured header clears the first data row either way, but the intended value is worth settling when the calendar and timeline stand-ins are added.
- **No unit suite covers the harness.** Its correctness is established by running it and by `npm run screenshots:verify`, not by assertions on its argument parsing.

<!-- /ANCHOR:limitations -->

---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets"
    last_updated_at: "2026-09-09T03:45:00Z"
    last_updated_by: "247-filter-sort-group-sheets-implementation"
    recent_action: "Landed the group popover's overflow and divider fixes; full verification chain green"
    next_safe_action: "Resume 002/003/004's paused landings"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/storybook/sheet-inventory.mjs"
      - "specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "247-filter-sort-group-sheets"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "The group popover's overflow and its missing first-section divider suppression are both handle/scrollbar and DOM-census mechanism bugs shared by the family, not group-only defects — see decision-record.md ADR-001"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 005-filter-sort-group-sheets |
| **Completed** | 2026-09-09 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The group popover was the last unconverged surface in this phase's own family: filter and sort
already matched Notion's row grammar, but the group sheet overflowed its own right edge by 4px on
WebKit and silently painted a divider above its own first section — both bugs traced to shared
mechanics rather than to anything group-specific, and both closed at that shared seam so the same
class of defect cannot resurface on filter or sort once either grows tall enough to trigger it.

### Phase 5: filter-sort-group-sheets

Two prior runs against this packet had already brought the filter and sort sheets' row grammar in
line with Notion's own (single-column rows, 44-52px pitch, 16px inset, the plugin's own pickers) and
left a documented, unfinished diagnosis for the group popover's own overflow. That diagnosis blamed
the same inline-floor-versus-`min-width:0` conflict already fixed for filter and sort's condition
rows — but the group popover builds no condition rows, so the fix could not have applied to it. Live
instrumentation (temporary, reverted before this summary) showed the real cause: the drag handle's
own `::before` band is sized against the popover's full declared width, but the popover's desktop-
style `::-webkit-scrollbar` (inherited from `.obnotion-container`) shrinks the flex row the handle
centres in by 8px the moment its content is tall enough to scroll — which only the group popover's
own fixture is, in this registry. Hiding that scrollbar on the family's three sheets (matching a
pattern the phone toolbar's own horizontal strip already uses) fixed it without touching the shared
handle code every other phone sheet also depends on.

Wiring an already-written but never-checked `dividerOk` variable into the row-grammar lane then
surfaced a second, previously invisible bug: the group popover's heading divider relies on
`:first-of-type`, which matches the first sibling of a **tag**, not of a class — and the popover's
own header (`buildShellHeader`) draws a `<div>` before any section title, so the panel's genuinely
first title was never the DOM's first `<div>` and the exception never fired. Every section painted
the divider meant to open only the sections after the first. Both the desktop and phone-scoped rules
were rewritten to divide by sibling position within the title's own class (`X ~ X`) instead of by
tag census, which reads correctly regardless of what chrome the shell draws ahead of it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `styles.css` | Modified | Filter/sort's row-grammar fixes from two prior runs; this session's scrollbar-hiding fix (group popover overflow) and sibling-combinator divider fix (group popover's first-section divider) |
| `tools/live/sheet-grammar.mjs` | Modified | Wired the row-grammar lane's own unused `dividerOk` check into a real failure (it caught the divider bug above); prior runs' harness/registry additions for the `group` surface |
| `tools/storybook/sheet-inventory.mjs` | Modified | Added a curated producer for the `group` registry row (`private renderGroupPopover`) |
| `tools/storybook/sheet-inventory.test.mjs` | Modified | Pinned registered-row count moved 17 -> 18 |
| `specs/.../001-sheet-story-coverage-audit/inventory.md` | Regenerated | Matches the registries it is derived from |
| `src/views/view-config-panel-renderer.test.ts` | Modified | Desktop `segmented` verdict updated to `true`, following `sheet-grammar.ts`'s widened switch-synonym predicate |
| `tools/lane/css-lane.json` | Modified | CSS lane taken over from its released holder (`072-linked-view-blocks-ux`) with a full acquire/edit/release triplet naming the 14 reviewed captures |
| `screenshots/*.png` (14 files), `screenshots/manifest.json` | Modified | Recaptured after the scrollbar-hiding fix; each mover is the desktop-style scrollbar thumb disappearing from a filter/sort/group sheet or its stacked child |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Diagnosed against the live measurement the row-grammar lane already runs (Playwright, Chrome and
WebKit) rather than the inherited hypothesis, since the inherited hypothesis named a helper the
group popover never calls. Confirmed the root cause by temporarily instrumenting the live measure
(reverted before commit), then fixed it at the shared CSS seam the family already owns rather than
patching the one surface the test happened to catch. Verified with a real red-before-fix: the
divider bug was caught by wiring an existing-but-unused variable into a failure, which reproduced
red on the actual bug before the CSS fix, then green after — a genuine negative control, not an
assumption. Ran the full verification chain (`tsc`, `vitest` x3 for flake-checking, `build`,
`sheet-grammar`, `sheet-rebuild` for the `85ff504` freeze regression, `render-assertions`,
`touch-targets`, `verify-placement`, two screenshot capture passes with pixel-hash-based mover
classification, the CSS lane takeover, `evidence --check-all`, `npm run gate` once foreground, and
the naming/comment scans) before any doc update or commit.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Hide the desktop-style scrollbar on filter/sort/group's three sheets, not just the group popover | The mechanism (a reserved scrollbar width shifting the drag handle's centring) is shared by all three; fixing only the surface the test happened to catch would leave the same latent bug for filter or sort to trip over once either grows tall enough to scroll. Full reasoning and rejected alternatives: `decision-record.md` ADR-001. |
| Divide the group popover's sections by sibling position (`X ~ X`), not `:first-of-type` | `:first-of-type` matches the first sibling of a tag, and the popover's own header `<div>` sits ahead of every section title — the exception never fired for either shape. The sibling combinator reads the group's own title list, independent of what chrome the shell draws ahead of it. |
| Update the desktop settings panel's `segmented` test expectation instead of narrowing the widened predicate | The predicate widening (accepting the shared `obnotion-toggle-switch` class) is required for the group popover's own switch rows to read as segmented, is correct, and the desktop panel is not a registered grammar surface — nothing live reads the changed verdict. |
| Take the CSS lane over with a full triplet rather than editing `styles.css` around it | Two prior runs had already edited `styles.css` without going through the lane; recording the takeover with the acquire/edit/release history makes that visible and auditable instead of leaving it silent, per `tools/lane/README.md`. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, 1727/1727, run 3x with no flake (the inherited "possibly flaky 5th failure" does not reproduce) |
| `npm run build` | PASS, exit 0 |
| `node tools/live/sheet-grammar.mjs` | PASS, exit 0 (group's overflow sweep and heading-divider clauses both went red before the respective fix, green after) |
| `node tools/live/sheet-rebuild.mjs` (the `85ff504` freeze regression) | PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 |
| `node tools/storybook/verify-placement.mjs` | PASS, exit 0, 413/415 (2 declared reds, matches its own baseline) |
| `npm run screenshots` x2 (+1 confirmation pass) | 616 entries each run, exit 0; 14 real movers reproduced identically across all passes; 2 encoder-jitter files (pixelHash-identical to HEAD) reverted |
| CSS lane takeover (`node tools/lane/check-lane.mjs`) | PASS, exit 0, release names all 14 changed captures |
| `node tools/live/evidence.mjs --check-all` | PASS, exit 0, 15/15 artefacts fresh after re-running the 11 stale ones |
| `npm run gate` (foreground, once) | PASS, 27/27 green |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | PASS, exit 0 |
| `npx eslint "tools/**/*.mjs"` (`lint:tools`) | PASS, exit 0 (fixed a pre-existing unused-variable error by wiring the check it belonged to) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`tools/live/engine-parity.json` carries a pre-existing, unrelated red.** `engine-parity.mjs` already recorded 50 Chrome/WebKit disagreements on HEAD before this session started (measured against `styles.css@42b9b9fafd8c`); none are in filter, sort or group. Re-running it to refresh its freshness stamp (required by `evidence --check-all`) surfaced a handful of additional, nondeterministic disagreements on `panel-base-import-modal`'s native checkboxes (a transitioning-opacity artifact that changes value between consecutive runs with no code change in between) — confirmed unrelated to this phase's scope and not part of the required 27-check gate.
2. **The operator's own device recheck row stays open.** Per the parent packet's D3 decision, only the operator's own device recheck may close a device-level completion row; this implementation closes every criterion `acceptance-criteria.md` names as agent-verifiable, and ticks nothing beyond that.
<!-- /ANCHOR:limitations -->

---

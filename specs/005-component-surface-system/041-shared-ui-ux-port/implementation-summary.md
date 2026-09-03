---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/041-shared-ui-ux-port"
    last_updated_at: "2026-09-03T12:40:00Z"
    last_updated_by: "leg-a-verified"
    recent_action: "Verified leg a: empty-state, aria-pressed, default view; 45/45 green"
    next_safe_action: "T004: styles.css token ladder red against variables.css, under the css-lane hold"
    blockers:
      - "Not committed to git: leg a sits as uncommitted working-tree state on this worktree"
      - "Not operator-confirmed"
      - "CSS leg outstanding: .db-empty-card-message has no margin rule, so the new p element's ~20px is unstyled and the hand-typed empty-state screenshot fixture does not reach the changed element"
      - "T004/T006/T007/T012-T014 (token reconciliation, primitive density, motion, cross-surface polish, gate) not started"
    key_files:
      - "src/views/empty-state-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/settings.ts"
      - "src/data/types.ts"
      - "src/i18n.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "041-shared-ui-ux-port-leg-a"
      parent_session_id: null
    completion_pct: 27
    open_questions: []
    answered_questions:
      - "The settings reconciliation adds a first-class PluginSettings.defaultViewType field now, rather than deferring to 037/038: no board/timeline display consumer exists in-tree yet, so the field ships with a normaliser and no dependent behaviour"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 041-shared-ui-ux-port |
| **Completed** | 2026-09-03 (leg a only; uncommitted) |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Leg a reconciles three pieces of the shared accessibility/settings vocabulary named in `spec.md`
and `tasks.md` T005, T008 and T009: the empty-state body element, the display-width toggle's
announced state, and a default-view setting. All three were verified red-first by a fresh
in-runtime reviewer, then green, without touching the local bottom sheet, table, calculation
layer, board seam, or the roving-tabindex controller.

### Empty-State Body Element

`EmptyStateRenderer` rendered its message in a `div`; the reference shape (`EmptyState.ts:10-37`)
uses a paragraph. `content.createDiv` became `content.createEl("p", ...)`, and the copy catalog's
`message` field was renamed to `body` to match the reference term. The caller-facing option
(`options.message`) and the i18n keys keep their historical names, since other surfaces read them
directly and renaming those was out of this leg's scope.

### Toggle State Language

The display-width toggle button styled its active state with an `is-active`/`is-inactive` class
but never announced it to assistive tech. `toolbar-renderer.ts:1557-1558` now sets
`aria-pressed` from the same `current === "wide"` condition already driving the class, leaving the
disclosure-trigger helper (`setPopoverTriggerState`, `:2111-2114`) on its separate
`aria-expanded`/`is-open` language, unchanged.

### Default View Setting

`settings.ts` gained `DEFAULT_VIEW_TYPES` (table, board, list, chart, calendar, timeline — gallery
excluded as legacy-only) and `normalizeDefaultViewType`, which falls back to `table` for any
unrecognised stored value. `SettingsTab.display()` renders a new dropdown row bound to
`PluginSettings.defaultViewType` (`types.ts:666-667`), localized through three new i18n keys
(`settings.defaultView.name`/`.desc`) in `en`, `zh-CN` and `zh-TW`. No creator path consumes the
field yet; it ships as data with no dependent behaviour, matching the open question `goal.md`
recorded for this leg.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/empty-state-renderer.ts` | Modified | `div` to `p` body element; copy catalog `message` to `body` |
| `src/views/toolbar-renderer.ts` | Modified | Display-width toggle announces state via `aria-pressed` |
| `src/settings.ts` | Modified | `DEFAULT_VIEW_TYPES`, `normalizeDefaultViewType`, default-view dropdown row |
| `src/data/types.ts` | Modified | `PluginSettings.defaultViewType?: DatabaseViewType` |
| `src/i18n.ts` | Modified | `settings.defaultView.name`/`.desc` in en, zh-CN, zh-TW |
| `src/views/empty-state-renderer.test.ts` | Modified | Pins the icon/title/body/action shape with a paragraph body |
| `src/views/toolbar-renderer.test.ts` | Created | Pins `aria-pressed` on the width toggle; keeps disclosure triggers off it |
| `src/settings.test.ts` | Created | Pins the default-view row, persistence, gallery exclusion, normaliser |
| `src/views/card-roving-tabindex.test.ts` | Modified | Pins 2D roving-tabindex coverage already present in the controller |
| `src/views/accessibility-defects.test.ts` | Modified | Regex re-anchored to the disclosure helper's signature |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

A fresh in-runtime reviewer ran each change red-first: the empty-state body assertion failed with
`expected 'div' to be 'p'` before the element change; the new toolbar-renderer test's source-string
assertion for `aria-pressed` failed to match (a contain failure) before that line was added; and
`settings.test.ts` failed with `expected undefined to be defined` against the not-yet-existing
default-view row before `DEFAULT_VIEW_TYPES`, `normalizeDefaultViewType` and the dropdown landed.
All four went green after: `empty-state-renderer.test.ts` (25), `toolbar-renderer.test.ts` (3),
`settings.test.ts` (4) and `card-roving-tabindex.test.ts` (13) total 45/45. Roving tabindex needed
no controller change — `card-roving-tabindex.ts` carries no diff — only new tests confirming the
2D board-column navigation the reference's active/focus language calls for was already reconciled.

`accessibility-defects.test.ts`'s disclosure-trigger regex was re-anchored to
`setPopoverTriggerState`'s parameter signature instead of matching anywhere in the file, so it no
longer trips on the toggle's own legitimate `aria-pressed`; the assertion is tighter, not weaker,
and the helper still never sets `aria-pressed`. One comment-scan hit surfaced in the new
`toolbar-renderer.test.ts` and was reworded before landing.

Independently re-run by this review: `npx tsc --noEmit` exits 0; `npx vitest run` reports 787
tests passing across 83 files; `npm run lint` reports 169 problems (156 errors, 13 warnings),
matched exactly against a disposable `git worktree add --detach HEAD` checkout, confirming no new
lint debt; `node tools/naming/scan-comments.mjs` reports 0 hits; `node
tools/naming/scan-failing-values.mjs` exits 0 (PASS, no newly ticked criterion without its failing
value). `git diff --stat` confirms `mobile-bottom-sheet.ts`, `table-renderer.ts`, `calc*.ts` and
`board-renderer.ts` carry no changes in this worktree.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Copy catalog field renamed `message` to `body`, i18n keys and the caller option kept their names | Matches the reference's internal term without forcing a rename other surfaces would have to follow |
| `aria-pressed` set from the same condition already driving the `is-active` class | One source of truth for the toggle's state; no separate boolean to drift out of sync |
| `accessibility-defects.test.ts` regex scoped to the helper's parameter signature rather than dropped or loosened further | The toggle button legitimately carries `aria-pressed` now; a whole-file scan would wrongly fail on it, so the check narrows to the disclosure helper it was written to police |
| `defaultViewType` ships with no consumer | No board/timeline creator path reads it yet; adding one was out of this leg's named scope (T008), and the field's own tests (normaliser, gallery exclusion) stand on their own |
| Roving tabindex left uncoded | `card-roving-tabindex.ts` already matched the reconciled active/focus language; the leg only needed tests proving it, not a rewrite |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Empty-state body red-first | Red: `expected 'div' to be 'p'`; green after `empty-state-renderer.ts:275-281` |
| Toggle `aria-pressed` red-first | Red: source-string contain failure on `toolbar-renderer.test.ts`'s new assertion; green after `toolbar-renderer.ts:1557-1558` |
| Default-view setting red-first | Red: `expected undefined to be defined` in `settings.test.ts`; green after `settings.ts`, `types.ts:666-667`, `i18n.ts` |
| Four changed/new test files (`npx vitest run`) | PASS — 45/45 (empty-state-renderer.test.ts 25, toolbar-renderer.test.ts 3, settings.test.ts 4, card-roving-tabindex.test.ts 13) |
| `accessibility-defects.test.ts` | PASS — 9/9, regex re-anchored, tightened not weakened |
| Full unit suite (`npx vitest run`) | PASS — 787 tests / 83 files |
| Typecheck (`npx tsc --noEmit`) | PASS — 0 errors |
| Lint (`npm run lint`) | 169 problems (156 errors, 13 warnings), identical to a disposable `HEAD` worktree checkout — no new debt |
| Comment scan (`node tools/naming/scan-comments.mjs`) | PASS — 0 hits |
| Failing-value ratchet (`node tools/naming/scan-failing-values.mjs`) | PASS — exit 0 |
| Keep-local scope (`git diff --stat`) | Confirmed empty for `mobile-bottom-sheet.ts`, `table-renderer.ts`, `calc*.ts`, `board-renderer.ts`, `card-roving-tabindex.ts` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **CSS leg outstanding for the empty-state body.** `.db-empty-card-message` has no margin rule,
   so the new `p` element renders roughly 20px different from the old `div` with nothing styling
   the difference intentionally; this leg only changed the element, not `styles.css`.
2. **Screenshot fixture does not reach the changed element.** The hand-typed empty-state capture
   fixture predates this leg and does not exercise the `p` element, so there is no visual capture
   proving the CSS gap above.
3. **Not committed, not operator-confirmed.** This leg is uncommitted working-tree state on
   `worktrees/006-shared-ui-ux-port`.
4. **Remaining plan steps not started.** Token/primitive ladder (T004), card icon/tooltip/chip
   density (T006), reduced-motion coverage (T007), cross-surface polish (T012), the `css-lane`
   release (T013), and `npm run gate` (T014) remain pending.
<!-- /ANCHOR:limitations -->

---

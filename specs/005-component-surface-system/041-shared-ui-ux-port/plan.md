---
title: "Implementation Plan: Shared UI/UX Port [template:level-2/plan.md]"
description: "Reconcile the local db-* token/primitive/motion/settings/accessibility layer against 036's verified obsidian-pm citations, gated by a red-before-green check per step."
trigger_phrases:
  - "implementation"
  - "plan"
  - "shared ui ux port"
  - "plan core"
importance_tier: "normal"
contextType: "general"
---
# Implementation Plan: Shared UI/UX Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, CSS (`styles.css` single-file lane), Obsidian plugin API |
| **Framework** | None: hand-built DOM renderers under `src/views/` |
| **Storage** | Obsidian vault frontmatter / plugin settings JSON; no new storage |
| **Testing** | `npm run gate` lanes under `tools/live/`, Storybook, placement/teardown/screenshot harnesses |

### Overview
This packet reconciles the token, primitive, motion, settings and accessibility layer named in
`036`'s research catalog §5 against the local host files it already cites. Every step below opens
with the check that fails on today's tree, per D3 (`005/goal.md`), before any file is edited.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`).
- [x] Success criteria measurable (`spec.md` §5).
- [x] Dependencies identified (`spec.md` §6; `037`-`040` share the seams this packet reconciles).

### Definition of Done
- [ ] All acceptance criteria met (`acceptance-criteria.md`).
- [ ] `npm run gate` passing, `$?` read directly.
- [ ] Docs updated (spec/plan/tasks/acceptance-criteria all reconciled to the shipped state).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Existing plugin architecture: flat, concern-focused renderer modules under `src/views/` emitting
`db-*` classes styled by the single `styles.css` lane, per `src/views/CODE.md:16-24`. This packet
adds no new architectural layer; it reconciles the vocabulary the existing layers already speak.

### Key Components
- **`styles.css` token lane** (`:55-85` and the reduced-motion block at `:706-713`): the single
  source of `--db-*` semantic roles every renderer reads.
- **`empty-state-renderer.ts`**: the diagnostic-aware empty-state composition every view calls.
- **`board-renderer.ts` card seam** (`:750-789`): where icon/tooltip/chip density lands first,
  because the catalog's `IconButton`/`Chip` citations map onto it directly.
- **`toolbar-renderer.ts`'s `setPopoverTriggerState`** (`:2111-2114`) and
  **`card-roving-tabindex.ts`** (`:68-99`): the two existing focus/keyboard primitives this packet
  aligns against the reconciled active-state language.
- **`settings.ts`'s `SettingsTab`**: where reconciled discoverability language lands.

### Data Flow
No new data flow. Tokens flow from `styles.css` custom properties into every renderer's class
names; settings flow from `SettingsTab` into `PluginSettings`/`ViewConfig` and back into the
renderers that read them. This packet changes vocabulary at each existing point, not the flow
itself.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

N/A: this is a UI-vocabulary reconciliation, not a bug fix. No security, path-handling, env
precedence, schema-boundary, persistence, public-response or shared-policy surface is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state. The gate order this packet must satisfy, per `036/research/research.md`'s
Final adoption plan row 5:

> token/primitive tests → focus/reduced-motion → phone sheet lifecycle → screenshots → `npm run gate`

The **first task in every phase below is a check that observes red on the current tree** before any
file is edited (D3, `005/goal.md`). Where D14's external lane order applies to implementation work:
an initial pass through cli-devin on `deepseek-v4-flash-max`, then `gpt-5.6-luna` via cli-codex or
cli-opencode, then in-runtime verification by a fresh agent running the browser gate and
`validate.sh` itself: no sandboxed or cloud-lane browser number is evidence.

1. **Token reconciliation.** Observe today's `--db-font-*`/`--db-radius-*`/`--db-border-*`/
   `--db-surface-*` values (`styles.css:55-85`) against `variables.css:1-9`'s verified roles; record
   any semantic gap as the red. Extend the ladder additively: never renumber an existing variable a
   frozen editor geometry depends on. Editing `styles.css` requires acquiring the lane hold in
   `tools/lane/css-lane.json` first and releasing it after a recapture is read.
2. **Empty-state composition.** Observe `empty-state-renderer.ts`'s current reason/action coverage
   against `EmptyState.ts:10-37`'s icon/title/body/action and CTA shape; add or reconcile only where
   a gap is real.
3. **Primitive density on cards.** Observe `board-renderer.ts:750-789`'s current icon/tooltip/chip
   rendering against `IconButton.ts:3-31`/`Chip.ts:3-40`'s tooltip-reveal/variant language; reconcile
   through existing local field renderers and i18n, not new DOM primitives.
4. **Motion and reduced motion.** Observe which `db-overlay-enter`/`db-mobile-sheet-scrim` surfaces
   the current `styles.css:706-713` block covers against the reconciled motion intent from
   `task-editor.css:1-20, :34-60`; extend coverage without adding a second sheet cap. The local
   bottom sheet's own height/handle/drag mechanics (`mobile-bottom-sheet.ts:81-87, :414-422,
   :423-426, :488`) are read for context only and are never edited by this step.
5. **Settings UX.** Observe `SettingsTab.display()`'s current default-view/editor/save and
   board/timeline display vocabulary against `settings.ts:54-86, :133-179`'s verified fields;
   extend `ViewConfig`/`PluginSettings` only where a local field is missing, localized through
   `src/i18n.ts`.
6. **Accessibility and focus language.** Observe the current `aria-expanded`/`is-open` toggle
   coverage (`toolbar-renderer.ts:2111-2114`) and the roving board keyboard primitive
   (`card-roving-tabindex.ts:68-99`) against the reconciled active/focus language verified at
   `chrome.css:124-170`.
7. **Cross-surface polish and screenshot recapture.** Apply the reconciled tokens/primitives to the
   surfaces `037-039` land, recapture affected screenshots, and read each recapture per
   `repo-rules/screenshot-currency.md`.

**Comment hygiene, every step.** No spec path, packet/phase number, or ADR/REQ/CHK/task id belongs
in a code comment landed by this plan: write the durable why (why a token exists, why a check is
shaped the way it is), never the ephemeral label. The pre-commit hook and gate lane `comments`
enforce this; MODULE banners and numbered sections stay required in every touched `src/`/`tools/`
file.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Empty-state copy-catalog exhaustiveness (`Record<EmptyStateReason, …>`), settings field wiring | Existing `*.test.ts` harness under `src/` |
| Integration | Token/primitive parity across board/timeline/calendar renderers; reduced-motion coverage | `tools/live/*.json` gate lanes, `npm run gate` |
| Manual | Settings panel discoverability, focus/keyboard traversal on toggle buttons and board cards, phone sheet lifecycle regression check | Browser (Obsidian dev vault), screenshots read per `repo-rules/screenshot-currency.md` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|--------------------|
| `styles.css` lane hold (`tools/lane/css-lane.json`) | Internal | Green (available at plan time) | Token reconciliation cannot land until acquired; other phases editing `styles.css` concurrently must serialize through it. |
| `036-obsidian-pm-ui-harvest`'s research catalog | Internal | Complete (20/20 iterations, 10/10 spot-check) | This plan's citations become unverifiable if the catalog's line numbers drift; re-check before implementing. |
| `037`/`038`/`039`'s own renderer edits | Internal | In progress / not yet landed | Cross-surface polish (step 7) needs those surfaces' current shape to apply reconciled tokens against; land token/primitive/motion/settings/accessibility (steps 1-6) first, defer step 7 to whichever lands last. |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A reconciled token or primitive change regresses a `tools/live/*.json` gate lane's
  recorded baseline, or a screenshot recapture shows a real visual regression on a surface outside
  this packet's scope.
- **Procedure**: Revert the specific token/primitive/settings/accessibility commit; `styles.css`
  changes revert cleanly because step 1 is additive-only. Re-run the affected gate lane and confirm
  it returns to its recorded baseline before re-attempting.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Token reconciliation (1) ──┬──► Primitive density (3) ──► Motion/reduced-motion (4) ──► Settings UX (5)
Empty-state composition (2)┘                                                              │
                                                                                            ▼
                                              Accessibility/focus (6) ──► Cross-surface polish (7)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Token reconciliation | None | Primitive density, Motion/reduced-motion |
| Empty-state composition | None | Primitive density |
| Primitive density | Token reconciliation, Empty-state composition | Motion/reduced-motion |
| Motion/reduced-motion | Token reconciliation, Primitive density | Settings UX |
| Settings UX | Motion/reduced-motion | Accessibility/focus |
| Accessibility/focus | Settings UX | Cross-surface polish |
| Cross-surface polish | Accessibility/focus | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|--------------------|
| Token/primitive reconciliation (1-3) | Medium | 300-450 LOC per the catalog's own estimate |
| Motion/settings/accessibility (4-6) | Medium | 250-350 LOC |
| Cross-surface polish and screenshots (7) | Low-Medium | 100-150 LOC plus recapture |
| **Total** | | **650-950 LOC** (`036/research/research.md`, Shared UX estimate) |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] `styles.css` lane released with a `reviewed` array naming every recaptured screenshot.
- [ ] No `mobile-bottom-sheet.ts` diff present.
- [ ] `npm run gate` exit 0, read directly.

### Rollback Procedure
1. Release the `styles.css` lane hold without landing if the token step fails its own check.
2. Revert the specific commit for the failing step; steps are ordered so an earlier step's revert
   does not require reverting a later one that already landed cleanly.
3. Re-run `npm run gate` and the affected `tools/live/*.json` lane; confirm baseline restored.
4. Notify only if a downstream phase (`037`-`040`) already consumed the reconciled token: check
   `git log` on `styles.css` for commits after this packet's landing before reverting past them.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

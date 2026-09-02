---
title: "Feature Specification: Shared UI/UX Port [template:level-2/spec.md]"
description: "Rewrite obsidian-pm's shared token, primitive, motion and settings language into this repository's db-* surfaces without replacing the local bottom sheet."
trigger_phrases:
  - "feature"
  - "specification"
  - "shared ui ux port"
  - "041"
  - "spec core"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Shared UI/UX Port

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-02 |
| **Branch** | `[to be created by sk-git at implementation time]` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 in the port catalog's adoption plan |
| **Predecessor** | 036-obsidian-pm-ui-harvest (research), 037-040 (surface ports it borrows the shared seams from) |
| **Successor** | None declared |
| **Handoff Criteria** | `npm run gate` green for this phase; screenshots recaptured and read; `037`-`040`'s own shared-seam usage unaffected |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The obsidian-pm reference names a shared visual and interaction language: semantic tokens, an
`EmptyState` composition, `IconButton`/`Chip` primitives, a 70vh popover with reduced-motion gating,
settings vocabulary, and a segmented-header active/focus language: that this repository has not
audited against. `036`'s research catalog cites each with `file:line` and a disposition, and the
local host files it names (`styles.css`, `src/views/empty-state-renderer.ts`,
`src/views/board-renderer.ts`, `src/settings.ts`, `src/views/toolbar-renderer.ts`,
`src/views/card-roving-tabindex.ts`, `src/views/mobile-bottom-sheet.ts`) already carry a real but
uncoordinated version of most of it.

### Purpose
Rewrite the verified reference shared-UI contract into the local `--db-*` token lane, local
primitive renderers, and local settings/motion/accessibility language: one packet, so the five
port packets (`037`-`041`) share one visual vocabulary instead of five independent guesses at it.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Semantic token reconciliation: audit `styles.css:55-85`'s `--db-font-*`, `--db-radius-*`,
  `--db-border-*` and `--db-surface-*` ladder against `specs/context/obsidian-pm-main/src/styles/variables.css:1-9`'s font/text/border/shadow roles; extend, do not replace.
- Empty-state composition: reconcile `src/views/empty-state-renderer.ts`'s `EmptyStateReason`/`EmptyStateAction` shape (`:25-57`) and its copy catalog (`:143-150`) against `EmptyState.ts:10-37`'s icon/title/body/action and CTA shape.
- Primitive density: align `IconButton.ts:3-31` and `Chip.ts:3-40`'s tooltip/reveal/variant language with the local card icon/tooltip wiring and conditional-format chip seam in `src/views/board-renderer.ts:750-789, :782-789`.
- Motion and reduced motion: reconcile the 70vh-cap/reduced-motion gate in `task-editor.css:1-20, :34-60` against the local `@media (prefers-reduced-motion: reduce)` block at `styles.css:706-713`, without introducing a second sheet cap (see Out of Scope).
- Settings UX: reconcile `settings.ts:54-86, :133-179`'s default-view/editor/save and Gantt/board display vocabulary against `src/settings.ts`'s `SettingsTab` (`:76-` `display()`) and the board/timeline fields already declared on `ViewConfig` (`src/data/types.ts:373-`).
- Accessibility and focus language: align the segmented-header active state (`chrome.css:124-170`) with the local `aria-expanded`/`is-open` toggle helper (`src/views/toolbar-renderer.ts:2111-2114`) and the board's roving-tabindex keyboard primitive (`src/views/card-roving-tabindex.ts:68-99`).
- Cross-surface polish: apply the reconciled tokens/primitives consistently across the timeline, board and calendar renderers this port catalog names, without opening a second token source.

### Out of Scope
- **Bottom sheets.** `src/views/mobile-bottom-sheet.ts:81-87` (`createSheetHandle`), `:423-426`
  (`attachSheetDragToDismiss` binding the handle to the panel), `:414-422` (`shouldFlickDismiss`) and
  `:488` (its pointerup application) stay exactly as they are. The reference's `task-editor.css:34-45`
  70vh sheet has no drag handle; the catalog's do-not-borrow list item 2 and the operator's own
  direction both say local wins here: reason to *inform* the reduced-motion gate above, never reason
  to replace the panel lifecycle, the scrim, the safe-area inset, or the measured drag/flick dismissal.
- **Table view, formulas, rollups, summaries, calculations.** Catalog do-not-borrow items 1 and 3.
  Not touched by this packet.
- **Timeline, board, calendar and subtask surface logic.** Owned by `037`-`040`; this packet supplies
  the shared token/primitive/motion/settings/accessibility layer those packets consume, not their
  view-specific behavior.
- **New settings persistence format.** `settings.ts:133-179`'s Gantt/board toggles inform local
  `ViewConfig` field naming only; no reference persistence shape is cloned.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `styles.css` | Modify | Reconcile `--db-*` token roles and the reduced-motion block against verified reference semantics; lane-held per `tools/lane/css-lane.json`. |
| `src/views/empty-state-renderer.ts` | Modify | Align composition/copy catalog with the verified `EmptyState` icon/title/body/action shape. |
| `src/views/board-renderer.ts` | Modify | Align card icon/tooltip/chip density with `IconButton`/`Chip` variants; no new drag/drop contract. |
| `src/settings.ts` | Modify | Reconcile settings vocabulary/discoverability against the verified reference settings section. |
| `src/data/types.ts` | Modify | Extend `ViewConfig` board/timeline display fields only where the reconciled settings need a local field; no new persistence format. |
| `src/views/toolbar-renderer.ts` | Modify | Align segmented/active-state and `aria-expanded` language across toggle buttons. |
| `src/views/card-roving-tabindex.ts` | Modify | Confirm roving keyboard primitive matches the reconciled focus language; extend only if a gap is found. |
| `src/i18n.ts` | Modify | Add or adjust localized labels the reconciled copy catalog needs. |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The local bottom sheet (`mobile-bottom-sheet.ts:81-87, :414-422, :423-426, :488`) is unmodified by this packet; a diff touching it fails review. |
| REQ-002 | Every reconciled token in `styles.css` traces to a verified reference `file:line` or a documented local-only extension; no invented reference citation. |
| REQ-003 | `npm run gate` exits 0 for this phase, read from `$?`, not a pipe. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | `EmptyStateReason`/`EmptyStateAction` composition in `empty-state-renderer.ts` covers the icon/title/body/action shape verified at `EmptyState.ts:10-37`, using local diagnostics-aware reasons rather than the reference's generic ones. |
| REQ-005 | Card icon/tooltip/chip rendering in `board-renderer.ts` uses a reconciled density consistent with `IconButton.ts:3-31`/`Chip.ts:3-40`, applied through local field renderers and i18n, not copied DOM. |
| REQ-006 | The reduced-motion media rule at `styles.css:706-713` covers every `db-overlay-enter`/`db-mobile-sheet-scrim` surface the reconciled motion intent from `task-editor.css:1-20, :34-60` implies, without adding a second sheet height cap. |
| REQ-007 | `SettingsTab.display()` in `src/settings.ts` exposes the reconciled default-view/editor/save and board/timeline display vocabulary verified at `settings.ts:54-86, :133-179`, localized through `src/i18n.ts`. |
| REQ-008 | Toggle buttons using `setPopoverTriggerState` (`toolbar-renderer.ts:2111-2114`) and the roving board keyboard (`card-roving-tabindex.ts:68-99`) match the reconciled focus/active-state language verified at `chrome.css:124-170`. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A single token/primitive/motion/settings/accessibility vocabulary is shared across the
  timeline, board and calendar renderers `037`-`039` land, with no packet inventing its own.
- **SC-002**: The local bottom sheet's handle, drag/flick dismissal, scrim, safe-area and portal
  lifecycle are provably unchanged (diff empty on `mobile-bottom-sheet.ts`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `037-040` land their own surface logic first or concurrently | Token/primitive changes here could shift their captures | Land this packet's token reconciliation early, screenshot before/after, and coordinate through `styles.css`'s lane hold. |
| Risk | Reconciling `--db-*` tokens touches every surface's visuals | High: a bad token edit propagates everywhere `styles.css` is loaded | Reconcile additively (extend the ladder), never renumber or remove an existing `--db-*` variable a frozen editor geometry depends on (see `styles.css:63-67`'s own recorded lesson). |
| Risk | Settings vocabulary change could orphan an existing setting key | Medium: a renamed key silently drops a saved preference | Extend `ViewConfig`/settings fields; do not rename an existing persisted key without a migration, which is out of scope here. |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: No token/primitive reconciliation may regress a `tools/live/*.json` gate lane's recorded baseline (read the lane's own history before landing).
- **NFR-P02**: Reduced-motion reconciliation must not add a synchronous style recalculation to the overlay entrance path.

### Security
- **NFR-S01**: N/A: no auth surface touched.
- **NFR-S02**: N/A: no data protection surface touched.

### Reliability
- **NFR-R01**: `npm run gate` stays green for every phase this packet's token change is loaded into.
- **NFR-R02**: Screenshot capture churn stays within `repo-rules/screenshot-currency.md`'s expectations; a capture that moves for a reconciled token is read, not waved through.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: an `EmptyStateReason` with no matching copy-catalog entry must fail loudly at
  compile time (the `Record<EmptyStateReason, …>` type already enforces this); do not add a runtime
  fallback that hides a missing reason.
- Maximum length: a settings label localized through `src/i18n.ts` must not overflow the settings
  panel's fixed-width controls at the shortest supported viewport.
- Invalid format: N/A: this packet does not parse user input.

### Error Scenarios
- External service failure: N/A: no network dependency.
- Network timeout: N/A.
- Concurrent access: N/A: token/settings reconciliation is a build-time and render-time change,
  not a data-write path.

### State Transitions
- Partial completion: if the token reconciliation lands before the settings reconciliation, the
  intermediate state must still pass `npm run gate`: no phase-internal ordering may leave the tree
  red.
- Session expiry: N/A.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | 8 files, 650-950 LOC per the research catalog's own estimate (`036/research/research.md`, Shared UX estimate). |
| Risk | 10/25 | No auth/API/breaking-contract change; the real risk is a shared token touching every surface's visuals. |
| Research | 20/20 | Fully covered by `036`'s 20-iteration, 10/10 spot-checked catalog; no open reference-evidence gap. |
| **Total** | **48/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Whether the settings reconciliation (REQ-007) should add a first-class `PluginSettings` field for
  Gantt/board display defaults now, or defer that to `037`/`038` where the concrete display options
  live. Recorded for the implementer; not blocking this spec.
- Whether reduced-motion coverage (REQ-006) should extend to `037`/`038`/`039`'s own overlay
  entrances or stay scoped to the existing `db-overlay-enter`/`db-mobile-sheet-scrim` selectors this
  spec names. The plan orders token/motion work before the surface ports land, so this is answered
  by whichever packet lands first touching a new overlay class.
<!-- /ANCHOR:questions -->

---

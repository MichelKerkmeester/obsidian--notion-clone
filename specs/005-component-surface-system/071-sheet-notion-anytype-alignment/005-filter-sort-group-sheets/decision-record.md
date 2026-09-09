---
title: "Decision Record: Filter, Sort and Group Sheets Redesign"
description: "ADR-001 on why the group popover's overflow was fixed at the shared handle/scrollbar seam rather than with a group-only special case."
trigger_phrases:
  - "071 phase 5 adr"
  - "filter sort group sheets decision"
  - "group popover overflow fix"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets"
    last_updated_at: "2026-09-09T03:30:00Z"
    last_updated_by: "247-filter-sort-group-sheets-implementation"
    recent_action: "Closed the group popover's 370-vs-366px overflow at its root cause"
    next_safe_action: "Resume 002/003/004's paused landings"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/storybook/sheet-inventory.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "247-filter-sort-group-sheets"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "The group popover's overflow is a shared scrollbar/handle-centring bug, not a group-only defect — ADR-001"
---
# Decision Record: Filter, Sort and Group Sheets Redesign

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Fix the group popover's overflow at the handle/scrollbar seam, not with a group-only rule

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-09 |
| **Deciders** | Implementation, against `tools/live/sheet-grammar.mjs`'s live overflow sweep |

---

<!-- ANCHOR:adr-001-context -->
### Context

The lane's overflow sweep reported the group popover scrolling horizontally on WebKit —
`scrollWidth` 370 against `clientWidth` 366, present in both the as-built and long-name passes and
absent from Chrome, where content never scrolls. Filter and sort passed already. A prior diagnosis
pass (recorded in this worktree's own scratch notes) attributed all three surfaces to the same
inline-floor-versus-`min-width:0` conflict that had already been fixed for filter and sort's
condition rows, but the group popover builds no condition rows at all — `createConditionRow` and its
140/120px floors are called only from `filter-panel-renderer.ts` and `sort-panel-renderer.ts`. That
diagnosis did not fit the surface it was blamed on.

Instrumenting the live measurement (temporarily, reverted before this record) showed the popover
carrying `obnotion-sheet-floating` with its drag handle's `::before` band sized to
`calc(100vw - 2 * var(--obnotion-sheet-float-inset))` — 374px, matching the sheet's own declared
width exactly. The handle itself, though, centres via flex auto-margins inside a box whose usable
width shrinks by the popover's own 8px `::-webkit-scrollbar` (`.obnotion-container`'s desktop-style
scrollbar rule, inherited because every phone sheet in this family carries the `obnotion-container`
class) the moment its content is tall enough to need one. Filter and sort's fixtures never scroll, so
neither ever paid for it; the group popover's fixture — several sections of switch and picker rows —
does. The handle re-centres 4px left of where the 374px band assumes it sits, and the band's
already-374px-wide half spills 4px past the popover's own visible right edge.

### Constraints

- Fix within this phase's own file scope (`styles.css`, the row-grammar producers) — no edit to
  `mobile-bottom-sheet.ts`'s shared handle/classification code, which the extensive comments already
  on that file show was tuned against several other surfaces this phase does not own.
- No regression to the freeze fix in `85ff504` (`tools/live/sheet-rebuild.mjs`).
- No visible change to a sheet outside this phase's family (filter, sort, group).
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: hide the desktop-style `::-webkit-scrollbar` on the three sheets this phase owns
(`.obnotion-filter-panel.obnotion-mobile-bottom-sheet`, `.obnotion-sort-panel.obnotion-mobile-bottom-sheet`,
`.obnotion-group-popover.obnotion-mobile-bottom-sheet`) with `scrollbar-width: none` plus
`::-webkit-scrollbar { display: none; }`, matching the pattern the phone toolbar's own horizontal
strip (`.obnotion-toolbar-right`) already uses.

**How it works**: with no scrollbar reserved, the flex row the drag handle centres in keeps its full
width whether or not the sheet's body needs to scroll, so the handle sits at the same point the
handle-band's `100vw`/`calc()` math already assumes — and a phone scrolls this body by touch, never
by dragging a visible thumb, so nothing here needs the desktop rule's visible track.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Hide the scrollbar on this family's three sheets** | Fixes the actual cause; matches an existing phone-scrollbar precedent; zero visual cost on a touch surface | Leaves the same latent bug on sheet families outside this phase's scope | 9/10 |
| Narrow the drag band's width for the group popover only | Looks scoped to the failing test | Treats the symptom on one surface while leaving the identical mechanism live on filter/sort the moment either grows tall enough to scroll; does not match the operator's "all sheets" direction | 3/10 |
| `scrollbar-gutter: stable both-edges` on the popover | Standard tool for scrollbar-induced layout shift | Verified by hand-computation to make the overflow *worse* here (8px instead of 4): it symmetrizes the handle's centring but the drag band still measures itself against the un-guttered 374px box, so the border-box edge the band now aligns to sits outside the client area by the full gutter, not half of it | 2/10 |
| Hide the scrollbar on every `.obnotion-mobile-bottom-sheet`, not just this family | Closes the same latent bug everywhere at once | Touches sheets already signed off in sibling phases (002/003/004) without their own recapture and sign-off in this phase's own scope | 4/10 |

**Why this one**: it is the smallest change that fixes the mechanism rather than the one surface that
happened to expose it, stays inside this phase's own family (filter, sort, group — the operator's
"all sheets" direction for *this* redesign, not license to touch sheets other phases own), and
reuses a pattern this codebase already ships rather than inventing a new one.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The group popover's overflow sweep rows go green on both engines, in both the as-built and
  long-name passes, with no change to `mobile-bottom-sheet.ts`'s shared handle logic.
- Filter and sort carry the same defensive fix, so growing either sheet's row count in a later phase
  cannot reintroduce this exact failure mode.
- The visible scrollbar this family showed on a phone — inconsistent with every other phone sheet's
  touch-scroll presentation, and with Notion/Anytype's own mobile chrome — is gone.

**What it costs**:
- A user who resizes their WebView on desktop-with-touch and drags this popover's own scroll thumb
  loses that affordance; the sheet remains scrollable by wheel, trackpad and touch. Mitigation: no
  report or capture in this program's history exercises that path, and every sibling phone sheet
  already hides the desktop-style thumb the same way once ported (`.obnotion-toolbar-right`).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The same handle/scrollbar interaction resurfaces on a sheet outside this phase (002/003/004, or a future family) once that sheet's content grows tall enough to scroll | M | Recorded here by name so a later phase's own diagnosis starts from this ADR instead of re-deriving it; the fix pattern (hide the family's own scrollbar) is a one-line addition per family when it does |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | `tools/live/sheet-grammar.mjs`'s overflow sweep is a hard gate; the group popover row failed it on both WebKit passes before this fix |
| 2 | **Beyond Local Maxima?** | PASS | The group-only special case and the `scrollbar-gutter` alternative were hand-computed and rejected before this one was chosen |
| 3 | **Sufficient?** | PASS | Both overflow sweep failures cleared with no change to any other registered surface's numbers |
| 4 | **Fits Goal?** | PASS | Matches SC-002 (no regression to a prior shipped fix) and the operator's "all sheets should mimic Notion way closer" direction for this family |
| 5 | **Open Horizons?** | PASS | The same latent mechanism on sheets outside this phase is named as a risk rather than silently left for a future report to rediscover |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `styles.css`: `scrollbar-width: none` plus a matching `::-webkit-scrollbar { display: none; }` on
  `.obnotion-filter-panel.obnotion-mobile-bottom-sheet`, `.obnotion-sort-panel.obnotion-mobile-bottom-sheet`
  and `.obnotion-group-popover.obnotion-mobile-bottom-sheet`.
- `tools/storybook/sheet-inventory.mjs`: a curated producer entry for the `group` registry row
  (`private renderGroupPopover` in `toolbar-renderer.ts`), so the inventory can resolve it instead of
  reporting it unresolved.
- `tools/storybook/sheet-inventory.test.mjs`: the pinned registered-row count moved from 17 to 18 to
  match the `group` row this phase's own gap table already named.
- `src/views/view-config-panel-renderer.test.ts`: the desktop settings panel's `segmented` grammar
  verdict updated from `false` to `true`, following `sheet-grammar.ts`'s widened
  `hasSegmentedToggleRows` predicate (accepting `obnotion-toggle-switch` alongside
  `obnotion-checkbox` as a conforming choice control, needed for the group popover's own switch rows
  to read as segmented) — a side effect on an unregistered desktop verdict, not a live regression.

**How to roll back**: revert the `styles.css` scrollbar-hiding rule; the group popover's overflow
sweep rows will fail again on WebKit, reproducing the state this ADR fixes.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

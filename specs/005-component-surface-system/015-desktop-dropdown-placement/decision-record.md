---
title: "Decision Record: Desktop Dropdown Placement"
description: "ADR-001 records the operator's ruling that the shipped 552px PANEL_POPOVER width needs a named `condition panel` role, not a widened `panel` role, in design-system.md §5."
trigger_phrases:
  - "015 decision record"
  - "condition panel role"
  - "panel width role decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/015-desktop-dropdown-placement"
    last_updated_at: "2026-09-05T11:40:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Carried the condition panel role through §3/§4, closing the doc gap row 50 flagged"
    next_safe_action: "None — the ADR and all three amended sections agree"
    blockers: []
    key_files:
      - "specs/005-component-surface-system/design-system.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "src/views/popover-position.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "panel-width-role-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Desktop Dropdown Placement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: A `condition panel` role, not a widened `panel` role, for Filter, Sort and Column Manager

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

**Acceptance evidence**: `design-system.md` §5 documents the `condition panel` role (440-560px) and its
row-floor rule; §3's role vocabulary table and §4's decision table both cite `condition panel` for
Filter, Sort and Column Manager at the same range, with every other `panel`-role row unchanged at
292-360px. `roadmap.md` §6A carries the ruling as a dated decision row citing §4 rows 47 and 50.
`PANEL_POPOVER` in `src/views/popover-position.ts:90-94` — already `{ minWidth: 292, preferredWidth:
552, maxWidth: 552 }` since `f5a69e9f` — needed no code change to fit inside the new range.

---

<!-- ANCHOR:adr-001-context -->
### Context

`roadmap.md` §4 row 50 fixed the filter and sort popovers so a condition row's property, operator and
value controls never truncate: `PANEL_POPOVER` widened from 360px to a derived 552px, and the row
gained a 140px floor on property and operator plus a 120px floor on value. That row's own text names
the consequence: *"The declared `panel` role width in `design-system.md` §5 is 292-360px and this
exceeds it — the operator's [...] instruction outranks the doc, so the code follows the instruction
and the doc is now a defect for the operator to rule on."* The code shipped correct; the design system
stopped describing it.

### Constraints

- `design-system.md` §5's own stated policy (item 2, "The policy") already says a call site that
  needs more room declares a wider role rather than typing a bespoke number — the fix under review had
  to be judged against that existing rule, not decided from nothing.
- The `panel` role's 292-360px range is shared by every other panel-shaped surface (view config,
  future additions); any fix that touches the shared range risks giving all of them headroom none of
  them asked for.
- The three callers of `PANEL_POPOVER` — `filter-panel-renderer.ts:228`, `sort-panel-renderer.ts:142`,
  `column-manager-renderer.ts:153` — share one preset by design (`roadmap.md` §4 row 50: "kept
  deliberately, since splitting the preset would restore the per-panel width drift it exists to end"),
  so any new role has to cover exactly those three, not fewer or more.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: a new named role, `condition panel`, at 440-560px, scoped to the three `PANEL_POPOVER`
callers (Filter, Sort, Column Manager); the existing `panel` role is untouched at 292-360px for
everything else.

**How it works**: `design-system.md` §5 gains a subsection defining the role, its width range, and the
row-floor rule (property and operator each 140px, value 120px), citing `roadmap.md` §4 rows 47 and 50
as the measurement source. No code changes — `PANEL_POPOVER`'s shipped 552px already sits inside the
new range.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A named `condition panel` role, 440-560px (chosen)** | Matches §5's own existing policy ("declare a wider role, not a bespoke number"); scoped to the three callers that actually need it; keeps `panel`'s narrow range meaningful for every other surface | Two ranges to track instead of one across §3, §4 and §5 | 8/10 |
| Widen the existing `panel` role's own range (e.g. 292-560px) | One range, smaller diff | Gives every `panel`-role surface — view config, any future one — headroom none of them asked for, and erases the reason a condition row is wider: it carries different content, not a looser rule | 4/10 |
| Leave the doc as-is; treat 552px as an undocumented exception | No doc change | Leaves the design system's own stated policy (item 2) unfollowed by its own designers, and row 50's flagged defect stays open indefinitely | 1/10 |

**Why this one**: the shape of the fix was already decided by §5 item 2 before this ADR — a call site
needing more room gets a named role, not a bespoke number or a silently widened shared one. The only
open question was scope (all `panel` surfaces vs. the three that measured wide), and the measurement
in row 50 answers that: only the three condition-shaped panels needed it.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- `design-system.md` §3, §4 and §5 all describe the shipped 552px width instead of contradicting it; a
  future reader sizing a fourth condition-shaped panel has a named role and a row-floor rule to reuse
  instead of picking a tenth bespoke number, wherever in the doc they land first.
- The measurement chain (row 47/50 → §3/§4/§5 → §6A → this ADR) is traceable in one direction without a
  reviewer having to reconcile a doc against a diff by hand.

**What it costs**:
- Two width ranges to track under the `panel` family instead of one. Mitigation: each range is named to
  a role (`panel` vs. `condition panel`), not left as an unlabelled number, so the split is explicit
  rather than implicit.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future panel needs Filter/Sort/Column-Manager-shaped rows but is not one of the three named callers | L | §5 states the role applies to exactly the three `PANEL_POPOVER` callers; a fourth caller adopts `condition panel` by using the same preset, not by inventing a fourth range |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Row 50 already shipped a measured value the doc did not permit; the doc's own accuracy, not the code, was the open question |
| 2 | **Beyond Local Maxima?** | PASS | Two alternatives considered and rejected — widening `panel` itself erodes the role vocabulary's meaning; leaving it undocumented leaves §5's own policy unfollowed |
| 3 | **Sufficient?** | PASS | The 440-560px range contains the shipped 552px value without inventing headroom no measurement called for |
| 4 | **Fits Goal?** | PASS | Matches `design-system.md` §5 item 2's own declared policy and closes the exact defect `roadmap.md` §4 row 50 named |
| 5 | **Open Horizons?** | PASS | The row-floor rule (140/140/120) generalises to any future condition-shaped panel without a new bespoke number |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `specs/005-component-surface-system/design-system.md` — §5 gains the `condition panel` role
  subsection; §3's role vocabulary table and §4's decision table are amended so Filter, Sort and
  Column Manager cite `condition panel` at 440-560px, and every other row stays at `panel`'s
  292-360px.
- `specs/005-component-surface-system/roadmap.md` — §6A gains a dated decision row citing §4 rows 47
  and 50; the section's own decision count and table count are updated to match.
- No source code change — `src/views/popover-position.ts`'s `PANEL_POPOVER` (552px, shipped in
  `f5a69e9f`) already conforms to the range this ADR sets.

**How to roll back**: revert the §3/§4/§5 amendments in `design-system.md`, revert the §6A decision row
(and its intro count) in `roadmap.md`, and delete this file.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

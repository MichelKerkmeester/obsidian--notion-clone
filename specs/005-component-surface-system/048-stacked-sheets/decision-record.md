---
title: "Decision Record: Stacked Sheets"
description: "ADR-001 D1 — an Obsidian modal opened from inside a sheet on the phone becomes a stacked bottom sheet; none stay modals."
trigger_phrases:
  - "048 decision record"
  - "stacked sheets adr"
  - "modal becomes sheet decision"
  - "D1 stacked sheets"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Recorded D1 as Accepted from the operator's decision, 2026-09-05"
    next_safe_action: "Implement ADR-001 on codex worktree 062"
    blockers: []
    key_files:
      - "src/views/db-modal.ts"
      - "048-stacked-sheets/stacked-surface-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Stacked Sheets

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001 (D1): An Obsidian modal opened from a sheet on the phone becomes a stacked bottom sheet

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

`roadmap.md` row 44 traces the chain: the Properties sheet's `+ Add column` calls
`actions.addColumn()`, which opens `new CreatePropertyModal` — an Obsidian `Modal`, not a sheet —
stacked over two peeking parent sheets, with no dim and no push-back. `DbModal` already declares a
presentation per subclass (`db-modal.ts:56`), so the mechanism to present as a sheet exists; nothing
had decided that every phone-reached modal should use it. `048` D1 opened the question: does an
Obsidian `Modal` launched from inside a sheet present as a sheet on the phone, or does the phone flow
use a sheet instead of the modal outright?

### Constraints

- Replacing each modal subclass with a bespoke phone sheet forks roughly twenty subclasses into a
  phone branch and a desktop branch — the alternative this ADR rejects.
- The decision gates six of `048`'s inventory rows and part of AC-004; the dropdown, menu and picker
  rows — the majority, and both of the operator's dropdown screenshots — do not wait on it.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: every Obsidian modal opened from a sheet on the phone — Create property, confirms,
date pickers, suggest modals — becomes a stacked bottom sheet. None stay modals.

Operator, 2026-09-05: *"Obsidian modals opened from a sheet on the phone (Create property, confirms,
date pickers, suggest modals) become stacked bottom sheets; none stay modals."*

**How it works**: `DbModal`'s existing per-subclass presentation declaration (`db-modal.ts:56`) is
set to the sheet presentation for the phone case across all six gated inventory rows, so the
mechanism already in the codebase is switched on rather than a new one built.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Every phone-reached modal presents as a stacked sheet** | Reuses `DbModal`'s existing per-subclass mechanism; one grammar for every stacked surface, matching `048`'s stacking model in `spec.md` §3 | Roughly twenty subclasses need their presentation flag reviewed | 8/10 |
| B. Leave Obsidian modals as modals; fix only the dim and push-back around them | Smaller change | Ships a modal-over-sheet visual mismatch as permanent, and the "header everywhere" rule `044` already generalised would apply to a surface this option deliberately excludes | 3/10 |
| C. Fork each modal subclass into a phone-specific sheet and a desktop-specific modal | Maximum control per surface | Forks ~20 subclasses into two branches each — the exact cost this ADR is written to avoid | 2/10 |

**Why this one**: the operator chose Option A directly, and it is also the recommendation that was
on record before the decision — `DbModal` already has the presentation seam, so turning it on is the
smallest change that closes all six gated rows at once.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- Row 44's no-dim, no-push-back defect closes by construction: a stacked sheet carries the same
  scrim and depth model every other stacked child in `048`'s spec does.
- Six inventory rows in `stacked-surface-inventory.md` resolve to one answer instead of six separate
  judgement calls.

**What it costs**:
- Roughly twenty `DbModal` subclasses need their presentation reviewed against the phone case, even
  though only some are reachable from inside a sheet today. Mitigation: `048`'s own inventory (T001)
  already names which subclasses are reachable from a sheet, narrowing the review to that set.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A modal subclass assumes desktop-only layout and breaks when forced into the sheet presentation | M | Review each of the six gated rows individually against `048`'s AC-002 through AC-007 rather than a blanket flip |
| The implementation leg (codex, `worktrees/062`) diverges from this record before landing | L | This record is the contract the leg implements against; reconcile before merge |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Row 44 is a live, operator-reported defect with no dim and no push-back |
| 2 | **Beyond Local Maxima?** | PASS | Three options considered, including doing nothing beyond a cosmetic dim fix |
| 3 | **Sufficient?** | PASS | Turns on an existing mechanism (`db-modal.ts:56`) rather than building a new one |
| 4 | **Fits Goal?** | PASS | Directly satisfies `048/spec.md` §3's stacking contract and AC-004 |
| 5 | **Open Horizons?** | PASS | Leaves the twenty-subclass review as a scoped follow-on rather than a blocking rewrite |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/db-modal.ts` — presentation declared per subclass, set to the sheet presentation for
  every subclass reachable from inside a sheet on the phone.
- `048-stacked-sheets/stacked-surface-inventory.md` — the six gated rows resolved against this
  decision.

**Implementation leg**: runs on **codex, in `worktrees/062`** — a separate lane from this decision
record.

**How to roll back**: revert the presentation-flag commit per subclass; `DbModal`'s per-subclass
declaration means a single subclass can be reverted independently of the others.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

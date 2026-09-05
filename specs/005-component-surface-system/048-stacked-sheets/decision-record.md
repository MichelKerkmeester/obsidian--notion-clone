---
title: "Decision Record: Stacked Sheets"
description: "ADR-001 D1 — an Obsidian modal opened from inside a sheet on the phone becomes a stacked bottom sheet; none stay modals. ADR-002 every surface below the top is pushed back. ADR-003 a sheet beneath another is never re-placed."
trigger_phrases:
  - "048 decision record"
  - "stacked sheets adr"
  - "modal becomes sheet decision"
  - "D1 stacked sheets"
  - "stack parent marking decision"
  - "sheet re-placement decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T09:40:00Z"
    last_updated_by: "code-agent"
    recent_action: "Implemented ADR-001 and recorded the two decisions it forced"
    next_safe_action: "Cut 0.0.24 for the operator device check"
    blockers: []
    key_files:
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/popover-position.ts"
      - "048-stacked-sheets/stacked-surface-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-adr"
      parent_session_id: null
    completion_pct: 100
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

**Landed 2026-09-05, `915591c2`.** Implemented one level above the per-subclass flag rather than by
editing twenty flags: `applyPresentation` routes every touch-mounted modal through the shared sheet
chrome, so all 19 `DbModal` subclasses take the header at once and the twenty-subclass review this
record costed is not owed. Two consequences follow and are recorded rather than assumed — a modal
opened while a sheet is already open presents as a sheet **even where it declares `fullscreen`**,
which settles the third arrangement `stacked-surface-inventory.md` §3.8 named; and the header title
falls back to the modal's own heading, so a subclass that names nothing still gets a correct one.
The risk this record named — a subclass assuming desktop layout — is covered by the lane rather than
by inspection: `properties create property`, `confirm over a sheet` and `import confirm dropdown
chain` are registered pairs, red before the change and green after.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Is the pushed-back parent the one directly beneath the top, or every surface below it?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Implementation |

<!-- ANCHOR:adr-002-context -->
### Context

The first cut marked only the surface immediately beneath the top, which is what iOS does when a
modal covers its presenter completely. Phone sheets are bottom-anchored and shorter than the screen,
so a three-deep chain leaves the outermost sheet visible above both surfaces stacked on it — the
operator's own `stacked-properties-create-property.png` shows two parents peeking.
<!-- /ANCHOR:adr-002-context -->

<!-- ANCHOR:adr-002-decision -->
### Decision

**Every sheet below the top is a stack parent**, marked by the mount rather than computed by any
surface. Depth still comes from the stack and still increments; the visual treatment is one step for
all of them rather than a per-level ramp, because no requirement asks for a ramp and nothing measures
one.
<!-- /ANCHOR:adr-002-decision -->

<!-- ANCHOR:adr-002-consequences -->
### Consequences

Three depth-3 lane rows — `properties property type picker`, `record column submenu` and
`import confirm dropdown chain` — failed `parent dims and scales back` under the first rule and pass
under this one. The cost is that a very deep stack gives no visual cue to how deep it is; recorded as
a limitation in `implementation-summary.md` rather than solved.
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Does a sheet beneath another re-place itself when the stack changes?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Implementation |

<!-- ANCHOR:adr-003-context -->
### Context

The model publishes a stack-change event so a sheet can re-read its keyboard inset when its depth
moves. Subscribing every sheet re-ran the anchored positioner on parents as well as on the top
surface, and a parent whose anchor had been destroyed re-resolved down the anchored branch — which
stripped its sheet chrome and left it detached beneath its own child. Measured on the record sheet:
the parent lost `db-mobile-bottom-sheet` and `isConnected` went false while its child stayed open.
<!-- /ANCHOR:adr-003-context -->

<!-- ANCHOR:adr-003-decision -->
### Decision

**Only the top sheet re-places.** A sheet beneath one is not repositioned at all: the mount already
writes its inset to zero, so a placement pass has nothing left to compute, and re-running placement
on a parent is exactly what "the parent does not move" forbids. When the child closes and the parent
becomes top again, the same event re-places it and it picks the keyboard back up.
<!-- /ANCHOR:adr-003-decision -->

<!-- ANCHOR:adr-003-consequences -->
### Consequences

This is why REQ-002 and REQ-005 do not contradict each other. The parent is not asked for a keyboard
number and then told to ignore it; it is not asked. Rollback is the two listener guards in
`popover-position.ts`, independent of the rest of the model.
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

---
title: "Decision Record: Test Environments and Mock Data"
description: "ADR-001 — the AppFlowy CSV-import environment leg is skipped by operator decision; Anytype's demo space stays the persistent test environment."
trigger_phrases:
  - "049 decision record"
  - "appflowy skip decision"
  - "anytype persistent environment"
  - "test environments adr"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/049-test-environments-and-mock-data"
    last_updated_at: "2026-09-05T11:15:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Recorded ADR-001: AppFlowy CSV import skipped, Anytype demo kept persistent"
    next_safe_action: "Run the Anytype catalogue load over the CDP session"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
      - "AC-007 needs the CDP session the captures leg owns"
    key_files:
      - "tools/mock-data/csv/"
      - "screenshots/appflowy/README.md"
      - "../047-competitor-references-and-pm-alignment/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-049-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Test Environments and Mock Data

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Skip the AppFlowy CSV-import environment leg; Anytype's demo space stays the persistent test environment

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

This packet's `spec.md` names three environments — Obsidian, Anytype, AppFlowy — that should each
hold the same ten-use-case catalogue. AC-008 (`tasks.md` T022) closes the AppFlowy leg by importing
the ten generated CSVs into the AppFlowy demo workspace. AppFlowy is Flutter, rendered to a single
GPU-backed canvas: no DOM, no CDP target, and no accessibility tree with addressable elements. Its
CSV import is entirely click-driven — a toolbar button, a file picker, a column-mapping dialog per
use case — with no scriptable escape hatch equivalent to the Chrome DevTools Protocol route that
unblocks Anytype (AC-007/T021). The operator estimated the import at roughly 10 minutes of their own
Mac, taking the machine away from their concurrent use of it, and instructed: *"Skip AppFlowy
installed captures."* This mirrors `047/decision-record.md` ADR-002, which records the same decision
for that packet's own AppFlowy installed-app rows.

### Constraints

- The skip is scoped to **AppFlowy's CSV-import environment leg** (AC-008, T022). It does not touch
  the Anytype leg (AC-007, T021) or the operator's own Obsidian-vault read (AC-009, T023).
- The ten CSVs already exist (`tools/mock-data/csv/`) and are not deleted; the import instructions
  stay written down in `screenshots/appflowy/README.md` for whenever the window opens.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: close AC-008 as `Waived` and mark T022 skipped rather than blocked, without performing
the AppFlowy CSV import. Separately, and recorded in this same ADR per the operator's instruction:
**Anytype's demo space is the persistent test environment** — kept across sessions rather than
deleted and rebuilt each time a capture, research, or catalogue-load pass touches it.

**How it works**: this packet's active, agent-closeable environment scope narrows to **Anytype and
Obsidian only** — AC-007 (Anytype, still open pending T021's CDP session) and AC-009 (the operator's
own Obsidian-vault read, always operator-only). AC-008 stops being something this packet can ever
close from inside a session; only a future operator window can flip it from `Waived` to `Met`. The
CSVs stay in `tools/mock-data/csv/`, generated straight from `tools/mock-data/generate.ts`, so
nothing needs to be regenerated when that window arrives.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Waive AC-008/T022; keep the CSVs and import steps for later** | Matches the operator's explicit instruction; avoids ~10 minutes of real clicks on a shared machine; nothing generated is lost | The three-environment matrix carries a permanent gap unless reopened | 8/10 |
| B. Have the operator perform the import now | Would close AC-008 immediately | Directly costs the operator's own machine time the instruction was explicit about avoiding | 3/10 |
| C. Leave T022 `[B]` blocked indefinitely, as before | No new decision to record | Misrepresents an accepted choice as an unresolved blocker — the exact ambiguity this ADR removes | 2/10 |

**Why this one**: the operator's own words are a direct instruction, not a preference to weigh;
Option A is the literal reading, and it is the same reading `047/decision-record.md` ADR-002 gives
for that packet's mirror of this decision.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**: `acceptance-criteria.md` and `tasks.md` stop describing AC-008/T022 as blocked on
something that will eventually resolve itself, and instead record a closed, dated decision.

**What it costs**: AC-008 closes `Waived` rather than `Met`; the packet's three-environment goal
(`spec.md`'s Handoff Criteria) is permanently short one leg unless this ADR is later reopened.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later reader assumes the AppFlowy environment failed rather than was skipped by choice | M | `acceptance-criteria.md`'s AC-008 Waiver cell cites this ADR rather than leaving the row silently `Unmet` |
| The retained CSVs go stale before a future operator window arrives | L | The CSVs are generated output, regenerable from `tools/mock-data/generate.ts` on demand; the import steps are pinned in `screenshots/appflowy/README.md` |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Explicit, named operator instruction: "Skip AppFlowy installed captures" |
| 2 | **Beyond Local Maxima?** | PASS | Operator-performed import and leaving T022 indefinitely blocked were both considered and scored lower |
| 3 | **Sufficient?** | PASS | Scoped to exactly AC-008/T022 — Anytype's AC-007/T021 and the operator's AC-009/T023 are untouched |
| 4 | **Fits Goal?** | PASS | Closes an open row honestly rather than leaving it mislabeled as a temporary blocker |
| 5 | **Open Horizons?** | PASS | CSVs and import steps are retained rather than discarded, so a future operator window can still close AC-008 without redoing the generation work |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**: no code changes. This authorizes a documentation update: `acceptance-criteria.md`
AC-008 moves to `Waived` citing this ADR, `tasks.md` T022 gains a skip note, and `../roadmap.md` §6A
records the decision alongside its `047` mirror.

**How to roll back**: if the operator later opens the window, run the import steps in
`screenshots/appflowy/README.md` against `tools/mock-data/csv/`, then flip AC-008 back from `Waived`
to `Met` in `acceptance-criteria.md`, citing the new per-use-case count evidence.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

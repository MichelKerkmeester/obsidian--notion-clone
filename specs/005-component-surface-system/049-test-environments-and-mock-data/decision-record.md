---
title: "Decision Record: Test Environments and Mock Data"
description: "ADR-001 — the AppFlowy CSV-import environment leg is skipped by operator decision; Anytype's demo space stays the persistent test environment. ADR-002 supersedes ADR-001: AppFlowy is removed from the reference set entirely."
trigger_phrases:
  - "049 decision record"
  - "appflowy removed decision"
  - "anytype persistent environment"
  - "test environments adr"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/049-test-environments-and-mock-data"
    last_updated_at: "2026-09-05T12:10:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded ADR-002: AppFlowy removed from the reference set entirely, superseding ADR-001"
    next_safe_action: "Run the Anytype catalogue load over the CDP session"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
      - "AC-007 needs the CDP session the captures leg owns"
    key_files:
      - "tools/mock-data/csv/"
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

<!-- ANCHOR:adr-002 -->
## ADR-002: AppFlowy removed from the reference set entirely, superseding ADR-001

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-002-context -->
### Context

ADR-001 (above) skipped the AppFlowy CSV-import environment leg while keeping the retained CSVs and
import steps pending a future operator window. The operator's later, separate instruction —
**"let's ditch AppFlowy screenshots"** — removes AppFlowy from the reference set entirely, mirroring
`047/decision-record.md` ADR-003. There is no future window to wait for once the product itself is
out of scope.

### Constraints

- Scoped to **AppFlowy as a reference/import environment** in this packet. Anytype (AC-007/T021)
  and the operator's Obsidian read (AC-009/T023) are untouched.
- The ten CSVs in `tools/mock-data/csv/` are **not** deleted — the operator judged them
  product-neutral CSV-export fixtures, so they stay, reworded away from AppFlowy-specific framing
  in `tools/mock-data/README.md` and `tools/mock-data/csv/README.md`.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: move AC-008 from `Waived` (ADR-001) to `Superseded` — the AppFlowy CSV-import
environment leg no longer applies at all, rather than being deferred to a future window. T022's note
is updated the same way. `screenshots/appflowy/README.md`, which held the retained import steps, was
deleted with the rest of `screenshots/appflowy/` (`047/decision-record.md` ADR-003).

**How it works**: this packet's active, agent-closeable environment scope stays **Anytype and
Obsidian only** — unchanged from ADR-001's narrowing, except AC-008 now reads `Superseded` instead
of `Waived` because the environment itself is gone rather than merely deferred.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Move AC-008 to Superseded; keep the CSVs as product-neutral fixtures** | Matches the operator's explicit instruction and `047`'s mirrored ADR-003; nothing generated is lost | The three-environment matrix (`spec.md`'s original framing) permanently loses one leg | 9/10 |
| B. Leave AC-008 as `Waived` (ADR-001 unchanged) | Smallest diff | Misdescribes the row as pending a future window that no longer exists | 3/10 |
| C. Delete the CSVs along with the AppFlowy folder | Removes every AppFlowy-adjacent artifact | Contradicts the operator's own instruction that the CSVs stay — they are product-neutral, not AppFlowy-specific | 1/10 |

**Why this one**: the operator's own words scope the removal to AppFlowy the product, not to the
CSVs; Option A is the literal reading and matches `047/decision-record.md` ADR-003 exactly.
<!-- /ANCHOR:adr-002-alternatives -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**: `acceptance-criteria.md` stops describing AC-008 as pending a future window that
will never arrive, and instead records that the environment itself left scope.

**What it costs**: none beyond what ADR-001 already cost — AC-008 was already not going to close
from inside a session; this only corrects its status label.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later reader assumes the CSVs were removed along with AppFlowy | L | This ADR and `tools/mock-data/README.md`/`csv/README.md` state explicitly that the CSVs stay as product-neutral fixtures |
<!-- /ANCHOR:adr-002-consequences -->

---

<!-- ANCHOR:adr-002-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Explicit, named operator instruction: "let's ditch AppFlowy screenshots" |
| 2 | **Beyond Local Maxima?** | PASS | Leaving AC-008 as `Waived` and deleting the CSVs were both considered and scored lower |
| 3 | **Sufficient?** | PASS | Scoped to AC-008/T022 only; AC-007/T021 and AC-009/T023 are untouched |
| 4 | **Fits Goal?** | PASS | Matches `047/decision-record.md` ADR-003 exactly, keeping the two packets' AppFlowy dispositions consistent |
| 5 | **Open Horizons?** | PASS | The CSVs are retained as product-neutral fixtures rather than discarded |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-002-five-checks -->

---

<!-- ANCHOR:adr-002-impl -->
### Implementation

**What changes**: `acceptance-criteria.md` AC-008 moves to `Superseded` citing this ADR; `tasks.md`
T022 gains a superseded note; `../roadmap.md` §6A records the decision alongside `047`'s ADR-003.

**How to roll back**: if AppFlowy is ever reopened as a reference product, revert `047`'s ADR-003 and
this ADR together, restore `screenshots/appflowy/` from git history, and flip AC-008 back to
`Waived` pending the import.
<!-- /ANCHOR:adr-002-impl -->
<!-- /ANCHOR:adr-002 -->

---

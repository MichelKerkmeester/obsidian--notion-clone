---
title: "Decision Record: Competitor References and PM Alignment"
description: "ADR-001 overrides the deep-research cap for Anytype; ADR-002 skips AppFlowy's remaining installed-app captures and keeps Anytype's demo space persistent; ADR-003 supersedes ADR-002 and removes AppFlowy from the reference set entirely."
trigger_phrases:
  - "047 decision record"
  - "anytype research override"
  - "deep research iteration cap"
  - "competitor references adr"
  - "appflowy removed decision"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T12:10:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded ADR-003: AppFlowy removed from the reference set entirely, superseding ADR-002"
    next_safe_action: "Reconcile 049's mirror decision and the roadmap §6A entry"
    blockers: []
    key_files:
      - "screenshots/anytype/"
      - "../049-test-environments-and-mock-data/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Competitor References and PM Alignment

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Override the 5-iteration deep-research cap for a 20-iteration Anytype-only pass

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

The default deep-research workflow caps a run at 5 iterations. The operator, having reviewed
Anytype's interface, judged it separately from the "align closer" ruling that opened this phase:
*"finds Anytype to have amazing UI/UX"*, wants *"a lot of screenshots"* of it, and asked for
*"another 20 iterations deep research UX / Logic extraction run purely on Anytype"*.

### Constraints

- The default cap exists to bound research spend against a single reference; this override is
  explicit and named, not a silent extension of every future research pass.
- The override is scoped to **one competitor reference** (Anytype) and **one packet** (`047`); it
  does not raise the cap for AppFlowy, Project Manager, or any other packet's research.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: run 20 additional deep-research iterations of UX/logic extraction purely on Anytype,
beyond the default 5-iteration cap, with a larger volume of screenshots than the phase's other
reference sets carry.

**How it works**: the override applies only to the Anytype leg of this phase's reference-capture
work; AppFlowy and the Project Manager fidelity pass keep the default cap and scope defined in
`spec.md`.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Override the cap for Anytype only, 20 more iterations** | Matches the operator's explicit ask; scoped narrowly enough not to reset the cap program-wide | 20 iterations is real research spend on one reference | 8/10 |
| B. Keep the default 5-iteration cap and ask the operator to prioritise within it | No cap exception to track | Directly contradicts the operator's explicit, named request | 2/10 |
| C. Raise the default cap program-wide | Simplest rule | Not what the operator asked for — they scoped it to Anytype specifically | 1/10 |

**Why this one**: the operator's own words scope the override to Anytype and to a specific
iteration count; Option A is the literal reading, not an inference from a general preference.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**: the Anytype reference set gets research depth proportional to how much weight
the operator wants to place on it, rather than being capped at the same depth as a reference they
did not single out.

**What it costs**: real research time and iteration spend beyond the default budget, on one
reference only.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The override is read as raising the cap for every future packet | M | This record scopes it explicitly to `047` and to Anytype; cite this ADR before extending it |
| App-launch friction (recorded below) slows the capture leg the research depends on | L | The operator opened both apps manually; captures resume from those windows rather than blocking on automated launch |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Explicit, named operator request, distinct from the phase's original "align closer" ruling |
| 2 | **Beyond Local Maxima?** | PASS | Keeping the default cap and raising it program-wide were both considered and scored lower |
| 3 | **Sufficient?** | PASS | 20 iterations, scoped to Anytype, is exactly what was asked for — no more, no less |
| 4 | **Fits Goal?** | PASS | Strengthens `047`'s reference-capture deliverable, which the phase already scopes |
| 5 | **Open Horizons?** | PASS | Scoping the override narrowly leaves the default cap intact for every other packet |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**: no code changes. This authorizes a deep-research run beyond the default cap; the
run itself is a separate, later action against `screenshots/anytype/`.

**Capture-leg status, recorded alongside this ADR**: the captures leaf reports **Anytype 0.56.5**
and **AppFlowy 0.14.1** installed via Homebrew (`tasks.md` T002). App launch hung for the agent;
the operator opened both apps by hand, and captures resume from those windows rather than from an
automated launch.

**How to roll back**: if the override is later judged excessive, stop the research pass at whatever
iteration it has reached; partial results are still usable reference material, not wasted work.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Skip AppFlowy installed-app captures; Anytype's demo space stays the persistent test environment

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-002-context -->
### Context

AppFlowy is Flutter, rendered to a single GPU-backed canvas: no DOM, no CDP target, and no
accessibility tree with individually addressable elements (confirmed while capturing T009 — the
AX tree under its window is one opaque `AXGroup`). The two remaining matrix rows this phase had not
reached (table-installed, calendar-installed) and the CSV import of `tools/mock-data`'s catalogue
into the AppFlowy demo workspace (`049`'s AC-008/T022) all need the same thing: real, OS-level mouse
clicks — a toolbar button, a tab bar, a file picker, a column-mapping dialog — with no scriptable
escape hatch equivalent to the Chrome DevTools Protocol route that unblocked Anytype in T008. The
operator estimated this at roughly 10 minutes of their own Mac, which would take the machine away
from their concurrent use of it. The operator's exact instruction: *"Skip AppFlowy installed
captures."*

### Constraints

- The skip is scoped to **AppFlowy's remaining installed-app work** — the two unreached matrix rows
  and the CSV-import environment leg. It does not touch the AppFlowy captures already taken
  (`appflowy-board-installed-dark.png`, the search palette, the About dialog), which stay in the
  repository as-is, and it does not touch Anytype or Project Manager's scope.
- AppFlowy's **official** product images remain the primary AppFlowy reference set for the
  board-comparison work in T012-T014.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: skip the two remaining AppFlowy installed-app capture rows (table-installed,
calendar-installed) and the AppFlowy CSV-import environment leg in `049`, keeping only AppFlowy's
official product images as the reference set going forward. Separately, and recorded in this same
ADR per the operator's instruction: **Anytype's demo space is the persistent test environment** —
kept across sessions rather than deleted and rebuilt each time a capture or research pass touches it.

**How it works**: `047`'s AC-001 rows for AppFlowy table-installed and calendar-installed move from
"not reachable" (a technical block) to "skipped by operator decision" (an accepted disposition); no
further AppFlowy installed-app capture work is scheduled. `049`'s AC-008 (AppFlowy CSV import) and
its `tasks.md` T022 close the same way — see `049/decision-record.md` ADR-001, which mirrors this
entry for that packet's own closure gate. The CSVs stay in `tools/mock-data/csv/` for a future
operator window; nothing is deleted. Anytype's demo space is not torn down between sessions, so a
later research or capture pass resumes from the same space rather than reseeding it.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Skip the remaining AppFlowy installed-app work; keep official images as the reference set** | Matches the operator's explicit instruction; avoids ~10 minutes of real clicks on a shared machine; nothing already captured is lost | Two matrix rows and one environment leg stay permanently unmet rather than met | 8/10 |
| B. Have the operator perform the remaining clicks now | Would close the two rows and the CSV import | Directly costs the operator's own machine time the instruction was explicit about avoiding | 3/10 |
| C. Attempt further automation (accessibility API, synthetic events) | Would avoid asking the operator anything | Already tried and confirmed to fail for AppFlowy specifically — one opaque `AXGroup`, no CDP-equivalent remote-debugging hatch since it is not Chromium | 1/10 |

**Why this one**: the operator's own words are a direct instruction, not a preference to weigh; Option
A is the literal reading.
<!-- /ANCHOR:adr-002-alternatives -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**: the packet stops carrying an open-ended "pending an operator window" note for
AppFlowy and instead records a closed, dated decision — the next agent reading `tasks.md` or
`acceptance-criteria.md` sees a decision, not an unresolved TODO.

**What it costs**: `047`'s AC-001 and `049`'s AC-008 close as `Waived` rather than `Met`; the
16-row and three-environment matrices each carry a permanent gap unless the operator later reopens
this ADR.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later reader assumes the AppFlowy installed-app rows failed rather than were skipped by choice | M | Both `047/acceptance-criteria.md` and `049/acceptance-criteria.md` cite this ADR (and its `049` mirror) in their Waiver cells rather than leaving the rows silently `Unmet` |
| The retained CSVs and import steps go stale before the "future operator window" arrives | L | The exact import steps are kept in `screenshots/appflowy/README.md`; the CSVs are generated output and can be regenerated from `tools/mock-data/generate.ts` if the schema moves on |
<!-- /ANCHOR:adr-002-consequences -->

---

<!-- ANCHOR:adr-002-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Explicit, named operator instruction: "Skip AppFlowy installed captures" |
| 2 | **Beyond Local Maxima?** | PASS | Operator-performed clicks and further automation were both considered and scored lower |
| 3 | **Sufficient?** | PASS | Scoped to exactly the two remaining rows and the CSV-import leg — no broader AppFlowy or cross-product scope change |
| 4 | **Fits Goal?** | PASS | Closes `047`'s and `049`'s open AppFlowy rows without inventing evidence that was never captured |
| 5 | **Open Horizons?** | PASS | The CSVs and import steps are retained rather than discarded, so a future operator window can still close AC-008 without redoing the generation work |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-002-five-checks -->

---

<!-- ANCHOR:adr-002-impl -->
### Implementation

**What changes**: no code changes. This authorizes a documentation update across `047` and `049`:
`acceptance-criteria.md` rows move to `Waived` citing this ADR (and its `049` mirror), `tasks.md`
T009 and T022 gain a skip note, and `../roadmap.md` §6A records the decision.

**How to roll back**: if the operator later opens the window, run the retained import steps in
`screenshots/appflowy/README.md`, capture the two remaining views, then flip the affected rows back
from `Waived` to `Met` in both packets' `acceptance-criteria.md`, citing the new evidence.
<!-- /ANCHOR:adr-002-impl -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: AppFlowy removed from the reference set entirely, superseding ADR-002

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-003-context -->
### Context

ADR-002 (above) recorded skipping AppFlowy's two remaining installed-app capture rows while keeping
its official product images and the already-taken installed captures as an ongoing reference set,
pending a future operator window. The operator's later, separate instruction supersedes that
disposition outright rather than extending it: **"let's ditch AppFlowy screenshots"** — AppFlowy
leaves the reference set entirely, not partially. This is a scope decision, not a technical one:
nothing about AppFlowy's Flutter/no-DOM limitation changed; the operator chose to stop carrying it
as a comparison product at all.

### Constraints

- The removal is scoped to **AppFlowy as a reference product** across this phase and its sibling
  `049-test-environments-and-mock-data`. It does not touch Anytype's reference set or Project
  Manager's.
- `tools/mock-data/csv/`'s CSVs are **not** deleted — the operator judged them product-neutral CSV
  export fixtures rather than AppFlowy-specific artifacts, and reworded their documentation instead
  of removing them.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: delete `screenshots/appflowy/` entirely (images, `README.md`, `sources.md`), remove
every AppFlowy reference from this phase's `spec.md`, `tasks.md`, `acceptance-criteria.md` and
`goal.md` — rewriting scope statements to Anytype-only (plus the Project Manager reference) — and
record the removal in `../roadmap.md` §6A and §4 rows 37/38. `049-test-environments-and-mock-data`
carries the mirror change in its own `tasks.md`, `acceptance-criteria.md` and `decision-record.md`.
`tools/mock-data/csv/` and its README are reworded from "the AppFlowy import files" to a
product-neutral "CSV export" framing, since the CSVs themselves are not AppFlowy-specific.

**How it works**: this ADR **supersedes ADR-002** above. ADR-002's disposition of AppFlowy's
remaining installed-app rows (`Waived`, pending a future operator window) is moot once AppFlowy
leaves the reference set entirely — there is no future window to wait for. `047`'s AC-001 is
rewritten to an Anytype-only matrix (8 rows: board/table/calendar/timeline x official/installed,
of which timeline is N/A for both sources) and reassessed against that narrower scope: every
remaining row is either captured or correctly N/A, so AC-001 now reads `Met` rather than `Waived`.
`049`'s AC-008 (the AppFlowy CSV-import environment leg) moves from `Waived` (ADR-001, pending a
future window) to `Superseded` — the environment itself is out of scope, not merely deferred.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **A. Delete `screenshots/appflowy/` and rewrite every active scope statement to Anytype-only** | Matches the operator's explicit instruction; leaves no stale "AppFlowy work in progress" doc anywhere active readers look | The captures and provenance work already done for AppFlowy (T009, T011, T015) is discarded rather than reused | 9/10 |
| B. Keep the AppFlowy folder and images, just stop planning further AppFlowy work (extend ADR-002 as-is) | No deletion; smallest diff | Does not match "ditch AppFlowy screenshots" — the operator asked for removal, not a freeze | 3/10 |
| C. Archive `screenshots/appflowy/` under a `_archive/` prefix instead of deleting | Recoverable without git history | Not what was asked, and adds a permanent stale folder the manifest and README indexes would need to keep excluding | 4/10 |

**Why this one**: the operator's own words are a direct instruction to remove, not to freeze or
archive; Option A is the literal reading, and git history already makes the removal recoverable
without a parallel archive folder.
<!-- /ANCHOR:adr-003-alternatives -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**: the packet's active scope statements stop describing AppFlowy as in-progress or
pending work, matching what the operator actually wants captured going forward. `AC-001` closes on
real evidence (`Met`) instead of carrying a permanent `Waived` gap.

**What it costs**: the AppFlowy captures, provenance research (`sources.md`), and README content
already produced under T009/T011/T015 are removed from the working tree; they remain recoverable
from git history (this commit's parent) if a future operator reopens AppFlowy as a reference
product.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later reader finds a stray AppFlowy reference in an untouched doc and assumes the removal was incomplete | L | This ADR names the exact narrow write-authority scope; any residual mention outside it is a known, reported gap rather than a silent miss |
| Git history is the only remaining record of the AppFlowy captures if a future operator wants them back | L | This ADR and its commit message name exactly what was removed and when, so a future recovery is a `git log`/`git show` away rather than a guess |
<!-- /ANCHOR:adr-003-consequences -->

---

<!-- ANCHOR:adr-003-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Explicit, named operator instruction: "let's ditch AppFlowy screenshots" |
| 2 | **Beyond Local Maxima?** | PASS | Freezing AppFlowy in place (extending ADR-002) and archiving it were both considered and scored lower |
| 3 | **Sufficient?** | PASS | Scoped to AppFlowy as a reference product across `047` and `049`; Anytype and Project Manager are untouched |
| 4 | **Fits Goal?** | PASS | Matches the operator's own words exactly, and closes `047`'s AC-001 on real evidence rather than leaving a permanent waiver |
| 5 | **Open Horizons?** | PASS | Git history retains the removed captures if a future operator reopens AppFlowy as a reference product |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-003-five-checks -->

---

<!-- ANCHOR:adr-003-impl -->
### Implementation

**What changes**: `git rm -r screenshots/appflowy/`; `047`'s `spec.md`, `tasks.md`,
`acceptance-criteria.md` and `goal.md` rewritten to Anytype-only scope; `049`'s `tasks.md`,
`acceptance-criteria.md` and `decision-record.md` carry the mirror change; `../roadmap.md` §6A gains
this decision and §4 rows 37/38 drop AppFlowy from the ask; `tools/mock-data/README.md` and
`tools/mock-data/csv/README.md` reworded from AppFlowy-specific framing to product-neutral "CSV
export" framing, since the CSVs stay (they are product-neutral, per the operator).

**How to roll back**: `git revert` the removal commit, or `git checkout <pre-removal-sha> --
screenshots/appflowy/` to restore the folder, then reopen this ADR and flip `047`'s AC-001 and
`049`'s AC-008 back to their ADR-001/ADR-002 dispositions with the restored evidence.
<!-- /ANCHOR:adr-003-impl -->
<!-- /ANCHOR:adr-003 -->

---

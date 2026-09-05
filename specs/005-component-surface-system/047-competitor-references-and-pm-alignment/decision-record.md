---
title: "Decision Record: Competitor References and PM Alignment"
description: "ADR-001 — the default 5-iteration deep-research cap is overridden for this phase: 20 more iterations, run purely on Anytype."
trigger_phrases:
  - "047 decision record"
  - "anytype research override"
  - "deep research iteration cap"
  - "competitor references adr"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Recorded ADR-001, the operator's 20-iteration research-cap override for Anytype"
    next_safe_action: "Run the overridden Anytype research pass once captures resume"
    blockers: []
    key_files:
      - "screenshots/anytype/"
      - "screenshots/appflowy/"
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

---
title: "Decision Record: Phase 000 — Grid Contract and List Harness"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). ADR-P0-01 — a guard tripwire's failing-first demonstration is against a deliberately mutated tree, not against HEAD, and why that is not a loophole in the packet's criteria doctrine."
trigger_phrases:
  - "006 phase 000 adr"
  - "tripwire failing first rule"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/000-grid-contract-and-list-harness"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 000; AC-31 and AC-32 defined as guard tripwires"
    next_safe_action: "Build isGridView and the two guard tripwires"
    blockers: []
    key_files:
      - "decision-record.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p000-dec"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Decision Record: Phase 000 — Grid Contract and List Harness

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-P0-01: How a guard tripwire demonstrates its prior failure

**Status: Decided.** Scoped to guard tripwires. It changes nothing for any other criterion in this
packet.

<!-- ANCHOR:adr-001-context -->
### Context

The packet's criteria doctrine requires every criterion to be **demonstrated failing on the current
tree, with the failing number recorded**. That rule exists because release 1.3.1 shipped real code,
passed every gate, and changed nothing the operator could see — a criterion that never failed cannot
prove that a later pass means anything.

ADR-001 separately obliges a check per view-semantic guard, driving the production render, built
before any guard is converted. Two guards qualify: the one that keeps the list's title field, and the
one that keys new-row reveal to the list. Both are **correct today**. Both would pass `tsc` and the
entire unit suite if broken.

The two rules collide. A check on a guard that is currently correct **passes on HEAD**. Under the
doctrine read literally, such a check is the banned shape 1 — a criterion asserting a property the
current tree already has, true before a line is written.

Resolving the collision by deleting the check is not available: ADR-001 requires it, and nothing else
in the gate set can see either failure. Resolving it by writing the check so that it *does* fail on
HEAD is worse — it would mean asserting a property the guard does not yet provide, which makes the
tripwire a feature request rather than a regression guard, and it would go green the moment someone
implemented the wrong thing.

<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**A guard tripwire's failing-first demonstration is against a deliberately mutated tree.**

The obligation is not weakened, it is relocated. To be accepted, a tripwire must have on record:

1. The **mutation**, as a reproducible diff — the guard converted the way a careless sweep would
   convert it.
2. The **command** that ran the check against the mutant.
3. **Both numbers** — the value on HEAD and the value on the mutant — which must differ.

A tripwire that passes its own mutant is theatre and is rejected. That is a stricter test than the
ordinary doctrine applies, not a weaker one: an ordinary criterion has to fail once, on a tree nobody
constructed on purpose. A tripwire has to fail on a tree built specifically to defeat it.

<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives

| Alternative | Why not |
|---|---|
| **Drop the tripwires; rely on `tsc` and the unit suite** | Both guards break silently under both. This is the exact failure ADR-001 names as the packet's largest risk, and R4 in the parent's risk matrix scores it medium likelihood, high impact |
| **Write the tripwires to fail on HEAD** | Only possible by asserting something the guard does not do today, which turns a regression guard into an unbuilt feature and inverts what a pass means |
| **Waive the doctrine for these two rows** | A waiver with no replacement rule is how banned shape 1 gets in through the side door. The point of this ADR is that the replacement rule is *harder* to satisfy, not that the rule is suspended |
| **Defer the tripwires to the phase that converts the guards** | ADR-001 rejects it directly: a check authored by the phase that can break the thing it checks is not evidence |

<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

- Positive: the two silent failure modes acquire the only gate that can see them, and the gate is
  proven rather than asserted.
- Positive: the doctrine keeps a single, literal reading for every other criterion. There is exactly
  one named exception and it has an entry condition — *the criterion guards a view-semantic branch
  that is correct today* — that no ordinary chrome or structure criterion can meet.
- Negative: this phase must maintain a scratch mutation. It is a diff in this folder, not a branch,
  and it is re-applied rather than kept alive.
- Negative: neither tripwire **closes** in this phase. They are armed here and close in 001, against
  the tree that actually converts the other seven. A tripwire never exposed to the conversion
  it guards has been written, not tested.

<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes. Without it the two tripwires are either rejected by the doctrine or written as the banned shape the doctrine exists to catch |
| **Is there a simpler existing thing?** | The doctrine itself, read literally. It does not cover a regression guard on correct code, which is why the collision is real rather than a misreading |
| **What does it touch?** | The criteria doctrine only. No code, no guard, no renderer |
| **What is the real caller that must not break?** | Every other criterion in the packet. The carve-out is scoped so none of them can claim it |
| **What contract must not break?** | "No criterion passes without its prior failure on record." Preserved — the record is against the mutant, and it is a harder record to produce |

<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation note

Three constraints hold regardless:

1. **The carve-out names its members.** Only AC-31 and AC-32 hold it. If a later phase wants it for a
   third criterion, that criterion is argued on this page first — it does not inherit the exception
   by resembling one.
2. **The mutation is recorded, not remembered.** A diff in this folder. A tripwire whose arming
   evidence is a claim that someone once tried it is not armed.
3. **Comment hygiene binds the tripwires too.** Neither check, nor its fixture, may carry a spec
   path, a phase number, a guard id or a criterion id in a code comment. The durable *why* — that
   this branch is view-semantic and converting it breaks the list silently — is what belongs there.

<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

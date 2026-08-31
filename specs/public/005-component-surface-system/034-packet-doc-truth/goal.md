---
title: "Goal: Packet Documentation Truth"
description: "Eleven of the review's fifteen findings are untrue statements inside this packet's own documents."
trigger_phrases: ["034 goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-08-31T17:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Goal added; the packet binds on this file and it was missing"
    next_safe_action: "Correct the parent spec first; six of the eleven live there"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: ["Can a stale line reference or a deleted symbol be caught by a script"]
    answered_questions: ["Every one of these was true when written and drifted when the tree moved"]
---
# Goal: Packet Documentation Truth

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A reader can trust what this packet's documents assert, because each assertion was re-derived from the tree rather than remembered.

**Eleven of fifteen review findings are documentation, not code.** The packet built to stop
untrue completion claims is the largest single source of untrue statements the review found. Six of
the eleven are in the parent spec, the most-read document here.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Correct from the tree, never by copying another document. Copying propagates the next drift. |
| D2 | Every correction cites what it was derived from, so re-checking costs one command. |
| D3 | Regenerate metadata after every edit. This was missed three times in the session that opened this phase. |
| D4 | Two of the eleven are not doc-only: withdrawing a live-verification claim and resolving a checklist both have substantive residue. Do not close them as wording. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] All eleven corrected against the tree, or declared still-true with the evidence.
- [ ] No correction introduces a derived number without naming its source.
- [ ] Re-running the review dimension does not re-raise a corrected finding.
- [ ] `validate.sh --strict` Errors: 0 for every folder touched.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Nothing has started.**

**Two of the eleven are not really documentation work**, and treating them as wording would be the
same mistake in a new place. Withdrawing the claim that a live-verification phase drove the running
app leaves the harness circularity — this packet's founding concern — unowned rather than fixed. And
the checklist finding is blocked on a phase whose own state the parent calls Unknown. Both need a
decision about substance, not a rewrite.

**The scope line says code findings belong to other phases and then takes one** — the comment
documenting a deleted API. That is a deliberate exception: it is a comment, its correction is a
sentence, and opening a phase for one sentence would cost more than the sentence. Named so it does
not read as an oversight.
<!-- /ANCHOR:log -->

---
title: "Feature Specification: Packet Documentation Truth"
description: "Eleven of the deep review's fifteen findings are untrue statements inside this packet's own documents; this phase corrects them and records why they drifted."
trigger_phrases: ["doc truth", "packet drift", "034 doc truth", "review doc findings"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from the eleven documentation findings in the deep review"
    next_safe_action: "Correct the parent spec's six findings first; they are the most cited document"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Is a periodic re-derivation cheaper than correcting drift after a review finds it?"
    answered_questions:
      - "Eleven of fifteen review findings are documentation, not code"
---
# Feature Specification: Packet Documentation Truth

> Phase chain: parent [`../spec.md`](../spec.md). Opened from the deep review's own findings.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 034-packet-doc-truth |
| **Level** | 2 |
| **Status** | Planned |
| **Complexity** | 39/100, confidence 80% |

**On the declared level.** `recommend-level.sh` returned Level 1; this folder declares Level
2. Raising it is permitted and is recorded here rather than left silent: Eleven corrections across nine files, two of which carry substantive residue rather than wording. The scorer
reads line and file counts and cannot see either.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

The deep review returned FAIL with fifteen findings. **Eleven are documentation drift inside this
packet's own files**, and that is the uncomfortable result worth stating plainly: the packet that
exists to stop untrue completion claims is the largest single source of untrue statements the review
found.

They are not stylistic. Each names a document asserting something the tree contradicts:

| ID | Where | The untrue statement |
|----|-------|----------------------|
| F003 | `000/spec.md:59` | Specifies a deleted factory as the create path |
| F004 | `spec.md:69` | Phase map incomplete, under-counts folders |
| F005 | `009/implementation-summary.md:48` | Claims a live-verification pass that never drove the running app |
| F006 | `004/checklist.md:31` | Completion marks missing or unchecked |
| F007 | `spec.md:133` | Lists 006 Planned while the child is in progress |
| F008 | `spec.md:259` | Stale stylesheet length |
| F009 | `028/spec.md:53` | Cites a line the code no longer occupies |
| F011 | `spec.md:235` | Narrates a deleted factory as the overlay sequence |
| F012 | `spec.md:157` | Says 010-017 lack `plan.md` |
| F014 | `spec.md:132` | Labels 004 Contested after the roadmap resolved it |
| F015 | `popover-position.ts:177` | Documents a deleted API in a code comment |

**Six of the eleven are in the parent `spec.md`** — the most-read document in the packet.

**The mechanism is known and named.** Every one of these was true when written. They drifted because
the tree moved and nobody re-derived them. That is the same failure a fresh reviewer found in this
session's own work, and the same failure the commit preceding this session is named for: *write the
handover from the tree rather than from memory.*
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.** The eleven findings, and one cheap structural question: whether any of these classes
can be checked mechanically instead of re-read — a line reference that no longer resolves, or a
named symbol that no longer exists, are both greppable.

**Out of scope.** Rewriting documents that are merely old. Only assertions the tree contradicts.
F001, F002, F010 and F013 are code findings owned by other phases.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | Each of the eleven is corrected against the tree, or explicitly declared still-true with the evidence. |
| REQ-002 | A correction cites what it was re-derived from, so the next reader can re-check it cheaply. |
| REQ-003 | At least one class is given a mechanical check, or the reason it cannot be is recorded. |
| REQ-004 | `validate.sh --strict` reports Errors: 0 for every folder touched. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [ ] All eleven closed, each with the observation that closed it.
- [ ] No correction introduces a new derived number without naming its source.
- [ ] Re-running the same review dimension does not re-raise a corrected finding.
- [ ] Metadata regenerated for every folder edited — the failure this session repeated twice.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS

| Risk | Likelihood | Mitigation |
|---|---|---|
| Corrections themselves drift | **High** — this is the whole problem | REQ-002 makes every correction cite its source so re-checking is cheap |
| A doc is "fixed" from memory | Med | Each correction is re-derived from the tree, never from another document |
| Metadata not regenerated after edits | Med | REQ-004; it happened twice in the session that opened this phase |
<!-- /ANCHOR:risks -->

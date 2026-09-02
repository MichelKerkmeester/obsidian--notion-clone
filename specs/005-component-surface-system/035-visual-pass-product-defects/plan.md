---
title: "Implementation Plan: Visual Pass Product Defects"
description: "Two steps: one external implementing dispatch, then a fresh in-runtime verifier that recaptures, reads, releases and commits."
trigger_phrases: ["035 plan", "035 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T18:30:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "14 of 17 defects fixed and read on recaptures; P4 P6 P15 open"
    next_safe_action: "Take the operator call on P6 scroll-versus-wrap and P15 threshold"
    blockers: ["Twelve of the seventeen close only on a recapture a person reads"]
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-plan"
      parent_session_id: null
    completion_pct: 78
    open_questions: ["What clips Copy CSV when the bar already scrolls (P6)"]
    answered_questions: ["The implementing runtime cannot reach Chrome, so it cannot close a visual row"]
---
# Implementation Plan: Visual Pass Product Defects

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

Two steps, and the split between them is the plan's whole point.

**Step 1 — implement, via `cli-codex` (`gpt-5.6-luna`, reasoning `max`, `fast`, sandbox
`workspace-write`), one dispatch.** It acquires the stylesheet lane, re-verifies each defect on disk
before editing it, fixes what is real, records what is not, and ticks only the `tasks.md` rows its
own evidence closes. It runs `tsc`, `vitest`, `lint:tools` and `scan-comments`, and a node CSSOM
parse for P1 where a rule's validity **is** the defect. It does not stage, commit or push.

**Step 2 — verify, via a fresh in-runtime agent (Opus).** It recaptures, **reads** the changed
captures rather than regenerating them, runs `npm run gate` reading `$?` directly, releases the
stylesheet lane with a `reviewed` array naming those captures, and commits.

One dispatch per step. The second is fresh, not a continuation — a runtime that wrote a fix is the
wrong one to judge whether the picture changed.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. WHY THE SPLIT IS STRUCTURAL, NOT PROCEDURAL

The implementing sandbox cannot reach Chrome. Twelve of the seventeen defects are things a person
sees, and the remaining five still change pixels. So the runtime doing the work is physically unable
to observe the evidence that closes the work — which means "the fix is in" and "the fix worked" are
claims from two different instruments, and collapsing them is how this program produced 1.3.1.

That is D1, and it is why step 2 is a separate agent rather than a later phase of step 1. It is also
why D3 puts lane **release** in step 2: releasing the lane asserts the captures are current, and the
runtime that cannot see them cannot assert it.
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. VERIFICATION

Per defect, the check named in `spec.md` §1's last column, plus the criterion's before-number in
`goal.md` §2. Nothing is ticked on a green run alone: a `gate: PASS` with no capture read closes
none of the twelve visual rows.

Two controls are observable without a browser and must be observed **red first**: P1's CSSOM parse
returns an empty `cssText` today, and P17's second failure reproduces by reddening a lane
deliberately. P13 gets a unit test that fails on the dateKey before it passes on the formatted value.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

Nothing is committed until step 2. Until then the work is in the tree and `git checkout --` restores
any file. After step 2, `git revert` of the single commit restores the stylesheet, the three
renderers and the gate tooling together; the lane journal keeps its acquire and release entries as
history and is not rewritten.
<!-- /ANCHOR:rollback -->

<!-- ANCHOR:quality-gates -->
## AI EXECUTION PROTOCOL

### Pre-Task Checklist
- [ ] The defect's file:line was re-opened on disk before it was edited.
- [ ] Every check named below has been observed failing before it is trusted.
- [ ] Exit codes are read directly; a pipe makes `$?` the pipe's status.

### Execution Rules
1. Observe red before green; a check that never failed is not evidence.
2. Never quote a browser number from a runtime that cannot open a browser.
3. Colours are transcribed from tokens that exist, never invented.
4. Regenerate metadata after any spec-doc edit in this folder.

### Status Reporting Format
Task id, what ran, exit code read directly, and the observation that closes it. Shipped, verified
and operator-confirmed are distinct and not interchangeable.

### Blocked Task Protocol
Halt and report with evidence and the decision needed rather than routing around a blocker.
<!-- /ANCHOR:quality-gates -->

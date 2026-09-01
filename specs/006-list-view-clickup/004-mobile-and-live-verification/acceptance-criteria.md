---
title: "Acceptance Criteria: Phase 004 — Mobile and Live Verification"
description: "Measurement plans for the phone criteria, which cite no capture, and AC-26, which has no automated substitute."
trigger_phrases:
  - "006 phase 004 criteria"
  - "ac-26 device verification"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/004-mobile-and-live-verification"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 004; AC-26 recorded as unsubstitutable"
    next_safe_action: "Wait for the styles.css lane to be released by 002"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p004-acc"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Phase 004 — Mobile and Live Verification

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | `004-mobile-and-live-verification/` |
| **Criterion definitions** | [`../acceptance-criteria.md`](../acceptance-criteria.md) — the packet register |
| **This file** | The measurement plan |
| **Owned** | `AC-24`, `AC-25`, `AC-26` |
| **Also gated on** | `AC-31` and `AC-32`, re-run against the final tree |
| **Measurement surface** | the harness at phone width — **except `AC-26`, which is a person** |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

### 2.1 The phone criteria cite no capture

All four primary captures are wide desktop. The parent's §4.2.1 records the narrow-width overflow
rule, the touch targets and every criterion in this phase as **untouched** by the reference.

So each row below names its own justification, and none of them is "the reference does it this way":

| ID | Probe | Threshold | Negative control | Justification |
|---|---|---|---|---|
| `AC-24` | touch target box of the group toggle and the row checkbox, at phone width | at least 44 by 44 CSS px | shrink the viewport further; the box holds | Platform touch guidance and our own measurement. **Not the reference** |
| `AC-25` | focus ring on every interactive element introduced across the packet | visible, implemented as `box-shadow`, no bare `outline: none` | remove the ring; the check fails | Keyboard reachability. **Not the reference** |

If a phone layout choice conflicts with the desktop shape the reference established, **record the
conflict** rather than resolving it by assuming the reference would have made the same choice at a
narrow width. Four desktop screens cannot say.

### 2.2 AC-26 — the criterion with no automated substitute

| Field | Value |
|---|---|
| **Criterion** | The operator opens the plugin on a device and confirms the list view changed |
| **Threshold** | confirmed |
| **Negative control** | — none, and that is the point |
| **Why it fails today** | This is the evidence release 1.3.1 lacked. Every gate was green and the operator reported nothing had changed |

**The question is narrowed on purpose.** "The screen changed" is satisfied by any visible difference,
which makes it a weak question at exactly the moment the packet needs a strong one. The device check
therefore also asks about the **two affordances that carried zero CSS rules** when this packet
started — the per-group create button and the row checkbox — and whether both are visible and usable.

Those two are the operator's original complaint made measurable. A packet that changed the screen
without making them visible has changed the wrong thing.

**Nothing substitutes for this.** Not the capture manifest, which never opens an image. Not the
placement harness, which measures what it was told to measure. Not a green bench. Not a full recapture
with a reviewer's signature — that is a stronger gate than the manifest and still not a device.

### 2.3 Re-run, not assumed

`AC-31` and `AC-32` were armed in 000 and closed in 001. They run again here, against the **final**
tree. Four phases of edits sit between the conversion and the close of the packet, and a guard that
survived the conversion can still be converted afterwards by a sweep that had no reason to know
better.

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This packet closes when every criterion in the register has a recorded failing measurement, a
recorded passing measurement, and a negative control that moved — **and** when `AC-26` is confirmed
by a person.

`AC-26` is not the last item on a list. It is the item the rest of the list exists to make
trustworthy. If the operator opens the plugin and the screen looks unchanged, the packet does not
close, and the finding is routed back to the phase whose criteria passed while its subject stayed
invisible.

<!-- /ANCHOR:closure -->

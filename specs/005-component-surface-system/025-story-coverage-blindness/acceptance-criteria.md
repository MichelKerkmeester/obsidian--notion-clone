---
title: "Acceptance Criteria: The Story Coverage Gate Runs a Different Script"
description: "Each requirement against the command that decided it, with the one control that answered a different question than it was asked."
trigger_phrases:
  - "025 acceptance criteria"
  - "story coverage criteria"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/025-story-coverage-blindness"
    last_updated_at: "2026-08-30T21:12:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Supply audit: 8 Met rows sound; all are repo-wiring, no device value enters"
    next_safe_action: "Operator opens the catalogue and confirms the surfaces it lists"
    blockers: []
    key_files:
      - "spec.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-025"
      parent_session_id: null
    completion_pct: 80
    open_questions: []
    answered_questions:
      - "13 modules carry a story and 18 a written exemption, covering all 31"
---
# Acceptance Criteria: The Story Coverage Gate Runs a Different Script

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Producer** | `tools/gate.mjs`, `tools/storybook/story-coverage.mjs`, `package.json` |
| **Read at** | 16 gate lanes green, exit 0 |
| **Nature** | A label defect, not an arithmetic one — the check that was named ran nowhere |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Each row is a command whose output and exit status were read, not a claim about the tree.

| # | REQ | Measurement | Threshold | Before | After | State |
|---|---|---|---|---|---|---|
| AC-1 | REQ-001 | A gate lane runs the story-coverage script | present | **absent** — the lane by that name ran the shim check | present, and reads its exit code | Met |
| AC-2 | REQ-002 | A gate lane runs the shim-coverage script | present | present, misnamed | present, under a name that describes it | Met |
| AC-3 | REQ-003 | Two package scripts whose names could be read as each other | 0 | 2 | 0 — the ambiguous name no longer exists | Met |
| AC-4 | REQ-004 | The checkbox module is answered by a story or an argued exemption | answered | neither | a story, and no allowlist entry | Met |
| AC-5 | REQ-005 | The matcher decides on capability rather than on the exported name | capability | name tested first, short-circuiting | name captured and discarded; parameters decide | Met |
| AC-6 | REQ-006 | Modules with neither a story nor a written exemption | 0 | **13** | **0** — 13 with stories, 18 exempt, 31 total | Met |
| AC-7 | REQ-006 | Modules the matcher considers renderable | >= 31 | **18** | **31** | Met |
| AC-8 | REQ-008 | Config-returning functions in the renderable set | 0 | n/a | 0 — no view-config module among the 31 | Met |
| AC-9 | REQ-007 | The widened matcher demonstrated failing on **the tree as received** | names the thirteen | n/a — the control | **Substituted.** See below | Open |
| AC-10 | — | The operator opens the catalogue and recognises the surfaces in it | confirmed | not requested | not requested | Open |

### AC-9: the control that ran answered a different question

Restoring the name test to the live matcher, on today's tree, drops it from 31 modules to 18 and
names exactly 13. That demonstrates the widening and it is the run recorded elsewhere in this folder.

The requirement asks for something narrower: the same demonstration **on the tree as received**.
Executed literally — shipped matcher, the allowlist as it then stood, the module directory at the
commit before this phase opened — it reports **fourteen**. The extra is the checkbox module, which
the narrow matcher could already see and which AC-4 owns.

Both numbers are true about different sets, and neither is wrong. What is wrong is discharging a
requirement with a control it did not ask for and not saying so, which is why this row is Open
rather than Met with a footnote.

### What the thirteen turned out to be

Four of them are the modules the sheet and placement work runs through. The naming convention was
deciding which of this plugin's most-edited surfaces the catalogue could see, on a rule with no
relationship to whether a module draws anything.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

Eight criteria Met, each against a command. Two Open: one control that substituted for the one its
requirement names, and the operator.

**This phase does not close.** Per the packet's third decision, shipped, verified and
operator-confirmed are three states, and only the third closes anything.
<!-- /ANCHOR:closure -->

---

## 4. HARNESS-SUPPLY CLASSIFICATION

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* **All eight Met rows are sound, and none is withdrawn.**

Nothing here measures a rendered surface. AC-1 to AC-3 are about which script a gate lane invokes and
whether two package scripts can be mistaken for each other. AC-5 to AC-8 are about what a source
matcher can see — whether it decides on a function's parameters or on its exported name. These are
properties of the repository's own wiring, and a device supplies no value any of them reads. The
inventory's five channels — a set variable, a pinned value, a stubbed action, hand-built host chrome,
an absent host stylesheet — have no path into a question of the form *does this lane run this file*.

That is also the limit of what this phase's greens mean, and it is worth stating in the same breath.
AC-6's `0` and AC-7's `31` say every renderable module is now answered by a story or an argued
exemption. They do not say the stories are faithful — a story renders what its author wrote, and
`026` §5 records that hand-written markup satisfies every DOM-shaped check in this repository. This
phase makes the catalogue complete. Whether the catalogue resembles the product is AC-10's question,
and AC-10 is Open and belongs to the operator.

**AC-9 is the row to keep.** It was discharged by a control that answered a neighbouring question —
31 to 18 naming thirteen, on today's tree, where the requirement asked for the tree as received,
which reports fourteen. Both numbers are true of different sets. Recording that as `Open` rather than
as `Met` with a footnote is the same discipline this audit applies elsewhere, arrived at without it.

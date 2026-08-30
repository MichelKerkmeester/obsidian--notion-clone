---
title: "Verification Checklist: Phase 004 — Mobile and Live Verification"
description: "Phone targets, focus rings, the two deferred guards, the tripwire re-run, and the operator's device confirmation."
trigger_phrases:
  - "006 phase 004 checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Phase 004 — Mobile and Live Verification

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`.

Cells reading *census* take their number from phase 000.

**One row in this file cannot be closed by any command.** `AC-26` is a person opening the plugin.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] The `styles.css` lane is **free**. This phase does not take it
- [ ] Phases 001, 002 and 003 have landed and their checklists are closed
- [ ] Census cells for `AC-24` and `AC-25` are filled
- [ ] The operator is available for the device check. `AC-26` has no substitute and no workaround

<!-- /ANCHOR:pre-impl -->
---

## Criteria

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| AC-24 | Touch target box of the group toggle and the row checkbox at phone width | *census* | at least 44 by 44 CSS px | [ ] |
| AC-25 | Focus ring visible, `box-shadow` not bare `outline: none` | *census* | visible on every element the packet introduced | [ ] |
| AC-26 | **The operator confirms on device that the list view changed** | not confirmed | confirmed, **naming the per-group create button and the row checkbox** | [ ] |

### Deferred guards

- [ ] The external-row-patch fast path extends to the list, in its **own commit**
- [ ] **Both-or-neither, explicitly tested:** two groups, one collapsed, an external row change. The
      patch applies to both or refuses. **It must not apply to one**
- [ ] Q-P4-01 answered and recorded — whether the optimistic update extends to the list's title cell
      now that the cell is the grid's title cell

### Tripwires, re-run against the final tree

- [ ] **AC-31** passes on the final tree
- [ ] **AC-32** passes on the final tree
- [ ] Neither tripwire was modified anywhere in the packet after 000 armed it

### Negative controls

- [ ] Shrink the viewport further — AC-24's box holds
- [ ] Remove the focus ring — AC-25 fails
- [ ] `AC-26` has none, deliberately

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] `npx tsc --noEmit` exit 0, output read without a pipe
- [ ] `npm run lint` at or below the existing baseline
- [ ] `styles.css` unchanged by this phase
- [ ] The two guard changes are separate commits, each revertible without the other
- [ ] No code comment carries a spec path, packet number, phase number, task id, ADR id or
      requirement id
- [ ] No slot, affordance or row-grammar column reserved for subtasks

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] `npx vitest run` exit 0, test count not reduced
- [ ] `npm run bench` — `NFR-01` still within 20 percent at the end of the packet
- [ ] `npm run screenshots:verify` exit 0, after the final review pass
- [ ] The patch path's edge case is covered: the collapsed-group refusal

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] Every phone number in this phase carries its own justification, and **none cites a capture**
- [ ] Any conflict between a phone choice and the reference's desktop shape is **recorded**, not
      resolved by assumption
- [ ] Any defect found outside this phase's scope recorded in the parent and **not** fixed here

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] Q-P4-01's answer recorded in this folder with its reason
- [ ] The operator's own words recorded for `AC-26`, not a paraphrase
- [ ] Any deferral to a follow-on packet recorded with its reason

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Question | Answer |
|---|---|
| Do both touch targets meet 44px at phone width? | must be **yes** |
| Is sorting reachable at phone width? | must be **yes** |
| Does the patch path ever apply to one of two groups? | must be **no** |
| Do both tripwires still pass on the final tree? | must be **yes** |
| **Did the operator open the plugin and confirm the screen changed?** | must be **yes**. The packet does not close otherwise |
| Did the operator find the create button and the row checkbox? | must be **yes**. They are the original complaint made measurable |

<!-- /ANCHOR:summary -->

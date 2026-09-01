---
title: "Implementation Plan: Select Column Affordance Fit"
description: "How the select column's two controls were given room, what remains to be re-measured, and the lane constraint that shapes both."
trigger_phrases:
  - "018 plan"
  - "select column plan"
importance_tier: "normal"
contextType: "planning"
---
# Implementation Plan: Select Column Affordance Fit

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

The implementation has already landed, under another phase's stylesheet lane hold. This plan
therefore has two halves: what was done, recorded from the lane journal so it stops being invisible;
and what was never done, which is every verification step.

The remaining work is measurement, not editing. Nothing here needs the stylesheet lane.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Bar |
|---|---|---|
| Placement harness | `npm run storybook:placement` | The overlap check present and green on both surfaces |
| Negative control | Revert each of the two edits in turn, re-run | The check goes red each time, and returns green on restore |
| Phase gate | `SURFACE_PHASE=018 npm run gate` | Exit 0 |
| Unit | `npx vitest run` | Exit 0, no reduction in count |

The unit suite runs `environment: "node"` with no jsdom. It is a regression guard here and evidence
for nothing — `../spec.md` §6.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

One idea: a column's width is a function of what it contains, and must be recomputed when its
contents change size.

The defect was not that 48px was the wrong number. It was that 48px was a *derived* number whose
derivation was written in a comment rather than expressed anywhere a change could disturb. When the
controls grew to clear a touch floor, the sum went stale silently.

The second fault is the same shape at the cascade level: a block whose responsibility was minimum
size also carried `display`, so it decided a question that belonged to the phone predicate. Removing
`display` from that block returns the decision to the rule that owns it.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. **Landed, under `004-checkbox-ownership`'s lane hold.** `display` removed from the touch-floor
   block; column re-derived to 64px in the touch branch; phone pin 6px to 4px; phone button declared
   at 28px.
2. **Outstanding — reproduce.** Re-run the placement harness and record the two after-numbers in
   `acceptance-criteria.md` against the recorded ones.
3. **Outstanding — negative controls.** Revert each edit in turn and observe the check red.
4. **Outstanding — operator confirmation.** The program's closing condition.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The check already exists in the shared harness, added by the lane holder rather than by this phase.
That provenance matters: a check nobody in this phase has seen fail is a check this phase cannot yet
cite. Step 3 above is what converts it into evidence.

No fixture is acceptable here. The select column's markup is produced by the table renderer, and
this program has twice spent hours on defects that existed only in hand-written fixture markup.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | State |
|---|---|
| `styles.css` lane | Held by `004-checkbox-ownership`. This phase must not take it. |
| `tools/storybook/verify-placement.mjs` | Shared, and moving during this session. Re-read before citing a line number. |
| Recapture | Owed. The lane's outstanding list carries the debt; it is not this phase's to discharge alone. |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Restore the `display: inline-flex` declaration to the touch-floor block and the select column to
48px. Both are single declarations in `styles.css`. Rolling back reinstates a −14px overlap on the
phone and an unstyled control on the desktop, so it is a rollback of last resort.
<!-- /ANCHOR:rollback -->

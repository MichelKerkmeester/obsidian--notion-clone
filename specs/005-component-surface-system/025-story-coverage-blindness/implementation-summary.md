---
title: "Implementation Summary: The Story Coverage Gate Runs a Different Script"
description: "What the coverage lane became, the numbers behind each requirement, and the one control that substituted for another."
trigger_phrases:
  - "025 implementation summary"
  - "story coverage shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/025-story-coverage-blindness"
    last_updated_at: "2026-08-30T21:10:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "8 requirements verified; matcher 31 vs 18; control substitution recorded"
    next_safe_action: "Operator opens the catalogue and confirms the surfaces it lists"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-025"
      parent_session_id: null
    completion_pct: 80
    open_questions: []
    answered_questions:
      - "The matcher is capability-based; the exported name is captured and discarded"
---
# Implementation Summary: The Story Coverage Gate Runs a Different Script

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **State** | Shipped and verified. Not operator-confirmed, so not closed |
| **Surface** | The gate's coverage lanes, and the matcher behind one of them |
| **Evidence** | Eight requirements, each with a command whose output and exit status were read |
| **Written** | After the fact. This phase's documents lagged the tree that satisfied them |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 2. WHAT WAS BUILT

Three changes, one of them only a rename and the most important of the three.

**The lanes were separated.** The gate now carries `shim-coverage` running the shim check and
`story-coverage` running the story check. Previously one lane bore the story name and ran the shim,
so the story check ran nowhere. The ambiguous package script was renamed in the same pass, and the
old name no longer exists — two scripts whose names could be read as each other is the condition
that produced the defect.

**The matcher stopped reading names.** It asks whether an exported function takes an `HTMLElement`,
or an options object carrying `parent`. The exported name is still captured by the pattern and then
deliberately discarded. Before, a name test ran first, so a module building DOM under any other verb
was never asked the question that mattered.

**Everything the widening revealed was answered.** Thirteen modules carry a story, eighteen carry a
written exemption naming what makes a story impossible or useless — vault resolution, a host
renderer with no standalone build, a config shape larger than the component. The checkbox module got
a story rather than an exemption, which was the argued choice.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 3. HOW IT WAS DELIVERED

Through the gate's own lane list and one package script rename, plus a matcher edit of a few lines.
No product code changed. The entire user-visible effect of this phase is that a check which had
never run now runs.

The exemptions were written rather than generated. That is the point of them: a generated list
records that a module was skipped, and a written one records why nobody could write the story.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## 4. DECISIONS

| Decision | Why |
|---|---|
| Rename the lane rather than repoint it | Both checks are wanted. The defect was one name covering two jobs, so the fix is two names, not one lane doing more |
| Select on capability, not on a name | The name test ran first and short-circuited the question that mattered. A convention is not a contract |
| Give the checkbox module a story | It is the control at the centre of another phase's argument. Exempting the one module whose appearance a sibling phase is measuring would have hollowed out both |
| Keep config-returning functions out | A name-only rule once demanded a story for a function with no DOM, which pushed people toward writing a fake one. Capability selection excludes it for the right reason |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## 5. VERIFICATION

| Requirement | Command | Result |
|---|---|---|
| Story lane runs the story script | read `tools/gate.mjs` | lane present, runs `story-coverage.mjs` |
| Shim lane runs the shim script | read `tools/gate.mjs` | lane present, runs `verify-coverage.mjs` |
| The two script names disambiguated | read `package.json` | `story:coverage` and `shim:coverage`; the old name absent |
| Checkbox module answered | `ls src/views/checkbox.stories.ts` | present, and not in the allowlist |
| Matcher selects on capability | read the matcher | name captured, discarded; params decide |
| Nothing blind remains | `node tools/storybook/story-coverage.mjs` | exit 0 — 13 with stories, 18 exempt, 31 total |
| Config functions stay out | enumerate the renderable set | no view-config module among the 31 |
| Whole gate green | `npm run gate`, `$?` read directly | 16 green, exit 0 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 6. LIMITATIONS

**The substitute control has been replaced by the one its requirement names.** The requirement says
the widened matcher must report *the thirteen* blind modules against the tree **as received**. That
run has now been made: the tree was reconstructed with `git archive` from the commit before this
phase opened, and both matchers were run against it. The narrow matcher names **1** missing module,
`checkbox`. The widened matcher names **14**. The thirteen it adds are this phase's thirteen exactly.

So the two numbers reconcile rather than disagree — fourteen is a total, thirteen is the yield, and
`checkbox` is the module both matchers see and another requirement owns. What remains worth stating
is the order it happened in: the substitute ran first and was recorded as evidence for a requirement
it did not discharge, which is the same drift this phase exists to catch, one level up.

**Nothing here has been seen by a person.** Eight commands agreeing is not somebody opening the
catalogue and recognising the surfaces in it.
<!-- /ANCHOR:limitations -->

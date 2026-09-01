---
title: "Goal: Harness Fidelity Repair"
description: "The durable directive for the instrument repairs, and the criteria that decide when it is done."
trigger_phrases:
  - "020 goal"
  - "harness fidelity goal"
  - "instrument repair directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/020-harness-fidelity-repair"
    last_updated_at: "2026-09-01T18:40:00Z"
    last_updated_by: "option-tone-divergence"
    recent_action: "Group-title and card-cover fixture divergences closed; lane 25 derives coverage from src"
    next_safe_action: "Add a placement check that never sets --keyboard-height, so the fallback can fail"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 92
    open_questions: []
    answered_questions:
      - "Is the 44px floor this phase's invention - no, it is WCAG 2.5.5 and already in the stylesheet"
      - "Does the record sheet's accepted 32px transfer to the other sheets - no, its constraint is absent there"
---
# Goal: Harness Fidelity Repair

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Repair the instruments that certified the defects they existed to catch, and change
only the stylesheet rule a corrected instrument condemned.

**Why.** Six of seven verifier findings were checks reporting a number nobody could have reached by
measuring the thing they named. Each was green, and green was the symptom.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Instrument first, product second. A stylesheet edit follows a repaired measurement. |
| D2 | A repair closes on a negative control, not on a green result. Every instrument here was already green. |
| D3 | Raise the band, do not lower the threshold. 44px is WCAG 2.5.5 and already the stylesheet's own value. |
| D4 | Discover evidence artefacts by content. A registry falls behind the thing it registers. |
| D5 | Declare a revealed product defect in `KNOWN` rather than fix it here; a silent repair then reports as an unexpected pass. |
| D6 | The record sheet's accepted 32px does not transfer; its 33px of chrome is absent elsewhere. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its third decision governs closure here:
shipped, verified and operator-confirmed are three states, and only the third closes anything.

Two measured defects this phase did not fix are not criteria here: the selection bar clipping its
own content is `022`'s, the `create|render` filter is `025`'s.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Add-view grab band >= 44px: **42px true, 45px reported** -> **48px**.
- [x] Owned-menu grab band >= 44px: **38px true, no check existed** -> **44px**.
- [x] Record sheet band >= 30px, unchanged at **32px** and pinned so a change fails.
- [x] The band steals no row or control, both ends, both sheets: unasserted -> **0**.
- [x] Evidence artefacts describe this tree, discovered by content and gated as a lane: **1 of 8** ->
      **8 of 8**; lanes **13 -> 14**.
- [x] `checkbox-appearance.json` equals a re-run on the same tree: **171/51** -> **211/56**.
- [x] Blank and theme-identical captures rejected: **4 blanks, 2 identical pairs** -> **0 of 224**, 0
      false positives.
- [x] Checkbox families visible to the coverage collector: **10 of 12** -> **12 of 12**.
- [x] The role check fails a swapped-role fixture: **passed 3/3** -> fails, naming source and role.
- [x] camelCase keys reaching `setCssProps`: **23 across 6 files** -> **0**.
- [x] Orphaned probe checks in the shared harness: **0 of 63** -> **63**; placement **114 -> 177**.
- [x] Every product defect these instruments revealed is fixed or recorded with its number and
      owner: **0 dropped**.
- [x] A fixture cannot paint two distinct option values as one chip, or an option-typed group title
      as bare text: **5 files flattening 3 columns, 4 helpers writing bare text** -> **0**, guarded as
      gate lane 25 with every rule observed red. The rule's coverage is read off `renderGroupLabel`'s
      own call sites, not listed: **3 of 5 title classes watched** -> **5 of 5**.
- [x] The card cover is photographed by something. Fixtures reaching any of its four classes **was
      0**, and the only one the corpus named was the other view's, inside no wrapper, so it matched
      no rule and painted nothing -> **4 of 4**, in `card-cover-states` and the gallery view. The
      pre-fix count is checkable in `HEAD~`: one occurrence of `db-board-card-cover-placeholder`,
      inside `db-gallery-card`, and no occurrence of the other three.
- [ ] The operator signs off the two new modal fixtures, per image.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

**The criterion that carries the phase is the first one.** The add-view sheet reported 45px against
its own 44px floor and passed. Corrected, it read 42px and went red *before any stylesheet edit*. Had
the ordering been reversed, the stylesheet change would have rested on a number wrong by 3px.

**Two shortfalls are decisions, not unmet criteria**, and neither appears above. The record sheet's
band stays at 32px against a 48px ask — accepted, with the constraint measured: 33px of chrome above
its header leaves a taller band nowhere to go. The table's main-item cell stays at 169x34 against
WCAG 2.5.5 AAA's 44px — declined on density grounds, because raising it would override the reader's
own density setting. The AA 24px floor is met, and `verify-placement` reports the 33px reach on every
run so the number stays visible rather than closed by silence.

**Verification at ship**, exit codes read without a pipe: `npm run gate` 14 green exit 0;
`npx vitest run` 444 passed; `npm run storybook:placement` 173/177 with 4 red for a declared reason,
exit 0; `npm run screenshots:verify` 224 entries; `evidence.mjs --check-all` 8 of 8. Five commits:
`9d4f569`, `0a38723`, `780a736`, `1e6397d`, `99214f5`.

**Why `completion_pct` is 80 and not 100.** It was 95 here against 100 in the other three documents,
which counted shipped-and-harness-verified; the parent's D3 does not let that close anything and the
fixture sign-off is outstanding. All four now read 80, for a reason found later and larger than the
sign-off: this phase is named for the harness's truthfulness and never audited the harness's own
largest supply. `verify-placement.mjs` sets `--keyboard-height` at `:819`, `:4724` and `:4753`,
nothing in `src/` publishes it, and two of those three sites are inside the 63 checks AC-011 counts
as a fidelity gain. No acceptance row is false as worded — `acceptance-criteria.md` §4 carries the
audit and withdraws nothing — but a phase that certified six instruments and left that channel
uncatalogued is not at 100.

**A discrepancy left alone.** `acceptance-criteria.md`'s own title and description say "Ten criteria"
while its table carries twelve rows, AC-001 to AC-012. The twelve are what this goal counts.
<!-- /ANCHOR:log -->

---
title: "Goal: Visual Pass Product Defects"
description: "Fix the product defects the 2026-09-02 visual pass read, each closed by a recapture a person reads."
trigger_phrases: ["035 goal", "visual pass defects goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T18:30:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "14 of 17 defects fixed and read on recaptures; P4 P6 P15 open"
    next_safe_action: "Take the operator call on P6 scroll-versus-wrap and P15 threshold"
    blockers: ["P6 contradicts the placement lane; P15 threshold met by no tag"]
    key_files: ["spec.md", "goal.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-goal"
      parent_session_id: null
    completion_pct: 78
    open_questions: ["Should the phone selection bar wrap or keep its scroll lane"]
    answered_questions: ["020 D5 forbids 020 from fixing what its own pass revealed"]
---
# Goal: Visual Pass Product Defects

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective: fix the product defects the 2026-09-02 visual pass read.** Seventeen of them, on real
surfaces, listed and measured in [`spec.md`](spec.md) §1. `020-harness-fidelity-repair` ran the pass
and its own D5 forbids it from repairing what the pass revealed — *"a silent repair then reports as
an unexpected pass"* — so the repair lives here, where it can be measured on its own terms.

### Decisions

| ID | Decision |
|----|----------|
| D1 | **A fix is verified by an in-runtime recapture a person reads, never by the implementing lane.** That lane's sandbox cannot reach Chrome, so any browser number it quotes is a claim about an instrument it does not hold. |
| D2 | **A defect found NOT to exist on disk is recorded as such, not fixed.** A repair aimed at a bug that was never there produces a diff nobody can explain and a report that reads as progress. Two rows already qualify — P12 and P16 — and they are recorded rather than reconciled. |
| D3 | **The stylesheet lane is acquired by the implementing dispatch and released only by the verifier, after reading the captures.** Release is what asserts the captures are current; the runtime that cannot see them cannot make that assertion. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

One row per defect, plus the operator's own. None is ticked, and none may be ticked by the runtime
that wrote the fix.

- [x] **P1** — the invalid-events span cell parses and paints. **Was: the `grid-area` declaration dropped entirely, reading back `""`, and the cell measured 28x24 inside the 28px select gutter. Now: `grid-area: event-span` parses and the cell measures 302x28.** The pass's number needs a correction: the RULE's `cssText` was never empty — `justify-self` and `align-self` survived beside the dropped declaration — and the cell was 28px, not 0px.
- [x] **P2** — the board drop-target background resolves to a real colour from a defined token. **Today: 0 definitions of `--background-interactive-hover` anywhere in the tree. Now: `--db-hover-bg`, declared at `styles.css:100`, the same token the surrounding hover rule uses.** Read from the token table, not from a capture: no fixture renders `is-drop-target`.
- [x] **P3** — the invalid-events controls reach the 28px floor. **Was: 9 of the 12 measured under it — `db-invalid-event-row-fix` at 32x24 and the datetime inputs at 250x19. Now: 0 under.** The baseline falls **228 → 215**, measured twice before it was written; the packet predicted 216 and 215 is what the tree reads.
- [ ] **P4** — the affordance moved and the reported mechanism did not survive measurement. The "+" is now a corner control: `position: relative` in a 46px flex heading became `position: absolute` top-right, so the day number no longer shares a row with a 28px button. **But the titles are unchanged — 6 of 12 month segments truncated before and 6 after.** They are not in the day cell at all; they are grid segments spanning the week, and at 402px a column is 48px wide while "09:00 iCloud" needs 48px of text in 41px of box. The "+" never took their width, so this row stays open rather than being ticked on a change that did not do what the row asks.
- [x] **P5** — the hidden-count badge is sized to its content, inside its button, at ≥4.5:1. **Was 55px of "2 hidden" positioned absolutely at `right: -5px`, overhanging its own 28px button by 5px right and 22px left, text at 4.09:1. Now: static, 61px, inside a button that grew to 96px — inset 6px right and 29px left — at 8.36:1.**
- [ ] **P6** — **the mechanism is named and the fix is the operator's call.** The bar's box is capped at `calc(100vw - 32px)` = 370px while its content runs 416px; no label is truncated — "Copy CSV" measures clientWidth 71 against scrollWidth 71 — it simply sits 55px outside the scroll port, and a capture cannot scroll. So the clip is the scroll container doing its job. A wrapping bar was built and measured green — all five children inside, none truncated, the bar 102px tall — and then **reverted**: `tools/storybook/verify-placement.mjs:903` pins the opposite behaviour, requiring `scrollWidth > clientWidth`, `overflow-x: auto` and `scrollbar-width: thin`, and it went red. Two shipped decisions contradict; this one is not 035's to overturn.
- [x] **P7** — a list date field renders in full when the row has room, capped; the sparse case unchanged. **Was 2 of 48 field values clipped, "February 14, 2027" among them. Now: 0.** The declared width became `min-width` rather than being dropped: dropping it collapsed the sparse fixture's four declared columns from **110/190/150/130 to 73/141/97/75**, and that capture is byte-identical to its committed self again.
- [x] **P8** — registered and unregistered select rows share a leading edge. **Was: the hidden handle at `display: none` and 0px wide, putting the unregistered row's dot at x=33 against x=51 for its three siblings. Now: `visibility: hidden` at 8px wide, all four dots at x=51.** The offset was 18px, not the ~35px the pass reported.
- [x] **P9** — the compact relation treatment exists and is visible. **Was 0 rules matching `.db-relation-values.is-compact`. Now: 3**, and the compact row photographs visibly tighter than the two above it. The rule was written rather than the class removed, because the renderer sets it deliberately per row.
- [x] **P10** — all four range inputs carry the host slider treatment, every colour transcribed. **Was 0 of 4; both rules declared `flex` and `min-width` only. Now: 4 of 4** — three in the calendar options, one in the timeline options. The 4px line is painted on the track pseudo-element, not on the input: on the input it left a **353x4** control in the touch census, thinner than anything the plugin ships.
- [x] **P11** — every icon-picker header control is inside the popover at narrow width. **Was 2 outside it — shuffle ending at x=347 and the gear at x=391, against a popover edge at x=336 — and the search compressed to 96px. Now: 0 outside**, the header wrapping from 37px to 82px with the search on its own full-width row.
- [x] **P12** — resolved as substance: **the report is withdrawn. Today: the guard the report says is missing is present.** `src/views/cell-renderer.ts:1332` applies the same `isFileTags || isTransient` guard `:1271` gives the drag handle, and no recapture shows arrows on a transient row. Nothing was changed, per D2.
- [x] **P13** — the footer date aggregate reads in the column's own format, pinned by a test. **Was: `"2026-03-01"` under a column printing "March 1, 2026".** The test was watched red against the old body — `expected '2026-03-01' to be 'March 1, 2026'` — before it was watched green.
- [x] **P14** — the two acting chart rows carry the sibling label tone and values measure ≥4.5:1. **Was 6.0:1 on the labels — `--text-muted`, rgb(154,155,158) — against siblings at rgb(220,221,222). Now: identical to the siblings at 12.26:1.** The tone came from the nested `.db-chart-options-export .db-chart-options-label` rule, which outranks the button; recolouring the button alone changed nothing visible. Values move **3.31 → 6.0**.
- [ ] **P15** — the tag carries the gray status tokens, and the 3:1 threshold is not met by any tag. **Was: no fill at all — 1.00:1 — and a 20%-currentColor edge at 1.71:1 in dark. Now: fill 1.55:1 and edge 2.64:1**, which is exactly where its registered siblings sit (design 1.37/2.27, personal 1.57/2.65). In light it moves 1.00 → 1.23 beside siblings at 1.22. So the tag is no longer the odd one out, and **no tag in the corpus reaches 3:1** — the threshold indicts the shared badge design rather than this one tag, which is a question for the operator and not a repair to make here.
- [x] **P16** — "+ Add sort" reads as a control; the shared-class blast radius is handled. **Was 6.0:1 at weight 400 on `--text-muted`, identical to the copy beside it. Now: `--text-normal` at weight 600, 12.26:1, while the copy stays muted 400.** The change moves `.db-panel-button`, so three sibling surfaces were recaptured and read: the filter conditions, the nested filter group, and the column manager — one more than §2 predicted.
- [x] **P17** — one red lane produces one failure, and folder-docs still fails a real undocumented folder. **Was 1 red lane producing 2 failures: `scan-folder-docs` exited 1 with `tools/lane/gate-logs — missing-readme` the moment a red lane created the directory. Now: exit 0**, the gate writing a README beside the log. Both controls were watched: a deliberately reddened `comments` lane produced its log directory with folder-docs green, and a genuinely undocumented source folder still fails.
- [ ] **The operator confirms the recaptures on device.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Fourteen of the seventeen are fixed and read on a recapture; three stay open.** The implementing
lane was an external `codex` run on `gpt-5.6-luna`, which could not open a browser and said so. This
runtime recaptured all 240 screenshots, read the 63 that moved in dark and light, and measured every
row in Chrome. Four of that lane's claims did not survive the measurement and were corrected here:

- **P7** fixed the truncation by deleting the declared width outright, which collapsed the sparse
  fixture's four columns from 110/190/150/130 to 73/141/97/75. The declared value is now a floor.
- **P14** recoloured `.db-chart-options-export`, which the nested label rule outranks, so nothing a
  person can see changed. The tone lives on the label.
- **P10** painted the 4px track line on the input itself, leaving a 353x4 control in the touch
  census. The line belongs on the track pseudo-element.
- **P15** pinned the badge border to the foreground token, which gave that one tag a 10.31:1 outline
  in the light theme against siblings at 1.22:1.

**On the three that stay open.** P4's reported mechanism is false: the always-on "+" does not take
the titles' width, because the titles are week-grid segments and not day-cell children — 6 of 12
truncate before the change and 6 after, from a 48px column at 402px. P6 is a genuine contradiction
rather than an unfinished fix, and it is recorded above. P15's fix landed and the threshold it was
given is met by no tag in the corpus.

**On the completion figure.** 14 of 18, derived from the checklist above per `roadmap.md` §3.2.

<!-- /ANCHOR:log -->

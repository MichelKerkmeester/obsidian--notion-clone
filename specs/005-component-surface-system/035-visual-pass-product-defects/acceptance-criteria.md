---
title: "Acceptance Criteria: Visual Pass Product Defects"
description: "What must be observed for each defect, with the number it reads today."
trigger_phrases: ["035 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T23:55:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "23 of 24 criteria met; AC-8 closed on a wrapped bar, AC-5 open"
    next_safe_action: "Take the operator call on P4 needing a wider month column"
    blockers: ["P4 truncates 4 of 11 titles from a 48px column at 402px"]
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-ac"
      parent_session_id: null
    completion_pct: 89
    open_questions: ["Does a 48px phone column earn a wider month cell (AC-5)"]
    answered_questions: ["A criterion without a failing number is a wish, not a criterion"]
---
# Acceptance Criteria: Visual Pass Product Defects

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks. Where the "today"
cell reads a value the pass measured in a browser this runtime cannot open, it says so, and the
implementing lane re-observes it before trusting it.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | CSSOM `cssText` of the `.db-invalid-event-span-cell` rule | non-empty | **MET, with the number corrected.** The RULE's `cssText` was never empty — `place-self` survived — but the `grid-area` declaration dropped and read back `""`. Parsed in Chrome before and after: `""` → `event-span` |
| AC-2 | Rendered width of the span cell at narrow width | > 0px | **MET.** Was 28x24, inside the 28px select gutter rather than the 0px the pass reported; now 302x28 |
| AC-3 | Board drop-target background resolves | a defined token | **MET.** `--background-interactive-hover` → `--db-hover-bg`, declared at `styles.css:100`. No fixture renders the state, so this is read from the token table, not a capture |
| AC-4 | Invalid-events controls under the 28px coarse floor | 0 | **MET.** Was 9 of 12 measured — `db-invalid-event-row-fix` 32x24, datetime inputs 250x19; now 0. Baseline 228 → 215, measured twice |
| AC-5 | Share of a phone day cell taken by the always-on "+" | title not truncated | **NOT MET, improved, and the premise is still false.** The "+" is an out-of-flow 28x28 corner control that hit-tests to itself and never took the titles' width. Truncated segments read 6 before and **4** after, from 11 titles at the 402px frame: the segment gave back its `margin-inline`, `gap` and `padding-inline`, so the box goes 44.28 → 48.28px and the title 33 → 37px. Four still want more than a 48px column gives — "Spotify family" needs 72px in 37px. A relaxed title `flex` was tried and measured **7**, and was reverted |
| AC-6 | Hidden-count badge overhang past its button | 0px | **MET.** Was 5px right and 22px left of a 28px button; now inset 6px right and 29px left of a 96px one |
| AC-7 | Hidden-count badge text contrast | ≥ 4.5:1 | **MET.** 4.09:1 → 8.36:1 |
| AC-8 | Selection-bar actions rendered in full at 402px | 3 of 3 | **MET.** Was 2 of 3 whole on the capture — 416px of content in a 370px box left "Copy CSV" 55px outside the port, clipped to "Cop". Now the bar wraps: 3 of 3 read whole in dark and light, the content box 46px → 96px, actions at maxActionRight 341px inside clientRight 373px. The check that blocked it was retargeted at `tools/storybook/verify-placement.mjs:907` and observed red at 567px before the fix |
| AC-9 | The named mechanism for AC-8 | one, stated | **MET, and acted on.** The box was capped at `calc(100vw - 32px)` = 370px against 416px of content. Nothing truncates — "Copy CSV" reads clientWidth 71 against scrollWidth 71 — it sits 55px outside the scroll port, and a capture cannot scroll |
| AC-10 | List date field rendering its value in full when the row has room | full | **MET.** 2 of 48 field values clipped → 0. The sparse capture is byte-identical, so its 110/190/150/130 columns did not move |
| AC-11 | Leading-edge offset between registered and unregistered select rows | 0px | **MET.** Was 18px — x=33 against x=51, not the ~35px reported; now 0 |
| AC-12 | Rules matching `.db-relation-values.is-compact` | 1, or the class removed | **MET.** 0 → 3, and the compact row photographs tighter than the two above it |
| AC-13 | Range inputs carrying the host slider treatment | 4 of 4 | **MET.** 0 of 4 → 4 of 4, every colour a host token. The 4px line sits on the track pseudo-element; on the input it left a 353x4 control in the touch census |
| AC-14 | Icon-picker header controls fully inside the popover at narrow width | all | **MET.** 2 fell outside — x=347 and x=391 against an edge at x=336 — and 0 do. Header 37px → 82px |
| AC-15 | Reorder arrows visible on a transient row | 0, **or the report withdrawn** | **MET by withdrawal.** Not reproduced on disk or in any recapture; `cell-renderer.ts:1332` carries the guard. Nothing changed |
| AC-16 | Footer EARLIEST/LATEST output format | the column's own | **MET.** The test was watched red against the old body — `expected '2026-03-01' to be 'March 1, 2026'` — then green |
| AC-17 | Chart-popover acting rows using the sibling label tone | 2 of 2 | **MET.** 0 of 2 → 2 of 2, rgb(154,155,158) → rgb(220,221,222), identical to the sibling. The tone was on the nested label rule, not the button |
| AC-18 | Chart-popover current-value contrast | ≥ 4.5:1 | **MET.** 3.31:1 → 6.0:1 |
| AC-19 | Uncoloured tag edge or fill contrast | ≥ 3:1 | **MET, on the edge.** saas had no painted edge at all in light — `border-color` computed `rgba(0, 0, 0, 0)` — and a 20%-alpha currentColor edge in dark at 1.71:1. It now carries `--db-control-border-strong`: rgb(130, 135, 142) at **3.62:1** light and rgb(124, 130, 136) at **4.29:1** dark against `--background-primary`, computed from relative luminance and read back as the painted `border-color`. The fill is untouched at its siblings' 1.2-1.6:1, and that no *fill* in the corpus reaches 3:1 stays the operator's question |
| AC-20 | "+ Add sort" distinguishable from the copy beside it | yes | **MET.** Button muted/400 at 6.0:1 → normal/600 at 12.26:1 while the copy stays muted/400 |
| AC-21 | Failures produced by one deliberately reddened lane | 1 | **MET.** A reddened `comments` lane produced its log directory and folder-docs stayed green: one RED, not two |
| AC-22 | folder-docs still fails a genuinely undocumented source folder | fails | **MET, control observed.** `tools/zz-control/thing.mjs` with no README → exit 1, `tools/zz-control — missing-readme`. Removed after |
| AC-23 | Changed captures read by a person, not merely regenerated | all | **MET.** 240 recaptured, 63 moved, read in dark and light across seventeen surfaces |
| AC-24 | `npm run gate` | `gate: PASS`, exit 0 | **MET, re-run after the second round.** `gate: PASS — 25 green, 0 red for a declared reason`, `$?` read directly at 0. `evidence` went red first on eight artefacts stale against the new `styles.css` and was re-measured, never edited |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number is quoted with the command that produced it and the exit code read directly, never
through a pipe.

**One rule specific to this phase.** The runtime that writes the fix cannot open a browser, so it
may not fill any cell above that requires one. Those cells are filled by the in-runtime verifier
that recaptures and reads, per D1. A browser number quoted by the implementing lane is not a weak
result, it is a fabricated one.

**And one about the two rows that failed their disk read.** AC-15 and AC-20 record what is on disk,
not what the report asserted. Closing either by making the code match the report would be fixing a
bug that was never there.
<!-- /ANCHOR:evidence -->

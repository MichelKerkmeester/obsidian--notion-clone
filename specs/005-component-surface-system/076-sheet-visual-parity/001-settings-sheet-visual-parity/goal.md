---
title: "Goal: Settings Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "001-settings-sheet-visual-parity goal"
  - "001 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity"
    last_updated_at: "2026-09-11T05:38:00Z"
    last_updated_by: "300-frame-ruling-docs"
    recent_action: "Frame ruling (D7) retires the card target; judge #1 scored 11/16, remediation queued"
    next_safe_action: "Run tasks.md T015-T019 (frame-ruling remediation), then dispatch the image judge"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
      - "The shipped 5-card tree does not match the divider target; remediation (T015-T019) must land before re-judging (D7)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
      - "src/i18n.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-settings-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 50
    open_questions:
      - "Done versus the shared close glyph on all eleven sheets: ADR-I, now also informed by ClickUp's circular close (D9); Frame targets 1 until taken"
      - "No dark Notion reference at any rung: 123 candidates scanned, all light. OC-S2 settles it"
      - "Inter-group spacing: provisional divider padding, ~8-16pt, pending OC-S1 (D7 retires the inter-card gap framing)"
    answered_questions:
      - "constructed-view-config reaches ViewConfigPanelRenderer.render at harness:3475; no scenario work owed"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
      - "Sheets group with hairline dividers on the plain background, never a card container (D7, operator, 2026-09-11) — supersedes the inset-card reading this child shipped"
      - "View options has no destructive row: content ends after Duplicate view; tail ink is the home indicator"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Settings Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Settings sheet is a settings **form** — bordered boxes with prose under them — where the reference is a settings **list**: rows you tap, values on the right, and nothing to read. This phase takes it through the programme's six-step loop until a reviewer, opening our capture beside the reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

**The measured distance, today:** 1 card where the target is 5; 14 input/textarea constructions where the target is 0; 0 navigation rows where the target is ≥ 13; ≥ 3 bare icon-glyph buttons where the target is 0; a longest prose run of 147 characters where the target is 80; a section heading at 11px/700/uppercase where the target is 13px/400/sentence case; and a dark card measuring **16 RGB units darker than its own canvas**, which is the elevation the wrong way up.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate. The lane clauses in `spec.md` §13 are the floor beneath it and never close this sheet on their own |
| D2 | The target binds **every** production surface painting this grammar — `spec.md` §3 lists them — and every parity capture comes from a scenario mounting production |
| D3 | Every Notion capture here is 299×678. The reference is read **structurally**; every number is ours, or provisional with the operator capture that settles it named (`spec.md` §13.12). **No lane clause asserts a reference-derived number** |
| D4 | This phase runs in its programme order, alone, holding the css-lane triplet by itself |
| D5 | Only the operator's own device read closes the alignment judgement. **No agent ticks that row** |
| D7 | Sheets group with hairline dividers on the plain background, never a card container (operator, 2026-09-11) — retires this child's shipped card grouping; remediation in `tasks.md` |
| D9 | This sheet's target composes from Anytype, Notion and ClickUp, no single source outranking the others; the operator's own captures and words outrank all three |

### Operator copy

The operator holds the parent directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] DEFINE complete: every row of `spec.md` §13 has a target, all seven references resolve and were opened, and every number is ours or is one of the 17 provisionals in §13.12 with its settling capture named
- [x] Every production surface painting this grammar enumerated, and the scenario proven to mount production link by link (`plan.md` §3.2)
- [x] Every lane clause **L1-L9** RED-then-GREEN, both numbers recorded — `≥ 5` cards (RED 1 → GREEN 5), `0` bordered inputs (RED 14 constructions → GREEN 0), `≥ 13` navigation rows (RED 0 → GREEN 13 of 19), `0` bare glyph buttons (RED ≥ 3 → GREEN 0), `≤ 80`-char prose (RED 147 → GREEN 76 longest), card lighter than canvas in both themes (RED dark −16 → GREEN both directions positive), heading `none`/`normal`/`≤ 500` (RED `uppercase`/`0.04em`/`700` → GREEN 3 of 3), a chevron-less terminal card (RED none → GREEN 1 row, 0 decorated), and the empty-set guard (fires)
- [x] Phone light and dark captures current, both opened and looked at, and `sheet-rebuild.mjs` exit 0
- [ ] Frame-ruling remediation (D7): L1/L6/L8 rewritten RED→GREEN against the divider target, row label and leading-icon typography retuned, and Formula result storage converted to a navigation row opening a picker (`tasks.md` T015-T019)
- [ ] Image judge **≥ 14/16, no row at 0** — pass #1 scored **11/16** against the shipped 5-card tree, before D7; superseded by the remediation above rather than counted toward the two consecutive passes
- [ ] Image judge **≥ 14/16, no row at 0** — pass #2, on an unchanged tree, tree hash recorded on both
- [x] The `071` clauses this sheet carries re-run unchanged and green **in the same invocation**
- [ ] The operator re-reads the sheet on their own iPhone and reports it aligned — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — scaffolded

Opened as phase 1 of `076-sheet-visual-parity`. The references in `spec.md` §13 were selected this session and the gaps they cannot answer are recorded there rather than filled by inference.

### 2026-09-10 — DEFINE and PLAN

Seven references opened and measured. **One finding reshaped the plan and the vocabulary the other ten children inherit: Notion's grouping idiom follows its presentation.** Its full-screen View options list groups **full-bleed** — sampled `rgb(255,255,255)` at `x=0` and `x=298`, dividers spanning `x=0…298`, and a clean grey→white step at the corner probe with no rounding — while its **bottom sheets** (Data source actions, Layout) group into **inset rounded cards**, white span `x=12…286` on an `rgb(250,248,246)` canvas. Our surface is a bottom sheet, so the inset-card grouping `071/007` landed is **correct and stays**, and the work is inside the cards rather than on them.

Two reference reads were corrected against the scaffold rather than inherited. Notion's View options has **no destructive row** — the band from `y=578` to `y=647` is uniform canvas whose only ink is the home indicator, at scroll-top, so nothing is below a fold. And **no dark-theme Notion capture exists at any rung**: all three view-options files and all 120 `database/` files were scanned by mean luma, and the one sub-110 result is a light screen behind a modal scrim. Every dark target is therefore ours, and the rubric's *Both themes* row is judged on internal consistency.

**3 contradictions with landed rulings** are recorded in `spec.md` §13.13 as Proposed ADRs **I**, **J** and **K**, to be transcribed into `../../roadmap.md` §7.19 by T001. None is implemented here, and no `071` child is amended from this packet. ADR-I — the shared header's `✕` against the reference's `Done` — is why `plan.md` §3.5 targets *Frame* at **1** and predicts **15/16** rather than 16.

### 2026-09-11 — CREATE landed

T004-T011 landed: the five cards (Name / Current database / Current view / Display / a chevron-less
footer action), a `renderNavRow`/`renderActionRow` pair carrying icon + right-hung value + chevron,
the textarea path deleted rather than restyled, the ten over-80-character prose keys shortened in
English (zh/zh-TW were already under the floor), and two new small surfaces this sheet needed and
the plugin never had before: `folder-suggest-modal.ts` (no folder picker existed anywhere) and
`modals/settings-sub-sheet-modal.ts` (a generic `DbModal` drill-in, used by Source rules and New
record template). `node tools/live/sheet-grammar.mjs` exits 0 — L1-L9 all green, L3 at exactly 13/19
qualifying rows. `npm run gate` reads 28 green, css-lane released in the same commit. One drift from
`plan.md` §3.3: R09 (Computed sync) stayed inline rather than following R04/R06 into a sub-sheet,
because the render-assertion bundle's stubbed `Modal` throws on construction and the landed
placement-button-ink lane clause reads its buttons off the main sheet directly — recorded in
`verification.md`'s RED/GREEN register rather than silently built and left to crash the first click.
Next: the image judge, twice consecutively on this tree.

**17 provisional values** are registered in §13.12, each with the operator capture that settles it: **OC-S1** for the light geometry and type, **OC-S2** for the entire dark column. Under D3 **no lane clause asserts one of them** — L1-L9 assert structural counts, ours-measured values and one luminance direction.

### 2026-09-11 — Frame ruling and typography remediation queued (D7-D9)

The first image judge pass scored **11/16** against the shipped five-card tree. Before a second pass
ran, the operator, reading `0040-properties-card-container-rejected.png` and
`0040-settings-sheet-cards-typography.png`, ruled the card container out directly: *"Never use bg
container like here for values, notion / anytype use dividers on plain sheet bg thats better"*, and
separately named this sheet's own typography and control defects — the name row in its own card, the
Formula result storage control rendering as three stacked pill buttons with a helper paragraph, a
floating unlabelled refresh icon, and inconsistent label/value type sizes. Recorded as **D7** (frame:
dividers, not cards) and, alongside it, **D9** (reference composition: Anytype, Notion and ClickUp,
best-of-three per row) in `../decision-record.md`. `spec.md` §13 is rewritten to the divider target,
including the row label (17pt regular), row value (17pt secondary), leading icon (20-22pt at label
ink) and row height (44-48pt, provisional) targets from the operator's own notes, and Formula result
storage's correct label and its navigation-row-plus-picker target. `tasks.md` carries the remediation
as `### Frame-ruling remediation (2026-09-11)` (T015-T019): RED against the shipped tree, the
producer change, GREEN, recapture, and a fresh judge pass — which is the pass this child's "twice
consecutively" now counts from, not the 11/16 pass above. 0.0.40, cut after this child's CREATE
landed and before either judge pass reached the floor, is the release D8 now prevents recurring.
<!-- /ANCHOR:log -->

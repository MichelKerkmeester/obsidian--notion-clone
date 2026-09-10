---
title: "Goal: Sheet Family Alignment to Notion x Anytype"
description: "The durable directive this phase parent executes against and the criteria that decide when the whole packet is done."
trigger_phrases:
  - "packet goal"
  - "071 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment"
    last_updated_at: "2026-09-10T06:30:00Z"
    last_updated_by: "282-goal-refresh-0038"
    recent_action: "All seven audit children (008-014) landed; 007's card metrics stay provisional"
    next_safe_action: "Operator device reads (D3) across 007-014; 007's T001 capture"
    blockers:
      - "007's four card metrics stay provisional pending T001's operator capture"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "071-sheet-notion-anytype-alignment-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Family Alignment to Notion x Anytype

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every sheet, panel and popover the app can open is inventoried once (R7), then brought as close as possible to Notion x Anytype's own presentation, one sheet family per child phase, starting with the settings sheet (R5) and the add-property sheet (R6).

### Decisions

| ID | Decision |
|----|----------|
| D1 | No child phase after 001 may redesign a sheet without first citing 001's reference-mapping row for it |
| D2 | The settings sheet (002) and add-property sheet (003) are the first two rows, per the operator |
| D3 | Only the operator's own device recheck may close a device row; no agent ticks it |
| D4 | **No numeric threshold anywhere in this packet may be derived from a Notion iOS asset.** Every one of the 1,315 captures under `screenshots/notion/ios/` is 299x678 (`sips`-confirmed on a 400-file sample and on all 171 files in the five folders the sheet families lean on). The Notion column in every child's gap table is structural; every number is ours, an internal-consistency target, or `TBD` pending an operator capture. Established by `007` D2 for one sheet, generalised to all of them by `sheet-notion-audit.md` §0 |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 001-sheet-story-coverage-audit | `001-sheet-story-coverage-audit/goal.md` |
| 002-settings-sheet | `002-settings-sheet/goal.md` |
| 003-add-property-sheet | `003-add-property-sheet/goal.md` |
| 004-view-config-sheet | `004-view-config-sheet/goal.md` |
| 005-filter-sort-group-sheets | `005-filter-sort-group-sheets/goal.md` |
| 006-record-and-menu-sheets | `006-record-and-menu-sheets/goal.md` |
| 007-settings-sheet-strict-alignment | `007-settings-sheet-strict-alignment/goal.md` |
| 008-filter-sheet-row-model | `008-filter-sheet-row-model/goal.md` |
| 009-properties-sheet-row-model | `009-properties-sheet-row-model/goal.md` |
| 010-sheet-copy-touch-idiom | `010-sheet-copy-touch-idiom/goal.md` |
| 011-record-sheet-header-and-icons | `011-record-sheet-header-and-icons/goal.md` |
| 012-sort-and-group-sheet-rows | `012-sort-and-group-sheet-rows/goal.md` |
| 013-sheet-input-and-action-order | `013-sheet-input-and-action-order/goal.md` |
| 014-sheet-polish | `014-sheet-polish/goal.md` |

**Precedence.** Decisions above outrank child detail. Child detail outranks any
summary of it. Name a conflict rather than resolving it silently.

**Stop.** Only the criteria below decide done. An evaluator sees the objective
string, not these files.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] 001's inventory table exists and names every sheet-capable surface with its coverage and reference state — `001/inventory.md` holds 86 rows (54 primary + 32 stacked) with 0 blank cells, 68 rows carrying captures, 46 recording "none" references by name; the parent figure was 0/4 when the packet landed 2026-09-08 (`527e8455`), the packet's own 3/3 criteria are all ticked, its 9-test count suite and the 27/0 gate are green; the three redesign criteria stay open, so the parent's figure is 1/4
- [x] 002 (settings sheet) and 003 (add-property sheet) both redesigned, recaptured and matched against their mapped reference — 002 LANDED+verified post-rebase at `8b213929` (goal 2/3: its against-reference half rides D-005); 003 LANDED+verified 2026-09-09, landed as `6a828e7e` (goal 3/3: the reference match is the lane's printed numbers — the family has no committed PNG and the reference harvests carry no pixel measurements, D-005; pitch 44.0/44.0, 21 rows, sheet top 238.4px ≥ note-header bottom 44.0px at the 336px keyboard inset); each leg's device path read red with the fix's styles.css (or its rules) stashed before it read green (002's settings-row grammar, 003's pitch/padding/scroll), so the parent figure moves 1/4 → 2/4; each packet's own device read stays the operator's (D3, no agent ticks it)
- [x] 004, 005 and 006 (view-config, filter/sort/group, record/menu) each redesigned, recaptured and matched against their mapped reference — 004 LANDED+verified 2026-09-09, landed as `f72e50cd` on the 071/002/003-merged main (goal 3/3: the reference match is the lane's printed numbers — 13/13 direction, 6/6 plain-row pitches 48.0px inside the 44–52 band, 18/18 divider-owing rows, 16px insets, 0 native selects, the 5-part negative control red→green; the reference-mapping half rides D-005, the device read stays the operator's, D3; the merged-stylesheet overflow check measures 002's extent-minus-border, 389 == 389, after the border-subtle token's #333333 definition-site fallback made the sheet's own 1px left border resolve); 006 (record + menu) LANDED+verified 2026-09-09, replayed as `a10c11ac` onto the 066+0.0.34+004-merged main (goal 2/2: 21/21 record property rows 61.0px → 44.0px border-box, one shared 16px surface inset, 1/1 section headings 16.0px/1px behind a 1px border-subtle divider, 20/20 hairlines, 0 native selects, extent 401 ≤ 401; the menu-card half ships no stylesheet and re-proves the 061/067 rulings where the record family mounts its menus — 4/4 record pairs 44.0px; the reference-mapping half rides D-005, the device read stays the operator's, D3; gate 27/0); 005 (filter/sort/group) LANDED+verified 2026-09-09, the leg's single commit `9df04459` (two GLM runs + Sonnet) replayed onto the 004+006-merged main as `4c00bf798` (goal: the three toolbar sheets' rows on the Notion row grammar — filter 3/3 rows 48px, sort 2/2 rows 48px, group 17/17 rows 44px, every row inside the 44–52px window, one 16px inset, 0 native selects, extent 374 == 374 on both engines; the group popover's 370>366px WebKit overflow closed by hiding the family's desktop-style scrollbar (the §30 inline floors 140/140/120 already yield to min-width:0 on the sheet), and its never-firing `:first-of-type` heading-divider exception rewritten to sibling position (`X ~ X`); both halves proved red before green by the lane's own clauses — the overflow sweep 370>366 → 374 ≤ 374, the divider clause wired through the previously-unused `dividerOk` check; vitest 1747/1747, sheet-rebuild 0 (the `85ff504` freeze regression), placement 413/415 (2 declared), evidence 15/15 fresh, gate 27/0, validate RESULT: PASSED; the reference-mapping half rides D-005, the device read stays the operator's, D3)
- [x] No prior sheet fix (054, 058, 045, 067) regresses as a result of any redesign in this packet — each child's own regression-check row is `Met`: 002 reruns 054 T072's row-grammar/overflow checks (`AC-003`), 003's closure states the gate proves no prior sheet fix (054, 058, 045, 067) regressed, 004 reruns 058's title-field/format controls and 045's column-visibility controls (`AC-003`), 005 reruns the `85ff504` freeze-regression check (`AC-003`), 006's closure records every pre-existing record-family assertion staying green; this refresh's own from-scratch parent-level run on the merged tree (`97395196` + these six children) confirms it: `node tools/live/sheet-grammar.mjs` PASS exit 0 (every registered surface, both engines, all eight grammar columns, no sideways overflow), `npx vitest run` PASS exit 0 (157 files / 1581 tests, 0 failures)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, six child phases scaffolded | Done | This scaffold, 2026-09-08 |
| 001-sheet-story-coverage-audit | Done | Landed `31f712c3`/`16547b92`; `001/inventory.md` 86-row coverage table |
| 002-settings-sheet | LANDED, landing-verified | `f0ffadc7`+`70ee0b95` rebased+landed as `5aa0ffd4`+`8b213929` on `origin/main`; continuation verification: gate 27/0, evidence re-derived, goal 2/3 (D-005) |
| 003-add-property-sheet | LANDED, landing-verified | `3f1fe088` rebased onto `1624041e` and landed as `6a828e7e`; continuation verification: goal 3/3, screenshots ×2 616/616 (29 movers, 2 content, all moved in both runs → kept), evidence 15/15 fresh, css-lane released at `f3feddd7c055`, gate and scans recorded in the 005 handover |
| 004-view-config-sheet | LANDED, landing-verified | `c820d688` rebased onto `2d9af89c` (071/002, 066 wave-2, 071/003, 0.0.34) and landed as `f72e50cd`; continuation verification: goal 3/3, screenshots ×3 616/616 (6+1 content movers, every one moved in both sampled runs → kept), evidence 15/15 fresh, css-lane released at `92ad633b2666`, gate 27/0 after the sheet-grammar extent-true (002's resolving 1px sheet border), scans 0 — recorded in the 005 handover |
| 005-filter-sort-group-sheets | LANDED, landing-verified | `9df04459` (two GLM runs + Sonnet) replayed onto the 004+006-merged main as `4c00bf798`, landed `79500b89`; goal 3/3, vitest 1747/1747, sheet-rebuild 0, placement 413/415 (2 declared), evidence 15/15 fresh, gate 27/0 |
| 006-record-and-menu-sheets | LANDED, landing-verified | Replayed as `a10c11ac` onto the 066+0.0.34+004-merged main, landed `ae89043f`; goal 2/2, gate 27/0, 2166 sheet-grammar checks green |
| ALL SIX CHILDREN LANDED — parent 4/4 | Done | This refresh, 2026-09-09: criterion 4's own parent-level run confirms no regression on the merged tree (`97395196`): `sheet-grammar.mjs` PASS exit 0, `npx vitest run` PASS exit 0 (157 files / 1581 tests) |
| 007-settings-sheet-strict-alignment | LANDED, landing-verified | Implementation landed in `worktrees/269-settings-sheet-cards` as `9b6daa3e`+`f2e993e6`, rebased onto origin/main (069/075-merged) as `a56020f7`+`48dbd5d9`; goal 4/5 (the fifth criterion is the operator's own device read, D3). Continuation verification: sheet-grammar card clause RED (0 card containers, exit 1) → GREEN (2/2 cards, radius ≥8px, backgrounds distinct, gap ≥8px, headings above) — reproven by producer mutation (card-wrapper revert → 0 cards, exit 1) and unit mutation (card-background declaration → exactly 1 of 7 fails); vitest 1586/1586, tsc 0, build 0, screenshots ×2 480/480 (0 movers both runs), evidence 16/16 fresh, gate 28/0 (069's lane the 28th), validate --strict PASSED ×3; the four card metrics stay provisional until T001's operator capture |
| 010-sheet-copy-touch-idiom | LANDED, awaiting the operator's device read (D3) | Implementation landed 2026-09-10 in worktree `273-sheet-copy-idiom`: 52 lines in `src/i18n.ts` + the sheet-copy clause in `tools/live/sheet-grammar.mjs` + `src/i18n.test.ts` created. Lane RED 14 gesture rows + 2 parity rows (failing set exactly the four keys, none of the seven) → GREEN 0 of 237 derived sheet-reachable keys, 2349 PASS / 0 FAIL; unit revert-proof 1 failed → 11/11; vitest 1598/1598, tsc 0, build 0, screenshots ×2 480/480 (8 two-run movers kept: the sort empty state's 518×23px hint band ×4, the 12–14×4px `Custom property…` ellipsis box ×4; 2 one-run 1–4px@Δ1 jitters restored with their manifest bytes), evidence 16/16 fresh, gate 28/0, scans 0. The property-label default (Property/属性/屬性 = `filter.field`) is recorded as the packet's D5. Open: the filter's empty state has no capture scenario (its before/after is the lane's printed `t()` values), and the operator's device read |
| **Phases 008-014 scaffolded from `sheet-notion-audit.md`** | All seven landed, awaiting device | Operator ruling 2026-09-09 ~22:30 (D3, verbatim): *"Check more sheets align closer to notion, input, content, wise etc"* / *"Ui improvement is focus here"*. `sheet-notion-audit.md` audits every shipped phone sheet at the level of inputs and content — 16 P1, 26 P2, 13 P3 across sixteen surfaces — and opens seven children. Each validates `RESULT: PASSED`. Implementation order `010` → `008` → `009` → `011` → `012` → `013` → `014`, all landed 2026-09-10: `010` (`48802783`, goal 5/7 — the two open rows are the filter-empty-state capture strand and the operator's device read), `008` (`f64c6398`, goal 6/7), `009` (`892cc6e9`, goal 7/8), `011` (`76aafa76`, goal 6/7), `012` (`22a560fc`, goal 7/8), `013` (`647a400d`, goal 7/8) and `014` (`eb0a2705`, goal 5/6). Every one of the seven closes on the operator's own device read (D3), which no agent ticks; `007`'s four card metrics stay provisional pending T001's operator capture |

### Deviations and findings

| Item | Note |
|------|------|
| Combined into one phase parent | Both phase-qualification thresholds (architectural cross-cutting change across every sheet family, plus file/LOC scores) are met independently, per `recommend-level.sh --loc 1200 --files 25 --architectural`; one coordinated packet avoids re-litigating the audit per sheet family |
| The packet's 100%/4/4 completion figure is unaffected by 007 | 007 exists because of D3 (the operator's own device recheck), which `goal.md`'s completion criteria already treat as a standing open item separate from the four tallied criteria — the 0.0.36 report is that open item resolving negatively for the settings sheet specifically, not a contradiction of anything already ticked |
| The audit's central finding is that the lane measures the shell, not the content | `node tools/live/sheet-grammar.mjs` passes on every surface, and its eight "grammar columns" — `surface`, `handle`, `header`, `rows`, `segmented`, `keyboard`, `safeArea`, `dropdown` — are boolean presence checks that each print `true`. They prove a sheet has chrome. They never count the controls on a row or read a label. That is why the Filter sheet scores 8/8, prints 3/3 rows inside the 44-52px band and 0 native selects, and still renders its property names as `F…`, `gr…`, `is…`. Recorded as Mechanism A in `sheet-notion-audit.md` §1 |
| A second mechanism: a contract passes because its surface list omits the surface | The title-centring clause covers **13** header-bearing surfaces. `record-detail` and `record-peek` are not among them, because the clause queries `.obnotion-shell-header` (`sheet-grammar.mjs:3402`) and the record family mounts `.obnotion-record-detail-header` instead. So the record sheet's title is the one phone-sheet title that does not centre, and the assertion that would have caught it was never eligible to fail. `007` found the same class of gap by a different route. Mechanism B, `sheet-notion-audit.md` §1; owned by `011` |
| The 071 completion figure is unaffected by 008-014, for the same reason it was unaffected by 007 | The four tallied criteria are about the six original children and they remain met. Phases 008-014 exist because of D3 — the operator's own device recheck — which `goal.md` already treats as a standing open item separate from the tally. The 2026-09-09 ~22:30 ruling is that open item resolving negatively for the remaining sheets, not a contradiction of anything already ticked |
<!-- /ANCHOR:log -->

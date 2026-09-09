---
title: "Session Handover: Component Surface System"
description: "Resume point 2026-09-09 ~09:57: closing goal refresh LANDED (b1aeb43e) — 071 parent 4/4 (all six children landed, no-regression closed), 008 packet 4/4 (0.0.35 shipped and published at 97395196). Earlier: 0.0.34 cut e75a979c, 0.0.35 cut 97395196. Landed: 070, 072, 073, 074, 075, 071/001-006, 008/001-004, 066 rows 81-82, 058 AC-012. Only operator-owned device rows remain open. GLM 5.3 flash max carries implementation legs; one Opus 5 xhigh sub-orchestrator at most under Fable; scaffolding on Sonnet 5 xhigh."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-10T00:19:37Z"
    last_updated_by: "274-filter-sheet-rows-verify"
    recent_action: "Landing-verified 071/008 filter-sheet-row-model; 64af87ee+6d5a0d07 on main"
    next_safe_action: "Execute 071/009, then 011-014; 007 awaits T001 capture"
    blockers:
      - "Every open row past this point is operator-owned: device rechecks on 0.0.35 (goal-prompt.md ORDER OF WORK §1)"
    key_files:
      - "specs/005-component-surface-system/goal-prompt.md"
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/005-component-surface-system/071-sheet-notion-anytype-alignment/goal.md"
      - "specs/008-calendar-timeline-chart-deprecation/goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "254-goal-refresh-0035"
      parent_session_id: "surface-system-parent"
    completion_pct: 88
    open_questions:
      - "Does a Notion finding that contradicts a landed Anytype ruling ever become more than Proposed"
    answered_questions:
      - "256: the 23 engine-parity disagreements are gated (ADR-001, exit 1 on growth); flicker fixed by settled reads; M1 judged inherent, not fixable at stylesheet"
      - "071/003 landed+verified twice-rebased (81b6e328): goal 3/3, 071 criterion 2/4; both mutations replayed red→restored"
      - "068 renames to obnotion- with a data.json migration, author MichelKerkmeester, repo obsidian_notion-clone"
      - "The 3500ms dwell and the ::before -19px close hit survived this verifier: mutations red→restored, gate 27/0"
      - "GLM route: --provider llmgateway --model glm-5.3-flash --thinking high (max hangs on launch)"
      - "GLM 5.3 flash max carries implementation legs; one Opus 5 xhigh sub-orchestrator at most under Fable; scaffolding on Sonnet 5 xhigh"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

### 2026-09-10 ~00:54, `071/010` sheet-copy-touch-idiom LANDING-VERIFIED — landed on main as `822d9746`, worktree `273-sheet-copy-idiom`

**What this verifier confirmed** on the copy leg (single commit `6a584630` on its 58dc5563 base, rebased onto `dedb52df` — the 045 field-names ×2, 074 testbed ×2 and the 0.0.37 release — as `41b9619f`, then this verifier's reconciliation as `822d9746`, both pushed): the §3.16 finding's four sheet-reachable gesture strings read tap/轻点 in all three locales. Mutation re-proofs by this verifier on the merged tree: reverting the leg's 52-line `src/i18n.ts` hunk → `sheet-grammar` exit 1 with exactly **14 gesture rows + 2 locale-parity rows, the failing set exactly the four keys and none of the seven** (237 derived keys); restored → exit 0, 2349 PASS / 0 FAIL; the 071/002–007 assertions held green in the same runs (44–52px pitches, 16px insets, 0 native selects, 067 divider hairlines, 007's 2/2 cards). The unit clause's own named mutation: `menu.changeType` → ASCII ellipsis → `npx vitest run src/i18n.test.ts` exactly 1 failed | 11 passed (the EN U+2026 clause); restored → 12/12. The 10 rebase conflicts were all metadata: 10 generated artefacts took main's side and were re-derived, `005/handover.md` kept both sections chronologically (074 then 010). Post-rebase `npm run screenshots` ×2 (480 each, exit 0) judged by decoded pixel delta across both runs: 2 REAL movers kept — `panel-base-import-modal-desktop-light` 66px@Δ209 (attributed: the leg's `baseImport.chooseBaseFilePlaceholder` → "Search .base files…", which that modal paints) and `field-file-fields-desktop-light` 15px@Δ83 — 0 jitters, and the leg's own 8 movers reproduced exactly. Evidence 16/16 fresh after the `capture-device-parity` writer re-ran (its manifest input moved 866f3a603832 → 72fe46e75bc8); `screenshots:verify` 480 current; no stylesheet change → the css-lane untouched (holder `045`, baselineHash `fcaf3fec28cf` = post-rebase styles.css; the 2 movers are named here because no triplet was owed). Gate **28/0** twice, the second from the final state; `validate --strict` RESULT: PASSED ×3 (010, 071 parent's first RESULT, 005 track) — 005 failed once pre-backfill (SOURCE_FINGERPRINT_MISMATCH, expected: its metadata was main's side) and passed after the scoped backfill; scan-comments 0, scan-failing-values 0. vitest 1600/1600 (158 files — 074's two). Docs re-derived, not carried: `roadmap.md`'s §4 row 87 and §5.A's 071 row already carried the 010 LANDED note; 071's goal reads 4/4 = §5.A's 100%—4/4, the child's goal reads 5/7 (71%, `completion_pct`) with AC-007 (the filter half of the capture) and AC-008 (the operator's device read, D3) the two open rows; no operator or device row ticked.

### 2026-09-09 ~23:55, `045` board-card field names LANDING-VERIFIED — landed on main as `2d6d608c`, worktree `270-card-field-names`

**What this verifier confirmed** on the styles-only leg (single commit, three-times replayed: `ab099f87` → `659e8c37` → `0429d4d7`, this verifier's reconciliation atop it as `ea234322` → `71dcd585` → `2d6d608c`, all pushed) of the 0.0.36 report *"Board cards should also show field name and not just value"*: the shared card-field renderer always emitted each property's name span (`card-field-renderer.ts:105`, text = `col.label`, the schema display name, never the key); the kanban meta block only hid it. The fix un-hides it — 12px in the muted token before the value, the value keeping `tabular-nums`, the property grid 1fr 1fr at a 360px-or-wider viewport and 1fr below (`@media (max-width: 359.9px)`), the meta-scoped value clamp 2 → 1 so the measured uniform 25px row pitch survives, chip rows `grid-column: 1/-1` so a wrapped badge row cannot stretch its grid neighbour. Mutation re-proof by this verifier on the merged tree: the label rule re-hid (`display: none`) → `render-assertions` exit 1, exactly the leg's RED numbers (36 visible of 306, 13px / `rgb(108,111,116)`, pin 13px ≠ 12px); restored → exit 0 (306/306, 12px / `rgb(154,155,158)`, 2 columns at 1440px / 1 at 340px). Battery on the twice-more-rebased main (58dc5563's 071 sheet-audit docs, then 3b15f925/5cd44328's 074 testbed fixture — both no source/stylesheet change): build 0, tsc 0, vitest 1586 → 1588/1588 (074's two new tests), screenshots ×2 per round, three judged pixel-delta rounds — 1st: board-mobile-desktop-dark 2px@1 both runs REAL (the merged 075/069/007+045 stylesheet's 2-antialiased-pixel read; the leg's pre-rebase blob struck); 2nd: field-file-fields-desktop-light 42px@165 then 57px@165, a minutes-relative read, both > 12, REAL; 3rd: those two again (chrome-view-switcher-mobile-dark 47px@max106, both runs identical — these fixtures render wall-clock-dependent reads, so the hour moves them) plus board-mobile 2px@1 one-run → jitter, restored to its committed bytes with its manifest row (bytes 242584, pixelHash 2ab2cdd02bb4) patched back, and panel-record-detail-sheet-body-empty-desktop-light 6973px@max1 in one run only whose second run itself restored the committed variant. All kept movers named in the 045 `css-lane` release note's `reviewed` (3); the lane's history grew 460 → 463 (main's + this leg's triplet, append-only) → 466, holder `045-board-card-properties`, baselineHash `fcaf3fec28cf` = post-rebase `styles.css`. The 074 leg's committed stamps carried pre-merge `styles.css` input hashes, so five artefacts (renderer-coverage, replay, touch-targets, unstyled-links, capture-device-parity) were re-measured by their own writers; evidence `--check-all` 16/16 fresh. Battery: gate **28 green / 0 red** exit 0 on the final tree (069's `board-touch-drag` lane the 28th), `validate --strict` **RESULT: PASSED** for 045 and the 005 root (backfill `changed: 0` each round), scan-comments 0, scan-failing-values 0. Docs re-derived, not carried: **REQ-009** (the report quoted verbatim), **AC-008** with the RED→GREEN numbers, tasks **T015**, goal criterion 7 of 7 — `goal.md` reads 1/7 ticked, so §5.A's `045` row moved **0% — 0/6 → 14% — 1/7**; §4's fix row landed as a third row numbered 86 (main already numbers 075's and 069's rows 86; the collision was left to a later amnesty, and the 071-audit 87 below it now duplicates 074's 87 the same way). AC-008 records Met; AC-006, the operator's own iPhone read, stays the packet's only open row.

### 2026-09-09 ~22:10, `075` vertical-scroll lock LANDING-VERIFIED — landed on main as `e1594957`, worktree `265-toolbar-vertical-lock`

**What this verifier confirmed** on the 075 toolbar leg (rebuilt as `d8d12499` + `663d9970` +
`d98f5ae4` on the 005-sort-sheet main, landing artefacts committed as `e1594957`, all pushed): the
0.0.36 report *"The menu with horizontal overflow on mobile allows vertical movement which shouldnt
happen"* is fixed at the strip's own rules — `overflow-y: hidden` on both `.is-phone
.obnotion-toolbar-right` declarations, `touch-action: pan-x`, `overscroll-behavior-x: contain`,
padding-bottom 2 → 8px parking every control's 8px `::before` touch halo inside the strip's box so
the row sizes to its controls (52 → 58px, `everyControlInsideStrip` true, nothing clipped). Mutation
re-proof by this verifier on the merged tree: media rule reverted to `overflow-y: visible` → exit 1
(computed `overflow-y` `auto`); base rule's padding reverted to 2px → exit 1 with the AC-007 red
numbers reproduced (vertical overflow 6px = scrollHeight 58 / clientHeight 52, forced `scrollTop = 40`
reads back 6); restored → exit 0 (0px / hidden / pan-x / contain / 0, horizontal unchanged 532/398).
css-lane conflict resolved append-only over main's 005-sort-sheet triplet (451 common → 456 entries,
holder 075, baselineHash 82894e5ae604 = post-rebase styles.css, no restamp needed); the lane released
at the landing with the 2 real movers named. Recapture x2 on the merged tree: 2 movers, both
deterministic (identical both runs, maxDelta 1) — panel-record-detail-sheet-body-empty-desktop-dark
1539px (one of 067's recorded seventeen, first recapture on a tree carrying 173f7d3a; 067's verdict
review stays 067's debt) and board-view-desktop-dark 4px; the leg's 12 toolbar movers reproduce
byte-identically. Battery: build 0, tsc 0, vitest 1585/1585, evidence 15/15 after re-running six
stale writers, gate **27 green / 0 red** exit 0, `validate --strict` **RESULT: PASSED** for 075 and
the 005 root (backfilled), scan-comments 0, scan-failing-values 0 (450/148 baselines). touch-targets
did not ratchet (fixture 849/145/253, constructed 16997/703/10545 — unchanged). Docs re-derived at
the landing, not carried: the toolbar row is **roadmap §4 row 86** (main's 84 = 071/007 scaffold,
85 = sort sheet), §5.A corrected **5/5 → 5/6 = 83%** against goal.md's actual criteria count, packet
continuity reconciled to 83. AC-006 stays unticked — the operator's own iPhone re-read of the strip
(now covering the vertical lock too) is the packet's closing condition.

### 2026-09-09 ~21:55, sort-sheet flush frame fix LANDING-VERIFIED — landed on main as `ae901a6e`, worktree `266-sort-sheet-flush`

**What this verifier confirmed on the leg's commit (`94aeac79`, replayed onto the 071/007-scaffolded
main as `e9f62e41`, artefact re-derivation commit `ae901a6e`, both pushed):** the operator's 0.0.36
report *"Sort sheet doesnt fill full width like it should like others and has a bottom gap"* is
fixed at the producer — the shared popover mount's `heightRole` pass-through
(`src/views/popover-position.ts`) and the sort sheet's declared `heightRole: "flush"`
(`src/views/sort-panel-renderer.ts`). Mutation re-run by this verifier: declaration removed →
`tools/live/sheet-grammar.mjs` exit 1 (sort-panel classified floating, left/right/bottom 8/8/8px at
390px — the leg's RED numbers reproduced); restored → exit 0 (flush, 0/0/0px). Filter and group
sheets untouched (no styles.css, filter-panel, or group-panel change in the diff). Rebase kept both
§4 rows (main's 071/007 scaffold stayed row 84, the sort-sheet landing became row 85) and took
main's graph-metadata for re-derivation. Verification battery: build 0, tsc 0, vitest 1585/1585,
screenshots x2 exit 0 with 0 moved PNGs across both runs (committed blobs reproduce exactly),
evidence 15/15 fresh, gate 27 green / 0 red exit 0, `validate --strict` RESULT: PASSED for 071/005
and the 005 root (backfill refreshed, both re-validated PASSED), scan-comments 0,
scan-failing-values 0. Docs figures re-derived: 071/005 goal 4/4, 071 parent 4/4 — both already
correct, no tick names the operator or a device. The operator's own device recheck stays open per
D3 — the pixel evidence is the harness read, not the device read.

### 2026-09-09 ~22:30, `071` SHEET-NOTION AUDIT + children `008`-`014` SCAFFOLDED — not implemented, worktree `272-sheet-notion-audit`

**What opened this:** the operator widened `007`'s single-sheet ruling to the whole family,
verbatim: *"Check more sheets align closer to notion, input, content, wise etc"* and *"Ui
improvement is focus here"* (`roadmap.md` §4 row 87). The artefact is
`071/sheet-notion-audit.md` — one section per shipped phone sheet with the Notion screens it
corresponds to, a row-by-row Notion-versus-ours table, the input and content deltas, a
UI-improvement priority, and the findings that need an operator capture. **16 P1, 26 P2, 13 P3**
across sixteen surfaces.

**Read the audit's §0 before quoting any number from it.** Every one of the 1,315 Notion iOS
captures in this repository is **299x678** — a Mobbin thumbnail, `sips`-confirmed on a 400-file
sample and on all 171 files in the five folders these families lean on, with no width/height key
anywhere in `harvest.json`. No numeric threshold in any of the seven children is derived from a
Notion asset. Each Notion column is structural; each number is ours, an internal-consistency
target, or `TBD` against one of the six operator captures listed in the audit's §5.

**Two mechanisms account for nearly every finding, and both are the class `007` hit.**
*A — the lane measures the shell, never the content.* `sheet-grammar.mjs` passes on every surface
and its eight "grammar columns" are boolean presence checks printing `true`. So the Filter sheet
scores 8/8, prints 3/3 rows inside the 44-52px band and 0 native selects, and still renders its
property names as `F…`, `gr…`, `is…` — six controls share one 48px row where Notion stacks three.
*B — a contract passes because its surface list omits the surface.* The title-centring clause
covers **13** header-bearing surfaces; `record-detail` and `record-peek` are absent because it
queries `.obnotion-shell-header` (`sheet-grammar.mjs:3402`) and the record family mounts its own.
The record title is the one phone-sheet title that does not centre, and the gate could not say so.

**Two defects are ours and measured, not read off an image.** The lane prints each panel sheet's
row inset at `sheet-grammar.mjs:3998` and never asserts it — filter has been at **25.0px** against
sort's **16.0px** in every green run since `005` landed. And the three panel sheets carry
**332 / 357 / 341px** row spans on one 402px frame. On the content side, **four** strings naming a
pointer gesture reach a phone sheet renderer, producers grep-confirmed, including
`panel.doubleClickEdit` — "Double-click to edit" — on every property row (`column-manager-renderer.ts:383`).

**Seven children scaffolded**, each with `spec.md` (delta table + thresholds), `plan.md`, `tasks.md`
(write-first, RED lane assertion named first per task), `acceptance-criteria.md` and `goal.md`:
`008-filter-sheet-row-model` (P1), `009-properties-sheet-row-model` (P1),
`010-sheet-copy-touch-idiom` (P1 content), `011-record-sheet-header-and-icons` (P1),
`012-sort-and-group-sheet-rows` (P2), `013-sheet-input-and-action-order` (P2),
`014-sheet-polish` (P3, gathered so it neither scatters nor gets promoted).
**Implementation order for the GLM leg: `010` → `008` → `009` → `011` → `012` → `013` → `014`.**

**Three contradictions held Proposed, per D15** (audit §6): card grouping is `007`'s to decide and
no child adds one; the `AND (all)`/`OR (any)` control is **retained** by default; the layout choice
**stays as rows**, because `toolbar-renderer.ts:1494-1502` documents a real defect in our own former
tiles that Notion's per-layout icons may not share. The audit also records what it deliberately
does **not** propose — most pointedly Notion's settings-as-router model, which row 83 already ruled
against — and two findings of *convergence*: our option colour picker is already Notion's control,
and the column-width sheet has **no Notion reference at all**.

**Verification:** `orchestrator --strict` `RESULT: PASSED` for all seven children, the `071` parent
and the `005` root, after backfilling graph metadata for each touched folder. Docs only — no code,
style or lane file was changed by this leg. The `071` parent's Phase Documentation Map and
`goal.md` binding/log tables gained the seven rows; `roadmap.md` §4 row 87 and §5.A's `071` row
record the ruling and the findings.

**One pre-existing discrepancy found and left alone:** `tools/storybook/sheet-inventory.mjs` prints
**87 surfaces (55 primary + 32 stacked)** and regenerates `071/001/inventory.md` byte-identical,
while `071/goal.md` and `roadmap.md` both say **86**. Out of this leg's write authority; recorded
rather than fixed.

### 2026-09-09 ~20:38, `071/007-settings-sheet-strict-alignment` SCAFFOLDED — not implemented, worktree `268-settings-sheet-strict`

**What opened this:** the operator's 0.0.36 (iOS) device recheck of `002-settings-sheet`'s landed
redesign (071/goal.md D3), verbatim: *"Settings sheet still has bad ui overall and needs strict
alignment with notion sheets."* `002`'s row-internal grammar (pitch, dividers, sheet-native
pickers) stays green and unchanged — this scaffold's reference inventory found the actual gap:
`002`'s own gap table cited `notion/ios/settings`/`notion/web/settings` as the reference, but those
are Notion's account-level Settings pages; the per-database "Settings" bottom sheet
(`screenshots/notion/ios/flows/database-settings/`) was never opened. Viewed directly, Notion
groups its settings rows into 2-3 separate rounded cards on a neutral canvas; our sheet renders one
continuous flat list on one background — the central structural gap `071/007/spec.md` §13 tables.
**Scaffolded only**: `spec.md`, `plan.md`, `tasks.md` (12 write-first tasks), `acceptance-criteria.md`,
`goal.md`; the 071 parent's Phase Documentation Map and goal.md binding/log tables gained a 007 row;
`roadmap.md` §4 row 84 and §5.A's 071 row record the report and the finding. No landed Anytype
ruling is contradicted (071/goal.md D15 defaults to Anytype only for the board and the calendar),
so no Proposed ADR was opened in §7. `validate.sh --strict` RESULT: PASSED for 071/007, the 071
parent and the 005 root, after backfilling graph metadata for 071/007 and the 071 parent.

### 2026-09-09 ~15:30, residual goal refresh RECONCILED — docs-only, gate-verified, worktree `258-goal-refresh-residuals`

**What this refresh did:** reconciled the three residuals already landed on `main` since the closing
refresh at `13bc4632` — `008/004`'s `package.json` description strip (`8b14f39f`, verified
`51470e56`), `009`'s engine-parity lane made a real gate with ADR-001 (`f21cf6d5`, verified
`1a4c3ff3`, T27 closed), and `067`'s T015/T020/T021 (`b327f1de`, verified `5195efb6`) — against
`008/004/goal.md` (a LOG row added naming the residual leg), `067/tasks.md` (T022 ticked, its own
threshold read live from the final state), and the 005 parent's `goal.md` continuity block
(`recent_action`/`next_safe_action` refreshed; its DONE-table 067 row already read 4/7 from the
prior verifier). `009/goal.md` (2/6) and `roadmap.md` §5.A's 067/009 rows were already current and
needed no edit. §6A gained no new decision row — ADR-001 is an engineering ADR, not an operator
ruling, so it does not fit that section's own contract; named here rather than silently added.
**Verified from the final state:** `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run` 0
(157 files / 1584 tests), `npm run gate` exit 0 ("27 green, 0 red for a declared reason"),
`npm run replay` exit 0 (28/28 held, 0 reversed), the sheet-family registry at **18 surfaces / 32
pairs** (at or above the 14/32 floor). `validate.sh --strict` (via the orchestrator, run with
`NODE_PRESERVE_SYMLINKS=1`) RESULT: PASSED for 005, 067, 008, 008/004, 006 and 007, after
backfilling graph metadata for 067, 008/004 and the 005 parent. **A concurrent 0.0.36 cut is in
flight on `main`** (`manifest.json`, `package.json`, `versions.json`, `main.js`, the `0.0.36` tag)
and does not touch specs; 0.0.35 at `97395196` remains the installed build until that tag and its
Release/Gates runs are confirmed. Every open row past this point stays operator-owned; no agent
ticks one.

### 2026-09-09 ~16:25, `067`'s last agent-doable row CLOSED — the depth-cap census leg, worktree `260-sheet-depth-cap`

**What this leg added:** the criterion's own census clause is now asserted. goal.md's depth-cap row

("the count of stacked *sheets* at depth 3 reads **0**") had its mechanism, its unit tests and its

named-pair proofs already landed (`c2ee4f6d` cap+producer, `b327f1de` T020 retargeting) — what was

missing was the COUNT, read as one number over the whole registered set. Landed: a depth-cap census

block in `tools/live/sheet-grammar.mjs` that reads every registered pair's child registration

through the stack's new public `getRegisteredParent` (`overlay-stack.ts`, +1 read method, unit-tested

in `overlay-stack.test.ts` with the declined-offer case) and counts third hops that STACKED although

their registered parent offered the cap a replace: **0 governed of 32 pairs mounted**.

`record column submenu` and `import confirm dropdown chain` keep `depth: 3` with

`parentOffersReplace=false` — the menu-stack exemption asserted structurally, not by name — and the

dialog-role negative control additionally asserts its own third hop's parent never offered a

replace. Two controls prove the zero is a measurement, not vacuity: a governed registration whose

parent DECLINES the offer (`__shellDepthCapDeclined`, exercising the documented third state of the

capability) stacks at depth 3 and IS counted (sheet=true, depth 3, governed=true), and the dialog

control proves the census can look at a stacked governed-shaped chain and correctly skip it.

**Verified by mutation:** weakening the cap's threshold to `>= 3` takes the lane to exit 1 with

`1 governed third hop(s) still stacked (properties property type picker)` plus 10 further failures

(child depth 3 want 2, 2→3 sheets, graft/title/back geometry, the real-call-graph absorption) — all

green again on revert, byte-identical diff. goal.md row ticked 5/7 (the criterion's other clauses —

both named pairs assert replace, add-view traced two-level — were closed at `b327f1de` and verified

in the tree, not redone); AC-011 (operator iOS pass) stays open, never agent-ticked.

**Verified by number:** `npx tsc --noEmit` 0; `npx vitest run` 1585/1585 in 157 files (1 new test),

exit 0; `npm run build` 0; `node tools/live/sheet-grammar.mjs` exit 0, **2333 PASS / 0 FAIL**

(previously 2327; +6 from the census block and the two control assertions); `render-assertions.mjs`

0; `verify-placement.mjs` 418/420 (2 declared, the recorded steady shape); `evidence.mjs

--check-all` re-stamped twice (sheet-rebuild.json, then capture-device-parity.json after the

manifest restamp) → 0; screenshots ×2 exit 0, 480 captures, **3 mover PNGs, all jitter**

(maxDelta 6/2/1 ≤ 12, moved in run 1 only) → restored from HEAD, 0 real movers, manifest diff is

exactly the 8 depth3 entries' `overlay-stack.ts` freshness stamp `cca7015c7a07 → 93e86708c6b3`;

gate 27 green 0 red, exit 0; scan-comments 0, scan-failing-values 0. Changed: `overlay-stack.ts`

(+14), `overlay-stack.test.ts` (+23), `tools/live/sheet-grammar.mjs` (+87), plus regenerated

`main.js`, `renderer-coverage.json`, `sheet-rebuild.json`, `screenshots/manifest.json`.

roadmap §5.A 067 row **57% → 71% (5/7)**; 005/goal.md DONE-table row reconciled. 067 remains open

only on the declined-anchoring row (deliberately carried) and the operator's device read.

### 2026-09-09 ~15:05, `067` T015/T020/T021 residuals LANDED+verified on `origin/main` — landing-verified, rebased, pushed, worktree `257-sheet-family-residuals`

**What landed:** the residuals leg as two commits — `b327f1de` (the leg: header block 74px in the
true 66–74px band via the 2px margin collapse, the divider grammar on the filter/sort/group/Properties
sheets, the property-type-picker replace-pair, 93 real movers, css-lane re-signed at `4261be904bfb`)
and this verifier's `5195efb6` (roadmap §5.A 067 row 43%→57% — 4/7, checklist regenerated,
post-rebase evidence re-stamps). Rebasing onto `820b96ac` took main's side on 10 generated-artefact
conflicts; **engine-parity re-derived: steady 23, new 0** — the moved sheet geometry produced no new
disagreement. **Verified by mutation:** T015 — handle margin 2px→4px, lane RED `sort-panel measures
76px, wanted 66-74px`, restore 2327 asserts green; T021 — the Properties-sheet header hairline rule
deleted, lane RED `Properties sheet — 2/3 between-section boundaries`, restore green.
**Verified by instrument:** tsc 0, build 0, vitest 1584 (157 files), sheet-grammar 0,
verify-placement 418/420 (2 declared, the recorded steady shape), touch-targets 0,
screenshots ×3 exit 0 with **0 real movers** post-rebase (3 rasteriser-jitter PNGs restored, all
maxDelta ≤ 12 single-run; `board-mobile-desktop-dark`'s run-3 bytes reproduced the committed blob
exactly — the recorded recurring mover, 073 precedent), gate 27 green 0 red (after one
`operator-list` red, fixed by regenerating the named artefact, not thresholds),
`validate.sh --strict` RESULT: PASSED for 067 and for the 005 parent after backfill, both naming
scans PASS. goal.md = 4/7 ticked; **roadmap row reconciled to 57% — 4/7 with an amendment clause;**
AC-011 (the operator's iOS pass) stays open — no agent ticks it.

### 2026-09-09 ~09:57, closing goal refresh LANDED on `origin/main` — reconciliation, docs-only, gate-verified, worktree `254-goal-refresh-0035`

**What landed:** `b1aeb43e` (this refresh) reconciles every goal.md/acceptance-criteria.md touched by
today's landers against the merged tree at `97395196` (0.0.35). **071 parent, 4/4 (was 3/4):**
`071/005-filter-sort-group-sheets/goal.md` had never been ticked after its `79500b89` landing — all
three checkboxes were still `[ ]` despite its own `acceptance-criteria.md` reading 3×`Met`; ticked
with evidence (Phase 1 mapping, the group popover's scrollbar-hide + sibling-divider fix, the
`85ff504` freeze regression). The parent's own fourth criterion — no regression on 054/058/045/067 —
was open with no child citing all four by name; closed by this refresh's own from-scratch reruns from
the worktree: `node tools/live/sheet-grammar.mjs` PASS exit 0 (every registered surface, both engines,
zero sideways overflow), `npx vitest run` PASS exit 0 (157 files / 1581 tests, 0 failures — the drop
from ~1747 is 008/003's archived renderer tests, expected). **008 parent, 4/4 (was 3/4 + pending):**
004's release-notes criterion read "publishing waits on the 0.0.35 cut" — stale, since 0.0.35 had
already shipped; `gh release view 0.0.35` confirms the published body carries the drafted
removal/archive/restore copy verbatim in substance. Ticked, with the packet's own closure statement
corrected to match. **Carried through:** `005/goal.md` DONE-table fractions (071 1/4→4/4, 066 4/6→5/6,
both stale from before today's landings), `roadmap.md` §5.A (071, 058, 008 figures) and §4 rows
73/76-80 (each had either a stale "not yet started"/"open" claim or a stale landing SHA), `goal-prompt.md`
STATE (dated now, 0.0.35 shipped) and ORDER OF WORK (the 20-row operator-device list moved to item 1,
diff-confirmed byte-identical elsewhere: BINDING/PRECEDENCE/RESUME/DELEGATION/EVIDENCE/DONE WHEN
untouched), body **3705 chars** (cap 4000). **Verified, by numbers:** `NODE_PRESERVE_SYMLINKS=1`
strict validation first-`RESULT:` line — 005 PASSED, 006 PASSED, `006/007-remove-renderer-and-harness`
PASSED, 008 PASSED (both 005 and 008 needed a scoped `backfill-graph-metadata.ts` re-derive after the
doc edits, run through `realpath` per the symlink no-op trap; 008's `next_safe_action` also needed
shortening to pass `SPECDOC_FRONTMATTER_004`'s 96-char/non-narrative rule); `npm run gate` PASS, 27
green / 0 red, exit 0 (`operator-list` read RED once before `node tools/naming/build-operator-checklist.mjs`
regenerated it for the day's re-ticked rows, then green); `npm run replay` PASS, 28 held, 0 reversed;
`scan-failing-values.mjs` PASS, no newly-ticked criterion arrived without its failing value. Every §4
report row (70-83) now carries either a landed SHA or an explicit named operator deferral — row 79
(074) was neither (stale "not yet started" with no deferral line) and now reads both. `package.json`'s
own `description` field still names the retired views — recorded as an open residual in both 008's own
goal.md and this handover, since 004's AC-001 scoped only `manifest.json`'s description.

### 2026-09-09 ~09:30, `008/004-archive-docs-and-release` LANDED on `origin/main` — docs-only, landing-verified, pushed

**What landed:** the docs leg's single commit (`e968d5ca` in `.worktrees/252-deprecation-readme-strip`, GLM,
"docs(readme): strip the retired view mentions, add the archived-views note and the mention lane")
replayed onto `48e85567` — a no-op rebase, main carried nothing since — plus this verifier's
reconciliation at `f1eb93f5` (roadmap §5.A rows 78/77 → LANDED 3/3; the gate's seven evidence lanes
re-derived, `measuredAt`-only). **Verified, by numbers:** the enforced-mention grep over
README.md+manifest.json = exactly 1 hit, the sanctioned "Deprecated views" sentence at README.md:22
pointing at `archive/deprecated-views/README.md` (7 keyword occurrences, all inside the note; no
feature claim outside it — the leg's 13→0 claim CONFIRMED); mention-lane mutation: one "calendar
view" sentence re-added → 1 failed | 9 passed of 10, restored → 10/10; the suite replayed against
the pre-leg README/manifest → 1|9 red, restored → 10/10; 037's supersession note in its own
goal.md (2026-09-09, cites `7fb9fb28`, history intact); 002's AC-007 reads Met, 0.0.34 =
`e75a979c9a21…` == `git rev-parse 0.0.34^{commit}`; 008 parent criterion 4 stays ticked (strip +
supersede + notes DRAFTED; the 0.0.35 cut itself stays open); build 0, tsc 0, vitest 1581/1581,
screenshots ×2 both 0 moved PNGs (pixel-delta 0; one 1-line manifest `bytes` jitter 181633→181631
restored), gate **27 green, 0 red**, `validate --strict` RESULT: PASSED for 004 and the 008 parent,
scan-comments 0, scan-failing-values 0. package.json's description still names the retired views —
deliberate, an open row for the 0.0.35 release leg.

### 2026-09-09 ~04:30, `071/005-filter-sort-group-sheets` LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the leg's single commit (`9df04459` in `.worktrees/247-filter-sort-group-sheets`, two
GLM runs + a Sonnet completion, "the group popover's overflow and divider gap closed at their shared
mechanism") replayed onto `ae89043f` (the 066+0.0.34+071/003+071/004+071/006-merged main) as
`4c00bf798`, with this verifier's pass at `49ee993d`. **How:** 20 conflicted files — the 16
generated/evidence artefacts took main's side and were re-derived (13 of them by their own writers
after `evidence --check-all` named them); `css-lane.json` history kept append-only (the 005 triplet
recorded with its own takeover note, then a post-rebase 005 acquire/edit/release triplet, header
re-pointed at the merged `55cb284b3244`); styles.css's one token-comment conflict merged as one
comment; `sheet-grammar.mjs`'s four 006-vs-005 seams resolved keeping both landings' intents (006's
extent predicate + 005's farthest-margin-edge diagnosis; the record and the panel clauses both
retained). **Verified, by numbers:** the scrollbar-hide mutation red (WebKit group 370 > 366 — the
pre-fix numbers) then restored; the divider mutation red (`heading dividers 1px`) then restored, both
via the lane's own clauses (lesson recorded: on the harness page a `var(--background-modifier-border)`
mutation of that rule is invisible — the token is undefined there, so the shorthand computes to its
initial); unit mutations: the switch-synonym line reverted → 1 failed | 12 passed, the `group`
producer row deleted → 2 failed | 7 passed, both restored. At GREEN: filter 3/3 rows 48px, sort 2/2
rows 48px, group 17/17 rows 44px (the 44–52 window), 16px insets, 0 native selects, extent 374 == 374
on both engines, overflow sweep 374 ≤ 374; vitest 1747/1747 (1727 on the leg + 004/006's 20), build 0,
tsc 0, sheet-rebuild 0 (the `85ff504` freeze), placement 413/415 (2 declared), screenshots ×2 616/616
(1 real mover kept: constructed-toolbar-add-view-mobile-dark 159px@max176, the same mover+numbers
006's release recorded; 1 one-run 1px jitter restored at its committed manifest bytes), evidence 15/15
fresh, gate **27 green, 0 red**, all three validations (packet, 071, track) strict RESULT: PASSED,
scan-comments/scan-failing-values 0. 071's goal criterion 3 ticked (004+005+006 complete) and the
roadmap §5.A figure re-derived to 3/4; the device read stays the operator's (D3).

### 2026-09-09 ~03:30, `071/003-add-property-sheet` LANDED on `origin/main` — landing-verified, twice-rebased, pushed

**What landed:** the GLM leg's single commit (`3f1fe088` in `.worktrees/244-add-property-sheet`, "the 21
property formats render as one flat, scrolling icon+label list inside the create-property sheet")
replayed onto `1624041e` as `c00cb3c5`, then — after the 0.0.34 release cut landed first — onto `e75a979c`
as `6a828e7e`, with this verifier's pass at `81b6e328`. **How:** 17 conflicted generated/evidence/lane
files took main's side and were re-derived; `css-lane.json` history merged append-only (ours' 422 incl.
072/002/066 triplets + the leg's 003 triplet) with a post-rebase 003 acquire/edit/release triplet
(baselineHash `f3feddd7c055`, `check-lane` 0); styles.css itself merged cleanly. **Verified, by numbers:**
both mutations replayed red then restored (unit: gated-reason producer line reverted → 1 failed | 7
passed → 8/8; device: styles.css hunk stashed → `properties create property` fails pitch min 0.0 / max
30.0, 16px padding, 210>210 scroll — the note-header/keyboard clearance held unfixed, recorded as the
leg's finding). At GREEN: 21 rows pitch 44.0/44.0, sheet top 238.4px ≥ note-header bottom 44.0px with the
336px keyboard inset up (the operator's R6 defect), height 261.6 ≤ 464.0, no 402×874 overflow. vitest
1742/1742 (161 files), tsc 0, build 0. Screenshots ×2 in BOTH rounds (616/616, exit 0): round 1 — 29
movers, all in both runs → REAL, 0 restores; round 2 — 28/29, 1 jitter (`calendar-empty-state-mobile-light`
12px@1) restored with its manifest bytes, `screenshots:verify` 0; 2 content-movers reproduced
(constructed-cell-editor-text-mobile-light 24165px@9, timeline-subtask-tree-desktop-light 5030px@12);
13 stale evidence lanes re-derived, engine-parity informational-1 (43 = 002's steady state),
evidence 15/15. FINAL gate from the committed state: **27/0, both rounds** (round 1 needed the checklist
regenerated — 186→185 rows, 071 section 2/4 — and the newly ticked 071 criterion given its red-first
clause for `failing-values`; the folder-docs miss self-heals: the gate writes the gate-logs README).
`validate --strict` PASSED on 003, 071 and 005 after graph-metadata backfill; scan-comments 0,
scan-failing-values 0. Docs: 071 goal criterion 2 ticked (002+003 redesign pair; **2/4, 50%** — both
device reads stay the operator's per D3), 071 LOG 003 row → LANDED+landing-verified, roadmap report row
75 → LANDED+verified, the stale §5.A 071 row corrected 25%→50% (002's own phrase also refreshed),
071 goal completion 25→50. Every device row untouched. **Pushed: `e75a979c..81b6e328` on `origin/main`**
(after one rejection by the 0.0.34 cut, resolved by rebase + full re-derivation). Round-2 note: 0.0.34
discharges 008/002's AC-007; 008's docs still say it waits.

### 2026-09-09 ~01:35, `066-notion-states-refinement` wave 2 (rows 81-82) LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the Sonnet leg's two commits (`1e355695`+`8bc8f050` in `.worktrees/243-toast-dwell-and-close`)
replayed onto `7e5855bb` as `6134f29d`+`cb351385`, with this verifier's pass at `c5bbcf93`. **How:** 17
conflicted generated/evidence/graph-metadata files took main's side and were re-derived; `touch-targets-
baseline.json` (leg's 171→169) auto-merged; `tools/lane/css-lane.json` → both sides' histories kept
append-only, the 066 triplet re-appended, `baselineHash` = `73297de05d54` (sha256 of the merged stylesheet,
`check-lane` 0); the handover's §1 union-merged, 066's bullet above 074's, newest-first. **Verified, by
numbers:** both mutations replayed red then restored (dwell 3/16 → 16/16; hit-inset: the 18×29 declared box,
169=169 — a bounding-box sweep cannot see the inset, the ≥56×67 proof lives in the placement lane);
placement 418/420, 2 declared, the +5 all new toast rows, 0 relaxed floors; vitest 1734/1734 (160 files);
13 stale evidence lanes re-derived, engine-parity informational-1 (43=43, identical disagreement set);
screenshots ×2 616/616, 2 movers — `constructed-toolbar-add-view-mobile-light` 96px@196 REAL (stale since
008/002+071/002, which never recaptured it) kept and named in the 066 release's `reviewed`,
`reference-gantt-subtask-desktop-light` 2487px@1 jitter restored with its manifest bytes; the manifest's
other 628 lines = freshness stamps only. FINAL gate from the committed state: 27/0. `validate --strict`
PASSED on 066 and 005 after graph-metadata backfill. Docs: goal criterion 1 ticked (**5/6** — the
deliberately-unticked 09-07 note is discharged by the leg's own browser-measured dwell row, which AC-010's
THEN demanded; done figure corrected to 3500ms), roadmap §5.A 066 67%→83% and report rows 81/82 → LANDED,
operator checklist 187→186 rows (066 section 5/6). AC-008 and every device row untouched. **Pushed:
`7e5855bb..c5bbcf93` on `origin/main`.**

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

### 2026-09-10 ~00:19, `071/008-filter-sheet-row-model` LANDING-VERIFIED — landed on `origin/main` as `64af87ee`+`6d5a0d07`, worktree `274-filter-sheet-rows`

**Landed SHA `6d5a0d07` on `origin/main`** (leg commit `b6aa29e0` replayed onto the 071/010+045
main `48802783` as `64af87ee`; verifier commit `6d5a0d07`; `git log -1 origin/main` read back).
**What this verifier confirmed** on the merged tree: the one-round rebase took main's side for the
19 generated artefacts (verified by `git show :2:` == `48802783`'s blobs) and re-derived them —
`005/handover.md` kept both landings' §1 sections, `css-lane.json` merged append-only (main's 466
entries + this leg's 3 extra = 469, holder `071-008-filter-sheet-row-model`, `baselineHash` set to
`shasum(styles.css)` = `189a3ef0e188`, the 045+008 merged sheet). Lane RED→GREEN re-proven by
mutation (the whole leg diff on `filter-panel-renderer.ts` reverted): `sheet-grammar.mjs` exit 1
with exactly the recorded clauses (controls-per-row 6,6,5; legibility scrollWidth 119 > 17; span
341≠357) → restored, exit 0; the leg's revert-proof unit tests 3 failed | 7 passed (10) → 10/10.
Full battery on the merged tree: `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run`
1603/1603 (the leg's 1589 + main's 14), `sheet-grammar.mjs` exit 0 both engines (44–52px pitch,
16px inset, 0 native selects, 067 dividers, 007 cards, AND/OR conjunction retained per ADR-B),
`screenshots` ×2 exit 0 480/480 judged by decoded pixel delta over both runs — 1 real mover kept
(`panel-base-import-modal-desktop-light` 66px@Δ209, manifest bytes 65674→65732), 2 one-run Δ1
jitters restored (board-mobile-desktop-dark 2px, board-view-desktop-dark 8px, the rebase's
conflicted binary; its manifest bytes 280379→280394), no other pixelHash moved (manifest's 532
changed lines = the styles.css stamp). css-lane: post-rebase acquire/edit/release triplet for
`071-008-filter-sheet-row-model` signed @`189a3ef0e188` (baselineHash = `shasum(styles.css)`,
confirmed). Evidence: 14/16 STALE after the rebase → all 14 writers re-run exit 0 (replay 28/28
held, sheet-rebuild green) → 16/16 fresh. `npm run gate </dev/null`: **28 green, 0 red** exit 0,
first run. `validate --strict` orchestrator: 008 child, 071 parent's FIRST RESULT and 005 —
**PASSED ×3** (008's graph-metadata needed no change; 005's backfilled once, changed 1).
`scan-comments` 0; `scan-failing-values` 0 (147 bare vs baseline 148 — ratchet holds). Goal 6/7
matches the §5.A row; AC-011 (operator device read, D3) stays the operator's, unticked. Docs:
`operator-checklist.md` regenerated (date-only, 76 phases / 181 rows unchanged). Landed
`48802783..6d5a0d07` after zero push rejections.

### 2026-09-09 ~23:35, 074-test-data-consolidation 0.0.36 testbed ruling leg LANDED+verified on `origin/main` — landing verifier, two rebases, pushed

**Landed SHA `3b15f925` on `origin/main`** (leg commit `1257e34b` replayed twice — over 63fdcc5e as `fc425af9`, then over the 071/007-merged main as `8834369d`; verifier commit `3b15f925`; `git log -1 origin/main` read back). Verified on the merged tree: consolidation.test.mjs asserts 1 database + views exactly `["table", "board"]`; mutations re-proven — a gallery view added to `buildViews()` → RED 2 failed | 6 passed naming it ("Gallery is of type \"gallery\""), guarded-source revert (`catalogue.ts` to pre-leg) → 3 failed | 25 passed, restored 8/8 + 28/28. Screenshots ×4 exit 0 (480 captures; 0 movers across the first pair, 1 real mover on the second pair: chrome-view-switcher-mobile-dark 47px@Δ106, deterministic both runs, kept with its manifest bytes 11641→11587; styles.css untouched, no css-lane triplet); evidence 16/16 fresh (capture-device-parity re-derived after the mover moved its manifest input); vitest 1587→1588/1588 on the 071/007-merged main; tsc 0; build 0. Gate: run 1 FAIL — failing-values: the 074 ruling criterion recorded its numbers but not in the scanner's evidence vocabulary (bare 149 > baseline 148; 071's own bare row had already arrived via 12735ae9) — fixed by rewording the criterion ("RED: 2 failed | 6 passed, the view count was 6 [table, board, calendar, timeline, chart, table]"), baseline file untouched; run 2 PASS — 28 green, 0 red, exit 0. Validate 074 + 005 --strict RESULT: PASSED (074 pre-edit too); scan-comments 0; scan-failing-values 0 (148 = 148). Docs reconciled: roadmap §5 and §5.A 074 figures 3/4 → 4/5 (goal 4/5 — the added ruling criterion ticked; the Finance databases' on-device read stays the operator's, unticked), operator-checklist 074 section 3/4 → 4/5, both packets' graph-metadata backfilled. Both rebases' conflicts: 005/handover.md (both legs' §1 sections kept) and 8× generated artefacts (main's side taken, then re-derived). Pushed `58dc5563..3b15f925` after one non-fast-forward rejection (071/007 + the 272 sheet audit landed mid-verify), resolved by the second rebase + full re-derivation.
### 2026-09-09 ~23:21, 071/008-filter-sheet-row-model IMPLEMENTED (native Sonnet, worktree `274-filter-sheet-rows`, not pushed)

**Implemented, not yet landed to `origin/main`.** The phone Filter sheet's condition rows stack
property/operator/value onto three full-width rows (`renderStackedConditionRow`, phone-sheet-gated
via `isMobileBottomSheet`; the desktop popover and the compact chip-rail editor keep the original
single row), the rule's own actions (turn into group, negate, remove) render as labelled
`createMenuRow` rows off the condition row, Remove in `is-warning` red, and the sheet's row inset
moved from 25.0px to the shared 16.0px by neutralizing the rule-tree's own indent at the sheet's
root only (nested groups keep theirs). The bare `—` empty-value glyph is now a labelled "Value"
placeholder on every presentation. Four new `sheet-grammar.mjs` clauses ran RED before GREEN:
controls-per-row (6/6/5 → ≤4, every stacked row carries 1), name legibility (a 24-char name
scrollWidth 119px > clientWidth 14px → fits), row inset (25.0px → 16.0px), and filter/sort shared
row span (332/357px → 357/357px; group's own 341px predates this phase and is printed, not
asserted — Waived AC-007, Proposed ADR `roadmap.md` §7.17, since closing it needs a `heightRole`
declaration on group's own producer outside this phase's scope). A real tap-target regression the
wider battery found (`sheet-rebuild.mjs`: repeated taps on "+ Add condition" missing once the
stacked list grew tall enough to move the button) was fixed by making that button
`position: sticky`. `005`'s own row-grammar reruns green unchanged, both engines. Full battery:
tsc 0, build 0, vitest 1589/1589 (10 new tests, 3 revert-proof), `npm run screenshots` ×2 +
decoded-pixel review (8 real movers kept, 1 pre-existing unrelated sub-pixel mover kept, 1 jitter
reverted), css-lane takeover-then-release triplet (`007` had released in history without
advancing its top pointer — corrected here), evidence 16/16 fresh, `npm run gate` 28/0, scans 0.
AC-011 (operator device read, D3) stays unticked. HEAD SHA and exact exit codes are in this
packet's own `implementation-summary.md`; nothing pushed — a fresh lander lands it.

### 2026-09-09 ~23:20, 071/007-settings-sheet-strict-alignment card-grouping landing LANDED+verified on `origin/main` — landing verifier, one rebase, pushed

**Landed SHA `5efbafa7` on `origin/main`** (leg commits `9b6daa3e`+`f2e993e6` rebased over the 069/075-merged main as `8bd38d77`+`12735ae9`, verifier commit `5efbafa7`; `git log -1 origin/main` read back). Verified on the merged tree: sheet-grammar card clause GREEN (2/2 cards, radius ≥8px, backgrounds distinct from the canvas, 1/1 gap ≥8px, 2/2 headings above their card, exit 0; 002's row grammar unchanged); mutations re-proven — producer card-wrapper revert → lane RED 0 card containers, exit 1, restored; styles.css card-background declaration → exactly 1 of 7 unit tests fails, restored. Both themes move (the feat commit carries constructed-view-config + board-card-properties dark AND light). Shared header/close untouched (REQ-006: `git diff origin/main..HEAD -- src/views/surface-shell.ts` = 0 lines). vitest 1586/1586; tsc 0; build 0; screenshots ×2 480/480, 0 movers in both recorded runs (an exploratory earlier pair's 2 one-run movers did not reproduce); evidence 16/16 fresh (15 artefacts stale after the rebase, each re-derived by its own tool); gate 28/0 exit 0 (069's lane the 28th); validate --strict RESULT: PASSED ×3 (packet, 071 parent, 005 track — one first-run FAILED on SOURCE_FINGERPRINT_MISMATCH, cleared by the scoped backfill); scan-comments 0; scan-failing-values 0. Docs reconciled: 007 goal 4/5 (fifth criterion the operator's device read, D3 — unticked), 071 goal continuity + progress row updated to LANDED+verified. The four card metrics (radius 8px, inset 16px, gap 12px, canvas/card tokens) stay PROVISIONAL until T001's operator capture. Note: the rebase's conflict resolution initially dropped the leg's 2-line main.js bundle hunk — the fresh build re-derived it; the second rebase (069's own verifier docs) cost one extra backfill. Pushed `63fdcc5e..5efbafa7` after one non-fast-forward rejection, resolved by rebase + targeted graph-metadata regeneration.

### 2026-09-09 ~22:30, 069-board-cross-group-drag 0.0.36 touch-drag leg LANDED+verified on `origin/main` — landing verifier, two rebases, pushed

**Landed SHA `75fb1320` on `origin/main`** (leg commit `b4998c5b` replayed over the 075 strip-lock landing; verifier commit `75fb1320`; `git log -1 origin/main` read back). Verified on the merged tree, not the leg's: harness re-run — real CDP touch input, card backlog→todo, frontmatter read back "todo", `pointercancel=false`, exit 0; mutation (non-passive `touchmove` preventDefault removed) re-proven red (`pointercancel` on the first move, 0 move calls, frontmatter "backlog", exit 1), restored green; desktop harness RESULT: PASSED; vitest 1585/1585; tsc 0; build 0. Screenshots ×2 + pixel-delta: 2 real movers kept (board-view-desktop-dark 4px@1 — the leg's own renderer change against 075's stylesheet; panel-record-detail-sheet-body-empty-desktop-dark 1539px@1 — 075's release rippling into a sheet-body fixture), both persisted across both runs. Evidence re-stamped after both rebases (075's landing moved 5 artefacts' inputs), 16/16 fresh. Gate: `PASS — 28 green, 0 red for a declared reason`, exit 0, the board-touch-drag lane riding as the 28th. Validate 069 + 005 --strict RESULT: PASSED (one FAILED on a stale backfill, cleared by re-running the scoped backfills); scan-comments 0; scan-failing-values 0. Docs reconciled: roadmap §4 leg row renumbered 84→86 (main's 075 rows took 84/85), §5.A 069 figure re-derived 7/8 → 8/9, operator-checklist 8/9, AC-010 stays unticked with the re-read-owed note. Pushed after one non-fast-forward rejection (075 landed mid-verify), resolved by second rebase + full re-derivation.

### 2026-09-09, 069-board-cross-group-drag — the 0.0.36 device report: touch drag dead on phone (this leg)

### 2026-09-09 ~20:30, docs-only leg — human-verification-checklist.md written, worktree `264-human-verification-checklist`

New hand-held companion to `operator-checklist.md`: 33 actionable device entries covering the
still-open §4 rows, the operator-owned AC/D/C rows and the three top-level migration/freeze
goals, grouped by surface with Mobile/Desktop steps and numeric thresholds. Two requested items
(`057` G12/G15/AC-010, `060` D1-D4) are flagged closed-by-obsolescence: the calendar view they
describe is gone from `main.js` since 0.0.35. Orchestrator --strict: PASSED before and after the
scoped backfill (`refreshed: 1, changed: 0`).

### 2026-09-09 ~17:59, docs-only deferral leg — 6 §4 rows whose device read the 0.0.35 view removal made impossible, recorded as deferred, worktree `263-s4-deprecation-deferrals`

Rows 38, 39, 51, 62, 63 and 67: the operator's 2026-09-08 ruling (rows 77-78, 80) removed the
calendar, timeline and chart views (008 landed `69308192`/`7fb9fb28`, shipped 0.0.35), so the
device read each of these rows waited on can no longer happen. Each status cell now heads with
the deferral, the ruling quoted verbatim, its prior state kept intact, nothing ticked. Rows 20
and 37 were judged OUT — row 20's report draws the boundary at table-versus-everything-else
rather than at any one view and 028 closed rows 18-23 with no operator row; row 37's open half
is the board side-by-side, a surviving surface, its gantt half riding row 38 — both named in a
new §7 note and left awaiting. Orchestrator --strict: PASSED before and after the scoped
backfill (`refreshed: 1, changed: 0`).

### 2026-09-09 ~15:20, docs-only truth leg — two top-level goal criteria trued to today's shipped state, worktree `261-goal-criteria-truth`

006's shipped-release criterion ticked with evidence: the hide-and-migrate landed at `e466696b`,
first contained in tag `0.0.22`, with `CHANGELOG.md`'s `## 0.0.23` heading carrying the removal
("The list view is retired"); 0.0.36 at `04524885` is the current release. 005's device-freeze
row kept UNTICKED but its prose refreshed: shipped views are table and board only (list, gallery,
calendar/timeline/chart archived), so the board's observed red is what the operator re-reads on
0.0.36, and the 1.4.1 reference is re-dated as this plugin's pre-0.0.x version at `460d4d7`.
No other criterion touched. Both packets backfilled and re-validated: PASSED.

### 2026-09-09 ~17:05, the depth-cap census leg LANDING-VERIFIED on `origin/main` — mutation replayed, ratchet reconciled, pushed, worktree `260-sheet-depth-cap`

**What the verifier confirmed against the committed leg (`9628171f`, one commit, 20 files):** the
census block in `sheet-grammar.mjs` reads exactly as claimed on a green run — **0 governed of 32
pairs mounted**, `record column submenu` and `import confirm dropdown chain` both reading `depth: 3`
at `parentOffersReplace=false`, and the declined-replace control counted (`sheet=true, depth 3,
governed=true`). The mutation was replayed independently: `getRegisteredParent` made blind → lane
exit **1** on the declined control (governed=false where counted is asserted) and the unit test
failed **1 | 10 passed**; restored byte-identical (`cmp`), lane green again (2332 PASS / 0 FAIL).
`npm run build` 0, `tsc --noEmit` 0, `vitest` **1585/1585** (157 files), `screenshots` ×2 exit 0 with
exactly one mover — `board-view-desktop-dark.png`, 4px, maxDelta 1, one-run — jitter by the rule,
restored; **0 real movers, no styles.css change, no css-lane entry owed**. Rebase onto `origin/main`
`37dd185b` was a no-op (0 upstream commits). **One claim was refuted and fixed in verification:** the
leg's "gate exit 0, 27 green" did not hold on the committed tree — the goal.md tick landed without
re-deriving two lanes: `failing-values` (the ticked row recorded no failing value, **149 bare >
baseline 148**) and `operator-list` (checklist still 4/7). Fixed only by what each lane's message
names: the row now records its watched red (**1 governed pair counted where 0 is asserted**, lane
exit 1, 11 failures, restored byte-identical) and the checklist re-derived to **181 rows / 67
phases**, 067 at 5/7. No threshold touched; the 148 baseline unchanged. Post-fix gate from the final
state: **27 green, 0 red**, `validate --strict` **PASSED** on 067 and 005 after graph-metadata
backfill, `scan-comments` + `scan-failing-values` exit 0, goal fraction re-derived 5/7 = roadmap §5.A
71% = DONE-table. Landed as **`e9c43dba`** (docs reconciliation, 10 files) and pushed
`37dd185b..e9c43dba` on `origin/main`. Nothing left open beyond the operator rows the docs already
name.

### 2026-09-09 ~10:05, `256-engine-parity-inputs` LANDED+verified on `origin/main` — the 009 engine-parity disagreements are now a gate, pushed

**What landed:** the residual leg's single commit `99ca6fc4` (13 files, styles.css untouched) —
rebased onto `7502fa6e` (main's 255-pkg-description landing; seven measuredAt-only stamp
conflicts took main's side, the 005 handover kept both the 255 and 256 sections, no css-lane
conflict) and landed as `f21cf6d5`, with this verification as `1a4c3ff3`. Every claim
CONFIRMED: `tools/live/engine-parity.mjs` exits 0 on its recorded steady state — 23
Chrome-vs-WebKit width disagreements over 67 fixtures, each recorded per scenario/element/
property with its measured delta — and 1 on any NEW disagreement or grown delta, never a
blanket suppression. Mutation: the two add-view-popover deltas planted 215.31 → 255.31 →
exit 1, "steady 21, new 2", exactly the two planted rows flagged; restored → exit 0, "23
(steady 23, new 0)", three consecutive runs. The 23↔47/39 flicker was the harness reading
checked-background transitions mid-flight; the read now awaits every finite
`getAnimations().finished` (allSettled, infinite skipped) in both engines. The record
fingerprints styles.css + theme.css + runtime-vars.css. ADR-001 judged: M1 justified as
recorded-inherent, not "open: fixable" — the deltas ARE the engines' intrinsic differences
(215.31−193 = 22.31; 539.91−521.03 = 18.88; 188.25−170.23 = 18.02) and every disagreeing input
already declares width:100%/box-sizing (styles.css:23542, :15007; the owning popover :23497), so
fixing means inventing definite widths across three surfaces, which the ADR deliberately defers;
M2 (12 deltas, exactly 8px) is headless-WebKit's classic vs this Chrome's overlay scrollbar.
T27 closed with those numbers; 009's decision-record.md (ADR-001) is new this leg.

**Verification numbers**: `npm run build` 0; `npx tsc --noEmit` 0; `npx vitest run` 1584/1584
(157 files) — 1581→1584 is main's naming suite 10→13, not this leg; `npm run screenshots` ×2
plus a third settling pass, exit 0 each, 480 captures — one jittered PNG
(`project-manager/reference-kanban-desktop-dark.png`, 1268px@Δ1, moved in one run only), the
third capture reproduced the committed blobs exactly; `npm run gate` 27 green, 0 red for a
declared reason, exit 0 — engine-parity rides the evidence lane's freshness
(`fresh tools/live/engine-parity.json`), verify-placement inside it 418/420, 2 declared;
`validate --strict` RESULT: PASSED for 009 AND 005; backfill 009 `changed: 0`, 005 re-run after
the roadmap edit; scan-comments 0; scan-failing-values 0. Roadmap §5.A's 009 row: goal.md
criteria 2/6, unchanged — the four open rows are the probe's, no operator/device row touched;
prose updated, the engine-parity lane gates now. The verification commit's 7 `tools/live/*.json`
and 005 graph-metadata.json are measuredAt/fingerprint-only re-derivations.

### 2026-09-09 ~11:40, `255-pkg-description` LANDED+verified on `origin/main` — the 008/004 npm-listing residual, pushed

**What landed:** the residual leg's single commit `8b14f39f` (17 files) — landing-verified in the
`255-pkg-description` worktree and pushed as `51470e56` (leg + this verification's freshness
stamps and roadmap reconciliation). Every claim CONFIRMED: `package.json`'s `description` reads
"Database views for notes with table, board, inline markdown, formulas, and source rules.",
retired mentions 3 → 0; the mention lane judges that field alone, its suite 10 → 13,
mutation-proven (old string restored → 1 failed | 12 passed, scanner exit 1 naming chart 1,
calendar 1, timeline 1; restored → 13/13, exit 0). 004's AC-001 `Met` with the discharge
recorded; 008's goal.md LOG and 005's handover carry it; the roadmap's 008 packet paragraph now
records the residual as discharged (goal figure unchanged at 4/4 — the residual was a LOG
finding, never a criterion).

**Verification numbers**: rebase no-op (`8b14f39f` already on `13bc4632`); `npm run build` 0;
`npx tsc --noEmit` 0; `npx vitest run` 1584/1584 (157 files) exit 0; `npm run screenshots`
×2 exit 0 (480 each, one extra pass to feed the jitter comparison) — `board-view-desktop-dark.png`
jitter (4px@Δ1, one run only) restored with its manifest `bytes` patched back, the REAL mover
`board-mobile-desktop-dark.png` kept (1px@Δ1, moved in both sampled runs); evidence 15/15 fresh
→ no `tools/live/*` re-run; `npm run gate` 27 green, 0 red, exit 0; verify-placement 418/420, 2
declared; `validate --strict` RESULT: PASSED for 004, the 008 parent AND 005; backfills 004/008/005
all `changed: 0`; scan-comments and scan-failing-values exit 0. The seven `tools/live/*.json` in
the verification commit are the gate's own `measuredAt` stamps — content unchanged. Nothing
open: the only blocker left on this packet's books is the operator's device pass on 0.0.35.

### 2026-09-09 ~06:20, `008/003-remove-renderers-and-harness` LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the GLM leg's single commit (`3da33d80`, 203 files, +10628/−23617, "refactor(views): remove the
retired calendar, timeline and chart renderers") rebased onto `18390d30` — which had grown 071/003, 071/004,
071/006, 071/005 and 058-AC-012 — and landed as `69308192a` (201 files, +2789/−9553; the 10 renames preserved at
98–100%, 136 retired captures deleted, 0 added), with this verification as `7fb9fb28`. **How:** 14 conflicts.
`main.js` and `screenshots/manifest.json` took main's side and were re-derived (build 0, the retired-identifier
bundle grep 0, screenshots ×2 480/480); the 071/001 coverage inventory and 10 `tools/live/*.json` evidence
artefacts took the leg's post-removal side, and the 9 whose inputs the merge moved were re-measured by their own
writers (engine-parity steady at 67 fixtures / 23 disagreements — exit 1 informational by design, not a gate
lane). The committed 071/001 inventory had first been regenerated against the pre-derivation 616-row manifest;
regenerated again after the 480-row one (with-captures 68→65), which is what the gate's only red caught.
`specs/005/roadmap.md`'s row 77 gained the Phase-3 LANDED+verified note and its stale "003-004 not yet started /
still nothing removed" tail corrected (002's AC-007 was discharged by the 0.0.34 cut); the 008 progress paragraph
now records 003's 4/4 and 004 still open. **Verified, by numbers:** the bundle grep
`gantt|calendar-renderer|chart-renderer|CalendarRenderer|ChartRenderer` = 0 (was 5); archived code unreferenced
by construction — a value-import + use of the archived timeline renderer still bundles 0, and reverting the leg's
own pin line (`database-view.ts:120`) fails the leg's pin test 1|14, restored 15/15; archived tests ran 0 of 154
files (test files 160→154 = the 5 archived + temporal-tick-parity deleted); the archive READMEs' last-live SHA
`e75a979c9a21f6f9` is an `origin/main` ancestor and `git show` returns real renderer bytes for it; vitest
1571/1571 (156 files); `tsc` 0; pixel-delta: the 61px/204 title-format timestamp mover kept as REAL, the 1px/1
board jitter restored; evidence 15/15 fresh; `npm run gate` **27 green, 0 red**; strict validation RESULT: PASSED
for `008/003` and the 008 parent (after: the parent's `next_safe_action` compacted 101→88 —
`SPECDOC_FRONTMATTER_004`, missed by the leg's child-only validation — then the graph backfill); `scan-comments`
0, `scan-failing-values` 0. Push: the mass-deletion gate (138 deletions > the 100 ceiling) answered with the
documented `SPECKIT_ALLOW_MASS_DELETION=1` single-push bypass — the 138 are the leg's own intended archival.

### 2026-09-09 ~06:50, `058-card-title-and-title-formats` (AC-012) LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the GLM leg's single commit (`781124be`, 28 files, +426/−92, "feat(board): discoverable
card-title control and a self-announcing Title format row (AC-012)") rebased onto `79500b89` — which had
grown 071/005's landing (49ee993d/4c00bf79) — and landed as `e293f5d5` with this verification as the
commit itself. **How:** 12 conflicts. The 10 generated artefacts (`screenshots/manifest.json`, 7
`tools/live/*.json`, `operator-checklist.md`, 071/001's `inventory.md`) took main's side and were
re-derived; `handover.md` kept both landings' intents (071/005's landing-verify closing bullet + this
packet's 058 leg section); `css-lane.json` merged append-only — theirs' 006-release note was a strict
superset (the leg's 4-mover "Follow-up, 2026-09-09" appended) and ours' intermediate entries (incl. the
005-filter triplet, `038a961610dd`) survived; history 448 entries, baselineHash `55cb284b3244` == the
merged `styles.css`. `view-config-panel-renderer.test.ts` and both `graph-metadata.json` auto-merged.
This verification's own commit `e293f5d5` (17 files) carried the re-derived post-rebase truth.
**Verified, by numbers:** mutations replayed — board entry point removed from `row-menu.ts` → the
two-tap lane row red (1 failed | 2 passed), restored 3/3; hint argument → `undefined` → 1 failed |
13 passed (the leg's 1/14), restored 14/14. `sheet-inventory.mjs` no-diff pre-rebase; post-rebase it
regenerated (86→87 surfaces: 071/005's curated group producer) and vitest went 1750/1750. Screenshots
×3 exit 0: the 4 hinted `constructed-board-card-properties` captures reproduced their committed bytes
exactly; 2 REAL movers (board-mobile-desktop-dark 1px@1, board-view-desktop-dark 4px@1, both runs —
071/003's recurring counts) kept and named on the 005-filter holder's release note. Gate: run 1 FAIL
on 2 undeclared lanes, both fixed by their own mechanics (operator-checklist regenerated, 071 → 3/4;
two failing-values rows made legible to the existing vocabulary — 071's "red-before-green" hyphens,
075's "was 398" — no threshold or baseline edits), final **gate: PASS — 27 green, 0 red**, exit 0.
`tsc` 0, `build` 0, orchestrator --strict RESULT: PASSED ×2 (058 + the parent, after backfill, drift
[]), scan-comments 0, scan-failing-values 0 (147 ≤ 148). §5.A's 058 figure 7/8 re-verified, its
AC-scale prose reconciled to 11-of-12. AC-008 stays Unmet — the operator's device read, never
agent-ticked.

### 2026-09-09 ~03:30, `071/006-record-and-menu-sheets` LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the GLM leg's single commit (`77e74368` in this worktree, 42 files, +813/−488) replayed onto
`b8b76435` — which had grown the 066 wave-2 toast, the 0.0.34 cut, `071/003-add-property-sheet` and
`071/004-view-config-sheet` with its landing-verification — and landed as `a10c11ac`, with this continuation's
verification as the commit right after it (`8bd6973e`). **How:** 17 conflicts, all generated artefacts: the 16
(`screenshots/manifest.json` + 15 `tools/live/*.json`) took main's side and were re-derived; `css-lane.json`
merged append-only (main's 066/003/004 histories + the leg's 006 triplet) with a post-rebase 006
acquire/edit/release triplet, holder 006, baselineHash = `8123dd3b4e9e` (sha256 of the merged styles.css);
`styles.css` and `sheet-grammar.mjs` auto-merged. The one real casualty: 004's rewritten definitions lost the
`SETTINGS_COMPACT_ROW_PITCH_*` names the record grammar inherited under their 002-era spellings (gate run 1:
lint 9 no-undef, the sheet-grammar harness dead at `SETTINGS_COMPACT_ROW_PITCH_MIN_PX is not defined`) — the
9 references were repointed to the identical-semantics 44/52 `SETTINGS_ROW_PITCH_*` window and amended into
the replay. **Verified with suspicion, by numbers:** the record grammar — 21/21 property rows 44.0px (border-
box, was 61.0×20+60.0×1), inset 16.0px, 1/1 section headings 16.0px/1px, hairline 20/20 (last 0px), 0 native
selects, extent 401 ≤ 401, 4/4 record menu pairs 44.0px, 0 FAIL; mutations re-proven — deleting the
section-header `border-top` alone flips exactly that lane row (16.0px/0px, lane exit 1, 1 failure), the unit
pin reads 5/5 → 1 failed | 4 passed → 5/5 on the surface-inset revert (`--obnotion-sheet-inset`→`--obnotion-
space-5`); vitest 1747/1747 (162 files = main's 161 + this leg's), tsc 0, build 0; screenshots ×2 616/616 —
12 content movers, every one moved in BOTH sampled runs → kept (chrome-owned-menu-sheet-mobile-dark 2702@5,
active-rule-filter 11897@17, calendar-toolbar-options 6376@15, table-mobile-desktop-light 316@32 — the
leg's own counts reproduced; record-body-empty foursome 1494–6971px@1–2; add-view-dark 159@176; timeline-
year-dark 483@12; calendar-empty-state pair 5/12px@1), 1 jitter (board-view-desktop-dark 4px@max1, run-2
only) restored at committed bytes, its manifest row's styles.css stamp alone refreshed; evidence 15/15 after
the 13 flagged artefacts were re-derived by their own writers (render-assertions exit 0; engine-parity 82
fixtures / 43 differences = 002's recorded steady state, exit 1 INFORMATIONAL by design); scans 0. Gate re-run
**27 green, 0 red**. `--strict` `RESULT: PASSED` on 006, 071 and 005 after the graph-metadata backfill.
Docs reconciled: the 006 goal criterion 2 ticked (1/2 → 2/2, the 003/004 precedent — the before/after is the
lane's printed numbers, the family has no committed PNG), the 071 goal criterion 3's 006 clause (figure stays
2/4, 005 still not started), the roadmap §5.A 071 row, the operator checklist regenerated (185 rows / 68
phases — my first doc edits went red on the operator-list lane exactly as the gate intends). D15: the 061/065/
067 rulings (handle-less anchored card, 44px close, 0.52 scrim, shared shell) not reopened — inherited and
re-proven where the record family mounts its menus (D-005, 4/4 record pairs); no contradiction, no Proposed
ADR owed. The 071 D3 operator device rows untouched, never ticked by an agent. **Pushed:
`b8b76435..8bd6973e` on `origin/main` (the verification pair).**

### 2026-09-09 ~04:30, `071/004-view-config-sheet` LANDED on `origin/main` — landing-verified, rebased, pushed

**What landed:** the GLM leg's single commit (`c820d688` in `.worktrees/245-view-config-sheet`, 38 files,
+1980/−1630) replayed onto `2d9af89c` — which had grown `071/002-settings-sheet`, the 066 wave-2 toast,
`071/003-add-property-sheet` and the 0.0.34 cut — and landed as `f72e50cd`, with this continuation's
verification as the commit right after it. **How:** 24 conflicts. The 5 `styles.css` hunks and 5
`sheet-grammar.mjs` hunks kept 004's — the later redesign of the same settings sheet — while 002's surviving
contribution (the #333333 definition-site `--obnotion-border-subtle` fallback, whose use-site residue 004's
divider already carries) rides the merge, and 002's token-resolvable assertion was carried into 004's unit
suite so that intent keeps a red/green guard. The two legs' same-path
`view-config-sheet-row-grammar.test.ts` add/add resolved to 004's 111-line suite (002's mechanism
declarations — space-between, the heading's border-top, the 4-variant `:has` — are superseded by 004's
documented geometry). `tools/lane/css-lane.json` merged append-only (main's 002/066/003 histories intact)
plus a post-rebase 004 acquire/edit/release triplet, baselineHash = `92ad633b2666` (sha256 of the merged
stylesheet), release 7 reviewed / 0 restores; the 005 handover's continuity took main's and §1 kept both
sections newest-first; the 16 generated artefacts took main's side and were re-derived. **Verified with
suspicion, by numbers:** the settings reference-grammar — 13/13 direction, 6/6 plain-row pitches 48.0px
inside the 44–52 band, 18/18 divider-owing hairlines, 16px insets (21 rows, 2 headings), 0 native selects,
7/7 stacks — 0 FAIL, the 5-part negative control red→green; both mutations replayed (the unit pin's
`flex: 1 1 0`→`1 1 auto`: 1 failed / 5 passed, 6/6 restored; an injected 8px row margin: the pitch row
0/6 @ 56.0px, restored); vitest 1742/1742 (161 files), tsc 0, build 0; screenshots ×3 616/616 — 6 content
movers, all the redesigned surface (241639–332565px, maxDelta 192–209) + calendar-empty-state-mobile-light
12px@1, every one moved in BOTH sampled runs → kept, 0 restores, 2 one-run movers reproduced their
committed blobs (variance recorded); evidence 15/15; engine-parity 82/51 (main's 43 + 8, the
panel-invalid-events-modal checkbox-background rounding 0.016 vs 0, exit 1 INFORMATIONAL by design);
check-lane 0; scans 0. **The gate's one red, fixed at its cause:** run 1's sheet-grammar
scrollWidth (390) vs clientWidth (389) — 002's #333333 fallback resolves the sheet's own 1px left border
and 004's hunks measured raw scrollWidth where 002's instrument measured the extent — so the
extent-minus-border rule was carried into the 004 instrument; gate re-run **27 green, 0 red**. `--strict`
`RESULT: PASSED` on 004, 071 and 005 after the graph-metadata backfill. Docs reconciled: the 071 goal
criterion 3's 004 clause + LOG row + continuity, the 004 goal's continuity, the roadmap 5.A 071 row; the
operator checklist regenerated (185 rows / 68 phases). 004's goal 3/3, the 071 parent 2/4 (005/006
outstanding; the no-regression criterion is judged at the parent's close). The 071 D3 operator device row
untouched, never ticked by an agent. **Pushed: `2d9af89c..HEAD` on `origin/main` (the verification pair).**

### 2026-09-08 ~23:55, `071/002-settings-sheet` LANDED on `origin/main` — landing-verified, twice-rebased, pushed

**What landed:** the GLM leg's two commits (`f0ffadc7`+`70ee0b95` in `.worktrees/242-settings-sheet-notion`)
replayed onto main twice — over 072/073/074/008-002, then again over 656249dd's evening goal reconciliation —
and landed as `5aa0ffd4`+`8b213929`, with this continuation's verification at `7d468a99`. **How:** conflicts
per the brief — 15 `tools/live` census JSONs took main's side and were then re-derived (12 of 13 stamps-only;
engine-parity 50→43 disagreements, the 7 `panel-view-config-sheet` cross-engine (Chrome vs WebKit)
input-width disagreements the settings edit itself closed; exit 1 stays INFORMATIONAL by design);
`tools/lane/css-lane.json` → both sides' histories kept append-only plus a post-rebase 002
acquire/edit/release triplet, baselineHash = `ab74688a3dca` (first 12 of sha256 of the merged stylesheet),
release note finalized after the recapture (8 reviewed, 6 movers, 0 restores); the 005 handover's
divergent §1 bullet lists and 002's goal.md progress/deviations rows union-merged. **Verified with
suspicion, by numbers:** settings rows 12/12 compact one-line @ 48.0px, 9/9 editors, headings 16px+1px,
extent 401 == 401 at 402px, selects 0 native / 4 own pickers — sheet-grammar 2134 PASS / 0 FAIL on the
merged stylesheet; both mutations replayed red then restored (lane `4/9 + 5 overflow` FAILs, unit test
1 failed / 5 passed); the 0.0.31 guard-row fix still green; gap-table reference columns honestly `TBD`
(no third-party reference carries readable measurements — harvest.json, anytype sources.md and 001's
inventory checked by script) ⇒ goal criterion 2 unticked, **goal 2/3**, `acceptance-criteria.md` 3/3
`Met`; screenshots ×3 616/616, 6 movers 0 restores (4 = 073's reference-size checkbox glyphs inside the
replayed settings surfaces, board-view-desktop-dark 4px@1 both runs, constructed-toolbar-add-view-mobile-light
96px@196 third pass); vitest 1733/1733 (160 files); gate 27/0 (1st run; the 2nd caught the criterion-2
untick and the operator checklist regenerated, 187 rows / 68 phases; 3rd PASS = final state); validate
`--strict` `RESULT: PASSED` (2 advisory warnings, unchanged); scans 0. Docs reconciled: 002 goal/impl-summary,
071 goal (frontmatter + criterion-2 note + progress row), roadmap row 74 → LANDED. The 071 D3 operator
device row untouched, never ticked by an agent. **Pushed: `d43e38d5..7d468a99` on `origin/main`.**

### 2026-09-08 ~22:29, evening resume ritual — goals refreshed, implementation still paused

**What landed since the morning scaffold (`bf694181`), each verified by a fresh lander:** `070`
(`a75a1ae2`, + handover `8fa18d48`) → release **0.0.33** (`f91370f1`, tag, workflows green,
installed to the operator vault); `008/001` (`7a6d4cc6`, +`27be49b5`); `075` (`8aec7d64`,
+`90e60d00`); `071/001` (`31f712c3`, +`14bcaf10`); `008/002` (`b5f4ccd4`, +`9ffa7ed2`); `073`
(`f846e605`, +`8750c3c2`); `074` (`f2df348d`, +`00cb6686`); `072` (`91501ed5`, +`6365dfb1`).

**Built, landing pending (their landers were paused by the operator mid-run, worktrees untouched
since):** `071/002-settings-sheet` at `70ee0b95` (`.worktrees/242-settings-sheet-notion`, lander
paused mid-rebase, rebase conflicts); `066` AC-010/AC-011 (toast dwell 5000→3500ms, 56×67px close
hit) at `8bc8f050` (`.worktrees/243-toast-dwell-and-close`, lander paused mid-chain before rebasing
onto `origin/main`).

**In progress, uncommitted:** `071/003-add-property-sheet` (`.worktrees/244-add-property-sheet`),
`071/004-view-config-sheet` (`.worktrees/245-view-config-sheet`).

**Docs reconciled this pass:** `070`, `072`, `073`, `074`, `075`, `071/001`, `008/001`, `008/002`
goal.md criteria checked against their landed evidence (`071/001` and `008/002` still had stale
Log sections despite ticked criteria — fixed); `066` and `071/002` goal.md logs annotated with
their built-unlanded state; the `008` and `071` parent `goal.md` DONE tables and continuity
refreshed; the `005` parent `goal.md` DONE table's `072`/`073`/`074` rows corrected from stale `0/N`
placeholders to the recounted `4/4`/`4/5`/`3/4`; `roadmap.md` §5.A gained the six missing
`070`-`075` rows (the table stopped at `069`); §4 rows 74/75/81/82 updated from "opened, blocked" or
"opened, not started" to their actual unblocked/built/in-progress state; `operator-checklist.md`
regenerated.

**Delegation rulings, verbatim, folded into `goal-prompt.md`:** *"Use GLM 5.3 flash max as much as
possible for any implementation work"*; *"Only using one Opus 5 xhigh orchestrator at a time of you
are the master orchestrator/ reviewer of"*; *"Scaffold phases with sonnet 5 xhigh"*; and the resume
ritual itself — on resume, refresh goals first and post the updated body before continuing.
GLM launches at `--thinking high` (`max` hangs on launch); GLM legs need a write-first brief (first
tool call writes, ≤3 calls between writes) or they run read-only for 20-45 minutes and are killed;
four legs (`070`, `075`, `008/002`, `066`) escalated to Sonnet after two write-free GLM runs each.

**Implementation stays paused** per the operator's 20:01/20:20 instruction until this body is
reviewed. Next: land `071/002` (resume its paused rebase) then `066`, cut 0.0.34, then `008/003`.

### 2026-09-08 ~20:05, `072-linked-view-blocks-ux` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `085e55d5` (GLM, feat(linked-views), 36 files, +2620/−1251) replayed as `4123c05d`
onto `00cb6686` (12 commits: 071/001, 008/002, 073, 074 and 074's fixture consolidation), plus
this verifier's reconciliation `91501ed5`, on `origin/main` (`00cb6686..91501ed5`, push 1, no
rejection). 21 conflicts: 20 generated artefacts taken from main's side (`main.js`, the
screenshot manifest, `005/graph-metadata.json`, 17 `tools/live/*.json`); `css-lane.json` merged
append-only (main's 073 events + the leg's 072 triplet, holder 072) with the events-array seam
the first splice dropped repaired; the track handover kept both landings' bullets, 072's (the
newest landing) on top. What the verification re-observed rather than trusted: both claim-named
mutations — (a) `bindLinkedViewTouchMove` no-op'd → **2 failed / 28 passed** (the leg's claimed
red), restored 30/30; (b) the `.is-touch-lifted` rule lifted → the lane still PASSED, because
the lane asserts only the resting handle's 44×44 + `touch-action: none` — the lifted treatment's
only automated witness is the unit tests' class toggle; recorded, not patched.
`board-cross-group-drag` 0; the lane PASSED post-rebase with no 074-fixture repoint needed. 13
stale evidence artefacts re-measured by their own tools (`styles.css`
`e061ee373e17`→`42b9b9fafd8c`); `engine-parity`'s fresh 50-diff list is identical to the leg's
own pre-rebase measurement — 6 fewer than 074's 56, all six the `panel-computed-cleanup-modal`
checkbox rows, 0 new. Screenshots twice (616/616, exit 0): 1 real mover kept across both
passes, `chrome-owned-menu-sheet-mobile-dark` 2702px @ maxDelta 5 — the same numbers the leg
recorded; the leg's other 3 movers now reproduce their committed bytes and drop out; named in
the lane's post-rebase acquire/edit/release (`42b9b9fafd8c`), `check-lane` 0. The
failing-values ratchet: 072's three vocabulary-bare `goal.md` criteria recorded their
moved-FROM numbers (the pre-fix gesture paths "was 0 of 2", "was 0" enumerated defects, "was 0
of 1" devices) — no threshold edited; PASS at 148/148. Roadmap: the §5 "none yet started"
bullet reads implemented+verified **4/4** (criterion 4 is the device-ROW-RECORDED row;
`acceptance-criteria.md` AC-004 stays recorded-unticked — the operator's), and §4 row 71 gained
the LANDED clause; defect rows 4-6 (table row / view-tab / switcher, HTML5-only) stay recorded
deferrals. `npx vitest run` 159 files / 1727 tests, `tsc --noEmit` 0, `npm run build` 0,
`npm run gate` **PASS — 27 green, 0 red** (run 3; run 1's single red was failing-values before
the criteria reconciliation), `validate --strict` PASSED on 072 and 005, `scan-comments` 0,
`evidence --check-all` 15/15 fresh, 005 + 072 graph metadata backfilled.

### 2026-09-08 ~22:40, `004-view-config-sheet` implemented in `.worktrees/245-view-config-sheet` — gate 27/27, validated strict, NOT yet committed

**Implemented, not landed.** The settings sheet's rows (the view-config panel, inventory row 42's
surface) left 002's column-stacked shape for the reference's one-line list grammar: 13/13 plain
rows label-left/control-right, 6/6 pitches 48.0px (the reference band 44–52; they measured
54.0–78.3px red), 18/18 divider-owing rows with the 1px hairline inset 16px left / 0px right
(extent-minus-border, divider token with a literal rgba stand-in because the harness defines no
`--background-modifier-border`), section headings at the sheet's 16px inset (was 12px), 0 native
selects, 7/7 stacked editors still ≥90% width, no horizontal overflow (390 == 390). The five
wide-editor shapes keep 002's stacked shape via `:has` exceptions — 002's own width finding is why
(ADR-001 in the packet's new `decision-record.md`; the divider-as-measured-`::before` and the
flex-basis-0 field are ADR-002/ADR-003). The lane's reference grammar + negative control landed in
`tools/live/sheet-grammar.mjs` (run 1), the unit pin `src/views/view-config-sheet-row-grammar.test.ts`
is proven to fail against a reverted line (1 failed/5 passed on `flex: 1 1 0` → `1 1 auto`, 6/6
restored), and the whole ladder is green from the final state: tsc 0, build 0, vitest 1729/1729,
sheet-grammar/render-assertions/touch-targets/verify-placement 0, `npm run screenshots` twice
(616, exit 0 both; pixel-delta: 6 content moves, all the redesigned surface — view-config 342–345k
pixels/maxDelta 176–196, board-card-properties 440k/194–209 — 2 board-view 1–4px/Δ1 byte movers,
run 1's 11px jitter restored identical in run 2), the 11 evidence artefacts the stylesheet made
stale re-derived by their own producing tools then 15/15 fresh (engine-parity: 82 fixtures, 43
differences, none in this family — the 074 record's 50 predates this markup; still exit 1,
pre-existing, not a gate CHECK), `check-lane` 0 after the acquire/edit/release takeover (release
names all 6 content moves; the takeover rides this leg's single commit — ADR-004), `npm run gate`
**27 green, 0 red**, `scan-comments`/`scan-failing-values` 0, packet `--strict` RESULT: PASSED,
graph metadata backfilled scoped to `004-view-config-sheet`. Accepted: AC-001–003 Met with
evidence; the operator device recheck stays unticked; the reference side is measured by number,
not by eye (headless leg). Still owed: the operator device recheck; the commit (this worktree,
`245-view-config-sheet`, branch off origin/main at 14bcaf10); `../changelog/` still does not exist
(002/003 precedent) — recorded in the packet's limitations. Details in the packet's
`implementation-summary.md`, `decision-record.md`, `tasks.md`, `acceptance-criteria.md` and
`spec.md` §4, and the worktree's own untracked `.handover.md`.

### 2026-09-08 ~16:45, `074-test-data-consolidation` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `4528a939` (GLM, test(mock-data), 42 files, +2088/−14493) replayed as `4a565ef9`
onto `8750c3c2` (15 commits: 073, 008/001, 075, 071/001, 008/002 and the landing docs), plus this
verifier's reconciliation `f2df348d`, on `origin/main` (`8750c3c2..f2df348d`, push 1, no
rejection). 9 conflicts, 8 generated: the 7 stale-prone evidence JSONs taken from main's side
then 4 of them (capture-device-parity, renderer-coverage, touch-targets, unstyled-links) stale
against the leg's moved inputs, re-measured by their own tools — `evidence --check-all` 15/15;
the operator checklist regenerated (191 rows — 074 collapses to its one unticked criterion);
the track handover kept both landings' bullets. What the verification re-observed rather than
trusted: the one-dataset claim read from the catalogue itself (`useCases` = 1, id `testbed`, 36
records, 28 columns), `coverageOf()` 13/13 plugin column types, 0 missing, views = the 5
survivors + the deliberately sorted-and-filtered second table (list/gallery's removal confirmed
by `src/data/list-migration.ts` + `gallery-migration.ts`); the second, Finance fixture read from
the cold-cache lane's own ids (`finance-reports-fixture` + `testbed-fixture`), both guarded by
`consolidation.test.mjs`; the registry's mutation re-run by hand (2nd `USE_CASES` stub → red,
restored → 6/6); 071/001's `sheet-inventory.mjs` regenerated BYTE-IDENTICALLY post-rebase (86
surfaces, coverage 40 = 19 + 21, its 9 tests green) — the consolidation moved no inventory row;
screenshots twice 616/616, the only 2 movers 1-pixel/maxDelta=1 jitter, each moved in one run of
two, restored → 0 committed captures moved, `screenshots:verify` 616 match, `styles.css` and the
css lane untouched (`baselineHash` already `e061ee373e17`). `npx vitest run` 159 files / 1723
tests, `tsc --noEmit` 0, `npm run build` 0, `npm run gate` **PASS — 27 green, 0 red**,
`validate --strict` PASSED on 074 and 005 (backfill before the second), `scan-comments` 0,
`scan-failing-values` PASS (439 ticked criteria / 76 phases). Docs reconciled: 074's roadmap
"none yet started" bullet now reads implemented+verified **3/4** — the one open criterion is the
Finance databases' on-device read, the operator's own row; `testbed-proposal.md`'s vault
adoption is likewise the operator's.

### 2026-09-08 ~16:09, `073-checkbox-controls` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `1216e843` (GLM, 127 files, +2114/−1474 pre-rebase) replayed as `486aeb70` onto
`9ffa7ed2` (14 commits: 070's landing docs, 008/001, 075, 071/001, 008/002), plus this verifier's
reconciliation `f846e605`, on `origin/main` (`9ffa7ed2..f846e605`, push 1, no rejection). 23
conflicts, all generated but two: 21 artefacts taken from main's side and re-deribed
(13 stale evidence JSONs re-measured by their own tools — `renderer-coverage`'s owner is
`render-assertions.mjs`, not its namesake; `capture-device-parity` went stale only through the
legitimately moved manifest); `css-lane.json` merged append-only (main's 401 history entries +
073's 3, holder 073, `baselineHash` recomputed = `e061ee373e17`, the 075+073 merged stylesheet)
plus a post-rebase acquire/edit/release naming the 4 real movers; the track handover kept both
landings' bullets. What the verification re-observed rather than trusted: the `touch-targets.mjs`
diff (138+/9−) is every number a measurement premise (glyph exactly 16, `::before` hit ≥44, band
14–18) and no threshold relaxed; radios 0 in `src` (the one bare-`"radio"` grep hit is the
icon-picker keyword); both claim-named mutations red→restored→green (−15px→−14px: 1 failed/exit 1
→4/4; column-width role→radio: 1 failed/exit 1→14/14); the control-geometry pass re-read 94
glyphs/0 radios/board 36-18-0, but only asserts field presence — so goal criterion 4 (the board
card renders the checkbox with its real value, dependent on 070) was **unticked** with that reason
recorded, leaving goal 4/5. Ratchets 171/785 unchanged; placement 413/415+2 declared; vitest
1717/1717 (158 files), tsc 0, build 0. Three capture runs (616, exit 0; a third was needed because
the pixel-delta bookkeeping lacked a prior-run sample): 4 REAL movers named in the lane's
post-rebase release, 2 ≤12-delta movers restored at their committed bytes. Evidence 15/15 fresh;
engine-parity 56 = the recorded 50 + exactly 6 new, 0 vanished (075's label spans, informational,
outside the gate). `npm run gate` **PASS — 27 green, 0 red**. `validate --strict` PASSED on the
packet and the track (the goal untick first broke `GENERATED_METADATA_INTEGRITY`'s stored
fingerprint; fixed by `backfill-graph-metadata.js`, never by editing derived fields).
`scan-comments`/`scan-failing-values` 0. Roadmap §4 row 72 (line 424) records the landing and the
4/5 figure (§5.A is 000-058 by its own header, so the 070/075 precedent of the §4 row applies).
`acceptance-criteria.md` AC-001…004 Met, **AC-005 (the operator's own device) stays Untmet** —
the last step before the packet closes.

### 2026-09-08 ~16:20, `008/002-settings-redirect-and-migrate` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `bd09bd30` (Sonnet, feat(views), 41 files pre-rebase) rebased onto `14bcaf10`
(11 conflicts: `main.js`, `screenshots/manifest.json`, the 2 `constructed-toolbar-add-view-mobile-*`
PNGs and 7 `tools/live/*.json` — main's side taken, artefacts re-derived after; `toolbar-renderer.ts`,
the 005 handover and `css-lane.json` auto-merged, the leg's 5-clause picker filter surviving intact) →
`e6445bb7`, plus this verifier's reconciliation `b5f4ccd4`, on `origin/main` (`14bcaf10..b5f4ccd4`,
push 1, no rejection). What the verification re-observed rather than trusted: both mutations —
chart's toolbar filter clause dropped → 2 failed/13 passed, restored 15/15; the on-open timeline
hook deleted from `database-view.ts` → 1 failed/14 passed, restored 15/15 (a literal comment-out
stays green because the tests match the call text, which the comment preserves). Full vitest
1716/1716 (158 files; the leg's 1707/157 plus 071/001's 9-test inventory suite) — which first
exposed one real casualty of the rebase: 071/001's committed `inventory.md` went stale on the
code's new `database-view.ts`/`toolbar-renderer.ts` line numbers, regenerated via
`tools/storybook/sheet-inventory.mjs` (86 surfaces, its 9 tests green). Build 0, tsc 0.
Three detached capture runs judged by decoded pixel delta, not pixelHash: 5 movers kept
(add-view-popover-desktop-light 42px/maxDelta 132, constructed-toolbar-add-view-mobile-dark
379898px/206 and -light 398519px/209 — the redirect's withdrawn picker rows; the desktop pair's
committed blobs already carried the change and regenerated byte-identical — board-mobile-desktop-dark
1px/1, timeline-view-month-mobile-light 2689px/49), 2 single-run ≤12-delta movers restored
(panel-base-import-modal-desktop-light 3px/6, constructed-calendar-empty-mobile-light 79px/11,
manifest bytes patched back). styles.css never moved: sha256-12 stays `704f768371da` = the lane's
`baselineHash`, so the 4 add-view captures staycovered by the 009-live-verification release's
existing `reviewed` entry and the 3 genuinely-new mover names were appended to it — no new
acquire/edit/release triplet. Evidence: 3 of 15 artefacts stale (capture-device-parity,
renderer-coverage, sheet-rebuild — the leg's src edits), their own tools re-run, 0 stale after.
`npm run gate` **PASS — 27 green, 0 red**. `validate --strict` PASSED on 002 and the 008 parent
(one caught error: my first `recent_action` was 108 chars, SPECDOC_FRONTMATTER_004; shortened and
backfilled). `scan-comments` 0 violations, `scan-failing-values` PASS. Docs reconciled: 002's
goal criteria ticked 2/2 with evidence (neither names the operator or a device; `completion_pct`
100), roadmap §4 row 77 and the 008 track prose record the landing, AC-007 stays **Unmet** until a
release carries the redirect — 003-remove-renderers waits for that cut.

### 2026-09-08 ~15:45, `071/001-sheet-story-coverage-audit` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `16547b92` (GLM, feat(storybook), 16 files, +1231/−72) rebased onto `90e60d00`
(7 conflicts, all `tools/live/*.json` measuredAt-only, main's side taken) → `527e8455`, plus this
verifier's reconciliation `31f712c3`, on `origin/main` (`90e60d00..31f712c3`, push 1, no rejection).
What the verification re-observed rather than trusted: the 86-row inventory (54 primary + 32
stacked; rows 1–2 = settings sheet, add-property/property-type picker; 0 blank cells; 68 rows with
captures; 18 primary rows recording "none" captures; 46 rows "none" references; 22 Notion / 33
Anytype) regenerated with `git diff --stat` EMPTY pre-rebase; the 9-test count suite green and
mutation-proven (one primary row deleted → 1 failed | 8 passed, restored → 9/9); the producer greps
reproduced independently — 19 named `extends DbModal` + 1 unnamed trash-restore = 20, 3
`FuzzySuggestModal`, 8 `createSurfaceShell(` call sites, nothing missing from the 86. The freshness
test earned its keep: after the rebase it went RED because 070's landing had shifted
`toolbar-renderer.ts`, so 3 cited producer lines moved :201→:202 (add-view, toolbar-utilities,
toolbar-tab-menu); regenerated, counts unchanged, `vitest` 1681/1681 (154 files), `tsc` 0, `build` 0.
Screenshots ran 3×: 5 PNGs kept REAL (3 one-px movers in both delta runs; add-view-popover-
desktop-light 42px/Δ132; timeline-view-month-mobile-light 2689px/Δ49), 4 jitter movers (Δ1, one
run only) restored with their manifest `bytes` patched back; exactly one evidence artefact was
stale — `capture-device-parity.json`'s recorded manifest-hash input — and its own tool was re-run
(146 differing / 0 identical vs baseline 4, PASS); the other 6 freshness stamps were re-measured by
the gate's own lanes (measuredAt only). Gate: **27 green, 0 red** (cold-cache lane intact),
`validate --strict` PASSED for 001, 071 and 005 after `backfill-graph-metadata.js`. Docs reconciled:
071's criterion 1 ("001's inventory table exists…") ticked — the parent figure was 0/4, recorded as
the criterion's failing value, bare ratchet 148→148 — and the 005 DONE-table 071 row corrected
0/4 → 1/4; as 075's entry already found, roadmap §5.A stops at 069, so the §4 row 76 + DONE-table
precedent is what this landing followed. 071's children 002–006 are now unblocked; 002 (settings
sheet) and 003 (add-property sheet) are the mandated next redesigns.

---

### 2026-09-08 ~14:30, `075-toolbar-labelled-buttons` LANDED on `origin/main` — landing-verified, rebased, pushed

**Landed.** Leg `9bcbff0e` (Sonnet, feat(toolbar), rebased onto `27be49b5` over 070 + 008/001) plus this
verifier's reconciliation `8aec7d64` are on `origin/main` (`27be49b5..8aec7d64`, push 1, no rejection).
What the verification re-observed rather than trusted: step-2 mutations replayed — reverting the
`.is-phone` label rule to `display:none` sent `run-phone-toolbar-scroll.mjs` red (EXIT 1, every control
bare, scrollWidth 398 / clientWidth 398, no overflow) and reverting one control's 44px height sent
touch-targets red (EXIT 1, the labelled filter measured 44x28 / 72x28 under its 44px RAISED floor,
baselines 171/785 unchanged); both restored, the same tools green (EXIT 0, 532/398, last control
reachable, 171/785). No vitest test file was added by the leg, so the guarded source line
(`toolbar-primitives.ts`'s `appendToolbarControlLabel(button, options.label)`) was mutated instead:
red again, exactly the three cluster buttons unlabelled. Labels the leg chose read **Filter / Sort /
Properties / Group / Settings / More tools** — the reference's fourth control ("Properties or
Columns") landed on Properties, which the reference's own vocabulary offers; note for the operator:
"New" carries no label (the creation control keeps its existing shape) and the reference's "+ New"
label is therefore not reproduced — judged a finding, not a failure. Desktop/embedded stay 28px
icon-only per ADR-001. Post-rebase: 7 evidence artefacts taken from main's side were stale by design
and were re-derived by their own tools (`evidence.mjs --check-all` 15/15 fresh); 4 PNGs moved
deterministically (1-12px, maxDelta 1, both runs) and were judged REAL, not jitter, by the tool's own
both-runs rule; the leg's 10 toolbar captures did not move again. The failing-values lane went red
once (151 bare vs 148) and was fixed by recording the criteria's failing numbers in `075/goal.md`
itself, no thresholds touched; the gate then passed three times, the last after every edit: **27
green, 0 red** (cold-cache lane intact), `tsc` 0, `vitest` 1672/1672 (153 files), `build` 0, `validate
--strict` PASSED for 075 and 005 after `backfill-graph-metadata.js`. Docs reconciled: roadmap §4 row
83 and the parent goal.md DONE table now carry the 4/5 goal figure (the fifth criterion is the
operator's own device row — never agent-ticked); FINDING: roadmap §5.A's table stops at 069, so no
075 (or 070-074) §5.A row exists to update — 070's landing set the precedent of §4 + DONE table
instead.

---

### 2026-09-08 ~11:40, `008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit` LANDED on `origin/main` — landing-verified and reconciled

**Landed.** The GLM docs leg's `ea9fcaba` (rebased without conflict to `13aeac68` over 070's four
commits — `694d7390`, `a75a1ae2`, `8fa18d48`, the 0.0.33 release — the leg's six files are
packet-docs-only) plus this verifier's reconciliation `7a6d4cc6` are on `origin/main`
(`f91370f1..7a6d4cc6`). What the verification re-observed rather than trusted: the operator's vault
re-grepped read-only — **15** `db_view` files, **76** views, exactly **11 calendar / 11 timeline /
11 chart** (all 33 inside the eleven `Database Testbed` databases; `Finance/*` = table/board only;
0 gallery/list; 0 `defaultViewType` overrides; 0 fence-configured), 9 of the 33 §2.1 rows re-read
at their exact `file:line`; the `src` occurrence counts reproduced exactly (calendar 2767, timeline
2756, gantt 765, chart 3236); the README/manifest/package strip list read verbatim at
`README.md:3,19,20,21,23,73` / `manifest.json:6` / `package.json:4,61`. Goal figure 3/3 — no
criterion names the operator or a device, so nothing was left unticked.

**Two 007-era line anchors were wrong even at the pinned `bf694181` and are what the reconciliation
fixed** (corrected on the leg's own tree, not shifted by 070): `migrateListViewOnOpen` is *called*
at `embedded-database-renderer.ts:746` and *defined* at `:825` (the 007-002 gallery copy `:745`/`:782`),
not `:742,776-800`; and the main-view counterpart calls sit at `database-view.ts:12164-12165`,
inside `refresh()`, not `:11678`. `inventory.md`'s other 20+ spot-checked anchors were all correct
at the pin.

**Gates at the reconciliation's final state:** `build` 0, `tsc` 0, `vitest` 1672/1672 (153 files),
`gate: PASS — 27 green, 0 red` (the 070 cold-cache lane counted; it was on main before this leg's
rebase). Screenshots ran three times: each run's movers were jitter-class and self-healed by the
next (largest: `timeline-view-month-mobile-dark` 59px/Δ47, matched committed the run after), so the
final tree is byte-identical to the committed captures — no css-lane movement, no release entry.
No `tools/live/*.json` went stale (gate churn was `measuredAt`-only, restored, same precedent 070
used). No test file shipped (docs-only leg — no mutation testing owed; the three naming scans and
the operator-checklist `--check` all exit 0). Child and parent both `RESULT: PASSED` after their
backfills (child: refreshed 1; parent: changed 0). **Still open:** 008/002-004 — nothing removed
yet; the redirect charter is `inventory.md` §5-§6.

### 2026-09-08 09:44, `070-ios-view-data-regression` LANDED on `origin/main` — landing-verified and reconciled

**Landed.** The leg's `694d7390` plus the landing's reconciliation commit are on `origin/main`
(`bf694181..a75a1ae2`; the leg needed no rebase — `origin/main` was still exactly `bf694181`, where
the leg had parked). What the landing-verification pass re-observed rather than trusted: the
mutation battery replayed with the `metadataCache.on("resolved")` subscription commented out — the
cold-cache unit test went red (`expected {} to deeply equal { income: 1000 }`), the harness failed
0/18 table cells and 0/8 board cells (its own `pre-fix-red` mode passed against the mutated
source), and restoring the subscription returned 18/18 + 8/8, exit 0. `tsc` 0, `build` 0, `vitest`
1672/1672 (153 files). Screenshots ran three times; the pixel-delta check (scripts print numbers,
no image reads) found the two SS2 movers — `board-mobile-desktop-dark` (1 px) and
`board-view-desktop-dark` (4 px), maxDelta 1 — moved in only one of the two compared captures, so
both are jitter: the final tree is byte-identical to the committed captures, no css-lane movement,
no release entry.

**The landing's first gate run was 25 green / 2 red, not the leg's 27/0** — the leg's own gate had
run before its final documentation edits. `failing-values` printed the three bare rows; each was
fixed only where its message points, by recording the true failing value: 070's reproduction and
root-cause criteria (the 0/18 → 18/18 pair above), and 005-content-row-rhythm's header-spill
criterion ("was 1 spill (10px at 320px...), recorded 0 spills" — its own prose, now in corpus
vocabulary; bare 147 <= 148). The operator checklist regenerated (203 rows, 69 phases). Goal figure
reconciled 0/6 -> **4/5** (the criteria block is 4 ticked of 5; the unticked one is the device row
and stays unticked) with the landing recorded on the 005 goal's phase row and roadmap section 4 row
70; 5.A itself stops at phase 058, so 070 has no row there to update.

**Continuity, this packet:** the root's continuity block came back 2518 bytes with a dangling
`parent_session_id` (231) and a narrative `recent_action`. Now: `parent_session_id` ->
`surface-system-parent` (a session_id this packet's own spec.md/goal.md record — the kit collects
root-folder docs' session_ids only), three answered_questions pruned to recorded-elsewhere (the
cell-model reading lives in `058`'s packet and the 08:07-08:52 entry below; the eight-children
state lives in the goal phase table; the 0.0.31/NO-Opus line is superseded by this file's own
description), 1967 bytes, `recent_action` 88 chars. The 005 root and the 070 packet both validate
`RESULT: PASSED`, 0 errors 0 warnings, after their own backfills.

**Still open, unchanged:** AC-005 (recapture of the operator's literal vault) and AC-006 (the
operator's own device) — the harness's fixture captures are the only proof either surface renders
populated; the "Total 37 unfiltered" detail stays an open, unconfirmed question recorded in the
packet's goal.md. `gate: PASS — 27 green, 0 red` at the landing's final state, with the
`cold-cache-property-read` lane green.

### 2026-09-08, `070-ios-view-data-regression` root-caused and fixed — code leg, not pushed

**Root cause confirmed with file:line evidence, in `data-source.ts`, not the two suspects the
scaffold named.** `DataSource.getViewDefFiles()` (`data-source.ts:510-566`) — the scan every view
construction runs to find its own `db_view` note — seeds the whole-vault record cache the FIRST
time it is called, using whatever `metadataCache.getFileCache()` reports at that exact moment
(`toRawRecord`, `:1785`). A view restored at first load, before Obsidian's metadata cache finishes
resolving every file, calls this before the vault settles: every record gets cached with `{}`
frontmatter, and `getCachedRecords()`'s own "build once" guard (`if (!this.recordCache)`, `:1794`)
never rebuilds it — the only existing recovery (`refreshCachedRecord`, off
`metadataCache.on("changed")`/`vault.on("create"/"rename")`) only ever refreshes a file whose OWN
such event fires again, which does not reliably happen for a file merely present at boot rather
than freshly edited. The `db_view` note's own frontmatter resolving moments later is why column
headers were always correct while every property stayed empty — the second scan recognizes the
database, but the poisoned record snapshot from the first scan is never rebuilt. `git blame` traces
the exact lines to commit `ce0bb30ec` ("Release 1.2.6", 2026-07-19, upstream) — a pre-existing
latent bug the fresh-load path exposed, not a rename or `058` regression. `title-field-display.ts`
(title/card display only, never a table property cell) and `legacy-plugin-data-migration.ts`
(copies `data.json` bytes only, no `metadataCache`/`vault` read) are both excluded with evidence.

**Fix**: `DataSource.startListening()` now also subscribes to `metadataCache.on("resolved")` —
Obsidian's own identity-less "every file is current" signal — and refreshes every cached record
from it when a record cache already exists. Additive: unchanged behavior when the cache was never
poisoned.

**Evidence**: a new permanent gate lane, `tools/live/database-cold-cache-property-read.mjs` (real
`DataSource`/`RowPipeline`/`TableRenderer`/`CellRenderer`/`BoardRenderer`, headless Chrome, 402x874,
Finance/Testbed-shaped fixtures), reproduced 0/18 table cells and 0/8 board cells populated pre-fix
(`COLD_CACHE_EXPECT=pre-fix-red`), matching the operator's screenshots exactly, and 18/18 + 8/8 with
correct sort post-fix. A mutation-proven unit test in `src/data/data-source.test.ts` was confirmed
red via `git stash` before counting as evidence. Full battery: `tsc` 0, `vitest` 1672/1672 (153
files), `build` 0, `render-assertions`/`sheet-grammar` PASS, `npm run gate` **27 green, 0 red** (26
pre-existing + the new lane), `scan-comments`/`scan-failing-values` 0. AC-001 through AC-004 met;
AC-005 only partially (fixture recapture, not the operator's own vault) and AC-006 remain open —
both need the operator's own iPhone. One open, unconfirmed detail: the operator's "Total 37
unfiltered" row count did not reproduce (the same filtered-view scenario under a poisoned cache
returns 0 matching rows here, not an unfiltered 37) — recorded rather than guessed at. Not pushed;
this leg's worktree diff is `src/data/data-source.ts`, `src/data/data-source.test.ts`,
`tools/gate.mjs`, and the two new `tools/live/*.mjs` files, plus this packet's docs.

---

### 2026-09-08 ~09:46, `075-toolbar-labelled-buttons` IMPLEMENTED — AC-001 through AC-005 Met, gate 26 green, NOT committed at write time

Native Sonnet leg, worktree `236-toolbar-labelled-buttons` off `origin/main` at `bf694181`. The phone
toolbar's filter/sort/group/columns/settings/more buttons gained a visible icon+label via a new
`appendToolbarControlLabel` helper (`toolbar-primitives.ts`), shown only under `.is-phone` and widened
to 44px there; desktop and the embedded/codeblock toolbar are unchanged (ADR-001,
`decision-record.md`, citing `screenshots/notion/web/` and `screenshots/anytype/desktop/` — both keep
their own dense toolbars icon-only with hover tooltips). A new `tools/live/run-phone-toolbar-scroll.mjs`
lane proved the change red-then-green at a 402px viewport (labels present, single line, 44px floor,
`scrollWidth > clientWidth`, last control reachable, scrollbar hidden); a one-line CSS revert
reproduced red and was restored. The two pre-existing toolbar lanes (`009`'s
`run-toolbar-collapse-sweep.mjs`, `044`'s `sheet-grammar.mjs`) reran with identical results before and
after — neither needed a behavioural update, since both mount the embedded/desktop shape this ADR
leaves untouched. Full verification: `tsc`/`vitest`/`build` clean, `verify-placement.mjs` 413/415 (2
declared, unchanged), two `npm run screenshots` passes judged by decoded pixel delta (10 real toolbar
captures moved consistently across both runs; one unrelated jitter capture on
`table-frozen-column-mobile-light.png` reverted), every stale evidence artifact re-run to freshness,
`npm run gate` once at 26 green/0 red, `scan-comments.mjs`/`scan-failing-values.mjs` clean. A
pre-existing, unrelated `engine-parity.mjs` Chrome/WebKit width disagreement was confirmed present on
the unmodified tree too (stash/rerun) — not this packet's controls, left for a separate fix. AC-006
(the operator's own device confirmation) stays intentionally unticked. `validate.sh --strict` PASSED
after a scoped `backfill-graph-metadata.js` run (0 errors, 0 warnings).

### 2026-09-08 08:07-08:52, seven packets opened from the operator's 0.0.32 device pass, and two delegation rulings

`0.0.32` (`f0597bcd`) reached the operator's phone at 08:06; fourteen reports and rulings arrived
between 08:07 and 08:52, verbatim, addressed in this same scaffold pass (Sonnet 5 xhigh, per the
operator's own ruling on scaffolding). Six new packets opened under this parent, one new top-level
sibling packet opened beside `006`/`007`, two existing packets reopened, and one report routed as a
`058` amendment rather than a new packet. Nothing implemented — this pass is scaffolding only.

**R1** *"I removed note database and now all views no longer have data (finance) on ios"*, clarified
*"In ios all properties of finance stuff was empty btw"* → `070-ios-view-data-regression` (P0,
Level 2). **Diagnosis on record before any fix**: nothing was lost by deleting `note-database` —
both the recovered legacy `data.json` and the fresh `obnotion/data.json` hold `databases: []`
(settings only); row values live in each note's frontmatter, confirmed intact on disk
(`Finance/Reports/01 • Jan '25.md` carries `income: 3537.32` etc.); the view definition lives in
`Finance/Finance Reports.md`'s own frontmatter. This is a read/render regression on iOS in 0.0.32
(or 0.0.31, never loaded on the phone), not a data-loss event. Three named suspects, none excluded:
`data-source.ts` (058's titleFormat parse paths), `title-field-display.ts`, and
`legacy-plugin-data-migration.ts`'s data.json bridge.

**R2** *"Also the seperate views from database is pretty bugged ui ux wise and dragging doesnt work
on mobile like it would on notion"* → `072-linked-view-blocks-ux` (Level 2). Ambiguous between
embedded/linked views and table row/column drag; board cross-group drag on mobile already shipped
in `069`, so the packet's first requirement is determining which surface the 0.0.32 build actually
shows the defect on.

**R3** *"Also checkboxes and radios are too big. And also we shouldnt have radio inputs only
checkboxes"* → `073-checkbox-controls` (Level 2), evidenced by the Database Testbed board screenshot
(27 cards, group "No value", each showing a large empty circle labelled "Pinned" over a bare "0" —
the same read regression as R1, compounded by the wrong control shape).

**R4** *"Also how to set a board card name + number format? You know that request i asked about?"*
→ no new packet; routed as `058-card-title-and-title-formats` AC-012/REQ-006/T015. The feature
shipped in 0.0.32 (view settings ⚙ → Title field / Title format rows); the operator could not find
it — a discoverability finding, not a missing feature.

**R5** *"Also settings sheet has really bad ui. Actually all sheets should mimic notion way closer"*
and **R6** *"Also Add property sheet is also completely bugged"* (screenshot: the property-type
picker rendering as a tall sheet covering the note header while the keyboard is up) and **R7**
*"Do we truely have screenshots and stories for every single sheet in app currently?"* / *"We
should and go over them 1 by 1 aligning as close as possible to notion x any type"* →
`071-sheet-notion-anytype-alignment` (Level 3 phase parent, both phase-qualification thresholds met
independently per `recommend-level.sh --loc 1200 --files 25 --architectural` → 73/100, phase score
30/50). Six children: `001-sheet-story-coverage-audit` (active, answers R7, gates every other
child), `002-settings-sheet` (R5), `003-add-property-sheet` (R6), `004-view-config-sheet`,
`005-filter-sort-group-sheets`, `006-record-and-menu-sheets`.

**R8** *"Also I want to deprecate calendar and timeline view completely for now"*, **R9** *"And
remove any mention of that and gallery view from root readme. Do keep the archived code somewhere
for future use for those deprecated views"*, and **R11** *"Also deprecate chart view"* →
`008-calendar-timeline-chart-deprecation`, a new top-level packet, sibling to `006`/`007` (not a
`005` child), Level 3 phase parent (`recommend-level.sh --loc 1000 --files 20 --architectural` →
72/100, phase score 30/50). **Combined into one phase parent rather than three separate top-level
packets** — all three renderers already share one outgoing-view teardown mechanism
(`teardownOutgoingViewRenderer` in `src/views/database-view.ts`, closed for calendar/timeline by
`037`'s 0.0.31 fix), so one coordinated audit, one settings-redirect mechanism and one archive
decision avoids re-litigating the same questions three times; the reason is recorded in the
packet's own `spec.md`/`goal.md`. Four children mirroring `007`'s shape: `001-usage-and-migration-audit`
(active), `002-settings-redirect-and-migrate`, `003-remove-renderers-and-harness`,
`004-archive-docs-and-release`. The removed code is archived, not deleted:
`archive/deprecated-views/<view>/` at repo root, excluded from the build, with a README naming the
last-live SHA and the restore procedure, recorded as an ADR. **`037-timeline-gantt-port`'s recent
landing (`f56931f8`, roadmap §4 row 67) is scheduled for archival once `008/003` lands — its own
history stays, documented as superseded, not deleted.**

**R10** *"Also reduce the test data. Just have 1 big database with an overview, views etc. Alongside
the finance stuff from my notion with data restored"* → `074-test-data-consolidation` (Level 2).
"Restored" means visible again, not recovered — R1's diagnosis already found the Finance frontmatter
intact on disk. The operator's own `Database Testbed/` folder stays operator-owned; this packet only
proposes its consolidated shape.

**R12** *"Also toast like the undo toast stay too long on screen"* and **R13** *"Also toast close
button needs a 56 x 56 click area"* → routed into `066-notion-states-refinement` (reopened): new
AC-010/REQ-008/T021 (dwell, measured against Notion's ~5s reference, red-first against the live
Undo toast) and AC-011/REQ-009/T022 (56×56px close hit area, red-first).

**R14** *"Lets have these style of buttons for sort filter etc"* (reference: an Obsidian Bases
calendar phone toolbar, icon+label buttons — "↑↓ Sort" / "≡ Filter" / "☰ Properties" / "+ New"),
plus *"For mobile add horizontal overflow if it doesnt fit"* → `075-toolbar-labelled-buttons`
(Level 2). The phone toolbar's icon-only cluster gains text labels matching the reference's measured
size/spacing; the row scrolls horizontally (never wraps or collapses) when it exceeds the viewport,
updating the existing `009`/`044` toolbar-collapse lane red-first; the desktop toolbar decision is
explicit, recorded as an ADR.

**Two delegation rulings**, recorded in `roadmap.md` §6A and folded into `goal-prompt.md`'s
DELEGATION line: *"Use GLM 5.3 flash max as much as possible for any implementation work"*
(supersedes the prior NO-Opus-only wording — GLM now carries implementation legs on scripted
numbered briefs) and *"Only using one Opus 5 xhigh orchestrator at a time of you are the master
orchestrator/ reviewer of"* / *"Scaffold phases with sonnet 5 xhigh"* (one Opus 5 xhigh
sub-orchestrator at most, Fable master orchestrator/reviewer, scaffolding on Sonnet 5 xhigh — this
pass).

**Levels were raised above `recommend-level.sh`'s own answer for five of the six `005` children**
(`070`, `072`, `073`, `074`, `075` all scored Level 1 on LOC/file inputs; each was raised to Level 2
by judgment, per the parent's own "when its answer and your judgment differ, go higher" rule, given
the operator-facing rigor each needs — thresholds, red-before-green, an unticked device row).

**Operator evidence referenced but not committed** (personal data / operator-owned captures, cited
by path in the relevant packets rather than copied into the repo):
`ios-finance-table-empty-0032.png` (R1), `ios-testbed-board-checkbox-0032.png` (R3),
`ios-add-property-sheet-0032.png` (R6), `toolbar-labelled-buttons-reference.png` (R14).

**`006-list-view-deprecation` and `007-gallery-view-deprecation` were both `validate.sh --strict
FAILED` on `origin/main` going into this pass** — both on `SPECDOC_SUFFICIENCY_001: goal.md:
missing required anchor 'binding'`, a docs-shape gap: their top-level `goal.md` predates the
`BINDING` section this contract now requires on a phase parent. Both are a same-day fix, not an
open row: a `## 2. BINDING` table (phase → child `goal.md`) was added to each, matching their own
children exactly, `graph-metadata.json` regenerated via the scoped backfill, and both now read
`validate.sh --strict` `RESULT: PASSED` (`006` 0 errors 0 warnings; `007` 0 errors 1 warning,
pre-existing and unrelated).

---

### 2026-09-08 ~06:50, 0.0.32 SHIPPED as the FIX release — six queued landings closed, `009` T26's gate `expectFail` discharged

**Shipped.** `0.0.32` cut at `f0597bcd` (tag `0.0.32`; Release workflow `34188001070` **success**),
carrying every landing queued behind the six-lander order named in the prior refresh, each verified
by a fresh GLM lander before this doc pass:

- **`009` live-host-model**: `6f679e5e` (host stylesheet model, touch ratchets down) + handover
  `3005e5bd`.
- **Timeline→table teardown fix** (owner `037-timeline-gantt-port`, roadmap §4 row 67):
  `f56931f8` (`pm-gantt-view` added to `VIEW_ROOT_CLASSES`, `destroy()` wired on switch) / `b6a0f847`
  (re-derived evidence) + handover `bf775938`.
- **`069-board-cross-group-drag`** (touch long-press lift, ghost, cross-group drop; roadmap §4 row
  68, AC-010 the operator's own phone drag): `86b2e618`..`87ec4c8f`.
- **`067-sheet-family-remediation` follow-up 3** (replaced-body grid, registry retarget, pill/chip/
  header rows): `82971d74` / `fa980f8c` + handover `5024fedf`.
- **`058-card-title-and-title-formats` reopened leg** (file-name title format + `getReferenceRowTitle`
  fix + `titleFormat` persistence; roadmap §4 row 69, AC-008 the operator's own device read):
  `e634e5ef` / `42de57b6` / `1b96a10e` + handover `43f660b5` / `678d535a`.
- **`009` T26 panel-button padding**: `40ac626a` / `e1142536` + handover `97ed0f81` — the
  sheet-grammar `expectFail` this decision required is now discharged; the gate reads **26 green, 0
  red**, no declared exceptions outstanding.

**Hygiene**: two commits, `a35f17ab` and `f7101325`, each stripped a worktree-local `.handover.md`
note a lander had committed into `main` by mistake (225's and 226's legs respectively); the file is
gitignored and neither commit touched a tracked spec doc.

**This pass**: `goal-prompt.md`'s STATE and ORDER OF WORK rewritten for 0.0.32 (body recounted at
3591 of the 4000-character cap; BINDING/PRECEDENCE/RESUME/EVIDENCE/DONE WHEN byte-identical, proven
by diff); DELEGATION amended only to name the untracked-worktree-note lesson from the hygiene
commits above. `goal.md`'s DONE table: `058`'s fraction corrected `0/5` → `7/8` (its own goal.md
Completion Criteria count 7 `[x]` / 1 `[ ]`; the row's older prose narrative was left untouched,
out of this pass's scope); `069`'s landed-SHA text updated from "Not pushed" to the confirmed
`d32d185d` / `87ec4c8f` landing. `067` and `068`'s fractions (`3/7`, `5/8`) were recounted and
already agreed with their own goal.md files — no change.

**Validation**: orchestrator `--strict` on the 005 root → `RESULT: PASSED`; `scan-failing-values.mjs`
and `build-operator-checklist.mjs --check` exit 0. No operator or device row ticked.

### 2026-09-08 ~04:10, `009` T26 LANDED — `.obnotion-panel-button` padding decision verified, rebased onto the 221/225/069/067/058-merged main, pushed to `origin/main` at `e1142536`

**Landed.** The leg's single commit `3b376a8f` replayed as `40ac626a` onto `f7101325`, with this
verifier's `e1142536` (32 files of re-derived evidence) on top; `git log --oneline -1 origin/main` =
`e1142536`. Every claim re-proven from the final state, in the worktree, before the push:

- **Claims**: `padding: 0 6px` on `.obnotion-panel-button` (styles.css:13508) and the
  `.obnotion-panel-button-narrow` marker with the asymmetric `::before` inset (`-6px 0 -6px -12px`,
  styles.css:13529) — CONFIRMED by source read, present at sort-panel-renderer.ts:238,
  filter-panel-renderer.ts:329/604 and in the hand fixture panels.mjs; the touch-targets entry is a
  DECLARED hit-area declaration naming the inset and why its right edge stays at 0, not a silent
  exemption. Fixture baseline 171, constructed 785 — both held, neither raised.
- **Mutations went red on demand**: (a) removing the `padding: 0 6px` declaration →
  `sheet-grammar.mjs` **exit 1, 29 failures** (the claimed count); (b) dropping the narrow class
  from the sort-panel remove button → `touch-targets.mjs` **exit 1, 2 controls newly under 28px**
  (787 vs the recorded 785). Green after restore both times.
- **Rebase**: one stop, 32 conflict files. Generated artefacts (main.js, manifest, 14 PNGs, 15
  tools/live JSONs) took MAIN's side and were re-derived; the tracked worktree `.handover.md` was
  dropped (main had already deleted and gitignored it); this handover merged newest-first;
  `tools/lane/css-lane.json` merged append-only (base 384 + main 10 + leg 3 entries) with
  `baselineHash` recomputed to `704f768371da` = the merged styles.css by `shasum -a 256` — the
  stylesheet auto-merged, keeping both intents (this packet's padding + 069's touch-lifted/ghost
  rules).
- **Re-derived on the merged tree**: build 0, tsc 0, vitest **1671/1671** (153 files), screenshots
  seven passes (616 entries, exit 0 each), every mover judged by decoded pixel delta across the
  final two recorded runs: **13 real changes moved stably in BOTH runs** — the 12 mobile panel
  captures (changedPixels 3–9755, maxDelta 1–209; the ten sort/filter/board-groups ones carry this
  packet's own content, column-manager's two are 3px/8px antialiasing with pixelHash unchanged) plus
  board-subtask-tree-mobile-dark (38px, maxDelta 121) — all named in a css-lane release entry
  (check-lane exit 0, "release names all 9 changed capture(s)"). 2 jitter files restored per the
  maxDelta ≤ 12 single-run rule (board-view-desktop-dark, board-mobile-desktop-dark); 34 desktop
  manifest rows reconciled to the PNG blobs the rebase auto-merged (byte compare proved no image
  content changed — only manifest rows moved). All 15 `tools/live` evidence artefacts fresh;
  verify-placement 413/415 (2 declared red); engine-parity still exits 1 on its pre-existing 50
  Chrome/WebKit width disagreements (not gated, left open).
- **Gate**: exit 0, **26 green, 0 red for a declared reason** — the sheet-grammar expectFail this
  leg removed stays removed on the rebased tree.
- **Validation**: orchestrator `--strict` on 009 and on the 005 root → `RESULT: PASSED` (before and
  after `backfill-graph-metadata.js`, which refreshed 1 and changed 0 on 009, then the 005 root
  again after this entry landed); scan-comments and scan-failing-values exit 0.
- **Roadmap**: §5.A's 009 row already derived to **33% — 2/6** from goal.md's own criteria count —
  no edit needed. No operator or device row was ticked.

### 2026-09-08, `009` T26 LANDED — `.obnotion-panel-button` padding decision, committed, NOT pushed

**Worktree `.worktrees/227-panel-button-padding` (branch `worktrees/227-panel-button-padding`),
forked from `origin/main` at `6f679e5e0` (past the `221-live-host-model` landing below).** Closes the
`009 T26` device defect the 221 leg recorded rather than fixed. The overflow sweep's own diagnostic
(a temporary `getBoundingClientRect`/`textContent` print, reverted after use) corrected one detail
of 221's note: the two overflowing descendants at every reported scenario are the sort rule row's
own **two "×" remove buttons** (one per rule row, sharing an x-position because both rows share the
same `CONDITION_FIELD_FLOOR_PX`-driven layout) — never the standalone "+ Add sort" button 221 named
as one of the two.

**Decision, reviewed across every consumer T26 named plus two more the review found.**
`.obnotion-panel-button` (styles.css:13508) took an explicit `padding: 0 6px`, chosen empirically
against `tools/live/sheet-grammar.mjs` rather than guessed: `0 8px` still overflowed 1.8-2.8px, `0
6px` clears every scenario (Chrome and WebKit, as-built/stacked-field/stacked-direction/long-name).
`column-manager-renderer.ts`'s `.obnotion-column-manager-add-button` (padding `0 6px`) and
`database-view.ts`/`embedded-database-renderer.ts`'s `.obnotion-group-order-reset` (padding `0
8px`) already carried their own explicit overrides and were left unchanged; `board-groups-panel.ts`,
`filter-panel-renderer.ts`, `view-config-panel-renderer.ts` and `cell-editor-option.ts`'s bare
usages now take the shared base padding, none of them previously overflowing and none newly at
risk (a narrower box cannot overflow more than a wider one measured clean).

**The narrower box dropped three controls under the 28px touch floor** (sort/filter row's "×" at
20x28, the filter header's AND/OR toggle at 26x28) — fixed with a new
`.obnotion-panel-button-narrow` marker (`sort-panel-renderer.ts:238`,
`filter-panel-renderer.ts:329,604`) taking a `::before` inset (`-6px` top/bottom, `-12px` left, `0`
right so the invisible hit area cannot reopen the same overflow) for its real touch target — the
same idiom `obnotion-checkbox` already uses — plus a matching `DECLARED` entry in
`tools/live/touch-targets.mjs`. First attempt used a symmetric `-6px` inset, which passed the
element-level overflow check but reopened the SURFACE's own `scrollWidth` (a `::before` is invisible
to `querySelectorAll` but still paints and counts toward `scrollWidth`); the asymmetric,
right-frozen inset fixed it. The hand fixture `tools/screenshots/scenarios/panels.mjs` needed the
same marker added by hand, since it mirrors the renderer markup rather than importing it.

**Verified: `sheet-grammar.mjs` 29 failures → 0; `touch-targets.mjs` 0 new regressions** (fixture
baseline 171, constructed baseline 785, both held). `npx tsc --noEmit`, `npx vitest run` (1642
tests), `npm run build` all green. Recaptured from a clean index twice (`npm run screenshots`, 608
entries both passes); 51 moved captures reproduced byte-identical across both passes — zero jitter.
Every file judged by decoded pixel delta (`tools/screenshots/pixel-hash.mjs`'s `decodePng`) against
the HEAD-committed PNG: 4px (maxDelta 1) to 24,601px/0.475% (maxDelta 209);
`panel-sort-rules-mobile-{dark,light}` also narrowed 804x450 → 798x450. Four captures opened and
read directly, all correct. `tools/lane/css-lane.json` acquired from `068-rename-to-obnotion` at its
released hash, edited, and released naming all 51 captures; `check-lane.mjs` exit 0. Every stale
`tools/live/*.json` refreshed (`evidence.mjs --check-all` — all 15 fresh; `engine-parity.mjs` itself
still exits 1 on 50 pre-existing Chrome/WebKit width disagreements on unrelated fixtures — not in
`tools/gate.mjs`'s CHECKS list, left alone). The `sheet-grammar` `expectFail` removed from
`tools/gate.mjs`. **`npm run gate`: 26 green, 0 red for a declared reason.** `009`'s `tasks.md` T26
ticked `[x]` with full evidence; `acceptance-criteria.md`'s closure section carries the same
numbers. Graph metadata backfilled scoped to `009-live-verification` only (never `--all`).
Orchestrator validation: `RESULT: PASSED`. No operator or device row touched. Committed, **not
pushed** — a fresh verifier lands it.
### 2026-09-08 ~03:15, `058-card-title-and-title-formats` REOPENED LEG LANDED — verified, rebased onto the 221/225/069/067-merged main, pushed to `origin/main` at `1b96a10e`

**Landed.** The card-title production leg's two commits (`5a357737` format + real-renderer proof,
`cec1223e` titleFormat persistence) replayed as `e634e5ef` + `42de57b6` onto `5024fedf`, with this
verifier's two commits (`33f90502` pre-rebase mutation log, `1b96a10e` re-derived evidence) also on
`origin/main`; `git log --oneline -1 origin/main` = `1b96a10e`. Every claim re-proven before the push:

- **Claims**: the picker pre-existed (`titleField`, `058`'s first landing — CONFIRMED by source read);
  `TitleFileFormat`/`ViewConfig.titleFormat` + the file-name branch through `formatFileTitleText`
  (CONFIRMED, types.ts:359, title-field-display.ts:48); the "Title format" picker row
  (CONFIRMED, view-config-panel-renderer.ts:455/2007); `getReferenceRowTitle` reads `title.text`
  unconditionally (CONFIRMED, board-renderer.ts:585 after the rebase); `titleFormat` at all four
  data-source.ts sites (CONFIRMED, :800/:988/:1246/:1685).
- **Mutations went red on demand**: (a) reverting `getReferenceRowTitle` to the
  `title.isFileTitle ? row.file.basename : title.text` shortcut → `render-assertions.mjs` **exit 1**,
  failing the new real-BoardRenderer scenario — 18 card titles drawn, 18 missing the € mark, 18 still
  reading raw values [3537.32, 9532.82, 15528.32]; (b) dropping `titleFormat` from `toViewPayload` →
  `data-source.test.ts` **exit 1**, the round-trip test failing `expected undefined to be
  'currency-eur'`. Green after restore both times.
- **Baseline raise checked**: failing-values 147→148, exactly +1, the added row naming AC-009's
  never-broken evidence-upgrade criterion — CONFIRMED, no other raise.
- **Rebase**: 2 stops, 18 conflict files. Generated artefacts (main.js, manifest, 2 PNGs, 7
  tools/live JSONs) took MAIN's side and were re-derived; roadmap.md merged keeping main's rows 67
  (timeline) and 68 (cross-group drag), **this leg's row renumbered 67 → 69**; css-lane.json merged
  append-only from the three blobs (base 384 + main 8 + leg 1 = 393) after a text-patch first try
  dropped one main entry — caught by count and rebuilt deterministically. styles.css byte-identical
  to main; `baselineHash` e1de47b5feec = `shasum -a 256 styles.css`, no patch.
- **Re-derived on the merged tree**: build 0, tsc 0, vitest **1671/1671** (153 files), screenshots
  twice (616 entries, exit 0 both) with a decoded pixel-delta pass judging the movers — **3 real
  changes (maxDelta 192/209/121, both runs identical), 0 jitter**, named in a css-lane release entry
  (check-lane exit 0, "release names all 2 changed capture(s)" — the third mover sits outside the
  lane's capture roots); the 7 live JSONs re-run through their own tools, `evidence --check-all` 15/15
  fresh; replay 28/28 hold.
- **Gate**: exit 0, `PASS — 25 green, 1 red for a declared reason` — the red is sheet-grammar's
  declared expectFail (009's padding gap), which main's 067-follow-up-3 landing declared after this
  leg branched (the leg's own 26-green reading predates it).
- **Validation**: orchestrator `--strict` on 058 and on the 005 root → `RESULT: PASSED` (before and
  after `backfill-graph-metadata.js`, which changed 0 files); scan-comments and scan-failing-values
  exit 0.
- **Roadmap**: §4 row 69's verification clause refreshed with the re-derived numbers and the renumber
  note; §5.A's 058 row re-derived to **7/8** goal criteria (88%) and **10/11** AC rows Met. AC-008
  (the operator's own device read) stays open — no operator/device row was ticked.

### 2026-09-08, `067-sheet-family-remediation` follow-up 3 LANDED — verified, rebased onto the 221/225/069-merged main, pushed to `origin/main` at `fa980f8c`

**Landed.** The leg's single commit `5fa01d46` (75 files, no test files) replayed as `82971d74` onto
`87ec4c8f`, plus this verifier's `fa980f8c` (36 files of re-derived evidence), are on `origin/main`;
`git log --oneline -1 origin/main` = `fa980f8c`. Every claim was re-proven from the final state, in the
worktree, before the push:

- **Rebase**: 18 conflicts, all resolved. `main.js`, `screenshots/manifest.json` and 15 freshness
  manifests took MAIN's side (`--ours` = `87ec4c8f`, proven by blob-compare) and were then re-derived;
  `tools/lane/css-lane.json` merged by hand keeping BOTH sides' entries append-only and chronological
  (069's acquire/release at 20:50/21:05, then 067's acquire/edit/release at 21:10/21:40/21:55), header
  holder 067, `baselineHash` = `e1de47b5feec` = the post-rebase `styles.css` by `shasum -a 256`. The
  stylesheet itself merged CLEANLY — its delta vs `87ec4c8f` is exactly the leg's three hunks plus
  commentary (45+/17-). Because the 75 files carried no test files, the leg's guards were proven by
  their own negative controls, not the mutation-on-test-file loop: the `.obnotion-modal
  .obnotion-dropdown-option` grid columns swapped back — NOTHING went red (render-assertions 0,
  sheet-grammar 0 FAIL; a finding, not a failure — no lane observes the column order, so the
  label-truncation proof rests on the rule and the committed captures); `realShell: false` on
  `properties property type picker` — exactly one red, `child depth 3 (want 2)`, exit 1, then green
  restored; the pill row's built-in 30px override — 50→30 red→50 green, the chip's 44×44 vs its 30×30
  control likewise, and the header block 75px with the 20px control reading 91→75.
- **The gate**: exit 0, `PASS — 25 green, 1 red for a declared reason`. The one red is `sheet-grammar`'s
  declared 009/T26 — the same shape 069's landing recorded; the leg's own 26/0 reading predates 221's
  host-stylesheet model, which introduced the expectFail.
- **Everything else**: tsc 0; build 0; vitest 153 files / **1656** (the leg's 1641 + 221/069's 15);
  `npm run screenshots` twice, 608/608, deltas BIT-IDENTICAL across runs — **17 real content moves kept
  and named in css-lane's new acquire/edit/release triplet** (max channel delta 36–180; the DARK mirrors
  of the moves this packet's own release already reviewed as LIGHT, reached by 069's
  `tools/screenshots/host-bare-controls.css` +50 and the 221/225/069 renderer changes — upstream itself
  recaptured 0 PNGs); 3 reference-gantt jitter files (max delta 1, first run only) restored, manifest
  already agreeing, **0 manifest patches**; 0 of the 32 protected `project-manager/` entries changed.
  The 15 stale evidence artefacts re-derived by their own producing tools (engine-parity steady at its
  recorded 50-difference set, bit-identical to both `87ec4c8f`'s and `5fa01d46`'s), then 15/15 fresh.
  `scan-comments` / `scan-failing-values` 0. 067 `--strict` → `RESULT: PASSED` (before AND after
  backfill); the 005 root → `RESULT: PASSED`; both `backfill-graph-metadata.js` runs: refreshed 1,
  changed 0.
- **Roadmap §5.A**: 067's row reads **3/7** — unchanged, exactly the 3 `[x]` / 4 `[ ]` counted in 067
  `goal.md`'s completion criteria; the gate row stays unticked per the leg's own recorded deferral to
  this reconciliation, and the iOS row is the operator's. No `[B]`/operator row changed in the leg's
  diff (0 checkbox-line changes, 067-scoped).

### 2026-09-08 ~02:30, `069-board-cross-group-drag` LANDED — verified, rebased onto the 221/225-merged main, pushed to `origin/main` at `d32d185d`

**Landed.** The leg's five commits (`60e2e617`..`2dd12e2c`, authored 2026-09-07 ~21:40–23:30) replayed as
`86b2e618`..`fc7c18e1` onto `a35f17ab`, plus this verifier's `d32d185d`, are on `origin/main`;
`git log --oneline -1 origin/main` = `d32d185d`. Owner: its own phase child `069-board-cross-group-drag`
(the parent's report ledger carries it as §4 row 68, because the rebase's 225 conflict gave the timeline
report the row 67 both sides had added). Every claim was re-proven from the final state, in the worktree,
before the push:

- **Rebase**: 4 conflict rounds, all resolved. `main.js` and 11 generated artefacts took main's side; the
  parent's `goal.md`/`roadmap.md` kept BOTH intents (main's 068-landed wording + the leg's 069 row);
  225's `teardownOutgoingViewRenderer` and 069's drag + Undo-toast code verified both present post-merge;
  `tools/lane/css-lane.json` auto-merged and its newest `baselineHash` `41ffc99c0cc3` equals the live
  `styles.css` (upstream never touched the stylesheet after 5e7f1426, so the leg's recorded hash held).
- **Mutation proofs, all directions**: (a) `TOUCH_DRAG_LIFT_DELAY_MS` 450→1e9 → the phone case lost its
  ghost (live tool: desktop PASS, then `TypeError ... reading 'left'` at `board-cross-group-drag.mjs:292`,
  exit 1) and `board-renderer-parity.test.ts` went 5 failed | 29 passed (34); restored, 34/34. (b) the
  Undo `showToast` removed from `updateBoardGroup` → `embedded-database-renderer.test.ts` 1 failed |
  25 passed (26); restored, 26/26. (c) no mutation named for `database-view.test.ts`, so its guarded line
  (`moveRowWithGroupUpdatesAndPosition`'s `commitConfigAndCellChanges`) was reverted → 1 failed |
  13 passed (14); restored, 14/14.
- **The unmutated proof, post-rebase, post-build**: `node tools/live/board-cross-group-drag.mjs` → exit 0,
  `RESULT: PASSED` — desktop drag, phone drag at 402x874 with **ghost delta 0.0px**, reverse, same-column
  no-op, read-only no-lift, all PASS.
- **The gate**: exit 0, `PASS — 25 green, 1 red for a declared reason`. The one red is `sheet-grammar`'s
  declared 009/T26 (221's expectFail — the same shape 225's landing recorded); `sheet-rebuild` green, no
  transient, no re-run owed.
- **Everything else**: tsc 0; build 0; vitest 153 files / **1656** (the leg's 1652 + 221/225's additions);
  `npm run screenshots` twice, 608/608 — one jitter PNG (`reference-kanban-mobile-light`, 1800 px,
  channel delta 1, moved in one run only) reverted with its manifest `bytes` restored, so **0 real content
  moves**; the 5 stale evidence artefacts re-derived by their own owners (capture-device-parity,
  renderer-coverage via render-assertions, replay — "all 28 results still hold", touch-targets,
  unstyled-links), then 15/15 fresh; operator-checklist `--check` PASS (180 rows / 63 phases, current);
  `scan-comments` / `scan-failing-values` 0.
- **Specs**: 069 validated `--strict` → `RESULT: PASSED` first try; the parent's first run FAILED on
  exactly `SOURCE_FINGERPRINT_MISMATCH` (plus 069 missing from `children_ids` — both artifacts of taking
  main's side for the parent's graph-metadata at the conflict) and was healed by the mandated
  `backfill-graph-metadata.js` (changed: 1), then **PASSED**; 069's own backfill refreshed with changed: 0.
- **Docs**: the mandated §5.A recount — 069's `goal.md` §3 carries 8 criteria, 7 `- [x]` plus the
  operator's own `- [ ]` → **7/8 = 88%, the committed figure already correct, 0 edits**; AC-010 stays
  Unmet/unticked and no device row moved.

### 2026-09-08 ~01:20, `225-timeline-view-teardown` LANDED — verified, rebased onto 221's `3005e5bd`, pushed to `origin/main` at `b6a0f847`

**Landed.** The leg's `4ba1b75e` (24 files; replayed as `f56931f8` onto `3005e5bd` after
221-live-host-model landed first) plus this verifier's `b6a0f847` are on `origin/main`;
`git log --oneline -1 origin/main` = `b6a0f847`. Owner: `037-timeline-gantt-port` (§4 row 67). Every
claim was re-proven from the final state, in the worktree, before the push:

- **Root cause and fix, read back at source**: `pm-gantt-view` present in BOTH teardown lists
  (`rendered-view-roots.ts`'s `VIEW_ROOT_CLASSES` and the inline copy inside
  `embedded-database-renderer.ts`'s `renderResults`); `teardownOutgoingViewRenderer` at
  `database-view.ts:7132`, called at `:7026` only when `viewTypeChanged`, and its twin in the
  embedded host (call `:1235`, definition `:2388`), each destroying the outgoing timeline, calendar
  or chart renderer; `CalendarRenderer.destroy()` NEW (`calendar-renderer.ts:138`).
- **Mutation proofs, both directions**: (a) the `pm-gantt-view` entry deleted from
  `rendered-view-roots.ts` → the permanent residue lane went red, `1 leftover timeline root(s)` after
  timeline -> table (calendar -> table still 0, exactly the leg's pre-fix read); restored. (b) the
  `if (viewTypeChanged) this.teardownOutgoingViewRenderer(...)` guard commented out in
  `database-view.ts` → exactly the 2 new positive `database-view.test.ts` tests red (2 failed |
  14 passed, the negative control still green); restored, 16/16.
- **The permanent lane on the restored, post-rebase source**: `view-switch residue: timeline -> table`
  **0** and `calendar -> table` **0** — the shipped renderers in headless Chrome, production teardown.
- **The gate**: exit 0, `PASS — 25 green, 1 red for a declared reason`. The one red is
  `sheet-grammar`'s declared 009/T26 — main's own landed state since 221; 26/0 returns when T26's
  padding decision lands and the declaration is discharged.
- **Everything else**: tsc 0; build 0; vitest 153 files / 1645 (the +1 over the leg's 1644 is 221's
  >1MB-manifest `check-lane` test); `npm run screenshots` twice, 608/608 — one jitter PNG
  (`calendar-empty-state-desktop-light`, 5 px, channel delta 1, moved in run 2 only) reverted with its
  manifest `bytes` restored, and one honest correction kept (`board-view-desktop-dark`'s manifest row
  now records the 216993 bytes the committed PNG actually is); the 4 stale evidence artefacts
  re-stamped by their own owners (render-assertions, touch-targets, unstyled-links,
  capture-device-parity), then 15/15 fresh; `scan-comments` / `scan-failing-values` 0.
- **Docs**: §4 row 67 and 037's AC-008/REQ-008/T054 read back; no operator/device row ticked (the leg
  ticked only its own T054); §5.A's `037` figure recounted against `goal.md` §3: 10/20, unchanged and
  still correct; 037 and 005 both validate `--strict` → `RESULT: PASSED` (the parent's only
  pre-backfill violation was its own `SOURCE_FINGERPRINT_MISMATCH`; backfilled; this section's own
  edit re-derives it again in the same commit, `3005e5bd`'s precedent).

**Rebase conflicts** were 8 generated artefacts — the parent's `graph-metadata.json` plus 7
`tools/live/*.json` — all resolved to main's side and then re-derived; `tools/lane/css-lane.json`
needed nothing (styles.css unchanged, so no acquire/edit/release triplet); the working root
`.handover.md` (221's, now this leg's) carries the full verifier log, mutation numbers included.

### 2026-09-07 ~21:47, `221-live-host-model` LANDED — verified, rebased onto 0.0.31, pushed to `origin/main` at `6f679e5e`

**Landed.** The leg's `e795fc55` (replayed from `77397c4b` onto `c5b20ee4`, the 0.0.31 state) plus this
verifier's `6f679e5e` are on `origin/main`; `git log --oneline -1 origin/main` = `6f679e5e`. Owner:
`009-live-verification`. Every claim was re-proven from the final state, in the worktree, before the
push:

- **The shared host-stylesheet module** `tools/screenshots/host-bare-controls.css` is referenced by
  `verify-placement.mjs` and all five lanes — 12 inclusion sites (sheet-grammar 1, render-assertions
  4, touch-targets 1, sheet-rebuild 2, sheet-teardown 1); verify-placement's inline copy is gone.
- **The 054 ink row trips without the wrap rule**: rule commented out, `sheet-grammar.mjs` printed
  "3/3 buttons paint ink outside their own box at 30px (worst 81.0px)", restored clean.
- **Touch-targets ratchets moved DOWN only**: fixture 185→171, constructed 807→785, no number raised.
- **`sheet-rebuild.mjs` nondeterminism**: `ENTRANCE_SETTLE_FLOOR_MS = 260`; 3 runs, sort settled 674
  and filter settled 541 identical in every run — the 836/836 pre-transition race is gone.
- **`check-lane.mjs`**: 64MB `maxBuffer` on the `git show`; the >1MB-manifest test goes red without
  it (1 failed | 26 passed) and green with it (27/27).
- **The gate**: `PASS — 25 green, 1 red for a declared reason`, exit 0, 2m31s. The one red is
  `sheet-grammar`'s declared `expectFail` = `009`'s T26 (`.obnotion-panel-button` ~10px past the
  sort-panel's right edge, both engines); 26/0 returns when T26's padding decision lands and the
  declaration is discharged.
- **Everything else**: tsc 0; vitest 153 files / 1642; `npm run screenshots` twice, 608/608, 0 moved
  PNGs; 15/15 evidence artefacts fresh; operator checklist current (179 rows); 009 and 005 validate
  `--strict` → `RESULT: PASSED` after their backfills; scan-comments / scan-failing-values 0.

**The only rebase conflicts** were the parent's `graph-metadata.json` (resolved to main's side, then
re-derived by the backfill) and this file (223's continuity kept; BOTH §1 sections kept, newest
first). 009's roadmap figure re-counted 2/6 — unchanged and still correct; nothing named the
operator or a device, so nothing was ticked.

**Still open here:** `009`'s T26 — the `.obnotion-panel-button` padding decision across the six
renderers that draw the class (the gate's expectFail waits on it); 067 follow-up 3, 069 and the
timeline-to-table teardown are other legs, unchanged.

### 2026-09-07 ~22:05, 0.0.31 SHIPPED as the RENAME release — four legs queued for GLM landers

**0.0.31 shipped at `5e7f1426`, the rename release.** Plugin id `obnotion`, name Obnotion, prefix
`obnotion-` everywhere, a copy-never-move `data.json` bridge on first load, vault folder
`.obsidian/plugins/obnotion/`, GitHub repo `obsidian_notion-clone`. Release:
https://github.com/MichelKerkmeester/obsidian_notion-clone/releases/tag/0.0.31, published
2026-09-07T19:20:19Z. `<scratchpad>/release-31.handover.md` records all 13 release steps DONE:
tsc/build/vitest green, both CI workflows SUCCESS, the sha256 triad matched across the release
asset, the local build and the installed iCloud copy, and the vault's old `note-database/data.json`
mtime unchanged before/after the swap.

**Landed 2026-09-07 (SHAs from `git log --oneline origin/main`):** 064 child + rulings, its
implementation `b46f4ef2` and follow-up `9d798c69`; ClickUp harvest `69c58159` + reclassification
`21392233`; 063 `a88894e5` + evidence gaps `755f2eac`; 067 fold `44101b47` + impl `173f7d3a` +
follow-ups `53cb5bb4` (menu-card) and `7ffeecc6` (AC-003 light scrim); 060 `5fec918d`; 065
`a0d64df0` + touch fix `8fb3c87e`; 066 `cbb854c4` + lane row `af0e8796` + toast settle `38d5a986`;
059 `f2a7ec34`; 062 `2c8974fb` + freeze defects `3a94e58b`; 061 `abb6827f` + tap/dock `6ca4a5c3`;
the Settings-sheet phone fix `232f5c38`/`b8876332` + guard rows `258d52d7`/`440da14d`; 030/056/057
doc fixes `31eafb60`/`6d222e6e`; 068 rename `14e073b4`/`24b3d683`, closed out at `6f4d026c`. Ticks
recounted live against each child's own `goal.md` §3 Completion Criteria: 059 9/10, 060 5/5, 061
6/7, 062 8/9, 063 6/8, 064 7/8, 065 9/10, 066 4/6, 067 3/7, 068 5/8 — none moved since the last
refresh.

**In flight, each awaiting a GLM lander:** `live-host-model` (`.worktrees/221-live-host-model`,
HEAD `77397c4b`, owns `009-live-verification` — the host stylesheet model, `sheet-rebuild` 836/836,
the check-lane's `maxBuffer`; it also found a **new device defect, `009` `T26`**: the sort panel's
`.obnotion-panel-button` overflows ~10px under the real host button cascade, recorded with a
declared gate `expectFail`). `067 follow-up 3` (`.worktrees/222-sheet-family-followup-3`, HEAD
`6f4d026c` — replaced-body labels, registry depth, pill/chip lane rows, the header-block residual,
a divider audit). `069-board-cross-group-drag` (`.worktrees/224-board-touch-drag-groups`, HEAD
`5e7f1426`, a NEW child — operator 21:40 verbatim: *"board view needs to support dragging to other
groups and thus updating that property to match grouped field. Like clickup for example. You have
task on status 'open' and drag board card to 'in progress'"* — desktop drag already updates the
grouped property; touch drag never existed because cards were never draggable on touch; a Sonnet
leg is building long-press lift, ghost, edge auto-scroll, drop = `moveCardAndOrder`, and an Undo
toast). The timeline→table view-switch residue (`.worktrees/225-timeline-view-teardown`, HEAD
`5e7f1426` — operator 21:55 verbatim: *"if you open timeline view then go back to table view, the
timeline sits on top above table view for some reason and it glitches"* — a Sonnet leg is
reproducing and fixing the teardown).

**Primary-checkout worktree list** (`git worktree list`, from `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`):
`065-anytype-research` `83fc7121`; `221-live-host-model` `77397c4b`; `222-sheet-family-followup-3`
`6f4d026c`; `223-goal-refresh-0031` `5e7f1426` (this leg); `224-board-touch-drag-groups`
`5e7f1426`; `225-timeline-view-teardown` `5e7f1426`.

**Scratchpad paths a successor needs:** `<scratchpad>/pause-state.md`,
`<scratchpad>/needs-followups.md`, `<scratchpad>/continuations/`, `<scratchpad>/glm/queue/`,
`<scratchpad>/glm/monitor.sh`, `<scratchpad>/glm/launch-glm.sh`, `<scratchpad>/glm/pixel-delta.mjs`.

**Standing rules (operator 2026-09-07 18:40):** NO Opus agents — GLM 5.3 flash max via cli-pi
DevPass (`--provider llmgateway --model glm-5.3-flash --thinking max`) carries landings, docs and
releases on scripted numbered briefs, judged by decoded pixel-delta, monitored every 5 min with a
15-min stall relaunch; an Opus may only orchestrate GLM workers, never carry a leg itself; cap of
four agents at once; every leg keeps `<worktree>/.handover.md` and writes the packet's handover
entry.

### 2026-09-07 late evening, `221-live-host-model` — `tools/live/` gained the host stylesheet model, committed, NOT pushed

**Owner: `009-live-verification`, not `054`.** 009's whole charter is measuring the plugin's real
surfaces with the real host chrome and saying honestly what a harness cannot; 054 (record/relation
surfaces) is a *consumer* of one of this leg's findings (its ink row, below) but does not own
live-lane infrastructure. Worked from a worktree fresh off `origin/main` at `6f4d026c` (after the
068 rename landed), so every class referenced below is `obnotion-`.

**The gap.** `tools/storybook/verify-placement.mjs` modelled the host's own bare-`<button>` rule
(`white-space: nowrap`, `justify-content: center`, `height: var(--input-height)`) so its checks see
what a device's cascade actually does; `tools/live/`'s five lanes never did. Extracted the block to
one shared file, `tools/screenshots/host-bare-controls.css` (padding hardcoded to its resolved
4px/12px too — `--size-4-1`/`--size-4-3` are undefined in the three lanes that don't load
`theme.css`, and an unresolved `var()` in a shorthand computes to nothing rather than falling back
to the UA default, which is roomier than the real device and had been silently *hiding* overflow).
Both `verify-placement.mjs` and all five named lanes (`sheet-grammar`, `render-assertions`,
`touch-targets`, `sheet-rebuild`, `sheet-teardown`) now load it.

**Every row that moved, reconciled:**
- **`sheet-grammar`'s 054 ink row — re-derived, now proven.** The negative control used to hand-type
  the host's three declarations (including a guessed 44px height); it now reads them live off a
  bare `<button>` probe, so it can never drift from the shared file. Under the real cascade the
  wrap-rule's own threshold (19px, chosen when the option box was 217.7px) no longer overflows at
  the box's current 358-369px width — swept 15-64px, first real overflow at 24px but under 1px on
  two of three buttons, robust at 30px (18-81px on all three). Re-pinned to 30px, with the reasoning
  in `tools/live/sheet-grammar.mjs`'s own comment. **Literally proved**: commented out the real
  `.obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-new-placement-option` rule in
  `styles.css`, reran — `settings sheet placement-button ink: 3/3 buttons paint ink outside their
  own box at 30px (worst 81.0px)` — then restored it clean.
- **A real device-only defect, deferred as a task, not guessed at.** The same padding fix also
  showed `.obnotion-panel-button` (sort-panel, used across six renderers) declares no padding of
  its own, so the host's real 4px/12px pushes it ~10px past its surface's right edge on both
  engines — invisible to every harness before this leg. Recorded as `009`'s T26 rather than fixed
  (the right padding is a per-surface call across icon-only/text/icon+label buttons, not a line
  this lane can prove); `tools/gate.mjs`'s `sheet-grammar` check carries a matching `expectFail`
  until T26 lands. Gate: **25 green, 1 red for a declared reason**.
- **`touch-targets`' two ratchets tightened, not loosened.** The real host geometry made 13 fixture
  and 7 constructed (scenario, class) pairs clear the 28px floor that couldn't under the UA-default
  approximation (calendar mini-nav controls, a couple of mod-warnings, the record-peek hidden
  toggle, the file-tag remove, the all-day-more/all-day-date calendar cells) — zero regressions
  either direction. `touch-targets-baseline.json` 185→171, `touch-targets-constructed-baseline.json`
  807→785, each with a dated `hostStylesheetModelLowering` entry naming the diff and the three
  reproducing runs.
- **`render-assertions` and `sheet-teardown`**: no row moved.
- **`sheet-rebuild`'s real finding — a harness race, not the product.** Its filter-sheet "holds
  still" row re-measured ~530-640 where the committed `sheet-rebuild.json` recorded 836/836 on
  byte-identical source hashes. Root cause: `openSettled`'s settle-detection accepted two
  consecutive equal `requestAnimationFrame` samples as "stopped," with no minimum-elapsed-time
  floor — so the very first sheet a fresh page opens can read its pre-transition top (the entrance
  class is added a frame after the off-screen mount, and that frame's timing raced the poll) on two
  samples 11ms apart, long before the real 200ms transition runs. Reproduced deterministically: 4/4
  clean runs before the fix gave sort=836/836/836 (the false, frozen pre-transition top) and
  filter=541/641/641 (already correct, matching this session's own remeasure and the far session's
  527/627 in kind); 4/4 runs after adding `ENTRANCE_SETTLE_FLOOR_MS = 260` (the 200ms token plus
  margin) as a required condition give sort=674/655/674 and filter=541/641/641 — stable, and
  matching the true animated resting positions.
- **`check-lane.mjs`'s `git show` had no `maxBuffer`**, and `screenshots/manifest.json` (1,254,317
  bytes) now exceeds Node's 1MB `spawnSync` default: reproduced `ENOBUFS`/`status: null`, read as
  "no manifest at HEAD" by the caller with no error surfaced. Fixed with an explicit 64MB
  `maxBuffer`; added `tools/lane/check-lane.test.mjs`'s disposable-repo test (commits a >1MB
  manifest, reads it back) — confirmed it fails without the fix and passes with it.

**Verification, this worktree, final state:** `npx tsc --noEmit` 0; `npx vitest run` 153 files /
1642 tests; all five named lanes run individually (sheet-grammar exits 1 for the declared T26
defect, the other four exit 0); `npm run gate </dev/null` once in the foreground — **25 green, 1
red for a declared reason, exit 0**; `scan-comments`/`scan-failing-values` exit 0 standalone;
`009-live-verification` validated `--strict` — `RESULT: PASSED`, 0 errors, 0 warnings (after
`backfill-graph-metadata.js` re-derived its `graph-metadata.json` for the `tasks.md` edit).

**Not done, and not this leg's to do:** `009`'s T26 (the `.obnotion-panel-button` padding
decision). **Not pushed** — this worktree's HEAD is a local, unpushed commit; a fresh verifier
rebases onto whatever landed at main in the meantime and lands it.

### 2026-09-07 ~21:05, `068-rename-to-obnotion` LANDING VERIFICATION PASSED — leg PUSHED to `origin/main` at `e80f0775`

**The rename is landed on `origin/main`; the worktree's job is done.** A fresh Opus verifier (this
entry's author) re-derived every claim in the leg's handover from the final committed tree in
`.worktrees/220-rename-to-obnotion`, then pushed `65a76ee9..e80f0775` (6 commits: the rewrite
leg's 4 + 2 verifier commits) to `origin/main` in one accepted push — no rejection, no retry.

**What was verified, and the number that decided it:** identity (id `obnotion`, name `Obnotion`,
author `MichelKerkmeester`, no `fundingUrl`); `db-` in styles.css **0**, `obnotion-` **5500**,
`obnotion-container` **2260**; the 5 aliases present with 11 dedicated tests; migration is
copy-never-move with a single log line; README/update-fork.sh point at
`MichelKerkmeester/obsidian_notion-clone`. Mutation tests went red on demand (migration guard
removed → 2 red / 5; alias branch removed → 2 red / 6) and green after restore. `npx tsc --noEmit`
0, `npx vitest run` **153 files / 1641 tests**, `npm run build` 0.

**The recapture claim survived independent re-derivation.** Two fresh `npm run screenshots` runs
(608 entries, exit 0 each) plus a decoded pixel-delta pass across both runs: **3 byte-only jitter
moves** (board-view-desktop-dark, reference-gantt-subtask-mobile-light,
reference-kanban-subtask-mobile-dark — max channel delta **1** on each, every pixelHash
identical to the committed blob, all 3 moved in both runs) and **0 real changes**. The three
manifest `bytes` fields were reconciled to the files on disk (layoutHashes kept fresh — do not
restore those), and the css-lane release entry now **names the 3 jitter captures** in `reviewed`,
which the lane demands before any release sits on the current stylesheet.

**The ratchet did its job.** `scan-failing-values` read **152 bare against baseline 147** from the
doc-closing commit — five 068 goal.md criteria had been ticked without the number each moved from.
Fixed by recording the watched-red figures into those 5 rows (the 3,485 name references and 1,247
`.db-*` selectors the sweep removed; the mutation tests; the 152-bare breach itself), NOT by
touching the baseline. Now **147/147**, exit 0. A first gate run from the final tree failed exactly
these two ways (`operator-list` stale, `css-lane` unnamed captures); both were re-derived per the
gate's own messages, and the second run read **26 green, 0 red, exit 0**.

**Caveats for successors:** (1) `tools/naming/rename-prefixes.mjs` in WRITE mode is destructive by
design on this tree — a verifier's first-instruction re-run rewrote 7 files and destroyed the
hand-written aliases before being caught and restored; `--check` is safe, write mode must never
run again. (2) The sweep renamed one historical baseline title inside
`failing-values-baseline.json` (`.db-header` → `.obnotion-header`) that no longer matches 005's
goal.md prose — cosmetic, the title set still matches its goals by count. (3) The 068 release
row and the operator-device row are still open — 0.0.31 is **not cut**; that is the next leg's
job. (4) The parent roadmap 068 row reads **5/8**, re-derived from goal.md §3 after the ratchet
fix re-worded rows.

### 2026-09-07 ~19:52, `068-rename-to-obnotion` REWRITE LEG LANDED on its own worktree, not yet merged

**The plugin is Obnotion everywhere the sweep could reach; nothing visual moved.** One leg, from
`.worktrees/220-rename-to-obnotion`, base `65a76ee9` (main did not move under it, per the
operator's own instruction that nothing else run in flight). `npx tsc --noEmit` 0, `npx vitest run`
**153 files / 1641 tests** (6 new, closing a real coverage gap this leg found: 4 of the 5 permanent
aliases had zero dedicated tests before this leg), `npm run build` 0, `npm run gate </dev/null`
**26/26 green**, run twice — the first run caught 8 stale `tools/live/*.json` evidence artefacts
(their recorded `styles.css`/scanner hashes predated the sweep), fixed by re-running each
artefact's own producer, not by editing a number.

**The recapture came back byte-identical, not merely pixelHash-unchanged.** `npm run screenshots`
→ 608 entries; every one matched the pre-rename committed bytes exactly, after 4 well-known-jittery
files (named repeatedly in this lane's own history — `board-view-desktop-dark`,
`reference-gantt-subtask-mobile-light`, `reference-kanban-subtask-mobile-dark`, plus a new one this
time, `panel-record-detail-sheet-body-editing-desktop-light`) were confirmed pixelHash-identical
and restored to committed bytes. 13 PNGs opened and read across every major surface — table, board,
gantt/timeline, a confirm sheet, a dropdown, a nested filter panel, the column manager, an
owned-menu submenu, an empty record-detail body, the view-config panel, a chart, a project-manager
reference, a sort panel, a toolbar sheet — all correct.

**Three real deviations from the packet's own written plan, each recorded with why rather than
silently absorbed** (full reasoning in `068/decision-record.md`'s Landing Addendum): (1) the
repository really was renamed to `obsidian_notion-clone` on 2026-09-07 — this handover's own
frontmatter already knew that; `068`'s own `spec.md`/`goal.md` did not, and now carry an appended
note rather than an edited ruling; `update-fork.sh` and 4 stale `README.md` URLs are corrected. (2)
The mechanical sweep (`tools/naming/rename-prefixes.mjs`, new, committed) had to run BEFORE the
five compatibility aliases were hand-written, not after as the plan's stage-lettering suggested — a
blind text sweep cannot tell an intentional `note-database-view` alias from unswept residue, proven
the hard way when a second sweep pass (to also cover `tools/lane/css-lane.json`) silently
overwrote every alias the first pass's follow-up work had already typed; caught immediately, fixed
by hand. (3) `css-lane.json`'s 380-entry history journal was excluded from the sweep, then
deliberately included, once excluding it left `AC-003`'s frozen verification command printing 238
instead of 0.

**A `git mv` the plan never named**: the sweep's `\bdb-` rule matched inside the import-path
string `"./modals/db-modal"`, repointing 27 files' imports to a file that did not exist yet —
resolved with `git mv db-modal.ts obnotion-modal.ts`. The `DbModal` class name and `DB_MODAL_*`
constants are deliberately left unrenamed — outside the measured census and outside either
verification grep.

**Both `068/tasks.md` `validate.sh --strict` and the `005` parent's read `RESULT: PASSED` as their
first line** (the parent recurses into all children; every one of them also reads `PASSED`). 13 of
16 `acceptance-criteria.md` rows are `Met`; AC-014 (release) and AC-015 (the operator's own device
confirmation) are the only rows still open — deliberately: this leg does not push and does not cut
0.0.31, per its own operator instruction. **Not merged. A fresh Opus verifier reviews and lands the
work, then cuts 0.0.31 as the rename release.** No live Obsidian window was available in this leg's
sandbox: the `data.json` migration is proven against a real filesystem (not a mock — a throwaway
script drove it through `node:fs/promises` directly), but the community-plugin-panel read, a note
actually opening, and a `workspace.json` restore are only proven at the unit level or by code
review, honestly recorded as such in `068/goal.md` §4 rather than asserted as observed.

### 2026-09-07 ~18:40, `067`'s SECOND follow-up leg LANDED, from `.worktrees/219-sheet-family-followup-2`

**AC-003 is fully closed in both themes; AC-007's header block narrows and stays red on purpose;
the packet stays 3/7 = 43%.** Rebased from `443061d4` onto `dad4ccc1`; `npm run gate` **26/26
green, exit 0** from the final state, `npx vitest run` **1630/1630** in 151 files, `npx tsc
--noEmit` 0.

**All five claims re-measured, not read off the leg's report.** *AC-003*: three bands of the parent
sheet against the same undimmed control, decoded off PNG — light **242 → 172, ratio 0.7107**, dark
**46 → 33, ratio 0.7174**, both inside 0.710 ± 0.02, with the **pre-fix blobs as the negative
control** (light **0.7562**, outside; dark **0.7174**, bit-identical, so the `.theme-dark` reset is
proven a no-op by measurement). The undimmed control capture is 0 changed pixels pre versus post,
and text contrast on the dimmed light parent only falls 5.45:1 → 5.04:1, above the AA floor.
*AC-007 / T015*: the sort-panel's header block reads **91px at 20px** and **77px at 6px** on a live
mount, and the grab-band hit-test answers **0 of 11** controls at 6px but **1 of 11 —
`db-sheet-close` — at 5px and again at 4px**, so 6px is the floor by observation; 77 against 66-74
correctly stays `Unmet`. *T020*: both new replace-pair captures opened in both themes and they show
the real replaced state; the `add view property picker` chain was traced on production and is
genuinely two-level (`toolbar-renderer.ts:1382` builds ONE `createPopoverShell`, the key field's
`createDropdownField` is level 2, the type rows call `actions.addView` and close), and
`overlay-stack.ts:129` fires the cap only at `depthOf(parent) >= 2` so nothing there could be
absorbed anyway. *The depth-cap check*: green on the real call graph (1 → 2 → still 2) with its
dialog-role control at 3, and **mutated to prove it bites** — forcing the positive case to `dialog`
and the filter to `brightness(0.99)` takes the lane to exit 1 on exactly those rows. *T021*:
confirmed untouched.

**One new cosmetic finding, carried rather than fixed**: in the replaced state the option labels
render truncated to `O..` in both themes where the stacking capture renders `Option 1`..`Option 7`
in full — the replaced body's label column collapses. The capture is new, so nothing regressed, and
it is named here rather than folded into a leg that did not own it.

**Two harness facts this landing pins.** `tools/lane/check-lane.mjs`'s `readManifestAtHead()` calls
`spawnSync` with no `maxBuffer` and the manifest is now 1,254,897 bytes, so it fails **ENOBUFS,
`status` null**, returns null, and every byte-changed PNG is then treated as content-changed — the
bug the previous leg worked around is confirmed by direct reproduction here, and this landing did
**not** need the workaround because the two byte-moved captures were restored instead. And the
previous leg's manifest carried **332 `\u2014`-escaped em-dashes** that no `JSON.stringify` writes,
the fingerprint of a hand-patch through a `ensure_ascii` JSON writer; regenerating with the capture
tool restored the canonical literal form and corrected one stale `bytes` value
(`reference-gantt-desktop-dark`, 112474 → 112460) plus two more the leg had left pointing at
regenerated bytes for restored files.

**Still open in `067`, unchanged by this leg**: the depth-cap criterion (both named pairs must
assert replace; `properties property type picker`'s registry entry still says `depth: 3`), the
lane-row-per-deliverable criterion (no row for the pill, the chip or the header block), **T021**'s
divider audit, and **AC-011**, the operator's device read.

### 2026-09-07 ~16:20, `067`'s follow-up leg LANDED, from `.worktrees/215-sheet-family-followup`

**T006 is closed and independently re-verified; the `scale(0.96)` cue is dropped by operator
ruling; the packet stays 3/7.** Landed on `main` after a rebase from `173f7d3a` onto `b8876332`
(eight commits of 064 follow-ups, the toast settle, a goal refresh and the Settings-sheet fix,
several of them touching `styles.css` and the lane files). Nine commits; `npm run gate` **26/26
green, exit 0** from the final state.

**Confirmed by re-measurement, not by reading the leg's report.** All four production `menu`-role
surfaces — `owned-menu`, `date-picker`, `icon-picker`, `option-color-picker` — measure at 402px
with the handle absent, a **44.0×44.0** close target and a **parent dim ratio of 0.390** inside the
0.35-0.44 band. A `panel`-role sheet still keeps its handle: the same column reads forwards for all
thirteen non-card surfaces, and the stacked-pair rows still measure a real 34.4px handle-to-title
gap for every handle-bearing child, with exactly one row reading `n/a`. Two negative controls
proved the assertions bite rather than pass vacuously: restoring `setSheetMount`'s old
`toggleClass` takes the three pickers to `parent dim ratio 0.520` (exit 1), and removing
`owned-menu`'s `menuCard: true` takes `verify-placement.mjs` from 413/415 to **409/415**, red on
exactly the four rewritten menu-handle rows.

**Operator ruling folded in (2026-09-07 ~14:50, verbatim: *"Drop the scale cue"*).** ADR-003 is now
**Accepted-as-amended** — the 0.52 ± 0.02 page dim stands, the `scale(0.96)` pull-back is withdrawn
with the containing-block conflict quoted as the reason, AC-003's third Given/When/Then clause is
removed rather than marked satisfied, and `roadmap.md` §6A carries the amending row in the shape of
the sittings above it. The pull-back is a **closed question now, not a residual gap**: its last
trace in the tree — a dormant `.db-page-pulled-back` guard in `touch-target-measure.mjs` whose
comment asserted behaviour the code no longer has — was removed with it.

**`§5.A`'s 067 row is re-derived and stays 3/7 = 43%.** The leg genuinely closed T006 and AC-002 is
`Met`, but the goal criterion's own wording asks for an **anchored** card and anchored geometry was
tried and declined (24 overflowing calendar-grid cells, a broken keyboard-avoidance handoff), so
the box stays unchecked against its own text rather than being ticked on a near-match.

**Still open in `067`, and a second follow-up leg owns them** — do not treat any of these as
landed: AC-003's light stacked-parent figure (0.758 against 0.710 ± 0.02, investigated to a real
physical bound on `.is-stack-parent`'s bare `opacity`, `filter: brightness()` named as the
candidate, not implemented), **T015**'s header-block margin, **T020**'s replace-pair captures,
**T021**'s full divider audit, and the two named lane pairs' rewiring to the real depth-cap call
graph.

**Two harness facts this landing re-confirmed the hard way.** `pixelHash` is blind here: main's
committed manifest carries `pixelHash` **and** `layoutHash` values identical to the ones the rebased
tree regenerates for all twelve moved captures, whose byte sizes differ by as much as 39379 → 36980
— judging by hash alone would have signed off a tree with none of this leg's work in it. And the
capture harness jitters a different set each run: pass 1 moved eight files, pass 2 moved five, only
two in both, and nothing new moved for a real reason, so a single recapture cannot tell jitter from
content.

### 2026-09-07, `066` T018 + `063` T018 addendum landed, from `.worktrees/214-toast-capture-settle`

**Base `18b6d866`.** Two capture-pipeline defects closed at the root, and both of the leg's own
claims were re-proven on the merged tree rather than accepted from the report.

**The `chrome-toast-*` `layoutHash` race — confirmed, and narrowed in scope.** `.db-toast`'s
entrance keyframe survives `reducedMotion` at 0.01ms, and `capture.mjs` reads the layout hash
through `getBoundingClientRect()` before the screenshot call's own animation fast-forward, so the
read raced the keyframe. Backing the fix out and running `capture.mjs --only chrome-toast-success`
four times reproduced the flip live — desktop `ec7335c12b6a` on runs 1/2 against `7425a6d0cd70` on
runs 3/4, mobile `ffd9d0f9aefb` against `5ac877430f1c` — and run 1 disagreed with **itself**: its
dark and light passes photograph one layout and recorded two hashes. `--only chrome-toast-error`
did **not** flip in ten backed-out runs; its race is evidenced only by the committed manifest
having carried `5d4e87a8263a` for `error-desktop-dark` and `02d0836ee6f6` for its light pair. The
leg's claim of eight live reproductions was **corrected in `tasks.md`, `implementation-summary.md`
and the lane note** to one reproduced scenario and one prophylactic. `animation: none !important`
in both scenarios' `captureCss`; three runs of each scenario after the fix, all eight stable.

**The `dropdownDesktopSheet` assertion — confirmed exactly as reported.** It queried `container`
for a sheet `openDropdownPopover` portals to `document.body`, and no scenario set the flag in
`STATE_SCENARIOS` or the `rulesScenarios` filter, so it had never run. Both negative controls
reproduced: with the old selector restored it fails **even with the sheet present** (which is what
proves it can never have run in a green gate), and with the fix in but the option count cut from
thirty to three it fails for the genuine anchored reason. Green at thirty, `render-assertions.mjs`
exit 0.

**`chrome-toast-*` `layoutHash`: three moved, not eight or five.** `064` had already recaptured
`chrome-toast-success-mobile-*` when it landed its `.is-phone .db-toast-action` 46px floor, so by
the time this leg rebased onto `9d798c69` only `error-desktop-light`,
`success-desktop-light` and `success-mobile-dark` still carried a racy value. The leg's own
pre-rebase draft claimed five, and an earlier draft eight; both were re-derived rather than carried.

**The `067` debt this leg had drafted was already paid.** Its working tree carried a new
`outstanding` entry naming seventeen sheet captures as stale against `e8c484d5`. `064`'s landing
(`9d798c69`) recaptured and **reviewed** every one of them in its own release. The entry was
dropped; the pre-existing `067` outstanding row from `062`'s verifier is untouched.

**Jitter, judged by decoded pixels.** The full 606-entry recapture was run three times. Eleven to
sixteen captures moved PNG bytes per run in largely disjoint sets; every one measured at max
channel delta ≤ 12 and mean ≈ 1 against its committed copy. One `pixelHash` moved per run
(`timeline-view-desktop-light` on run 1, `timeline-subtask-tree-desktop-light` on run 3) and each
returned to its committed value on the next run — which is what settles them as jitter rather than
content. All restored, `bytes` and `pixelHash` patched back.

`npm run gate` 26 green. `tsc` 0, `vitest` 0 (151 files, 1630 tests), `screenshots:verify` 0 on 606,
`sheet-grammar` 0, `render-assertions` 0, `scan-comments` PASS. `css-lane` acquired from `064` at
`acd49f23b031` (no `styles.css` edit) and released naming all eight `chrome-toast-*` captures.

### 2026-09-07, `064-notion-toolbar-refinement` T015/T016 follow-up landed, from `.worktrees/212-toolbar-followups`

**Base `3a94e58b`.** The follow-up closes the three gaps `tasks.md` T016 recorded and the
undo-selection gap T015 recorded, and it needed a **second** landing verification (`T018`) because
`T017`'s push never reached `main`: the branch was found two commits ahead of `origin/main` with
sixteen re-derived evidence files uncommitted. Nothing was accepted from `T017`; every claim was
re-mutated on this base and every one read red for its own reason —
`addFirstLeaf(columns[0].key)` at `filter-panel-renderer.ts:275` (`expected 'file.name' to be
'colB'`), the harness bag without `addFilter`/`addSort` (`0 add control(s), want 1`, both chip-rail
scenarios), `.is-phone .db-toast-action` reverted (`30x15, under its named 44px floor`) and with the
`RAISED` entry reverted as well (fixture **186** against a baseline of 185), and `deleteView`'s
`viewId` override reverted (`expected +0 to be 1`). One wording correction that changes no result:
the three suites mount a hand-built `FakeElement` tree, not a jsdom or browser DOM.

**Two things worth carrying forward.** First, **a rebase that resolves `screenshots/manifest.json` to
main's side silently invalidates the whole corpus** — the manifest kept main's `styles.css` hash, so
the first gate run read **882** captures stale and `check-lane` had signed off a recapture that was
no longer in the tree. Regenerate the manifest after any rebase that touches it. Second, the
recapture moved 26 files and **21 of them are other lanes' debt, not this packet's**: seventeen are
the sheet-family captures `css-lane.json`'s `outstanding` entry already books against `067`, and
four are an **icon-picker class nobody has booked** — `field-icon-picker-desktop-{dark,light}` (4,923
pixels at max channel delta 208, `pixelHash` DIFFERENT) and
`constructed-icon-picker-desktop-{dark,light}` (1,637 at 112/132, `pixelHash` identical). Ownership
was proved rather than argued: recapturing with **`origin/main`'s own `styles.css`** checked into the
tree reproduces the new bytes and still differs from the committed PNG by the identical 4,923 pixels,
so they were stale against `origin/main` before this branch existed. All 21 were opened, read and
committed rather than restored, and the css-lane release names them (`reviewed` **4 → 25**).

`npx tsc --noEmit` 0 · `npx vitest run` 0 (**151 files / 1630 tests**) · `npm run build` 0 ·
`npm run screenshots` 606 entries with `screenshots:verify` 0 · `check-lane` 0 ("release names all
21 changed capture(s)") · `npm run gate` **26 green, exit 0** · packet validation `RESULT: PASSED`,
Errors 0 Warnings 0. `goal.md` still derives **7/8 = 88%**; the eighth is AC-011, the operator's
device row, and it was not touched.

### 2026-09-07 13:15, `orchestrate-handover-25`, read from `.worktrees/217-goal-refresh-1315`

**Documentation only.** No `src/`, `styles.css`, `tools/` or `main.js` file was touched in this
leg. **`0.0.30` shipped at `e016e75c`, unchanged since handover-24.**

**`212`'s T015/T016 follow-up landed while this leg rebased** — see the entry directly above,
which supersedes this one's "in flight" line for `212` below; `064` now derives 7/8 with only
AC-011, the operator's device row, untouched.

**Landed 2026-09-07** (run `git log --since=2026-09-07 --oneline origin/main` for the full SHA
list): `064` opened as a child plus its rulings · the ClickUp harvest `69c58159` and its content
reclassification `21392233` (`047` T033-T035 all now done) · `063` implementation `a88894e5` plus
the evidence-gaps follow-up `755f2eac` · `067` folded `44101b47` and implemented `173f7d3a` (3/7,
a further follow-up in flight) · `060` `5fec918d` (5/5) · `065` `a0d64df0` plus the touch-target fix
`8fb3c87e` (9/10) · `066` `cbb854c4` plus the lane-row fix `af0e8796` (4/6) · `059` `f2a7ec34` (9/10)
· `062` `2c8974fb` plus the freeze-defects fix `3a94e58b` (8/9) · `061` `abb6827f` plus the tap/dock
fix `6ca4a5c3` (6/7, closing the operator's cell-menu complaint in code) · `064` implementation
`b46f4ef2` (delete-view routed through an undo branch) · `030`'s status update `31eafb60` · the
`056`/`057` log-anchor fix `6d222e6e` · the GitHub repo itself renamed to `obsidian_notion-clone`
(origin repointed; `068` folds this rename in rather than repeating it).

**All eight reserved Notion-refinement children (`059`-`066`) are now open and each has shipped a
first implementation leg.** `goal.md`'s tables carry the per-child fractions above; `061`'s and
`067`'s device/gate rows and `064`'s and `067`'s follow-up legs stay open.

**In flight at 13:15**, each its own worktree: `212-toolbar-followups` (`064` follow-ups, landing
next) · `214-toast-capture-settle` (paused, a lander) · `215-sheet-family-followup` (`067`'s next
builder: the menu card, scale 0.96, AC-003 under light theme, lane pairs, 17 stale captures) ·
`216-settings-sheet-phone` (the operator's 10:20 report on `0.0.30` — a two-column grid and an
overflowing select list on the phone Settings sheet). ~~**The primary checkout itself carries live
uncommitted edits to `067`'s docs right now**~~ — **resolved.** Those were `215`'s builder editing
the un-prefixed path, which resolves to the primary checkout rather than to the worktree. The edits
were recovered into the worktree as a patch and the primary checkout reverted to clean; they landed
with `215` at ~16:20 (see the top of this section). The trap itself is real and worth knowing: an
unchanged `git status --porcelain specs/` in a worktree right after an edit you just made is the
tell that you wrote to the primary checkout instead.

**Order of work.** 1) Land `212`, then `214`, then `215` and `216` — one Opus lander at a time. 2)
`068` runs as **one leg** with nothing else in flight: id `obnotion`, `obnotion-` prefix everywhere,
the `data.json` migration, author **MichelKerkmeester**, repo `obsidian_notion-clone` — then release
**`0.0.31`** as the rename release. 3) The device rows, operator-only, one per child: `059` AC-010,
`060` D1-D4, `061` AC-005, `062` C9, `063` AC-011, `064` AC-011, `065` AC-012, `066` AC-008, `067`
AC-011, `058` AC-008, `056` C10.1-4, `057` G12/G15 plus AC-010. No agent ticks an operator row.

**`git worktree list`, read from the primary checkout at 13:15.** `main` `3a94e58b` (dirty, see
above) · `065-anytype-research` `83fc7121` · `212-toolbar-followups` `9b280a32` ·
`214-toast-capture-settle` `6ad30b55` · `215-sheet-family-followup` `173f7d3a` ·
`216-settings-sheet-phone` `3a94e58b` · `217-goal-refresh-1315` `3a94e58b` (this leg).

**Scratchpad paths, checked and not present in the tree at 13:15** — reserved conventions, not
files on disk right now: `scratchpad/pause-state.md`, `scratchpad/needs-followups.md`,
`scratchpad/continuations/` (one continuation prompt per delegated leg, per handover-24), and
`scratchpad/glm/queue/`. A leg that creates one of these should say so here rather than assume the
next reader already knows.

**Three standing rules, restated because they outlive any one leg.** A delegate's report is a
claim — a lander re-runs every check itself and judges a moved capture by decoded pixel delta, never
`pixelHash`. GLM 5.3 flash via `cli-pi` DevPass (`--provider llmgateway --model glm-5.3-flash
--thinking max`) carries text-only docs legs only — it cannot carry a code leg. The spec-kit
orchestrator is rebuilt only from a clean Public-repo tree, never from inside a worktree with local
drift.

### 2026-09-07 ~15:20, `worktrees/216-settings-sheet-phone`, T072 + T073 landed against `054`

Operator report (iOS, 0.0.30, ~10:20): *"View sheet still had bad ui ux and horizontal overflow on
0.30 btw"*, capture `operator-settings-sheet-ios-0030.png` (the operator's own, not committed
here). Root cause: `.db-view-config-panel.db-mobile-bottom-sheet .db-panel-row` never overrode the
shared `.db-panel-row`'s left-to-right flex row, so the database Settings sheet's rows split the
phone's width between a label column and whatever it left the control — same shape as the anchored
desktop panel — instead of stacking one column the rest of this family's phone sheets already use.
Fixed in `styles.css` only: the row stacks to a column inside this sheet, and `.db-checkbox` is
excluded from the field's `:first-child` flex-grow rule (a second, real defect the wider field
exposed — checkbox switches were stretching to the row's full width). Recorded as roadmap row 66,
`054/tasks.md` T072, `054/acceptance-criteria.md` AC-013 (Met), `054/checklist.md` CHK-026 and
OPS-004 (operator device confirmation, not agent-ticked).

**The report's second half — the horizontal overflow — was recorded as inferred by that leg and
settled at landing as T073.** It is a different mechanism, and the landing verifier reproduced it
rather than reasoning about it. On a phone sheet "Formula result storage" is not a dropdown: the
renderer draws `.db-new-placement`, three sentence-length `<button>`s. Obsidian's own `button` rule
sets `white-space: nowrap` with `justify-content: center` and a fixed `height`, and this stylesheet
overrode none of it, so the option cannot wrap — it lays out as one centred line and paints outside
its own box on both sides. Reproduced on the geometry 0.0.30 shipped, at the text size the
operator's own capture implies: option box 217.7px, text 296px, **78px of ink outside the button**.
Fixed by answering those three declarations on that one rule, scoped to `.db-view-config-panel`;
ink past the box is now 0px at every text size the host offers, against 3/45/102px before at
19/24/30px. Scoped rather than family-wide for a measured reason: unscoped, the same rule grows the
column-width adjuster's presets from 32px to 44px, which lands that sheet's height inside
`classifySheetFrameShape`'s floating/flush hysteresis band, so once a keyboard forces it flush it
never returns to its 8px floating inset — two `verify-placement.mjs` rows red, green again once
scoped. That surface already has the taller height in the shipped app for the same host reason, so
the question belongs to its owner and is recorded as `054` T075. **T072's stacked row hides this
at the 16px default and it returns at the operator's own size**, which is why the row needed both
halves. Everything else on the surface was cleared by live measurement: **zero native `<select>`s**,
and every enabled dropdown opens the family's phone picker sheet with 44px rows — the landed
052/063 rule is honoured. Recorded as `054` T073/AC-014/CHK-027.

**Two things a successor should not have to rediscover.** First, **no gate lane pins either fix**:
with both reverted, `sheet-grammar.mjs`, `render-assertions.mjs` and `touch-targets.mjs` all still
exit 0, and `sheet-grammar.mjs`'s own §2 comment already admits it cannot see this shape. The guard
is `054` T074, which carries the one-line predicate, the 356 pre-existing false positives it
surfaces today, and the two harness-fidelity fixes it depends on. Second, **the capture corpus was
stale at that leg's HEAD**: it classified 23 moved captures as byte-only by `pixelHash`, which is
quantised and blind to small real changes, and restored them. Re-capturing at that leg's own
stylesheet reproduces real deltas for several of them (`panel-record-detail-sheet-*`,
`constructed-chart-toolbar-options-mobile-dark`, `constructed-column-manager-mobile-dark` among
them). This landing re-derived them and judged the whole set by decoded pixel delta over three
capture runs instead. `npm run gate` 26 green. Full detail: that worktree's own `.handover.md`
(untracked) and `054`'s docs above.

### 2026-09-07 ~17:05, `218-settings-sheet-guard` VERIFIED AND LANDED by an Opus lander

Every claim in the leg's report below was re-run rather than read. **Both T074 rows confirmed, one
with a caveat now written into the tool; T075's refutation confirmed by independent measurement;
the hand-patched manifest confirmed against two full recaptures.**

**T074 row 1 (row stacking) is tree-sensitive.** Removing `flex-direction: column` from
`.db-view-config-panel.db-mobile-bottom-sheet .db-panel-row` in `styles.css` itself — not through
the tool's injected override — takes `sheet-grammar.mjs` to `FAIL 0/21 rows sit label-above-control`,
`FAIL 0/21 rows have a control at >= 90%`, exit 1. Restored, exit 0.

**T074 row 2 (placement-button ink) guards the defect but not the rule's presence.** Deleting the
whole `.db-new-placement-option` fix rule from `styles.css` leaves the row GREEN and the tool at
exit 0. The reason is a harness fact, not a mistake in the row: `tools/live/` models no host
stylesheet — there is no `--input-height` and no host `button` rule anywhere under it, while
`tools/storybook/verify-placement.mjs` carries both — and the overflow only exists under Obsidian's
`white-space: nowrap`. Replacing the fix rule with those three host declarations (the pre-fix DEVICE
state) does take it red: `FAIL 2/3 buttons stay inside their own box at 19px`, worst 17.0px of ink
outside, exit 1. So the row is real for the defect it names; it is not a tripwire for someone
deleting the rule. That limitation is now stated in the tool's own section comment
(`440da14d`), along with two garbled comment fragments repaired in the same commit.

**T075's premise refuted independently, and the declaration proved inert.** A probe mounting the
real `openColumnWidthAdjuster` at 390x874 with the host button rule modelled measures the panel at
364px against an 844px viewport — ratio **0.4313**, against a floating cutoff of
`1 - 248.5/874 = 0.715675` and a flush floor of `0.745675`. Presets measure **32.00px** each at
`flex-basis: 0px`. The decisive run: repeating it with `--input-height: 44px`, the real phone value,
leaves presets at 32px, the panel at 364px and the ratio at 0.4313 — the host `height` rule is
genuinely inert, exactly as T075 argued. Commenting out `heightRole: "floating"` and re-running
returns a byte-identical class string
(`db-mobile-column-width-panel note-database-container db-mobile-bottom-sheet db-sheet-floating
db-overlay-enter is-visible`), the same ratio and the same 8px resting inset: **no shape changed.**

**The hand-patched manifest was correct.** Two full `npm run screenshots` runs on the rebased tree
(606 entries, exit 0 each) produce a manifest whose only structural difference from main is the six
`src/views/column-width.ts` sourceHash rows the leg patched by hand, with all six pixelHashes and
all six PNG bytes unchanged. Five other PNGs moved across the two runs — a different set each run,
every pixelHash unchanged, four at a maximum channel delta of 1, and
`chrome-table-load-more-desktop-light` at 804 channels/209 max in the second run only, a state that
flips between runs of the identical tree. All five restored;
`constructed-column-width-adjuster-mobile-light.png` opened and read.

**One thing left open.** `styles.css`'s own comment above the wrap rule still asserts "That
surface's real height in the app is already the taller one, since the host gives every button
`height: var(--input-height)`" — the exact claim T075 refuted and the 44px probe refutes again. It
was not corrected here: editing `styles.css` moves the stylesheet hash and drags in the css-lane
release and another full recapture, which is a row of its own, not a rider on a verification pass.
Whoever next opens that rule should fix the comment.

Rebased onto `443061d4`; all ten conflicts were generated evidence, resolved to main's side and
re-derived by their owning tools. `npx tsc --noEmit` (0), `npx vitest run` (1630/1630 in 151 files),
`npm run build`, `node tools/live/sheet-grammar.mjs`, `node tools/live/render-assertions.mjs`,
`node tools/naming/scan-comments.mjs` (502 files, 0 violations) and `npm run gate`
(**26 green, 0 red**) all exit 0. `054` and this parent both `RESULT: PASSED` under the realpath'd
orchestrator with `--strict`. `tools/live/sheet-rebuild.json`'s filter-sheet row re-measures
527/627 where main records 836/836 — not this landing: every input `sheet-rebuild.mjs` declares is
byte-identical to main, and the only two files this branch changes under `src`, `styles.css` and
`tools` are `column-width.ts` and `sheet-grammar.mjs`, neither of which it reads.

### 2026-09-07, `worktrees/218-settings-sheet-guard`, `054` T074 + T075 landed

The two rows the T072/T073 landing left open. **T074**: no gate lane pinned either fix — with both
reverted, `sheet-grammar.mjs`, `render-assertions.mjs` and `touch-targets.mjs` all still exited 0.
`sheet-grammar.mjs` gained two permanent rows against the real `ViewConfigPanelRenderer`, scoped to
the database Settings sheet rather than attempting the general document-wide predicate (still not
landed — the three fidelity gaps named at the prior leg are real and this did not touch them).
Row stacking: every `.db-panel-row` owning both a label and a field (21 of the sheet's 23 rows)
asserted label-above-control at >= 90% of the row's own inset-to-inset width, plus the sheet's own
`scrollWidth === clientWidth`; reverting the row-stacking rule's `flex-direction` unstacks all
21/21, restoring returns 21/21. Placement-button ink: the same
`overflowX === "visible" && scrollWidth - clientWidth > tolerance` predicate the prior leg tried
document-wide and reverted (356 pre-existing false positives), here scoped to exactly the three
buttons this sheet draws — nothing else in scope to misfire on. Measured at the 16px default and at
the text size the shipped defect was measured at (19px): clean at both; reverting the wrap rule
overflows 1/3 buttons at 19px (0/3 at 15px — the string fits nowrap at that size regardless,
matching the reading already on record), restoring returns 0/3 at both.

**T075**: the open question was whether the column-width adjuster's frame shape should follow its
real height or declare `heightRole`, on the premise that the host's button-height rule already
makes its four presets the taller 44px in the shipped app. **That premise does not hold.**
`.db-new-placement-option` carries an explicit `flex-basis: 0` (`flex: 1 1 0`), and a flex item's
main-axis size under `flex-basis: 0` with no extra space to distribute comes from `min-height`
alone — an explicit `height` is not consulted, confirmed on a bare two-button fixture in a real
browser and, more directly, on `verify-placement.mjs`'s own adjuster keyboard section: on the
shipped, unmodified CSS, all three rows already pass and the resting ratio (~0.435) sits nowhere
near the classifier's hysteresis band (~0.716-0.746). The failure the open question described is
real only if T073's wrap rule is hypothetically unscoped (`min-height` does raise the rendered
height, unlike `height`) — reproduced again on demand, both keyboard rows red, and confirmed not a
defect the shipped tree carries. Decided: `openColumnWidthAdjuster` now declares
`heightRole: "floating"` — matching exactly what the classifier already computes for this content,
confirmed by `verify-placement.mjs`'s identical resting-inset reading before and after (no shape
changed, no ADR). The reason to declare it anyway rather than leave it classified: this panel's
content is fixed (a header, one range row, one row of four stacked presets) and never varies with
vault data, so a live classifier buys nothing a stated fact does not already cover, and declaring it
forecloses this exact failure mode for good rather than leaving it to whichever future change next
grows these buttons past the hysteresis gap.

`npx tsc --noEmit`, `npx vitest run` (1630/1630), `npm run build`,
`node tools/live/sheet-grammar.mjs`, `node tools/storybook/verify-placement.mjs` (412/415, 3 red
for a declared reason, unchanged) and `npm run gate` (26 green, run twice in the foreground) all
exit 0. `scan-comments.mjs` and `scan-failing-values.mjs` exit 0 standalone. `npm run screenshots`
recaptured the whole corpus once to clear staleness on the 6 column-width-adjuster-attributed
captures; all 6 came back `pixelHash`-identical (only `sourceHashes` for `column-width.ts` moved),
so nothing was actually recaptured — the manifest was hand-patched to carry just that hash update
rather than the two unrelated files the same broad run perturbed by re-encoding noise (both
confirmed byte-noise-only by decoded `pixelHash`, and reverted rather than kept). Files:
`tools/live/sheet-grammar.mjs`, `src/views/column-width.ts`, `main.js`, `screenshots/manifest.json`
(one hash line, six entries), plus `054`'s `tasks.md`/`checklist.md`/`acceptance-criteria.md` and
its regenerated `graph-metadata.json`. Full detail: that worktree's own `.handover.md` (untracked)
and `054`'s docs above.

### 2026-09-06 ~20:10, `orchestrate-handover-24`, read from `.worktrees/193-goal-refresh-0930`

**Documentation only.** No `src/`, `styles.css`, `tools/` or `main.js` file was touched. Main moved
under this leg as it has all week — `git worktree list` in the primary checkout read `92d5c00d` on
main while this worktree sat on `64f9853f`. **Confirm branch tips yourself; every sha below records
what was true at 20:10, not a pointer to follow.**

**`0.0.30` shipped at `e016e75c`** — the calendar rebuild, the board page scroll, the sheet fixes
and the rewritten README.

**Landed since 16:35.** `c6fde2a2` the calendar (live evidence and graph metadata re-derived after
the rebase) · `dc1d54a9` the board page scroll, dropping the inferred sticky header · `3e1c3c65` the
phone month chip's ellipsis moved inside the cell · `52598819`, `dc6df4b4` and `e9cb2417` the
`067-sheet-family-remediation` synthesis, its gate re-derivation and the comment-scan pointers ·
`9d9515ae` opened `059` · `c49ca7f6` plus `870d87a2` opened `061` and recorded its cell interaction
model · `f52109c1` opened `062` · `7e44e487` plus `21e6366a` opened `063` and ruled its colour
picker · `cf15a636` opened `065` · `1b3aecf7` opened `066` · `b4c78e98` opened the `068` rename plan
· `cb27def3` and `9ad2fb34` the README rewrite and its early-alpha status · `f88c17c9` the Notion
web reclassification · `64f9853f` the Fibery Mobbin harvest, **1,800 files, with T035 content
reclassification still owed**.

**The cell interaction model is decided** (`870d87a2`, `061`), read from four reference products:
a tap **edits**, a long press **selects**, selection presents as a **three-control anchored pill**,
overflow moves to a **`···` sheet**, the editor is drawn **at the cell** and claims the bottom dock,
and desktop gets a **30px** bar.

**Rulings taken today.** `062` ADR-003/005/006/007 · `059` ADR-004/010/011 · `066` ADR-001/002 ·
`065` ADR-005 through ADR-008 · `063` ADR-005 · `068`'s prefix and author · `057`'s month-chip
ellipsis · `056`'s edge-only scrollbar. **The verbatim list lands in `roadmap.md` §6A when the fold
leg lands** — this entry is the summary, and the fold is authoritative over it.

**`068` is the rename, and its shape is now ruled**: the plugin id plus an `obnotion-` prefix
everywhere, a `data.json` migration, and `manifest.json`'s author set to **MichelKerkmeester**. It
runs as **one leg** after every in-flight landing, and **`0.0.31` is the rename release**.

**Delegation, as ruled today.** Native in-session agents carry the work — **Sonnet implements, Opus
verifies and lands**, one worktree per leg, *"do the work yourself, never spawn a sub-agent"*, and
**never a Fable sub-agent**. **GLM 5.3 flash max runs alongside through cli-pi**, and the transport
changed: **OpenRouter credit reached 0 at 20:10**, so the GLM route is
`--provider llmgateway --model glm-5.3-flash --thinking max` (DevPass). **Use GLM where possible**
on text-only legs; images and live verification stay native. **claude2 print-mode legs remain** for
the Mobbin harvests, which need the MCP config. **Both logins share one session-cap window** — it
was hit at **17:05** and **18:57** and reset at **19:40** — so **write a continuation prompt per leg
under `scratchpad/continuations/`** before dispatching, or a capped leg is lost rather than resumed.

**In flight at 20:10.** The `060` and `064` syntheses (GLM DevPass, Opus landers waiting) · the
`058` lander · the `056` edge-only lander, which also fixes the always-visible vertical thumb · the
rulings fold leg · the ClickUp harvest in `worktrees/151` · `061`'s implementation leg on GLM
DevPass.

**`060` and the `056` edge-only lander landed while this leg rebased.** `3ab83d8b` opened `060-notion-calendar-refinement`,
`c0f96910` re-derived its citations and `92d5c00d` corrected five overstated claims in it. So
**seven of the eight reserved children are open** and only `064` is still planned — this document's
"in flight at 20:10" line above is the record of 20:10, and `goal.md`'s tables carry the corrected
state. The board scrollbar followed: `a70dd113` confined the desktop reveal to its own edge and
`dfb416ab` hid the desktop vertical scrollbar at rest, closing the `056` ruling taken this evening.

**Worktrees, read from the primary checkout at 20:10.** `main` `92d5c00d` ·
`065-anytype-research` `83fc7121` · `151-harvest-clickup` `3b3ac633` · `174-notion-board` `9d9515ae`
· `176-notion-sheets` `c49ca7f6` · `177-notion-table` `f52109c1` · `179-notion-dropdowns` `7e44e487`
· `180-notion-toolbar` `80c2bb48` · `181-notion-record` `cf15a636` · `182-notion-states` `1b3aecf7`
· `185-card-title-formats` `90e6fe69` · `186-board-scrollbar-edge-reveal` `dfb416ab` ·
`190-fold-rulings-notion-children` `e016e75c` · `192-notion-sheet-cell-model` `64f9853f` ·
`193-goal-refresh-0930` `64f9853f`. **`175-notion-calendar` is gone from the list** — the `060` leg
is running without the worktree it started in, so find it before assuming it died.

**Order of work is `goal-prompt.md`'s.** Land `058`, the `056` edge-only lander, `060`, `064` and
the fold; then ClickUp and the T035 content reclassification for Fibery and ClickUp; then the
implementation legs per child in the recorded order (`061`, `063`, `059`, `062`, `065`, `066`,
`060`, `064`, `067`), each implemented by GLM or Sonnet and landed by Opus; then `068` as one leg
and `0.0.31`; then the device rows. Do not tick an operator row.

### 2026-09-06 ~16:35, `orchestrate-handover-23`, read from `.worktrees/178-docs-refresh-1630`

**This is a documentation-only leg.** No `src/`, `styles.css`, `tools/` or `main.js` file was
touched. Main moved under it while it ran, as it has every session this week — **confirm branch tips
and worktrees yourself; treat every sha below as a record of what was true at 16:35, not as a
pointer.**

**Eleven legs landed since 11:05.** The calendar's unscheduled chip (`071041b7`), the wrap
precedence reversal and the phone wrap fix (`2c3c499a`), the stacked-sheet fix (`e632a1e1`), the
board palette (`dd71114f`), the modal-as-sheet screenshot scenarios (`5aeb7087`), the Wrap-row
wording hint (`5167eb8f`), the icon-picker drift (`4294770d` — resolved as a pointing-device
scrollbar mode, with the capture inputs widened rather than the baseline quietly re-pinned), the
sheet-family reconciliation (`6b16b87a`, taking `044` to 6/7, `048` to 7/8 and `051` to 2/9),
no-confirm single delete (`32411403`), the desktop dropdown combobox (`a952e5e7`) and the
failing-values wording (`0d36b377`).

**Two operator programmes now bind the same surfaces at once.** Anytype parity is unchanged for the
board and the calendar. On top of it, at ~16:10, the operator ordered a **Notion refinement** across
every UI phase. Eight children are **reserved and not created** — `059` board, `060` calendar, `061`
sheets, `062` table, `063` dropdowns, `064` toolbar, `065` record, `066` states. `goal.md` **D15**
and `roadmap.md` **§7.15** carry the rule that keeps them from fighting: **the refinement is
additive and never silently overrides a landed Anytype ruling**; a contradiction becomes a
**Proposed** ADR in the child and stops there.

**The pipeline, because its mechanics are what a resuming session gets wrong.** Per surface: (1) a
**Sonnet digest** of the relevant Notion captures at `<phase>/notion-screens-digest.md` — this stage
exists because **GLM 5.3 flash cannot read images**, so a capture reaches the loop as measured prose
or not at all; (2) `/deep:research:auto`, **5 iterations**, `--stop-policy=max-iterations`, on **GLM
5.3 flash max**; (3) an **Opus synthesis** that opens the child, landed by a fresh Opus verifier.
Wave 1 (`059`-`062`) has been running since **16:14** in `worktrees/174`-`177`; wave 2
(`063`-`066`) is queued.

**Two mechanics of the runner that will otherwise cost an hour each.** The research runner's print
session **ends when the fan-out detaches** — it looks like the loop died and it has not — so
`finish-research.sh` waits for the lineage and resumes the synthesis; run it rather than
re-dispatching. And **the gate must be run with stdin from `/dev/null`**, or `verify.mjs` hangs at
0% CPU looking like a slow run rather than a blocked one.

**The GLM route is a transport rule, not a model rule.** The operator at ~16:25:
*"use openrouter untill usage is 0 then devpass"*. `openrouter/z-ai/glm-5.3-flash` is tried first,
`llmgateway` (DevPass) is the fallback; OpenRouter credit read **$1.65 of $30 at 16:25**, so the
fallback is exercised rather than theoretical. Model ids pass exactly as each transport spells them,
never a near-miss (D14).

**In flight at 16:35, by worktree.** `150` Fibery harvest (web only, since ~16:04) · `151` ClickUp
harvest (queued, Opus xhigh) · `165` calendar rebuild (**12 of 15 gestalt rows green**, unlanded) ·
`167` board page-scroll · `170` Notion content reclassification (the harvest's non-flow groups are
query-derived; 5 of 9 web spot checks were in a group they do not depict) · `171` shell lane rows
and depth-3 captures · `172` the 10-iteration sheet-family research on DevPass, started ~15:50 on
the operator's *"Run it now on the current state"* · `173` comment-hygiene enforcement (the comments
lane was not checking artifact ids) · `174`-`177` the Notion wave-1 research.

**Order of work is `goal-prompt.md`'s**, and it starts with landing `165`, `167`, `170`, `171` and
`173`, then cutting **0.0.30**. Do not tick an operator row, and do not open `059`-`066` by hand.

### 2026-09-06, read from this worktree (`.worktrees/152-docs-058-and-refresh`) — main is a moving target, do not trust a pinned sha

**This session's own work is a documentation-only leg**, run per an explicit hard rule: no `src/`,
`styles.css`, `tools/` or `main.js` file was touched, nothing was pushed, and a fresh verifier lands
it. It opened `058-card-title-and-title-formats` from the operator's phone-board report and amended
six sibling goals — `047` (Mobbin reference harvests), `051` (the desktop Settings side sheet, ADR-008,
and ADR-007 E4's closure), `052` (the combobox ruling, the Operator-dropdown anchoring defect), `053`
(the toolbar gear button, the table footer rule, row 53 confirmed shipped), `055` (the single-row
delete confirm removed, closing E4), `056` (R6/R7 board-colour rulings, a pointer to `058`) — plus a
refreshed `roadmap.md` (§4, §5.A, §6A) and this document. Every touched packet's `validate.sh
--strict` first `RESULT:` line reads `PASSED`; the 005 parent's own recursive-free packet check does
too.

**Main is advancing concurrently, in real time, while this leg ran.** Checked twice in one sitting:
main's `HEAD` moved from `0e8185b6` to `03aa151d` between two `git rev-parse` calls a few minutes
apart, and `manifest.json` on main already reads **`0.0.29`** — a version this session was told to
expect only *after* `056`'s residuals and `057`'s flatten-to-chip-ink leg landed. Reading main's log
directly (not from memory) shows both have: `9f30fc31` (`fix(calendar): flatten the week/day timed
block to the month chip's ink`) and a confirm-primitive/E4 sequence (`1a72ed9e`, `e2e2416e`,
`66d92b4f`) plus board-geometry work (`0fe620fd`, `eebbb29f`, `e97524fb`, `1a4b30e6`) and a doc
commit, `06c6425a`, that **already records `056`'s R6/R7 rulings** independently of this session's
own `056` amendment. `git diff --stat` between this branch's merge-base (`3b3ac633`) and main's tip
shows real, substantive, **independent** edits to `055/056/057`'s own tasks/acceptance/decision
files — this branch and main diverged on the same shared program docs.

**What this means for the next session, stated plainly rather than smoothed over.** This branch's
`051`/`052`/`053`/`055`/`056` amendments were written and validated against this branch's own base
(`3b3ac633`), which is now behind main. They are not wrong — every finding in them was read from
source and is still true of the code as of this branch's base — but landing them onto current main
needs a real rebase and a truth reconciliation pass, the same discipline this program has applied to
every prior concurrent-edit collision (`roadmap.md` §7's own worked examples), **not** a blind merge.
In particular: `056`'s R6/R7 addendum in this branch's `decision-record.md` will very likely need to
be read alongside `06c6425a`'s independent record of the same two rulings and reconciled rather than
both kept. Do not assume either side is the complete picture; read both.

**Live worktrees relevant to tonight**, re-read from `git worktree list` plus each one's own
`git log -1` and `git status --porcelain` at the time of this rebase — not carried from the earlier
read, which is already stale:

| Worktree | Tip | Working tree | What it carries |
|---|---|---|---|
| `146-impl-053-table-footer` | `38dde17a` | clean | The footer rule landed and recorded (`20389105` is its earlier docs commit); ahead of what `053`'s own docs describe |
| `147-impl-052-searchable-dropdowns` | `4b3adca0` | 11 files dirty | The Operator-dropdown anchoring fix; the combobox behaviour itself is still ahead of it |
| `153-impl-051-settings-side-sheet` | `6c718f63` | 58 files dirty | ADR-008's side sheet role, mid-flight |
| `154-impl-055-no-confirm-delete` | `c68e0347` | clean | `fix(delete): skip the confirm for a single-row delete, keep the toast's Undo` — E4's ruling implemented, not yet on main |
| `155-impl-057-phone-week` | `6c718f63` | 32 files dirty | T018's minimum column width and horizontal phone-week scroll |
| `156-impl-056-palette` | `0e8185b6` | 10 files dirty | R6/R7's tint fill and neutral grey |
| `148-harvest-notion`, `149-harvest-evernote`, `150-harvest-fibery`, `151-harvest-clickup` | all `3b3ac633` | `148` 1 file dirty, rest clean | `047`'s four Mobbin harvests, none dispatched. **Dispatch them one at a time** — four concurrent capture legs contend for the same manifest and lane artefacts |

**There is no `157-release-0-0-29` worktree.** The earlier read of this document named one; `git
worktree list` has no such entry, and `0.0.29` was cut on main directly at `03aa151d`. **None of the
worktrees above was opened for content by this leg** — the table reports their git state only.

**Corrected against the operator's own dictation, and the earlier correction was itself wrong.**
The earlier read reported `793b9b4` as "not a valid revision"; that string is a mistyped
abbreviation. **`793ab9b4` resolves**, and it is `chore(gate): re-stamp evidence timestamps from the
closing gate run` (2026-09-06 04:11) — the *closing* commit of the month-grid landing sequence, not
the landing. The true chain, read from `git log --oneline | grep -i calendar` on main:
**`d2fe6bea`** `feat(calendar): retarget month grid to Anytype's measured layout (T005-T007)` is the
landing; **`9ccb8d80`** `docs(specs): close AC-002 and AC-003 on the month-grid retarget` records
it; `4beec550` recaptured, `3ade4cae`/`2f5cf1e7` took the CSS lane, and `793ab9b4` re-stamped the
evidence. Separately, **`9f30fc31`** `fix(calendar): flatten the week/day timed block to the month
chip's ink` is the *flatten* landing and **`6b5d0ea2`** is its docs commit — a different leg from the
month grid, and the pair the earlier read had conflated with it. Cite the landing, not the
re-stamp: an evidence re-stamp names the run, not the change.

**Harness traps learned tonight, from the ledger this session read rather than from firsthand
reproduction — recorded as reported, not re-verified by this leg:** `git config rerere.enabled` is
`false` in this repository (confirmed directly) — do not expect rerere to resolve a rebase conflict
automatically. Capture **bytes** jitter run to run while `pixelHash` stays deterministic — a byte-diff
on a PNG is not evidence of a visual change; read the hash, and if it moved, look at the image. A
print-mode gate leg must not be backgrounded — the pattern this program already carries
(`npm run gate` needs `</dev/null`) generalises: anything that reads stdin or writes a progress
stream to a foreground terminal will hang or truncate if it is not run to completion in the
foreground. When restoring a bytes-only re-encoded capture, restore the **named file paths**, never
the whole directory — a directory-level restore can revert a sibling capture that changed for a real
reason in the same pass. **`gh` resolves to the upstream repository from the primary checkout**, so
every `gh` call that must act on this fork passes `-R MichelKerkmeester/obsidian--notion-clone`
explicitly; without it a release or issue command silently addresses the wrong repository.

---

**Main carries `0.0.29`** (cut `03aa151d`, 2026-09-06 09:01; the cadence row landed after it at
`578991e8`). Tonight's later landings on main, in order and each read from `git log`:
`6c718f63` (08:23, the calendar leg's post-rebase re-derive), `4224b092` (08:41, the confirm
primitive's evidence rebuild), `0e8185b6` (08:54, the board residuals' third-rebase re-derive),
`03aa151d` (09:01, the `0.0.29` cut) and `578991e8` (09:09, the cadence row). **This branch is
rebased onto `578991e8`**, and the shared-doc reconciliation the paragraph above asked for has been
done rather than deferred: `051`'s E4 closure, `056`'s R6/R7 and the roadmap's §5.A rows and §6A
entries each survive **once**, taking main's landed record where the two disagreed and folding in
only what this branch carried that main did not.

The paragraph below is retained as the state at `0.0.26` and is history, not current:

**`0.0.26`** (cut `8c7b65aa`). It ships `006-record-open-target`'s docking fix
(`ae46da94`) — the generalisation of §4 row 48 to **every** caller that opens a record with no
element to point at, which is §4 **row 52**, now reading *shipped in 0.0.26, awaiting operator*.
`0.0.25` under it carries the five desktop fixes (rows **47-51**) and `0.0.24` the stacked sheets,
sheet grammar, linked-view chrome and gallery migration. **Nothing in any of the three is
operator-confirmed**, which is D3 working as written, not a gap.

**All six capture true-ups are done, and the reconciliation pass that read them together is this
one.** `050`'s T001 landed earlier; `051`-`055`'s landed 2026-09-05 in worktrees `087`-`092` as
`8e0149af`, `a58bbcd5`, `fbbddc13`, `621de37f` and `ffcf434b`+`cd8030a8`. Running five reads of one
product in parallel is what made the next paragraph possible, and it is the argument for having done
it that way.

**`050`'s own read — the program's read of record — was wrong in five places, and its siblings found
them.** `053`'s T001 opened the catalogue List views, the `New ⌄` menu and the per-layout settings
blocks that `050` never opened:

| `050` said | The captures show | Now at |
|---|---|---|
| C2: no chip row on any capture | The chip rail on **eleven** captures, and **conditional** — present on 5 of 5 List views carrying a filter, absent on Grid, Gallery, Kanban, Calendar and Graph | C2 withdrawn; the rail's geometry adopted, its contrast refused |
| C7: no per-view default in the product | `Default Type for this View` and `Template for this View`, in the `New ⌄` menu's `Settings` section | C7 narrowed to the settings panel; our row belongs beside the create affordance |
| REQ-013: the filter panel is one `+ New filter` row | That is the **empty state**. The populated panel is captured across **twelve** relation formats | REQ-013 leaves the "no reference screen" list, which falls from five items to four |
| The page limit is 60, Anytype's captured default | **Per-layout**: Gallery 60, Kanban 10, and no limit row on Grid, List, Calendar or Graph | AC-014's 60 becomes **our** number for an embedded table, argued rather than quoted |
| §2: hover states were never captured (from the capture index) | **37** of the 150 menus were reached by hovering a parent row, each photographing that row hovered: `#232323`, 28px, 1.14:1 | Corrected in `050` §2, in `screenshots/anytype/README.md`, and in `roadmap.md` §6A |

**Three of the four are one error**, and it is worth carrying forward: **an absence asserted from a
surface that was never examined.** C2 scanned the four toolbar icons and never the band beneath them.
C7 searched the settings panel and concluded "absent from the product". The page limit was read off
one layout's panel and quoted as a product default. `050` ADR-003 gains a second corollary —
*absence in one captured surface is evidence about that surface only*.

**Four numbers disagreed across the five reads, and `roadmap.md` §7.10 settles them**: secondary text
is **7.11:1** not 7.95:1 (the read that stated its method wins), the `#232323` fill is **1.14:1** not
1.20:1 (three packets and a re-derivation against one), Anytype's motion exit is **0.2s** not 0.1s
(`055` read the source file `047` paraphrased), and the iOS sheet row pitch is **not** a disagreement
— five packets measured five different sheets and there is no single product figure. The same section
names **one owner per shared primitive**; two of the six were owned only in this document's family
table and are now written into their own packets.

**This pass landed five new phases: `051`-`055`.** They come from one operator instruction on
2026-09-05 — *"research recommendations and how to tackle / update / improve every modal, sheet and
general ui ux to take the best from AnyType and componentize stuff as much as possible."* `050`
already owned the fourteen view-level adoption items; nothing owned the componentization half. The
split is by surface family, with **one owner per surface**:

| Phase | Family | Owns | Level |
|---|---|---|---|
| `051-modal-and-sheet-componentization` | Modals and sheets | One shell primitive; **the confirm primitive** | 3 |
| `052-dropdown-menu-and-picker-componentization` | Dropdowns, menus, pickers | The menu primitive and the picker family | 3 |
| `053-toolbar-and-view-controls` | The toolbar | Five composed primitives; **the condition row**; `050` items 1, 2, 4, 7, 10, 12 | 3 |
| `054-record-and-relation-surfaces` | Records and relations | Record primitives; **one inline editor per column type** | 3 |
| `055-states-feedback-and-motion` | States, feedback, motion | Empty/toast/motion components; `050` items 5, 8, 9, 14 | 3 |

`048`'s stacking model is a **constraint** to all five and is re-specified by none of them.

**Four of the five were drafted outside this runtime**, by GLM 5.3 flash through cli-pi, in parallel
worktrees `080`-`084`. Two things happened that a later reader needs to know about, and both are
recorded rather than smoothed over.

**`051`'s leaf died silently after `create.sh`.** It left a 15-line `spec.md` of scaffold comment,
an 8-line `plan.md`, a bare-title `tasks.md`, and no `goal.md`, `checklist.md`,
`acceptance-criteria.md` or `decision-record.md` at all — with no error the orchestrator saw. The
whole packet was written in-runtime. **This is the fan-out's real failure mode**: not a bad draft,
an absent one that reports as present.

**`050`'s `design-trueup.md` landed while the drafts were running**, and it overturned claims in
every one of them. Under `050` ADR-003 the capture beats `047`'s code-derived research, and four
kinds of disagreement followed — tabulated with their resolutions in `roadmap.md` §7.9:

1. **A behaviour adopted that does not exist.** `053` D7 and its ADR-001, and `052` §7, adopted
   Anytype's "dual-mode" filter and sort trigger icons. The funnel measures `ink=52, blue=0` on a
   filtered view **and** an unfiltered one — identical to the pixel, across all 120 catalogue
   captures, cross-checked against `tools/mock-data/anytype/views-report.json`. Rejected, and
   rejected a second time on contrast: colour-only signalling fails WCAG 1.4.11 where our count
   badge already carries text. Adopted instead: the `N applied` count label in the settings panel.
2. **"Today" premises the tree does not have.** All four of `055`'s `050` items were among the six
   thresholds the true-up found unfalsifiable. The scroll-restore machinery already exists
   (`database-viewport.ts`, four request kinds); `row-menu.ts` **cannot** render empty; **twelve**
   empty-state reasons ship, not one; and there is **no virtualization anywhere in `src/views`** to
   avoid. All four reds were rewritten from the tree.
3. **Designs built from a screen nobody saw.** `053` T1's view-tab context menu and `054` A5's
   search-first add-relation picker are both `047` source reads. Now labelled *design inferred from
   source code, not seen*.
4. **Line drift.** Twenty-five `file:line` citations across four drafts were wrong. `053`'s were the
   most accurate — all seven dead-method line numbers exact — and `055`'s the least, including a
   `120ms` transition count of **78** that recounts to **42**.

**All five packets pass** `validate.sh --strict` with `Errors: 0` on the first `RESULT:` line, and
each carries a binding `goal.md`. **All five have now run their T001**, and every one still reads
`0/N` in the parent's DONE table — which is correct, not a lag. A true-up designs against the
captures; **T002 is what measures a red**, and no packet has run one. `roadmap.md` §5.A reads *T001
true-up done 2026-09-05, implementation pending* for all six, with `053`'s cell naming the codex leg.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: THE TRUE-UPS ARE DONE — RUN T002, NOT CODE

**Every packet's next step is its own T002**, the red-first measurement of the thresholds its true-up
restated. `053`'s implementation leg is already running on codex and is the exception, not the
pattern: it starts first because it carries `050` items 1, 2, 4, 7, 10 and 12 and because all three
of its ADRs are Accepted. **`052` is the next to open** (its `checklist.md` C7 is now reconciled and
its migration table, T003, is the leg after), then `054`, `051`, `055` by inventory rank.

**Do not read a true-up as permission to write code.** Six documents now describe what each surface
should be; not one of them has observed a failing value on the current tree. D2 is unsatisfied in all
six until T002 runs, and the whole reason `050`'s thresholds had to be restated was a packet that
asserted a red without measuring it.

### The five operator questions, answered 2026-09-05 (~14:15) and unchanged since

**`053`'s three ADRs were PROPOSED at landing.** Each was tested against one question — *does it
sit inside a decision the operator has already taken in `roadmap.md` §6A?* — and **none of the
three did**. §6A covered the chip rail's neighbours but not the chip rail, and the confirm's
presentation but not its timing. The operator has since answered all three directly, and `051`'s two
open questions alongside them. All five are now **Accepted** — quoted in full in `roadmap.md` §6A's
"Five more, taken 2026-09-05 (~14:15)" table and in each packet's own `decision-record.md`.

1. **`053` ADR-001 — extend the existing chip rail, or rebuild it on a new primitive?** **Accepted:
   "Extend the existing rail."** `active-view-controls-renderer.ts` is kept and reshaped to the
   Anytype-derived layout; no new chip-row component. (Its dual-mode clause was already amended out
   at landing.)
2. **`053` ADR-002 — delete the seven dead settings-entry methods and keep their classes?**
   **Accepted: "Delete methods, keep classes."** The seven zero-call-site methods
   (`toolbar-renderer.ts:512`, `:519`, `:551`, `:1594`, `:2239`, `:2252`, `:2290`) are removed; the
   two anchor-fallback queries (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) keep
   the classes `createSettingsEntry` stamps on the live trigger.
3. **`053` ADR-003 — does the sort-conflict confirm gate the drop, or the gesture?** **Accepted:
   "On drop."** The drag proceeds unchanged; on drop, an active sort raises the confirm and offers
   clear-sort-and-commit or decline-and-revert.
4. **`051` — does `fullscreen` survive as a third presentation?** **Accepted: "Keep fullscreen for
   the workbench only."** `FormulaModal` stays `fullscreen`; the other three fullscreen subclasses
   become modal (desktop) / sheet (phone). Recorded as new ADR-004.
5. **`051` — may a registered stacked pair become an in-place sub-page?** **Accepted: "Yes, where
   the capture shows it."** A pair converts only where its equivalent Anytype surface's capture
   shows the replace-in-place pattern, judged per pair; `048`'s stacking model stays the default for
   every other pair. `048/decision-record.md` records the scoped exception.

### The in-flight worktrees, with their tips

Read before assuming any state they touch. **None of these was opened for content this pass except
the five draft trees, which were read in full.**

| Worktree | Tip | State |
|---|---|---|
| `.worktrees/074-anytype-ios-sim` | `964a0b2a` — **now on `origin/main`** | **Landed during this pass.** The open-source Anytype iOS client built from source and run on a simulator: **59 states in light and dark, 118 files** under `screenshots/anytype/mobile/`, against the same 326-record demo space the desktop captures used. It closes `050` item 13's capture gap — `design-trueup.md` REQ-013 recorded that no filter or sort sheet appears in any of the 151 desktop files, and four now do — and gives `051`-`055` the phone reference every one of them was designed without. Each of the five gained a dated reconciliation block; **the pixels are unread in all of them** |
| `.worktrees/079-anytype-menus` | `396e1532`, **220 files dirty** | Every Anytype dropdown and mobile sheet screenshotted, per the operator's decision. This is the capture set `052`'s `anytype-menu-grammar.md` §4 lists as still missing and `054`'s §5B rows still need. **Uncommitted and unread** |
| `.worktrees/094-impl-053-toolbar` | `ae46da94` at dispatch | **In flight, on codex.** `053`'s implementation leg — the first of the five families to start. It holds the toolbar's five composed primitives and `050` items 1, 2, 4, 7, 10, 12. Do not open the same files from another leaf |
| `.worktrees/096-screenshots-regroup` | `d486eab9`, **landed on `origin/main`** | **Landed.** The Anytype captures are regrouped into `screenshots/anytype/{official, desktop/{sets/<use-case>, app, menus}, mobile/{official, sheets, app}}`, filenames unchanged, and the citing docs under `047`, `051`-`055` follow. **Cite the new form.** One residue it left: `052`'s `design-trueup.md` still carries ~70 bare `menus/` shorthand references — that packet's to normalise. Removable |
| `.worktrees/087-trueup-051` … `092-trueup-054` | `8e0149af`, `a58bbcd5`, `fbbddc13`, `621de37f`, `cd8030a8`, `7b516cba` | **Landed. Removable.** All six are ancestors of `origin/main`; removing a worktree is not removing its branch |
| `.worktrees/085-record-open-dock` | `ae46da94`, landed | **Landed and shipped in 0.0.26.** "Fix record open for all callers" — row 48's fix generalised to every caller of the record-open path. Removable |
| `.worktrees/080-phase-modal-componentization` | `4a5b339b` | **Superseded.** Its `051` draft was scaffold only; the packet was written in-runtime |
| `.worktrees/081-phase-menu-componentization` | `4a5b339b` | **Superseded** by the landed `052` |
| `.worktrees/082-phase-toolbar-view-controls` | `4a5b339b` | **Superseded** by the landed `053` |
| `.worktrees/083-phase-record-relation-surfaces` | `4a5b339b` | **Superseded** by the landed `054` |
| `.worktrees/084-phase-states-feedback` | `4a5b339b` | **Superseded** by the landed `055`. Its copy of the parent `spec.md` carries two injected placeholder rows (`[Phase 51 scope]`, `[Criteria TBD]`) from `create.sh`; **they were not carried over** — this landing branched from `origin/main`, whose parent spec has none, and the phase map was written by hand |
| `.worktrees/086-land-phases-051-055` | this pass | The landing branch |

The five draft worktrees are the operator's to remove through `sk-git` once they confirm the landed
packets supersede them. Removing a worktree is not removing its branch.

### The evidence moved again while this pass was committing

`964a0b2a` landed on `origin/main` between this pass's last packet commit and its rebase. It is the
iOS simulator capture set, and it supersedes `design-trueup.md` wherever that document reports a
phone surface as uncaptured — which is often, because its only phone evidence was twenty App Store
and Google Play marketing images. **This is the second time in one day that a landing had to
reconcile against evidence that arrived mid-flight**, and it is the same lesson both times: the
capture read is a gate, not a step.

Rather than land five packets asserting a gap that had just closed, each gained a dated
reconciliation block naming the captures its phone rows should now be trued against. **No block
claims a reading** — this pass could not open image files any more than the drafting pass could.
Four specific changes a later reader should not have to rediscover:

- **`053` T1/T2**: `design-trueup.md` C4 said no view-tab context menu was ever captured, so its
  design stayed source-derived. On iOS it is captured twice —
  `anytype-mobile-sheet-set-viewswitcher-edit` (delete handles, reorder grips, a pencil per view)
  and `anytype-mobile-sheet-view-edit-more` (the view's own action menu). The desktop finding is
  unchanged; the phone half is no longer a guess.
- **`053` T16/T17 and `050` item 13**: four filter and sort sheets now exist where the desktop
  sweep had none.
- **`054` A5**: corrected to *code-derived* earlier in this same pass, and now back to captured on
  the phone — `anytype-mobile-sheet-relation-add` shows all eleven formats.
- **`054` S9**: twelve captured cell editors, one per format, against ADR-002's ten extractions.

**Read `screenshots/anytype/README.md`'s mobile section before any of the five T001s.** It carries a
written description per file and records what the set cannot answer: the iOS client ships **no
Calendar and no Graph layout at all**, so its surface set is narrower than the desktop's rather than
a translation of it.

### Still owed from the operator

A fresh device check against **`0.0.26`** for rows 29-33, 39-41 and 43, and a first look at rows
**47-52** — row 52 being the record-open docking this release carries; the vault side-by-side for
rows 37/38; `044`'s and `045`'s AC-006; `046`'s AC-007 and its `T016` settings-flag call; and
`006`'s two operator rows. The five questions above are answered as
of 2026-09-05 (~14:15). Each confirmation closes its `roadmap.md` §4 row or its phase's own AC row;
a "still broken" answer reopens the row with the device fact given, never argued with. **No agent
ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full, then `goal-prompt.md`, before touching anything. The prompt was
   rewritten this pass and sits at the 4,000-character cap exactly.
2. **Read `roadmap.md` §7.10 before quoting any measured Anytype number.** Four of them disagreed
   across the five reads and the section says which value won and why. Quoting the loser is how a
   corrected number gets re-introduced.
3. Run `npm run gate` from a clean `main` checkout, `</dev/null`, and confirm it green before
   assuming the tree is as described here. If the parent's phase count moved, regenerate
   `operator-checklist.md` with `node tools/naming/build-operator-checklist.mjs` — the
   `operator-list` lane reads it.
4. **Run each packet's T002 before any implementation in it.** All six T001s are done; not one
   threshold has been observed red. `053` is the exception already in flight on codex — check
   `worktrees/094-impl-053-toolbar` before opening any toolbar file.
5. Work `050` T002 onward against the **restated** thresholds (ADR-004 **as amended 2026-09-05**),
   never the originals — and note that AC-014's `60` is now ours to argue, not Anytype's to quote.
6. Cite captures in the regrouped form (`d486eab9`): `desktop/sets/<use-case>/`, `desktop/app/`,
   `desktop/menus/`, `mobile/official/`, `mobile/sheets/`, `mobile/app/`. Filenames did not change.
   `052`'s `design-trueup.md` still carries ~70 bare `menus/` references and is the one file left.
7. `.worktrees/079-anytype-menus` is still uncommitted and holds desktop dropdown captures; the
   `desktop/menus/` set the true-ups cite is on main.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

### The day's traps, in the order they cost time

- **GLM cannot read images, and it loops on exploration when asked to.** The true-up legs are capture
  reads. A GLM leaf given one will explore the tree indefinitely rather than report that it cannot
  open a PNG. Route a capture read to a model that can see, and treat "still working" on an image
  task as a failure signal, not progress.
- **OpenRouter has an idle timeout**, and a long reasoning leg hits it without producing an error the
  caller recognises as a timeout. DevPass is the fallback per §6A, and its own failure is a mid-run
  stop that reads as a completed dispatch. Both need the landing pass that reads each leaf's output.
- **codex has a cap window, not a per-run limit.** A wave that fits at noon may not fit at four.
  Check before dispatching, not after the third leaf returns empty.
- **`npm run gate` needs `</dev/null`.** Without it the gate can block on a prompt and read as a
  hang, which then gets killed and reported as a failure it was not.
- **The validator is flaky inside a worktree** — see the item below. Validate from the primary
  checkout's cwd, through `realpath`, and require an explicit `RESULT: PASSED`; a stale compiled
  orchestrator exits 3 with **no rule output at all**, which a grep for `FAILED` reads as clean.
- **The spec-kit relocated to `runtime/cli`.** Scripts that used to be under `scripts/` are not.
- **The `specs/context` symlink incident.** Never stage it; symlink it into a worktree and leave it
  out of every commit.
- **A release commit must carry `main.js`.** `0.0.25` needed a second commit for the bundle. A tag
  on a cut without its bundle installs as the previous version and reads as "the fix did not ship".
- **The Anytype captures moved.** `d486eab9` regrouped them into
  `screenshots/anytype/{official, desktop/{sets/<use-case>, app, menus}, mobile/{official, sheets, app}}`
  with filenames unchanged. Cite the new form; the old flat and `mobile-official/` paths are gone.
- **`screenshots/README.md` is generated** by `tools/screenshots/capture.mjs`, and it does **not** yet
  list the `anytype/` and `project-manager/` roots. That is a harness follow-up, not a document edit
  — editing the file by hand would be overwritten by the next capture run.

- **The spec-kit relocated to `runtime/cli`, and the validator is flaky inside a worktree.** Scripts
  now live under `.opencode/skills/system-spec-kit/runtime/cli/` (was `scripts/`), and the compiled
  validator is at `runtime/dist/lib/validation/orchestrator.js`. Validate every folder **from the
  primary checkout's cwd**, invoking through `realpath`, because a worktree's symlinked
  `node_modules` makes the run unreliable:
  `node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" <worktree-folder> --strict`.
  Take the **first** `RESULT:` line as a folder's own verdict — a phase parent recurses into its
  children and the tail describes the last child, not your packet.
- **`repair-derived.cjs` refuses a target outside the packet tree** when run from the primary
  checkout against a worktree path. Use
  `runtime/cli/dist/graph/backfill-graph-metadata.js <folder>` instead, scoped to the touched
  folders — **never `--all`**.
- **The `specs/context` symlink incident, and why this landing made no symlink in the draft trees.**
  A convenience symlink at `specs/context` was once staged as a self-referencing `120000` entry,
  and pulling it replaced the gitignored vendored `obsidian-pm-main` tree that
  `tools/live/reference-mount.ts` imports from. This pass symlinked only `.opencode` and
  `node_modules` into its own worktree, quoted, and read the five draft trees read-only.
- **A release commit must carry `main.js`.** `0.0.25` needed a second commit (`f2518f5e`) to
  include the rebuilt bundle after the cut (`2334046b`). A tag on a cut without its bundle installs
  as the previous version on the operator's phone and reads as "the fix did not ship."
- **The fan-out `iterations` field is load-bearing, and a leaf can die silently.** `051`'s leaf
  reported nothing and left scaffold. A wave needs a landing pass that reads each leaf's output;
  the file list is not the read.
- **Executor caps are real and they differ.** codex has a hard cap; opencode-go is a monthly cap.
  Neither is a per-run limit, so a wave that fits today may not tomorrow — check before dispatching
  five leaves, not after four of them return.
- **A "today" cell written from a prior document rather than from the tree is the expensive
  mistake.** Six of `050`'s fourteen thresholds asserted a failing value the tree does not have, and
  a threshold whose failing value is wrong cannot be observed red — so the criterion is
  unfalsifiable while looking rigorous. Every red in the five landed packets was re-measured.
- **And the same mistake has a second half, learned today: a value read off one surface and quoted
  as the product's.** `050` did it three times — no chip row (from a region never scanned), no
  per-view default (from one panel), a 60-row page limit (from one layout). A capture read is only
  evidence about what it photographed, and "I looked and it is not there" needs the *where* attached
  to be worth anything.
- **A quoted contrast ratio is not a measured one.** Two of the four cross-family conflicts were
  arithmetic: 7.95 versus 7.11, 1.20 versus 1.14. Recompute from the sampled hex and say that you
  did; a ratio carried between documents drifts and nothing catches it.
- **An ownership written in the handover and not in the packet is invisible.** The condition row and
  the inline editors each had one owner in this document's family table and nothing in `053`'s or
  `054`'s own files. An implementation leg opens the packet, not the handover.
- **`check-lane` reads only the NEWEST history entry, so an older release's `reviewed` list is
  never re-checked.** `reviewVerdict` takes `history[history.length - 1]` and returns pass
  immediately unless that entry is a `release` whose `hash` equals `baselineHash`. Grandfathering
  older releases is deliberate — back-filling `reviewed` onto reviews nobody did would manufacture
  the evidence the rule exists to require — but it has a live consequence: if your commit moves a
  capture and the newest entry is somebody else's release sitting on the current stylesheet, the
  fix is to **append your own release entry at the same hash naming your captures**, never to add
  your paths to their list. There is ample precedent for a "not a CSS edit" release at an unchanged
  `baselineHash`; roughly two dozen entries already are one.
- **One capture depends on the host's pointing device, not on this repository.**
  `field-icon-picker-desktop-{dark,light}` moves 10 device px whenever the machine flips between
  classic and overlay scrollbars (macOS "Show scroll bars: Automatically" resolves on whether a
  mouse is attached). `.db-icon-picker-scroll` asks for `scrollbar-gutter: stable`, which Blink
  honours with real width only under classic scrollbars, and `.db-icon-picker-grid` centres an
  `auto-fill` track set inside it, so a 10px content-width change moves the partially-filled Recent
  row 5 CSS px. It is the only capture in the 576 with this sensitivity — a full run on a flipped
  host moves exactly those two and nothing else. **Do not bisect it.** If it reappears, recapture,
  append a lane release naming the two files, and move on; removing the sensitivity for real means
  either left-aligning the picker's grid (a product change, needs the operator) or pinning
  scrollbar metrics in `tools/screenshots/theme.css` (re-renders every scrollable surface).
- **Comment hygiene's artifact-id rule is now enforced, not only stated.** `scan-comments.mjs`
  (the `comments` gate lane) scans `src/**/*.ts`, `tools/**/*.{ts,mjs,js}`, `styles.css` and every
  `describe`/`it`/`test` name for a task id, an ADR/REQ/CHK/AC id, a packet number used as a label,
  or a numbered spec-folder path, with no baseline — a hard block with a ratchet is a suggestion.
  **The gate's `comments` lane blocks landing; the repo-owned hook blocks only when installed.**
  `tools/git-hooks/pre-commit` is tracked but not installed, and installing it via
  `core.hooksPath` REPLACES this machine's whole global hook chain rather than adding to it —
  losing `commit-msg` and the `pre-push` remote-push backstop. Use the scoped
  `git -c core.hooksPath=tools/git-hooks commit ...`, or just run the scanner. The global chain
  does already block the common shapes (`ADR-`/`REQ-`/`CHK-`/`T123`/`specs/<name>/` in a comment);
  what it misses is `AC-` ids, bare packet-number labels, test names and `styles.css`. Wiring this
  lane into the sk-git chain instead of displacing it is the durable fix — roadmap §6.
<!-- /ANCHOR:next-session -->

---

## 5. CONTINUITY LOG

- **2026-09-07 ~16:20, `067`'s follow-up leg LANDED on `main`, and the operator dropped the scale
  cue.** Landed from `.worktrees/215-sheet-family-followup` after rebasing `173f7d3a` onto
  `b8876332`; nine commits, `npm run gate` 26/26 green exit 0, orchestrator `--strict` PASSED on
  both `067` and `051-modal-and-sheet-componentization` (0 errors, 0 warnings each). The leg's
  own claims were re-measured rather than accepted: T006 confirmed on all four production
  `menu`-role surfaces (handle absent, 44.0×44.0 close, parent dim ratio 0.390), a `panel`-role
  sheet confirmed to keep its handle, and two negative controls used to prove the rewritten
  assertions fail for a real reason (the old `toggleClass` takes three pickers to a 0.520 dim
  ratio; dropping `owned-menu`'s `menuCard: true` takes `verify-placement.mjs` to 409/415 with
  exactly the four menu-handle rows red). The operator's ~14:50 *"Drop the scale cue"* ruling was
  folded in at this landing: ADR-003 **Accepted-as-amended**, AC-003's scale clause removed, a
  §6A row added, `goal.md`'s criterion re-derived, and the cue's last dormant trace deleted from
  `touch-target-measure.mjs`. `§5.A`'s 067 row re-derived from goal ticks and honestly unmoved at
  3/7, because the menu criterion's own text asks for an *anchored* card and anchored geometry
  stays declined. Left for a second follow-up leg, all still open: AC-003's light stacked-parent
  figure, T015, T020, T021 and the two lane pairs. Details in the entry at the top of §1.
- **2026-09-07, `067` follow-up leg: T006 closed live, ADR-003's page pull-back attempted and
  reverted.** Ran in `.worktrees/215-sheet-family-followup` on top of `173f7d3a`, continuing a
  paused agent's own uncommitted work (the menu-card add-only toggle fix, already correct on
  disk). Verified it live at 402px through the shipped modules: all four production `menu`-role
  surfaces (`owned-menu`, the date/icon/option-color pickers) now read handle absent, close
  44x44, parent dim ratio 0.390 — closing `067` T006 / AC-002. Also attempted ADR-003's
  `scale(0.96)` page-under-first-sheet pull-back; it broke `position: fixed` for the row-selection
  bar (a `transform` on `.note-database-container` creates a new containing block for its
  fixed-position descendants — CSS Transforms spec behaviour, not a browser bug), caught by
  `verify-placement.mjs`'s own pre-existing keyboard/selection-bar checks reading impossible
  numbers with no test update needed to catch it. Fully reverted rather than shipped or patched
  around; recorded as a residual gap with the prerequisite for a safe re-attempt named (an inner
  wrapper `.note-database-container` does not currently have). Fixing T006 for real also exposed
  and repaired ~11 `verify-placement.mjs` assertions written against the old, broken menu-drag
  behaviour, and a genuine `touch-targets.mjs` false-positive caused by the (later-reverted)
  page-pull-back. `npm run gate` 26/26 green from the final state. Four commits on
  `173f7d3a..b1664126`, not pushed. Full detail in `067`'s own `decision-record.md` ADR-002/
  ADR-003, `tasks.md`, `acceptance-criteria.md` and `implementation-summary.md`, and this
  worktree's own untracked `.handover.md`. Left open: T015's header-block margin, T020's
  replace-pair captures, T021's full divider audit (styles.css-only reading done, not checked
  against a reference capture), the two named lane pairs' rewiring to the real depth-cap call
  graph, and AC-003's light stacked-parent figure (investigated, not fixed).
- **2026-09-06 ~10:50, `orchestrate-handover-22`: five new operator reports recorded, `057`
  reopened, the phone-week ruling superseded — documentation-only.** Ran in
  `.worktrees/163-docs-refresh-1045` under the same hard rule as handover-21: nothing outside
  `specs/`, no sub-agents, foreground only.

  **Landed on main since the 09:30 refresh**, all read from `origin/main` rather than from a
  report: `0d36b377` (the two footer and board red values reworded so the failing-values scan reads
  them), `32411403` (the no-confirm single delete recorded), `f962d626`/`7c7617c4` (that delete and
  its test), `537bbb61` (the shared popover left-aligned under its trigger), `0c3f6410` (every
  desktop dropdown a combobox, the trigger becoming the input), `a952e5e7` (the combobox ruling
  recorded and the tree re-derived), and `396bcae7` (the phone week/day grid's 80px minimum
  column — **superseded within the hour**, see below).

  **Five operator inputs inside forty minutes, now §4 rows 59-63.** Row 59, 10:04 on iOS 0.0.29:
  the stacked sheet is *"really bad bugged"* — four defects on one capture (a duplicate close
  control, a header/body ink split, ~200px of dead space above the title, parent bleed with a "14"
  badge over the toolbar), owners `048`/`051`/`044`, fix leg `worktrees/159`. The same report
  carries a **standing instruction** rather than a defect: once `044`, `048` and `051` are done and
  verified, an extra `/deep:research:auto` of 10 iterations at `--stop-policy=max-iterations` on
  GLM 5.3 flash max via `cli-pi` (OpenRouter first, DevPass fallback), bounded prompts with an
  explicit file list and **no image reads** (GLM cannot read PNGs), in a fresh worktree, then an
  Opus synthesis that updates or adds phases — recorded as a planned leg with its executor spec in
  `051/goal.md` §4, `051/tasks.md` T025 and `051` AC-014. Row 60, ~10:25 desktop: wrap off still
  draws six-line rows in a long-text column; owner `053`, leg `worktrees/160`, **the producer is
  not named and the criterion says so**. Row 61, ~10:30 board: the page must scroll rather than a
  column and desktop scrollbar chrome is hidden; owner `056`, and it **declines a measured parity
  value**, so ADR-008 records an operator ruling as a third ground beside ADR-002's two WCAG
  grounds, with §7.13 carrying the conflict against `design-trueup.md` A10's 10px sticky bar. Row
  62, ~10:33 calendar: the unscheduled band becomes a subtle affordance; owner `057`, leg
  `worktrees/161`. Row 63, ~10:40: *"in general our calendar looks nothing like anytype yet"* —
  **`057` is REOPENED**.

  **`057` is the substantive change.** Its Met rows were measured value by value and every number
  still holds; a gestalt judgement is a different question and outranks them (D3). **Nothing is
  un-ticked.** A new OPERATOR/GESTALT criterion and AC-013 open with the **threshold deliberately
  empty**, to be filled from the side-by-side review running in `worktrees/162` into
  `review-ui-calendar-2026-09-06.md`; §7.14 records the conflict. The ~10:47 ruling *"Stagger
  overlaps at 45px"* **supersedes `396bcae7`'s 80px minimum column**: ADR-005 is amended in place
  and dated, T018 stays closed as the record of what landed, T019 carries the supersession.

  **In flight at handover:** `148`-`151` (047's Mobbin harvests — Notion running since ~10:00 by
  the **scripted-loop** method, one Code Mode execution per batch, two platform lanes, 40 req/min,
  1,679 `.webp` counted in its worktree at 10:50 against the leg's reported 1,510+ at 10:27;
  Evernote, Fibery and ClickUp queued and idle), `156` (056 palette), `159` (048 stacked-sheet fix),
  `160` (053 wrap-off rows), `161` (057 unscheduled).

  **Two of them landed while this leg was writing, and the rebase reconciled by truth rather than
  by ours-versus-theirs.** `153`'s side sheet landed (`74f4db4b` and below): 051's criterion keeps
  main's measured text — three of four clauses green, *interactive* still open — and this leg's
  deep-research criterion is appended after it rather than replacing it. `162`'s calendar review
  landed too, which **superseded this leg's own 057 wording an hour after it was written**: the
  gestalt criterion no longer says "threshold TO BE FILLED", it takes the review's **G1-G15**, and
  the chip-alignment criterion and task written here were **dropped** because G3 and G5 already own
  them, measured on the same corpus. The stagger task renumbered T019 → **T020** behind main's
  T019 rebuild. §5.A was re-derived a second time after the rebase: 051 is 1/9, 053 is 2/11, 056 is
  0/10, 057 is 7/12.

  **§5.A was re-derived from each `goal.md` rather than carried forward, and three figures were
  wrong.** `055` read 25% — 2/8; its `goal.md` has never held a ticked criterion, so the honest
  figure is 0% — 0/9. `056` read 91% — 10/11 and `057` read 80% — 8/10; both were the
  acceptance-criteria scale rather than §3.2's `goal.md` rule. After the rebase they re-derive to
  0% — 0/10 and 58% — 7/12. The AC counts are kept alongside, named as the other scale, rather
  than deleted, and `057`'s cell now also carries **0 of 15** on the review's G rows.

  **A trap worth carrying:** a gate run started without `</dev/null` hangs at 0% CPU inside
  `verify.mjs` waiting on stdin. It looks like a slow capture sweep and is not one. Redirect stdin
  from `/dev/null` on every gate invocation.


- **2026-09-06, `orchestrate-handover-21`: `058` opened, six goals amended, roadmap and this
  document refreshed — documentation-only, nothing pushed.** Ran in an isolated worktree
  (`.worktrees/152-docs-058-and-refresh`) under an explicit hard rule: no `src/`, `styles.css`,
  `tools/` or `main.js` edit, foreground only, a fresh verifier lands it. `058-card-title-and-title-
  formats` opened Level 2 from the operator's phone-board report; reading the tree first found the
  per-view title picker already shipped (`ViewConfig.titleField`) and reaching the board card and
  record header for every view but calendar/timeline — the real gap is `resolveTitleFieldDisplay`
  routing every title through `stringifyValue()` instead of the chosen column's own number/currency
  format, and the board's own Properties sheet showing the title choice as inert text. Four ADRs
  record it; no code changed. Six sibling goals amended with dated sections, new completion
  criteria, task rows and acceptance rows (never rewriting history): `047` (four queued Mobbin
  harvests — Notion, Evernote, Fibery, ClickUp — one landed and verified before the next opens),
  `051` (ADR-008, a new `side sheet` shell role for the desktop database Settings surface; ADR-007's
  flagged E4 hold closed on the operator's "No confirm for single delete, Undo toast" ruling), `052`
  (every desktop dropdown becomes a combobox; the filter/sort Operator dropdown's anchoring defect),
  `053` (a toolbar-rail gear button before `···`; the table-footer hide-at-zero-rows rule; row 53's
  wrap toggle reconfirmed shipped with its real commits, correcting an earlier session's mis-cited
  landing sha), `055` (the `deleteRow` call-site change `051`'s E4 closure requires), `056` (R6/R7
  board-colour rulings — "Anytype tint fill", "Neutral, match Anytype" — recorded as a `decision-
  record.md` ADR-004 addendum, and a pointer to `058`). `roadmap.md` gained three §4 rows (56, 57,
  58), a refreshed §5.A (058 added; 047/050-057 read against their own docs rather than the prior
  roadmap prose, which surfaced and corrected two stale derived ratios — `054` 3/7 → 2/7, `057`
  0/10 → 7/10), and five new §6A ruling entries. The parent `goal.md`'s phase-subgoals table gained
  058 and carried the same two ratio corrections; its continuity frontmatter was refreshed.
  **The one finding that outranks the rest of this entry**: main advanced concurrently and in real
  time while this leg ran (`HEAD` moved from `0e8185b6` to `03aa151d` between two checks minutes
  apart; `manifest.json` already reads `0.0.29`), landing real, independent edits to `055`/`056`/
  `057`'s own doc files — including a `06c6425a` commit that separately records `056`'s R6/R7
  rulings. This branch and main have diverged on shared program docs and need a rebase plus a truth
  reconciliation before landing, not a blind merge; see §1's dated subsection for the full reading
  and the live-worktree inventory. Every touched packet here validated `RESULT: PASSED` against
  this branch's own base; that has not been re-checked against main's current tip.

- **2026-09-05, `orchestrate-handover-20`: all six true-ups reconciled, and `050` corrected.**
  `051`-`055` each ran T001 in its own worktree (`087`-`092`) and landed as `8e0149af`, `a58bbcd5`,
  `fbbddc13`, `621de37f` and `ffcf434b`+`cd8030a8`; `006`'s record-open docking landed at `ae46da94`
  and shipped as **0.0.26** (`8c7b65aa`), closing the in-repo half of §4 row 52. This pass read the
  five together, which is a different job from running any one of them, and it found the program's
  own read of record wrong in five places. **`053`'s T001 overturned four `050` claims** — C2's "no
  chip row" (the rail is on eleven captures and is conditional), C7's "no per-view default in the
  product" (it is in the `New ⌄` menu), REQ-013's "one `+ New filter` row" (that is the empty state;
  twelve formats are captured), and the flat 60-row page limit (it is per-layout, Gallery 60 and
  Kanban 10). **`052`'s overturned a fifth**: the "no hover state was captured" caveat five documents
  had inherited from the capture index — 37 menus show it. All five corrected at their sites in
  `050`'s `design-trueup.md`, `spec.md`, `acceptance-criteria.md`, `decision-record.md` and
  `checklist.md`, and in `screenshots/anytype/README.md`. **Three of the four are one error**, now
  ADR-003's second corollary: an absence asserted from a surface that was never examined.
  **Four cross-family numbers disagreed** and `roadmap.md` §7.10 settles each with its winner and the
  reason — 7.11:1 over 7.95:1, 1.14:1 over 1.20:1, a 0.2s Anytype exit over 0.1s, and the iOS row
  pitch recorded as *not* a conflict because five packets measured five different sheets. §7.10 also
  fixes **one owner per shared primitive**, writing the condition row into `053` and the inline
  editors into `054`, where they had existed only in this document's family table. Residues cleared:
  `052`'s `checklist.md` C7 (8 width literals at 14 sites, the only 240 a story) and its `goal.md`
  D3; `054`'s `checklist.md` C3 Today cell (one list, one filtered subset, one submenu, not three
  lists); `055`'s vocabulary census, already closed at `cd8030a8` and now marked closed in its
  summary. **Nothing was ticked and no operator row was touched.** All six packets stay `0/N`: every
  T001 is done and no T002 has run, so not one threshold has been observed red. `053`'s
  implementation leg is running on codex in `worktrees/094-impl-053-toolbar`; `096-screenshots-regroup`
  landed the capture regrouping at `d486eab9` and its path form is the one to cite.
- **2026-09-05, `orchestrate-handover-19`: five family phases landed.** `051`-`055` opened from the
  operator's componentization instruction, four drafted by GLM 5.3 flash through cli-pi in parallel
  worktrees `080`-`084` and one (`051`) written in-runtime after its leaf died at the scaffold. All
  five reviewed against the parent's D1-D14, `050`'s `design-trueup.md` and the current tree;
  twenty-five `file:line` citations corrected; `055` renamed from `051-states-feedback-and-motion`
  with every internal identifier moved; `054` raised to Level 3. All five pass `--strict` with
  `Errors: 0`. Parent updated: `roadmap.md` §4 rows 47-51, §5.A rows 051-055, §6A's five afternoon
  decisions, §7.9's conflict table; `goal.md`'s DONE table and log; `spec.md`'s phase map extended
  to `055`; `goal-prompt.md` rewritten to 3,912 characters. `053`'s three ADRs left **Proposed**.

Compacted out of frontmatter (SPECDOC_FRONTMATTER_007) into this section so no fact is lost. Each
phase's own `goal.md`/`implementation-summary.md` carries its full audit trail; this is the
program-level decision record only.

- **2026-08-30**: four operator decisions taken — row height stays 34px (density over the 44px
  touch floor); the grab band is accepted at 35px against the 48px ask; row range-select moves
  behind a long press; the list view was scoped as a presentation mode of the grid (superseded
  2026-09-04, see below). Recorded in `roadmap.md` §6A.
- **2026-09-02**: external-delegation model revised to devin (`deepseek-v4-flash-max`,
  `--permission-mode dangerous`) first, then codex/opencode (`gpt-5.6-luna`), with every result
  verified in-runtime by a fresh Sonnet agent running the gate and `validate.sh` itself.
- **2026-09-04, version renumbering**: the fork point is `pangy9/obsidian-note-database` at
  upstream 1.2.8; fifteen post-fork releases were re-tagged 1.2.8-euro.1 through 1.4.10 as 0.0.1
  through 0.0.15, and the cadence has run 0.0.N ever since (`roadmap.md` §5.3).
- **2026-09-04, evening pass, reports 40-43**: opened `044-phone-sheet-alignment`,
  `045-board-card-properties`, `046-linked-views-notion-parity`, and asked ADR-001.
- **2026-09-04, done-audit-11**: parent DONE row 6 ticked at `2242fa0`, taking the parent to 5 of
  7 = 71%. Full done-audit-1 through -11 trail: `043-constructed-capture/goal.md` and
  `implementation-summary.md`.
- **2026-09-05, six lanes landed and 0.0.22 cut** (`7b976e28`): symlink-safe ignore check, `006`'s
  hide-and-migrate, `045`'s board card properties, the kanban line-height truing, and `044`'s
  remaining phone-sheet-grammar legs. `npm run gate` 26/26 at that point.
- **2026-09-05, ADR-001/ADR-002 Accepted, `045`'s questions answered**: `046`'s ADR-001 (operator,
  *"Allow db writing from linked views"*) and ADR-002 (phase author, split presentation from
  capability) both Accepted; `045`'s gallery-sharing and hide-in-table questions answered the same
  day (ADR-001: no, gallery is retired instead by `specs/007-gallery-view-deprecation`; ADR-002:
  no, cards only).
- **2026-09-05, the 0.0.22 device check and twelve deferrals**: operator reported 0.0.22 as still
  broken (*"pressing any action in a sheet doesn't work and instantly closes it"*), deferring rows
  29-36, 39-41 and 43 on one named blocker (tap inside an open sheet dismisses it). Rows 37/38
  moved the other way (*"align closer"*), opening `047-competitor-references-and-pm-alignment`.
  The operator's gallery ruling (*"should have been deprecated"*) opened `007-gallery-view-
  deprecation` as a second top-level sibling.
- **2026-09-05, the named blocker fixed, landed, then shipped**: `3a77d523`/`308ba2d3` fixed the
  sheet-inside-tap dismissal, root-caused and recorded at `66b69842`/`2be66ba5`, re-verified at
  `b240a8d5`, then released as **`0.0.23`** (`d3979cf5`) alongside the list renderer's full
  retirement, the frozen bench clock, the settings-body grammar, the card-properties capture proof,
  and `046`'s ADR-001/ADR-002 acceptance plus a partial capability landing (`ec893e67`). This
  handover (`orchestrate-handover-18`) recorded it: `roadmap.md` §1/§4/§5.3/§5.A and `goal.md`'s
  DONE table updated, `operator-checklist.md` regenerated (109 rows / 48 phases, up from 103/47),
  three worktrees with uncommitted, unread content discovered and flagged rather than assumed
  (`.worktrees/059-linked-views-chrome`, `062-stacked-sheets`, `061-competitor-captures`).
- **2026-09-07, `225-timeline-view-teardown`: `roadmap.md` §4 row 67 fixed and verified, main
  unchanged.** Operator report ~21:55 on 0.0.31, main at `5e7f1426`: switching from timeline back
  to table left the timeline sitting on top of the table, glitching. Root cause, measured on the
  shipped renderers rather than inferred: `rendered-view-roots.ts`'s `VIEW_ROOT_CLASSES` list —
  and `embedded-database-renderer.ts`'s own inline copy of it — named `obnotion-timeline` (the
  opt-in local-extensions timeline's root) but not `pm-gantt-view`, the root the timeline's actual
  default render (`renderTimelineGantt`) creates; the leftover root's own `position: sticky;
  top: 0; z-index: 4` header (`styles.css:19010-19013`) then pinned inside the same scroll
  container the next view occupied. Neither host's switch path called the outgoing timeline's or
  calendar's own `destroy()` either (only chart had that guard), so the timeline's resize
  observer, gantt keydown/drag listeners and the calendar's running current-time interval kept
  firing past the switch. **Fixed**: `pm-gantt-view` added to both root-class lists; both hosts
  gained a `teardownOutgoingViewRenderer` step that calls `destroy()` on the outgoing
  timeline/calendar/chart renderer on every real view-type change; `CalendarRenderer` gained a
  `destroy()` method mirroring `CalendarTimelineRenderer`'s own, wired into both hosts' unload
  paths too. **Evidence**: a new `runViewSwitchResidueCheck` (`tools/live/render-assertion-
  harness.ts`), wired as a permanent `render-assertions.mjs` lane, read **1** leftover
  `.pm-gantt-view` root after timeline -> table before the fix (calendar -> table already read
  **0**) and **0** for both after; three new `database-view.test.ts` assertions, including a
  negative control, confirmed failing against the pre-fix code and passing after. `npx tsc
  --noEmit`, `npx vitest run` (1644/1644), `npm run build`, `render-assertions.mjs`,
  `sheet-grammar.mjs` and `npm run gate` (26/26) all exit 0. Owned by `037-timeline-gantt-port`
  (`tasks.md` T054, `acceptance-criteria.md` AC-008, `spec.md` REQ-008); both `037` and the parent
  `005-component-surface-system` validate `--strict` with `Errors: 0`. Landed on
  `worktrees/225-timeline-view-teardown` at HEAD (see that branch's own commit); **not pushed** —
  a fresh verifier lands it. Row 67 stays awaiting the operator's own device read, never ticked
  by an agent.

- **2026-09-08, `002-settings-sheet`: the Settings sheet's rows taught the Notion grammar, measured
  red → green, gate 27/27.** Operator R5 08:10 on 0.0.31, main at `14bcaf10`: "Also settings sheet
  has really bad ui. Actually all sheets should mimic notion way closer" — the 0.0.30 phone report's
  two-column grid and overflowing select list, which the 0.0.31 guard-row fix only half-closed.
  Root cause, measured: the panel-row column override in `styles.css` applied unconditionally, so
  control rows (dropdown/checkbox/switch/summary/readonly) each burned a second column; the fixes
  scope that override to editor rows via the field-variant classes the renderer already lands
  (`-field-stack` vs the control variants), so the producer is untouched. **Red**:
  `tools/live/sheet-grammar.mjs`'s settings leg extended to assert the shape — compact rows one
  line (label left / control right) at 44–52px pitch, editors keep label-above at ≥90% width,
  section headings 16px inset + 1px divider (first-of-type 0px), selects = the plugin's own
  sheet-native picker, extent (scrollWidth − the sheet's 1px left border) == clientWidth at
  402×874 — ran 0/12 compact one-line, 3/12 pitch, headings 12px/0px, 4 failures, exit 1.
  **Green**: 12/12 compact @ 48.0px, 9/9 editors, headings 16px + 1px, extent 401 == 401, exit 0.
  `src/views/view-config-sheet-row-grammar.test.ts` (new, 6 its, reads `styles.css`) bites: revert
  the blanket override line → 1 failed / 5 passed → 6/6. **Reference honesty**: the third-party
  Notion/Anytype captures carry no readable measurements and this harness prints numbers, not
  pixels, so the gap table's reference columns stay `TBD` (decision-record D-005); the asserted
  targets are the operator's directives. **Findings for 071's later legs**: phone sheets carry a
  1px left border and none right (side-sheet grammar, shipped asymmetric — extent predicate
  subtracts it); the subtle-divider token is a 40% color-mix of the host's border token, so it
  reads 0px wherever that token is missing, closed by a #333333 fallback. **Evidence**: `npx tsc
  --noEmit`, `npx vitest run` (1687/1687), `npm run build`, render-assertions, touch-targets,
  verify-placement, both naming scans all 0; screenshots ×2 616/616 + pixel-delta (6
  PIXEL-changed, all the settings view-config family; 4 byte-only; 2 jitter ≤12 restored with
  manifest hashes patched); evidence 15/15 fresh after 9 writers re-run (engine-parity exits 1
  INFORMATIONAL by design: 50→53 disagreements, +10/−7, 0 settings fixtures; committed = 50);
  `npm run gate` 2nd run 27/27, exit 0, after the css-lane acquire/edit/release cycle signed the
  ledger to this packet (baselineHash `368631d8cd1f` = first 12 of sha256(styles.css)). Packet
  validates `--strict` → `RESULT: PASSED` (2 advisory warnings: no AI-protocol section, 1 phase
  vs the Level-3 minimum — advice, not errors); graph metadata backfilled after the last doc
  edit. Owned by this packet; goal.md completion criteria 3/3; **not pushed** — a fresh verifier
  lands it. The 071 D3 operator device row stays awaiting the operator's own device read, never
  ticked by an agent.
- **2026-09-08, `072-linked-view-blocks-ux`: the fence's drag handle learned to work on a phone;
  the linked-view readings recorded.** Operator R2, 2026-09-08 08:08, verbatim: "Also the seperate
  views from database is pretty bugged ui ux wise and dragging doesnt work on mobile like it would
  on notion." Determination first, evidence first (the packet's whole point): "the seperate views
  from database" reads the **linked-view fence** — a code block embedding another note's database
  view (`embedded-database-renderer.ts`, fence languages `src/main.ts:477,498`), the feature
  literally *named* linked views; a database file opened as its own view/tab and the view-picker
  switch are recorded as routes, not features. "Dragging doesnt work on mobile" reads that fence's
  **drag handle**: it shipped HTML5-`draggable`-only with no click action (`toolbar-renderer.ts`
  2663-2676, `embedded-database-renderer.ts` 3946-3952), and a coarse pointer fires neither, so the
  one affordance the fence points at did nothing on a phone. The other readings — table row
  reorder (`table-renderer.ts:1101`), view-tab/database-switcher reorder
  (`toolbar-renderer.ts:718-719,1005-1006,2668`), no column-drag affordance — are the same defect
  class, enumerated as defect rows 4–6 in the packet's `plan.md` §3 for their own packets, not
  folded into this diff. **Fixed**: the handle gained the 069 gesture grammar, copied verbatim
  (450 ms long-press, 10 px pre-lift cancel, `vibrate(20)`; lifted class) — pointerType-`"touch"`
  only, so the mouse keeps its native drag — a short tap opens the established
  `openMoveLinkedViewPicker()`, and the release resolves the note under the finger through
  `completeLinkedViewDropAt`, extracted from `completeLinkedViewDrop` so the HTML5 drop and the
  touch release share ONE resolution+notice+move+history path. `styles.css`: exactly one new rule
  (`.is-touch-lifted`), taken through the css-lane acquire/edit/release (handed over from 075 at
  its released hash; 4 movers, both runs, deltas ≤5, kept; `check-lane` 0). **Evidence**: the 4
  gesture tests were watched RED against the unfixed tree (2 failed / 28 passed), 30/30 after,
  each re-proven by a 1-diff mutation (one vacuous assertion caught BY the mutation proof — the
  cleared class was being read after teardown; the test now reads it mid-hold). The new
  headless lane `tools/live/embedded-linked-view-ux.mjs` answers the report with numbers at
  402×874: lane A drives 069's gesture through BOTH action bags — the embedded host's, which
  lacks the cross-group primary method, so the drop resolves through the
  `updateGroup` + `moveRowToPosition` fallback — and records lift, ghost delta 0.0 px, target
  highlight, the card actually landing, the release position surviving the fallback, the reverse
  gesture, the shared keep-in-place silence, and the read-only no-lift, identical across both
  bags, `RESULT: PASSED` twice; lane B measures the toolbar's three mounts under `.is-phone`:
  toolbar row 87 px in all three (delta 0), overflow 0 px, handle 44×44 `touch-action: none`.
  The lane's own first runs corrected its expectations before they became trust: the same-column
  drop expectation rewritten to the shipped keep-in-place rule (0 calls, not 1 — the documented
  container-drop design, 069's precedent), and the 4 px toolbar overflow traced to the HARNESS's
  missing border-box reset, not the stylesheet (ADR-004 in the packet's decision record; the
  shipped `styles.css` needed nothing beyond its one rule). Battery, every exit read: `tsc` 0,
  vitest 0 (1676/1676), build 0, `board-cross-group-drag`/`render-assertions`/`sheet-grammar`/
  `verify-placement` 0, screenshots ×2 + `screenshots:verify` + decoded pixel-delta, the 12
  stale evidence artefacts re-measured by their own tools (`engine-parity`'s 50 known differences
  verified byte-identical to its committed list), the gate ONCE: **exit 0, 27 green, 0 red for a
  declared reason** (first run: 1 unexpected, the new lane's unused variable; fixed, re-run
  green), `scan-comments` 0, `scan-failing-values` 0, packet `validate --strict`
  **RESULT: PASSED, Errors: 0**. Landed in this worktree (branch off origin/main at 90e60d00) at
  HEAD; **not pushed** — a fresh verifier lands it. AC-004 stays Untmet: the only criterion the
  operator's own phone can decide.
- **2026-09-08, `073-checkbox-controls`: the R3 checkbox/radio report implemented, evidence
  recorded, gate green, not closed.** Operator report (R3, 08:12, 0.0.32): *"Also checkboxes and
  radios are too big. And also we shouldnt have radio inputs only checkboxes."* Root cause,
  measured: the shared checkbox's `pointer: coarse` block (`styles.css:23752`) forced
  `min-width/min-height: 28px` on every owned glyph, doubling the authored 14/16/18px — the
  board card's 14px reference-matched circle shipped 28px, which is the "too big". Three
  producer sites carried radios (toolbar placement `role=radio` buttons, column-width presets,
  computed-sync native `input[type=radio]` cards). **Fixed**: the coarse minimum released to
  `0px` with the 44px target paid by a new `-15px` `::before` pass (cascade-ordered after the
  -6px base rule; 14→44, 16→46, 18→48); the select-column/divider/selection-clear trio repeats
  it; the 28px-era 40px select-column reserve drops to 28px (its `<col>` hint released into the
  21968 auto-layout block — a col width floors an auto-layout column silently; caught by the
  placement lane's own arithmetic, repaired, 413/415 + 2 declared restored); the three producers
  converted to checkbox semantics with the exclusivity held by each group's behaviour
  (decision-record.md §3); the computed-sync cards' native radios became the shared checkbox.
  **Evidence**: a new control-geometry pass in `tools/live/touch-targets.mjs` (third pass,
  mounts board card + table + view-config through the render-assertion bundle on a forced-coarse
  390×844 page, capture-sized rows for board/table because the 1600-row bench carries no
  checkbox column) reads 94 glyphs at 28×28 / hit 40×40 / 3 radios before and 14–18px / ≥44×44 /
  0 radios after, board 36 checkbox fields, 18 checked, 0 bare-`0` (070's property-reads landed
  first; the screenshot's `0` was a sibling number property — decision-record.md §5). Unit
  red/green proven by reverting the -15px line. `npx tsc --noEmit`, `npx vitest run` (1673),
  `npm run build`, sheet-grammar, render-assertions, touch-targets (ratchets 171/785), placement
  (413/415, 2 declared), two clean `npm run screenshots` runs (616; 91 movers, every one
  reproduced in both runs, judged by decoded pixel delta, one 4px@1 jitter candidate
  self-reverted; 4 fit-content canvases 8–18px shorter) — all exit 0; evidence 15/15 fresh
  after 12 stale artefacts were re-measured by their own tools; the css-lane ran
  acquire → edit → release at `f0948229bfcc` with all 78 content-changed captures named,
  `check-lane` 0. Packet + parent `005-component-surface-system` validate `--strict`
  (`Errors: 0, Warnings: 0`). Worktree `237-checkbox-controls` at its own HEAD; **not pushed** —
  a fresh verifier lands it. `acceptance-criteria.md` AC-001…AC-004 Met with recorded evidence;
  **AC-005 (operator's own device confirmation) stays unticked** — never an agent's to tick.
- **2026-09-08, `008-calendar-timeline-chart-deprecation/002-settings-redirect-and-migrate`
  implemented and verified, not yet released.** Mirroring `007`'s gallery settings-redirect
  mechanism, calendar/timeline/chart are withdrawn from every picker (toolbar add-view/view-type
  menu, view-config panel, plugin-settings default-view dropdown), each keeping its own
  current-type escape hatch. New pure plan/apply modules `src/data/{chart,calendar,timeline}-
  migration.ts` redirect an existing view on open: chart and calendar land on table (their target
  equals the settings-load sanitizer's bare unknown-type fallback, so that exemption closes for
  free — `chart-migration.ts`/`calendar-migration.ts`, plain `Notice`, no undo, matching `006`'s
  list precedent); timeline lands on board, carrying its lane field onto the board's own grouping
  field, and routes through the real migration at settings-load rather than the bare fallback
  (target differs from the fallback, would strand the lane grouping otherwise — matching `007`'s
  gallery precedent, undo-carrying toast). Both render hosts (`database-view.ts`,
  `embedded-database-renderer.ts`) gained the three on-open hooks; `parseViewType()` stays open on
  purpose, same reasoning as gallery/list. Red first: `calendar-timeline-chart-hide-and-migrate
  .test.ts` failed 12/15 against the pre-edit tree, green after (15/15); a mutation check (dropped
  the toolbar's chart filter clause) re-failed two tests and was reverted. Two pre-existing suites
  this phase's edits legitimately invalidated were fixed (`gallery-hide-and-migrate.test.ts`,
  `settings.test.ts`), and three `tools/storybook/verify-placement.mjs` floors were stepped down
  for three fewer add-view rows and four new owned `Notice` sites. Full battery: `npx tsc --noEmit`
  0, `npx vitest run` 1707/1707, `npm run build` 0, the live-tools lanes 0, two `npm run
  screenshots` passes (616 each) with ten movers judged encoder jitter by decoded pixel-hash
  (pixelHash/layoutHash identical to the committed baseline in every case) and reverted, four real
  movers (`constructed-toolbar-add-view-*`) named in `tools/lane/css-lane.json`'s current
  `009-live-verification` release `reviewed` array (`styles.css` itself never moved, so no new
  lane triplet), `evidence.mjs --check-all` 15/15 fresh, `npm run gate` 27/27 green. Landed on
  `worktrees/240-deprecation-redirect` at HEAD (see that branch's own commits); **not pushed** —
  a fresh verifier lands it. AC-007 (a released version) stays `Unmet`; `003` (remove the three
  renderers) waits for that release the same way it waited for `007`'s.
- **2026-09-08, `066-notion-states-refinement` Phase 5: the Undo toast dwell and its close
  button's hit area, both from fresh operator reports on `0.0.32`/`0.0.33`.** "toast like the
  undo toast stay too long on screen" and "toast close button needs a 56 x 56 click area."
  `ACTION_DISMISS_MS` (`src/views/toast.ts`) drops from 5000ms — ADR-003's own inference,
  confirmed live and unbugged on the tree the operator tested — to 3500ms: no timed reference
  capture exists on either platform, so the dated, direct report of the felt duration is treated
  as stronger evidence than the desk inference that set the old number (ADR-005). `.obnotion-
  toast-close` gains the checkbox's own `::before` hit-inset idiom (`inset: -19px`), widening its
  real touch target to at least 56×67 against its own 18×29-30 box without changing the 14px
  glyph or the button's own painted size (ADR-006); current size was 18×29-30, not the stale
  18×18 `touch-targets-baseline.json` carried from before the host stylesheet model landed. Both
  proven red-first on a new toast lane in `tools/storybook/verify-placement.mjs` against the real
  production `showToast` call, in addition to `toast.test.ts`'s moved dwell matrix.
  `tools/live/touch-targets.mjs` gained a matching DECLARED entry for the close control (fixture
  ratchet 171 → 169). `tools/lane/css-lane.json`'s stylesheet lane was held by an unrelated phase
  (`075-toolbar-labelled-buttons`); taken over with its own acquire/edit/release triplet —
  `npm run screenshots` ran five times and neither toast fixture moved a pixel on any run, so the
  release names zero reviewed captures; five unrelated single-run capture-pipeline transients
  surfaced and self-reverted across those runs and were restored via `git checkout --`, matching
  this lane's own established practice for encoder/antialiasing jitter. `npx tsc --noEmit`,
  `npx vitest run` (1717/1717), `npm run build`, `sheet-grammar.mjs`, `render-assertions.mjs`,
  `touch-targets.mjs`, `verify-placement.mjs` (418/420, 2 declared, unrelated to this phase),
  `evidence.mjs --check-all` (15/15 fresh) and `npm run gate` (27 green, 0 red) all exit 0.
  AC-010 and AC-011 now read `Met`; the operator device row (AC-008) stays untouched. Landed on
  `worktrees/243-toast-dwell-and-close` at `1e355695` (see that branch's own commit); **not
  pushed** — a fresh verifier lands it.
- **2026-09-08, `074-test-data-consolidation`: the ten generated fixture databases are one, the
  Finance fixture stands as the second dataset, and a registry suite holds it.** The consolidation
  the operator's R10 report asked for. `tools/mock-data/use-cases.ts` now carries exactly one
  vocabulary (`testbed`, 36 records — the 20–40 bound the catalogue already asserts, kept) with the
  value shapes that break renderers — the truncation-scale title, the diacritic people, the
  one-vs-six multi-select — and deliberately neutral labels, because a fixture that calls itself a
  project tracker documents a product nobody shipped. `catalogue.ts`'s machinery (all 13 column
  types + the 5 display variants, the shared date anchor, the seeded builder) is the untouched
  guarantee; what changed in it is what the consolidation needed: the first record fills every
  written facet (the chance draws still roll, so the stream stays deterministic), the relation on
  that record is forced, and the note's six views now include a deliberately sorted-and-filtered
  second table whose status-notempty filter excludes exactly the deliberately empty record — until
  this note the plugin read, the consolidated database declared no non-default sort and no
  non-empty filter anywhere. **Evidence**: the new `tools/mock-data/consolidation.test.mjs` ran RED
  first against the ten-database tree — 4 of its 6 assertions failing (ten use cases, non-testbed
  mounts, five views, a partial full record; the Finance second-dataset guard and the
  exactly-one-empty-record guard green, as guards should be) — then 6/6 green; `npx vitest run`
  153 files/1672 → 154/1678; the mounts in `tools/live/render-assertions.mjs` (the rhythm lane
  collapsed from two populations to one, the wrap lanes renamed to the mechanism they measure) and
  `render-assertion-bundle.mjs` (the two empty-state probes keep their names, their mounts follow
  the one dataset); `catalogue.json` + `csv/testbed.csv` regenerated by the generator, the ten
  retired CSVs deleted by name; the Anytype loaders untouched — they iterate whatever the catalogue
  holds, and their committed reports still describe the last physical ten-set load, which
  `anytype/README.md` now says. **The capture corpus moved nothing**: swept twice per the
  fixture-changing discipline — 616/616 both runs, three single-channel-unit antialiasing flips on
  lanes this packet never touched, restored by the second run, so no lane takeover; the only
  committed capture artefact that changed is the manifest's source fingerprints for the 286
  constructed entries whose inputs the edited bundle feeds, which is the freshness gate recording
  reality, and `screenshots:verify` passes against exactly that. The constructed, bench, smoke and
  story bodies reference no use case — read, not assumed — so they stayed (decision-record
  ADR-0003); the stories import nothing from the catalogue, so nothing there was repointed.
  `npx tsc --noEmit`, `npm run build`, `render-assertions.mjs`, `sheet-grammar.mjs`,
  `story-coverage.mjs` (19/40, 21 exempt), `verify-placement.mjs` (413/415, 2 declared),
  `screenshots:verify` (616 match), `evidence --check-all` (15/15 after re-measuring the three the
  edits made stale, by their own tools) and `npm run gate` (**27 green, 0 red for a declared
  reason**) all exit 0; `scan-comments` and `scan-failing-values` 0. Owned by
  `074-test-data-consolidation` (its REQ-001–004 and AC-001–004, and the tasks, decision record,
  implementation summary and proposal that carry the evidence); validated strict, RESULT: PASSED;
  packet graph metadata backfilled. The operator's own vault folder is untouched — the consolidated
  shape it could adopt is `074-test-data-consolidation/testbed-proposal.md`, which lists the retired
  folders by name and the guarded, idempotent command that writes the new one. Landed on the
  `239-test-data-consolidation` worktree at its own HEAD; **not pushed** — a fresh verifier lands
  it. The Finance databases' on-device read and the vault adoption stay the operator's rows, never
  ticked by this leg.

## 071/003-add-property-sheet — implemented 2026-09-08 (this leg, run 2)

The property-type picker no longer trades its whole form for a second replaced-in-place surface: the 21 property formats now render as one flat, scrolling list of icon + label rows inside the create-property sheet itself (44px minimum pitch, 16px inline padding, gated formats keeping their reason inline, locked entry points one read-only row), while the name and frontmatter-key fields stay pinned above the list and the note's header stays visible with the keyboard up — closing the operator's R6. The producer's whole form lives in a shared `renderCreatePropertyBody` that the modal class mounts in the plugin and the sheet-grammar harness mounts into its faithful host-modal stand-in (the harness cannot construct a `DbModal` — the obsidian stub only throws), so neither harness measures a copy; the confirm step's collision checks stay with the class. styles.css adds the pinned fields, the sole-scrolling list under a definite keyboard-aware height (`calc(90svh - var(--obnotion-mobile-sheet-bottom, 0px))`, because the pinned fields alone under-fill the 90svH ceiling and an auto-height sheet would give the list a zero-height scrollbox), scoped to `.obnotion-create-property-*` plus one `:has(> .obnotion-create-property-modal)` guard. RED→GREEN, both levels: with the fix's styles rules stashed the `properties create property` lane fails pitch (`min 0.0 / max 30.0`), 16px padding and in-sheet scroll (`210>210`) — the note-header/keyboard assertions already held unfixed (top 84.4 ≥ 44.0), recorded as a finding, not hidden — and at GREEN: 21 rows at pitch 44.0/44.0, sheet top 238.4 ≥ header 44.0, height 261.6 ≤ 464.0 (viewport − 336 keyboard − 44 header), no 402×874 overflow; reverting the gated-reason producer line fails 1 of 8 unit tests, restoring passes 8/8. Battery: `npx tsc --noEmit` 0, `npx vitest run` 160 files / 1731 tests 0, `npm run build` 0, `sheet-grammar.mjs` 0, `render-assertions.mjs` 0, `touch-targets.mjs` 0, `verify-placement.mjs` 413/415 (2 declared), screenshots ×2 0/0 with 2 movers kept as real (board-mobile-desktop-dark 1px@1, board-view-desktop-dark 4px@1 — both moved in both sampled runs at 073's own counts; this leg's rules never touch board view, so they are the lane instability 073 recorded), the 11 evidence artefacts the edits staled re-measured by their own writers (engine-parity steady at 82 fixtures, differences 56→50), `evidence --check-all` 15/15, `npm run gate` **27 green, 0 red for a declared reason**, `scan-comments` 0, `scan-failing-values` 0. The css-lane was taken over from 073 at its own released hash and released at `8991c15f8106` with `check-lane` 0 — 002-settings-sheet, you take the lane from there; it is the next phase in this parent and its checklists stay open. Packet docs: spec §4b gap table, acceptance criteria Met with the evidence block, tasks, implementation summary, decision record (ADR-0001–0004: absorbed 21-row list; the list, not the form, scrolls; definite keyboard-aware height; harnesses measure the shared builder), goal completion criteria — validated strict, RESULT: PASSED (one advisory: AI protocol components), packet graph metadata backfilled. Owned by `071-sheet-notion-anytype-alignment/003-add-property-sheet`. **Not pushed** — a fresh verifier lands it; the operator's on-device read stays the operator's row.

- **2026-09-09, `071/005-filter-sort-group-sheets`: the group popover's overflow and its missing
  first-section divider closed at their shared mechanism, not with a group-only patch.** Two prior
  GLM runs had already brought filter and sort's row grammar in line with Notion's own and left the
  group popover's own overflow sweep red (370 of 366px on WebKit) with an unfinished diagnosis that
  blamed the same inline-floor-versus-`min-width:0` conflict already fixed for filter/sort's
  condition rows — a helper the group popover never calls, so the diagnosis could not have applied.
  Live-instrumented (temporarily, reverted before commit) instead: the drag handle's `::before` band
  is sized against the popover's full declared width, but `.obnotion-container`'s own 8px
  `::-webkit-scrollbar` shrinks the flex row the handle centres in the moment the popover's content
  is tall enough to scroll — which only the group fixture, in this registry, is. Hid that scrollbar
  on all three of this family's sheets (`scrollbar-width: none` + `::-webkit-scrollbar { display:
  none }`, matching the phone toolbar's own horizontal strip) rather than special-casing group.
  Wiring an already-written but never-checked `dividerOk` variable into the row-grammar lane then
  caught a second bug: the group popover's heading divider used `:first-of-type`, which matches the
  first sibling of a TAG, not of a class — the popover's own header `<div>` (`buildShellHeader`)
  draws ahead of every section title, so the exception never fired and every section painted the
  divider meant to open only the ones after the first. Rewrote both the desktop and phone-scoped
  `.obnotion-group-popover-section-title` rules to divide by sibling position within the title's own
  class (`X ~ X`) instead of DOM-wide tag census. Full reasoning and rejected alternatives (a
  group-only band fix, `scrollbar-gutter: stable both-edges` — hand-computed to make the overflow
  *worse*, 8px instead of 4 — and hiding the scrollbar on every phone sheet instead of just this
  family): `071/005-filter-sort-group-sheets/decision-record.md` ADR-001. **Evidence**: both fixes
  proved with a real red-before-green — the overflow sweep failed 370>366 on both WebKit passes
  before the scrollbar fix and passed after; the divider clause failed with `heading dividers
  1pxpx` on the actual bug once wired, passed with `heading dividers 0pxpx` after. Also fixed a
  pre-existing `lint:tools` red (`dividerOk` unused) by wiring it into the check it belonged to,
  and closed four `vitest` failures the two prior runs' registry/predicate edits had left
  uncaught-up (`sheet-inventory` registered-count 17→18 plus a curated `group` producer, its
  committed `inventory.md` regenerated, and the desktop settings panel's `segmented` verdict
  updated to `true` following the widened switch-synonym predicate — a side effect on an
  unregistered desktop surface, not a live regression). Full battery: `npx tsc --noEmit` 0,
  `npx vitest run` 1727/1727 (run 3x, no flake — the inherited "possibly flaky 5th failure" did not
  reproduce), `npm run build` 0, `sheet-grammar.mjs` 0, `sheet-rebuild.mjs` 0 (the `85ff504` freeze
  regression), `render-assertions.mjs` 0, `touch-targets.mjs` 0, `verify-placement.mjs` 413/415 (2
  declared reds, baseline), two `npm run screenshots` passes (616 each, a third confirmation pass
  matched) with 14 real movers (the family's own scrollbar thumb disappearing, reproduced
  identically across every pass) named in a full acquire/edit/release CSS-lane triplet taking the
  lane over from its released holder (`072-linked-view-blocks-ux`; `styles.css` had two more edits
  after the first release, so the triplet closes with two edit+release pairs), 2 encoder-jitter
  files (pixelHash/layoutHash identical to committed) reverted, `evidence --check-all` 15/15 fresh
  after re-measuring the 11 stale artefacts (`engine-parity.json`'s own re-measurement surfaced a
  pre-existing, unrelated red — 50 Chrome/WebKit disagreements already on HEAD before this session,
  none in filter/sort/group — not part of the required 27-check gate), `npm run gate` **27 green, 0
  red**, `scan-comments`/`scan-failing-values` 0. Owned by `071/005-filter-sort-group-sheets` (its
  REQ-001–003 and AC-001–003, all Met); validated strict, RESULT: PASSED (1 advisory AI_PROTOCOLS
  warning, not required for a bug-fix-shaped Level 3 phase); packet graph metadata backfilled.
  Landed on `.worktrees/247-filter-sort-group-sheets` at its own HEAD; **not pushed** — a fresh
  verifier lands it. The operator's own device recheck row stays open, per the parent packet's D3.
## 058-card-title-and-title-formats — discoverability leg (AC-012) — implemented 2026-09-09 (this leg)

The operator's R4 question ("Also how to set a board card name + number format? You know that
request i asked about?") was a discoverability defect, not a feature gap: the rows shipped in 0.0.32
(AC-001..AC-011), the path to them did not announce itself. Landed, deliberately additive so it
cannot collide with 071/004's redesign of the same settings sheet in its parallel worktree: the
board card's own overflow menu carries a board-only **Card title** row (tap 1: the card menu, tap 2:
the entry) whose jump — `DatabaseView.openCardTitleSettings`, wired through a new optional
`RowMenuActions.openCardTitleSettings` that hides the entry, rather than dead-anchors it, on hosts
that lack it, the Rename note precedent — opens the one canonical settings sheet
(`toggleHeaderPopover("view")` with the settings button as anchor, exactly what the toolbar's own
click would have stored) and scrolls the `data-config-row="title-field"` row under the thumb
(AC-004's seam, reused; no second picker, ADR-002). And the Title format row gained
`data-config-row="title-format"` plus a one-line hint, through a new optional trailing `hint`
argument on `renderSelect` (the conditional-colour summary's precedent), naming what it controls and
the chosen-column-keeps-its-own-format condition that hides it — the condition no control in the
sheet otherwise announced. Placement precedented, not referenced: `screenshots/notion/` still does
not exist (goal D6), so the choice follows the packet's own evidence — the card context menu is the
affordance a thumb finds, the reasoning the Rename note row already records. `i18n.ts` gained
`menu.cardTitle` and `viewConfig.titleFormat.hint` in all three locales. RED→GREEN with a
reverted-line proof: 3/17 failing across `row-menu.test.ts` (the two-tap path, source-shaped per
that suite's precedent — OwnedMenu needs a document the suite does not have) and
`view-config-panel-renderer.test.ts` (hint + marker) before any edit; 17/17 green after; the hint
argument alone, reverted, failed 1/14, restored. No `styles.css` change, so no css-lane triplet
owed; the hinted surface's four captures (constructed-board-card-properties, both themes both
devices) moved as REAL and were reviewed by decoded pixel delta across two sampled runs —
194,742/187,600/55,562/55,566 changed pixels at max channel deltas 229/209/176/196, every one moved
in BOTH runs with byte-identical deltas, so deterministic and this leg's own — and the two movers
the lane had not yet been told about were named on the 004-view-config-sheet holder's release entry
(`check-lane` 0). `capture-device-parity` and `sheet-rebuild` re-run after `evidence --check-all`
flagged them; 15/15 fresh. The gate's first run FAILed on two stale lanes, both regenerated by
their own mechanics and neither by hand-edited numbers: operator-list (071/004's reworded landing
row, whose committed packet docs the derived checklist had not yet absorbed) and css-lane (this
leg's unnamed movers); the second run PASS — **27 green, 0 red**, exit 0 read from the file.
Battery: `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run` 1745/1745, `sheet-grammar` /
`render-assertions` / `touch-targets` 0, `verify-placement` 418/420 (2 declared), `scan-comments` 0,
`scan-failing-values` 0. The 071/001 sheet-inventory's `inventory.md` regenerated (this leg's
`database-view.ts` insertions moved the settings sheet's producer line; the diff is exactly those
line numbers). Packet docs: AC-012 Met with the evidence in its Verification cell (the
whether-the-operator-now-finds-it half stays the operator's device read), tasks T015 landed with the
numbers, decision-record ADR-007 (the placement, the alternatives, and why the Notion reference
could not decide it), implementation-summary discoverability section + continuity — validated
strict, RESULT: PASSED, packet graph metadata backfilled. Owned by
`058-card-title-and-title-formats`. **Not pushed** — a fresh verifier lands it; the operator's
on-device read stays the operator's row.
---

## 250-deprecation-removal — 008/003 remove-renderers-and-harness landed (2026-09-09)

`008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness` is landed in the
`250-deprecation-removal` worktree: the calendar, timeline and chart view renderers — ten sources
with their tests and their two dedicated render benches — moved via `git mv` into
`archive/deprecated-views/<view>/` with a root README plus one per view, each naming the last-live
SHA (`e75a979c9a21f6f93967a40e24b2a58f474fa9d5`, the commit 0.0.34 was cut from) and the exact
`git checkout <sha> -- <paths>` restore procedure; all ten restored paths were proven reachable at
that SHA by `git show`, and the checkout itself was deliberately not executed. Both hosts'
retired-view plumbing came out (`database-view.ts`, `embedded-database-renderer.ts` — dispatch
collapsed, teardown/panel/chart legs deleted, the retired stale-selector roots pruned), the last
bundle references retired (the retired root ids, the retired toolbar and view-config icon/option
arms), the harness registries trimmed (13+8 rows), the retired captures retired (136 manifest
rows, 616→480, 138 PNGs deleted), nine replay claims retired and two narrowed, constructed
scenarios 76→59, reference 4→2, the temporal fixture module and its parity test deleted with
their last consumer. **The stored-view redirect keeps working** — the hide-and-migrate suite's
pinned clauses were never touched and stayed 24/24.

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 154/154 files, 1555/1555 tests;
`npm run build` 0; the bundle grep 0 (was 5); screenshots ×2 at 480, pixel-delta clean (one 1-px
jitter, one 61-px dynamic-timestamp mover), `screenshots:verify` 0; every touched lane
(`render-assertions`, `sheet-grammar`, `story-coverage`, `verify-placement`, shim-coverage,
`sheet-inventory` + its test, `replay` 28/28) exit 0; `evidence --check-all` 15/15 after
re-measuring the one artefact the manifest's hash made stale, by its own writer; the naming scans
0; `npm run gate` **27 green, 0 red for a declared reason** — lane count 27→27, because the
harness's retired-view machinery was kept dormant rather than excised so no lane lost its inputs
(003's decision record, ADR-002). The pinned-values lane went red once, mid-leg: the baseline's
appended note carried a trailing comma, and five retired-view tokens turned unsupplied when their
only setters (style-assignments inside the now-archived renderers) left the scanner's roots —
all five recorded, none stood in (ADR-003), the lane 0 at the final gate. 4/4 acceptance criteria
`Met`; the packet's docs (tasks, AC, implementation summary, decision record, both goals'
continuity) carry the same numbers; validated strict, RESULT: PASSED; packet graph metadata
backfilled. **`037-timeline-gantt-port` is now superseded** (the parent's D4): its renderer — the
gantt port included — is archived, its landing stays documented in its own packet and in the
archive README's timeline section, and 004-archive-docs-and-release owns the remaining rows (the
root-README strip, the community-plugin description, the release cut). Not pushed — a fresh
verifier lands it.

## 252-deprecation-readme-strip — 008/004 archive-docs: the root-README strip, the note and the mention lane (2026-09-09)

`008-calendar-timeline-chart-deprecation/004-archive-docs-and-release` is landed in the
`252-deprecation-readme-strip` worktree: the root README stripped of the retired views — the
intro's view list reads "Table and board views read and write those same files", the Views
section holds two bullets ("Five view types" → "Two view types"), the Settings default-view row
reads "table or board" — with one short "Deprecated views" note carrying the pointer the operator
mandated (R9: "Do keep the archived code somewhere for future use for those deprecated views"): it
names the 0.0.34 removal, points at `archive/deprecated-views/README.md` for the restore path,
and absorbs the former gallery/list migration paragraph (gallery → board, list → table, the
one-time notice, the gallery notice's Undo) so the feature list loses the words while the shipped
behavior's truth stays. The community-plugin description in `manifest.json` now reads "Database
views for notes with table, board, formulas, filters, and inline editing." The early-alpha
paragraph, the record sheet, the linked views and the phone-surface copy are untouched.

**The lane**: RED FIRST — `tools/naming/scan-deprecated-views.mjs` plus a 10-case vitest suite,
to the `scan-comments` conventions, run against the pre-strip copies restored from
`git show HEAD:…`: `README.md` 13 enforced mentions outside any note (chart 3, calendar 3,
timeline 3, gallery 3, "list views" 1), the description 3, plus the note-missing violation —
exit 1. GREEN against the stripped tree: 0 outside the note / 7 inside (chart 1, calendar 1,
timeline 1, gallery 3, "list views" 1), the description 0, exit 0. The note's mentions are
counted, not enforced — the enforced rule is "zero outside the note", which is where the
directive's "zero mentions" objective and the operator's note mandate meet; the ruling is
recorded in the phase goal's LOG. The suite rides the gate's existing tests lane (vitest picks
`tools/**/*.test.mjs`); no gate row added. (The leg's recon grep — five keywords, substring
match, no "list views" — reads 13 → 6; both rulers recorded in the implementation summary.)

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 1581/1581 (the 10 new cases included);
`npm run build` 0; `scan-comments` 0; `scan-failing-values` 0; `npm run gate` (foreground,
`</dev/null`, exit read) **27 green, 0 red for a declared reason** — lane count 27→27. 2/2
acceptance criteria `Met`. 037-timeline-gantt-port's own goal.md gained the supersession note
004's requirement asks for (the 2026-09-09 LOG paragraph: the archive path, the last-live SHA,
the restore procedure, nothing deleted). 002's AC-007 discharged — 0.0.34 = `e75a979c`, verified
by `git rev-parse 0.0.34^{commit}` — and 002's goal/AC/tasks/summary/continuity reconciled; the
008 parent's 004 criterion ticked, fractions reconciled (004 → 90, the parent → 95); the release
notes drafted at `008-…/changelog/008-004-archive-docs-and-release.md`. Validated strict,
RESULT: PASSED; packet graph metadata backfilled. **Open: the 0.0.35 cut that publishes the
drafted notes, then the push** — the packet's last step, a later leg's. Not pushed — a fresh
verifier lands it.

## 256-engine-parity-inputs — 009 residual: the engine-parity disagreements become a gate — implemented 2026-09-09 (this leg)

The roadmap carried one 009 residual: `tools/live/engine-parity.json`'s 23 recorded
Chrome-vs-WebKit width disagreements were informational — the lane exited 1 on every run and
nothing watched them. Measured, not assumed, and the measurement changed the plan: the 23 are
three mechanisms, none a stylesheet gap (every disagreeing input already carries its width, and
the popover owning the 8px cascade already carries its box-sizing), so the residual's
fix-the-stylesheet branch did not apply and the recorded-steady-state branch did. Twelve entries
at exactly 8px — WebKit reserves a classic scrollbar inside the scrolling surfaces (add-view
popover clientWidth 358 vs 350 at an identical 360 offsetWidth) where this headless Chrome paints
overlay; eleven entries (deltas 22.31 ×2, 18.88 ×4, 18.02 ×5) are the engines' intrinsic
text-input widths leaking through fit-content ancestors (the add-view field's shrink-to-fit
wrapper, the import modal's auto table column, the cell editor's fit-content popover), each equal
to the intrinsic difference under that control's own typography. The third mechanism was the
instrument: six pre-fix runs returned 23/47/47/39/39/23 — the checked-background transitions of
two modal scenarios' native checkboxes read mid-flight, the failure the module's own header
documents, which reducedMotion only shortens. Fixed in the harness, both engines: the read awaits
every finite `document.getAnimations().finished` (via `Promise.allSettled`, infinite animations
skipped); three consecutive post-fix runs printed the identical 23, and the earlier committed
record had happened to be a settled read, so the settled steady state needed no new allowance.
The lane is now a real gate — `engine-parity.mjs` classifies each disagreement against the record
as it stood before the run (steady = same scenario, element and property, recorded numeric delta
reproduced within the instrument's own 1.5px; categorical notes matched verbatim), exits 0 only
when steady, 1 on any new/property-changed/grown disagreement; a vanished one is an improvement.
No suppression: the committed 23 carry no categorical notes, so a background note appearing
post-fix fails the run. Negative control: two recorded deltas planted at 255.31 → steady 21 /
new 2, exit 1, exactly the planted entries flagged; the next run absorbs, exit 0. The record also
now fingerprints `theme.css` and `runtime-vars.css`, which it loaded but did not date. ADR-001
lands in 009's `decision-record.md` (new file; created this leg — the packet's AC referenced the
file and it did not exist) with the per-scenario delta table, the mechanism evidence, the
inference labels, and what the decision does not decide (whether the deltas are worth equalizing
— a surface-by-surface question, deliberately unanswered). T27 added to 009's tasks, closed with
the evidence. Battery, final state: `npx tsc --noEmit` 0; `npx vitest run` 1581/1581 (the
retired-renderer removal 69308192, in this worktree's ancestry, accounts for the count against
T26's 1642 — no test lost here); `npm run build` 0; sheet-grammar 0; render-assertions 0;
verify-placement 0 (418/420, 2 red for a declared reason); engine-parity 0;
`evidence --check-all` 0 (15/15); `npm run gate` exit 0 — **27 green, 0 red for a declared
reason**; scan-comments 0; scan-failing-values 0. styles.css untouched — no css-lane triplet, no
recapture owed; the seven other stamped artefacts the gate itself re-dated differ by `measuredAt`
only and ride this commit. Validated strict, RESULT: PASSED (0 errors, 0 warnings, after the
ADR's anchor/continuity nits and the graph-fingerprint backfill); packet graph metadata
backfilled. Not pushed — a fresh verifier lands it.
## 255-pkg-description — 008/004 residual: the npm-listing description (2026-09-09)

The open row 004's lander recorded — `package.json`'s `description` still naming the retired
views — is discharged in the `255-pkg-description` worktree: the description now reads "Database
views for notes with table, board, inline markdown, formulas, and source rules." (the
community-plugin wording, this copy's own feature tail kept — inline markdown, formulas, source
rules), retired mentions 3 → 0 (chart 1, calendar 1, timeline 1). The mention lane now reads
`package.json` too, judging its `description` field alone: the dependency and keyword lists are
code identifiers (one of them is the shipped `chart.js` dependency, retired-view-adjacent by
coincidence), not prose copy, and a missing description field is itself a violation. The lane's
suite grows 10 → 13.

**RED/GREEN**: the old string restored, the extended lane run — `package.json`: 3 retired-view
mention(s), the suite 1 failed | 12 passed, the lane exit 1; the new copy restored — the
description 0, the suite 13/13, the lane exit 0.

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 1584/1584; `npm run build` 0;
`node tools/live/sheet-grammar.mjs` 0; `node tools/live/render-assertions.mjs` 0;
`node tools/storybook/verify-placement.mjs` 0 (418/420 geometry checks, 2 red for a declared
reason — unchanged); `node tools/live/evidence.mjs --check-all` 0 (15 artefacts fresh);
`node tools/naming/scan-comments.mjs` 0; `node tools/naming/scan-failing-values.mjs` 0 (447
ticked, the recorded baselines); `npm run gate` (foreground, `</dev/null`, `$?` read) **27 green,
0 red for a declared reason, exit 0** — lane count 27→27. No styles or renderers changed, so no
capture pass. 004's AC-001 evidence and closure, its implementation summary
(limitations/verification/continuation/continuity) and the 008 parent's goal continuity + LOG
reconciled; validated strict, RESULT: PASSED; 004/008/005 graph metadata backfilled. Not pushed —
a fresh verifier lands it.
## 266-sort-sheet-flush — 071/005 residual: the sort sheet presents the flush frame (2026-09-09)

Operator report 0.0.36 (2026-09-09 ~20:40, iPhone), verbatim: *"Sort sheet doesnt fill full width
like it should like others and has a bottom gap"*. Root cause measured, not guessed: no toolbar
panel sheet ever declared a frame role, so every one was shaped by `classifySheetFrameShape`'s
height-ratio midpoint guess — filter and group's taller bodies crossed the flush cutoff on their
own content, the sort sheet's ~240px body never did, so it alone presented the floating card
(8px side insets, gap underneath). The landed lane ruling had made sort-panel the FLOATING
representative of the floating/flush split; the operator's words rule otherwise and the lane's
expectation is amended floating→flush with the fix (the design-trueup grammar itself untouched —
short UNDECLARED surfaces still infer the card).

**Fix at the producer, not a per-sheet patch**: `src/views/popover-position.ts` gains a
`heightRole` pass-through on `ToolbarPopoverPositionOptions` (threaded to `applySheetChrome`, the
same declaration seam `column-width.ts` already uses for "floating"), and the sort sheet's mount
(`src/views/sort-panel-renderer.ts`) declares `heightRole: "flush"`. No styles.css edit — the
stylesheet never moved (baselineHash 4261be904bfb unchanged); the lane was taken over from 067's
release by 005 with the acquire/edit/release triplet so the movers are judged under a named
holder.

**RED/GREEN**: new `tools/live/sheet-grammar.mjs` clause "frame role — the sort sheet presents
the flush frame" (390px phone viewport): RED before — sort-panel classified floating,
left/right/bottom 8/8/8px; GREEN after — classified flush, 0/0/0px. `FRAME_SHAPE_SURFACES`
re-cut: column-width (declared floating) is now the floating representative and the
negative-control's target, sort-panel flush (declared), settings stays the undeclared/inferred
leg; the negative-control comment now says "declared, not classified".

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 1585/1585; `npm run build` 0;
`node tools/live/sheet-grammar.mjs` 0 (RED exit 1 before the fix); `node
tools/live/render-assertions.mjs` 0; `node tools/storybook/verify-placement.mjs` 0;
`npm run screenshots </dev/null` ×2 exit 0 (480 entries each) — 4 content movers, all the sort
sheet's own captures, identical counts across both runs by decoded pixel delta
(constructed-sort-panel-mobile-dark 117957px@192, -light 136281px@209, -calendar-dark 85754@176,
-calendar-light 104017@196), kept as real; board-mobile-desktop-dark 1px@1 one run = jitter,
restored at committed bytes with its manifest row's bytes field patched (181633);
`screenshots:verify` 0; css-lane triplet, `check-lane` names all 4 (exit 0); stale evidence
artefacts re-run by their own writers (capture-device-parity, design-conformance, sheet-rebuild,
sheet-teardown) — `evidence --check-all` 15/15 fresh; `scan-comments` 0; `scan-failing-values`
0; `npm run gate` (foreground, `</dev/null`) **27 green, 0 red, exit 0**. AC-004 added and Met;
tasks.md T018; goal criterion ticked (operator device recheck stays open per D3); roadmap §4 new
row 84 quoting the report verbatim, state "landed, awaiting device". Validated strict, RESULT:
PASSED (005, 071 parent, 005-component-surface-system), scoped backfill each. Not pushed — a
fresh verifier lands it.

## 075-toolbar-labelled-buttons — the 0.0.36 vertical-scroll lock (2026-09-09)

The operator's 0.0.36 iPhone report — *"The menu with horizontal overflow on mobile allows vertical
movement which shouldnt happen"*, the labelled toolbar strip shifted DOWN with labels half-clipped below
its bottom edge — root-caused in the packet's own lane at 402px: the strip was a two-axis gesture
scroller. Every control paints an invisible 8px touch halo past its own box (`::before` inset −8px), so
the strip's content sat 6px taller than its box (scrollHeight 58 / clientHeight 52), and the phone
strip's later `overflow-y: visible` re-declaration computes to `auto` beside the `auto` x-axis — 6px of
vertical travel, 6px of a 13px label ≈ the half-clipped label photographed.

**Red → green** (extended `run-phone-toolbar-scroll.mjs`, 402px): before — vertical overflow 6px,
`overflow-y`/`touch-action`/`overscroll-behavior-x` all computed `auto`, forced `scrollTop = 40` read
back 6, exit 1; after — `overflow-y: hidden` on both phone strip rules, `touch-action: pan-x`,
`overscroll-behavior-x: contain`, padding-bottom 2 → 8px parking the halo inside the strip's box (the
height fixed, not the overflow hidden over a clipped row: row 52 → 58px, every control fully visible,
`everyControlInsideStrip` true) — 0px / hidden / pan-x / contain / 0, exit 0. Horizontal behaviour
unchanged (532/398, last control reachable).

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 1585/1585; `npm run build` 0;
`node tools/live/sheet-grammar.mjs` 0; `node tools/live/render-assertions.mjs` 0;
`node tools/storybook/verify-placement.mjs` 0 (418/420, 2 declared — unchanged); `npm run screenshots`
×2 exit 0 both, 12 toolbar-capture movers reproduced identically in both runs (deterministic, 0 jitter,
0 restores); `node tools/live/evidence.mjs --check-all` 0 (15 artefacts fresh, 12 stale re-run by their
own writers); `node tools/naming/scan-comments.mjs` 0, `scan-failing-values.mjs` 0 (450 ticked, baseline
148); `npm run gate` (foreground, `</dev/null`) **27 green, 0 red, exit 0** — re-run after the css-lane
handover commit, still 27/0. css-lane taken over from `067-sheet-family-remediation` at its released
4261be904bfb, released at 82894e5ae604. 075 docs: AC-007 (RED→GREEN numbers recorded), T019, goal
criterion ticked on lane proof with the operator's device re-read riding the unticked AC-006 row;
roadmap §4 row 86 quotes the report verbatim, §5.A 075 refreshed to 5/5. Validated strict: 075 and 005
both RESULT: PASSED; graph metadata backfilled both. Not pushed — a fresh verifier lands it.
## 069-board-cross-group-drag — the 0.0.36 device report: touch drag dead on phone (2026-09-09, this leg)

The operator, verbatim on 0.0.36 iPhone ~20:45: *"You still cant drag and drop board cards to
different columns on mobile"* — AC-010 failing on device while `069`'s AC-001 harness stayed
green. The dispatched-`PointerEvent` proof bypasses the one decision a phone's input pipeline
makes: on the first finger move the compositor claims the touch for page scrolling and answers
with `pointercancel`, which tore the armed drag down before any drop. Root cause confirmed in-repo
RED with a new real-input harness (`tools/live/board-touch-drag.mjs`: CDP
`Input.dispatchTouchEvent`, 390×844, `hasTouch`+`isMobile`, `.is-phone`, hold 550ms asserted
against the renderer's now-exported 450ms lift threshold, 10-step boundary crossing, card-DOM +
frontmatter-readback assertions, negative control = plain vertical flick stays the compositor's
gesture): `touchstart pointermove touchmove pointercancel…`, 0 move calls, exit 1.

**Fix, one producer** (`src/views/board-renderer.ts`): the armed card answers a non-passive
`touchmove` with `preventDefault` (touch events retarget to the touch-start element, so the
listener sees the whole gesture) and sets `touch-action: none` at lift, cleared at teardown —
the pattern the linked-view handle and the sheet grab bar already shipped. Desktop pointer drag
untouched; the dispatched-event harness and the parity suite stay green.

**GREEN**: exactly 1 `moveRowWithGroupUpdatesAndPosition` `{backlog→todo}`, card DOM in the
target column, `frontmatter[board_status]="todo"` read back, `pointercancel=false`, exit 0.
Wired as the gate's 28th lane (`tools/gate.mjs`, evidence stamp `tools/live/board-touch-drag.json`).

**The numbers**: `npx tsc --noEmit` 0; `npx vitest run` 1585/1585; `npm run build` 0;
`node tools/live/sheet-grammar.mjs` 0; `node tools/live/render-assertions.mjs` 0;
`node tools/storybook/verify-placement.mjs` 0 (418/420, 2 declared red — unchanged); screenshots
×2 + pixel-delta (1 jitter, maxDelta 1 ≤ 12, one run only, PNG restored to committed bytes; no
styles.css change so no css-lane triplet); `node tools/live/evidence.mjs --check-all` 0 (16
artefacts fresh); `npm run gate` (foreground, `</dev/null`, `$?` read) **28 green, 0 red for a
declared reason, exit 0**; scan-comments 0; scan-failing-values 0. `069` docs reconciled:
AC-011 new Met, AC-010 unticked with the 0.0.36 note, tasks T019-T023, goal criterion + LOG,
parent roadmap §4 row 84 with the report verbatim, state "landed, awaiting device". Validated
strict, RESULT: PASSED; graph metadata backfilled. Not pushed — a fresh verifier lands it.
## 071/007-settings-sheet-strict-alignment — the settings sheet's card-grouping shell (2026-09-09)

The operator's row-84 report ("Settings sheet still has bad ui overall and needs strict alignment
with notion sheets") closed structurally: on the phone sheet, each section's heading now sits
**above its own rounded card** and the card boundary replaces the opening hairline — the sheet's
rows collect into `.obnotion-settings-card` containers (producer `view-config-panel-renderer.ts`,
sheet presentation only; the anchored popover keeps the continuous list) painted
`--background-primary` at `--obnotion-radius-lg` inside the shared 16px inset with a 12px gap on
the sheet's own `--obnotion-surface-overlay` canvas; a card's first row draws no divider (067's
sibling-position mechanism).

**RED/GREEN**: card assertion RED — 0 card containers, lane exit 1; GREEN — 2/2 cards radius ≥8px,
backgrounds distinct from canvas, 1/1 gap ≥8px, 2/2 headings above their card, exit 0. 002's row
grammar green unchanged inside the cards (2336 PASS / 0 FAIL). Unit revert-proof: card-background
declaration removed → exactly 1 test fails, restored → 7/7.

**The numbers**: tsc 0; vitest 1586/1586 (157 files); build 0; sheet-grammar 0; render-assertions
0; touch-targets 0; verify-placement 0 (418/420, 2 declared); screenshots ×3 480/480 exit 0 (4
deterministic two-run movers, all this surface: view-config 716882/716962px@Δ192/209,
board-card-properties 785113/785159px@Δ194/209; 3 one-run ≤4px@Δ1 jitters restored per the lane
rule; screenshots:verify 0); css-lane acquire/edit/release triplet signed, baselineHash
`6224cfae4b35`, check-lane 0; evidence 15/15 fresh (14 stale artefacts re-derived by their own
tools); gate 27/0 ×2; scan-comments 0; scan-failing-values 0; validate --strict PASSED ×3 (packet,
071 parent first RESULT, 005 track).

**Open**: the four card metrics (radius 8px, inset 16px, gap 12px, the two surface tokens) are
**provisional** pending T001's full-resolution operator capture, which retunes them; AC-007, the
operator's own device read (D3), closes the packet. Not pushed — a fresh verifier lands it.

## 074-test-data-consolidation — the 0.0.36 testbed view-set ruling (2026-09-09)

The operator's 0.0.36 ruling — *"Also clean testbed only 1 database with table and boars views"*
(the boards read; the subject is the testbed fixture's view set) — landed in `074` as AC-005.

**Red → green.** RED (`tools/mock-data/consolidation.test.mjs`, against the untouched tree):
2 failed | 6 passed — the catalogue built 1 database (`testbed`) with 6 views
`[table, board, calendar, timeline, chart, table]`. Fix at the source: `catalogue.ts` `buildViews()`
now declares exactly one table ("All records", the everything-shown default) and one board ("By
status", grouped by status); `catalogue.json` regenerated (−39 lines). GREEN: registry suite 8/8,
`catalogue.test.mjs` 28/28, full `vitest` 1587/1587.

**What the ruling did not touch, verified:** the Testbed CSV's 36 rows (views are not in the CSV,
0 byte diff) and the 070 Finance second dataset. No lane or capture mounted the retired views — the
only catalogue mounts in `render-assertions.mjs` are table lanes and no `screenshots/manifest.json`
scenario references the removed view ids — so the 480-capture set needed no orphan sweep.

**The numbers**: `tsc` 0; `vitest` 1587/1587 (0); `build` 0; `sheet-grammar` 0; `render-assertions` 0
(coverage re-stamped); `verify-placement` 0 (418/420, 2 declared); `screenshots` ×2 exit 0, 480 — one
deterministic mover kept (panel-record-detail-sheet-body-empty-desktop-dark, 1539px @ Δ1, identical
across two consecutive runs, +13 manifest bytes), two one-run jitter movers regenerated identical to
HEAD; `evidence --check-all` 0 after re-running the stale `capture-device-parity` writer (112 pairs
PASS); `scan-comments` 0; `scan-failing-values` 0; **gate 27 green, 0 red, exit 0**. `074` docs:
AC-005 (counts RED→GREEN, amending AC-002's six-view shape as superseded-not-withdrawn), T011, goal
criterion added and ticked, `testbed-proposal.md` amended to the ruling. `roadmap.md` §4 row 87
quotes the ruling verbatim. Validated strict: `074` and `005` both RESULT: PASSED; graph metadata
backfilled both. Not pushed — a fresh verifier lands it.
## 071/010-sheet-copy-touch-idiom — the sheets' copy, touch idiom (2026-09-10)

The audit's §3.16 content finding closed: the four sheet-reachable strings that told a phone user
to click, double-click or hover now say tap (and 轻点) in all three locales — `panel.emptyFilters`
and `panel.emptySorts` lost their "below" with the gesture, `panel.doubleClickEdit` reads
"Double-tap to edit" / 轻点两下编辑属性 / 輕點兩下編輯屬性 (the one shared-string note, recorded:
desktop's tooltip now says tap too, and its `dblclick` fires from a double-tap in the mobile
webview, so the sheet is satisfied exactly), and `viewConfig.computedSync.manualHint` keeps its
button name. The dictionary's ellipsis is spelled one way — U+2026, 23/23/23 — and the property
label is one word: `panel.field` = Property/属性/屬性, the packet's recorded default D5 (no
operator ruling had been taken; it is the same word as `filter.field` and of `panel.addColumn` /
`panel.searchProperties`), unit-held. Fifty-two lines in `src/i18n.ts`; the seven out-of-scope
cell/desktop gesture strings are byte-identical.

**RED/GREEN**: the new sheet-copy clause in `tools/live/sheet-grammar.mjs` (the sheet-reachable key
set derived at run time — every dotted identifier the four producers reference, 237 keys — and
every key read through the shipped `t()`/`setLocale` in the harness bundle, all three locales) ran
**RED: 14 gesture rows + 2 locale-parity rows, the failing set exactly the four keys and none of
the seven**; after the dictionary change, **GREEN: 0 of 237 keys matches in any locale, 0 parity
rows, 2349 PASS / 0 FAIL, exit 0**. The clause itself discovered `viewConfig.computedSync.manualDesc`'s
two zh rows (EN gestureless, zh kept 点击/點擊 — its EN untouched). `src/i18n.test.ts` (created)
holds the dictionary beneath: one-ellipsis-per-dictionary, gesture parity, and the one-word label —
its ellipsis clause proven by the mandated mutation (one ASCII ellipsis reintroduced → exactly
1 clause fails → restored → 11/11; 12/12 in the final file).

**The numbers**: tsc 0; vitest 1598/1598 (158 files); build 0; sheet-grammar 0; render-assertions
0; verify-placement 0 (418/420, 2 declared); screenshots ×2, both 0/480 (8 two-run movers kept —
the sort empty state's 518×23px hint band on all four `constructed-sort-panel-calendar-*` shots and
the 12–14×4px `Custom property…` ellipsis box on all four `constructed-view-config-*`; 2 one-run
1–4px@Δ1 jitters restored, their manifest bytes with them; screenshots:verify 0); evidence 16/16
fresh (capture-device-parity re-ran); gate 28/0 once, from the final state; scan-comments 0;
scan-failing-values 0; validate --strict `RESULT: PASSED` ×3 (this packet, the 071 parent's first
RESULT, the 005 track) after the scoped backfill of each.

**Open**: AC-007's filter half — the corpus has no scenario for the filter's empty state, so its
before/after is the lane's printed `t()` values, not an image (adding it is outside this packet's
frozen Files-to-Change; 008's leg owns the filter sheet); the two movers' `sources` lists never
named `src/i18n.ts`, which is why the freshness check alone could not have caught them — recorded
in the packet's goal.md, unfixed here. AC-008, the operator's own device read (D3), closes the
packet; until then: landed, awaiting device. Not pushed — a fresh verifier lands it.

## 071/009-properties-sheet-row-model — the Properties sheet row rebuilt (2026-09-09/10)

The audit's second P1 landed. Eight elements per row, six interactive, the storage key printed in
every label ("Name [file.name]") — today: three interactive controls, a key-free name, and a
Shown / Hidden partition, on the ruling "Check more sheets align closer to notion, input, content,
wise etc" / "Ui improvement is focus here".

**Red → green (the packet's own clauses, `tools/live/sheet-grammar.mjs`).** RED: 6 interactive
controls on every one of the 16 fixture rows (wanted ≤3 as implemented, ≤4 as specified), 0/16
labels key-free, 0 section headers. GREEN: 16/16 rows at **3** controls, **16/16** labels
key-free, **2** section headers — `Shown`/`Hide all` and `Hidden`/`Show all`, the four strings
`record-detail-panel.ts:222-226` already consumed, no new i18n — each bulk action on its own line,
the header's All master toggle dissolved into them. 0 native selects; 34px row heights; 3/3
section-boundary hairlines and 0.49px title centring unchanged; WebKit long-name extent 401 ≤ 401.

**The mechanics.** The row grid went 8 → 5 tracks (the board Properties list rides along through
its own overrides); wrap and delete moved into the edit-property surface — the rename modal gains
an optional 5th constructor argument and a full-width `is-warning` Delete property row that closes
the modal into the confirmed `deleteColumn`, the row's name tap reaches `editColumn` (one tap,
verified: verify-placement's property-row section rewritten to the no-delete / name-tap /
three-action contract, 418/420, 2 declared reds). The phone sheet's own scrollbar dropped to 0px:
the partition's two extra header lines tip long, wrapping names past the 90svh cap, and the
desktop-WebKit lane then draws the classic 8px bar, eating 8px of root width (extent 397 > 393, ×5)
— a phone's scrollbar is the overlay kind that never draws, so the sheet scrolls without reserving
a desktop gutter; the title-centring negative control now injects the historic 88px (All + close)
trailing width itself, since the shipped header's trailing slot is the close alone.

**One declared scope deviation:** the storybook `panel-column-manager` fixture (a 6th file, outside
the packet's 5) had to be rewritten to the shipped row — its 8-child hand-HTML wrapped onto a
second line under the 5-track grid, four panel captures changed size, and `replay.mjs` went BROKE
(`002-properties-panel` "the properties row stays on one line": recorded 1, now 2). Replay holds
28/28 after; the deviation is recorded in the packet's `goal.md` deviations table.

**The numbers**: unit red-then-green (`column-manager-renderer.test.ts` 1 failed | 6 passed →
7/7 on the key-free clause); vitest 1591/1591; tsc 0; build 0; sheet-grammar 0 (RED lane was exit 1
with exactly the 3 new clauses red); render-assertions 0; verify-placement 0; touch-targets 0;
screenshots 480×5 exit 0 — decoded-pixel judgment: the redesigned surface 321990-361711px at
maxDelta 196-225 (4 constructed pairs), its dependent stacks (property editor, confirm card,
depth-3 type picker — where the delete row now lives) and the rewritten panel fixtures following;
every mover reproduced identically across runs, none under the 12-delta one-run-only jitter rule,
2 byte-only movers pixelHash-identical; evidence 16/16 fresh after re-running the 11 stale census
writers (design-conformance 4/5 enforced, replay 28/28 after the fixture fix); scan-comments 0;
scan-failing-values 0; **gate 28/28, exit 0**. The css-lane acquired/edited/released at
`0d6a8dbd2fa2` with 20 captures named reviewed; the two byte-only movers are not billed to the
release, as the comparator reads them.

**Open**: the operator's device read (D3) — no agent ticks it — and the audit's C-2
full-resolution Notion Property-visibility capture, which stays §13's Notion column structural.
`010` owns the tooltip copy, `014` the add-affordance shape. Validated: 009, 071 (first RESULT)
and 005; graph metadata backfilled each. Not pushed — a fresh verifier lands it.

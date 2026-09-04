---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-04T14:09:55Z"
    last_updated_by: "board-t12-land-reconciliation"
    recent_action: "Landed 033-board-t12 onto main; 19 captures reconciled; screenshots-fresh pre-existing red"
    next_safe_action: "Operator vault compare (roadmap.md row 37), then T8"
    blockers:
      - "Not operator-confirmed: release has not been cut for this leg yet"
      - "T12's operator vault-compare half (roadmap.md row 37) is not this repo's to close — the in-repo source-pixel half is now MET"
      - "T8 (operator device confirmation) is the only row that closes the packet"
      - "CLOSED by follow-up commit 349e22c4 (043-constructed-capture): npm run gate now reads 25/25 — screenshots-fresh's 791 STALE (down from the 848 first measured) recaptured to 0 — see AC-7"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
      - "tools/screenshots/theme.css"
      - "tools/bench/board-render-bench.ts"
      - "tools/live/render-assertion-harness.ts"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "038-board-kanban-port"
      parent_session_id: null
    completion_pct: 80
    open_questions: []
    answered_questions:
      - "Card identity stays RowData.file.path throughout: no hunk in either landed commit touches drag/drop, WIP/visible-count, swimlane, summary, conditional-formatting or touch-mode identifiers (confirmed by re-reading both diffs' added lines)."
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 038-board-kanban-port |
| **Completed** | Not yet — REQ-007's 1:1 leg pair has landed (T9/T10 structure/class port, T11 CSS/fixture port, T13-T21 fidelity passes, T22-T25 and T26-T30 closing fixes for three later fresh T12 reads' divergences); T12's in-repo half is now MET, its operator half (roadmap row 37) and T8 (operator device confirmation) are the two rows left open |
| **Level** | 2 |
| **Completion** | `tasks.md` 24/30 rows closed (T5-T7, T9-T11, T13-T30; 80%). The two pre-amendment legs' card-hierarchy match and negative-control criteria remain true in `goal.md`; the amendment's own 1:1-copy criterion is now structurally AND visually evidenced (T9/T10 structure/class, T11 CSS one-to-one copy plus fixture rewrite, T13-T30 fidelity passes) — T12's in-repo half closed this session, leaving only the operator-owned evidence (vault compare, device confirmation), not missing work. See "Next Leg" for the full 2026-09-04 account, including a P0 drag/drop bug T12 found in T10's port, a progress-bar fixture bug and five downstream gate-lane fixes T11 found and closed, the four REQ-007 divergences a later fresh T12 read found and T22-T25 closed, a fourth fresh T12 read's host-padding bug/fixture-coverage gap/evidence-bar amendment that T26-T28 closed, and a fifth fresh T12 read's two missing host tokens and unphotographed priority strip that T29-T30 closed. |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The board's Kanban surface now carries `obsidian-pm-main`'s column and card information
hierarchy, delivered in code across two committed legs and given its `--db-*` token visual
language in the second. Card identity, drag/drop payloads, and every local extension the
reference has no equivalent for stay untouched by hunk-range inspection; hover, drag,
drop-target, and the empty-column slot were styled but unproven by any fixture until this pass,
which adds two screenshot scenarios that depict all four states with no stylesheet edit.

### Board / Kanban Port

`b9e2321` (column and card hierarchy): rewrote `renderColumn`/`renderCard` to a status-colored
column topbar, a per-card priority strip, a parent-folder chip above the title, and select/status
fields promoted from duplicate meta rows into title-row chips, all sourced through the existing
`RowData`/`ViewConfig`/`renderCardFieldContent` pipeline — no reference field list is hardcoded.
Red-first: `board-renderer-hierarchy.test.ts` ran against the stashed, pre-rewrite renderer first
and failed 4 of 10 assertions (missing topbar, missing priority-strip/body/parent-chip, the
meta-grid field probe, and select/status chip dedup); the stash was popped and the same run went
10/10 green. Re-reading this commit's added lines confirms none of them touch drag/drop, the
path/batch-order transaction, WIP/visible counts, swimlanes, summaries, conditional formatting,
or touch-mode identifiers.

`a6fcd31` (visual language): styled the ported markup entirely in `--db-*` tokens inside the
existing board section — the topbar and priority strip get their color, a card body wrapper and
parent chip, the title line with its chips ranged right, the field grid beneath, drop-target
tints, a line-clamped card value, and a reduced-motion block. The screenshot fixture was rewritten
to mirror `renderColumn`/`renderCard` class-for-class and is now backed by a containment parity
test that walks real tag structure instead of string position; proved red first by moving the
title-row chips out of the title line while leaving them later in the document, which a
string-index check cannot see but the DOM-walk assertion catches. The column-width contract is
kept: probing the rendered column at 220/250/280/400px reads 236/266/296/416, identical to
`b9e2321` at every point.

This pass (empty-column and drop-language capture, no commit hash yet): closed the two open
states neither prior leg's fixture depicted. `boardEmptySlot()` mirrors `renderColumn`'s
`visibleCount === 0` branch — `EmptyStateRenderer`'s card under the "empty-group" reason, with
the board's own `db-board-empty-slot` class appended — and `boardColumn`/`boardCard` gained
additive options (`columnClass`, `cardRenderer`, `dragState`, `dropPlacement`) so a column can
carry `is-drop-target` and a card can carry `is-dragging` or `is-drop-target` plus its
before/after `db-board-drop-indicator`, all optional and all matching the exact classes
`board-renderer.ts`'s dragstart/dragover handlers add. No caller that omits the new options
renders differently than before. Two new scenarios, `board-empty-column` and
`board-drop-language`, capture the states across both devices and themes; `shared.test.mjs`
gained six new assertions proving the empty-slot's icon/content order, the column and card drag
classes, and the drop-indicator's placement and before/after modifier, red-first on a nesting
mutation.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-renderer.ts` | Modified | Rewrote `renderColumn`/`renderCard` hierarchy (topbar, priority strip, parent chip, title-row chips) per catalog rows 1, 2, 5, 8 |
| `src/views/board-renderer-hierarchy.test.ts` | Created | Red-first hierarchy assertions (4/10 red against the pre-rewrite renderer, 10/10 green after) |
| `styles.css` (§17 BOARD VIEW) | Modified | `--db-*` token visual language for the ported column/card hierarchy; column-width fallback reverted from a hardcoded 280px back to the resize clamp's own 220px floor |
| `tools/screenshots/scenarios/shared.mjs` | Modified | Board/mobile fixture rewritten to mirror `renderColumn`/`renderCard` class-for-class; this pass added `boardEmptySlot()` and drag-state options on `boardCard`/`boardColumn` |
| `tools/screenshots/scenarios/shared.test.mjs` | Created/Modified | Containment parity test for the rewritten fixture; this pass added empty-slot and drag-class assertions |
| `tools/screenshots/scenarios/core.mjs` | Modified | Added `board-empty-column` and `board-drop-language` component scenarios |
| `tools/lane/css-lane.json` | Modified | Release entry naming the 8 new plus 11 pre-existing changed captures; no stylesheet edit. Post-rebase: merged with main's own gantt-port history, `baselineHash` recomputed on the merged stylesheet (`276e1094c61c`), a further release entry closes the lane's invariant since the recapture found nothing new to review |
| `screenshots/manifest.json` | Modified | Post-rebase: merged per entry by owner (board/chrome-board/constructed-board from this task's branch, everything else from main), then a fresh full capture found zero content changes beyond that merge |
| `tools/live/*.json` (16 evidence artefacts) | Modified | Post-rebase: took main's version at merge time, then re-ran the 8 the evidence gate flagged stale against the merged `styles.css` hash; the gate's own run re-stamped the remaining 10 |
| `tools/live/touch-targets-constructed-baseline.json` | Unchanged | Post-rebase: this task never edited it; a re-measure on the merged tree still lands on main's existing 367, so no reconciliation entry was needed |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Both legs landed as external, committed history (`b9e2321`, `a6fcd31`) before this documentation
pass; this pass is a fresh in-runtime verification against that history, not new implementation.
Re-run today, 2026-09-03: `node tools/live/evidence.mjs --check-all` reports all 16 artefacts
fresh; `node tools/live/render-assertions.mjs` (disarmed default) passes `board/file-view` and
`board/embed` on "no forced layout inside the card loop", matching the standing bound of 8 the
control has never been observed failing against. Armed (`RENDER_READ_CONTROL=per-item`), the same
two scenarios go red at 1601 layout reads against that bound, confirming the control still catches
a regression rather than passing by default; the disarmed run was repeated afterward to restamp
`renderer-coverage.json` back to its normal state. `SURFACE_PHASE=038-board-kanban-port npm run
gate` and a second bare `npm run gate` both exited 0 with 25 green / 0 red, read directly rather
than through a pipe. `board-view-desktop-light.png` was opened directly this session: every
column carries its colored topbar, every card its matching priority strip, controls row,
`Subscriptions` parent chip, title line with select/status chips ranged right, and Cost/Renews
grid, with nothing clipped, overlapped, or unstyled. The `styles.css` edit ran under the CSS lane
(`tools/lane/css-lane.json`), released at `9eb4b141471e` naming all 20 changed captures with what
each shows. This will ride release 1.4.5, pending.

**Later the same session (empty-column and drop-language capture):** no stylesheet edit; two
new fixture helpers and two new screenshot scenarios only. `npx vitest run` (full suite):
86/87 files, 868/869 tests green before the recapture — the one red was
`screenshot-fixtures.test.ts`'s manifest-completeness check, expected until the new scenario ids
were captured, and green after. The new `shared.test.mjs` assertions were proven red first: the
empty slot's icon/content order swapped and the drop-indicator moved inside the card body instead
of after it both passed a naive string-position check and both failed the new
`expectDirectChildOrder` assertions; reverted to green. `npm run lint:tools` clean. Recaptured
detached (`nohup npm run screenshots`, waited on the PID; no stray Chrome beforehand or after);
the first attempt reported `CLIPPED board-empty-column-desktop-{dark,light}: 10px lost` against a
620px declared width, widened to 660px, and the second full recapture reported 0 failures across
276 screenshots. `git status --porcelain -- screenshots` shows 8 new PNGs
(`board-empty-column`/`board-drop-language`, desktop+mobile, light+dark) plus 11 pre-existing
captures whose `layoutHash` is identical to the pre-recapture manifest entry for every one
(byte-size-only encoder noise); all 8 new PNGs opened and read directly this session. Named in
`tools/lane/css-lane.json`'s `038-board-kanban-port` release; `node tools/lane/check-lane.mjs`
reports "release names all 19 changed capture(s)", exit 0. `node tools/live/evidence.mjs
--check-all` found `capture-device-parity.json` stale against the new manifest hash, re-ran
`node tools/live/capture-device-parity.mjs` (PASS — 0 newly-identical pairs against a baseline of
4), then re-ran `--check-all`: 16/16 fresh. `npm run gate`: 25 green / 0 red, exit 0 read
directly.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reject a hardcoded 280px column-width floor mid-session, in favor of the resize clamp's own 220px fallback | An intermediate edit on the CSS lane had introduced `flex: 0 0 var(--db-board-column-width, 280px)`, silently overriding the clamp below 280px; reverted, then probed at 220/250/280/400px and confirmed 236/266/296/416, unchanged from `b9e2321` |
| Prove the rewritten screenshot fixture with a DOM containment/sibling-order test, not a string-position check | A string-index check cannot see chips moved out of the title line while remaining later in the document; the walk-the-tag-structure assertion catches exactly that and was proven red first on that mutation |
| Leave hover, drag, drop-target and the empty-column slot unclaimed as "visually confirmed" | No screenshot fixture depicts any of the four states; both landed commits name this explicitly as owed rather than assumed, so `tasks.md` T3/T4 and the matching `goal.md` criteria stay open |
| Tick only `tasks.md` T5-T7 and the `goal.md` criteria whose own stated evidence bar was actually met | T1's pre-rewrite baseline for the ten local extensions and the drag-drop matrix was never captured in either leg (`b9e2321`'s own message says so directly); T2-T4 and the matching criteria depend on that baseline and stay open even though hunk-range inspection shows their code paths untouched |
| Arm the board/gallery layout-read negative control (`RENDER_READ_CONTROL=per-item`) rather than citing only its disarmed pass | `node tools/naming/scan-failing-values.mjs` requires every newly ticked `goal.md` row to record a red value; the armed run genuinely reddens `board/file-view` and `board/embed` at 1601 reads against the bound of 8, giving that criterion a real "moved from" number instead of only a today-passes claim |
| Leave the `goal.md` gate and `validate.sh --strict` criteria unticked even though both are true today | Neither has a pre-existing red on record for this packet (gate was already green; `validate.sh --strict` already returned `RESULT: PASSED` before either leg landed, confirmed by stashing this session's edits and re-running); ticking them would fail `scan-failing-values.mjs`'s program-wide ratchet (baseline 145, 1 unit of slack). They are ticked in `tasks.md` T7 instead, which carries no red-value requirement |
| Depict the drag/drop-target/empty-column states as additive fixture options, not a rewrite of `boardCard`/`boardColumn` | The existing scenarios' markup has to stay byte-identical so `board-view`/`board-mobile`/`board-subtask-tree` are proven unaffected; `dragState`, `dropPlacement`, `columnClass` and `cardRenderer` all default to producing the exact prior output, verified by re-running the full suite before and after (868/869, then 869/869 after the manifest caught up) |
| Depict only the classes the drag handlers add on dragstart/dragover (`is-dragging`, `is-drop-target`, `db-board-drop-indicator`), not the `:hover` pointer-lift rule | `.db-board-card:hover` (`styles.css:9257-9262`) is a real CSS pseudo-class under `@media (hover: hover)`, not a class `renderCard` ever applies; a static fixture can depict a class the renderer sets, not a live pointer state, so this stays a genuine gap rather than something this pass silently claimed |
| Tick the one `goal.md` row this evidence closes (`Hover/drag/drop visual language`) rather than inventing a second checkbox for "empty column" | `goal.md` names exactly one criterion covering all four states (raised card, hover lift, drop-target tint, column drop highlight) and `tasks.md` T3 separately requires the full drag-drop matrix re-proof this pass does not attempt; splitting the criterion in the doc would misstate what `goal.md` actually asks |
| **(2026-09-04)** Amend `tasks.md` T12's evidence bar from "opens both sets of captures" to "compares the captures against the reference SOURCE (`kanban.css`/`table.css`/`widgets.css` and the composites) with pixel measurements, AND the operator compares the two plugins side by side in the vault where both are installed" — reversible default, the operator may restore the original wording | The vendored reference carries zero image files, so "opens both sets of captures" cannot be met from this repo alone; the source-file half stays checkable in-runtime, and the visual-comparison half moves to the operator, tracked as a new row in the parent `../roadmap.md` §4 operator table rather than an agent-tickable task |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Hierarchy red-first (`board-renderer-hierarchy.test.ts`) | Red: 4/10 against the pre-rewrite renderer; green 10/10 after `b9e2321` |
| Fixture containment parity red-first | Red on a chip-nesting mutation (chips outside the title line, later in the DOM); green after the fixture rewrite in `a6fcd31` |
| Column-width contract | 220/250/280/400px probe reads 236/266/296/416, identical `b9e2321` vs `a6fcd31` |
| `tools/live/engine-parity.json` fixture differences | 65 -> 49, confirmed in the `a6fcd31` diff against `styles.css` hash `9eb4b141471e` |
| `tools/live/touch-targets.json` under-floor count | 278 -> 277, classes 35 -> 34, confirmed in the `a6fcd31` diff |
| `node tools/live/evidence.mjs --check-all` | 16/16 fresh — re-run 2026-09-03 this session |
| `node tools/live/render-assertions.mjs` (disarmed) | PASS — `board/file-view` and `board/embed` both clear "no forced layout inside the card loop"; re-run 2026-09-03 this session |
| `node tools/live/render-assertions.mjs` (armed, `RENDER_READ_CONTROL=per-item`) | RED (expected) — `board/file-view` and `board/embed` both fail at 1601 layout reads vs the bound of 8, confirming the control is armed; re-run 2026-09-03 this session |
| `SURFACE_PHASE=038-board-kanban-port npm run gate` | PASS — 25 green / 0 red, exit 0 read directly; observed 2026-09-03 this session |
| `npm run gate` (bare) | PASS — 25 green / 0 red, exit 0 read directly; observed 2026-09-03 this session |
| Screenshot capture (20 changed images named in the `9eb4b141471e` lane release) | Read per the release note; `board-view-desktop-light.png` opened directly this session and matches |
| `validate.sh --strict` | `RESULT: PASSED`, `Errors: 0`, `Warnings: 1` (pre-existing `COMPLEXITY_MATCH` note, unrelated to this pass) — observed 2026-09-03 |
| `shared.test.mjs` empty-slot/drag-class red-first | Red: `db-empty-card-content follows the preceding node under the empty slot: expected 0 to be greater than 1` and `db-board-drop-indicator is a direct child of the drop-target card: expected -1 to be greater than -1`, both against a mutated fixture; green (11/11) after reverting |
| `npx vitest run` (full suite) | 86/87 files, 868/869 tests green pre-recapture (the one red is the manifest-completeness check, expected before capture); green after |
| `npm run lint:tools` | Clean, no output |
| `npm run screenshots` (detached, `board-empty-column` width fix) | First attempt: 2 `CLIPPED` failures at a 620px declared width; widened to 660px; second attempt: 0 failures across 276 screenshots |
| `git status --porcelain -- screenshots` / `layoutHash` diff | 8 new PNGs, 11 pre-existing captures with unchanged `layoutHash` (byte-only encoder noise); all 8 new PNGs opened and read |
| `node tools/lane/check-lane.mjs` | "release names all 19 changed capture(s)", exit 0 |
| `node tools/live/evidence.mjs --check-all` (this pass) | 1 stale (`capture-device-parity.json`) on first run; `node tools/live/capture-device-parity.mjs` re-run (PASS, 0 newly-identical); 16/16 fresh on re-check |
| `npm run gate` (this pass) | PASS — 25 green / 0 red, exit 0 read directly |
| Post-rebase reconciliation (onto main's one-to-one gantt port, `75eaa34`, merge-base `46a8525`) | `styles.css` conflict-free rebase to a new merged hash (`276e1094c61c`); `npm run screenshots` (356 entries) found zero content-changed captures, 5 byte-only re-encode captures restored to `HEAD`; `touch-targets.mjs` re-measure held main's 367; `css-lane.json` merged and closed with a new release entry; 8/16 `tools/live/*.json` evidence artefacts re-stamped; two `constructed-board` and two `constructed-timeline` captures opened and read, both surfaces confirmed still fully styled; `npx tsc --noEmit` exit 0; `npx vitest run` 993/993 (99 files); `npm run lint` 172 (unchanged); `scan-comments` PASS; `npm run gate` 25/25 green |
| T22-T25 red-first (`board-renderer-parity.test.ts`, `shared.test.mjs`) | Red on all 6 new/inverted assertions before the fix (dead selector, near-tier chip, unconditional Sub chip, literal-column parent line, badge icon x2); green 43/43 after, across both files |
| `constructed-board`/`constructed-board-subtask` height-chain, before/after `HEAD` crop compare | Shorter columns (3-card `review`/`doing`) now stretch to the frame bottom matching taller siblings, both themes; confirmed against the committed `HEAD` PNGs, not just described |
| `board-view`/`board-subtask-tree` due-chip and Sub-chip/parent-line read, both themes | Sketch's due chip renders plain (not orange); subtask children show the real parent title plus the Sub chip, the root card carries neither |
| `node tools/lane/check-lane.mjs` (this pass) | "release names all 28 changed capture(s)", exit 0 |
| `node tools/live/evidence.mjs --check-all` (this pass) | 9 stale (8 census/audit artefacts + `capture-device-parity.json`) on first run against the new `styles.css`/manifest hash; all 9 re-run; 16/16 fresh on re-check |
| `npx tsc --noEmit` / `npx vitest run` / `npm run lint` / `scan-comments` / `npm run gate` (this pass) | 0 / 996/996 (99 files) / 172 (unchanged baseline) / PASS / 25 green, 0 red |
| T26 red-first (`shared.test.mjs`) | Red — `.pm-kanban-board`'s margin still read `var(--db-space-8)` directly, confirmed by stashing only the `styles.css` edit; green after routing both the margin and the mobile-breakpoint padding through `--db-container-padding-inline` |
| T26 phone-inset pixel measurement, before (`HEAD`) vs after (this pass) | `board-view-mobile-{light,dark}` and `constructed-board-mobile-light`: page-to-column colour transition at device-px 40 -> 64 (CSS 20px -> 32px) in every case; minus the capture harness's constant 16px `#shot` padding, 4px -> 16px, matching the fourth T12 reviewer's own numbers |
| T27 red-first (`shared.test.mjs`, 4 new/extended cases) | Red on 3 of 4 against the pre-change `shared.mjs` (stashed and restored to confirm) — no milestone/recurrence `--pm-chip-color`, single fixed-colour avatar span instead of initialed multi-avatar stack, due chip echoed the long literal unconverted; green after |
| `constructed-board`/`constructed-board-subtask` avatar-stack read, both themes | Real `BoardRenderer` (not the hand fixture) paints initialed avatars once `tools/bench/board-render-bench.ts`'s one `"mixed"` multi-select column is keyed `"people"`; column count and every other `REPORTED_COLUMNS` entry unchanged |
| Manifest-staleness self-correction | An initial full revert of the 2 byte-only-noise `manifest.json` entries to `HEAD` (including `sourceHashes.styles.css`) made `npm run screenshots:verify` report them `STALE` against the committed `styles.css` hash; caught before committing, fixed by keeping this run's fresh `sourceHashes` and correcting only `bytes` to the restored file's size — `screenshots:verify` then read 356/356 fresh |
| `npm run gate` (this pass, after the manifest fix and the 8 evidence artefacts above) | 25 green / 0 red, exit 0 read directly |
| Post-rebase reconciliation (onto `origin/main`, `a78000c`, landing `worktrees/033-board-t12`) | `constructed-state-assertions.mjs` merge kept main's subtask-marker fixes plus this branch's `constructed-board-priority` case; re-run 0 FAIL / 72 PASS, the branch's own six pre-existing subtask failures now resolved. Full recapture (528 entries) found 19 real content changes in five families this leg does not own (`constructed-board-empty-column`/`-extensions`/`-card-covers`/`-group-selection-controls`/`-record-detail`) — a stale `tools/bench/board-render-bench.ts` fingerprint from `d07f47e5`'s 11-file-scoped recapture, surfaced now because they share `bag: "file-view"` with `constructed-board`; confirmed real (not encoder jitter) via isolated `--only` recaptures, 10 of 19 opened and read across all five families. `css-lane.json` release entry names all 19. `npx tsc --noEmit` exit 0; `npx vitest run` 1023/1023 (100 files); `npm run lint` 172 (unchanged); `lint:tools` clean; `scan-comments` PASS; `touch-targets.mjs` x3 stable at fixture 279/constructed 1223, 0 new. |
| `npm run gate` (this pass) | **24 green / 1 red**, exit 1 — `screenshots-fresh` RED, confirmed present on a stashed pristine `origin/main` tip before this session's own edits (848 STALE fixture captures against `tools/screenshots/theme.css`, inherited from `d07f47e5`'s narrow recapture, never regressed or introduced by this reconciliation). Fixing it means recapturing ~800 files this leg does not own; left as an explicit open follow-up rather than silently claimed green — see `acceptance-criteria.md` AC-7. |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The `:hover` pointer-lift rule is still unproven by any fixture.** `.db-board-card:hover`
   (`styles.css:9257-9262`, `@media (hover: hover)`) is a real CSS pseudo-class rather than a
   class the renderer applies, so a static screenshot fixture cannot depict it; a device read is
   still owed. The other three states this limitation used to name — the empty-column slot,
   `is-dragging`, and `is-drop-target`/`db-board-drop-indicator` — are now depicted by the
   `board-empty-column` and `board-drop-language` scenarios, opened and read this session.
2. **The local-extension re-check and the drag-drop matrix re-run were never captured.** `tasks.md`
   T1's pre-rewrite baseline for WIP/visible counts, swimlanes, summaries, conditional formatting,
   multi-select, roving keyboard, edge auto-scroll, blank-space drop, touch long-press, and
   cover-target scheme safety was never recorded, so T1-T4 and the matching `goal.md` criteria
   stay open even though neither landed commit's added lines touch those code paths.
3. **Embedded database views were not separately captured or visually confirmed** in this pass;
   only the file-view board scenario was opened directly.
4. **Not operator-confirmed.** Release 1.4.5 has not shipped and the operator has not opened a
   board on device (`tasks.md` T8, `goal.md`/`acceptance-criteria.md` AC-8) — the only row that
   can close it.
5. **`constructed-board`'s avatar values are generic multi-select placeholders, not real names.**
   `tools/bench/board-render-bench.ts`'s re-keyed `"people"` column exercises the real avatar-stack
   render path (initials, per-name colour, overflow) for the first time, but its values still come
   from the bench's own generic capture-option words (e.g. "Backlog"/"Doing") rather than authored
   names — cosmetic, since the goal was proving the code path renders through production, not
   supplying realistic content. A dedicated name list would need excluding the column from the
   harness's generic option-rewrite step, which was out of scope for a "cheaply" opt-in fix.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:next-leg -->
## Next Leg

**Amendment 2026-09-04, operator directive (verbatim): "We should copy their board view 1:1 the
one from project manager."** The operator installed obsidian-pm 2.1.0 beside this plugin in the
iCloud vault and ran a side-by-side comparison; both landed legs above restyled our own
column/card composition from `kanban.css`'s visual intent rather than reproducing the reference's
DOM structure and class vocabulary, and that fell short of the comparison. `spec.md` REQ-007 and
`goal.md` D6 record the amendment and its supersession of the prior "rewrite, not copy"
disposition for structure and visual language; `acceptance-criteria.md` AC-9 and `tasks.md`
T9-T12 are the new closure gate.

**Today's observed baseline** (read directly this session, not carried over): `db-board-*`
classes, five `db-board-column` lanes at a 280px default width (`getBoardColumnWidth`,
`board-renderer.ts:1699`) — not the 320px the amendment's dispatch named, a discrepancy flagged
rather than silently corrected — each rendering a priority strip, parent chip, title-row chips
and a meta grid.

**Plan for the next leg pair**, red first:
1. **T9** — write a DOM-structure parity test walking the reference's
   `KanbanView`/`KanbanColumn`/`KanbanCard` output shape; observe it fail against today's renderer.
2. **T10** — `cli-devin` leg: port the three reference files' DOM structure and class vocabulary
   1:1 onto `board-renderer.ts`, mapped to `RowData` (card identity stays `RowData.file.path`,
   REQ-003 unchanged).
3. **T11** — `cli-codex` leg: copy `kanban.css` verbatim where its rules apply into the
   `css-lane`-held `styles.css` §17 BOARD VIEW section (MIT notice attached to the copied block)
   and update the screenshot fixtures; local extensions (WIP, swimlanes, summaries, cover images,
   path-keyed batch order, touch-mode menus) move behind a new default-off setting.
4. **T12** — a fresh in-runtime verifier (not T10/T11's own report) reads the recaptured
   screenshots side by side with the reference's own screenshots or the operator's vault
   comparison, and re-runs T9's parity test to green.

No implementation has landed for this leg yet; this section documents the amendment and its plan
only.

**2026-09-04, T10 landed + T12 fresh-verified (this session).** `cli-devin`'s T10 leg ported
`KanbanView`/`KanbanColumn`/`KanbanCard`'s DOM structure and class vocabulary onto
`board-renderer.ts`'s default (no-setting) render path — `pm-kanban-view`/`pm-kanban-board`/
`pm-kanban-col`/`pm-kanban-cards`/`pm-kanban-card`, verbatim helpers (`getReferenceDragAfterElement`,
`stringToColor`) under an MIT notice, and local extensions moved behind a new default-off
`ViewConfig.boardExtensionsEnabled`. T9's parity test (18 tests) ran red 18/18 against the
pre-port renderer, green 18/18 after.

This session is the T12 fresh in-runtime verifier — a session that ran neither T10 nor T11 — and
found one P0 correctness gap in the landed port: the card's dragstart handler wrote `CARD_MIME`
but never `CARD_FROM_GROUP_MIME`, so every real drag's `fromGroup` read back `undefined`. Because
`isSameBoardGroup(undefined, groupKey)` is false for any real (non-empty) group, every drop —
same-column included — was misclassified as cross-group, and because `moveCardAndOrder`'s own
`fromGroup != null` guard was also false, `groupUpdates` stayed empty and
`moveRowWithGroupUpdatesAndPosition` was never invoked. Net effect: a real cross-column drag
never actually moved the card's status field (only its position), and a real same-column drag
spuriously reordered the row to the end of its group. This was invisible to the existing test
suite because its two drop-transaction tests build a synthetic `dropEvent(path, fromGroup)` that
injects `fromGroup` directly into the drop event, bypassing the dragstart handler that a real
browser drag actually depends on. Reproduced with a real dragstart-then-drop cycle on one shared
`DataTransfer` double (two new tests in `board-renderer-parity.test.ts`), fixed with a one-line
addition (`event.dataTransfer?.setData(CARD_FROM_GROUP_MIME, group.key)` beside the existing
`CARD_MIME` write, `board-renderer.ts:415`), and both new tests plus the full 20-test parity suite
now pass. Full detail under `tasks.md` T10/T12.

This session also found the `board/file-view`/`board/embed` render-assertion harness's armed
negative control (`RENDER_READ_CONTROL=per-item`) had gone silently inert against the new default
render path: its seam wraps `applyConditionalFormat`, a local-extension-only call the reference
card path never reaches (conditional formatting is itself one of the extensions REQ-007 gates
off by default), so the armed run read 1 layout read — the same as disarmed — instead of
reddening. `tools/live/render-assertion-harness.ts` gained a second, board-specific seam
(`armBoardReferenceCardRead`, wrapping `getColumns`, the one bag member the reference card path
does call once per card) so the control is meaningful again; armed reads now go red at 1601
against the bound of 8, the same number the control produced before the port. The harness's
`boardAssertions` structural probe was also repointed from `.db-board-card`/`.db-board-column` to
`.pm-kanban-card`/`.pm-kanban-col`, since the default board no longer emits the former.

Screenshots were recaptured (detached, two full runs — the first discarded after a scratch
manifest-formatting mistake). The 4 `constructed-board-*` captures (the production `BoardRenderer`
mounted through the harness, not a hand-written fixture) changed content and were opened and read
in both themes and both device widths: the board now paints as unstyled, top-to-bottom flowing
plain text — group labels in their inline status color, then each card's title, `Sub` chip text,
hours, and due date, with no column layout, no card boundary, and no chip styling, because no
stylesheet rule yet targets the `pm-kanban-*` classes. This is the expected shape until T11 lands
the CSS, not a regression. The 5 hand-written board fixture captures (`board-view`,
`board-subtask-tree`, `board-empty-column`, `board-drop-language`, `board-mobile`) were confirmed
byte-and-pixel-unchanged — they still depict the old `db-board-*` markup by design, per this
leg's explicit instruction not to touch them; that rewrite belongs to T11. 13 further captures
moved bytes only (pre-existing PNG-encoder nondeterminism across a full recapture, not content
changes) and were restored to their committed bytes; `screenshots/manifest.json`'s stale `bytes`
fields for those 13 were corrected to match. A new release entry was appended to
`tools/lane/css-lane.json` naming the 4 real content changes (no stylesheet edit — `baselineHash`
unchanged); `check-lane` exits 0. `node tools/live/evidence.mjs --check-all` found
`capture-device-parity.json` stale against the new manifest hash, re-ran
`tools/live/capture-device-parity.mjs` (PASS), then 16/16 fresh. Full verification this session:
`tsc --noEmit` 0; `npx vitest run` 981/981 (98 files, includes the 2 new drag/drop regression
tests); `npm run lint` 172 problems (159 errors, 13 warnings), unchanged from the pre-session
baseline — `board-renderer.ts` still carries its 5 pre-existing problems, the parity test file 0;
`scan-comments` PASS; `npm run gate` 25 green / 0 red, exit 0 read directly (not through a pipe).

**Not closed by that session:** T11 (the `cli-codex` CSS leg) had not run, so the
visual-language/density/column-width half of T12's evidence bar had no styled capture to compare
against the reference yet — only the structural/class half was verified. T8 (operator device
confirmation) remains the only row that can close the packet.

**2026-09-04, T11 landed (this session).** `cli-codex` had acquired the `css-lane` and started
this leg but died mid-edit, leaving `styles.css`, `tools/lane/css-lane.json`,
`tools/screenshots/scenarios/{core,shared,shared.test}.mjs` and
`src/views/board-renderer-parity.test.ts` uncommitted and unverified. This session read that
diff, completed it, and closed T11.

`kanban.css` was copied verbatim where its rules apply (`styles.css:8909-9072`) under an MIT
notice, alongside the shared card primitives the reference's own `KanbanCard`/`KanbanColumn`
compose from `table.css` and `widgets.css` (`pm-chip`/`pm-avatar`/`pm-progress` families,
`pm-kanban-card-title-row`), placed directly ahead of the superseded `db-board-*` block — which
stays untouched and live, since it's still what `boardExtensionsEnabled` renders. Coverage was
checked class-for-class: every `pm-kanban-*`/`pm-chip*`/`pm-progress*`/`pm-avatar*` class the
default render path emits (38, grepped from `board-renderer.ts`) resolves to a rule; only
`pm-chip-label` carries none, which matches the reference (it inherits from `.pm-chip` there too,
by the same design).

Two real gaps in the inherited copy were found and fixed, not just noted. `.pm-dragging{opacity:
.5}` was missing entirely — the renderer adds this class on dragstart (`board-renderer.ts:418`)
but the reference's `utilities.css` rule for it was never copied, so a dragged card never faded.
And `--pm-shadow-ambient` had been aliased to the same `--db-border-subtle` token as
`--pm-ghost-border`, collapsing two tokens the reference keeps deliberately distinct (the border
flips to a light tint in dark mode so it still reads against a dark background; the shadow stays
black-tinted, just deeper, because a shadow that goes light-tinted stops reading as a shadow) —
replaced with the reference's own light/dark split under the codebase's existing
`.theme-dark .note-database-container` idiom.

The five hand-written board fixtures were finished to the `pm-kanban-*` vocabulary (`cli-codex`
had this in flight). Reading the recapture caught one real fixture bug this rewrite introduced:
`subtaskBoardCard`'s progress track and fill used `<span>` where `board-renderer.ts:486-488`
actually builds `<div>`s, and a `<span>` ignores CSS `width`/`height` by spec — so every subtask
card's progress bar rendered as a flat, uncoloured line instead of a filled one. Fixed by
switching both elements to `<div>` and confirmed visually in the recapture (a 62% blue-purple
fill against the gray track, both themes, both devices).

Finishing the rewrite surfaced five further gaps, all downstream of the same
`db-board-*` → `pm-kanban-*` swap and all fixed in this session: an ESLint `no-unused-vars` pair
in a now-dead fixture option; a `var(--color-red)` fallback with no declared token in the capture
harness's stand-in theme (added, transcribed from the same extracted Obsidian app.css the
existing `--color-orange`/`--color-green` entries already cite); a `scan-option-tones.mjs` check
still keyed to the superseded `status-color-*` class convention on the board column title
(repointed at the still-live `db-board-column-title` the extensions-mode board still writes,
via a newly-exported shared primitive); five `tools/live/replay.mjs` pinned claims that measured
the old `db-board-*` fixtures by selector and so read as regressions the moment the fixtures
changed shape (rewritten to their `pm-kanban-*` equivalents — same intent, new selectors — all 28
claims now hold); and eight stale `tools/live/*.json` evidence artefacts (re-stamped against the
current tree). None of the five were board-rendering defects; all were checks written against a
markup shape T10/T11 intentionally retired for the default board.

`npm run gate` reached 25 green / 0 red only after all of the above; `check-lane` names all 28
content-changed captures. One capture pair (`field-icon-picker-desktop-{dark,light}`) moved
`pixelHash` on every recapture in this environment despite no code in this repository touching
icon-picker anything; an A/B — a fresh capture of committed `1c5f465` in a clean detached
worktree, in this same environment — reproduced the identical divergence from the committed
bytes, proving it is a pre-existing Chrome/OS rendering drift and not something this leg caused.
Restored to committed bytes rather than recommitted, consistent with how this lane already
handles out-of-scope capture drift. Full class-coverage table, token-mapping rationale, and the
five gate-lane fixes are in `tools/lane/css-lane.json`'s `038-board-kanban-port` release note
(2026-09-04T10:05); the same evidence is condensed under `tasks.md` T11.

**Not closed by this session:** T12's visual-language/density/column-width comparison still needs
a session that ran neither T10 nor T11, per its own evidence bar — this session ran T11 and so
cannot be the one to close it, even though the captures it needs now exist. T8 (operator device
confirmation) remains the only row that closes the packet.

**2026-09-04, T20-T21 landed (this session).** An external agent (devin) had left uncommitted
fidelity fixes on top of T10/T11's landing — palette-color token resolution, the unconditional
avatar stack, the parent-gated Sub chip, the badge icon span, a per-card priority strip,
milestone/recurrence chips and the due chip's near tier (T13-T19) — with a claim of `tsc` 0,
`vitest` 988 green, `lint` 172 = 172, and zero comment-hygiene violations. This session verified
every claim against the actual commands rather than trusting the note, read each fix line-by-line
against the reference source (`KanbanView.ts`, `dueChip.ts`, `utils.ts`), and found the claims
accurate but two reference rules still missing.

`KanbanView.ts:86-88` omits the priority strip for `medium`/`low` priorities by name — devin's
port painted the strip for any priority value, mapped or not. Fixed with
`isReferenceLowPriorityTier` gating `getReferencePriorityColor` on the resolved option name
(case-insensitive, also omitting "none" as a third non-urgent name a priority select commonly
carries), red first (`expected MockElement{…} to be null`, a "Medium" option still painting).
`utils.ts:80-83` suppresses due urgency entirely for a terminal task — devin's port computed
urgency from the date alone. Fixed with `isReferenceRowCompleted`, the same checkbox-column
completion signal `calendar-renderer.ts:2420-2425`'s `isRowCompleted` already reads, short-circuiting
`getReferenceDueUrgency` to "normal", red first (an overdue-but-complete row still painting solid
red). Both closed under `tasks.md` T20.

Reading devin's fixture and stylesheet diffs against the renderer surfaced three further gaps,
closed under T21. `tools/screenshots/scenarios/shared.mjs`'s `boardColumn`/`boardCard` still built
the badge without an icon span, painted `--col-color`/topbar/badge with the raw palette-name string
instead of the theme-aware token, and let the priority bar ride on the group's tone rather than an
explicit priority-bearing state — a pre-T13 shape the fixture rewrite had not caught up to.
Rewritten class-for-class, with a forced (not date-derived) priority-bearing demo card and near-tier
due chip in the flagship `board-view` capture so two pre-existing `tools/live/replay.mjs` claims
about those exact surfaces keep their original recorded values rather than needing renumbering.
`styles.css`'s copied `pm-kanban-*`/`pm-chip*`/`pm-avatar*`/`pm-progress*` rules carried no
`.note-database-container` scope, meaning a co-installed copy of the reference plugin (the operator
runs both) would cross-paint with this stylesheet through the shared class names; scoped every
selector under the container, verbatim declarations, one WHY comment at the block header. The
board's first column started roughly 56px from the container edge against the reference's 16px —
the container's own 24px padding plus the board's own 16px; zeroing the container's padding was
rejected because the toolbar (`.db-header`, a sibling inside that same container) relies on a
negative-margin bleed against that exact 24px value and would have misaligned for every board view,
so a matching negative margin on `.pm-kanban-board` alone cancels the inset without touching
anything the toolbar reads. The dead `.pm-content--kanban` rule (grep-confirmed unemitted since the
T10 port) was deleted.

All 28 content-changed captures (both themes, both devices where applicable) were read this
session: badge icon present, status-token colors legible in dark, Sub chip only on children, due
chip right-aligned with correct near/overdue styling, priority strips only on the deliberately
forced demo card, board flush at 16px, nothing else moved. `constructed-board`/
`constructed-board-subtask` (the real `BoardRenderer` at bench scale, not a hand fixture) showed
due chips resolving live against actual bench dates — direct proof the due-urgency fix runs
correctly outside the fixtures too. One gap found and deliberately left unfixed: the render-assertion
bundle's icon stub (`tools/storybook/obsidian-stub.mjs`) has no curated glyph for `circle-dot`, so
those two constructed captures show its generic ◆ placeholder instead of the real icon — named
rather than patched, since `circle-dot` is also used by three renderers outside this packet and
fixing the stub would move captures beyond REQ-007's scope. The CSS lane was acquired, edited and
released as holder `038-board-kanban-port`, naming all 28 captures. `npm run gate`
(`SURFACE_PHASE=038-board-kanban-port`): 25 green / 0 red — the evidence lane needed 8 artefacts
re-run to re-stamp against the new `styles.css` hash, all still passing or holding their documented
pre-existing baseline (engine-parity's 51 Chrome-vs-WebKit disagreements, unrelated to this leg).
Full verification: `tsc --noEmit` 0; `npx vitest run` 990/990 (98 files); `npm run lint` 172
problems (159 errors, 13 warnings), unchanged; `scan-comments` PASS.

**Not closed by this session:** T12 and T8 remain exactly as the T11 session left them — this
session touched neither the visual-language/density/column-width surface T12 needs a disqualified
session to avoid, nor an operator device.

**2026-09-04, T22-T25 landed (this session, in-runtime).** A T12 fresh-reviewer pass (a session
that ran neither T10 nor T11, per its own evidence bar) re-read the landed port against the
reference sources and surfaced four residual REQ-007 divergences that the class-vocabulary and
fixture-contract checks in T13-T21 had not caught. This leg closed all four under `tasks.md`
T22-T25, each reproduced as a failing assertion against the reference source before the fix. It
ran in-runtime rather than external-first because the external lane was occupied and the scope
was four bounded fixes; it is not itself the fresh T12 read, so T12 stays open below for the
visual-language/density/column-width comparison that row still asks for.

`styles.css`'s view-level flex/overflow/height rule (T22) targeted
`.note-database-container .pm-kanban-view` as a descendant selector, but
`board-renderer.ts`/`database-view.ts`/`embedded-database-renderer.ts` all add `pm-kanban-view`
directly onto the same element already classed `note-database-container` — never a descendant of
it — so the rule never matched, and `.pm-kanban-board`'s `flex: 1; min-height: 0` had no flex
parent to size against: a shorter column stopped at its own content height instead of stretching
to match its taller siblings, the dead space below the board T12's own fresh read did not have
words for but this session's before/after crop comparison against `HEAD`'s committed PNGs made
visible. Fixed by switching to the compound `.note-database-container.pm-kanban-view` selector —
the custom-property block two rules above it already combined both forms for exactly this reason.
Confirmed against `constructed-board`/`constructed-board-subtask` (the real `BoardRenderer`, both
themes): the `review`/`doing` columns (3 cards) now stretch to the frame bottom matching their
taller siblings. Two capture families show no visible change in that one respect, confirmed
unchanged both before and after this fix (not a regression): `board-mobile`/
`constructed-board-mobile` already stretched on both sides of the fix (mobile's fixed viewport
height gives the percentage chain a concrete basis regardless of this selector), and
`board-view`/`board-empty-column` (desktop, hand-authored fixtures) stretch on neither side
(their desktop capture context auto-sizes to content rather than a fixed viewport height, leaving
no percentage basis regardless of the selector) — both are pre-existing capture-harness sizing
characteristics, not something this fix could or should change.

The due chip's near tier (T23) was reachable in this port, but the reference's kanban call site
only ever passes a boolean (`KanbanView.ts:126` `overdue: dueUrgency(...) === 'overdue'`, then
`KanbanCard.ts:97` `props.overdue ? 'overdue' : 'normal'`) — the near tier lives in the
reference's `dueChip.ts` primitive and reaches only its table/list views (`TableRow.ts:138` does
pass the full three-tier `dueUrgency(...)` through), a deliberate reference design choice for
kanban specifically, not an oversight T19 missed. `getReferenceDueUrgency`'s near branch was
removed from `board-renderer.ts`, the fixture's `pmDueChip` helper, and `core.mjs`'s `board-view`
scenario (which had forced Sketch into the near tier purely to demonstrate it). T19's original
evidence had cited the primitive rather than the kanban card call site — the gap this task closes.

The subtask board-card fixture (T24) hard-coded the Sub chip on every card regardless of depth,
and defaulted its parent-line text to the literal column name `"Projects"` — coincidental with
this one scenario's own lane label — instead of the parent card's actual title
(`KanbanCard.ts:44-46,60-67`). `board-renderer.ts` itself already gated the real Sub chip
correctly (`subtaskNode?.parentId`, T15); only the screenshot fixture and its `core.mjs` callers
were wrong. Gated the chip on `depth > 0`, matching the parent-line gate already beside it in the
same template string, and removed the misleading default so callers must pass the real parent
title; `core.mjs`'s two child-card calls now pass `SUBTASK_FIXTURE_ROWS.parent.name`. Confirmed
against `board-subtask-tree` and `constructed-board-subtask` (both themes): the root card carries
no Sub chip, both children show the real parent's title on the parent line plus the chip.

The column badge (T25) always emitted an icon span from a fixed `REFERENCE_STATUS_ICON` constant,
but the reference only renders one when the status option itself carries an icon
(`KanbanColumn.ts:52-57`); its else-branch (`formatBadgeText`, `utils.ts:137-140`) is text-only
when no icon is set, which resolves to the label alone. Since this option model has no
per-option icon field, the faithful choice — re-reading the reference rather than repeating T16's
"always emit the default icon" reading — is the text-only else-branch, not a permanent stand-in
icon. Removed the span, the `setIcon` call, and the dead constant from `board-renderer.ts`; removed
the matching span from the fixture's `boardColumn`. Confirmed across every board capture read this
session (both themes): text-only badges throughout.

All 28 content-changed captures were recaptured and read, both themes: the empty column now fills
the column height as a drop target with no dead space below the board (constructed-board/-subtask;
element- and hand-fixture-mode captures unaffected as explained above), no badge icon anywhere, the
Sub chip appears only on children with the real parent's title on the parent line, and no orange
due chip anywhere. Two housekeeping restores, consistent with this lane's established handling:
three byte-only re-encode captures (`panel-record-detail-sheet-body-empty` x2,
`timeline-view-quarter-mobile-light`, pixelHash/layoutHash identical to `HEAD`) and the two
pre-existing `field-icon-picker-desktop-{dark,light}` Chrome/OS rendering-drift captures (already
documented as unrelated environment divergence by this lane's own prior releases) were restored to
committed `HEAD` bytes; their `manifest.json` entries kept the fresh capture run's
`sourceHashes`/`pixelHash`/`layoutHash` (only `bytes` corrected to the restored file's actual size),
matching `screenshots:verify`'s freshness check rather than reverting the whole entry to `HEAD`.
`tools/lane/css-lane.json`: acquired and released as holder `038-board-kanban-port`, naming all 28
content-changed captures (`check-lane` exit 0, "release names all 28 changed capture(s)"). The
evidence lane needed the same 8 artefacts this packet has re-stamped before (cascade-audit,
checkbox-appearance, checkbox-inventory, design-conformance, engine-parity, surface-census,
token-census, view-census) plus `capture-device-parity.json` re-run against the new manifest hash
— all pass or hold their documented pre-existing baseline. `npx tsc --noEmit` exit 0; `npx vitest
run` 996/996 (99 files); `npm run lint` 172 problems (159 errors, 13 warnings), unchanged from the
pre-session baseline; `node tools/naming/scan-comments.mjs` PASS; `npm run gate`
(`SURFACE_PHASE=038-board-kanban-port`) 25 green / 0 red, exit 0 read directly.

**2026-09-04, T26-T28 landed (this session, in-runtime — the external delegation lane was
occupied, scope bounded to this dispatch's four numbered items).** A fourth fresh T12 reviewer
(at `d896f90`, on top of T22-T25) confirmed structure, vocabulary, density and column width match
the reference and left four items: a P1 responsive-padding bug, a P2 fixture-coverage gap, two
stale documentation notes, and T12's own evidence bar naming a criterion this repo cannot meet.

`.pm-kanban-board`'s negative margin (T26) cancelled `.note-database-container`'s own inline
padding with a hardcoded `var(--db-space-8)` (24px); the `@media (max-width: 760px)` block drops
that padding to 12px without touching the margin, so below 760px the margin over-cancelled by
12px — measured 4px phone inset instead of the reference's 16px, right edge short by the same
12px. Fixed by routing both declarations through a new `--db-container-padding-inline` custom
property (default `var(--db-space-8)`), overridden to `12px` at the same breakpoint instead of
the padding shorthand being hardcoded in isolation — the margin now tracks whatever the padding
actually is at every breakpoint, proven by a new stylesheet-text test run red (stashed) then
green. Verified on the recaptured mobile PNGs by pixel-scanning the page-to-column colour
transition (device-px 40→64 in both themes) and reconciling the capture harness's own constant
16px `#shot` wrapper padding: exactly 4px before, 16px after, matching this reviewer's numbers.

No fixture or constructed capture showed the avatar stack, the milestone `M` chip or the
recurrence `R` chip (T27) — the renderer already built all three correctly (T14, T18); nothing
exercised the code paths. `shared.mjs`'s `boardCard` gained `r.milestone`/`r.recurring` chip
support and a real initialed multi-avatar stack (replacing a single-avatar stub that printed raw
`row.people` text) plus a `pmShortDate` helper so the due chip matches the renderer's "Mon D"
form instead of the fixture's long literal; `core.mjs`'s `board-view` Design column now forces
one card each for milestone, recurring and a 4-person stack (showing the `+1` overflow avatar).
Separately, `tools/bench/board-render-bench.ts` re-keys its one `"mixed"`-kind multi-select
column to `"people"` (no column added, no other name touched) so `constructed-board`'s real
`BoardRenderer` paints the stack too, not just the hand fixture. Four new tests prove all of it,
two run stashed-then-restored to confirm red first.

Two stale notes (T28): this file's own T21 entry and `tools/lane/css-lane.json`'s matching
release both still claimed the badge-icon span "genuinely uses" `.pm-kanban-col-badge-icon`
after T25 (closed earlier in this file) removed that span — both corrected with a dated
stale-as-of-T25 note; the rule stays in `styles.css` as part of the verbatim reference-CSS copy.
`core.mjs`'s `board-drop-language` note wrongly claimed a before/after insertion line neither the
reference nor the ported card-reorder path draws (the reference moves the dragged element itself;
the actual `db-board-drop-indicator` line belongs to the unrelated legacy `db-board-card` path this
scenario never depicts) — note corrected, the inert `dropPlacement` argument dropped.

T12's own evidence bar ("opens both sets of captures") cannot be met in-repo: the vendored
reference carries zero image files. Amended to two halves — a fresh session compares the
captures against the reference SOURCE (`kanban.css`/`table.css`/`widgets.css` and the composites)
with pixel measurements in-repo, AND the operator compares the two plugins side by side in the
vault where both are installed — recorded as a reversible-default orchestrator decision above
under Key Decisions, with the operator half tracked as its own never-tick row (37) in the parent
`../roadmap.md` §4 operator table rather than folded into an agent-tickable task. T12 itself stays
unticked.

All 28 content-changed captures were recaptured and read, both themes/devices: every board
capture's first column sits at 16px from the container edge, not 4px; `board-view` and
`constructed-board` show the avatar stack, the `M` chip and the `R` chip for the first time;
`board-subtask-tree`/`constructed-board-subtask` show short-form due dates; `board-drop-language`
shows only the column-level tint and the dragged card's own lift, no third-card markup. Two
pre-existing byte-only-noise captures (`field-icon-picker-desktop-{dark,light}`, this lane's own
prior releases already document the Chrome/OS re-encode drift) were restored to committed `HEAD`
bytes; their `manifest.json` entries kept this run's fresh `sourceHashes`/`pixelHash`/`layoutHash`
(only `bytes` corrected to the restored file's actual size), matching `screenshots:verify`'s
freshness check rather than reverting the whole entry to stale `HEAD` source hashes — an earlier
draft of this same release briefly reverted the full entry, which `screenshots:verify` correctly
flagged stale against the committed `styles.css` hash, caught and fixed before the gate re-ran.
`tools/lane/css-lane.json`: acquired and released as holder `038-board-kanban-port`, naming all
28 content-changed captures (`check-lane` exit 0, "release names all 28 changed capture(s)"). The
evidence lane needed the same 8 artefacts this packet has re-stamped before (cascade-audit,
checkbox-appearance, checkbox-inventory, design-conformance, engine-parity, surface-census,
token-census, view-census), all re-run against the new `styles.css` hash. `npx tsc --noEmit` exit
0; `npx vitest run` 1000/1000 (99 files, 4 new/extended in this leg); `npm run lint` 172 problems
(159 errors, 13 warnings), unchanged from the pre-session baseline; `node
tools/naming/scan-comments.mjs` PASS; `npm run gate` (`SURFACE_PHASE=038-board-kanban-port`) 25
green / 0 red, exit 0, read directly after the manifest-staleness fix above.

**Not closed by this session:** T12's amended two-part comparison — the in-repo source-pixel half
against `kanban.css`/`table.css`/`widgets.css` and the composites — still needs a session that ran
none of the board legs to perform that specific read; this session fixed the bugs and gaps a
fourth fresh T12 read found, which is not the same evidence T12's own (amended) row asks for, so
T12 stays open. The operator's vault side-by-side half is `../roadmap.md` §4 row 37 and is not
this repo's to close. T8 (operator device confirmation) remains the only row that closes the
packet.

**2026-09-04, T29-T30 landed (this session, in-runtime — the external delegation lane was
occupied, scope bounded to this dispatch's four numbered items).** A fifth fresh T12 reviewer (at
`c563f08`, ran none of the board legs) ruled T12's in-repo half MET — all fourteen carried-forward
elements matched the reference to the pixel, `board-renderer-parity.test.ts` re-run green 30/30,
the copied `kanban.css`/`table.css`/`widgets.css` block diffed mechanically against `styles.css`
(56 rules byte-verbatim, 3 documented deltas) — and left three P2 items plus the T12 tick itself.

Two of `theme.css`'s host stand-in tokens were missing (T29): `--color-red`/`--color-orange`/
`--color-green` existed, `--color-purple`/`--color-blue` did not, so the board's milestone (M) and
recurrence (R) chips — which set `--pm-chip-color` inline to `var(--color-purple)`/
`var(--color-blue)` (`renderReferenceChip`, never through a stylesheet rule) — were
guaranteed-invalid at computed-value time and painted with no fill in every capture that forces
one (`board-view`'s Adobe Creative Cloud/Sketch cards; `constructed-board`'s bench schema carries
no milestone/recurrence field, so it was unaffected either way). Transcribed light `#7852ee`/
`#086ddd`, dark `#a882ff`/`#027aff` from the installed Obsidian 1.13.4 `app.css` (extracted via
`@electron/asar`; the app's own `package.json` reads `1.13.4`, not the `1.13.7` the neighbouring
red/orange/green comments cite — read directly this session), same comment style as the existing
three. Proven red first: `pinned-values-baseline.json`'s `unsupplied` map pruned to the current
five-token reality (also dropping a stale `--color-green` entry the map still carried after
`theme.css` had already stood it in, an unrelated staleness fixed in passing since this session
was editing the same map), then `scan-pinned-values.mjs` run with `theme.css` stashed to its
pre-session state — FAIL, `--color-blue`/`--color-purple` both "not in the baseline" (a genuine
read at `styles.css:13290`/`:13299`, an unrelated formula-editor token chain); green after
restoring the edit.

No bench column was ever named "priority" (T30), so `getReferencePriorityColumn`'s case-insensitive
match never resolved for a production capture and the reference's card-top priority strip was
never photographed outside the hand-written `board-view` fixture's explicitly forced
`priorityColor` prop. `board-render-bench.ts`'s one mixed-kind `"select"` column (index 3) re-keyed
to `"priority"`, mirroring the existing people rename — no column added, count unchanged at 21.
`render-assertion-harness.ts`'s `applyCaptureOptions` was overwriting every select/status/
multi-select column, priority included, to a generic five-name capture palette that never matches
the reference's `medium`/`low`/`none` omission (`isReferenceLowPriorityTier`) — every card would
have striped instead of only some — so the priority key was excluded from that overwrite and a new
`applyCapturePriorityTiers` gives it its own four-tier `urgent`/`high`/`medium`/`low` palette,
cycling `CAPTURE_ROWS` (18) through it. Proven red first: a new `constructed-board-priority` case
in `constructed-state-assertions.mjs` asserted 10 of 18 constructed-board cards carry
`pm-kanban-card-priority-bar` (five urgent + five high rows of eighteen) — FAIL at 0 with both
files stashed to `HEAD`, PASS at 10/18 restored. Six unrelated `constructed-board-subtask`/
`constructed-timeline-subtask` marker failures in the same check file (subtask toggle/progress/
depth) were confirmed pre-existing at pristine `c563f08` `HEAD` before any of this session's edits
— out of this leg's scope, left unfixed.

All 11 content-changed captures were recaptured and read this session: `board-view`'s M chip reads
purple and R chip blue in both themes; `constructed-board`/`constructed-board-subtask` show a 3px
card-top strip on exactly the urgent/high-tier cards in every column and none on medium/low cards
— confirmed by pixel-sampling the backlog column's four tiers directly against the expected
50%-opacity `--status-color-fg-*` blend, since the strip is visually subtle at normal viewing size
(`styles.css:9083-9086`: `height: 3px; opacity: 0.5`) and easy to misjudge by eye alone. One
capture (`board-view-desktop-dark.png`) moved bytes only — identical `pixelHash`/`layoutHash` to
`HEAD` — restored to committed bytes, `manifest.json`'s `bytes` field corrected to the restored
file's actual size (`HEAD`'s own recorded `bytes` value was already 20 bytes off the committed
blob's true size, a small pre-existing inaccuracy, left alone). `tools/lane/css-lane.json`:
`styles.css` untouched, hash unchanged; a new release entry names all 11 content-changed captures
(`check-lane` exit 0). `npx tsc --noEmit` exit 0; `npx vitest run` 1010/1010 (100 files); `npm run
lint` 172 problems (159 errors, 13 warnings), unchanged from the pre-session baseline; `npm run
lint:tools` clean; `node tools/naming/scan-comments.mjs` PASS; `SURFACE_PHASE=038-board-kanban-port
npm run gate` 25 green / 0 red, exit 0, read directly.

`acceptance-criteria.md`'s AC-1 through AC-7 and AC-9 "Today" columns were refreshed to this
post-port state with file:line evidence this same session (AC-8 unchanged, still operator-only);
`tasks.md`'s T12 entry gained a dated note closing its in-repo half while leaving the operator half
(`../roadmap.md` §4 row 37) and T8 explicitly open.

**Not closed by this session:** the operator's vault side-by-side compare (`../roadmap.md` §4 row
37) is not this repo's to close, and T8 (operator device confirmation) remains the only row that
closes the packet.

**Reconciliation 2026-09-04, landing `worktrees/033-board-t12` onto `origin/main` (`a78000c`).**
Not a fresh T12 read — a git-landing pass rebasing the T29/T30 commits (`d07f47e5`,
carrying `c5c79390`) onto main's own advances since `c563f08` (the constructed-scenario families,
gantt behaviours, and a docs-only row-6 tick). Two files needed hand-merging beyond the mechanical
`tools/live/*.json -> main` / `screenshots/manifest.json` per-entry-by-owner recipe:
`constructed-state-assertions.mjs` (main's rewritten `runRenderAssertions` callback plus this
branch's `priorityBarCount`/`priorityBarTotal` fields, inserted rather than replaced — a
line-count mismatch, not a logic conflict) and `tools/lane/css-lane.json` (main's history plus
this branch's own T29/T30 entry appended, `baselineHash` unchanged since neither side touched
`styles.css`, confirmed by recomputing the hash directly against the merged file). A full
recapture then found 19 real content changes this branch does not own — see the Verification
table above for the root cause (a T30 fingerprint gap in five unrelated `file-view`-bag families)
and `tools/lane/css-lane.json`'s newest release for the per-capture account. The same recapture
also surfaced a pre-existing `screenshots-fresh` gate failure (848 stale fixture captures against
`tools/screenshots/theme.css`), confirmed present on a stashed pristine `origin/main` before this
session touched anything — not a regression this reconciliation introduced, and out of its scope
to fix; `acceptance-criteria.md` AC-7 now reads 24/25 rather than repeating the prior 25/25 claim
uncritically. Landed via `git merge --ff-only` from the primary checkout after this reconciliation
commit; the worktree was not removed.

**CLOSED by follow-up commit `349e22c4` (`043-constructed-capture`, 2026-09-04).** The debt this
entry named stayed open through the intervening 037/038 releases (each recapturing only its own
narrow scope, bringing the count from 848 down to 791) until a dedicated full recapture of all 528
entries refreshed every `sourceHashes` fingerprint. 8 captures moved bytes only — encoder
re-encode noise plus the established `field-icon-picker-desktop` Chrome/OS drift, confirmed
`pixelHash`/`layoutHash`-identical to `HEAD` via `pixel-hash.mjs` and restored to committed bytes
— zero moved real content. `npm run screenshots:verify`: 791 STALE -> 0. `npm run gate`: 25 green
/ 0 red, exit 0. `tools/lane/css-lane.json` carries the reconciliation release entry (`reviewed:
[]`, empty by construction — nothing this release moved for a person to look at). `AC-7` now reads
25/25, closed.
<!-- /ANCHOR:next-leg -->

---

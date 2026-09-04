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
    last_updated_at: "2026-09-04T08:20:00Z"
    last_updated_by: "board-1to1-t12-fresh-verify"
    recent_action: "T12 fresh-verify: fixed T10 drag/drop group-update gap, re-armed harness control"
    next_safe_action: "Dispatch cli-codex T11: copy kanban.css into styles.css, rewrite board fixtures"
    blockers:
      - "Not operator-confirmed: release has not been cut for this leg yet"
      - "T11 (CSS leg) has not run: the default board renders the reference structure unstyled; visual-language/density/column-width comparison is not possible until it lands"
      - "T8 (operator device confirmation) is the only row that closes the packet"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/board-renderer-parity.test.ts"
      - "tools/live/render-assertion-harness.ts"
      - "tools/lane/css-lane.json"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "038-board-kanban-port"
      parent_session_id: null
    completion_pct: 42
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
| **Completed** | Not yet — REQ-007's 1:1 leg pair is in progress: T9/T10 (structure/class port) and this session's T12 fresh-verify pass have landed; T11 (CSS leg) and T8 (operator confirmation) are open |
| **Level** | 2 |
| **Completion** | `tasks.md` 5/12 rows closed (T5-T7, T9-T10, 42%). The two pre-amendment legs' card-hierarchy match and negative-control criteria remain true in `goal.md` (unchanged this pass); the amendment's own 1:1-copy criterion is now partially evidenced — structure/class vocabulary confirmed by a fresh T12 session (this pass), visual-language/density/column-width comparison still blocked on T11. See "Next Leg" for the full 2026-09-04 account, including a P0 drag/drop bug this session found in T10's port and fixed. |
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
| `tools/lane/css-lane.json` | Modified | Release entry naming the 8 new plus 11 pre-existing changed captures; no stylesheet edit |
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

**Not closed by this session:** T11 (the `cli-codex` CSS leg) has not run, so the
visual-language/density/column-width half of T12's evidence bar has no styled capture to compare
against the reference yet — only the structural/class half is verified. T8 (operator device
confirmation) remains the only row that can close the packet.
<!-- /ANCHOR:next-leg -->

---

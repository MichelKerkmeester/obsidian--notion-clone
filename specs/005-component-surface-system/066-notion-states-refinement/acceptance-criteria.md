---
title: "Acceptance Criteria: Notion States Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "066 acceptance criteria"
  - "notion states closure gate"
  - "dwell criterion"
  - "chip criterion"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-06T16:50:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:50 rulings into AC-007 and added AC-009"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-008 is the operator's device read"
    key_files:
      - "src/views/toast.ts"
      - "src/views/database-view.ts"
      - "src/views/empty-state-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether the centred placement reads correctly on a handset — device-only, AC-008"
    answered_questions:
      - "Five of the seven criteria were already red on the tree at 38bba1e3"
      - "The operator held one destructive weight and split toast placement by form factor (18:50)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion States Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/066-notion-states-refinement`
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06

Every threshold below was **observed red on the tree at `38bba1e3`** while this packet was written,
with the `file:line` in the Verification cell. Five of the seven needed no failure invented for them.
No Notion number appears in any threshold: the digest states no device-pixel ratio, so this packet
adopts Notion shapes and behaviours and takes every number from the tree or from an ADR that says it
is an inference.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a `success` toast carrying an action, **When** 3000ms elapse, **Then** the card is still connected; **and Given** a plain `success` toast, **When** 2500ms elapse, **Then** it is gone; **and Given** an `error` toast, **When** any time elapses, **Then** it waits for the reader | A Vitest with fake timers importing the production `showToast`, asserting all four cells of the severity × action matrix (`src/views/toast.test.ts` "toast dwell matrix"). **Was red**: stashed `toast.ts`, the matrix test failed at 3000ms (0 children). **Green:** `ACTION_DISMISS_MS = 5000` selected on `options.action` (`toast.ts:68`, `:144`); 15/15 `toast.test.ts` pass, all four matrix cells including both `error` cells unchanged | Met | - |
| AC-002 | REQ-002 | **Given** a delete that throws, **When** the catch runs, **Then** `.db-toast.is-error` is rendered and does not auto-dismiss | An integration test in `deletion-undo.test.ts` (`Object.create(DatabaseView.prototype)` harness, `showToast` mocked) forcing `trashNote` to reject. **Was red**: stashed `database-view.ts`, `raisedToasts` held nothing. **Green:** the catch at `database-view.ts:8383` now calls `showToast({ severity: "error" })`; 18/18 pass, zero bare `Notice` calls in the failure path | Met | - |
| AC-003 | REQ-002 | **Given** the owned operation paths in `database-view.ts`, **When** the census is taken, **Then** the bare-notice count has fallen from its recorded start and every migrated site renders the toast | `rg -n "new Notice\(" src --glob '!*.test.ts' \| wc -l`. **Was red at 242.** **Green: 239** — the three owned `errors.deleteFailed` sites (`:3681`, `:8378`, `:8468` at packet-open line numbers) now call `showToast`, each proven to render by the AC-002 test's shape. **Now guarded going forward:** a permanent row in `tools/storybook/verify-placement.mjs` ("the owned bare-notice census has not grown past its recorded ceiling", in the `storybook:placement` gate lane) reads the same population every gate run and ratchets a ceiling of 239 — a temporary added line pushed it to 240 and the row turned red before being reverted (see `tasks.md` T012) | Met | - |
| AC-004 | REQ-003 | **Given** a board group whose relation was deleted, **When** it renders in a compact context, **Then** an inline chip appears with a warning icon, a label, a chevron action and `aria-live="polite"`, it never auto-dismisses, and its background resolves from a host token with zero hex literals | A render test on `renderInlineChip` (`empty-state-renderer.test.ts`, 4 cases) **plus a test that drives the production path** (`board-renderer-hierarchy.test.ts`, "board renderer stale-relation empty state", 4 cases: the real `BoardRenderer.render` against a mock DOM, given the same `group-relation-deleted` options `DatabaseView.renderBoard`/`EmbeddedDatabaseRenderer` already pass), plus a `styles.css` read for the background. **Was red twice**: `renderInlineChip is not a function`; and, once the method existed, the board still rendered no chip — `render`'s `emptyState` parameter was accepted and dropped (`board-renderer.ts:188`), so the shipped board answered a deleted relation with a blank strip. **Green:** the chip renders on the production path — `alert-triangle`, `role="status"`/`aria-live="polite"`, the reason's own chevron action wired through, no dismiss control; re-removing the four wiring lines turns the two production-path cases red again. 35/35 `empty-state-renderer.test.ts` and 9/9 `board-renderer-hierarchy.test.ts` pass. `.db-inline-chip`'s background is `color-mix(in srgb, var(--text-error) 10%, var(--background-primary))`, zero hex literals | Met | - |
| AC-005 | REQ-005 | **Given** `styles.css`, **When** the comment-excluded fast-band declaration census runs, **Then** it reads 0 | `grep -c "120ms ease-out" styles.css` (comment-excluded declarations) plus the permanent `motion-tokens.test.ts` guard. **Was red at 4** (re-located at `:204`, `:477`, `:7435`, `:22853` — drifted from the packet's `:200`/`:473`/`:7431`/`:22745`). **Green:** reads **1** (the new `--db-motion-fast-out` token definition, not a declaration) — 0 raw declarations remain; `motion-tokens.test.ts` updated and 7/7 pass | Met | - |
| AC-006 | REQ-004 | **Given** `055`'s `goal.md` §3 and `tasks.md`, **When** each load-bearing figure is re-derived from the tree, **Then** the document and the tree agree | Five restatements, each carrying a same-day `file:line`, re-derived 2026-09-07. Toast row now **239** (not the 242 this packet opened with — T006 landed first); item-9 row now **14** reasons, ticked; E4 row confirmed GREEN, ticked; motion row now **0** declarations. `tasks.md` T019's amendment and T020 ticked; **T003 deliberately left `[ ]`** — its own unclosed gap is untouched by this packet's scope, so reconciling it means confirming it, not ticking it | Met | - |
| AC-007 | REQ-006 | **Given** the two Notion findings that contradicted a landed Anytype ruling, **When** this packet closes, **Then** each carries the operator's ruling quoted verbatim with its date and time | **Both ruled 2026-09-06 18:50, already recorded verbatim in `decision-record.md` at packet-open** — this row's own status had not been refreshed to match. ADR-001 — *"Keep one weight"*: the single `danger` boolean at `src/views/modals/confirm-modal.ts:28` themed at `src/views/confirm-sheet.ts:69` holds, **0** lines of code. ADR-002 — *"Centre on phone, keep corner on desktop"*: the placement splits by form factor, the desktop corner at `styles.css:2724-2736` stays, and the phone half landed as T017 | Met | - |
| AC-008 | REQ-001 | **Given** the operator on a handset, **When** they delete a row and reach for Undo, **Then** the target is one-hand reachable at the rail's clamped width; **and When** iOS `Reduce Motion` is on, **Then** the skeleton shimmer stops and entrances snap inside the plugin's WKWebView; **and When** the centred stack renders on the same handset (ADR-002's 18:50 ruling), **Then** it reads as placed for the thumb rather than as a card pinned to the right edge | The operator device pass (`055` `tasks.md` T017), rows D-2 and D-1, plus the centred-placement read ADR-002 owes. **Still unverified, and unverifiable from this repository** — media-query behaviour inside a webview and one-hand reach at `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`) are exactly the class of fact the device pass owns. Only the operator closes this row | Unmet | - |
| AC-009 | REQ-007 | **Given** a phone viewport in the band `styles.css` carries (re-located at `:21053`, drifted from `:20945`), **When** the toast stack or the operation-result rail renders, **Then** the card is horizontally centred with computed left and right margins equal within **±1px** at 390px and at 430px; **and Given** a desktop viewport outside the band, **Then** both anchors are unchanged — the stack at `right: var(--db-space-5)` (`styles.css:2724-2736`), the rail at `right: 16px` (`:2714-2719`) | **Measured in Chrome off the shipped `styles.css`**, mounting the exact DOM `showToast` builds (`db-surface db-toast-stack` on `body`; the rail's single-slot host inside `.note-database-container`) and reading `getBoundingClientRect` after the 200ms entrance settles. **Was red twice over** (unchanged by this packet outside the band): −6px at 390px, 30px-vs-16px at 430px. **The arithmetic proof was also wrong about the rail**: `.db-toast` is `box-sizing: content-box`, so the band's `width: 100%` rendered the inline card 32px wider than its host — measured left **16px** against right **−16px** at 390/402/430, the card hanging off the edge the centring exists to square up. One declaration (`box-sizing: border-box`, beside that `width: 100%`) closes it. **Green, observed:** stack card and rail card both read left **16px** / right **16px** at 390px, 402px and 430px — a 0px difference, inside ±1px. Desktop at 1440px is unchanged: the stack keeps `right: 12px` at 384px wide, the rail `right: 16px`. **Now the permanent lane row named above, not a one-off:** `tools/storybook/verify-placement.mjs`'s "the toast band" rows (`storybook:placement` gate lane) mount the production `showToast` — the body stack and, separately, a `db-operation-result-rail db-surface` host built exactly as `showOperationResult` builds it — at 390/402/430px and once on desktop, reading each card's settled `getBoundingClientRect` every gate run. Four negative controls confirmed the rows go red on the exact regressions they guard: reverting the rail to `content-box` reproduced left 16px/right −16px at all three phone widths (T017's own reading); reverting the stack's phone-band centring reproduced the −6px/30px-vs-16px pre-fix arithmetic; widening the desktop stack and moving the desktop rail's `right` each turned only their own row red. All four were restored and re-verified green (see `tasks.md` T012) | Met | - |
| AC-010 | REQ-008 | **Given** the Undo toast on the phone presentation, **When** its current dwell is measured against Notion's own undo-toast dwell (~5s per the reference, or the documented assumption if no timed reference capture exists under `screenshots/notion`/`screenshots/anytype`), **Then** a threshold is set and the toast lane proves it red before any change and green after, with an operator device row left unticked | Neither reference tree carries a timed manifest row (a still cannot show a duration), so ADR-005 records the number chosen. `ACTION_DISMISS_MS` was 5000ms (ADR-003's own inference), confirmed live on the release the operator tested; a dated 2026-09-08 report — "toast like the undo toast stay too long on screen" — is stronger evidence than the original inference, so the budget is cut 30% to 3500ms. Toast lane rows added to `tools/storybook/verify-placement.mjs` ("the Undo toast clears within its shortened budget…", "…is still up shortly before its budget elapses") drive the production `showToast` call with real timers on the phone viewport; run red against the pre-fix 5000ms constant (`1 card(s) present at 3900ms`, `EXIT:1`), green after (`EXIT:0`). `toast.test.ts`'s dwell matrix moved its checkpoints the same way and was confirmed red against the reverted constant, then green restored. No operator device row ticked | Met | - |
| AC-011 | REQ-009 | **Given** the toast's close control on the phone presentation, **When** measured with `tools/live/touch-targets.mjs`, **Then** it exposes a 56×56px hit area with the visual glyph size unchanged (unless the Notion/Anytype references say otherwise), red-first against the current size | Current size recorded before the fix: the close button's own box is 18px wide by 29-30px tall (18px from its own padding around a 14px glyph; the height comes from the host's own bare-`<button>` rule, `tools/screenshots/host-bare-controls.css`) — `node tools/live/touch-targets.mjs --json` names it explicitly. `tools/live/touch-targets.mjs` cannot measure a pseudo-element's inset, so ADR-006 gives `.obnotion-toast-close` the checkbox's own idiom (`::before { position: absolute; inset: -19px; content: ""; pointer-events: auto; }`) and a matching DECLARED entry there; `tools/storybook/verify-placement.mjs`'s toast lane proves the real number instead. Red before the fix (`box 18x30 plus a ::before inset of top NaN right NaN bottom NaN left NaN computes to NaNxNaN`, `EXIT:1`), green after (`box 18x30 … computes to 56x67`, `EXIT:0`), with the glyph confirmed unchanged at 14×14 and a paired `elementFromPoint` check confirming the wider invisible area does not reach the Undo button beside it. `tools/live/touch-targets.mjs`'s own fixture ratchet moved down, 171 to 169 | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Eight of the nine criteria are `Met`, each by a proof at least as strong as its own Given/When/Then
asks for: a fake-timer Vitest run against the production `showToast` (AC-001), a full integration
test against the real class prototype (AC-002, and the render-shape half of AC-003), a test that
drives the real `BoardRenderer` on the path the shipped view takes (AC-004), a browser measurement
off the shipped stylesheet (AC-009), and a direct textual read where the criterion is itself about
text or a static count (AC-003's census, AC-005, AC-006, AC-007).

Two of those eight moved at landing rather than during implementation, and both moved because the
weaker proof was hiding a real defect. **AC-004** had a producer no context called: `renderInlineChip`
passed its own tests while `BoardRenderer.render` accepted the reason and dropped it, so a board whose
group relation was deleted rendered a blank strip. A test on a producer that nothing invokes proves
the producer compiles, not the criterion, and this criterion's `When` is a board rendering. Four lines
wire the parameter that was already being passed. **AC-009** had been argued from arithmetic on the
rule's own constants, which is only as good as the assumptions behind it — and one was wrong: the
inline card is `content-box`, so `width: 100%` overflowed its host by 32px and the rail read
−16px on the right at every phone width the criterion names. The measurement found it; the
arithmetic could not have.

**AC-008** stays `Unmet` and is not this packet's to close — nothing in this repository can verify a
WKWebView's `Reduce Motion` behaviour or a thumb's reach on a real handset, so it waits on `055`
`tasks.md` T017 exactly as scoped.

**T012 landed at a later pass than the one that measured AC-009**, which is why the paragraph above
could still say a person had to go looking: the permanent browser-measured lane row now exists
(`tools/storybook/verify-placement.mjs`, `storybook:placement` gate lane) and would have caught the
`box-sizing` defect on its own. What stays consciously left out: the dwell budget's own lane row
(`goal.md`'s completion criterion asks for one; the fake-timer Vitest matrix against the production
`showToast` is the right strength for a millisecond-scale timer and a browser-driven row would either
wait out the real 5000ms on every gate run or measure nothing at all — see `goal.md` for the
reasoning), and the five refused Notion patterns in `goal.md` §4.
<!-- /ANCHOR:closure -->

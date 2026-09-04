---
title: "Goal: Properties Panel"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "002 goal"
  - "properties panel goal"
  - "properties panel directive"
  - "packet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/002-properties-panel"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Backfilled the house goal shape; criteria and evidence untouched"
    next_safe_action: "Operator opens Properties on a phone and reads every property name"
    blockers:
      - "Operator device confirmation is the only row left"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-002-goal"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
# Goal: Properties Panel

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Rebuild the properties panel on one row template so a property name is readable at any width and no rule can disagree with another about which child is which.

Repo `~/MEGA/Development/Obsidian Plugin`. **Runs fifth**, after `001` solves placement. Takes the `styles.css` lane at Phase 3, releases it at Phase 5.

**THE DEFECT.** The operator calls this the worst surface in the plugin. Property names are right-aligned and clipped past the panel edge, a trash icon sits on its own row per property, and the panel runs the full screen height.

**BUILD.** One row template with **named grid areas**, not a positional track list. Positional tracks are exactly what let two rules disagree about which child is which.

### Decisions

Frozen choices. Changing one is an amendment. Each is a restatement of this phase's own
directive above, not a new commitment.

| ID | Decision |
|----|----------|
| D1 | One row template with **named grid areas**, never a positional track list. Positional tracks are exactly what let two rules disagree about which child is which. |
| D2 | No desktop number is recorded before `000` repairs the desktop page. The desktop defect is a cascade defect, so on a stylesheet-less page it cannot appear at all and the harness reports a clean row. A number taken before that repair is discarded, not re-used. |
| D3 | The lane is taken at Phase 3 and released at Phase 5, after recapture at both viewports and 3, 12 and 40 properties, a named human sign-off, `008`'s replay re-asserting `000`, `004`, `005` and `001`, and cascade re-confirmation. |
| D4 | Cascade re-confirmation records the computed winner of **both** collapsed duplicate pairs, before and after. This packet exists because two such pairs were never reconciled; a third is not left behind. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**NO DESKTOP NUMBER BEFORE `000` FIXES THE DESKTOP PAGE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only. Your desktop defect *is* a cascade defect — 8 children into 7 tracks happens only because one selector hides the arrows and a later identical one shows them — so **on a stylesheet-less page it cannot appear at all** and the harness would report a clean row. B1, B2 and B6 are desktop reads. A number recorded before that repair is discarded, not re-used.

**LANE.** Take at Phase 3, release at Phase 5, and only after all four in order: (1) full recapture at both viewports and 3, 12 and 40 properties, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image, so it can never be this step; (3) **`008`'s early replay re-asserting `000`, `004`, `005` and `001`** against the tree you released, because they closed against a snapshot you just edited; (4) cascade re-confirmation — record the computed winner of **both** collapsed duplicate pairs before and after. This packet exists because two such pairs were never reconciled; do not leave a third behind.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked without
evidence in this folder or in a lane.*

- [x] Every laid-out child resolves to grid row 1; row height ≤ 36px both viewports. **Today: 8 into
      7, 52px.**
      **Both clauses now measured on the shipped renderer at both viewports, and the packet was wrong
      about each of them in a different way.**

      **The first clause was passing and was recorded as half a failure.** It was being read off
      `replay`'s *the properties row stays on one line* — was 2, recorded 1 — and the note here said
      "a recorded value that is not zero, so one child still wraps". That claim counts **grid
      tracks**, where 1 means one line and is the good answer. It was read as if it counted wrapping
      children, where anything above zero is a defect. The metric is sound: an overflowing grid does
      report its implicit track in computed `grid-template-rows`, verified against a two-by-two
      fixture that returns `20px 18px`. A track count and a defect count are simply not the same
      number, and nothing reconciled them.

      **The second clause's stated exposure does not hold, and that is now a measurement.** It was
      recorded undecidable because the tallest children were said to take `height: var(--input-height)`
      from the host stylesheet, which the harness never declared, so the row would read shorter here
      than on a device. The token is now declared — `--input-height: 30px`, read out of the installed
      app stylesheet rather than recalled — and it changed nothing: **0 of 240 captures moved
      `layoutHash`** and no check moved. The row's children are the plugin's own controls with their
      own heights. **The row measures 30px against the 36px ceiling on both desktop and phone**,
      where the recorded failing value was 52px.

      **What is asserted now.** Three rows per viewport, driven through `ColumnManagerRenderer`: a
      premise that a bare host-styled button really measures 30px on that page, one track with every
      laid-out child inside that track's band, and the 36px ceiling.

      **Two controls, because the clauses fail differently and one mutation would leave one
      untested.** Appending one child more than the track list has columns forces an implicit second
      row: track count **2**, one child outside the band, and the height goes to **47.69px** — all
      three rows red. Pushing a laid-out child 40px down leaves the track count at **1**, so a
      track-count-only check passes, while containment catches it — which is the whole reason the
      second clause sits beside the first. That control initially fired on nothing, because it had
      picked `children[1]` and the measurement filters zero-size children; it was a control failing
      for its own reason, and it is recorded rather than quietly repaired.

      **The premise row is what keeps this honest.** If the token were dropped again every height
      here would fall back to content and the ceiling would pass optimistically, for exactly the
      reason this row originally feared.
- [x] Declared track count equals laid-out child count at every breakpoint and condition. **Today
      desktop 7 vs 8, phone 8 vs 7.** **Sound by the audit's own reading** — the track lists and the
      `grid-column` claims are written in `styles.css`, so no host rule can move them.
- [x] Name element computed content width ≥ 120px desktop / ≥ 96px phone, right edge inside the panel
      content box. **Today the phone name track is 22px.** **Met, and held under replay** — *the
      property name takes the flexible track, not the type icon*, was 0, recorded 1, now 1. The
      floors are `minmax(120px, 1fr)` and `minmax(96px, 1fr)` in the stylesheet.
      **The recorded 22px is optimistic and the packet says so:** the three `auto` action tracks are
      host-padded wider on a device, so the name is squeezed harder there, not less.
- [x] Panel height ≤ min(560px, 70% of visible bounds) at 40 properties. **Today the inline maxHeight
      takes the full bounds.** **Measured at 40 rows, 2026-09-01.**
      → *a forty-property panel stays inside the cap its own criterion states*: `40 rows measure
      380px against a cap of 517 = min(560, 70% of the 738px visible bounds) … the panel declares
      max-height 380px and overflow-y auto, and its content wants 1296px — so what bounds it here is
      the cap, with the rest scrolling`.
      **Measured against the criterion's terms, not the stylesheet's.** The shipped rule caps at
      `min(560px, 100vh - 140px)` — the VIEWPORT — while the criterion says 70% of the visible
      bounds. They agree on a desktop and differ on a phone by the navbar and the safe-area inset,
      which is the surface this was written about. Reading the rule back to itself would have proven
      nothing; what keeps it inside is a separate phone rule capping at `min(380px, 100vh - 240px)`.
      **Watched failing** by widening that phone cap to the desktop one: `40 rows measure 560px
      against a cap of 517`.
      **The first version of this check passed for the wrong reason and is worth recording.** It
      built each row as a bare span and measured 40 rows at 380px — 9px a row, a height no property
      panel has ever had — comfortably under a cap it was never near. That is the "the harness made
      the content small" failure this packet's own audit names, reproduced while writing a check to
      answer one of its criteria. The rows now carry the children the shipped one has, and the
      content wants 1296px.
- [x] Delete is not a bare one-click target in the row's primary line. **Checked 2026-09-01.**
      The packet recorded this failing from a reading of the wiring — `deleteBtn.onclick = () =>
      actions.deleteColumn(col)`, one click straight to a delete. **What a click costs is decided one
      call deeper**, and reading a call site cannot see it.
      **`src/views/column-delete-confirmation.test.ts`** drives all four branches of the shipped
      `deleteColumn`. Every one interposes `confirmWithModal` before touching the schema, a refusal
      is a zero delta, and consent removes the column — the third case is why the first two mean
      anything, since an operation broken into doing nothing at all satisfies both.
      **Two reds, both watched.** Removing the plain branch's confirmation: `expected 0 to be greater
      than 0` — no question was asked. Keeping the confirmation but moving the mutation ahead of the
      await: `expected [ 'file.name' ] to deeply equal [ 'file.name', 'status' ]` — the property was
      gone while its question was still on screen. **The second is the one that matters**: it is the
      break a reading of the call site cannot distinguish from correct code.
      **The row itself is the other half**, and the unit test cannot see it. The placement lane now
      renders a real `ColumnManagerRenderer` row and clicks **every one of its 24 elements** once:
      → *nothing outside the trash control reaches the delete*: `2 reached deleteColumn and 0 of
      those were outside the trash control`. A click on the trash's glyph bubbles to the trash — one
      path reported twice, not two paths — so what separates a real second route is whether the
      element sits inside the delete control at all. Red with the row wired to delete: **18 of 22
      outside it**, the whole row destructive.
      → *the delete on a named row deletes the property that row names*: the row reads
      `"Status [status]"` and its delete was handed `"status"` — **asserted by the column object the
      action received, never by index**, which is AC-008's clause. Red with the delete pointed at
      `columns[0]`: `handed "file.name"`.
      → *the rest of the row's primary line offers exactly its four non-destructive actions*:
      `[editColumn, moveColumn, setColumnVisible, toggleColumnWrap]`. A **set**, because "nothing
      else deletes" is also true of a row where nothing else does anything. Red with the wrap toggle
      unwired: three of four.
      **What is still not closed here:** AC-009's mutation trace and AC-010's rename and reorder
      deltas. This row asked about delete, and delete is what was driven.
- [x] Plus the five stateful dimensions. **No mapping exists** for this packet. **Mapped 2026-09-01**,
      in `acceptance-criteria.md` §2b — a dimension → criteria → evidence table covering all five, so
      "covered" can be read off something instead of asserted.
      **Three already had evidence** and now have a row naming it: semantic identity is the delete
      that reaches the property its row names (`"Status [status]"` → handed `"status"`, red at
      `"file.name"`), action outcome is the model delta a click produces rather than the call it
      makes, and negative-control mutation is the four controls those rows already quote.
      **Resource ownership had no measurement here, and building it nearly produced a false
      defect.** The probe first reported **40 subscriptions outstanding after a close** — 4 per
      render across window, document and `visualViewport`, ten renders deep — which reads exactly
      like a leak. It is not one. The positioner releases itself when `schedule` finds its panel
      disconnected, so **one window resize collects all 40**.
      **A lazy release and a leak are indistinguishable until something fires**, so the check
      dispatches the event rather than asserting absence — asserting zero between renders would fail
      a correct implementation. Red with the self-release removed: `40 after a single window resize`.
      A second row pins the accumulation at exactly `4 × 10`, because a render subscribing twice is
      the one shape no amount of collecting takes back.
      **Transition trace is a re-render, not a schema mutation.** AC-009's full trace — add, rename
      and reorder with the panel open — and AC-010's rename and reorder deltas stay unmeasured, and
      the mapping says so rather than counting delete for all of them.
- [ ] The operator opens Properties on a phone and can read every property name. **Only the operator
      closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 10 sound / 2 dependent / 0 unknown.** The panel came through well,
because its layout is **written down**: the track lists, the `grid-column` claims and the
`minmax(120px, 1fr)` / `minmax(96px, 1fr)` name floors are all in `styles.css`, so no host rule can
move them. Track counts, grid areas, the name-width floor and the panel-height clamp are sound. **The
exposure is height.** *"row height <= 36px both viewports"* is decided by the tallest child, and the
tallest children are `.clickable-icon` buttons taking `height: var(--input-height)` from `app.css`,
which the harness does not load — the row measures shorter here than on any phone. The recorded 22px
name track is likewise optimistic: the three `auto` action tracks are host-padded wider on a device,
so the name is squeezed harder, not less. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

**LINE NUMBERS ARE HINTS, NOT ADDRESSES — AND HERE IT BITES HARDEST.** Every `styles.css:NNNN` below was correct on 2026-08-29; `000` then deletes dead blocks and `001` edits the file before you start. Your whole desktop argument is *which of two identical selectors comes later*, and the phone argument is the same shape. A stale number silently inverts that reading. Re-resolve both pairs with `rg -n 'db-mobile-reorder-controls' styles.css` and `rg -n '\.is-phone \.note-database-container \.db-column-manager-row' styles.css`, and **read the hits in order**. Record moved numbers old to new.

**ROOT-CAUSED, DESKTOP.** `styles.css:2036` hides `.db-mobile-reorder-controls`; `styles.css:18776` — same selector, later — sets `display: inline-flex`. Mobile-only arrows therefore render on desktop, giving the row **8 children against 7 declared grid tracks**. Measured: **row height 52px against a declared `min-height: 30px`**, trash button wrapped onto an implicit second row.

**ROOT-CAUSED, PHONE — AND IT IS NOT A COUNT MISMATCH.** Both phone rules (`16879`, `16995`) declare 8 tracks. `.db-column-drag` is `display: none` on phone (`16966-16976`), so **7 emitted children land in 8 declared tracks, shifting every child one position left** of what either rule intended. The rules' real conflict is track **order**, not count. That distinction changes the fix.

**ONE MEASUREMENT AND ONE INFERENCE DISAGREE — RESOLVE IT, DO NOT PICK.** The measured figure is a 96px track for the checkbox and **22px for the property name**. A static trace of the winning rule puts `minmax(96px, 1fr)` on the third laid-out child, which with the drag handle hidden is the **type icon**, not the checkbox. Confirming the ordinal mapping is a census deliverable. That diff **is** the bug.

**A THIRD REGIME NOBODY LISTED.** `actions.isReadOnly` suppresses the edit and delete buttons, so the row emits **8 children read-write and 6 read-only** — on top of the desktop/phone split.

**INVENTORY.** Enumerate every emitted child of `.db-column-manager-row` under each condition — read-only, required, file field, computed, phone, desktop — and diff **emitted count against laid-out count** per breakpoint. Count them separately; that gap is the defect.

**AC-007 WAS REWRITTEN.** It used to close on the information-architecture decision being *written down*. A document is not an outcome — you could argue for reading over editing, write it up, and still clip the name. It now closes on the primary line measured at 402px and 1440px: **0 controls past the panel content box, 0 needing horizontal scroll, the name at its width floor, and anything behind an overflow reachable in one interaction.** Write the decision, then prove it.

**SIX CRITERIA HAVE NO FAILING NUMBER YET.** AC-007 to AC-012 are `Blocked`, not `Unmet`: the doctrine makes a criterion invalid until it has failed on the current tree with the number written down, and these cells are empty. `acceptance-criteria.md` names, for each, exactly what produces the number and at which phase. **Do not invent one.** In particular, Phase 2 may not choose a primary line before Phase 1 has measured today's.

**SCREENSHOTS.** Both viewports at 3, 12 and 40 properties.
<!-- /ANCHOR:log -->

---
title: "Goal: Mobile Touch Semantics in the Table"
description: "What would make phase 012 worth having done, and the criteria that decide it."
trigger_phrases:
  - "012 goal"
  - "mobile touch semantics goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/012-mobile-touch-semantics"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Gate criterion closed on a quiet 19-green run; the scrim control is now a gate lane case"
    next_safe_action: "The operator drags a finger across the table on device"
    blockers:
      - "screenshots-fresh red: captures stale against another phase's styles.css edit"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-012-goal"
      parent_session_id: null
    completion_pct: 60
    open_questions:
      - "Phone title rename has no reachable entry point; acceptable or not"
      - "Should AC-8 stay keyed to the whole-tree gate or be split into phase-owned legs"
    answered_questions:
      - "Phone row height 44px declined by the operator; density outranks it"
---
# Goal: Mobile Touch Semantics in the Table

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A touch in the table means what a touch means, rather than replaying the desktop
pointer grammar. A tap edits the cell it lands on; a tap on the row's main item opens the record
sheet; and a finger never paints a selection range the operator did not ask for and cannot act on.

The reported defect was 14 cells selected by a finger — seven 34px rows by two columns, measured off
the image rather than counted by eye. A painted range on a phone is not merely useless: it is a state
the user cannot see the extent of, cannot clear except by tapping elsewhere, and which changes what
the next tap does.

**The inventory changed the fix, which is why it came first.** The range was painted by **two taps,
not a drag**. There are **two** pointer owners, not three. Four column types already opened an editor
on tap. The record sheet already existed and was already reachable, through a 24px target. Each of
those would have sent a fix somewhere different.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The phone predicate belongs nowhere. `isMobileBottomSheet` and `isTouchDevice` disagree on a 700px pane, so input keys off the **per-event `pointerType`** instead. |
| D2 | A check must exercise the guard that does the work. AC-2 and AC-7 are measured in a leaf narrow enough that `isTouchDevice(row)` reads `true`, or they would pass without touching the guard. |
| D3 | Removals are recorded as removals, not folded into the description of what was added. |
| D4 | The 44px table row height is **declined**: density outranks it, and the cell clips its own overflow so a hit-area expansion is a no-op. Closed with a number; not a failure. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

A ticked criterion carries the harness check that closed it and that check's measured number, quoted
from the single run captured against a clean tree at `f64dd87` — `verify-placement: 220/224 geometry
checks passed, 4 red for a declared reason`. An unticked criterion carries the check that would
settle it and **no number**, because none ran.

- [x] A tap never extends a range: exactly 1 cell, anchor equals focus. Was 16 cells across 8 rows by
      2 columns.
      → *a second tap picks one cell while a mouse still paints the range*: `tap then tap = 1 cell(s),
      anchor=note-8.md focus=note-8.md (the reported block is 14: rows 2-8 x 2 columns, measured off
      the screenshot); mouse+shift = 14 cell(s), anchor held at note-2.md; innerWidth=390`. The two
      baselines in play are different things and both are right: 16 is what the installed control
      paints across rows 2-9, 14 is what the operator's two fingers enclosed. `acceptance-criteria.md`
      §4.1 reconciles them.
- [x] A mouse still extends at phone width: 24 cells, anchor held at `file.name`.
      → *shift-extend still works at 390px with touch reported present*: `mouse+shift across 8 rows x
      3 columns = 24 cell(s) (want 24), anchor=file.name; viewport=390x844 hasTouch=true coarse=true`.
      Measured with `hasTouch=true`, so it exercises the guard rather than passing beside it — D2.
- [x] The gesture reader routes real events: four values from one binding — rest `mouse`, after touch
      `touch`, after mouse `mouse`, pen `touch`.
      → *a table cell reads its gesture from the pointer event, not from the device*: `at rest=mouse
      after touch=touch after mouse=mouse after pen=touch — Platform says desktop and
      isTouchDevice(container)=true, so this answer came from the event; innerWidth=390`. All four,
      from one binding, with the device predicate deliberately disagreeing — which is what proves the
      answer came from `pointerType` and not from the device.
- [x] The tap truth table holds for 5 of 5 rows: title cell to the sheet, every other cell to its
      editor.
      → *a tap edits its column and the main item opens the record, while a click does neither*:
      `touch/title/editable=open-record touch/cell/editable=edit-cell touch/cell/readonly=select-cell
      mouse/title/editable=select-cell mouse/cell/editable=select-cell`. Five rows, five outcomes.
      → *the row's main item is the note name, or the first visible column when it is hidden*:
      `file.name in [file.name,income,expenses]=true; income in [income,expenses]=true; income in
      [file.name,income,expenses]=false; expenses in [income,expenses]=false; income in
      [nothing]=false`.
- [ ] The **whole** title cell opens the record, not the icon inside it: a press 40px left of the
      button resolves to `open-record`. Cell 169×34 against a button 24×24. **Routing clause met;
      outcome clause withdrawn 2026-08-31.**
      → *a tap anywhere in the title cell opens the record, and a click there still does not*: `press
      at x=151 (bare cell found 1px left of the button) hits td, and that is the cell itself=true;
      tap=open-record click=select-cell; cell=169x34 vs button=24x24`. → *the shipped title-cell
      handler opens the record from a real tap, and leaves the mouse alone*: `tap on bare cell at
      x=151 opened 1; tap on the link opened 1 more and navigated 0 time(s); a mouse click on the link
      opened 0 more and navigated 1 time(s); a tap on the open button opened 0 more, because the
      button owns that press`.
      **HARNESS-DEPENDENT on its second half — the outcome clause is withdrawn, the routing clause
      stands.** "Opens the record" is an outcome, and no record was opened. The check passes
      `setupTitleCellTap` an `openRecord` that is a push-to-array stub
      (`verify-placement.mjs:2199`), so `opened 1` counts a function call: no record sheet is
      created, mounted, placed or rendered anywhere in the run. This is the shape the harness
      inventory records as having already produced one false green, where `editFileName` was a
      counting stub and a check proved a double-tap reached the handler while no editor existed.
      **What survives is more than a bare counter and less than the criterion says.** The press is a
      real pointer event on a real `<td>`, `elementFromPoint` resolves to the cell rather than the
      button, and the stub records `r.file.path` — so the handler was reached, from the right point,
      with the right row. Routing and argument identity are measured. The record sheet appearing is
      not, and neither is anything downstream of it: the counterpart check in `010` shows that a
      sheet, once opened for real, brings a placement path and an `onResize = () => close()` binding
      that this stub never exercises.
      **The check to build.** Drive `openRecordDetailPanel` itself rather than a stub, and assert the
      outcome instead of the call: after the tap, exactly one `.db-record-detail-panel` is connected,
      it carries `db-mobile-bottom-sheet` at phone width, and its title resolves to the tapped row.
      Its control is a tap on a different row requiring a different title, so the check cannot pass by
      opening any sheet at all.
      **The 40px is not what ran, and it cannot be.** §AC-5 specifies a press 40px left of the
      button's left edge; the run locates bare cell only **1px** left of it, because the link covers
      the rest of the cell. AC-5's two threshold clauses — resolves to `open-record`, and
      `elementFromPoint` lands inside the cell rather than on the button — are both met at x=151, its
      negative control (the same press as `mouse` → `select-cell`) is inside the same check, and the
      companion check answers the link as well. The cell is answered at two points, not one. **The
      recipe's figure is stale; the behaviour is not** — either restate AC-5's measure at the
      dynamically located bare-cell point, or say plainly that the whole cell is covered by the pair.
- [ ] A tap does not fight the sheet: the cell centre resolves to the scrim with
      `pointer-events: auto`, negative control `{scrimCapturesPointer: false}` observed red.
      **First clause met.** → *while a record sheet is open the backdrop takes the tap, not the cell
      under it*: `backdrop=present pointer-events=auto inset=0px; a press at the centre of a visible
      cell resolves to <div class="db-mobile-sheet-scrim">`.
      **The control is now in a run, and in the gate.** `sheet-teardown` carries "the backdrop's
      pointer contract, both directions": the default backdrop leaves the stylesheet's modal value
      standing, and `{ scrimCapturesPointer: false }` reads `none`. Both directions in one case,
      because "the backdrop is modal" also passes on a build where the option is ignored entirely —
      the opt-out is what proves the default is a decision rather than the only behaviour available.
      Observed red before green: with the option ignored, the opt-out reports `""` instead of
      `none` and the case fails.
      *The original record, kept:* `acceptance-criteria.md` §AC-6 records it as observed once,
      reporting `pointer-events=none ... resolves to <td>`, and §4.1 repeats the entry. No `control:`
      check for it appears anywhere in the captured run — the only two the whole run reports are
      `010`'s. A control observed once and written into prose cannot go red when the behaviour
      regresses, and going red on a regression is the only thing a control is for. The clause says
      "observed", which was honest at the time and is now the weaker half of the criterion.
      **The check to build.** Register the control as a standing check in `verify-placement.mjs`,
      beside its subject: apply `applySheetChrome(panel, true, { scrimCapturesPointer: false })`, call
      `elementFromPoint` at the same visible cell centre, and require the result to be a `<td>` while
      the scrim's computed `pointer-events` reads `none`. Report it on its own line, named `control:
      the scrim check reacts when the scrim stops taking pointers`, matching the two controls `010`
      already registers by name.
- [x] The long-press row menu survives: 0 at 100ms, exactly 1 at 600ms.
      → *a held press still opens the row menu and a tap still does not*: `100ms press fired 0
      long-press(es), 600ms press fired 1 (delay is 450ms); isTouchDevice(row)=true`. Exactly the two
      counts the threshold asks for, against the shipped 450ms delay.
- [ ] Every check was watched failing first on a deliberately broken tree, with the failing number
      recorded.
      **True for seven checks. Not for every check.** `acceptance-criteria.md` §4.1 tabulates AC-1
      through AC-7 — seven checks, seven controls installed, seven observed reds, including AC-1's
      `16 cells, rows 2-9 x 2 columns` and AC-6's `pointer-events=none ... resolves to <td>`. That
      section also carries its own correction of a number it had overclaimed, which is the record
      working as intended.
      **What it does not cover.** The captured run holds further checks attributable to this phase
      that have no row in that table and no recorded red: *the shipped title-cell handler opens the
      record from a real tap, and leaves the mouse alone*, and *the row's main item is the note name,
      or the first visible column when it is hidden*. Both belong to the §5.1 fix, and §5.1 states
      plainly that it "was verified by reading rather than taken on report" — so it was never watched
      failing, and the criterion says *every*.
      **The check to build.** Make provenance machine-checkable rather than prose. Have
      `verify-placement.mjs` register each check with its phase id and its recorded red baseline, emit
      both on every run, and add a gate step that fails when any check registered under
      `SURFACE_PHASE=012-mobile-touch-semantics` carries no baseline — so a check added without a
      control cannot land silently. Then install the two controls that are missing: unbind
      `setupTitleCellTap` in `table-record-peek.ts` for the embedded renderer and require the
      title-cell handler check to go red; and pin `isMainItemColumn` to return `false` and require the
      main-item check and the tap truth table to go red together.
- [x] The gate exits 0. **Met, on a quiet tree.** `npm run gate` -> `gate: PASS — 19 green, 0 red
      for a declared reason`, exit 0 read from `$?` rather than through a pipe.
      The reason this stayed open no longer holds: it was left because a whole-tree number read
      while four agents were writing to it describes no tree. This run was taken from a working tree
      with nothing outstanding but files another process owns, and the gate has since grown from 13
      lanes to 19 — `sheet-teardown`, `sheet-rebuild` and `list-window` among them. The
      `screenshots-fresh` red that blocked it was a stale-capture state, not a defect in this
      phase, and captures are current.
      **Finding — this criterion cannot be closed by this phase as written.** Its failing leg,
      `screenshots-fresh`, reported 204 stale captures with all 204 attributed to `styles.css` and
      none to any `src/` file (§4.2). This phase made no CSS edit and never held the lane. A per-phase
      criterion keyed to a whole-tree shared number is hostage to every other lane in the program: it
      goes red and green for reasons this phase neither causes nor can repair. §4.2 is right that
      attribution does not clear a red — the correct conclusion is that the threshold is scoped wrong,
      not that the phase owes a green.
      **The check to build.** Split the threshold in two. Keep `exit 0` for the legs this phase owns —
      `placement` filtered to `SURFACE_PHASE=012-mobile-touch-semantics`, plus `tsc`, `lint` and
      `unit` — and record the shared legs, `screenshots-fresh` and `css-lane`, as program-level, owned
      by whoever holds the lane and closed there. Run it once from a quiescent tree with a single
      writer, read `$?` of the unpiped command per §AC-8, and record the exit status together with the
      per-leg breakdown so a future red is attributable without re-deriving it.
- [ ] The operator drags a finger across the table and nothing gets selected, and a tap on a row's
      name opens that record.
      **Operator criterion. Stays open regardless of the numbers, per D3.** No harness check can close
      it, and one behaviour under it is measurable by nobody here: AC-6b — that an editor-opening tap
      does not scroll the table — needs a live Obsidian `App`, so it is recorded UNVERIFIED rather
      than claimed. The removals in §5.2 are in the same position: established by reading the
      handlers, stated at that strength and no higher.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**6 of 10 criteria closed against the captured `f64dd87` run. Three of the four still open are open
for reasons outside the shipped behaviour: a control that was observed but never registered, a
provenance claim no mechanism enforces, and a gate threshold scoped to a tree this phase does not
own.**

### Two things are recorded honestly rather than green

AC-6b — that an editor-opening tap does not scroll the table — is **UNVERIFIED**, because it is not
measurable without a live Obsidian `App`. It is not marked passed. And AC-8 is **FAIL**, not
"green with a footnote": the threshold asks for exit 0.

### Two behaviours this phase removes from a phone, recorded as removals

A tap on the note name no longer opens the note — the capture-phase handler resolves `open-record`
and stops the link's own handler. The replacement is the sheet's own header control, so the note is
one tap further away, not unreachable. A mouse is unaffected.

The title cell's rename editor now has **no reachable entry point at all** on a phone. Renaming is
bound to `dblclick` and to keyboard type-to-edit, and a phone has neither; routing through the sheet
does not recover it, because the sheet's title is bound to `dblclick` too, and the long-press row
menu has no rename entry. Whether that is acceptable is an open question, not a decision this phase
took.

### Harness-dependency classification, 2026-08-31

Every criterion re-asked as: *if this value came from the device instead of the harness, would the
check still pass — and could it still fail?* This phase drives real pointer events, which is the
strongest evidence in the packet, and the audit mostly confirms that. The exception is where a
driven gesture terminates in a stubbed action.

| Criterion | Class | Rests on |
|---|---|---|
| A tap never extends a range | SOUND | `nextCellRange` is a pure shipped function called with literal addresses; no stub, no computed style, no host chrome |
| A mouse still extends at 390px | SOUND | same function, and the guard is exercised with `hasTouch=true` rather than beside it |
| The gesture reader routes real events | SOUND — **the strongest check here** | four values from one binding on real pointer events, with `Platform` and `isTouchDevice` deliberately disagreeing, so the answer can only have come from `pointerType` |
| The tap truth table, 5 of 5 | SOUND as a truth table | `resolveCellTapAction` is pure and called with literal inputs, so it proves the mapping. That a real tap supplies those inputs is proven separately, by the main-item check and by the title-cell press |
| The whole title cell opens the record | **HARNESS-DEPENDENT — outcome clause withdrawn** | `openRecord` is a push-to-array stub at `verify-placement.mjs:2199` |
| A tap does not fight the sheet | open already | scrim geometry is plugin-declared (`inset: 0`, `pointer-events: auto`, `styles.css:222-229`), so the first clause is SOUND; the missing control is the recorded gap |
| The long-press row menu survives | SOUND | real timers, real pointer events, and the criterion is worded about the gesture firing rather than about what the menu then does |

**The pattern worth carrying to `000`.** Three of this phase's checks call pure shipped functions
with literal arguments and are unusually robust for exactly that reason: a pure function has no host,
no stylesheet and no chrome to depend on. Two others drive real events into stubbed actions, and
those are only as strong as the clause they are read against. The distinction is not "driven versus
undriven" — every one of these is driven. It is **where the assertion is taken**: on a value the
shipped code computed, or on a call the harness counted.

**What is not at risk here.** This phase reads almost no computed style, so the absent `app.css` costs
it little; and it reads none of the five variables `runtime-vars.css` pins away from production. Its
exposure is item 3 of the inventory, the stubbed actions, and that exposure is now stated per
criterion above rather than in general.

---

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Range no longer painted by touch | Shipped, verified | `tap then tap = 1 cell(s), anchor=note-8.md focus=note-8.md` |
| Desktop range preserved | Verified | `mouse+shift across 8 rows x 3 columns = 24 cell(s)`, with `hasTouch=true` |
| Title tap shared by both hosts | Shipped, verified by check; **never watched failing** | Its §5.1 fix was "verified by reading rather than taken on report" — no control, no recorded red |
| Scroll-during-edit | Unverified | Needs a live `App` |
| Scrim negative control | **Observed once, not registered** | §AC-6 records `pointer-events=none ... resolves to <td>`; no `control:` check exists in the run |
| Gate | Not re-run | Last observed exit 1 at 12 of 13; a shared-gate number against a four-writer tree describes no tree |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Row-checkbox range selection | The same defect one layer over; handed to `017` deliberately rather than absorbed |
| 44px row height | Declined by the operator with a number. Do not reopen as a defect |
| AC-8 is scoped wrong, not merely red | A per-phase criterion keyed to the whole-tree gate is hostage to every other lane: its failing leg is 204 stale captures, all 204 attributed to `styles.css` and none to any `src/` file. The phase can neither cause nor repair that. Attribution does not clear a red — but the right repair is to re-scope the threshold to the legs this phase owns, not to wait for a green it does not control |
| "Every check was watched failing first" is not true as written | Seven checks have a control and a recorded red in §4.1. At least two more in the same run do not. The gap is not sloppiness — §5.1 says outright that its fix was verified by reading — it is that the criterion says *every* and no mechanism enforces it. A check registered without a baseline should fail the gate |
| The 40px in AC-5 was never reachable | Bare cell exists only 1px left of the button, because the link covers the rest. The threshold is met at the point the run actually uses, and the companion check answers the link too, so the cell is covered at two points. The recipe's number is the stale artefact |
<!-- /ANCHOR:log -->

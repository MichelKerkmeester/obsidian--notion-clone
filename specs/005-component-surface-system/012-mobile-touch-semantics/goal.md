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
    packet_pointer: "005-component-surface-system/012-mobile-touch-semantics"
    last_updated_at: "2026-09-02T08:00:00Z"
    last_updated_by: "goal-audit"
    recent_action: "Derived completion recomputed from the criteria checklist"
    next_safe_action: "Operator drags a finger across the table on device"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-012-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Phone title rename has no reachable entry point; acceptable or not"
      - "Should AC-8 stay keyed to the whole-tree gate or be split into phase-owned legs"
      - "Should the section-level PHASE_CONTROLS attribution be extended to the other phases sections"
    answered_questions:
      - "Phone row height 44px declined by the operator; density outranks it"
      - "AC-5's 40px is restated at the dynamically located bare-cell point; the link covers the rest of the cell"
      - "A negative control that stays green is a finding: the cell clip defeats a mis-anchored band before the check sees it"
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
- [x] The **whole** title cell opens the record, not the icon inside it: a press left of the button
      resolves to `open-record` **and a record sheet is standing afterwards**. Cell 169×34 against a
      button 24×24. **The withdrawn outcome clause was rebuilt and now stands, 2026-08-31.**
      → *a tap anywhere in the title cell opens the record, and a click there still does not*: `press
      at x=151 (bare cell found 1px left of the button) hits td, and that is the cell itself=true;
      tap=open-record click=select-cell; cell=169x34 vs button=24x24`.
      → *the shipped title-cell handler opens a real record sheet from a real tap, and leaves the
      mouse alone*: `rows opened=note-5.md,note-5.md,note-9.md. Each open built the shipped panel: 3
      sheet(s), first one held "note-5.md" with title "34", 2 field row(s), box 390x189, bottom
      sheet=true, on screen=true; the control row opened "note-9.md" titled "99", different from the
      first=true; after closing, 0 sheet(s) and 0 scrim(s) remain`.
      **What changed, and why the earlier withdrawal was right.** The check used to hand
      `setupTitleCellTap` an `openRecord` that pushed a path onto an array, so `opened 1` counted a
      function call and nothing more — no record sheet was created, mounted, placed or rendered
      anywhere in the run, and the check would have gone on passing if `openRecordDetailPanel` had
      been deleted outright. It now drives `openRecordDetailPanel` itself and asserts the panel: the
      module's own `getOpenRecordDetailPath()` reports which record is held, the node is connected,
      it carries `db-mobile-bottom-sheet` at 390px, it draws its field rows, and its box is on
      screen. Each open is closed again, and the absence of a leftover sheet and scrim is asserted
      too, so this check cannot leave a surface standing for the probes below it.
      **Its control is the different row the withdrawal asked for.** Row 9 is wired to the same real
      opener and tapped once; its sheet must hold `note-9.md` and draw a different title. A handler
      that opened one fixed record every time satisfies every other clause, so without this the check
      would prove a sheet exists rather than that it is *this row's* sheet.
      **Watched failing twice, on two different lies.** With the opener replaced by the old stub the
      routing half is unchanged and the outcome half is empty — `first one held "null" with title "",
      0 field row(s), box 0x0 on screen=false`. With every open forced to row 5 the identity half
      goes — `the control row opened "note-5.md" titled "34", different from the first=false`. The
      routing clause passes in both, which is what makes the outcome clause the discriminating half.
      **AC-5's 40px figure is restated, not met as written.** §AC-5 specified a press 40px left of the
      button's left edge; the run locates bare cell only **1px** left of it, because the link covers
      the rest of the cell. The measure is hereby restated at the dynamically located bare-cell
      point: the cell is answered at two points, not one — the bare cell at x=151 and the link at its
      centre — and the pair covers it. That is the reversible reading of the two the earlier note
      offered, and it is taken rather than left open; the recipe's figure was stale, the behaviour
      was not.
- [x] A tap does not fight the sheet: the cell centre resolves to the scrim with
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
      **The standing check exists as of 2026-09-01.** The clause asked for the control to be
      *registered* beside its subject, and it now is: `control: the scrim check reacts when the
      scrim stops taking pointers` runs on every pass, applying
      `{ scrimCapturesPointer: false }` to the same panel and hit-testing the same cell centre.
      → `with {scrimCapturesPointer: false} the backdrop is present at pointer-events=none, and the
      same press resolves to <td>`. **Watched red** with the option ignored at the call site:
      `pointer-events=auto ... resolves to <div class="db-mobile-sheet-scrim">` — the pair stops
      disagreeing, which is precisely the build the opt-out exists to distinguish.
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
- [x] Every check was watched failing first on a deliberately broken tree, with the failing number
      recorded. **Met, and the prose was replaced by a mechanism.**
      **The enumeration was short, and that is the point.** `acceptance-criteria.md` §4.1 tabulated
      AC-1 through AC-7 — seven checks, seven controls, seven observed reds. The section had grown to
      **eleven** checks and nothing noticed; this criterion's earlier note named two of the four
      missing and missed the other two, because it was written by reading the doc rather than the run.
      **The four missing controls were installed and watched, 2026-08-31.**
      → *the row's main item is the note name, or the first visible column when it is hidden*: with
      `isMainItemColumn` cut to `colKey === TITLE_COLUMN_KEY` — the pre-fix answer the check's own
      comment describes — `income in [income,expenses]=false WANT true`.
      → *the shipped title-cell handler opens a real record sheet from a real tap*: twice, on two
      different lies. Stub restored → `first one held "null" with title "", 0 field row(s), box 0x0
      on screen=false`. Every open forced to one row → `the control row opened "note-5.md" titled
      "34", different from the first=false`.
      → *the long-press row menu offers a rename, and pressing it reaches the shipped editor*: with
      the entry not built, `3 menu entries [Open note, Duplicate record, Delete "36"]; a rename entry
      is MISSING and pressing it renamed 0 row(s)`.
      → *every pixel of a table row belongs to the row it looks like it belongs to*: with a 44px band
      centred on the cell instead of anchored to it, **and the cell's clip lifted** — `the cell owns
      28px of the 34px row`, `the last pixel above the boundary is still this row's=false`.
      **One control failed to go red, and that is evidence too.** The band alone left the check green:
      the cell clips its overflow, so the naive fix is cut back to the cell box before the check ever
      sees it. The check's comment claims exactly that, and the failed control is what confirms the
      claim. Only lifting both properties makes the mis-anchoring reachable, which means the surface
      is defended twice over rather than once.
      **The mechanism, so the next addition cannot land bare.** `verify-placement.mjs` now attributes
      the whole cell section to `SURFACE_PHASE = "012-mobile-touch-semantics"` and requires every
      check in it to carry a `PHASE_CONTROLS` entry quoting the red someone watched and naming what
      was broken to produce it. Attribution is on the **section**, not on each check, deliberately:
      per-check registration would let the next addition arrive unregistered, which is the failure
      being repaired. The inverse is enforced too — a baseline whose check name has vanished is
      reported, so a rename cannot quietly drop its provenance.
      **Watched failing, in both directions.** Renaming one baseline produces two reds in one run —
      `the 012-mobile-touch-semantics check "a held press still opens the row menu and a tap still
      does not" records the red it was watched failing at` and `the recorded red for "...doesn't"
      still belongs to a check in this run` — and the lane exits 1 rather than 0.
- [x] The gate exits 0. **Met, on a quiet tree, and re-run at 20 lanes.** `npm run gate` ->
      `gate: PASS — 20 green, 0 red for a declared reason`, exit 0 read from `$?` rather than through
      a pipe, on 2026-08-31 with this phase's own lane edits in the tree.
      The reason this stayed open no longer holds: it was left because a whole-tree number read
      while four agents were writing to it describes no tree. This run was taken from a working tree
      with nothing outstanding but files another process owns, and the gate has since grown from 13
      lanes to 20 — `sheet-teardown`, `sheet-rebuild`, `list-window` and `touch-targets` among them. The
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

**9 of 10 criteria are ticked. The one that is not is the operator row, which no harness can
reach.** The title-cell outcome clause was rebuilt against the real `openRecordDetailPanel` and the
provenance claim now has a mechanism behind it rather than prose.

*Corrected 2026-09-02.* This paragraph read "8 of 10" and named the scrim-control row as still open.
That row was ticked when its control stopped being prose: `control: the scrim check reacts when the
scrim stops taking pointers` is a standing case at `tools/storybook/verify-placement.mjs:2935`, and
`sheet-teardown` carries "the backdrop's pointer contract, both directions" at
`tools/live/sheet-teardown-harness.ts:355-392`. Both were confirmed by opening the files, not by
reading this paragraph.

### One thing is recorded honestly rather than green

AC-6b — that an editor-opening tap does not scroll the table — is **UNVERIFIED**, because it is not
measurable without a live Obsidian `App`. It is not marked passed.

*Corrected 2026-09-02.* This section also said "AC-8 is **FAIL**, not 'green with a footnote'". AC-8
was ticked afterwards, on the 2026-08-31 run that read exit 0 from `$?`, so the sentence contradicted
its own criterion and is withdrawn. **The scoping finding under AC-8 is not withdrawn and is worth
more than the tick:** a per-phase criterion keyed to the whole-tree gate stays hostage to lanes this
phase neither causes nor repairs, and `tools/gate.mjs` has since grown to **25** lanes against the 20
that run recorded. No gate run is claimed from the current working tree, which is dirty.

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
| The whole title cell opens the record | **Reclassified SOUND, 2026-08-31** | `openRecord` now drives the shipped `openRecordDetailPanel`, and the assertion is taken on the panel: `getOpenRecordDetailPath()` names the record, the node is connected and carries `db-mobile-bottom-sheet`, its fields are drawn, its box is on screen, and a second row is required to open a different record. The push-to-array stub it replaced is the exact shape this table warns about |
| A tap does not fight the sheet | **Reclassified SOUND, 2026-09-02** | scrim geometry is plugin-declared (`inset: 0`, `pointer-events: auto`, `styles.css:222-229`), so the first clause was always SOUND. The row read *open already — the missing control is the recorded gap*; the control is no longer missing, and the gap it recorded is closed by a standing case rather than by a sentence |
| The long-press row menu survives | SOUND | real timers, real pointer events, and the criterion is worded about the gesture firing rather than about what the menu then does |

**The pattern worth carrying to `000`.** Three of this phase's checks call pure shipped functions
with literal arguments and are unusually robust for exactly that reason: a pure function has no host,
no stylesheet and no chrome to depend on. One other drove real events into a stubbed action, and was
only as strong as the clause it was read against — until the stub was replaced by the shipped opener
and the assertion moved onto the panel it builds. The distinction is not "driven versus undriven" —
every one of these is driven. It is **where the assertion is taken**: on a value the shipped code
computed, or on a call the harness counted. Moving one check across that line is what closed it.

**What is not at risk here.** This phase reads almost no computed style, so the absent `app.css` costs
it little; and it reads none of the five variables `runtime-vars.css` pins away from production. Its
exposure was item 3 of the inventory, the stubbed actions; the one instance is repaired, and the
classification is stated per criterion above rather than in general.

---

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Range no longer painted by touch | Shipped, verified | `tap then tap = 1 cell(s), anchor=note-8.md focus=note-8.md` |
| Desktop range preserved | Verified | `mouse+shift across 8 rows x 3 columns = 24 cell(s)`, with `hasTouch=true` |
| Title tap shared by both hosts | Shipped, and now watched failing | The check drives the shipped `openRecordDetailPanel` and asserts the panel it builds. Two recorded reds: the stub restored (`held "null" ... box 0x0`) and every open forced to one row (`different from the first=false`) |
| Scroll-during-edit | Unverified | Needs a live `App` |
| Scrim negative control | Registered, and standing in two places | `sheet-teardown` carries "the backdrop's pointer contract, both directions" (`sheet-teardown-harness.ts:355-392`); the opt-out reads `none` and, with the option ignored, reads `""` and the case fails. `verify-placement.mjs:2935` runs `control: the scrim check reacts when the scrim stops taking pointers` on every pass, beside its subject |
| Gate | Re-run 2026-08-31 | `gate: PASS — 20 green, 0 red for a declared reason`, exit 0 read from `$?` rather than through a pipe |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Row-checkbox range selection | The same defect one layer over; handed to `017` deliberately rather than absorbed |
| 44px row height | Declined by the operator with a number. Do not reopen as a defect |
| AC-8 is scoped wrong, not merely red | A per-phase criterion keyed to the whole-tree gate is hostage to every other lane: its failing leg is 204 stale captures, all 204 attributed to `styles.css` and none to any `src/` file. The phase can neither cause nor repair that. Attribution does not clear a red — but the right repair is to re-scope the threshold to the legs this phase owns, not to wait for a green it does not control |
| "Every check was watched failing first" was not true as written, and the gap was wider than the note said | Seven checks had a control and a recorded red in §4.1; the section held eleven. The note named two of the four missing because it was written by reading the doc against itself rather than against the run. Four controls were installed and watched on 2026-08-31, and provenance is now machine-checked: `PHASE_CONTROLS` in `verify-placement.mjs` fails the lane when a check attributed to this phase carries no recorded red, and when a baseline outlives the check it belonged to |
| A negative control that stays green is a finding, not a dud | The band centred on the row left *every pixel of a table row belongs to the row it looks like it belongs to* green, because the cell clips its overflow and cut the band back to the cell box. The check's comment asserts that defence; the failed control is what confirms it. The red needed both the band and the clip lifted, which says the surface is defended twice |
| The 40px in AC-5 is restated rather than left open | Bare cell exists only 1px left of the button, because the link covers the rest. The measure is restated at the dynamically located bare-cell point: the cell is answered at two points, the bare cell at x=151 and the link at its centre, and the pair covers it |
<!-- /ANCHOR:log -->

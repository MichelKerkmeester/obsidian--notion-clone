---
title: "Goal: Sheet Reading Rhythm and Keyboard Avoidance"
description: "What would make phase 010 worth having done, and the criteria that decide it."
trigger_phrases:
  - "010 goal"
  - "sheet reading goal"
  - "keyboard avoidance goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/010-sheet-reading-and-keyboard"
    last_updated_at: "2026-09-02T23:15:00Z"
    last_updated_by: "reports-30-33-landed"
    recent_action: "Report 33 fixed in 00e2aa2; 1.4.2 release pending"
    next_safe_action: "Operator reads a record on the phone and taps a field"
    blockers:
      - "Only the operator's phone closes the last row; no harness here opens a keyboard"
      - "The resize path is a declared red: onResize closes the record sheet outright"
      - "Report 33 (iOS, 2026-09-02 21:24): fixed in 00e2aa2, release 1.4.2 pending, not operator-confirmed"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-010-goal"
      parent_session_id: null
    completion_pct: 92
    open_questions:
      - "Does the operator's handset shrink visualViewport or resize the window"
    answered_questions:
      - "The visual-viewport fallback fires: the shipped resolveKeyboardInset is called at two scales"
      - "The desktop four values are measured on the shipped panel: 26.84px, 2px, 0px none, right"
      - "The reposition loop released only on the next viewport event; close now releases it"
---
# Goal: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A record opened on a phone reads as label-and-value pairs, and the field being edited
stays visible when the keyboard opens.

It did neither. Values were pinned to the right edge, so the eye paired each value with the value
above it rather than with its own label. And the sheet is `position: fixed; bottom: 0`, docked to the
**layout** viewport, which a software keyboard does not change.

**Both halves were measured before either was designed**, which is the part worth keeping. The two
screenshots were luminance-thresholded per row band and decomposed into ink runs, turning an
aesthetic complaint into a shape: the Notion reference's value column **starts** at a fixed 154.7px
and ends ragged; the plugin's **ended** at a fixed 382.7px and started ragged across 51.0px.
Fixed-end against fixed-start is the signature of `text-align: right` against a fixed column, and it
named the defect precisely enough to fix. The keyboard mechanism was read out of Obsidian's shipped
bundle rather than inferred: the host declares `--keyboard-height` on `:root` and shrinks
`.app-container` with it, and the sheet is portalled to `document.body`, a **sibling** of that
container. The lever already existed and was always being written zero.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The host variable is primary and the visual viewport is a fallback, combined with `max()`. Anything else puts the sheet on a different number from the toolbar riding beside it. |
| D2 | The label gets a fixed 96px basis, not a minimum width. A minimum is a floor: a longer label still shoves the value column, which is the defect. |
| D3 | `min-height: 44px` is the one deliberate off-scale value, cited as WCAG 2.5.5 target size. |
| D4 | Where the project's scale and the design skill's default disagree, the project's wins — which is why the label stayed at 13px. |
| D5 | A criterion can fail a correct implementation. Two here were defective before they were met; check both directions. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

A ticked criterion carries the harness check that closed it and that check's measured number, quoted
from the single run captured against a clean tree at `f64dd87` — `verify-placement: 220/224 geometry
checks passed, 4 red for a declared reason`. An unticked criterion carries the check that would
settle it and **no number**, because none ran.

- [x] Value text starts on one column: left-edge spread ≤ 2px. Was 42.3px across 36 rows.
      → *every value starts in one fixed column*: `value text left-edge spread across 36 rows = 0.0px
      (want <=2; right-aligned values measured 42.3 here and 51.0 on the device)`.
- [x] The value column begins at ≤ 40% of sheet width. Was 84%; the reference measures 38.5%.
      → *the value column starts early, so a label and its value read as one line*: `value column at
      33.1% of sheet width (reference measured 38.5%; the device measured 81-94%)`.
- [x] Row pitch ≥ 38px and row height ≥ 44px. Was 28.8px and 26.8px.
      → *row pitch reaches the reference rhythm*: `min pitch=44.0px (reference measured 38.0, device
      28.0)`. → *a sheet row is a thumb-sized target*: `min row height=44.0px (WCAG 2.5.5 target size
      is 44)`.
- [x] A hairline divider, no gap between targets, value text ≥ 16px. Was no divider at all, a 2px
      gap, 13px.
      → *a divider separates each sheet row*: `border-bottom: 1px solid color(srgb 0.2 0.2 0.2 /
      0.4)`. → *no dead space between adjacent sheet rows*: `max gap between consecutive rows=0.0px`.
      → *value text clears the size at which iOS zooms an input on focus*: `value font-size=16px,
      --db-font-lg=16px`.
- [x] A 36-character label moves the value **box** ≤ 1px. Moved 115px.
      → *a long label truncates instead of moving the value column*: `value box left 129 -> 129px (a
      min-width label moved it 115px)` — zero movement, against a 1px allowance.
- [x] On a reported keyboard the sheet's bottom sits within 2px of `innerHeight − keyboardHeight` and
      its top stays on screen. Was 844 where 513 was wanted, top 84 with height 760 against 513
      available.
      → *the sheet clears the keyboard the host reports*: `sheet bottom=513 want=513 (keyboard covers
      513..844)`. → *a lifted sheet fits in the space the keyboard leaves*: `top=84 height=429
      available=513`. → *a declared keyboard height lifts the sheet clear of it*:
      `--keyboard-height:336px moved the sheet's bottom edge 844 -> 508 on an 844px screen (clearance
      336px)`.
      **Scoped to the reporting path, and only that.** The resize path is red in the same run — *the
      sheet survives the window resize a keyboard causes* stands `RED (declared)`: `one window resize
      closed the record sheet outright — openRecordDetailPanel registers onResize = close()`. On a
      host that announces its keyboard by resizing the window, this criterion's mechanism never gets
      to run. Which of the two the operator's handset does is the open question in the frontmatter.
      **HARNESS-DEPENDENT — tick narrowed to the reporting path, and the reporting path is the whole
      of it.** Both sides of the comparison are the harness's own constant: the check writes
      `--keyboard-height: 331px` and computes `want` as `innerHeight - 331` from that same `KEYBOARD`
      literal (`verify-placement.mjs:800`, `:819`, `:845`). That is the exact shape `022`'s AC-1 was
      withdrawn for. **The sheet is nevertheless not the bar, and the difference is in the source, not
      in the evidence.** `keyboardInset()` returns `max(host variable, innerHeight −
      visualViewport.height − offsetTop)` with a pinch guard (`popover-position.ts:547-561`), and the
      panel path re-runs it on every `visualViewport` resize and scroll
      (`popover-position.ts:284-285`, reaching `placeSheet` at `:201`). A host that never writes the
      variable still lifts this sheet; the bar, reading `var(--keyboard-height, 0px)` in CSS with no
      second source, never moves at all. **But the second source has never executed under test.** Both
      keyboard blocks set the variable and then dispatch a *synthetic* `resize` —
      `verify-placement.mjs:820` on `window`, `:4727` on `visualViewport` — without ever shrinking
      `visualViewport.height`, so the `observed` term computes 0 in every run this packet has
      captured. The branch that distinguishes this phase from the withdrawn one is argued from the
      source and measured nowhere.
      **A supply the inventory does not list.** The panel under measurement is `rhythmPanel`
      (`verify-placement.mjs:575`) — a hand-mounted `div.db-record-detail-panel` driven through the
      production placement path and the production `renderCardField`, but built by the check rather
      than by `openRecordDetailPanel`. It therefore carries none of that opener's lifecycle, and in
      particular not `window.addEventListener("resize", onResize)` with `onResize = () => close()`
      (`record-detail-panel.ts:200`, `:292`). The harness's sheet survives a resize the operator's
      sheet is destroyed by, so *the sheet returns to the floor when the keyboard closes* and *with no
      keyboard the sheet still sits on the viewport floor* both describe a surface that does not
      ship.
- [x] **AC-14's pinch-zoom guard now has a check that can fail. Built 2026-09-01, on the design the
      withdrawal specified.** Carrying it as a goal criterion at all was half the finding.
      **What was wrong.** *the visual-viewport fallback is guarded against pinch-zoom* evaluated
      `window.visualViewport.scale <= 1.01 && zoomed <= 1` where
      `zoomed = innerHeight − visualViewport.height − offsetTop`. In the harness `scale` is always 1
      and `visualViewport.height` always equals `innerHeight`, so the expression was
      `1 <= 1.01 && 0 <= 1` — two constants, true by construction, on every run for ever. It never
      called `keyboardInset`, never zoomed, and its own comment conceded that a viewport "cannot be
      pinched from script". It measured the harness's viewport identity and reported it as the guard.
      **What replaced it.** A viewport still cannot be pinched from script, so the answer is not a
      better browser trick. The decision is three numbers in and one out, and it is now exported as
      `resolveKeyboardInset(hostDeclared, layoutHeight, visual)` with the DOM reading left in
      `keyboardInset`. The lane check calls it with the **same** 336px shrink at two scales:
      `at rest it returns 336px, zoomed it returns 0px`. Its third call is the case the withdrawal
      did not name — with the host also declaring 336px it returns 336px **while zoomed**, because
      the guard belongs to the observed term and must not contradict a host that says a keyboard is
      open. Same input, three answers, and no constant among them.
      **Watched failing.** With the `scale <= MAX_UNZOOMED_SCALE` clause removed, the same check
      reports `zoomed it returns 336px` and the lane exits 1.
      **And the boundary is checked, which the browser check cannot reach.**
      `src/views/keyboard-inset.test.ts` — 9 cases: the guard's threshold from both sides
      (`MAX_UNZOOMED_SCALE` takes the shrink, a hair above it does not), a host declaration surviving
      a zoom, `max()` from either arm, a host with no visual viewport at all, a visual viewport
      taller than the layout viewport (reported during overscroll, and read as an inset it would push
      the sheet below the floor), and a scrolled viewport whose `offsetTop` would otherwise read as a
      100px keyboard. Removing the guard fails exactly the two cases that exist for it:
      `expected 336 to be +0`.
- [x] **AC-15 now has a check, and it passes.** `the keyboard inset falls back to the visual
      viewport when the host declares nothing` — with `--keyboard-height` removed and the visual
      viewport reporting a 336px shrink, `publishKeyboardInset` writes `--db-keyboard-inset: 336px`.
      Observed red first: with the `observed` term removed from `keyboardInset`, the same check
      reports `0px` against `336px`.
      `visualViewport` cannot be resized from a test, so it is replaced with a stub reporting the
      shrink a keyboard causes. What that leaves under test is the arithmetic that reads it — which
      is exactly the half a host cannot supply, and the half that was never exercised because every
      other keyboard reading in this packet comes through the host-variable branch.
      *The original statement of the gap, kept:* `acceptance-criteria.md` §3.1 states it plainly — *the fallback works on its own:
      with the host variable absent but the visual viewport shrunk, the sheet still clears the
      keyboard* — and nothing in `verify-placement.mjs` ever shrinks `visualViewport.height`. Every
      keyboard reading in this packet comes through the host-variable branch. Until AC-15 runs, the
      claim that this sheet is protected where `022`'s bar was not rests on reading
      `popover-position.ts:547-561`, which is real evidence and is not a measurement.
      **The check to build.** Chromium will not shrink the visual viewport from script, so drive the
      calculation rather than the browser: with `--keyboard-height` absent, call the inset function
      against a stub reporting `height: innerHeight − 331` at `scale: 1`, and require `placeSheet` to
      write `--db-mobile-sheet-bottom: 331px` and the sheet's bottom to land on `innerHeight − 331`.
      Its control is the same run with the stub reporting the full height, requiring `0px`.
- [x] Desktop keeps its four measured values — row 26.84px, right-aligned, 2px gap, no divider —
      identical before and after. **Measured on the shipped panel 2026-09-01; all four land exactly.**
      **What was missing.** Three of the four were measured nowhere in the captured run, and the
      fourth appeared only incidentally as `row [83..109.8] h=26.8` inside another phase's detail
      line — a check thresholded on editor height, centre offset and overhang, not on these four.
      The stylesheet corroborated the SCOPING claim in `acceptance-criteria.md` §4.3: every phone
      rule for this surface is written under `.db-record-detail-panel.db-mobile-bottom-sheet …`
      (`styles.css:9464`, `:9468`, `:9477`, `:9485`, `:9489`, `:9502`), which proves the phone rules
      cannot match a desktop panel. It did not prove the four values, because row height and the gap
      between rows are computed rather than declared.
      → *the desktop record panel keeps the four values 010 froze*, built through the shipped
      `openRecordDetailPanel` at 1440×900: `4 row(s) on a desktop panel (bottom sheet=false): heights
      26.84px (uniform=true); gaps 2px; 0 row(s) carry a bottom border, borders read 0px none …; the
      value box ends within 0px of the row's content right edge`.
      **The gap is measured between boxes, not read off `row-gap`.** A declared gap that a margin or
      a border eats is still a declared gap; what a reader sees is the space between one row's bottom
      and the next row's top, so that is the number taken.
      **The divider clause needed a real host value or it would have passed on nothing.** The
      plugin's hairline tokens are `color-mix` over `--background-modifier-border`, so with the host
      silent every border computes as `0px none` and "no divider" reports a pass against a stylesheet
      that declares one. The page supplies Obsidian's own dark-theme value, so `0px none` here is the
      stylesheet's answer rather than an absent variable. That trap is named in the harness beside
      the phone body that first hit it.
      **Every clause is separately falsifiable, checked one at a time.** Giving the same page the
      phone rules moves three of them at once — `bottom sheet=true: heights 44px; gaps 0px; 3 row(s)
      carry a bottom border` — which is also the clearest statement of how far apart the two hosts
      are. Right-alignment survives that control, so it has its own: with the value no longer filling
      its row, `the value box ends within 212.75px of the row's content right edge`.
      **The check to build.** In `verify-placement.mjs`, mount `.db-record-detail-panel` **without**
      the `db-mobile-bottom-sheet` class at 1440×900, building the rows through the same shipped
      `renderCardField` the phone case uses, and assert four computed values on
      `.db-record-detail-field` in one check reported as one line: `height` = 26.84px ±0.5;
      `text-align` on the descendant `.db-board-card-value` = `right`; the vertical gap between
      consecutive field boxes = 2px ±0.5; and `border-bottom` = `0px none`. One line, four values, so
      a phone rule that ever leaks to desktop moves all four at once and the check goes red for the
      reason it exists. Pair it with a negative control that adds `db-mobile-bottom-sheet` to the
      same panel and requires all four to move — the phone's own 44px, `left`, 0px and 1px.
- [x] The five stateful dimensions are covered: semantic identity, transition trace, action outcome,
      resource ownership, negative-control mutation. **Mapped and measured 2026-09-01, in that order.**
      **The mapping came first, because without it "covered" could not be read off anything.** This
      phase's `acceptance-criteria.md` carried sixteen criteria and assigned none of them to a
      dimension, unlike `002`, `005` and `008`. Its new §5 is a dimension → criteria → evidence table
      covering all five, so the claim is auditable instead of asserted.
      **Three dimensions already had evidence and now have a row naming it.** Transition trace: the
      keyboard sequence is driven and read at each step, floor 844 → lifted 508 with `top ≥ 0` →
      floor 844, so a check that read only the lifted state cannot stand in for it. Action outcome:
      the rename path reaches the editor rather than a counter, and criterion 9 reads the value
      **box** rather than its text rect, which is what made the first version pass against the
      defect. Negative-control mutation: five controls, each quoted.
      **Semantic identity had no measurement, and now has one plus its control.**
      → *a refreshed sheet still maps its rows to the record it was opened on*: `opened on "A.md",
      after a refresh the panel still holds "A.md"; the row is found by its column key rather than by
      index, its node was rebuilt=true …, and its text went "Income100" -> "Income250"`. Requiring
      the node to have been rebuilt is deliberate: a refresh empties and rebuilds, so asserting a
      surviving node would assert the opposite of what happens. What survives is the mapping.
      → *CONTROL a refresh naming another record closes the sheet rather than re-pointing it*:
      `refreshed with B.md while open on A.md: the panel now holds nothing and 0 panel(s) remain`.
      Without it, "the mapping survived" is satisfied by a panel showing whatever it was last handed.
      **Resource ownership had no measurement either, and the one built found a real leak.**
      It failed on its first run at `0 listeners before, 4 while open, 2 after`. The reposition loop
      tears itself down lazily — `schedule` notices a disconnected panel — and nothing schedules on a
      close, so between a sheet closing and the next resize or scroll that sheet's `resize` and
      `scroll` handlers stayed registered on `window.visualViewport`: one pair per closed surface,
      all firing on the event that finally cleared them. Bounded and self-healing, which is why it
      went unnoticed, and still a subscription outliving the thing it was for.
      **Fixed at the producer:** `releasePopoverPosition(panel)` is exported and called from the
      panel's own `close`, before the node is removed. → *a closed sheet leaves no viewport
      subscription and no node behind*: `0 before, 2 while the sheet was open, 0 after one keyboard
      cycle and a close … 0 panel or scrim node(s) remain`.
      **Named rather than swept:** the same lazy shape exists on the other anchored surfaces. They
      were not in this phase's scope, and what they need is now a function rather than a design.
- [x] **The check for report 33 goes red then green.** Fresh verifier, 2026-09-02, `00e2aa2`.
      Red: handle -1148px from the sheet's top, reachable=false, `db-record-detail-panel` owned
      the scroll. Green: `db-record-detail-scroll` owns it, 1173px overflow, handle 25px,
      reachable=true.
- [ ] The operator opens a record on the phone, reads every row as one line, taps a field, and still
      sees it.
      **Operator criterion. Stays open regardless of the numbers, per D3.** No harness check can close
      it, and the keyboard half least of all: no harness in this repository opens a software keyboard,
      so whether iOS shrinks `visualViewport` or resizes the window is decided on the device and
      nowhere else.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**10 of 11 criteria closed; the eleventh is the operator's and nothing here can close it. Not
operator-confirmed, and the keyboard half is mechanism-verified only.**

*Read "6 of 9 … two criteria that read as verified turn out to have no check behind them at all"
until 2026-09-02. Both figures were stale: the checklist carries eleven rows, and the two criteria
with no check — the desktop four values and the five stateful dimensions — were built and measured
on 2026-09-01, which is what their own entries above now record. The sentence is kept because the
audit that produced it is how the gap was found, and the tables below carried the old reading for a
day after the rows had moved.*

### Two criteria were defective before they were met, and this is where the program learned both shapes

One measured the value's *text* rect — an edge that right-alignment pins by construction — so it
passed against the defect and could never have gone red. The other set a threshold that **forbade the
layout being copied**: it capped the gutter between a label's last glyph and its value's first at
24px, and the reference's own gutters run 11px to 71px. The implementation was right and the
criterion was wrong. Both are rewritten and both carry controls.

### What is not claimed

No software keyboard was ever opened. The keyboard criteria drive the host's *reporting mechanism* at
331px, a value read off the operator's screenshot; they prove the sheet responds correctly to the
signal, never that iOS emits it. And `record-detail-panel.ts` still registers
`onResize = () => close()`: on a host that announces the keyboard by resizing the window, the sheet
is destroyed before any inset can apply. **Which of the two the operator's phone does decides whether
this half is finished or blocked.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reading rhythm | Shipped, verified | 5 goal criteria closed against the `f64dd87` run |
| Keyboard inset | Shipped, mechanism-verified | Closed for the reporting path; the resize path is a declared red |
| Desktop non-regression | Shipped, verified | Was **Claimed, unmeasured**. A check now mounts the panel through `openRecordDetailPanel` at 1440×900 and reports all four in one line — 26.84px, 2px, `0px none`, right — with a phone-rule control that moves three at once |
| Five stateful dimensions | Shipped, verified | Was **Claimed, unmapped**. `acceptance-criteria.md` §5 now maps dimension → criteria → evidence; semantic identity and resource ownership were built, and the ownership check found and closed a real listener leak |
| Operator confirmation | Open | — |

### Harness-dependency classification, 2026-08-31

Every criterion re-asked as: *if this value came from the device instead of the harness, would the
check still pass — and could it still fail?*

| Criterion | Class | Rests on |
|---|---|---|
| Value left-edge spread 0.0px | SOUND | `text-align: left` and the 96px label basis, both declared by this plugin's own rule |
| Value column at 33.1% | SOUND | same declarations; a ratio of two measured boxes |
| Row pitch 44.0px / height 44.0px | SOUND | `min-height: 44px` at `styles.css:346` and `:461`, plugin-declared |
| Divider, 0.0px gap, 16px value | SOUND | `border-bottom` and `font-size` declared on the phone rule |
| Long label moves the value box 0px | SOUND | `flex` basis declared; a before/after delta on one box |
| Keyboard clearance 513/513 | **HARNESS-DEPENDENT** | `--keyboard-height`, written by the check and read back as its own `want`. Narrowed above, not withdrawn: `keyboardInset()` has a second source the bar lacks |
| Pinch-zoom guard (AC-14) | **WITHDRAWN — superseded 2026-09-01** | Was two harness constants. Replaced by `resolveKeyboardInset(hostDeclared, layoutHeight, visual)`, three answers from the same shrink, plus `src/views/keyboard-inset.test.ts` — 9 cases, verified present |
| Fallback alone (AC-15) | **UNKNOWN — superseded 2026-09-01** | Was "nothing shrinks `visualViewport.height` anywhere in the repository". Still true of the browser; the arithmetic that reads it is now driven against a stub, observed red first |
| Desktop four values (AC-16) | **UNKNOWN — superseded 2026-09-01** | Was "no check". Measured on the shipped panel; each of the four clauses separately falsifiable |
| Five stateful dimensions | **UNKNOWN — superseded 2026-09-01** | Was "no check, no mapping". Mapped in `acceptance-criteria.md` §5 and all five measured |

*This table is dated 2026-08-31 and the four rows above it moved the next day. The old classes are
kept rather than overwritten because the classification is the finding — a criterion resting on a
harness constant is worth being able to look up after it is repaired, and losing that history is how
the same shape gets rediscovered a third time. Re-read 2026-09-02: the five SOUND rows are unchanged.*

**What this phase does not share with `022`.** The bar docks in CSS on `var(--keyboard-height, 0px)`
and has no second source, so a silent host leaves it where it was. The sheet's number is computed in
TypeScript as `max(host, observed)` and recomputed on every visual-viewport event. That is a real
structural difference and it is why five of this phase's six keyboard readings survive as narrowed
rather than withdrawn. **What it does share** is that every captured number came through the host
variable, so the difference is currently an argument from source rather than a measurement.

---

### Deviations and findings

| Item | Note |
|------|------|
| Continuity conflict | **Resolved; kept for the record.** `spec.md` said 0% and "not started" while `implementation-summary.md` said 90% and shipped, and the working tree agreed with the summary. Re-read 2026-09-02: neither "not started" nor "0%" occurs in `spec.md` any more, and `implementation-summary.md:175` records the string being removed. `roadmap.md` §7.6 still lists this phase among the eight |
| Label at 13px | Deliberate under D4, later raised by `016` as a one-token operator decision. Not a defect |
| Two criteria were carrying no measurement | The desktop non-regression and the five-dimension claim were both written as though verified, and neither had a check. Found by auditing the goal against the captured run rather than against the phase's own prose — which is the only way this shape is ever found. **Both were built and measured on 2026-09-01**, and one of them found a real listener leak on its first run, which is the argument for auditing rather than assuming |
| Every `styles.css` and `src/` line citation in this file has drifted | Read them by rule content, not by line. The citations were taken against `f64dd87`; the stylesheet has changed hands several times since and the working tree carries an uncommitted phone rule, so a spot check on 2026-09-02 found every sampled citation landing on the wrong line — `styles.css:461` by eleven, `:346` by rather more, and `record-detail-panel.ts:200` and `popover-position.ts:284` likewise. The rules and functions named are all still present. Recorded rather than renumbered: renumbering them buys one day of accuracy in a file every phase edits, and the next reader would trust the new numbers more than they deserve |
| The label's 13px is a declared red, not a silence | *the row's label size is on the type scale* stands `RED (declared)`: `label 13px; nearest scale steps are 12px and 14px`. Consistent with D4; it sits under the shared row grammar, so moving it moves every menu and sheet at once |

### 2026-09-02: operator report 33 routed here

**iOS, 21:24.** Quoted at `roadmap.md` §4 row 33: *"Open details sheet is buggy when overflow is
present (content doesnt fit 100vh)."* No screenshot yet. Meaning: the record detail bottom sheet,
when its properties and note body exceed the viewport height, does not behave — content doesn't fit
100vh and the sheet presumably neither scrolls inside its own box nor keeps its handle reachable.
Routed here rather than `023-record-note-body`: this phase already owns the phone record sheet's
reading layout and scroll behaviour, while `023` is deliberately not startable per `roadmap.md` §5
— the operator has not chosen display-only vs editable, and no note-body code has shipped — so a
bug against the sheet as it currently exists cannot be `023`'s to hold. Not investigated.

**2026-09-02: report 33 fixed in `00e2aa2`.** The record detail sheet lost its chrome, not its
scroll — the grab bar and the header were children of the scrolling panel, so a record taller than
the 90svh cap carried both off the top. Properties and body now sit in a `.db-record-detail-scroll`
region and the panel is a flex column. Red: handle -1148px from the sheet's top, reachable=false,
`db-record-detail-panel` owned the scroll. Green: `db-record-detail-scroll` owns the scroll,
1173px of overflow, handle 25px from the top, reachable=true. Both halves load-bearing:
`record-detail-panel.ts`'s wrapper and `styles.css`'s flex column with `overflow-y hidden
!important` against `popover-position.ts`'s inline `auto`. Release 1.4.2 is pending; not
operator-confirmed. **Adjacent, not this phase's to fix:** `styles.css` now carries two adjacent
`.db-record-detail-panel.db-mobile-bottom-sheet` blocks (design-conformance duplicate counter
125→126).
<!-- /ANCHOR:log -->

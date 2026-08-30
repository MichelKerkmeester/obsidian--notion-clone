---
title: "Verification Audit: 018, 022 and 025"
description: "A fresh reviewer's attempt to break three completion claims, with the command behind every number and the two findings that survived."
trigger_phrases:
  - "verification audit"
  - "005 audit"
  - "adversarial verification 018 022 025"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system"
    last_updated_at: "2026-08-30T20:45:00Z"
    last_updated_by: "adversarial-verification"
    recent_action: "Three claims re-run from a clean mirror; 022 confirmed, 018 and 025 confirmed with caveats"
    next_safe_action: "Reconcile 018's four documents, then decide whether REQ-007 or C7 is the wrong text"
    blockers: []
    key_files:
      - "018-select-column-affordance-fit/acceptance-criteria.md"
      - "022-selection-bar-keyboard-docking/acceptance-criteria.md"
      - "025-story-coverage-blindness/spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-audit"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "REQ-007 asks for thirteen missing and the run produces fourteen; which text is wrong"
    answered_questions:
      - "The -14px the record carried was correct; the -12px reproduction reverted half the fix"
      - "The selection bar checks read styles.css:2424, proven by removing the variable from it"
---
# Verification Audit: 018, 022 and 025

Written by a reviewer who did not do the work, per D4. Every number below has a command behind it and
the command's output is pasted, not summarised.

---

## 1. VERDICTS

| Phase | Verdict |
|---|---|
| `018-select-column-affordance-fit` | **CONFIRMED WITH CAVEAT** — both controls reproduce verbatim; three sibling documents still say they were never run, and the one discrepancy the phase declined to explain is explainable |
| `022-selection-bar-keyboard-docking` | **CONFIRMED** — eight checks found by name, all green, every number verbatim, and two stylesheet controls prove they read the shipped rule |
| `025-story-coverage-blindness` | **CONFIRMED WITH CAVEAT** — C7's numbers and all thirteen names reproduce under an independent re-derivation; the requirement C7 discharges asks for a different run, whose answer is fourteen |

**Method.** The working tree was dirty throughout — another lane was mid-edit in
`tools/storybook/verify-placement.mjs`. So the harness was run from a mirror in a scratch directory:
symlinks to `src/`, `node_modules/` and the rest, a **copy** of `verify-placement.mjs` taken from
`0ab9a35`, and a **copy** of `styles.css` so the negative controls could be applied without touching
the repository. `shasum -a 256 styles.css` was identical between mirror and repo before and after.
The repository's `styles.css`, `src/` and `tools/` were never written to.

> A trap worth recording: the mirror's `story-coverage.mjs` was first **symlinked**, and Node resolved
> it to its realpath, so `import.meta.url` pointed back at the real repository and the script read the
> real allowlist while reporting as if it had read the mirror's. It returned a plausible, wrong answer
> with no error. Copies, not symlinks, for anything that locates its inputs from its own path.

---

## 2. THE GATE

```
$ npm run gate
  types                green
  tests                green
  lint:tools           green
  comments             green
  folder-docs          green
  naming               green
  pinned-values        green
  css-lane             green
  evidence             green
  replay               green
  inverted-assertions  green
  screenshots-fresh    green
  shim-coverage        green
  story-coverage       green
  placement            green
  render-assertions    green

gate: PASS — 16 green, 0 red for a declared reason
GATE_EXIT=0
```

Exit status read from `$?` on its own line, not through a pipe. Sixteen lanes, all green.
`goal.md` §4's Progress table still records the gate as **Red, 12/13, `screenshots-fresh` on stale
captures**. That row is stale; the lane is green and there are sixteen lanes, not thirteen.

Baseline harness, from the mirror at `0ab9a35`:

```
$ node tools/storybook/verify-placement.mjs      # mirror, HEAD 0ab9a35
verify-placement: 212/216 geometry checks passed, 4 red for a declared reason
EXIT=0
```

**`022`'s "212 of 216 harness checks passing, 4 declared reds, exit 0" reproduces exactly.**
Run against the live dirty tree the same harness reports `218/223, 5 red`, because the concurrent
lane adds seven checks and one declared red. Both totals are consistent; neither is wrong.

---

## 3. `018-select-column-affordance-fit` — CONFIRMED WITH CAVEAT

### 3.1 Both controls run, both red, each isolated

**Control A** — `display: inline-flex` restored to the touch-floor block at `styles.css:18196`:

```
FAIL  on desktop the reorder button and the row checkbox do not overlap
      11 cells show both; narrowest gap -17px in a 40px cell
PASS  on phone the reorder button and the row checkbox do not overlap
      11 cells show both; narrowest gap 4px in a 65px cell
EXIT_A=1
```

**Control B** — phone select column returned to 48px at `styles.css:17616`:

```
PASS  on desktop the reorder button and the row checkbox do not overlap
      no reorder button is shown in 11 select cells, so nothing can collide
FAIL  on phone the reorder button and the row checkbox do not overlap
      11 cells show both; narrowest gap -12px in a 49px cell
EXIT_B=1
```

`-17px in a 40px cell` and `-12px in a 49px cell`, verbatim. Isolation holds in both directions:
control A moves only the desktop number, control B only the phone one. AC-2's presence arm reproduces
verbatim too — `11 cells show both` under control A, `no reorder button is shown in 11 select cells`
restored. Restored, the harness returns to `212/216` at exit 0 and `styles.css` hashes
`e5ada7e4…`, byte-identical to the pre-control baseline. **The claim is true.**

### 3.2 FINDING — the `-14px` was right, and the phase concluded the opposite

`acceptance-criteria.md` records the discrepancy honestly and then resolves it the wrong way:

> The difference is not explained here, and the reproduced number is the one to trust — it came from a
> run whose output is above, while `-14` came from a run nobody can re-execute.

There is an explanation, and it inverts that conclusion. The phase made **two** phone-side edits: the
column 48px → 64px, **and** the checkbox pin `right: 6px` → `right: 4px` (`styles.css:18376`, whose preceding
comment says "4px rather than 6px"). Control B reverts only the first. The 2px the pin recovered stays
in place, which is exactly the gap between the two numbers.

Reverting both — the actual pre-fix phone state:

```
FAIL  on phone the reorder button and the row checkbox do not overlap
      11 cells show both; narrowest gap -14px in a 49px cell
EXIT=1
```

`-14px`, exactly as the lane journal recorded it. The stylesheet comment at `styles.css:17610` —
*"the button's right edge sat 14px past the checkbox's left edge"* — was accurate.

So the record was never wrong. **Control B is a partial revert measuring a state that never shipped,**
and the phase should trust the `-14`. This does not weaken the control: it still takes the check red
and it still isolates to the phone. It means the "one number in the record did not reproduce" note
should be replaced by "the control reverted one of the two edits".

### 3.3 FINDING — four documents in one folder, three of them contradicting the fifth

`acceptance-criteria.md` marks AC-1, AC-2 and AC-3 **Met** on controls observed red. In the same
folder, at the same time:

| Document | What it still says |
|---|---|
| `goal.md` frontmatter | `blockers: ["No negative control has been run; the check is not yet shown to be connected"]`, `next_safe_action: "Re-run the overlap check and observe both negative controls red"`, `completion_pct: 40` |
| `goal.md` §3 LOG | "**Read the coverage table at the end of `acceptance-criteria.md` before anything else** — four rows, four blank negative-control cells" |
| `goal.md` Progress table | `Negative controls \| Not run \| Both named, neither observed` |
| `implementation-summary.md` | "**Verification. None performed by this phase.** … no negative control has been run for either edit" |
| `spec.md` | Status `In Progress`, `next_safe_action: "Re-run verify-placement and record the after-numbers against the red baselines below"` |

`goal.md` contradicts **itself**: its completion anchor carries `- [x] Both negative controls observed
red` with the correct numbers, while its own frontmatter, its own LOG and its own Progress table all
say they were not run. And `completion_pct` moved *down*, 60 → 40, after the controls were run.

The controls were run — I reproduced them. The defect is that the folder cannot be read to find that
out, which is the Completion Verification Rule's step 3 unperformed.

### 3.4 The `210 of 214` figure is a clean lag, not a fabrication

`018` cites `exit 0 at 210 of 214`; today the harness reports `212/216`. `3399768`, the commit that
recorded the controls, is an ancestor of `f2f7e5f`, which added the two sheet-title-editor checks, and
the harness is byte-identical at `3399768` and `f2f7e5f^`. Two checks were added, both green.
`210 → 212` and `214 → 216`. Accurate when written.

### 3.5 Is AC-1's desktop arm capable of failing?

Not for a gap. The check filters to cells whose button is not `display: none`; on the desktop that set
is empty, `worst` is `null`, and `pass` is `true` unconditionally. The desktop arm can only fail once a
button appears — which is AC-2's property, not AC-1's.

The coverage table lists AC-1 and AC-2 with different Producers ("overlap check" and "the same check,
presence arm"), which is honest, but they are one function emitting one of two messages. Control A is
what gives the pair teeth, and it exists and is red. **Not theatre — but AC-1's desktop cell is
carried by AC-2's control, not by its own.**

---

## 4. `022-selection-bar-keyboard-docking` — CONFIRMED

### 4.1 Eight checks, found by name, all green

All eight exist in `tools/storybook/verify-placement.mjs` §5b (phone, viewport 390×844) and all eight
passed in the baseline run:

```
PASS  selection bar content fits inside its border box
      content=46px box=46px (the measured pre-fix pair was 36px inside 28px)          -> AC-3
PASS  selection bar exposes a deliberate horizontal scroll lane when actions exceed phone width
      scrollWidth=558px clientWidth=356px overflow-x=auto scrollbar-width=thin        -> AC-4
PASS  selection bar action targets reach the phone thumb floor
      min action height=44px (want >=44px)                                            -> AC-5
PASS  embedded selection bar keeps its viewport-floor presentation
      standalone bottom=828px embedded bottom=828px                                   -> AC-7
PASS  selection bar clears the keyboard the host reports
      bar bottom=513 want=513px (keyboard covers 513..844)                            -> AC-1
PASS  selection bar keeps its box fully visible above the keyboard
      bar 465-513px available floor=513px                                             -> AC-6
PASS  embedded selection bar does not inherit standalone keyboard docking
      embedded before=828px after=828px                                               -> AC-7
PASS  selection bar returns to its safe floor when the keyboard closes
      closed bottom=828px resting bottom=828px                                        -> AC-2
```

Every figure in the criteria table — 513px, 828px, 828-after-close, 46-in-46, 558/356, 44px —
is verbatim.

### 4.2 The checks read the shipped rule, not a fixture

This was the claim most worth doubting, so it was tested three ways.

**The harness's own control** (`SELECTION_BAR_CONTROL=break`, which forces `bottom: 0px` inline) takes
the two docking checks red and nothing else. It proves the assertion reacts; it does not prove *what*
it reads. So:

**Control C** — `var(--keyboard-height, 0px)` removed from the shipped rule at `styles.css:2424`,
leaving `bottom: max(16px, env(safe-area-inset-bottom))`, the pre-fix declaration:

```
FAIL  selection bar clears the keyboard the host reports
      bar bottom=828 want=513px (keyboard covers 513..844)
FAIL  selection bar keeps its box fully visible above the keyboard
      bar 780-828px available floor=513px
EXIT_C=1
```

**Control D** — the phone bar's `height: 48px` returned to `30px`:

```
FAIL  selection bar content fits inside its border box
      content=36px box=28px (the measured pre-fix pair was 36px inside 28px)
EXIT_D=1
```

Editing `styles.css:2424` moves these numbers, so the checks are reading `styles.css:2424`. And
control D reproduces **the recorded pre-fix pair exactly** — `36px inside 28px`, a number the phase
inherited from `020` and never re-ran. It is real.

Both reported defects are therefore fixed *and* each is guarded by a check that has been seen red for
the right reason. The bar's box did go 30px → 48px (`--db-selection-status-height: 30px` at
`styles.css:763`, overridden to `48px` at `styles.css:2425`), and 36-in-28 did become 46-in-46.

### 4.3 FINDING — "Met, with no headroom" is wrong, and wrong in the safe direction

AC-3 says: *"46px of content in a 46px box passes inside a 1px tolerance and has nothing to spare. Any
padding, font or label change tips it red."*

Measured, by shrinking the box:

| declared `height` | check output | verdict |
|---|---|---|
| 48px (shipped) | `content=46px box=46px` | PASS |
| 47px | `content=45px box=45px` | PASS |
| 45px | `content=44px box=43px` | PASS, on the 1px tolerance |
| 30px | `content=36px box=28px` | FAIL |

The content's intrinsic height is 44px — the action `min-height` — and `scrollHeight` is clamped to at
least `clientHeight` whenever nothing overflows, so `content=46px box=46px` is not a hairline result at
all; it is what "it fits" prints. The real margin is **2px of box, plus the 1px tolerance**, and the
check first goes red below a 43px content box.

So AC-3 is not a coin flip and is not being presented as one falsely — it over-warns. The correction
is one sentence in the criteria table, not a threshold change.

### 4.4 The other zero-headroom check: the sheet's title editor

`centre offset 0.9px (want <= 1px)`, confirmed. Also confirmed: it is **not** a coin flip.
`centreDelta` is `.toFixed(1)`-rounded before comparison (`verify-placement.mjs:4833`), and the value
is bit-identical — `0.9px`, `title [556..577.8]`, `h=21.8` — across all **eight** independent runs
made for this audit, including six with different stylesheets. It is deterministic to a tenth of a
pixel.

It is nonetheless 0.1px from its threshold and derives from a 21.75px line box, so a font-size or
line-height change on the sheet title will move it. That is a fragility, not a flake, and the sibling
check beside it ("sits on its label's centre line", `worst centre offset 1px (want <= 1px)`) sits at
**exactly** the threshold with no margin at all. Neither is presented dishonestly; both should be read
as "will report the next change to this surface", which is what a tight check is for.

### 4.5 Minor — stale line references in the prose

Not evidence cells; every AC row cites a harness number. But four `styles.css:NNNN` pointers in
`spec.md`, `plan.md` and `tasks.md` no longer land on what they name:

| Cited | Actually at | What it is |
|---|---|---|
| `styles.css:2281` | `2398` | `.db-selection-status-bar` base rule |
| `styles.css:646` | `763` | `--db-selection-status-height: 30px` |
| `styles.css:6148` | `6286` | embed rule |
| `styles.css:17142` | `17280` | embed rule |

`implementation-summary.md`'s `styles.css:2423` is correct. The same file quotes the shipped rule with
five of its eight declarations and no ellipsis — `overflow-y`, `scrollbar-color` and
`overscroll-behavior-inline` are dropped. This is the packet's own "a derived number goes stale
silently" trap, in its lower-stakes form.

---

## 5. `025-story-coverage-blindness` — CONFIRMED WITH CAVEAT

### 5.1 C3 and C4

```
$ node tools/storybook/story-coverage.mjs
story coverage: 13/31 renderable modules
  with stories : 13
  exempt       : 18
EXIT=0
```

Verbatim. C1 and C2's line references are exact: `tools/gate.mjs:58` is `shim-coverage` →
`verify-coverage.mjs`, `:59` is `story-coverage` → `story-coverage.mjs`. C4 is §2 above.

### 5.2 C7 re-derived independently — the numbers and all thirteen names

The matcher was re-implemented from scratch in Python rather than reusing `story-coverage.mjs`
(`scratchpad/c7-probe.py`), with the pre-025 name test (`(?:create|render)\w+`) recovered from
`2e2d852` and the shipped one (`\w+`) from HEAD:

```
total .ts modules scanned in src/views : 78
WIDE   (shipped matcher)   renderable : 31
NARROW (name-tested, pre-025) renderable : 18
REVEALED by widening (wide - narrow) : 13
  bulk-edit-field-menu
  calendar-keyboard-navigation
  card-roving-tabindex
  database-viewport
  drag-drop-feedback
  field-tooltip
  hover-link-preview
  interaction-scope
  mobile-bottom-sheet
  option-color-picker
  popover-position
  table-cell-gesture
  table-record-peek

subset invariant holds: narrow is a strict subset of wide
wide set split -> covered=13 exempt=18 missing=0
```

**31 → 18, exactly 13, and the thirteen names match the spec's list one for one, in order.** C5, C6
and C7's headline all reproduce. `--json` reports `stale: []`, `unreasoned: []`, `missing: []`, so
C6's "every one of the 31 is covered or carries a written reason" holds and REQ-009 is intact.

REQ-008 also holds, and it is the case where a criterion could have failed a correct implementation:
`createStarterViewConfig` lives in `src/views/empty-state-renderer.ts`, whose three exports take
`RowPipelineDiagnostics` and `StarterPreset` — none takes an `HTMLElement` or a `parent`-carrying
options object. Widening the matcher did not pull it in, so it needs neither a story nor an exemption
and is correctly absent from all three sets.

### 5.3 FINDING — REQ-007 asks for a run that produces fourteen, not thirteen

C7 is filed against REQ-007, which reads:

> The widened matcher is demonstrated failing before it passes: **on the tree as received it must
> report the thirteen blind modules as missing.**

C7 records a different experiment: the *narrowed* matcher against *today's* tree, reported as a set
difference. That is a valid way to identify which thirteen the widening reveals, and it is the run
whose numbers are quoted. But it is not the run REQ-007 specifies, and REQ-007's run gives a different
number.

Running REQ-007 literally — the shipped widened matcher, the 7-entry allowlist from `2e2d852`, and
`src/views` restored to `1bac3c2^`, which is the tree as received:

```
TREE AS RECEIVED (1bac3c2^): wide=31 narrow=18 revealed=13
widened matcher + 7-entry allowlist -> MISSING = 14
    bulk-edit-field-menu
    calendar-keyboard-navigation
    card-roving-tabindex
    checkbox            <-- the fourteenth
    database-viewport
    drag-drop-feedback
    field-tooltip
    hover-link-preview
    interaction-scope
    mobile-bottom-sheet
    option-color-picker
    popover-position
    table-cell-gesture
    table-record-peek
```

Fourteen. `checkbox.ts` exports `createCheckbox`, so it was already visible to the **narrow** matcher —
it is not revealed by widening, it is the pre-existing red that C3 records as "Before: exit 1" and that
REQ-004 owns. Both counts are correct about different sets:

- **13** = modules the widening newly reveals. Reproduced twice, on both trees.
- **14** = modules the widened matcher reports *missing* on the tree as received = those 13 plus `checkbox`.

REQ-007 conflates them by asking for the second set and naming the first. The two sets are one element
apart, the element is documented elsewhere in the same spec, and no claim about the thirteen is false.
But the un-skippable control was discharged by a substitute run, and the phase does not say so.

For the record, REQ-007 **is** satisfiable as written — `mobile-bottom-sheet.stories.ts` and
`popover-position.stories.ts` were both added in `1bac3c2`, so on the true as-received tree all
thirteen were storyless. The fix is to change the number to fourteen, or to change REQ-007 to ask for
the set difference C7 actually reports. It is a wording defect, not a false green.

### 5.4 FINDING — `025` has no `goal.md`, `acceptance-criteria.md` or `implementation-summary.md`

`goal.md` §4 Progress asserts `Every phase has a goal.md | Done | 000-026`. Scanned:

```
007-architecture-research   ->missing: acceptance-criteria.md implementation-summary.md
020-harness-fidelity-repair ->missing: goal.md
021-sheet-inline-edit-alignment ->missing: goal.md
023-record-note-body        ->missing: goal.md acceptance-criteria.md implementation-summary.md
025-story-coverage-blindness ->missing: goal.md acceptance-criteria.md implementation-summary.md
```

Four phases have no `goal.md`. `007`'s absence is by design and documented; the other three are not.
A row marked **Done** whose evidence is a claim about the tree rather than a scan of it is the exact
shape this packet exists to catch, and it is sitting in the packet's own goal.

`025`'s seven criteria live in `spec.md` §5 and are complete, so nothing is unevidenced — but the
phase whose subject is *a catalogue that cannot see what it does not name* is itself invisible to any
check that looks for `acceptance-criteria.md`.

---

## 6. WHAT I COULD NOT ESTABLISH

| Item | State |
|---|---|
| Any of the three on the operator's device | **UNKNOWN.** None was attempted; all three phases say so themselves, and D3 is right that this is the only state that closes anything |
| `022` AC-9, the host shape of the operator's phone | **UNKNOWN**, and correctly marked so. No harness can answer it |
| Whether `018`'s `+4px` gap is enough on a real phone at the operator's density setting | **UNKNOWN.** `018/spec.md` records the density question as open; the 64px column is measured only in the touch branch |
| Whether the `-14px` in lane journal entry 64 was measured on the same harness revision | **UNKNOWN.** It reproduces exactly on today's harness, which is strong but not identical to having the original run |

---

## 7. SUMMARY OF FINDINGS

| # | Phase | Finding | Severity |
|---|---|---|---|
| F-1 | `018` | The `-14px` record was correct. Control B reverts the column but not the `6px → 4px` checkbox pin, and reverting both reproduces `-14px` exactly. The phase's conclusion that the `-12px` is "the one to trust" is backwards | Medium — the record is sound, the note about it is not |
| F-2 | `018` | `goal.md` (twice, against itself), `implementation-summary.md` and `spec.md` all still state that no negative control has been run, and `completion_pct` fell 60 → 40 after they were | Medium — reconciliation, not correctness |
| F-3 | `025` | REQ-007 asks for the widened matcher to report **thirteen** missing on the tree as received; run literally it reports **fourteen**, the extra being `checkbox`, which the narrow matcher already saw. C7 discharges a different experiment and does not say so | Medium — one element, both counts defensible, but the un-skippable control is not the run its requirement names |
| F-4 | `022` | AC-3's "no headroom" note is measurably wrong: the real margin is 2px of box plus the 1px tolerance, and `content == box` is what `scrollHeight` prints whenever content fits | Low — over-warns; harmless direction |
| F-5 | `022` | Four `styles.css:NNNN` pointers in `spec.md`/`plan.md`/`tasks.md` are stale by 117-138 lines; the shipped rule is quoted with three of eight declarations dropped and no ellipsis | Low — prose, not evidence cells |
| F-6 | parent | `goal.md` claims every phase `000`-`026` has a `goal.md`; four do not. The Gate row claims Red at 12/13; it is green at 16/16 | Low — stale LOG rows |
| F-7 | `018` | AC-1's desktop arm cannot fail for a gap: with no button rendered, `worst` is `null` and the check passes unconditionally. Its teeth come from AC-2's presence arm and control A, both of which exist | Informational |

**No claim under audit was found false.** Every number the three phases quote was reproduced, and the
two negative-control pairs, the eight harness checks and the thirteen module names are all real. What
the audit found instead is one inverted conclusion, one substituted experiment, and a set of documents
that disagree with each other about work that was actually done.

---

## 8. COMMANDS RUN

| # | Command | Result |
|---|---|---|
| 1 | `npm run gate` | 16 green, `GATE_EXIT=0` |
| 2 | `node tools/storybook/verify-placement.mjs` (repo, dirty tree) | `218/223, 5 red declared`, exit 0 |
| 3 | `node tools/storybook/verify-placement.mjs` (mirror @ `0ab9a35`) | `212/216, 4 red declared`, exit 0 |
| 4 | mirror + control A (`display: inline-flex` restored) | exit 1, desktop `-17px in a 40px cell` |
| 5 | mirror + control B (column 48px) | exit 1, phone `-12px in a 49px cell` |
| 6 | mirror + control B′ (column 48px **and** pin `right: 6px`) | exit 1, phone `-14px in a 49px cell` |
| 7 | `SELECTION_BAR_CONTROL=break node …verify-placement.mjs` | exit 1, two docking checks red |
| 8 | mirror + control C (`var(--keyboard-height)` removed from `:2424`) | exit 1, `bar bottom=828 want=513px` |
| 9 | mirror + control D (phone bar `height: 30px`) | exit 1, `content=36px box=28px` |
| 10 | mirror + bar height 47px / 45px | both PASS — AC-3 headroom probe |
| 11 | `node tools/storybook/story-coverage.mjs` | `13/31 renderable modules`, exit 0 |
| 12 | `python3 scratchpad/c7-probe.py` (independent matcher) | wide 31, narrow 18, revealed 13, names matched |
| 13 | shipped matcher + 7-entry allowlist + `src/views` @ `1bac3c2^` | `MISSING = 14` |
| 14 | `npx vitest run src/data/euro-format.test.ts` | `Tests 6 passed (6)`, `VITEST_EXIT=0` |

Repository state after the audit: `styles.css` `e5ada7e4…`, unchanged; `src/` and `tools/` carry only
the concurrent lane's edits. Nothing was committed.

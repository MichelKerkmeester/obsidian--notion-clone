---
title: "Session Handover: Component Surface System"
description: "Resume point: 0.0.32 shipped at f0597bcd; the operator's 08:07-08:52 device pass on it opened seven new packets (070-075, 008) plus two reopens (058 AC-012, 066 AC-010/011), scaffolded 2026-09-08, nothing implemented yet. GLM 5.3 flash max now carries implementation legs (superseding the prior NO-Opus wording); one Opus 5 xhigh sub-orchestrator at most under Fable; scaffolding runs on Sonnet 5 xhigh."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-08T16:09:34Z"
    last_updated_by: "237-checkbox-landing-verify"
    recent_action: "073 checkboxes landed+pushed (f846e605): goal 4/5, gate 27/0"
    next_safe_action: "Cut the release carrying 002's redirect (AC-007), then 008/003; 074, 072, then device rows"
    blockers:
      - "067 residual: T015 75px (1 past 66-74), T020 partial (one pair 2-level), T021 2 of 3 divider contexts, AC-011 iOS pass operator-owned"
      - "070 AC-005/006 need the operator's device; 073/074 AC-004 unblocked by 070's fix; 008/001+002 closed — 003/004 wait on a release carrying 002's redirect (AC-007); 071's audit landed (31f712c3, 86 rows, 1/4) — 002-006 unblocked"
    key_files:
      - "specs/005-component-surface-system/goal-prompt.md"
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/008-calendar-timeline-chart-deprecation/spec.md"
      - "specs/008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit/inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "233-ios-view-data-regression"
      parent_session_id: "surface-system-parent"
    completion_pct: 85
    open_questions:
      - "Does a Notion finding that contradicts a landed Anytype ruling ever become more than Proposed"
      - "Which surface(s) does R2 actually name — embedded/linked views, table drag, or both (072)"
    answered_questions:
      - "068 renames to obnotion- with a data.json migration, author MichelKerkmeester, repo obsidian_notion-clone"
      - "GLM route: --provider llmgateway --model glm-5.3-flash --thinking max"
      - "0.0.32 shipped f0597bcd; the six queued landings closed; 009 T26 discharged (26 green, 0 red)"
      - "GLM 5.3 flash max now carries implementation legs too; one Opus 5 xhigh sub-orchestrator at most under Fable; scaffolding on Sonnet 5 xhigh"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

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

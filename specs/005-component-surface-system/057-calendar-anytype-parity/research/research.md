# Deep Research Synthesis — Notion's Calendar UI as a Refinement of the Note-Database Calendar Surface

**Packet:** `specs/005-component-surface-system/057-calendar-anytype-parity`
**Loop:** `/deep:research:auto`, fan-out, **1 lineage** (`glm-devpass-calendar`), 5/5 iterations, `stopPolicy: max-iterations`, convergenceThreshold 0.05 (telemetry only) → terminal stop reason **`maxIterationsReached`**.
**Executor route:** iterations 1–3 ran on `cli-opencode` / `llmgateway/glm-5.3-flash` (reasoning `max`); that route stalled and its runner was SIGTERMed (`research/.fanout.log` `FANOUT_EXIT=143`). The lineage was **resumed in place** — same lineage directory, same append-only state log, no restart — on `cli-pi` / `openrouter/z-ai/glm-5.3-flash` (reasoning `max`), which completed iterations 4–5 and the lineage synthesis. Both routes are the same model family; no iteration was re-run or discarded.
**Evidence policy:** `notion-screens-digest.md` is the **only** source of Notion facts (40 screens, written by an image-capable analyst from the Mobbin captures; no PNG was opened at any point in this loop). Every claim carries `file:line` or a screen id. Inferences are marked as inferences.
**Charter posture:** Anytype parity is the default ruling for this surface (051 ADR-007; 056; 057 ADR-001…006). Notion refinements are **additive**. Where the two references disagree, the conflict is named and routed — never resolved against a landed operator ruling.
**Write scope:** research-only. No file under `src/`, `styles.css` or `tools/` was modified by this loop.

---

## 1. Executive summary

The 40-screen Notion harvest changes **exactly one** design decision on this surface and corroborates almost everything else we already ship.

The decision-changing evidence is **P3**. Eleven weeks of one real multi-day entry (`23cdb6d5` → `1c3f11f8` → `132e14f0`; digest `:163-171`) show a per-week-clipped continuous bar that **never prints a start–end date string** on or beside the bar. Our month segments emit exactly that string (`calendar-renderer.ts:427-429`, styled `styles.css:17264-17276` with the `:has()` band-aid at `:17284-17286`), the operator's gestalt read already marks it red (G3/G4/G5, `acceptance-criteria.md:119-121`), and this loop found the string **survives on the phone profile**: a full-stylesheet sweep returns exactly three `db-calendar-month-dates` selectors (`styles.css:17264`, `:17284`, `:17361`) and **no** `is-mobile` rule touches any of them, while the sibling time prefix *is* hidden on mobile (`styles.css:17691-17692`). Anytype never captured a multi-day event at all (`design-trueup.md` C5), so Notion is the only reference with evidence here and adopting its shape overrides no landed ruling.

The harvest's most visually striking difference — **P4**'s boxed-pill chips — is the one thing this charter forbids adopting. A3 is landed (`styles.css:17081-17110`), Notion is inconsistent with itself (`420ef2f0` pills vs `23cdb6d5` plain text, digest `:100-101`), the setting that produces the pill is absent from the capture set (digest `:331-334`), and ADR-004 admits only WCAG grounds for declining parity. The conflict is **named, dispositioned zero-diff, and given an explicit reopening path**.

The week-start disagreement is the operator's and stays that way. What this loop adds is the **cost symmetry**: Anytype is Monday in 20 of 20 captures; Notion is Sunday in 6 frames; and we currently ship **Sunday**, i.e. Notion's side, through `getLocaleWeekStartsOn` (`calendar-renderer.ts:2708-2710`). Ruling P0-2 to Monday therefore flips us away from one reference and toward the other — a symmetric cost, not one-sided pressure.

Deliverable: a ranked remediation plan (**R1–R7**, §9) that slots beside the standing rebuild task T019 rather than duplicating it, each row carrying a file-level change, a measurable threshold, a red-first check, and — for R1 — a negative control.

## 2. Topic, charter and operator context

**Topic.** How Notion's calendar-view UI (month grid, week and day scales, chips, multi-day spans, today, navigation, unscheduled items, date-property pickers, phone calendar) should refine the note-database plugin's calendar surface, judged against our implementation (`src/views/calendar-renderer.ts`, `src/views/calendar-toolbar-renderer.ts`, the calendar blocks of `styles.css`) and the packet's design record (`goal.md`, `design-trueup.md`, `review-ui-calendar-2026-09-06.md`, `decision-record.md`, `tasks.md`, `acceptance-criteria.md`), plus `specs/005-component-surface-system/design-system.md` and `roadmap.md` §6A.

**The six charter questions.** Q1 patterns ranked by user impact · Q2 the concrete code/CSS change and its measurable threshold for each · Q3 what we already have · Q4 what conflicts with an Anytype ruling · Q5 what needs a device-only check · Q6 a ranked remediation plan as phase tasks with thresholds and red-first checks. **All six are answered** (§4–§9); the coverage audit is F5.7.

**Binding context read at init.** ADR-002 keeps week and day styled to the month grid's measured values; ADR-004 admits only WCAG 1.4.11 / 1.4.3 and the 44px floor as grounds for declining parity; ADR-005 and its 2026-09-06 amendment settle the phone week at a 45px staggered minimum; ADR-006 landed the unscheduled header chip; **P0-2 (Monday start) is Proposed and the operator's**; G1–G15 are Unmet with observed reds, and T019 (`tasks.md:626-674`) is the rebuild leg that owns them.

## 3. Method

Five iterations, one fresh focus each, under a fixed cap with convergence demoted to telemetry:

1. Month grid — today marker, multi-day spans, span date string, drag-create and drop affordances.
2. Week and day scales, toolbar and navigation, `+N` overflow, the unscheduled surface, week start.
3. Date-property pickers (P6's two surfaces), range shading, formats, picker touch targets.
4. The P4-vs-A3 chip conflict, the single phone frame `7be7fafb`, the device-only register, the scoped-out map.
5. Consolidation — ranked answers, the R1–R7 plan, the coverage audit.

Negative claims were verified by sweep rather than assumed: the three-selector `db-calendar-month-dates` sweep (`styles.css:17264`, `:17284`, `:17361` — nothing else), the zero-hit `is-in-range` sweep, and the three-region touch-block sweep (`styles.css:20600-20736`, `:18365-18384`, `:18501-18504`, `:17687-17689`) that found no `mini-*` selector. One additional source file was read inside the bounded allowance: `src/views/calendar-mini-calendar-renderer.ts`, three lines (`:101`, `:169-172`).

## 4. Q1 — Notion patterns ranked by user impact

| Rank | Pattern (screens) | Verdict | Why this rank |
|---|---|---|---|
| 1 | **P3 — no date-range string on multi-day bars** (`23cdb6d5`, `1c3f11f8`, `132e14f0`; digest `:163-171`) | **Adopt** | The only pattern that changes a decision. Every spanning event shows our third element (icon · title · range) crowding a 20px row and stranding at the far edge (ADR-006's measured 776px title box inside a 977px segment); G3/G4/G5 red (`acceptance-criteria.md:119-121`); survives on phone where a month cell is ≈43.7 CSS px. Anytype silent (C5) → touches no ruling. |
| 2 | **P4 — boxed-pill chips** (`420ef2f0`; digest `:173-180`) | **Refuse — conflict closed** | Highest *visual* delta, zero *adoptable* value: A3 is landed (`styles.css:17081-17110`), Notion is self-inconsistent (`23cdb6d5` plain text, digest `:101`), digest §5 (`:284-292`) forbids a quiet reopen, and no WCAG ground exists (ADR-004). |
| 3 | **P5 — one-row toolbar above the weekday header** (digest `:181-187`) | Corroborates | We already ship the shape (`calendar-renderer.ts:2126-2138`; `styles.css:15785-15793`); the residual user value rides on G13's red (bordered/filled segmented pill `styles.css:16261-16304`, 34px title gap). |
| 4 | **P2 — filled today disc** (digest `:155-161`) | Already matched | `styles.css:16522-16533` — 26×24 disc, `#216DFA`, white 16px numeral, 4.53:1 (R4). Corroboration only; the hue difference is each product's brand accent (digest `:307-311`), not a gap. |
| 5 | **P6 — per-record date-property sheet** (digest `:189-197`) | Right evidence, wrong owner | The eleven-frame sheet is Notion's *per-record* editor; 057's A8 scopes the *view-level* `Date Property ›` selector, which no frame in the set shows opened (digest `:251-266`, `:320-326`). Its one 057-adjacent residue is the picker touch floor (F3.5) — our own discovery, not a Notion pattern. |
| 6 | **P1 — Sunday-start weekday rows** (digest `:147-153`) | Operator evidence | Input to the P0-2 deliberation (the 20-vs-6 cost symmetry, F2.2), not an adoption. |
| — | P7 layout tiles, connect-calendar (15 screens), recurrence sheet, dark theme | Scoped out | See §10's boundary map (F4.4). |

## 5. Q2 — Concrete changes, values, thresholds and red-first checks

| Rank | Change | File / rule / function | Value | Green threshold | Red-first (as the tree stands) |
|---|---|---|---|---|---|
| 1 | Delete the span date-range string at **every breakpoint** | `calendar-renderer.ts:427-429` and `:831-833` (keep `getSegmentTitle`'s range suffix `:1740-1746` so the tooltip retains the dates; keep the popover copies `:597`, `:899`); delete `styles.css:17264-17276` and the `:has()` band-aid `:17284-17286` once no producer emits the child — `tasks.md:666-674` already names this as T019's work | deletion | **0** `.db-calendar-month-dates` elements on the desktop **and** mobile profiles; G3 chip-left ink **10 ± 1px** in every covered cell; G4 first-chip ink **32 ± 1px** below the cell top; G5 | The string renders on both profiles; mobile hides only `.db-calendar-month-time` (`styles.css:17691-17692`), never `.db-calendar-month-dates` |
| 2 | `+N more` band reset (P0-4; G8/G5) — *Anytype/review-side; Notion is silent here (F2.4)* | `styles.css:16571-16576` + `:17288-17293`: reset the theme's `button` chrome (`background`, `border`, `box-shadow`, `text-align`); plain `#848484` text at the chip inset; next-lane placement | plain text | **0** non-surface px; ink starts within 12px of the left rule (G5); 20px pitch | 288×26 `#323232` filled band with centred text (`acceptance-criteria.md:124,121`) |
| 3 | Picker day-cell touch floors (F3.5 / D1) — *new leg, not in T019* | `styles.css:15890-15897` (`min-height: 34px`) and `:6941-6945` (`28px`, `(hover: hover)`-scoped): lift per profile, following the existing touch-block precedents `:20600-20736`, `:18501-18504` | `min-height: 44px` phone / `28px` coarse | every `.db-calendar-mini-day` hit target ≥44px phone / ≥28px coarse, verified in the render-assertion pass the way T021's were | The two declarations themselves; no `mini-*` selector appears in any of the three touch-media regions |
| 4 | Unscheduled chip touch floor (F2.5 / D2) | `styles.css:17736-17757`: add the phone-profile 44px lift the nav (`:18501-18504`) and the month segment (`:17687-17689`) already carry | 44px | chip hit target ≥44px on the phone profile | No 44px rule exists for the chip |
| 5 | Toolbar G13 (P0-4 row) | `styles.css:16261-16304`: un-border and un-fill the segmented pill; title gap 34px → **12 ± 1px** | 12 ± 1px | ≤4 unbordered controls; gap measured | Bordered, filled pill; `›` off-screen on the operator's 2000px capture |
| 6 | Week start (P0-2) — *the operator's call; one line is ready* | `calendar-renderer.ts:2708-2710`, `getLocaleWeekStartsOn`'s no-override branch. The override control already preserves user choice (`calendar-toolbar-renderer.ts:371-380`, `auto/0/1/6`) | Monday default **if ruled** | G7: Monday start, tinted pair = columns 6-7 | Sunday start, tint on columns 1 and 7 |
| — | Chip fill/border from P4 | **none — refused** (§7) | n/a | n/a | n/a |

## 6. Q3 — Notion behaviours we already have

- **Filled today disc** — `styles.css:16522-16533`, with the weekend tint explicitly excluded on today (`:16509-16511`) and 4.53:1 white-on-`#216DFA` landed under R4. Pin, do not move (F1.2).
- **Live drag preview, per-week bar recompute, 32px first-chip offset** — `beginMonthMove` (`calendar-renderer.ts:1302-1321`), `renderMonthRangePreview` (`:1385-1427`), `ensureMonthRangePreviewGhost` (`:1437-1463`), `beginMonthResize` (`:1165-1182`), 3px drag thresholds (`:1334`, `:1581`, `:1667`), lane offset (`:342-351`). Matches `1c3f11f8`→`132e14f0` (F1.4).
- **A two-signal drop/resize target that is *stronger* than Notion's** — ours is fill **plus** ring (`styles.css:17219-17222`, `:16606-16617`); Notion's is a single ~10% flat fill (digest `:102`), which fails WCAG 1.4.11 as a lone boundary signal. Kept as a named, WCAG-grounded deviation (F1.3).
- **Header-above-grid grammar, including the embedded-block variant** — `calendar-renderer.ts:2126-2167`; corroborated by P5 and by the iOS frame `7be7fafb` (F2.3, F4.2).
- **Picker chrome as the union of Notion's own inconsistent variants** — title + `‹ ›` + weekday letter row + bare numeric grid (`styles.css:15812-15886`), against `cfca14fb` (with weekday row) and `d7432519` (without). Nothing to adopt; the inconsistency is the reason not to chase any one variant (F3.4).
- **The chip's leading record icon** — `calendar-renderer.ts:422`, `renderRecordIcon`. This is P4's icon half, already matched; only fill and border are the delta, and those are the two declarations A3 zeroed (F4.1).

## 7. Q4 — Conflicts with an Anytype ruling

Exactly two exist across the whole 40-screen set, and both are in the merged registry.

**C-chips — named, closed, zero-diff.** P4's boxed pill (`420ef2f0`; digest `:100`, `:173-180`) against the landed flat chip (`styles.css:17081-17110`, dark ink `:17112-17114`). Adopting it would override a landed Anytype ruling with a Notion variant Notion itself does not apply consistently (`23cdb6d5`'s plain text, digest `:101`), on an unexplained cause (the producing toggle is not in the capture set, digest `:331-334`), with no WCAG ground — and ADR-004 makes WCAG the only permitted ground. **Proposed change: none.** The sole reopening path is a fresh operator ruling naming digest §5 and P4, the way ADR-002 named the week/day question.

**C-weekstart — live, operator-owned.** Anytype: Monday, 20 of 20 captures (`design-trueup.md` §2c). Notion: Sunday, four distinct databases plus two pickers (digest `:147-153`). Ours: Sunday, via `getLocaleWeekStartsOn` with no override (`calendar-renderer.ts:2708-2710`, consumed at `:265`, `:657`, `:699`, `:1915`, `:2021`) — i.e. **we currently ship Notion's side and diverge from Anytype**, and P0-2 would flip exactly that. P0-2 stays Proposed (`decision-record.md`, 2026-09-06 note). This loop's contribution is the cost symmetry, not a recommendation: either ruling diverges from one reference, and the implementation is a one-line default flip with the user override already preserved.

No other Notion behaviour in the set touches a landed Anytype row.

## 8. Q5 — Device-only checks (register D1–D6)

| # | Check | Origin | Red-first (on the file today) | Green / action |
|---|---|---|---|---|
| D1 | Date-edit popover's phone chrome — popover vs the `044` sheet — confirmed **before** sizing the picker targets | F3.5 | `styles.css:15896` (34px), `:6942` (28px) | ≥44px phone / ≥28px coarse for every `.db-calendar-mini-day`, verified in the render-assertion pass |
| D2 | Unscheduled header chip touch area | F2.5 | `styles.css:17736-17757`; renderer `:165-211` | 44px hit target on the phone profile |
| D3 | Phone week overlap stagger at 45px | ADR-005 amendment → T020 (`tasks.md:675-686`) | title paint boxes under halving at 45px | ≥16px title-ink floor (render-assertion); legible on device |
| D4 | Phone month-grid range string | F4.2 (new this loop) | `.db-calendar-month-dates` renders on the phone today | 0 occurrences on mobile after R1; folded into R1's both-profiles threshold |
| D5 | Phone week horizontal pan | ADR-005 (landed, engine-verified) | n/a — re-verify only if T019 touches `syncPhoneWeekHorizontalScroll` | 3-track `scrollLeft` sync holds; the page never scrolls sideways |
| D6 | Month-cell pitch vs Notion's iOS rows | F4.2 | n/a — not adoptable (digest §1 scale caveat, `:79-88`) | Our 45px stands; **no action** |

D5 and D6 are recorded as explicit no-action rows so a child phase does not re-derive them.

## 9. Q6 — The ranked remediation plan as child-phase tasks

Tags: **[N]** Notion-derived · **[A]** Anytype/review-side (Notion adds nothing — listed so the child phase sees the whole ranked board) · **[N-adjacent]** our own discovery, queued by a Notion-adjacent read · **[N-blocked]** blocked on the operator.

- **R1 [N] — Span rebuild and string removal, at every breakpoint** (folds into T019's P0-3 leg): §5 rank-1 row verbatim. Thresholds: 0 `.db-calendar-month-dates` on both profiles, G3 10 ± 1px, G4 32 ± 1px, G5. **Negative control:** re-adding the emitter at `calendar-renderer.ts:428` must turn the count assertion red. *Impact: every multi-day event, every user; phone worst.*
- **R2 [A] — `+N` band reset** (P0-4 / G8 / G5): §5 rank-2. Red-first: the 288×26 filled band. *Notion contribution: none — silence recorded (F2.4); ranked on user impact alone.*
- **R3 [N-adjacent] — Picker day-cell touch floors (D1):** §5 rank-3. Red-first: `styles.css:15896` and `:6942`. Device check D1 comes first, then sizing.
- **R4 [N-adjacent] — Unscheduled chip touch floor (D2):** §5 rank-4. Red-first: the missing 44px lift at `:17736-17757`.
- **R5 [A] — Toolbar G13:** §5 rank-5. P5 corroborates the target shape only.
- **R6 [N-blocked] — Week start (P0-2):** §5 rank-6. A decision, not a task; the flip is one line in `getLocaleWeekStartsOn`.
- **R7 [N] — explicitly no task:** chip presentation (closed, §7), picker today-treatment (F3.4, deferred to the picker's own leg), `Relative` format (F3.3, the column-format owner's), per-record range shading (F3.2, the record/cell-editor owner's), P7 layout tiles (053's).

**Suggested phase shape.** R1 and R2 fold into T019's existing L-legs — they touch the same renderer and are covered by the same recapture cadence. R3 and R4 are the small, independently verifiable new legs a child phase can carry, with D1–D6 as its device checklist. R6 is a decision to put in front of the operator, not work to schedule.

## Eliminated Alternatives

Negative knowledge is a primary output of this loop. Every row was refused with a reason, not left untried.

| Approach | Reason eliminated | Evidence | Iteration |
|---|---|---|---|
| Adopt Notion's boxed-pill chip fill/border (P4) | Overrides landed A3 with a variant Notion itself does not apply consistently; no WCAG ground (ADR-004); digest §5 forbids a quiet reopen | digest `:100`, `:173-180`, `:284-292`; `styles.css:17081-17110`; plain-text counterexample `:101` | 4 |
| Adopt Notion's red today hue | Brand accent, not a gap; our `#216DFA` is the measured WCAG fix (R4, 4.53:1) | digest `:155-161`, `:307-311`; `styles.css:16522-16533` | 1 |
| Adopt Notion's single flat-fill drop target | Fails WCAG 1.4.11 as a lone signal; our two-signal state is the grounded deviation | digest `:102`; `styles.css:17219-17222`, `:16606-16617` | 1 |
| Adopt one of Notion's three range-shade presentations | Notion's own three frames disagree (two-shade / same-day collapse / endpoints-only); the pick would be taste, and ADR-004 admits only WCAG grounds | digest `:110`, `:114`, `:116`; 0 `is-in-range` rules in `styles.css` | 3 |
| Read phone thresholds off `7be7fafb` | Digest §1 scale caveat: 299×678 Mobbin thumbnails, no device-px verification claimed; our floors come from `044` / ADR-005 | digest `:79-88`, `:339-342` | 4 |
| Patch the phone with a `display:none` for `.db-calendar-month-dates` | Splits one defect into two fixes and leaves the desktop red; R1 owns all breakpoints | sweep `{17264, 17284, 17361}`; `styles.css:17691-17692` | 4 |
| Adopt Notion's `Manage / Open in Calendar` toolbar action | External Google/iCloud sync — a different product surface, quarantined by digest §6 | digest `:100-101`, `:342-346` | 2, 4 |
| Feed P6 into AC-004 / A8 | P6 is the per-record editor; A8 scopes the view-level selector — different surfaces, by the digest's own §4/§6 wording | digest `:189-197`, `:251-266` | 3 |
| Extract week/day scale input from the iOS frame | `7be7fafb` is a month block with no chips; treating it as week/day evidence would fabricate a reference | digest `:99` | 2 |
| Re-grep the 40-screen set for week/day, unscheduled or `+N` input | Exhausted: every calendar-view frame is a month grid, and the negative result is recorded | digest §2; F2.1, F2.4, F2.5 | 2 |
| Unify the picker's today treatment with the month disc now | A documented collision rule already solves today-vs-selected; a Notion corroboration of the other convention is not grounds; deferred to the picker's own leg | `styles.css:15923-15946`; digest `:107`, `:117` | 3 |

## Divergence Map

Convergence never stopped this loop: `stopPolicy: max-iterations` demoted it to telemetry, and the newInfoRatio floor (0.20 at iteration 5) never approached the 0.05 threshold. Breadth, not agreement, is what the record below documents — and a broadened frontier is not a claim that the topic converged.

**Directions saturated.** The 40-screen Notion inventory, for week and day scales, the unscheduled surface, and the `+N` overflow affordance: every calendar-view frame in the set is a month grid, so no further pass over this harvest can produce input on those three (F2.1, F2.4, F2.5, F4.4). Recorded so no future run re-widows them.

**Pivots taken.** None. `convergenceMode` was `default`, not `divergent`; no Council pivot was prepared, attempted or overridden, and the registry's divergence block is empty. The loop's breadth came from the pre-declared five-focus queue in `deep-research-strategy.md`, each iteration taking a fresh angle rather than re-testing a saturated one.

**Pivot failures and audited overrides.** None recorded.

**Fan-out breadth.** One lineage, so no cross-lineage disagreement exists to adjudicate; the merged registry (`findings-registry.json`, 26 key findings) and `fanout-attribution.md` both record a single contributor. This is a real limit on the finding set: it is one model's reading of one digest, and §12 carries what that cannot settle.

**Remaining frontier** (outside this harvest's reach, each needing a fresh source rather than another iteration):
- Notion's dark theme — 40/40 captured screens are light (digest §1); our dark side rests entirely on Anytype's 10 light + 10 dark.
- Notion's view-level `Date Property ›` selector opened — absent from the set; the digest's own named next step is a targeted re-crawl (digest §6), not a re-read.
- The Notion setting that produces the P4 pill — unknown (digest `:331-334`); only relevant if A3 is ever revisited.
- Device measurement for D1–D4 — the CSS cannot answer which chrome a phone date-edit takes.

## 11. Recommendations

1. **Land R1 inside T019** as specified — the deletion, the both-profiles threshold, and the negative control. It is the one place this Notion read changes a decision, and it retires the G3/G4/G5 reds together with P0-3's rebuild.
2. **Carry R3 and R4 as the new child-phase legs**, with D1–D6 as the device checklist. They are small, red-first checkable, and they close the one touch surface the packet's floors never reached (the picker's day cells, F3.5) plus the unscheduled chip's own floor.
3. **Put C-weekstart's cost symmetry in front of the operator before P0-2 is ruled.** Do not rule it in-repo. The evidence to hand them is: Anytype 20/20 Monday, Notion 6/6 Sunday, ours currently Sunday, override control already shipped.
4. **Leave C-chips closed.** Any future A3 revisit needs a fresh operator ruling naming digest §5 and P4.
5. **Route the residuals to their owners:** `Relative` format and per-record range shading to the record/cell editor, P7 tiles to 053, picker-chrome unification to the picker's own leg, and `renderDropSnap`'s date-key text (`calendar-renderer.ts:2282-2297`) as P2-class polish only if the operator wants the noise gone.
6. **If a Notion dark-theme or view-level date-property comparison is ever wanted, commission a fresh targeted crawl.** This harvest cannot supply either.

## 12. Open Questions

Nothing inside the charter is unanswered — F5.7's coverage audit confirms all six questions answered, the bounded source set fully read, and every non-goal held (A3 not reopened, P0-2 not overridden, the gantt untouched, no source file edited, no PNG opened). Carried **outside** the charter, each with an owner:

- **Does the operator rule P0-2 (Monday default)?** — the operator's; the one-line flip and the G7 thresholds are ready (§5 rank 6).
- **Which chrome does a phone date-edit take — popover or the `044` sheet?** — device check D1; R3's sizing waits on it.
- **What Notion setting produces the P4 pill?** — unknown in this harvest (digest `:331-334`); only matters if A3 is revisited.
- **What does `Relative` actually render?** — the digest names the label (`812c6468`), not the behaviour; the column-format owner's question (F3.3).
- **Would a second, non-GLM lineage read the same digest the same way?** — unaddressed by design: this run was a single-lineage fan-out. Every adoption-grade claim above carries at least two independent anchors (digest + code + a G-row or ADR), which bounds but does not remove the single-reader risk.

## 13. Convergence report

- **Stop reason:** `maxIterationsReached` — the binding 5-iteration cap under `stopPolicy: max-iterations`. Convergence was telemetry only and never triggered.
- **Total iterations:** 5 (all five present on disk and in the lineage state log, `iteration-001.md` … `iteration-005.md`).
- **Questions answered:** 6 / 6 (Q1 §4, Q2 §5, Q3 §6, Q4 §7, Q5 §8, Q6 §9).
- **Remaining questions:** 0 inside the charter; 5 carried out of scope with owners (§12).
- **newInfoRatio trend:** 0.80 → 0.55 → 0.70 → 0.50 → 0.20 (rolling average 0.55 at close) — the shape of a corpus exhausted on schedule, fully dispositioned at iteration 4.
- **Convergence threshold:** 0.05 (never approached; the floor was 0.20).
- **Divergence summary:** no divergent pivots recorded; `convergenceMode: default`. See the Divergence Map for saturated directions and the remaining frontier.
- **Quality guards:** two reference products' records plus twelve bounded implementation and design files; each iteration bound to exactly one strategy focus; no adoption-grade finding rests on a single weak source.
- **Run health, recorded honestly:** the lineage was resumed once across an executor change (opencode → pi), and the earlier run's iteration-2 state record had been written to `deltas/iter-002.jsonl` but never appended to the lineage state log; it was appended through the workflow's `append-state-record.cjs` before the resume, which is why the log's iteration set is 1–5 while its record order is not chronological. The runner's post-run timestamp check flagged four `before_window` timestamps from the first run's model-invented times — advisory telemetry, recorded in `orchestration-summary.json`, with no bearing on the findings.

## References

**Bounded sources, all read in full unless noted.** `specs/005-component-surface-system/057-calendar-anytype-parity/notion-screens-digest.md` (40 screens, patterns P1–P7, §4 divergences, §5 conflicts, §6 open questions) · `src/views/calendar-renderer.ts` (2,780 lines) · `src/views/calendar-toolbar-renderer.ts` (584 lines) · the calendar blocks of `styles.css` (regions 15,785–18,905, 20,600–20,736, 22,653–22,736) · `goal.md` · `design-trueup.md` · `review-ui-calendar-2026-09-06.md` (G1–G15, P0–P2) · `decision-record.md` (ADR-001…006, the 2026-09-06 gestalt note, P0-2 Proposed) · `tasks.md` (T019–T021) · `acceptance-criteria.md` (AC-001…011 and the G rows) · `specs/005-component-surface-system/design-system.md` · `specs/005-component-surface-system/roadmap.md` §6A. One allowance file: `src/views/calendar-mini-calendar-renderer.ts` (three lines, `:101`, `:169-172`).

**Loop artifacts.** `research/lineages/glm-devpass-calendar/iterations/iteration-001.md` … `iteration-005.md` (the cited evidence for every finding above) · `research/lineages/glm-devpass-calendar/research.md` (the lineage synthesis this document consolidates) · `research/lineages/glm-devpass-calendar/deep-research-strategy.md` (charter, key questions, focus queue) · `research/findings-registry.json` (26 merged key findings) · `research/fanout-attribution.md` · `research/resource-map.md` (emitted from the five lineage deltas) · `research/orchestration-summary.json` (run verdict: 1 lineage, fulfilled, 0 failed).

No `resource-map.md` existed at the packet root when this loop initialized, so no packet-level map is cited.

## Appendix — iteration index

| File | Focus | newInfoRatio |
|---|---|---|
| `lineages/glm-devpass-calendar/iterations/iteration-001.md` | Month grid: today marker, multi-day spans, drag affordances | 0.80 |
| `lineages/glm-devpass-calendar/iterations/iteration-002.md` | Week/day scales, toolbar, `+N` overflow, unscheduled, week start | 0.55 |
| `lineages/glm-devpass-calendar/iterations/iteration-003.md` | Date-property pickers, range shading, formats, picker touch targets | 0.70 |
| `lineages/glm-devpass-calendar/iterations/iteration-004.md` | Chip conflict (P4 vs A3), phone frame, device register, scope map | 0.50 |
| `lineages/glm-devpass-calendar/iterations/iteration-005.md` | Consolidation: Q1–Q6, the R1–R7 plan, coverage audit | 0.20 |

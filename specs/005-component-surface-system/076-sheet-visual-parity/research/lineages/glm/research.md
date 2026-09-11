# Research: 076-Sheet-Visual-Parity — Design-Programme Audit (lineage `glm`)

**Session:** `fanout-glm-1789102713325-fbmgv2` · loop `research` · executor `cli-pi` / `glm-5.3-flash`, in-process (this session executed every iteration; no nested dispatch) · **stop: `maxIterationsReached`** at 5 of 5 (convergence telemetry: 0.70, 0.65, 0.60, 0.70, 0.65 — never below the 0.05 threshold; angles were pre-registered, one gap class per iteration, per the brief).

**Verdict.** The 076 packet is structurally sound — 19 real children, a 20th warranted, the loop graph (D6) genuinely runs — and every weakness found is a *documentation and contract* weakness, fixable with paste-ready text, not a redesign: 26 findings across 5 iterations, each with a path, a quote, and proposed text in `research/findings/iter-1..5.md`. The packet's one systemic risk is that 17 of 19 children inherit the loop's vocabulary without its teeth: no enumerated lane clauses, no Source column, no rubric instance, no registered captures — each closable at GATE, which is why the single highest-leverage change is GATE's entry contract (F5.1). Provenance: every finding's evidence is a `path:line` + quoted line recorded in the deltas (`research/deltas/iter-001..005.jsonl`); confidence per finding, 0.80–0.95.

---

## 1. What each iteration did (the five gap classes, never repeated)

| # | Gap class | Headline findings (details + paste-ready text in the linked file) |
|---|-----------|-------------------------------------------------------------------|
| 1 | COVERAGE — `findings/iter-1.md` | F1.1 roadmap §4 duplicates rows 86/87/88 (the "§4 rows 84–9x" citation is ambiguous); F1.2 17/19 children have no enumerated lane clauses (only 001's L1–L9 and 002's L1–L6 exist); F1.3 the shared listbox (inventory row 30) and record-peek (row 8) have no owner, contra roadmap §7.11's own one-owner rule (`:2159`); F1.4 016's producers are legacy-vault-only after 008's deprecation and its spec never says so; F1.5 the selection status bar + table load-more have no 076 child → **020 proposed**; F1.6 019 promises a DEFINE table its spec lacks (no §13, zero D7 references); F1.7 every 076-owned request resolves to a child — at the child level criterion 1 holds |
| 2 | DEPTH — `findings/iter-2.md` | The 19×6 grade table (§2.0 there; reproduced below); F2.1 the closure clause graded 3× (001 golden / 003–011 no tree-hash / 013–019 "a second time" only); F2.2 only 001 instantiates the judge's rubric (`001/plan.md:182` §3.5) — 18 children score against eight generic adjectives; F2.3 016+017 have no scenario-registration task despite 3-of-4 and 13-of-18 scenario-less surfaces; F2.3b 002's full-sheet judged-image convention (`002/plan.md:102`) unrepeated; F2.4 one vacuity guard in the whole packet (001's L9, `001/plan.md:155`); F2.5 §8 edge cases bind nothing; F2.6 clause-definition home inconsistent (001 plan §3.3 vs 002 spec §13.11 vs none) |
| 3 | REFERENCE COMPOSITION — `findings/iter-3.md` | F3.1 the D9 Source column exists in 6/19 DEFINE tables (the 09-11 scaffolds: 013:221, 014:226, 015:218, 016:230, 017:254, 018's ClickUp table) — 002/012 weld the reference into their column header, 001 keeps provenance in prose, 003–011's preambles promise a D7-override but never D9-Source; F3.2 012's REQ-004/SC-003 lag its own ClickUp-first preamble (judge not yet run — a free amendment; 018's Anytype bullet already assigns 012 the field-layout rule); F3.3 the four hard constraints are clause-ized exactly twice (001's AC-009; 002) and prose-ized elsewhere; 016's T008 covers 1 of 4; F3.4 D3's precedence ladder has no ClickUp rung (the D3×D9 amendment proposed); F3.5 001's continuity is stale twice (progress + an answered-question D7 retired) and its ADR-I predates D9's third input |
| 4 | DESIGN SYSTEM — `findings/iter-4.md` | F4.1 the design system already exists in code — `surface-shell.ts:139-163`'s exported consts (`SHELL_CARD_INSET_PT=16`, `SHELL_PHONE_CLOSE_PX=44`, `SHELL_PHONE_HANDLE_WIDTH_PT=34`, `SHELL_ROW_HEIGHT_PX=28`-desktop) and its presentation resolver (`:51`, `:80` — incl. the *handle-less* `menu` mode); clauses must cite these, presentation questions are answered in the resolver, not per-surface migrations; F4.2 roadmap §7.11's ownership doctrine was never extended to 076 (003:62 rebuilds 053's owned condition-row with zero citations) → **D10 proposed**; F4.3 the lane-ordered landing (001's remediation *deletes* the 24-site D7 debt at `styles.css:114/:1044/:12384-12399`; 003+004 share one hold on their D2-shared producer; the §11 regression re-run rule generalizes; 017 last-of-wave; 020 after 008); F4.4 typography/colour are packet-level targets pending C-1..C-6/OC-S2; 018's T001 lands colour roles as tokens; 014's shell premise already answered by the import graph (4/5 + DbModal via `modals/obnotion-modal.ts:63` import `createSurfaceShell`); 048's stacking model is **implemented** (`048/spec.md:26`) |
| 5 | LOOP LOGIC — `findings/iter-5.md` | F5.1 GATE has no entry contract (8-item checklist proposed — the single highest-leverage change; every item = an already-landed failure shape); F5.2 three stall clocks (iterations / per-row / minutes) never meet, the DEFINE-re-open edge 003:93 promises is **absent from D6's edge table** (`decision-record:230-231`), flapping rows are invisible — and the 15-min relaunch is empirically live (`scratchpad/glm/008-002-code.run1.log` **and** `.run2.log`); F5.3 the founding judge-vs-operator question is now answerable: 001's 11/16 and the operator's 0.0.40 rows 91/92 **agree** — the judge caught it first (§7.14's value-vs-gestalt precedent, closed for this packet); F5.4 three "dones" need the roadmap's three-state vocabulary (`roadmap:151`) and the §4A deferral convention for the 19 operator device rows; F5.5 the numbered leg brief (WRITE EARLY-10, ≤12 reads, per-step `.handover.md`, jitter ≤12, lane triplet `baselineHash`) is the §7.4b remedy living outside the graph — and LAND's postconditions are unwritten (F3.5's stale-001 is the regression test) |

Negative knowledge (read, ruled out, recorded): the inventory's 87-row completeness for *opened* surfaces (its blind spot — selection bar, load-more — is F1.5, not a re-count); 048's model (implemented, awaiting 0.0.24 confirmation — 076 depends on it, correctly, and must not re-derive it); 016's recorded ClickUp dismissal (`016:220-221`) is compliant, not a gap; the eleven's DEFINE *targets* (vs their source-accounting) were found sound in shape — their depth gaps are mechanism gaps (F2.2, F2.4), not wrong numbers.

---

## 2. COVERAGE MATRIX — request → child → task → clause

Every 076-relevant operator request (roadmap §4 rows 70–94; 86/87/88 each occur twice — F1.1) and every §6A ruling of 2026-09-08→09-11, resolved to its owning packet, its 076 child, the governing task, and the lane clause (or its promised locus). **No 076-owned request is without a child.** The clause column is truthful: "landed" where the clause exists, "§13.11 (T005/PLAN)" where it awaits that child's PLAN, per F1.2/F2.6.

### 2a. Roadmap §4 rows 70–94

| Roadmap | Operator request (abridged, verbatim) | Owns | 076 child | Governing task | Lane clause |
|---|---|---|---|---|---|
| 70 | *"removed note database and now all views no longer have data (finance) on ios"* | `070` | — (floor) | 076's VERIFY regression legs | 071-clause re-runs (`003:83`'s T022 precedent) |
| 71 | *"separate views from database… bugged… dragging doesnt work on mobile"* | `072` | — (floor) | — | 071-clause re-runs |
| 72 | *"checkboxes and radios are too big… shouldnt have radio inputs"* | `073` | 010 (pickers render the controls) | 010 DEFINE, control-kind rows | 010 §13.11 (T005) |
| 73 | *"how to set a board card name + number format?"* (discoverability) | `058` | 012 (adjacent: the card's own grammar) | 012's landed CREATE | 012's 28-clause gate (landed) |
| 74 | *"settings sheet has really bad ui. Actually all sheets should mimic notion way closer"* | `071/002` | **001** | 001's `### Frame-ruling remediation` + T002 lane RED | L1–L9 (`001/plan.md:138`), **landed, L1/AC-009 D7-superseded** |
| 75 | *"Add property sheet is also completely bugged"* | `071/003` | **007** | 007's DEFINE (T001–T004) | 007 §13.11 (T005) |
| 76 | *"Do we truely have screenshots and stories for every single sheet…?"* | `071/001` | 013–017 (the audit's answer) + this packet's coverage-audit.md | the audit's own 87-row table; 016/017's T00b (F2.3) | per-child §13.11; 016/017's registration precede clauses |
| 77–80 | calendar/timeline/chart/gallery deprecation + README strip + test-data | `008`/`074` | 016/017 inherit the *archived* surfaces (F1.4) | 016's §13 preamble (F1.4's paste); 017's T002 (live/dead) | 016's Reach column (F1.4); 017's clause-per-row (T005) |
| 81–82 | toast dwell 5000→3500ms; close 56×56 hit area | `066` | 017 (Toast is 017's) | 017's Toast rows in §13 | 017 §13.11 (T005); 066's landed AC-010/011 = the floor |
| 83 | *"these style of buttons for sort filter etc"* (+horizontal overflow) | `075` | **011** | 011's DEFINE (the labelled-toolbar rows) | 011 §13.11 (T005) |
| 84 | *"Settings sheet still has bad ui overall and needs strict alignment with notion sheets"* | `071/007` | **001** | 001's remediation (D7) + ADR-I | L1 (AC-009, 0 containers) — the L-FC0 precedent |
| 85 | *"Sort sheet doesnt fill full width… bottom gap"* | `071/005` | **004** | 004's DEFINE (the presentation/flush rows) | 004 §13.11 (T005); the presentation fork = `surface-shell.ts:152` (F4.1) |
| 86a | *"menu with horizontal overflow… vertical movement which shouldnt happen"* | `075` | **011** | 011's DEFINE (the strip rows) | 011 §13.11 (T005) |
| 87a | *"clean testbed only 1 database with table and boards views"* | `074` | — (floor) | — | — (the `[table, board]` fact = F1.4's premise) |
| 88a | *"Testbed has ton of folder… only 1 folder / database"* | `074` | — (floor) | — | — |
| 86b | *"Board cards should also show field name and not just value"* | `045` | **012** | 012's landed CREATE (single-column meta grid) | 012's 28-clause gate, **landed**; 012:236–241's D7/D9 preamble |
| 87b | *"Check more sheets align closer to notion, input, content, wise… Ui improvement is focus here"* | `071/008–014` | 001–011 wholesale (the ruling's standing emphasis) | each child's DEFINE | each child's §13.11 |
| 88b | *"double check all sheet work, use sonnet 5xhigh… sk-design-fundamentals… design fundamentals"* | `071/007–011,015` | 001–011 (the judge = the fundamentals' enforcement) | the §3.5 rubric instance (F2.2) + the `.opencode/skills/sk-design/sk-design-fundamentals/` load | the 8-row rubric, instanced per child |
| 89 | *"0.038 still has same old badish ui… go step by step multiple phases per sheet… define, plan, create, screenshot & verify and remediate… until perfect"* (the packet's founding ruling) | 076 | **001–011** (eleven sheets, D4 order) | the whole packet; each child's 6 phases | per-child §13.11; the loop = D6 |
| 90 | *"fields in board cards should never wrap always under each other add phase for that too"* | 076 | **012** | landed CREATE (012's implementation-summary) | 012's 28-clause gate, landed |
| 91 | *"Never use bg container… dividers on plain sheet bg"* (D7, 0.0.40) | 076 | **002** (+001's landed-adjacent remediation) | 002's `### Frame-ruling remediation`; the D7-override preambles (003:220) | 001's L1/AC-009 (landed) → the L-FC0–4 pack (F3.3) everywhere |
| 92 | *"Same for settings… bad typigraphy layout ans sizing… 0.40 doesnt feel like the upgrade"* (D7's typography leg) | 076 | **001** | 001's remediation, typography rows | 001's L2/AC-010-class + the packet-level Type targets (F4.4) |
| 93 | *"Double check we have inventorized every sheet / dropdown. And each [one] has dedicated multi phased [phase]…"* (2026-09-11) | 076 | **013–017** (the coverage-audit children) + 020 (F1.5) | 013–017's DEFINE (the 5-column tables, F3.1) + 016/017's registrations (F2.3) | their §13.11 (T005) |
| 94 | *"Board card dragging should look and work like this like in clickup… board styling lets mimic clickup… Mix match best of anytype, notion, clickup for sheets"* (D9's board-lead) | 076 | **018, 019** (019 strictly after 018, its own D3) | 018's §13 (Source=ClickUp, landed) | 018's §13.11 (T005); 019's frames = F1.6's §13 (to be added) |

### 2b. §6A rulings, 2026-09-08 → 09-11 (five)

| Ruling | Binding text (abridged) | Where it binds today | 076 task/clause |
|---|---|---|---|
| 09-08 | GLM-first implementation; one Opus sub-orchestrator; Fable master/reviewer | 076's legs (001/002 = "the GLM leg", row 74) + the CREATE row (`spec.md` §5: "Legs sized for one GLM 5.3 flash or Sonnet pass") | the leg brief = F5.5's paste (D6) |
| 09-09 ~22:30 | widen the sheet audit; the Luna→GLM fallback ladder; "Ui improvement is focus here" | 071's, not 076's (the judge stands outside the ladder — F5.3) | the judge-model line (F5.3's paste) |
| 09-10 ~21:40 | the six-step loop; the image judge; DOM lane = floor (D1–D4; "judge ≥14/16, no 0, twice unchanged") | `076/spec.md` §5; D1–D4; each child's AC-004/005/008 | 003–011's AC-004/005 (twice-consecutive, present) + the 16-AC closure amendment (F2.1) |
| 09-10 ~21:50 | the loop graph, explicit (D6): nodes, edges, verdict schema, two JSONL logs, 4-iteration guard, the human GATE | `076/decision-record.md` D6; `plan.md` §6A; `goal.md` §3 | GATE-entry (F5.1); the missing DEFINE-re-open edge (F5.2); LAND postconditions (F5.5) |
| 09-11 05:30–05:38 | D7 (dividers not cards, 16pt/44pt/handle/stacked; typography provisional) + D9 (three references, composed per element with reasons; boards = ClickUp) | `076/decision-record.md` D7/D9; `spec.md` §4/§5; 001/002's remediations; 003–012's §13 pointers; 012/018/019's reference preambles | the L-FC pack (F3.3); the 7th Source column (F3.1); 012's REQ/SC lag (F3.2); ADR-I's third input (F3.5); D3×D9 (F3.4) |

---

## 3. DEPTH GRADE — 19 children × 6 phases

Scale (per the brief): **L1** outline · **L2** tasks with files · **L3** tasks with thresholds + RED/GREEN lane clauses + capture ids + rubric rows · **L3+** adds both themes, states, edge cases, and the judge's per-row expectation. Grades grade the documents as they stand; the italicised *needs* column names the paste that closes the gap (every one exists, ready, in the cited finding).

| Child | DEFINE | PLAN | CREATE | SCREENSHOT | VERIFY | REMEDIATE | Needs (paste) |
|---|---|---|---|---|---|---|---|
| 001 settings | L3+ | L3+ | L3+ | L3+ | L3+ | L3+ | continuity refresh + ADR-I third input (F3.5) |
| 002 properties | L3 | L3 | L3+ | L3+ | L3 | L3+ | Source-column re-entitlement (F3.1); judged-image + closure wording if its VERIFY re-opens (F2.3b/F2.1) |
| 003 filter | L2+ | L2 | L3− | L3− | L3− | L3− | closure-hash (F2.1); §3.5 (F2.2); L-FC pack + 13.11 home (F3.3/F2.6); vacuity guard (F2.4); §8 binding (F2.5) |
| 004 sort | L2+ | L2 | L3− | L3− | L3− | L3− | same as 003 + the 003/004 shared hold (F4.3) |
| 005 group | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 |
| 006 add-view | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 |
| 007 property-editor | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 |
| 008 record | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 + the record-peek DEFINE row (F1.3) |
| 009 menu+confirm | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 |
| 010 pickers | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 + listbox ownership (F1.3) + the stacked-sheet rows (F3.3's L-FC4) |
| 011 toolbar-overflow | L2+ | L2 | L3− | L3− | L3− | L3− | as 003 |
| 012 board-card-fields | L3+ | L3 | L3+ | L3+ | L3 (judge pending) | L3 | REQ-004/SC-003 reference amendment (F3.2 — free, judge hasn't run) |
| 013 board-card-props | L2+ | L2 | L2+ | L3− | L2+ | L2+ | closure wording (F2.1); §3.5 (F2.2); D10 duty rows (F4.2) |
| 014 fuzzy-suggest | L2+ | L2 | L2+ | L3 | L2+ | L2+ | closure (F2.1); T001 shrinks to the fifth surface (F4.4) |
| 015 cell-editors | L2+ | L2 | L2+ | L3 | L2+ | L2+ | closure (F2.1); presentation = the shell resolver (F4.1) |
| 016 view-toolbar | L2+ | L2 | L2+ | **L2** | L2+ | L2+ | registration task (F2.3); T008b presentation (F3.3); Reach preamble (F1.4); closure (F2.1) |
| 017 utility DbModal | L2+ | L2 | L2+ | **L2** | L2+ | L2+ | registration task, 13 surfaces (F2.3); closure (F2.1); holds the lane last (F4.3) |
| 018 board-ClickUp | L3− | L2 | L2+ | L3− | L2+ | L2+ | closure (F2.1); §3.5 (F2.2); clause home (F2.6); its ADR = *resolved* not Proposed (§7.21, F3.2's reading) |
| 019 drag-feel | **L2** | L2 | L2+ | L3− | L2+ | L2+ | the §13 three-frames table (F1.6's paste); closure (F2.1); registration of the mid-drag captureids |

**Reading.** 001 is the packet's ratified shape (its six L3+ grades are the reference implementation); 002/012 prove the shape lands; 003–011 carry the loop's *structure* without its *values* (by the packet's own no-299×678-numbers convention — their.targets are honestly TBD); 013–019 scaffolded fastest and lost the registration/closure/instance machinery. **The success criterion "no child below L3 in any phase" is achieved by applying, per child, the pastes column — nothing needs re-derivation.**

---

## 4. CHILDREN TO ADD

One. (The ≥15 bar: 19 exist, 20 with this.)

| # | Name | Why (evidence) | DEFINE source rows | Six phases |
|---|------|----------------|--------------------|------------|
| **020** | **table-chrome-visual-parity** — *Table Selection Bar and Load-More Visual Parity* | Two always-visible table surfaces counted by no inventory: the selection status bar (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`, `src/views/rendered-view-roots.ts`) and the load-more control (`src/views/embedded-database-renderer.ts`, copy in `src/i18n.ts`) — 2 of the 9 no-constructed-counterpart fixtures not absorbed by 017/008 (F1.5). They arbitrate the same bottom edge the sheets do (roadmap's own row-31 reading) | Selection bar: Anytype multi-select row + Notion count pill (structure only), the C-1..C-6 captures outrank both (D3); rows: count pill, action order, ≥44pt, bottom-inset arbitration with an open sheet (D7's 16pt+handle grammar). Load-more: Notion's plain text row; rows: single text row, divider above, no card, 44pt+ hit | DEFINE (T001 confirms the producer lines) → PLAN (region+stylesheet+scenario registration — both fixtures gain constructed counterparts, closing the parent §2 nine-fixture note to seven) → CREATE (RED→GREEN) → SCREENSHOT (phone light+dark; bar with 2+ selections; load-more >50 rows) → VERIFY (lane + judge ≥14/16 no-0, twice-unchanged, hashes) → REMEDIATE (any row <2; §4A convention for the operator row) |

Sequencing: joins 013–0019 as sequence-independent (holds the shared css-lane triplet in its own turn, D4's rationale); its bottom-edge arbitration clause reads 008's landed record-sheet grammar — hence **after 008** (F1.5, F4.3).

---

## 5. DESIGN-SYSTEM CONNECTION MAP — how the 20 children connect to one token/component system

The principle (F4.1): **the system already exists in `surface-shell.ts` and 194 `--obnotion-*` tokens in `styles.css`; the children's job is to cite it, not to re-derive it.** The map, by layer:

| Layer | The one owner (D10, proposed) | What every other child does |
|---|---|---|
| **Sheet frame, header, grab handle, close glyph, presentation modes** | **001** — one remediation through `surface-shell.ts` + `buildShellHeader`; ADR-I (Done/‹/✕) decided here, once | references; their DEFINE's frame rows read 1 while ADR-I pends (F3.5's propagation paste); their presentation questions (016's T008b, 015's editors) are *declarations into the resolver* (`surface-shell.ts:51`), not migrations |
| **Row anatomy + divider grammar** (the D7 reference implementation) | **002** — `record-surface/property-row.ts`'s landed grammar, generalised | 003–011/013/015's row clauses cite it; the L-FC0–4 pack (F3.3) measures against `SHELL_CARD_INSET_PT=16` / 44pt, never fresh literals (F4.1) |
| **Condition row + value pickers** | **003** (rule row) + **004** (sort twin), *jointly* — reconciled with 053's toolbar-form ownership (§7.11 cross-reference) | the shared `active-rule-popover-renderer.ts` (D2); 015's select/value editors consume |
| **Shared listbox** (inventory row 30) | **010** (F1.3) | 003/004/006/007 inherit by pointer |
| **Status/priority colour roles** | **018** — its T001 ambiguity (`018:175`) resolved into `--obnotion-*` roles | 012 (relation chips), 002/010 (option rows), 015 (values), 020 (selection bar) consume the token, never a palette |
| **Board card** | field-layout **012** / anatomy **018** / visibility **013** / drag **019** (018's Anytype bullet records the 012-018 division) | each other, by pointer; 019's placeholder/settled frames inherit 012's landed grid + D7 (F1.6's §13) |
| **Utility / zero-reference chrome** | **017** — the DbModal family (`modals/obnotion-modal.ts:63`), one grammar for 18+2 — which the import graph shows *already routes through the shell* (F4.4) | 020's non-sheet surfaces consume |
| **Stacking** | **048** — implemented (`048/spec.md:26`), unchanged (§7.11: "named here so the family phases are not read as replacing them") | 010/016's L-FC4 + the `parentId` consumption (the 09-05 "no reader" gap is 048's to have closed; 076 asserts, never re-implements) |
| **Empty/toast/motion** | **055** via 017 (§7.11, unchanged) | — |
| **The regression clause set** | **001 seeds it** (L-FC0–4 + its L1–L9); every later CREATE re-runs it — the §11 rule ("008 then re-runs the earlier phases' evidence") applied per child | all 20, in one invocation (F4.3) |

**Landing order that avoids rework** (F4.3; the lane = one `styles.css` holder, release = recapture + human eyes, 87 reversing selectors, 19,261→24,967 lines): (1) the captures C-1..C-6 + OC-S2 arrive → (2) **001's remediation** (deletes the 24-site D7 debt: `.obnotion-settings-card` token pair `:114/:1044`, selectors `:12384-12399`) + **ADR-I** → (3) **002** (its L1–L6 + its Source column) → (4) **003+004, one lane hold, two verdict cycles** (their D2-shared producer) → (5) 005–011, D4 order, each holding the lane once → (6) 012→013–017+020, DEFINEs parallel, CREATEs serialized, **017 last of its wave** (18+2+1 surfaces, 13 needing registration first) → (7) **018→019** (019 strictly after 018 on `board-renderer.ts`).

---

## 6. LOOP-LOGIC CHANGE LIST (D6 amendments, in priority order)

1. **GATE gains its entry contract** — the 8-item orchestrator checklist (Source column + reason; §3.5 instance; the 13.11 clause home; the L-FC pack on shell consts; captures registered; D10 duties cited; pending-ADR targets capped at 1; the judged image named) — `gate:bounce` logged (F5.1). *Highest leverage: it is the cheapest control surface and it closes the F1.6/F2.2/F2.3/F3.1/F3.3 classes before any CREATE spends money.*
2. **Add the REMEDIATE→DEFINE edge** ("target-wrong" verdict, 3rd consecutive same-row fail — 003:93/016:85's promise, currently off-graph); second re-open of a child skips GATE → ESCALATE (F5.2).
3. **The flap clause** — a row <2 in 2 of 3 consecutive iterations; two flaps = ESCALATE evidence regardless of the 4-guard (F5.2).
4. **The clock reconciliation** — every verdict logs iteration + per-row + leg{launched,run,relaunched,minutes}; `run1==run2` (the 008-002 precedent) = `stall:relaunch-unproductive` (F5.2).
5. **The verdict contract** — JUDGE-<iter>.json gains: both tree hashes (F2.1), the judged-image variant + capture ids (F2.3b), the Source cell each row judged against (F3.1), and `operatorEcho{rulingRefs,agreement,note}` (F5.3); the judge = D6:203's Sonnet, outside the 09-09 implementation ladder (F5.3).
6. **Answer 076/spec §6's founding question** — answered (provisional, n=1): judge and operator *agreed* on 001; a future divergence adjudicates by rule: element→the reference moves (D9); scoring→the rubric anchors, via §7 Proposed-ADR, never silently (F5.3).
7. **The three-state DONE vocabulary + the DONE+ disagreement edge** — planned → shipped+verified (in-graph DONE + D8) → operator-confirmed; the 19 operator rows carry the §4A "re-asked after the next iCloud build" convention in goal.md, never "complete" (F5.4).
8. **D6 gains "The brief"** — the numbered-brief invariants by reference (GATE-3 pre-resolved; first artefact within 10 tool calls; ≤12 files read first; per-step `.handover.md`, gitignored; the jitter-≤12 rule; the lane triplet's `baselineHash`; the final report: HEAD SHA + proof numbers + every exit code) — the §7.4b remedy, and the state log references each leg's brief file (F5.5).
9. **LAND's postconditions** — continuity refreshed (recent_action ≤96 chars / next_safe_action / completion_pct / amended answered_questions), the roadmap row's state cell (§4A grammar), the goal.md progress row; 001's F3.5 staleness = the regression test (F5.5).
10. **Parallelism under the cap** — exactly one lane holder; N researchers (the DEFINE/PLAN/registration/Source-column work of any non-holder); one judge; one harness; zero agent-ticked operator rows; the one sanctioned wave = 013–017+020's DEFINE+registration pre-flight (read-only + their own specs) ahead of their serialized CREATEs (F5.5/F4.3).

---

## 7. OPEN QUESTIONS FOR THE OPERATOR

1. **ADR-I — the shared close glyph (the family decision, 001:214).** Notion's `Done` (R-4) / `‹` (R-5) vs ClickUp's round ✕-in-a-circle (D9's 09-11 input) vs the incumbent? Until taken, every sheet's Frame row targets 1 (001's enacted convention). This gates 002–011's header rows.
2. **The C-1..C-6 + settings capture + OC-S2 (dark).** D3's rungs 1–2 are still empty (`076/goal.md:18`; 123 dark candidates scanned, all light — 001:37). Everything numeric (typography 17pt/44–48pt, the dark targets) stays provisional until they land — and 001's remediation freezes them once, for the packet (F4.4). Do they arrive before 001's remediated judge?
3. **020 — the 20th child** (F1.5/F4-§4): adopt as its own packet-child, or fold its two surfaces into 017's bundle with a recorded reason? (Fold = smaller delta; own child = the fixtures' constructed counterparts close the parent's nine-fixture note properly.)
4. **003+004 as one lane holding** (F4.3): the shared `active-rule-popover-renderer.ts` producer argues for one acquisition, two verdict cycles — a D4 exception on the 018→019 precedent. And its reconciliation with 053's toolbar-form condition-row ownership (F4.2/D10): who records the summit?
5. **D10's ownership table** (F4.2): adopt as written? The 003/004 *pair* split and 010's listbox ownership are this proposal's judgment calls; the rest is quotation.
6. **D3×D9** (F3.4): adopt the 4-step ladder (rank-within vs choose-between, ClickUp's board-lead rung 2, the `none (internally derived — reason)` marking)? Or does the operator want one flat ladder?
7. **016/015's presentations** (F3.3's L-FC4, F4.1): D9 says "stacked sheets for pickers" — 016's three legacy-vault toolbars and 015's inline editors currently render as popovers. Migrate to stacked sheets on phone, or record the deviation with reasons? (The shell's resolver makes either a one-node decision — but it is the operator's D9, not the planner's.)
8. **The §4 duplicate rows** (F1.1): footnote (recommended — rows are history, the packet's own §7.12/§7.15 conventions) vs renumber 86a/86b…?
9. **The judge's disagreement rule** (F5.3/F5.4): confirm the element→reference / scoring→rubric-anchors adjudication *before* the first 16/16-vs-operator divergence, so it applies to a recorded rule rather than a remembered argument.
10. **001's completion_pct** (F3.5's paste): the proposed 55 counts Met-rows of 22 — it is a bookkeeping value, not a measured one; confirm or let it be derived by `graph-metadata` at the next LAND.

---

*Provenance: findings `research/findings/iter-1..5.md` (each: Gap class · Evidence path:line + quote · Finding · Proposed text · Confidence); deltas `research/deltas/iter-001..005.jsonl` (26 finding records + 1 grade record); state log `research/deep-research-state.jsonl` (7 events, terminal `type: synthesis`, `stopReason: "maxIterationsReached"`); convergence report `research/convergence-report.md`. Every constraint of the lineage honored: all writes inside `specs/005-component-surface-system/076-sheet-visual-parity/research/lineages/glm/`, no repo tooling executed (validate.sh / generate-context.js / git writes), no nested dispatch — this session executed all five iterations in-process.*

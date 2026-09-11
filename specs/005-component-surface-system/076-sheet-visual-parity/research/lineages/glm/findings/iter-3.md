# Iteration 3 — REFERENCE COMPOSITION

**Lineage:** `fanout-glm-1789102713325-fbmgv2` · gap class **3 of 5: REFERENCE_COMPOSITION**.
**Read first:** state (4 events) + deltas (iter-001: 7, iter-002: 8 records) — no gap from iterations 1–2 is repeated; F1.4/F1.6/F2.2 are cross-referenced only.
**Angle:** (a) does every DEFINE table carry a **Source column** choosing Anytype/Notion/ClickUp per element with a reason; (b) does **ClickUp lead board** surfaces; (c) is the **frame ruling** (no card containers; dividers on the plain sheet background; stacked sheets for sub-menus/pickers; grab handle; 16pt inset; 44pt+ rows) applied in every child; (d) contradictions → Proposed ADRs.

---

## Finding 3.1 — The Source column exists in 6 of 19 DEFINE tables; the eleven + 002 + 012 + 019 predate it, and their preambles promise a D7-override at CREATE but never a D9-Source

**Evidence:**
- Landed, with reasons: `013/.../spec.md:221` `| Element | Ours today | Reference (structural) | Target | Source |`; identical 5-column headers at `014:226`, `015:218`, `016:230`, `017:254`; and the gold standard, `018/.../spec.md` §13's table — `| Element | Ours today | ClickUp (structural) | Target | Source |` with rows like `| Column header | `TBD — T001` | Rounded pill: status icon + uppercase name… | … | ClickUp (operator ruling: board leads) |`.
- Missing: `002/.../spec.md:321` `| Element | Ours today | Notion (R-1/R-2, structural) | Target |` — the reference is welded into the column *header* (monogamy, not composition); `012/.../spec.md` §13's table `| Element | Ours today | Anytype (structural) | Target |` — its D9 preamble (`:241-243` — `**D9 (2026-09-11) also names this child's own reference directly: board surfaces read ClickUp first**…Neither decision rewrites the scaffolded table below`) names the new reference in prose while the table's own column still reads **Anytype**; `001`'s row table is 6 columns (`001:347` — `| R03 | G2 | folder | Source folder | [notes] › | the existing folder picker |`) with provenance only in §13.1's frame table (`:300` — `| Property | Target | Where it comes from |`); `003`–`011` follow 001's shape, and their DEFINE-preamble convention covers D7 only — `003:220` `where the table below still names a card, D7 overrides it at CREATE time even though this scaffolded table is not rewritten here` — no corresponding sentence ever mentions D9, the Source column, or the *reason* requirement. `019` has no §13 at all (F1.6).

**Finding:** D9's operative sentence — *"each child's DEFINE table composes its target row by row, naming which reference it follows and why"* — is structuralized only where the 09-11 scaffolding wrote the table after 05:38. Everything scaffolded on 09-10 (the eleven) kept 4/6-column tables, and their own amendment convention (the preamble) was written for D7's *override* question, not D9's *choice* question. A judge reading 002's or 012's DEFINE today cannot tell, for any given row, whether the reference was chosen or inherited.

**Proposed text** — two pastes.

1. Into each of `001`–`011`'s `spec.md` §13, directly under the existing D7 preamble (one sentence, same convention):

```md
> **Reference composition (D9, operator, 2026-09-11):** at this child's DEFINE (T004), the Target
> table gains a seventh column, **Source**, whose every cell names one of `Anytype` / `Notion` /
> `ClickUp` / `operator screenshot` / `none (internally derived — reason)` **plus the reason**;
> where the operator's ruling, capture or words speak to the row, they outrank all three sources
> (D3 rung 1). The 5-column precedents are `013/spec.md:221` and, for a governed reference,
> `018/spec.md` §13's ClickUp table.
```

2. Into `002` (and `012`'s remaining phases) — rename the welded column rather than re-derive:

```md
> The column currently titled `Notion (R-1/R-2, structural)` (resp. `Anytype (structural)`) reads
> as a ruling, not a composition. Under D9 it is re-entitled **`Reference (structural, per row —
> see Source)`**; any row where Notion (resp. Anytype) is *not* the best reference gains its own
> Source cell, and the reason travels with it.
```

**Confidence:** 93% — the 6-landed/13-missing split is a header-level read of every child's §13; 001's §13.1 provenance column is quoted, not paraphrased.

---

## Finding 3.2 — 012's requirements never caught up with its own D9 preamble: REQ-004 and SC-003 still say "against the Anytype reference" while the preamble says ClickUp-first

**Evidence:** `012/.../spec.md:241-243` — `**D9 (2026-09-11) also names this child's own reference directly: board surfaces read ClickUp first**, Anytype and Notion secondary, superseding 056-board-anytype-parity's Anytype-only board reference for this grid. Neither decision rewrites the scaffolded table below.` — against `:151` `| **REQ-004** | The image judge scores ≥ 14/16 with no row at 0, twice consecutively on an unchanged tree (parent D1), against the Anytype mobile kanban reference named in §13 |` and `:171` `| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree, against the Anytype reference | verification.md |`. Meanwhile `018`'s §13 already records the division — `018/.../spec.md` Anytype bullet: `kept as 012's own reference for the field-layout rule, which stands; not used for header/body/anatomy in this child`.

**Finding:** 012's judge has **not yet run** (its status: `:70` — `In progress — CREATE and SCREENSHOT landed; the judge (twice, unchanged tree) and the operator's read remain`), so this is a free amendment — but as written, 012's formal criteria demand Anytype while its §13 preamble demands ClickUp-first, and the verification row the judge signs will whichever way contradict one of the two. 018 already did the hard reconciliation work (field-layout = 012/Anytype, everything else = 018/ClickUp); 012's requirement rows are the only laggards.

**Proposed text** — into `012/.../spec.md`, amending `:151` and `:171` (values unchanged; reference clause rewritten):

```md
| **REQ-004** | The image judge scores ≥ 14/16 with no row at 0, twice consecutively on an unchanged
tree (parent D1), against the reference named in §13's preamble — **ClickUp first (D9), with
Anytype retained as the anatomy source exactly where 018's ClickUp harvest shows no
configured-property card** (see 018 §13's Anytype bullet, which assigns the field-layout rule here) |
```

and `SC-003`'s Verification cell: `Judge ≥ 14/16, no row at 0, twice on an unchanged tree, against the §13-preamble reference (ClickUp-first; Anytype for the field-layout rule)`.

**Confidence:** 95% — all four quotes are line-precise; 012's judge-pending state read from its own Status row.

---

## Finding 3.3 — The frame ruling's four hard constraints are clause-ized exactly twice (001, 002) and prose-ized everywhere else; 016's CREATE covers one of the four, and 010 — the pickers child, the constraint's primary owner — mentions "stack" twice

**Evidence:** The ruling's own hard list — `roadmap.md:1956`: `Hard constraints regardless of composition: no grouping containers (D7), stacked sheets for pickers, a grab handle on every phone sheet, 16pt inset, rows ≥ 44pt`. Landed as clauses: `001/.../acceptance-criteria.md:46` — `| AC-009 | … **L1 — superseded by D7, 2026-09-11.** The body renders **0** card containers…, and **≥ 4** dividers separate the five groups |` (containers+dividers, measured, `028-shipped-tree` state) — and 002's `### Frame-ruling remediation` block (its continuity: `002 DEFINE + PLAN landed` with the D7 tasks). Everywhere else it is preamble prose: `003:220` (the override sentence — containers only), `016/.../tasks.md:60` — `T008 Apply the frame-ruling divider grammar to the shared popover chrome across all four toolbars` (**dividers only** — no container, handle, inset, 44pt or presentation leg); `010/.../spec.md` greps `stack` exactly **2** times; `013`–`017`'s §13 tables carry no container-count or 44pt row; `019` (F1.6) nothing.

**Finding:** The packet's most-quoted ruling is enforced by exactly two children's lanes. Every later child will re-derive it from prose at CREATE, or skip it — 016's T008 is the live demonstration: a "frame-ruling" task that implements one of four constraints and, because 016's surfaces *earn* bottom-sheet presentation on phone (coverage-audit §1: "the inventory's 'Phone presentation' column names the phone-specific class a producer *earns* (bottom-sheet)"), never asks whether the popover chrome should be a stacked sheet at all.

**Proposed text** — two pastes.

1. The **frame-grammar clause pack**, into `003`–`011`'s future §13.11 and `013`–`019`'s (id continuation per child):

```md
**Frame-grammar clause pack (D7/D9 hard constraints — mandatory, not preamble).** Each child's
clause list carries, at minimum:
- **L-FC0** — container count: the sheet's body renders **0** rounded/lighter grouping containers
  (`.obnotion-*-card`, inset+radius+fill triples) — 001 AC-009's clause, generalized;
- **L-FC1** — divider grammar: every group separation is a hairline divider, inset to the label's
  leading edge (16pt) and full-bleed on the trailing edge, divider count ≥ (groups − 1);
- **L-FC2** — row pitch: every interactive row's hit height ≥ **44pt**;
- **L-FC3** — grab handle: the sheet's handle element present, centred, ≥ its own shipped token
  size, on the phone presentation only;
- **L-FC4** — presentation: every sub-Menu/picker this child opens on phone mounts as a **stacked
  sheet** registered in the 048 overlay stack (`parentId` consumed), not a floating popover.
```

2. Into `016`'s tasks (after T008), the constraint its own scope misses:

```md
- [ ] T008b For each of the four surfaces, record the **phone presentation** (bottom-sheet vs
      popover) in §13's Ours column and, where it differs from the D9 stacked-sheet constraint, the
      migration — a popover that never becomes a sheet on phone is a recorded D9 deviation with a
      reason, not a silent inheritance (`src/views/*-toolbar-renderer.ts`, `../013..017` precedent,
      `spec.md` §13)
```

**Confidence:** 90% — the 001/002-vs-17-children clause split is greppable; 010's 2-mention count is a grep, and its §13's presentation rows were not read line-by-line (flagged).

---

## Finding 3.4 — D3's precedence ladder has no ClickUp rung, and no document reconciles "D3 ranks sources" with "D9 composes which source"

**Evidence:** The packet's ladder — `001/.../spec.md:19` (the continuity blocker): `No number may come from a 299x678 reference asset (D3)`; the strategyKnown-Context form: `D3 reference precedence (operator capture > full-res Notion > 299×678 Mobbin thumbnail > Anytype)`. D9's addition — `roadmap.md:1956-1957`: `ClickUp joins Anytype and Notion as a third sheet reference, additive under D15. For sheets, no single source outranks the others: each child's DEFINE table composes its target per element (…), naming which reference it follows and why — the operator's own captures and words outrank all three.` No 076 document says how the two mechanisms share a row: D3 ranks *within a source* (which resolution), D9 chooses *between sources* (which product) — but D3's *order* (Notion 2nd, Anytype 4th) now contradicts D9's *no-ranking* (sheets) and *ClickUp-first* (boards), and 016's note — `016:220-221` — `**ClickUp**: not consulted — these are view-toolbar option popovers, not board or generic sheets, and no ClickUp view-options capture was identified at time of audit` — shows the reasoning happening ad hoc, in prose, per child.

**Finding:** The conflict is latent, not yet shipped: 018/019 avoid it because the operator's *words* (D3 rung 1) carry their ClickUp-lead; the sheets avoid it because their rulings (rows 84/92: "strict alignment with notion") are also rung 1. The next child whose element has no operator word and no capture — exactly 016's three referenceless toolbars, 014's five, 017's eighteen — must guess which mechanism ranks its nonChoices, and the roadmap's own §7.15 principle (*"Notion refinement is additive and never silently overrides a landed Anytype ruling"*) demands the reconciliation be recorded, not improvised.

**Proposed text** — into `076/decision-record.md`, as **D3's amendment** (a new paragraph under D3, citing D9; or, if the amendment mechanism demands it, Proposed-ADR-L):

```md
**D3 × D9 (amended 2026-09-11, additive — no ruling changes).** D3 ranks *the captures of* the
source a row already uses; D9 chooses *which source* a row uses. They share one row as follows:

1. Operator capture / operator words (D3 rung 1) — also what makes ClickUp *lead* boards and a
   named ruling *pin* a sheet's reference;
2. Then, for a row neither the operator nor any capture speaks to: the D9 composition — the child's
   DEFINE **Source cell** records the chosen reference *and why*; for board surfaces the choice is
  ClickUp unless the harvest lacks the element (018 §13's Anytype bullet is the precedent);
3. Then, *within* the chosen source: full-res capture > 299×678 thumbnail, unchanged;
4. A source with no capture at any rank (016's three toolbars, 014's five, 017's eighteen) is
   recorded `none (internally derived — reason)` in the Source cell — the D9 marking, already
   practiced in 017:20 — and the derived target cites its in-programme precedent (the grammar of
   the surfaces that DO have references), never an invented number.

No number may come from a 299×678 asset (D3, unchanged); no element's reference is implied by its
neighbour's (D9, unchanged). Where this ladder and a landed product-specific ruling disagree, the
ruling wins and §7.15's additive rule sends the difference to §7, never silently.
```

**Confidence:** 88% — the mechanism split (rank-within vs choose-between) is the natural-reading reconciliation and matches both rulings' literal texts; the operator may instead want one flat ladder, which this paste does not foreclose (the numbering makes either reading shippable).

---

## Finding 3.5 — 001's continuity metadata actively contradicts its own landed state and D7 — the 076-edition of the roadmap's §7.6 "phases say 'not started' after shipping" disease

**Evidence:** `001/.../spec.md:12-41` (frontmatter): `completion_pct: 0`; `recent_action: "DEFINE + PLAN: brief, delta, 9 clauses, 14 tasks"`; `next_safe_action: "Execute tasks.md T001 (transcribe ADR-I/J/K), then T002 lane RED"`; and — the.answered question — `- "Grouping idiom follows presentation: full-screen full-bleed, sheets inset cards. 071/007 stands"`. Against the reality: `001/.../acceptance-criteria.md:41-42` — `AC-004 … First pass scored **11/16** against the 5-card shape (D7…); …superseded by the frame-ruling remediation (tasks.md), not re-attempted as-is` and `:46` — `| AC-009 | … **L1 — superseded by D7, 2026-09-11.** The body renders **0** card containers… | Shipped tree carries **5 card containers, 0 group dividers** (the shape this row previously certified as passing) |` — plus the implementation-summary and the D7 retirement itself (`roadmap.md:1955`: `Retires the parent's own §4 reading of View options as "three separate inset cards," 071/007's settings-card landing`). And ADR-I's own record, `001:214` — `Does the operator accept `Done` in place of `✕` across all eleven sheets? … held as **Proposed ADR-I** (§13.13), and until it is taken the rubric's *Frame* row targets **1** rather than 2` — predates D9's 09-11 input (`roadmap.md:1957`: `Also names ClickUp's round ✕-in-a-circle close as an input to ADR-I (still the operator's own call)`), so 001:214's ADR-I is missing its third input.

**Finding:** Two contradictions in one child's metadata: (1) progress — the continuity saysDEFINE+PLAN-at-T001 while AC-004 records a scored, since-superseded first judge pass and the packet's own D7-remediation landed; (2) content — `answered_questions` certifies `071/007`'s inset-card grouping *on the day D7 retired it*. 019's F1.6-adjacent symptom and 012's landed-but-describing-Anytype hints are the same class: the loop's verdict-writers (D6) own no continuity duty, so the metadata trails the verdicts. (The mechanics of a continuity duty at LAND belong to iteration 5; here, the 001 patch.)

**Proposed text** — two pastes.

1. Replace 001's `_memory.continuity` fields (direct frontmatter edit — legitimate where only continuity changed):

```yaml
    last_updated_at: "2026-09-11T05:45:00Z"
    last_updated_by: "076-001-frame-remediation"
    recent_action: "CREATE + judge #1 (11/16, superseded by D7) landed; D7 frame-remediation tasks placed; D9 recorded as ADR-I input"
    next_safe_action: "Run the frame-remediation RED: L1/L2 against the 0-container/4-divider targets (AC-009/010)"
    blockers:
      - "No sheet may be closed on DOM-lane evidence alone; the image judge is a required gate (D1)"
      - "Sheets run in order, 001 first — the operator named the settings sheet"
    completion_pct: 55
    open_questions:
      - "ADR-I (shared close glyph): Done vs ‹ vs ClickUp's ✕-in-circle — the operator's own call (D9 added the third input 2026-09-11)"
      - "Do the C-1..C-6 + settings captures arrive before the remediated judge #1, or does 001 re-open DEFINE on arrival (D3)?"
    answered_questions:
      - "Grouping idiom: D7 (2026-09-11) — dividers on the plain sheet background, no card containers; 071/007's inset cards retired (was: 'inset cards, 071/007 stands')"
      - "constructed-view-config reaches ViewConfigPanelRenderer.render at harness:3475; no scenario work owed"
```

2. Into `002`–`011`'s §13 preamble (the family mechanism, so 003+ inherit the 1-target honestly):

```md
> The header's close affordance (Done / ‹ / ✕) is the packet's shared **ADR-I**, recorded at
> `001/spec.md:214` (`buildShellHeader` is common to all eleven). While ADR-I is pending, this
> child's rubric **Frame row targets 1, not 2** — 001's enacted convention — and the Target column's
> header cell says so, so the judge'sFRAME score is never read as a remediation failure.
```

**Confidence:** 92% — both 001 contradictions are direct quote-against-quote; the completion_pct=55 is the proposed value (counted: AC-006/007/010 Met of 22 rows), not measured by tooling — flagged.

---

## Also read, no finding (negative knowledge)

- `016:220-221` — its ClickUp dismissal (`not board or generic sheets, and no ClickUp view-options capture was identified at time of audit`) is a *recorded* reason, exactly what D9 asks; cited as the good practice in F3.4 rather than broken.
- `018`'s reference block resolves its ClickUp-lead (`board leads per operator ruling`), marks Anytype `superseded for board surfaces` *and* simultaneously preserves it for 012's field-layout rule — the 012/018/013 ownership tri-split is already recorded where it matters (F3.2 adds only the 012 requirement rows).
- The eleven's 6-column tables and the coverage-audit children's 5-column ones share the same 0/1/2 *content* duties; nothing in this iteration found the eleven's *targets* wrong — only their source-accouting invisible (F3.1). Depth of the targets themselves was iteration 2'sFinding 2.2.

**newInfoRatio: 0.6** — justification: the 6/13 Source-column split, the 012 requirement-lag, the four-constraints-clause-ized-twice fact, D3's missing rung and 001's double-stale metadata are all absent from iterations 1–2's records and from the packet's documents; theframe-grammar pack itself derives from 001's landed clauses (already-read evidence, newly composed).

**Sources (11):** 076/{013,014,015,016,017,018}/spec.md §13 tables; 076/{002,012}/spec.md:321+241-252; 076/001/spec.md:12-41+212-215+296-302+347; 076/001/acceptance-criteria.md:41-46; 076/003/spec.md:220; 076/016/tasks.md:60; 076/010/spec.md (stack grep); roadmap.md:1954-1957.

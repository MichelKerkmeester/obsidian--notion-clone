---
title: "Goal: Notion Toolbar Refinement"
description: "The durable directive for the toolbar's Notion refinement, and the thresholds that decide when it is done."
trigger_phrases:
  - "064 goal"
  - "notion toolbar refinement goal"
  - "delete view confirm goal"
  - "filter entry tier goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/064-notion-toolbar-refinement"
    last_updated_at: "2026-09-07T00:00:00Z"
    last_updated_by: "fold-064-rulings-session"
    recent_action: "Landed the implementation and its verification; 7 of 8 criteria closed"
    next_safe_action: "The operator's device sitting (T013), which rides 053 AC-111"
    blockers:
      - "styles.css edits are serialized by the parent's CSS lane"
      - "053 owns every file this packet edits and is sequenced ahead of it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-goal"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "T016's three gaps: three source-grep suites, the unphotographed chip-rail add control, and the 29x14 px toast action"
    answered_questions:
      - "Per-group visibility is 059's: boardHiddenGroups exists; the missing writer is 059's Groups panel"
      - "Our control cluster carries no text label; the density comparison lives only on the New button"
      - "The digest's P3 divergence row is stale: the desktop side sheet landed after it was written"
      - "ADR-001 and ADR-005 Accepted, ADR-007 Declined — ruled 2026-09-07 (Europe/Amsterdam)"
      - "Conditional row colour is ours already; its view-settings row routes here via 062 ADR-003"
      - "A deleted view IS recoverable: deleteView already saves through recordConfigHistory, so ADR-005 took Branch B — no confirm, an Undo toast"
---
# Goal: Notion Toolbar Refinement

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Take the refinements Notion's captures justify on the toolbar and its view controls —
a confirm in front of the two unconfirmed delete-view paths, a one-click entry tier in front of the
filter builder, search on the condition dropdowns, one collapse rung, and an add control in the chip
rail — at thresholds observed red on this tree first, without overturning a single landed Anytype
ruling.

**Why.** The operator's 2026-09-06 ~16:10 instruction is the parent's D15: *"Based on notion
screenshots add phases to all ui improvement phases to further refine based on notion ui
screenshots. But do 5 iters of deep research with glm 5.3 flash max on those screens per relevant
phase."* This is the toolbar's reserved slot.

What the loop found is mostly ratification. **Twelve of the digest's thirteen patterns are already
ours** — the row grammar and the split New, inline search, the column menu, the one-row condition
builder, per-rule chips with a direction word, value-summary settings rows, and a hub that carries
more actions than either reference. Two independent products, read independently, chose the shape
this packet already ships.

Two things are not ratification. **A configured view is destroyed by one tap.** Both delete paths —
the all-views hub row (`toolbar-renderer.ts:1180`) and the tab context menu (`:1330`) — call
`actions.deleteView(index)` directly, and the host splices the view and saves
(`database-view.ts:3445-3456`); the only guard is the last-view early return at `:3447`. Notion's
P9 (`55602f6a`, `348fd2b7`) is the only capture evidence anywhere that a delete-view confirmation
exists. **And the commonest filter costs three clicks**, because the panel has exactly one entry
surface: the zero-rule state is a text hint (`filter-panel-renderer.ts:197-202`) and every filter,
however simple, is answered by the nested tree.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The research is the read of record for what Notion does; the tree is the read of record for what we do.** Where the loop's synthesis and this tree disagree, the tree wins and the finding is corrected in place, dated. Four of the loop's own claims were corrected that way at this packet's opening — one substantive and three of citation — and three more at its landing: two citations that had drifted under the twenty-seven commits this packet rebased onto, and the conditional-colour reading `062` ADR-003 had already corrected. Seven in all, each in §4 and in `decision-record.md`, not silently absorbed. |
| D2 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the tree at `80c2bb48` before its fix is written, with the failing figure recorded. Every P0 and P1 threshold here was re-derived against the tree during synthesis rather than taken from the loop's report. |
| D3 | **Additive only, under parent D15.** This packet may add a criterion, a task or an ADR. It may not un-tick a measured row or overturn a landed Anytype ruling. Where a Notion finding contradicts one, the ADR names both readings and stays **Proposed**. |
| D4 | **What `053` ruled stays ruled.** The nested filter builder stays (`053` D4). The single icon vocabulary stays (`ADR-001`). The landed collapse drop order stays (`053`'s `AC-012` / T008); ADR-001 here adds a rung ahead of it and reorders nothing. |
| D5 | **One owner per shared primitive, carried from `053` D8.** The confirm primitive is `051`'s and REQ-001 consumes it; a second confirm surface on this path would be the exact failure the five family phases were split to avoid. Per-group visibility is **`059`'s**, not this packet's, and ADR-007 records why. |
| D6 | **Three Proposed ADRs were a real gate, not a formality — ruled 2026-09-07 (Europe/Amsterdam).** ADR-001 (*"Yes, icons first then the drop order"*) and ADR-005 (*"Confirm only if unrecoverable"*) are Accepted; ADR-007 (*"Groups panel only"*) is Declined. REQ-004 and REQ-001 (as a two-branch read) may now be built; REQ-006 closes Waived. |
| D7 | **No new value is minted.** Every geometry this packet writes already exists in the landed inventory the research recorded — the 28px chip pitch (`styles.css:1821`), the 11%/17% tints (`:1825`, `:1832`), the badge and tab metrics. A proposal that needs a number the tree does not already carry is a proposal that has not been measured. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase; `053` AC-111 is where the operator's read of this surface lands. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D15 bind here as written there, and D15 is
why this packet exists. `../roadmap.md` §5.A places this phase, §6A holds the operator decisions it
consumes — the gear ruling, the desktop side sheet, the condition-panel role — and §7 the conflicts.

**Read `053-toolbar-and-view-controls/goal.md` second.** Its D1-D9 bind here; this packet extends
that surface and owns none of its files.

**The Notion read of record is
`../053-toolbar-and-view-controls/notion-screens-digest-toolbar.md`** — the `-toolbar` suffix is not
a typo. Two Notion pipelines were bound to `053`; the table pipeline landed first and holds the
canonical `notion-screens-digest.md` and the canonical `research/` directory. This packet's research
lives at `../053-toolbar-and-view-controls/research/notion-toolbar/`. ADR-009 records it.

**Where the digest and `design-trueup.md` disagree about a measured value, the true-up wins** — it
is the 1:1 measured document and the digest is explicit that its own captures are thumbnails
(`050` ADR-003).

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] **A view cannot be destroyed without a confirmation, on either path.** **Today: neither path
      confirms.** The all-views hub row pushes `run: () => actions.deleteView(index)`
      (`toolbar-renderer.ts:1180`) and the tab context menu `onClick: () => actions.deleteView(viewIndex)`
      (`:1330`); the host splices and saves (`database-view.ts:3445-3456`) with the last-view early
      return at `:3447` as its only guard, and a grep for a confirm on either path returns nothing —
      **recorded 0 confirms across 2 delete paths** before this leg.
      Done is, **in the branch ADR-005's persistence-layer read finds unrecoverable**: `051`'s
      confirm primitive (`confirm-sheet.ts:46`) raised on both paths, one-scope, naming the view;
      decline byte-identical to no action; accept deleting exactly one view; the phone presentation
      per `048` D1. **In the branch an existing undo path covers**: no confirm, an Undo toast
      instead. Notion basis: P9, `55602f6a` / `348fd2b7` — the two-scope radio half is **not**
      adopted, because our views own no data sources. **Ruled by ADR-005**, 2026-09-07
      (Europe/Amsterdam), verbatim *"Confirm only if unrecoverable"* — no longer gated.
- [x] **The first filter rule costs one click from an empty panel, and a panel that already holds a
      rule is unchanged.** **Today: three clicks, and the empty state is a sentence — recorded 3 clicks
      to the first rule, from a zero-rule branch that draws 1 element.** The zero-rule
      branch renders `db-panel-empty` and nothing else (`filter-panel-renderer.ts:197-202`); the
      first rule takes open-panel → open-field-dropdown → pick. Done is: a searchable property list
      in that branch, built from the `toPropertyDropdownOption` vocabulary already in the file
      (`:497`), creating the first leaf through `createDefaultFilterRule` (`:90`) and `appendLeaf`
      (`:223`), with a `+ Add advanced filter` footer into the tree — and a seeded one-rule panel
      rendering byte-identical before and after, which is the negative control. Notion basis: P4,
      `86a8e66c` / `8ff7ae4b` / `1f10ae24`. The builder is untouched (`053` D4).
- [x] **A long property list is searchable where a rule is edited.** **Today: `searchable` appears
      zero times in either panel.** `grep -c searchable src/views/filter-panel-renderer.ts
      src/views/sort-panel-renderer.ts` **recorded 0** and **recorded 0**, while the flag exists on
      `createDropdownField` and is already passed elsewhere (`view-config-panel-renderer.ts:1558` (the one real pass-`true` site;
      `:2064` and `:2082` are `renderSelect`'s parameter and its pass-through)). Done is: the filter field dropdown (`filter-panel-renderer.ts:494-501`),
      the select/status value dropdown (`:576-590`) and the sort field dropdown
      (`sort-panel-renderer.ts:199-206`) rendering a search input above 8 options and not at 8, the
      gate owned inside the primitive. Notion basis: P4/P5, `1067756c` / `82d66d47` / `86a8e66c`.
- [x] **The New button's label collapses before any control is dropped.** **Today: the cluster goes
      first while the label is still drawn.** `applyToolbarChromeCollapse` hides whole clusters in
      the order `[newCluster, query, props, add]` (`toolbar-renderer.ts:2561`, targets at `:2571`)
      and the label span is created unconditionally off-touch at `:2365`. Done is: one rung at the
      head of that function collapsing the label before the `:2571` loop runs; in
      `tools/live/toolbar-collapse-sweep.ts`'s existing 250-900px sweep at 10px steps the label
      reads absent **before** the first width at which any cluster is hidden, zero-overflow holds at
      every width, and the accessible name is unchanged. The landed drop order is not reordered.
      Notion basis: P1 — the split New survives on every populated capture including the narrow
      no-tab cases (`21d71e5f`, `795eb9b5`). **Ruled by ADR-001**, 2026-09-07 (Europe/Amsterdam),
      verbatim *"Yes, icons first then the drop order"* — the conflict with `053`'s `AC-012` is
      named and the drop order stands, unmoved, after the icon step.
- [x] **The chip rail can add the next rule from the rail.** **Today: it cannot.** `render()`
      (`active-view-controls-renderer.ts:60`) draws chips, a logic toggle and one rail-level button,
      the clear-all at `:150`; `grep -rn "db-active-control-add" src/ styles.css` **recorded 0**.
      Done is: one add control per rule group, wired to the existing `toggleFilterPanel` /
      `toggleSortPanel`, present exactly when at least one chip is visible, at the landed 28px chip
      pitch (`styles.css:1821`) and carrying its own accessible name. Notion basis: P2, `d8abbe0b`;
      Anytype's own T001 read records the same add control, so this is the one adoption both
      references agree on.
- [x] **Every Notion-versus-Anytype disposition the loop named is written down, and none is
      applied over a landed ruling.** **Today: 3 of 10 ADRs — ADR-001, ADR-005, ADR-007 — were
      `Proposed`, unresolved.** Done: ten ADRs in `decision-record.md` —
      the ones a landed ruling already decides marked `Accepted` and citing it, the three the
      operator's ruled 2026-09-07 (Europe/Amsterdam) — ADR-001 and ADR-005 `Accepted`, ADR-007
      `Declined` — and ADR-010 inherited from `062` because the operator already ruled it — plus
      the seven corrections D1 requires: per-group visibility routed to `059` rather than built
      here, the
      conditional-colour reading `062` had already corrected, and five citation corrections.
- [x] **Conditional row colour has its own named view-settings row, with an explainer.** **Today:
      the view-settings panel names three controls and not this one.** `renderAppliedSummaries`
      (`view-config-panel-renderer.ts:510-518`) emits exactly **three** `db-view-config-summary-row`
      rows — Properties, Filters, Sorts — and none of them is conditional colour; the capability's
      only surface is the inline `db-conditional-format-settings` block
      (`renderConditionalFormatting`, `:747`, mounted in the **view** section at `:405`), whose
      heading carries no value summary and whose only hint is its empty state (`:782`). Done is: a
      fourth named row in that summary block, reading the rule count `applyConditionalFormat`
      already evaluates (`conditional-formatting.ts:168-206`, wired at `table-renderer.ts:85`,
      `:866`, `:911`, painted at `styles.css:1317-1319`), carrying an explainer line in the
      `hintClass()` idiom the panel already uses (`:569`, `:1688`), and opening the existing
      section rather than a second editor. The capability does not move; only its home does.
      **Operator-ruled, not proposed:** `062` ADR-003, 2026-09-06 18:32, verbatim *"Yes, own row in
      view settings"*. Notion basis: `142cef4e`, listed in `ac0d576b`, `2517d4cf`, `9e80b489` and
      `420dd630`. ADR-010 records what the ruling corrects.
- [ ] **The operator reads the refined toolbar on a device.** Four device-only checks the loop named
      — icon-only rail discoverability on a phone, the entry tier inside the phone filter sheet, the
      delete confirm as a stacked sheet, and tabs against the view switcher both references use —
      ride `053` AC-111 and are answered in the same sitting. Only the operator closes this row;
      nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Notion digest | Done | `../053-toolbar-and-view-controls/notion-screens-digest-toolbar.md`, 104 screens, thirteen patterns |
| Deep-research loop | Done | `/deep:research:auto`, **5 of 5** iterations, `stopPolicy: max-iterations`, one lineage `glm-openrouter-toolbar` on **cli-pi / `z-ai/glm-5.3-flash`** (the OpenRouter route) at `reasoningEffort: max`, 34 findings merged, 6 of 6 questions answered, **zero image reads**, 39 minutes wall. `../053-toolbar-and-view-controls/research/notion-toolbar/` |
| Opus synthesis | Done | This packet, plus the parent amendments |
| Level chosen | Done | `recommend-level.sh --loc 600 --files 10 --db` → Level 2, **48/100**, confidence **82%**, phase score **0/50** against the 25 bar. A standard child, never a phase parent. Without `--db`: the tool prints **41/100, Level 1 (Baseline)**, confidence 80% — recorded so the sensitivity is visible, and the packet stays Level 2 on the documented go-higher judgment, because the `ViewConfig` reach REQ-006 and REQ-009 have is real whether or not the flag is passed |
| Red-first anchors | Done | Every criterion re-derived on the tree at `80c2bb48` during synthesis, then **re-read at the landing after the rebase onto `31eafb60`** — twenty-seven commits that did touch `styles.css` and `view-config-panel-renderer.ts` but left the six toolbar-family source files byte-identical (`git diff --stat 80c2bb48 HEAD -- src/views/toolbar-renderer.ts …` is empty). Every anchor above holds at the landed SHA; the two that had drifted are corrected below |
| Landing verification | Done | Twenty-eight anchors re-read on the rebased tree; two citations corrected, one criterion added (the conditional-colour row), `recommend-level.sh --loc 600 --files 10 --db` reproduced at 48/100 / 82% / phase 0/50 |
| Operator rulings on ADR-001, ADR-005, ADR-007 | Done | Ruled 2026-09-07 (Europe/Amsterdam); folded into `decision-record.md`, `spec.md`, `acceptance-criteria.md` and `tasks.md` the same day. ADR-001 and ADR-005 Accepted, ADR-007 Declined |
| Implementation | Done | Six commits: the collapse rung, the Undo toast in place of a confirm, the filter entry tier and its searchable dropdowns, the chip-rail add control, the conditional-colour row, and the re-derived evidence. `npm run gate` **26 green** |
| Landing verification | Done | Rebased onto `origin/main` over twenty-seven commits; every `Met` row re-derived and mutation-tested one surface at a time; `sheet-rebuild`'s re-based check corrected and red-proved; one claim refuted (the selected tab is not restored by the Undo) and three gaps recorded. `tasks.md` T015 and T016 |

### Deviations and findings

| Item | Note |
|------|------|
| **Per-group visibility is not this packet's, and the loop's account of it was wrong** | The loop's sixth task proposed a per-group eye toggle and said `ViewConfig` would "gain the hidden-group set". It already has one: `boardHiddenGroups` is declared at `src/data/types.ts:560`, parsed and persisted (`data-source.ts:1230`, `:1352`) and read by the board (`board-renderer.ts:192`). What is missing is a **writer**, and that is `059-notion-board-refinement`'s REQ-001 and REQ-003 — a board-mounted Groups panel with per-group toggles and bulk actions, already specified. Building a second writer in the group popover would give one persisted axis two owners. Declined here and routed, in ADR-007. |
| **Three of the loop's citations did not survive the tree** | The files are unchanged since the loop read them, so this is the model approximating line numbers, not the tree moving. The zero-rule filter branch is at `filter-panel-renderer.ts:197-202`, not `:184-191`; leaf creation is `:90` and `:223`, not `:100-104`; the filter field dropdown is `:494-501`, not `:517-527`; the select/status value dropdown is `:576-590`, not `:672-690`; the sort field dropdown is `sort-panel-renderer.ts:199-206`, not `:158-168`; `renderGroupPopoverRow` is `toolbar-renderer.ts:1869-1887`, not `:1878-1896`. Every criterion above carries the verified anchor. |
| **Two of the digest's own rows are answered or stale, and both are recorded** | Its §4 P3 row calls our settings surface "a popover/sheet" and the right-docked shape a difference — the desktop side sheet has since landed (`view-config-panel-renderer.ts` `presentPanel`, `surface-shell.ts:185`), so the shape conflict dissolved before this loop ran (ADR-008). And its §6 Q4 asks whether our control cluster carries a text label to collapse: `createControlClusterButton` (`toolbar-primitives.ts:186-220`) creates an icon, an optional badge and an `aria-label`, and no text node — so the answer is no, and the density comparison lives only on the New button (ADR-002). |
| **The top-ranked task rests on an inference, and it is named as one** | REQ-001's severity argument is that a deleted view is unrecoverable. That is asserted from the absence of an undo affordance in the delete path, not from a read of the persistence layer. It is cheap to close and it is `spec.md` §10's `UNKNOWN` row until someone does. |
| **Two citations drifted under the rebase, and both are corrected at the landed SHA** | This packet was written against `80c2bb48` and landed on top of twenty-seven further commits. Two of its anchors moved with them. The chip rail's hover tint is `styles.css:1832`, not `:1831` — `:1831` is the `:focus-within` selector line, and the off-by-one predates the rebase. And the `searchable` precedent in `view-config-panel-renderer.ts` is `:1558` for the one real pass-`true` site; the other two citations, `:2060` and `:2077`, were never pass sites at all — they are `renderSelect`'s `searchable` parameter and its pass-through, and the twenty-seven commits moved them to **`:2064`** and **`:2082`**. Both corrections are made in place rather than left for the leg that would trip on them. |
| **The conditional-colour row is inherited, not discovered — and this packet had it filed as out of scope** | `spec.md` §3 listed conditional colour among the "Notion-only features … no our-side surface exists to change", which repeats the toolbar digest's own row for `142cef4e` ("Notion-only feature, no Anytype or our equivalent"). Both are wrong, and `062` ADR-003 had already corrected them before this packet was written: `applyConditionalFormat` ships (`conditional-formatting.ts:168-206`), and the operator ruled at 2026-09-06 18:32 — *"Yes, own row in view settings"* — routing the presentation work **here**. One further correction the tree forces on the inherited text: `062` ADR-003 says ours "lives in database settings", and it does not. `renderConditionalFormatting` is mounted in the **view** section (`view-config-panel-renderer.ts:405`, after the `viewConfig.viewSection` title at `:387`), and the rules are per-view — `ViewConfig.conditionalFormats` (`data/types.ts:593`), with the database-level field deprecated and migrated into views on read (`data/types.ts:427`, `data-source.ts:893-899`). So the work is the named summary row and the explainer, not a relocation. ADR-010, criterion 8, T014. |
| **Two Notion pipelines were bound to `053`** | The table pipeline landed first and holds `notion-screens-digest.md` and `research/`; this one filed as `notion-screens-digest-toolbar.md` and `research/notion-toolbar/`. Nothing was overwritten and no landed citation broke, but the collision was invisible until a rebase refused the checkout. ADR-009 records it, and the research's §15 records the fix for the next run. |
<!-- /ANCHOR:log -->

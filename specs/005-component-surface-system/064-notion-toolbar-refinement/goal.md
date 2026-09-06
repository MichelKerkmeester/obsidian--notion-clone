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
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the toolbar's five-iteration Notion research loop"
    next_safe_action: "Put ADR-001, ADR-005 and ADR-007 to the operator; they gate three of the five legs"
    blockers:
      - "ADR-001, ADR-005 and ADR-007 are Proposed and the operator's"
      - "styles.css edits are serialized by the parent's CSS lane"
      - "053 owns every file this packet edits and is sequenced ahead of it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/confirm-sheet.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "May a text-to-icon rung be added ahead of AC-012's landed drop order"
      - "Should a delete-view confirm exist at all on Notion-only evidence"
      - "Is a deleted view genuinely unrecoverable, or is the severity argument resting on an unverified inference"
    answered_questions:
      - "Per-group visibility is 059's, not this packet's: boardHiddenGroups already exists, is persisted and is read; the missing writer is 059 REQ-001/REQ-003's Groups panel"
      - "Our control cluster carries no text label, so the digest's density comparison lives only on the New button"
      - "The digest's own P3 divergence row is stale: the desktop side sheet landed after it was written"
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
| D1 | **The research is the read of record for what Notion does; the tree is the read of record for what we do.** Where the loop's synthesis and this tree disagree, the tree wins and the finding is corrected in place, dated. Four of the loop's own claims were corrected that way at this packet's opening — one substantive and three of citation — and each correction is in §4 and in `decision-record.md`, not silently absorbed. |
| D2 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the tree at `80c2bb48` before its fix is written, with the failing figure recorded. Every P0 and P1 threshold here was re-derived against the tree during synthesis rather than taken from the loop's report. |
| D3 | **Additive only, under parent D15.** This packet may add a criterion, a task or an ADR. It may not un-tick a measured row or overturn a landed Anytype ruling. Where a Notion finding contradicts one, the ADR names both readings and stays **Proposed**. |
| D4 | **What `053` ruled stays ruled.** The nested filter builder stays (`053` D4). The single icon vocabulary stays (`ADR-001`). The landed collapse drop order stays (`AC-012` / T008); ADR-001 here adds a rung ahead of it and reorders nothing. |
| D5 | **One owner per shared primitive, carried from `053` D8.** The confirm primitive is `051`'s and REQ-001 consumes it; a second confirm surface on this path would be the exact failure the five family phases were split to avoid. Per-group visibility is **`059`'s**, not this packet's, and ADR-007 records why. |
| D6 | **Three Proposed ADRs are a real gate, not a formality.** ADR-001, ADR-005 and ADR-007 each decide whether a leg exists at all. No code for REQ-001, REQ-004 or REQ-006 is written before the operator answers. |
| D7 | **No new value is minted.** Every geometry this packet writes already exists in the landed inventory the research recorded — the 28px chip pitch (`styles.css:1821`), the 11%/17% tints (`:1825`, `:1831`), the badge and tab metrics. A proposal that needs a number the tree does not already carry is a proposal that has not been measured. |
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

- [ ] **A view cannot be destroyed without a confirmation, on either path.** **Today: neither path
      confirms.** The all-views hub row pushes `run: () => actions.deleteView(index)`
      (`toolbar-renderer.ts:1180`) and the tab context menu `onClick: () => actions.deleteView(viewIndex)`
      (`:1330`); the host splices and saves (`database-view.ts:3445-3456`) with the last-view early
      return at `:3447` as its only guard, and a grep for a confirm on either path returns nothing.
      Done is: `051`'s confirm primitive (`confirm-sheet.ts:46`) raised on both paths, one-scope,
      naming the view; decline byte-identical to no action; accept deleting exactly one view; the
      phone presentation per `048` D1. Notion basis: P9, `55602f6a` / `348fd2b7` — the two-scope
      radio half is **not** adopted, because our views own no data sources. **Gated by ADR-005.**
- [ ] **The first filter rule costs one click from an empty panel, and a panel that already holds a
      rule is unchanged.** **Today: three clicks, and the empty state is a sentence.** The zero-rule
      branch renders `db-panel-empty` and nothing else (`filter-panel-renderer.ts:197-202`); the
      first rule takes open-panel → open-field-dropdown → pick. Done is: a searchable property list
      in that branch, built from the `toPropertyDropdownOption` vocabulary already in the file
      (`:497`), creating the first leaf through `createDefaultFilterRule` (`:90`) and `appendLeaf`
      (`:223`), with a `+ Add advanced filter` footer into the tree — and a seeded one-rule panel
      rendering byte-identical before and after, which is the negative control. Notion basis: P4,
      `86a8e66c` / `8ff7ae4b` / `1f10ae24`. The builder is untouched (`053` D4).
- [ ] **A long property list is searchable where a rule is edited.** **Today: `searchable` appears
      zero times in either panel.** `grep -c searchable src/views/filter-panel-renderer.ts
      src/views/sort-panel-renderer.ts` returns **0** and **0**, while the flag exists on
      `createDropdownField` and is already passed elsewhere (`view-config-panel-renderer.ts:1558`,
      `:2060`, `:2077`). Done is: the filter field dropdown (`filter-panel-renderer.ts:494-501`),
      the select/status value dropdown (`:576-590`) and the sort field dropdown
      (`sort-panel-renderer.ts:199-206`) rendering a search input above 8 options and not at 8, the
      gate owned inside the primitive. Notion basis: P4/P5, `1067756c` / `82d66d47` / `86a8e66c`.
- [ ] **The New button's label collapses before any control is dropped.** **Today: the cluster goes
      first while the label is still drawn.** `applyToolbarChromeCollapse` hides whole clusters in
      the order `[newCluster, query, props, add]` (`toolbar-renderer.ts:2561`, targets at `:2571`)
      and the label span is created unconditionally off-touch at `:2365`. Done is: one rung at the
      head of that function collapsing the label before the `:2571` loop runs; in
      `tools/live/toolbar-collapse-sweep.ts`'s existing 250-900px sweep at 10px steps the label
      reads absent **before** the first width at which any cluster is hidden, zero-overflow holds at
      every width, and the accessible name is unchanged. The landed drop order is not reordered.
      Notion basis: P1 — the split New survives on every populated capture including the narrow
      no-tab cases (`21d71e5f`, `795eb9b5`). **Gated by ADR-001**, which names the conflict with
      `AC-012` and leaves it standing.
- [ ] **The chip rail can add the next rule from the rail.** **Today: it cannot.** `render()`
      (`active-view-controls-renderer.ts:60`) draws chips, a logic toggle and one rail-level button,
      the clear-all at `:150`; `grep -rn "db-active-control-add" src/ styles.css` returns **0**.
      Done is: one add control per rule group, wired to the existing `toggleFilterPanel` /
      `toggleSortPanel`, present exactly when at least one chip is visible, at the landed 28px chip
      pitch (`styles.css:1821`) and carrying its own accessible name. Notion basis: P2, `d8abbe0b`;
      Anytype's own T001 read records the same add control, so this is the one adoption both
      references agree on.
- [ ] **Every Notion-versus-Anytype disposition the loop named is written down, and none is
      applied over a landed ruling.** **Today: they live only in a research document.** Done is:
      nine ADRs in `decision-record.md` — the ones a landed ruling already decides marked
      `Accepted` and citing it, the ones it does not marked **Proposed** and the operator's — plus
      the four corrections D1 requires: per-group visibility routed to `059` rather than built here,
      and the three citation corrections in §4.
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
| Level chosen | Done | `recommend-level.sh --loc 600 --files 10 --db` → Level 2, **48/100**, confidence **82%**, phase score **0/50** against the 25 bar. A standard child, never a phase parent. Without `--db`: 41/100, still Level 2 — recorded so the sensitivity is visible |
| Red-first anchors | Done | Every criterion re-derived on the tree at `80c2bb48` during synthesis. The six toolbar-family source files are byte-identical to the digest's reference HEAD `28e680fc` (`git diff --stat 28e680fc HEAD -- src/` names none of them), so every red is about the code and not about drift |
| Implementation | Not started | No code touched by this packet |

### Deviations and findings

| Item | Note |
|------|------|
| **Per-group visibility is not this packet's, and the loop's account of it was wrong** | The loop's sixth task proposed a per-group eye toggle and said `ViewConfig` would "gain the hidden-group set". It already has one: `boardHiddenGroups` is declared at `src/data/types.ts:560`, parsed and persisted (`data-source.ts:1230`, `:1352`) and read by the board (`board-renderer.ts:192`). What is missing is a **writer**, and that is `059-notion-board-refinement`'s REQ-001 and REQ-003 — a board-mounted Groups panel with per-group toggles and bulk actions, already specified. Building a second writer in the group popover would give one persisted axis two owners. Declined here and routed, in ADR-007. |
| **Three of the loop's citations did not survive the tree** | The files are unchanged since the loop read them, so this is the model approximating line numbers, not the tree moving. The zero-rule filter branch is at `filter-panel-renderer.ts:197-202`, not `:184-191`; leaf creation is `:90` and `:223`, not `:100-104`; the filter field dropdown is `:494-501`, not `:517-527`; the select/status value dropdown is `:576-590`, not `:672-690`; the sort field dropdown is `sort-panel-renderer.ts:199-206`, not `:158-168`; `renderGroupPopoverRow` is `toolbar-renderer.ts:1869-1887`, not `:1878-1896`. Every criterion above carries the verified anchor. |
| **Two of the digest's own rows are answered or stale, and both are recorded** | Its §4 P3 row calls our settings surface "a popover/sheet" and the right-docked shape a difference — the desktop side sheet has since landed (`view-config-panel-renderer.ts` `presentPanel`, `surface-shell.ts:185`), so the shape conflict dissolved before this loop ran (ADR-008). And its §6 Q4 asks whether our control cluster carries a text label to collapse: `createControlClusterButton` (`toolbar-primitives.ts:186-220`) creates an icon, an optional badge and an `aria-label`, and no text node — so the answer is no, and the density comparison lives only on the New button (ADR-002). |
| **The top-ranked task rests on an inference, and it is named as one** | REQ-001's severity argument is that a deleted view is unrecoverable. That is asserted from the absence of an undo affordance in the delete path, not from a read of the persistence layer. It is cheap to close and it is `spec.md` §10's `UNKNOWN` row until someone does. |
| **Two Notion pipelines were bound to `053`** | The table pipeline landed first and holds `notion-screens-digest.md` and `research/`; this one filed as `notion-screens-digest-toolbar.md` and `research/notion-toolbar/`. Nothing was overwritten and no landed citation broke, but the collision was invisible until a rebase refused the checkout. ADR-009 records it, and the research's §15 records the fix for the next run. |
<!-- /ANCHOR:log -->

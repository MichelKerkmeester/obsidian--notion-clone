---
title: "Goal: Stacked Sheets"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "048 goal"
  - "stacked sheets goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-06T16:20:00Z"
    last_updated_by: "code-agent"
    recent_action: "Registered the three depth-3 stacked capture scenarios; T025 closed"
    next_safe_action: "The operator device read (T022)"
    blockers:
      - "Operator device confirmation is the only row that closes this phase"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
      - "src/views/popover-position.ts"
      - "src/views/dropdown-field.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-goal"
      parent_session_id: null
    completion_pct: 92
    open_questions: []
    answered_questions: []
---
# Goal: Stacked Sheets

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A sheet opened from inside another sheet reads as one stack — the child overlays the
parent in place, the parent dims and scales back and does not move, and the child carries the same
header, close and scroll grammar as a first sheet.

**Why.** `044` gave a first sheet its grammar and the operator confirmed the buttons work on 0.0.23.
The next report was about the second sheet: *"stacked sheets dont look or work right"*. Nothing in
the plugin models a stack. `overlay-stack.ts` is a LIFO dismissal registry that carries a `parentId`
nothing ever reads, every sheet takes the same `z-index: var(--db-layer-modal, 1000)`, and one
shared `.db-mobile-sheet-scrim` node sits behind all of them at once.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Operator-owned, open.** An Obsidian `Modal` opened from inside a sheet — create property, a confirm, a date picker — either presents as a sheet on the phone or the phone flow uses a sheet instead of the modal. **Recommendation: present as a sheet**, because `DbModal` already declares a presentation and the alternative forks every one of these flows into a phone branch and a desktop branch. See §3 of `spec.md`. |
| D2 | The parent does not move. A child opening changes the parent's opacity and scale only; its bounding box is unchanged, |Δ| ≤ 1px on every edge. A parent that slides is the defect this packet exists for. |
| D3 | Exactly one scrim, and it belongs to the topmost sheet. Two sheets open means one scrim between them, not one behind both. |
| D4 | The keyboard inset belongs to the topmost sheet only. Two sheets holding different `--db-mobile-sheet-bottom` values is the defect `popover-position.ts:447-461` already records in prose. |
| D5 | A stacked child carries `044`'s grammar unchanged: a header with a title and a 44px close, 16px row inset, 16px title. A child with no header is non-conforming however it was opened. |
| D6 | The stack owns depth; no surface computes its own. `overlay-stack.ts`'s `parentId` becomes load-bearing rather than decorative, and depth is read from it. |
| D7 | Dismissing a child returns to the parent with its state intact — scroll position, draft values, focus. A child close that rebuilds the parent is a regression, not a refresh. |
| D8 | `003` stays the portal owner, `016` stays the drag owner, `044` stays the grammar owner. This packet consumes all three unchanged and adds the stacking layer above them. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] **The inventory exists and is code-derived.** Every surface that can open while another sheet
      is open, grouped parent → child → opener kind → current → target, each row citing a
      `file:line` opener. **Today: no such document exists**; `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
      censuses surfaces one at a time and never asks which opens over which. **Pre-fix: 0 stacked
      pairs named anywhere in the tree; now 31 registered in the lane, three of them three deep.**
- [x] **A parent sheet's bounding box does not move when a child opens**, measured on both edges.
      **Today: unmeasured, and no code path reads the parent when a child mounts** —
      `setSheetMount` (`mobile-bottom-sheet.ts:274`) appends the child to the body and touches
      nothing else.
- [x] **Exactly one scrim while two sheets are open, and it sits between them.** **Today: 1 scrim
      behind both** — `setScrim` (`mobile-bottom-sheet.ts:478`) reuses a single
      `.db-mobile-sheet-scrim` node for however many sheets are open, by design.
- [x] **Every stacked child carries a header with a 44px close.** **Today: 5 surfaces call
      `createSheetHeader` or its equivalent** (`filter-panel-renderer.ts:259`,
      `sort-panel-renderer.ts:113`, `toolbar-renderer.ts:1386`, `create-linked-view-modal.ts:59`,
      `view-config-panel-renderer.ts:388`) **and not one of them is a stacked child.**
- [x] **The topmost sheet holds the keyboard inset and the sheet beneath it holds zero**, proven by
      a negative control. **Today: each sheet writes its own `--db-mobile-sheet-bottom` at its own
      placement time** (`popover-position.ts:406`), which is why the operator's filter sheet sits
      at the top of the screen while its own dropdown sits at the bottom. **Pre-fix: red on all 31
      registered pairs, the parent holding 336px; now child 336px and parent 0px on all 31.**
- [x] **`npm run gate` exits 0 with a permanent lane row per stacked pair, each observed red before
      green.** **Today: `sheet-grammar`'s registry holds 8 surfaces and every one of them is a
      first sheet** (`tools/live/sheet-grammar.mjs:46-68`); no stacked pair is registered.
- [ ] **The operator opens the Properties sheet, the filter sheet's operator dropdown and its
      property picker on iOS and reports each as one stack rather than two sheets.** Only the
      operator closes this row; nothing in this repository can.
- [x] **The stacked pair on iOS draws one close control, one continuous surface, no dead space
      above the title, and no parent bleed.** **Added 2026-09-06** from the operator's 10:04 report
      on 0.0.29 (`../roadmap.md` §4 row 59; capture `operator-ios-stacked-sheet-bug-20260906.png`,
      the operator's own, not committed to this repository). Four defects observed red on device,
      pre-fix, on Edit property → Month stacked over Properties: a second oversized circular close
      control floating above the child's header beside the header's own `×`; the child's body
      painting a lighter surface than its own header, so one sheet reads as two; roughly 200 CSS px
      of blank sheet above the title; and the parent Properties sheet bleeding through with its
      rows and a "14" count badge over the toolbar, its own header offset. Done is a device-pixel
      read of a recaptured depth-2 pair: **1** close control in the child's header, **one**
      background value across header and body, the title's ink inside the header's own padding
      box, and **0** parent ink above the child's top edge. Fix leg
      `worktrees/159-fix-048-ios-stacked-sheet`; the grammar half is `044`'s, the shell half
      `051`'s, and both are cross-referenced rather than restated here.

      **Fourth clause amended in place and dated, 2026-09-06.** "0 parent ink above the child's top
      edge" was written from the report and did not survive being measured. The stacking model was
      **observed red nowhere**: on both engines, before the fix as much as after it, the child
      registers with the overlay stack, derives its parent, resolves depth 2, and one scrim sits at
      z-index 1001 between the parent's 1000 and the child's 1002 while the parent holds
      `is-stack-parent` at opacity 0.88. The parent visible above the child is C10's floating frame
      doing what it specifies — inset 8px left, right and bottom, radius 16px, measured 8/382/836 in
      a 390x844 viewport. The clause now reads: **the parent below is dimmed and pulled back with
      one scrim between the two, and no parent ink reaches the child's own frame.** Recorded at
      `e632a1e1`, in `decision-record.md`'s 2026-09-06 ~10:44 note.

      **Met, on the amended clause set.** Fix `be578988`, guard `772b24d2` (`tasks.md` T024 carries
      both). Measured at `main` `5aeb7087` on the `properties edit property` pair, Chrome and
      WebKit: `exactly one visible close control (found 1)`; `header and body share one background`;
      `sheet root paints an opaque fill (color(srgb 0.179412 0.179412 0.179412))`; `handle-to-title
      gap <=80px (measured 34.4px)` against the **74.4px** the empty native title produced pre-fix;
      `parent dims and scales back`; `exactly one scrim`; `child depth 2 (want 2)`. Read by eye on
      the recaptured depth-2 pair landed at `5aeb7087`
      (`screenshots/notion-clone/panels/constructed-modal-sheet-property-editor-stacked-mobile-{dark,light}.png`,
      opened directly in this reconciliation): one `×` in the child's header, one continuous fill
      from the child's grab handle through its Save row, the title sitting inside the header's own
      padding box, and the parent Properties sheet behind and above the child's frame rather than
      through it. **The device read itself is not this row** — that is the criterion above, and it
      is the operator's.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the 0.0.23 device check | Done | Operator 2026-09-05 07:02 CEST, iPhone, build 0.0.23; screenshots `../scratch/device-2026-09-05/stacked-properties-create-property.png`, `stacked-filter-operator-dropdown.png`, `stacked-filter-property-picker.png` |
| Gate | Done | `npm run gate` `$?` 0, 25 lanes green, 0 red |
| Operator confirmation | Pending | AC-009; ships in 0.0.24 |
| Level chosen | Done | `recommend-level.sh --loc 600 --files 13 --architectural` → Level 2, 64/100, confidence 82%; phase score 10/50 against a threshold of 25, so a standard child |
| Stacked-surface inventory | Done | T001, `stacked-surface-inventory.md` §3 |
| Stacking model | Done | T005-T009; depth, one scrim between the top two, top-only inset, parent treatment |
| Per-child migrations | Done | T010-T016; K1/K3/K4 migrated, K2/K5/K6 already closed by `044` and the gantt leg |
| Lane row per stacked pair | Done | T017-T019; **31 pairs**, three at depth 3, 253 red before 0 green |

### Deviations and findings

| Item | Note |
|------|------|
| D1 was answered ACCEPTED rather than deferred | `decision-record.md` ADR-001. Modals opened from a sheet present as sheets, which covers all 19 `DbModal` subclasses in one change and closes the `fullscreen` question with them. |
| The K5 native `Menu` row was already closed | `rg "new Menu\("` returns nothing in `src`; `calendar-timeline-renderer.ts` reaches `createOwnedMenuForEvent` on the tree this packet opened against. Recorded rather than re-migrated. |
| K2 and K6 needed no work | `044`'s closing leg had already given the owned menu and the date, icon and colour pickers a `createSheetHeader`. The inventory listed them because it was written against the state before that leg landed. |
| Three defects were found by building the model, not by the reports | The dim was written and never rendered (specificity), a press inside a child closed the parent (a hand-kept exemption list), and re-placing a parent detached it. Each is fixed at its producer and recorded in `decision-record.md` or `implementation-summary.md`. |
| The inventory is not written into `003`'s document | This packet's write authority is its own folder. `003/sheet-and-dropdown-inventory.md` is cited as the per-surface census and extended along the stacking axis here rather than edited in place, so neither document restates the other. |
| `044`'s three named `applySheetChrome` bypasses read differently now | `icon-picker-popover.ts:229` and `option-color-picker.ts:104` both reach `positionToolbarPopover` in the current tree, which applies the chrome. Recorded, not re-adjudicated: the count is `044`'s to close. |
| The native `<select>` in the Add view sheet is gone | `003`'s inventory §8 records one at `toolbar-renderer.ts:1371`. `rg 'createEl\("select"' src` returns nothing today, so `044` T008's dropdown swap landed. One fewer stacked child of a native kind. |

### 2026-09-06 amendment: the 10:04 iOS stacked-sheet report

**Operator, 2026-09-06 10:04, on iOS running 0.0.29**, verbatim: *"This sheet is really bad bugged
on current ios make sure the sheet phase gets an extra deep research loop once done and verified as
planned like 10 iters with glm 5.3 flash max, properly prompt them so they dont get stuck use
openrouter or devpass than let a opus synthesize and update / add phases to remediate as needed"*.

**Two things, and they are separated on purpose.** The first is a defect report against a shipped
build; the second is a standing instruction about how this family is checked once it is done. This
packet carries the first as a completion criterion above and a task below. The second is not this
packet's to run — it spans `044`, `048` and `051` and starts only when all three are done and
verified — so it is recorded as a planned leg in `051/goal.md`'s own amendment, with its executor
spec, and cited from here rather than duplicated.

**What the screenshot shows**, read as four separate defects rather than one: a duplicate close
control (an oversized circular `×` floating above the child's header, beside the header's own);
split backgrounds (the child's body paints lighter than its header, so the surface reads as two);
roughly 200 CSS px of blank sheet above the title; and parent bleed (the Properties sheet's rows and
its "14" count badge showing over the toolbar, with the parent header offset). **Ownership is
three-way and none of it is contested**: the close control and the header/body ink are `044`'s
grammar, the stacking geometry and the parent treatment are this packet's, and the shell that draws
both is `051`'s `surface-shell.ts`. The fix leg runs in `worktrees/159-fix-048-ios-stacked-sheet`
and lands after `051`'s side-sheet leg frees `surface-shell.ts` and `mobile-bottom-sheet.ts`.

**What this does not do.** It does not reopen T005-T009's stacking model or any of the six ticked
criteria above — those were measured on a depth-2 pair in the harness and their numbers stand. The
device shows a shape the harness does not construct, which is the gap, not a withdrawal.
<!-- /ANCHOR:log -->

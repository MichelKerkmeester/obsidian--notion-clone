---
title: "Goal: Modal and Sheet Componentization"
description: "The durable directive for the modal/sheet family phase, and the criteria that decide when it is done."
trigger_phrases:
  - "051 goal"
  - "modal componentization goal"
  - "sheet shell primitive goal"
  - "confirm primitive goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/051-modal-and-sheet-componentization"
    last_updated_at: "2026-09-05T14:00:00Z"
    last_updated_by: "orchestrate-handover-19"
    recent_action: "Authored the packet in-runtime from a source census"
    next_safe_action: "Execute T001, the shell census true-up, then T002's red-first measurements"
    blockers:
      - "The external leaf that drafted this packet wrote only create.sh scaffolding; every document here is in-runtime work and has no upstream draft to reconcile against"
      - "styles.css edits are serialized by the parent's CSS lane"
    key_files:
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/modals/confirm-modal.ts"
      - "specs/005-component-surface-system/050-anytype-adoption/design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-051-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Do the three FuzzySuggestModal subclasses join the shell, or stay Obsidian-native with a shim"
      - "Does the fullscreen presentation survive as a third mode, or collapse into the sheet with a height role"
    answered_questions:
      - "The confirm primitive belongs to this packet; 055 references it rather than re-specifying it"
      - "048's stacking model is a constraint here, not a deliverable and not re-specified"
      - "Anytype's replace-in-place-with-back pattern for sub-pages is captured and adopted (design-trueup.md REQ-002)"
---
# Goal: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Reduce every modal and every sheet in the plugin to **one shell primitive** — one
definition that produces the desktop modal and the phone sheet, owns the header, the close, the
drag, the placement and the entrance, and carries the sub-page navigation Anytype's captures show —
plus **one confirm primitive** every destructive path routes through; and keep what the program has
ruled stays ours.

**Why.** The operator's instruction of 2026-09-05, verbatim: *"research recommendations and how to
tackle / update / improve every modal, sheet and general ui ux to take the best from AnyType and
componentize stuff as much as possible."* `044` gave a first sheet its grammar and `048` gave a
second sheet its stacking model. Neither owns the **shell**: today the family is `DbModal`'s
presentation switch, `mobile-bottom-sheet.ts`'s 840-line engine with nineteen exports, twelve
independent `createSheetHeader` call sites, and three `FuzzySuggestModal` subclasses that reach
past `DbModal` to call `attachSheetChromeToModal` themselves. One surface's chrome is four
decisions taken in four files.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures first, and this is a gate rather than a preference.** Every shell behaviour this packet adopts is trued against a real Anytype screen before it is written. `050`'s `design-trueup.md` is the read of record and this packet consumes it rather than re-reading the sweep; a behaviour that document marks *design inferred from source code, not seen* carries that label here too, in its own task. Nothing is designed from a guess about a screen nobody opened. |
| D2 | **Red first, per criterion, on a threshold.** Every criterion in `acceptance-criteria.md` carries one number or one boolean, observed failing on the current tree before the work is written, with the failing figure recorded in `checklist.md`. A threshold that cannot be made to fail is not a threshold — the six false premises `050` found are the scar this decision exists to avoid repeating. |
| D3 | **Desktop and phone, both, per surface.** The shell has one definition and two presentations; a surface that lands on desktop only is half done. Where a behaviour has no phone expression, the task says so and says why. Silence is not a disposition. |
| D4 | **`044`'s sheet grammar and `048`'s stacking model are constraints, not deliverables.** `044`'s seven elements bind every phone surface the shell produces; `048`'s stacking model binds every surface that can open over another, and this packet **does not re-specify it** — the twelve registered surfaces and thirty-one registered stacked pairs in `tools/live/sheet-grammar.mjs` must still pass after every leg. |
| D5 | **The confirm primitive is this packet's, and it is the only one.** `ConfirmModal` (`modals/confirm-modal.ts`) and its `openAndWait` become the single confirm path, gain `044`'s header grammar, and are exported for every consumer. `053`'s sort-conflict confirm and `055`'s destructive-confirm state both **reference** this primitive; neither builds a second. |
| D6 | **Kept ours, per the program's rulings.** The table view, formulas/rollups/calculations, the Project Manager 1:1 board and gantt parity (`037`/`038`), `023`'s editable note body, and the bottom sheets' *ownership* (`003`/`016`/`031`) are not redesigned here. A shell change that moves a reference pixel is wrong until the parity captures are re-read and shown unchanged. |
| D7 | **One leg touches one file group.** Legs are grouped by file, so `mobile-bottom-sheet.ts` and `db-modal.ts` are each opened once rather than once per surface. `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |
| D8 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over unchanged: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. And the two values `050` **refused** stay refused: the `#232323` row highlight at 1.14:1, and colour-only active-state signalling. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there.
`../roadmap.md` §4 maps report to phase, §5.A places this phase, §6A holds the operator decisions
this packet consumes (header everywhere, 16px sheet inset and title, `048` D1's modals-as-sheets
ruling, the "debugged, refined, perfected" bar), and §7 the conflicts.

**The design read of record is `../050-anytype-adoption/design-trueup.md`,** not `047`'s research.
Where the two disagree, the true-up wins — that is `050`'s ADR-003, Accepted 2026-09-05, and it
binds every packet that designs against an Anytype screen.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **One shell primitive produces every modal and every sheet, and the replaced vocabularies are
      gone.** **Today: four.** `DbModal.applyPresentation` (`modals/db-modal.ts:92-113`) decides
      one; `attachSheetChromeToModal` is called directly by three non-`DbModal` surfaces
      (`src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`);
      `createSheetHeader` is called independently at **twelve** sites; and `getSheetTitle`
      (`db-modal.ts:83-88`) recovers a title by **scraping the first `h1`/`h2`/`h3` in the content**
      because no surface declares one. Done is one constructor, one declared title per surface, and
      the three direct `attachSheetChromeToModal` callers routed through it or dispositioned in
      `modal-surface-inventory.md` with a written reason.
- [ ] **Every modal surface in the family is dispositioned in `modal-surface-inventory.md`:
      surface → shell role → presentation → changes → Anytype pattern with its capture or its named
      gap → stays ours.** **Today: no such table exists.** The census it is built from is real and
      counted from source at HEAD: **20** `extends DbModal` subclasses, of which **13** declare
      `sheet`, **4** declare `fullscreen` and **3** inherit the `sheet` default; **3**
      `FuzzySuggestModal` subclasses outside `DbModal` entirely; **12** `createSheetHeader` call
      sites; and `mobile-bottom-sheet.ts` at **840 lines** with **19 exports**.
- [ ] **A sub-page inside a shell replaces in place with a back affordance, and a picker opened from
      a shell opens as its own surface over an undimmed parent.** **Today: neither pattern exists as
      a shell affordance** — a sub-page is whatever its own surface builds, and `048`'s stacking is
      the only thing a child surface inherits. This is `design-trueup.md` REQ-002's captured finding
      (`anytype-view-settings-panel-dark.png`: tapping `Layout` swaps the panel body inside the same
      360px frame and the header becomes `‹ Layout`; `+ New filter` opens a 256px picker that
      overlaps its parent, which stays fully visible and undimmed), and it is the phone-correct
      pattern `048` REQ-002 already prefers — a parent that does not move is cheaper than a parent
      that dims and scales back.
- [ ] **One confirm primitive, carrying `044`'s seven grammar elements, is the only confirm path.**
      **Today: 0 of 7.** `ConfirmModal` declares `sheet` (`modals/confirm-modal.ts:42`,
      `super(app, "sheet")`) and inherits `DbModal`'s chrome, but the phase that owns the confirm as
      a *primitive* does not exist, so `053`'s sort-conflict confirm and `055`'s destructive-confirm
      state each name a confirm nobody exports.
- [ ] **The shell's geometry and motion read from the values `050` measured, not from per-surface
      literals.** **Today: per-surface literals**, and the shell has no geometry of its own. The
      adopted values are `design-trueup.md` §2 and §4: **8px** popover radius, **16px** horizontal
      and **8px** vertical padding, **8px** divider clearance, **28px** rows (adopted as the
      measured Anytype value *and* our own `design-system.md` §9 coarse-pointer floor — the named
      deviation from the 4/8/12/16/24/32 scale, recorded rather than absorbed), **360px** for the
      `panel` role, and motion **enter 200ms `ease-out` / exit 150ms `ease-in`**. On the phone the
      floor is `044`'s **44px** close, unchanged.
- [ ] **`npm run gate` exits 0 read from `$?`, with one permanent lane row per shell deliverable,
      each negative control observed red before green**; `npm run replay` holds with reversed 0; the
      **12** registered `sheet-grammar` surfaces and **31** registered stacked pairs still pass; and
      the board and gantt reference captures are `pixelHash`-identical to their baseline or the
      difference carries an operator ruling.
- [ ] **The operator opens a modal, a sheet, a sub-page and a destructive confirm on iOS and on
      desktop and reads them as one surface family, debugged, refined, perfected.** Only the
      operator closes this row; nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the operator's componentization instruction | Done | Operator 2026-09-05, verbatim in §1 |
| Level chosen | Done | `recommend-level.sh --loc 1600 --files 18` → Level 2, **51/100**, confidence **90%**, phase score **20/50** against a 25 threshold, so a standard child. Raised to **Level 3** on judgment, the same call `050`, `052`, `053` and `055` made at comparable numbers — the shell binds every surface in the plugin |
| Source census of the modal and sheet families | Done | §3 criterion 2, every figure counted from HEAD |
| Designs trued against the captures | Done by reference | `../050-anytype-adoption/design-trueup.md` §2 (measured geometry), REQ-002 (sub-page navigation), §4 Motion. This packet consumes that read rather than repeating it |
| `modal-surface-inventory.md` | Pending | T001 |
| Red-first measurements | Pending | T002 fills `checklist.md`'s Today column |
| Shell and confirm legs | Pending | T003-T009, one leg per file group |
| Lane rows | Pending | T010-T011 |
| Device pass | Pending | T012, operator-owned, stays unticked |

### Deviations and findings

| Item | Note |
|------|------|
| **This packet had no usable upstream draft** | The external leaf (GLM 5.3 flash, `worktrees/080-phase-modal-componentization`) ran `create.sh` and died before writing content: `spec.md` was 15 lines of scaffold comment, `plan.md` 8, `tasks.md` a bare title line, and `goal.md`, `checklist.md`, `acceptance-criteria.md` and `decision-record.md` were absent. Every document in this packet is in-runtime work. Recorded because the four sibling packets *were* drafted externally and reviewed, and this one was not — the two have different provenance and a later reader should not assume otherwise. |
| The title is scraped, not declared | `getSheetTitle` (`db-modal.ts:83-88`) finds the first `h1`/`h2`/`h3` in `contentEl` that is not already inside `.db-sheet-modal-header`, and falls back to `t("menu.title")`. It works, and it means a surface's sheet title is a side effect of its heading markup. The shell asks for a declared title; the scrape survives as the fallback for a surface that does not declare one. |
| `fullscreen` is a third presentation with four users | `ChartDrilldownModal` (`chart-renderer.ts:972`), `InvalidTimeEventsModal` (`:78`), `FormulaModal` (`:217`) and `PropertyTypeConflictModal` (`:90`). Whether it survives as a mode or collapses into the sheet with a height role is `spec.md` §11's first open question — not pre-decided here, because the formula workbench is 1,664 lines and stays ours. |
| `048` D1 already moved the modals | The operator's 2026-09-05 ruling — Obsidian modals opened from a sheet on the phone become stacked sheets, none stay modals — landed at `915591c2` and gave all subclasses the shared header. That is the reason this packet is componentization rather than repair: the behaviour is right and the code that produces it is in four places. |
<!-- /ANCHOR:log -->

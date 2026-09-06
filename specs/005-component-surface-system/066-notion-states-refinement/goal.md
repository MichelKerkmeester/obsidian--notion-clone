---
title: "Goal: Notion States Refinement"
description: "The durable directive for the Notion refinement of 055's state, feedback and motion surfaces, and the thresholds that decide when the refinement is done."
trigger_phrases:
  - "066 goal"
  - "notion states refinement goal"
  - "action toast dwell"
  - "inline stale reference chip"
  - "fast band census"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-06T16:10:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the Notion states research loop"
    next_safe_action: "Take ADR-001 and ADR-002 to the operator, then start T001"
    blockers:
      - "ADR-001 and ADR-002 are the operator's: both hold a landed Anytype ruling against new Notion evidence"
      - "styles.css edits are serialized by the parent's CSS lane"
      - "the 5000ms dwell in REQ-001 is an inference with no measured source, pending ADR-003"
    key_files:
      - "src/views/toast.ts"
      - "src/views/database-view.ts"
      - "src/views/empty-state-renderer.ts"
      - "styles.css"
      - "specs/005-component-surface-system/055-states-feedback-and-motion/goal.md"
      - "specs/005-component-surface-system/055-states-feedback-and-motion/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does a second destructive red weight enter the confirm primitive, or does the single danger boolean hold"
      - "Does the toast stack stay in the Anytype-measured bottom-right corner"
      - "Is 5000ms the right dwell for an action-carrying toast, or does the device pass move it"
      - "Does the fast band get an explicit ease-out token, or does ease become the one fast-band curve"
    answered_questions:
      - "Notion corroborates the E4 confirm/undo split rather than contesting it"
      - "The empty-state ladder and the reduced-motion coverage are richer here than in either reference"
      - "Notion offline is not applicable: connectivity is Obsidian's domain, not this plugin's"
---
# Goal: Notion States Refinement

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Refine `055`'s state, feedback and motion surfaces against the Notion screen harvest —
give an action-carrying toast a window a reader can actually act inside, route the operation failures
this plugin owns through the toast instead of a bare host notice, add the one error shape Notion has
that we do not, and take `055`'s own tracking documents back to what the tree says.

**Why.** The Notion harvest mostly corroborates what `055` built. A five-iteration
`/deep:research:auto` loop on GLM 5.3 flash max read the digest against the tree
(`../055-states-feedback-and-motion/research/research.md`, 23 findings, 5 of 5 questions answered,
stop reason `maxIterationsReached`) and found three genuine gaps, one documentation defect, and two
places where Notion disagrees with a landed Anytype ruling.

The gaps share one shape: **a surface that works right up to the moment it has to carry an action.**
`toast.ts` auto-dismisses every success toast at `AUTO_DISMISS_MS = 2200` (`toast.ts:62`, applied at
`:137`) — a budget inherited from the operation-result rail, never measured for undo — and the
delete-then-Undo flow raises its toast as `severity: "success"` *with an Undo attached*
(`database-view.ts:8369-8373`). The component's own header comment reserves the wait-for-the-reader
behaviour for errors, "because a failure that vanishes on its own is a failure nobody had to see";
an expired Undo is that failure class reached through the success path. Two lines below that toast,
`deleteRow`'s catch raises a bare `new Notice` (`database-view.ts:8378`) with no severity icon, no
action and no wait — one of **242** bare-notice sites, and the rail's own `showOperationResult`
(`:11316-11334`) already models the fix correctly. And Notion splits its error surfaces by blast
radius in a way we do not: a blocking modal for a failed action (`screen:53f4023b`, `screen:f318b5e0`)
against a permanent inline chip for a stale reference (`screen:9748e66c`). We ship the persistent card
and the transient toast; the chip has no shape at all.

**Nothing here overrides a landed ruling.** Two Notion patterns contradict one: the destructive-red
weight and the toast placement. Both are recorded as **Proposed** ADRs holding the Anytype ruling,
with the reason, and both are the operator's to close. Parent `goal.md` D15 binds: the refinement is
additive, and a Notion finding never silently overrides a landed Anytype ruling.

**Corrected against what landed on `main` while this packet was being written**, because a synthesis
that reports a fixed defect is worse than one that reports nothing. `a7188274` gave the toast its
sixth surface role and its honourable Undo, which is why the toast call sites in `database-view.ts`
and `embedded-database-renderer.ts` exist to be measured at all. `3b3ac633` landed the `source-missing`
state and re-pinned the ratchet, which is why `EmptyStateReason` now carries **14** members
(`empty-state-renderer.ts:25-39`) rather than the 12 `055`'s own criterion still claims. Every line
number in this packet was re-read against `38bba1e3` rather than carried from the loop: the loop
cited `AUTO_DISMISS_MS` at `:77` and it is at `:62`; it cited the fourth fast-band literal at
`styles.css:22638` and it is at `:22745`; it counted nine reduced-motion blocks and there are ten.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The digest is the only source of Notion facts, and the tree is the only source of ours.** No image file is opened by this packet; every Notion claim carries a `screen:<id>` that resolves in `../055-states-feedback-and-motion/notion-screens-digest.md` §2. Where the loop's report and the tree disagree, the tree wins and the finding is corrected in place, dated — five of the loop's own line anchors were corrected that way at this packet's opening. |
| D2 | **No Notion number is adopted.** The digest states no device-pixel ratio, so every Notion figure in it is capture-scale-relative. This packet adopts Notion **shapes and behaviours**; every number comes from the Anytype-measured token system, from an in-tree constant, or from an ADR that says it is an inference. |
| D3 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the tree at `38bba1e3` before its fix is written, with the failing figure recorded. Four of the five buildable criteria were already red on arrival; none needed a failure invented for it. |
| D4 | **A conflict is named and proposed, never applied.** Parent D15 and `051` ADR-007 bind: where a Notion finding contradicts a landed Anytype ruling, this packet records a **Proposed** ADR naming both readings and stops there. It may add a criterion, a task or an ADR; it may not un-tick a measured row or rewrite a ruling. |
| D5 | **The toast is the pattern for the rest**, carried from `055` D5. This packet does not migrate 242 notice sites; it migrates the owned operation-failure paths and leaves the lane open with a census that has to move. |
| D6 | **A lane row asserts a computed value, never a presence.** Every row added here reads a computed style, a measured rect or a census count and carries its own negative control, watched red first. Existing lanes are extended; no new lane file is created, and the operator device rows are never ticked by this packet. |
| D7 | **`055` owns the vocabulary; this packet owns the refinement.** The seven-state vocabulary, the motion token set and the confirm/undo split are `055`'s contracts and are constraints here, not deliverables. This packet does not re-specify any of them. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there, and **D15
binds this packet specifically**: it is one of the eight reserved Notion-refinement children, it is
additive, and it never silently overrides a landed Anytype ruling.

**The owner surface is `../055-states-feedback-and-motion/`.** Its `goal.md` §3 carries the criteria
this packet refines, its `design-trueup.md` is the read of record for every Anytype value, and its
`decision-record.md` ADR-005 owns the motion token set. Where this packet and the true-up disagree
about an Anytype value, the true-up wins (`050` ADR-003).

**The research read of record is `../055-states-feedback-and-motion/research/research.md`**, with the
lineage trail beside it under `research/lineages/` (git-ignored, on disk).

**`../roadmap.md` §5.A places this phase, §6A holds the operator decisions it consumes, and §7
the conflicts.**

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **A toast that carries an action stays long enough to act on, and a plain success does not.**
      **Observed red 2026-09-06 at `38bba1e3`: one budget, 2200ms, for both.**
      `AUTO_DISMISS_MS = 2200` is the only dismissal constant in the component
      (`src/views/toast.ts:62`) and the only `setTimeout` reads it unconditionally for every
      `success` toast (`:137`), including the delete-then-Undo toast that attaches an `Undo`
      (`src/views/database-view.ts:8369-8373`) and the gallery-migration toast that attaches one
      (`:2718-2723`, `src/views/embedded-database-renderer.ts:793`). Notion carries undo in a toast
      with an action slot on both platforms (`screen:7a0e976e`, `screen:56f376d3`) but a still
      cannot show a duration, so **no Notion number is adopted** (D2). Done is: a toast carrying an
      action stays connected **≥5000ms**, a plain success still clears at **2200ms**, an `error`
      still waits for the reader, and one lane row reads the two computed budgets apart.
- [ ] **Every operation failure this plugin owns reports through the toast, with the census moving.**
      **Observed red 2026-09-06: 242 bare `new Notice(` sites, and three of them are the same
      `errors.deleteFailed` key.** `deleteRow`'s catch (`src/views/database-view.ts:8378`),
      `duplicateRow`'s catch (`:8468`) and the third site at `:3681` all raise a host notice with no
      severity icon, no action and no wait-for-the-reader — two lines below a `showToast` that has
      all three. The rail already models the fix: `showOperationResult`
      (`:11316-11334`) mounts the owned toast with a severity and an `Undo`/`Retry` action, and
      marks the rail `db-surface` so the reduced-motion reset reaches the card. Notion splits its
      error surfaces by blast radius and gives a failed action a blocking, dismissible surface
      (`screen:53f4023b`, `screen:f318b5e0`) rather than a passive line. Done is: every
      `errors.*` catch in `database-view.ts` that reports an owned operation renders
      `.db-toast.is-error`, `is-error` never auto-dismisses, and the bare-notice census for owned
      operations has moved from **242** with the new figure recorded in the lane row.
- [ ] **A stale reference has an inline, permanent, actionable shape.**
      **Observed red 2026-09-06: `grep -c "db-inline-chip" styles.css` is 0.** `source-missing` and
      `group-relation-deleted` both ship as `EmptyStateReason` members
      (`src/views/empty-state-renderer.ts:25-39`) and both render through `renderCard`
      (`:295-330`) — a full card, in every context including compact ones. Notion's third error
      shape is a permanent inline chip: warning triangle, label, chevron, tap to reconfigure
      (`screen:9748e66c`), a shape our vocabulary has no member for. It touches no Anytype ruling —
      the inline chip is in Anytype's own vocabulary as `design-trueup.md` reads it. Done is: a
      compact-context stale reference renders the chip, the chip never auto-dismisses, it carries
      `aria-live="polite"` that today's rail does not, its background is a host token composed with
      `color-mix` and **zero hex literals**, and its tap target meets the host's interactive floor.
- [ ] **`055`'s own tracking documents say what the tree says.**
      **Observed red 2026-09-06: five load-bearing rows are stale, verified one at a time.**
      (1) The toast criterion (`../055-states-feedback-and-motion/goal.md:118-121`) reads *0 of 247*
      notice sites and says `notice.galleryMigrated` "promises an Undo the notice cannot carry" —
      the census is **242** and that message is delivered by `showToast` with an `Undo`
      (`database-view.ts:2718-2723`; the key is at `src/i18n.ts:1473`). (2) The item-9 criterion
      (`:105-117`) reads *12 reasons ship, 0 of them is the deleted-relation state* at
      `empty-state-renderer.ts:24-36` — there are **14** at `:25-39`, and both
      `group-relation-deleted` and `source-missing` are among them. (3) The E4 criterion
      (`:172-179`) reads *RED … `row-menu.ts:166-176` calls `confirmWithModal` and `deleteRow`* —
      the confirm is gone and the range carries the landed "No confirm here" comment
      (`src/views/row-menu.ts:163-171`). (4) The motion criterion (`:157-165`) reads *42 transition
      declarations hand-type `120ms`* and cites the token at `styles.css:113` — there are **4**
      real declarations and the token is at `:122`. (5) `tasks.md` T003 (`:102`) and the T019
      amendment (`:652`) are unticked against work the tree shows landed. Done is: every restated
      figure carries a same-day `file:line` verification taken from the tree, no figure is copied
      from this packet or from the digest without re-checking, and each old claim is reproduced as
      false before its replacement lands.
- [ ] **The fast motion band has one owner and no raw literals.**
      **Observed red 2026-09-06: 4 untokenized declarations, all `ease-out` against a token that is
      `ease`.** `styles.css:200`, `:473`, `:7431` and `:22745` hand-type `120ms ease-out`, while
      `--db-transition-fast` is `120ms ease` (`:122`) — so a blind migration to the token silently
      changes the curve, which is why the census has not moved on its own. Five residual
      `var(--db-transition-fast)` uses remain (`:2037`, `:5461`, `:5678`, `:20214`, `:21854`)
      against `--db-motion-fast` (`:142`). The digest contributes nothing here and cannot: a still
      is not a duration. Done is: raw fast-band duration literals **= 0** with comments excluded,
      the ease-versus-ease-out choice recorded as an ADR rather than absorbed, and the lane row
      counting declarations rather than grep hits.
- [ ] **The operator rules the two held conflicts and reads the refined surface on a device.**
      Two Notion findings contradict a landed Anytype ruling and are held as **Proposed**: the
      second destructive red weight (`screen:28751c29` text-only against `screen:348fd2b7` filled,
      against one `danger` boolean at `src/views/modals/confirm-modal.ts:28` themed to `mod-warning`
      at `src/views/confirm-sheet.ts:69`) and the toast placement (`screen:56f376d3` centred iOS
      pill against the Anytype-measured bottom-right card at `styles.css:2724-2736`). Two device
      facts ride the existing operator pass: **D-1**, iOS `Reduce Motion` stops the shimmer and
      snaps entrances inside the plugin's WKWebView, and **D-2**, the Undo target is one-hand
      reachable at the rail's clamped phone width `min(384px, calc(100vw - 32px))`
      (`styles.css:2756-2767`), without which a 5000ms window is a number and not an affordance.
      Only the operator closes this row; nothing in this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is a running record. It never overrides the directive above.

### Progress

| Date | Entry |
|------|-------|
| 2026-09-06 | Packet opened from the Opus synthesis of the Notion states research loop: one lineage (`glm-openrouter-states`, cli-pi on `z-ai/glm-5.3-flash` at reasoning max), 5 of 5 iterations under `stopPolicy: max-iterations`, 23 findings merged, 5 of 5 questions answered, zero image reads. Level 3 by the go-higher rule over `recommend-level.sh --loc 500 --files 14 --architectural` (64/100, confidence 82%; phase score 10/50, so a standard child, not a phase parent). |

### Deviations and findings

| Date | Entry |
|------|-------|
| 2026-09-06 | **Five of the loop's line anchors had drifted and are corrected here, not carried.** `AUTO_DISMISS_MS` is at `toast.ts:62`, not `:77`; the fourth fast-band literal is at `styles.css:22745`, not `:22638`; the residual token uses are at `:20214` and `:21854`, not `:20110` and `:21747`; the reduced-motion block count is **10**, not nine; `row-menu.ts`'s landed comment sits at `:163-171`, not `:166-176`. The findings all survive the correction; only the anchors moved. |
| 2026-09-06 | **The loop's own digest-drift record is inherited.** The digest cites `modals/confirm-modal.ts`, which resolves at `src/views/modals/confirm-modal.ts`, and `showOperationResult` at `database-view.ts:9433-9437`, which is now `:11316-11334`. Both are recorded rather than corrected in the digest, which is a dated read. |
| 2026-09-06 | **The 5000ms dwell is an inference and is marked as one.** No capture can show a Notion duration, and the 2200ms it replaces is itself an unmeasured inheritance from the operation-result rail (`../055-states-feedback-and-motion/design-trueup.md:350`; `decision-record.md:452-460` measures only the 0.2s Anytype transition). ADR-003 carries the reasoning; D-2 is the check that would move the number. |
| 2026-09-06 | **Five Notion patterns were refused with a reason and are not in this packet.** The radio-choice consequence picker (no consumer: our views are configs and nothing here destroys a data source), the in-trash persistent banner (`screen:15f3126a` — a future trash/restore phase, and it inherits a Bin-shaped design question from E4's own logic), two-tier loading (`screen:a483c1af` — conditional on a multi-step async surface that does not exist), the onboarding-hint component (out of scope, no criterion), and Notion's offline pattern (`screen:a335360d` — connectivity is Obsidian's domain and no surface here owns sync state). Each is in the research's Eliminated Alternatives table with its evidence. |
<!-- /ANCHOR:log -->

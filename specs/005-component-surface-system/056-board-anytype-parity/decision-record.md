---
title: "Decision Record: Board Anytype Parity"
description: "The decisions this packet takes, starting with the reversal of the board half of the 2026-09-04 Project Manager 1:1 ruling."
trigger_phrases:
  - "056 decision record"
  - "board parity reversal adr"
  - "anytype board adr-001"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "design-leaf"
    recent_action: "added adr-004, the measured accessibility declines from t001"
    next_safe_action: "Carry the superseding note into 038 and 047, then run T002"
    blockers:
      - "None: all four ADRs here are Accepted; the ungrouped-column string is the operator's"
    key_files:
      - "src/views/board-renderer.ts"
      - "specs/005-component-surface-system/038-board-kanban-port/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The board half of the 2026-09-04 Project Manager 1:1 ruling is superseded; the gantt half is not"
      - "Parity by default is inherited from 051 ADR-007 without re-asking"
      - "045's card-property mechanism is kept and retargeted, not rebuilt"
      - "Four accessibility declines and one platform decline, each with its measured ratio"
---
# Decision Record: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:decisions -->
## ADR-001: The board's parity target moves from Project Manager to Anytype

**Status**: **Accepted** — 2026-09-05 ~22:45, operator.

**Context.** On 2026-09-04 the operator ruled *"copy their board view 1:1 from Project Manager"*.
`038-board-kanban-port` did exactly that and shipped it in 0.0.16, 0.0.18, 0.0.19 and 0.0.20; its
T12 in-repo half was verified at `c563f08` with fourteen carried-forward elements matched to the
pixel. `../roadmap.md` section 4 rows 37 and 38 hold the operator-only halves of that comparison
for the board and the gantt respectively, and on 2026-09-05 the operator added *"align closer"* to
both, which `047-competitor-references-and-pm-alignment` picked up as T012-T014.

Then the operator saw Anytype. On 2026-09-05 ~22:45, verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

and, asked to disambiguate how far "etc." reached:

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*

**Decision.** The board is rebuilt against Anytype's captured kanban. This **supersedes the board
half** of the 2026-09-04 Project Manager 1:1 ruling. The gantt half is untouched: `037`'s copy
stands, and rows 37/38's *"align closer"* now applies to the gantt alone.

**Why the split is coherent rather than arbitrary.** Anytype ships no timeline layout. There are
six set layouts in the capture sweep — Grid, Gallery, List, Kanban, Calendar, Graph — and no gantt
among them. There is no Anytype timeline to port the gantt to, so the gantt keeps the only 1:1
reference it has. The table is a third case and is neither: it stays ours, with Anytype grid
patterns adopted where the captures show them better, which `050`, `053` and `054` already carry.

**Consequences.**
- `038-board-kanban-port`'s shipped board is superseded, not deleted. Its documents keep their
  record as history and carry a superseding note pointing here.
- `047`'s T012-T014 narrow to the gantt. The board half of that leg was stopped on the night of
  2026-09-05 with two uncommitted files in worktree `impl-047-align`, disposable.
- `../roadmap.md` section 7.12 records this as a conflict resolved by the newer instruction, named
  rather than silently overwritten — section 7's own rule.
- Three shipped releases carry a board that is now off-target. Nothing is rolled back; the board is
  rebuilt forward.

**Alternatives rejected.**
- *Keep the Project Manager board and add Anytype touches.* Rejected: the operator said *"almost
  1:1 Anytype"*, and a hybrid is neither reference, which is exactly the state the align-closer
  rows were opened against.
- *Move the gantt too.* Rejected by the operator's own clarification, and impossible besides —
  there is no Anytype timeline layout in the capture sweep to move it to.
- *Reopen `038` rather than open a new phase.* Rejected: `038` shipped and verified a different
  target. Reopening it would make its record say two contradictory things at once. The operator
  also asked for phases explicitly — *"Make sure we have phases for that"*.

---

## ADR-002: Parity by default on the board, with accessibility as the only ground for declining

**Status**: **Accepted** — inherited from `051` ADR-007 (operator: *"Yes, parity by default"*,
2026-09-05 ~18:30), applied here without re-asking.

**Context.** `051` established the posture for the modal and sheet family: every value the captures
show is adopted, and the only permitted grounds for declining one are WCAG 1.4.11 (non-text
contrast), WCAG 1.4.3 (text contrast) and a 44px touch floor. The board is the same operator, the
same reference product and the same week.

**Decision.** The board adopts every captured value. A declined value names its accessibility
ground and its measured ratio or size. Taste is not a ground, and neither is "ours is fine".

**Consequences.**
- One decline is already known and recorded: the sticky scrollbar's colours. Anytype's
  `#B6B6B6`/`#EBEBEB` is a fixed light-theme pair, and this is an Obsidian plugin where the
  reader's theme owns scrollbar chrome. The **geometry** is adopted; the colours are not
  (`050/design-trueup.md` REQ-003). This is a platform ground rather than an accessibility one and
  is named as such rather than filed under WCAG.
- `050`'s two refusals carry over unchanged: the `#232323` row highlight at 1.14:1, and
  colour-only active-state signalling.

**Alternatives rejected.**
- *Adopt the scrollbar colours too.* Rejected: it would paint a fixed light-theme grey over every
  dark Obsidian theme, which is a worse outcome than the deviation.

---

## ADR-003: `045`'s card-property mechanism is kept and retargeted, not rebuilt

**Status**: **Accepted** — orchestrator decision, reversible default.

**Context.** `045-board-card-properties` shipped on main at `56a34199` and owns which properties
appear on a board card and the panel that configures them. A rebuild of the board could plausibly
absorb it.

**Decision.** The mechanism stays. Only the presentation of its property rows moves to the captured
card's row shape. `board-card-properties-panel.test.ts` staying green **without modification** is
the guard, and is written as AC-006.

**Consequences.**
- A leg that needs to edit that test to pass has broken the mechanism rather than retargeted the
  presentation, and must stop.
- `045`'s ADR-001 — which cites `007-gallery-view-deprecation` as the reason the gallery does not
  share this mechanism — is unaffected.

**Alternatives rejected.**
- *Fold the mechanism into the new card construction.* Rejected: it is shipped, tested and
  operator-visible; rebuilding it would put a working feature at risk for no captured reason.

---

## ADR-004: The four accessibility declines T001 measured, and the two values that look declinable and are not

**Status**: **Accepted** — 2026-09-05, on T001's capture read. ADR-002 is the posture; this is the
list it demanded.

**Context.** ADR-002 says every captured value is adopted and a decline must name WCAG and a number.
`design-trueup.md` sections 2 and 3 measured the board, and Anytype's **light theme** fails WCAG
1.4.3 on the board systematically rather than in one place. The dark theme passes everywhere it was
sampled, 4.96:1 to 13.71:1, and is adopted verbatim.

**Decision.** Four declines, each with its ratio, plus one platform decline carried from ADR-002.

- **E1 — the light-theme option colour as bare text (WCAG 1.4.3).** The column-header chip puts the
  raw option hue on the page background at ~13px. Five of the seven rendered colours are below
  4.5:1: yellow `#C09B26` **2.64:1**, amber `#B97C37` **3.50:1**, grey `#888888` **3.54:1**,
  ungrouped `#828282` **3.84:1**, red `#C45426` **4.52:1**. The replacement is **Anytype's own
  answer**, taken from its card chip: the tint fill plus the darkened text of the same hue, which
  measures **6.11:1** for that amber. The chip's shape, 24px height, 12px radius and 8px inset are
  adopted unchanged; only the unfilled treatment in light theme is declined.
- **E2 — the light-theme secondary text on the card (WCAG 1.4.3).** `#828282` on `#FFFFFF` =
  **3.84:1** carries the type line and every property value on every card. Anytype's dark-theme
  equivalent `#A3A3A3` on `#191919` = **6.97:1** passes, so the role and the rhythm are adopted and
  the hex is replaced by the lightest theme grey that clears 4.5:1. Same shape as `051` ADR-007 E2.
- **E3 — the destructive row (WCAG 1.4.1).** `Move to Bin` in `anytype-menu-kanban-card-menu-*`
  measures `#E1E1E1` dark / `#252525` light, **identical to every other row**; only the trash icon
  distinguishes it. `051` ADR-007 E3 already ruled on this family. Our destructive row keeps red
  plus the icon. Unchanged; recorded here because A12 is where it lands on the board.
- **E4 — the control glyphs (WCAG 1.4.11).** The phone's `···` measures `#A7A7A7` on `#FFFFFF` =
  **2.41:1** and is the only element identifying the column menu on a surface with no hover to
  reveal an alternative. The desktop `···` and `+` fail the same 3:1 bar at `#9B9B9B` = **2.78:1**.
  The geometry is adopted — 28 x 28px slot, 14 x 14px glyph, 15.3pt on phone — and the glyph colour
  is replaced by one clearing 3:1. Dark theme adopted verbatim at 6.72:1.
- **X1 — the scrollbar colours (platform, now with a number).** ADR-002 already declined
  `#B6B6B6`/`#EBEBEB`. T001 measured the pair at **1.70:1** thumb-on-track, so the platform argument
  now also has a WCAG figure. Filed as platform rather than accessibility, as ADR-002 asks.

**Two values that look declinable and are adopted anyway, with the reason.**

- **The 1px card border at 1.11:1 dark / 1.12:1 light.** A card is a control, so 1.4.11 appears to
  apply. It does not: the card is identified by its title, icon and content, and the border divides
  adjacent cards rather than identifying the control. A hairline that merely divides content does
  not carry the 3:1 bar. **Adopted verbatim, both themes.** Our existing hover shadow stays as a
  second signal and is labelled *design inferred*, since no capture holds a pointer.
- **The 20px chip and the 25px property row.** Neither is a touch target: on the phone the target
  is the **card**, at 74.7pt. The one phone control below the 44px floor is the `···`, at 15.3pt of
  ink, and a static capture cannot measure its hit area — so **our own 44px floor applies to it**.
  That is a floor added on top of parity, not a deviation from a measured value, and it is recorded
  so a later reader does not mistake it for one (`051` design-trueup section 8d, same distinction).

**Consequences.**
- Every decline above is a **light-theme** decline. The dark theme is adopted hex for hex.
- E1's fix is not a new palette. It is Anytype's own card-chip treatment applied to a place Anytype
  left bare, so parity is preserved at the level of the pattern even where the literal pixel is not.
- One divergence is **not** an accessibility decline and is escalated instead: the ungrouped column
  reads **"No value"** on desktop and **"Uncategorized"** on phone. Parity cannot be satisfied both
  ways; the operator picks the string. Recorded as an open question in `spec.md` section 12.

**Alternatives rejected.**
- *Adopt the light-theme option colours as-is and let the theme fix it.* Rejected: the ratios are
  measured against Anytype's own white, not against a hypothetical theme, and four of the five
  failures are below 4:1 rather than marginal.
- *Decline the whole light theme and ship dark-only parity.* Rejected: only five colour roles fail,
  and every geometric value in the light captures matches its dark twin to the pixel.
<!-- /ANCHOR:decisions -->

---
title: "Decision Record: Board Kanban Port"
description: "One record: the 1:1 Project Manager board this packet shipped is superseded as a target by the operator's 2026-09-05 Anytype ruling."
trigger_phrases:
  - "038 decision record"
  - "board kanban port superseded"
  - "pm board target superseded"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "recorded the board target superseded by the operator anytype ruling"
    next_safe_action: "Nothing here; 056-board-anytype-parity carries the work from now on"
    blockers:
      - "T12's operator half (roadmap section 4 row 37) is now asked against Anytype, and is 056's AC-010"
    key_files:
      - "src/views/board-renderer.ts"
      - "specs/005-component-surface-system/056-board-anytype-parity/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The shipped 1:1 board is not rolled back; it is the baseline 056 replaces"
---
# Decision Record: Board Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: This packet's parity target is superseded, and its shipped board is not

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

This packet exists because of one operator instruction, 2026-09-04: *"copy their board view 1:1
from Project Manager"*. It did that. The port shipped in 0.0.16, 0.0.18, 0.0.19 and 0.0.20; T12's
in-repo half was verified at `c563f08` with fourteen carried-forward elements matched to the pixel;
the line-height gaps a fresh in-repo side-by-side found were closed at `74a26419` and trued twice
more. `src/views/board-renderer.ts` still constructs the 39 `pm-*` classes that port introduced.

On 2026-09-05 at roughly 22:45 the operator replaced the reference product for the board. Verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*

This record exists so that a reader of this packet does not have to discover that from another
folder.
<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**The board's parity target moves to Anytype. This packet's shipped code does not move at all.**

Two different things are superseded and not superseded, and conflating them is the mistake this
record is written to prevent:

- **Superseded:** the *target*. Project Manager is no longer what the board should look like. Any
  future claim that the board is correct *because it matches Project Manager* is now false.
- **Not superseded:** the *port*. It stays on main, it stays shipped, and it is the baseline
  `../056-board-anytype-parity/` replaces. Nothing is reverted. `038`'s verification record — T12,
  `c563f08`, the fourteen matched elements — remains an accurate account of what was done and how
  it was checked.

**T12's operator half** (`../roadmap.md` §4 row 37) survives as a question but changes product: the
operator's own side-by-side in the vault is now against Anytype, and it is tracked as `056`'s
AC-010 rather than here.
<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

- `../056-board-anytype-parity/` was opened the same minute and carries the board from here. Its
  own ADR-001 is the primary record; this one is the pointer a reader of `038` needs.
- `047-competitor-references-and-pm-alignment`'s board comparison (T012, AC-005) is withdrawn —
  `047` ADR-007 — because measuring this board against Project Manager now measures divergence from
  a reference it is no longer meant to match.
- **The gantt is unaffected.** `037-timeline-gantt-port`'s 1:1 copy stands, because Anytype ships
  six set layouts — Grid, Gallery, List, Kanban, Calendar and Graph — and no timeline among them.
  There is no Anytype gantt to move to. §4 row 38 keeps its Project Manager reference.
- Three shipped releases carry a board that is now off-target. That is recorded rather than
  corrected: `056` rebuilds forward and its `implementation-summary.md` says plainly that the
  shipped board is not current intent.
- `../roadmap.md` §7.12 records the underlying conflict — one sentence ruled on twice in opposite
  directions, with only half of it reversed — as a conflict resolved by the newer instruction.
<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives rejected

- **Revert the port.** Rejected: the shipped board is a working board, and reverting it would leave
  users with the older one while `056` is built. `056` replaces it in place.
- **Reopen this packet and rebuild the board here.** Rejected: `038` shipped and verified against a
  different target. Reopening it would make its own record say two contradictory things at once,
  and the operator asked for phases explicitly.
- **Say nothing here and let `056` carry the whole story.** Rejected: a reader arriving at `038` —
  from a commit message, a roadmap row or a code comment — would find a packet claiming a verified
  1:1 Project Manager board with nothing indicating the target had changed underneath it.
<!-- /ANCHOR:adr-001-alternatives -->
<!-- /ANCHOR:adr-001 -->

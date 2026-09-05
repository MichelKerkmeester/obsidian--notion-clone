---
title: "Decision Record: Calendar Parity Port"
description: "One record: the Project Manager calendar parity this packet shipped is superseded as a target by the operator's 2026-09-05 Anytype ruling."
trigger_phrases:
  - "039 decision record"
  - "calendar parity port superseded"
  - "pm calendar target superseded"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "recorded the calendar target superseded by the operator anytype ruling"
    next_safe_action: "Nothing here; 057-calendar-anytype-parity carries the work from now on"
    blockers:
      - "057 ADR-002 is operator-owned: whether the week and day scales this port built survive"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "specs/005-component-surface-system/057-calendar-anytype-parity/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Do the three scales this port shipped survive Anytype parity (057 ADR-002)"
    answered_questions:
      - "This was a behavioural port, not a markup one: zero pm-* classes were introduced"
---
# Decision Record: Calendar Parity Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: This packet's parity target is superseded, and its shipped calendar is not

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

This packet ported Project Manager's calendar and shipped in 1.4.6. It stands at 5 of 6 in
`../roadmap.md` §5.A and is not operator-confirmed.

On 2026-09-05 at roughly 22:45 the operator replaced the reference product for the calendar, in the
same breath as the board. Verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*
<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**The calendar's parity target moves to Anytype. This packet's shipped code does not move.**

- **Superseded:** the *target*. Project Manager is no longer what the calendar should look like.
- **Not superseded:** the *port*. It stays on main, it stays shipped, and it is what
  `../057-calendar-anytype-parity/` retargets in place. Nothing is reverted.

**One thing about this port matters more than it did this morning, and it is worth writing down
here where its own record is.** This was a **behavioural** parity port, not a markup one:
`src/views/calendar-renderer.ts` constructs 91 `db-calendar-*` classes and **zero** `pm-*` classes.
So the retarget cannot be measured the way the board's is. `057` ADR-003 records that its
counterpart to `056`'s headline threshold — a Project Manager class count driven to zero — was
deliberately **not written**, because it would have read green on an untouched tree and certified
nothing. That finding is about this packet's shape, which is why it is repeated here.
<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

- `../057-calendar-anytype-parity/` was opened the same minute and carries the calendar from here.
  Its ADR-001 is the primary record; this one is the pointer a reader of `039` needs.
- **One question this port's own work opens is now operator-owned.** This packet shipped three
  scales — `updateCalendarScale?(scale: "month" | "week" | "day", ...)` at
  `src/views/calendar-renderer.ts:82`, with seven scale-switch classes, a 22-class week body and a
  keyboard suite. Anytype ships one calendar layout and no captured scale switch. Whether the week
  and day scales survive is `057` ADR-002, **Proposed**, and nothing infers it.
- **The phone half has no reference.** iOS Anytype ships no calendar layout at all — there is no
  calendar capture anywhere under `screenshots/anytype/mobile/`. Every phone value `057` writes
  will carry the label *"design inferred from desktop"*, counted by its AC-007.
- **The gantt is unaffected**, and the reason applies here too: Anytype's six set layouts include
  no timeline, so `037`'s 1:1 copy keeps the only reference it has.
- `../roadmap.md` §7.12 records the board's half of this ruling as a conflict resolved by the newer
  instruction. The calendar's half is not a conflict — no earlier ruling named a calendar reference
  product — which is why it is recorded as a decision in §6A rather than a contradiction in §7.
<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives rejected

- **Revert the port.** Rejected: it ships a working calendar, and `057` retargets it in place.
- **Reopen this packet.** Rejected: it shipped against a different target, and reopening it would
  make its record contradict itself. The operator asked for phases explicitly.
- **Fold the calendar into the board's packet.** Rejected: different renderer, different reference
  set, a different kind of threshold, and a phone situation the board does not have. One packet
  would have hidden all four differences.
- **Say nothing here.** Rejected: a reader arriving at `039` would find a shipped Project Manager
  parity port with nothing indicating its target had been replaced.
<!-- /ANCHOR:adr-001-alternatives -->
<!-- /ANCHOR:adr-001 -->

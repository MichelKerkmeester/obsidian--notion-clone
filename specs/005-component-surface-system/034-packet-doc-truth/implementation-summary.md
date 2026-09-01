---
title: "Implementation Summary: Packet Doc Truth"
description: "Eleven drifted claims re-derived from the tree, and the measured reason a mechanical check for them cannot be a gate lane."
trigger_phrases:
  - "034 implementation summary"
  - "doc drift corrections"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-09-01T00:30:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Independent audit run: 10 of 11 verified, and the one it caught was fixed"
    next_safe_action: "Nothing outstanding; the packet-wide review is the operator's to schedule"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034-impl"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "No mobile-named fixture holds a switch, so its coarse-pointer reach is still unmeasured"
    answered_questions:
      - "A path-existence check catches the class but cannot separate description from planning"
---
# Implementation Summary: Packet Doc Truth

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 034-packet-doc-truth |
| **Level** | 2 |
| **Status** | In progress — eleven corrected and independently audited; awaiting device rows elsewhere |
| **State** | `validate.sh --strict` Errors: 0 for every folder touched. Gate 18 green |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT WAS CORRECTED

All eleven, each re-derived from the tree rather than reasoned about, and each given the command
that yields it where the value is one that grows.

| ID | Was | Is |
|---|---|---|
| F004 | Twenty phase folders | **35** |
| F008 | 19,261 stylesheet lines · 196 captures | **20,124** · **236** |
| F007 | `006` Planned | **In progress** |
| F014 | `004` Contested | **Resolved**, per `roadmap.md` §7.1 |
| F012 | `010`–`017` lack `plan.md` | all eight carry `plan.md` and `tasks.md` |
| F011 | the deleted factory narrated as live | corrected in **three** places, not the one cited |
| F003 | `openSurface()` given as the create path | decision kept, marked superseded with why |
| F005 | reads as current state | dated as a 2026-08-29 transcript |
| F006 | six empty evidence cells, stale values | **B1 and B3 evidenced**; B2, B4, B5, B6 left open with what would settle each |
| F009 | `database-view.ts:11421` | the symbol and its grep — the method is at 11490 |
| F015 | a comment citing a deleted export | the reasoning stands on its own terms |

**Three of the eleven were understated.** F011 named one bullet; the deleted factory was narrated as
live in three places. F006 named missing completion marks; the "today" column was stale in every row
as well.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE TWO CORRECTIONS THAT WERE NOT REWRITES

Not every drifted document should be edited into agreement with today.

**F005 is a transcript.** It records commands run on 2026-08-29 with their outputs and exit codes.
The gate has since gone from 16 lanes to 18 and `main.js` has been rebuilt many times — but
updating those numbers in place would turn a true record into a false one. It is dated instead, with
a line saying what has changed since. The finding it carries is untouched: the app was never driven.

**F003 is a decision.** `openSurface()` really was the decision at the time. It is left standing
with a superseded note recording that the factory was deleted for having zero importers, zero tests
and no presence in the shipped bundle. What was untrue was presenting it as the *current* create
path, which is what a reader arriving at it would take it for.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| Every number re-derived | Each carries the command that produces it, so the next reader re-derives rather than re-trusts |
| F006 not over-claimed | Only B1 and B3 were ticked, against `checkbox-appearance.json` totals. The other four stayed open with what would settle each — the two that closed do not carry the four that did not |
| Metadata regenerated | Every touched folder, then validated: **Errors: 0** for `000`, `004`, `009`, `028`, `031`, `032`, `033`, `034` |
| The gate is unaffected | `npm run gate` 18 green, exit 0 read from `$?` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

**T6 has now run, and it caught one.** An independent read-only audit on `cli-devin` re-derived all
eleven from the tree: 10 verified, 1 wrong. The wrong one was F009 — the correction had swapped a
stale line number for a fresh line number, and unrelated edits to that same file later in the
session carried the method from 11490 to 11522. It was confirmed by hand before being accepted, and
the address is now removed rather than updated a third time.

**That is the whole thesis of this packet, demonstrated on its own work.** The audit found it by
running the command the document prints directly beside its own claim — a check already written and
not re-run, which is precisely the blind spot a self-check cannot cover.

**The contradiction surfaced here has since been RESOLVED**, by a visual pass that read the captures
rather than the numbers. `checkbox-appearance.mjs` measured every fixture on one 1200px fine-pointer
page, so `@media (pointer: coarse)` never applied — `list-mobile` was reported at 16×16 while a
phone renders 28×28. The roadmap's 34×28 and the artefact's 34×18 were never in conflict: same
control, two pointer modes, one of which the instrument could not see. Mobile fixtures are now
measured with `hasTouch`, all 53 mobile checkboxes read 28×28, and B6 is evidenced.

**Adjacent drift was found and not fixed.** `roadmap.md` lines 339 and 412 still route `004` to
"UNKNOWN — three sources disagree" while §7.1 of the same document is titled "resolved" and says
"Settled." That is the same class inside a document this phase's findings do not name, left for a
follow-up rather than absorbed.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DECISIONS

| Item | Note |
|---|---|
| The mechanical check exists and is **not** a gate lane | `scan-spec-references.mjs` catches the class — a canonical spec doc naming a source path that does not exist. It cannot be gated, for a structural reason rather than a tuning one: a spec names a path both to describe what IS and to specify what WILL BE, and the path alone cannot separate them. Measured — 3,597 hits tree-wide, 3,569 of them in completed packets; 28 here, of which 26 are planning rows and **0** are genuine drift. Gating 28 known-benign hits trains people to ignore a red lane, which is this packet's own failure mode |
| The zero is the useful result | The scanner reports no true drift here *because* the corrections say the file was deleted, and it skips deletion sentences by design. It agrees with the fixes rather than merely being quiet |
| Numbers carry their command | Every corrected count is dated and given the one-liner that regenerates it. The mechanism named in `spec.md` §1 is that these were all true when written; a number without its source is the same trap re-armed |
| Line numbers replaced by symbols | F009's `database-view.ts:11421` became a symbol plus a grep. An address into a growing file expires with no one touching it, which is drift nobody can be blamed for |
| The first fix to F009 was still an address, and it rotted in hours | "Now at 11490" was written, and edits elsewhere in the same file moved the method to 11522 in the same session. Correcting a stale number by writing a fresher number is not a correction, it is a shorter fuse. No figure is given there now |
| A sub-agent finding was weighed, not adopted | The audit's one WRONG was confirmed by hand — `grep -n 'refresh(options'` returns 11522, line 11490 is blank — before any document changed |
<!-- /ANCHOR:decisions -->

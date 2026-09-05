---
title: "Acceptance Criteria: Gallery Usage and Migration Audit"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 1 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-05T06:55:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the audit phase"
    next_safe_action: "Run T004 and record the surface list"
    blockers: []
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Gallery Usage and Migration Audit

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/001-usage-and-migration-audit
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the tree at the audit sha, **When** every site that accepts, mints or coerces `viewType: "gallery"` is enumerated, **Then** the list includes the one known survivor — the settings sanitizer at `main.ts:146`/`:182` — and every site found by the `viewType`-assignment sweep, each with a `file:line`. **Today: no such list exists**; `030` recorded two picker filters and nothing else, and this packet's own first draft named a second survivor (the `.base` importer) that had already been fixed at `main.ts:1577` | The list in `implementation-summary.md`, each entry re-derivable from a recorded command | Unmet | - |
| AC-002 | REQ-002 | **Given** the 24 gallery-touching entries in `screenshots/manifest.json`, **When** each is read against its scenario definition, **Then** it is labelled gallery-only or board-shared, and every board-shared one names what board coverage it contributes. **Today: 4 of the 6 ids are board-shared and nothing records which** | The classification table, checked against `tools/screenshots/scenarios/*.mjs` and `constructed-scenarios.mjs` | Unmet | - |
| AC-003 | REQ-003 | **Given** the six `gallery*` `ViewConfig` fields, **When** each is compared against the board's equivalent, **Then** every loss is named individually. **Today: `030`'s own migration comment names the cover carry-over and nothing enumerates the rest** | The declared-loss list; each entry quotable verbatim into `004`'s CHANGELOG | Unmet | - |
| AC-004 | REQ-004 | **Given** the gate as it stands, **When** every check that reads the gallery is listed, **Then** the list covers the coverage pins, the bench and driver, the constructed scenario, the capture scenarios, the render-assertion harness, the placement checks and the unit specs | The measurement inventory, cross-checked against `rg -ril gallery tools/` returning 31 files | Unmet | - |
| AC-005 | REQ-005 | **Given** the operator's vault, **When** gallery-configured views are counted, **Then** a number is reported — or the vault is reported unreadable from this session. A zero that is really an absence of evidence fails this row | The count, or the explicit unavailability statement | Unmet | - |
| AC-006 | REQ-001 | **Given** the parent's `spec.md` §4 inventory, **When** the audit contradicts it, **Then** the parent is corrected rather than the audit softened. Child detail outranks a parent summary | A diff to `../spec.md` §4, or an explicit statement that the audit confirmed it | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Nothing has run. Every row is `Unmet` and each names its failing state today rather than leaving the
cell blank — AC-001 has no list, AC-002 has no classification, AC-003 has no enumeration. AC-005 is
the row most likely to be answered dishonestly, which is why it says so explicitly: an unreadable
vault reports as unreadable, never as zero.
<!-- /ANCHOR:closure -->

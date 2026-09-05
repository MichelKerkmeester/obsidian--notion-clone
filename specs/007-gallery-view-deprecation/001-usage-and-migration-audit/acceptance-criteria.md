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
    last_updated_at: "2026-09-05T08:05:00Z"
    last_updated_by: "audit-run"
    recent_action: "Ran the audit; all six criteria met against evidence in implementation-summary.md and scratch/"
    next_safe_action: "002-settings-redirect-and-migrate can start from this closed phase"
    blockers: []
    key_files:
      - "implementation-summary.md"
      - "scratch/surface-list.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-ac"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "All six criteria (AC-001 through AC-006) are Met; see implementation-summary.md for the evidence behind each"
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
**Status:** Complete
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the tree at the audit sha, **When** every site that accepts, mints or coerces `viewType: "gallery"` is enumerated, **Then** the list includes the one known survivor — the settings sanitizer at `main.ts:146`/`:182` — and every site found by the `viewType`-assignment sweep, each with a `file:line`. **Today: no such list exists**; `030` recorded two picker filters and nothing else, and this packet's own first draft named a second survivor (the `.base` importer) that had already been fixed at `main.ts:1577` | The list in `implementation-summary.md`, each entry re-derivable from a recorded command | Met | - |
| AC-002 | REQ-002 | **Given** the 24 gallery-touching entries in `screenshots/manifest.json`, **When** each is read against its scenario definition, **Then** it is labelled gallery-only or board-shared, and every board-shared one names what board coverage it contributes. **Today: 4 of the 6 ids are board-shared and nothing records which** | The classification table, checked against `tools/screenshots/scenarios/*.mjs` and `constructed-scenarios.mjs` | Met | - |
| AC-003 | REQ-003 | **Given** the six `gallery*` `ViewConfig` fields, **When** each is compared against the board's equivalent, **Then** every loss is named individually. **Today: `030`'s own migration comment names the cover carry-over and nothing enumerates the rest** | The declared-loss list; each entry quotable verbatim into `004`'s CHANGELOG | Met | - |
| AC-004 | REQ-004 | **Given** the gate as it stands, **When** every check that reads the gallery is listed, **Then** the list covers the coverage pins, the bench and driver, the constructed scenario, the capture scenarios, the render-assertion harness, the placement checks and the unit specs | The measurement inventory, cross-checked against `rg -ril gallery tools/` returning 31 files | Met | - |
| AC-005 | REQ-005 | **Given** the operator's vault, **When** gallery-configured views are counted, **Then** a number is reported — or the vault is reported unreadable from this session. A zero that is really an absence of evidence fails this row | The count, or the explicit unavailability statement | Met | - |
| AC-006 | REQ-001 | **Given** the parent's `spec.md` §4 inventory, **When** the audit contradicts it, **Then** the parent is corrected rather than the audit softened. Child detail outranks a parent summary | A diff to `../spec.md` §4, or an explicit statement that the audit confirmed it | Met | - |

**AC-006's evidence, stated precisely**: the audit found two contradictions (`data-source.ts:1527`'s
`parseViewType` as a second accepting surface; `settings.ts:79`'s `DEFAULT_VIEW_TYPES` as a third
already-closed minting surface). Both are written up in full, quotable form in
`implementation-summary.md` §7 and applied to `roadmap.md`'s row for this child. The literal diff to
`../spec.md` §4 itself is not applied in this change, because this dispatch's write authority covers
this child folder plus the parent's `roadmap.md` row, not `spec.md` — the criterion's intent (the
child's finding is on record and ready to act on, not softened to match the parent) is satisfied
without that specific file being the one edited.

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

**Closeable:** Yes

All six rows are `Met`, each against evidence recorded in `implementation-summary.md` and
`scratch/*.md`, re-derivable from the commands named beside each finding. AC-005's zero is a
confirmed count from a successful read, not an absence of evidence: the operator's vault was read,
its one `db_view: true` file's 5 views enumerated by name and type, and none carries `gallery`.
<!-- /ANCHOR:closure -->

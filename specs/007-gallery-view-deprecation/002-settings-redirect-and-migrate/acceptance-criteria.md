---
title: "Acceptance Criteria: Gallery Settings Redirect and Migration"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 2 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T07:10:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the redirect and migration phase"
    next_safe_action: "Wait for 001; its surface list decides this phase's REQ set"
    blockers:
      - "001's audit must land before this phase's REQ set is final"
    key_files:
      - "spec.md"
      - "src/main.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Gallery Settings Redirect and Migration

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/002-settings-redirect-and-migrate
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
| AC-001 | REQ-001 | **Given** a settings file declaring `viewType: "gallery"`, **When** settings load, **Then** the value coerces like any other unrecognised type. **Failing value today: it does not** — `main.ts:144` and `:180` exempt `gallery` explicitly | A unit observed red before green on the loaded-gallery case | Unmet | - |
| AC-002 | REQ-001 | **Given** a `.base` file carrying a `cards` view, **When** it is imported, **Then** the resulting view is a **board**, and the image field still passes the schema guard. **Failing value today: it becomes a gallery** — `main.ts:1548-1616` | A unit importing a `.base` `cards` view and asserting `viewType === "board"` plus the guarded image field | Unmet | - |
| AC-003 | REQ-002 | **Given** a vault view configured as a gallery, **When** it is opened in the standalone host, **Then** it renders as a board with the same cover, and the notice appears once. **Today: this already works** via `database-view.ts:11663`; the criterion exists so a regression here is caught, not because it is new | The existing migration path re-asserted, plus a two-open test proving the notice fires once | Unmet | - |
| AC-004 | REQ-004 | **Given** a gallery-configured **codeblock** embed, **When** it renders, **Then** it is migrated — or `decision-record.md` carries an ADR saying why it is not. **Failing value today: 1 call site, 0 in the embedded host** | `rg -n applyGalleryMigration src/views/embedded-database-renderer.ts`, plus the ADR if the answer is no | Unmet | - |
| AC-005 | REQ-005 | **Given** a view migrated on its first open, **When** it is opened again, **Then** the migration is a no-op and no second notice appears | A two-open unit; the notice count asserted, not observed by eye | Unmet | - |
| AC-006 | REQ-003, REQ-006 | **Given** the finished phase, **When** `npm run gate` runs, **Then** it exits 0 read from `$?`, and every closed surface has a test that was seen failing first | Gate output and exit status; the red-first record for each surface | Unmet | - |
| AC-007 | REQ-002 | **Given** this phase's work is merged, **When** `003` is considered, **Then** a **released** version number carries the migration. Merged is not shipped, and this row is why | The release tag and the version in `manifest.json` | Unmet | - |

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

Nothing has run. Every row is `Unmet` with its failing value named today rather than left blank —
AC-001 and AC-002 name the two surfaces `030` left open, AC-004 names the asymmetry that has now
been inherited twice. AC-007 is the row that most wants to be waived and must not be: it is the
only thing standing between an unmigrated vault and a deleted renderer.
<!-- /ANCHOR:closure -->

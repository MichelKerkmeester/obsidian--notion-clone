---
title: "Acceptance Criteria: Test Environments and Mock Data"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "049 acceptance criteria"
  - "mock data thresholds"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/049-test-environments-and-mock-data"
    last_updated_at: "2026-09-05T09:55:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the criteria and marked the six the Obsidian leg closed"
    next_safe_action: "Close AC-007 by loading catalogue.json into the Anytype demo space"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
      - "AC-007 needs the CDP session the captures leg owns"
      - "AC-008 needs an operator window, since AppFlowy exposes no DOM"
    key_files:
      - "tools/mock-data/catalogue.ts"
      - "tools/mock-data/catalogue.test.mjs"
      - "tools/mock-data/capture.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-049-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether AppFlowy's CSV import infers select options or needs them declared first"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Test Environments and Mock Data

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/049-test-environments-and-mock-data
**Level:** 2
**Status:** In Progress
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every count below was read from a command's output, and every exit status from `$?` without a pipe.
The two checks that could pass on a constant carry a negative control, observed red before the row
counted as evidence.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the catalogue, **When** it is built, **Then** it holds **ten** use cases beyond a single finance database — nine new domains plus the finance one kept — each with **20 to 40** records, **326** in total, and each carrying the identical **28**-column facet set | `node tools/mock-data/generate.ts` run summary, one line per use case (`tools/mock-data/generate.ts:127`); the bound and the column identity asserted at `tools/mock-data/catalogue.test.mjs:101` and `:108` rather than against the literals | Met | - |
| AC-002 | REQ-002 | **Given** a fixed seed, **When** the catalogue is built twice, **Then** the JSON, the CSVs and the vault file set are byte-identical, and **When** the seed changes, **Then** the values differ while every record identity is unchanged | `tools/mock-data/catalogue.test.mjs:57` — 5 assertions, with identity stability at `:80`. **Negative control observed red:** replacing `tools/mock-data/random.ts:53`'s return with `Math.random()` reddened all three identity checks; disarmed, green | Met | - |
| AC-003 | REQ-004 | **Given** any use case, **When** the values its records carry are collected, **Then** all **13** plugin `ColumnDef` types and all **24** neutral types appear, in **every** use case, not in the union across them | `tools/mock-data/catalogue.test.mjs:150` and `:159`, reading record values through `tools/mock-data/catalogue.ts:coverageOf` rather than the schema. **Negative control observed red:** suppressing the checkbox facet failed both checks naming the missing type | Met | - |
| AC-004 | REQ-003 | **Given** the operator's vault, **When** the generator writes into it, **Then** **336** files appear under ten new folders, the **31** pre-existing files are byte-identical afterwards, and a second run reports **0 written, 336 already current** | `sha256` of all 31 pre-existing files before and after: `changed: 0  missing: 0`. Second run's own summary line, emitted at `tools/mock-data/generate.ts:151`; the skip-on-match write is `tools/mock-data/generate.ts:77` | Met | - |
| AC-005 | REQ-007 | **Given** each generated database, **When** it is mounted in the shipped `TableRenderer` with the shipped `CellRenderer` at 1440px, **Then** the renderer builds exactly the record count in rows for all **10**, and the author has opened every PNG | `node tools/mock-data/capture.mjs`: ten rows reading `rows N/N … ok`, 30 headers each, 868-1240 cells, 134-186 links, 57-81 checkboxes. Bundle manifest checked for `table-renderer.ts` and `cell-renderer.ts` at `tools/mock-data/capture.mjs:234` before any mount | Met | - |
| AC-006 | REQ-005, REQ-006 | **Given** any use case, **When** its records are inspected, **Then** exactly one is entirely empty, every record identity is unique, and every one of the **265** relation links points at a record that exists in the same use case | `tools/mock-data/catalogue.test.mjs:188` and `:175`; independently re-checked against the written vault by resolving every `[[link]]` against the filenames on disk: **unresolved: 0** | Met | - |
| AC-007 | REQ-001 | **Given** `catalogue.json`, **When** an agent loads it into the Anytype demo space over the captures leg's CDP session, **Then** Anytype holds the same ten use cases at the same record counts, with **0** records missing | A per-use-case count read back from Anytype and compared against `recordCount`, emitted at `tools/mock-data/emit-portable.ts:71` | Unmet | - |
| AC-008 | REQ-001 | **Given** the ten CSVs, **When** they are imported into the AppFlowy demo workspace in an operator window, **Then** AppFlowy holds the same ten use cases at the same record counts, with **0** records missing | A per-use-case count read back from AppFlowy and compared against `recordCount`, emitted at `tools/mock-data/emit-portable.ts:71`. AppFlowy exposes no DOM, so this is read by a person | Unmet | - |
| AC-009 | REQ-007 | **Given** the upgraded vault on the operator's device, **When** they open the ten generated databases, **Then** they report them as usable test environments rather than as a wall of noise, and the computed and rollup columns resolve to values | The operator's own words against the vault files written by `tools/mock-data/emit-obsidian.ts:333`. **Only the operator closes this row; nothing in this repository can**, and the computed and rollup half of it specifically cannot be shown by a constructed mount | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Six of nine rows are met on evidence recorded in `checklist.md`. The three that are open are open for
the same reason: each needs something this session does not have. AC-007 needs the CDP session the
captures leg owns, AC-008 needs an operator present at a machine running AppFlowy, and AC-009 is the
operator's own read on a device, which under the parent's D3 is the only thing that closes a defect.

AC-009 carries one part no automated check can substitute for. The computed and rollup columns
photograph empty in AC-005's captures because both are evaluated by the data pipeline against a live
vault rather than by the renderer, and the capture constructs a renderer with no `App`. They are
configured in the written database notes; whether they resolve is a question only the real app
answers.
<!-- /ANCHOR:closure -->

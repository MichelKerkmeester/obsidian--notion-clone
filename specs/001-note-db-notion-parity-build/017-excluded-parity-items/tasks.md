---
title: "Tasks: Excluded parity items"
description: "No plugin tasks: this Wave 6 packet holds the out-of-scope ruling for five parity items and does not schedule a build."
trigger_phrases:
  - "excluded parity items"
  - "out of scope parity"
  - "tasks"
  - "no build planned"
  - "person people property"
  - "goodbases renderer"
  - "notion file cdn"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/017-excluded-parity-items"
    last_updated_at: "2026-08-26T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Retired T004-T008 from Implementation; fixed QueryEngine and 014 cites"
    next_safe_action: "Keep closed; reopen person/me() only on identity + Wave 6"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Excluded parity items

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

The synthesis Verdict is DO-NOT-BUILD / HOLD. Setup is the decision record only — no build is scheduled. T001–T003 are already satisfied by this rewritten packet.

- [x] T001 Record the DO-NOT-BUILD / HOLD ruling for the five excluded parity items in this packet (`spec.md`, `plan.md`); evidence in `research/synthesis.md` and `research/research.md`
- [x] T002 Record the single revisit trigger: reopen only person/people and `me()` — and only if Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered (REQ-003); default keep closed. CDN/GoodBases never reopen; `style()` stays excluded even after identity
- [x] T003 Record the cheaper/safer alternatives: people as a `Clients` (or equivalent) relation column; styled text via per-column `textRenderMode: "markdown"`; files as vault-local wikilinks; GoodBases as a chrome reference already mined into 014

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

No plugin implementation is planned (HOLD). T004–T008 are **retired** as scheduled work — they are exclusion reasons, not a queue, not `[B]` tasks, and they carry no effort tier. This wave is 0 hours of fork work. The order follows the keep-excluded strength ranking from `research/research.md` iteration 10 (strongest exclusion first), not the synthesis ranked backlog, so the list does not lead with the only non-blocked item.

- T007 **Fetching Notion file CDN URLs** — **Never reopen**, even after an identity API. Notion `file` URLs expire in 1 hour and the API says do not cache; download → iCloud re-upload is a double transfer and the vault copy is stale by design. Files stay vault-local wikilinks (`012-files-column/spec.md:66,86`). No fork files in this phase. Citation: `research/synthesis.md` ranked backlog #4.
- T008 **Adopting GoodBases as the table renderer** — **Never reopen.** Chrome-only (no own formulas/rollups/footers); adoption would replace the fork's 12 column types, 7 views, two formula syntaxes, and `count|sum|avg|list` rollups (`src/data/types.ts:50,106-108`); do not retarget `src/views/*`. Hover-open already scoped to `014-record-detail-panel` (`014-record-detail-panel/spec.md:79,87,146`). Citation: `research/synthesis.md` ranked backlog #5.
- T005 **person / people property** — **Identity-gated.** Reopens only if Obsidian ships a plugin-visible user object **and** Wave 6 is explicitly entered. Reserved module `src/data/PersonIdentity.ts` maps a plugin-visible user id onto the existing relation/wikilink value model — **no `"people"` union member** (`src/data/types.ts:50` stays as-is; relation pills already exist at `src/views/CellRenderer.ts:193-195`), no parallel directory. Do **not** edit `ColumnDef.type` — a new union member blows `COLUMN_TYPE_LABELS()` / `isColumnType` the way 012's `"files"` does. Stand-in today: vault `Clients` relation (`src/data/types.ts:34-37,67-68`). Citation: `research/synthesis.md` ranked backlog #2.
- T006 **`me()` / "Me" filter token** — **Identity-gated;** depends on T005; build-order after person/people, never first. Never invent `me()` from a settings id (per-vault, not per-viewer). If the trigger fires, the real call sites are: (1) Bases `me()` in `src/data/BaseExpression.ts:64` / `createBaseScope` at `:1099`; (2) native `me` via `FORMULA_BUILTIN_CONSTANTS` at `src/data/FormulaTokenizer.ts:22-24` + `src/data/ComputedField.ts` (`FormulaTokenizer.ts` is a dependency scanner, not an evaluator); (3) "Me" filter token in `src/data/QueryEngine.ts:91` (`matchesFilter`), mirroring `ConditionalFormatRule.valueSource: "literal" | "today"` (`src/data/types.ts:147`, `src/data/ConditionalFormatting.ts:12-20`). Skip `src/views/CellRenderer.ts` while pills stay `case "relation"`; treat `src/views/FilterPanelRenderer.ts:19` as out of budget unless "Me" is a literal `FilterRule.value` resolved in `QueryEngine` only. Citation: `research/synthesis.md` ranked backlog #3.
- T004 **`style()` / `unstyle()` formula output** — **Still skip even after identity.** Not identity-gated; residual underline + 8 text + 8 background colors is new formula surface, not missing cell render (peers do not style grid cells). A forced build is a type-system project, not an isolated EuroFormat-shaped override — no styled output type (`src/data/types.ts:106`), no underline/colors in the parser (`src/data/InlineMarkdown.ts:8-9`), and `automatic` sync would persist `**`/`==` into YAML then re-parse under `textRenderMode: "markdown"` (`src/data/Stringify.ts:9-10`, `src/data/ComputedSync.ts:3,42-44`, `src/views/CellRenderer.ts:212-228`). No `FormulaStyle.ts` is reserved. Citation: `research/synthesis.md` ranked backlog #1.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T009 Confirm the plugin fork is unchanged by this phase (no new module under `src/`, no call-site edit, no CSS)
- [ ] T010 Revisit **only person/people and `me()`** if the recorded trigger fires (`spec.md` REQ-003): Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered — not for Notion parity alone. CDN/GoodBases never reopen; `style()` stays excluded even after identity

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] T001–T003 satisfied by this rewritten packet (decision recorded, trigger recorded, alternatives recorded)
- [x] T004–T008 retired as exclusion reasons (not a queue, not `[B]` implementation work)
- [ ] T009–T010: read-only operator confirmations (fork diff empty; revisit trigger not fired)
- [ ] Manual verification passed: fork tree unchanged, packet reads DO-NOT-BUILD / HOLD

T001–T003 are already satisfied by this rewritten packet. T004–T008 are the HOLD record, not work to clear. T009–T010 are the remaining read-only operator confirmations.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Source of truth**: `research/synthesis.md` (Verdict, ranked backlog, locked design, edge cases, operator decisions) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:cross-refs -->

---

<!--
CORE TEMPLATE (~60 lines)
- Simple task tracking
- 3 phases: Setup, Implementation, Verification
- Add L2/L3 addendums for complexity
-->

---
title: "Tasks: URL / Email / Phone Link Fields"
description: "Task breakdown for adding the additive textLinkScheme link fields to the note database fork."
trigger_phrases:
  - "link fields"
  - "text link scheme"
  - "clickable url"
  - "task breakdown"
  - "mailto"
  - "tel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled tasks with final-plan.md review findings"
    next_safe_action: "Implement per plan.md/tasks.md starting with T001 (DoR)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: URL / Email / Phone Link Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred (operator decision — see `research/synthesis.md` Open Questions) |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Tasks are ordered by the final build plan (`research/final-plan.md`): DoR → module → tests → call sites → round-trip → display-only → gates → manual. T001–T003 (old setup tasks) are collapsed into the DoR (plan.md §2); T016–T025 (old per-case test tasks) are collapsed into one test-file task. v1 ships items 1, 2, 6 (the locked EuroFormat-shaped diff). Items 3–5 and 7 are deferred by default (Open Questions #2, #3); item 8 is blocked on an operator scope change.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

> Collapsed from T001–T003 into the DoR (plan.md §2).

- [x] T001 Confirm DoR (plan.md §2): fork layout read (`src/data/types.ts:47-71`, `src/views/CellRenderer.ts:110-233` + `:269-291`, `src/data/TextLink.ts:29-41`, `src/data/EuroFormat.ts:1-42`); default-branch text render path at `CellRenderer.ts:211-233` and `renderTextLink` 280 ms delayed-open shell at `:269-291` confirmed; `ColumnDef.type` union at `:50` listed; EuroFormat isolated-diff model reviewed; synthesis reviewed; v1 scope locked (no CSS file in v1). **Add**: confirm `src/__tests__/setup.ts` exists (landed in phase 005, or add a one-line stub so vitest starts — feature code does not depend on let/lets) [S] -- done during build

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Core Changes (Ranked Backlog items 1, 2, 6 — v1 diff, ordered by final build plan)
- [x] T002 **[Step 1 / Item 2+6]** Create `src/data/textLinkScheme.ts` (~40 lines, **zero imports**) exporting `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, `assembleSchemeLinkTarget(scheme, value): string | null`. Full locked algorithm: coerce+trim; empty⇒`null`; >2048⇒`null`; `\r`/`\n`/`\t`⇒`null`; non-string/null⇒`null`; detect-and-skip + family allowlist (`https` accepts `http:`/`https:`; `mailto`/`tel` exact); else prepend `https://`|`mailto:`|`tel:`. **Tel-strip on every `tel:` target** (both prepend and already-schemed as-is paths) — strip `space`, `()`, `-` from the href only; label and storage stay raw. Do **not** import or call `normalizeExternalUrlTarget` (`src/data/TextLink.ts:37-41`) [S] -- src/data/textLinkScheme.ts:12
- [x] T003 **[Step 2]** Create `src/data/__tests__/textLinkScheme.test.ts` (one file). Matrix: T1 `www.acme.com`+https→`https://www.acme.com`; T2 full https unchanged; T3 `mailto:a@b.c`+https→`null`; T4 `javascript:alert(1)` any→`null`; T5 `a@b.c`+mailto→`mailto:a@b.c`; T5b `mailto:a@b.c`+mailto→unchanged (family match, as-is); T6 `+31 20 123`+tel→`tel:+3120123`; T6b `tel:+31 20 123`+tel→`tel:+3120123` (strip on already-schemed); T7 empty/whitespace→`null`; T8 2049 chars→`null`; T9 `\r\n`→`null`; T10 number/null→`null`; T11 `http://x.io`+https→unchanged (family pass-through). Also `isTextLinkScheme("ftp") === false`. Depends on T002 [S] -- src/data/__tests__/textLinkScheme.test.ts:5
- [x] T004 **[Step 3 / Item 1]** Add optional `textLinkScheme?: TextLinkScheme` to `ColumnDef` at `src/data/types.ts:62` **immediately after** `textRenderMode`. Import the type alias from `textLinkScheme.ts` (types.ts already imports sibling modules). Do **not** edit the `type:` union at `:50`. Depends on T002 [S] -- src/data/types.ts:65
- [x] T005 **[Step 4 / Item 1]** Add clickable render case in `src/views/CellRenderer.ts` default branch (~211-233). Precedence: if `!isFileFieldKey(col.key)` && `isTextLinkScheme(col.textLinkScheme)` && assemble ≠ `null` → delayed-open anchor (label = raw `String(value)`, `href` = assembled, class `db-text-link external-link`, `td.createEl` only). **Extract a shared `renderDelayedExternalLink(td, row, { label, target })` from `renderTextLink`'s 280 ms `window.open` / `detail > 1` cancel (:269-291) so scheme and link-mode share one timer** (existing internal/external branch stays for link-mode; scheme case calls helper with `external: true`). Else existing markdown → link-mode → plain. Scheme-hint wins over markdown (locked precedence — not F-007.1's markdown→link→scheme). No CSS file opened in v1. Depends on T002, T004 [M] -- src/views/CellRenderer.ts:79

### Integration (in-scope confirmations)
- [x] T006 **[Step 5]** Confirm `ColumnDef` JSON round-trip preserves `textLinkScheme` via a unit `JSON.parse(JSON.stringify({ key:"c", label:"C", type:"text", textLinkScheme:"mailto" }))` in the **same vitest file** (no DatabaseView boot — persistence is `JSON.stringify` of `ColumnDef` inside view/schema config, `DatabaseView.cloneDatabaseConfig:930-931`). Absent field stays absent. P0 if dropped. Depends on T004 [S] -- src/data/__tests__/textLinkScheme.test.ts:68
- [x] T007 **[Step 6]** Confirm display-only behavior: no cell writes in the render path; `stringifyValue` (`src/data/Stringify.ts:1-14`) unused by assemble; no telemetry, no secrets. Depends on T005 [S] -- done during build
- [x] T008 Confirm the 12-type `ColumnDef.type` union at `src/data/types.ts:50` is untouched [S] -- src/data/types.ts:52

### Deferred (operator decision — Open Questions #2, #3)
- [x] T009 **[Item 3]** Honor the hint in Board / Gallery / List / record detail via the shared `renderDelayedExternalLink` helper (extracted in T005): `src/views/BoardRenderer.ts:1070`, `src/views/GalleryRenderer.ts:594`, `src/views/ListRenderer.ts:554`, `src/views/RecordDetailPanel.ts:373`. One-line delegations. Defer unless Wave 3 must look complete in Board/Gallery on day one [S] -- src/views/BoardRenderer.ts:1050; src/views/GalleryRenderer.ts:575; src/views/ListRenderer.ts:532; src/views/RecordDetailPanel.ts:348
- [x] T010 **[Item 4]** Column-menu picker for `https` | `mailto` | `tel` | none under the existing display popover: `src/views/ColumnMenu.ts:133-150,393-418`, `src/views/DatabaseView.ts:5096-5100` (setter `setTextLinkScheme`). 4th/5th file — REQ-005 tension. Defer so v1 stays EuroFormat-shaped; power users set `textLinkScheme` in saved schema JSON (same round-trip as `textRenderMode`) [S] -- src/views/ColumnMenu.ts:419; src/views/DatabaseView.ts:5189
- [x] T011 **[Item 5]** Auto-width / wrap treats scheme-hint cells like link-mode labels: `src/views/ColumnWidth.ts:17-31,48,101-105`. Defer with v1 (CellRenderer-only); revisit when item 3 ships [S] -- src/views/ColumnWidth.ts:50
- [B] T012 **[Item 7]** Copy (and optional Visit) affordance: hover icon or `title` on the existing `db-text-link` anchor at `src/views/CellRenderer.ts:269-276`; long-press later. Out of spec (no link editing / health checks). Defer [S] -- DEFERRED: no dedicated copy or visit affordance was produced
- [B] T013 **[Item 8]** Auto-detect URL / email / phone in unhinted text columns (Anytype `urlFix` `matchEmail`/`matchPhone`, `anytype-ts/src/ts/lib/util/string.ts:619-647`). Blocked on operator scope change — spec Out of Scope [M if ever approved] -- DEFERRED: no unhinted auto-detection classifier or call site exists

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [x] T014 **[Step 2 — collapsed T016–T025]** Run `npx vitest run` for `src/data/__tests__/textLinkScheme.test.ts` (one file). The T1–T11 matrix + `isTextLinkScheme("ftp") === false` + `ColumnDef` JSON round-trip test (T006) all pass. (`vitest.config.ts` includes `src/**/*.test.ts`; `package.json` has no `test` script.) Depends on T003, T006 [S] -- done during build

### Build / Lint Gates
- [x] T015 **[Step 7]** Run `npm run build` (esbuild production) — exit 0 [S] -- done during build
- [x] T016 **[Step 7]** Run `npm run lint` — exit 0 [S] -- done during build
- [x] T017 **[Step 7]** Run `npx vitest run` — all tests green (T014 matrix + round-trip) [S] -- done during build

### Manual Verification
- [ ] T018 **[Step 8]** Desktop: one hinted https/mailto/tel column (config JSON) + one unhinted column. Click opens OS handler; double-click still enters inline editor (delayed-open preserved) [S] -- DEFERRED: no recorded desktop click/double-click manual proof; only code-level review exists
- [ ] T019 **[Step 9]** Mobile-sized viewport / on-device: tap-target vs `.external-link`; double-tap edit unaffected; no layout shift vs plain cells. `mailto:`/`tel:` via `window.open` on iOS/Android is UNKNOWN — do not fail the phase if on-device is unavailable; if it fails later, add an opener fallback in the shared click helper (not `app.openWithDefaultApp` in v1) [S] -- DEFERRED: iOS/Android on-device tap and mailto/tel dispatch were not run
- [ ] T020 Zero-diff render check for unhinted columns (SC-002): DOM/screenshot compare pre/post [S] -- DEFERRED: no DOM or screenshot pre/post comparison was produced
- [ ] T021 Diff vs upstream confined to `src/data/textLinkScheme.ts` + `src/data/types.ts` + `src/views/CellRenderer.ts` + tests (+ `setup.ts` stub if 005 missing); 12-type union at `src/data/types.ts:50` untouched [S] -- DEFERRED: shipped integration changes also include layout, menu, width, and locale call sites

### Documentation
- [x] T022 Update checklist evidence (`checklist.md`) [S] -- checklist.md:57

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred (non-`[B]`) tasks marked `[x]`.
- [ ] Deferred `[B]` tasks (T009–T013) remain blocked with the operator decision recorded in `research/synthesis.md` Open Questions.
- [ ] `npm run build`, `npm run lint`, and `npx vitest run` (T1–T11 matrix + round-trip) pass with the new render case.
- [ ] `checklist.md` fully verified.
- [ ] Fork diff vs upstream confined to `src/data/textLinkScheme.ts` + `src/data/types.ts` + `src/views/CellRenderer.ts` + tests (+ `setup.ts` stub if 005 missing); 12-type `ColumnDef.type` union at `src/data/types.ts:50` untouched.
- [ ] `ColumnDef` JSON round-trip of `textLinkScheme` confirmed via unit stringify/parse test (P0 if dropped).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`

<!-- /ANCHOR:cross-refs -->

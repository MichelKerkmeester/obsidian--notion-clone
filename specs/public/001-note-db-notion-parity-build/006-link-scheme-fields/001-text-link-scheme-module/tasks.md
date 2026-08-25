---
title: "Tasks: Text Link Scheme Module"
description: "Same-diff task list for textLinkScheme.ts, ColumnDef hint, CellRenderer delayed-open, shared opener extract, T1–T11 tests, and JSON round-trip."
trigger_phrases:
  - "text link scheme tasks"
  - "assembleSchemeLinkTarget"
  - "cell renderer delayed open"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/001-text-link-scheme-module"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table same-diff child from synthesis ranks 1, 2, 6 and final-plan steps 1–9"
    next_safe_action: "Implement textLinkScheme.ts plus the same-diff types.ts and CellRenderer call sites"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-text-link-scheme-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Text Link Scheme Module

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

T003–T007 are **one atomic diff**. Do not ship the module without types + CellRenderer + tests. Tel-strip is not a second pass.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1, 2, 6 plus `research/final-plan.md` steps 0–9 (same-diff coupling, family gate, tel-strip on every `tel:` target, shared opener) [15m]
- [ ] T002 Confirm live fork paths — `types.ts:47-71`, `CellRenderer.ts:110-233` and `:269-291`, `TextLink.ts:29-41`, `EuroFormat.ts:1-42`; note whether `src/__tests__/setup.ts` exists [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/textLinkScheme.ts`** (~40 lines, **zero imports**): export `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, `assembleSchemeLinkTarget`. Algorithm: coerce+trim; empty ⇒ `null`; length > 2048 ⇒ `null`; `\r`/`\n`/`\t` ⇒ `null`; non-string/null ⇒ `null`; if `URL_SCHEME_RE` (`TextLink.ts:33` pattern, duplicated) matches, return as-is only when family matches (`https` accepts `http:`/`https:`; `mailto`/`tel` exact) else `null`; else prepend `https://` \| `mailto:` \| `tel:`. Then if the target is `tel:`, strip `space`, `()`, `-` from the href (including already-schemed). Do not import or call `normalizeExternalUrlTarget` (`src/data/textLinkScheme.ts`) [S]
- [ ] T004 **Tests** — land with T003: `src/data/__tests__/textLinkScheme.test.ts` T1 `www.acme.com`+https → `https://www.acme.com`; T2 full https unchanged; T3 `mailto:a@b.c`+https → `null`; T4 `javascript:alert(1)` any → `null`; T5 `a@b.c`+mailto → `mailto:a@b.c`; T6 `+31 20 123`+tel → `tel:+3120123`; T6b `tel:+31 20 123`+tel → `tel:+3120123`; T7 empty/whitespace → `null`; T8 2049 chars → `null`; T9 `\r\n` → `null`; T10 number/null → `null`; T11 `http://x.io`+https → unchanged; `isTextLinkScheme("ftp") === false`. Stub `src/__tests__/setup.ts` if missing (`src/data/__tests__/textLinkScheme.test.ts`) [S]
- [ ] T005 **Call site 1** — same diff as T003: add `textLinkScheme?: TextLinkScheme` on `ColumnDef` immediately after `textRenderMode` (`:62`); type-only import preferred; **do not** edit the union at `:50` (`src/data/types.ts`) [S]
- [ ] T006 **Call site 2** — same diff as T003: `CellRenderer.ts` `default:` `:211-233`. If `!isFileFieldKey(col.key)` && `isTextLinkScheme(col.textLinkScheme)` && assemble ≠ `null` → delayed-open anchor (raw label, assembled href, class `db-text-link external-link`, `td.createEl` only). Else markdown → link-mode → plain. Extract `renderDelayedExternalLink` from `renderTextLink` `:269-291` and export it for child 002. Scheme case uses `external: true`. Dblclick still reaches `makeEditable` (`:242-245`) (`src/views/CellRenderer.ts`) [M]
- [ ] T007 **Round-trip** — same test file as T004: `JSON.parse(JSON.stringify({ key: "c", label: "C", type: "text", textLinkScheme: "mailto" }))` keeps the field; absent field stays absent (`src/data/__tests__/textLinkScheme.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Confirm no writes in the render path; `stringifyValue` (`Stringify.ts:1-14`) unused by assemble; exports/sort/filter still see the raw cell [S]
- [ ] T009 `npm run build`; `npm run lint`; `npx vitest run`. `git diff --stat` = module + `types.ts` + `CellRenderer.ts` + tests (+ `setup.ts` stub if added). Union at `types.ts:50` untouched [S]
- [ ] T010 Manual desktop: one hinted https / mailto / tel column (config JSON) + one unhinted column; click opens OS handler; double-click edits (SC-001, SC-002) [S]
- [ ] T011 Manual mobile viewport / on-device: tap target vs `.external-link`; `mailto:`/`tel:` via `window.open` is **UNKNOWN**. Do not fail this child if on-device is unavailable. If it fails later: opener fallback **inside** the shared helper — not `app.openWithDefaultApp` in v1 [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T007 shipped as one diff
- [ ] Manual verification of T010 passed; T011 recorded even if on-device is skipped
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

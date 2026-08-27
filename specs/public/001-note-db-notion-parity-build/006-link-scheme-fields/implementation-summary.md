---
title: "Implementation Summary"
description: "Shipped-state summary for the URL / email / phone link fields phase — Sonnet-verified CONCERNS (real i18n P1) fixed and re-gated on branch impl."
trigger_phrases:
  - "link fields"
  - "implementation summary"
  - "text link scheme"
  - "clickable url"
  - "mailto"
  - "tel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled docs to shipped state: commits 74b836a/1b0527f/be9516b/c3d3a01/30ce2ea/a179b97 + i18n fix 29d7b14 on branch impl"
    next_safe_action: "None — phase complete. Packet-wide follow-up: operator ff-merge of impl to main/v4"
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
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 006-link-scheme-fields |
| **Completed** | 2026-08-25/26 (branch `impl`, not yet merged to `main`/`v4`) |
| **Level** | 2 |
| **Actual Effort** | Shipped (planned effort: ~75 minutes) |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

This phase is **shipped** on branch `impl` (not yet merged to `main`/`v4` — operator ff-merge gate). `src/data/textLinkScheme.ts` implements the closed allowlist + `assembleSchemeLinkTarget` (family gate + tel-strip); `types.ts` carries the optional `textLinkScheme` hint on `ColumnDef`; `CellRenderer.ts` renders delayed-open anchors from the default branch; Board/Gallery/List/RecordDetail honor the hint via the shared `renderDelayedExternalLink`; `ColumnMenu.ts` + `DatabaseView.ts` carry the picker and `setTextLinkScheme`; `ColumnWidth.ts` measures scheme-hint cells like link-mode labels.

A fresh Claude Sonnet 5 adversarial review (`research/sonnet-verification.md`) returned **CONCERNS**: the feature is correct and well-tested, but the column-menu picker labels (`"HTTPS"`/`"Email"`/`"Phone"`/`"None"`) were hardcoded English instead of routed through `t()` — a confirmed regression against the in-file `textRenderMode` precedent. This was fixed and re-gated in commit `29d7b14` (localized via `t()`, keys added to all 3 locales).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/textLinkScheme.ts` | Created | Closed allowlist (`https`\|`mailto`\|`tel`) + `assembleSchemeLinkTarget` incl. tel-strip |
| `src/data/types.ts` | Modified | Optional `textLinkScheme?: TextLinkScheme` on `ColumnDef`; 12-type union untouched |
| `src/views/CellRenderer.ts` | Modified | Default-branch delayed-open anchor; `renderDelayedExternalLink` extracted/exported |
| `src/views/BoardRenderer.ts` / `GalleryRenderer.ts` / `ListRenderer.ts` / `RecordDetailPanel.ts` | Modified | Layout honor via the shared helper (one 280ms timer, no copies) |
| `src/views/ColumnMenu.ts` | Modified | Scheme picker under the display popover; labels localized via `t()` (fix `29d7b14`) |
| `src/views/DatabaseView.ts` | Modified | `setTextLinkScheme` beside `setTextRenderMode` |
| `src/views/ColumnWidth.ts` | Modified | Scheme-hint cells measured like link-mode labels |
| `src/i18n.ts` | Modified | Link-scheme picker labels in en / zh-Hans / zh-Hant (fix `29d7b14`) |
| `src/data/__tests__/textLinkScheme.test.ts` | Created | 15 tests (T1–T11 + guards + JSON round-trip) |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/spec.md` | Reconciled | Status Planned → Complete |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/plan.md` / `tasks.md` | Unchanged | Already matched the shipped design |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/checklist.md` | Reconciled | All items verified against the shipped commits |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/implementation-summary.md` | Reconciled | This record — shipped-state evidence |

Commits on branch `impl`: `74b836a` (001-text-link-scheme-module), `1b0527f`+`be9516b` (002-layout-scheme-honor + review fix), `c3d3a01` (003-column-menu-scheme-picker), `30ce2ea`+`a179b97` (004-scheme-column-width + review fix), `29d7b14` (i18n fix, packet-wide fix stage).

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered by the serial, resumable build driver (`../scratch/stage4-implement.cjs`) per sub-phase: implement → gate (`tsc --noEmit` 0, `npm run build` 0, `npx vitest run` green) → commit → in-loop DeepSeek V4 review → fix pass on concerns. The phase then received one independent, fresh Claude Sonnet 5 adversarial review (`research/sonnet-verification.md`), which surfaced the hardcoded-English picker-label regression; that finding was fixed and re-gated in a dedicated fix stage (commit `29d7b14`).

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Additive optional `textLinkScheme` hint (`https` \| `mailto` \| `tel`) on the text column config | Notion-first-class URL/email/phone UX at near-zero rebase cost; no new column type |
| Render clickable inside the existing text render path of `CellRenderer.ts` (~212-229) | Single render case; all view types reuse the cell renderer unchanged |
| New isolated `src/data/textLinkScheme.ts` module on the EuroFormat model | Allowlist + link assembly stay in one rebase-friendly module; 1-3 minimal call-site edits |
| Closed scheme allowlist; unknown values render plain text | Blocks arbitrary schemes (e.g., `javascript:`) without a separate sanitizer |
| Display-only, mobile-safe | iCloud-safe (no churny writes) and no desktop-only APIs per fork constraints |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| TypeScript build | **Green** | Fork-wide | `tsc --noEmit -p .` clean at commit gate and Sonnet review time |
| Unit tests (scheme module) | **Green** | 15/15 | `vitest src/data/__tests__/textLinkScheme.test.ts` — allowlist, family gate, tel-strip, JSON round-trip |
| Manual tap test | Not run on-device | Desktop + mobile viewport | `mailto:`/`tel:` iOS/Android dispatch remains UNKNOWN by design (accepted risk, spec.md REQ-006/OQ7); desktop click confirmed via anchor construction review |
| Sonnet 5 independent review | **CONCERNS → fixed** | `research/sonnet-verification.md` | i18n P1 found and fixed (`29d7b14`); correctness/coverage/no-regression/safety all confirmed sound |
| Packet strict validation | Not run by this reconciliation pass | This packet | Docs-only reconciliation task; see task scope |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `textLinkScheme.ts` | Covered by 15 tests | Allowlist, family gate, tel-strip, control-char/length guards | `assembleSchemeLinkTarget`, `isTextLinkScheme` |
| `CellRenderer.ts` (scheme branch) | Covered by anchor-construction review (`createEl`, never `innerHTML`) | Precedence: scheme-hint → markdown → link → plain | Delayed-open render path |

See `checklist.md` for the full per-item evidence.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | One string concat per hint-bearing cell; plain cells unaffected | Confirmed by construction (`assembleSchemeLinkTarget` is the only added work; `stringifyValue` unchanged) | **Met** |
| NFR-S01 | Closed allowlist `https` \| `mailto` \| `tel`; plain-text fallback | Confirmed — family gate at `textLinkScheme.ts:11-28`; anchors built with `createEl` only, never `innerHTML` (Sonnet-traced) | **Met** |
| NFR-R01 | Deterministic display-only rendering | Confirmed — no cell writes in the render path; only `ColumnDef` config write on opt-in (same as `setTextRenderMode`) | **Met** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. `mailto:`/`tel:` dispatch via `window.open` on iOS/Android remains unverified on-device (accepted risk per spec.md REQ-006/OQ7 default; fallback would go inside the shared opener helper if reports surface).
2. Link label is the raw text value; there is no display-text override in this phase.
3. Scheme allowlist is intentionally closed to `https` | `mailto` | `tel`; other schemes render as plain text.
4. `db-text-link` has no stylesheet rule in the fork; padding may need a small CSS add only if the native `.external-link` hit box proves too tight (not added speculatively).

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Implement link fields in the fork | Shipped as designed, plus one fix | Column-menu picker labels were hardcoded English at first ship (Sonnet-found P1); fixed via `t()` routing in commit `29d7b14`, no other deviation from the locked design |
| Docs updated when the build completes | Docs were left saying "Planned" until this reconciliation pass (2026-08-27) | Universal packet-wide gap: the build/gate/in-loop review approved the code but nothing wrote completion state back (see `../synthesis.md` §4, §8) |

<!-- /ANCHOR:deviations -->

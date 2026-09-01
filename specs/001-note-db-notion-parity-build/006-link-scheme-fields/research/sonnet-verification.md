# Sonnet 5 Verification — 006-link-scheme-fields

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` vs `research/{synthesis,final-plan}.md` + sub-phase specs
- Gate re-run at review time: `tsc --noEmit -p .` clean; `vitest src/data/__tests__/textLinkScheme.test.ts` 15/15

## Verdict

**CONCERNS** — feature is correct and well-tested, but has **one real i18n P1** and unreconciled completion docs.

## Findings

### P1 (confirmed) — hardcoded English picker labels
The new column-menu "Link scheme" section labels `"HTTPS"`/`"Email"`/`"Phone"`/`"None"` are raw literals, not routed through `t()` — `src/views/ColumnMenu.ts:419,423-430`. The immediately preceding `textRenderMode` section in the **same function** (`ColumnMenu.ts:400-416`) correctly uses `t()`, and `i18n.ts` carries full en/zh-Hans/zh-Hant coverage for the sibling options with no equivalent keys added here. Won't localize for non-English users. Confirmed regression against an in-file precedent (not a hypothetical). **Remediation: add i18n keys + route the labels through `t()`.**

### Correctness (all sound)
- `assembleSchemeLinkTarget` (`src/data/textLinkScheme.ts:11-28`) does prepend-if-missing with a family gate: `mailto:`/`javascript:`/`data:` under an `https` hint, and `javascript:` under any hint, all return `null` (`:19-24`) — closed allowlist, never emits an unrequested executable scheme.
- Anchors built with `td.createEl("a", {...})` only (`CellRenderer.ts:85-89`), never `innerHTML` (grep-confirmed).
- `tel:` separator strip (`textLinkScheme.ts:27-28`, `/[\s()-]/g`) runs on the final target unconditionally → strips on both prepend and already-schemed paths (`tel:+31 (20) 123` → `tel:+3120123`); test `T6b`.
- `!isFileFieldKey(col.key)` guard present on all 5 scheme call sites (`CellRenderer.ts:243`, `BoardRenderer.ts:1047`, `GalleryRenderer.ts:572`, `ListRenderer.ts:532`, `RecordDetailPanel.ts:348`).
- Precedence: scheme-hint first, else markdown → `link` → plain (`CellRenderer.ts:242-273`).

### Coverage — all 5 ranked synthesis items shipped
Table clickability (`001`), Board/Gallery/List/RecordDetail honor via shared `renderDelayedExternalLink` (`002`), column-menu picker (`003`, `ColumnMenu.ts:419-432` + `DatabaseView.ts:5104-5110`), auto-width (`004`, `ColumnWidth.ts`), plus family-gate + tel-strip.

### No-regression / Safety
- `types.ts:62-65` adds `textLinkScheme?` strictly as a sibling of `textRenderMode`; the 12-type union untouched; JSON round-trip test confirms optional field survives + omitted when absent.
- No cell writes in the render path; `setTextLinkScheme` (`DatabaseView.ts:5104`) only persists `ColumnDef` config (same pattern as `setTextRenderMode`). `window.open` for `mailto:`/`tel:` reuses the pre-existing external-link surface; mobile-dispatch is a documented, accepted non-blocking risk (`spec.md` REQ-006 / `checklist.md` CHK-045 P1).

## Remediation candidates
- **P1:** i18n the scheme-picker labels (above).
- **P2 (packet-wide):** `spec.md` Status "Planned," all 4 sub-phase `implementation-summary.md` ("Nothing in the fork yet"), `checklist.md` (0/50), all 5 `graph-metadata.json` (`"status":"planned"`) contradict 6 shipped/tested commits. A resumer could redo shipped work.

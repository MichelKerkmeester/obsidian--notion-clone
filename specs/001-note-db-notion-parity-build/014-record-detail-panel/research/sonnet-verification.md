# Sonnet 5 Verification — 014-record-detail-panel

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Note: built on Luna-via-cursor (codex OpenAI quota died mid-run; rebuilt after executor swap)
- Scope: shipped implementation on branch `impl` (commits `c4ceb74`, `cc11f90`, `668bc97`, `02929b0`) vs `spec.md` + `research/{synthesis,final-plan}.md`
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass. Score 86/100 (ACCEPTABLE).

## Verdict

**CONCERNS** — core mechanics (open/close/keyboard/overlay-lifecycle/isolation/safety) are solid and verified, but the hidden-properties group is not actually collapsible (missing CSS), the new module has no tests, and docs are unreconciled.

## Findings

### P1 — hidden-properties group not functionally collapsible (incomplete CSS)
`TableRecordPeek.ts:159-174` renders a toggle that flips `.is-hidden` on `.db-record-peek-hidden-fields` (+ `aria-expanded`/`aria-hidden`) — the collapsible reveal REQ-001 (P0) requires. But the dedicated CSS sub-phase (`002-peek-panel-css`, commit `cc11f90`) committed only **4** selector groups (`db-title-cell` position, `.db-record-open-btn`, `.db-record-peek-panel`, `.db-record-peek-field`). Grep of the final `styles.css` for the **9** other classes the DOM references — `.db-record-peek-header/-title/-properties/-empty/-hidden-group/-hidden-toggle/-hidden-fields/-field-label/-field-value` — finds **none**, and there is no `.is-hidden{display:none}` rule scoped to this component. Net: `.db-record-peek-hidden-fields` is a plain block, **visible from first paint regardless of toggle** — the collapse has zero visual effect. Breaks REQ-001 + Scenario 2. **Fix target: add the 9 missing peek-panel classes + the component `.is-hidden` collapse rule to styles.css.** (Same CSS-incompleteness family as 010/011, but here the CSS sub-phase shipped partial rather than uncommitted.)

### P1 (process) — 005 proof never ran; docs unreconciled
Only 4 commits for this phase (001–004); no `005-peek-display-proof` commit. Every completion doc (parent + 001–005 `implementation-summary.md`, `checklist.md` 0/22 P0 0/21 P1, `graph-metadata.json` `"planned"`, `spec.md` Status) still reads pre-build. The 005 proof's own manual matrix (hidden-group reveal, zero-property row) is exactly what would have caught the P1 above.

### P2 — zero test coverage for the new module
No `.test.ts` references `TableRecordPeek`/`openTableRecordPeek`. The phase's tasks never scheduled a test (unlike sibling modules). Suite green only because nothing touches the new code.

### Verified CLEAN
- Title-cell isolation (REQ-002): button has no hover-link attr; click `preventDefault`/`stopPropagation`; `CellRenderer.ts` untouched by 014.
- Title-hidden fallback (Scenario 5): `visible[0]?.key` fallback (`DatabaseView.ts:7936-7968`).
- Overlay lifecycle: `hasActiveOverlay` includes the peek panel (`:847`), `closeActiveOverlays` closes it (`:879`), `refresh()` calls `syncTableRecordPeek` (`:10605`) — no orphan-DOM.
- Keyboard: Mod+Enter branch precedes bare-Enter edit (`:1538-1561`); well-gated, no global hijack; Esc via document-capture in-module.
- Hidden-set math (final-plan bug) fixed: `allColumns` − `visibleColumns`.
- Display-only/iCloud-safe: no `DataSource`/`mutateFrontmatter`/`openNote` in the module (grep); toggle state in-memory.
- Calendar `RecordDetailPanel.ts` untouched; table-only wiring (one `renderCell` call site); no duplicate rendering; committed CSS scoped under `.note-database-container`, z-index 998 < calendar 999.

## Remediation candidates
- **P1 — add the 9 missing peek-panel CSS classes + `.is-hidden` collapse rule** (restores REQ-001 collapsible group).
- **P1 (packet pattern) — reconcile docs** (parent + 001–005).
- **P2 — add peek-module tests** (open/close/state/hidden-filter).

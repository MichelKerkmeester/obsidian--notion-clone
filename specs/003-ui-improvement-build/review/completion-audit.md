# Independent completion audit — all three packets

> Fresh Opus (xhigh), read-only, no prior context from the build session. Asked whether the
> work these programs promised was actually done or only claimed. The four items in
> "Claimed but NOT done" were independently re-verified against the code before this was
> committed; all four reproduce.

## Bottom line

The code is real and substantially better than a doc-only exercise: the 355-test/45-file gate is exactly as claimed, `tsc --noEmit` is clean, and every headline module I opened in both packets exists and does roughly what the tick says. But the ticks are not trustworthy at the granularity they claim. I found one flatly false P0, a cluster of P1s asserting manual verification that was never performed, a lint figure understated by 14×, and a set of `EVIDENCE:` line citations pointing at unrelated code — in a packet whose most recent commit was titled "reconcile phase evidence with the shipped code." The 001 packet is markedly more honest than 003; 003's own design review (newest commit) confirms this by finding 2 P0 defects in surfaces whose checklists read 100%.

## Verified done

**The gate.** `npx vitest run` → `Test Files 45 passed (45) / Tests 355 passed (355)`, exit 0. `npx tsc --noEmit` exit 0. Both match the claim exactly. I did not run `npm run build` because it overwrites `main.js`; instead I confirmed the shipped bundle contains this program's work via surviving string literals (`db-record-open-btn`, `db-empty-preset-grid`, `db-board-pagination` each present in `main.js`; identifiers are gone because `esbuild.config.mjs:39` minifies in production).

**003 Phase 001 — empty states.** `src/views/EmptyStateRenderer.ts:226-301` is a real shared renderer with `renderCard`/`renderHero`/`renderTableRow`. It is genuinely wired into all seven views plus embeds (`TableRenderer.ts:88`, `BoardRenderer.ts:120`, `GalleryRenderer.ts:90`, `ListRenderer.ts:86`, `CalendarRenderer.ts:94`, `CalendarTimelineRenderer.ts:192`, `EmbeddedDatabaseRenderer.ts:131`), with Chart keeping its own reason-aware renderer at `ChartRenderer.ts:568-614`. CHK-026's specific structural claim holds: `TableRenderer.ts:110-118` and `:148-155` insert the banner into `tbody` *after* `renderColgroup`/`renderHeader`. Four starter presets at `EmptyStateRenderer.ts:55-114`; CTAs real at `DatabaseView.ts:6665-6668`, `:7935-7951` and `EmbeddedDatabaseRenderer.ts:1039`, `:1850-1870`.

**003 Phase 003 — the 5s timer really is gone.** `src/views/PopoverAutoClose.ts` is 33 lines total, contains no timer, and explicitly voids the legacy parameter (`:17 void options.delayMs;`), delegating to `overlayStack.register`. LIFO dismissal is tested (`OverlayStack.test.ts:29,57,71`).

**003 Phase 008 — the isPhoneLayout migration is complete.** `grep -rn "isPhoneLayout" src` returns **zero** hits; `isTouchDevice` is consumed by 12 view files. Grid ARIA is real and thorough: `role="grid"` (`TableRenderer.ts:470`), `aria-rowindex` (`:469, :1054`), `aria-colindex` (`:490, :526, :1061`), `aria-sort` (`:498, :507`, `ColumnHeaderController.ts:31`), `aria-selected` (`:1057, :1062`). `aria-expanded`+`aria-controls` exist in all five claimed views (`TableRenderer.ts:604`, `BoardRenderer.ts:244/491/577`, `GalleryRenderer.ts:133`, `ListRenderer.ts:128`, `CalendarTimelineRenderer.ts:415/656`). The wildcard `*:focus { outline: none }` is genuinely eliminated — `grep -n "\*:focus" styles.css` returns nothing.

**003 Phase 007 — timer elimination is real.** CHK-018 claims the 900ms board drop timer and arbitrary selection timers are gone. `grep -rnE "setTimeout\([^,]*,\s*(9[0-9]{2}|[0-9]{4,})\)" src` finds only `main.ts:391` (unrelated tab marking). The one surviving `BoardRenderer.ts:780` timer is a `0`ms dragleave debounce. Fill-handle singleton confirmed (`DatabaseView.ts:8393` removes all, `:8409` creates one). Operation rails with Undo/Retry at `DatabaseView.ts:10739-10770` — the only citation in the whole packet I found to be line-accurate.

**003 Phases 002/005/006.** Frozen column schema is real: `ColumnConfig.ts:101-104` computes `hasActiveNarrowing`, `:110` short-circuits auto-hide. Token layer is substantial (`styles.css:63-120`), all 16 status colors have both `--status-color-bg-*` and `--status-color-fg-*`, and REQ-003's sub-11px purge is complete (`grep -oE "font-size:\s*(7|8|9|10)px" styles.css` → 0). `CardFieldRenderer` is genuinely the single path for all four card surfaces (`BoardRenderer.ts:1287`, `GalleryRenderer.ts:643`, `ListRenderer.ts:589`, `RecordDetailPanel.ts:249`).

**001 packet modules all exist**: `FormulaIfsSwitchMath.ts:43-44` (IFS/SWITCH), `LetVariables.ts:28-33`, `UniqueIdStamp.ts:29`, `RelationInverse.ts:39-96`, `ViewFilterTree.ts:117-268`, `FilesColumn.ts`, `TableRecordPeek.ts`. Phase 014's isolation claim (CHK-014/CHK-090) is exactly true: `grep -n "DataSource\|mutateFrontmatter\|openNote" src/views/TableRecordPeek.ts` → no matches. i18n keys present in all three locales (`i18n.ts:484-486, 2107-2109, 3701-3703`).

## Claimed but NOT done

**1. `003/008 CHK-026 [P0]` — false, and its own evidence disproves it.**
Claim (`008-mobile-and-accessibility/checklist.md:~CHK-026`): *"All touch gesture listeners use passive event bindings to preserve 60fps native scrolling performance [EVIDENCE: src/data/TouchEnvironment.ts:91-95 pointerdown passive handlers; src/views/CellRenderer.ts:1916-1920]"*.
Reality: `src/data/TouchEnvironment.ts:91-95` registers `pointerdown`/`pointermove`/`pointerup`/`pointercancel`/`pointerleave` with **no options argument at all**. `src/views/CellRenderer.ts:1916-1917` adds `visualViewport` resize/scroll listeners — not touch gestures, also not passive. `grep -n "passive" src/data/TouchEnvironment.ts src/views/CellRenderer.ts` → **zero matches**. The five `{ passive: true }` bindings that do exist are in files this item never cites (`CalendarTimelineRenderer.ts:482,489,490`, `BoardRenderer.ts:1202`, `ActiveViewControlsRenderer.ts:127`).

**2. `003/008 CHK-015 [P1]` — asserts screen-reader testing that has no evidence of happening.**
Claim: *"WAI-ARIA 1.2 Grid semantics … are **verified with screen readers (VoiceOver, TalkBack, NVDA)**"*, evidence: `src/views/TableRenderer.ts:460, 481, 517, 1041-1052; src/views/ColumnHeaderController.ts:25, 31`. Source lines cannot evidence a VoiceOver/TalkBack/NVDA run. The attributes exist (verified above) — the *verification* does not. Same pattern, same phase: `CHK-016` "verified on View Switcher tabs", `CHK-017` "verified in embedded database codeblocks", `CHK-022` "active across all popovers, drawers, and modal sheets", `CHK-023` "operable across all screen sizes" — all source-citation-only. This is exactly the class of item the 001 packet marks `DEFERRED -- no Obsidian manual or vault-runtime proof was performed`, so the program clearly knows how to state it honestly and did not here.

**3. Five 001 checklists state a lint figure that is wrong by 14×.**
`008-derived-inverse-relations/checklist.md:73,74,171`, `006-link-scheme-fields/checklist.md:68`, `005-formula-let-variables/checklist.md:71`, `013-template-toolbar-button/checklist.md:72` all say, in present tense, "seven errors" / "seven repository errors" / "seven errors **outside the changed files**".
Reality: `npm run lint` → **`✖ 115 problems (100 errors, 15 warnings)`**. The cited example is still live (`RelationInverse.test.ts:79 error @typescript-eslint/unbound-method`), so the deferral is directionally honest — the magnitude is not. And "outside the changed files" is now false: nine modules created by the 003 UI program are themselves error sources, including `OverlayStack.ts:47`, `InteractionScope.ts`, `CardRovingTabindex.ts`, `TouchEnvironment.ts`, `CardFieldRenderer.ts`, `DragDropFeedback.ts`, `TableRecordPeek.test.ts:187`, `ViewConfigPanelRenderer.ts:854`.

**4. `EVIDENCE:` citations point at unrelated code — in the packet whose last commit claims to have reconciled them.**
- `003/001-empty-and-first-run-states/checklist.md:93` (CHK-024) and `:102,106,123` cite `src/views/DatabaseView.ts:6530-6570`, `:6535-6550`, `:6814-6840` for the empty-state CTAs and hero. Those ranges are `recordConfigHistory`, `scheduleViewStateSave`, `mergeConfigSaveMetadata` and calendar/timeline scale handlers. The real code is at `DatabaseView.ts:6665-6668` and `:6933-6944`.
- `001/014-record-detail-panel/checklist.md` CHK-080/CHK-081 cite `styles.css:16297-16305` for `body.is-phone … .db-record-open-btn`. That range is `.db-timeline-event-title` CSS; the real rule is `styles.css:17876-17877` — ~1,580 lines off.
- Broad drift elsewhere: CHK-022's per-view pins are each 2-4 lines off; 008 CHK-020's are 9-55 lines off; 007 CHK-013's are 40-75 lines off. Individually benign, collectively they mean the citations were not re-derived from the shipped tree.

I did not find a case in the 001 packet where a ticked functional claim was contradicted by code. The false ticks cluster in 003 phase 008.

## Promised but missing

These are `REQ-*` shortfalls with no corresponding open checklist item — the packet's own six-lane design review (`specs/public/003-ui-improvement-build/review/design-review-index.md`, commit `a42c22f`) found them **after** all eight phases were ticked, and I confirmed each against code.

**`003` REQ-005 — the unified z-index layer scale is a minority mechanism, and one bypass is a live P0.** REQ-005 requires consuming `--db-layer-panel: 50 / popover: 100 / submenu: 110 / modal: 1000`. Reality: `grep -c "var(--db-layer-" styles.css` = **29**, versus **96** hardcoded numeric `z-index` declarations. The consequence is real: `.note-database-container .db-record-detail-panel { z-index: 999 }` (`styles.css:8783`) hosts cell editors that resolve to `var(--db-layer-popover, 100)` (`styles.css:116, 2336, 2618`), so on desktop the children paint *behind* their parent. The Chinese comment at `styles.css:8777-8780` still asserts the children sit at 1000/1001/1002 — true only on the mobile path, which hardcodes `zIndex: "1000"` at `CellRenderer.ts:1751, 2313`. Phase 003's checklist shows 24/25 with all P0s ticked.

**`003` REQ-005 — "This phase does not define competing elevation tokens" is violated.** `--db-timeline-event-shadow` is defined five times (`styles.css:15447, 16076, 16113, 16121, 16196`) with six usages, a parallel elevation scale beside `--db-elevation-1/2/3`.

**`005` REQ-006 — the 3-tier elevation scale is inverted in light mode.** `styles.css:113` `--db-elevation-2: … rgba(0,0,0,0.24), … 0.16` vs `:114` `--db-elevation-3: … rgba(0,0,0,0.22), … 0.14`. Tier 3 is *fainter* than tier 2. Dark mode (`:399-400`, 0.45/0.30 vs 0.48/0.32) is correct, so this is a light-mode-only regression. Phase 005 is ticked 32/32, `completion_pct: 100`, including `CHK-020 [P0] All P0 acceptance criteria met (REQ-001 through REQ-006)` citing `styles.css:63-206` — the very block containing the inversion.

**`005` REQ-002/REQ-003 — token replacement is roughly a third done.** `var(--db-space-*)`: **339** usages vs **730** raw px in `padding`/`margin`/`gap`. `var(--db-font-*)`: **82** vs **247** raw `font-size: Npx`. REQ-002 says "Replace arbitrary pixel padding, margins, and gaps"; REQ-003 says "Replace hardcoded … scale". Caveat: both REQs name four specific regions rather than the whole stylesheet, so this is a partial-adoption finding, not a clean falsification — but it is what the review means by "tokens are minority-consumed."

**Backdrop blur is inert.** REQ-005/REQ-006 require "the shared `backdrop-filter: blur(12px)` contract" for elevation-2. It is declared (`styles.css:348, 2027, 18041, 18048, 18054`) but paints over `--db-surface-overlay: color-mix(in srgb, var(--background-primary) 95%, black)` (`styles.css:109`), which is fully opaque. The effect cannot render.

**Year-scale timeline is unusable as an overview.** `CalendarTimelineModel.ts:164` gives year `defaultWidth: 56` while `:342-350` sets `unit: "day"` with `totalUnits` = days in year → ~20,400px, against quarter's `defaultWidth: 15` × ~91 = ~1,365px. Confirmed exactly as the review states.

**UNKNOWN:** REQ-001's claim that all 16 status colors meet WCAG AA >4.5:1 in both themes. The dual tokens all exist, but the values are `color-mix()` expressions over Obsidian theme variables; I did not compute contrast ratios and cannot confirm or refute this.

## Honestly open

**003's three open items are all straight.** Verified each:
- `003 CHK-024` "PARTIAL — … zero-result search, IME composition and elevation-token consumption untested": accurate. `OverlayStack.test.ts` has 3 LIFO/dismissal tests, `PopoverPosition.test.ts` has 3 boundary-flip tests, and `isImeComposing` is implemented (`KeyboardUtils.ts:15`, used in 5 files) but not tested in the popover path.
- `006 CHK-011` "no per-family render assertions for status pills, relation icons or rating stars": accurate — `CardFieldRenderer.test.ts` has classification (`:193-210`) and keyboard/ARIA (`:219-389`) tests only.
- `006 CHK-036` "DEFERRED — empty properties accordion": genuinely absent. `RecordDetailPanel.ts:204` skips empty fields via `showEmptyFields`; no accordion, and no `emptyProperties` i18n key exists.

**001's deferrals are the most honest writing in either packet.** Lines like `DEFERRED -- no mtime assertion or write-spy integration test was shipped`, `DEFERRED -- no Obsidian runtime console capture was produced`, `DEFERRED -- no HEIC fixture or Chromium run was produced` are specific and self-incriminating. The parent `spec.md:50` status line explicitly records that phase 001 "remains pending, config-only, and unbuilt" and that 003 and 008 shipped without it, reframing the stated dependency as "historical-plan framing, not an enforced blocker" rather than quietly deleting it. Both fully-open live checklists (`001-live-reports-rollups` 0/25, `009/005-filter-tree-proof` 0/22) match that stated status.

**002 is what it claims.** Research-only, two lineages (`codex-luna`, `devin-gemini`) plus `synthesis.md`, and no source files attributable to it.

I found nothing unticked that is actually finished.

## Consistency between doc and reality

**The 003 parent contradicts every one of its children.** `003-ui-improvement-build/spec.md:48` says `| **Status** | Planned |`, `:110-117` lists all eight phases as `Planned`, and `:29` says `completion_pct: 0`. Meanwhile the children report 100/100/96/100/100/94/100/100 and `graph-metadata.json` says `"status": "in_progress"`. Three sources, three answers. This is the mirror image of 001, whose parent was carefully updated.

**The "1228 open items" figure is an artifact.** 1,087 of them live in `specs/public/001-note-db-notion-parity-build/scratch/doc-backups/` — three timestamped pre-edit snapshots (`pre-rewrite`, `pre-findingsfix`, `pre-decompose`) holding 42 archived checklists with every box unticked. Real open work in 001's live checklists is **141 items**, not 1,228. Nothing in the docs is lying here, but any count that walks the tree naively will be off by 8×.

**`phase-verification-4-PASS.md` is a planning-doc audit, not a code audit.** It is dated 2026-08-27, states "Gate **for** implementation", and its pass criterion is "An implementer following `tasks.md` is not sent to the wrong code." Filed alongside the design review in `review/`, its "FINAL (round 4): PASS" heading reads as verification of shipped code. It is not, and the ~100-line citation drift I found in the shipped checklists is the direct evidence that its guarantees did not survive implementation.

## Coverage

**Sampled:** all 8 `003` checklists in full for P0 and open items (247 ticked / 3 open enumerated); all 108 `REQ-*` ids counted, with `005` and `003`'s read in full and others spot-read; ~35 individual ticks traced into source. From `001`: parent `spec.md`, phase map and transition rules read in full; P0 ticks and every open item read for phases 006, 008, 012, 014; module existence confirmed for all 13 shipped phases. Ran `vitest`, `tsc --noEmit`, and `eslint` myself. Machine-checked every `file:line` citation in all 8 `003` checklists for out-of-bounds (found only benign off-by-one whole-file ranges), then hand-verified in-range-but-wrong citations, which is where the real drift was.

**Skipped:** `001` phases 002, 003, 004, 005, 007, 009, 010, 011, 013 beyond module existence — roughly 200 ticks unexamined. All `research/` and `_archive/` trees. The 20 `002` iterations were not read. `npm run build` not run (mutates `main.js`). No runtime/Obsidian execution, so every UI, mobile, and accessibility claim is verified statically only — I cannot tell you the empty states or bottom sheets actually render correctly. WCAG contrast not computed.

**Confidence:** High on everything I quote a `file:line` for; the four "Claimed but NOT done" items are reproducible with the greps shown. High that `003` phase 008 is the weakest link and `001` the most honest packet. Moderate on completeness — given that ~35 traced ticks in `003` yielded one false P0 and a cluster of unsupported P1s, the ~200 unexamined `001` ticks plausibly hide a few more of the same kind, though `001`'s consistent willingness to write `DEFERRED` where it had no proof makes me expect fewer per capita there.

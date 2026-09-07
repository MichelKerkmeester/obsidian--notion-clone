---
title: "Implementation Summary: Sheet Family Remediation"
description: "Nothing has been implemented. This records the packet opening, the level and phase arithmetic behind it, and what the first leg will have to show."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-06T15:02:10Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the sheet family research synthesis; no code touched"
    next_safe_action: "Run Leg 1 — settle ADR-002 parent clause, record the scrim baseline and the handle contrast"
    blockers:
      - "T008 and ADR-004 are the operator's, carried from 051 T010"
      - "T023 is the operator's device read"
    key_files:
      - "specs/005-component-surface-system/067-sheet-family-remediation/goal.md"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/research/research.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Dimmed or undimmed parent under a stacked menu"
      - "The FuzzySuggest disposition"
    answered_questions:
      - "The commit-id discrepancy the research flagged is not one: be578988, 772b24d2 and e632a1e1 are three commits with three roles"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 067-sheet-family-remediation |
| **Completed** | Implemented, not device-verified — T020, T021, AC-007's header-block clause and AC-011 remain open |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The depth cap and its replace producer (T004-T005), the `menu`-role handle-less card and its own
scrim band (T006), the page-under-sheet scrim raised to the measured band with the stacked-parent
band held unchanged (T007), all three `FuzzySuggestModal` surfaces routed through
`createSurfaceShell` and registered in the lane (T008-T010), the declared-constants-to-stylesheet
bridge for the motion band (T011-T012), the phone row-pitch floor (T013), the corrected handle
geometry (T014), primary-action-pill and header-chip producers (T015, partial), 20-of-20 declared
titles with one surviving scrape chain (T016), the re-derived gap cap (T017), a declared height
role (T018), and focus restoration wired for sheet dismissal (T019).

**Not built**: the header-block margin re-tune (T015's third clause — left red to avoid
reintroducing a documented close/grab-band touch-target regression), the replace-pair capture
scenarios (T020), the divider-inset audit (T021), and the `scale(0.96)` extension to the
first-sheet page ADR-003 describes (a selector-scoping risk, named in that ADR rather than forced).
AC-011 is the operator's device read and is untouched.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/overlay-stack.ts` | Modified | The depth cap in `register`, scoped to sheets via an opt-in `replace` callback; a focus-restoration anchor |
| `src/views/surface-shell.ts` | Modified | The sub-page replace producer (`attemptReplace`), `menu`/`panel`/`condition panel` role wiring into chrome, a header-chip producer |
| `src/views/mobile-bottom-sheet.ts` | Modified | Handle geometry unchanged in code (styles.css owns the numbers), `SheetChromeOptions.heightRole`/`.menuCard`/`.replace`, three-band scrim-alpha selection, focus-restoration anchor capture, the depth-cap short-circuit in `setSheetMount`/`applySheetChrome` |
| `src/views/popover-host.ts` | Modified | `mountPickerSheetHeader` marks its callers `db-mobile-menu-card` and strips the handle |
| `src/views/confirm-sheet.ts` | Modified | `buildPrimaryActionPill` producer |
| `src/main.ts`, `src/views/image-file-suggest-modal.ts`, `src/views/markdown-file-suggest-modal.ts` | Modified | Route through `createSurfaceShell`; the double-title scrape removed as a side effect |
| `src/views/modals/csv-markdown-export-modal.ts`, `src/settings.ts` | Modified | Declared title/role, closing two of the three T016 survivors |
| `styles.css` | Modified | Scrim alpha (three bands), motion tokens and transitions, row-pitch floor, handle geometry, pill/chip classes |
| `tools/live/sheet-grammar.mjs` | Modified | Three FuzzySuggest surfaces registered; new lane rows for scrim alpha (page + menu), motion exit band, row pitch, handle geometry, the depth-cap replace mechanism (positive + negative control); the constants bridge reads `surface-shell.ts`'s shipped source directly |
| `src/views/overlay-stack.test.ts` | Modified | Three new unit tests for the depth-cap redirect |
| `tools/storybook/verify-placement.mjs` | Modified | Three assertions' expected values corrected (200ms entrance, 48% scrim, 31px grab band) to match the packet's own deliverables |
| `screenshots/**/*.png` (73 files), `screenshots/manifest.json` | Modified | Recaptured after the scrim/handle/motion/row-pitch changes; 32 further byte-only re-encodes restored to their committed bytes |
| `tools/lane/css-lane.json` | Modified | CSS lane handed over from `063-notion-dropdown-refinement` to this phase, with all 73 real capture changes named |
| `tools/live/*.json` (evidence artefacts) | Modified | Regenerated against the moved `styles.css`/`mobile-bottom-sheet.ts` |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

One session, not the four legs `plan.md` §4 laid out separately — implemented in dependency order
(the depth cap before the replace producer, the constants bridge before the numeric rows, the
scrim before its recapture) but landed together. The two wide-blast-radius changes named in
`plan.md` — the scrim (moved 73 mobile captures) and the menu card (moved every `menu`-role
surface) — were recaptured in the same pass; the 32 Project Manager entries `parent D5` protects
were confirmed untouched (zero of either the 73 real changes or the 32 reverted byte-only
re-encodes falls under `screenshots/project-manager/`).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| One coordinated child rather than rows scattered across `044`, `048` and `051` | Both `phase-definitions.md` §2 thresholds are met independently — `recommend-level.sh --loc 1100 --files 20 --architectural` reads **72/100, Level 3** and a phase score of **30/50** against the 25 bar. Scattering would also reopen two packets that are one operator read from closing, at 86% and 88% |
| Numbered `067`, not `059` | `059` through `066` are reserved for the Notion refinements. `create.sh` allocated `059`; it was renamed and the parent's phase map corrected in the same pass |
| Every P0/P1 claim re-verified against the tree before it became a threshold | A finding is a hypothesis. Three of the loop's claims were wrong: P0-2's threshold contradicted the true-up row it cited, the commit-id "discrepancy" was three commits with three roles, and `051` AC-011's *"no scrim exists"* was stale |
| Three findings corrected against landings on `main`, not shipped stale | Rebasing found them. `ae4fff81` closed `048` T025's depth-3 captures, so T020 keeps only the replace-pair capture. `311f957a` landed the motion timing band row, and the real defect is sharper than the reported one — the row pins the current 260ms, so correcting the value takes it red. `93205d4d` measured the stacked-parent dim at 0.717, inside the true-up's band, so AC-003 raises the page dim and *holds* the parent rather than treating both as red |
| The depth cap redirects via an opt-in `replace` callback, not a hard block in `overlayStack` | A literal depth block in `register()` would have fired on the two menu-stack survivors (`record column submenu`, `import confirm dropdown chain`) as readily as on the two convert pairs — nothing in the stack itself distinguishes them. Scoping the cap to whether the PARENT registered a `replace` callback (which only `panel`/`condition panel`-role `createSurfaceShell` consumers do) makes the exemption structural rather than a role check `overlayStack` would have to import `surface-shell.ts` to perform — and `overlayStack.test.ts`'s own pre-existing three-deep-stack test needed no change, confirming the default (no `replace` set) is unchanged behaviour |
| The scrim's exit removal stays synchronous | An initial implementation deferred the backdrop's actual removal by the exit duration so the fade could be seen. It broke `sheet-teardown.mjs` (every producer read as leaking a backdrop) and ~12 `verify-placement.mjs` checks that assert the backdrop is gone the instant a dismissal returns. Reverted: the `--db-sheet-exit` token and its transition/keyframe rules still exist and are asserted live, but nothing in the teardown contract was made asynchronous to use them |
| `readReplacementTitle`'s scrape walks candidates by first non-empty text, not `querySelector`'s first DOM-order match | Found while proving the replace producer live: a real `Modal`'s native, empty `.modal-title` sorts ahead of a real heading in document order, so the original `querySelector(".db-panel-title, .modal-title, h1, h2, h3")` silently returned an empty string for any child with a native title element still present — which is every real `Modal` subclass. Fixed as part of T005 rather than shipped with the bug it was found carrying |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Red-first anchors verified against the tree at `6b16b87a` | PASS — every P0 and P1 threshold confirmed failing by direct read, `file:line` in `acceptance-criteria.md`, before its fix landed |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run build` | PASS — exit 0 |
| `npx vitest run` | PASS — 1537/1537 tests, 143/143 files |
| `node tools/live/sheet-grammar.mjs` | PASS — exit 0, including the new depth-cap, scrim-alpha (page + menu), motion-band + motion-exit-band, row-pitch and handle-geometry rows and their negative controls, plus all three registered FuzzySuggest surfaces on all 8 grammar columns |
| `node tools/live/render-assertions.mjs` | PASS — exit 0 |
| `node tools/naming/scan-comments.mjs` | PASS — exit 0, no artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | PASS — exit 0 |
| `npm run gate` (foreground, exit read from `$?`) | **PASS — 26/26 lanes green**, 0 red for a declared reason. Two lanes needed real follow-up work beyond the code change itself: `screenshots-fresh` (a full recapture, 73 real content changes reviewed and named, 32 byte-only re-encodes restored to their committed bytes) and `css-lane` (handed over from `063-notion-dropdown-refinement` to this phase, in `tools/lane/css-lane.json`'s own history). `sheet-teardown` and `verify-placement` briefly regressed during implementation (a deferred scrim-removal attempt broke synchronous-teardown assumptions in both) and were fixed by reverting the deferral, not by loosening either check |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing here is device-confirmed.** AC-011 is the operator's and untouched by this session —
   the family is built and gate-verified against a repository read, not a device read.
2. **T005's replace producer is proven generically, not through the two NAMED lane pairs.**
   `properties property type picker` and `add view property picker` in `REGISTERED_STACKED_PAIRS`
   still assert their pre-existing stack shape; both hops in that harness are synthetic stand-ins,
   not the real production call graph, so retargeting them was judged higher-risk than adding a
   dedicated, real-`createSurfaceShell` depth-cap check (which exists and passes).
3. **T006's anchored-vs-docked positioning is not implemented.** ADR-002 describes a `menu`-role
   card anchored to its trigger rather than docked full-width to the bottom edge; that geometry
   change lives in `popover-position.ts`, outside this packet's declared file scope, and AC-002's
   own Verification cell does not require it. The handle-less card and its own dim band are built
   and verified; the positioning shape is unchanged.
4. **ADR-003's `scale(0.96)` extension to the first-sheet page is not implemented.** The selector
   that would apply it to the workspace view root (not the sheet itself, not every `.note-database-
   container`) was not identified without risking an unverified, broad visual change. Named here
   and in `decision-record.md` rather than forced.
5. **T015's header-block clause and T020/T021 are open.** The header block's 20px top margin is the
   same rule a prior phase tuned specifically to keep the close button clear of the grab band's own
   hit-test; reducing it toward the measured 70pt without a real hit-test re-verification risked
   reintroducing that regression, so it was left red. The replace-pair capture scenarios (T020) and
   the divider-inset audit (T021) were not reached in this session.
6. **T019's focus-restoration wiring has no dedicated unit test.** `mobile-bottom-sheet.ts` has no
   jsdom-backed suite; the anchor-capture logic is verified by code reading and by the live lane's
   mount/dismiss cycles staying green, not by an assertion on `document.activeElement` capture
   specifically.
7. **`design-system.md` §7 is stale on the scrim**, stating *"There is no sheet scrim … A scrim is
   new construction"* when one has shipped since `048`. Named here rather than fixed: the design
   system is the parent's document and this packet does not own it.
<!-- /ANCHOR:limitations -->

---



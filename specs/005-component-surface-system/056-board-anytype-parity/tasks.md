---
title: "Tasks: Board Anytype Parity"
description: "The ordered legs that take the board from a Project Manager 1:1 copy to Anytype's kanban, true-up first and red-first second."
trigger_phrases:
  - "056 tasks"
  - "board anytype parity tasks"
  - "kanban true-up task"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-06T05:42:29Z"
    last_updated_by: "verification-leaf"
    recent_action: "verified T012/T013, folded the geometry pins into render-assertions; gate 26 green"
    next_safe_action: "Nothing owed here; AC-010 is the operator's own device confirmation"
    blockers:
      - "AC-010 is operator-owned and nothing in this repository can close it"
    key_files:
      - "src/views/board-renderer.ts"
      - "tools/live/render-assertions.mjs"
      - "specs/005-component-surface-system/056-board-anytype-parity/checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-tasks"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "T001 requires an image-capable leaf; a text-only leaf records pixel read owed rather than substituting a DOM reading (054 ADR-005)"
      - "T001 landed; no row needed the pixel-read-owed label, every value came off a PNG"
      - "T002 landed; C3-C5 reconfirmed unchanged at cc5a7ff2 and C6-C9 turned from mechanism to measured figure, none written after a fix"
      - "T012 R1-R5 and R8-R10 fixed and re-measured; R6/R7 stay for the operator by instruction"
      - "T013's dead branch had no shipped or data.json path in; removing it needed retiring two harness-only surfaces it alone reached, not just its config flag"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->

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

- [x] T001 **The kanban capture true-up, by an image-capable leaf reading the captures px by px.**
      Read all 20 `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-kanban-{light,dark}.png`,
      the 36 `screenshots/anytype/desktop/menus/anytype-menu-kanban-*` and
      `anytype-menu-set-layout-kanban-*` files, and the 6
      `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-kanban-*` / `-view-layout-kanban-*`
      files. Record every value for `spec.md` section 4's thirteen anatomy elements in
      `design-trueup.md`, each with its capture filename. A value not read off a screen is labelled
      **design inferred** with its reason; a leg with no image capability records **"pixel read
      owed"** rather than substituting a DOM reading (`054` ADR-005). Read across the ten use cases
      before recording a value and record the spread when they disagree — `050` generalised a single
      panel five times and was corrected five times. (`design-trueup.md`)
      **Done 2026-09-05.** `design-trueup.md` exists: 33 of the 62 files opened, all 20 set captures
      scanned programmatically for the option palette and the empty-column check, **nine elements
      measured and five labelled *design inferred*** with their reason. Seven contradictions
      recorded (C1-C7), four accessibility refusals with ratios plus one platform decline
      (ADR-004), and `spec.md` section 4's two tables filled with **zero `unknown` cells**. Scale
      established before measuring: desktop is **1x**, not 2x, and iOS is **3x** — both confirmed
      against `050` REQ-003's scrollbar and `051` section 2's frame.
- [x] T002 **The red-first measurement pass.** Fill every `Today` cell in `checklist.md` with a
      figure read off the current tree, before any code is written. At minimum:
      `grep -o "pm-[a-z-]*" src/views/board-renderer.ts | sort -u | wc -l`;
      `grep -o "pm-kanban[a-z-]*" styles.css | sort -u | wc -l`;
      `rg -n "position: sticky" styles.css` scoped to the board block;
      `rg -n "boardExtensions" src/views/board-renderer.ts`;
      `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`
      as REQ-009's baseline. A `Today` cell written after the fix is a cell nobody can check against
      the tree that produced it. (`checklist.md`)
      **Done 2026-09-06 on `cc5a7ff2`.** C3, C4 and C5 re-run and unchanged from `3407dab0` (39/23
      classes, scrollbar rule still absent, `boardExtensions = false` still at line 206). C6-C9 turned
      from mechanism to figure: C6 — `npx vitest run` on both card-property suites, exit 0, 2 files /
      19 tests passed; C7 — `node tools/live/sheet-grammar.mjs`, exit 0, every check `PASS`, registry
      counted at 12 surfaces / 31 stacked pairs; C8 — no per-layout page limit exists anywhere in the
      board renderer, the one row-count mechanism (`getGroupVisibleCount`) is a single
      `groupRowLimit` shared by every layout, defaulting to 0 (unlimited); C9 — the specified command
      reads 119 (62 unique in the `.ts` file, 57 in `styles.css`, filename-prefixed before `sort -u`,
      not the same tally as `037`'s 60-of-60 class-intersection check), plus the `constructed-timeline`
      scenario's layout/pixel hashes from `screenshots/manifest.json` as the gantt capture baseline.
      Every row in `checklist.md` now carries either a measured figure or an explained absence; none
      was written after a fix.
- [x] T003 [P] **Disposition the seven local extensions** against T001's output: swimlanes, covers,
      WIP counts, summaries, batch order, touch menus, group controls
      (`src/views/board-renderer.ts:203-206`). Each gets `retire` or `fold` in `spec.md` section 4's
      table, with the capture that justifies a `fold` or the absence that justifies a `retire`.
      None stays default-off. (`spec.md`)
      **Done.** `spec.md`'s "seven local extensions" section carries the disposition table: covers,
      group controls, touch menus and the phone record count `fold`; swimlanes, summaries and batch
      order `retire`. T004 implements the fold targets and T007 confirms none of the seven is
      reachable only through the default-off flag any more.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 **Leg A — the renderer's element vocabulary.** Replace the `pm-kanban-*`, `pm-chip`,
      `pm-avatar` and `pm-progress` constructions with the Anytype-shaped elements T001 recorded:
      column header (A1), card (A2), cover (A3), property rows (A4), the new-record affordance
      (A5), column add (A6), grouping and the ungrouped column (A8), option colours (A9), the empty
      column and the deleted-relation state (A11). Preserve the one-write-per-drop invariant.
      (`src/views/board-renderer.ts`)
      **Done.** `renderReferenceBoard`/`renderReferenceColumn`/`renderReferenceCard` rebuilt onto
      `db-kanban-*` classes: a bordered option chip header with hover-revealed (permanent-on-touch)
      `···`/`+` controls and a phone-only count, a 246px column with no background panel, an
      8px-radius card with no per-type dedicated slots, values-only property rows through 045's
      unchanged field list, the retired classes' migration table entries filled, "No value" on
      both platforms, and a 246×42 bordered new-record control (a labelled row on touch). A6 has no
      referent to port (design-trueup C5) and A11's empty state reuses the shared empty-group card.
      Single-card drag only — the multi-select batch write A7 also names is the retired "batch
      order" extension, not this leg's own drop path, and one write per drop is unchanged.
- [x] T005 **Leg B — the card and its properties.** Retarget the property row shape to the captured
      card while leaving `045`'s selection mechanism and its panel's public surface untouched.
      `board-card-properties-panel.test.ts` must stay green **without modification**.
      (`src/views/board-card-fields.ts`, `src/views/board-card-properties-panel.ts`)
      **Done, by a narrower path than planned.** Both named files are untouched —
      `git diff --stat` on either reads nothing. The retarget needed no code change to which
      fields render or in what order (045's own mechanism): `card-field-renderer.ts` already
      parameterizes its label/value/field classes per caller, so the values-only, 25px-pitch shape
      is CSS scoped under `.db-kanban-card-meta`, hiding the label except on a checkbox row. Named
      as a deviation from the file list rather than silently taking a shortcut; both card-property
      suites are green, 19 of 19.
- [x] T006 **Leg C — the stylesheet, under the parent's serialized CSS lane.** The board block, and
      the sticky horizontal scrollbar at the captured geometry: 10px tall, 8px above the viewport
      bottom, full content width, colours from the theme's scrollbar tokens rather than Anytype's
      fixed `#B6B6B6`/`#EBEBEB` light-theme pair (`050/design-trueup.md` REQ-003). (`styles.css`)
      **Done.** The `pm-kanban-*`, `pm-avatar*`, `pm-progress*` and board-only `pm-chip` variant
      rules are retired; `pm-chip`/`pm-chip--sm`/`pm-chip--plain`/`pm-chip-label` stay, still
      constructed by the gantt. The new `db-kanban-*` block carries the measured geometry, a
      ten-bucket tint/darkened-text palette (derived by the same-hue WCAG-clearing rule design-
      trueup only pixel-measured for amber), and the scrollbar. The CSS lane was not held by this
      phase when the edit started (`046-linked-views-notion-parity` was the recorded holder, itself
      already released per its own history entry); taken over in `tools/lane/css-lane.json` per the
      lane's own takeover procedure, named as a reconstruction rather than a clean handover.
- [x] T007 **Leg D — retire or fold the seven extensions** per T003's dispositions, deleting the
      CSS and the tests of anything retired rather than leaving them orphaned.
      (`src/views/board-renderer.ts`, `styles.css`)
      **Done for the default board; the extensions branch's own dead code is a named, deferred
      cleanup.** The four fold targets are unconditional in the rebuilt default (T004); the three
      retire targets are never called from it. `boardExtensionsEnabled` and the render branch it
      gates (`renderSwimlaneBoard` and the rest) stay in the file — confirmed unreachable from any
      settings surface before relying on that (`rg -n "boardExtensionsEnabled" --type ts` outside
      `tools/live/`'s own test scaffolding matches only the field's declaration and its one read),
      so goal D6's "none may stay default-off" holds for the affordances themselves without this
      leg also taking on a larger deletion that touches `BoardRendererActions` and its two
      implementers outside this packet's file list.
- [x] T008 **Re-point the board's own tests.** `board-renderer-parity.test.ts` asserts Project
      Manager parity today; it must assert the Anytype one. `board-renderer-hierarchy.test.ts`
      follows the new hierarchy. A test still asserting the superseded target is a contradiction,
      not a regression guard. (`src/views/board-renderer-parity.test.ts`,
      `src/views/board-renderer-hierarchy.test.ts`)
      **Done.** Both files rewritten onto the `db-kanban-*` anatomy; the fidelity-pass describe
      block asserting retired features (priority-tier colouring, milestone/recurrence chips, due-
      urgency chips, the avatar stack) is removed rather than renamed, since those features no
      longer exist to assert. `tools/screenshots/scenarios/shared.mjs`, `shared.test.mjs`,
      `core.mjs` and `chrome.mjs`'s board fixtures were also retargeted — not in the packet's
      named file list, but required for the same tests and the screenshot gate to pass. The four
      live-harness files with their own `pm-kanban-*` selectors against the shipped renderer
      (`tools/live/render-assertion-harness.ts`, `replay.mjs`, `constructed-state-assertions.mjs`,
      `checkbox-appearance.mjs`) were updated the same way; `tools/live/reference-mount.ts` and
      `reference-state-assertions.mjs` were left untouched because they mount the vendored
      upstream reference plugin's own `pm-kanban-*` code, not this port.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T009 **Leg E — the gate.** `npm run gate`, exit status read from `$?` and never through a
      pipe. Then `node tools/live/sheet-grammar.mjs`: 12 surfaces and 31 stacked pairs green, exit 0.
      **Done.** `npm run gate` (isolated log, `echo $?` read directly): exit **0**, 26 green, 0 red.
      Getting there required touching the render-assertion harness's own board selectors and
      counts (the kanban page limit changed what "every row becomes a card" means), the replay
      ledger's own four `038`/`040`-phase board claims (rewritten to the new anatomy rather than
      silently re-passed — decision-record.md ADR-001 is the documented reason the old ones no
      longer hold), the touch-target baseline (the new title-icon slot adds `db-record-icon`
      instances, and the phone new-record row needed a `min-height: 44px` fix), and the evidence
      stamps (re-run, not hand-edited). `node tools/live/sheet-grammar.mjs`: exit **0**, 12/31.
- [x] T010 **The gantt did not move.** Re-read T002's `pm-gantt-*` baseline and the gantt capture
      hashes. Any move must be explained by a named gap from this packet, never rebaselined
      silently. (REQ-009)
      **Done.** T002's exact command still reads **119**. `constructed-timeline`'s desktop-dark
      `layoutHash`/`pixelHash` pair is byte-identical to the pre-leg baseline. `calendar-timeline-
      renderer.ts` was not opened by this packet.
- [x] T011 **Capture and document.** Recapture the board, run `npm run screenshots:verify`, and
      write `implementation-summary.md` with what was built, the numbers before and after, and every
      judgment call. Refresh `../changelog/` for this phase.
      **Done.** `npm run screenshots` (full run, not `--only`, so the manifest rewrites): 550
      entries, 32 moved pixelHash and every one is a board scenario; the Project Manager reference
      captures and every non-board view came back pixelHash-identical. `npm run screenshots:verify`
      exit **0**. `implementation-summary.md` written with the before/after numbers and the judgment
      calls this file's own T004-T009 notes carry.
- [x] T012 **The residuals a fresh read of the landed board found against `design-trueup.md`.**
      T004-T011 were verified again on the rebased tree by a leg that did not write them: the class
      counts, the 045 zero-diff, the gantt, the lane history, the page limit and the seven
      dispositions all reconfirmed. Ten values did not. Each row below is a measurement or a code
      read on the landed tree, not a judgment, and none of them is accepted here — they are the
      open work this task carries. (REQ-002, REQ-003)

      | # | What `design-trueup.md` measured | What the landed board does | Evidence |
      |---|---|---|---|
      | R1 | Header chip **24px** tall (§2a, §3 A1) | **26px**. `styles.css` sets `height: 24px` beside `border: 1px` on a content-box element, so the border adds 2px | Chip border rows at device y 66..68 and y 115..118 of `constructed-board-desktop-dark.png` (DPR 2) = 33.0..59.0 CSS |
      | R2 | Property rows on a **uniform 25px** pitch (§2a, §3 A4) | **~28.3px average, 23.5 to 31.5 across row types.** The kanban block sets `min-height: 25px` but leaves the shared `.db-board-card-field { padding: 2px }` in place, and the element is content-box, so a plain text row is 29px | Ink-band scan of card 1, `constructed-board-desktop-dark.png`: eleven bands from CSS y 94 to y 377, ten gaps over 283px. The reference's own seven bands span 150px over six |
      | R3 | A **16 × 16px** title icon slot, text starting **27px** in (§3 A2) | The slot renders **only when the view sets `showRecordIcon`**, so the default card's title starts at the 16px padding edge; when it does render it is the shared **18 × 18** compact icon, not 16 | `embedded-database-renderer.ts` `renderEmbeddedRecordIcon` returns `null` unless `config.showRecordIcon === true`; `.db-record-icon.is-compact` is 18px. No board scenario contributes a `db-record-icon` to the constructed touch-target pass |
      | R4 | Phone columns **254.7pt** at a **278pt** pitch, **23.3pt** gap, **0.7pt** hairline border, **transparent** card fill (§2b) | The phone takes the desktop **246 / 270 / 24** and the desktop's filled card. No phone-specific column geometry exists in the stylesheet | `grep is-touch styles.css` inside the kanban block matches only the controls' visibility split and the `+ New` row; no width, gap or border rule |
      | R5 | The phone anatomy: permanent count, permanent `···`, labelled `+ New` (§2b, §5 C1) | Built and correct in code, but **never photographed**: `isTouchDevice()` is false in the capture harness, so every `-mobile-` board capture shows the desktop resting state at a narrow width | `board-view-mobile-light.png` shows the chip alone with no count and no `···` |
      | R6 | E1's replacement is Anytype's own card-chip treatment — **tint fill plus darkened text** — because the *unfilled* light-theme chip is what was declined (`decision-record.md` ADR-004 E1) | The header chip stayed **unfilled** (`background: transparent`) and only the text was darkened. The result clears 4.5:1 (amber `#915608` on white = 5.93:1) but it is not the replacement the ADR names. **Operator ruling, 2026-09-06: "Anytype tint fill" — reaffirms E1 as written; fill the chip with the option's own tint, keep the darkened text, and measure contrast per colour rather than assuming the amber sample covers all seven hues (`decision-record.md` ADR-006)** | `styles.css` `.db-kanban-col-chip` |
      | R7 | The grey option pair is neutral — tint `#E3E3E3`, text `#888888` light / `#A8A8A8` dark (§3 A9) | The derived pair is a **red-tinted grey**: `#7E5D5D` light, `#BAABAB` dark, hue 0 against the reference's neutral. It clears 4.5:1 (5.82:1 on white) but it is a different hue, and it is also the ungrouped column's own colour. **Operator ruling, 2026-09-06: "Neutral, match Anytype" — adopt `#E3E3E3` tint / `#888888` light / `#A8A8A8` dark directly, no accessibility ground needed since neither shipped value was declined on contrast (`decision-record.md` ADR-007)** | `styles.css` `.db-kanban-view .status-color-gray`; visible as a warm chip on `constructed-board-empty-column-desktop-light.png` |
      | R8 | The checkbox is a **circle** glyph (§3 A4) | A rounded square, at the correct 14px | `.db-kanban-card-meta .db-checkbox-field`; `constructed-board-empty-column-desktop-light.png` |
      | R9 | — | The shared empty-group card's **title overflows** the 246px column and clips mid-word. It fit the retired 280px column | `constructed-board-empty-column-desktop-light.png`, card fill runs CSS x 33.0..278.0 with the title cut at the edge |
      | R10 | — | **No check locks any of these values.** Reverting the card radius from 8px to 2px, recapturing and restoring moved 8,640 channel bytes at the card corners, and `pixelHash` was identical either way (`bc72a8696d0e`) because the hash is a coarse 16 x 16 bucketed grid. `screenshots:verify` goes red on the stylesheet's own hash, which any edit moves. No test, lane or census asserts a board geometry value | Negative control run on the rebased tree |

      **R1, R2, R6, R7 and R9 are the ones a device read will notice.** R1 and R2 have the same
      one-line cause and the same one-line fix, and both would move all 32 board captures.

      **Landed 2026-09-06, by a leg that read the residuals rather than wrote them.** R6 and R7 are
      untouched, as instructed — both are the operator's. Every other row fixed and re-measured at
      DPR 2 on the rebased tree:

      | # | Fix | Red (device px, DPR 2) | Green (device px, DPR 2) |
      |---|---|---|---|
      | R1 | `.db-kanban-col-chip` gets `box-sizing: border-box` so the 1px border sits inside the declared height instead of adding to it | 52px painted (26 CSS × 2) | **48px painted (24 CSS × 2)** — confirmed both by `render-assertions`' board geometry pass reading `getBoundingClientRect().height` inside the mount hook and by the recaptured `constructed-board-*` PNGs |
      | R2 | `.db-kanban-card-meta .db-board-card-field` sets `padding: 0`, overriding the shared field's own 2px | 47–63px across row types (23.5–31.5 CSS × 2) | **50px uniform (25 CSS × 2)** — the board geometry pass read all 17 property rows on the first constructed card and found one value, 25px, repeated 17 times; the capture agrees, at a flat 50 device px between identical band types |
      | R3 | `renderRecordIcon` gains a `force` parameter; the kanban title row passes it so the slot renders regardless of `showRecordIcon`, and `.db-kanban-card-title-row .db-record-icon.is-compact` is resized to 16px (was the shared 18px) | slot absent by default; 36px (18 × 2) when present | **32px (16 × 2) when present, on every card** — verified by a new hierarchy test asserting `renderRecordIcon` is called with `force: true`; the fixture bag used by the screenshot harness does not wire an icon renderer (a declared stand-in gap, not a plugin defect), so the size fix is confirmed by the stylesheet rule and the unit test rather than by a capture |
      | R4 | `.is-phone .note-database-container .db-kanban-col`/`.db-kanban-board`/`.db-kanban-card` set the phone's own width/gap/border-width | desktop values (246/24px) on phone | **254.7pt column, 23.3pt gap confirmed via `getComputedStyle` under a real `is-phone` mount (colWidth 254.688px, boardGap 23.3px)**. **Confirmed off the capture at DPR 2 by the landing leg: the first card spans device x 64..573 (510px = 255 CSS px) and the gutter to the second runs 574..619 (46px = 23 CSS px)** — both inside half a CSS pixel of the declared values, and the desktop capture measures 246 on the same read, so the `.is-phone` rules are demonstrably the ones applying. The 0.7pt hairline is declared and computed but **does not paint thinner and the claim that it does is refuted**: the phone card's border reads two solid device pixels at `(45,45,45)` with no antialiased edge, byte-identical to the desktop card's 1px border on the same read. Chromium rounds a sub-1px `border-width` to a whole device pixel in `getComputedStyle` AND in paint, so the value is set, the rule matches, and nothing on screen distinguishes it from 1px |
      | R5 | `constructed-scenarios.mjs`'s board mount forces `matchMedia("(pointer: coarse)")` to `true` directly, rather than trusting Playwright's per-context `hasTouch` flag — the same reliability gap `touch-targets.mjs` already documented and worked around at the browser-engine level | `constructed-board-mobile-*.png` showed the desktop resting state | **the phone capture shows the permanent count and the permanent `···`/`+` — confirmed visually on `constructed-board-card-properties-hidden-mobile-dark.png`, which shows "4" beside "backlog" with no hover needed** |
      | R8 | `.db-kanban-card-meta input.db-checkbox.db-checkbox-field` sets `border-radius: 50%` at the base rule's own specificity, and repeats `flex: 0 0 14px` — the base rule's own flex-basis otherwise wins the checkbox's main-axis size over a bare `width` | rounded square, 28px (14 × 2) | **circle, 28px (14 × 2)** — the board geometry pass reads `borderRadius: 50%` directly, and every recaptured board PNG shows a round glyph |
      | R9 | `.db-kanban-empty-slot` gets `box-sizing: border-box` (the shared empty-card sized its content box to 100% and added padding/border on top, overflowing the column) plus `overflow-wrap: anywhere` on the title and message | title clipped mid-word at the column's right edge | **"No records in this group" wraps onto two lines and stays inside the card — confirmed on the recaptured `board-empty-column-desktop-dark.png` and `constructed-board-empty-column-*.png`** |
      | R10 | The six pins live in `tools/live/render-assertions.mjs` as its own **board geometry** pass — no new lane. It mounts the same board scenario on its own page at `deviceScaleFactor: 2` with the token sheets attached, exactly the way that lane's row-rhythm pass already measures computed geometry, and reads card radius, column width, column gap, painted chip height, property row pitch and checkbox shape | no check locked any of these values | **7 PASS rows inside `render-assertions`**, and the gate stays at **26 lanes**. Negative control: reverting the card radius to 2px turns the whole lane red at exit 1 with `board geometry card radius: .db-kanban-card read "2px", expected "8px"`, then reverted. The first landing added a 27th lane, `tools/live/board-geometry.mjs`; that was against the brief's existing-lanes-only constraint and the file is deleted — see `decision-record.md` ADR-005 for why an existing lane could host it |

      **Re-verified 2026-09-06 by the landing leg, on the rebased tree, and three of the leg's own
      claims were corrected rather than repeated.** Rebased onto `origin/main` `6c718f63` (61 commits,
      `055`, `053`, `054`, `057` and `051` landed in between); the only code conflict was one import
      line in `tools/screenshots/scenarios/chrome.mjs`, where upstream's added `tableHeader` and this
      lane's dropped `boardSubgroupHeader` were merged rather than either side taken whole. Every
      generated artefact — `main.js`, `screenshots/manifest.json`, `tools/lane/css-lane.json` and the
      nine `tools/live/*.json` — took `origin/main`'s side and was re-derived from the merged tree,
      so no upstream lane history or evidence stamp was overwritten.

      Read back at DPR 2 on the recaptured PNGs rather than accepted from the report. Chip: ink band
      device y 68..115 on `constructed-board-desktop-dark.png` = **48px, 24 CSS px**, against 66..117 =
      **52px, 26 CSS** on the same file at the pre-fix commit. Pitch: the repeating property block's
      identical band types sit **350 device px apart over seven rows across three repeats** — a flat
      **50px, 25 CSS**, with no drift — against **406 over the same seven rows, 58px / 29 CSS**, before;
      the leg's "~28.3px average" is close but was itself uniform at 29, not scattered. Checkbox: a
      **28x28 device-px** glyph whose scanline profile tapers symmetrically at both ends — a circle at
      14 CSS px. Phone: card 1 spans **510 device px** and the gutter **46**, i.e. 255 and 23 CSS px.

      Verified from the final tree: `npx tsc --noEmit` exit 0; `npx vitest run` **137 files / 1426
      tests** exit 0; `npm run build` exit 0; `node tools/screenshots/verify.mjs` **550 entries
      current**, exit 0; `node tools/lane/check-lane.mjs` exit 0; the isolated
      `SURFACE_PHASE=056-board-anytype-parity npm run gate </dev/null`, `$?` read from a file:
      **0, 26 green** — the count the brief asked for, not 27. `npm run screenshots` (full run, needed
      so the manifest drops the four retired scenarios): **550 entries**, **44 moved pixelHash against
      `origin/main`** and every one of the 44 is a board capture; 2 moved bytes only and were restored
      to committed bytes with their manifest `bytes` reconciled. Every `screenshots/project-manager/*`
      capture stayed pixelHash-identical. Six were opened and read: `constructed-board-desktop-dark`,
      `-desktop-light`, `-mobile-dark`, `constructed-board-empty-column-desktop-dark`,
      `-mobile-light`, and `constructed-card-covers-desktop-dark`.

      **R3 carries an evidence gap that the leg's own row understated and this one states plainly.**
      No capture in this repository can show the title icon slot: every harness that mounts the board
      wires `renderRecordIcon: () => null` (`tools/live/render-assertion-harness.ts`,
      `tools/mock-data/capture.mjs`, `tools/storybook/verify-placement.mjs`), so the slot is absent
      from all 44 board PNGs by construction. What IS confirmed: the renderer asks with `force`
      (hierarchy test), the host honours it past its own `showRecordIcon` gate and renders read-only
      (`database-view.ts`), the fallback glyph is `file-text` — a page icon, which is what the Anytype
      kanban card shows on a record with no icon of its own, read directly off
      `anytype-project-tracker-kanban-dark.png` — and the slot computes to 16px. What is NOT confirmed
      is that any of it paints, and no gate can confirm it until a board scenario wires a real icon
      renderer. Named here rather than left implied by a green row.

      **R6 and R7 are the operator's, and the operator has since ruled on both.** Verbatim, 2026-09-06
      ~05:25: R6 — *"Anytype tint fill"*; R7 — *"Neutral, match Anytype"*. Recorded in
      `decision-record.md` ADR-006 and ADR-007 and in the parent `roadmap.md` §6A.

      **Landed 2026-09-06 by the follow-up leg.** Both fixed and re-measured in the same
      stylesheet edit, the CSS lane released once for both:

      | # | Fix | Red | Green |
      |---|---|---|---|
      | R6 | `.db-kanban-col-chip` reads `background: var(--db-status-bg, transparent)` instead of a bare `transparent` — the same custom property the card's own tag chip already fills from, so the header stops inventing a third treatment | chip painted with no fill, option colour on bare text only (`background: transparent`) | chip painted with the option's own tint, text unchanged — confirmed on `constructed-board-desktop-dark`/`-light` and `constructed-board-mobile-dark`: every column header reads as a filled pill (grey/blue/purple/olive/red per column) |
      | R7 | `.status-color-gray`/`.status-color-slate` and the ungrouped chip's fallback move off the red-tinted derivation onto a true neutral (equal R/G/B), text darkened past the source's own value because it now sits on the tint rather than the page | `#7E5D5D` light / `#BAABAB` dark, hue 0 against the neutral reference, visible as a warm chip on the empty-column captures | `#656565` on `#E3E3E3` light (4.54:1 tint, 5.83:1 page), `#ADADAD` on `#414141` dark (4.55:1 tint, 7.99:1 page) — confirmed on `constructed-board-empty-column-desktop-{dark,light}`, no warm cast on the ungrouped chip in either theme |

      All ten option-colour tint/text pairs plus the ungrouped fallback were re-measured against
      WCAG 1.4.3 in both themes, text-on-tint and text-on-page, with a throwaway script
      (`scratch/palette-contrast.mjs`, not part of the gate): all twelve rows clear 4.5:1 on both
      measures, from grey's 4.54:1 (the tightest) to purple's 8.38:1 (dark, on page). `npx tsc
      --noEmit`, `npx vitest run` (137 files / 1424 tests) and `npm run build` exit 0;
      `node tools/live/render-assertions.mjs`'s board geometry pass still reads all seven pins
      green, unaffected by a colour-only edit; `node tools/screenshots/verify.mjs` reports 550
      current; the isolated `SURFACE_PHASE=056-board-anytype-parity npm run gate </dev/null`
      reports 26 green, exit 0. `npm run screenshots` (full run): 44 board captures moved
      pixelHash a second time against the same pre-fix baseline the prior release already named,
      0 byte-only re-encodes; every `screenshots/project-manager/*` capture and every non-board
      capture stayed pixelHash-identical. Six captures opened and read against the Anytype
      reference: `constructed-board-desktop-dark`, `-desktop-light`, `-mobile-dark`,
      `constructed-board-empty-column-desktop-dark`, `-desktop-light`, and
      `constructed-card-covers-desktop-dark`.

- [x] T013 **Delete the `boardExtensionsEnabled` branch, or record why it stays.** The flag and the
      `renderSwimlaneBoard` / extensions-mode `renderColumn` / `renderSubgroup` / `renderCard` path
      behind it are still in `src/views/board-renderer.ts`. T007 named this a deferred cleanup and
      it is still open. Confirmed on the landed tree, and stronger than the leg claimed: the flag is
      not only absent from every settings surface, it is **not in the view-config reader's key
      allowlist at all** (`src/data/data-source.ts`), so a vault's `data.json` cannot switch it on
      either — a stored view carrying it parses cleanly and drops it, now locked by a test in
      `src/data/data-source.test.ts` with its own negative control. Deleting the branch touches
      `BoardRendererActions` and its two implementers, **`src/views/database-view.ts`** and
      **`src/views/embedded-database-renderer.ts`**, which is why it was left. (REQ-005)

      **Done 2026-09-06.** The dead branch — `renderSwimlaneBoard`, the extensions-mode
      `renderColumn`/`renderSubgroup`/`renderCard`, and roughly twenty private helpers and fields
      reachable only from them — is removed from `src/views/board-renderer.ts`; `render()`
      unconditionally calls `renderReferenceBoard`. `ViewConfig.boardExtensionsEnabled` stays
      declared in `src/data/types.ts`: `board-card-properties-panel.test.ts` constructs a literal
      `ViewConfig` carrying it, that file is under AC-006's zero-lines-changed guard, and the field
      is otherwise inert now that nothing reads it. `git diff --stat` on that test, on
      `board-card-fields.ts` and on `board-card-properties-panel.ts` all read nothing; both suites
      stay green, 19 of 19. `src/data/data-source.test.ts`'s negative control (the key is dropped
      from a parsed view and from its re-serialized payload) is unchanged and still passes.

      Two harness-only surfaces the removed branch alone reached needed the same disposition as the
      branch itself, not just its config flag: a whole-group selection checkbox (tested via a
      dedicated `group-selection-controls` renderer branch, its own `SCENARIOS` entry and its own
      `chrome-group-selection-controls` fixture) and a stored-card-field-list demonstration that
      only worked through the extensions card. Removed rather than left pointing at deleted markup:
      the harness branch, the `SCENARIOS`/`STATE_SCENARIOS` entries, the `chrome.mjs` fixture, the
      `manifest-schema.mjs` allowlist entry and the hardcoded id lists in
      `constructed-capture.test.mjs`. `checkbox-family-coverage.test.ts` (which scans every fixture's
      checkbox classes against the real `createCheckbox` call sites) confirmed the retirement was
      complete — it failed first, naming the two fixtures whose classes no longer matched any call
      site, then passed once they were gone. `verify-placement.mjs`'s own select-column check, which
      borrowed the same retired fixture for an unrelated role-mate comparison, was repointed to a
      bare instance of the shared row-checkbox factory built inline rather than through a registered
      scenario.

      Also fixed, found while re-reading `accessibility-defects.test.ts`,
      `column-header-menu-affordance.test.ts` and `shared.test.mjs`'s subtask parity check against
      the same deletion: each asserted a literal source string or CSS class the extensions branch
      alone produced (selection-checkbox aria-labels, the two extensions-path
      `renderBoardGroupOptions` call sites, `db-subtask-toggle`/`db-subtask-progress-*`/
      `db-subtask-add-input`). Rewritten to check what the kanban path actually does instead of what
      the retired branch used to. One small accessibility restoration alongside: the kanban card
      gained `role: "row"` back, matching what the retired card already had and what
      `accessibility-defects.test.ts` Item 10 checks for.

      **The retirement was NOT complete, and the landing leg found the rest of it red.** The claim
      that the two surfaces are unreferenced holds for the capture pipeline and the manifest; it did
      not hold for `tools/live/constructed-state-assertions.mjs`, which is not one of the gate's 26
      lanes and so went unnoticed. Run on the landed tree it exited **1 with five failures**: its
      `constructed-group-selection-controls` and `constructed-board-extensions` entries mount a
      renderer value and a spec option that no longer exist, and its `constructed-board-subtask`
      paired case asserted `subtaskToggle`/`subtaskProgress`/`subtaskDepthChild` — markers the removed
      extensions card was the only thing that drew. Fixed here: the two entries and their markers are
      gone, and the board's subtask pair now asserts the kanban card's own child indicator,
      `.db-kanban-card-type`, which the off side proves absent and the on side present. The tool now
      exits **0**. `"boardExtensions"` was also still in `constructed-scenarios.mjs`'s `SPEC_OPTIONS`
      allowlist and is dropped.

      **Sixteen tracked PNGs of the two retired surfaces were still on disk**, orphaned: the manifest
      no longer lists them (a full `npm run screenshots` regenerates it at 550 entries, four scenario
      ids fewer) and `verify.mjs` has no orphan check, so nothing would ever have reported them.
      Deleted with `git rm`.

      **Three residuals were named rather than fixed here; two are closed by the follow-up leg, one
      stays by the same reason it was named.** (1) `ViewConfig`'s `boardExtensionsEnabled?: boolean`
      and its doc comment still describe a layout that no longer exists — removing it would force an
      edit to `board-card-properties-panel.test.ts`, which AC-006 pins at **0 lines changed**, so it
      stays and the criterion keeps its evidence. This one is not fixed and is not owed: the field is
      inert (nothing reads it), and undoing the pin would cost the exact evidence AC-006 exists to
      keep. (2) The kanban card's restored `role="row"` had no `role="grid"` or `rowgroup` ancestor:
      the removed branch put `role: "grid"` on `.db-board`, and `.db-kanban-board` carried no role, so
      the pairing ARIA needs was broken. **Fixed by the follow-up leg**: `.db-kanban-board` gains
      `attr: { role: "grid" }` at construction, and a new test walks the built DOM from the card
      upward looking for a `role="grid"` ancestor — checking the ancestry the browser and assistive
      tech actually see, not a literal source grep, which is what let this residual go unnoticed the
      first time. (3) `database-view.ts`'s selection-sync loops still queried `.db-board-card-checkbox`
      and `.db-board-column-checkbox`, no-ops on markup nothing builds. **Fixed by the follow-up leg**:
      both dead loops are removed; the identically dead `.db-gallery-*`/`.db-list-*` selectors two
      earlier retirements left are untouched, since they are that cleanup's job and not this one's.

      **The CSS audit the same leg carried out, beyond the two R6/R7 colour rows.** The `db-board-*`
      stylesheet family — the outstanding CSS-lane debt already named as *"largely dead and
      deliberately not cut"* — was cut to a per-rule audit rather than a section delete: kept every
      rule the kanban card still builds (`db-board-card-field`, `-field-label`, `-field-wrap`
      (built dynamically by `card-field-renderer.ts` when a field opts into wrap), `-value`,
      `-badges`, `-link`, `-cover` and its two children, `-open` (shared with the record detail
      panel's open button), `-column-options`), and deleted the rest — the whole `.db-board-column`/
      `-header`/`-cards`/`-card` family the retired extensions branch alone built, its drag/drop
      states, its resize handle, and the three empty rule husks (two `@media (hover: …)` blocks, one
      `@media (prefers-reduced-motion: reduce)` block) the cut left behind. `--db-board-column-width`
      had exactly one reader, `.db-board-column`'s own `flex-basis` fallback; deleting that rule with
      the rest of the family removes the unassigned custom property along with its only reader, rather
      than assigning it a value nothing then uses. Verified: `grep -oP '\.db-board-[a-z-]+'
      styles.css | sort -u` returns 11 selectors, each cross-checked against a live construction site
      in `src/views/board-renderer.ts`, `record-detail-panel.ts` or `record-surface/record-header.ts`;
      zero orphaned selectors remain.

      Verified from the final tree, after the rebase onto `2c3c499a`: `npx tsc --noEmit` exit 0;
      `npx vitest run` **139 files / 1458 tests**, exit 0 (main is 1460 — this leg deletes three
      stylesheet pins whose rules it removed and adds the grid-ancestry test, net −2); `npm run
      build` exit 0; `node tools/live/render-assertions.mjs` exit 0 with the board geometry pass
      **7/7** — card radius 8px, column 246px, gap 24px, checkbox 14px and a 50% radius, **chip
      height 24px painted**, and a **flat 25px** property pitch across seventeen rows;
      `node tools/screenshots/verify.mjs` exit 0, **568 current**; `node tools/lane/check-lane.mjs`
      exit 0 with the lane held by this phase at `cdc3ea497d56`; the isolated
      `SURFACE_PHASE=056-board-anytype-parity npm run gate </dev/null` exit **0, 26 green**.
      `cascade-audit`'s ratchets all fell: rules 3076 → 2977, duplicated selectors 256 → 251,
      conflicts 131 → 130, stylesheet lines 23563 → 22737; `token-census` is level.

      **Two corrections to the leg's own report, made at the landing.** The tightest contrast row is
      **light teal `#1B7471` on `#CFEEED` at 4.52:1**, not grey at 4.54:1 — grey is second. And the
      automated stylesheet cut had blanked three comment lines to trailing whitespace and lost the
      indentation of two selector blocks inside their media queries; both are restored, and the
      three whitespace-only lines are gone (main carries none).

- [x] T014 (2026-09-06 amendment) **Make the page scroll, not the column, and hide desktop
      scrollbar chrome.** Operator ruling, ~10:30 desktop (ADR-008). **Red first, from the landed
      stylesheet**: `.db-kanban-cards` has `overflow-y: auto` (`styles.css:9569-9573`) so each
      column scrolls itself; `.db-kanban-view` has `overflow: hidden; height: 100%`
      (`:9447-9451`) so the page cannot; `.db-kanban-board::-webkit-scrollbar` paints a 10px bar
      (`:9472-9474`) with an 8px reserved lane. Green: 0 vertically scrolling elements inside the
      board, the page scrolling in their place on phone and desktop, and 0 px of scrollbar chrome
      painted on desktop at rest, with the sticky horizontal bar invisible-until-hover. A negative
      control that goes red when `overflow-y: auto` is put back
      **Done 2026-09-06, on the second take. The first take did not deliver the ruling and is
      recorded here rather than overwritten.** The first take dropped `overflow: hidden` from
      `.db-kanban-view` and `flex: 1; min-height: 0` from `.db-kanban-board` and
      `.db-kanban-cards`, and pinned `.db-kanban-col-header` with `position: sticky`. Measured in
      a real pane — a container with a definite height, which is what the host and the capture
      harness (`tools/screenshots/theme.css`, `#shot > .note-database-container { height: 100% }`)
      both give it — **nothing scrolled at all**. `.db-kanban-board` was still a flex item with
      the default `flex-shrink: 1`, so it shrank back to the container's height, and its own
      `overflow-y: hidden` clipped the rest: at 1440x900 the board measured `scrollHeight 7750 /
      clientHeight 900`, the container measured `scrollHeight 908 / clientHeight 908`, a real
      wheel of 600px moved `scrollTop` 0, and the last card of a 35-card column was unreachable.
      The check that certified it read `getComputedStyle(container).overflowY === "auto"` on a
      page whose body had no height, so the keyword was true and the behaviour was not.

      **Second take.** Both scroll axes belong to the container. `.db-kanban-board` drops its own
      `overflow-x`/`overflow-y` and takes `flex-shrink: 0`, so it is as tall and as wide as its
      columns and rides the page. Both axes, not just the vertical: the reference paints its
      horizontal bar at the bottom of the viewport over the cards
      (`anytype-project-tracker-kanban-dark.png`, bar at y 1199..1208 of 1217), which only a
      pane-height scroller can do — a board-height scroller puts that bar thousands of pixels
      below the fold. `.db-kanban-board` keeps `align-items: flex-start`, so one column's card
      count does not stretch its neighbours, matching the reference's own uneven column heights.
      `.db-kanban-col-header` is **not** pinned: see the ADR-008 amendment for why the first
      take's inference was withdrawn.

      **Measured green**, 1440x900 and 390x844 at DPR 2, against a board with one 35-card column:
      no element inside a column (nor the board itself) computes `overflow-y` other than
      `visible`; the container measures `scrollHeight 7758 / clientHeight 908`; a real trusted
      wheel of 600px moves the container 600px and the board and column 0; `PageDown` moves it
      868px; scrolling to the end reaches `scrollTop 6857 = scrollHeight - clientHeight` with the
      last card fully inside the container box. The 10-per-group page limit and its
      "Show 10 more" control still render on all five columns. Horizontal: at 390px the container
      reports `scrollWidth 1383 / clientWidth 382`, a trusted horizontal wheel moves `scrollLeft`
      300, and scrolling to the end leaves the last column's right edge exactly at the container's
      right edge — the board's negative margins cut nothing off. Drag under scroll, measured
      rather than assumed: with the container scrolled 400px, a real `dragstart` on a card in
      `backlog` followed by `dragover`+`drop` on `doing`'s cards container tints the right column
      and calls `moveCardAndOrder` with `groupKey "doing"`, `fromGroup "backlog"`; a same-column
      drag at the same offset lands the card immediately before the card it was aimed at. Both
      hold because the drop handler is bound per column in `attachReferenceDropHandlers` and
      `getReferenceDragAfterElement` reads `event.clientY` against `getBoundingClientRect()`, so
      the scroll offset cancels.
- [x] T015 (2026-09-06 amendment) **Left-align card text values and ellipsise a single token.**
      Same report. **Red first**: a card text value renders right-aligned
      (*"Procurement asked for a security questionnaire."*) and a URL breaks mid-word
      (*"northwin d-logistics"*). Green is `text-align: left` on every card text value and a
      single-token value ellipsised at the content edge, read off a recaptured board in both themes
      **Done 2026-09-06.** The shared `.db-board-card-value` rule (styles.css) carries
      `text-align: right; word-break: break-word` — written for the gallery card and inherited by
      the kanban card through the same class. `.db-kanban-card-meta .db-board-card-value` now
      overrides both, scoped to the kanban card only: `text-align: left; word-break: normal;
      overflow-wrap: normal`. The checkbox row's own value keeps the shared right/flex-end rule,
      at higher selector specificity, since it holds a glyph rather than a text value. Multi-word
      text still wraps up to two lines (the shared field's own `-webkit-line-clamp: 2`); a
      single-token value has nowhere to force a break now, so `text-overflow: ellipsis` truncates
      it at the line's edge instead of breaking mid-word. Two new `render-assertions.mjs` pins
      ("value align", "value wrap") read `"right"`/`"break-word"` on the pre-edit tree and
      `"left"`/`"normal"` after. Re-measured on the second take at DPR 2: every card property
      value computes `text-align: left`, and its painted ink starts 1px from the card's own inner
      left inset on every row of the card, at both 1440x900 and 390x844. A single unbreakable
      68-character token stays on one line (ink height 16px, one line box) and is clipped at the
      value box, which itself ends 1px inside the card — it ellipsises rather than breaking.
      Multi-word text still wraps. Eight recaptured board PNGs opened across both themes and both
      devices: every text value reads left-aligned, no mid-word break in any.
- [x] T016 (2026-09-06 amendment) **Re-run the geometry pins after T014.** The scrollbar row in
      `render-assertions.mjs` asserts a bar this ruling hides; re-express it as the ruling's own
      threshold rather than deleting it, so a later reinstatement still has a check
      **Done 2026-09-06, second take.** No pre-existing scrollbar pin was found in
      `render-assertions.mjs`'s `GEOMETRY_PINS` (the six pins T012/ADR-005 folded in were card
      radius, column width, column gap, checkbox size, chip height and row pitch — none of them
      the scrollbar). The pin this row asks to re-express is added new, at the ruling's own
      threshold rather than the declined 10px-at-rest value: the `::-webkit-scrollbar` height is
      read via `getComputedStyle(el, "::-webkit-scrollbar")` (Chromium exposes the pseudo-element
      to this API) on the container, which is the element that scrolls — once at rest (expected
      `"0px"`) and once with `.is-scrolling` applied programmatically (expected `"10px"`, the
      measured reference geometry, declined only at rest).

      Seven pins in total, not six, and the page-scroll one is no longer a keyword read. The
      first take's `pageOverflowY === "auto"` passed on a document whose body had no height and
      so could not have failed for the defect it was meant to catch. It now measures
      **reachability**: the check gives the mounted container a pane's definite height, overfills
      one column by 30 cards, scrolls to the end and asserts both that the scroll moved and that
      the last card came with it. The seventh pin holds `.db-kanban-col-header` at
      `position: static`, so a sticky header cannot be reintroduced as an inference.

      Negative control, run against the first take's own stylesheet: `page scroll` reads
      `"auto" / 0 / false` (*scrolled to 0 of 608/608, last card reachable false*),
      `column scroll` reads `"visible" / "hidden"`, both scrollbar rows read `"8px"`, and
      `header position` reads `"sticky"` — five red. Against the landed tree: `"auto" / 16239 /
      true`, `"visible" / "visible"`, `"0px"`, `"10px"`, `"static"` — all green,
      `render-assertions.mjs` exit 0. The gate stays at 26 lanes — no new lane, folded into the
      existing board-geometry pass per the same constraint ADR-005 already named.
- [x] T017 (2026-09-06 amendment) **Confine the desktop scrollbar reveal to the bar's own edge.**
      Operator ruling ("Edge only", 2026-09-06 ~17:33): the board's scrollbars must reveal only
      while scrolling (`.is-scrolling`, T016's own threshold) or when the pointer sits within a
      ~16px band along the container's right edge (vertical bar) or bottom edge (horizontal bar)
      — never merely because the pointer is somewhere in the pane. **Red first**: a DOM test
      asserting a pointer near the right edge sets `is-edge-hover` failed against T016's own
      `:hover`-keyed rule (`styles.css:9390`), since that rule painted the bar for a pointer
      anywhere over the container — `board-renderer-parity.test.ts`, "desktop scrollbar
      edge-hover reveal", both new cases red (`expected false to be true`; the teardown case
      caught the pre-existing listener removing `"scroll"` instead of `"pointermove"`)
      **Done 2026-09-06.** `styles.css:9390`'s bare `:hover` is replaced with `.is-edge-hover`,
      a class the renderer's own `pointermove` listener toggles on the container — added beside
      the existing `scroll` listener in `renderReferenceBoard`, sharing its `scrollbarRevealTeardown`
      closure and its per-render/`clear()` teardown — computing `rect.right - clientX <= 16` and
      `rect.bottom - clientY <= 16` off `getBoundingClientRect()`, cleared on `pointerleave` and
      on teardown. Touch stays guarded through the existing `:has(.db-kanban-board.is-touch)`
      clause, since the listener only ever attaches in `!this.touchMode`. Green: both new
      `board-renderer-parity.test.ts` cases pass (mid-pane pointer leaves the container unclassed,
      a pointer within the edge band sets `is-edge-hover`, `pointerleave` clears it, and a
      re-render's `removeEventListener` spy fires for both `"pointermove"` and `"pointerleave"`)
      — full suite 141 files / 1503 tests green, `npx tsc --noEmit` and `npm run build` exit 0.
      `tools/live/render-assertions.mjs` gains a third scrollbar row, `.is-edge-hover` applied
      programmatically the way T016 already does for `.is-scrolling`: `"0px"` at rest, `"10px"`
      scrolling, `"10px"` edge-hover — all three PASS against a live Chromium mount. A full
      detached `npm run screenshots` recapture (578 entries) moved no capture's `pixelHash`; 18
      byte-only re-encodes were restored to their committed bytes. `npm run gate`: 26 green, 0 red.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every `acceptance-criteria.md` row is Met, Waived by a named ADR, or Superseded by one
- [ ] The operator's row (AC-010) is the only one that may stay open, and an agent never ticks it
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Thresholds with their failing values**: See `checklist.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Notion refinement, and where it went**: the five-iteration research loop on this board's Notion
  screens is [`research/research.md`](research/research.md); its Notion fact source is
  [`notion-screens-digest.md`](notion-screens-digest.md); and the child packet it opened is
  [`../059-notion-board-refinement/`](../059-notion-board-refinement/goal.md). **Nothing in this
  packet moves because of it** — `../roadmap.md` §7.15 makes the Notion refinement additive, so
  `059` may add a criterion, a task or an ADR and may not un-tick a row here. Two things do arrive
  from it: four errata notes against `notion-screens-digest.md`, and four device-only checks named
  on this packet's AC-010 operator pass. Both are `059` T003 and T004, and neither changes a Met row.
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md — thirteen anatomy elements, nine REQ rows
- [ ] CHK-002 [P0] Technical approach defined in plan.md — five legs, grouped by file
- [ ] CHK-003 [P1] Dependencies identified and available — `050` true-up written, `045` shipped,
      the grammar lane green; T001's image-capable leaf is the one still Red
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npm run lint` and the TypeScript build pass, exit read from `$?`
- [ ] CHK-011 [P0] No console errors on a board render with the `049` mock catalogue loaded
- [ ] CHK-012 [P1] The cover-load failure path still routes through `markCoverImageLoadError`
- [ ] CHK-013 [P1] The renderer keeps its existing construction pattern; this packet changes the
      vocabulary, not the architecture
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row is Met, Waived or Superseded
- [ ] CHK-021 [P0] Manual read of the rebuilt board against the captures, desktop and phone
- [ ] CHK-022 [P1] Edge cases from `spec.md` section 8: empty column, deleted group relation,
      over-length titles, past the page limit
- [ ] CHK-023 [P1] The multi-select cross-column drop still commits one property write, not one
      per card
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep — `rg -n 'pm-kanban|pm-chip|pm-avatar|pm-progress' src/views/ styles.css`
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests — the four board test files, the grammar lane, and the gantt's shared stylesheet
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. **N/A here and recorded as such**: this packet changes presentation only; the one path-adjacent surface, cover-image resolution, is untouched
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed — `plan.md` FIX ADDENDUM lists four axes
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — presentation-only packet, but the check still runs
- [ ] CHK-031 [P0] Input validation implemented — cover images continue to route through
      `isCoverImageBlocked` / `resolveCoverImage`; this packet does not weaken either
- [ ] CHK-032 [P1] Auth/authz working correctly. **N/A**: an Obsidian plugin reading a local vault
      has no auth surface. Recorded rather than ticked
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments carry the durable why, not the packet number
      (parent CLAUDE.md comment-hygiene hard block)
- [ ] CHK-042 [P2] `screenshots/anytype/README.md` updated if T001 finds a capture gap worth naming
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 13 | 0/13 |
| P2 Items | 6 | 0/6 |

**Verification Date**: not yet verified — the packet was authored 2026-09-05 and no task has run.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — `spec.md` section 4's per-element migration table is it
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01: board render over the `049` 326-record catalogue within 10% of the
      pre-leg baseline, same machine, same session
- [ ] CHK-111 [P1] Scroll remains smooth with the sticky scrollbar attached, measured rather than felt
- [ ] CHK-112 [P2] Load testing beyond the 326-record catalogue. Deferred: the catalogue is the
      program's declared test environment (`049`)
- [ ] CHK-113 [P2] Benchmarks recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested — `plan.md` section 7 and L2
- [ ] CHK-121 [P0] Feature flag configured. **Inverted here**: goal D6 requires the opposite —
      **zero** board affordances shipping default-off. The check is that the flag count is 0
- [ ] CHK-122 [P1] Monitoring: the gate's 25 lanes and the grammar lane are the monitoring
- [ ] CHK-123 [P1] Runbook: `plan.md` L2 Enhanced Rollback
- [ ] CHK-124 [P2] Release cadence row added to `../roadmap.md` section 5.3 when this ships
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Accessibility review: every declined parity value names WCAG 1.4.11, WCAG 1.4.3
      or the 44px touch floor, with its measured ratio or size (goal D3)
- [ ] CHK-131 [P1] Dependency licenses compatible. **N/A**: no dependency is added
- [ ] CHK-132 [P2] OWASP Top 10. **N/A**: no network or auth surface
- [ ] CHK-133 [P2] Data handling: the board writes an existing group property and nothing else
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation. **N/A**: no public API changes
- [ ] CHK-142 [P2] User-facing documentation updated if the board's affordances move visibly
- [ ] CHK-143 [P2] `design-trueup.md` is the knowledge transfer; a later session reads it rather
      than re-running the sweep
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Ruling and device confirmation | [ ] Open — the operator's own side-by-side against Anytype on iOS and desktop | |
| Fresh reviewer | In-repo verification | [ ] Open — never self-certified (parent D4) | |
<!-- /ANCHOR:sign-off -->

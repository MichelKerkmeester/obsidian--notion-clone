**Phase 002 — Properties panel**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs fifth**, after `001` solves placement. Takes the `styles.css` lane at Phase 3, releases it at Phase 5.

**THE DEFECT.** The operator calls this the worst surface in the plugin. Property names are right-aligned and clipped past the panel edge, a trash icon sits on its own row per property, and the panel runs the full screen height.

**BUILD.** One row template with **named grid areas**, not a positional track list. Positional tracks are exactly what let two rules disagree about which child is which.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**NO DESKTOP NUMBER BEFORE `000` FIXES THE DESKTOP PAGE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only. Your desktop defect *is* a cascade defect — 8 children into 7 tracks happens only because one selector hides the arrows and a later identical one shows them — so **on a stylesheet-less page it cannot appear at all** and the harness would report a clean row. B1, B2 and B6 are desktop reads. A number recorded before that repair is discarded, not re-used.

**LANE.** Take at Phase 3, release at Phase 5, and only after all four in order: (1) full recapture at both viewports and 3, 12 and 40 properties, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image, so it can never be this step; (3) **`008`'s early replay re-asserting `000`, `004`, `005` and `001`** against the tree you released, because they closed against a snapshot you just edited; (4) cascade re-confirmation — record the computed winner of **both** collapsed duplicate pairs before and after. This packet exists because two such pairs were never reconciled; do not leave a third behind.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked without
evidence in this folder or in a lane.*

- [ ] Every laid-out child resolves to grid row 1; row height ≤ 36px both viewports. **Today: 8 into
      7, 52px.** **Half.** `replay` carries *the properties row stays on one line*: was 2, recorded
      **1**, now 1 — a recorded value that is not zero, so one child still wraps by the packet's own
      accounting. The height clause is the audit's named exposure: it is decided by the tallest
      child, and the tallest children take `height: var(--input-height)` from `app.css`, which the
      harness does not load, so the row measures shorter here than on any phone.
- [x] Declared track count equals laid-out child count at every breakpoint and condition. **Today
      desktop 7 vs 8, phone 8 vs 7.** **Sound by the audit's own reading** — the track lists and the
      `grid-column` claims are written in `styles.css`, so no host rule can move them.
- [x] Name element computed content width ≥ 120px desktop / ≥ 96px phone, right edge inside the panel
      content box. **Today the phone name track is 22px.** **Met, and held under replay** — *the
      property name takes the flexible track, not the type icon*, was 0, recorded 1, now 1. The
      floors are `minmax(120px, 1fr)` and `minmax(96px, 1fr)` in the stylesheet.
      **The recorded 22px is optimistic and the packet says so:** the three `auto` action tracks are
      host-padded wider on a device, so the name is squeezed harder there, not less.
- [ ] Panel height ≤ min(560px, 70% of visible bounds) at 40 properties. **Today the inline maxHeight
      takes the full bounds.** **The clamp is in the stylesheet and no check asserts it at 40 rows.**
- [ ] Delete is not a bare one-click target in the row's primary line. **No check.** This is
      information architecture rather than layout, and the packet's own summary records that half
      as not started.
- [ ] Plus the five stateful dimensions. **No mapping exists** for this packet.
- [ ] The operator opens Properties on a phone and can read every property name. **Only the operator
      closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 10 sound / 2 dependent / 0 unknown.** The panel came through well,
because its layout is **written down**: the track lists, the `grid-column` claims and the
`minmax(120px, 1fr)` / `minmax(96px, 1fr)` name floors are all in `styles.css`, so no host rule can
move them. Track counts, grid areas, the name-width floor and the panel-height clamp are sound. **The
exposure is height.** *"row height <= 36px both viewports"* is decided by the tallest child, and the
tallest children are `.clickable-icon` buttons taking `height: var(--input-height)` from `app.css`,
which the harness does not load — the row measures shorter here than on any phone. The recorded 22px
name track is likewise optimistic: the three `auto` action tracks are host-padded wider on a device,
so the name is squeezed harder, not less. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**LINE NUMBERS ARE HINTS, NOT ADDRESSES — AND HERE IT BITES HARDEST.** Every `styles.css:NNNN` below was correct on 2026-08-29; `000` then deletes dead blocks and `001` edits the file before you start. Your whole desktop argument is *which of two identical selectors comes later*, and the phone argument is the same shape. A stale number silently inverts that reading. Re-resolve both pairs with `rg -n 'db-mobile-reorder-controls' styles.css` and `rg -n '\.is-phone \.note-database-container \.db-column-manager-row' styles.css`, and **read the hits in order**. Record moved numbers old to new.

**ROOT-CAUSED, DESKTOP.** `styles.css:2036` hides `.db-mobile-reorder-controls`; `styles.css:18776` — same selector, later — sets `display: inline-flex`. Mobile-only arrows therefore render on desktop, giving the row **8 children against 7 declared grid tracks**. Measured: **row height 52px against a declared `min-height: 30px`**, trash button wrapped onto an implicit second row.

**ROOT-CAUSED, PHONE — AND IT IS NOT A COUNT MISMATCH.** Both phone rules (`16879`, `16995`) declare 8 tracks. `.db-column-drag` is `display: none` on phone (`16966-16976`), so **7 emitted children land in 8 declared tracks, shifting every child one position left** of what either rule intended. The rules' real conflict is track **order**, not count. That distinction changes the fix.

**ONE MEASUREMENT AND ONE INFERENCE DISAGREE — RESOLVE IT, DO NOT PICK.** The measured figure is a 96px track for the checkbox and **22px for the property name**. A static trace of the winning rule puts `minmax(96px, 1fr)` on the third laid-out child, which with the drag handle hidden is the **type icon**, not the checkbox. Confirming the ordinal mapping is a census deliverable. That diff **is** the bug.

**A THIRD REGIME NOBODY LISTED.** `actions.isReadOnly` suppresses the edit and delete buttons, so the row emits **8 children read-write and 6 read-only** — on top of the desktop/phone split.

**INVENTORY.** Enumerate every emitted child of `.db-column-manager-row` under each condition — read-only, required, file field, computed, phone, desktop — and diff **emitted count against laid-out count** per breakpoint. Count them separately; that gap is the defect.

**AC-007 WAS REWRITTEN.** It used to close on the information-architecture decision being *written down*. A document is not an outcome — you could argue for reading over editing, write it up, and still clip the name. It now closes on the primary line measured at 402px and 1440px: **0 controls past the panel content box, 0 needing horizontal scroll, the name at its width floor, and anything behind an overflow reachable in one interaction.** Write the decision, then prove it.

**SIX CRITERIA HAVE NO FAILING NUMBER YET.** AC-007 to AC-012 are `Blocked`, not `Unmet`: the doctrine makes a criterion invalid until it has failed on the current tree with the number written down, and these cells are empty. `acceptance-criteria.md` names, for each, exactly what produces the number and at which phase. **Do not invent one.** In particular, Phase 2 may not choose a primary line before Phase 1 has measured today's.

**SCREENSHOTS.** Both viewports at 3, 12 and 40 properties.
<!-- /ANCHOR:log -->

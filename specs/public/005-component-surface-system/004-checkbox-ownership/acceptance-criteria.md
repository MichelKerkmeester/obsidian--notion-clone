---
title: "Acceptance Criteria: Checkbox Ownership"
description: "The criteria this packet must satisfy before it may be closed, each carrying its exact measurement, its threshold, the failing value measured on the current tree, and the negative control that proves the check can fail."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "004 checkbox ownership criteria"
  - "proof tuple"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/004-checkbox-ownership"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "harness-dependence-audit"
    recent_action: "Classified 18 criteria for harness dependence; 16 read appearance with no app.css"
    next_safe_action: "Load Obsidian app.css into checkbox-appearance.mjs before recording a number"
    blockers:
      - "000-surface-contract-and-truthful-harness honest harness must land first"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-004"
      parent_session_id: null
    completion_pct: 25
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Checkbox Ownership

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.
>
> Each is measured on the real renderer at the production mount point, computed rather than declared,
> and each currently fails. **A criterion is not accepted until its failing number is recorded here
> from the current tree.** Class names and call counts are banned: "twelve checkbox classes exist"
> was true before this work started and the checkboxes were still round.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 004-checkbox-ownership
**Level:** 2
**Status:** Draft
**Date:** 2026-08-29
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

### The nine dimensions

The four original conditions are necessary and not sufficient. The aliasing risk here is not the
stale rectangle — it is the **borrowed ancestor**. Five checkbox creation sites are classless and
compute correctly today only because the call site adds a class to their **parent** one or two lines
earlier. Every one of those five passes a measurement taken at the production mount point, fails on
today's tree in the intended direction, and moves when deleted. They are the population that will
break the next time a wrapper moves, and the original four conditions cannot tell them apart from
the families that own their own appearance.

Five dimensions close the hole: semantic identity (which *family* is this, resolved from its
declared role, not from what its ancestor happens to be), transition trace (theme switch, re-render,
mount move), action outcome (the toggle changes the model), resource ownership (nothing about the
checkbox is owned by its parent), negative-control mutation (remove the parent's class and the
appearance must **not** move). The proof tuple is `producer x runtime branch x mount/host x
environment x transition x semantic outcome x negative control`.

### Criteria table

| AC-ID | REQ | Measurement — producer → mount → transition → observation | Threshold | Measured today | NC | Status | Waiver |
|---|---|---|---|---|---|---|---|
| AC-001 (B1) | REQ-001, REQ-002 | For every family the census finds, create the checkbox through its production producer at its production mount point and read computed `appearance` | computed `appearance: none` for every family; 0 families fall back to the platform box | **Measured 2026-08-29 inside the capture fixtures: 23 of 84 checkboxes fall back to the platform box** — 12 `.db-list-row-checkbox`, 8 classless, 3 `.db-group-divider-checkbox`. **And not one of the 61 that do own their appearance is styled by a rule naming its own class — all 61 are reached through an ancestor** (51 through `.db-select-inner`, 10 through `.note-database-container`). Produced by `tools/live/checkbox-appearance.mjs`. **Supersedes an earlier figure of 20/37 taken this same day**, which came from a DOM rebuilt from source and rendered the table's select-all two ancestors short of the four its rule needs | N1 | Unmet | - |
| AC-002 (B2) | REQ-003 | Read computed `border-radius` and box size for every family across board, gallery, list, table, modal and panel; collect the distinct values | radius and box size are identical within a role — the set of distinct values has cardinality 1 | **Measured 2026-08-29 in the fixtures: two shapes among the owned** — 16x16 at radius 4px (51) and 34x18 at radius 9999px (10, toggle switches, a different role). Within the checkbox role the fixtures are consistent at 16x16, so **the divergence this criterion was written for does not appear here**. It is visible in the stylesheet, where the four rules declaring `appearance: none` specify 16px, 16px, 18px and 20px — the fixtures simply do not exercise the 18 and 20 paths. That gap is a fixture-coverage finding, not a pass | N5 | Unmet | - |
| AC-003 (B3) | REQ-002 | Create the same family at three mount points — inside a board card, inside a modal, and on `document.body` — and compare computed appearance | appearance identical at all three mount points | **Measured 2026-08-29 by stripping each ancestor in turn on the rendered tree: 61 of 61 owned checkboxes lose their appearance when one named ancestor's class is removed** — `.db-select-inner` for 51, `.note-database-container` for 10. Zero survive on their own class. Ancestry deciding appearance is no longer read off selectors; it is the two-sided control, run | N4 | Unmet | - |
| AC-004 (B4) | REQ-004 | For every family, set checked, indeterminate, disabled and focus in turn; read a measurable property that must differ per state | each of the four states produces a measurable difference for every family | only the ancestor-styled families have state rules at all | N7 | Unmet | - |
| AC-005 (B5) | REQ-002 | Load three third-party themes, at least one that restyles native checkboxes; re-read computed appearance for every family | appearance unchanged under all three themes for every family | untested; a theme that restyles native checkboxes reaches 11 of 12 families today | N8 | Unmet | - |
| AC-006 (B6) | REQ-007 | Under a coarse pointer, read each family's hit rect — the rect that responds to a tap, not the painted box | `>= 28x28` for every family, independently of the visual box the role selects | not asserted anywhere | N9 | Unmet | - |
| AC-007 | REQ-005 | **Rewritten under review finding F8 — "routed, or deleted with zero callers" closes on a deletion and a call count.** Render a list row through its production renderer at the production mount point and read the checkbox's computed `appearance`, `border-radius` and box size; compare them with the table row-select checkbox's, and read the hit rect under a coarse pointer | the list-row checkbox's computed `appearance`, radius and box size are **identical** to the role-mate it is compared against — 0 differing properties — and its hit rect is `>= 28x28` under a coarse pointer | *blank — see the F16 provenance table below.* `src/views/list-renderer.ts:271` applies the class to an input and **zero matching selectors exist in `styles.css`**, so the input falls back to the platform box — but no one has ever measured what it computes | N10 | Unmet | - |
| AC-008 | REQ-006 | **Rewritten under review finding F8 — "zero checkboxes created outside `createCheckbox`" is a call count, which the doctrine bans.** Drive every one of the ten classless creation sites at its production mount point and read computed `appearance`, `border-radius`, box size and the coarse-pointer hit rect | every one of the ten computes `appearance: none` with the plugin's box, and its radius and box size match its declared role's — **0 of 10 falling back to the platform box, 0 role mismatches** — and each presents `>= 28x28` under a coarse pointer. The join and the census rerun are the *inputs* that make the ten exhaustive; the closing evidence is the computed appearance of each | *blank — see the F16 provenance table below.* Five are unstyled (`src/views/column-manager-renderer.ts:150` and `:237`, `src/views/view-config-panel-renderer.ts:2032`, `src/views/chart-toolbar-renderer.ts:985`, `src/views/toolbar-renderer.ts:1280`) and five are parent-styled — the F13 population enumerated in AC-012 — but no computed value has been read for any of the ten | N11 | Unmet | - |
| AC-009 | REQ-001, REQ-003 | **Semantic identity.** Every measured checkbox resolves to the family and role its creation site **declared**, joined runtime-observed node → creation site → declared role. A family is never identified by which ancestor selector reached it | every observed checkbox maps to a declared role; 0 families identified by ancestor selector; observed-family set equals declared-family set | *census* — no checkbox declares a role today, so identity is entirely ancestor-derived. That is the defect, not an artefact of measurement. The join is the Stage-1 deliverable | N12 | Unmet | - |
| AC-010 | REQ-002 | **Transition trace.** `create → observe → switch theme → re-render the view → move the node to a different mount → observe again`. Re-read computed appearance after each transition | appearance byte-identical after every transition, for every family | *trace* — no harness switches theme, re-renders, or re-mounts a checkbox. Every current measurement is a single static read in one container | N13 | Unmet | - |
| AC-011 | REQ-004 | **Action outcome.** Click each family's checkbox and assert the model value changed; click an indeterminate one and assert the documented resolution; click a disabled one and assert nothing changed | every enabled family's click produces its asserted model delta; the disabled family produces a zero delta; 0 outcomes asserted by node presence alone | *trace* — recorded in `../architecture-findings.md` §3: **nothing drives a click, drag or commit** in any current harness | N14 | Unmet | - |
| AC-012 | REQ-006 | **Resource ownership — the five borrowed-ancestor sites, named individually (review finding F13).** For every family assert nothing the checkbox needs is owned by an ancestor: no appearance rule reached through a parent class, no click handler bound to the parent, no label-for coupling a wrapper change would break. **Each of the five sites in AC-012a to AC-012e below is measured on its own row, not as a population.** For each: read computed `appearance`, `border-radius` and box size at the production mount point; then strip the parent's class in the harness and re-read | 0 families with an ancestor-owned appearance rule, handler or label coupling. **Per site, the two-sided control must hold: on today's tree stripping the parent class MUST move a computed value (proving the borrowed dependency is real and the check is connected); after migration stripping it MUST move nothing.** A site where the pre-fix strip moves nothing has been measured wrong, not fixed | *blank — see the F16 provenance table below.* Five sites are ancestor-owned by construction today (`src/views/table-renderer.ts:514`, `:785`; `src/views/cell-renderer.ts:489`; `src/views/card-field-renderer.ts:184`; `src/views/record-detail-panel.ts:339`), each classless with the class applied to the parent one or two lines earlier — but no computed value has been read at any of the five, and no parent-class strip has ever been run | N2, N3 | Unmet | - |
| AC-012a | REQ-006 | **`src/views/table-renderer.ts:514`** — the table select-all header checkbox, classless, styled only because `:513` classes its parent `db-select-inner`. Migrate to `createCheckbox`; strip `db-select-inner` from the fixture wrapper and re-read | pre-fix strip moves `appearance`, radius or box size; post-fix strip moves **nothing**; computed appearance identical to every other family in its role | *blank — see the F16 provenance table below.* Confirmed classless with the parent classed one line earlier; never measured | N2, N3 | Unmet | - |
| AC-012b | REQ-006 | **`src/views/table-renderer.ts:785`** — the per-row select checkbox, classless, styled through the same `db-select-inner` parent (`:783`). Same measurement and same strip | pre-fix strip moves a computed value; post-fix strip moves **nothing**; role parity holds | *blank — see the F16 provenance table below.* | N2, N3 | Unmet | - |
| AC-012c | REQ-006 | **`src/views/cell-renderer.ts:489`** — the boolean cell checkbox, classless, styled because `:487` classes its parent `db-checkbox-cell`. Same measurement; strip `db-checkbox-cell` | pre-fix strip moves a computed value; post-fix strip moves **nothing**; role parity holds | *blank — see the F16 provenance table below.* This is the one family the previous attempt did style, via the **cell** rather than the input — which is why it looked fixed | N2 | Unmet | - |
| AC-012d | REQ-006 | **`src/views/card-field-renderer.ts:184`** — the card boolean field checkbox, classless, styled because `:183` classes its parent `db-checkbox-cell`. Same measurement and same strip | pre-fix strip moves a computed value; post-fix strip moves **nothing**; role parity holds | *blank — see the F16 provenance table below.* | N2 | Unmet | - |
| AC-012e | REQ-006 | **`src/views/record-detail-panel.ts:339`** — the record-detail boolean field checkbox, classless, styled because `:338` classes its parent `db-checkbox-cell`. Same measurement and same strip | pre-fix strip moves a computed value; post-fix strip moves **nothing**; role parity holds | *blank — see the F16 provenance table below.* | N2 | Unmet | - |
| AC-013 | REQ-002 | **Negative-control mutation.** Substitute exactly one tuple coordinate — strip the parent's class, mount on `document.body`, switch theme, skip the re-render, or create through a raw `createEl` instead of `createCheckbox` — and rerun | stripping a parent class and moving the mount must change **nothing**; a raw `createEl` bypass must **fail** the census equality | no such control exists. The previous attempt passed every gate with 11 of 12 families still round | N15 | Unmet | - |

**B1 is the operator's reported defect. B2 is the criterion that fails when a family is missed —
which is how the previous attempt passed while circles remained.** **AC-012 and AC-013 are the pair
that catches the five borrowed-ancestor sites**, which are invisible to B1 through B6 because they
currently look correct.

### The five borrowed-ancestor sites — the protection gap `000` cannot close (review finding F13)

`../architecture-findings.md` §7 records five checkbox creation sites that are **classless** and
compute correctly today only because the call site adds a class to their **parent** one or two lines
earlier. They pass every check on the current tree. They are one wrapper refactor from breaking with
no compiler warning and no failing test.

| # | Creation site | Parent classed at | Borrowed class |
|---|---|---|---|
| AC-012a | `src/views/table-renderer.ts:514` | `:513` | `db-select-inner` |
| AC-012b | `src/views/table-renderer.ts:785` | `:783` | `db-select-inner` |
| AC-012c | `src/views/cell-renderer.ts:489` | `:487` | `db-checkbox-cell` |
| AC-012d | `src/views/card-field-renderer.ts:184` | `:183` | `db-checkbox-cell` |
| AC-012e | `src/views/record-detail-panel.ts:339` | `:338` | `db-checkbox-cell` |

Resolve every one with `rg -n 'type: "checkbox"' src/views/` and read the two lines above each hit;
the line numbers are dated hints (review finding F11).

**The gap.** `004` runs second, immediately after `000`, and depends only on `000`'s honest harness —
not on the factory. `000` fixes the harness and the token root and does **not** touch checkboxes, so
between `000` Stage 1 landing and `004` Phase 4 migrating these five, any change to a wrapper in
those five files breaks them silently. `000` is gaining a guard for this window; **this packet's job
is to close the window for good** by removing the dependency, not by protecting it.

**Each of the five is migrated off the borrowed-ancestor pattern individually.** AC-012a to AC-012e
carry one row each, with its own recorded failing value and its own passing value. They are not
satisfied by a population statement — "the five were migrated" is exactly the class-name-shaped claim
`../architecture-findings.md` §9 bans.

**The negative control is two-sided, and both sides are required.**

- *Before migration*, stripping the parent's class in the harness **must move** a computed value on
  that site. If it moves nothing, the check is not connected to the thing it claims to measure and
  the measurement is wrong — not the code. This is the safe negative control that proves the
  borrowed dependency is real, and it must be run and recorded before any of the five is touched.
- *After migration*, stripping the same class **must move nothing**. That is N2 and N3 as already
  written, and it is the only evidence that the appearance stopped being ancestor-owned.

A site that passes the second half without the first half having been recorded is `Blocked`, not
`Met`: it may simply never have depended on the wrapper in the way the finding claims, and nobody
would know.

**Migration order.** Phase 4 migrates these five **first**, not last. They are the sites a
"fix what looks broken" pass skips, because nothing about them looks broken.

### F8 audit — every criterion re-tested for the "passes on today's broken tree" shape

Review finding F8 named `001/AC-008` and `005/AC-006`; the audit below re-reads every row here for
the same four shapes — closing on a **thing existing**, on a **deletion**, on a **classification**,
or on a **count**.

| AC-ID | Shape found | Disposition |
|---|---|---|
| AC-001 | Outcome. Computed `appearance` per family | Kept unchanged |
| AC-002 | Outcome. Set equality over computed radius and box size | Kept unchanged |
| AC-003 | Outcome. Computed appearance compared across three mount points | Kept unchanged |
| AC-004 | Outcome. A measurable per-state difference | Kept unchanged |
| AC-005 | Outcome. Computed appearance under three real themes | Kept unchanged |
| AC-006 | Outcome. A measured hit rect against a threshold | Kept unchanged |
| AC-007 | **Deletion and count.** "Routed through the primitive, or the class deleted with zero callers" | **Rewritten.** Now closes on the list-row checkbox's computed appearance, radius, box size and hit rect matching its role-mate — 0 differing properties |
| AC-008 | **Count.** "A census rerun showing zero checkboxes created outside `createCheckbox`" is a call count, banned outright | **Rewritten.** Now closes on the computed appearance of each of the ten sites: 0 of 10 falling back to the platform box, 0 role mismatches, each `>= 28x28`. The census makes the ten exhaustive; it does not close the criterion |
| AC-009 | Outcome-shaped once read carefully — an observed-family set compared with a declared-family set is an equality over measured rows, not a class-name check | Kept unchanged |
| AC-010 | Outcome. Computed appearance byte-identical across four transitions | Kept unchanged |
| AC-011 | Outcome. A model delta per driven toggle, and a zero delta when disabled | Kept unchanged |
| AC-012 | **Population statement.** "Five sites are ancestor-owned" named a group, not a per-site measurement | **Split into AC-012a to AC-012e**, one row per site, each with a two-sided negative control (review finding F13) |
| AC-013 | Substitution control. Outcome-shaped by construction — each substitution must fail a **value** assertion | Kept unchanged |

**Rule going forward.** No row here may be marked `Met` because a class was added, a site was
migrated, a class was deleted, or a census reported zero. Those are inputs. The closing evidence is a
computed value that moved, or a driven toggle that landed.

### Failing-number provenance — the blank cells (review finding F16)

`../architecture-findings.md` §9 condition 3 makes a criterion invalid until it has been
**demonstrated to fail on the current tree, with the failing number recorded**. The rows below hold a
source fact rather than a number. Until the number is there they are unenforceable prose.

**No number below may be invented, estimated, or carried across from another packet.** The cell is
filled by running the named producer and pasting what it printed.

| AC-ID | What produces the failing number | Stage of this phase that produces it | State until the cell is filled |
|---|---|---|---|
| AC-007 | Rendering a list row through its production renderer and reading the checkbox's computed `appearance`, radius, box size and coarse-pointer hit rect, alongside its role-mate's | Phase 1 join, recorded in Phase 2 | **Blocked.** The class has no rule anywhere, so the input falls back to the platform box — but "falls back" is a reading, not a measurement |
| AC-008 | Driving all ten classless creation sites at their production mount points and reading computed `appearance`, radius, box size and hit rect for each | Phase 1 join, recorded in Phase 2 | **Blocked.** Phase 4 may not migrate a site whose *before* computed values are unrecorded — the migration would then be unfalsifiable |
| AC-009 | The runtime-observed-node → creation-site → declared-role join, producing the observed-family set and the count identified only by ancestor selector | Phase 1 join | **Blocked.** No checkbox declares a role today, so identity is entirely ancestor-derived. That is the defect, not an artefact of measurement |
| AC-010 | Reading computed appearance after each of: theme switch, view re-render, and a move to a different mount | Phase 6, on the harness `000` repaired | **Blocked.** No harness switches theme, re-renders, or re-mounts a checkbox; every current measurement is one static read in one container |
| AC-011 | Driving a click on each family and recording the model delta, including the indeterminate resolution and the disabled zero delta | Phase 6 | **Blocked.** Nothing drives a click, drag or commit in any current harness (`../architecture-findings.md` §3) |
| AC-012, AC-012a–e | Per site: computed `appearance`, radius and box size at the production mount point, then the **pre-fix** parent-class strip and re-read. Both halves recorded per site | Phase 1 join for the computed values; the pre-fix strip is run in Phase 2, **before** Phase 4 migrates anything | **Blocked, and blocking.** Phase 4 may not migrate any of the five before its pre-fix strip result is recorded. Without it, the post-fix "stripping moves nothing" result is unfalsifiable — a site that never depended on the wrapper would look identical to one that was fixed |
| AC-013 | Running each single-coordinate substitution against the finished suite and recording which value assertion each one broke | Phase 6, after AC-001 to AC-012e have their numbers | **Blocked.** A substitution control has nothing to break until the assertions it substitutes into exist |

**Enforcement.** A blank cell is not a `Waived` row and not a soft warning. This phase may not move
`Planned → In Progress` while a cell above is blank for a stage that has already run — that gate is
`000`'s blank-cell checker, and this table is what it reads. `plan.md` already says Stage 2 is a
gate, not a task; this table is what that gate reads.

### Citations are selectors, not line numbers (review finding F11)

`styles.css` is 19,261 lines and `000` deletes dead blocks before this phase starts. **Every
`styles.css:NNNN` and `src/**/*.ts:NNNN` here is a hint with a date on it, not an address.** All were
confirmed correct on 2026-08-29 and are kept because a number that was true on a known date is
evidence about the tree on that date. The durable anchor is the selector or the symbol.

**Resolve, never trust.** If the command and the line number disagree, the command is right.

| Cited as | Durable anchor | Command that finds it |
|---|---|---|
| `styles.css:5428` | `.note-database-container .db-table .db-select-col .db-select-inner input[type="checkbox"]` — 16px, ancestor-scoped | `rg -n 'appearance: none' styles.css` then read each hit's selector |
| `styles.css:6628` | `.note-database-container .db-checkbox-cell input[type="checkbox"]` — 16px, ancestor-scoped | same sweep |
| `styles.css:8252` | `.note-database-modal .db-modal-checkbox` — 18px, on the input but reached through the modal root | same sweep |
| `styles.css:11039` | `.note-database-modal .db-csv-markdown-option-label input[type="checkbox"]` — 20px | same sweep |
| `styles.css:18944-18947` | `.note-database-container .db-add-view-duplicate input` — `flex` and `margin`, no appearance | `rg -n 'db-add-view-duplicate' styles.css` |
| `db-list-row-checkbox` (no `styles.css` line — no rule exists) | applied to an input in `list-renderer.ts`; **no matching selector anywhere** | `rg -n 'db-list-row-checkbox' styles.css src/` — the `styles.css` side returns no match |
| the five borrowed-ancestor sites | classless `input[type="checkbox"]` creations whose parent is classed one or two lines earlier | `rg -n 'type: "checkbox"' src/views/` then read the two lines above each hit |
| `runtime-vars.css:24` | `--db-header-height` pinned in the capture harness | `rg -n 'db-header-height' tools/screenshots/runtime-vars.css` |

**When a number moves, do not silently correct it.** Record the old number, the new number and the
edit that moved it.

### No criterion rests on a pre-repair harness measurement (review finding F3)

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. The desktop checks therefore run against a document with no plugin
cascade, and every desktop number that harness has produced is structurally irrelevant.

This packet is squarely exposed. Every one of its criteria reads a **computed** value that exists
only because a stylesheet rule matched — `appearance`, `border-radius`, box size. **On a page with no
stylesheet every checkbox computes the platform default, so the harness would report all twelve
families broken in exactly the same way and the fix would look like it changed nothing.** That is
not a false pass; it is a false failure that makes the whole packet unmeasurable.

`000` repairs the load. Until it has, **no measurement from the desktop harness page is admissible
here**, failing or passing, and one recorded before the repair is discarded rather than re-used. The
Storybook wrapper problem compounds it: `.storybook/preview.ts:55` puts every story inside
`.note-database-container`, which is the ancestor four of these rules are scoped to — so a story
measured in the wrapper cannot show the ancestor dependency at all. Measure at the production mount
point, and cross-check against `009`'s live probe. A harness number and a live number that disagree
is a blocking failure.

### The `styles.css` lane — when this packet takes it and what it must run to release it

`styles.css` is a single serialized lane (parent `spec.md` §4). This packet is second in the
execution order, immediately after `000`, and it is the first phase to hold the lane after `000`
releases it.

**Takes the lane** at the start of Phase 3 (*Build the primitive*), the first stage that writes CSS.
Not earlier: Phases 1 and 2 join and record against an unedited stylesheet, and the pre-fix
parent-class strips for AC-012a to AC-012e must be taken on the tree as `000` released it.

**Holds it** through Phases 3, 4 and 5. No other phase may edit `styles.css` in that window. This
matters concretely: `005` unblocks from `000` on the same edge as this packet and also edits
`styles.css`, so the two are serialized by this rule and nothing else.

**Releases the lane** only when all four of these have happened, in order:

1. **Full recapture** — every family in every state — then `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**, so it cannot be this step. The operator's defect is *visible shape*; a machine that never
   looks at a picture cannot close it.
3. **`008`'s early replay re-asserts `000`** against the released tree. `000` closed against a
   snapshot this packet has just edited. This is the program's first lane handoff and therefore the
   first real test of whether the replay works at all — treat a failure here as a finding about the
   replay as much as about this packet.
4. **Cascade re-confirmation** — every duplicated selector this packet touched has its computed
   winner recorded; a changed winner carries a written disposition. Four ancestor-scoped rules are
   being replaced by one unconditional rule, so the specificity landscape moves and a previously
   losing declaration can start winning.

### Proof-tuple coverage

A blank cell is a coverage gap and blocks closure, even when the criterion's number is valid.

| AC-ID | Producer | Runtime branch | Mount / host | Environment | Transition | Semantic outcome | Negative control |
|---|---|---|---|---|---|---|---|
| AC-001 | production | every family | production mount | both themes | static read | appearance owned | N1 |
| AC-002 | production | every family | board, gallery, list, table, modal, panel | both themes | static read | one value per role | N5 |
| AC-003 | production | every family | card, modal, **body** | both themes | static read | mount-independent | N4 |
| AC-004 | production | every family | production mount | both themes | four states | states differ | N7 |
| AC-005 | production | every family | production mount | 3 third-party themes | theme applied | theme-proof | N8 |
| AC-006 | production | every family | production mount | coarse pointer | static read | 28x28 hit rect | N9 |
| AC-007 | production | list row | production mount | n/a | n/a | class resolved | N10 |
| AC-008 | production | all ten sites | production mount | n/a | census rerun | zero outside primitive | N11 |
| AC-009 | production | every family | production mount | both themes | static read | declared role, not ancestor | N12 |
| AC-010 | production | every family | production mount → body | both themes | theme, re-render, re-mount | appearance invariant | N13 |
| AC-011 | production | every family | production mount | desktop + coarse pointer | click | model delta | N14 |
| AC-012 | production | every family | production mount | both themes | parent class stripped | nothing ancestor-owned | N2, N3 |
| AC-012a | production | `table-renderer.ts:514` | production mount | both themes | `db-select-inner` stripped, pre-fix **and** post-fix | pre-fix moves, post-fix does not | N2, N3 |
| AC-012b | production | `table-renderer.ts:785` | production mount | both themes | `db-select-inner` stripped, pre-fix **and** post-fix | pre-fix moves, post-fix does not | N2, N3 |
| AC-012c | production | `cell-renderer.ts:489` | production mount | both themes | `db-checkbox-cell` stripped, pre-fix **and** post-fix | pre-fix moves, post-fix does not | N2 |
| AC-012d | production | `card-field-renderer.ts:184` | production mount | both themes | `db-checkbox-cell` stripped, pre-fix **and** post-fix | pre-fix moves, post-fix does not | N2 |
| AC-012e | production | `record-detail-panel.ts:339` | production mount | both themes | `db-checkbox-cell` stripped, pre-fix **and** post-fix | pre-fix moves, post-fix does not | N2 |
| AC-013 | substituted | substituted | substituted | substituted | substituted | assertion fails | N15 |

### Negative controls

`N1`-`N6` are the controls already registered in `checklist.md`. `N7`-`N15` are added by this
hardening; register them in `checklist.md` when its verification protocol is next revised.

| # | Control | What it proves |
|---|---|---|
| N1 | Reverting the base appearance rule reproduces the 1-of-12 measurement | AC-001 measures the primitive |
| N2 | Removing `.db-checkbox-cell` from a wrapper in the harness changes **no** family's appearance | AC-012: nothing is ancestor-owned |
| N3 | Removing `.db-select-inner` from a wrapper in the harness changes **no** family's appearance | AC-012: nothing is ancestor-owned |
| N4 | Mounting a checkbox on `document.body` produces the same computed appearance as inside a board card | AC-003 measures mount-independence |
| N5 | Deleting one family from the harness moves an asserted number | The set equality is connected |
| N6 | A role token appearing in a radius, colour, border or glyph declaration fails a check | The role chooses size only |
| N7 | Removing one state rule makes that state indistinguishable for that family | AC-004 measures per-state difference |
| N8 | A theme that restyles native checkboxes changes no family's computed appearance | AC-005 measures theme resistance |
| N9 | Shrinking the hit target below 28x28 fails the coarse-pointer measurement | AC-006 measures the hit rect, not the box |
| N10 | Restoring `db-list-row-checkbox` with no rule reproduces an unstyled input | AC-007 is resolved, not renamed |
| N11 | A raw `createEl("input", { type: "checkbox" })` in a fixture fails the census equality | AC-008 is an equality, not a count |
| N12 | Resolving a family by ancestor selector mis-identifies it once the node is re-mounted | AC-009 asserts declared identity |
| N13 | Switching theme with the pre-fix rules reproduces divergence in 11 of 12 families | AC-010 observes the transition |
| N14 | Stubbing the model write makes the driven toggle's assertion fail | AC-011 asserts an outcome |
| N15 | Each single-coordinate substitution behaves as specified — parent-class and mount substitutions change nothing, the raw bypass fails | The suite is connected to every coordinate |
| N16 | **Before** migration, stripping `db-select-inner` or `db-checkbox-cell` from the wrapper **moves** a computed value at each of the five sites in AC-012a to AC-012e | The borrowed-ancestor dependency is real and each per-site check is connected. Without this half, N2 and N3 passing after the fix proves nothing |

### Status values

| Value | Meaning |
|---|---|
| `Met` | Verified. The evidence named was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. A waiver naming an ADR
that is not there fails validation.

### Harness-dependence audit — 2026-08-31

The pass before this one asked of each criterion whether it was green. This one asks a different
question: **if the value came from the device instead of the harness, would the check still pass —
and could it still fail?**

**No row in the table above was `Met` when this audit ran, so no tick was withdrawn and
`completion_pct` does not move.** The finding here is not a wrong green; it is that **almost every
row in this packet is pre-compromised**, and would have produced one.

The supplies, by number: **1** `--keyboard-height`. **2** values `runtime-vars.css` pins. **3**
production actions replaced by stubs. **4** host chrome built by hand. **5** Obsidian's `app.css`,
absent except for one `button` rule copied into `HOST_BARE_CONTROLS` (`verify-placement.mjs:69`).

**1 sound · 16 harness-dependent · 1 unknown.**

#### The single fact this packet rests on

**Every plugin checkbox rule is conditional, and the harness has no host rule to fall back to.**

`styles.css` contains no unconditional `input[type="checkbox"]` declaration. Every rule that gives a
checkbox an appearance is reached through an ancestor — `.note-database-container`,
`.db-select-inner`, `.db-checkbox-cell`, `.note-database-modal` — or through a class the input
carries, `.db-checkbox` or `.db-toggle-switch`. A checkbox outside all of them gets **nothing** from
the plugin.

What it gets instead is decided by which stylesheet is in the document:

- **In the harness:** the Chromium user-agent checkbox. `checkbox-appearance.mjs:86-88` loads
  exactly `styles.css`, `theme.css` and `runtime-vars.css`; there is no `app.css` and not even
  `HOST_BARE_CONTROLS`, which covers `button` and not `input`. The tool says so itself: *"What this
  is NOT: the running app."*
- **On a device:** whatever Obsidian's `app.css` declares for a bare checkbox. Obsidian draws its
  own checkbox rather than the platform one, which is why the operator's report is *round* — a
  circle is an authored `border-radius`, not a platform box.

**The consequence, stated exactly.** In the harness, `appearance` discriminates: an unstyled
checkbox reads the UA value and a plugin-styled one reads `none`. **On a device it stops
discriminating**, because a checkbox the plugin never touched reads the host's `none` too. The
threshold "computes `appearance: none` for every family" is then satisfiable **by Obsidian**, with
all twelve families still round. That is the `justify-content` failure — a property the host names
and the plugin does not, measured in a document without the host — applied to the exact property
this packet is judged on.

The same argument covers `border-radius` and box size, which are the properties the roundness lives
in, and it runs in both directions: the recorded failing counts are counts of *differs from the
Chromium default*, which is not the defect and not a number any device produces.

| AC-ID | Class | Supply | On a device |
|---|---|---|---|
| AC-001 | **Harness-dependent** | 5 | The core case above. "23 of 84 fall back to the platform box" counts divergence from a UA default that no device shows, and the threshold can be met by the host. Both the number and the pass condition are the harness's |
| AC-002 | **Harness-dependent** | 5 | Radius and box size, set equality within a role. An unowned checkbox reads the UA 13x13 here and Obsidian's box there; if the host gives every unowned family the same value, the set collapses to cardinality 1 and the row passes with the divergence intact. The cell already concedes the fixtures do not exercise the 18px and 20px paths |
| AC-003 | **Harness-dependent** | 5 | "Appearance identical at all three mount points", one of which is `document.body`. Here the three differ because only one carries plugin ancestors. **On a device `app.css` reaches all three equally, so an entirely unstyled checkbox reads identical at all three and passes.** The structural finding underneath — 61 of 61 owned checkboxes lose their appearance when a named ancestor's class is stripped — is a plugin-cascade fact and survives; the criterion's own observable does not |
| AC-004 | **Unknown** | 5 | "Read a measurable property that must differ per state." The plugin declares `:checked`, `:indeterminate`, `:disabled` and `:focus-visible` rules for the families it reaches; for the families it does not, the state difference on a device comes from the host. Whether this row is sound depends entirely on which property it reads, and the criterion does not say. **Settled by** naming the property per state and confirming the plugin declares it unconditionally |
| AC-005 | **Harness-dependent** | 5 | Three third-party themes, "at least one that restyles native checkboxes". A theme layers over `app.css`; testing it in a page that has no `app.css` tests theme-over-nothing. The one scenario the row was written for — a theme fighting the host's checkbox rule — is the one the harness cannot stage |
| AC-006 | **Harness-dependent** | 5 | Hit rect `>= 28x28` under a coarse pointer. The harness documents this supply against itself at `verify-placement.mjs:5044-5046`: *"Obsidian's app.css gives every input its own height, which is why the editor on a real phone is taller than the one this harness builds from styles.css alone."* A hit rect measured without that height is not the rect a thumb meets |
| AC-007 | **Harness-dependent** | 5 | Computed `appearance`, `border-radius`, box size and hit rect on the list-row checkbox, compared with its role-mate. Every observable is host-floored. The source fact — `list-renderer.ts:271` applies a class no selector in `styles.css` matches — is sound and is the better evidence |
| AC-008 | **Harness-dependent** | 5 | The same four observables across the ten classless creation sites |
| AC-009 | **Sound** | — | **The one row in this packet that does not read a computed style.** It joins observed node to creation site to declared role and requires the observed-family set to equal the declared-family set. No host rule participates in a join. It is also the row that answers B1's real question — *which family is this* — without asking the cascade |
| AC-010 | **Harness-dependent** | 5 | "Appearance byte-identical after every transition." Invariance is cheap under a host floor: a checkbox the plugin never styles is perfectly stable across a theme switch, a re-render and a re-mount, and passes |
| AC-011 | **Harness-dependent** | 3 | "Click each family's checkbox and assert the model value changed." The row-selection actions are stubs — `isRowSelected: () => false`, `toggleRowSelected: () => undefined`, `toggleRowsSelected: () => undefined` (`verify-placement.mjs:3398-3400`). A model delta asserted against those is the `editFileName` counting-stub failure |
| AC-012 | **Harness-dependent** | 5 | The two-sided strip control. The post-fix side — stripping the parent must move nothing — is sound in both worlds and is the half that matters. **The pre-fix side is not.** "Stripping the parent class MUST move a computed value" holds here because the fallback is the UA box; on a device the fallback is Obsidian's box, which may equal the plugin's on the property being read, in which case nothing moves. The row then declares the site *"measured wrong, not fixed"* when what actually happened is the host masked the strip |
| AC-012a | **Harness-dependent** | 5 | `table-renderer.ts:514`, the table select-all. Same two-sided control, same objection |
| AC-012b | **Harness-dependent** | 5 | `table-renderer.ts:785`, the per-row select |
| AC-012c | **Harness-dependent** | 5 | `cell-renderer.ts:489`, the boolean cell. The one family the previous attempt styled — through the cell rather than the input — which is why it looked fixed |
| AC-012d | **Harness-dependent** | 5 | `card-field-renderer.ts:184`, the card boolean field |
| AC-012e | **Harness-dependent** | 5 | `record-detail-panel.ts:339`, the record-detail boolean field |
| AC-013 | **Harness-dependent** | 5 | "A raw `createEl` bypass must **fail** the census equality." The census equality is the appearance read, so the bypass is caught only while the UA default is the floor. Under a host floor the bypass looks like every other family |

**This is not a reason to weaken the packet.** The defect is real, the operator can see it, and the
source facts this document already carries — no unconditional checkbox rule anywhere in
`styles.css`, twelve families reached through four different ancestors, ten classless creation
sites, five borrowed parents — are all sound and all independent of any instrument. What is not
sound is the *evidence shape*: thirteen of eighteen rows close on a computed value read in a
document that is missing the stylesheet deciding it.

**What would settle it.** Load Obsidian's real `app.css` into `checkbox-appearance.mjs` beside the
three sheets it already loads, and re-record AC-001 through AC-003 before any of them is trusted.
Then restate the thresholds so they cannot be met by the host: not *"computes `appearance: none`"*
but *"computes the plugin's declared box, and the declaration reaching it names the checkbox's own
role class"* — which is AC-009's question, asked of the cascade. **AC-009 is the row to build
first**, and the rest should be re-derived from it rather than from a bare computed read.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Work has not started. Every row is `Unmet`. AC-001 to AC-006 carry the failing value measured on the
current tree.

**AC-007 and AC-008 were rewritten under review finding F8.** They closed on a class being deleted
with zero callers and on a census reporting zero checkboxes created outside the primitive — a
deletion and a call count, the second of which `../architecture-findings.md` §9 bans outright. Both
now close on computed appearance: the list-row checkbox matching its role-mate on every property,
and 0 of the 10 classless sites falling back to the platform box.

**AC-012 was split into AC-012a to AC-012e under review finding F13.** The five borrowed-ancestor
sites were named as a population, and a population statement is the class-name-shaped claim this
packet exists to stop. Each now carries its own row, its own failing value, and a **two-sided**
negative control: stripping the parent's class must **move** a computed value before migration and
must **move nothing** after. Phase 4 migrates these five first, and may not migrate any of them
before its pre-fix strip is recorded — without that half, the post-fix result is unfalsifiable.

**AC-007 through AC-013, including AC-012a to AC-012e, have no recorded failing number and are
`Blocked`, not merely `Unmet`** (review finding F16). Each is listed in the provenance table above
with the artefact that produces its number and the stage that produces it.

Every line number here is a dated hint; the selector or symbol plus the command in the citation table
is the address (review finding F11). No desktop harness measurement taken before `000` loads
`styles.css` on the desktop page is admissible (review finding F3) — this packet reads only computed
values, and on a stylesheet-less page every family computes the platform default, which would make
the whole packet unmeasurable rather than merely wrong.

This spec does not close on gate passage alone — that is precisely what the previous attempt did. It
closes when the measurements above have moved from their recorded failing values, every proof-tuple
cell is filled, negative controls N1-N15 hold, every family in `checklist.md` §3 has a join row,
**the operator confirms on device that the circles are gone from board, gallery and list**, and the
doctrine verdict is written down whichever way it falls.
<!-- /ANCHOR:closure -->

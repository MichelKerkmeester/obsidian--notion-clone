---
title: "Feature Specification: Mobile Sheet Presentation"
description: "Make the bottom sheet overlay the Obsidian navbar instead of stopping above it, resolve presentation from one phone predicate, and keep a sheet alive when the view that anchored it is rebuilt."
trigger_phrases:
  - "mobile sheet presentation"
  - "sheet overlay navbar"
  - "sheet portal"
  - "phone predicate"
  - "anchor lifetime"
  - "003 mobile sheet"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/003-mobile-sheet-presentation"
    last_updated_at: "2026-08-29T14:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from measured architecture findings; not started"
    next_safe_action: "Run the sheet census on a phone profile at runtime; static grep misses the modals"
    accepted_shortfalls:
      - "Grab band 32px against the operator's 48px ask; accepted after the fit was measured"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-003"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Mobile Sheet Presentation

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `002-properties-panel`, successor
> `006-record-open-target`. Blocked by `000-surface-contract-and-truthful-harness`, whose token root
> is a hard prerequisite. Root causes and measurements live in
> [`../architecture-findings.md`](../architecture-findings.md).

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

On a phone the bottom sheet stops above the Obsidian navigation bar instead of covering it, and no
z-index resolves it: a sheet inside `.note-database-container` at `z-index: 9999` still loses the hit
test to `DIV.mobile-navbar`. Underneath sit three further measured faults — two phone predicates that
disagree between 601px and 760px, one sheet affordance with two mechanisms and two bottom offsets,
and a sheet whose repositioning dies at the first field commit because its anchor node is destroyed
by a wholesale view rebuild.

**Key Decisions**: the fix is a portal, not a number — phone sheets mount on `document.body`; the
`is-phone` bounds branch is deleted rather than retuned; the two predicates collapse to one; sheet
presentation is resolved once through a contract both `DbModal` and the positioner satisfy.

**Critical Dependencies**: `000-surface-contract-and-truthful-harness` — a portalled sheet has no
ancestry, so it carries no tokens until `.db-surface` is a token root. This phase runs after `002`
so the factory has been shaken out on desktop where debugging is cheap, and blocks
`006-record-open-target`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 003-mobile-sheet-presentation |
| **Level** | 3 |
| **Blocked by** | `000` — a portalled sheet has no ancestry, so it has no tokens until `.db-surface` is a token root |
| **Blocks** | `006-record-open-target` |
| **CSS lane** | holds `styles.css` for the sheet, scrim and safe-area rules |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `002-properties-panel` |
| **Successor** | `006-record-open-target` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

**The sheet starts above the Obsidian bottom navigation bar instead of covering it.** On a phone the
navbar keeps a band of the screen for itself, the sheet stops short of it, and the result is a
floating slab with a strip of unrelated chrome underneath. This is the defect the operator reports
first and the one this spec is named after.

No z-index resolves it. A sheet inside `.note-database-container` at `z-index: 9999` still loses the
hit test: `elementFromPoint` over the navbar returns `DIV.mobile-navbar`. The same node cloned to
`document.body` returns the sheet. **The fix is a portal, not a number** — which is exactly why this
spec cannot start before `000`, because portalling out of the container strips the design tokens.

The current code is not accidentally short of the navbar; it deliberately avoids it.
`getVisiblePopoverBounds` (`src/views/popover-position.ts:289-294`) carries an `is-phone` branch that
subtracts the navbar's measured height and `--safe-area-inset-bottom` from the bottom bound. The
branch works as written. Its intent is wrong, so it is deleted rather than adjusted.

Underneath that sit three further faults, all measured:

**Two phone predicates that disagree.** `isTouchDevice()`
(`src/data/touch-environment.ts:46-55`) is true when `Platform.isMobile || Platform.isTablet`, or the
pointer is coarse, or the container is at most `TOUCH_LAYOUT_MAX_WIDTH` — 760px
(`touch-environment.ts:22`). `isMobileBottomSheet()` (`popover-position.ts:299-304`) is true on
`is-phone`, or below 601px *and* touch-capable. The first drives `DbModal` sheets, the second drives
positioner sheets, and between 601px and 760px they return opposite answers. `Platform.isPhone`,
which would settle it, is used **zero times** in the repository.

**One affordance, two mechanisms, two behaviours.** `--db-mobile-sheet-bottom` is written in exactly
one place — `popover-position.ts:115`, inside the positioner's sheet branch. `DbModal` never sets it,
so `styles.css:159` falls back to `0px`. Modal sheets therefore sit flush at the viewport bottom
while anchored sheets sit at the navbar offset. Both call the same `applySheetChrome`; only one of
them moves.

**The sheet glitch, fully traced.** `updateCellDOM` (`src/views/database-view.ts:8597-8619`) has
surgical cases for `table`, `board`, `gallery` and `list`. Calendar and timeline — the only two views
that can have the record-detail sheet open — fall through to `default: this.refresh()`
(`:8615-8616`), which rebuilds the view wholesale. The panel node survives the rebuild; **the
`anchorEl` does not.** From the first field commit onward `anchorEl.isConnected` is false, so
`place()` (`popover-position.ts:99-100`) returns immediately and never runs again. The sheet stops
repositioning permanently, including for the keyboard on the next field.

**And no harness can see any of it.** `tools/screenshots/runtime-vars.css:43` hardcodes
`--db-mobile-sheet-bottom: 0px`, pinning the single value the defect lives in to its correct answer,
so a capture can only ever photograph a correct sheet. No harness contains a `.mobile-navbar`, and
`popover-position.ts:291` falls back to a hardcoded `50` when none is present — measured sheet bottom
offset is 49px with a navbar and 50.35px without, so harness and device agree and both are wrong.

---

### Purpose

A phone sheet that covers the navigation bar, resolved from one phone predicate through one
presentation contract, and that survives the destruction of the node that anchored it.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Portalling phone sheets to `document.body` so they win the hit test over `.mobile-navbar`
- Deleting the `is-phone` bounds branch at `popover-position.ts:289-294` and the hardcoded `50`
  fallback at `:291` with it
- Collapsing `isTouchDevice()` and `isMobileBottomSheet()` into one exported phone predicate
- One presentation contract — portal target, scrim, safe-area padding, keyboard behaviour — satisfied
  by both `DbModal` and the positioner, so `--db-mobile-sheet-bottom` has one writer
- Anchor lifetime: a sheet survives the rebuild that destroys its anchor
- A sheet scrim, which does not exist today
- The census: every positioner sheet, all 20 `DbModal` subclasses, the 3 `FuzzySuggestModal`
  subclasses
- Harness repairs: a `.mobile-navbar`, a real safe-area inset, and `runtime-vars.css` no longer
  pinning `--db-mobile-sheet-bottom`

### Out of Scope

- Desktop popover placement and menu grammar — `001` owns those
- The properties panel row grid — `002`
- Where a record opens — `006`, which is sequenced after this phase because it needs this phase's
  phone presentation to answer the question
- Repairing the Storybook stub itself; `000` unblocks `Platform`, `Modal` and `FuzzySuggestModal`,
  and Stage 6's catalogue work is blocked on that rather than duplicating it

### Files to Change

The complete list is a deliverable of the Stage-2 runtime census — static analysis cannot see the
modals, and half the population is modals. The files known before the census are:

| File Path | Change Type | Description |
|---|---|---|
| `src/views/popover-position.ts` | Modify | Delete the `is-phone` bounds branch (`popover-position.ts:289-294`) and the `50` fallback (`:291`); route sheet presentation through the contract instead of writing `--db-mobile-sheet-bottom` at `popover-position.ts:115`; stop no-opping `place()` when the anchor is disconnected (`popover-position.ts:99-100`) |
| `src/data/touch-environment.ts` | Modify | Replace `isTouchDevice()` (`src/data/touch-environment.ts:46-55`, threshold `touch-environment.ts:22`) with the single exported phone predicate |
| `src/views/modals/db-modal.ts` | Modify | Satisfy the same presentation contract as the positioner (`src/views/modals/db-modal.ts:56`) |
| `src/views/database-view.ts` | Modify | Anchor lifetime: either surgical `calendar` and `timeline` cases in `updateCellDOM` (`src/views/database-view.ts:8597-8619`) or identity-based re-resolution; the scrim precedent is `src/views/database-view.ts:10983` |
| `styles.css` | Modify | Sheet, scrim and safe-area rules, including the `--db-mobile-sheet-bottom` fallback at `styles.css:159` |
| `tools/screenshots/runtime-vars.css` | Modify | Delete the pinned `--db-mobile-sheet-bottom: 0px` at `tools/screenshots/runtime-vars.css:43` |
| `tools/storybook/verify-placement.mjs` | Modify | Navbar `.mobile-navbar`, real safe-area inset, the navbar hit test, both-mechanism geometry, and the reduced-`visualViewport` keyboard assertion |
| `src/main.ts`, `src/views/image-file-suggest-modal.ts`, `src/views/markdown-file-suggest-modal.ts` | Modify | The 3 `FuzzySuggestModal` subclasses (`src/main.ts:2947`, `src/views/image-file-suggest-modal.ts:22`, `src/views/markdown-file-suggest-modal.ts:16`) classified and routed, or exempted with a reason |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — The sheet overlays the navbar.** A phone sheet is portalled to `document.body` and wins the
  hit test over `.mobile-navbar` across the navbar's full band. This is the spec's headline
  requirement; every other requirement here exists to make it survivable.

- **REQ-002 — The bottom bound stops avoiding the navbar, and the deletion is proved by measurement.**
  The `is-phone` branch at
  `popover-position.ts:289-294` is deleted, not retuned. With it gone, `getVisiblePopoverBounds` returns
  the visual viewport bottom and the hardcoded `50` fallback at `:291` disappears with the branch that
  uses it. Resolve both with `rg -n 'mobile-navbar' src/views/popover-position.ts` rather than by line
  number.

  **The deletion is not the acceptance condition** (review finding F8). `getVisiblePopoverBounds` is
  shared by every anchored popover, not only sheets, so AC-007 closes on the measured blast radius:
  every anchored popover the phone census reaches has its rect recorded against the visual viewport
  before and after, and afterwards **0 popovers have an edge outside the viewport and 0 non-sheet
  popovers are obscured by the navbar band**. A delta that pushes a non-sheet popover under the navbar
  rejects the deletion for that popover and forces a per-role bound instead.

- **REQ-003 — One phone predicate, proved by a band sweep.** `isTouchDevice()` and `isMobileBottomSheet()` are replaced by a single
  exported predicate with one threshold and one definition of touch. Every sheet decision — modal and
  anchored — reads it. The disagreement band between 601px and 760px ceases to exist because there is
  only one number left.

  **"Both old symbols reach zero callers" is a call count and cannot close this** (review finding F8;
  `../architecture-findings.md` §9 bans call counts outright). AC-008 closes on a six-width sweep at
  600, 620, 660, 700, 720 and 760 CSS px: at every width the modal path and the anchored path must
  return the same bottom offset, the same width fraction and the same navbar-band hit result —
  **0 disagreements across a band that is 160px wide today.** The sweep is run *before* the collapse
  as well as after, or the fix is unfalsifiable.

- **REQ-004 — One presentation contract.** Sheet presentation is resolved once at open and declares four
  things explicitly: portal target, scrim, safe-area padding, and keyboard behaviour. `DbModal` and the
  positioner both satisfy it through the same code, so `--db-mobile-sheet-bottom` has one writer and
  one value. A surface that declares `sheet` and does not reach the contract is a build error, not a
  silent 0px.

- **REQ-005 — Anchor lifetime. Non-negotiable.** A sheet must survive the destruction of the node that
  anchored it. Two designs satisfy this and either is acceptable, but one of them must land:

- give `updateCellDOM` surgical cases for `calendar` and `timeline` so the wholesale `refresh()` is
  never reached while a sheet is open; or
- make the positioner re-resolve its anchor **by identity** — a stable key it can query for after a
  rebuild — rather than holding a node reference across a re-render.

The second is the stronger fix because it also covers any future view that falls through to
`default`. The first is cheaper and bounded. What is not acceptable is a sheet whose repositioning
dies at the first field commit.

- **REQ-006 — A scrim that covers everything the sheet is above.** The plugin builds no sheet scrim today;
  the only backdrop it creates anywhere is `db-mobile-column-width-backdrop`
  (`src/views/database-view.ts:10983`) for the column-width drag. This is new construction, and it must
  extend over the navbar band, not stop at the container.

- **REQ-007 — Every sheet-capable surface is inventoried and routed.** That is every positioner sheet, all
  20 `DbModal` subclasses, and the 3 `FuzzySuggestModal` subclasses
  (`src/main.ts:2947`, `src/views/image-file-suggest-modal.ts:22`,
  `src/views/markdown-file-suggest-modal.ts:16`) which extend Obsidian's class directly and therefore
  bypass `DbModal`'s presentation entirely.

- **REQ-008 — The harness can tell the difference.** The browser harness gains a `.mobile-navbar` and a real
  safe-area inset, `runtime-vars.css` stops pinning `--db-mobile-sheet-bottom`, and phone captures are
  taken with a navbar present. Removing the navbar from the harness must move an asserted number by
  more than the 1.35px fallback artefact.

  The phone page already loads `styles.css` (`verify-placement.mjs:220`) but has never driven the
  positioner — it calls only `applySheetChrome`, so the offset math this whole packet is about has
  never been exercised. Any number taken from the **desktop** harness page before `000` repairs its
  stylesheet load is discarded rather than re-used (review finding F3).

---

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them. REQ-005 is marked non-negotiable in its own text.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**Runtime, not grep.** Static analysis cannot answer the questions this spec asks. It cannot tell
which of the 20 `DbModal` subclasses actually presents as a sheet at a given width, because
presentation is a constructor default resolved against a predicate at open time
(`src/views/modals/db-modal.ts:56`, `:66-70`) — 18 of the 20 pass a presentation explicitly, the
other two inherit `"sheet"` silently. It cannot tell whether a node survives a commit. And it cannot
see the three `FuzzySuggestModal` classes at all, because they never touch the plugin's sheet code.

Open every sheet-capable surface on a phone profile and record, per surface:

| Field | Why |
|---|---|
| portal parent | distinguishes a container-mounted sheet from a body-mounted one |
| computed `bottom` | separates the 49px anchored path from the 0px modal path |
| bounding rect | the number the navbar hit test is checked against |
| node survives a field commit | the panel is expected to survive |
| **anchor survives a field commit** | the anchor is expected to die — this is the trace |

**The delta between that log and the static list is the deliverable.** The modals are what static
analysis misses, and they are half the population.

---

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is measured on the real renderer at the production mount point on a phone profile, and each
currently fails.

| # | Criterion | Measured today |
|---|---|---|
| **C1** | With a sheet open, `elementFromPoint(centreX, navbarCentreY)` returns the sheet | returns `.mobile-navbar` — **even at `z-index: 9999`** |
| **C2** | Sheet bottom edge equals viewport bottom, offset `0px`, for **both** mechanisms | **49px** anchored, **0px** modal — they disagree |
| **C3** | After a field commit the sheet's node identity is unchanged, its top edge moved `0px`, and a subsequent viewport resize still repositions it | node survives; repositioning is **dead from the first commit** because `anchorEl.isConnected` is false |
| **C4** | With `visualViewport` reduced to simulate the keyboard, the focused field stays inside the visible rect | not asserted anywhere; the phone checks never call the positioner |
| **C5** | The scrim covers the full viewport including the navbar band | **no sheet scrim exists** |
| **C6** | Removing the navbar from the harness changes an asserted number | moves **1.35px** — the `50` fallback at `popover-position.ts:291`, i.e. nothing |

**C1 and C2 are the operator's defect.** C3 is the glitch. C6 is the check that the other five are
not theatre.

A criterion is not accepted until its failing number has been recorded here from the current tree.
Class names and call counts are not criteria.

---

### Acceptance Scenarios

1. **Given** a phone profile with a sheet open, **When** `elementFromPoint(centreX, navbarCentreY)`
   is called, **Then** it returns the sheet rather than `.mobile-navbar` (C1).
2. **Given** a modal sheet and an anchored sheet, **When** each bottom edge is measured, **Then**
   both read an offset of `0px` (C2).
3. **Given** a sheet open over a calendar or timeline view, **When** a field is committed and the
   viewport then resizes, **Then** the sheet still repositions (C3).

<!-- /ANCHOR:success-criteria -->
---

## 5A. VERIFICATION METHOD

- **Hit tests and geometry** — browser harness, phone profile, navbar and safe-area inset present,
  driving the real positioner rather than `applySheetChrome` alone. `vitest` runs
  `environment: "node"` with no jsdom (`vitest.config.ts:16`), so every DOM assertion lives in
  `tools/storybook/verify-placement.mjs`.
- **Negative controls** — deleting the navbar from the harness must move C1 and C6; reverting the
  portal must reproduce the `DIV.mobile-navbar` hit result.
- **Screenshots** — phone captures **with a navbar present**, which no capture has had, plus a full
  recapture and a human reviewing the changed PNGs.
- **Storybook** — sheet states rendered at the production mount point. This needs `000`'s stub
  repairs: `tools/storybook/obsidian-stub.mjs:52-57` hardcodes `Platform` to desktop, and `Modal`
  (`:90`) and `FuzzySuggestModal` (`:80`) throw, so no touch path and no modal sheet is renderable at
  all today.
### Line numbers are dated hints; the symbol is the address

Every `styles.css:NNNN` and `src/**/*.ts:NNNN` in this packet was confirmed correct on 2026-08-29 and
is kept as evidence about the tree on that date — **it is not an address.** Three phases edit
`styles.css` before this one starts. `acceptance-criteria.md` carries the resolution table: selector
or symbol plus the `rg` command that finds it. When the command and the number disagree, the command
is right. Record moved numbers old to new rather than silently correcting them.

### The `styles.css` lane

This packet **takes the lane at the start of Phase 4** — the presentation contract and the scrim, the
first stage that writes CSS — and holds it through Phase 5. Phases 1 to 3 are harness, census and
predicate work and run against an unedited stylesheet.

It **releases the lane** only after, in order: a full recapture **with a navbar present**, a condition
no capture has ever had; a named human opening every changed PNG and signing off in `checklist.md`;
`008`'s early replay re-asserting `000`, `004`, `005`, `001` and `002` against the released tree; and
cascade re-confirmation for every duplicated selector this packet touched.

The human review carries more weight here than anywhere else in the program. `runtime-vars.css:43`
pinned `--db-mobile-sheet-bottom` to `0px` for every capture ever taken, so no existing capture could
have shown this defect and the reviewer has no prior image to compare against. And this packet moves
surfaces to a different place in the document, which changes stacking and containment for everything
mounted near them — which is exactly why `008`'s replay of the five earlier phases is a release
condition and not a formality.

- **Research gate** — standing, triggered when a criterion fails twice without a new hypothesis. Read
  AnyType and AppFlowy under `external/` (gitignored) for how a portalled sheet handles a keyboard
  and a system navigation bar. **Behaviour only** — both are AGPL/source-available against this
  plugin's MIT, so never copy code, CSS values or token scales. Notion is the visual target and is
  not a source.

---

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

**The portal is the riskiest change in the program.** It moves a surface out of the cascade that has
been styling it, which is why it lands after `000` has proved the token root on desktop and after
`002` has shaken the factory out where debugging is cheap. If the portalled sheet renders untokened,
the fault is `000`'s token root and not this spec's placement.

**R5 has a second-order cost either way.** Surgical cases for calendar and timeline mean two more
render paths to keep correct as those views change. Identity-based anchor re-resolution means a key
that must stay stable across a rebuild, and a sheet that re-anchors to the wrong cell is worse than
one that stops moving. The census is what decides which is cheaper, and the decision is recorded
before implementation starts.

**Deleting the `is-phone` bounds branch changes every anchored popover on a phone**, not only sheets,
because `getVisiblePopoverBounds` is shared. The census must record the current bottom bound for
non-sheet popovers so the blast radius is a measured number rather than an assumption.

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `000-surface-contract-and-truthful-harness` | A portalled sheet has no ancestry and therefore no tokens | Hard prerequisite; T18 verifies `--db-radius-lg` resolves non-empty on the body-mounted node rather than assuming it |
| Dependency | `002-properties-panel` | The factory is shaken out on desktop before the riskiest change uses it | This phase is sequenced after `002` |
| Dependency | Storybook stub (`tools/storybook/obsidian-stub.mjs:52-57`) | No touch path and no modal sheet renders until `Platform`, `Modal` and `FuzzySuggestModal` are unblocked | `000` owns the stub repair; a container-wrapped approximation does not substitute for it |
| Dependency | Serialized `styles.css` lane | Sheet, scrim and safe-area rules cannot be edited concurrently | This phase holds the lane alone and ends with a full recapture and human review |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The presentation contract adds no listener the positioner and `DbModal` did not already
  own; the scrim attaches with the sheet and is removed with it.
- **NFR-P02**: Anchor re-resolution, if that design is chosen, must not query the DOM on every
  reposition — only after a rebuild.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are
  AGPL/source-available against this plugin's MIT, so no code, CSS value or token scale is copied.
  Notion is the visual target and is not a source.

### Reliability

- **NFR-R01**: Each stage is separately revertable and lands as its own commit.
- **NFR-R02**: The `is-phone` bounds branch is recorded verbatim in the census before deletion, so
  restoration is a copy rather than a reconstruction.
- **NFR-R03**: Desktop behaviour is untouched; every change here is phone-scoped or predicate-gated.
- **NFR-R04**: A surface that declares `sheet` and does not reach the contract fails at build, not
  silently at `0px`.

---

## 8. EDGE CASES

### Data Boundaries

- The 601-760px band is where the two predicates return opposite answers today. Stage 3 records which
  surfaces change classification across it; that list is the behavioural blast radius.
- A reduced `visualViewport` standing in for the keyboard must keep the focused field inside the
  visible rect (C4). Nothing asserts this today because the phone checks never call the positioner.
- The navbar band is the region C1 hit-tests. A harness without a `.mobile-navbar` falls back to the
  hardcoded `50` at `popover-position.ts:291`, which is why harness and device agree at 49px and
  50.35px and both are wrong.

### Error Scenarios

- A portalled sheet that renders untokened is `000`'s token root failing, not this phase's placement.
  Do not revert the portal; confirm `--db-radius-lg` first.
- A sheet that re-anchors to the wrong cell after a rebuild is worse than one that stops moving. The
  identity key must be stable across the rebuild or the surgical-cases design is the safer choice.
- Deleting the `is-phone` branch moves every anchored popover on a phone, not only sheets, because
  `getVisiblePopoverBounds` is shared.

### State Transitions

- A field commit on calendar or timeline reaches `default: this.refresh()` and rebuilds the view. The
  panel node survives; the `anchorEl` does not. Repositioning must survive both.
- The fix must hold for the keyboard on the *next* field, not only the first: two consecutive field
  commits then a `visualViewport` reduction still repositions (T21).
- Orientation change and split-pane resize re-evaluate the predicate and the measured insets; anything
  cached at first render must be republished.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 22/25 | Portal, two predicates collapsed to one, a new presentation contract, a new scrim, anchor lifetime, plus a census over every positioner sheet, 20 `DbModal` subclasses and 3 `FuzzySuggestModal` subclasses |
| Risk | 24/25 | The portal is the riskiest change in the program; the shared bounds branch moves every phone popover; two mechanisms merge while one is being portalled |
| Research | 13/20 | Root causes measured in `../architecture-findings.md`; the open judgement is which anchor-lifetime design is cheaper |
| Multi-Agent | 8/15 | Single CSS lane by construction |
| Coordination | 14/15 | Blocked by `000` and sequenced after `002`; blocks `006` |
| **Total** | **81/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | The portalled sheet renders untokened | H | M | `000`'s token root is a hard prerequisite; T18 measures `--db-radius-lg` on the body-mounted node instead of assuming it. Do not revert the portal on this symptom |
| R-002 | Deleting the shared `is-phone` bounds branch moves non-sheet popovers on a phone | H | H | T9 records their current bottom bound before deletion, so the blast radius is a measured number rather than an assumption |
| R-003 | Identity-based anchor re-resolution re-anchors to the wrong cell after a rebuild | H | M | The census decides which design is cheaper, and the decision is recorded before implementation (T19) |
| R-004 | Surgical `updateCellDOM` cases leave the next view that falls through to `default` broken | M | M | Recorded as the known second-order cost of that design; the alternative covers it |
| R-005 | C2 stays split after the contract lands | M | M | The diagnostic is which code path wrote `--db-mobile-sheet-bottom`; after Stage 4 there must be exactly one |
| R-006 | A phone capture passes while the device is broken | H | M | Phone captures are taken with a navbar present, and closure requires the operator confirming on a phone |

---

## 11. USER STORIES

### US-001: The sheet covers the navigation bar (Priority: P0)

**As a** phone user, **I want** the bottom sheet to cover the Obsidian navigation bar, **so that** I
stop seeing a floating slab with a strip of unrelated chrome underneath it.

**Acceptance Criteria**:
1. Given a sheet open on a phone, When `elementFromPoint(centreX, navbarCentreY)` is called, Then it
   returns the sheet (C1).
2. Given a scrim behind that sheet, When its rect is measured, Then it covers the full viewport
   including the navbar band (C5).

### US-002: One sheet, one offset (Priority: P0)

**As a** maintainer, **I want** modal and anchored sheets to reach the same presentation contract,
**so that** the same affordance stops having two mechanisms and two bottom offsets.

**Acceptance Criteria**:
1. Given a modal sheet and an anchored sheet, When each bottom offset is measured, Then both read
   `0px` (C2).
2. Given a surface declaring `sheet` that does not reach the contract, When the project builds, Then
   the build fails rather than falling back silently to `0px`.

### US-003: The sheet keeps working after an edit (Priority: P0)

**As a** phone user editing fields in a record sheet, **I want** the sheet to keep repositioning
after I commit a field, **so that** the keyboard does not cover the next field I tap.

**Acceptance Criteria**:
1. Given a sheet over a calendar or timeline view, When a field is committed and the viewport then
   resizes, Then the sheet still repositions (C3).
2. Given two consecutive field commits, When `visualViewport` is then reduced, Then the focused field
   stays inside the visible rect (C4).

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- **Which anchor-lifetime design is cheaper?** REQ-005 accepts either surgical `calendar` and
  `timeline` cases in `updateCellDOM` or identity-based anchor re-resolution. The second is the
  stronger fix because it also covers any future view that falls through to `default`; the first is
  cheaper and bounded. The Stage-2 census decides, and the decision is recorded before code is
  written (T19).
- **What is the blast radius of deleting the shared bounds branch?** Every anchored popover on a phone
  moves, not only sheets. The number is not knowable before T9 records the current bottom bound per
  popover.
- **Which of the 3 `FuzzySuggestModal` subclasses are sheets at all?** They extend Obsidian's class
  directly and bypass `DbModal`'s presentation entirely, so the answer is a runtime observation, not
  a reading of the source.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Folder neighbours**: `002-properties-panel` and `004-checkbox-ownership`. Folder numbering is
  an identifier, not the execution order; the program order is 000 -> 004 -> 005 -> 001 -> 002 ->
  003 -> 006, argued in [`../spec.md`](../spec.md) §3.
- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md)
- **Predecessor**: `002-properties-panel`
- **Blocked by**: `000-surface-contract-and-truthful-harness`
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification Checklist**: See [`checklist.md`](checklist.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)

## OPERATOR DECISION — the grab band stops at 32px

The operator asked for a drag band "at least 48px high and as wide as whole sheet header". It ships
at 32px, full width. **The operator was shown the shortfall and accepted it.**

This section first recorded 35px. A later phase measured the shipped build at 32px and derived it
from the stylesheet as 16 + 8 + 4 + 4. The decision is unaffected — both clear the 24px AA target
and miss the 44px AAA one — but the number the operator was shown was wrong, and saying so is
cheaper than leaving two heights in the program's records.

Why 48 does not fit. The band is anchored below the sheet's top edge so none of it is clipped, and
the space above the header is all there is: the record sheet has 33px of chrome there, the owned-menu
sheet 40px. Reaching 48px means a taller sheet header, which moves the content of all nine sheet
surfaces down and forces a full recapture and re-review. The alternative — letting the band overlap
the header — was rejected because it reintroduces exactly the defect this phase just fixed: the band
previously ran 2-50px and answered presses aimed at the sheet title, which is also what hid the
title's rename gesture and squeezed both 44px header actions down to 26px.

What was actually wrong is fixed. The title takes its own presses again, both header actions measure
44 of 44, and the band no longer competes with either. 32px clears the 24px WCAG 2.5.8 AA target and
falls short of the 44px 2.5.5 AAA one; that gap is accepted, not unnoticed.

The matching entry in the stylesheet lane's outstanding list should be marked accepted rather than
open the next time that file is free — it is recorded here because the lane was held when the
decision was made.

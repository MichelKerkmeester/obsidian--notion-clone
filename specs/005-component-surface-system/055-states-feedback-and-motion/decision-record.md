---
title: "Decision Record: States, Feedback and Motion"
description: "ADR-001 — one toast component with an action slot, the inline rail and the selection-bar undo becoming placements of it. ADR-002 — the confirm keeps confirmWithModal's signature and gains 044's grammar inside the component."
trigger_phrases:
  - "055 decision record"
  - "toast adr"
  - "confirm grammar adr"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/055-states-feedback-and-motion"
    last_updated_at: "2026-09-06T18:00:00Z"
    last_updated_by: "loadmore-lanes"
    recent_action: "ADR-009 Accepted: a deleted source gets its own state with a Choose database action"
    next_safe_action: "Build the source-missing empty state ADR-009 records (T005)"
    blockers: []
    key_files:
      - "src/views/toast.ts"
      - "src/views/modals/confirm-modal.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/chart-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-055-adr"
      parent_session_id: null
    completion_pct: 55
    open_questions: []
    answered_questions: []
---
# Decision Record: States, Feedback and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Three feedback shapes become one toast component with an action slot

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05, landed 2026-09-06 |
| **Deciders** | Phase author; landed by T004 |

### Landing note (2026-09-06)

`showOperationResult` now renders through `showToast` at its own fixed placement:
`ToastOptions` gained a `container` field — a caller-supplied single-slot host instead of the
shared body stack — and `.db-toast.is-inline` lays the card out in normal flow at that host's own
position rather than the collapsed-stack's absolute one. `styles.css`'s `.db-operation-result-*`
rules (border, padding, background, its own `db-operation-rail-in` keyframe) retired along with
the `is-error` variant; the rail keeps only its `position: fixed; right; bottom; z-index`, now
carrying `db-surface` so the reduced-motion reset (ADR-006) reaches the card mounted inside it.
One behaviour changed on purpose rather than by oversight: the rail's error case used to
auto-dismiss at the same 2200ms as success; the toast component's own contract is that error never
times out, and that contract won rather than being special-cased away for one caller — the
"one timer contract" half of this ADR's own threshold outranks the "as before" half for exactly
the case where the two conflict.

**The selection bar's button is unchanged, and that is the finding, not a gap.** `db-selection-undo`
(`database-view.ts:7719`) carries no CSS of its own — grep confirms zero rules named
`.db-selection-undo`; it borrows `.db-selection-action`, shared with four sibling buttons in the
same persistent bar. It has no timer, no message text, and already calls the same `undoLastEdit()`
every toast Undo action calls. Re-rendering it as a floating `.db-toast` card would swap a compact
icon+label button for a 384px card with a close control and no auto-dismiss, sitting inside an
already-populated row of buttons — a size and shape change the ADR's own "behave as before in
position" clause forbids, not a unification of two competing shapes. There was only one competing
shape here (the rail's), and it is the one that changed.

---

### Context

Feedback exists in three shapes that answer one question. 247 bare `new Notice(...)` call sites
carry no severity and no action affordance — so `notice.galleryMigrated`
(`src/i18n.ts:1455`, raised at `database-view.ts:2744` and `embedded-database-renderer.ts:764`)
has promised *"Undo to keep it a gallery"* over a surface that cannot carry a button. The per-view
result rail (`showOperationResult`, `showOperationResult`, called at `database-view.ts:9433-9437`) has severity and an
Undo/Retry action but is scoped to one view and one timer. The selection bar's undo button
(`database-view.ts:7719`) is a third contract with its own CSS. The operator's componentize
directive names exactly this: one thing, many callers.

### Constraints

- The rail's inline placement next to the operation it reports is load-bearing; a floating toast
  cannot replace its position.
- The undo affordance routes to the existing history stack (`undoLastEdit`) — no new undo
  mechanism may be introduced.
- The toast is a floating surface, so it mounts outside the token subtree and must carry the
  token snapshot (`design-system.md` §4.2) and reduced-motion coverage (`styles.css:918-947`).

### Decision

**We chose**: one toast component (`src/views/toast.ts`) with severity, an optional action slot,
`role="status"` announcement, and motion tokens. The rail and the bar's undo become placements of
it — the rail keeps its position, the bar keeps its button, and both render the component.

**How it works**: the component takes state (`success`/`error`), message, and an optional action
(label, icon, callback). Auto-dismiss on success uses the 2200ms budget the rail already runs
(`database-view.ts:11256`); error sticks until acted on or replaced. Placement is the caller's
(the rail's container position, the bar's row); presentation, timing, announcement and teardown
are the component's.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **One component, placements (chosen)** | One API; the action slot is the feature; one reduced-motion story | Three consumers must agree on one contract | 9/10 |
| Second inline-rail component | Preserves placement untouched | Keeps three feedback contracts; the 247-site residue stays uncomponentized | 5/10 |
| Extend Obsidian's `Notice` with a fragment | Zero new component | No severity, no token boundary, no reduced-motion story, host-owned lifetime | 4/10 |

**Why this one**: the component is smaller than any of the three shapes it replaces, and the
action slot is what makes a promise like the migration notice's Undo deliverable at all.

### Consequences

**What improves**:
- One place to fix announcement, timing, tokens and reduced motion for every notice.
- The migration notice's Undo becomes real; the deleted-relation and delete confirmations gain
  severity.

**What it costs**:
- The wider migration (247 sites) is out of this phase's scope — this phase owns the component,
  the pattern and the named sites. Mitigation: the residue is named in `plan.md`'s bounded-migration
  note, not hidden.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Toast and a sheet both dock at the bottom edge on phone | M | The bar's `db-bottom-dock-taken` coordination (`styles.css:2591`) is the precedent to extend; the lane asserts the ordering |
| A toast action fires after its dismissal | M | The handler runs against the stack's current state or reports `nothingToUndo` — never a silent no-op (`spec.md` §10) |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | 247 bare notices; a promise Undo cannot keep (`src/i18n.ts:1455`) |
| 2 | **Beyond Local Maxima?** | PASS | Three alternatives scored; the fragment route rejected for host-owned lifetime |
| 3 | **Sufficient?** | PASS | One component + placements is the smallest thing that ends the three-contract split |
| 4 | **Fits Goal?** | PASS | The operator's componentize directive names this exact shape |
| 5 | **Open Horizons?** | PASS | The residue migration is the component's, not a second design |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/toast.ts` — the component.
- `src/views/database-view.ts` — the rail and the bar's undo render it; the owned notice sites
  route through it.
- `src/views/embedded-database-renderer.ts` — the migration and delete notices route through it.

**How to roll back**: revert the leg's commit; the migrated call sites restore `new Notice` at
exactly the sites the leg touched — the component is leaf-shaped and nothing else reads it.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The confirm keeps its API and gains `044`'s grammar inside the component

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05, landed 2026-09-06 |
| **Deciders** | Phase author; landed by T007/T008 |

### Landing note (2026-09-06)

Measured against the shipped tree, `DbModal`'s own shell (`createSurfaceShell`, added since this
ADR's draft) already calls `createSheetHeader` for any `sheet`-presented modal, but only when the
device is touch — so a second, explicit call from `ConfirmModal.onOpen` would have duplicated the
header on phone. The landing carries the ADR's intent (the confirm gains the shared header through
`createSheetHeader`, not a second mechanism) without that duplication: `onOpen` now builds its own
title, message and actions **before** calling `super.onOpen()`, so when the shell's scrape-based
title resolver runs, the real `<h3>` already exists and the header renders correctly on its first
pass rather than a generic fallback corrected a microtask later. The message also gains
`db-panel-row`, the sheet grammar's own row shape, which resolves to a real padded row only where
`applySheetChrome` has marked the modal root `.note-database-container` — i.e. on the phone
presentation the grammar row is asking about, and inertly nowhere else.

`sheet-grammar.mjs`'s `REGISTERED_SURFACES` gained a `confirm` row. `ConfirmModal` cannot be
mounted inside this harness's browser bundle — it extends Obsidian's `Modal`, which
`obsidian-stub.mjs` deliberately throws on rather than fakes, the same constraint that already
forced the stacked-pair registry's `openHostModalChild` stand-in for a modal child. The new row
follows that precedent: a hand-built mirror of `confirm-modal.ts`'s markup, wired through the real
`attachSheetChromeToModal`/`placeSheet`/`keepSheetPlaced` functions so every column but the markup
mirror itself measures production code. Run directly: **8 of 8** columns pass (the seven canonical
elements plus the dropdown column), the close target measures 44×44, and nothing overflows the
surface's right edge — confirmed on a from-scratch run of `node tools/live/sheet-grammar.mjs`,
exit 0. The two pre-existing `REGISTERED_STACKED_PAIRS` rows this ADR names — "confirm over a
sheet" and "import confirm dropdown chain" — were found **already registered and already green**
(`048`'s own prior landing), closing AC-004/T008 without a further code change there; the row's own
"Red first: the pair is unregistered today" was stale against the tree this leg found, restated
here rather than quoted forward.

---

### Context

`ConfirmModal` declares `sheet` (`modals/confirm-modal.ts:42` (`super(app, "sheet")`)) and never calls `createSheetHeader`, so
the most common stacked surface in the plugin (`048` inventory M-4 — "any destructive action
inside a sheet → ConfirmModal") scores 0 of 7 on `044`'s grammar. Nineteen call sites type
`confirmWithModal(app, {...})` across twelve files (`spec.md` §5's Confirm row). Threading a
presentation or header option through the signature would fork nineteen call sites for a change
only the component should own — and the operator's "header everywhere" ruling
(`roadmap.md` §6A) is precisely that there is no opting out.

### Constraints

- `confirmWithModal`'s promise-based contract — `false` on dismissal and cancel identically
  (`confirm-modal.ts:18-19`) — must not change.
- The confirm presents as a stacked child wherever a sheet opens it: `048`'s stacking model is a
  constraint this component consumes, not regresses.
- `DbModal`'s declared presentation (`db-modal.ts:56`) remains the presentation mechanism; no
  parallel sheet class.

### Decision

**We chose**: the `confirmWithModal` signature is unchanged; `ConfirmModal.onOpen` calls
`createSheetHeader` with the options' title, and the stacked-pair rows are registered in `048`'s
registry.

**How it works**: every caller conforms in one place. The header's title comes from the options'
existing `title` field; the danger variant's `mod-warning` confirm button is untouched; the
grammar lane asserts the seven elements on a registered `confirm` row.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Grammar inside, signature unchanged (chosen)** | 19 call sites conform without touching one; "header everywhere" holds structurally | A caller cannot opt out — accepted, since the ruling forbids opting out | 9/10 |
| A `ConfirmSheet` parallel class | Desktop and phone could diverge deliberately | Two confirm paths — the exact split `048`'s D1 exists to end | 3/10 |
| Signature option (`header: true` per caller) | Explicit per site | Nineteen edits; a caller that forgets one is a non-conforming confirm again | 4/10 |

**Why this one**: the defect is in the component; the fix belongs in the component.

### Consequences

**What improves**:
- Every destructive flow in the plugin reads as `044`'s sheet grammar, in one change.
- The stacked-pair registry gains the most common pair, closing `048` M-4's row.

**What it costs**:
- A desktop confirm gains a header it did not have. Mitigation: the operator's ruling is
  header-everywhere, and desktop confirms are modals — the header presents only where the sheet
  grammar applies (`is-phone` scoping, `044` ADR-002's precedent).

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The header changes a confirm's height on a tall confirmation | L | The grammar's own 16px inset and title rules are what the lane asserts; recapture any changed scenario in the same change |
| A stacked confirm over `fullscreen` parents takes the wrong path | M | `048`'s edge case already names the unstacked path for non-sheet parents (`048` spec §L2); the confirm inherits it |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | 0 of 7 grammar elements on the most common stacked surface (`048` M-4) |
| 2 | **Beyond Local Maxima?** | PASS | Three options scored; the parallel class explicitly rejected |
| 3 | **Sufficient?** | PASS | One `createSheetHeader` call + registration is the smallest conforming change |
| 4 | **Fits Goal?** | PASS | The confirm is one of the phase's named component primitives |
| 5 | **Open Horizons?** | PASS | The unchanged signature is what lets `051` own the primitive and this phase consume it — `051` ADR-003, written at landing 2026-09-05 |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/modals/confirm-modal.ts` — `createSheetHeader` in `onOpen`; the options' `title`
  becomes the header's title.
- `tools/live/sheet-grammar.mjs` — a `confirm` row and its stacked-pair registration.

**How to roll back**: revert the leg's commit; the signature never changed, so every caller is
unaffected by the revert — the confirm returns to its headerless sheet exactly as shipped today.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The 050-inherited thresholds bind at their restated figures, not their original ones

> **Numbering note.** ADR-003 is deliberately unused in this packet. `acceptance-criteria.md`
> AC-003 cites `051` ADR-003 as the owner of the confirm primitive, and a local ADR-003 beside it
> would read as the same ruling. The next local number is 004.

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Design true-up (T001) |

---

### Context

AC-009 and AC-011 were written citing "ADR-004", which did not exist — the restatements they lean
on live in `../050-anytype-adoption/design-trueup.md`, in another packet, and nothing in this one
recorded that they bind here. A criterion whose justification is a dangling reference cannot be
audited, and two of the four `050`-inherited rows were in that state.

The substance is not in dispute. `050`'s own true-up already established that four of its premises
are false against this tree: the row menu cannot render empty, twelve empty reasons already ship,
the scroll-restore machinery already exists, and there is no virtualization path to avoid. This
packet's `design-trueup.md` §4 re-confirmed each against today's tree.

### Constraints

- `050` stays the requirement set for items 5, 8, 9 and 14 (goal D3); this packet is their
  implementation leg and may not reopen the requirements.
- A threshold whose failing value is asserted wrongly cannot be observed red, so goal D2 is
  unsatisfiable until each is restated.
- AC-IDs are stable once written: restate a criterion's cell, never renumber it.

### Decision

**We chose**: the four `050`-inherited criteria bind at the figures
`../050-anytype-adoption/design-trueup.md` restated, re-confirmed in this packet's
`design-trueup.md` §4, and this ADR is the record AC-009 and AC-011 cite.

**How it works**: each row's Verification cell already carries the restated figure and now names an
ADR that exists. Specifically — selection caps are **not adopted** (no multi-select referent);
`bulk-edit-field-menu.ts` is the **only** never-empty violator; `no-database` **is** the target
empty flavour and the deleted-relation state is the real red; the "never virtualizes" clause is a
**future-regression guard**, not today's red.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Record the restatement locally (chosen)** | The citation resolves; the audit trail is one hop | One more ADR to maintain | 9/10 |
| Point the cells at `050`'s true-up directly | No new ADR | A cross-packet file path is not an ADR, and the waiver contract asks for one | 5/10 |
| Renumber the criteria | Tidy | Forbidden — AC-IDs are stable once written | 1/10 |

**Why this one**: the cheapest change that makes an existing citation true.

### Consequences

**What improves**: AC-009 and AC-011 are auditable; the restated figures have one home in this
packet.

**What it costs**: nothing measurable. The thresholds were already restated in their cells.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later reader takes `050`'s original wording as binding | M | Both `050`'s true-up and this one state the precedence in their own words; the cells carry the restated figure inline |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Two criteria cited a non-existent ADR |
| 2 | **Beyond Local Maxima?** | PASS | Three options scored |
| 3 | **Sufficient?** | PASS | One ADR closes both dangling citations |
| 4 | **Fits Goal?** | PASS | Goal D2 needs an observable red per threshold |
| 5 | **Open Horizons?** | PASS | Nothing is foreclosed; the requirements stay `050`'s |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `acceptance-criteria.md` AC-009 and AC-011 keep their wording and now cite an ADR
that exists. No code.

**How to roll back**: delete this ADR and the citations revert to dangling — which is the state
this fixes, so there is nothing to preserve.

---

### Addendum, 2026-09-06: the row-height clause closes

**Operator ruling (2026-09-06 ~04:45, verbatim):** *"44px on phone, 30px desktop."*

AC-011's page limit and `Load more` row had already landed; the one clause still `Unmet` was the
≈40px inline row against the 48px full-page row this ADR's own restatement asked for, and nothing
had measured it because the row shipped at one flat height — 30px cell, 29px button — on every
width. The operator's figure replaces the drafted ≈40px/48px split with an exact pair: 44px on
phone, unchanged 30px/29px on desktop.

`.is-phone .note-database-container .db-table-load-more-row td` and `.is-phone
.note-database-container .db-table-load-more-button` now carry that 44px, the same thumb floor
`.is-phone .db-menu-item` already raises every other phone sheet row to; the desktop pair is
untouched. A registered fixture (`chrome-table-load-more`, `tools/screenshots/scenarios/chrome.mjs`)
captures the row in both themes and both devices for the first time — previously **no capture
showed the state at all**. A `RAISED` entry in `tools/live/touch-targets.mjs` holds
`.db-table-load-more-button` to 44px outright rather than this lane's usual 28px floor, since this
control is read as a fixed phone number rather than "clears the floor"; forcing the button back to
29px on phone was observed **red** (`FAIL [fixture] — chrome-table-load-more
button.db-table-load-more-button measured 795x29, under its named 44px floor`), with every other
row in the lane staying green, and reverting to 44px turned it green again.

AC-011 and `050` REQ-014 both close on this figure; `roadmap.md` §6A records the operator's words.
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: The motion set is measured from `anytype-ts` source, and `--db-motion-surface` becomes 200ms

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Design true-up (T001) |

---

### Context

The draft motion spec cited `047` §10 — "0.2s enter / 0.1s exit, one centralized `animationProps`
helper" — for values a still capture can never show. Reading
`specs/context/anytype-ts/src/scss` directly contradicts both halves. The toast's enter **and**
exit share one `transition-duration: 0.2s` (`notification/common.scss:21`, `:25`); `0.1s` occurs
four times in the whole stylesheet and none of them is an exit
(`widget/common.scss:34`, `component/sidebar/page/common.scss:3`,
`block/dataview/view/gallery.scss:13`, and a `transition-delay` at `page/auth.scss:379`). And the
"centralized helper" is three constants (`_mixins.scss:2`, `:5-7`) plus 18 hand-typed `0.3s` and 96
bare `ease` keywords against 2 `ease-out`.

Separately, this packet's own census contradicted itself: 42 and 78 both appear as the count of
hand-typed `120ms` transitions, in four documents, used interchangeably.

### Constraints

- `sk-design`'s bands govern where a value may sit: 120-180ms direct feedback, 180-260ms small
  state change, deformation held inside 0.95-1.05.
- An established project value outranks a neighbouring measurement; a measurement outranks a stray
  literal.
- `design-system.md` declares no easing vocabulary, and two parallel easing systems would make
  elevation-of-motion unreadable (`sk-design` §4 NEVER-8).

### Decision

**We chose**: four tokens, three unchanged and one changed, plus one new token.

- `--db-motion-fast` stays **`120ms ease`** — an established value with 42 declarations on it,
  inside the direct-feedback band, against Anytype's neighbouring `0.15s`.
- `--db-motion-surface` becomes **`200ms ease-out`**, up from the drafted 180ms. Anytype puts menu,
  popup and sidebar on one `0.2s` constant (`_mixins.scss:5-7`) with a decelerating curve
  (`_mixins.scss:9`), 200ms is inside the small-state band, and our 180ms is three stray literals
  rather than an established token — so the measurement wins.
- `--db-motion-sheet` stays **`260ms ease-out`**, ours, reasoned at `styles.css:114-120`, with no
  measured counterpart to contradict it.
- `--db-motion-emphatic` stays **`1.1s ease-in-out infinite`**.
- **`--db-motion-scale-from: 0.98`** is added, because our popover (`styles.css:360`) and the toast
  need the same number and a scale written twice drifts — the argument `styles.css:114-120` already
  makes for the sheet duration.

**How it works**: the tokens land in the `--db-*` block with their dark-theme override, the three
`180ms` literals migrate in the same commit, and the reduced-motion reset names every new consumer.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Measured 200ms, keep our 120/260 (chosen)** | Each value has a stated owner — measurement or established project value | One migration of three literals | 9/10 |
| Keep 180ms and alias | No migration | Adopts a stray literal over a measured constant, for no reason but inertia | 4/10 |
| Port `$easeInQuint` as a bespoke cubic-bezier | Highest fidelity to the reference | A second easing system beside the keywords; and the constant's name is an ease-**out** curve called "In", so it would be copied wrongly | 3/10 |

**Why this one**: it is the only option where every value can name why it beat its neighbour.

### Consequences

**What improves**: four durations with a stated provenance each; one scale value that cannot drift;
a census that is right.

**What it costs**: three `180ms` literals migrate to a 200ms token, so any surface tuned by eye
against 180ms moves by 20ms. Mitigation: all three are small floating surfaces, which is exactly
the population the token describes.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The token lands before its literals migrate, leaving both live | M | L4's commit carries token and migration together, as `plan.md` §6 already requires |
| Reduced motion is read as adopted from the reference | L | `prefers-reduced-motion` occurs **0 times** in `anytype-ts/src`; the true-up records that ours has no counterpart |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Both halves of the cited motion finding are contradicted by the source |
| 2 | **Beyond Local Maxima?** | PASS | Three options scored, including the highest-fidelity one |
| 3 | **Sufficient?** | PASS | Five tokens cover every duration and scale this phase's surfaces need |
| 4 | **Fits Goal?** | PASS | REQ-055-5 is one token set for motion |
| 5 | **Open Horizons?** | PASS | An easing vocabulary in `design-system.md` stays available later; nothing here forecloses it |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `styles.css` token block and dark-theme override; the three `180ms` literals; the
reduced-motion reset's consumer list. `spec.md` §4 and `state-feedback-vocabulary.md` §4 carry the
corrected values and census.

**How to roll back**: revert L4's commit; token and literals move together, so no half-migrated
state exists.
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: The stylesheet sweep is wider than "recorded, not swept", and the reduced-motion reset is repaired at its weight

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator (sweep scope), landing verification (reset repair) |

---

### Context

Two things happened to `styles.css` in the L4 leg that its own task did not authorise, and both
need a record rather than a silence.

**The sweep.** T010 wrote the restraint as "zero untokenized durations in the files this phase
changed; the wider census is recorded, not swept", which scopes the migration to `styles.css`'s own
token block plus whatever L1-L3 touched. What landed migrated **38 of the 42** plain-`ease` `120ms`
transition declarations across the whole 22,000-line stylesheet, and both `180ms` surface
declarations. The 4 remaining are `120ms ease-out` — a directional curve `--db-motion-fast`'s
`120ms ease` does not carry, so aliasing them would silently change what they do.

**The reset.** ADR-005's implementation note says the reduced-motion reset "names every new
consumer", and the L4 leg concluded no reset change was needed: the toast mounts `.db-surface`, and
`.db-surface` is already in the reset's selector list. Read as source that is true. Measured in a
browser it is false. `.db-surface *` is one class plus a universal — specificity (0,1,0) — which
**ties** with `.db-toast`, and the reset sits at line 934 while `.db-toast` sits at 2757. A tie is
broken by order, so the later rule wins. Under `prefers-reduced-motion: reduce` the toast's
`animation-duration` computed **0.2s**, its full entrance, on the tree as the leg shipped it.
Everything the reset appears to cover that is written **below** it escapes the same way.

### Constraints

- The scope in `spec.md` is frozen; a wider edit is amended in the open or it is drift.
- `AGENTS.md` root-cause: a fix that works only where the bug surfaced treated the symptom.
- The reset's own comment already argues for a hard stop — "a spec-true `0` suppresses the
  transition outright instead of racing it" — so the weight is the conclusion of an argument the
  file has already made, not a new opinion.

### Decision

**We chose**: record the sweep as adopted, and repair the reset with `!important` on its
`.db-surface` clause.

- **The sweep stands.** The operator's `design-trueup.md` measured the full 42-declaration census
  as the target, and a token that reaches 38 declarations is the deliverable REQ-055-5 describes.
  T010's restraint is amended by this ADR rather than by the leg quietly outgrowing it. What T010
  still owns is unchanged: the `ms` strays and the 16 seconds-notation durations stay recorded and
  unswept.
- **The reset gains `!important`** on `animation-duration`, `animation-iteration-count` and
  `transition-duration`, in the `.db-surface` clause only. The container clause is untouched.

**How it works**: `!important` outranks order and specificity together, so the reset stops
depending on where in the file a surface's rules happen to sit. Measured after the change, the
toast's entrance computes `1e-05s` under reduce and `0.2s` with no preference.

This is not a new idiom in this stylesheet. A second `prefers-reduced-motion` block already sits
near the bottom of the file and already writes `!important` on all four of its properties, for the
same reason arrived at from the same direction — it just does not name `.db-surface`, which is why
it never covered the toast. Two reduced-motion blocks disagreeing about whether a reset is
enforceable was the state before this ADR; now they agree.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **`!important` on the `.db-surface` clause (chosen)** | Fixes the producer; every future body-mounted surface is covered without remembering to be | A shared reset gains three `!important`s | 9/10 |
| Add `.db-surface .db-toast` to the reset's selector list | Smallest blast radius | Per-surface patch at the call site of a general defect; the next surface rediscovers it | 3/10 |
| Move the whole reduced-motion block to the end of the file | No `!important` | Reorders a 22,000-line cascade to fix a three-property reset | 2/10 |
| Leave it and record the escape | No stylesheet change | Ships a surface that ignores an accessibility preference the packet's own spec requires | 1/10 |

**Why this one**: it is the only option where the next body-mounted surface is covered by default
rather than by somebody remembering this page.

### Consequences

**What improves**: `prefers-reduced-motion: reduce` now actually reaches every `.db-surface`
descendant, whatever order its rules are written in. The motion tokens reach 38 declarations rather
than the handful in this phase's own files.

**What it costs**: a theme or a later rule can no longer opt a `.db-surface` descendant back into
motion under `reduce`. That is the intended reading of a reduced-motion reset, so it is a cost only
in the sense that it is now enforced.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A check measured a non-zero duration on a `.db-surface` under reduce and now reads zero | L | The whole gate was re-run after the change: 25 green, including `placement`, `sheet-grammar`, `sheet-teardown` and `sheet-rebuild`, which are the lanes that drive those surfaces |
| The 38-declaration sweep moves a capture | M | 554 captures recaptured; **0** moved `pixelHash`, Project Manager board and gantt references included |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The escape was measured at 0.2s under `reduce`, not argued |
| 2 | **Beyond Local Maxima?** | PASS | Four options scored, including the per-surface patch and doing nothing |
| 3 | **Sufficient?** | PASS | Covers every `.db-surface` descendant regardless of source order, which is the whole failure class |
| 4 | **Fits Goal?** | PASS | REQ-055-5 requires reduced-motion coverage for every touched surface |
| 5 | **Open Horizons?** | PASS | A later per-surface exception is still expressible; it just has to say `!important` and mean it |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: the `.db-surface` clause of the `prefers-reduced-motion` block in `styles.css`;
`tasks.md` T010's restraint; a lane row in `tools/storybook/verify-placement.mjs` that reads the
computed duration under both preferences so the escape cannot return silently.

**How to roll back**: remove the three `!important` keywords. The lane row goes red immediately,
which is how the defect was found in the first place.
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: The toast is not registered in `SURFACE_REGISTRY` until the role vocabulary has a member it fits

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Landing verification; ruled by the operator 2026-09-05 |

### Operator ruling (2026-09-05)

> ADR-007 → Accepted as "Add a sixth role 'feedback'": transient, non-focusing, timer-or-action
> dismissal, 384px width role; the registry and its lane rows cover toasts like every other
> surface.

This takes the fourth alternative below rather than the escalate-and-cover option the landing
recommended, and it is now the decision this ADR records.

---

### Context

`spec.md` §4's token map carries the row "Every new surface registers a `producer` id so the census
and CI find it", pointing at `design-system.md` §3, and adds "Toast is a `menu`-role surface for
dismissal and focus; severity is styling, not role". The L1 leg left the registration undone and
named it a gap. Taking it up means writing a `SurfaceProducerDefinition`, and that record's `role`
field is a literal from a closed five-member union whose semantics `design-system.md` §3 and
`SURFACE_ROLE_DEFAULTS` both define.

Measured against the component that shipped, the suggested role is wrong on all three of its
defaults. `menu` declares `dismissal: ["outside-pointerdown", "escape", "selection"]`,
`focusMode: "roving"` and a `fixed` width capped at **320px**. `showToast` installs no
outside-pointerdown handler and no Escape handler, takes no focus at all — it is `aria-live="polite"`
precisely so it does not interrupt — and the card measures **384px**, proven by the lane row added
in this landing. `dialog` is closer on dismissal and on `role-declared` width and still requires
`focusMode: "trapped"`, which a toast that trapped focus would be a defect for.

`surface-contract.ts`'s own registry comment settles what to do with that: "An entry that says
`bodyPortal` while the producer mounts into the container is worse than no entry: every check that
trusts the registry is then reasoning about a program that does not exist."

### Constraints

- `SurfaceRole` is consumed by `044`, `048`, `051`, `052` and `053`; adding a sixth member is a
  change to the shared vocabulary, not a local one.
- `design-system.md` §3 is the parent packet's contract, which this phase declares **through**.
- `verify-placement.mjs` iterates the registry, so a sixth producer arrives red until it is driven —
  by design, and correctly.

### Decision

**We chose**: add a sixth `SurfaceRole`, `feedback`, and register the toast under it.

Registering the toast under `menu` would have put three false claims into the one table whose
value is that it is true. The operator's ruling takes the option that keeps the table accurate
instead of leaving it incomplete: `feedback` declares its own defaults — dismissal by explicit
action or timeout, no focus, `role-declared` width — none of which borrow a number from `menu` or
`dialog`. `surface-contract.ts` carries the role and the registry entry; `verify-placement.mjs`
carries the opener its own registry-iteration lane requires; `design-system.md` §3 and this
packet's `spec.md` §4 carry the corrected row so the shared contract and the code agree.

**How it works**: the closed-registry test in `surface-contract.test.ts` was extended first and
observed red — six entries expected, five shipped — then the role, its defaults and the registry
entry landed together, and the same test went green. The registry-iteration lane in
`verify-placement.mjs` picked up the sixth entry the moment it existed and needed its own opener in
the same change, exactly as its own comment predicts for "a producer added tomorrow".

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| Escalate, cover by lane rows only | Nothing false enters the registry; the surface is still measured | The registry stays incomplete and `spec.md` §4 stays unsatisfied indefinitely | 8/10 |
| Register as `menu` per `spec.md` §4 | Closes the token-map row today | Three measurably false claims — dismissal, focus and a 384px surface under a 320px cap | 2/10 |
| Register as `dialog` | Right on dismissal and width | Still claims `focusMode: "trapped"`, which would be a defect if any consumer acted on it | 3/10 |
| **Add a sixth role (operator-ruled, chosen)** | Closes it properly — the table stays true and the toast stops being an exception | Changes a vocabulary five phases consume; needed the operator's authority to do, which it now has | 10/10 |

**Why this one**: the operator's ruling is the authority the landing itself named as missing —
"changes a vocabulary five phases consume, inside a landing, without the operator" was the objection
to this option, and the objection is the thing the ruling removes.

### Consequences

**What improves**: the registry keeps meaning what it says, and it now says something true about
all six surfaces rather than five. `spec.md` §4's registration row and `design-system.md` §3's role
table both close.

**What it costs**: `SurfaceRole` gained a sixth member, which every consumer of the closed union
(`044`, `048`, `051`, `052`, `053`) now sees. None of them exhaustively switches over the type today
— confirmed by grep before this landed — so the addition is additive, not breaking.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future exhaustive switch over `SurfaceRole` in another phase silently gets a seventh case it never asked for | L | The type is a closed union, so an exhaustive switch missing `feedback` is a compile error the moment one is added, not a silent gap |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The registration cannot be written without choosing a role, and every existing role was contradicted by the shipped component |
| 2 | **Beyond Local Maxima?** | PASS | Four options scored, including both ways of writing the entry under an existing role |
| 3 | **Sufficient?** | PASS | One role, its defaults and one registry entry close the gap completely, no lane-row workaround needed |
| 4 | **Fits Goal?** | PASS | Goal: name conflicts rather than resolve them silently — this ADR named the conflict and the operator resolved it |
| 5 | **Open Horizons?** | PASS | A seventh role remains just as available to a future surface that needs one |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/surface-contract.ts` — `feedback` added to `SurfaceRole`, `timeout` added to
  `SurfaceDismissal`, `none` added to `SurfaceFocusMode`, `SURFACE_ROLE_DEFAULTS.feedback` declared,
  `toast` added to `SurfaceProducerId` and registered in `SURFACE_REGISTRY`.
- `src/views/surface-contract.test.ts` — the closed-registry test extended to six entries and the
  role-defaults test extended for `feedback`, both observed red before the source change landed.
- `tools/storybook/verify-placement.mjs` — a `toast` opener in the registry-iteration lane.
- `specs/005-component-surface-system/design-system.md` §3 and this packet's `spec.md` §4 — the
  role table and the token map corrected to `feedback` in place of the contradicted `menu` claim.

**How to roll back**: revert this leg's commit. The registry entry, the role and its test extension
move together, so reverting returns the toast to unregistered rather than to a half-true entry.
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->

## ADR-008: A row deletion is not undoable, so the deletion toast carries no Undo until it is

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06, repair landed 2026-09-06 |
| **Deciders** | Landing verification; the removal ruled by the operator 2026-09-06; the repair landed by T018 |

### Operator ruling (2026-09-06)

> Remove the `action` from the two `deleteRow` toasts (the notice migrates to the shared surface
> with no Undo promise), and record deletion-undo as a new task plus a Proposed ADR naming the
> three wrong behaviours.

The removal is done and is not what stays Proposed. What stays Proposed is the repair: whether a
deletion earns its own history entry at all, and if so with what redo semantics. T018 carries it.

---

### Context

T003 routed all four owned notice call sites through the toast, and gave each of them an Undo wired
to `this.undoLastEdit()`. On two of them that is correct. On the two `notice.deletedRow` sites it
was not, and the defect is a whole-affordance one rather than an edge case.

Neither class records a deletion:

- `type HistoryEntry = CellHistoryEntry | ConfigHistoryEntry | CreatedHistoryEntry`
  (`database-view.ts:351`) and `type EmbedHistoryEntry` = `created | cell | moved`
  (`embedded-database-renderer.ts:150`). **There is no kind for a deletion in either union.**
- `deleteRow` calls `trashNote` and then `refreshAfterSave()`, which is three lines and only
  `refresh()` (`database-view.ts:11539`). It never calls `pushHistory`; the twelve call sites that
  do are all cell, config or created writes.
- `undoLastEdit` delegates to `replayHistory("undo")`, which replays `historyStack[0]`
  (`database-view.ts:10315`).

So the button offered on a deletion toast does one of three things, none of them the undo it
promises, and two of them destructive:

1. **The stack is empty** — it reports `notice.nothingToUndo`. The button was a lie, harmlessly.
2. **A `cells` or `config` entry is on top** — it reverts an *unrelated* edit the reader did not ask
   to undo, and the deleted row stays deleted.
3. **A `created` entry is on top** — `applyCreatedHistoryEntry` undoes a creation by calling
   `removeCreatedFile`, which **trashes that file** (`database-view.ts:10388`, `:10395-10402`). The
   reader creates a row, deletes a different row, presses Undo on the deletion toast, and loses the
   created row as well. One press, two deletions, zero undos.

Reachability is ordinary, not adversarial: create-then-delete is a normal editing minute, and the
stack holds fifteen entries.

The contrast that makes this a defect rather than a limitation is the sibling site. The gallery
migration sets `pendingUndoLabel` and calls `scheduleConfigSave()` before raising its toast
(`database-view.ts:2744-2755`), so a config entry exists for the replay to find. Its Undo works.
The deletion sites copied the affordance without the entry.

This was derived statically and cannot be run here: exercising a real deletion needs an Obsidian
`App`, vault and metadata cache, the same limit AC-002 already records. The derivation is complete
on its own terms, though — the entry kind does not exist, so no execution path can produce one.

Before this leg the site raised a bare `new Notice(t("notice.deletedRow"))`, and
`notice.deletedRow` is `"Deleted: {name}"` (`src/i18n.ts:1514`) — it promises no undo. The leg
therefore did not fail to improve the site; it moved it in the destructive direction.

---

### Decision

**Now:** the two `notice.deletedRow` toasts carry `severity` and `message` and no `action`. The
notice still migrates to the shared surface, which is what T003 was for, and `showToast` builds its
action row unconditionally while `.db-toast-actions:empty` hides it (`styles.css:2859`), so a
deletion toast renders with no stray gap — the shape the `chrome-toast-error` capture already shows.

**Decided, and landed (T018):** `deleteRow` in both classes now snapshots the file's content via
`cachedRead` before `trashNote` runs, pushes a `deleted` history entry carrying `{ path, content }`,
and the toast's Undo action is back, wired to `undoLastEdit()`. The three questions:

- **Restoring to the original path when something else now occupies it: yes, and the existing
  guard is the right one.** The standalone's `applyDeletedHistoryEntry` calls the same
  `restoreCreatedFile`/`removeCreatedFile` pair a created entry's undo/redo already calls —
  `restoreCreatedFile` already throws `Cannot redo create because the path already exists` when the
  target path is occupied, and reusing the function inherits that guard unchanged rather than
  writing a second one. The embed's own undo branch carries the equivalent check inline (it has no
  `restoreCreatedFile` helper to call), throwing `Cannot undo delete because the path already
  exists` for the same reason. Either way the failure surfaces through the existing generic error
  path (`errors.updateFailed`) rather than silently overwriting or renaming.
- **A bulk delete: out of this leg's scope, and the answer for when one lands is one entry, not
  many.** `deleteSelectedRows` (`database-view.ts`, the loop that trashes a selection) pushes no
  history today and this leg does not add any — T003/T018 name the two single-row `deleteRow`
  sites only. If a later leg gives it undo, it should push **one** entry carrying every deleted
  file's snapshot, mirroring `ConfigHistoryEntry.createdFiles`'s array shape, not N entries: N
  entries would let one Undo press restore only the most recently deleted file of the selection,
  silently leaving the rest deleted — a bulk action that reads to the person who triggered it as
  one thing should undo as one thing.
- **The standalone's `created` shape is the better model, confirmed by building both.** The
  embed's `moved` entry (`sourcePath`/`destPath`/`snapshot: LinkedViewMoveResult`) is specific to
  relocating a row between linked views and shares no structure with a deletion. Both classes'
  `deleted` entries instead mirror `created`'s `{ path, content }` snapshot exactly — the embed's
  own `created` entry has no `content` field because it never needed one (its `undoLastEdit` has no
  redo of any kind, for any entry type), so the embed's `deleted` entry carries `content` as a
  required field precisely because its own undo is where that snapshot gets consumed, while the
  standalone's `deleted` entry reuses `CreatedFileSnapshot` (`content` optional) since the same
  interface already models exactly this shape for its `created` counterpart.

**Verified at landing, and a fourth wrong behaviour found and closed.** The three above were
derived statically. They are now measured: `deletion-undo.test.ts` drives the shipped prototype
methods against an object whose prototype is the class and a vault double that holds bytes, so the
restore, the refusal, the stack order, the redo and the multi-row path are observations rather than
readings. Six of the seven hostile cases held on the code as landed. The seventh did not, and it is
the same defect this record was opened for, narrowed rather than removed: **the toast outlives the
entry it was raised for.** The card lives 2,200ms; anything pushed inside that window becomes
`historyStack[0]`, and a `created` entry there undoes by trashing the file it created. So a reader
who deletes a row, creates one, and then presses the Undo still sitting on the deletion toast loses
the row they just made — one press, two deletions, again. Watched failing before the repair.

The repair is the guard alternative 3 rejected, which is now the right one for a reason that did not
hold then: the top entry IS the deletion at the moment the button is built, so binding the button to
that entry by identity is meaningful where binding it to a type was not. Both classes' toasts now
call `undoDeletion(entry)`, which replays only while `historyStack[0] === entry` and otherwise
reports `notice.undoSuperseded` — a new key in all three locales, because `notice.nothingToUndo` is
false there: there is something to undo, just not this. Identity rather than type, so two deletions
in the same second stay two buttons that each own only their own entry.

**The embed's "redo" half of the threshold is inapplicable, not unmet.** `embedded-database-
renderer.ts`'s `undoLastEdit` has no redo mechanism at all — not for `created`, not for `cell`, not
for `moved`, confirmed by grep (`redo` does not occur in the file before this landing). T018's
threshold names "pressing Redo trashes it again" against the standalone class, where a redo stack
already exists for every other entry kind; extending redo to the embed would be a new capability
for every entry type, not a deletion-specific repair, and stays out of this leg's scope.

---

### Alternatives Considered

| # | Option | Score | Why not |
|---|--------|-------|---------|
| 1 | **Remove the action, record the repair** (chosen) | — | — |
| 2 | Leave the Undo and document the limitation | Rejected | A documented destructive button is still a destructive button, and the document is not in front of the reader who presses it |
| 3 | Guard the Undo on `historyStack[0]?.type` and hide it when the top entry is not the deletion | Rejected | The top entry is never the deletion, so the guard hides the button always — the same outcome through more code |
| 4 | Build the deletion history entry inside this leg | Rejected | A new entry kind, a content snapshot, redo semantics and tests across two classes is a feature, not the notice migration T003 scoped. Deferred to T018 rather than absorbed |
| 5 | Revert the whole deletion-site migration to `new Notice` | Rejected | Loses the shared surface for no safety gain: the bare notice and the action-less toast are equally undoless, and only one of them is the component this phase exists to adopt |

### Consequences

**Positive**: no press of any shipped control can now delete a second file; the two deletion sites
still gain the shared surface, its severity glyph and its keyboard-reachable close; the repair is
recorded as work rather than lost as a footnote.

**Negative**: a row deletion remains un-undoable, which is the state the plugin was already in and
which T018 now tracks rather than leaving implicit.

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| The Undo is re-attached later without the history entry landing first | L | T018's threshold names the entry and the button in one task, and its red-first control is exactly the create-then-delete sequence that fails today |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | A shipped button that trashes a second file is not a deferrable finding |
| 2 | **Beyond Local Maxima?** | PASS | Five options scored, including both "leave it and document" and "build it now" |
| 3 | **Sufficient?** | PASS | Removing the action closes the destructive path completely; nothing else in the leg depends on it |
| 4 | **Fits Goal?** | PASS | Goal: name conflicts rather than resolve them silently — the affordance is gone and the debt is a numbered task |
| 5 | **Open Horizons?** | PASS | T018 can add the entry and re-attach the button without revisiting this decision |

**Checks Summary**: 5/5 PASS

### Implementation

**What changed (T003, then T018 in the same landing):**
- `src/views/database-view.ts` — `deleteRow`'s toast lost its `action` (T003), then regained it
  (T018) once `deleteRow` reads the file's content before `trashNote`, pushes a `DeletedHistoryEntry`
  (a new member of `HistoryEntry`), and `applyDeletedHistoryEntry` restores on undo / re-trashes on
  redo by calling the same `restoreCreatedFile`/`removeCreatedFile` pair a created entry's undo
  already uses.
- `src/views/embedded-database-renderer.ts` — the same shape: `deleteRow` snapshots and pushes a
  `deleted` entry, `undoLastEdit` grew a branch that restores it with its own path-exists guard
  (this class has no `restoreCreatedFile` of its own to call), and the toast's Undo returned.
- `src/i18n.ts` — `undo.deleteRow` added (all three locales), the label the new entry's `label`
  field carries into `notice.undone`/`notice.redone`.
- `src/views/deletion-undo.test.ts` — new source-assertion suite (the same idiom `toast.test.ts`
  uses for a module a vault-less vitest run cannot mount): the read-before-trash order, the pushed
  entry, the re-attached action, and each class's undo/redo pair, for both classes. Confirmed red
  against `git show HEAD:src/views/database-view.ts` / `embedded-database-renderer.ts` (every
  assertion's marker string absent from the pre-landing tree) and green on the landed one (10/10).
- `tasks.md` — T003's body corrected; T018 closed.
- `acceptance-criteria.md` AC-002 and `checklist.md` C2 — the Undo/`nothingToUndo` claim updated to
  what the landed tree does.

**How to roll back**: revert this leg's `deleteRow`/`applyDeletedHistoryEntry`/`undoLastEdit`
changes in both files together with `DeletedHistoryEntry`'s addition to the union. Reverting only
the toast's `action:` property without reverting the history-entry plumbing would restore ADR-008's
original destructive path (an Undo that can trash a second file), which is exactly the state this
ADR exists to keep closed.
<!-- /ANCHOR:adr-008 -->

---

<!-- ANCHOR:adr-009 -->

## ADR-009: A deleted source is a third condition, and it gets its own empty state

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted — recorded here, built by a follow-up leg |
| **Date** | 2026-09-06 |
| **Deciders** | Operator ruling; recorded by the landing verification that found the contradiction |

### Operator ruling (2026-09-06)

> New "source missing" state

A distinct empty-state flavour with its own copy and a **"Choose database"** action. The other two
states keep their meaning.

---

### Context — two of this packet's own documents read one condition two ways

T005 and AC-005 both describe what a view renders when its source folder is missing or deleted, and
they disagree:

- **T005's reading:** it is `getEmptyStateReason`'s `sourceCount === 0` branch, which returns
  `no-matching-data` — the same reason a view whose source exists and matched nothing gets
  (`src/views/empty-state-renderer.ts:217`).
- **AC-005's reading:** it is `no-database`, the reason the hero path chooses for a view with no
  database at all (`src/views/empty-state-renderer.ts:318`).

Both readings are about the same condition and only one could be the threshold, so AC-005 could not
close on either without settling it by assertion. The row was escalated rather than picked.

### Decision

**Neither reading wins. Both are superseded.** A view whose source was deleted or is missing is a
*third* condition, and it renders a fourteenth `EmptyStateReason` of its own:

| Condition | Reason | Meaning after this ADR |
|---|---|---|
| The view names a source that no longer resolves | **the new source-missing flavour** | Its own copy, plus a **"Choose database"** action |
| The view never named a database | `no-database` | Unchanged |
| The source resolves and nothing matched | `no-matching-data` | Unchanged |

The two existing reasons keep their meaning exactly. What changes is that neither of them is asked
to carry a condition it was not written for — which is what produced the contradiction rather than
either document being careless.

### Red, measured on the landed tree (2026-09-06)

- `EmptyStateReason` holds **13** members and none is the source-missing flavour
  (`src/views/empty-state-renderer.ts:25-38`).
- `getEmptyStateReason` maps `diagnostics.sourceCount === 0` to `"no-matching-data"`
  (`src/views/empty-state-renderer.ts:217`), so a deleted source is today indistinguishable from a
  no-match view at the reason level.
- No **"Choose database"** action exists anywhere in `src/` (`rg -n "chooseDatabase|Choose database" src/`
  → no matches).

**Threshold:** `EmptyStateReason` gains a fourteenth member for the missing source; the copy names
the action rather than the absence; the card carries a primary **"Choose database"** action;
`getEmptyStateReason` routes `sourceCount === 0` there rather than to `no-matching-data`; and a lane
row asserts the three flavours are distinct, with a negative control that collapses two of them and
requires red. The `050` three-tier ladder places it at **tier 2** — a 48px illustration over one
primary-colour line — since it is an action-carrying state without a body paragraph.

### Scope — this ADR is a record, not an implementation

**Not built here.** The leg that recorded this ruling was a landing verification, and building a
fourteenth reason with its copy, its action wiring in both renderer classes, its i18n entries in
three locales and its lane row is a feature, not a reconciliation. It is the follow-up leg's, and
T005 carries it.

### Consequences

- **Positive:** AC-005's first clause becomes checkable. Two documents that could not both be right
  now describe the same three conditions.
- **Negative:** AC-005 and T005 both move *further* from Met than they read before — the row now
  owes a state that does not exist, where previously it owed a choice between two that do.
- **Neutral:** `group-relation-deleted`, AC-005's third clause, is unaffected; it landed
  2026-09-06 and stays landed.

### Implementation

**What changed here:** `tasks.md` T005 and `acceptance-criteria.md` AC-005, both rewritten off the
contradiction onto the new flavour with its threshold and its red value; `roadmap.md` §6A carries
the operator's words. No code.

**How to roll back**: delete this ADR and restore T005 and AC-005 to their contradicting readings —
which is the state this fixes, so there is nothing to preserve.
<!-- /ANCHOR:adr-009 -->

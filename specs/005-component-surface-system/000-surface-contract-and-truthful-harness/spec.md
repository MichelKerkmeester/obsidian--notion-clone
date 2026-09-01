---
title: "Feature Specification: Surface Contract and Truthful Harness"
description: "A typed surface handle owned by the interaction scope that already exists, with an explicit mount adapter, an owned token boundary and a logical anchor lease — plus harnesses that can actually show the defects the current ones hide by construction."
trigger_phrases:
  - "surface contract"
  - "openSurface factory"
  - "SurfaceHandle"
  - "token root"
  - "truthful harness"
  - "000 surface contract"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/000-surface-contract-and-truthful-harness"
    last_updated_at: "2026-08-29T18:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Adversarial-review remediation applied to criteria and stage order"
    next_safe_action: "Confirm 009 baseline, then run T0 assertion inversion"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-000"
      parent_session_id: null
    completion_pct: 20
    open_questions: []
    answered_questions: []
---
# Feature Specification: Surface Contract and Truthful Harness

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `009-live-verification`, successors
> `004-checkbox-ownership` and `001-overlay-placement-and-menu-language`. Root causes and
> measurements live in [`../architecture-findings.md`](../architecture-findings.md). The release gate
> that replays every phase's evidence together is `../008-integration-and-release-observability`.
>
> **`009` now runs before this phase.** An independent review found that this phase repairs the
> harness and then measures its own work through it — the circularity that produced 1.3.1. The
> running Obsidian is the one instrument this phase cannot influence, so `009` stands its live probe
> up first and every harness-repair claim here is cross-checked against it.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Four of the program's defects are one bug: a surface's appearance is decided by where it happened to
be mounted, and the surfaces that need design tokens mount outside every selector that declares
them. This phase introduces a typed surface handle that owns the mount point and the token carrier,
makes the cascade single-valued per context, and repairs harnesses that are structurally incapable
of failing.

**Key Decisions** *(the first was superseded — see the note below)*: `openSurface()` returns a typed
`SurfaceHandle` **owned by the interaction scope that already exists** — it extends `overlay-stack.ts` and `interaction-scope.ts` rather than
building a second global listener system beside them. Tokens travel as an **owned snapshot copied
onto the surface root**, never as plugin variables written to `body`, `documentElement` or an
Obsidian ancestor. The mount is an **explicit adapter** (`local | bodyPortal | shadowRoot |
topLayer`), declared, never inferred. The anchor is a **logical lease**, not an element reference.
And nothing is removed until the compatibility path has been proven equivalent.

**Superseded 2026-08-30: there is no `openSurface`.** The factory was deleted after measurement
showed it had zero importers, zero tests, and was absent from the shipped bundle — nothing imported
it, so the bundler dropped it. `src/views/surface-contract.ts` is live and was deliberately kept.
What the surfaces actually share today is `positionToolbarPopover` for placement and the sheet
module for phone presentation.

The decision is left standing rather than rewritten, because it was the real decision at the time
and the reasoning below still applies to the contract that replaced it. What was untrue was
presenting it as the current create path, which is what a reader arriving here would take it for.

**The instrument problem, and its fix.** This phase repairs the harness in Stage 1 and then asserts
its own criteria through that same repaired harness. A repair that is subtly wrong in a way that
makes every check pass is indistinguishable from a correct one when the harness is the only witness.
`009` supplies the second witness: the running app, measured through the Obsidian CLI's renderer
`eval`, which no edit in this phase can reach. **Every harness-repair claim here must agree with the
live probe on the same surface, and a disagreement is a blocking failure, not a preference.**

**Critical Dependencies**: `009-live-verification`'s probe transport, upstream — its live baseline is
what this phase's harness repairs are checked against. This phase then blocks every other spec in the
program. It holds the serialized `styles.css` lane alone for the token-root line and the dead-block
deletions.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 000-surface-contract-and-truthful-harness |
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | **In progress — 9 of 41 tasks** (`grep -c '^- \[x\]' tasks.md`). In the tree: `.db-surface` in the token-root selector list at `styles.css:33`, and the census instruments under `tools/live/`. `completion_pct` is **22**, derived from that task fraction rather than from criteria — this phase has no `goal.md` checklist for the rule in `../roadmap.md` §3.2 to count, so the figure is provisional until it gets one. It read **0** while nine of its own tasks were ticked |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `009-live-verification` — the independent instrument this phase's harness claims are checked against |
| **Successor** | `004-checkbox-ownership`, then `001-overlay-placement-and-menu-language` |
| **Blocks** | every other spec in the program |
| **Cross-check instrument** | `../009-live-verification` — the running app. Every harness number this phase produces for a surface the live probe can also reach must agree with it |
| **Release gate** | `../008-integration-and-release-observability` replays this phase's evidence after every later CSS change |
| **CSS lane** | holds `styles.css` for the token-root line and the dead-block deletions |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Four of the program's defects are one bug wearing different clothes: a surface's appearance is
decided by where it happened to be mounted, and the surfaces that need design tokens mount outside
every selector that declares them.

Measured: **29 of 29 probed overlay classes compute differently on `document.body` than inside
`.note-database-container`; 25 of 29 carry no tokens at all on body.** Menus therefore ship
square-cornered at 14px where the design says 8px radius and 13px.

The precise shape of it is sharper than "tokens are scoped". The token block declares **nine
selectors** (`styles.css:19-27`, first declaration at `:32`, block closing at `:125`), and **four of
the five body-portalled surfaces are in that list** — `.db-color-picker-popup`,
`.db-icon-picker-popover`, `.db-dropdown-popover`, `.db-cell-option-popover`. `.db-owned-menu` is
the one that was never added, and it is the one `createOwnedMenu` mounts on `document.body`
(`src/views/owned-menu.ts:56`). Five `var(--db-*)` uses on that subtree carry no fallback at all
(`styles.css:208`, `:225`, `:253`, `:266`, `:308`), so they resolve to nothing.

There is a second, independent split: **two dismissal systems already run side by side.**
`overlayStack` (`src/views/overlay-stack.ts`) is a LIFO, focus-restoring, per-`Document` registry
reached through the `installPopoverAutoClose` adapter (`src/views/popover-auto-close.ts:37`) at 25
call sites. `createOwnedMenu` uses neither it nor `InteractionScopeRegistry`; it installs its own
capture-phase `pointerdown` and `keydown` listeners on the document (`src/views/owned-menu.ts:138-139`)
for its 10 production callers. A menu opened over a popover is not in the same stack as the popover.

The harnesses cannot show any of this. Storybook wraps every story in `.note-database-container`
(`.storybook/preview.ts:55`); the screenshot fixtures do the same; no harness contains a
`.mobile-navbar`. **Every gate was structurally incapable of failing** — and one of them is worse
than blind. `tools/storybook/verify-placement.mjs:164-171` asserts `width > 320` for a widthless
caller and names it *"widthless caller still defaults wide (preset is the fix, not a global
change)"*. That check passes today, runs on every push (`.github/workflows/gates.yml:67`, step
*Popover and sheet geometry* → `npm run storybook:placement`), and **will fail when `001` removes the
520px default.** A gate that asserts the defect is correct is the most expensive kind of blindness,
because fixing the product turns the pipeline red and the cheapest reading of a red pipeline is to
revert the fix.

**Two harness defects are worse than "blind", and both were under-scoped before this revision.**

*The desktop page has no cascade at all.* `tools/storybook/verify-placement.mjs:220` is the only
`addStyleTag` call for `styles.css` and it targets the phone page. The desktop geometry checks at
`:130-178` therefore run against a document that has never loaded the stylesheet — they are measuring
a scaffold, not the product. This is the same structural substitution as the
`.note-database-container` wrapper, one level further out: a desktop criterion that passes today
says nothing about what a user sees.

*Four runtime-computed values are pinned, not one.* `tools/screenshots/runtime-vars.css` hardcodes:

| Variable | Pinned at | What the runtime actually does | Consequence in every capture |
|---|---|---|---|
| `--db-mobile-sheet-bottom` | `runtime-vars.css:43` → `0px` | computed in `src/views/popover-position.ts:115` from `view.innerHeight - bounds.bottom` | the single value the sheet defect lives in, pinned to its correct answer |
| `--db-header-height` | `runtime-vars.css:24` → `40px` | **never assigned anywhere in `src/`** — the sole consumer `styles.css:17698` takes its `34px` fallback in production | the capture shows a header offset the product never produces |
| `--db-card-field-width` | `runtime-vars.css:29` → `120px` | set conditionally in `src/views/card-field-renderer.ts:108` only when `options.fieldWidth != null`; 5 consumers in `styles.css` | the conditional branch is never exercised; both states render identically |
| `--db-timeline-row` | `runtime-vars.css:63` → `34px` | set in `src/views/calendar-timeline-renderer.ts:588` and `:660` as `String(rowIndex)` — a **unitless grid line index** | `styles.css:16316` and `:16554` resolve `grid-row: 34px`, which is invalid; every timeline band ever captured falls back to the initial value |

The last one is a type error, not a pinned number, and it makes **every timeline capture ever taken
structurally invalid**. No gate flagged it because `screenshots:verify` never opens an image — it
compares source fingerprints (`tools/screenshots/verify.mjs:45-48`, `:74`).

**And the fingerprint does not cover the harness.** `tools/screenshots/capture.mjs:205` fingerprints
`[...scenario.sources, "styles.css"]`. `runtime-vars.css`, `.storybook/preview.ts` and
`verify-placement.mjs` are in no scenario's `sources` list, so a harness change that alters what
every capture shows triggers no recapture and no staleness failure.

### Purpose

One typed handle owns where a floating surface mounts, what tokens it carries, and who dismisses
it — extending the ownership seam the repository already has rather than adding a second one. Every
harness can demonstrably fail, **and every harness repair is confirmed against an instrument this
phase cannot edit.** The rest of the program is then measured rather than assumed.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- **`openSurface()` returning a typed `SurfaceHandle`** — stable surface id, declared role, owning
  interaction scope and disposer, mount adapter, logical `AnchorRef` provider, dismissal policy and
  exclusivity group, owned token root and version, lifecycle telemetry.
- **A typed affordance registry** that every production surface birth is declared through, with the
  runtime birth observer that reconciles against it.
- **Extension of the existing ownership seam** — `overlayStack` and `InteractionScopeRegistry` gain
  the handle rather than being duplicated; `createOwnedMenu`'s private listener pair is retired onto
  the shared owner.
- **Mount adapters** — `local`, `bodyPortal`, `shadowRoot`, `topLayer`. `local` and `bodyPortal` are
  built here; `shadowRoot` and `topLayer` are declared, capability-gated and left opt-in with their
  own proofs.
- **The owned token boundary** — `.db-surface` joins the token-root selector list at
  `styles.css:19-27`, and a versioned snapshot of the resolved surface contract is copied onto the
  surface root so a portalled surface carries semantics rather than inheriting them.
- **The logical `AnchorRef` lease** and its state machine, with the DOM node as a render-epoch cache.
- Re-keying visual rules from ancestry to `[data-db-surface]`.
- Classification of all 87 duplicated selectors and 124 overridden values **by computed winner per
  context**, and deletion of the blocks that classification proves dead.
- Harness repairs: `.mobile-navbar` and safe-area inset, `styles.css` loaded in the **desktop**
  checks, **all four** pinned runtime values removed from `runtime-vars.css`, `Platform` and `Modal`
  unblocked in the Storybook stub, stories re-mounted at production positions.
- **Correcting `verify-placement.mjs`'s inverted assertion** so the harness stops certifying the
  520px default as intended behaviour. **This is the first change the phase makes**, before the
  census, before the cascade audit, before any product code.
- **The live cross-check against `../009-live-verification`.** For every surface both instruments can
  reach, the harness number and the live number are recorded as a pair and must agree.
- **Extending the capture fingerprint** to `tools/screenshots/runtime-vars.css`,
  `.storybook/preview.ts` and `tools/storybook/verify-placement.mjs`, so a harness change forces a
  recapture.
- **Content-addressed evidence from the first measurement.** Every criterion's recorded number
  carries the input hashes of the files it was measured against. This was `008`'s AC-010 and is moved
  here: it is cheap once, at the start, and impossible to reconstruct retroactively under release
  pressure.
- **A guard on the five borrowed-ancestor checkbox parents.** They work only because the call site
  classes their parent one line earlier and are otherwise unprotected until `004`.
- A CI scan that fails when a floating surface is created outside the factory, **proven by making it
  fail on a deliberately reintroduced bypass and pass when the bypass is removed.**
- **A blank-cell checker** that refuses to move any phase in this program from `Planned` to
  `In Progress` while a *census* or *trace* criterion has no recorded "today" value.

### Out of Scope

- The per-surface defects owned by later phases: overlay placement and menu grammar (`001`),
  the properties panel row grid (`002`), the sheet portal (`003`), the checkbox primitive (`004`),
  content-row rhythm (`005`) and the record open target (`006`). This phase supplies the contract
  they build on and fixes nothing they own.
- **Removal of any compatibility path.** Retirement of the legacy positioner and menu paths belongs
  to `008` after the integration replay, not here.
- Table render performance, formula editor layout and output number format — already fixed or on
  the earlier track, per the parent spec.

### Files to Change

The complete list is a deliverable of the Stage-2 census (T8/T9), because static analysis provably
misses surfaces here. The files known before the census are:

| File Path | Change Type | Description |
|---|---|---|
| `src/views/surface.ts` | Create | `openSurface()`, `SurfaceHandle`, the typed role union, the mount adapters and the token-snapshot writer |
| `src/views/surface-registry.ts` | Create | The typed affordance registry and the development-time birth observer |
| `src/views/overlay-stack.ts` | Modify | Accept a `SurfaceHandle` as the registered unit; keep the LIFO, per-`Document` keying and focus restore that already work |
| `src/views/interaction-scope.ts` | Modify | The scope becomes the surface owner; `addPortal` is fed by the mount adapter instead of by call sites |
| `src/views/popover-auto-close.ts` | Modify | Becomes the compatibility shim over `openSurface()` for its 25 existing call sites |
| `src/views/owned-menu.ts` | Modify | `createOwnedMenu` mounts through the adapter and registers with the shared owner; its private capture-phase listeners (`:138-139`) are retired |
| `src/views/popover-position.ts` | Modify | `positionToolbarPopover` becomes the placement implementation behind the handle; no behaviour change in this phase |
| `styles.css` | Modify | Add `.db-surface` to the token-root selector list at `styles.css:19-27` (the block's first declaration is at `:32`); delete the blocks the cascade audit proves dead; re-key visual rules to `[data-db-surface]` |
| `tools/screenshots/runtime-vars.css` | Modify | Delete **all four** pinned runtime values — `--db-mobile-sheet-bottom` (`:43`), `--db-header-height` (`:24`), `--db-card-field-width` (`:29`), `--db-timeline-row` (`:63`, the grid-line-index type error) — so captures reflect what the runtime computes or its declared fallback |
| `tools/storybook/verify-placement.mjs` | Modify | **First: invert the widthless-caller assertion at `:164-171`.** Then add `.mobile-navbar`, safe-area inset, leaf stacking contexts, sidebar states; load `styles.css` on the desktop page beside the existing phone-only load at `:220` |
| `tools/screenshots/capture.mjs` | Modify | Extend the forced fingerprint set at `:205` beyond `styles.css` to `runtime-vars.css`, `.storybook/preview.ts` and `verify-placement.mjs` |
| `.storybook/preview.ts` | Modify | Stories mount at production positions rather than inside `.note-database-container` (`:55`) |
| `tools/storybook/obsidian-stub.mjs` | Modify | Unblock `Platform` and `Modal` so touch paths and modal surfaces become renderable |
| CI contract scan | Create | Fail when a floating surface is created outside the factory |
| Harness pinning scan | Create | Fail when any harness file assigns a value the runtime computes; enumerate the four known cases as its first fixtures |
| Live cross-check runner | Create | Pair every harness number with `009`'s live number for the same surface; a disagreement fails |
| Evidence input-hash recorder | Create | Content-address every recorded criterion measurement against the files it was taken from; `008` consumes it for temporal validity |
| Checkbox-parent guard | Create | Fail when any of the five borrowed-ancestor checkbox call sites stops classing its parent |
| Blank-cell checker | Create | Refuse a `Planned` → `In Progress` transition while any *census* or *trace* criterion has an empty "today" cell |

### Inventory Method

**Not grep.** Static analysis provably misses surfaces here — five modules are already invisible to
the story-coverage gate because its regex only matches `export function create*/render*`, and
construction is distributed across factories, callback-time branches and dynamic host selection
(`src/views/dropdown-field.ts:187-195`, `:379-389`).

Three deliberately different sets, in this order of authority:

1. **The typed registry is the declaration authority.** Every production construction route requires
   a literal role, producer id, mount policy and anchor policy, so omission is a compile error after
   migration.
2. **AST discovery is a source projection.** It finds call sites and dynamic construction patterns.
   It is never allowed to certify runtime completeness.
3. **A development browser observer records every surface-root birth and close** at the factory and
   mount boundary — registry id, role, producer, mount, owner, document, terminal event.

The exhaustive test is an **equality**, not a count selected by diligence: every observed root has a
registry id, every registry entry births exactly one root at its declared mount, every handle has
exactly one terminal close, and every difference between AST discovery and the registry carries an
explicit disposition. A raw-mount negative control must make that test fail.

### Citation Rule

**This phase invalidates every `styles.css` line number cited anywhere in the program.** The cascade
audit reclassifies 87 duplicated selectors and the dead-block list is handed to `008`; `styles.css`
is 19,261 lines and every subsequent phase edits it. A human reading a stale number will grep for the
symbol; an autonomous agent may trust the number and edit the wrong line.

From this phase onward, a citation to a mutable file names **the selector, symbol or literal, plus
the command that finds it** — `styles.css § .db-owned-menu .db-menu-item` (`rg -n '\.db-owned-menu
\.db-menu-item' styles.css`) rather than `styles.css:258`. A bare line number is acceptable only for
a file this program does not edit, and even then it is written beside its symbol. Line numbers
already recorded as *measurements* stay verbatim — they are evidence of what was read on a dated
tree, not navigation aids — and this phase does not rewrite them.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One way to create a floating surface, and it returns a handle.** `openSurface()` is the
  only path. It returns a typed `SurfaceHandle` carrying a stable id, a declared role, its owning
  scope and disposer, its mount adapter, its `AnchorRef` provider, its dismissal policy and
  exclusivity group, its token root and version, and lifecycle telemetry for open, reconcile,
  dismiss, close and owner teardown. `data-db-surface` is the inspectable marker and `.db-surface`
  the style boundary; **neither is the contract**, and a role is declared, never derived from a class.

- **REQ-002 — Tokens follow the surface, not the ancestry.** `.db-surface` joins the token-root
  selector list at `styles.css:19-27`. For a portalled surface the adapter additionally copies a
  **versioned snapshot** of the resolved contract onto the surface root — semantic background and
  foreground, border, shadow, radius, density, layer, environment insets. Plugin variables are never
  written to `body`, `documentElement` or an Obsidian ancestor. A theme change refreshes the snapshot
  of every open surface.

- **REQ-003 — Visual rules key off role, never ancestry.** Every rule addresses `[data-db-surface]`.
  The current grammar — where a row's `display: flex` lives on its container's class
  (`styles.css:258`) — is the documented trap and is retired. Parent-derived selectors may remain as
  **compatibility inputs with a named removal plan**; they may not remain authoritative, because a
  surface that is both parent-variant and role-declared will style contradictorily as the factory
  scales.

- **REQ-004 — The cascade is made single-valued per context.** "Single-valued" means **one intentional
  winner in each active cascade context**, not one global declaration for a selector whose roles,
  mounts, themes, media queries or states legitimately differ. Each of the 87 duplicated selectors
  and 124 overridden values is classified as intentional context variant, canonical duplicate, dead
  rule, or **unknown** — and unknown is a release blocker, not permission to keep the last
  declaration.

- **REQ-005 — Harnesses mount subjects where production mounts them.** Storybook stories render at
  their real mount point. The screenshot fixtures stop hardcoding runtime-computed values. The
  browser harness gains a `.mobile-navbar`, a safe-area inset, leaf stacking contexts, sidebar
  states, and loads `styles.css` for the desktop checks. **The widthless-caller assertion at
  `verify-placement.mjs:164-171` is inverted**, because a harness that certifies the 520px default is
  not neutral about `001` — it blocks it.

- **REQ-006 — Every harness check must be able to fail.** For each assertion, deleting the thing under
  test from the harness DOM must change an asserted number — and, beyond deletion, **substituting any
  single coordinate of the proof tuple** (producer, runtime branch, mount/host, environment,
  transition, semantic identity) must fail a value assertion.

- **REQ-007 — The contract is enforced, not documented.** A CI scan fails when a floating surface is
  created outside the factory, and the runtime birth observer fails the suite on a raw mount. A
  registry developers can bypass is documentation, not an inventory. **The scan is accepted on its
  behaviour, never on its existence**: it must be shown exiting non-zero on a deliberately
  reintroduced bypass and exiting 0 once that bypass is removed, in that order, with both exit
  statuses read. "A CI check exists" is a mechanism claim of exactly the shape every 1.3.1 criterion
  had.

- **REQ-008 — One ownership seam, extended rather than duplicated.** The handle registers through the
  `overlayStack` and `InteractionScopeRegistry` that already exist. `overlayStack`'s LIFO ordering,
  per-`Document` keying and focus restore are kept; `InteractionScopeRegistry`'s three-way
  containment — `root.contains`, registered portals, and `portalSelectors` via `closest()` — becomes
  how a portalled surface stays inside its owner. `createOwnedMenu`'s private capture-phase listener
  pair (`src/views/owned-menu.ts:138-139`) is retired onto the shared owner. **No second global
  listener system is created.** Exactly one dismissal, scroll, keyboard and focus owner per surface.

- **REQ-009 — The mount is an explicit adapter, never an inference.** `local | bodyPortal | shadowRoot
  | topLayer` is declared by the call site. `bodyPortal` requires the token snapshot of REQ-002.
  `shadowRoot` requires the adapter to deliver the plugin's owned style contract into that root, with
  ownership and lifetime following the adapter. `topLayer` is opted into explicitly and never selected
  because the browser happens to support the Popover API: it changes stacking, light-dismiss, focus
  and event semantics at once, and each role needs its own accessibility and fallback proof first.

- **REQ-010 — The anchor is a logical lease, not an element.** `AnchorRef` carries logical scope, row
  path / cell key / event key, role, and any stable record identity. The current DOM node is a
  **render-epoch cache**, re-resolved at each renderer commit. States are
  `open → anchored(A) → anchor-missing(pending) → anchored(B) → close`, with a **bounded** pending
  window; retaining the last rectangle indefinitely is worse than closing, because it leaves an
  actionable-looking surface detached from its semantic target. Owner teardown always releases the
  lease, its listeners, scroll and keyboard suppression, token resources and portal nodes. A
  per-surface `MutationObserver` is not the ownership model — renderer commit and scope teardown are.

- **REQ-011 — Compatibility first; removal is somebody else's phase.** `openSurface()` lands as an
  **adapter over** `positionToolbarPopover` and `OwnedMenuHandle`, preserving legacy geometry,
  classes, selectors, interaction-scope portals and menu handles, and registering lifecycle once.
  Nothing is deleted in this phase. Retirement of a compatibility path happens one disposition at a
  time, in `008`, after the full integration replay, registry equality, capture review and operator
  review pass — with a byte-exact checkpoint to restore on any regression.

- **REQ-012 — Every harness-repair claim is corroborated by the live probe.** For each surface that
  both `../009-live-verification`'s probe and the repaired browser harness can reach, the two
  instruments are run on the same tree and their numbers recorded as a pair. **They must agree within
  the criterion's own threshold. A disagreement is a blocking failure of this phase**, resolved by
  finding which instrument is wrong — never by preferring the convenient one. The cross-check runs
  after Stage 1 and before any later stage trusts a harness number, because a harness this phase
  repaired cannot be its own witness. Where the live probe structurally cannot reach a surface — a
  phone-only branch, a CI-only context — that surface is listed as *uncorroborated* with the reason,
  and the list is an exit artefact, not an omission.

- **REQ-013 — The assertion that certifies the defect is inverted first.** `verify-placement.mjs:164-171`
  runs on every push through `.github/workflows/gates.yml:67`. Inverting it is this phase's **first
  task**, before the census, the cascade audit and any product change. **Rebase risk is explicit:**
  the inversion is a four-line change in a file `001`, `002`, `003` and `005` all touch, and a
  careless rebase or a conflict resolved toward `main` silently restores the assertion. The
  inversion therefore ships with a check that fails when the old predicate returns, and that check is
  itself demonstrated failing against the pre-inversion file.

- **REQ-014 — The desktop page loads the stylesheet, and a desktop number moves because of it.**
  `verify-placement.mjs:220` loads `styles.css` on the phone page only; the desktop checks at
  `:130-178` run with no cascade. Loading it on the desktop page is necessary and not sufficient:
  **at least one desktop measurement must change as a result, and the before and after values are
  both recorded.** A repair that changes no number did not repair anything — it moved a file and left
  the blindness in place.

- **REQ-015 — No harness pins a value the runtime computes, and the enumeration is by name.** All
  four pinned variables are removed in Stage 1, each named: `--db-mobile-sheet-bottom`
  (`runtime-vars.css:43`), `--db-header-height` (`:24`), `--db-card-field-width` (`:29`) and
  `--db-timeline-row` (`:63`). The last is a **type error**, not a wrong number: the runtime assigns
  it a unitless grid line index (`calendar-timeline-renderer.ts:588`, `:660`), and `styles.css:16316`
  and `:16554` consume it as `grid-row: var(--db-timeline-row, 1)`, so `34px` is invalid and every
  timeline capture ever taken is void. Beyond the four, a scan asserts that **no harness file assigns
  any custom property the runtime also assigns**, so this class of defect cannot return under a new
  name. The capture fingerprint (`capture.mjs:205`) is extended to `runtime-vars.css`,
  `.storybook/preview.ts` and `verify-placement.mjs` so a harness change forces a recapture.

- **REQ-016 — Evidence is content-addressed from the first measurement.** Every criterion value
  recorded by any phase carries the hashes of the inputs it was measured against — `styles.css`, the
  harness files, the producer sources. This is recorded **here, once, cheaply, at the point of
  measurement**; `008` consumes it for the temporal-validity gate its AC-010 owns rather than
  inventing the capability last, under release pressure, as the most loaded phase in the program.
  Without it a passing number proves only that some tree once produced it.

- **REQ-017 — The five borrowed-ancestor checkbox parents cannot silently stop being classed.** Five
  checkbox inputs are created classless and are styled only because their call site adds a class to
  their parent one line earlier: `table-renderer.ts:514` and `:785`, `cell-renderer.ts:489`,
  `card-field-renderer.ts:184`, `record-detail-panel.ts:339`. `004` owns the fix; between this phase
  and `004` they are unprotected, and `004` and `005` both unblock from here, so a wrapper change in
  either could break them with no failing test. A guard in this phase fails when any of those five
  parents stops carrying its class.

- **REQ-018 — Registry equality and the anchor lease are named exit criteria with named consumers.**
  Both are load-bearing for downstream phases and neither was previously gated at a handoff. Registry
  equality (AC-008) is an exit criterion of this phase **consumed by `001`**, which migrates surfaces
  against it and would otherwise begin against an incomplete inventory. The `AnchorRef` lease (AC-009)
  is an exit criterion **consumed by `003`**, whose sheet fix is built on it and which would otherwise
  discover a partial implementation after committing to it. Neither may be traded for the earlier
  A1/A2/A7 subset at a handoff.

- **REQ-019 — No criterion enters work with a blank failing number.** Every *census* and *trace*
  criterion states **what artefact will produce its number and at which stage**, in the criterion
  itself. A checker owned by this phase refuses to move any phase in this program from `Planned` to
  `In Progress` while a "today" cell is empty. The doctrine already said a blank cell blocks
  acceptance; prose is not a gate, and an eager implementer can satisfy a threshold without ever
  learning what the value was before.

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Each is measured on the real renderer at the production mount point, and each currently fails. The
full table — thresholds, proof-tuple coverage and the negative control for each row — is
[`acceptance-criteria.md`](acceptance-criteria.md).

| # | Requirement | Criterion | Measured today |
|---|---|---|---|
| **A1** | REQ-002, REQ-003 | Computed `border-radius`, `padding`, `font-size` and `box-shadow` at each surface's production mount point equal the values it computes inside `.note-database-container` | **29/29 differ** |
| **A2** | REQ-002 | `--db-radius-lg` resolves non-empty on every element the plugin creates | **empty on 25/29** |
| **A3** | REQ-004 | Zero selectors declare conflicting values for the same property in one cascade context, and zero contexts are unknown | **87 selectors, 124 conflicts** |
| **A4** | REQ-005, REQ-006 | Deleting `.mobile-navbar` from the harness changes at least one asserted number | moves the offset **1.35px** — i.e. nothing |
| **A5** | REQ-005, REQ-015 | No harness pins a value the runtime computes — **all four named** — and none asserts a defect is correct | `runtime-vars.css` pins `--db-mobile-sheet-bottom: 0px` (`:43`), `--db-header-height: 40px` (`:24`), `--db-card-field-width: 120px` (`:29`), `--db-timeline-row: 34px` (`:63`, a length where `styles.css:16316`/`:16554` need a grid line index); `verify-placement.mjs:164-171` asserts the 520px default is intended |
| **A6** | REQ-005 | Every module creating a user-visible surface is covered by a story or exempt with a written reason | **5 modules structurally invisible to the gate** |
| **A7** | REQ-001, REQ-007 | The contract scan **exits non-zero on a deliberately reintroduced bypass and exits 0 once it is removed** — proven in that order, both exit statuses read | no such check exists, so neither exit status has ever been observed |
| **A8** | REQ-001, REQ-008, REQ-018 | Registry equality: every observed surface root is registered, every registry entry births exactly one root at its declared mount. **Exit criterion consumed by `001`** | *census* — no registry exists. **Produced by:** the Stage-2 birth-observer log reconciled against the typed registry, at Stage 2, re-run at Stage 6 |
| **A9** | REQ-010, REQ-005, REQ-018 | A surface survives a wholesale refresh by logical identity and re-anchors. **Exit criterion consumed by `003`** | *trace* — no harness performs a transition. **Produced by:** the Stage-5 anchor-lease transition harness driving `refresh()` under an open surface, at Stage 5 |
| **A10** | REQ-006 | Substituting any one proof-tuple coordinate fails a value assertion | no such control exists |
| **A11** | REQ-012 | Every harness number this phase records for a surface `009`'s probe can also reach is paired with the live number and they agree; the uncorroborated set is named with reasons | *trace* — no live pair exists. **Produced by:** the cross-check runner joining the Stage-1 harness output against `009`'s recorded probe run, at Stage 1.5 |
| **A12** | REQ-013 | CI fails on the pre-inversion `wr.width > 320` predicate and passes on the inverted one; a rebase that restores the old predicate is caught | the old predicate is live and green today at `verify-placement.mjs:170`, running on every push via `.github/workflows/gates.yml:67` |
| **A13** | REQ-014 | The desktop page loads `styles.css`, **and at least one desktop measurement changes because of it**, before and after both recorded | `verify-placement.mjs:220` loads it on the phone page only; the desktop checks at `:130-178` run with no cascade, so no desktop number has ever been cascade-dependent |
| **A14** | REQ-015 | No harness file assigns any custom property the runtime also assigns | 4 known violations, enumerated in A5; the general scan does not exist. **Produced by:** the harness pinning scan, at Stage 1 |
| **A15** | REQ-015, REQ-016 | The capture fingerprint covers the harness: editing `runtime-vars.css`, `.storybook/preview.ts` or `verify-placement.mjs` makes `screenshots:verify` report stale | `capture.mjs:205` fingerprints `[...scenario.sources, "styles.css"]` only, and no scenario lists a harness file, so all three edits are invisible |
| **A16** | REQ-016 | Every recorded criterion value carries the input hashes of the files it was measured against | *census* — nothing records input hashes today, so every existing green result is of unknown vintage. **Produced by:** the input-hash recorder wrapping the measurement writer, at Stage 1, consumed by `008`'s AC-010 |
| **A17** | REQ-017 | The five borrowed-ancestor checkbox parents still carry their class; removing one fails the guard | 5 sites unguarded — `table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`, `record-detail-panel.ts:339`. **Produced by:** the checkbox-parent guard, at Stage 2 |
| **A18** | REQ-019 | No phase in this program moves from `Planned` to `In Progress` with a blank *census* or *trace* "today" cell | the rule is prose in every phase's `acceptance-criteria.md` and nothing enforces it. **Produced by:** the blank-cell checker, at Stage 1 |

**A criterion is not accepted until its failing number is recorded here from the current tree.**
**A *census* or *trace* row must additionally name what will produce its number and at which stage**
— a blank cell with no named producer is not a deferred measurement, it is an unowned one.

### Acceptance Scenarios

1. **Given** a surface created through `openSurface()` and mounted on `document.body`, **when** its
   computed style is read, **then** `--db-radius-lg` resolves non-empty and the radius, padding,
   font-size and shadow match the values it computes inside `.note-database-container`.
2. **Given** the browser harness with `.mobile-navbar` removed from its DOM, **when** the geometry
   checks run, **then** an asserted number moves by more than the 1.35px fallback artefact.
3. **Given** a floating surface created outside `openSurface()`, **when** CI runs, **then** the
   contract scan exits non-zero; **and given** that bypass is then removed, **when** CI reruns,
   **then** the scan exits 0 — both statuses read, in that order.
3a. **Given** the pre-inversion `wr.width > 320` predicate restored by a rebase, **when** CI runs,
   **then** the guard on the inversion fails and names the restored predicate.
3b. **Given** the desktop page now loading `styles.css`, **when** the desktop geometry checks run,
   **then** at least one measurement differs from its pre-load value, and both values are recorded.
3c. **Given** a harness number and `009`'s live number for the same surface, **when** the
   cross-check runs, **then** they agree within the criterion's threshold, or the run fails and
   names which instrument is under investigation.
4. **Given** a fixture that appends a surface-shaped node directly to `document.body`, **when** the
   registry reconciliation runs, **then** it reports an unregistered root and fails.
5. **Given** an open surface whose producing view is refreshed wholesale, **when** the renderer
   commits, **then** the handle re-resolves its `AnchorRef`, enters `anchored(B)`, and a subsequent
   viewport resize still repositions it.
6. **Given** an open surface and a theme change, **when** the theme is applied, **then** the surface's
   owned token snapshot is refreshed and no plugin variable has been written to `documentElement`.
7. **Given** a menu opened over a popover, **when** Escape is pressed, **then** exactly one surface
   closes — the innermost — and focus returns to its trigger.

### Verification

- **Live cross-check** — `../009-live-verification`'s probe, run against the same tree, on every
  surface it can reach. This is the phase's independent instrument and the only one it cannot edit;
  it runs before any later stage trusts a harness number.
- **Measured tests** — browser harness, at both mount points, with the navbar and safe-area present.
- **Negative controls** — each check demonstrated to fail before it is trusted, by deletion **and** by
  single-coordinate substitution.
- **Screenshots** — full recapture after the token-root change, with a human reviewing the diff.
- **Storybook** — stories re-mounted at production positions; the stub's `Platform` and `Modal`
  unblocked so touch paths and modal surfaces become renderable at all.
- **Integration replay** — `008` re-runs this phase's whole matrix after every later stylesheet lane
  holder, because no phase can know a later edit preserved its result.
- **Research gate** — if A1 or A2 resists twice without a new hypothesis, read AnyType and AppFlowy
  under `external/` for how they scope design tokens to portalled surfaces. Behaviour only.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

The token-root line touches every surface at once, and the dead-block deletions touch a stylesheet
with a documented history of silent reversal. Both land in the serialized CSS lane, in one spec,
with a full recapture and human review — which is precisely why no other spec may hold the file
concurrently.

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `../009-live-verification`'s probe transport | Without a second instrument this phase measures its own repair through the thing it repaired | `009` runs first. REQ-012's cross-check is a gate, not a courtesy; where the probe cannot reach, the surface is listed as uncorroborated rather than silently assumed |
| Dependency | Serialized `styles.css` lane | No other spec may hold the file while this one runs | This phase runs first among the CSS holders and alone; the lane is released only after the full recapture and human review |
| Risk | **The harness repair is subtly wrong in a way that makes everything pass** | The 1.3.1 failure exactly, in a new wrapper: every criterion green, the defect intact | REQ-012. The live probe is outside this phase's edit reach, so a repair cannot make it agree by construction. A disagreement blocks |
| Risk | A rebase restores `verify-placement.mjs`'s old `wr.width > 320` predicate | CI silently returns to certifying the defect, and `001` is blocked again | REQ-013 ships a guard that fails on the old predicate, demonstrated failing against the pre-inversion file before it is trusted |
| Risk | The desktop stylesheet load changes no measurement | The repair is cosmetic and the desktop checks stay structurally irrelevant | REQ-014 requires a moved number with before and after both recorded; an unchanged number fails the criterion |
| Risk | A *census* or *trace* criterion is worked without its failing number | A passing threshold proves the number is in range, not that anything moved — the class-name trap in numerical clothing | REQ-019's checker blocks the `Planned` → `In Progress` transition; every such row names its producing artefact and stage |
| Dependency | Browser harness (`vitest` runs `environment: "node"`, no jsdom) | Every DOM assertion must live in the browser harness or it cannot exist | Stage 1 repairs the harness before any product code changes |
| Risk | Two dismissal systems already coexist | Wrapping them badly produces a third | REQ-008: the handle registers **through** `overlayStack` and `InteractionScopeRegistry`; `owned-menu.ts`'s private listeners are retired onto them, not paralleled |
| Risk | The stylesheet reverses itself: 87 duplicated selectors, 124 overridden values | A "fixed" value is silently overwritten by a later block | Every deletion is justified by a Stage-3 audit entry recorded verbatim before removal, and by a computed-winner replay at a real mount |
| Risk | The token root touches every surface simultaneously | A single line changes the appearance of all 29 probed classes at once | Intentional; the alternative leaves the two-population problem in place for months. Contained by the serialized lane, the full recapture and the human review |
| Risk | Token leakage into the host app | `.db-surface` on `document.body` could expose plugin tokens beyond the plugin | The owned snapshot in REQ-002 is the containment: the surface root carries values, the host roots are never written. Rollback reverts Stage 4 and Stage 5 together |
| Risk | `verify-placement.mjs` currently asserts the 520px default is intended | Fixing `001` turns CI red on a check that was always wrong | REQ-005 and REQ-013 invert the assertion as this phase's **first** task, before the census, the audit and any product change |
| Risk | Every timeline capture is void and nobody knows | `--db-timeline-row: 34px` resolves an invalid `grid-row`, so a reviewer must separate a pre-existing broken layout from a real regression on every timeline PNG | REQ-015 removes it in Stage 1, before the baseline every later phase measures against is recorded |
| Risk | A harness change silently alters every capture | The fingerprint covers `styles.css` only, so a `runtime-vars.css` or `preview.ts` edit triggers no recapture | REQ-015 extends the fingerprint set; A15 proves each of the three edits now reports stale |
| Risk | The five borrowed-ancestor checkboxes break between this phase and `004` | `004` and `005` both unblock here, and either could change a wrapper with no failing test | REQ-017's guard fails when any of the five parents stops being classed |
| Risk | A later phase's CSS edit silently reverses this phase's result | The token root passes here and is dead by release | `008` owns the cross-phase replay; no child phase may declare the system safe alone |

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The `createDiv` instrumentation shim and the runtime birth observer are development
  builds only and are excluded from the production bundle; no census code ships.
- **NFR-P02**: `openSurface()` adds no listener the existing positioner, overlay stack and interaction
  scope did not already own. The net listener count after migration must not exceed the pre-migration
  count.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are
  AGPL/source-available against this plugin's MIT, so no code, CSS value or token scale is copied.
- **NFR-S03**: No plugin variable, class or attribute is written to `document.body`,
  `document.documentElement`, or any Obsidian-owned ancestor. Host isolation is asserted, not assumed.

### Reliability

- **NFR-R01**: Each stage is separately revertable and lands as its own commit.
- **NFR-R02**: Deleted CSS blocks are recorded verbatim in the cascade audit before removal, so
  restoration is a copy rather than an archaeology exercise. A byte-exact checkpoint of `styles.css`
  is taken before the lane is opened and retired only after `008` is green.
- **NFR-R03**: Desktop behaviour is unchanged except where the token root corrects a value the
  design already specified.

---

## 8. EDGE CASES

### Data Boundaries

- A surface created before the token root exists must still resolve its tokens; the factory and the
  token root land in the same stage for that reason.
- A surface mounted on `document.body` is the case every current harness excludes by construction —
  it is the one that must be covered first.
- A surface open across a theme change must re-snapshot rather than keep a stale palette.

### Error Scenarios

- A block classified "dead" that is in fact live shows up only in the recapture. The human review of
  changed PNGs, not `screenshots:verify`, is the check for this.
- A harness assertion that cannot fail passes silently. REQ-006 makes the negative control a
  precondition for trusting any number in Section 5.
- A harness assertion that certifies a defect fails loudly at exactly the wrong moment. `verify-placement.mjs:164-171`
  is that case and is corrected here, first.
- An `AnchorRef` that cannot be resolved after the bounded pending window closes the surface or
  enters a declared fallback. It never retains the last rectangle.
- **The live probe and the repaired harness disagree.** Neither wins by default. The run fails, the
  pair is recorded, and the investigation names which instrument is wrong before either number is
  used. Preferring the convenient one is how this program's founding failure was produced.
- **The live probe cannot reach a surface at all** — a phone-only branch, a CI-only context, a
  surface with no production trigger in the testbed. It is recorded as *uncorroborated* with the
  reason, and that list is an exit artefact. Silence is not corroboration.
- **A pinned harness value is removed and a capture changes dramatically.** That is the expected
  outcome for the timeline captures, whose bands have been resolving an invalid `grid-row` since the
  variable was pinned. The recapture diff is large by construction and must be reviewed as a
  correction, not treated as a regression.

### State Transitions

- Deleting CSS before migrating callers would strand surfaces; Stage 6 migrates, and only `008`
  deletes.
- Both creation paths coexist throughout this phase by design. The census in Stage 2 is rerun in
  Stage 6 to prove the registry is complete before the CI scan is switched on.
- `anchored(A) → anchor-missing(pending) → anchored(B)` must be observed as three distinct states,
  not collapsed into "still open".

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 25/25 | Typed handle and registry, four mount adapters, token snapshot, anchor lease, one token-root line, 87 duplicated selectors, 124 conflicts, 33 positioner sites, 11 menus, two existing ownership systems to merge, five harness surfaces, four pinned harness variables, the live cross-check runner, the input-hash recorder, the checkbox-parent guard and the blank-cell checker |
| Risk | 24/25 | Serialized CSS lane; a stylesheet with a documented history of silent reversal; every surface changes at once; a CI assertion that currently certifies the defect and can be restored by a rebase; a harness this phase repairs and then measures through |
| Research | 14/20 | Root causes already measured in `../architecture-findings.md`; the architecture is settled by `../007-architecture-research`; the census is instrumentation, not investigation |
| Multi-Agent | 8/15 | Single lane by construction — the CSS file cannot be shared |
| Coordination | 15/15 | Consumes `009`'s live instrument, blocks all six sibling phases, hands registry equality to `001`, the anchor lease to `003`, and the replay and input-hash obligations to `008` |
| **Total** | **86/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | A deleted "dead" CSS block was live | H | M | Verbatim audit entry per deletion; computed-winner replay at a real mount; full recapture with human review of changed PNGs |
| R-002 | The token root leaks plugin tokens into the host app | H | L | The owned snapshot writes only to the surface root; NFR-S03 asserts host isolation; revert Stage 4 and Stage 5 together |
| R-003 | The census misses a surface that neither grep nor the scripted drive reaches | M | M | Registry equality plus the raw-mount negative control; the CI scan in REQ-007 catches later reintroductions; census rerun in Stage 6 |
| R-004 | A repaired harness check still cannot fail | H | M | REQ-006 negative control per assertion — deletion **and** single-coordinate substitution — recorded in `checklist.md` |
| R-005 | `screenshots:verify` passes on a regenerated capture nobody looked at | H | M | The gate is the human review of changed PNGs, not the command's exit code |
| R-006 | Wrapping two dismissal systems produces a third | H | M | REQ-008: extend, never parallel; the owner count in `acceptance-criteria.md` AC-011 is the check |
| R-007 | Inverting the `verify-placement.mjs` assertion masks a real containment regression | M | L | The inverted check keeps the sidebar-clearance assertion beside it; both run |
| R-008 | The harness repair is wrong in a way that makes every check pass | H | M | REQ-012's live cross-check against `009`, an instrument this phase cannot edit; a disagreement blocks |
| R-009 | A rebase restores the `wr.width > 320` predicate after the inversion lands | M | M | REQ-013's guard on the old predicate, demonstrated failing against the pre-inversion file |
| R-010 | The desktop `styles.css` load lands but moves no number | M | M | REQ-014 requires a changed desktop measurement with both values recorded; an unchanged number fails A13 |
| R-011 | Input-hash recording is deferred to `008` and then dropped under release pressure | H | M | REQ-016 moves it here, where it is one wrapper around the measurement writer rather than a retroactive reconstruction |
| R-012 | One of the five borrowed-ancestor checkbox parents loses its class before `004` runs | M | M | REQ-017's guard; the five sites are enumerated by file and line in the criterion |
| R-013 | A phase starts work with blank *census*/*trace* cells and closes on thresholds alone | H | M | REQ-019's checker blocks the status transition; every such row names its producing artefact and stage |

---

## 11. USER STORIES

### US-001: Tokens follow the surface (Priority: P0)

**As a** plugin user, **I want** menus and popovers to look the way the design specifies wherever
they open, **so that** the product does not ship square-cornered 14px menus where it promised 8px
radius and 13px.

**Acceptance Criteria**:
1. Given a surface at its production mount point, When its computed style is read, Then radius,
   padding, font-size and shadow equal the values it computes inside `.note-database-container` (A1).
2. Given any element the plugin creates, When `--db-radius-lg` is resolved, Then it is non-empty (A2).

### US-002: Gates that can fail (Priority: P0)

**As a** maintainer, **I want** every harness assertion to be demonstrated failing before it is
trusted, **so that** a green run is evidence rather than theatre.

**Acceptance Criteria**:
1. Given any geometry check, When its subject is deleted from the harness DOM, Then an asserted
   number moves (A4, REQ-006).
2. Given the harness, When it is inspected for pinned values and inverted assertions, Then none of
   the four named runtime-computed values is hardcoded and no check certifies a defect (A5, A14).

### US-004: A second instrument (Priority: P0)

**As a** maintainer, **I want** the repaired harness confirmed against the running app, **so that** a
repair that is subtly wrong cannot certify itself.

**Acceptance Criteria**:
1. Given a surface both instruments can reach, When the harness and `009`'s live probe are run on the
   same tree, Then their numbers are recorded as a pair and agree (A11, REQ-012).
2. Given a surface the live probe cannot reach, When the cross-check runs, Then that surface appears
   in the uncorroborated list with its reason, rather than being absent from the record.

### US-003: A surface that survives its view (Priority: P0)

**As a** plugin user, **I want** an open panel to keep working after the view behind it re-renders,
**so that** editing a second field does not silently break the panel's placement.

**Acceptance Criteria**:
1. Given an open surface, When the producing view refreshes wholesale, Then the handle re-resolves
   its `AnchorRef` and enters `anchored(B)` (A9, REQ-010).
2. Given a surface whose logical anchor cannot be resolved, When the bounded pending window expires,
   Then the surface closes or enters its declared fallback rather than retaining a stale rectangle.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- How far does `.db-surface` on `document.body` leak plugin tokens into the host app? The rollback
  in Section 6 exists because this cannot be settled from source; it needs the Stage-4 measurement.
- Which of the 87 duplicated selectors are intentional context variants rather than duplicates?
  Stage 3 answers this by computed-winner classification; the count of genuinely intentional
  variants is not knowable before that audit runs.
- Which roles, if any, should ever opt into `topLayer`? REQ-009 makes it declarable and forbids
  silent adoption; the per-role accessibility and fallback proof is `008`'s to run.
- How many of this phase's surfaces can `009`'s live probe actually reach? The uncorroborated set is
  a REQ-012 exit artefact and its size is not knowable before `009`'s Phase 3 probes exist. If it
  turns out to be most of them, the cross-check is weaker than this spec assumes and that is a
  finding worth having at Stage 1.5 rather than at release.
- Which desktop measurement moves when `styles.css` loads on the desktop page? REQ-014 requires one;
  which one is a measurement, and if none moves, the desktop checks were measuring something the
  cascade never touched and the repair is larger than a stylesheet load.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Root causes and measurements**: [`../architecture-findings.md`](../architecture-findings.md)
- **Independent instrument (predecessor)**: [`../009-live-verification/spec.md`](../009-live-verification/spec.md)
- **Review this revision answers**: [`../adversarial-review.md`](../adversarial-review.md)
- **Release gate**: [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)
- **Design system**: [`../design-system.md`](../design-system.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`

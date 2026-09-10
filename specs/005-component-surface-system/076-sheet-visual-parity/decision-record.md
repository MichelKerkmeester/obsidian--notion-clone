---
title: "Decision Record: Sheet Visual Parity"
description: "The four decisions that bind every child: the image judge is a required gate, a target spec binds every production surface of a grammar, reference precedence, and one sheet at a time in order."
trigger_phrases:
  - "076 decision record"
  - "image judge gate"
  - "sheet parity reference precedence"
  - "076 D1 D2 D3 D4"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Recorded D1-D4 at scaffold: judge gate, every surface, precedence, order"
    next_safe_action: "001's DEFINE step applies D3's precedence to pick its references"
    blockers: []
    key_files:
      - "spec.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "076-sheet-visual-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "D3's top rung is empty until the operator's C-1..C-6 and settings captures arrive"
    answered_questions:
      - "The lane is the floor, not the ceiling: no sheet closes on lane evidence alone (D1)"
      - "A sheet's target binds every production surface that renders its grammar, not just the renderer it is named after (D2)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- SPECKIT_LEVEL: phase -->

# Decision Record: Sheet Visual Parity

These four bind every child. A child may not vary them; a child that needs to vary one raises it
here first.

---

<!-- ANCHOR:d1 -->
## D1: The image judge is a required gate. Lanes alone never close a sheet.

**Decision.** A child is closed in-repo only when a reviewer has opened our capture and the
reference side by side and scored the eight-row rubric in `spec.md` §5 at **≥ 14/16 with no row at
0**, twice consecutively on an unchanged tree. A DOM lane is a **floor** — it stops a landed value
from drifting — and is never sufficient evidence that a surface looks right.

**Why, in one measured case.** `071/009` set its target as *"**≤4** interactive controls per row"*
and its lane measured **3**. Both numbers are correct. The picture that lane was guarding —
`screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png`, rewritten by
`8f11b642` *after* the `4f345718` row rebuild landed, so it is current — still shows every row as
**↑ ↓ · filled blue checkbox · type icon · label**. The producer confirms it:
`src/views/record-surface/property-row.ts:405-411` sets `arrow-up` and `arrow-down`; `:417` calls
`createCheckbox`. Notion's row, read this session off
`screenshots/notion/ios/flows/hiding-properties/`, is **drag handle · type icon · label · eye
icon** — four elements, which is also ≤ 4.

The target encoded the **count** of controls and never their **identity**, so the lane could go
green while the sheet stayed the sheet the operator complains about. Every rubric row in §5 is
written about identity, order and appearance for exactly this reason.

**What this costs.** A judged gate is slower and less deterministic than a lane. That is accepted:
the failure it prevents — nine children landing green against an operator who sees no change — has
already happened once, and cost more.

**What it does not do.** It does not replace the operator. Gate (c) is the operator's own read on
their own phone, and **no agent ticks that row**.
<!-- /ANCHOR:d1 -->

---

<!-- ANCHOR:d2 -->
## D2: A sheet's target spec binds every production surface that renders its grammar — and every scenario must mount production.

**Decision.** Two clauses, and the second is the weaker one only because it is already satisfied.

**(a) Every surface, not just the named renderer.** When a child defines a row grammar, that
definition binds **every** shipped producer that paints the same concept. A child's DEFINE step
must enumerate them before its PLAN step names files.

The case: `071/008` (`64af87ee`) stacked the filter condition onto its own rows and
`constructed-filter-panel-mobile-light.png` shows exactly that. `64af87ee` touched the
`constructed-filter-panel*` captures and nothing else. The **active-rule popover** —
`src/views/active-rule-popover-renderer.ts`, mounted by the `constructed-active-rule-filter`
scenario through the harness's `scenario.renderer === "active-rule-popover"` branch — renders the
same filter condition from a different producer, was never named by any `071` child, and still
paints one row of three dropdowns. So does its sort twin. That is why `003` and `004` each own two
producers rather than one.

**(b) A scenario must photograph the production mount path.** A capture used as parity evidence
must come from a scenario that mounts the shipped renderer, not hand-written fixture markup.

**This clause is already satisfied for all eleven sheets, and it is recorded so it stays true.**
Audited this session: all fifty-nine `CONSTRUCTED_SCENARIOS` mount the shipped renderers through
`runRenderAssertions`, every one of the eleven sheets has one, and every `panel-*` / `chrome-*` /
`field-*` fixture that duplicates a sheet declares `fixtureOf` pointing at an existing constructed
scenario. Nine fixtures have no constructed counterpart — the two record-detail title-currency
variants, the computed-cleanup / invalid-events / base-import modals, the selection status bar, the
two toasts and table-load-more — and **none is one of the eleven**. Any child that finds an
unregistered production surface registers it as its **first** task.
<!-- /ANCHOR:d2 -->

---

<!-- ANCHOR:d3 -->
## D3: Reference precedence — operator capture > Notion iOS full-res > Mobbin thumbnail > Anytype. D15 is preserved.

**Decision.** When two references disagree about a sheet, the higher rung wins:

| Rung | Source | State today |
|---|---|---|
| 1 | The operator's own full-resolution device capture | **Empty.** C-1..C-6 and one settings-sheet capture are requested and not yet supplied |
| 2 | A full-resolution Notion iOS capture | **Empty.** No full-resolution Notion iOS asset exists in this repository |
| 3 | A Mobbin Notion iOS thumbnail, **299×678** | Populated — `screenshots/notion/ios/**`, re-verified with `sips` this session |
| 4 | Anytype research and captures | Populated — `047` research, `screenshots/anytype/**` |

**The binding consequence of rungs 1 and 2 being empty:** every child works from rung 3, so **no
numeric threshold in this packet may be derived from a reference asset**. A thumbnail is read
**structurally** — which rows, in what order, grouped how, with which leading icon and which
trailing element — and every number in a child's target table is measured from our own tree or
marked `TBD — needs operator capture`. When a rung-1 capture arrives, the child targeting that
sheet re-opens its DEFINE step against it.

**A reader that cannot read a value says so.** The three reference reads taken this session each
returned explicit gaps rather than guesses, and those gaps are binding on the children that inherit
them:

- **Notion's AND/OR conjunction control was never observed.** Every filter capture shows a
  single-condition state. `003` may not claim a Notion position on conjunction placement.
- **Notion's sort-rule reorder affordance was never observed.** Only single-rule states were
  captured. `004` may not claim one, and `071/012` ADR-001's Notion half stays PROVISIONAL.
- **Notion's grouped Shown/Hidden result screen was never captured.** `005` may not build a
  shown/hidden partition *against Notion*; if it builds one, the justification is our own
  internal consistency with `009`'s properties vocabulary, and it is recorded as such.

**D15 is preserved.** A Notion refinement is additive. Where a target here contradicts a landed
Anytype ruling, it becomes a **Proposed ADR** in `roadmap.md` §7 and is not applied by a child.
<!-- /ANCHOR:d3 -->

---

<!-- ANCHOR:d4 -->
## D4: One sheet at a time, in order, and 001 — the settings sheet — is first.

**Decision.** The eleven children run sequentially in their numbered order. A child does not start
until the previous child's image judge has passed twice on an unchanged tree.

**`001` is the settings sheet because the operator named it** — twice. Row 74: *"Also settings
sheet has really bad ui. Actually all sheets should mimic notion way closer"*. Row 84: *"Settings
sheet still has bad ui overall and needs strict alignment with notion sheets"*. It is the sheet
with the largest gap to its reference, and it is the sheet whose vocabulary the other ten inherit:
Notion's **View options** sheet is the table of contents that `Layout`, `Properties`, `Filter`,
`Sort` and `Group` all hang off, so the card grammar `001` settles is the grammar `003`-`006` are
measured against.

**Why sequential rather than parallel**, given eleven independent renderers. The operator's ruling
asks for *"step by step"*, and the mechanism supports it: the children share `styles.css` — which
this repository serialises through a css-lane acquire/edit/release triplet, one holder at a time —
and they share the row vocabulary `001` establishes. Two children redesigning rows at once would
each pass alone and conflict merged, which is the failure `071/012`'s own T009 merge check was
written to catch after the fact. Sequencing prevents it instead.
<!-- /ANCHOR:d4 -->

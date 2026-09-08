---
title: "Decision Record: Phone Toolbar Labelled Buttons"
description: "ADR-001: the phone toolbar's filter/sort/group/columns/settings/more controls gain icon+label buttons; desktop and the embedded/codeblock toolbar keep their existing icon-only row unchanged."
trigger_phrases:
  - "075 decision record"
  - "phone toolbar label decision"
  - "desktop toolbar label decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/075-toolbar-labelled-buttons"
    last_updated_at: "2026-09-08T09:46:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded ADR-001 on the desktop-vs-phone label scope"
    next_safe_action: "None — the ADR is decided and implemented"
    blockers: []
    key_files:
      - "src/views/toolbar-primitives.ts"
      - "src/views/toolbar-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "075-toolbar-labelled-buttons-implementation"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "Desktop keeps its existing icon-only toolbar; only the full phone view's row gains labels"
---

# Decision Record: Phone Toolbar Labelled Buttons

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Does the desktop toolbar also gain labels, or does it stay icon-only? (REQ-005)

**Status: DECIDED — 2026-09-08 (implementation leg, run 3).**

### Context

The operator's directive ("Lets have these style of buttons for sort filter etc") was illustrated by
a phone screenshot of an Obsidian Bases calendar toolbar — one row of icon+text buttons ("Sort",
"Filter", "Properties", "New"). The follow-up ("For mobile add horizontal overflow if it doesnt fit")
names mobile explicitly. Neither instruction says anything about the desktop toolbar, leaving REQ-005
open: does the desktop row (and the embedded/codeblock toolbar, which shares the same button
primitives) also gain labels, or does it stay as it ships today?

Run-1's findings (recorded in the gitignored `.handover.md`) already leaned toward "desktop stays
icon-only" without finalizing it. This ADR finalizes that lean with the reasoning behind it.

### Decision

**Desktop and the embedded/codeblock toolbar keep their existing icon-only row, unchanged.** Only the
full phone view's toolbar (`.is-phone`) shows the new icon+label buttons for filter, sort, group,
columns, settings and utilities ("more"). The `.obnotion-toolbar-control-label` span is present in the
DOM at every width (so its text can double as the accessible name's source without a second lookup),
but its base rule is `display: none`; only the `.is-phone`-scoped rule turns it on. Desktop's own
34-year-old convention of "tooltip on hover" — a phone cannot offer, since there is no hover — is left
to do the identification work it already does today.

### Evidence

- **Notion (desktop web, `screenshots/notion/web/`)**: the database toolbar's Filter/Sort/Properties
  controls are icon-only, revealing their name only on hover — the same tooltip-on-demand pattern
  this plugin's desktop toolbar already implements via `setTooltip` on every one of these six
  controls. Notion's own *mobile* web view is what carries a labelled row (the operator's own
  reference is exactly that surface, captured on `obsidianstats.com`'s Bases calendar rather than
  Notion directly, but the pattern — label on touch, icon-only with hover on desktop — is Notion's).
- **Anytype (desktop, `screenshots/anytype/desktop/`)**: the object header's view-control row is
  icon-only as well; Anytype reserves visible labels for its sidebar navigation and primary actions,
  not for a dense per-view control rail.
- **Bases (the operator's own reference)**: is a phone capture. Nothing in it speaks to Bases' own
  desktop toolbar, so it supports the phone side of this decision and is silent on the desktop side.

All three references agree that a dense, per-view control rail goes icon-only wherever a mouse can
hover for the name and labelled wherever it cannot — which is exactly the phone/desktop split this
ADR keeps.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Label everywhere (phone and desktop)** | One shared code path, no per-surface branching in the primitives | Contradicts all three references' own desktop treatment; the embedded/codeblock toolbar's collapse ladder (`toolbar-collapse-sweep.ts`, sourced from packets `009`/`044`) is calibrated end-to-end for a fixed icon-only button width across a 250-900px sweep — retrofitting labels means re-deriving every one of that ladder's switch points, a materially larger and separately-scoped redesign REQ-001..003 never asked for |
| **Icon-only everywhere (do nothing)** | No decision needed | Ignores the operator's explicit, illustrated request for the phone row |
| **Phone labelled, desktop unchanged (chosen)** | Matches the operator's own phone-scoped request and D1's phone-scoped "never wrap or collapse" ruling; leaves the desktop collapse ladder's existing, gate-verified behaviour (`toolbar-collapse-sweep`, `sheet-grammar`) untouched and re-runs green with zero changes; matches all three cited references' own phone-vs-desktop split | Two presentations of the same six controls to reason about, though both already shared `createControlClusterButton`/`createIconButton` before this packet |

### Consequences

- `appendToolbarControlLabel` (new, `toolbar-primitives.ts`) is called from `createControlClusterButton`
  (filter/sort/columns) and from three `toolbar-renderer.ts` call sites (settings, utilities/"more",
  group) — the same six controls REQ-001 names, no more.
- `run-toolbar-collapse-sweep.mjs` (the `009` lane) and `sheet-grammar.mjs` (the `044` lane) needed no
  behavioural change: both mount the embedded/desktop shape, which this ADR leaves untouched, and both
  reran green with identical switch points before and after the phone-only edit — confirmed by
  rerunning each rather than assumed.
- If the operator later wants the desktop row labelled too, that is a new decision: it changes the
  collapse ladder's own fixed points and needs a fresh sweep baseline, not an extension of this one.
<!-- /ANCHOR:adr-001 -->

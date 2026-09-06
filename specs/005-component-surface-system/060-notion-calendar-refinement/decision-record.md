---
title: "Decision Record: Notion Calendar Refinement"
description: "Seven decisions: one adoption, four declines a landed Anytype ruling already settles, and two routed to surfaces this packet does not own."
trigger_phrases:
  - "060 decision record"
  - "notion calendar adr"
  - "all-day strip range adr"
  - "notion vs anytype calendar decline"
  - "calendar picker touch floor adr"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/060-notion-calendar-refinement"
    last_updated_at: "2026-09-06T16:45:00Z"
    last_updated_by: "opus-synthesis"
    recent_action: "Opened seven ADRs from the calendar research loop: five Accepted, two Proposed"
    next_safe_action: "Route ADR-006 and ADR-007 to their owners; neither gates this packet's two legs"
    blockers: []
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/data/calendar-date-time.ts"
      - "styles.css"
      - "specs/005-component-surface-system/057-calendar-anytype-parity/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-060-decisions"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-006: which of Notion's three contradictory range presentations, if any, a range picker adopts"
      - "ADR-007: whether the picker's today marker unifies with the month grid's filled disc"
    answered_questions:
      - "ADR-002: the week start is settled - the operator ruled Monday and it landed"
---
# Decision Record: Notion Calendar Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

**How to read the status column.** `goal.md` D1 and D5 set the rule: a Notion-versus-Anytype conflict
that a landed operator ruling already decides is **Accepted**, citing that ruling; one that belongs to
a surface this packet does not own is **Proposed** and is routed by name rather than answered. Five
rows are Accepted - one adoption and four declines. Two are Proposed, and neither gates a code leg here.

The research loop's conflict register (`../057-calendar-anytype-parity/research/research.md` §7)
carries two named conflicts. The four declines below cover both of those plus the two the loop
recorded under Eliminated Alternatives with the same structure. ADR-005 is the loop's single
adoption; ADR-006 and ADR-007 are the two rows it deliberately routed elsewhere.

---

<!-- ANCHOR:decisions -->

## ADR-001: Notion's boxed-pill chip does not reopen the flat chip

**Status**: **Accepted** - the landed ruling stands. `057` A3, `roadmap.md` §7.12, `005` `goal.md` D15.
**Date**: 2026-09-06 | **Deciders**: the operator's standing Anytype-parity ruling; recorded here.

### Context

`420ef2f0` shows "Creative pipeline" chips as boxed pills - "a visible light-grey fill and a rounded
border, a small leading page-icon, left-aligned text" (`057/notion-screens-digest.md:100`; pattern P4
at `:173-180`). Ours is flat by ruling: `border: 0; border-radius: 0; background: none`
(`styles.css:17081-17110`). This is the harvest's most visually striking difference, which is exactly
why it needs a written decision rather than a silence.

### Decision

**We chose**: decline the pill, keep the flat chip.

**How it works**: nothing changes. `.db-calendar-month-segment` keeps its zeroed fill and border.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Decline (chosen)** | Honors a landed ruling; no WCAG ground exists to override it under `057` ADR-004 | Loses a chip affordance some users may find clearer | 9/10 |
| Adopt the pill | Matches one Notion database's rendering | Notion does not apply it consistently - `23cdb6d5`'s single-day entries are "plain left-aligned text with no visible fill" (`:101`), and P4 says outright that the presentation "is not fixed" (`:178-180`). The setting that produces the pill is absent from all 40 screens (`:331-334`) | 2/10 |

**Why this one**: the digest's own section 5 states the posture - "Anytype's ruling is landed; Notion
disagrees; do not let this reopen it quietly" (`:284-292`). Adopting a variant the reference itself
applies inconsistently, on a cause nobody has observed, to override a measured ruling, is three
weaknesses stacked.

### Consequences

**What improves**: the flat-chip ruling stays a ruling rather than becoming a default that erodes.

**What it costs**: nothing measurable. One half of P4 is already ours - the leading record icon
(`calendar-renderer.ts:422`, `renderRecordIcon`) - so the only unadopted element is the fill and border pair.

**Reopening path**: a fresh operator ruling naming digest section 5 and P4, the way `057` ADR-002 named
the week-and-day question.

---

## ADR-002: The week starts Monday; Notion's Sunday is declined on the record

**Status**: **Accepted** - already ruled and landed. `057` ADR-007, `057` G7 `Met`.
**Date**: 2026-09-06 | **Deciders**: the operator.

### Context

Notion is Sunday-start in six frames across four unrelated databases and both pickers
(`057/notion-screens-digest.md:147-153`, pattern P1). Anytype is Monday in all twenty of its captures
(`057/design-trueup.md` section 2c). The research loop found the cost is **symmetric**: the tree it
read shipped **Sunday**, so the ruling flips us away from one reference either way. That framing arrived
after the operator had already ruled.

### Decision

**We chose**: Monday, unconditionally, for any unset config.

**How it works**: `getLocaleWeekStartsOn` returns `1` when `calendarFirstDayOfWeek` is unset; the locale
fallback is gone, and the comment carries the reasoning (`src/data/calendar-date-time.ts:172-180`). The
setting remains a user override at `auto/0/1/6` (`calendar-toolbar-renderer.ts`).

### Consequences

**What improves**: one convention across every scale and both pickers; the weekend tint lands on columns
6 and 7, which is what `057` G7 measures.

**What it costs**: divergence from Notion on a convention six of its frames agree on. Recorded, not hidden.

**Why this ADR exists at all**: to keep the loop's counter-evidence attached to the decision. A future
reader who finds six Notion frames showing Sunday should find this row rather than reopen the question.

---

## ADR-003: The two-signal drop target stays; Notion's single flat fill is declined

**Status**: **Accepted** - WCAG, the only ground `057` ADR-004 admits.
**Date**: 2026-09-06 | **Deciders**: `057` ADR-004's standing rule.

### Context

`1c3f11f8` shows Notion's mid-drag drop target as "a flat, uniform fill across the whole cell - not a
border or an outline" (`057/notion-screens-digest.md:102`). Ours paints a fill **and** a ring:
`color-mix` event background plus a 2px inset accent ring on resize (`styles.css:17219-17222`), and a
9-10% accent fill plus a 1px 34% accent outline on drop (`:16606-16617`).

### Decision

**We chose**: keep the two-signal state; record Notion's frame as corroboration that a distinct target
state is expected at all.

**How it works**: nothing changes. The state's *existence* is now reference-backed; its *strength* is ours.

### Consequences

**What improves**: the boundary keeps a >= 3:1 non-text contrast signal, which a ~10% accent wash alone
does not carry.

**What it costs**: a deviation from the reference, which `057` ADR-004 permits precisely on this ground.

---

## ADR-004: The today disc keeps `#216DFA`; Notion's red is a brand accent, not a gap

**Status**: **Accepted**. `057` R4, `057` G7-adjacent, digest section 5.
**Date**: 2026-09-06 | **Deciders**: recorded from the landed contrast work.

### Context

Notion marks today as a filled brand-coloured disc on the day numeral, never a cell wash, in every
frame that shows it (`057/notion-screens-digest.md:155-161`, pattern P2). Its hue is red; Anytype's is
`#3C7FFB`; ours is `#216DFA`. The digest rules the hue difference "each product's brand accent, not a
disagreement" (`:307-311`).

### Decision

**We chose**: keep the measured disc - 26x24px, `#216DFA`, white 16px numeral, 4.53:1
(`styles.css:16522-16533`).

**How it works**: nothing changes. P2 corroborates the *shape* we already ship and says nothing about
the hue that our own WCAG work did not already settle.

### Consequences

**What improves**: the contrast figure stays the reason the value is what it is.

**What it costs**: nothing. This row exists so a reader who notices Notion's red does not read it as an
unadopted finding.

---

## ADR-005: The in-grid multi-day bar stops printing its own date range

**Status**: **Accepted** - the one adoption. Extends `057` P0-3's landed month-grid decision to the
scale it did not reach.
**Date**: 2026-09-06 | **Deciders**: this packet, under `goal.md` D1 (Anytype is silent, so no ruling is
overridden).

### Context

Eleven weeks of one real multi-day entry (`23cdb6d5` -> `1c3f11f8` -> `132e14f0`;
`057/notion-screens-digest.md:163-171`) show a per-week-clipped continuous bar that never prints a
`start-end` string on or beside it. Anytype captured no multi-day event at all
(`057/design-trueup.md` C5), so Notion is the only reference with evidence here.

`057` P0-3 already rebuilt the **month grid** to one chip per covered day with no inline range - the
renderer says so in its own comment, "No date-range text renders in the grid: it lives in the chip's
own title tooltip (`getSegmentTitle`) and in the day popover" (`src/views/calendar-renderer.ts:417-425`).
The **week and day all-day strip** was not part of that leg and still emits the string
(`calendar-renderer.ts:862-864`), so the same event now reads two different ways at two scales. The
`:has()` flex band-aid that bounded the string's crowding is still in the stylesheet
(`styles.css:17381-17383`), and no `is-mobile` rule hides the string, while its sibling time prefix is
hidden on mobile at `styles.css:17777`.

### Decision

**We chose**: remove the emission from the all-day strip at every breakpoint, and keep the range where
Notion also keeps it - out of the grid.

**How it works**: delete the guarded `createSpan` at `calendar-renderer.ts:862-864`. `getSegmentTitle`
still composes the range into the chip's `title`; the day popover (`:628`), the overflow popover (`:930`)
and the drag ghost (`:1483`, `:1498`) are untouched, because none of them is an in-grid resting chip.
Then retire whatever CSS the removal makes inert, verified by rendering the popovers rather than by
reading the diff.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Remove at every breakpoint (chosen)** | One shape at every scale; matches both the reference and our own landed month grid | Loses an at-a-glance range for a user scanning the week without hovering | 9/10 |
| Hide it on the phone only | Smallest diff | Splits one defect into two fixes and leaves the desktop inconsistent with the month grid it sits next to | 2/10 |
| Keep it everywhere | No work | Leaves the surface reading two ways for one event, and keeps a band-aid whose own comment calls it interim | 3/10 |

**Why this one**: the month grid has shipped without the string since P0-3 and no report followed. The
all-day strip is the only in-grid producer left, and consistency across scales is worth more than a
range a tooltip and two popovers already carry.

### Consequences

**What improves**: `057` G3's "chip left ink at 10 +/- 1px in every column, single-day and spanning
alike" becomes true at the week and day scales too, not only in the month grid.

**What it costs**: a hover or a popover is now required to read the exact range from the week scale.
Mitigation: the `title` tooltip is unchanged and reaches assistive technology.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The `:has()` rule is retired while a popover still needs it | M | Render both popovers before deleting; they share `.db-calendar-month-segment` |
| A user relies on the in-grid range | L | The month grid already shipped without it; the tooltip and popovers keep it |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The surface reads two ways for one event today; observed at `calendar-renderer.ts:862` against `:417-425` |
| 2 | **Beyond Local Maxima?** | PASS | Three options weighed above, including the phone-only patch the research explicitly refused |
| 3 | **Sufficient?** | PASS | One deletion plus the CSS it makes inert; no new abstraction |
| 4 | **Fits Goal?** | PASS | `goal.md` C1; the packet's only P0 renderer change |
| 5 | **Open Horizons?** | PASS | Leaves the tooltip and both popovers as the range's home, which is where a future range affordance would live |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `src/views/calendar-renderer.ts` (one emission site), `styles.css:17361-17383`
(whatever the removal orphans), `src/views/calendar-pinned-values.test.ts` (one pin, one negative control).

**How to roll back**: revert the packet's implementation commit; the pin disappears with it rather than
failing, and no persisted shape changes.

---

## ADR-006: Range shading in a date picker is not decided here

**Status**: **Proposed** - routed to the record and cell editor's owner.
**Date**: 2026-09-06 | **Deciders**: pending, not this packet's.

### Context

Three frames of the *same* Notion sheet, all with `End date` on, show three different range
presentations: two shades of blue with a lighter span between solid endpoints (`73217bdc`,
`057/notion-screens-digest.md:110`); a same-day range collapsing to one darker solid (`6a6e6e87`, `:116`);
and two solid endpoints with no between-fill at all (`d7432519`, `:114`). Notion's own picker cannot
decide what a range looks like.

Ours has no between-endpoints state at all: a sweep of `styles.css` for any `is-in-range` rule returns
**0** hits. Our pickers commit one date at a time.

### Decision

**We chose**: record the evidence and stop. Do not pick one of three presentations that the reference
itself contradicts.

**How it works**: the finding is routed to the surface that would own it - the record and cell editor's
date picker, where a start-and-end pair exists at pick time - rather than implemented in this view. The
minimal shape, if it is ever taken up, is an `inRangeKeys: Set<string>` alongside the existing
`selectedKeys` precedent, one `is-in-range` class, one rule; threshold >= 3:1 against both the endpoints
and the plain surface; red-first is the 0-hit sweep.

### Consequences

**What improves**: nothing is adopted on taste. `057` ADR-004 admits only WCAG grounds, and no WCAG
ground distinguishes Notion's three treatments from each other.

**What it costs**: a real usability gap stays open. Named, with an owner, rather than absorbed here.

---

## ADR-007: The picker's today marker is not unified with the month disc yet

**Status**: **Proposed** - deferred to the picker's own leg.
**Date**: 2026-09-06 | **Deciders**: pending.

### Context

Our picker marks today as an **accent numeral on no fill** (`styles.css:15977-15985`), by a written rule
that exists to keep today and selected distinguishable - today is an accent numeral, selected is a
numeral on an accent fill, and the collision case has its own rule (`styles.css:15986-15995`). Notion's
picker marks today as a **filled disc** (`812c6468`, `057/notion-screens-digest.md:107`; `4c2cbe60`, `:120`) -
so Notion's *picker* agrees with our *month grid* (`styles.css:16522-16533`) and not with our *picker*.

### Decision

**We chose**: leave it. Record the divergence against our own month-grid convention.

**How it works**: nothing changes here. Unifying would buy cross-surface consistency and cost the
documented collision rule, which is a two-signal redesign of a landed, reasoned choice - work for the
picker's own leg, not a side effect of a touch-floor fix.

### Consequences

**What improves**: a solved collision stays solved.

**What it costs**: the today marker means two different things on two of our own surfaces. Recorded so
the next reader finds the reasoning rather than the inconsistency alone.

**If adopted later**: the two-signal requirement and the 4.53:1 / 4.5:1 figures are already on the books
under `057` R4.

<!-- /ANCHOR:decisions -->

---

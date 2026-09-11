# Iteration 4 findings

## Gap class

DESIGN SYSTEM — token, primitive, semantic-role, and CSS-lane cohesion.

## Evidence

- styles.css:44-93 — spacing, inset, type, and radius tokens exist, while styles.css:244-376 still contains sheet/card vocabulary.
- src/views/surface-shell.ts:230-327 — the shell already owns a three-slot header and 44px edge controls.
- styles.css:590-680,727-770,12342-12386,13872-13932,14512-14558 — menu, settings, panel, and column-manager rows/dividers repeat geometry.
- src/views/record-surface/CODE.md:15-31,43-45 — record-surface primitives are only partially wired.
- styles.css:182-213,1049-1086,8079-8205 and src/views/record-surface/property-row.ts:390-455 — status colour consumers still use raw palette values.
- .opencode/skills/sk-design/sk-design-fundamentals/SKILL.md:277-324 and assets/tokens.css:92-147 — spacing/type and semantic theme roles are the design reference.

## Finding

The programme has a shared shell/header seam, but no single owner for row/divider geometry, semantic status/priority roles, or stack policy. Independent child CSS would produce locally plausible but globally divergent sheets. D4 makes shared CSS serial; the landing order must therefore be explicit.

## Proposed text

Add ADR-R:

“Shared surface primitives are the only authority for phone frame, handle, three-slot header, 16px inset, row variants, hairline dividers, typography scale, semantic status/priority roles, and stack depth. Child tasks may select a variant but may not redefine geometry or raw colours. Land in this order: T-DS-001 semantic tokens and theme roles; T-DS-002 frame/header/handle/stack; T-DS-003 row/divider variants; T-DS-004 record/property primitives; T-DS-005 migrate sheet families; T-DS-006 board exceptions. Every step captures light and dark states and runs shared regression assertions before the next step.”

Add shared acceptance rows:

“cardContainers = 0; sheet content is on the plain background; inset is 16px ±0.5px; handle is 34px × 5px ±1px at the sanctioned offset; action and navigation rows are at least 44px; title center drift is at most 1px; divider boundaries are stable in light and dark; status/priority use semantic roles, never raw palette values.”

## Confidence

High for the shared-authority and landing-order finding; medium for exact token names because the implementation contains legacy aliases that need an operator-approved deprecation window.

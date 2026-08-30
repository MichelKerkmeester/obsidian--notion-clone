---
title: "Acceptance Criteria: List View Freeze"
description: "Every criterion with its measured before-number, its after-number, the command that produced it, and the control that proved the check could fail."
trigger_phrases:
  - "list view freeze acceptance criteria"
  - "list render benchmark numbers"
  - "024 acceptance"
importance_tier: "critical"
contextType: "verification"
---
# Acceptance Criteria: List View Freeze

Every number below was produced by a command in this repository and read from its output, not
inferred. Where a check is claimed to be capable of failing, the run that made it fail is named.

---

## 1. THE MEASUREMENT

All benchmark rows come from:

```
node tools/bench/run-list.mjs --cols=21 --fill=0.3 --rows=400,800,1600 --repeats=1
```

Twenty-one properties and 30% fill, because that is the shape of the database in the report. The
bench drives the real `ListRenderer` through `esbuild` into headless Chrome, at desktop width and at
phone width with the class the stylesheet keys its mobile arm to.

Three trees were measured:

- **BEFORE** — `git show c31acf5^:src/views/list-renderer.ts`, byte-identical to `4830275`
- **SHIPPED** — `HEAD`, the tree carrying 1.3.4 and 1.3.5
- **FIXED** — this phase

---

## 2. CRITERIA

### AC-1 — Opening a list view does not block the main thread (REQ-001)

| rows | BEFORE | SHIPPED | FIXED |
|------|--------|---------|-------|
| desktop 400 | 417.9ms | 499.5ms | **18.0ms** |
| desktop 800 | 1,549.4ms | 1,839.9ms | **51.8ms** |
| desktop 1,600 | 6,777.0ms | 7,173.5ms | **84.5ms** |
| phone 400 | 72.7ms | 118.5ms | **21.1ms** |
| phone 800 | 185.2ms | 305.5ms | **44.2ms** |
| phone 1,600 | 639.8ms | 821.4ms | **85.2ms** |

**PASS.** 7,173.5ms → 84.5ms is **84.9×** on the desktop; 821.4ms → 85.2ms is **9.6×** on the phone.
Against the pre-regression tree rather than the shipped one it is still 80× and 7.5×.

The runner declares a 2,000ms budget and exits non-zero above it. **It was observed failing first**:
on `HEAD`, `list-bench: FAIL — 7173.5ms exceeds the 2000ms budget`, exit 1. On the fixed tree,
`list-bench: PASS — worst render 85.2ms`.

### AC-2 — Cost is linear in row count (REQ-002)

Per-row cost, 400 → 1,600 rows:

| | BEFORE | SHIPPED | FIXED |
|---|--------|---------|-------|
| desktop | ×4.05 SUPERLINEAR | ×3.59 SUPERLINEAR | **×1.17 LINEAR** |
| phone | ×2.20 SUPERLINEAR | ×1.73 SUPERLINEAR | **×1.01 LINEAR** |

**PASS.** `npm run bench:list` reports LINEAR at all eight shapes of the default matrix.

### AC-3 — A property starts in the same column on every card (REQ-003)

`node tools/storybook/verify-placement.mjs`, section 5k, measuring the renderer's own output:

```
PASS  on desktop the renderer gives every list card the same field-area width
PASS  on desktop the renderer starts a property in the same column on every card
PASS  on phone the renderer gives every list card the same field-area width
PASS  on phone the renderer starts a property in the same column on every card
```

**PASS.** The alignment `c31acf5` bought is intact.

### AC-4 — A reserved column costs one element (REQ-004)

| | field elements | of which reserved | DOM nodes |
|---|---|---|---|
| BEFORE (400 rows) | 2,400 | 0 | 13,207 |
| SHIPPED (400 rows) | 8,000 | 5,600 | 30,007 |
| FIXED (400 rows) | 8,000 | 5,600 | **18,807** |

**PASS.** The reserved columns remain; what they cost fell from three nodes each to one. At 1,600
rows the list holds 75,207 nodes rather than 120,007.

Asserted directly, not only counted:
`PASS  on desktop a reserved column costs one element and no rendered content —
14 reserved columns hold 0 child element(s)`.

### AC-5 — The check has been observed red (REQ-005)

Control run, `git show c31acf5^:src/views/list-renderer.ts` in place, same command:

```
FAIL  on desktop the renderer gives every list card the same field-area width
FAIL  on desktop the renderer starts a property in the same column on every card
FAIL  on desktop a reserved column costs one element and no rendered content
FAIL  on phone  a reserved column costs one element and no rendered content
```

**PASS.** Four of the six go red on the renderer that skips empty properties and green on this one,
which is the discrimination the check exists to provide.

**The two that do not are reported rather than hidden.** The phone arm cannot fail, because the
renderer's field area on a 402px phone measures 240px and fits one property per line — every property
sits at x=0 whichever way the renderer claims its column. The check now says so in its own output:

```
only 1 property fits per line here, so every one sits at x=0 and this cannot show a shuffle
— the column claim is load-bearing on the wider surface, not this one
```

A green that cannot go red is worth less than a red, and worth nothing at all if nobody is told.

### AC-6 — Operator confirmation (REQ-006)

**NOT MET — this is the only criterion that matters and it is not mine to close.** Everything above
is a machine measuring a machine. The report was a person unable to use the application.

---

## 3. NO REGRESSION

Baselines from the brief, re-run from the final state:

| check | baseline | after | verdict |
|-------|----------|-------|---------|
| `npx vitest run` | 444 | 444 passed, exit 0 | unchanged |
| `verify-placement` | 173/177, 4 declared red | 186/190, 4 declared red | +13, no new red |
| `npm run gate` | 14 green, exit 0 | 13 green, 1 red | see below |
| `npx tsc --noEmit` | — | exit 0 | clean |

The 190 is 177 + 6 from this phase + 7 arriving concurrently from
`021-sheet-inline-edit-alignment`. The four declared reds are unchanged.

**The single gate red is `css-lane`, and it is not this phase's.** The lane is held by
`021-sheet-inline-edit-alignment`, whose uncommitted `styles.css` edit moved the hash from
`bdaff6ffb928` to `3e9b59084860`. This phase changed no CSS: `git diff styles.css` contains zero
occurrences of `db-list-field` or `is-placeholder`, and every added line is that phase's sheet
inline-editor work. The lane check returned exit 0 at the start of this session and went red during
it, from another lane.

---

## 4. WHAT WAS NOT MEASURED

- **A live vault.** The bench excludes row preparation, the metadata cache, computed fields and
  relation rollups. A real database pays more per field than this reports, never less.
- **The operator's actual row count.** The freeze threshold sits between 400 and 1,600 rows on the
  desktop and above 1,600 on the phone. Which side the vault sits on was never captured, so the
  fix is justified by the shape of the curve rather than by a matching row count.
- **Expensive column types at scale.** `--kind=mixed` was run at 400 rows and cost 156ms against
  131ms for plain text, so the empty-value renderers are cheap. It was not run at 1,600.

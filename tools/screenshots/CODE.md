---
title: "tools/screenshots: harness topology and flow"
description: "Code map for the screenshot harness: how capture, the scenario registry and verify fit together, the manifest that records each shot's source fingerprints, and the fingerprint-over-bytes decision behind the verify gate."
trigger_phrases:
  - "screenshot harness code map"
  - "capture verify manifest fingerprint flow"
  - "playwright-core headless chrome plugin"
---

# tools/screenshots: harness topology and flow

---

## 1. OVERVIEW

`tools/screenshots/` is the capture pipeline plus its verify gate. `capture.mjs` renders and writes,
`scenarios.mjs` supplies what to render, and `verify.mjs` guards that the written images still match
their sources.

Current state:

- `capture.mjs` drives system Chrome through `playwright-core`, so the repository carries no bundled
  browser download.
- Each scenario renders the `db-*` class structure the renderers emit, against mock rows, so a shot
  shows what the stylesheet produces rather than a live vault.
- `verify.mjs` compares recorded source fingerprints, not image bytes.

---

## 2. ARCHITECTURE

```text
╭──────────────────────────────────────────────────────────────────╮
│                       tools/screenshots                          │
╰──────────────────────────────────────────────────────────────────╯

┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ scenarios.mjs  │ ──▶ │ capture.mjs    │ ──▶ │ screenshots/   │
│ (registry)     │     │ Chrome render  │     │ PNGs +         │
│                │     │                │     │ manifest.json  │
└────────────────┘     └────────────────┘     └───────┬────────┘
                                                       │
                                                       ▼
                                              ┌────────────────┐
                                              │ verify.mjs     │
                                              │ fingerprint    │
                                              │ gate           │
                                              └────────────────┘
```

---

## 3. KEY FILES

| File | Responsibility |
|---|---|
| `capture.mjs` | Renders each scenario per theme, writes PNGs and `screenshots/manifest.json` |
| `scenarios.mjs` | Aggregates the `scenarios/` modules into the `SCENARIOS` registry |
| `verify.mjs` | Reads the manifest, re-hashes each shot's sources, reports stale, missing or never-captured entries |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | Node built-ins, `playwright-core` (capture) and the local `scenarios/` modules |
| Exports | `scenarios.mjs` exports `SCENARIOS`. `capture.mjs` and `verify.mjs` are CLI entry points |
| Ownership | The capture pipeline and the fingerprint gate. It reads `styles.css` and the renderers, and writes only into `screenshots/` |

Main flow:

```text
╭──────────────────────────────────────────╮
│ SCENARIOS registry lists every surface    │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ capture.mjs renders each with styles.css  │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ It records source fingerprints in the     │
│ manifest                                  │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ verify.mjs fails when a source changed    │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `npm run screenshots` | CLI (`capture.mjs`) | Capture every scenario into `screenshots/` |
| `npm run screenshots:verify` | CLI (`verify.mjs`) | Fail when any shot's sources changed |
| `SCENARIOS` | Export (`scenarios.mjs`) | The registry both commands read |

---

## 6. VALIDATION

Run from the repository root.

```bash
npm run screenshots:verify
```

Expected result: `screenshots current` and exit `0` when every entry matches its sources.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`scenarios/CODE.md`](./scenarios/CODE.md)
- [`../CODE.md`](../CODE.md) — the tooling root.
</content>

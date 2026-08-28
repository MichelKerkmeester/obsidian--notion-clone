---
title: "tools/screenshots: the capture harness"
description: "The headless-Chrome screenshot harness: it renders the shipped stylesheet against mock data, fingerprints each shot's sources, and fails a verify gate when a source changes so the images in screenshots/ stay current."
trigger_phrases:
  - "obsidian plugin screenshot harness"
  - "capture verify scenarios stylesheet"
  - "screenshots stay current gate"
---

# tools/screenshots: the capture harness

`tools/screenshots/` renders the shipped `styles.css` against mock data in headless Chrome and
photographs each surface the plugin draws. It fingerprints the sources behind every shot so a verify
gate can fail the moment a renderer or the stylesheet changes, keeping the images in `screenshots/`
honest to the code.

---

## 1. OVERVIEW

The harness has three parts. `capture.mjs` drives system Chrome through `playwright-core` and writes
one PNG per scenario per theme. `scenarios.mjs` aggregates the per-surface scenario modules under
`scenarios/`. `verify.mjs` compares each shot's recorded source fingerprints against the current
files and exits non-zero when any is stale, missing or never captured.

Fingerprints, not image bytes, are compared: re-rendering on a different Chrome build shifts
antialiasing by a pixel, so a byte comparison would report drift everywhere while missing a real
change captured on the same machine.

---

## 2. QUICK START

```bash
npm run screenshots          # capture every scenario into screenshots/
npm run screenshots:verify   # fail when any shot's sources changed
```

Expected result: capture rewrites `screenshots/` and its manifest. Verify prints `screenshots
current` and exits `0` when every shot matches its sources.

---

## 3. STRUCTURE

```text
tools/screenshots/
+-- capture.mjs     # Render one PNG per scenario per theme
+-- verify.mjs      # Fingerprint gate over the manifest
+-- scenarios.mjs   # Scenario registry aggregating scenarios/
`-- scenarios/      # One module per surface family
```

| Path | Role |
|---|---|
| `capture.mjs` | Headless-Chrome capture, writes PNGs and the manifest |
| `verify.mjs` | Compares recorded source fingerprints against the tree |
| `scenarios.mjs` | Aggregates the scenario modules into one registry |
| `scenarios/` | The per-surface scenario definitions |

---

## 4. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`scenarios/README.md`](./scenarios/README.md) — the scenario modules.
- [`../../screenshots/README.md`](../../screenshots/README.md) — the generated output and its images.
</content>

---
title: "Rule: Screenshot currency"
description: "Every documented view, component and state carries a dark and a light capture whose sources are tracked. A capture can succeed and still photograph an empty box, so the byte count is never the proof."
trigger_phrases:
  - "screenshot"
  - "screenshots verify"
  - "capture is stale"
  - "add a view"
  - "add a component"
  - "add a state"
  - "ui work is done"
  - "the capture looks wrong"
  - "scenario registration"
  - "scenarios.mjs"
  - "manifest.json"
  - "why is my surface not captured"
  - "screenshot harness"
  - "theme variables missing"
  - "unstyled capture"
  - "SCREENSHOT_CHROME"
importance_tier: important
contextType: reference
version: 1.0.0.0
---

# Rule: Screenshot currency

> Routed from [`REPO RULES.md`](../REPO%20RULES.md). Load it before changing any UI surface, and before claiming UI work is done.
> Expands `AGENTS.md`, never overrides it. Where they appear to disagree, `AGENTS.md` wins and this file is wrong. Say so.

## Fires when

- Adding or changing a view, component or state that renders.
- Claiming any UI work is complete.
- Reading a capture to decide whether a surface is correct.
- Judging whether a changed capture is a defect or a stand-in gap.

## The rule

**A surface is not done until a current capture of it exists and you have looked at the image.**

`screenshots/` holds one dark and one light capture of every documented view, component and state, a generated index, and a manifest recording which source files each capture depicts.

---

## 1. THE GATE

```bash
npm run screenshots:verify
```

It exits non-zero and names the affected files when a capture's sources changed after it was taken. Refresh with `npm run screenshots`, then **open the changed PNGs and look at them**.

**The failure this prevents:** a capture that succeeds and photographs an empty box. The command exiting zero and the file having bytes are both true of a blank image.

---

## 2. A NEW SURFACE REGISTERS IN THE SAME CHANGE

Adding a view, component or state means adding a scenario to `tools/screenshots/scenarios.mjs` in that same change. The verifier reports a registered-but-never-captured scenario as a failure, so an unphotographed surface cannot pass quietly.

Each scenario declares the `sources` it depicts, and that list decides which captures a later change invalidates. **Keep it accurate or the check goes quiet exactly when it should not.**

---

## 3. WHAT THE HARNESS IS NOT

Two properties change how a capture should be read:

- It renders hand-written fixture markup against the shipped stylesheet, **not the real renderers** which need a live Obsidian `App`, vault and metadata cache. Markup drift appears as a screenshot that no longer matches the code, never as a capture error.
- It stands in for what Obsidian supplies, host theme variables, bare form-control styling, and layout values the plugin sets from JavaScript, through `theme.css` and `runtime-vars.css`.

**So a surface that looks wrong in a capture may be a gap in those stand-ins rather than a defect in the plugin. Check which before filing it as a bug.**

---

## 4. ENVIRONMENT

Captures need a system Chrome. Set `SCREENSHOT_CHROME` to override the path.

---

## 5. SELF-CHECK

- [ ] `npm run screenshots:verify` exits zero, and I read the output rather than assuming.
- [ ] I opened every changed PNG and looked at it.
- [ ] Any new view, component or state got its scenario in the same change.
- [ ] The scenario's `sources` list names every file the capture actually depicts.
- [ ] A wrong-looking capture was checked against the stand-ins before being called a defect.

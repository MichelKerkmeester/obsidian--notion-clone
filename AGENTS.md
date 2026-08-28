# Working in this repository

Conventions that apply to anyone changing this plugin, human or agent.

## Screenshot currency

`screenshots/` holds one dark and one light capture of every documented view, component and
state, a generated `README.md` index, and a `manifest.json` recording which source files each
capture depicts.

**Before claiming any UI work is done**, run:

```
npm run screenshots:verify
```

It exits non-zero and names the affected files when a capture's sources have changed since it
was taken. Refresh with `npm run screenshots`, then open the changed PNGs and look at them. A
capture can succeed and still photograph an empty box; the byte count is not proof.

**Adding a view, component or state means adding a scenario to
`tools/screenshots/scenarios.mjs` in the same change.** The verifier reports a
registered-but-never-captured scenario as a failure, so an unphotographed surface cannot pass
silently. Each scenario declares the `sources` it depicts; that list is what decides which
captures a later change invalidates, so keep it accurate or the check goes quiet when it
should not.

Two properties of the harness matter when reading a capture:

- It renders hand-written fixture markup against the shipped stylesheet, not the real
  renderers, which need a live Obsidian `App`, vault and metadata cache. Markup drift shows up
  as a screenshot that no longer matches the code rather than as a capture error.
- It stands in for what Obsidian supplies — host theme variables, styling for bare form
  controls, and the layout values the plugin sets from JavaScript — through `theme.css` and
  `runtime-vars.css`. A surface that looks wrong in a capture may be a gap in those stand-ins
  rather than a defect in the plugin. Check which before filing it as a bug.

Captures need a system Chrome. Set `SCREENSHOT_CHROME` to override the path.

## Verification

`npx tsc --noEmit`, `npm run build` and `npx vitest run` all have to pass before work is
claimed complete. Read the output and the exit status rather than assuming; a green run that
changed no files proves nothing.

## Comments

Never put spec paths, requirement ids, task ids or checklist ids in code comments. Record the
durable reason a thing is the way it is instead.

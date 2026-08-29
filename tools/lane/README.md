# The CSS lane

Records which phase currently owns `styles.css`, so two of them cannot edit it at once.

`styles.css` is one file of roughly nineteen thousand lines, deliberately never split, and every
screenshot in `tools/screenshots` fingerprints it. That makes it the one resource in this program
that cannot take concurrent writers: two phases editing it in parallel produce a stylesheet neither
of them measured, and a capture set that matches neither.

The program's phase order allows this by accident. Phases `004` and `005` both unblock once `000`
lands, so nothing but convention stops them running together — and convention is what failed the
last time a release passed every gate and changed nothing on screen.

## The lane file

`css-lane.json` names the holder and dates the claim.

```json
{
  "holder": "000-surface-contract-and-truthful-harness",
  "acquiredAt": "2026-08-29T17:27:00.333Z",
  "baselineHash": "9732449e4746",
  "baselineCommit": "f4319e3e768a",
  "history": [{ "event": "acquire", "phase": "000-...", "at": "...", "hash": "9732449e4746" }]
}
```

`holder` is the phase folder allowed to edit `styles.css`. `baselineHash` and `baselineCommit` are
what the stylesheet and the tree looked like when that phase picked the lane up, which is what makes
a lane left open by a finished phase visible rather than merely old. `history` keeps every acquire
and release, so "who last touched this file, and against what" is answerable after the fact.

## Handing it over

Pass the lane on when a phase's stylesheet work is done, not when the phase is:

1. Re-capture and sign off the screenshots the edits moved.
2. Set `heldBy` to the next phase and `baselineHash` to the current hash of `styles.css`.
3. Commit that change on its own, so the handover is a point in history rather than a detail inside
   an unrelated diff.

A phase without the lane that needs a stylesheet change asks for it. It does not take it, and it
does not keep a private patch to apply later — a stylesheet edit that never went through the lane is
one no capture in the program describes.

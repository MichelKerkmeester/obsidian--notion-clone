# tools/live — code notes

Three tools, one shared conviction: a check that cannot fail is worse than no check, because it
spends the credibility of a passing suite on nothing.

## `probe.mjs`

Transport to the running Obsidian, over the app's own command-line interface.

The three exit codes are the design. `0` held, `1` the product is wrong, `2` the question could not
be asked. Most harnesses collapse the last two, and that is how a suite reports green because it
never ran — the failure mode this whole effort exists to remove. `evaluate()` therefore never throws
for an operational reason; it returns a result object so the caller is forced to distinguish.

The transport check deliberately asks for the vault name, the plugin's loaded state and its version.
None of those can be fabricated by a fixture, so a pass can only come from the real app.

## `guard-inverted-assertions.mjs`

Refuses a predicate that certifies a defect.

`BANNED` carries a `why` for each entry, and that field is the load-bearing part. A rule with no
stated reason gets deleted by the next person who trips over it; a rule that explains it defended a
bug for a whole release survives. Add entries here whenever a check is inverted, not only this one —
the assumption is that others exist.

## `token-census.mjs`

Renders every overlay class twice, inside the plugin container and on the body, and diffs the
computed values.

It runs in a browser on purpose. The cascade decides the answer and no static reading of a
19,000-line stylesheet predicts it — the earlier estimate, taken from a sample, was optimistic by a
factor of two and a half.

Two mechanisms produce the same symptom and the output separates them: the token scale not reaching
a surface, and the surface's own rule being scoped to an ancestor it does not have. A class can sit
in the token root and still lose its radius for the second reason, so a fix that only widens the
root would leave half the population broken while appearing to work.

`tokenRoots` is parsed by anchoring on the declaration rather than by taking everything before the
first brace — the positional version swallowed the file header and reported fifteen roots where
there are nine. Recording a wrong number as a baseline is exactly what this file is meant to prevent.

Output is written to `token-census.json` so a later phase can diff against it rather than re-derive
it from prose.

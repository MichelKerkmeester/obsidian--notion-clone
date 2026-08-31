// ───────────────────────────────────────────────────────────────────
// MODULE:    open-external
// COMPONENT: the one way this plugin hands a URL to the browser
// ───────────────────────────────────────────────────────────────────
//
// There were ten bare `window.open(target)` calls across the renderers, and
// every one of them had the same two problems.
//
// The opened page received a live `window.opener` back into the host, which is
// a reference to the app the user is running, handed to whatever was at the far
// end of a link stored in someone's frontmatter. `noopener` severs it, and
// `noreferrer` stops the host's URL travelling with the request.
//
// And each call trusted its own caller to have validated the target. The link
// pipeline did; the cover pipeline did not, which is how a `javascript:` scheme
// could reach `window.open` as long as the string ended in `.png`. Routing them
// all through one function means the check cannot be forgotten at a new call
// site, because there is nowhere else to open a URL from.
//
// It re-validates even where the caller already normalized. Doing so is cheap
// and idempotent — an allowlisted URL passes through unchanged — and a guard
// that only runs when the caller remembers to ask for it is the arrangement
// this replaces.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { normalizeExternalUrlTarget } from "../data/text-link";

// ───────────────────────────────────────────────────────────────────
// 2. OPEN
// ───────────────────────────────────────────────────────────────────

/**
 * Open an external target, or refuse it.
 *
 * Returns whether it opened, so a caller that wants to say something about a refusal can. Most do
 * not: a target the allowlist rejects reached the UI through a hand-edited frontmatter value, and
 * the useful response is for nothing to happen.
 */
export function openExternalUrl(target: string): boolean {
  const safe = normalizeExternalUrlTarget(target);
  if (!safe) return false;
  window.open(safe, "_blank", "noopener,noreferrer");
  return true;
}

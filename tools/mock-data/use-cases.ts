// ───────────────────────────────────────────────────────────────────
// MODULE:    use-cases
// COMPONENT: the domain vocabulary the one consolidated testbed is dressed in
// ───────────────────────────────────────────────────────────────────
//
// This file is data, not logic. The vocabulary here carries the SAME column
// facets the schema builder in catalogue.ts guarantees — the shape is one
// decision made once, and this file only decides what the columns are called
// and what values they hold.
//
// There is exactly one vocabulary now, because there is exactly one testbed
// database: ten domain-flavoured copies of the same shape were ten places for
// a harness's values to drift apart. What the single vocabulary must keep is
// the value shapes that actually break renderers — a title long enough to
// truncate, a person's name with a diacritic, a rating out of five beside a
// percentage, a multi-select with one value beside one with six — and the
// deliberately full first record and deliberately empty last record the
// builder guarantees around the drawn values.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

import type { StatusColor } from "../../src/data/types";

export interface OptionVocabulary {
  value: string;
  color: StatusColor;
}

export interface UseCaseVocabulary {
  /** Folder-safe and id-safe. Becomes the database id and the vault subfolder. */
  id: string;
  name: string;
  icon: string;
  description: string;
  /** 20-40. The catalogue asserts the bound rather than trusting the literal. */
  recordCount: number;
  /** At least `recordCount` entries. Extra entries are ignored, never wrapped:
   *  wrapping would silently produce duplicate note filenames in the vault. */
  titles: string[];
  /** Domain wording for the facets whose default label would read wrong here.
   *  Every other facet keeps the shared default from catalogue.ts. */
  labels: Record<string, string>;
  status: OptionVocabulary[];
  select: OptionVocabulary[];
  multiSelect: OptionVocabulary[];
  tags: string[];
  people: string[];
  /** [min, max] for the plain number column, and its decimal places. */
  number: [number, number, number];
  /** [min, max] for the currency column. */
  currency: [number, number];
  /** Sentences for the one-line text column. */
  summaries: string[];
  /** Paragraphs for the wrapped multi-line text column. */
  notes: string[];
  /** Inline-markdown fragments for the markdown-render text column. */
  markdown: string[];
  urlHost: string;
  emailDomain: string;
  /** The domain formula. `[number]` and `[currency]` resolve to this use case's
   *  own two numeric column keys, substituted by the schema builder. */
  computed: { key: string; label: string; expression: string; unit: "number" | "percent" };
}

// ───────────────────────────────────────────────────────────────────
// 2. THE VOCABULARY
// ───────────────────────────────────────────────────────────────────

export const USE_CASES: UseCaseVocabulary[] = [
  {
    id: "testbed",
    name: "Testbed",
    icon: "🧪",
    description: "The one consolidated testbed: every column type, display variant and value shape the harnesses exercise, in a single database.",
    recordCount: 36,
    // The first record is the deliberately full one and the last is the
    // deliberately sparse one — the builder gives the first record every
    // optional facet and leaves the last entirely empty, so the titles name
    // what the reader should see.
    titles: [
      "Full record, every facet filled",
      "Onboarding flow redesign", "Search relevance tuning", "Billing webhook retries",
      "Design token migration", "Mobile navigation sweep", "Data warehouse cutover",
      "Rate limiter rollout", "Localisation sprint", "Accessibility audit",
      "Notification centre", "Pricing experiment", "Docs information architecture",
      "SSO for enterprise tenants", "Incident retrospective actions", "Performance budget",
      "Legacy importer retirement", "Deal desk workflow", "Security review follow-ups",
      "Roadmap planning cycle", "Customer interview round two",
      "This is a deliberately very long project title that should overflow and force truncation on narrow phone columns",
      "Zero-cost cleanup", "Offline draft sync", "Payment retry backoff",
      "Audit log retention", "Empty shell", "Feature flag consolidation",
      "Session replay pilot", "Bulk export tooling", "Region failover drill",
      "Push token hygiene", "Schema registry rollout", "Support macro rewrite",
      "Sandbox parity fixes",
      "Sparse record, title only",
    ],
    // No domain wording: this is not a tracker or a shop, it is the fixture the
    // harnesses read, so every column keeps the shared default label. A label
    // that lied about being a tracker's would read as documentation of a
    // product nobody shipped.
    labels: {},
    status: [
      { value: "Backlog", color: "gray" }, { value: "In Progress", color: "blue" },
      { value: "Blocked", color: "red" }, { value: "In Review", color: "orange" },
      { value: "Done", color: "green" }, { value: "Archived", color: "purple" },
    ],
    select: [
      { value: "Low", color: "slate" }, { value: "Medium", color: "yellow" },
      { value: "High", color: "orange" }, { value: "Critical", color: "rose" },
    ],
    // Seven options, so a row can hold one value and another six — the gap a
    // wrapping bug hides in. A fixed count never wraps or always does.
    multiSelect: [
      { value: "research", color: "cyan" }, { value: "design", color: "violet" },
      { value: "urgent", color: "red" }, { value: "mobile", color: "teal" },
      { value: "backend", color: "indigo" }, { value: "docs", color: "brown" },
      { value: "infra", color: "lime" },
    ],
    tags: ["platform", "growth", "mobile", "infra", "design-systems"],
    people: ["Ada Lovelace", "Grace Hopper", "Jean Bartik", "Mehmet Öztürk", "Renée Dubois"],
    number: [1, 21, 0],
    currency: [1200, 84000],
    summaries: [
      "Scope confirmed with the steering group.",
      "Waiting on a decision about the phone build.",
      "Rolled out to ten percent of accounts.",
      "Second attempt after the first rollback.",
      "Handed to the platform team for the data leg.",
      "Blocked on a vendor contract renewal.",
    ],
    notes: [
      "Kickoff scope confirmed with the steering group.\n\nOpen questions:\n- Which surfaces are in scope for the phone build?\n- Do we reuse last cycle's evidence bundle?\n\nDecision: proceed with the reduced set and revisit at the mid-cycle review. This paragraph is intentionally long so that wrapping, the record detail panel and the card frames all get a real multi-line value to render on a narrow screen.",
      "Two attempts, one rollback. The second attempt changed the retry window rather than the payload, which is the difference that mattered.",
      "Nothing here is blocked on engineering. The remaining work is a contract and a date.",
    ],
    markdown: [
      "**Critical path** for the quarter", "Needs `feature-flag` cleanup first",
      "*Waiting* on the vendor", "==Highest confidence== item this cycle",
      "~~Deferred~~ then reinstated",
    ],
    urlHost: "testbed.example.com",
    emailDomain: "testbed.example",
    computed: { key: "ratio", label: "Ratio", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
];

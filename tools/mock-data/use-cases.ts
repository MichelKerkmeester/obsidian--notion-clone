// ───────────────────────────────────────────────────────────────────
// MODULE:    use-cases
// COMPONENT: the domain vocabulary each generated database is dressed in
// ───────────────────────────────────────────────────────────────────
//
// This file is data, not logic. Every use case here carries the SAME column
// facets — the schema builder in catalogue.ts guarantees that — and differs
// only in what the columns are called and what values they hold. That split
// is the whole reason a record count can be compared across ten databases and
// three products: the shape is one decision made once, and the vocabulary is
// ten decisions that cannot change the shape.
//
// The single previous test database was a finance-flavoured project tracker,
// so every check it could support was a check about money and status. Ten
// vocabularies cover the value shapes that actually break renderers: a title
// long enough to truncate, a person's name with a diacritic, a currency with
// no decimals beside one with two, a rating out of five beside a percentage,
// a multi-select with one value beside one with six.

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
// 2. THE TEN VOCABULARIES
// ───────────────────────────────────────────────────────────────────

export const USE_CASES: UseCaseVocabulary[] = [
  {
    id: "project-tracker",
    name: "Project Tracker",
    icon: "🗂️",
    description: "Delivery work with owners, estimates, dependencies and a burn-down.",
    recordCount: 36,
    titles: [
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
      "Trial conversion funnel", "Webhook signing rotation", "Sandbox parity fixes",
    ],
    labels: {
      number: "Estimate (pts)", currency: "Budget", select: "Priority", status: "Status",
      multiSelect: "Labels", tags: "Team", person: "Assignee", checkbox: "Blocked",
      date: "Due", rangeStart: "Starts", rangeEnd: "Ends", datetime: "Last reviewed",
      relation: "Depends on", rollup: "Dependencies", files: "Attachments",
      url: "Ticket", email: "Owner email", phone: "Escalation line",
      rating: "Confidence", progress: "Complete", ring: "Risk burn",
      summary: "Summary", notes: "Working notes", markdown: "Headline",
    },
    status: [
      { value: "Backlog", color: "gray" }, { value: "In Progress", color: "blue" },
      { value: "Blocked", color: "red" }, { value: "In Review", color: "orange" },
      { value: "Done", color: "green" }, { value: "Archived", color: "purple" },
    ],
    select: [
      { value: "Low", color: "slate" }, { value: "Medium", color: "yellow" },
      { value: "High", color: "orange" }, { value: "Critical", color: "rose" },
    ],
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
    urlHost: "tracker.example.com",
    emailDomain: "example.com",
    computed: { key: "cost_per_point", label: "Cost / point", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "crm-contacts-deals",
    name: "CRM Contacts and Deals",
    icon: "🤝",
    description: "People, accounts and open deals with stage, value and next touch.",
    recordCount: 34,
    titles: [
      "Northwind Logistics", "Aurora Health Group", "Bellwether Capital", "Cedar Ridge Schools",
      "Delta Freight", "Evergreen Robotics", "Fairline Media", "Granite Insurance",
      "Harbourview Hotels", "Ironwood Manufacturing", "Juniper Analytics", "Kestrel Airways",
      "Lakeshore Retail", "Meridian Bank", "Northgate Pharma", "Oakfield Utilities",
      "Pinnacle Studios", "Quarry Hill Foods", "Redstone Mining", "Silverbirch Legal",
      "Tidewater Marine", "Umbra Security", "Vantage Point Realty", "Westbrook Textiles",
      "Yellowstone Outfitters", "Zephyr Cloud", "Alderman Councils", "Brightwater Farms",
      "Coastline Ferries", "Dunmore Whisky", "Eastvale Clinics", "Foxglove Cosmetics",
      "Glenhaven Trust", "Highfield Sports",
    ],
    labels: {
      number: "Headcount", currency: "Deal value", select: "Stage", status: "Health",
      multiSelect: "Segments", tags: "Territory", person: "Account owner", checkbox: "Renewal risk",
      date: "Next touch", rangeStart: "Contract from", rangeEnd: "Contract to", datetime: "Last contacted",
      relation: "Related accounts", rollup: "Related count", files: "Documents",
      url: "Website", email: "Primary contact", phone: "Switchboard",
      rating: "Fit", progress: "Stage progress", ring: "Forecast confidence",
      summary: "One-liner", notes: "Call notes", markdown: "Signal",
    },
    status: [
      { value: "Healthy", color: "green" }, { value: "Watch", color: "yellow" },
      { value: "At Risk", color: "orange" }, { value: "Churned", color: "red" },
      { value: "Dormant", color: "gray" },
    ],
    select: [
      { value: "Prospect", color: "slate" }, { value: "Qualified", color: "cyan" },
      { value: "Proposal", color: "blue" }, { value: "Negotiation", color: "violet" },
      { value: "Closed Won", color: "green" }, { value: "Closed Lost", color: "red" },
    ],
    multiSelect: [
      { value: "enterprise", color: "indigo" }, { value: "mid-market", color: "teal" },
      { value: "smb", color: "lime" }, { value: "public-sector", color: "brown" },
      { value: "regulated", color: "rose" }, { value: "expansion", color: "pink" },
    ],
    tags: ["emea", "amer", "apac", "benelux", "nordics"],
    people: ["Sofia Ruiz", "Tomás Ferreira", "Anneke de Vries", "Kwame Mensah", "Ingrid Solberg"],
    number: [8, 24000, 0],
    currency: [4500, 480000],
    summaries: [
      "Renewal conversation opens next quarter.",
      "Champion moved to a different division.",
      "Procurement asked for a security questionnaire.",
      "Pilot converted after a two-week extension.",
      "Legal redlines returned with three changes.",
    ],
    notes: [
      "Two stakeholders, one of whom is new. The security questionnaire is the gate; everything else is agreed in principle.\n\nNext steps:\n- Return the completed questionnaire\n- Confirm the start date with procurement\n- Book the technical walkthrough",
      "Lost on price, not on fit. Worth revisiting once the usage-based tier ships.",
      "Expansion signal: three new seats added without being asked for.",
    ],
    markdown: [
      "**Expansion** signal this month", "Blocked on `security-review`",
      "*Champion change* mid-cycle", "==Top forecast== for the quarter",
      "~~Cold~~ reopened by inbound",
    ],
    urlHost: "accounts.example.com",
    emailDomain: "clients.example.com",
    computed: { key: "value_per_seat", label: "Value / seat", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "reading-list",
    name: "Reading List",
    icon: "📚",
    description: "Books and long reads with progress, rating and where they came from.",
    recordCount: 32,
    titles: [
      "The Design of Everyday Things", "Thinking in Systems", "The Making of the Atomic Bomb",
      "Seeing Like a State", "The Soul of a New Machine", "Where Wizards Stay Up Late",
      "The Mythical Man-Month", "Structure and Interpretation of Computer Programs",
      "A Pattern Language", "How Buildings Learn", "The Timeless Way of Building",
      "Understanding Comics", "The Visual Display of Quantitative Information",
      "Envisioning Information", "Amusing Ourselves to Death", "The Shallows",
      "Deep Work", "The Idea Factory", "Chaos", "Gödel, Escher, Bach",
      "The Information", "Programming Pearls", "Refactoring", "Domain-Driven Design",
      "Working Effectively with Legacy Code", "Release It", "Accelerate",
      "An Elegant Puzzle", "The Manager's Path", "Crucial Conversations",
      "The Coming Wave", "Ways of Seeing",
    ],
    labels: {
      number: "Pages", currency: "Price paid", select: "Format", status: "Reading status",
      multiSelect: "Themes", tags: "Shelf", person: "Recommended by", checkbox: "Owned",
      date: "Finished", rangeStart: "Started", rangeEnd: "Target finish", datetime: "Last opened",
      relation: "Related reads", rollup: "Related count", files: "Highlights",
      url: "Publisher page", email: "Lender", phone: "Bookshop",
      rating: "Rating", progress: "Progress", ring: "Retention",
      summary: "In one line", notes: "Notes", markdown: "Pull quote",
    },
    status: [
      { value: "To Read", color: "gray" }, { value: "Reading", color: "blue" },
      { value: "Finished", color: "green" }, { value: "Paused", color: "orange" },
      { value: "Abandoned", color: "red" },
    ],
    select: [
      { value: "Paperback", color: "brown" }, { value: "Hardback", color: "slate" },
      { value: "Ebook", color: "cyan" }, { value: "Audio", color: "violet" },
    ],
    multiSelect: [
      { value: "design", color: "violet" }, { value: "systems", color: "teal" },
      { value: "history", color: "brown" }, { value: "management", color: "indigo" },
      { value: "craft", color: "lime" }, { value: "science", color: "cyan" },
    ],
    tags: ["nightstand", "reference", "loaned-out", "reread"],
    people: ["Nadia Haddad", "Petra Novák", "Léo Marchand", "Yusuf Demir", "Aoife Byrne"],
    number: [96, 1180, 0],
    currency: [0, 68],
    summaries: [
      "Read for the chapter on affordances, stayed for the rest.",
      "Second attempt after bouncing off it once.",
      "Borrowed and never returned, to my shame.",
      "The middle third is the reason to read it.",
      "Skimmed the case studies, read the argument closely.",
    ],
    notes: [
      "The argument lands in chapter four and the rest is evidence for it. Worth rereading that chapter alone every year.\n\nThings to carry forward:\n- Constraints beat instructions\n- A system's purpose is what it does\n- Naming is the cheapest intervention available",
      "Dense, and the density is the point. Not a book to read on a phone.",
      "Recommended twice by different people, which is usually the signal.",
    ],
    markdown: [
      "**Best chapter:** four", "Pairs with `Thinking in Systems`",
      "*Skim* the appendices", "==Reread annually==", "~~Abandoned~~ then finished",
    ],
    urlHost: "publisher.example.com",
    emailDomain: "readers.example.com",
    computed: { key: "cost_per_page", label: "Cost / page", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "recipes-meal-plan",
    name: "Recipes and Meal Plan",
    icon: "🍳",
    description: "Dishes with timings, servings, cost per head and the week they land in.",
    recordCount: 30,
    titles: [
      "Ribollita", "Miso-glazed aubergine", "Chicken and preserved lemon tagine",
      "Kimchi jjigae", "Mushroom ragù with pappardelle", "Sourdough focaccia",
      "Black bean and chipotle chilli", "Roast cauliflower with tahini",
      "Prawn and chorizo rice", "Dal tadka", "Shakshuka with feta",
      "Beef short rib with gremolata", "Pumpkin and sage gnocchi", "Green papaya salad",
      "Lentil and walnut ragu", "Congee with century egg", "Fish pie with a cheddar crust",
      "Spanakopita", "Pho ga", "Chana masala", "Sausage and fennel orecchiette",
      "Tomato and burrata galette", "Katsu curry", "Bibimbap",
      "Leek and potato soup", "Cacio e pepe", "Harissa roast carrots",
      "Salmon en papillote", "Aubergine parmigiana", "Empanadas de carne",
    ],
    labels: {
      number: "Active minutes", currency: "Cost per head", select: "Course", status: "Kitchen status",
      multiSelect: "Diet", tags: "Cuisine", person: "Cooked by", checkbox: "Batch cooks",
      date: "Planned for", rangeStart: "Prep from", rangeEnd: "On the table", datetime: "Last cooked",
      relation: "Goes with", rollup: "Pairings", files: "Method",
      url: "Source recipe", email: "Recipe from", phone: "Butcher",
      rating: "House rating", progress: "Prep done", ring: "Freezer stock",
      summary: "In one line", notes: "Method notes", markdown: "Tip",
    },
    status: [
      { value: "Untried", color: "gray" }, { value: "In Rotation", color: "green" },
      { value: "Needs Work", color: "orange" }, { value: "Retired", color: "red" },
      { value: "Seasonal", color: "cyan" },
    ],
    select: [
      { value: "Breakfast", color: "yellow" }, { value: "Lunch", color: "lime" },
      { value: "Dinner", color: "indigo" }, { value: "Side", color: "teal" },
      { value: "Dessert", color: "pink" },
    ],
    multiSelect: [
      { value: "vegetarian", color: "green" }, { value: "vegan", color: "lime" },
      { value: "gluten-free", color: "brown" }, { value: "dairy-free", color: "cyan" },
      { value: "freezes-well", color: "slate" }, { value: "one-pan", color: "violet" },
    ],
    tags: ["italian", "korean", "levantine", "british", "mexican", "vietnamese"],
    people: ["Marta Kowalska", "Hiroshi Tanaka", "Chidi Okafor", "Elif Yılmaz", "Sam Whitfield"],
    number: [10, 165, 0],
    currency: [1.4, 11.8],
    summaries: [
      "Better on the second day.",
      "Halve the chilli if the children are eating.",
      "Freezes in portions and reheats without splitting.",
      "Needs a proper stock, not a cube.",
      "Twenty minutes if the paste is already made.",
    ],
    notes: [
      "The order matters more than the timing: aromatics first, then the paste, then the liquid. Rushing the paste is what makes it taste raw.\n\nSubstitutions that work:\n- Any firm white fish for the cod\n- Yoghurt for the cream, off the heat\n- Frozen peas, always",
      "Doubling works but the pan does not. Use two, or cook in batches and combine.",
      "Salt the aubergine an hour ahead or accept that it will drink the oil.",
    ],
    markdown: [
      "**Salt early**, not late", "Use `00` flour if you have it",
      "*Rest* before slicing", "==Best of the batch==", "~~Halve~~ double the garlic",
    ],
    urlHost: "recipes.example.com",
    emailDomain: "kitchen.example.com",
    computed: { key: "cost_per_minute", label: "Cost / minute", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "habit-health-log",
    name: "Habit and Health Log",
    icon: "🫀",
    description: "Daily entries with streaks, resting numbers and how the day felt.",
    recordCount: 40,
    titles: Array.from({ length: 40 }, (_, index) => {
      const day = new Date(Date.UTC(2026, 1, 1 + index));
      return `Log ${day.toISOString().slice(0, 10)}`;
    }),
    labels: {
      number: "Resting HR", currency: "Supplement spend", select: "Energy", status: "Day status",
      multiSelect: "Habits kept", tags: "Context", person: "Trained with", checkbox: "Rest day",
      date: "Date", rangeStart: "Sleep from", rangeEnd: "Sleep to", datetime: "Logged at",
      relation: "Compare with", rollup: "Comparisons", files: "Exports",
      url: "Workout link", email: "Coach", phone: "Clinic",
      rating: "Mood", progress: "Steps to goal", ring: "Recovery",
      summary: "In one line", notes: "Journal", markdown: "Flag",
    },
    status: [
      { value: "On Track", color: "green" }, { value: "Slipped", color: "orange" },
      { value: "Rest", color: "slate" }, { value: "Ill", color: "red" },
      { value: "Travelling", color: "cyan" },
    ],
    select: [
      { value: "Flat", color: "gray" }, { value: "Low", color: "slate" },
      { value: "Steady", color: "blue" }, { value: "High", color: "green" },
    ],
    multiSelect: [
      { value: "walk", color: "lime" }, { value: "strength", color: "indigo" },
      { value: "stretch", color: "teal" }, { value: "no-alcohol", color: "cyan" },
      { value: "reading", color: "violet" }, { value: "early-night", color: "brown" },
    ],
    tags: ["home", "travel", "office", "recovery"],
    people: ["Júlia Santos", "Ravi Chandra", "Nora Lindqvist", "Diego Alvarez", "Amara Nwosu"],
    number: [46, 78, 0],
    currency: [0, 42],
    summaries: [
      "Short walk, early night, nothing dramatic.",
      "Skipped the session and felt it the next morning.",
      "Best sleep of the month by a wide margin.",
      "Travel day, so the routine went out of the window.",
      "Back to normal after three poor nights.",
    ],
    notes: [
      "The pattern is legible now: two poor nights in a row and the resting number climbs by four the following morning. It comes back down within a day of a normal night.\n\nWhat seems to help:\n- No screens for the last hour\n- A walk after the evening meal\n- Same wake time regardless of bedtime",
      "Nothing measurable changed, but the day felt heavier than the numbers suggest. Worth noting rather than explaining away.",
      "Third week of the streak. The habit is no longer costing willpower, which is the point at which it usually survives.",
    ],
    markdown: [
      "**Streak** intact", "Watch the `resting-hr` trend",
      "*Travel* week", "==Best sleep== this month", "~~Skipped~~ made up in the evening",
    ],
    urlHost: "training.example.com",
    emailDomain: "health.example.com",
    computed: { key: "spend_per_bpm", label: "Spend / bpm", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "travel-itinerary",
    name: "Travel Itinerary",
    icon: "🧳",
    description: "Legs of a trip with dates, bookings, costs and what is still unconfirmed.",
    recordCount: 28,
    titles: [
      "Amsterdam to Lisbon flight", "Lisbon airport transfer", "Alfama apartment",
      "Time out market dinner", "Sintra day trip", "Belém morning",
      "Lisbon to Porto train", "Ribeira guesthouse", "Douro valley tour",
      "Port lodge tasting", "Porto to Santiago coach", "Cathedral quarter hotel",
      "Old town walking tour", "Santiago to Bilbao flight", "Casco Viejo apartment",
      "Guggenheim morning", "Pintxos crawl", "Bilbao to San Sebastián bus",
      "Beachfront room", "Monte Igueldo funicular", "San Sebastián to Biarritz transfer",
      "Biarritz seafront hotel", "Surf lesson", "Bayonne market morning",
      "Biarritz to Paris train", "Marais apartment", "Return flight to Amsterdam",
      "Travel insurance",
    ],
    labels: {
      number: "Duration (min)", currency: "Cost", select: "Leg type", status: "Booking status",
      multiSelect: "Needs", tags: "Country", person: "Booked by", checkbox: "Refundable",
      date: "Date", rangeStart: "Departs", rangeEnd: "Arrives", datetime: "Confirmed at",
      relation: "Connects to", rollup: "Connections", files: "Tickets",
      url: "Booking link", email: "Provider", phone: "Provider phone",
      rating: "Priority", progress: "Planning done", ring: "Budget used",
      summary: "In one line", notes: "Detail", markdown: "Warning",
    },
    status: [
      { value: "Idea", color: "gray" }, { value: "Held", color: "yellow" },
      { value: "Booked", color: "green" }, { value: "Changed", color: "orange" },
      { value: "Cancelled", color: "red" },
    ],
    select: [
      { value: "Flight", color: "blue" }, { value: "Train", color: "teal" },
      { value: "Road", color: "brown" }, { value: "Stay", color: "violet" },
      { value: "Activity", color: "lime" },
    ],
    multiSelect: [
      { value: "passport", color: "slate" }, { value: "seat-selection", color: "cyan" },
      { value: "luggage", color: "indigo" }, { value: "early-start", color: "orange" },
      { value: "step-free", color: "green" }, { value: "cash-only", color: "brown" },
    ],
    tags: ["portugal", "spain", "france", "netherlands"],
    people: ["Michel Kerkmeester", "Selma Aydın", "Rui Almeida", "Camille Roux", "Jonas Berg"],
    number: [25, 720, 0],
    currency: [8, 640],
    summaries: [
      "Held but not paid, expires in four days.",
      "Cheapest option was two hours slower for eleven euro.",
      "Step-free throughout, confirmed with the operator.",
      "Rebooked after the original was cancelled.",
      "Needs a printed ticket, no phone entry.",
    ],
    notes: [
      "The connection is tight but the two operators are in the same alliance, so a missed leg is rebooked rather than lost. That is the reason to accept the fifty minutes rather than pay for the later train.\n\nStill open:\n- Seat reservation for the second leg\n- Whether the apartment has a lift\n- Luggage storage on the last morning",
      "Cash only at the door. There is an ATM two streets north, and none at the venue.",
      "Refundable up to twenty-four hours before, which is why it was booked first.",
    ],
    markdown: [
      "**Tight** connection", "Bring the `printed` ticket",
      "*Cash only* at the door", "==Refundable==", "~~Cancelled~~ rebooked",
    ],
    urlHost: "bookings.example.com",
    emailDomain: "travel.example.com",
    computed: { key: "cost_per_hour", label: "Cost / hour", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / ([number] / 60))", unit: "number" },
  },
  {
    id: "home-inventory",
    name: "Home Inventory",
    icon: "🏠",
    description: "Owned things with purchase value, warranty window and where they are.",
    recordCount: 34,
    titles: [
      "Washing machine", "Dishwasher", "Fridge freezer", "Oven", "Induction hob",
      "Extractor fan", "Boiler", "Thermostat", "Smoke alarms", "Router",
      "Network switch", "Desktop workstation", "Laptop", "External display",
      "Mechanical keyboard", "Desk chair", "Standing desk", "Bookshelves",
      "Sofa", "Dining table", "Dining chairs", "Bed frame", "Mattress",
      "Wardrobe", "Vacuum cleaner", "Iron", "Toaster", "Kettle",
      "Coffee grinder", "Espresso machine", "Bicycle", "Bicycle lock",
      "Power drill", "Ladder",
    ],
    labels: {
      number: "Warranty (months)", currency: "Purchase price", select: "Room", status: "Condition",
      multiSelect: "Categories", tags: "Floor", person: "Owner", checkbox: "Insured",
      date: "Purchased", rangeStart: "Warranty from", rangeEnd: "Warranty to", datetime: "Last serviced",
      relation: "Part of set", rollup: "Set size", files: "Receipts",
      url: "Product page", email: "Retailer", phone: "Support line",
      rating: "Condition score", progress: "Warranty used", ring: "Depreciation",
      summary: "In one line", notes: "Service history", markdown: "Note",
    },
    status: [
      { value: "New", color: "green" }, { value: "Good", color: "cyan" },
      { value: "Worn", color: "yellow" }, { value: "Faulty", color: "orange" },
      { value: "Disposed", color: "red" },
    ],
    select: [
      { value: "Kitchen", color: "orange" }, { value: "Living room", color: "violet" },
      { value: "Study", color: "indigo" }, { value: "Bedroom", color: "pink" },
      { value: "Utility", color: "slate" }, { value: "Outside", color: "lime" },
    ],
    multiSelect: [
      { value: "appliance", color: "blue" }, { value: "furniture", color: "brown" },
      { value: "electronics", color: "indigo" }, { value: "tools", color: "slate" },
      { value: "high-value", color: "rose" }, { value: "serviceable", color: "teal" },
    ],
    tags: ["ground", "first", "loft", "garage"],
    people: ["Michel Kerkmeester", "Hanna Virtanen", "Oscar Lindgren"],
    number: [0, 120, 0],
    currency: [12, 3400],
    summaries: [
      "Out of warranty and still working.",
      "Replaced under warranty after fourteen months.",
      "Serviced annually, next one due in spring.",
      "Bought second hand, no receipt.",
      "Extended cover taken at purchase.",
    ],
    notes: [
      "Serviced once, which is when the pump was replaced. The noise it makes on the spin cycle predates that and is apparently normal for the model.\n\nWorth keeping:\n- The receipt, for the extended cover\n- The model number, which is inside the door\n- The service company's number",
      "Second hand and undocumented. Value here is an estimate, not a receipt.",
      "The extended cover is worth more than the item at this point. Not renewing.",
    ],
    markdown: [
      "**Out of warranty**", "Model on the `inside` of the door",
      "*Second hand*, no receipt", "==Insured separately==", "~~Faulty~~ repaired",
    ],
    urlHost: "products.example.com",
    emailDomain: "retail.example.com",
    computed: { key: "monthly_cost", label: "Cost / month held", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    icon: "🗓️",
    description: "Editorial pieces with channel, publish window, owner and performance.",
    recordCount: 32,
    titles: [
      "Why your database view is slow", "Ten column types, ranked", "A short history of the outliner",
      "Designing for the thumb", "What Notion got right", "What Notion got wrong",
      "Frontmatter as a schema", "Rollups explained without jargon",
      "The case against infinite scroll", "Timelines are not gantt charts",
      "How we test a renderer", "Screenshots that lie", "A week with three note apps",
      "Local-first, three years on", "The trouble with tags", "Formulas people actually use",
      "Board views and the status trap", "Migrating a thousand notes",
      "Reading a capture properly", "Why we removed a feature", "Our release cadence",
      "Mobile first, actually", "Sync conflicts and how to survive them",
      "The property panel redesign", "Six months of user reports",
      "Benchmarking on a real device", "What a gate should block", "Naming things in a plugin",
      "Deprecating a view", "The cost of an option", "An interview with a power user",
      "Roadmap, second half",
    ],
    labels: {
      number: "Word count", currency: "Production cost", select: "Channel", status: "Editorial status",
      multiSelect: "Topics", tags: "Series", person: "Author", checkbox: "Evergreen",
      date: "Publish on", rangeStart: "Draft from", rangeEnd: "Publish by", datetime: "Last edited",
      relation: "Follows on from", rollup: "Follow-ups", files: "Assets",
      url: "Live URL", email: "Editor", phone: "Studio",
      rating: "Editor rating", progress: "Draft progress", ring: "Goal attainment",
      summary: "Standfirst", notes: "Brief", markdown: "Hook",
    },
    status: [
      { value: "Idea", color: "gray" }, { value: "Drafting", color: "blue" },
      { value: "In Edit", color: "violet" }, { value: "Scheduled", color: "cyan" },
      { value: "Published", color: "green" }, { value: "Spiked", color: "red" },
    ],
    select: [
      { value: "Blog", color: "indigo" }, { value: "Newsletter", color: "teal" },
      { value: "Video", color: "rose" }, { value: "Docs", color: "brown" },
      { value: "Social", color: "pink" },
    ],
    multiSelect: [
      { value: "product", color: "blue" }, { value: "engineering", color: "indigo" },
      { value: "design", color: "violet" }, { value: "opinion", color: "orange" },
      { value: "tutorial", color: "lime" }, { value: "interview", color: "cyan" },
    ],
    tags: ["deep-dive", "changelog", "field-notes", "explainer"],
    people: ["Iris Vandenberg", "Noah Kimani", "Mira Rautio", "Étienne Girard", "Priya Raman"],
    number: [420, 4800, 0],
    currency: [0, 2400],
    summaries: [
      "Commissioned after three separate user reports asked the same question.",
      "Second in the series, and the one people will link to.",
      "Held back a week for the release it depends on.",
      "Spiked after the feature it described was removed.",
      "Best performing piece of the quarter.",
    ],
    notes: [
      "The brief is narrow on purpose. One question, one answer, one worked example, and nothing about the roadmap. The last three pieces that tried to do both did neither well.\n\nStructure:\n- The question, as a reader would ask it\n- The shortest honest answer\n- One example with real numbers\n- What it does not cover",
      "Needs the benchmark numbers before it can be scheduled. Without them it is an opinion piece with a chart.",
      "Evergreen: worth refreshing every six months rather than replacing.",
    ],
    markdown: [
      "**Evergreen** candidate", "Wait for the `0.0.24` numbers",
      "*Second* in the series", "==Top performer==", "~~Spiked~~ revived",
    ],
    urlHost: "blog.example.com",
    emailDomain: "editorial.example.com",
    computed: { key: "cost_per_word", label: "Cost / word", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / [number])", unit: "number" },
  },
  {
    id: "course-notes",
    name: "Course Notes and Study",
    icon: "🎓",
    description: "Modules with sessions, revision state, marks and what is still unread.",
    recordCount: 30,
    titles: [
      "Linear algebra: vector spaces", "Linear algebra: eigenvalues", "Probability: distributions",
      "Probability: Bayes", "Statistics: hypothesis testing", "Statistics: regression",
      "Algorithms: sorting", "Algorithms: graphs", "Algorithms: dynamic programming",
      "Data structures: trees", "Data structures: hash maps", "Operating systems: scheduling",
      "Operating systems: memory", "Networks: TCP", "Networks: routing",
      "Databases: relational model", "Databases: indexing", "Databases: transactions",
      "Compilers: parsing", "Compilers: code generation", "Distributed systems: consensus",
      "Distributed systems: replication", "Security: cryptography basics",
      "Security: threat modelling", "Machine learning: linear models",
      "Machine learning: evaluation", "Human factors: perception",
      "Human factors: interaction", "Ethics: accountability", "Ethics: consent",
    ],
    labels: {
      number: "Study minutes", currency: "Materials cost", select: "Module", status: "Revision state",
      multiSelect: "Skills", tags: "Term", person: "Lecturer", checkbox: "Examinable",
      date: "Session", rangeStart: "Covered from", rangeEnd: "Covered to", datetime: "Last revised",
      relation: "Prerequisites", rollup: "Prerequisite count", files: "Handouts",
      url: "Course page", email: "Tutor", phone: "Department",
      rating: "Confidence", progress: "Revision done", ring: "Mark",
      summary: "In one line", notes: "Notes", markdown: "Cue",
    },
    status: [
      { value: "Unread", color: "gray" }, { value: "Read Once", color: "slate" },
      { value: "Practised", color: "blue" }, { value: "Confident", color: "green" },
      { value: "Needs Revisit", color: "orange" },
    ],
    select: [
      { value: "Mathematics", color: "indigo" }, { value: "Systems", color: "teal" },
      { value: "Theory", color: "violet" }, { value: "Applied", color: "lime" },
      { value: "Society", color: "brown" },
    ],
    multiSelect: [
      { value: "proof", color: "violet" }, { value: "implementation", color: "indigo" },
      { value: "analysis", color: "cyan" }, { value: "recall", color: "yellow" },
      { value: "exam-heavy", color: "rose" }, { value: "coursework", color: "teal" },
    ],
    tags: ["autumn", "spring", "summer", "resit"],
    people: ["Dr Halima Saïd", "Prof. Anders Holm", "Dr Wei Zhang", "Dr Fiona Gallagher"],
    number: [25, 480, 0],
    currency: [0, 96],
    summaries: [
      "Fine until the worked example, then it fell apart.",
      "Third pass and it finally clicked.",
      "Examinable and badly understood, which is the worst combination.",
      "Covered twice because the first lecture was cancelled.",
      "The reading matters more than the lecture here.",
    ],
    notes: [
      "The definition is not the difficulty. The difficulty is that two of the three worked examples in the notes skip a step, and the skipped step is the one that is not obvious.\n\nTo do:\n- Rework example two from scratch\n- Find a second source for the proof\n- Practise the recall questions cold",
      "Confident on the theory, weak on the arithmetic. That is a practice problem, not a reading problem.",
      "Not examinable, and interesting anyway. Reading it after the exams.",
    ],
    markdown: [
      "**Examinable**", "Rework example `two`",
      "*Third pass* needed", "==Clicked at last==", "~~Skipped~~ covered later",
    ],
    urlHost: "courses.example.com",
    emailDomain: "university.example.com",
    computed: { key: "cost_per_hour", label: "Cost / study hour", expression: "IF(OR([number] == null, [number] == 0, [currency] == null), null, [currency] / ([number] / 60))", unit: "number" },
  },
  {
    id: "finance-reports",
    name: "Finance Reports",
    icon: "💶",
    description: "The money view kept from the original testbed: budget, actual, net and margin.",
    recordCount: 30,
    titles: [
      "Q1 compliance audit", "Q2 compliance audit", "Q3 compliance audit", "Q4 compliance audit",
      "Marketing site refresh", "Data warehouse migration", "API rate limiter",
      "Customer interviews round two", "Mobile nav bug sweep", "Pricing experiment",
      "Docs overhaul", "Incident retro actions", "SSO rollout", "Empty shell",
      "Budget reforecast", "Zero-cost cleanup", "Enterprise deal desk",
      "Accessibility pass", "Search relevance", "Notification centre",
      "Billing webhooks", "Design tokens", "Legacy import tool", "Performance budget",
      "Localisation sprint", "Security review", "Roadmap planning",
      "Vendor consolidation", "Office lease review", "Headcount plan",
    ],
    labels: {
      number: "Actual", currency: "Budget", select: "Priority", status: "Status",
      multiSelect: "Labels", tags: "Cost centre", person: "Budget holder", checkbox: "Pinned",
      date: "Due", rangeStart: "Period from", rangeEnd: "Period to", datetime: "Reviewed",
      relation: "Related", rollup: "Related count", files: "Evidence",
      url: "Report link", email: "Finance contact", phone: "Finance desk",
      rating: "Assurance", progress: "Budget used", ring: "Variance",
      summary: "Summary", notes: "Notes", markdown: "Flag",
    },
    status: [
      { value: "Backlog", color: "gray" }, { value: "In Progress", color: "blue" },
      { value: "Blocked", color: "red" }, { value: "In Review", color: "orange" },
      { value: "Done", color: "green" }, { value: "Archived", color: "purple" },
    ],
    select: [
      { value: "Low", color: "slate" }, { value: "Medium", color: "yellow" },
      { value: "High", color: "orange" }, { value: "Critical", color: "rose" },
    ],
    multiSelect: [
      { value: "research", color: "cyan" }, { value: "design", color: "violet" },
      { value: "urgent", color: "red" }, { value: "mobile", color: "teal" },
      { value: "backend", color: "indigo" }, { value: "docs", color: "brown" },
      { value: "infra", color: "lime" },
    ],
    tags: ["opex", "capex", "recharge", "grant"],
    people: ["Beatriz Lima", "Karl Jensen", "Sanne Bakker", "Omar Farouk"],
    number: [0, 92000, 0],
    currency: [0, 120000],
    summaries: [
      "Underspent against a reforecast budget.",
      "Overspent, and the variance is explained by the vendor change.",
      "Zero budget by design, tracked for completeness.",
      "Recharged to another cost centre mid-period.",
      "Awaiting the final invoice.",
    ],
    notes: [
      "The variance is a timing difference rather than an overspend. Two invoices landed in the period after the work, which moves the number without changing the total.\n\nTo confirm:\n- Whether the accrual was raised\n- The recharge split with the platform centre\n- The final vendor invoice date",
      "Zero on both sides, kept so the empty case has a real row rather than a fabricated one.",
      "Reforecast twice. The second reforecast is the one the board saw.",
    ],
    markdown: [
      "**Overspent**, explained", "Accrual raised in `P09`",
      "*Timing* difference", "==Reforecast twice==", "~~Overspent~~ recharged",
    ],
    urlHost: "finance.example.com",
    emailDomain: "finance.example.com",
    computed: { key: "margin", label: "Margin %", expression: "IF(OR([currency] == null, [number] == null, [currency] == 0), null, ([currency] - [number]) / [currency] * 100)", unit: "percent" },
  },
];

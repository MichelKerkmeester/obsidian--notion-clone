// ───────────────────────────────────────────────────────────────────
// MODULE:    mapping
// COMPONENT: neutral catalogue column type to Anytype relation format
// ───────────────────────────────────────────────────────────────────
//
// Anytype offers eleven property formats. Several of the catalogue's neutral
// types have no distinct equivalent and collapse onto one of those eleven, so
// each entry records what the mapping loses as well as what it picks.
//
// This is the contract the capture index's mapping table is written from, and
// the answer to the packet's open question about what a rollup becomes.

// ───────────────────────────────────────────────────────────────────
// 1. FORMAT TABLE
// ───────────────────────────────────────────────────────────────────

export const MAPPING = {
  title:        { format: null,           via: 'object name',  note: 'The object\'s own Name, not a property. Anytype has no separate title relation.' },
  text:         { format: 'text' },
  richText:     { format: 'text',         note: 'Anytype text relations are plain; the markdown marks are stored verbatim as characters.' },
  url:          { format: 'url' },
  email:        { format: 'email' },
  phone:        { format: 'phone' },
  number:       { format: 'number' },
  rating:       { format: 'number',       note: 'Anytype has no rating format; stored as a plain number.' },
  percent:      { format: 'number',       note: 'Anytype has no percent format; stored as a plain number, unit kept in the label.' },
  money:        { format: 'number',       note: 'Anytype has no currency format; stored as a plain number.' },
  select:       { format: 'select',       options: true },
  status:       { format: 'select',       options: true, note: 'Anytype models status as a single-value select.' },
  tag:          { format: 'multi_select', options: true },
  multiSelect:  { format: 'multi_select', options: true },
  person:       { format: 'objects',      people: true, note: 'Anytype models people as an object relation; one object per named person.' },
  checkbox:     { format: 'checkbox' },
  date:         { format: 'date' },
  dateTime:     { format: 'date',         note: 'Anytype\'s date format carries a time component, so date and dateTime share it.' },
  relation:     { format: 'objects',      links: true },
  file:         { format: 'files',        note: 'Correctly typed, values unset: the catalogue names vault paths, and the API\'s file route needs a real multipart upload.' },
  formula:      { format: 'text',         valueless: true, note: 'No Anytype equivalent. Recorded as a text relation with no per-record value; the expression is not carried over.' },
  rollup:       { format: 'text',         valueless: true, note: 'No Anytype equivalent. Recorded as text with no per-record value.' },
  createdTime:  { format: 'date',         valueless: true, note: 'Anytype supplies its own Created date; the catalogue carries no per-record value.' },
  modifiedTime: { format: 'date',         valueless: true, note: 'Anytype supplies its own Last modified date; the catalogue carries no per-record value.' },
};

/** The API rejects a naked date; everything must be RFC3339 with a zone. */
// ───────────────────────────────────────────────────────────────────
// 2. COERCIONS
// ───────────────────────────────────────────────────────────────────

export function toRfc3339(v) {
  if (typeof v !== 'string') return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00Z`;
  return v;
}

/**
 * Build the property-value entry the API expects for one column.
 * Returns undefined when the column carries no value for this record.
 */
// ───────────────────────────────────────────────────────────────────
// 3. VALUE ENTRIES
// ───────────────────────────────────────────────────────────────────

export function valueEntry(col, raw, ctx) {
  const m = MAPPING[col.type];
  if (!m || !m.format || m.valueless) return undefined;
  if (raw === undefined || raw === null || raw === '') return undefined;
  const key = ctx.key;

  switch (m.format) {
    case 'text':   return { key, text: String(raw) };
    case 'number': return { key, number: Number(raw) };
    case 'url':    return { key, url: String(raw) };
    case 'email':  return { key, email: String(raw) };
    case 'phone':  return { key, phone: String(raw) };
    case 'checkbox': return { key, checkbox: Boolean(raw) };
    case 'date': {
      const d = toRfc3339(raw);
      return d ? { key, date: d } : undefined;
    }
    case 'select': {
      const id = ctx.tagIds?.get(String(raw));
      return id ? { key, select: id } : undefined;
    }
    case 'multi_select': {
      const ids = (Array.isArray(raw) ? raw : [raw])
        .map((v) => ctx.tagIds?.get(String(v)))
        .filter(Boolean);
      return ids.length ? { key, multi_select: ids } : undefined;
    }
    case 'objects': {
      // People resolve now; record-to-record links resolve on the second pass,
      // once every object in the set has an id.
      const names = Array.isArray(raw) ? raw : [raw];
      const ids = names.map((n) => ctx.objectIds?.get(String(n))).filter(Boolean);
      return ids.length ? { key, objects: ids } : undefined;
    }
    case 'files':
      return undefined;
    default:
      return undefined;
  }
}

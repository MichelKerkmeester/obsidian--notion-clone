// ───────────────────────────────────────────────────────────────────
// MODULE:    api
// COMPONENT: client for Anytype's local HTTP API, with its rate limiter
// ───────────────────────────────────────────────────────────────────
//
// The desktop app serves this API on port 31009 and gates it behind an app key
// obtained through a pairing challenge: POST /v1/auth/challenges opens a window
// showing a 4-digit code, and POST /v1/auth/api_keys trades that code for a key.
// See the packet README for that flow; everything here assumes the key exists.
//
// The API is the fast path for the whole data load. What it cannot do is create a
// view: POST /v1/spaces/{id}/lists/{id}/views is not routed, and neither is
// DELETE on a space.
// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFile } from 'node:fs/promises';

const BASE = process.env.ANYTYPE_API || 'http://localhost:31009/v1';

export async function loadKey() {
  const path = process.env.ANYTYPE_KEY_FILE;
  if (!path) throw new Error('ANYTYPE_KEY_FILE is not set');
  return (await readFile(path, 'utf8')).trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────────────────────────────────────────────────
// 2. CLIENT
// ───────────────────────────────────────────────────────────────────

export class Anytype {
  #pauseUntil = 0;

  constructor(key) {
    this.key = key;
  }

  static async connect() {
    return new Anytype(await loadKey());
  }

  // The API is rate limited to roughly one write per second with a burst of
  // seven, and answers an overrun with 429 rather than queueing. Both the
  // pacing and the retry live here: a bulk load makes thousands of calls, and
  // a limiter handled at the call sites would be re-handled at every one.
  async req(method, path, body, attempt = 0) {
    if (this.#pauseUntil > Date.now()) await sleep(this.#pauseUntil - Date.now());
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.key}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    // Spend the burst, then hold at the refill rate rather than earning a 429.
    const remaining = Number(res.headers.get('ratelimit-remaining'));
    const reset = Number(res.headers.get('ratelimit-reset')) || 1;
    if (Number.isFinite(remaining) && remaining <= 1) this.#pauseUntil = Date.now() + reset * 1000 + 100;

    const text = await res.text();
    let parsed;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

    if (res.status === 429 && attempt < 8) {
      await sleep(reset * 1000 + 250 * (attempt + 1));
      return this.req(method, path, body, attempt + 1);
    }
    if (!res.ok) {
      const msg = parsed?.message ?? String(parsed).slice(0, 200);
      throw new Error(`${method} ${path} -> ${res.status}: ${msg}`);
    }
    return parsed;
  }

  // Paged GETs. The API caps limit at 100 and reports has_more, so a caller that
  // reads pagination.total without walking the pages undercounts silently.
  async all(path) {
    const out = [];
    for (let offset = 0; ; offset += 100) {
      const sep = path.includes('?') ? '&' : '?';
      const page = await this.req('GET', `${path}${sep}limit=100&offset=${offset}`);
      out.push(...(page.data ?? []));
      if (!page.pagination?.has_more) return out;
    }
  }

  spaces() { return this.all('/spaces'); }
  createSpace(name, description) { return this.req('POST', '/spaces', { name, description }); }

  properties(sp) { return this.all(`/spaces/${sp}/properties`); }
  createProperty(sp, name, format) { return this.req('POST', `/spaces/${sp}/properties`, { name, format }); }
  deleteProperty(sp, id) { return this.req('DELETE', `/spaces/${sp}/properties/${id}`); }

  tags(sp, propId) { return this.all(`/spaces/${sp}/properties/${propId}/tags`); }
  createTag(sp, propId, name, color) { return this.req('POST', `/spaces/${sp}/properties/${propId}/tags`, { name, color }); }

  types(sp) { return this.all(`/spaces/${sp}/types`); }
  createType(sp, body) { return this.req('POST', `/spaces/${sp}/types`, body); }
  deleteType(sp, id) { return this.req('DELETE', `/spaces/${sp}/types/${id}`); }

  createObject(sp, body) { return this.req('POST', `/spaces/${sp}/objects`, body); }
  updateObject(sp, id, body) { return this.req('PATCH', `/spaces/${sp}/objects/${id}`, body); }
  deleteObject(sp, id) { return this.req('DELETE', `/spaces/${sp}/objects/${id}`); }
  objects(sp) { return this.all(`/spaces/${sp}/objects`); }

  addToList(sp, listId, ids) { return this.req('POST', `/spaces/${sp}/lists/${listId}/objects`, { objects: ids }); }
  listViews(sp, listId) { return this.all(`/spaces/${sp}/lists/${listId}/views`); }
  listViewObjects(sp, listId, viewId) { return this.all(`/spaces/${sp}/lists/${listId}/views/${viewId}/objects`); }
}

// Anytype's tag palette. Options cycle through it so a Kanban board's columns
// and a select's chips are visually distinguishable rather than all grey.

// ───────────────────────────────────────────────────────────────────
// 3. PALETTE
// ───────────────────────────────────────────────────────────────────

export const COLORS = ['grey', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'ice', 'teal', 'lime'];

// ───────────────────────────────────────────────────────────────────
// MODULE:    cdp
// COMPONENT: raw Chrome DevTools Protocol client for the Anytype renderer
// ───────────────────────────────────────────────────────────────────
//
// Playwright's connectOverCDP hangs for 30 seconds against this Electron build,
// so the raw JSON-RPC protocol is the only transport that connects to it.
//
// Everything this sends runs inside the renderer's own JS engine. Runtime.evaluate
// executes in the page, so an el.click() is a real React click the renderer
// dispatched itself, and Page.captureScreenshot renders from the page rather than
// the screen. Neither moves the OS pointer, changes the frontmost application, or
// takes keyboard focus, which is what makes it safe to drive an app while its
// operator is using the same machine.

// ───────────────────────────────────────────────────────────────────
// 1. TRANSPORT
// ───────────────────────────────────────────────────────────────────

/* global WebSocket */

const PORT = process.env.ANYTYPE_CDP_PORT || '9222';

export async function listTargets() {
  const res = await fetch(`http://localhost:${PORT}/json`);
  if (!res.ok) throw new Error(`CDP /json returned ${res.status}`);
  return res.json();
}

/** The renderer running the app shell (index.html), not the tab-strip chrome. */
export async function findAppTarget() {
  const targets = await listTargets();
  const app = targets.find(
    (t) => t.type === 'page' && t.url.includes('/dist/index.html'),
  );
  if (!app) {
    throw new Error(
      `no Anytype app page target; saw: ${targets.map((t) => `${t.type} ${t.url}`).join(', ')}`,
    );
  }
  return app;
}

// ───────────────────────────────────────────────────────────────────
// 2. CLIENT
// ───────────────────────────────────────────────────────────────────

export class CDP {
  #ws;
  #id = 0;
  #pending = new Map();

  static async attach(wsUrl) {
    const c = new CDP();
    await c.#connect(wsUrl);
    return c;
  }

  #connect(wsUrl) {
    return new Promise((resolve, reject) => {
      this.#ws = new WebSocket(wsUrl);
      this.#ws.addEventListener('open', () => resolve());
      this.#ws.addEventListener('error', (e) => reject(new Error(`CDP socket error: ${e.message ?? e}`)));
      this.#ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data);
        const p = this.#pending.get(msg.id);
        if (!p) return;
        this.#pending.delete(msg.id);
        if (msg.error) p.reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else p.resolve(msg.result);
      });
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.#pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
      }, 60_000);
    });
  }

  /** Evaluate an expression in the page and return its value. Rejects on a thrown error. */
  async eval(expression, { awaitPromise = true } = {}) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`page threw: ${d.exception?.description ?? d.text}`);
    }
    return r.result.value;
  }

  async screenshot(path, { format = 'png' } = {}) {
    const { data } = await this.send('Page.captureScreenshot', { format, captureBeyondViewport: false });
    const { writeFile } = await import('node:fs/promises');
    await writeFile(path, Buffer.from(data, 'base64'));
    return path;
  }

  close() {
    this.#ws?.close();
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. ATTACH
// ───────────────────────────────────────────────────────────────────

export async function attachToApp() {
  const t = await findAppTarget();
  return CDP.attach(t.webSocketDebuggerUrl);
}

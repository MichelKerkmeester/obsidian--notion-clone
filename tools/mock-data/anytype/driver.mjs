// ───────────────────────────────────────────────────────────────────
// MODULE:    driver
// COMPONENT: DOM driver for the Anytype renderer over CDP
// ───────────────────────────────────────────────────────────────────
//
// Views are driven through the renderer because the local HTTP API cannot create
// one. Every action here is dispatched by the page itself, so none of it moves
// the pointer, activates the window, or takes focus.
//
// Two of the app's own behaviours shape this file. Menus open submenus on
// mouseenter and explicitly ignore a click on those rows, and the app latches a
// mouse-disabled flag after any key press that only a mousemove clears.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { listTargets, CDP } from './cdp.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Layout labels as the picker renders them, in the order the brief asks for. */
export const LAYOUTS = ['Grid', 'Gallery', 'List', 'Kanban', 'Calendar', 'Graph'];

// ───────────────────────────────────────────────────────────────────
// 2. DRIVER
// ───────────────────────────────────────────────────────────────────

export class Driver {
  constructor(cdp) { this.c = cdp; }

  /**
   * Attach to the app tab that is already inside the demo space. A second tab
   * exists on the operator's default space; picking the wrong one silently
   * drives the wrong vault, so the caller names the target explicitly.
   */
  static async attach(targetId) {
    const targets = await listTargets();
    const t = targetId
      ? targets.find((x) => x.id === targetId)
      : targets.find((x) => x.type === 'page' && x.url.includes('/dist/index.html'));
    if (!t) throw new Error(`no app target${targetId ? ` ${targetId}` : ''}`);
    return new Driver(await CDP.attach(t.webSocketDebuggerUrl));
  }

  eval(expr) { return this.c.eval(expr); }
  close() { this.c.close(); }

  async key(key, code, vk) {
    await this.c.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk });
    await this.c.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
  }

  /** Close every open menu. Two presses: a submenu and its parent stack. */
  async escape(times = 3) {
    for (let i = 0; i < times; i += 1) { await this.key('Escape', 'Escape', 27); await sleep(300); }
  }

  async click(selector, { wait = 700, optional = false } = {}) {
    const r = await this.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(selector)});
      if (!e) return 'MISSING';
      e.click();
      return 'ok';
    })()`);
    if (r === 'MISSING' && !optional) throw new Error(`no element for ${selector}`);
    await sleep(wait);
    return r === 'ok';
  }

  /** Click the descendant of `scope` whose trimmed text equals `text`. */
  async clickByText(scope, itemSelector, text, { wait = 700 } = {}) {
    const r = await this.eval(`(() => {
      const root = document.querySelector(${JSON.stringify(scope)});
      if (!root) return 'NOSCOPE';
      const want = ${JSON.stringify(text)};
      const el = Array.from(root.querySelectorAll(${JSON.stringify(itemSelector)}))
        .find(e => (e.innerText || '').trim().split('\\n')[0].trim() === want);
      if (!el) return 'NOITEM:' + JSON.stringify(Array.from(root.querySelectorAll(${JSON.stringify(itemSelector)})).map(e => (e.innerText||'').trim().split('\\n')[0]).slice(0, 30));
      el.click();
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`clickByText(${scope} ${itemSelector} "${text}") -> ${r}`);
    await sleep(wait);
  }

  async waitFor(selector, timeoutMs = 8000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.eval(`!!document.querySelector(${JSON.stringify(selector)})`)) return true;
      await sleep(250);
    }
    throw new Error(`timed out waiting for ${selector}`);
  }

  /**
   * Type into a React-controlled input. Setting .value directly does not reach
   * React's synthetic layer, so the text goes through Input.insertText after the
   * element is focused, which is the same path a keystroke takes.
   */
  async typeInto(selector, text) {
    await this.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (e) { e.focus(); e.select?.(); } })()`);
    await sleep(200);
    await this.c.send('Input.insertText', { text });
    await sleep(400);
  }

  async openCollection(collectionId, spaceId) {
    // Bounce through the app's empty route so React remounts the dataview
    // instead of reusing the previous collection's already-rendered rows.
    await this.eval(`window.__anytypeHistory.push('/main/void/empty')`);
    await sleep(600);
    await this.eval(`window.__anytypeHistory.push('/main/set/${collectionId}/spaceId/${spaceId}')`);
    await this.waitFor('#dataviewControls', 15000);
    await sleep(1800);
  }

  viewNames() {
    return this.eval(`JSON.stringify(Array.from(document.querySelectorAll('#views .viewItem')).map(e => (e.innerText||'').trim()))`)
      .then(JSON.parse);
  }

  rowCount() { return this.eval(`document.querySelectorAll('.viewContent .row').length`); }
}

// ───────────────────────────────────────────────────────────────────
// 3. EXPORTS
// ───────────────────────────────────────────────────────────────────

export { sleep };

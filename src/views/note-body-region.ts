// ───────────────────────────────────────────────────────────────────
// MODULE:    note-body-region
// COMPONENT: the record's markdown body, read below its properties and
//            editable in place
// ───────────────────────────────────────────────────────────────────
//
// Two modes over one string. Reading hands the markdown to Obsidian's own
// renderer, so links, embeds, task checkboxes and transclusions arrive as a
// consequence of using the real renderer rather than as separate work. Tapping
// swaps that for a textarea, because a permanently raw textarea would show none
// of it — the reason this is not simply an always-open input.
//
// The renderer is injected rather than imported. Nothing here needs to know it
// is Obsidian's, which keeps the mode machinery — swap, draft, debounce, commit
// — testable without a live App, and makes it explicit that the rendering
// itself is not this module's to verify.
//
// The draft is held here and committed on a timer, so a save is not a keystroke.
// `flush` exists because every other exit from edit mode has to be able to force
// that timer to resolve now: blur, Escape, the panel closing, and the panel
// rebuilding itself underneath an open editor.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface NoteBodyRegionOptions {
  parent: HTMLElement;
  /** The note's current body text. */
  body: string;
  /** Rendered-mode content builder. Given an empty target and the markdown to fill it with. */
  renderMarkdown: (target: HTMLElement, markdown: string) => void;
  /** Called with the whole body text, debounced while typing and immediately on every exit. */
  onCommit: (next: string) => void;
  /** Shown in place of the body when there is none yet. */
  placeholder: string;
  readOnly?: boolean;
  /** Overridable so a test does not have to wait out the real delay. */
  commitDelayMs?: number;
}

export interface NoteBodyRegion {
  el: HTMLElement;
  isEditing: () => boolean;
  /** The current text, including edits not yet committed. */
  draft: () => string;
  beginEdit: (caret?: number) => void;
  /** The caret position, so an editor rebuilt under the user can put it back. */
  caret: () => number;
  /** Commit any pending text now rather than when the timer expires. */
  flush: () => void;
  destroy: () => void;
}

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

// Long enough that ordinary typing produces one write rather than one per word, short enough that
// a note put down mid-sentence is already on disk. This is a save interval, not a motion value, so
// it is not a step on any duration scale and does not belong on one.
const COMMIT_DELAY_MS = 500;

// ───────────────────────────────────────────────────────────────────
// 3. MOUNT
// ───────────────────────────────────────────────────────────────────

export function mountNoteBodyRegion(options: NoteBodyRegionOptions): NoteBodyRegion {
  const { parent, renderMarkdown, onCommit, placeholder, readOnly = false } = options;
  const doc = parent.ownerDocument;
  const view = doc.defaultView;
  const delay = options.commitDelayMs ?? COMMIT_DELAY_MS;

  const el = doc.createElement("div");
  el.className = "db-record-detail-body";
  parent.appendChild(el);

  let draft = options.body;
  let committed = options.body;
  let editor: HTMLTextAreaElement | null = null;
  let timer: number | undefined;

  const clearTimer = (): void => {
    if (timer === undefined) return;
    view?.clearTimeout(timer);
    timer = undefined;
  };

  const commitNow = (): void => {
    clearTimer();
    if (draft === committed) return;
    committed = draft;
    onCommit(draft);
  };

  const scheduleCommit = (): void => {
    clearTimer();
    timer = view?.setTimeout(commitNow, delay);
  };

  // ─────────────────────────────────────────────────────────────────
  // 3a. READ MODE
  // ─────────────────────────────────────────────────────────────────

  const renderRead = (): void => {
    editor = null;
    el.replaceChildren();
    el.classList.remove("is-editing");
    const content = doc.createElement("div");
    content.className = "db-record-detail-body-rendered";
    el.appendChild(content);
    if (draft.trim() === "") {
      content.classList.add("is-empty");
      content.textContent = placeholder;
    } else {
      renderMarkdown(content, draft);
    }
    if (readOnly) return;
    // Reachable by thumb and by keyboard. The surrounding rows are tap-to-edit divs with no
    // keyboard route at all; a body is long-form text and the one region here worth being able to
    // reach without a pointer, so it takes a tab stop and Enter opens it.
    content.tabIndex = 0;
    content.addEventListener("click", () => beginEdit());
    content.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      beginEdit();
    });
  };

  // ─────────────────────────────────────────────────────────────────
  // 3b. EDIT MODE
  // ─────────────────────────────────────────────────────────────────

  /**
   * Grow the box to its content instead of scrolling inside it.
   *
   * The sheet is already a scroll container, and a textarea with its own scrollbar inside it gives
   * a phone two nested ones over the same gesture — the inner box swallows the flick and the sheet
   * below it stops moving. Growing keeps one scroller on the surface.
   */
  const fit = (target: HTMLTextAreaElement): void => {
    if (!Number.isFinite(target.scrollHeight)) return;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const beginEdit = (caretAt?: number): void => {
    if (readOnly || editor) return;
    el.replaceChildren();
    el.classList.add("is-editing");
    const area = doc.createElement("textarea");
    area.className = "db-record-detail-body-editor";
    area.value = draft;
    area.placeholder = placeholder;
    area.rows = 1;
    el.appendChild(area);
    editor = area;

    area.addEventListener("input", () => {
      draft = area.value;
      fit(area);
      scheduleCommit();
    });
    area.addEventListener("blur", () => {
      draft = area.value;
      commitNow();
      renderRead();
    });
    area.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // The panel closes on Escape. A focused editor owns the first one and leaves the sheet open,
      // which is the same order the field editors on this surface already follow.
      event.preventDefault();
      event.stopPropagation();
      draft = area.value;
      commitNow();
      renderRead();
    });

    area.focus();
    const at = caretAt ?? draft.length;
    area.setSelectionRange?.(at, at);
    fit(area);
  };

  renderRead();

  // ─────────────────────────────────────────────────────────────────
  // 3c. HANDLE
  // ─────────────────────────────────────────────────────────────────

  return {
    el,
    isEditing: () => editor !== null,
    draft: () => (editor ? editor.value : draft),
    caret: () => editor?.selectionStart ?? 0,
    beginEdit,
    flush: () => {
      if (editor) draft = editor.value;
      commitNow();
    },
    destroy: () => {
      if (editor) draft = editor.value;
      commitNow();
      editor = null;
      el.remove();
    },
  };
}

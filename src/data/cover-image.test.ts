// ───────────────────────────────────────────────────────────────────
// MODULE:    cover-image.test
// COMPONENT: Coverage that external/scheme-typed cover values never resolve through vault APIs
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────
import { describe, expect, it, vi } from "vitest";
import { TFile, type App, type CachedMetadata } from "obsidian";
import { isCoverImageBlocked, parseCoverImage, resolveCoverImage } from "./cover-image";
import type { RowData } from "./types";

vi.mock("obsidian", () => ({
  TFile: class {},
}));

type TestFile = RowData["file"];

function row(frontmatter: Record<string, unknown> = {}): RowData {
  return { file: { path: "Notes/Row.md" } as TestFile, frontmatter, computed: {} };
}

/** Build a real instance of the mocked TFile class so `instanceof TFile` checks
 *  in the production code (e.g. CoverImage's internal-target resolution) hold. */
function makeVaultFile(path: string): TestFile {
  const file = new TFile();
  return Object.assign(file, { path }) as unknown as TestFile;
}

function appWithDestination(destination: TestFile | null): App & {
  getFirstLinkpathDest: ReturnType<typeof vi.fn>;
  getResourcePath: ReturnType<typeof vi.fn>;
} {
  const getFirstLinkpathDest = vi.fn(() => destination);
  const getResourcePath = vi.fn(() => "app://local-resource/cover.png");
  return {
    metadataCache: { getFirstLinkpathDest },
    vault: { getResourcePath },
    getFirstLinkpathDest,
    getResourcePath,
  } as unknown as App & {
    getFirstLinkpathDest: ReturnType<typeof vi.fn>;
    getResourcePath: ReturnType<typeof vi.fn>;
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────
describe("CoverImage safety: external URLs never yield a network src for Files columns", () => {
  it("marks a hand-typed raw https URL as external, never touching vault resolution", () => {
    const app = appWithDestination(null);

    const image = parseCoverImage("https://evil.example/x.png", row(), app);

    expect(image).not.toBeNull();
    expect(image?.external).toBe(true);
    expect(image?.target).toBe("https://evil.example/x.png");
    // External targets resolve to themselves without ever calling the vault —
    // there is no vault path that legitimizes an external URL.
    expect(app.getFirstLinkpathDest).not.toHaveBeenCalled();
    expect(app.getResourcePath).not.toHaveBeenCalled();
  });

  it("resolveCoverImage surfaces the same external flag through frontmatter", () => {
    const app = appWithDestination(null);
    const source = row({ cover: "https://evil.example/x.png" });

    const image = resolveCoverImage("cover", source, app);

    expect(image?.external).toBe(true);
  });

  it("fails closed (null) for a dangling internal wikilink that does not resolve to a vault file", () => {
    const app = appWithDestination(null);

    const image = parseCoverImage("[[Missing.png]]", row(), app);

    expect(image).toBeNull();
    expect(app.getFirstLinkpathDest).toHaveBeenCalledWith("Missing.png", "Notes/Row.md");
  });

  it("resolves an internal vault link to a real local src (happy path)", () => {
    const destination = makeVaultFile("Attachments/cover.png");
    const app = appWithDestination(destination);

    const image = parseCoverImage("[[cover.png]]", row(), app);

    expect(image).not.toBeNull();
    expect(image?.external).toBe(false);
    expect(image?.src).toBe("app://local-resource/cover.png");
    expect(app.getResourcePath).toHaveBeenCalledWith(destination);
  });

  it("blocks an external image only when the source column is a Files/Attachments column", () => {
    const app = appWithDestination(null);
    const externalImage = parseCoverImage("https://evil.example/x.png", row(), app);
    if (!externalImage) throw new Error("expected an external image to parse");

    // The exact guard used by GalleryRenderer/BoardRenderer before painting a cover <img>.
    expect(isCoverImageBlocked(externalImage, "files")).toBe(true);

    // A URL-typed (non-Files) cover field is allowed to render network images by design.
    expect(isCoverImageBlocked(externalImage, "text")).toBe(false);
    expect(isCoverImageBlocked(externalImage, undefined)).toBe(false);
  });

  it("never blocks a resolved internal image regardless of column type", () => {
    const destination = makeVaultFile("Attachments/cover.png");
    const app = appWithDestination(destination);
    const internalImage = parseCoverImage("[[cover.png]]", row(), app);
    if (!internalImage) throw new Error("expected an internal image to resolve");

    expect(isCoverImageBlocked(internalImage, "files")).toBe(false);
    expect(isCoverImageBlocked(internalImage, "text")).toBe(false);
  });

  it("treats a missing/unresolved image as blocked via the caller's null check, same as the renderers", () => {
    const app = appWithDestination(null);
    const missing = parseCoverImage("[[Missing.png]]", row(), app);

    // Mirrors `if (!image || isCoverImageBlocked(image, coverColumn?.type))` verbatim.
    const blocked = !missing || isCoverImageBlocked(missing, "files");
    expect(blocked).toBe(true);
  });

  // These three used to assert the opposite — that a javascript: or data: cover PARSED, as long
  // as it ended in an image extension. That was the defect written down as the intent: the
  // extension test only looks at the end of the string, so a fragment is enough to satisfy it
  // while the scheme in front is what actually gets opened.
  //
  // The exact strings are pinned rather than described. A rule stated in prose can be satisfied by
  // a parser that rejects for some unrelated reason, and these are the inputs that must not parse.
  it.each([
    ["javascript:", "javascript:alert(document.domain)#x.png"],
    ["data: with an html payload", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==#a.png"],
    ["file:", "file:///etc/passwd#x.png"],
  ])("refuses a %s cover target that ends in an image extension", (_label, target) => {
    const app = appWithDestination(null);

    expect(parseCoverImage(target, row(), app)).toBeNull();
    // Rejected before resolution, not after: a target that reached the vault would already have
    // been treated as a path.
    expect(app.getFirstLinkpathDest).not.toHaveBeenCalled();
    expect(app.getResourcePath).not.toHaveBeenCalled();
  });

  it("refuses a data:image cover even though the payload is a real image type", () => {
    const app = appWithDestination(null);

    // The one case a reviewer argued was legitimate. It is still refused, because the parser
    // cannot tell this from the html payload above without trusting the string's own claim about
    // itself — and a cover has no need of an inline data URI when the vault can hold the file.
    expect(parseCoverImage("data:image/png;base64,iVBORw0KGgo=#a.png", row(), app)).toBeNull();
  });

  it("still parses the http(s) cover the allowlist exists to permit", () => {
    const app = appWithDestination(null);

    const image = parseCoverImage("https://example.com/real.png", row(), app);

    expect(image).not.toBeNull();
    expect(image?.external).toBe(true);
    expect(image?.target).toBe("https://example.com/real.png");
    expect(app.getFirstLinkpathDest).not.toHaveBeenCalled();
  });

  it("blocks an http(s) cover image from a Files column", () => {
    const app = appWithDestination(null);
    const image = parseCoverImage("https://example.com/real.png", row(), app);
    if (!image) throw new Error("expected the https image to parse as external");

    expect(isCoverImageBlocked(image, "files")).toBe(true);
    expect(isCoverImageBlocked(image, "text")).toBe(false);
  });

  it("still resolves an internal wikilink cover to a real local src after the scheme-detection fix", () => {
    const destination = makeVaultFile("Attachments/cover.png");
    const app = appWithDestination(destination);

    const image = parseCoverImage("[[cover.png]]", row(), app);

    expect(image).not.toBeNull();
    expect(image?.external).toBe(false);
    expect(image?.src).toBe("app://local-resource/cover.png");
  });

  it("falls back to the first cached markdown image when the cover property is empty", () => {
    const destination = makeVaultFile("Attachments/embedded.png");
    const app = appWithDestination(destination);
    // Only the embed link is read here; a full metadata fixture would be noise.
    const cache = { embeds: [{ link: "Attachments/embedded.png" }] } as unknown as CachedMetadata;
    app.metadataCache.getFileCache = vi.fn((_file: TFile) => cache);

    const image = resolveCoverImage(undefined, row(), app);

    expect(image?.target).toBe("Attachments/embedded.png");
    expect(app.metadataCache.getFileCache).toHaveBeenCalled();
  });
});

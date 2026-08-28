import { overlayStack } from "./OverlayStack";

export interface PopoverAutoCloseOptions {
  panel: HTMLElement;
  anchorEl?: HTMLElement;
  close: () => void;
  parentId?: string;
  delayMs?: number;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
  isActiveTarget?(target: EventTarget | null): boolean;
}

export function installPopoverAutoClose(options: PopoverAutoCloseOptions): () => void {
  // Kept for source compatibility with callers that used to pass a timeout.
  // Dismissal is now owned by the shared stack and never depends on elapsed time.
  void options.delayMs;
  void options.isActiveTarget;
  const registration = overlayStack.register({
    panel: options.panel,
    anchor: options.anchorEl,
    parentId: options.parentId,
    close: options.close,
    closeOnOutsidePointerDown: options.closeOnOutsidePointerDown,
    closeOnEscape: options.closeOnEscape,
  });
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    registration.unregister();
  };
}

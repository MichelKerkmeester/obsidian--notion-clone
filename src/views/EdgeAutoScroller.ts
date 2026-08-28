export interface EdgeAutoScrollerBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface EdgeAutoScrollerOptions {
  edgeSize?: number;
  maxSpeed?: number;
  acceleration?: number;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (handle: number) => void;
}

export interface EdgeScrollVelocity {
  x: number;
  y: number;
}

export const DEFAULT_EDGE_SIZE = 40;
export const DEFAULT_MAX_SPEED = 18;
export const DEFAULT_ACCELERATION = 0.8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getAnimationFrame(options: EdgeAutoScrollerOptions): (callback: FrameRequestCallback) => number {
  return options.requestAnimationFrame || ((callback) => window.requestAnimationFrame(callback));
}

function getCancelAnimationFrame(options: EdgeAutoScrollerOptions): (handle: number) => void {
  return options.cancelAnimationFrame || ((handle) => window.cancelAnimationFrame(handle));
}

/** Return a signed velocity for one axis when the pointer is close to an edge. */
export function calculateEdgeVelocity(
  position: number,
  start: number,
  end: number,
  edgeSize = DEFAULT_EDGE_SIZE,
  maxSpeed = DEFAULT_MAX_SPEED,
): number {
  if (!Number.isFinite(position) || !Number.isFinite(start) || !Number.isFinite(end)) return 0;
  const size = Math.max(1, edgeSize);
  const max = Math.max(0, maxSpeed);
  if (position < start + size) {
    return -max * Math.pow(clamp((start + size - position) / size, 0, 1), 2);
  }
  if (position > end - size) {
    return max * Math.pow(clamp((position - (end - size)) / size, 0, 1), 2);
  }
  return 0;
}

export function getEdgeScrollVelocity(
  pointerX: number,
  pointerY: number,
  bounds: EdgeAutoScrollerBounds,
  options: Pick<EdgeAutoScrollerOptions, "edgeSize" | "maxSpeed"> = {},
): EdgeScrollVelocity {
  return {
    x: calculateEdgeVelocity(pointerX, bounds.left, bounds.right, options.edgeSize, options.maxSpeed),
    y: calculateEdgeVelocity(pointerY, bounds.top, bounds.bottom, options.edgeSize, options.maxSpeed),
  };
}

/**
 * Keeps a scrollable container moving while a drag pointer remains near one
 * of its edges. The pointer is updated independently from the animation loop
 * so a slow drag does not create a new timer or listener per frame.
 */
export class EdgeAutoScroller {
  private pointer: { x: number; y: number } | null = null;
  private frameHandle: number | null = null;
  private velocity: EdgeScrollVelocity = { x: 0, y: 0 };
  private readonly edgeSize: number;
  private readonly maxSpeed: number;
  private readonly acceleration: number;
  private readonly requestFrame: (callback: FrameRequestCallback) => number;
  private readonly cancelFrame: (handle: number) => void;

  constructor(private readonly container: HTMLElement, options: EdgeAutoScrollerOptions = {}) {
    this.edgeSize = Math.max(1, options.edgeSize ?? DEFAULT_EDGE_SIZE);
    this.maxSpeed = Math.max(0, options.maxSpeed ?? DEFAULT_MAX_SPEED);
    this.acceleration = clamp(options.acceleration ?? DEFAULT_ACCELERATION, 0.01, 1);
    this.requestFrame = getAnimationFrame(options);
    this.cancelFrame = getCancelAnimationFrame(options);
  }

  updatePointer(clientX: number, clientY: number): void {
    this.pointer = { x: clientX, y: clientY };
    this.recalculateVelocity();
    if (this.hasVelocity()) this.schedule();
    else this.stopFrame();
  }

  update(event: Pick<PointerEvent, "clientX" | "clientY"> | Pick<DragEvent, "clientX" | "clientY">): void {
    this.updatePointer(event.clientX, event.clientY);
  }

  stop(): void {
    this.pointer = null;
    this.velocity = { x: 0, y: 0 };
    this.stopFrame();
  }

  destroy(): void {
    this.stop();
  }

  isRunning(): boolean {
    return this.frameHandle !== null;
  }

  getVelocity(): EdgeScrollVelocity {
    return { ...this.velocity };
  }

  private getBounds(): EdgeAutoScrollerBounds {
    const rect = this.container.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  }

  private recalculateVelocity(): void {
    if (!this.pointer) {
      this.velocity = { x: 0, y: 0 };
      return;
    }
    this.velocity = getEdgeScrollVelocity(this.pointer.x, this.pointer.y, this.getBounds(), {
      edgeSize: this.edgeSize,
      maxSpeed: this.maxSpeed,
    });
  }

  private hasVelocity(): boolean {
    return this.velocity.x !== 0 || this.velocity.y !== 0;
  }

  private schedule(): void {
    if (this.frameHandle !== null) return;
    this.frameHandle = this.requestFrame(() => {
      this.frameHandle = null;
      this.scrollFrame();
    });
  }

  private scrollFrame(): void {
    if (!this.pointer) return;
    this.recalculateVelocity();
    if (!this.hasVelocity()) return;

    const horizontalRoom = Math.max(0, this.container.scrollWidth - this.container.clientWidth);
    const verticalRoom = Math.max(0, this.container.scrollHeight - this.container.clientHeight);
    const nextLeft = clamp(this.container.scrollLeft + this.velocity.x, 0, horizontalRoom);
    const nextTop = clamp(this.container.scrollTop + this.velocity.y, 0, verticalRoom);
    const moved = nextLeft !== this.container.scrollLeft || nextTop !== this.container.scrollTop;
    this.container.scrollLeft = nextLeft;
    this.container.scrollTop = nextTop;

    if (moved) {
      this.velocity = {
        x: this.velocity.x * (1 + this.acceleration),
        y: this.velocity.y * (1 + this.acceleration),
      };
      this.velocity.x = clamp(this.velocity.x, -this.maxSpeed, this.maxSpeed);
      this.velocity.y = clamp(this.velocity.y, -this.maxSpeed, this.maxSpeed);
      this.schedule();
    } else {
      this.stopFrame();
    }
  }

  private stopFrame(): void {
    if (this.frameHandle === null) return;
    this.cancelFrame(this.frameHandle);
    this.frameHandle = null;
  }
}

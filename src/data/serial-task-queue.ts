// ───────────────────────────────────────────────────────────────────
// MODULE:    serial-task-queue
// COMPONENT: Runs asynchronous UI transactions in invocation order and stays usable after a failure.
// ───────────────────────────────────────────────────────────────────
//
// `tail` is chained with a `.catch(() => undefined)` so one failed task never
// poisons the queue for later `enqueue` calls — but the promise returned to
// THIS caller (`result`, not `tail`) is not swallowed, so the caller still
// sees its own task's rejection.

// ───────────────────────────────────────────────────────────────────
// 1. SERIAL TASK QUEUE
// ───────────────────────────────────────────────────────────────────

export class SerialTaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task, task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

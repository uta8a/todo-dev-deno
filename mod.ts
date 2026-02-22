/**
 * @example
 * ```ts
 * import { createTodo } from "jsr:@uta8a/todo-dev-deno";
 *
 * const todo = createTodo();
 * ```
 * @module
 */

/**
 * Call site information for a TODO, including the function or filename, line number,
 * and column number.
 */
export type CallSite = {
  /** Function name */
  name: string;
  /** 1-based line number in the source file. */
  line: number;
  /** 1-based column number in the source file. */
  col: number;
};

/**
 * Event payload passed to the `onTodo` handler when a TODO is triggered.
 *
 * - `message`: optional user-provided message describing the TODO.
 * - `site`: the call site information where the TODO was invoked.
 */
export type TodoEvent = {
  /** Optional message describing the TODO. */
  message?: string;
  /** Call site information where the TODO was created. */
  site: CallSite;
};

/**
 * Configuration for a TODO function.
 *
 * - `onTodo`: handler called when the TODO is executed. It is expected to
 *   never return (e.g. throw or terminate the process).
 * - `stackFrameSkip`: number of stack frames to skip when resolving the
 *   call site. This is used to ignore internal frames from this library.
 */
export type TodoConfig = {
  /**
   * Handler invoked when a TODO is triggered. Implementations should not
   * return (return type `never`).
   */
  onTodo: (ctx: TodoEvent) => never;
  /** Number of internal stack frames to skip when determining call site. */
  stackFrameSkip: number;
};

/**
 * A TODO function returned by `createTodo`.
 *
 * It is callable as a function to trigger the TODO and will never return.
 * The `getConfig` method exposes the active configuration.
 */
export type TodoFn = {
  /** Call to trigger the TODO. This function does not return. */
  (message?: string): never;
  /** Returns the active `TodoConfig` (read-only). */
  getConfig: () => Readonly<TodoConfig>;
};

/** Default configuration used by `createTodo` when no overrides are provided. */
const defaultConfig: TodoConfig = {
  onTodo: (ctx) => {
    throw new Error(
      `Unimplemented TODO at ${ctx.site.name}:${ctx.site.line}:${ctx.site.col}: ${
        ctx.message ?? ""
      }`,
    );
  },
  stackFrameSkip: 2,
};

/**
 * Create a new TODO function with optional configuration overrides.
 *
 * @param init Partial overrides for `TodoConfig`.
 * @returns A `TodoFn` which triggers `onTodo` when called.
 *
 * The returned function captures a stack trace and attempts to resolve the
 * calling site's name, line, and column using `Error.stack`. It then calls
 * the configured `onTodo` handler with a `TodoEvent` containing that data.
 */
export const createTodo = (init?: Partial<TodoConfig>): TodoFn => {
  const config: TodoConfig = { ...defaultConfig, ...init };

  const todoFn = (message?: string): never => {
    const skipFrames = config.stackFrameSkip;
    const err = new Error();
    const stack = String(err.stack ?? "");
    const lines = stack.split("\n");
    if (lines.length <= skipFrames) {
      config.onTodo({ message, site: { name: "unknown", line: -1, col: -1 } });
    }
    const target = lines[skipFrames];
    const pieces = target.split(/\s+/).slice(1);
    if (pieces.length < 3) {
      config.onTodo({ message, site: { name: "unknown", line: -1, col: -1 } });
    }
    const name = pieces[1];
    const line = parseInt(
      pieces[2].replace(/^\((.+)\)$/, "$1").split(":").at(-2) ?? "-1",
    );
    const col = Number(
      pieces[2].replace(/^\((.+)\)$/, "$1").split(":").at(-1) ?? "-1",
    );
    config.onTodo({ message, site: { name, line, col } });
  };
  todoFn.getConfig = () => {
    return config;
  };
  return todoFn;
};

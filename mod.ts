export type CallSite = {
  name: string;
  line: number;
  col: number;
};

export type TodoEvent = {
  message?: string;
  site: CallSite;
};

export type TodoConfig = {
  onTodo: (ctx: TodoEvent) => never;
  stackFrameSkip: number; // internal frames skip
};

export type TodoFn = {
  (message?: string): never;
  getConfig: () => Readonly<TodoConfig>;
};

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

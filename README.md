# todo-dev-deno

Rust の `todo!` マクロのように、未実装箇所を実行時に明示的に失敗させるための Deno 向けユーティリティです。  
開発中に `createTodo()` で作った関数を呼ぶと、呼び出し元の情報付きで例外を投げられます。

## Install

```ts
import { createTodo } from "jsr:@uta8a/todo-dev-deno";
```

## Usage

```ts
import { createTodo } from "jsr:@uta8a/todo-dev-deno";

const todo = createTodo();

function createUser() {
  todo("createUser is not implemented yet");
}

createUser();
```

実行時には次のようなエラーになります。

```txt
Unimplemented TODO at createUser:12:3: createUser is not implemented yet
```

## Customization

`onTodo` を差し替えると、例外の形式やログ出力を自由に制御できます。

```ts
import { createTodo } from "jsr:@uta8a/todo-dev-deno";

const todo = createTodo({
  onTodo: ({ message, site }) => {
    throw new Error(`[TODO] ${site.name}:${site.line}:${site.col} ${message ?? ""}`);
  },
});
```

`stackFrameSkip` を使うと、スタックトレース解析時にどのフレームを呼び出し元として扱うかを調整できます。

## API

- `createTodo(init?: Partial<TodoConfig>): TodoFn`
- `TodoFn`:
  - `(message?: string): never`
  - `getConfig(): Readonly<TodoConfig>`
- `TodoConfig`:
  - `onTodo: (ctx: TodoEvent) => never`
  - `stackFrameSkip: number`

## Development

```bash
deno task dev
```

`deno test --watch` が実行されます。

## License

Apache-2.0

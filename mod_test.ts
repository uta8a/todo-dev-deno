import { assertThrows } from "@std/assert";
import { createTodo, type TodoFn } from "./mod.ts";

Deno.test(function createTodoThrowError() {
  const todoFn: TodoFn = createTodo();
  function test123(): number {
    todoFn("hogehoge");
  }
  assertThrows(() => test123(), Error, "Unimplemented TODO");
  assertThrows(
    () => test123(),
    Error,
    "test123",
    "should include function name",
  );
});

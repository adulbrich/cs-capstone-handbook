import assert from "node:assert/strict";
import { test } from "node:test";
import { attempt } from "./attempt.mjs";

test("a value comes back with no error; a throw becomes its message", () => {
  assert.deepEqual(
    attempt(() => 2),
    { error: "", value: 2 }
  );
  assert.deepEqual(
    attempt(() => {
      throw new Error("No roster.");
    }),
    { error: "No roster.", value: null }
  );
});

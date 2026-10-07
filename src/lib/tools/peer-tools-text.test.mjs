import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareText } from "../../data/peer-tools.mjs";

test("the Send checklist's order lists every line once, and only those", () => {
  const { checklist, order } = prepareText.send;
  assert.equal(new Set(order).size, order.length);
  assert.deepEqual([...order].sort(), Object.keys(checklist).sort());
  // The close happens last, at the deadline.
  assert.equal(order.at(-1), "close");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultLabel, termOf } from "./term-label.mjs";

// Months are 0-based; the year is arbitrary.
const at = (month) => new Date(2031, month, 15);

test("termOf: months 0 to 2 winter, 3 to 5 spring, 6 to 11 fall", () => {
  const terms = Array.from({ length: 12 }, (_, month) => termOf(at(month)));
  assert.deepEqual(terms, [
    "winter",
    "winter",
    "winter",
    "spring",
    "spring",
    "spring",
    "fall",
    "fall",
    "fall",
    "fall",
    "fall",
    "fall",
  ]);
});

test("defaultLabel names the term's course, section 001, and the year", () => {
  assert.equal(defaultLabel(at(9)), "CS_461_001_F2031");
  assert.equal(defaultLabel(at(0)), "CS_462_001_W2031");
  assert.equal(defaultLabel(at(4)), "CS_463_001_S2031");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultLabel, labelFor, termOf } from "./term-label.mjs";

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

test("labelFor names any term of the course year the date falls in", () => {
  // In fall, winter and spring are the next calendar year's.
  assert.equal(labelFor("fall", at(9)), "CS_461_001_F2031");
  assert.equal(labelFor("winter", at(9)), "CS_462_001_W2032");
  assert.equal(labelFor("spring", at(9)), "CS_463_001_S2032");
  // In winter or spring, fall was the previous calendar year's.
  assert.equal(labelFor("fall", at(1)), "CS_461_001_F2030");
  assert.equal(labelFor("winter", at(1)), "CS_462_001_W2031");
  assert.equal(labelFor("spring", at(4)), "CS_463_001_S2031");
});

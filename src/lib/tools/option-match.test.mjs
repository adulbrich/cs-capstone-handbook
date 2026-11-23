import assert from "node:assert/strict";
import { test } from "node:test";
import { matchingOptions, singleSpaced, textKey } from "./option-match.mjs";

const teams = ["cs.003 Transit Planner", "cs.007 Tidepool  Explorer", "Trio"];

test("text compares trimmed, single-spaced, and in lower case", () => {
  assert.equal(singleSpaced("  Big \t TEAM "), "Big TEAM");
  assert.equal(textKey("  Big \t TEAM "), "big team");
});

test("options match anywhere in them, without case or extra spaces", () => {
  assert.deepEqual(matchingOptions(teams, "  TIDEpool ex"), [teams[1]]);
  assert.deepEqual(matchingOptions(teams, "tr"), [teams[0], teams[2]]);
  assert.deepEqual(matchingOptions(teams, "Zebra"), []);
});

test("blank text matches every option, in order", () => {
  assert.deepEqual(matchingOptions(teams, "  "), teams);
});

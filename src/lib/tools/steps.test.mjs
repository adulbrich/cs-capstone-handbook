import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collapse,
  initialSteps,
  reopen,
  STEP,
  setDone,
  stepView,
} from "./steps.mjs";

const IDS = ["roster", "survey", "contacts", "email"];
const statuses = (state) => stepView(IDS, state).map((s) => s.status);
const opened = (state) =>
  stepView(IDS, state)
    .filter((s) => s.open)
    .map((s) => s.id);

test("at first, step 1 is current and open and the rest wait", () => {
  const state = initialSteps();
  assert.deepEqual(statuses(state), [
    STEP.current,
    STEP.locked,
    STEP.locked,
    STEP.locked,
  ]);
  assert.deepEqual(opened(state), ["roster"]);
  assert.deepEqual(
    stepView(IDS, state).map((s) => s.number),
    [1, 2, 3, 4]
  );
});

test("marking a step done collapses it and unlocks the next", () => {
  const state = setDone(initialSteps(), "roster", true);
  assert.deepEqual(statuses(state), [
    STEP.done,
    STEP.current,
    STEP.locked,
    STEP.locked,
  ]);
  assert.deepEqual(opened(state), ["survey"]);
});

test("Edit reopens a done step without undoing it; done again closes it", () => {
  let state = setDone(setDone(initialSteps(), "roster", true), "survey", true);
  state = reopen(state, "roster");
  assert.deepEqual(opened(state), ["roster", "contacts"]);
  assert.equal(stepView(IDS, state)[0].status, STEP.done);
  assert.deepEqual(reopen(state, "roster").reopened, ["roster"]);
  assert.deepEqual(opened(collapse(state, "roster")), ["contacts"]);
  assert.deepEqual(opened(setDone(state, "roster", true)), ["contacts"]);
});

test("unchecking a step locks the later ones, which keep their done state", () => {
  let state = setDone(setDone(initialSteps(), "roster", true), "survey", true);
  state = setDone(state, "roster", false);
  assert.deepEqual(statuses(state), [
    STEP.current,
    STEP.locked,
    STEP.locked,
    STEP.locked,
  ]);
  state = setDone(state, "roster", true);
  assert.deepEqual(statuses(state), [
    STEP.done,
    STEP.done,
    STEP.current,
    STEP.locked,
  ]);
});

test("a reopened step that is later locked shows closed", () => {
  let state = setDone(setDone(initialSteps(), "roster", true), "survey", true);
  state = reopen(state, "survey");
  state = setDone(state, "roster", false);
  assert.deepEqual(opened(state), ["roster"]);
});

test("a done step whose input breaks counts as not done until fixed", () => {
  const state = setDone(
    setDone(initialSteps(), "roster", true),
    "survey",
    true
  );
  const broken = stepView(IDS, state, { roster: false });
  assert.deepEqual(
    broken.map((s) => s.status),
    [STEP.current, STEP.locked, STEP.locked, STEP.locked]
  );
  assert.equal(broken[0].open, true);
  assert.deepEqual(
    stepView(IDS, state, { roster: true }).map((s) => s.status),
    [STEP.done, STEP.done, STEP.current, STEP.locked]
  );
});

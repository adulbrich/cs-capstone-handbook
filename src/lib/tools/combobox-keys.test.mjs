import assert from "node:assert/strict";
import { test } from "node:test";
import { NONE, pressKey } from "./combobox-keys.mjs";

const closed = { active: NONE, count: 3, open: false, selected: NONE };
const opened = { ...closed, open: true };
const press = (key, list, modifiers = {}) =>
  pressKey({ key, ...modifiers }, list);

test("an arrow opens the list on its first or last option", () => {
  assert.deepEqual(press("ArrowDown", closed), {
    active: 0,
    open: true,
    picked: NONE,
    prevent: true,
  });
  assert.equal(press("ArrowUp", closed).active, 2);
});

test("an arrow moves from the active option and wraps", () => {
  assert.equal(press("ArrowDown", opened).active, 0);
  assert.equal(press("ArrowDown", { ...opened, active: 0 }).active, 1);
  assert.equal(press("ArrowDown", { ...opened, active: 2 }).active, 0);
  assert.equal(press("ArrowUp", { ...opened, active: 0 }).active, 2);
});

test("the first arrow goes to the option the text names", () => {
  assert.equal(press("ArrowDown", { ...closed, selected: 1 }).active, 1);
  assert.equal(press("ArrowUp", { ...opened, selected: 1 }).active, 1);
});

test("an arrow opens a list with nothing to show, with no option active", () => {
  const empty = press("ArrowDown", { ...closed, count: 0 });
  assert.equal(empty.open, true);
  assert.equal(empty.active, NONE);
  assert.equal(press("ArrowUp", { ...opened, count: 0 }).active, NONE);
});

test("Alt and an arrow open or close the list without moving", () => {
  const alt = { altKey: true };
  assert.equal(press("ArrowDown", closed, alt).open, true);
  assert.equal(press("ArrowDown", closed, alt).active, NONE);
  assert.equal(press("ArrowDown", { ...opened, active: 1 }, alt).active, 1);
  assert.equal(press("ArrowUp", { ...opened, active: 1 }, alt).open, false);
});

test("Enter takes an option only when one is active", () => {
  assert.deepEqual(press("Enter", { ...opened, active: 1 }), {
    active: NONE,
    open: false,
    picked: 1,
    prevent: true,
  });
  // The text names an option, but the keys are on none: the form submits.
  assert.deepEqual(press("Enter", { ...opened, selected: 1 }), {
    active: NONE,
    open: false,
    picked: NONE,
    prevent: false,
  });
  assert.equal(press("Enter", closed), null);
});

test("Escape closes the list and nothing else", () => {
  assert.equal(press("Escape", { ...opened, active: 1 }).picked, NONE);
  assert.equal(press("Escape", opened).open, false);
  assert.equal(press("Escape", closed), null);
});

test("a caret key leaves the option for the text, with the list open", () => {
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    assert.deepEqual(press(key, { ...opened, active: 1 }), {
      active: NONE,
      open: true,
      picked: NONE,
      prevent: false,
    });
    assert.equal(press(key, closed), null);
  }
});

test("the browser keeps page keys, selecting by arrow, and text being composed", () => {
  for (const list of [closed, { ...opened, active: 1 }]) {
    assert.equal(press("PageDown", list), null);
    assert.equal(press("PageUp", list), null);
    assert.equal(press("a", list), null);
    assert.equal(press("ArrowDown", list, { shiftKey: true }), null);
    assert.equal(press("ArrowUp", list, { metaKey: true }), null);
    assert.equal(press("ArrowDown", list, { ctrlKey: true }), null);
    assert.equal(press("Enter", list, { isComposing: true }), null);
  }
});

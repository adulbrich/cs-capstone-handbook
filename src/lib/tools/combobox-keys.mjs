// What a key does in a combobox whose text may be none of its options: the
// ARIA Authoring Practices' editable combobox with list autocomplete and
// manual selection. Focus stays in the text. The arrows move to an option, and
// Enter takes only an option they are on. Pure: no DOM, no I/O.

/** The index of no option. */
export const NONE = -1;

const STEPS = new Map([
  ["ArrowDown", 1],
  ["ArrowUp", -1],
]);
const CARET_KEYS = new Set(["ArrowLeft", "ArrowRight", "End", "Home"]);

const CLOSED = { active: NONE, open: false, picked: NONE, prevent: true };

/** The option an arrow goes to, `step` 1 down or -1 up. */
function stepTo(step, { active, count, open, selected }) {
  if (count === 0) {
    return NONE;
  }
  if (open && active !== NONE) {
    return (active + step + count) % count;
  }
  if (selected !== NONE) {
    return selected;
  }
  return step === 1 ? 0 : count - 1;
}

function pressArrow(step, altKey, list) {
  if (altKey && step === -1) {
    return CLOSED;
  }
  return {
    active: altKey ? list.active : stepTo(step, list),
    open: true,
    picked: NONE,
    prevent: true,
  };
}

/**
 * What a keydown event does to the list, or null when the key is the
 * browser's alone. `list` is `{ active, count, open, selected }`: how many
 * options it shows, or will once open, whether it is open, and the indexes of
 * the option the arrows are on and of the option the text names, NONE for
 * neither. Returns `{ active, open, picked, prevent }`: the list after the
 * key, the index of the option it takes, and whether to stop what the browser
 * does with the key.
 */
export function pressKey(event, list) {
  const { altKey, ctrlKey, isComposing, key, metaKey, shiftKey } = event;
  if (isComposing) {
    return null;
  }
  const step = STEPS.get(key);
  if (step) {
    return ctrlKey || metaKey || shiftKey
      ? null
      : pressArrow(step, altKey, list);
  }
  if (!list.open) {
    return null;
  }
  if (key === "Escape") {
    return CLOSED;
  }
  if (key === "Enter") {
    const { active } = list;
    return { ...CLOSED, picked: active, prevent: active !== NONE };
  }
  if (CARET_KEYS.has(key)) {
    return { active: NONE, open: true, picked: NONE, prevent: false };
  }
  return null;
}

// The guided pages' steps: which are done, which is current, which wait on
// an earlier one, and which are open. Pure: no DOM, no I/O.
//
// Steps unlock in order: a step is locked while any step before it is not
// done. The first step not done is current and open. A done step collapses
// to its summary; Edit reopens it without undoing it, and an earlier step can
// always be reopened. Unchecking a step's done box makes it current again and
// locks the steps after it, which keep their own done state for when it is
// checked again.

/** A step's status. */
export const STEP = Object.freeze({
  current: "current",
  done: "done",
  locked: "locked",
});

/** No step done, none reopened. */
export const initialSteps = () => ({ done: {}, reopened: [] });

/**
 * Each step's view, in `ids` order: `{ id, number, status, open }`.
 * `state` is `{ done: { [id]: boolean }, reopened: [id] }`.
 */
export function stepView(ids, state) {
  const done = state.done ?? {};
  const reopened = new Set(state.reopened ?? []);
  let blocked = false;
  return ids.map((id, i) => {
    let status = STEP.current;
    if (blocked) {
      status = STEP.locked;
    } else if (done[id]) {
      status = STEP.done;
    } else {
      blocked = true;
    }
    return {
      id,
      number: i + 1,
      open:
        status === STEP.current || (status === STEP.done && reopened.has(id)),
      status,
    };
  });
}

/** Marks `id` done or not; a step marked done also closes. */
export function setDone(state, id, value) {
  return {
    done: { ...state.done, [id]: value },
    reopened: (state.reopened ?? []).filter((open) => open !== id),
  };
}

/** Opens a done step for editing; it stays done. */
export function reopen(state, id) {
  const reopened = state.reopened ?? [];
  return {
    ...state,
    reopened: reopened.includes(id) ? reopened : [...reopened, id],
  };
}

/** Closes a reopened step back to its summary. */
export const collapse = (state, id) => ({
  ...state,
  reopened: (state.reopened ?? []).filter((open) => open !== id),
});

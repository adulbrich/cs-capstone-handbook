// The tools pages' saved state: reactive values backed by the store in
// src/lib/tools/tool-storage.mjs, which holds the logic and its tests. A
// value is written when a handler sets it, never by an effect, so "Clear
// saved data" leaves nothing behind.
// biome-ignore-all lint/style/noExcessiveClassesPerFile: Saved is unexported, handed out by ToolStorage.saved and saved through by PageSteps; the pages import those two from here.

import { tick } from "svelte";
import {
  collapse,
  initialSteps,
  reopen,
  setDone,
  stepView,
} from "../../../lib/tools/steps.mjs";
import { openStore } from "../../../lib/tools/tool-storage.mjs";

/** One saved value. Replace it whole with `set`; it is never mutated. */
class Saved {
  #key;
  #storage;
  value = $state.raw();

  constructor(storage, key, initial) {
    this.#storage = storage;
    this.#key = key;
    this.value = storage.read(key, initial);
  }

  set(value) {
    this.value = value;
    this.#storage.write(this.#key, value);
  }
}

/**
 * The browser's storage for one tool, `store` its namespace and version
 * (PEER_STORE, PARTNER_STORE), with its problem, if any, as state.
 */
export class ToolStorage {
  #store;
  problem = $state(null);

  constructor(store) {
    this.#store = openStore(() => window.localStorage, store);
    this.problem = this.#store.problem();
  }

  read(key, fallback) {
    return this.#store.read(key, fallback);
  }

  write(key, value) {
    this.#store.write(key, value);
    this.problem = this.#store.problem();
  }

  /** Removes one key, leaving the page as it is. */
  remove(key) {
    this.#store.remove(key);
  }

  /** A saved value under `key`, `initial` when nothing is saved. */
  saved(key, initial) {
    return new Saved(this, key, initial);
  }

  /** Removes every saved key, every version, and reloads the page empty. */
  clearAll() {
    this.#store.clearAll();
    window.location.reload();
  }
}

/** Puts focus on step `id`'s heading once Svelte has rendered it. */
async function focusStep(id) {
  await tick();
  document.querySelector(`#${CSS.escape(`step-${id}`)}`)?.focus();
}

/**
 * A page's steps, saved under `key` (steps.mjs holds the rules). `props`
 * gives a <Step> everything it needs for one step; moving to a step that
 * just opened puts focus on its heading.
 */
export class PageSteps {
  #ids;
  #saved;

  constructor(storage, key, ids) {
    this.#ids = ids;
    this.#saved = storage.saved(key, initialSteps());
  }

  #done(id, value, ready) {
    this.#saved.set(setDone(this.#saved.value, id, value));
    const next = stepView(this.#ids, this.#saved.value, ready).find(
      (step) => step.open && step.id !== id
    );
    focusStep(value && next ? next.id : id);
  }

  /**
   * A <Step>'s props for `id`: its view (stepView, given which steps'
   * inputs are `ready`), its handlers, and whether it is ready.
   */
  props(id, ready) {
    return {
      ...stepView(this.#ids, this.#saved.value, ready).find(
        (step) => step.id === id
      ),
      oncollapse: () => {
        this.#saved.set(collapse(this.#saved.value, id));
        focusStep(id);
      },
      ondone: (value) => this.#done(id, value, ready),
      onedit: () => {
        this.#saved.set(reopen(this.#saved.value, id));
        focusStep(id);
      },
      ready: ready[id],
    };
  }
}

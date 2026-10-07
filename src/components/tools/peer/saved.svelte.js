// The peer pages' saved state: reactive values backed by the store in
// src/lib/tools/tool-storage.mjs, which holds the logic and its tests. A
// value is written when a handler sets it, never by an effect, so "Clear
// saved data" leaves nothing behind.

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

/** The browser's storage for the peer tools, with its problem, if any, as state. */
export class PeerStorage {
  #store = openStore(() => window.localStorage);
  problem = $state(this.#store.problem());

  read(key, fallback) {
    return this.#store.read(key, fallback);
  }

  write(key, value) {
    this.#store.write(key, value);
    this.problem = this.#store.problem();
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

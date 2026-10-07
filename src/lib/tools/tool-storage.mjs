// What the tools pages keep in the browser between visits: the dropped
// files' names and text, the added students, the settings, and each step's
// done state, as JSON under one versioned key namespace. Pure: the browser's
// storage is passed in, so node --test covers it with a stand-in.
//
// A storage that cannot be read or written (blocked in a private window, or
// full) never breaks a page: the store keeps what it could not save in
// memory for this visit and says why, so the page can show a notice.

/** Every key the peer tools write starts with this, whatever the version. */
export const PEER_NAMESPACE = "cs46x-tools:peer:";

/**
 * The stored shape's version. Bump it when what a key holds changes: the
 * store then drops every key of an older version on open.
 */
export const PEER_VERSION = 1;

/** The keys both peer pages read: the roster file and the added students. */
export const SHARED_KEYS = Object.freeze({ added: "added", roster: "roster" });

/** Why the store fell back to memory, as a page tells the instructor. */
export const STORAGE_PROBLEM = Object.freeze({
  blocked:
    "This browser blocks saved data for this page, so nothing is kept after you leave it.",
  full: "This browser's storage for this site is full, so the latest changes are kept only until you leave the page.",
});

const PROBE = "probe";

/**
 * Opens the store. `getStorage` returns the browser's storage (it may
 * throw, as `window.localStorage` does when blocked); `namespace` and
 * `version` name the keys, `<namespace>v<version>:<key>`.
 *
 * Returns `{ read, write, clearAll, problem }`. `read(key, fallback)` gives
 * the stored value or `fallback`; `write(key, value)` saves a JSON value and
 * returns false when it could only keep it in memory;
 * `clearAll()` removes every key under the namespace, every version, and
 * the memory copy; `problem()` is null or one of STORAGE_PROBLEM.
 */
export function openStore(
  getStorage,
  { namespace = PEER_NAMESPACE, version = PEER_VERSION } = {}
) {
  const prefix = `${namespace}v${version}:`;
  const memory = new Map();
  let problem = null;
  let storage = null;

  try {
    storage = getStorage();
    storage.setItem(prefix + PROBE, "1");
    storage.removeItem(prefix + PROBE);
  } catch {
    storage = null;
    problem = STORAGE_PROBLEM.blocked;
  }

  /** Every stored key under the namespace, any version. */
  const namespaced = () => {
    if (!storage) {
      return [];
    }
    const found = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(namespace)) {
        found.push(key);
      }
    }
    return found;
  };

  // An older version's keys hold a shape this code no longer reads.
  for (const key of namespaced()) {
    if (!key.startsWith(prefix)) {
      storage.removeItem(key);
    }
  }

  return {
    clearAll() {
      memory.clear();
      for (const key of namespaced()) {
        storage.removeItem(key);
      }
    },
    problem: () => problem,
    read(key, fallback) {
      if (memory.has(key)) {
        return memory.get(key);
      }
      if (!storage) {
        return fallback;
      }
      try {
        const text = storage.getItem(prefix + key);
        return text === null ? fallback : JSON.parse(text);
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      if (storage) {
        try {
          storage.setItem(prefix + key, JSON.stringify(value));
          memory.delete(key);
          return true;
        } catch {
          problem = STORAGE_PROBLEM.full;
        }
      }
      memory.set(key, value);
      return false;
    },
  };
}

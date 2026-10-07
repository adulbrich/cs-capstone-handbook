import assert from "node:assert/strict";
import { test } from "node:test";
import { openStore, PEER_NAMESPACE, STORAGE_PROBLEM } from "./tool-storage.mjs";

/** A stand-in for window.localStorage; `quota` caps the stored characters. */
function fakeStorage(entries = {}, { quota = Number.POSITIVE_INFINITY } = {}) {
  const data = new Map(Object.entries(entries));
  const used = () =>
    [...data].reduce((sum, [k, v]) => sum + k.length + v.length, 0);
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key) => data.delete(key),
    setItem(key, value) {
      const before = data.get(key);
      data.set(key, String(value));
      if (used() > quota) {
        if (before === undefined) {
          data.delete(key);
        } else {
          data.set(key, before);
        }
        throw new Error("QuotaExceededError");
      }
    },
  };
}

test("values round-trip as JSON under the versioned namespace", () => {
  const storage = fakeStorage();
  const store = openStore(() => storage);
  assert.equal(store.write("roster", { name: "r.csv", text: "a,b" }), true);
  assert.deepEqual(store.read("roster", null), { name: "r.csv", text: "a,b" });
  assert.ok(storage.data.has(`${PEER_NAMESPACE}v1:roster`));
  assert.equal(store.read("missing", "fallback"), "fallback");
  assert.deepEqual([...storage.data.keys()], [`${PEER_NAMESPACE}v1:roster`]);
  assert.equal(store.problem(), null);
});

test("opening drops an older version's keys and leaves other tools alone", () => {
  const storage = fakeStorage({
    [`${PEER_NAMESPACE}v0:roster`]: '"old"',
    [`${PEER_NAMESPACE}v1:roster`]: '"current"',
    "cs46x-tools:partner:v1:roster": '"partner"',
    unrelated: "x",
  });
  const store = openStore(() => storage);
  assert.equal(store.read("roster"), "current");
  assert.deepEqual([...storage.data.keys()].sort(), [
    "cs46x-tools:partner:v1:roster",
    `${PEER_NAMESPACE}v1:roster`,
    "unrelated",
  ]);
});

test("a version bump drops the keys the last version wrote", () => {
  const storage = fakeStorage({ [`${PEER_NAMESPACE}v1:roster`]: '"one"' });
  const store = openStore(() => storage, { version: 2 });
  assert.equal(store.read("roster", null), null);
  assert.equal(storage.data.size, 0);
});

test("clearAll removes every key in the namespace and nothing else", () => {
  const storage = fakeStorage({ unrelated: "x" });
  const store = openStore(() => storage);
  store.write("roster", "r");
  store.write("prepare:steps", { roster: true });
  store.clearAll();
  assert.deepEqual([...storage.data.keys()], ["unrelated"]);
  assert.equal(store.read("roster", null), null);
});

test("blocked storage falls back to memory with a notice", () => {
  const store = openStore(() => {
    throw new Error("SecurityError");
  });
  assert.equal(store.problem(), STORAGE_PROBLEM.blocked);
  assert.equal(store.write("roster", "r"), false);
  assert.equal(store.read("roster", null), "r");
  store.clearAll();
  assert.equal(store.read("roster", null), null);
});

test("a full storage keeps the value in memory and says so", () => {
  const storage = fakeStorage({}, { quota: 200 });
  const store = openStore(() => storage);
  assert.equal(store.write("small", "x"), true);
  assert.equal(store.write("big", "y".repeat(500)), false);
  assert.equal(store.problem(), STORAGE_PROBLEM.full);
  assert.equal(store.read("big", null), "y".repeat(500));
  assert.deepEqual([...storage.data.keys()], [`${PEER_NAMESPACE}v1:small`]);
});

test("a value that is not JSON reads as the fallback", () => {
  const storage = fakeStorage({ [`${PEER_NAMESPACE}v1:roster`]: "{not json" });
  const store = openStore(() => storage);
  assert.equal(store.read("roster", "fallback"), "fallback");
});

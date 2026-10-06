// Where each field of the peer evaluation's Qualtrics export lives, and how
// its cells read. Every assumption about the export's shape is in this file,
// so pinning the scorer to the real header is a change here and nowhere else.
//
// Assumptions until the staff test's header confirms them (#438):
// - A labels export (src/lib/tools/qualtrics-export.mjs reads the three
//   header rows and refuses a values export).
// - Looped columns carry the loop prefix, `N_`, on both the tag (`3_Rating_2`)
//   and the ImportId (`3_QID5_2`), and N is the roster choice ID: 1 is the
//   respondent, N > 1 is Team Member N - 1. An empty middle slot skips a
//   number. If the staff test shows the prefix counts iterations instead,
//   switch PREFIX_FOLLOWS to "iteration".
// - The split's carried-forward choices export as `Split_x<choice>` or
//   `Split_<choice>`, the choice ID being the roster choice ID.
// - Embedded data columns are named as the field: Team, TeamSize, SelfFloor,
//   Team Member 1 to 9.
// - The hidden ratee answer holds the respondent's email on iteration 1 and
//   "First Last (email)" on the others.
//
// Columns are placed by their export tags, which the generator writes, and
// confirmed against their ImportIds: an ImportId whose loop prefix or row
// differs from its tag is a header error. QID numbers alone cannot name a
// question: they differ between the generator's two modes. Responses are
// read by tag, as qualtrics-export.mjs keys them.

import { anchors } from "../../data/peer-evaluation.mjs";
import { SLOTS } from "./peer-contacts.mjs";

/** Loop prefix N names roster choice N ("choice"), or the Nth page shown ("iteration"). */
export const PREFIX_FOLLOWS = "choice";

/** The survey an export comes from. */
export const SURVEY_TYPE = Object.freeze({
  catme: "catme",
  regular: "regular",
  slots: "slots",
  unknown: "unknown",
});

/** The respondent and the session columns, by ImportId, then by tag. */
const FIXED_COLUMNS = {
  email: { importId: "recipientEmail", tag: "RecipientEmail" },
  lastSeen: { importId: "LastSeenQuestions", tag: "Last Seen Question IDs" },
  recordedDate: { importId: "recordedDate", tag: "RecordedDate" },
  responseId: { importId: "_recordId", tag: "ResponseId" },
  selfFloor: { importId: "SelfFloor", tag: "SelfFloor" },
  team: { importId: "Team", tag: "Team" },
  teamSize: { importId: "TeamSize", tag: "TeamSize" },
};

/** The columns without which nothing can be scored. */
const REQUIRED_FIXED = ["email", "recordedDate", "team"];

/** The embedded field holding Team Member `slot`. */
const memberColumn = (slot) => `Team Member ${slot}`;

/** Looped questions of the regular survey, by tag. */
const LOOP_TAG = /^(\d+)_(Ratee|Rating|Comment)(?:_(\w+))?$/;
/** The generator's fallback mode, one block per slot: S1_Rating_1 and so on. */
const SLOT_TAG = /^S(\d+)_(Ratee|Rating|Comment)/;
/** The 100-point split, one column per carried-forward choice. */
const SPLIT_TAG = /^Split_x?(\d+)$/;
/** The open questions after the split, one column each. */
const OPEN_QUESTIONS = ["Allocations", "Overall", "Closing"];

/** An ImportId: optional loop prefix, the QID, optional row or choice. */
const IMPORT_ID = /^(?:(\d+)_)?(QID\d+)(?:_(\w+))?$/;

/** The choice or row ID an ImportId suffix names: "x3" and "3" are both 3. */
const X_PREFIX = /^x/;
const idNumber = (suffix) => Number(String(suffix).replace(X_PREFIX, ""));
/** Any looped column: its tag starts with the loop prefix. */
const LOOPED = /^\d+_/;

/** The fixed and embedded columns' tags, found by ImportId first, then by tag. */
function placeFixed(columns) {
  const find = ({ importId, tag }) =>
    (
      columns.find((column) => column.importId === importId) ??
      columns.find((column) => column.tag === tag)
    )?.tag;
  const fixed = {};
  for (const [key, spec] of Object.entries(FIXED_COLUMNS)) {
    fixed[key] = find(spec);
  }
  const members = {};
  for (let slot = 1; slot <= SLOTS; slot += 1) {
    const name = memberColumn(slot);
    members[slot] = find({ importId: name, tag: name });
  }
  return { fixed, members };
}

/** Places one looped column, or says why its ImportId disagrees with its tag. */
function placeLooped(map, tag, importId) {
  const [, prefix, role, sub] = LOOP_TAG.exec(tag);
  const id = IMPORT_ID.exec(importId);
  if (id && (id[1] !== prefix || (sub && id[3] !== sub))) {
    return `Column ${tag} has the ImportId ${importId}: the loop prefix or row disagrees.`;
  }
  map.loop[prefix] ??= { comment: "", ratee: "", ratings: [] };
  if (role === "Rating") {
    map.loop[prefix].ratings[Number(sub) - 1] = tag;
  } else if (role === "Ratee") {
    map.loop[prefix].ratee = tag;
  } else {
    map.loop[prefix].comment = tag;
  }
  return "";
}

/** Places one split column, or says why its ImportId disagrees with its tag. */
function placeSplit(map, tag, importId) {
  const [, choice] = SPLIT_TAG.exec(tag);
  const id = IMPORT_ID.exec(importId);
  if (id?.[3] && idNumber(id[3]) !== Number(choice)) {
    return `Column ${tag} has the ImportId ${importId}: the split choice disagrees.`;
  }
  map.split[choice] = tag;
  return "";
}

/** Which survey the columns belong to. */
function surveyType(map, counts) {
  const hasRatings = Object.values(map.loop).some((it) => it.ratings.length);
  const hasSplit = Object.keys(map.split).length > 0;
  if (hasRatings && hasSplit) {
    return SURVEY_TYPE.regular;
  }
  if (counts.slots > 0) {
    return SURVEY_TYPE.slots;
  }
  // The CATME survey loops over the roster with no matrix and no split.
  return counts.looped > 0 && !hasRatings && !hasSplit
    ? SURVEY_TYPE.catme
    : SURVEY_TYPE.unknown;
}

/** What a regular export needs, and what the scorer works around. */
function checkRegular(map) {
  if (Object.values(map.loop).every((it) => it.ratee === "")) {
    map.warnings.push(
      "The export has no Ratee column, so whom each page rated comes from the loop position alone, with no cross-check."
    );
  }
  const missing = REQUIRED_FIXED.filter((key) => map.fixed[key] === undefined);
  if (missing.length > 0) {
    map.problems.push(
      `The export has no ${missing.map((key) => FIXED_COLUMNS[key].tag).join(", ")} column. Export with all fields.`
    );
  }
}

/**
 * Maps the export's columns (`{ tag, importId }`, from parseQualtricsExport)
 * to the tags the scorer reads.
 *
 * Returns `{ type, fixed, members, loop, split, open, problems, warnings }`:
 * `type` is one of SURVEY_TYPE; `fixed` maps
 * FIXED_COLUMNS keys to tags; `members[slot]` is the Team Member tag; `loop`
 * maps each loop prefix to `{ ratee, comment, ratings: [tag per criterion
 * row] }`, "" where a column is missing; `split` maps each choice ID to its
 * tag; `open` maps each OPEN_QUESTIONS tag to itself; `problems` lists header
 * errors, each fatal; `warnings` lists what the scorer works around.
 */
export function mapColumns(columns) {
  const map = {
    ...placeFixed(columns),
    loop: {},
    open: {},
    problems: [],
    split: {},
    warnings: [],
  };
  const counts = { looped: 0, slots: 0 };

  for (const { tag, importId = "" } of columns) {
    let problem = "";
    if (LOOP_TAG.test(tag)) {
      problem = placeLooped(map, tag, importId);
    } else if (SPLIT_TAG.test(tag)) {
      problem = placeSplit(map, tag, importId);
    } else if (OPEN_QUESTIONS.includes(tag)) {
      map.open[tag] = tag;
    } else if (SLOT_TAG.test(tag)) {
      counts.slots += 1;
    }
    if (LOOPED.test(tag)) {
      counts.looped += 1;
    }
    if (problem) {
      map.problems.push(problem);
    }
  }

  map.type = surveyType(map, counts);
  if (map.type === SURVEY_TYPE.regular) {
    checkRegular(map);
  }
  return map;
}

/**
 * Who loop prefix `prefix` rated, as roster choice: 1 is the respondent,
 * N > 1 is Team Member N - 1. With PREFIX_FOLLOWS "iteration", prefix N is
 * the Nth displayed choice: the respondent, then the filled slots in order.
 */
export function rosterChoiceOf(prefix, filledSlots, follows = PREFIX_FOLLOWS) {
  if (follows === "choice") {
    return prefix;
  }
  return prefix === 1 ? 1 : (filledSlots[prefix - 2] ?? 0) + 1;
}

const EMAIL_IN_PARENS = /\(([^()\s]+@[^()\s]+)\)\s*$/;
const BARE_EMAIL = /^[^\s@]+@[^\s@]+$/;

/** "First Last (email)" or a bare email to the email, lowercase; "" otherwise. */
export function emailIn(value) {
  const text = String(value ?? "").trim();
  const inParens = EMAIL_IN_PARENS.exec(text);
  if (inParens) {
    return inParens[1].toLowerCase();
  }
  return BARE_EMAIL.test(text) ? text.toLowerCase() : "";
}

const LEADING_VALUE = /^(\d+)(?:\s*:.*)?$/s;

/**
 * A rating cell to 1 to 5. The labels export writes the choice text, which
 * the generator starts with the value ("4: Good solid effort; took
 * initiative"); text without the number is matched against the anchors.
 * Empty is null; anything else is NaN.
 */
export function readRating(cell) {
  const text = String(cell ?? "").trim();
  if (text === "") {
    return null;
  }
  const leading = LEADING_VALUE.exec(text);
  if (leading) {
    return Number(leading[1]);
  }
  const anchor = anchors.findIndex(
    (words) => words.toLowerCase() === text.toLowerCase()
  );
  return anchor === -1 ? Number.NaN : anchor + 1;
}

/** A number cell: empty is null, unreadable is NaN. */
export function readNumber(cell) {
  const text = String(cell ?? "").trim();
  return text === "" ? null : Number(text);
}

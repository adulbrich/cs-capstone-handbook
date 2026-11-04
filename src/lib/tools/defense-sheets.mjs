// The defense scoresheets' rules (/tools/defense-scoresheets/): the live
// sheet read from the defense rubric, the session length read from the
// defense page, the teams read from the roster, and the pages that print
// for the teams picked. Pure, so node --test covers it; the wording is in
// src/data/defense-scoresheets.mjs, and the files are read at build time by
// src/components/tools/defense/defense-rubric.mjs.
//
// The rubric writes each criterion's items and red flags as numbered lists
// inside its Exceeds and Does Not Meet descriptions:
//
//   All four, none undone by ...: (1) Owns it: authored ...; (2) AI account: ...
//
// Each item is "(n) Label: text", the items joined by "; ", the last one
// closed by a period. The live sheet prints the label in bold and the text
// beside it, word for word.

import { rubricTotal } from "../rubric-csv.mjs";

/** The four bands every criterion carries, by their Canvas rating names. */
export const BAND_NAMES = Object.freeze({
  doesNotMeet: "Does Not Meet Expectations",
  exceeds: "Exceeds Expectations",
  meets: "Meets Expectations",
  missing: "Missing",
});

/**
 * The numbers the rubric and the defense page spell out: an Exceeds
 * description's count ("All four, ...") and the session length.
 */
const NUMBER_WORDS = Object.freeze({
  eight: 8,
  eleven: 11,
  fifteen: 15,
  five: 5,
  four: 4,
  nine: 9,
  one: 1,
  seven: 7,
  six: 6,
  ten: 10,
  three: 3,
  twelve: 12,
  twenty: 20,
  two: 2,
});

/** Where the list starts: the colon closing the preamble, then "(1) ". */
const LIST_START = /:\s*\(1\)\s+/;
/** Between items: "; (n) ". Bare parentheses inside an item never match. */
const ITEM_BREAK = /;\s*\((\d+)\)\s+/;
/** The period that closes the last item. */
const CLOSING_PERIOD = /\.$/;
/** The count a preamble opens with, "All four". */
const ALL_COUNT = /^All (\w+)\b/i;
/** An Exceeds preamble: its count, then the condition every item meets. */
const ALL_CONDITION = /^All \w+, (.+)$/;
/** A number written as digits. */
const DIGITS = /^\d+$/;

/**
 * A rubric description's numbered list: the preamble before it and each
 * item's `{ label, text }`. Throws when there is no list, when the numbers
 * skip, when an item has no "Label: ", when two items share a label, or
 * when an "All four" preamble counts a different number of items than the
 * list holds. `where` names the description in the error.
 */
export function readList(description, where) {
  const start = description.match(LIST_START);
  if (!start) {
    throw new Error(
      `${where}: no numbered list. The live sheet reads its items as "...: (1) Label: text; (2) Label: text."`
    );
  }
  const preamble = description.slice(0, start.index).trim();
  const parts = description
    .slice(start.index + start[0].length)
    .split(ITEM_BREAK);
  const texts = [parts[0]];
  for (let i = 1; i < parts.length; i += 2) {
    const n = Number(parts[i]);
    if (n !== texts.length + 1) {
      throw new Error(
        `${where}: item (${n}) follows item (${texts.length}). Number the items 1, 2, 3 in order.`
      );
    }
    texts.push(parts[i + 1]);
  }
  const items = texts.map((raw, i) => {
    const last = i === texts.length - 1;
    const item = last ? raw.trim().replace(CLOSING_PERIOD, "") : raw.trim();
    const colon = item.indexOf(": ");
    if (colon <= 0) {
      throw new Error(
        `${where}, item (${i + 1}): no "Label: " before its text. The live sheet prints the label in bold.`
      );
    }
    return { label: item.slice(0, colon), text: item.slice(colon + 2) };
  });
  const labels = items.map((item) => item.label);
  const repeated = labels.find((label, i) => labels.indexOf(label) !== i);
  if (repeated !== undefined) {
    throw new Error(
      `${where}: two items are labeled "${repeated}". Each item's label is its own.`
    );
  }
  const count = preamble.match(ALL_COUNT);
  const said = count && NUMBER_WORDS[count[1].toLowerCase()];
  if (said && said !== items.length) {
    throw new Error(
      `${where}: the preamble says "All ${count[1]}" but the list has ${items.length} items.`
    );
  }
  return { items, preamble };
}

/** The criterion's band named BAND_NAMES[key]; throws when it has none. */
function bandOf(criterion, key, where) {
  const band = criterion.ratings.find((r) => r.name === BAND_NAMES[key]);
  if (!band) {
    throw new Error(
      `${where}: no "${BAND_NAMES[key]}" band. The live sheet prints the four bands ${Object.values(BAND_NAMES).join(", ")}.`
    );
  }
  return band;
}

/**
 * One criterion as the live sheet prints it, and the scoring rule its bands
 * state: Exceeds' points and the condition every item meets (its preamble
 * after "All four, "), Does Not Meet's points and its preamble ("Any red
 * flag"), the Meets ladder (each number in the Meets description, "16
 * points with one item missing, 12 with two, 8 with more"), and the text
 * after the Meets description's first colon. The banner prints all of it.
 */
export function readCriterion(criterion, where) {
  const names = Object.values(BAND_NAMES);
  const extra = criterion.ratings.filter((r) => !names.includes(r.name));
  if (extra.length > 0) {
    throw new Error(
      `${where}: a band the live sheet does not print, "${extra[0].name}".`
    );
  }
  const exceeds = bandOf(criterion, "exceeds", where);
  const meets = bandOf(criterion, "meets", where);
  const doesNotMeet = bandOf(criterion, "doesNotMeet", where);
  const missing = bandOf(criterion, "missing", where);

  const ladder = (meets.description.match(/\d+/g) ?? []).map(Number);
  const descending = ladder.every((n, i) => i === 0 || n < ladder[i - 1]);
  if (
    ladder[0] !== meets.points ||
    !descending ||
    ladder.at(-1) <= doesNotMeet.points
  ) {
    throw new Error(
      `${where}: the Meets description's points (${ladder.join(", ") || "none"}) must start at its ${meets.points} points and fall to above Does Not Meet's ${doesNotMeet.points}.`
    );
  }
  const colon = meets.description.indexOf(": ");
  if (colon === -1) {
    throw new Error(
      `${where}: the Meets description has no colon before its points.`
    );
  }

  const items = readList(exceeds.description, `${where}, ${exceeds.name}`);
  const condition = items.preamble.match(ALL_CONDITION);
  if (!condition) {
    throw new Error(
      `${where}, ${exceeds.name}: the preamble does not read "All <count>, <condition>". The banner prints the condition every item meets.`
    );
  }
  const flags = readList(
    doesNotMeet.description,
    `${where}, ${doesNotMeet.name}`
  );

  return {
    criterion: {
      flags: flags.items,
      items: items.items,
      question: criterion.description,
      tags: criterion.tags,
      title: criterion.title,
    },
    rule: {
      doesNotMeet: doesNotMeet.points,
      exceeds: exceeds.points,
      exceedsCondition: condition[1],
      flagRule: flags.preamble,
      ladder,
      meetsRule: meets.description.slice(colon + 2),
      missing: { description: missing.description, points: missing.points },
    },
  };
}

/**
 * The live sheet from the parsed defense rubric (parseRubricCsv):
 * `{ criteria, rule, total }`. The sheet's banner states the scoring rule
 * once, so it throws when any criterion's bands differ from the first's,
 * and the sheet keys its criteria by title, so it throws on a repeat.
 */
export function liveSheet(rubric, sourceLabel) {
  const read = rubric.criteria.map((c, i) =>
    readCriterion(c, `${sourceLabel}, criterion ${i + 1} (${c.title})`)
  );
  const titles = read.map((r) => r.criterion.title);
  const repeated = titles.find((title, i) => titles.indexOf(title) !== i);
  if (repeated !== undefined) {
    throw new Error(
      `${sourceLabel}: two criteria are titled "${repeated}". Each criterion's title is its own.`
    );
  }
  const rule = JSON.stringify(read[0].rule);
  read.forEach((r, i) => {
    if (JSON.stringify(r.rule) !== rule) {
      throw new Error(
        `${sourceLabel}: criterion ${i + 1} (${r.criterion.title}) scores differently from criterion 1. The live sheet's banner states one rule for every criterion.`
      );
    }
  });
  return {
    criteria: read.map((r) => r.criterion),
    rule: read[0].rule,
    total: rubricTotal(rubric.criteria),
  };
}

/** The narrowest and widest share of the width the red flags column takes. */
export const FLAG_SHARE = Object.freeze({ max: 0.5, min: 0.2 });

/**
 * What a column's text weighs, in characters: its labels and texts, plus
 * the part line each item and the red flags' title leave unfilled.
 */
const ITEM_WEIGHT = 20;
const TITLE_WEIGHT = 20;

const weight = (list) =>
  list.reduce(
    (sum, item) => sum + item.label.length + item.text.length + ITEM_WEIGHT,
    0
  );

/**
 * The share of the width each of a criterion's two columns takes, items
 * then red flags, in proportion to their text so both end near the same
 * line, the red flags held between FLAG_SHARE's bounds.
 */
export function columnShares({ flags, items }) {
  const flagWeight = weight(flags) + TITLE_WEIGHT;
  const share = flagWeight / (weight(items) + flagWeight);
  const clamped = Math.min(FLAG_SHARE.max, Math.max(FLAG_SHARE.min, share));
  const flagShare = Math.round(clamped * 100) / 100;
  return [Math.round((1 - flagShare) * 100) / 100, flagShare];
}

/** The band row each criterion prints, highest band first. */
export const bandRow = (rule) => [
  { key: "exceeds", points: [rule.exceeds] },
  { key: "meets", points: rule.ladder },
  { key: "doesNotMeet", points: [rule.doesNotMeet] },
  { key: "missing", points: [rule.missing.points] },
];

const SESSION =
  /\b(\w+) minutes per student plus about (\w+) minutes for setup and wrap/;
/** When sessions run, as the page's intro states it: "between week 8 and finals week". */
const SESSION_WEEKS = /\bbetween (week \d+) and (finals week|week \d+)\b/;

const toNumber = (word) =>
  DIGITS.test(word) ? Number(word) : NUMBER_WORDS[word.toLowerCase()];

/**
 * The session rule from the defense page's source: minutes per student,
 * minutes of setup and wrap, and the weeks sessions run in ("week 8 to
 * finals week", from "between week 8 and finals week"). Throws when either
 * sentence is gone, so the cover never prints a length or weeks the page
 * no longer states.
 */
export function sessionRule(mdx) {
  const found = mdx.match(SESSION);
  const perStudent = found && toNumber(found[1]);
  const setup = found && toNumber(found[2]);
  if (!(perStudent && setup)) {
    throw new Error(
      'defense.mdx: no "<n> minutes per student plus about <n> minutes for setup and wrap". The session cover reads the session length from it.'
    );
  }
  const between = mdx.match(SESSION_WEEKS);
  if (!between) {
    throw new Error(
      'defense.mdx: no "between week <n> and <week n, or finals week>". The session cover prints the weeks sessions run in from it.'
    );
  }
  return { perStudent, setup, weeks: `${between[1]} to ${between[2]}` };
}

/** The minutes a session of `students` runs. */
export const sessionMinutes = (students, rule) =>
  students * rule.perStudent + rule.setup;

/** "First Last", from a roster student's parts. */
export const fullName = ({ first, last }) =>
  [first, last].filter(Boolean).join(" ");

const compare = (a, b) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

/**
 * The roster's teams, `{ members, noTeam, team }`, by team name, with the
 * students in no group gathered in one entry (team "") at the end, so
 * nobody is dropped. Members are `{ email, first, last }`, by last name.
 */
export function sessionTeams(students) {
  const byTeam = new Map();
  for (const { email, first, last, team } of students) {
    if (!byTeam.has(team)) {
      byTeam.set(team, []);
    }
    byTeam.get(team).push({ email, first, last });
  }
  return [...byTeam]
    .map(([team, members]) => ({
      members: members.sort(
        (a, b) => compare(a.last, b.last) || compare(a.first, b.first)
      ),
      noTeam: team === "",
      team,
    }))
    .sort(
      (a, b) => Number(a.noTeam) - Number(b.noTeam) || compare(a.team, b.team)
    );
}

/**
 * The session table's rows: one per student, then one blank for a student
 * not on the roster. A row holds a name and nothing else: the speaking
 * order is drawn at the start of the session and never printed.
 */
export const coverRows = (team) => [
  ...team.members.map((member) => ({
    id: member.email,
    name: fullName(member),
  })),
  { id: "", name: "" },
];

/**
 * The pages that print, in order: for each team picked (`selected`, a Set
 * of team names), its session cover, then a live sheet per student, then a
 * blank live sheet when `blankSheets` is on. Each page is `{ id, kind,
 * team }`, plus `student` (null on a blank sheet) on a live sheet.
 */
export function printPages(teams, { blankSheets = false, selected }) {
  return teams
    .filter((team) => selected.has(team.team))
    .flatMap((team) => [
      { id: `cover:${team.team}`, kind: "cover", team },
      ...team.members.map((student) => ({
        id: `sheet:${team.team}:${student.email}`,
        kind: "sheet",
        student,
        team,
      })),
      ...(blankSheets
        ? [{ id: `blank:${team.team}`, kind: "sheet", student: null, team }]
        : []),
    ]);
}

/** What `printPages` holds: teams, covers, live sheets, blanks, pages. */
export function pageCounts(pages) {
  const covers = pages.filter((p) => p.kind === "cover").length;
  const blanks = pages.filter((p) => p.kind === "sheet" && !p.student).length;
  return {
    blanks,
    covers,
    pages: pages.length,
    sheets: pages.length - covers - blanks,
    teams: covers,
  };
}

/** The font scales a live sheet may step down through to fit one page. */
export const FIT_SCALES = Object.freeze([1, 0.96, 0.92, 0.88, 0.85]);

/**
 * The first scale at which `fits(scale)` is true, or null when the sheet
 * runs past one page even at the smallest.
 */
export function firstFit(fits, scales = FIT_SCALES) {
  return scales.find((scale) => fits(scale)) ?? null;
}

// The peer roster as the tools pages use it: the Canvas roster
// (roster.mjs) plus the students added by hand because they are enrolled
// in another section, and the summary a page previews: each team with its
// members, and who is left out of the survey and why. Pure: no DOM, no I/O.

import { attempt } from "./attempt.mjs";
import { MAX_TEAM_SIZE } from "./peer-contacts.mjs";
import { parseRoster, splitName } from "./roster.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Why a student gets no survey. */
export const LEFT_OUT = Object.freeze({
  alone: "alone on a team",
  noGroup: "in no group",
  oversized: `on a team over ${MAX_TEAM_SIZE}`,
});

/**
 * An added student as a roster student: the shape parseRoster returns, with
 * no Canvas user ID (they are not in this course's export) and
 * `otherSection` set, so the scorer writes them to their own CSV.
 */
export function addedStudent({ email, name, team }) {
  const fullName = name.trim();
  return {
    canvasUserId: "",
    email: email.trim().toLowerCase(),
    ...splitName(fullName),
    name: fullName,
    otherSection: true,
    team: team.trim(),
  };
}

/** A team the survey goes to: two members up to MAX_TEAM_SIZE. */
export const isSurveyedTeam = (size) => size >= 2 && size <= MAX_TEAM_SIZE;

/** How many students and teams of a summary (rosterSummary) get the survey. */
export function surveyedCount(summary) {
  const teams = summary.teams.filter((team) => isSurveyedTeam(team.size));
  return {
    students: teams.reduce((sum, team) => sum + team.size, 0),
    teams: teams.length,
  };
}

const SPACES = /\s+/g;

/** A team name as compared: trimmed, single-spaced, lower case. */
const teamKey = (name) => name.trim().replace(SPACES, " ").toLowerCase();

/** Edits from one string to the other (Levenshtein). */
function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const next = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const swap = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + swap);
    }
    row = next;
  }
  return row[b.length];
}

/**
 * The roster's spelling of team `name`, compared without case or extra
 * spaces, or null when no team matches.
 */
export function matchTeam(name, teams) {
  const key = teamKey(name);
  return teams.find((team) => teamKey(team) === key) ?? null;
}

/** The `count` roster teams closest to `name`, closest first. */
export const closestTeams = (name, teams, count = 3) =>
  teams
    .map((team) => ({ d: distance(teamKey(name), teamKey(team)), team }))
    .sort((a, b) => a.d - b.d || a.team.localeCompare(b.team))
    .slice(0, count)
    .map(({ team }) => team);

/**
 * Checks a student about to be added: a name, an email that looks like
 * one and is on neither the roster nor the students already added
 * (`students`), and a team. The team must match a roster team (matchTeam),
 * and is stored in the roster's spelling, unless `newTeam` confirms a team
 * the roster does not have. Returns `{ entry, problems, suggestions }`:
 * the entry to save, the messages, and the closest roster teams when the
 * team matched none.
 */
export function checkAddedStudent(entry, students, { newTeam = false } = {}) {
  const problems = [];
  let suggestions = [];
  if (entry.name.trim() === "") {
    problems.push("Enter the student's name.");
  }
  const email = entry.email.trim().toLowerCase();
  if (EMAIL.test(email)) {
    if (students.some((student) => student.email === email)) {
      problems.push(`${email} is already on the roster.`);
    }
  } else {
    problems.push("Enter the student's email address.");
  }
  const teams = [
    ...new Set(students.map((s) => s.team).filter((name) => name !== "")),
  ];
  let team = entry.team.trim().replace(SPACES, " ");
  if (team === "") {
    problems.push("Enter the student's team.");
  } else if (matchTeam(team, teams)) {
    team = matchTeam(team, teams);
  } else if (!newTeam) {
    suggestions = closestTeams(team, teams);
    problems.push(
      `No team "${team}" in the roster${suggestions.length > 0 ? `; closest: ${suggestions.join(", ")}` : ""}. Pick one, or confirm it is a new team.`
    );
  }
  return {
    entry: { email: entry.email.trim(), name: entry.name.trim(), team },
    problems,
    suggestions,
  };
}

/**
 * The roster's students followed by the added ones (`added` as the form
 * saved them). An added student whose email the roster now holds is left
 * out and listed in `skipped`: the roster wins.
 */
export function withAdded(students, added) {
  const emails = new Set(students.map((student) => student.email));
  const skipped = [];
  const extra = [];
  for (const entry of added) {
    const student = addedStudent(entry);
    if (emails.has(student.email)) {
      skipped.push(student);
      continue;
    }
    emails.add(student.email);
    extra.push(student);
  }
  return { skipped, students: [...students, ...extra] };
}

/**
 * The roster as a page previews it. `teams` lists each team in first-seen
 * order, `{ team, members, size, otherSection }` (`otherSection` counts the
 * added members); `leftOut` lists everyone who gets no survey, `{ name,
 * email, team, reason }`, reason one of LEFT_OUT; `oversized` names the
 * teams over MAX_TEAM_SIZE, which stop the contact list until split.
 */
export function rosterSummary(students) {
  const byTeam = new Map();
  const leftOut = [];
  for (const student of students) {
    if (student.team === "") {
      leftOut.push({ ...pick(student), reason: LEFT_OUT.noGroup });
      continue;
    }
    if (!byTeam.has(student.team)) {
      byTeam.set(student.team, []);
    }
    byTeam.get(student.team).push(student);
  }
  const teams = [...byTeam].map(([team, members]) => ({
    members,
    otherSection: members.filter((m) => m.otherSection).length,
    size: members.length,
    team,
  }));
  for (const { members, size } of teams) {
    if (isSurveyedTeam(size)) {
      continue;
    }
    if (size === 1) {
      leftOut.push({ ...pick(members[0]), reason: LEFT_OUT.alone });
    } else {
      leftOut.push(
        ...members.map((m) => ({ ...pick(m), reason: LEFT_OUT.oversized }))
      );
    }
  }
  return {
    leftOut,
    oversized: teams.filter((t) => t.size > MAX_TEAM_SIZE).map((t) => t.team),
    teams,
  };
}

const pick = ({ email, name, otherSection, team }) => ({
  email,
  name,
  otherSection: Boolean(otherSection),
  team,
});

/**
 * Everything a page shows about the roster, from the saved file (`{ name,
 * text }` or null) and the added students: `{ error, students, skipped,
 * summary }`. `error` is the roster's parse error, or "" (students and
 * summary then null when there is no file or it fails).
 */
export function rosterModel(file, added = []) {
  if (!file) {
    return { error: "", skipped: [], students: null, summary: null };
  }
  const { error, value } = attempt(() =>
    withAdded(parseRoster(file.text), added)
  );
  if (error) {
    return { error, skipped: [], students: null, summary: null };
  }
  const { skipped, students } = value;
  return { error: "", skipped, students, summary: rosterSummary(students) };
}

const OTHER = " (another section)";
const named = (student) =>
  `${student.name || student.email}${student.otherSection ? OTHER : ""}`;

/** What a team's row says about it beyond its members. */
function teamNote({ otherSection, size }) {
  if (isSurveyedTeam(size)) {
    return otherSection > 0 ? `${otherSection} from another section` : "";
  }
  return size === 1
    ? "Alone: no survey"
    : `Over ${MAX_TEAM_SIZE}: split the team`;
}

/** The summary's teams as a table preview's `{ header, rows }`. */
export const teamsTable = (summary) => ({
  header: ["Team", "Size", "Members", "Note"],
  rows: summary.teams.map((team) => [
    team.team,
    String(team.size),
    team.members.map(named).join("; "),
    teamNote(team),
  ]),
});

/** Who gets no survey, as a table preview's `{ header, rows }`. */
export const leftOutTable = (summary) => ({
  header: ["Student", "Email", "Team", "Why"],
  rows: summary.leftOut.map((student) => [
    named(student),
    student.email,
    student.team,
    student.reason,
  ]),
});

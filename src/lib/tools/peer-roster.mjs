// The peer roster as the tools pages use it: the Canvas roster
// (roster.mjs) plus the students added by hand because they are enrolled
// in another section, and the summary a page previews: each team with its
// members, and who is left out of the survey and why. Pure: no DOM, no I/O.

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

/**
 * What is wrong with a student about to be added, as messages: a name, an
 * email that looks like one, a team, and an email on neither the roster nor
 * the students already added. `students` is everyone so far.
 */
export function addedStudentProblems(entry, students) {
  const problems = [];
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
  if (entry.team.trim() === "") {
    problems.push("Enter the student's team, spelled as in the roster.");
  }
  return problems;
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
    if (size === 1) {
      leftOut.push({ ...pick(members[0]), reason: LEFT_OUT.alone });
    } else if (size > MAX_TEAM_SIZE) {
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
  try {
    const { skipped, students } = withAdded(parseRoster(file.text), added);
    return { error: "", skipped, students, summary: rosterSummary(students) };
  } catch (error) {
    return { error: error.message, skipped: [], students: null, summary: null };
  }
}

const OTHER = " (another section)";
const named = (student) =>
  `${student.name || student.email}${student.otherSection ? OTHER : ""}`;

/** What a team's row says about it beyond its members. */
function teamNote({ otherSection, size }) {
  if (size === 1) {
    return "Alone: no survey";
  }
  if (size > MAX_TEAM_SIZE) {
    return `Over ${MAX_TEAM_SIZE}: split the team`;
  }
  return otherSection > 0 ? `${otherSection} from another section` : "";
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

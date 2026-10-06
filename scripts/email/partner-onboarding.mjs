#!/usr/bin/env node
// Welcomes each project partner and mentor: their teams, what happens next,
// weekly meetings, the term schedule, splitting large teams, and their part in
// grading. Reads the partner sheet, and the Canvas group roster when given for
// student names and team sizes. One letter per person: rows that share any
// partner address are one letter, To every address on them. See README.md in
// this folder.
//
//   node scripts/email/partner-onboarding.mjs --partners data/partners.csv
//     [--roster data/roster.csv] [--cc co-instructor@oregonstate.edu ...]
//     [--split-at 6] [--signature "Best,\nName"] [--out data/onboarding-letters]

import { parseArgs } from "node:util";
import {
  emailsIn,
  teamKey as norm,
  tidy,
} from "../../src/lib/partner-sheet.mjs";
import {
  boldLead,
  esc,
  linkify,
  listJoin,
  quoted,
  readTable,
  signatureFrom,
  signatureHtml,
  writeLetters,
} from "./lib.mjs";

const { values: args } = parseArgs({
  options: {
    cc: { default: [], multiple: true, type: "string" },
    out: { default: "data/onboarding-letters", type: "string" },
    partners: { type: "string" },
    roster: { type: "string" },
    signature: {
      default:
        "Best,\nAlex Ulbrich and Kirsten Winters\nCS Capstone Instructors",
      type: "string",
    },
    "split-at": { default: "6", type: "string" },
  },
});
if (!args.partners) {
  console.error(
    "usage: node scripts/email/partner-onboarding.mjs --partners <partners.csv> [--roster <roster.csv>] [--cc <address>]"
  );
  process.exit(1);
}
const signature = signatureFrom(args.signature);
const splitAt = Number(args["split-at"]);
const SCHEDULE = "https://capstone.alexulbrich.com/introduction/schedule/";
const EVALUATION =
  "https://capstone.alexulbrich.com/assignments/project-partner-evaluation/";

// ---- the letter text: edit here --------------------------------------------

function subject(l) {
  return l.teams.length === 1
    ? "CS Capstone: next steps with your student team"
    : "CS Capstone: next steps with your student teams";
}

// No student names: the letter goes outside the university (FERPA). The
// team's size and its role are enough.
// A mentor letter already says every team is student proposed.
function teamLine(t, l) {
  const details = [
    t.size ? `${t.size} ${t.size === 1 ? "student" : "students"}` : "",
    t.isMentor && !l.isMentor ? "student-proposed, you are the mentor" : "",
  ].filter(Boolean);
  return details.length ? `${t.team} (${details.join(", ")})` : t.team;
}

// The evaluation is written for a partner; say where the mentor stands in.
function mentorNote(l, mentored) {
  if (l.isMentor) {
    return " As the mentor, you stand in as the project partner for both.";
  }
  if (mentored.length === 0) {
    return "";
  }
  return ` For ${listJoin(mentored.map(quoted))}, which you mentor, you stand in as the project partner.`;
}

// A string is a paragraph and { list } a bulleted list.
function paragraphs(l) {
  const one = l.teams.length === 1;
  const large = l.teams.filter((t) => t.size >= splitAt);
  const mentored = l.teams.filter((t) => t.isMentor).map((t) => t.team);
  const p = [];
  p.push(l.greeting ? `Dear ${l.greeting},` : "Hello,");
  const thanks = l.isMentor
    ? `Thank you for mentoring ${one ? "a student-proposed project" : "student-proposed projects"} for the CS Capstone this year.`
    : "Thank you for being a project partner for the CS Capstone this year.";
  p.push(`${thanks} ${one ? "Your team:" : "Your teams:"}`);
  p.push({ list: l.teams.map((t) => teamLine(t, l)) });
  p.push(
    one
      ? "If your team is not already in touch with you, the students will email you to set up a first meeting."
      : "If a team is not already in touch with you, its students will email you to set up a first meeting."
  );
  p.push(
    `Meetings: please meet with ${one ? "your team" : "each team"} for about an hour a week, in person or online, at a time you agree on.`
  );
  if (large.length) {
    const names = listJoin(large.map((t) => quoted(t.team)));
    p.push(
      `Team size: we aim for 3-5 students per team, minimum 3. ${names} ${large.length === 1 ? "is" : "are"} larger, so please discuss with ${large.length === 1 ? "that team" : "those teams"} whether the project can split into two distinct scopes, one per team.`
    );
  }
  if (!one) {
    p.push(
      "Several teams: please discuss with your teams whether they need to align, for example on a shared tech stack, repositories, accounts, or who owns what."
    );
  }
  p.push(
    `Schedule: the course runs fall through spring and ends with the Engineering Expo. Details per term: ${SCHEDULE}`
  );
  p.push(
    `Grading: each term you will fill out a short midterm pulse (week 6) and an end-of-term evaluation (week 10), together 25% of the team's grade.${mentorNote(l, mentored)} If you can, please look over the scoring anchors beforehand so you can guide the students: ${EVALUATION}`
  );
  p.push(
    "After the course: please agree early on who maintains the project once it is done, where the code, data and accounts live, and what handoff you expect."
  );
  p.push(
    "Questions? Reply to this email. Thank you for working with our students."
  );
  return p;
}

// The greeting uses a first name: the first word of the sheet's name, past a
// leading title, so "Dr. Jane Smith" opens "Dear Jane,".
const TITLE = /^(dr|prof|professor|mr|mrs|ms|mx)\.?$/i;
function firstName(full) {
  const words = full.split(/\s+/).filter(Boolean);
  return words.find((w) => !TITLE.test(w)) ?? words[0] ?? "";
}

// ---- read and group --------------------------------------------------------

const sheet = readTable(args.partners, [
  "Canvas Group Name",
  "Team Size",
  "Student Proposer",
  "Project Partner / Mentor Email",
  "Project Partner / Mentor Name",
]);
const roster = args.roster
  ? readTable(args.roster, ["name", "login_id", "group_name"])
  : null;

const byTeamName = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const problems = [];

// Addresses only, to count heads; no student name reaches a letter.
const studentsByTeam = new Map();
for (const r of roster ?? []) {
  // Canvas's Test Student has no login_id; it is nobody to count.
  if (!(r.group_name && r.login_id.includes("@"))) {
    continue;
  }
  const key = norm(r.group_name);
  const seen = studentsByTeam.get(key) ?? new Set();
  studentsByTeam.set(key, seen.add(r.login_id.toLowerCase()));
}

const rows = [];
const seenTeams = new Set();
for (const r of sheet) {
  const team = tidy(r["Canvas Group Name"]);
  if (!team) {
    continue;
  }
  if (seenTeams.has(norm(team))) {
    problems.push(`Partner sheet lists ${team} twice; using the first row`);
    continue;
  }
  seenTeams.add(norm(team));
  const emails = emailsIn(r["Project Partner / Mentor Email"]);
  if (emails.length === 0) {
    problems.push(`${team} has no partner or mentor email: not in any letter`);
    continue;
  }
  const enrolled = studentsByTeam.get(norm(team))?.size ?? 0;
  // A team with nobody on it is not running: telling its partner "here is
  // your team" would be wrong. Left out; the page lists it.
  if (roster && enrolled === 0) {
    problems.push(
      `${team} has no students in the roster: left out of the letters`
    );
    continue;
  }
  rows.push({
    emails,
    isMentor: r["Student Proposer"] !== "",
    name: r["Project Partner / Mentor Name"],
    size: roster ? enrolled : Number(r["Team Size"]) || 0,
    team,
  });
}

// A Canvas group with students and no sheet row has a partner nobody can
// write to from here; say so rather than skip it in silence.
const groupNames = new Map(
  (roster ?? [])
    .filter((r) => r.group_name)
    .map((r) => [norm(r.group_name), tidy(r.group_name)])
);
for (const [key, name] of groupNames) {
  if (studentsByTeam.has(key) && !seenTeams.has(key)) {
    problems.push(
      `${name} is in the roster but not in the partner sheet: no partner letter`
    );
  }
}

// Rows that share any address are one person, or colleagues on one project:
// one letter, To every address. A small union-find over the row indexes.
const parent = rows.map((_, i) => i);
function find(i) {
  let root = i;
  while (parent[root] !== root) {
    root = parent[root];
  }
  parent[i] = root;
  return root;
}
const firstRowFor = new Map();
rows.forEach((row, i) => {
  for (const e of row.emails) {
    const key = e.toLowerCase();
    if (firstRowFor.has(key)) {
      parent[find(i)] = find(firstRowFor.get(key));
    } else {
      firstRowFor.set(key, i);
    }
  }
});
const groups = new Map();
rows.forEach((row, i) => {
  const root = find(i);
  groups.set(root, [...(groups.get(root) ?? []), row]);
});

const letters = [...groups.values()].map((group) => {
  const to = new Map();
  for (const e of group.flatMap((r) => r.emails)) {
    to.set(e.toLowerCase(), to.get(e.toLowerCase()) ?? e);
  }
  // A name greets only when it names everyone in To: one address, and one
  // first name across its rows ("Mia Mentor" and "Dr. Mia Mentor" agree). A
  // row's name covers that row's addresses, not a colleague pulled in by
  // another row, so anything else falls back to "Hello,".
  const names = [...new Set(group.map((r) => r.name).filter(Boolean))];
  const firstNames = new Set(names.map(firstName));
  const named = to.size === 1 && firstNames.size === 1;
  if (firstNames.size > 1 || (to.size > 1 && names.length)) {
    problems.push(
      `${[...to.values()].join(", ")}: the sheet names ${names.join(" / ")}; the letter opens with "Hello,"`
    );
  }
  return {
    greeting: named ? [...firstNames][0] : "",
    // A mentor letter only when every team is student proposed.
    isMentor: group.every((r) => r.isMentor),
    name: names[0] ?? "",
    teams: group.map((r) => ({
      isMentor: r.isMentor,
      size: r.size,
      team: r.team,
    })),
    to: [...to.values()],
  };
});
for (const l of letters) {
  l.teams.sort((a, b) => byTeamName(a.team, b.team));
}
letters.sort((a, b) => (a.name || a.to[0]).localeCompare(b.name || b.to[0]));

// ---- render ----------------------------------------------------------------

function toText(l) {
  const body = paragraphs(l)
    .map((p) =>
      typeof p === "string" ? p : p.list.map((i) => `* ${i}`).join("\n")
    )
    .join("\n\n");
  return `${body}\n\n${signature}\n`;
}

function toHtml(l) {
  const body = paragraphs(l)
    .map((p) =>
      typeof p === "string"
        ? `<p>${boldLead(linkify(esc(p)))}</p>`
        : `<ul>${p.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
    )
    .join("\n");
  return `${body}\n${signatureHtml(signature)}`;
}

const count = (pred) => letters.filter(pred).length;
writeLetters({
  letters: letters.map((l) => ({
    cc: args.cc,
    html: toHtml(l),
    stem: l.to[0],
    subject: subject(l),
    tags: [
      l.isMentor
        ? { label: "mentor", tone: "blue" }
        : { label: "partner", tone: "" },
      l.teams.length > 1
        ? { label: `${l.teams.length} teams`, tone: "green" }
        : null,
      l.teams.some((t) => t.size >= splitAt)
        ? { label: "large team", tone: "orange" }
        : null,
    ].filter(Boolean),
    text: toText(l),
    title: `${l.name || l.to[0]}: ${l.teams.map((t) => t.team).join(", ")}`,
    to: l.to,
  })),
  out: args.out,
  problems,
  summary: `${letters.length} letters: ${count((l) => !l.isMentor)} partner, ${count((l) => l.isMentor)} mentor, ${count((l) => l.teams.length > 1)} with several teams, ${count((l) => l.teams.some((t) => t.size >= splitAt))} with a team of ${splitAt}+.${roster ? "" : " No roster given: no student names, sizes from the sheet."}`,
  title: "Partner onboarding letters",
});

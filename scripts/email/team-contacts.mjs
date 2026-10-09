#!/usr/bin/env node
// Tells each team who their project partner or mentor is. Joins the Canvas
// group roster to the partner sheet on the group name and drafts one letter
// per team, To every student on it. See README.md in this folder.
//
//   node scripts/email/team-contacts.mjs --roster data/roster.csv
//     --partners data/partners.csv [--cc co-instructor@oregonstate.edu ...]
//     [--split-at 6] [--signature "Best,\nName"] [--out data/team-letters]

import { parseArgs } from "node:util";
import {
  emailsIn,
  teamKey as norm,
  tidy,
} from "../../src/lib/partner-sheet.mjs";
import {
  esc,
  linkify,
  quoted,
  readTable,
  signatureFrom,
  signatureHtml,
  writeLetters,
} from "./lib.mjs";

const { values: args } = parseArgs({
  options: {
    cc: { default: [], multiple: true, type: "string" },
    out: { default: "data/team-letters", type: "string" },
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
if (!(args.roster && args.partners)) {
  console.error(
    "usage: node scripts/email/team-contacts.mjs --roster <roster.csv> --partners <partners.csv> [--cc <address>]"
  );
  process.exit(1);
}
const signature = signatureFrom(args.signature);
const splitAt = Number(args["split-at"]);
const ASSIGNMENT = "https://capstone.alexulbrich.com/assignments/term-startup/";
const WEEK2_LIST = `${ASSIGNMENT}#fall-by-sunday-of-week-2`;

// ---- the letter text: edit here --------------------------------------------

function subject(t) {
  return t.isMentor
    ? `Capstone ${t.team}: your project mentor`
    : `Capstone ${t.team}: your project partner`;
}

// A string is a paragraph; { contact: true } is the contact block and
// { list } a bulleted list.
function paragraphs(t) {
  const role = t.isMentor ? "mentor" : "project partner";
  const p = [];
  p.push("Hello everyone,");
  if (t.isMentor) {
    p.push(
      `Your team, ${quoted(t.team)}, is working on a student-proposed project (proposed by ${t.proposer}). That means your contact is a mentor rather than an industry project partner: your mentor advises and guides the team, and the project's direction comes from the team and its student proposer.`
    );
  } else {
    p.push(
      `Your team, ${quoted(t.team)}, is matched with the following project partner:`
    );
  }
  p.push({ contact: true });
  p.push(
    `If you are not already in touch, please send your introduction email to your ${role} as soon as you can. It should come from the team, not from one student: write it together and copy every teammate. The Term Startup assignment provides a template; adapt it to your team and your project rather than sending it as is. Your first meeting has to fit their calendar, so the earlier you ask, the better. By Sunday of week 2, your team needs to work through this list with your ${role}: ${WEEK2_LIST}`
  );
  if (t.otherTeams.length) {
    p.push(
      `Your project partner also works with ${t.otherTeams.length === 1 ? "another team" : "other teams"} this term:`
    );
    p.push({ list: t.otherTeams });
    p.push(
      "When you meet, discuss with them whether your teams need to align, for example on a shared tech stack, shared repositories or accounts, meeting times, or, if you share a project, what each team owns (the last item on that week 2 list)."
    );
  }
  if (t.size >= splitAt) {
    p.push(
      `Your team has ${t.size} students, more than the 3-5 we aim for, so it will split into two teams. After your first meeting with your ${role}, agree with them how the work divides between the two teams, and settle what each team owns, the last item on that week 2 list.`
    );
  }
  return p;
}

function contactLines(t) {
  const label = t.isMentor ? "Mentor" : "Project partner";
  const lines = [];
  if (t.contactName) {
    lines.push(`${label}: ${t.contactName}`);
  }
  lines.push(`Email: ${t.contactEmails.join(", ")}`);
  if (t.contactDetails) {
    lines.push(`Other contact details: ${t.contactDetails}`);
  }
  return lines;
}

// ---- join ------------------------------------------------------------------

const roster = readTable(args.roster, ["name", "login_id", "group_name"]);
const sheet = readTable(args.partners, [
  "Canvas Group Name",
  "Team Size",
  "Student Proposer",
  "Project Partner / Mentor Email",
  "Project Partner / Mentor Name",
  "Additional Contact Details",
  "Notes",
]);

const problems = [];

const teams = new Map();
for (const r of roster) {
  if (!r.group_name) {
    problems.push(`Student ${r.name || r.login_id} has no group`);
    continue;
  }
  if (!r.login_id.includes("@")) {
    problems.push(
      `Student ${r.name} in ${r.group_name} has no email (login_id "${r.login_id}")`
    );
    continue;
  }
  const key = norm(r.group_name);
  const team = teams.get(key) ?? {
    students: new Map(),
    team: tidy(r.group_name),
  };
  team.students.set(r.login_id.toLowerCase(), {
    email: r.login_id,
    name: r.name,
  });
  teams.set(key, team);
}

const sheetByTeam = new Map();
for (const r of sheet) {
  const key = norm(r["Canvas Group Name"]);
  if (!key) {
    continue;
  }
  if (sheetByTeam.has(key)) {
    problems.push(
      `Partner sheet lists ${r["Canvas Group Name"]} twice; using the first row`
    );
    continue;
  }
  sheetByTeam.set(key, r);
}

const letters = [];
for (const [key, team] of teams) {
  const row = sheetByTeam.get(key);
  if (!row) {
    problems.push(
      `${team.team} is in the roster but not in the partner sheet: no letter`
    );
    continue;
  }
  const contactEmails = emailsIn(row["Project Partner / Mentor Email"]);
  if (contactEmails.length === 0) {
    problems.push(`${team.team} has no partner or mentor email: no letter`);
    continue;
  }
  const { size } = team.students;
  if (row["Team Size"] && Number(row["Team Size"]) !== size) {
    problems.push(
      `${team.team}: sheet says ${row["Team Size"]} students, roster has ${size}; the letter uses ${size}`
    );
  }
  letters.push({
    contactDetails: row["Additional Contact Details"],
    contactEmails,
    contactName: row["Project Partner / Mentor Name"],
    grader: row.Grader ?? "",
    isMentor: row["Student Proposer"] !== "",
    notes: row.Notes,
    proposer: row["Student Proposer"],
    size,
    students: [...team.students.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    team: team.team,
  });
}
for (const [key, row] of sheetByTeam) {
  if (!teams.has(key)) {
    problems.push(
      `${row["Canvas Group Name"]} is in the partner sheet but has no students in the roster`
    );
  }
}

// Partner teams that share any partner address. Mentor letters are left out:
// a mentor's teams run separate student projects.
const byTeamName = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const teamsByEmail = new Map();
for (const t of letters.filter((l) => !l.isMentor)) {
  for (const e of t.contactEmails) {
    const key = e.toLowerCase();
    teamsByEmail.set(key, [...(teamsByEmail.get(key) ?? []), t.team]);
  }
}
for (const t of letters) {
  const others = t.isMentor
    ? []
    : t.contactEmails.flatMap((e) => teamsByEmail.get(e.toLowerCase()) ?? []);
  t.otherTeams = [...new Set(others)]
    .filter((name) => name !== t.team)
    .sort(byTeamName);
}
letters.sort((a, b) => byTeamName(a.team, b.team));

// ---- render ----------------------------------------------------------------

function toText(t) {
  const body = paragraphs(t)
    .map((p) => {
      if (typeof p === "string") {
        return p;
      }
      return p.list
        ? p.list.map((item) => `* ${item}`).join("\n")
        : contactLines(t).join("\n");
    })
    .join("\n\n");
  return `${body}\n\n${signature}\n`;
}

function toHtml(t) {
  const body = paragraphs(t)
    .map((p) =>
      typeof p === "string"
        ? `<p>${linkify(esc(p))}</p>`
        : `<ul>${(p.list ?? contactLines(t))
            .map((line) => `<li>${linkify(esc(line))}</li>`)
            .join("")}</ul>`
    )
    .join("\n");
  return `${body}\n${signatureHtml(signature)}`;
}

const count = (pred) => letters.filter(pred).length;
writeLetters({
  letters: letters.map((t) => ({
    cc: args.cc,
    html: toHtml(t),
    note: [t.grader && `Grader: ${t.grader}`, t.notes && `Notes: ${t.notes}`]
      .filter(Boolean)
      .join(" | "),
    stem: t.team,
    subject: subject(t),
    tags: [
      t.isMentor
        ? { label: "mentor", tone: "blue" }
        : { label: "partner", tone: "" },
      t.otherTeams.length
        ? {
            label: `partner shared with ${t.otherTeams.length}`,
            tone: "green",
          }
        : null,
      t.size >= splitAt
        ? { label: `${t.size} students, split`, tone: "orange" }
        : null,
    ].filter(Boolean),
    text: toText(t),
    title: `${t.team}: ${t.students.map((s) => s.name).join(", ")}`,
    to: t.students.map((s) => s.email),
  })),
  out: args.out,
  problems,
  summary: `${letters.length} letters: ${count((t) => !t.isMentor)} partner, ${count((t) => t.isMentor)} mentor, ${count((t) => t.otherTeams.length > 0)} sharing a partner, ${count((t) => t.size >= splitAt)} teams of ${splitAt}+ told to split.`,
  title: "Team contact letters",
});

#!/usr/bin/env node
// Asks every proposer to confirm the published projects they will run and
// the number of teams on each. Reads the staff project export (/admin/projects,
// filtered to the program, "Export CSV") and drafts one letter per proposer,
// plus one per student-proposed project to its mentor with the student Cc'd.
// See README.md in this folder.
//
//   node scripts/email/confirm-projects.mjs --csv data/projects.csv
//     --reply-by "Tuesday, 12 PM" [--program CS46X]
//     [--exclude-program ECE44X-CORVALLIS ...] [--signature "Best,\nName"]
//     [--out data/confirm-letters]

import { parseArgs } from "node:util";
import {
  esc,
  linkify,
  readTable,
  signatureFrom,
  signatureHtml,
  writeLetters,
} from "./lib.mjs";

const { values: args } = parseArgs({
  options: {
    csv: { type: "string" },
    // Repeatable. Drops a project listed in any of these programs, even when
    // it is also in --program.
    "exclude-program": { default: [], multiple: true, type: "string" },
    origin: {
      default: "https://capstone.eecs.oregonstate.edu",
      type: "string",
    },
    out: { default: "data/confirm-letters", type: "string" },
    program: { type: "string" },
    "reply-by": { type: "string" },
    signature: {
      default:
        "Best,\nAlex Ulbrich and Kirsten Winters\nCS Capstone Instructors",
      type: "string",
    },
    subject: {
      default: "Please confirm your capstone projects and number of teams",
      type: "string",
    },
  },
});
if (!(args.csv && args["reply-by"])) {
  console.error(
    'usage: node scripts/email/confirm-projects.mjs --csv <export.csv> --reply-by "<day, date, time>" [--program <course id>]'
  );
  process.exit(1);
}
const signature = signatureFrom(args.signature);

// ---- the letter text: edit here --------------------------------------------

function partnerLetter({ name, projects }) {
  return {
    greeting: name ? `Dear ${name},` : "Hello,",
    intro:
      "We want to confirm with you the following list of projects and number of teams per project:",
    outro: `Please let us know by ${args["reply-by"]}, if you want one or more projects cancelled or if you want to change the number of teams on a project. We are currently assigning students to teams. Students will reach out to you by the end of the week. We aim for 3-5 students per team, with a minimum of 3.`,
    projects,
  };
}

function mentorLetter({ name, projects }) {
  return {
    greeting: name ? `Dear ${name},` : "Hello,",
    intro:
      "We want to confirm the following student-proposed project you are mentoring, and its number of teams:",
    outro: `Please let us know by ${args["reply-by"]}, if you want the project cancelled or if you want to change its number of teams. The student proposer is copied on this message.`,
    projects,
  };
}

// ---- select and group ------------------------------------------------------

const rows = readTable(args.csv, [
  "ID",
  "Title",
  "Status",
  "Openings",
  "Proposer name",
  "Proposer email",
  "Programs",
  "Teams supported",
  "Student proposed",
  "Mentor",
  "Mentor email",
  "Soft deleted",
]);

const skipped = [];
const skip = (row, reason) => skipped.push(`Skipped ${row.Title}: ${reason}`);
const seen = new Set();
const partners = new Map();
const mentorLetters = [];

for (const row of rows) {
  if (seen.has(row.ID)) {
    continue;
  }
  seen.add(row.ID);
  if (row.Status !== "published") {
    skip(row, `status ${row.Status}`);
    continue;
  }
  if (row["Soft deleted"]) {
    skip(row, "soft deleted");
    continue;
  }
  const courses = row.Programs.split(";").map((p) => p.trim());
  const excludedBy = courses.find((c) => args["exclude-program"].includes(c));
  if (excludedBy) {
    skip(row, `also in excluded ${excludedBy} (${row.Programs})`);
    continue;
  }
  if (args.program && !courses.includes(args.program)) {
    skip(row, `not in ${args.program} (${row.Programs || "no program"})`);
    continue;
  }
  if (row.Openings !== "true") {
    skip(row, "closed to applicants");
    continue;
  }
  const project = {
    teams: row["Teams supported"],
    title: row.Title,
    url: `${args.origin.replace(/\/+$/, "")}/projects/${row.ID}`,
  };
  if (row["Student proposed"] === "true") {
    if (!row["Mentor email"]) {
      skip(row, "student proposed, no mentor recorded");
      continue;
    }
    // One letter per project, so no student sees another student's address.
    mentorLetters.push({
      cc: row["Proposer email"],
      kind: "mentor",
      to: row["Mentor email"],
      ...mentorLetter({ name: row.Mentor, projects: [project] }),
    });
    continue;
  }
  const email = row["Proposer email"].toLowerCase();
  if (!email) {
    skip(row, "no proposer email");
    continue;
  }
  const entry = partners.get(email) ?? {
    name: row["Proposer name"],
    projects: [],
    to: row["Proposer email"],
  };
  entry.name ||= row["Proposer name"];
  entry.projects.push(project);
  partners.set(email, entry);
}

const byTitle = (a, b) => a.title.localeCompare(b.title);
const letters = [
  ...[...partners.values()]
    .sort((a, b) => (a.name || a.to).localeCompare(b.name || b.to))
    .map((p) => ({
      cc: "",
      kind: "partner",
      to: p.to,
      ...partnerLetter({ name: p.name, projects: p.projects.sort(byTitle) }),
    })),
  ...mentorLetters.sort((a, b) => a.to.localeCompare(b.to)),
];

// ---- render ----------------------------------------------------------------

const teamsLabel = (n) => `number of teams: ${n}`;

function toText(l) {
  const items = l.projects
    .map((p) => `* ${p.title} (${p.url}), ${teamsLabel(p.teams)}`)
    .join("\n");
  return `${l.greeting}\n\n${l.intro}\n\n${items}\n\n${l.outro}\n\n${signature}\n`;
}

function toHtml(l) {
  const items = l.projects
    .map(
      (p) =>
        `<li><a href="${esc(p.url)}">${esc(p.title)}</a>, ${esc(teamsLabel(p.teams))}</li>`
    )
    .join("\n");
  return `<p>${esc(l.greeting)}</p>\n<p>${esc(l.intro)}</p>\n<ul>\n${items}\n</ul>\n<p>${linkify(esc(l.outro))}</p>\n${signatureHtml(signature)}`;
}

const projectCount = letters.reduce((n, l) => n + l.projects.length, 0);
writeLetters({
  letters: letters.map((l) => ({
    cc: l.cc ? [l.cc] : [],
    html: toHtml(l),
    stem: `${l.kind}-${l.to}`,
    subject: args.subject,
    tags: [
      {
        label: l.kind,
        tone: l.kind === "mentor" ? "blue" : "",
      },
    ],
    text: toText(l),
    title: l.to,
    to: [l.to],
  })),
  out: args.out,
  problems: skipped,
  summary: `${partners.size} partner letters, ${mentorLetters.length} mentor letters, ${projectCount} projects, ${skipped.length} rows skipped.`,
  title: "Project confirmation letters",
});

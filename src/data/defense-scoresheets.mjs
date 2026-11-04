// The wording of the defense scoresheets tool (/tools/defense-scoresheets/):
// the page and its steps, and every line the session cover and the live
// sheet print around the rubric's own text. The questions, items, red
// flags, points, and the Missing rule are the rubric CSV's, read by
// src/lib/tools/defense-sheets.mjs; nothing here retypes them. The
// protocol lines follow Defense Logistics in STAFF-RUNBOOK.md. An
// instructor tool, so it may name Canvas (docs/agents/tools.md).

import { BAND_NAMES } from "../lib/tools/defense-sheets.mjs";
import { clickPaths } from "./click-paths.mjs";
import { plural } from "./tools-text.mjs";

/** The Astro page. */
export const page = {
  description:
    "Print a defense session cover for each team and a one-page live sheet for each student, from the course roster, in your browser.",
  intro:
    "A session cover for each team and a one-page live sheet for each student, with names filled in from the roster. The roster is read in your browser and never uploaded; the questions, items, and red flags come from the defense rubric, word for word.",
  title: "Print Defense Scoresheets",
};

/** What the roster's students in no group are listed and printed under. */
const NO_TEAM = "No team";

/** Step 1: the roster. */
export const rosterText = {
  columns: ". The file has name, login_id, and group_name among its columns.",
  drop: "Canvas roster with groups (.csv)",
  path: clickPaths.canvasRoster,
  read: ({ noTeam, students, teams }) =>
    `${plural(students, "student")} in ${plural(teams, "team")}.${
      noTeam > 0
        ? ` ${noTeam === 1 ? "One student is" : `${noTeam} students are`} in no group; they are listed last, under ${NO_TEAM}.`
        : ""
    }`,
  title: "The roster",
  unreadable: "The roster could not be read",
};

/** Step 2: the term, the assessor, and the teams. */
export const sessionText = {
  all: "Select all",
  assessor: "Assessor",
  assessorHelp:
    "Optional. Printed on every page; leave it blank to write it in.",
  empty: "Add the roster to pick its teams.",
  members: (n) => plural(n, "student"),
  noTeam: NO_TEAM,
  picked: (n, of) => `${n} of ${of}`,
  teams: "Teams to print",
  term: "Term",
  terms: { fall: "Fall", spring: "Spring", winter: "Winter" },
  title: "The sessions",
};

/** Step 3: printing. */
export const printText = {
  blank: "Add one blank live sheet per team",
  button: "Print scoresheets",
  /** The print dialog's file name, when saving a PDF. */
  documentTitle: (term) => `Defense scoresheets, ${term}`,
  none: "Pick at least one team to print.",
  oneSided:
    "Print one-sided, so the live sheet stays in view on the table or beside the call.",
  overflow: {
    body: "The rubric's text runs past one page even at the smallest type the live sheet uses, so each live sheet prints on two pages until the rubric's wording is shortened.",
    title: "A live sheet runs past one page",
  },
  summary: ({ blanks, covers, pages, sheets, teams }) =>
    `${plural(teams, "team")}: ${plural(covers, "cover")} and ${plural(sheets + blanks, "live sheet")}, ${plural(pages, "page")}.`,
  title: "Print",
};

/** The preview beside the steps. */
export const previewText = {
  cover: "Session cover",
  empty: "Pick a team to see its pages here.",
  heading: (team) => `Preview: ${team}`,
  headingEmpty: "Preview",
  sheet: (name) => `${name}, live sheet`,
  shown: (n, of) =>
    `Showing ${n} of ${plural(of, "page")} for this team. The speaking order is never printed: it is drawn at the start of the session.`,
};

/** The session cover, one per team. */
export const coverText = {
  assessor: "Assessor",
  checklist: [
    "Draw the speaking order at random, here, at the start of the session. It was never published in advance.",
    'For each student, pick a different artifact or part from the two or three they brought, the most recent where you can, and give each a different "what breaks if X" question.',
    "For each student, pick a sprint from this term at random for the role question.",
    "The team's regular TA is not in the session. On a video call, every student's camera is on.",
    "The team's recorded decisions, its sprint notes, and its repository are open.",
  ],
  checklistTitle: "Before the first student speaks",
  columns: {
    artifact: "Artifact picked",
    followUp: "Follow-up",
    order: "Order",
    question: '"What breaks if X" question',
    sprint: "Sprint",
    student: "Student",
  },
  entered: "Scores and notes entered in Canvas: yes / no",
  eyebrow: "Defense session cover",
  followUp:
    "Follow-up: when a score comes out borderline, or a student's part of the session ran short, a 5-minute one-to-one in the same defense week, or in week 9 after a week 7 session. Tell the student it is routine.",
  footer: (team) => `${team || NO_TEAM}, session cover`,
  length: (students, minutes) =>
    `${plural(students, "student")}, about ${minutes} minutes`,
  /** The rubric's Missing band, which a no-show scores on every criterion. */
  missing: ({ description, points }) =>
    `${BAND_NAMES.missing}, ${points}, on every criterion: ${description}`,
  notes: "Session notes",
  notOnRoster: "(not on the roster)",
  room: "Room or call link",
  start: "Start time",
  tableTitle: "The session",
  yesNo: "yes / no",
};

/** Each band's letter on the live sheet's band row. */
const BAND_LETTERS = {
  doesNotMeet: "D",
  exceeds: "E",
  meets: "M",
  missing: "",
};

/** The live sheet, one per student. */
export const sheetText = {
  artifact: "Artifact",
  assessor: "Assessor",
  /** "E 20", "M 16 · 12 · 8", "D 4", "0". */
  band: (key, points) =>
    [BAND_LETTERS[key], points.join(" · ")].filter(Boolean).join(" "),
  eyebrow: "Defense live sheet",
  flags: "Red flags",
  followUp: "Follow-up",
  /** The banner's last line: the rubric's Missing band, word for word. */
  missing: ({ missing }) =>
    `${BAND_NAMES.missing}, ${missing.points}: ${missing.description}`,
  notes: "Notes",
  /** The banner's points line, from the rubric's bands. */
  points: ({ doesNotMeet, exceeds, meetsRule }) =>
    `Any red flag: ${doesNotMeet}. Every item ticked: ${exceeds}. Otherwise ${meetsRule}`,
  record: "Record checked",
  recordChoices: "yes / no / NDA live",
  sprint: "Sprint",
  team: (team, term) => `${team || NO_TEAM}, ${term}`,
  tick: "Tick an item when the student says it and neither a follow-up question nor the record undoes it.",
  total: "Total",
  yesNo: "yes / no",
};

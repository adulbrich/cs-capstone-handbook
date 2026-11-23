// The wording of the defense scoresheets tool (/tools/defense-scoresheets/):
// the page and its steps, and every line the session cover and the live
// sheet print around the rubric's own text, the opening question included.
// Each criterion's questions, items, red flags, points, and the Missing
// rule are the rubric CSV's, read by src/lib/tools/defense-sheets.mjs;
// nothing here retypes them but the few words askBreaks finds. The session's
// protocol is Defense Logistics in STAFF-RUNBOOK.md; the cover prints the
// draw of the speaking order and tips for running the session. An instructor
// tool, so it may name Canvas (docs/agents/tools.md).

import { BAND_NAMES } from "../lib/tools/defense-sheets.mjs";
import { clickPaths } from "./click-paths.mjs";
import { plural } from "./tools-text.mjs";

/** The Astro page. */
export const page = {
  /** The intro's last sentence, around its link to the blank live sheet. */
  blank: {
    after: ", with the name, team, and assessor left to write in.",
    before: "Without a roster, print the",
    link: "blank live sheet",
  },
  description:
    "Print a defense session cover for each team and a one-page live sheet for each student, from the course roster, in your browser.",
  intro:
    "A session cover for each team and a one-page live sheet for each student, with names filled in from the roster. The roster is read in your browser and never uploaded; each criterion's questions, items, and red flags come from the defense rubric, the items and red flags word for word.",
  title: "Print Defense Scoresheets",
};

/** What the roster's students in no group are listed and printed under. */
const NO_TEAM = "No team";

/** Step 1: the roster. */
export const rosterText = {
  columns:
    ". The file has name, login_id, and group_name among its columns. To print each student's assessor, add a grader column naming them; without one, the assessor line prints blank to write in.",
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

/** Step 2: the term and the teams. */
export const sessionText = {
  all: "Select all",
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

/** What the cover's table and the live sheet both record of a student's turn. */
const DISCUSSED = "Artifact or topic discussed";

/** The session cover, one per team. */
export const coverText = {
  /** The unexcused no-show, by the rubric's band name. */
  absent: `Absent, and told you before the session: reschedule them this term. Unexcused: ${BAND_NAMES.missing} on every criterion.`,
  assessor: "Assessor",
  columns: {
    artifact: DISCUSSED,
    followUp: "Follow-up",
    order: "Order",
    student: "Student",
  },
  entered: "Scores and notes entered in the gradebook: yes / no",
  eyebrow: "Defense session cover",
  followUp:
    "Follow-up: a 5-minute one-to-one within a week of the session, and no later than finals week. Tell the student it is routine.",
  /** The footer: the team, cut short when long, then the page it is. */
  footer: { after: ", session cover", team: (team) => team || NO_TEAM },
  /** The team's graders from the roster, or nothing when it has none. */
  graders: (graders) => graders.join(", "),
  length: (students, minutes) =>
    `${plural(students, "student")}, about ${minutes} minutes`,
  notes: "Session notes",
  order: "Draw the speaking order at random.",
  room: "Room or call link",
  start: "Start time",
  tableTitle: "The session",
  tips: [
    "Have an open discussion, starting from the live sheet's opening question.",
    "The goal is to see whether the student owns something. Focus on their understanding of the project and their overall contributions.",
    "Focus on the red flags more than anything else.",
    "If one student dominates, redirect: questions go to the named student, and only their answer scores.",
    "Avoid negative feedback in front of the team. If you are uncertain about a student, ask them after the defense to check in with you for a follow-up.",
  ],
  tipsTitle: "Tips",
  /** The term and the weeks sessions run in, "Fall, week 8 to finals week". */
  when: (term, [from, until]) => `${term}, ${from} to ${until}`,
  yesNo: "yes / no",
};

/** Each band's letter on the live sheet's band row. */
const BAND_LETTERS = {
  doesNotMeet: "D",
  exceeds: "E",
  meets: "M",
  missing: "",
};

/**
 * Where the live sheet breaks a rubric question into bullets inside a
 * sentence: the words a new ask starts with, after a comma or ", and".
 * Sentence ends and semicolons break on their own. A break the rubric no
 * longer holds fails the build (liveSheet in defense-sheets.mjs).
 */
export const askBreaks = [
  "how did you know",
  "name two alternatives",
  "say which part",
  "how do you know",
  "list a few things",
  "how did your team",
];

/** The live sheet, one per student. */
export const sheetText = {
  artifact: DISCUSSED,
  assessor: "Assessor",
  /** "E 20", "M 16 · 12 · 8", "D 4", "0". */
  band: (key, points) =>
    [BAND_LETTERS[key], points.join(" · ")].filter(Boolean).join(" "),
  eyebrow: "Defense live sheet",
  flags: "Red flags",
  /** The one-to-one after the session, apart from a criterion's follow-up question. */
  followUp: "Individual follow-up",
  /** The banner's last line: the rubric's Missing band, up to its semicolon. */
  missing: ({ missing }) =>
    `${BAND_NAMES.missing}, ${missing.points}: ${missing.lead}.`,
  notes: "Notes",
  /**
   * The question that opens the student's turn, above the criteria, and
   * the assessor's line under it. Not in the rubric and not scored; its
   * marker says so, since the defense page has the example sheet show
   * exactly what is scored.
   */
  opening: {
    note: "Any work they authored or drove this term fits, code or not. The assessor picks which they walk through.",
    question:
      "What work did you choose for today, and which piece are you proudest of so far?",
    title: "Opening question",
    unscored: "Not scored",
  },
  /** The banner's points line: the rubric's bands, in their own words. */
  points: ({ doesNotMeet, exceeds, flagRule, meetsRule }) =>
    `${flagRule}: ${doesNotMeet}. Otherwise every item ticked: ${exceeds}, or ${meetsRule}`,
  /** The write-in line's label on a No team sheet, where the team number goes. */
  teamLabel: "Team",
  /** What follows the team, or its write-in line, on the team line: the term. */
  teamTerm: (term) => (term ? `, ${term}` : ""),
  /** The banner's first line: the rubric's condition on each item. */
  tick: ({ itemCondition }) =>
    `Tick an item when the student says it, ${itemCondition}.`,
  total: "Total",
  yesNo: "yes / no",
};

/**
 * The example live sheet the defense page links, a blank one with the name,
 * team, assessor, and total all left to write in
 * (scripts/defense-example-pdf.mjs). Its title, and so the PDF's, carries
 * exampleFingerprint (src/lib/tools/defense-example.mjs).
 */
export const example = {
  /** No team: the team line is a labeled write-in, as on a No team sheet. */
  team: { members: [], noTeam: true, team: "" },
  /** No term: the one example serves every term's page. */
  term: "",
  title: (fingerprint) => `Defense live sheet example, ${fingerprint}`,
};

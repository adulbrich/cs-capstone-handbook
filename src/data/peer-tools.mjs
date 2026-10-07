// The wording of the peer evaluation tools pages (/tools/peer-evaluation/):
// every title, help line, summary, and instruction the Prepare and Score
// pages show. The click paths live in click-paths.mjs; the survey's own
// wording and the email in peer-evaluation.mjs. A function here takes the
// numbers its sentence needs, so the pages hold no prose.

import {
  CONTACT_COLUMNS,
  MAX_TEAM_SIZE,
  SLOTS,
} from "../lib/tools/peer-contacts.mjs";
import { clickPaths, pathSteps } from "./click-paths.mjs";

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The three Astro pages: chooser, Prepare, Score. */
export const pages = {
  chooser: {
    description:
      "Prepare the peer evaluation survey, or score its export, step by step.",
    intro:
      "Two guided pages. Each reads the Canvas and Qualtrics files in your browser, shows every output before you download it, and says where it goes. Nothing is uploaded. Both pages share the roster you drop, saved in this browser.",
    prepare: {
      description:
        "From the Canvas roster: the Qualtrics survey, the contact list, and the distribution email, then send.",
      title: "Prepare",
    },
    score: {
      description:
        "From the Qualtrics export and the Canvas rubric export: the report, the scores, and the rubric assessment to import.",
      title: "Score",
    },
    title: "Peer Evaluation",
  },
  prepare: {
    description:
      "Generate the peer evaluation survey, its contact list, and its email from the Canvas roster.",
    intro:
      "Five steps from the Canvas roster to a sent survey. Each step says where its file comes from, shows what it makes, and says where that goes. Check Done to move on; Edit reopens a finished step.",
    title: "Prepare the Peer Evaluation",
  },
  score: {
    description:
      "Score the peer evaluation export and fill the Canvas rubric assessment.",
    intro:
      "Six steps from the Qualtrics export to the grades. It scores the regular survey (midterm, and the fall and winter end-of-term) and CATME (spring end-of-term), as the Peer Evaluations page's Grade Calculation and The CATME Survey state.",
    title: "Score the Peer Evaluation",
  },
};

/** The saved-data box both pages show. */
export const savedText = {
  after: "Leaving the page and coming back picks up where you stopped.",
  clear: "Clear saved data",
  confirm:
    "Remove every file, added student, setting, and done box both peer evaluation pages saved in this browser?",
  notSaved: "Not saved",
  prepare:
    "Saved in this browser only, never uploaded: the roster file and the students you added (shared with the Score page), the survey settings, the checklist, and each step's done box.",
  score:
    "Saved in this browser only, never uploaded: the three files, the students you added (the roster and added students are shared with the Prepare page), the preview setting, and each step's done box.",
};

/** The roster step, on both pages. */
export const rosterText = {
  added: "Added from another section",
  columns: ". The file has name, login_id, and group_name among its columns.",
  drop: "Canvas roster with groups (.csv)",
  empty: "Drop the roster to see its teams.",
  form: {
    add: "Add the student",
    email: {
      help: "Their login, the address the survey goes to.",
      label: "Email",
    },
    label: "Add a student from another section",
    name: { help: "As Canvas shows it: Last, First.", label: "Name" },
    newTeam: "This is a new team, not in the roster: add it as typed.",
    team: {
      help: "A team in the roster; case and spaces do not matter.",
      label: "Team",
    },
  },
  leftOut: "Left out of the survey",
  other: {
    body: "A teammate enrolled in another section is not in this roster. Add them here, or they get no survey and nobody rates them. Added students are saved with the roster and marked in the preview.",
    title: "Teammates in another section",
  },
  oversized: {
    body: (teams) =>
      `The survey rates up to ${MAX_TEAM_SIZE} people, the respondent included. Split ${teams.join(", ")} into smaller groups in Canvas and download the roster again; nothing is generated until then.`,
    title: `A team is over ${MAX_TEAM_SIZE}`,
  },
  path: clickPaths.canvasRoster,
  remove: (name) => (name ? `Remove ${name}` : "Remove"),
  replace: "Replace the roster",
  replaceNote:
    "The Prepare page uses the same saved roster: replacing it here replaces it there.",
  scoreIntro:
    "The roster saved on the Prepare page is used, with its added students. Replace it only if the teams changed since the survey went out.",
  skipped: (emails) =>
    `Now in the roster, so the added entry is ignored: ${emails.join(", ")}. Remove it above.`,
  skippedTitle: "Already in the roster",
  surveyed: ({ leftOut, students, teams }) =>
    `${plural(students, "student")} on ${plural(teams, "team")} get the survey.${leftOut > 0 ? ` ${leftOut} left out.` : ""}`,
  teams: "Teams",
  title: "Canvas roster",
  unreadable: "This roster cannot be read",
};

/** The survey preview's own labels around the survey's wording. */
export const previewText = {
  criterion: "Criterion",
  page: (n, of) => `Page ${n} of ${of}`,
  region: "Survey preview",
  required: "Required",
  total: "Total",
};

/** The Prepare page's steps after the roster. */
export const prepareText = {
  contacts: {
    close: {
      help: "When the survey closes. Every contact row carries it, and the email tells each student.",
      label: "Close date and time",
      missing:
        "Set the close date first: the contact list and the email carry it.",
    },
    columns: `. Check that every column maps by its header: ${CONTACT_COLUMNS.slice(0, -SLOTS).join(", ")}, and ${CONTACT_COLUMNS.at(-SLOTS)} to ${CONTACT_COLUMNS.at(-1)}.`,
    download: (name) => `Download ${name}`,
    path: clickPaths.qualtricsList,
    summary: ({ file, rows }) => `${file}: ${plural(rows, "row")}.`,
    title: "Contact list",
    waiting: "Set the close date first.",
    what: `One row per student who gets the survey: email, team, team size, the least they may give themselves in the split, the close date, and up to ${SLOTS} teammates, which the survey shows. Built from step 1's roster, added students included.`,
  },
  email: {
    as: (email) => `As ${email} receives it.`,
    copyBody: "Copy the body",
    copySubject: "Copy the subject",
    path: clickPaths.qualtricsEmail,
    pathAfter:
      ", to the list from step 3. Keep Individual links (the default), and paste the subject and the body.",
    summary: "Subject and body ready to paste into the distribution.",
    title: "Distribution email",
    waiting: "Set the close date in step 3 first.",
    what: "The email Qualtrics sends each student, with the student's team, the close date from step 3, and their own survey link piped in.",
  },
  label: "Prepare the peer evaluation",
  roster: {
    summary: ({ added, file, students, teams }) =>
      `${file}: ${plural(students, "student")} on ${plural(teams, "team")} get the survey${added > 0 ? `, ${added} added from another section` : ""}.`,
    usedIn:
      "Step 2 previews the survey for its students, step 3 turns it into the contact list, and step 4 previews the email. The Score page reads the same saved roster.",
    waiting: `Drop a roster with at least one team of two or more, and no team over ${MAX_TEAM_SIZE}.`,
  },
  send: {
    after: "Then export the responses and score them on the Score page.",
    // Each line a box to check before the step is done.
    checklist: {
      close: `At the deadline, close the responses still in progress, so a student who stopped partway is recorded: in the survey, ${pathSteps(clickPaths.qualtricsCloseInProgress)}, select them, and close them.`,
      expiration:
        "On the distribution, set the availability end: Advanced options › Link expiration. Students can start and finish until then.",
      personal:
        "Send with Individual links only. The survey is by invitation, so the anonymous link does not open it.",
      reminder:
        "Schedule a reminder halfway to the link expiration, to those who have not finished.",
    },
    // The checklist in the order it happens: the close comes last.
    order: ["expiration", "personal", "reminder", "close"],
    sourceTitle: "Send, then close",
    summary: "Distribution set and sent.",
    title: "Send and close",
    waiting: "Check every line first.",
  },
  survey: {
    advanced: "Advanced: how the rating pages are built",
    advancedWhen:
      "Use one block per teammate slot only when the Loop & Merge survey fails to import or the staff test shows a wrong page.",
    download: (name) => `Download ${name}`,
    error: "No survey",
    label: {
      help: "Appears in Qualtrics as the start of the project name, before the survey title. Defaults to this term's label.",
      label: "Label",
    },
    modes: {
      loop: {
        label: "Loop & Merge over the roster",
        lines: ["One rating page looped over the team. The default."],
        short: "Loop & Merge",
      },
      slots: {
        label: "One block per teammate slot",
        lines: ["The same questions, one block per slot behind a branch."],
        short: "one block per teammate",
      },
    },
    modesLegend: "Rating pages",
    path: clickPaths.qualtricsImport,
    pathAfter: ", and choose this file.",
    sample: {
      help: "Any student on the contact list; the survey adapts to their team.",
      label: "Show the survey as",
      option: ({ Email, Team, TeamSize }) =>
        `${Team}, team of ${TeamSize}: ${Email}`,
    },
    summary: ({ mode, name, variant }) => `${variant}, ${mode}: "${name}".`,
    title: "Survey",
    variantLegend: "Which survey",
    what: "The Qualtrics survey, built from the rubric CSV under canvas/assignments/peer-evaluation/ and the wording in src/data/peer-evaluation.mjs. It reads each student's team and teammates from the contact list (step 3).",
  },
  whatItIs: "What it is",
};

/** The Score page's steps. */
export const scoreText = {
  comments: {
    after:
      "Keep it with the course records. It is never imported or sent to students.",
    download: (name) => `Download ${name}`,
    summary: (n) => `${plural(n, "comment")}, instructor only.`,
    title: "Instructor-only comments",
    what: "Every comment students wrote, with who wrote it and about whom. For the instruction team only.",
  },
  export: {
    detected: "Detected:",
    drop: "Qualtrics responses, labels export (.csv)",
    error: "This export cannot be scored",
    nobody: "Nobody.",
    path: clickPaths.qualtricsLabelsExport,
    pathAfter:
      ". A values export (numeric codes) is refused. Export after the links expire, and do not re-save the file in a spreadsheet.",
    previews: "Count survey previews and test responses (the staff test only)",
    problems: "The export's columns do not fit the survey",
    stopped: "Started without finishing",
    summary: ({ file, finished }) =>
      `${file}: ${plural(finished, "finished response")}.`,
    title: "Qualtrics export",
    usedIn:
      "Step 4 scores its finished responses, and step 6 lists its comments.",
    waiting: "Drop a labels export of a regular or CATME peer survey.",
    warnings: "Warnings",
  },
  grades: {
    download: (name) => `Download ${name}`,
    other: {
      body: "Scored like everyone, and their ratings count toward their teammates, but they are not in this course's rubric export. Their rows, Student Id left empty, are for whoever grades their section.",
      send: "Send it to whoever grades those students' section.",
      title: "Students from other sections",
    },
    path: clickPaths.canvasRubricImport,
    pathAfter: ", on the same assignment.",
    preview: "Rubric assessment to import",
    summary: ({ base, other }) =>
      `${base}-scored.csv${other ? `, and ${base}-other-sections.csv` : ""}.`,
    title: "Grades",
    what: "The rubric export from step 3, filled in: each criterion's points and rating. These rubric scores are the anonymized feedback students receive; nothing else goes to students.",
  },
  label: "Score the peer evaluation",
  results: {
    after: "Instructor only: nothing in this step goes to students.",
    details: "Scores and details",
    download: (name) => `Download ${name}`,
    error: "Nothing scored",
    gaps: "Self versus peers",
    gapsHow:
      "Largest first. Ratings: the self rating's mean minus the mean received. Share: the raw self share minus the mean share received, times N, divided by 5 (none on CATME). A queue for a look.",
    nothing: "Nothing to report.",
    report: "Report",
    summary: ({ lines, students }) =>
      `${plural(students, "student")} scored, ${plural(lines, "report line")}.`,
    title: "Results",
    what: ({ notCompleted, score }) =>
      `Each student scored from what their teammates gave them, as the Peer Evaluations page's Grade Calculation states. A student with no finished response scores ${score} (${notCompleted} this time). Flags for teams of two and rescaled splits never change a score.`,
  },
  roster: {
    summary: ({ added, file, students }) =>
      `${file}: ${plural(students, "student")}${added > 0 ? `, ${added} from another section` : ""}.`,
    usedIn:
      "Step 4 reads who is on which team, and N, the team size, for every score.",
  },
  rubric: {
    count: (n) =>
      `${plural(n, "student")} in the export; each rubric criterion matched to its columns:`,
    drop: "Canvas rubric export (.csv)",
    error: "This rubric export does not fit",
    matched: "Rubric criteria and export columns",
    path: clickPaths.canvasRubricExport,
    pathAfter:
      ", on the assignment this survey grades (midterm, end-of-term, or the spring CATME entry). It needs Enhanced Rubrics, and is not available on an anonymously graded assignment.",
    summary: ({ criteria, file, students }) =>
      `${file}: ${plural(students, "student")}, ${plural(criteria, "criterion", "criteria")} matched.`,
    title: "Canvas rubric export",
    usedIn:
      "Step 5 fills it in, and you import it back on the same assignment.",
    waitingExport:
      "Read; it is matched to the rubric once step 1's export is scored.",
  },
  // What the scorer says it detected, by survey type (peer-export-columns.mjs).
  surveyTypes: {
    catme:
      "CATME, the spring end-of-term survey: the CATME rubric's five dimensions, no split.",
    regular:
      "The regular survey (midterm, or fall and winter end-of-term): the peer evaluation rubric's criteria and the 100-point split.",
    slots:
      "The regular survey generated as one block per teammate slot. This page scores the Loop & Merge export only.",
    unknown: "Not a peer evaluation export this page recognizes.",
  },
  whatItIs: "What it is",
};

/** What a missing file is called in a step's summary. */
export const NO_FILE = "No file";

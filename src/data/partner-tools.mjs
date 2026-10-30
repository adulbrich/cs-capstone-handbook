// The wording of the partner evaluation tools pages
// (/tools/partner-evaluation/): every title, help line, summary, and
// instruction the Prepare and Score pages show. The click paths live in
// click-paths.mjs; the survey's own wording and the emails in
// partner-evaluation.mjs; the kit's shared labels in tools-text.mjs. A
// function here takes the numbers its sentence needs, so the pages hold no
// prose.

import { SHEET_EMAIL, SHEET_TEAM } from "../lib/partner-sheet.mjs";
import { clickPaths, pathSteps } from "./click-paths.mjs";
import { plural } from "./tools-text.mjs";

const list = (items) => items.join(", ");

/** The three Astro pages: chooser, Prepare, Score. */
export const pages = {
  chooser: {
    description:
      "Prepare the project partner survey, or score its export, step by step.",
    intro:
      "Two guided pages, for the Midterm Pulse and each term's End-of-Term Survey. Each reads the Canvas and Qualtrics files in your browser, shows every output before you download it, and says where it goes. Nothing is uploaded. Both pages share the roster you drop, saved in this browser.",
    prepare: {
      description:
        "From the Canvas roster and the partner sheet: the Qualtrics survey, the contact list, and the distribution email, then send.",
      title: "Prepare",
    },
    score: {
      description:
        "From the Qualtrics export and the Canvas rubric export: the report, the rubric assessment to import, and the concerns table.",
      title: "Score",
    },
    title: "Project Partner Evaluation",
  },
  prepare: {
    description:
      "Generate the project partner survey, its contact list, and its email from the Canvas roster and the partner sheet.",
    intro:
      "Six steps from the Canvas roster to a sent survey. Each step says where its file comes from, shows what it makes, and says where that goes. Check Done to move on; Edit reopens a finished step.",
    title: "Prepare the Project Partner Evaluation",
  },
  score: {
    description:
      "Score the project partner survey export and fill the Canvas rubric assessment.",
    intro:
      "Seven steps from the Qualtrics export to the grades. It scores the Midterm Pulse and each term's End-of-Term Survey; every student on a team gets the team's scores.",
    title: "Score the Project Partner Evaluation",
  },
};

/** What the saved-data box says on each page, and its confirm line. */
export const savedText = {
  confirm:
    "Remove every file, setting, and done box both project partner evaluation pages saved in this browser? The peer evaluation pages keep theirs.",
  prepare:
    "Saved in this browser only, never uploaded: the roster (shared with the Score page), the partner sheet, the survey settings, the checklist, and each step's done box.",
  score:
    "Saved in this browser only, never uploaded: the three files (the roster is shared with the Prepare page), the survey picked, the responses picked for a team, the team score edits and notes, and each step's done box.",
};

/** The roster step, on both pages. */
export const rosterText = {
  columns:
    ". The file has name, canvas_user_id, login_id, and group_name among its columns.",
  drop: "Canvas roster with groups (.csv)",
  empty: "Drop the roster to see its teams.",
  noGroup: (n) =>
    `${plural(n, "student")} in no group: no team, so no survey and no score.`,
  path: clickPaths.canvasRoster,
  replace: "Replace the roster",
  replaceNote:
    "The Prepare page uses the same saved roster: replacing it here replaces it there.",
  scoreIntro:
    "The roster saved on the Prepare page is used. Replace it only if the teams changed since the survey went out.",
  teams: "Teams",
  title: "Canvas roster",
  unreadable: "This roster cannot be read",
};

/** The Prepare page's steps. */
export const prepareText = {
  contacts: {
    close: {
      help: "When the survey closes. Every contact row carries it, as weekday, month, and day; the survey's first page and the email show it.",
      label: "Close date",
      missing:
        "Set the close date first: the contact list and the email carry it.",
    },
    columns: (field) =>
      `. Check that every column maps by its header: Email, Team, and ${field}. If a partner has two teams, check that the list kept both rows.`,
    download: (name) => `Download ${name}`,
    name: "Name the list",
    path: clickPaths.qualtricsList,
    summary: ({ file, rows }) => `${file}: ${plural(rows, "row")}.`,
    title: "Contact list",
    waiting: "Set the close date first.",
    what: (field) =>
      `One row per partner per team: the partner's email, the team as the roster spells it (the value the scorer joins on), and the close date as ${field}. Built from steps 1 and 2.`,
  },
  copyName: "Copy the name",
  email: {
    as: (row) => `As ${row.Email} receives it for ${row.Team}.`,
    copyBody: "Copy the body",
    copySubject: "Copy the subject",
    path: clickPaths.qualtricsEmail,
    pathAfter:
      ", to the list from step 4. Keep Individual links (the default): the survey is by invitation, so the anonymous link does not open it. Paste the subject and the body.",
    send: "Before sending, set the close date from step 4 under Advanced options › Link expiration. Then send it now or schedule it. Each partner and team pair gets its own message and link.",
    summary: "Sent or scheduled to the list from step 4.",
    title: "Distribution email",
    waiting: "Set the close date in step 4 first.",
    what: "The email Qualtrics sends each partner, with the team, the close date from step 4, and their own survey link piped in.",
  },
  label: "Prepare the project partner evaluation",
  roster: {
    summary: ({ file, students, teams }) =>
      `${file}: ${plural(students, "student")} on ${plural(teams, "team")}.`,
    usedIn:
      "Step 2 matches its teams to the partner sheet, and step 4 writes each team as the roster spells it. The Score page reads the same saved roster.",
    waiting: "Drop a roster with at least one team.",
  },
  send: {
    after: "Then export the responses and score them on the Score page.",
    // Each line a box to check before the step is done.
    checklist: {
      close: `At the deadline, close the responses still in progress, so a partner who stopped partway is recorded: in the survey, ${pathSteps(clickPaths.qualtricsCloseInProgress)}, select them, and close them.`,
      reminder:
        "Schedule a reminder halfway to the link expiration, to those who have not finished.",
    },
    // The checklist in the order it happens: the close comes last.
    order: ["reminder", "close"],
    sourceTitle: "Once it is sent",
    summary: "Reminder scheduled and responses closed.",
    title: "Remind and close",
    waiting: "Check every line first.",
  },
  sheet: {
    drop: "Partner sheet (.csv)",
    error: "No contact list",
    from: `The staff partner sheet the team-contact letters read, saved as CSV. It reads only ${SHEET_TEAM} and ${SHEET_EMAIL}; two addresses in a cell, or a second row for the same team, give each partner a row under that team. A mentor standing in for a partner gets the survey like a partner.`,
    noPartner: "Roster teams that get no survey",
    notOnRoster: {
      body: (teams) => `Left out: ${list(teams)}.`,
      title: "Teams in the sheet with no roster group",
    },
    partners: "Partners by team",
    repeated: {
      body: (teams) => `Every row's addresses get the survey: ${list(teams)}.`,
      title: "Teams on more than one row",
    },
    shared: {
      body: "One row per team. Qualtrics may merge contacts that share an email: after importing the list, check that it kept one contact per row, each with its own Team.",
      title: "Partners with more than one team",
    },
    summary: ({ file, partners, teams }) =>
      `${file}: ${plural(partners, "partner")} on ${plural(teams, "team")} get the survey.`,
    title: "Partner sheet",
    usedIn:
      "Step 4 turns it into the contact list, one row per partner per team.",
    waiting:
      "Drop a partner sheet that gives at least one roster team a partner.",
  },
  survey: {
    // Shown in the preview where the close date goes, until step 4 sets it.
    closePlaceholder: "[the close date, set in step 4]",
    download: (name) => `Download ${name}`,
    error: "No survey",
    kindLegend: "Which survey",
    kinds: {
      final: {
        label: "End-of-Term Survey",
        lines: [
          "At the end of each term.",
          "A page per facet of the term's rubric, each with its guidance and anchors.",
        ],
      },
      pulse: {
        label: "Midterm Pulse",
        lines: [
          "At midterm, every term.",
          "One page of statements on how the team works with the partner.",
        ],
      },
    },
    label: {
      help: "Appears in Qualtrics as the start of the project name, before the survey title. Picking a term resets it to that term's label.",
      label: "Label",
    },
    name: "Name the survey",
    path: clickPaths.qualtricsImport,
    pathAfter: ", and choose this file.",
    sample: {
      help: "Any row of the contact list; the survey shows that row's team.",
      label: "Show the survey as",
      option: ({ Email, Team }) => `${Team}: ${Email}`,
    },
    summary: ({ kind, name, term }) => `${kind}, ${term}: "${name}".`,
    termHelp:
      "Sets the label. For the End-of-Term Survey it also picks the term's rubric and the Term field its export carries.",
    termLegend: "Term",
    terms: {
      fall: "Fall",
      spring: "Spring",
      winter: "Winter",
    },
    title: "Survey",
    what: "The Qualtrics survey, built from the rubric CSVs under canvas/assignments/project-partner-evaluation/, the partner evaluation page's guidance, and the wording in src/data/partner-evaluation.mjs. Its choices are the labels the scorer maps, so the two cannot drift apart. Under every rating, the comment box its answer shows: optional at the top answer, required below it.",
  },
  whatItIs: "What it is",
};

/** Why a saved team score edit is not applied, by sortOverrides' reason. */
const UNAPPLIED = {
  criterion: "not a criterion of this rubric",
  points: "points outside the criterion's range",
  team: "not a team these files score",
};

/** The Score page's steps. */
export const scoreText = {
  concerns: {
    after:
      "Instructor only: it starts the corroboration review, and nothing in it goes to a student. Keep it with the course records.",
    download: (name) => `Download ${name}`,
    none: "No response raised a concern or wrote in a text question.",
    summary: (n) => `${plural(n, "response")}, instructor only.`,
    title: "Concerns table",
    what: "Every finished response that answered Yes to the concerns question or wrote anything in a text question, the responses not picked for a team included.",
  },
  export: {
    counts: ({ finished, preview, unfinished }) =>
      `${plural(finished, "finished response")}; left out: ${plural(preview, "survey preview")} and ${plural(unfinished, "unfinished response")}.`,
    detected: "Detected:",
    drop: "Qualtrics responses, labels export (.csv)",
    error: "This export cannot be scored",
    notPicked: "survey not picked",
    notRecognized: (reason) => `Not recognized (${reason}). Pick the survey.`,
    path: clickPaths.qualtricsLabelsExport,
    pathAfter:
      ". A values export (numeric codes) is refused. Export after the links expire, and do not re-save the file in a spreadsheet.",
    pick: "Pick the survey",
    pickHelp:
      "Only when it is not recognized. An End-of-Term Survey's Term field fixes its term: a response naming another term stops the scoring.",
    pickLabel: "Survey",
    summary: ({ file, finished, survey }) =>
      `${file}: ${survey}, ${plural(finished, "finished response")}.`,
    title: "Qualtrics export",
    usedIn:
      "Step 4 scores its finished responses, and step 7 lists its concerns.",
    waiting: "Drop a labels export of a partner survey, recognized or picked.",
  },
  grades: {
    download: (name) => `Download ${name}`,
    edited: "edited in step 5",
    path: clickPaths.canvasRubricImport,
    pathAfter:
      ", on the same assignment. Spot-check one student per team before posting.",
    preview: "Rubric assessment to import",
    review: (n) =>
      `${plural(n, "cell")} in step 5 still to review. The download carries ${n === 1 ? "it as it stands" : "them as they stand"}.`,
    summary: ({ file, review }) =>
      review > 0
        ? `${file}; ${plural(review, "cell")} in step 5 not reviewed.`
        : `${file}.`,
    title: "Grades",
    what: "The rubric export from step 3, filled in with step 5's scores: each criterion's rating, points, and comment, the same for every student on the team. The team reads the comment with the score. A criterion with no comment clears its cell, so nothing from an earlier import stays. Cells step 5 changed are marked.",
  },
  label: "Score the project partner evaluation",
  results: {
    duplicates: "Teams with two finished responses",
    duplicatesHow:
      "Pick the response that counts for each team. The other still goes to the concerns table.",
    error: "Nothing scored",
    field: "Question",
    lines: ({ aBound, report }) => [
      `${plural(report.scored, "student")} scored. Teams scored from a response: ${report.responded}; at the no-response score (${aBound} of 100): ${report.noResponse.length}.`,
      ...(report.noResponse.length > 0
        ? [
            `Teams with no finished response, at the no-response score: ${list(report.noResponse)}.`,
          ]
        : []),
      ...(report.unmatchedTeams.length > 0
        ? [
            `Responses whose Team is not a roster group, not scored: ${list(report.unmatchedTeams.map((r) => `${r.team || "(empty)"} (${r.responseId})`))}.`,
          ]
        : []),
      ...(report.blankTerm.length > 0
        ? [
            `Responses with a blank Term, not scored: ${list(report.blankTerm.map((r) => `${r.team || "(empty)"} (${r.responseId})`))}.`,
          ]
        : []),
      ...(report.noTeam.length > 0
        ? [
            `Students in the rubric export with no team, left as exported: ${report.noTeam.map((s) => `${s.name} (${s.id}), ${s.reason}`).join("; ")}.`,
          ]
        : []),
      ...(report.notInExport.length > 0
        ? [
            `Roster students on a team but not in the rubric export, so not in the download: ${report.notInExport.map((s) => `${s.name} (${s.team})`).join("; ")}.`,
          ]
        : []),
    ],
    pick: (team, responseId) => `Use response ${responseId} for ${team}`,
    pickShort: "Use this one",
    report: "Report",
    summary: ({ responded, students }) =>
      `${plural(students, "student")} scored, ${plural(responded, "team")} from a response.`,
    title: "Results",
    waiting: "Pick the response that counts for every team listed.",
    what: (aBound) =>
      `Each answer scores the points its rating carries; a between answer its share of the facet's points; a ladder's custom scale the percent entered. A roster team with no finished response scores the no-response score on every criterion, the lower bound of an A (${aBound} of 100).`,
  },
  roster: {
    summary: ({ file, students }) => `${file}: ${plural(students, "student")}.`,
    usedIn:
      "Step 4 joins each response's Team to the roster's group_name, and each canvas_user_id to the rubric export's Student Id.",
    waiting: "Drop a roster with at least one team.",
  },
  rubric: {
    count: (n) =>
      `${plural(n, "student")} in the export; each rubric criterion matched to its columns:`,
    drop: "Canvas rubric export (.csv)",
    error: "This rubric export does not fit",
    matched: "Rubric criteria and export columns",
    path: clickPaths.canvasRubricExport,
    pathAfter:
      ", on the assignment this survey grades (the pulse or the term's end-of-term entry). It needs Enhanced Rubrics.",
    summary: ({ criteria, file, students }) =>
      `${file}: ${plural(students, "student")}, ${plural(criteria, "criterion", "criteria")} matched.`,
    title: "Canvas rubric export",
    usedIn:
      "Step 6 fills it in, and you import it back on the same assignment.",
    waitingExport:
      "Read; it is matched to the rubric once step 1's survey is known.",
  },
  teams: {
    against: "Edited against",
    answer: "Answer",
    caption: "Each scored team by criterion: points and rating",
    changed:
      "The answer changed since this edit. The edit still applies: save it again to keep it, change it, or revert.",
    close: "Close",
    comment: {
      help: "Starts as the partner's words. Emptied, it clears the criterion's comment.",
      label: "Comment the team reads",
      reset: (responded) =>
        responded
          ? "Reset to the partner's words"
          : "Reset to the no-response note",
    },
    edited: "edited",
    editor: (team, criterion) => `${team}: ${criterion}`,
    hasComment: "the partner commented",
    // The two parts of a Comments cell when a team has a note.
    labels: {
      comment: "Comment on this criterion",
      note: "Note from the instruction team",
    },
    noComment: "No comment.",
    noResponse: "No response: the no-response score.",
    note: {
      help: "For the whole team, from the instruction team. It goes first, labeled, in every criterion's comment for every student on the team.",
      label: "Team note",
    },
    noteColumn: "Note",
    noted: "Has a team note",
    now: "now",
    open: (team, criterion) => `Edit ${criterion} for ${team}`,
    partnerComment: "Comment",
    revert: "Revert to the answer",
    review: "to review",
    reviewed: "reviewed",
    save: "Save",
    score: {
      custom: "Points",
      customError: (max) => `Enter points from 0 to ${max}.`,
      customHelp: (max) =>
        `From 0 to ${max}. The rating is the highest at or below them; below the lowest, the lowest.`,
      keep: ({ points, rating }) => `Keep the answer: ${rating}, ${points}`,
      legend: "Score",
      named: (rating) => `Rated ${rating}.`,
      rating: ({ points, rating }) => `${rating}, ${points}`,
    },
    scoreLine: ({ points, rating }) => `${rating}, ${points} points`,
    summary: ({ edited, notes, review }) =>
      `${plural(review, "cell")} to review, ${plural(edited, "cell")} edited, ${plural(notes, "team note")}.`,
    teamColumn: "Team",
    title: "Team scores",
    totalColumn: "Total",
    unapplied: {
      line: ({ criterion, reason, team }) =>
        `${criterion ? `${team}, ${criterion}` : team}: ${UNAPPLIED[reason]}.`,
      title: "Saved edits not applied",
    },
    // Read out beside an edited cell's struck-through points.
    was: "answered",
    what: "Every scored team by criterion, as the partner answered. Open a cell to keep its answer, pick another rating, or enter points; to edit the comment the team reads; or to write a team note. Neither agree nor disagree answers are marked to review until kept or changed. Edits stay for this survey when a new export is dropped, and are marked again when the answer under them changes. Nothing here blocks the download.",
  },
  whatItIs: "What it is",
};

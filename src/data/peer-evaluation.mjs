// The peer evaluation's survey wording that no rubric holds. The rated
// criteria and their anchors come from the rubric CSVs under
// canvas/assignments/peer-evaluation/ (read through src/lib/rubric-csv.mjs),
// so a survey's choices and the scorer's labels come from one file. This
// module holds the rest: each criterion's prompt, the comment and closing
// questions, and the text around them. Edit the wording here or in the CSV,
// never in a generated .qsf.

/**
 * The question asked for each rated criterion of the regular rubric, keyed by
 * its Criteria Name with the outcome tag stripped. A test checks every rated
 * criterion in the CSV has one.
 */
export const criterionPrompts = {
  "Attitude as a team player":
    "Rate the member's attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).",
  Quality: "How about the quality of the member's work?",
  Quantity: "Did the member do an appropriate quantity of work?",
  "Technical value":
    "Rate the overall value of the member's technical contribution.",
};

/**
 * Each CATME dimension's export tag, keyed by its Criteria Name in the CATME
 * rubric. The scorer (#6) tells a CATME export from a regular one by these.
 */
export const catmeTags = {
  "Contributing to the team's work": "Contributing",
  "Expecting quality": "Quality",
  "Having relevant knowledge, skills, and abilities": "Skills",
  "Interacting with teammates": "Interacting",
  "Keeping the team on track": "OnTrack",
};

/** The optional comment prompts, in survey order. */
export const commentPrompts = {
  allocations:
    "For particularly high or low allocations, provide concrete examples. Which behaviors were particularly valuable or detrimental?",
  overall: "Overall, how effectively is your team working? Explain.",
  perMember:
    "Optional: anything about this member's contribution the instruction team should know.",
};

/**
 * The two peer instruments, one home for what they differ in: the rubric
 * CSV under canvas/assignments/peer-evaluation/ each is rated and scored
 * against, and whether the survey carries the 100-point split. The
 * generator builds the split's questions only where `split` is true, and
 * the scorer expects the rubric's point distribution criterion only there.
 */
export const instruments = {
  catme: { rubric: "catme-rubric.csv", split: false },
  regular: { rubric: "peer-evaluation-rubric.csv", split: true },
};

/**
 * The survey variants. Midterm and end-of-term are the regular survey and
 * differ only in the title and the closing question; CATME rates the five
 * dimensions of its own rubric (catme-rubric.csv) and has no 100-point
 * split. `instrument` picks the rubric and the survey's shape, `label` the
 * variant's line in the generator's picker.
 */
export const variants = {
  catme: {
    instrument: "catme",
    label: "CATME (spring end-of-term)",
    question:
      "What did you learn about working in a team that you will carry into your next team?",
    title: "End-of-Term Peer Evaluation (CATME)",
  },
  final: {
    instrument: "regular",
    label:
      "End-of-term (fall, winter): closes with what you will carry into the next term",
    question:
      "What did you learn about working in a team that you will carry into the next term?",
    title: "End-of-Term Peer Evaluation",
  },
  midterm: {
    instrument: "regular",
    label: "Midterm (every term): closes with a team experiment to try",
    question:
      "Propose one concrete team experiment or activity to try in the next sprint.",
    title: "Midterm Peer Evaluation",
  },
};

/** The variants in the generator's picker order. */
export const variantOrder = ["midterm", "final", "catme"];

/**
 * Text that appears only in the generated survey. `${e://...}` is Qualtrics
 * piped text; `{ratee}` is replaced with the person being rated, and
 * `{dimension}` with a CATME dimension's name.
 */
export const surveyText = {
  // One CATME dimension, one question each, five to a page.
  catmeRating:
    "<b>{dimension}</b><br><br>Which description best fits <b>{ratee}</b>, for the whole term, not the last week?",
  guard:
    "This survey opens only from your personal link. Use the personal link from your email.",
  intro:
    "This evaluation is <b>confidential</b>: your answers go to the instruction team only and are never shown to your teammates.<br><br>You are on team: <b>${e://Field/Team}</b>",
  ratee: "Ratee (filled in automatically; leave as is)",
  rating:
    "You are rating: <b>{ratee}</b><br><br>Rate this member on each criterion, for the whole term, not the last week.",
  roster:
    "These are the members of your team. You will rate each of them, yourself first, on the pages that follow.<br><br>If this is not your team, stop here and email the instruction team. You do not need to select anything.",
  self: "Yourself",
  split:
    "Take 100 points and divide them among your team, yourself included, by the share of the credit you think each member deserves. You may consider the quality and quantity of contributions, attitude as a team player, and anything else you find relevant. The total must be 100.",
  // Shown above the split on teams of three or more.
  splitFloor:
    "Give yourself at least <b>${e://Field/SelfFloor}</b> points, whether or not you feel you deserve them.",
  // Shown above the split on teams of two instead.
  splitPair:
    "An even split is 50 points each. The instruction team reviews any split outside 45 to 55.",
  // Survey Options' meta description, per instrument.
  summary: {
    catme: "Rate yourself and each teammate on the five teamwork dimensions.",
    regular:
      "Rate yourself and each teammate, then divide 100 points among the team.",
  },
};

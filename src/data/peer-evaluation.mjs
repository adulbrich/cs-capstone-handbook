// The peer evaluation's wording, in one place. The survey generator
// (src/lib/tools/peer-survey-qsf.mjs) reads it, and the Peer Evaluations page
// renders its criteria table from it (#439), so the survey and the page say
// the same thing. Edit the wording here, never in a generated .qsf.

/** The four criteria, rated for every member of the team, self included. */
export const criteria = [
  "Did the member do an appropriate quantity of work?",
  "How about the quality of the member's work?",
  "Rate the member's attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).",
  "Rate the overall value of the member's technical contribution.",
];

/** The 1 to 5 scale, lowest first. The value of anchor i is i + 1. */
export const anchors = [
  "Better off without member, in this regard",
  "Some obvious shortcomings",
  "OK, but nothing special",
  "Good solid effort; took initiative",
  "Outstanding! Super asset to team",
];

/** The optional comment prompts, in survey order. */
export const commentPrompts = {
  allocations:
    "For particularly high or low allocations, provide concrete examples. Which behaviors were particularly valuable or detrimental?",
  overall: "Overall, how effectively is your team working? Explain.",
  perMember:
    "Optional: anything about this member's contribution the instruction team should know.",
};

/**
 * The two variants of the regular survey. They differ only in the title and
 * the closing question.
 */
export const variants = {
  final: {
    question:
      "What did you learn about working in a team that you will carry into the future?",
    title: "End-of-Term Peer Evaluation",
  },
  midterm: {
    question:
      "Propose one concrete team experiment or activity to try in the next sprint.",
    title: "Midterm Peer Evaluation",
  },
};

/**
 * CATME: the five teamwork dimensions, for the spring end-of-term variant.
 *
 * TO FILL (#438 follow-up): each dimension's behavioral anchors, in the
 * instruction team's own words, keeping the published dimension names. Until
 * the anchors are filled the generator offers no CATME variant.
 */
export const catmeDimensions = [
  { anchors: [], name: "Contributing to the team's work" },
  { anchors: [], name: "Interacting with teammates" },
  { anchors: [], name: "Keeping the team on track" },
  { anchors: [], name: "Expecting quality" },
  { anchors: [], name: "Having relevant knowledge, skills, and abilities" },
];

/**
 * Text that appears only in the generated survey. `${e://...}` is Qualtrics
 * piped text; `{ratee}` is replaced with the person being rated.
 */
export const surveyText = {
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
    "Take 100 points and divide them among your team, yourself included, by the share of the credit you think each member deserves. You may consider the quality and quantity of contributions, attitude as a team player, and anything else you find relevant. The total must be 100.<br><br>Give yourself at least <b>${e://Field/SelfFloor}</b> points, whether or not you feel you deserve them.",
};

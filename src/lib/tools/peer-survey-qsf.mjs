// The peer evaluation survey as a Qualtrics .qsf, the JSON file Qualtrics
// imports as a new survey. Pure: no DOM, no I/O. The rated criteria and their
// anchors come from the variant's rubric CSV, parsed by the caller with
// parseRubricCsv (src/lib/rubric-csv.mjs); the rest of the wording comes from
// src/data/peer-evaluation.mjs.
//
// Survey Flow, in order:
//   1. Embedded data: Team, TeamSize, SelfFloor, Team Member 1 to 9, declared
//      with no value so the contact list's values stand.
//   2. Guard: when Team is empty (not a personal link), one page telling the
//      respondent to use the personal link, then the end of the survey.
//   3. Intro and the roster question: choice 1 is "Yourself", choices 2 to 10
//      pipe Team Member 1 to 9, each shown only when its field is not empty.
//   4. Ratings, one page per displayed roster choice: the rated criteria as a
//      forced radio matrix (CATME: one forced single-choice question per
//      dimension), an optional comment, and a hidden text entry whose
//      default value names the ratee, so the export says whom each page rated.
//      Two modes: "loop" loops one block over the roster's displayed choices
//      (Loop & Merge); "slots" writes one block per slot, each behind a branch
//      on its Team Member field, for when the loop fails the staff test.
//   5. The 100-point split, carried forward from the roster's displayed
//      choices, forced and totalling 100; then the optional comments, the
//      variant question, and the Meta Info question on the same page. CATME
//      has no split: its last page is the overall comment, the variant
//      question, and Meta Info.
//
// The floor on the self share (SelfFloor) is stated directly above the split,
// on teams of three or more; teams of two see the review range instead. It is
// not validated: a question takes one validation type, and the split's is the
// total. The scorer raises a self share below the floor (#6).

import {
  catmeTags,
  commentPrompts,
  criterionPrompts,
  instruments,
  surveyText,
  variants,
} from "../../data/peer-evaluation.mjs";
import { SLOTS } from "./peer-contacts.mjs";
import {
  blockOptions,
  createSurvey,
  descriptive,
  embeddedFields,
  essay,
  field,
  fieldCompared,
  isEmpty,
  isNotEmpty,
  likertMatrix,
  metaQuestion,
  question,
  recodes,
  sharedScale,
  singleChoice,
  surveyName,
} from "./qsf.mjs";

export const MODES = ["loop", "slots"];

/** Roster choice IDs: 1 is the respondent, i + 1 is Team Member i. */
const ROSTER_CHOICES = Array.from({ length: SLOTS + 1 }, (_, i) => i + 1);

const memberField = (slot) => `Team Member ${slot}`;

/** Piped text for loop field `n` of the current Loop & Merge iteration. */
const loopField = (n) => `\${lm://Field/${n}}`;

/** Who roster choice `id` is, as piped text. */
const identityPipe = (id) =>
  id === 1 ? field("RecipientEmail") : field(memberField(id - 1));

/** Display logic: shown only when the embedded field is not empty. */
const shownWhenSet = (name) => ({ ...isNotEmpty(name), inPage: false });

/** Display logic on team size: teams of two, or teams of three or more. */
const shownForPairs = () => ({
  ...fieldCompared("TeamSize", "EqualTo", "Is Equal to", 2),
  inPage: false,
});
const shownForLargerTeams = () => ({
  ...fieldCompared("TeamSize", "GreaterThan", "Is Greater Than", 2),
  inPage: false,
});

/** The roster: who is on the team, and what the ratings and split cover. */
function rosterQuestion(qid) {
  const choices = Object.fromEntries(
    ROSTER_CHOICES.map((id) => [
      id,
      id === 1
        ? { Display: surveyText.self }
        : {
            Display: field(memberField(id - 1)),
            DisplayLogic: shownWhenSet(memberField(id - 1)),
          },
    ])
  );
  return question(qid, "Roster", "MC", "MAVR", surveyText.roster, {
    ChoiceOrder: ROSTER_CHOICES,
    Choices: choices,
    NextChoiceId: ROSTER_CHOICES.length + 1,
    RecodeValues: recodes(ROSTER_CHOICES),
    SubSelector: "TX",
  });
}

/** Hidden by JavaScript, not display logic: a hidden-by-logic question records no default value. */
const HIDE_JS = `Qualtrics.SurveyEngine.addOnload(function()
{
\tthis.getQuestionContainer().style.display = "none";
});`;

function rateeQuestion(qid, tag, pipe) {
  return question(qid, tag, "TE", "SL", surveyText.ratee, {
    DefaultChoices: { TEXT: { Text: pipe } },
    QuestionJS: HIDE_JS,
    SearchSource: { AllowFreeResponse: "false" },
  });
}

/** The rating band a survey answer maps to: "Average of 1" to "Average of 5". */
const BAND_RE = /^Average of ([1-5])$/;
const LEVELS = [1, 2, 3, 4, 5];

/**
 * The criteria a respondent rates, from a parsed rubric: those whose bands
 * are "Average of 1" to "Average of 5". Each comes with its five rating
 * descriptions, lowest first, as the anchors. A criterion with no such band
 * (the point distribution) is not rated; one with some but not all is an
 * error.
 */
export function ratedCriteria(rubric) {
  const rated = rubric.criteria.flatMap((criterion) => {
    const levels = criterion.ratings.map((r) => BAND_RE.exec(r.name)?.[1]);
    if (levels.every((level) => level === undefined)) {
      return [];
    }
    if (
      levels.length !== LEVELS.length ||
      LEVELS.some((n) => !levels.includes(String(n)))
    ) {
      throw new Error(
        `Rubric "${rubric.name}", criterion "${criterion.title}": a rated criterion needs exactly the bands "Average of 1" to "Average of 5".`
      );
    }
    return [
      {
        anchors: LEVELS.map(
          (n) =>
            criterion.ratings.find((r) => r.name === `Average of ${n}`)
              .description
        ),
        title: criterion.title,
      },
    ];
  });
  if (rated.length === 0) {
    throw new Error(`Rubric "${rubric.name}" has no rated criteria.`);
  }
  return rated;
}

/** `table[name]`, or an error naming the criterion that has no entry. */
function lookup(table, name, what) {
  if (!Object.hasOwn(table, name)) {
    throw new Error(
      `No ${what} for the rubric criterion "${name}" in src/data/peer-evaluation.mjs.`
    );
  }
  return table[name];
}

/** Anchors as answer text: "1: ..." to "5: ...". */
const numbered = (anchors) => anchors.map((text, i) => `${i + 1}: ${text}`);

/**
 * The regular survey's rating matrix: a row per rated criterion (its title
 * and the prompt the survey shows) and a column per anchor of their shared
 * scale, numbered as the survey shows it. The survey and the Peer
 * Evaluations page (src/components/PeerCriteria.astro) both render this, so
 * the page shows the survey's wording.
 *
 * @returns {{columns: string[], rows: {prompt: string, title: string}[]}}
 */
export function ratingMatrix(rubric, rated = ratedCriteria(rubric)) {
  return {
    columns: numbered(sharedScale(rubric.name, rated, (c) => c.anchors)),
    rows: rated.map((c) => ({
      prompt: lookup(criterionPrompts, c.title, "prompt"),
      title: c.title,
    })),
  };
}

/** The rated criteria as one forced radio matrix on their shared scale. */
function ratingQuestion(qid, tag, ratee, { rated, rubric }) {
  const { columns, rows } = ratingMatrix(rubric, rated);
  return likertMatrix(
    qid,
    tag,
    surveyText.rating.replace("{ratee}", ratee),
    rows.map((row) => row.prompt),
    columns
  );
}

/**
 * One CATME dimension, a rated criterion of the CATME rubric: its five
 * anchors as forced single choices, best first.
 */
function dimensionQuestion(qid, tag, dimension, ratee) {
  return singleChoice(
    qid,
    tag,
    surveyText.catmeRating
      .replace("{dimension}", dimension.title)
      .replace("{ratee}", ratee),
    numbered(dimension.anchors),
    { forced: true, reversed: true }
  );
}

/**
 * A CATME dimension's export tag, by its rubric title (catmeTags): the
 * generator writes it and the scorer reads it, behind the loop prefix.
 */
export const catmeTagOf = (title) => lookup(catmeTags, title, "export tag");

/**
 * What each instrument puts on the survey. `ratings` adds one ratee's
 * rating questions, their export tags behind `prefix`, and returns their
 * IDs; `splitQuestions` adds the split's questions, between the ratings and
 * the closing comments, on an instrument with a split (`instruments` in the
 * data module); `closingBlock` names the last block; `summary` is the survey's
 * one-line description.
 */
const INSTRUMENTS = {
  catme: {
    closingBlock: "Comments",
    ratings: (add, { prefix, ratee, rated }) =>
      rated.map((dimension) => {
        const tag = prefix + catmeTagOf(dimension.title);
        return add((qid) => dimensionQuestion(qid, tag, dimension, ratee));
      }),
    summary: surveyText.summary.catme,
  },
  regular: {
    closingBlock: "Split and comments",
    ratings: (add, { prefix, ratee, ...scale }) => [
      add((qid) => ratingQuestion(qid, `${prefix}Rating`, ratee, scale)),
    ],
    splitQuestions: (add, roster) => [
      add((qid) => ({
        ...descriptive(qid, "SplitFloor", surveyText.splitFloor),
        DisplayLogic: shownForLargerTeams(),
      })),
      add((qid) => ({
        ...descriptive(qid, "SplitPair", surveyText.splitPair),
        DisplayLogic: shownForPairs(),
      })),
      add((qid) => splitQuestion(qid, roster)),
      add((qid) => essay(qid, "Allocations", commentPrompts.allocations)),
    ],
    summary: surveyText.summary.regular,
  },
};

function splitQuestion(qid, rosterQid) {
  return question(qid, "Split", "CS", "VRTL", surveyText.split, {
    ChoiceOrder: [],
    Choices: {},
    ClarifyingSymbolType: "None",
    DynamicChoices: {
      DynamicType: "ChoiceGroup",
      Locator: `q://${rosterQid}/ChoiceGroup/DisplayedChoices`,
      Type: "Dynamic",
    },
    Labels: [],
    SubSelector: "TX",
    Validation: {
      Settings: {
        ChoiceTotal: "100",
        EnforceRange: "ON",
        ForceResponse: "ON",
        ForceResponseType: "ON",
        Type: "ChoicesTotal",
      },
    },
  });
}

/**
 * Builds the survey as a .qsf object.
 *
 * Options: `rubric` (the variant's rubric CSV, parsed with parseRubricCsv;
 * required), `variant` ("midterm", "final", or "catme"), `label` (course and
 * term, put in front of the survey name), `mode` ("loop" or "slots"), `now`
 * (a Date, for the file's timestamps), `seed` (a number, for the generated
 * IDs).
 *
 * @param {{ label?: string, mode?: string, now?: Date,
 *   rubric?: { name: string, criteria: object[] }, seed?: number,
 *   variant?: string }} [options]
 */
export function buildPeerSurvey({
  label = "",
  mode = "loop",
  now = new Date(),
  rubric,
  seed = now.getTime(),
  variant = "midterm",
} = {}) {
  const wording = Object.hasOwn(variants, variant) ? variants[variant] : null;
  if (!wording) {
    throw new Error(`Unknown variant "${variant}".`);
  }
  if (!MODES.includes(mode)) {
    throw new Error(`Unknown mode "${mode}".`);
  }
  if (!rubric) {
    throw new Error(`No rubric for the ${variant} survey.`);
  }
  const instrument = INSTRUMENTS[wording.instrument];
  const rated = ratedCriteria(rubric);
  const { add, block, defaultBlock, finish, flowId, standard, trash } =
    createSurvey(seed);

  const intro = add((qid) => descriptive(qid, "Intro", surveyText.intro));
  const roster = add((qid) => rosterQuestion(qid));
  const guard = add((qid) => descriptive(qid, "Guard", surveyText.guard));

  const introBlock = block("Intro", [intro, roster], { type: "Default" });
  trash();
  const guardBlock = block("Guard", [guard]);

  // The rating questions of one page, their tags behind `prefix`.
  const ratingQids = (prefix, ratee) =>
    instrument.ratings(add, { prefix, rated, ratee, rubric });

  const ratingFlow = [];
  if (mode === "loop") {
    const qids = [
      add((qid) => rateeQuestion(qid, "Ratee", loopField(2))),
      ...ratingQids("", loopField(1)),
      add((qid) => essay(qid, "Comment", commentPrompts.perMember)),
    ];
    const locator = `q://${roster}/ChoiceGroup/DisplayedChoices`;
    const ratingBlock = block("Ratings", qids, {
      options: {
        ...blockOptions,
        Looping: "Question",
        LoopingOptions: {
          ChoiceGroupLocator: locator,
          Locator: locator,
          QID: roster,
          Randomization: "None",
          Static: Object.fromEntries(
            ROSTER_CHOICES.map((id) => [id, { 2: identityPipe(id) }])
          ),
        },
      },
    });
    ratingFlow.push(() => [standard(ratingBlock)]);
  } else {
    for (const id of ROSTER_CHOICES) {
      const ratee = id === 1 ? surveyText.self : field(memberField(id - 1));
      const qids = [
        add((qid) => rateeQuestion(qid, `S${id}_Ratee`, identityPipe(id))),
        ...ratingQids(`S${id}_`, ratee),
        add((qid) => essay(qid, `S${id}_Comment`, commentPrompts.perMember)),
      ];
      const slotBlock = block(
        id === 1 ? "Rate yourself" : `Rate ${memberField(id - 1)}`,
        qids
      );
      ratingFlow.push(() => {
        if (id === 1) {
          return [standard(slotBlock)];
        }
        const branchId = flowId();
        return [
          {
            BranchLogic: isNotEmpty(memberField(id - 1)),
            Description: "New Branch",
            Flow: [standard(slotBlock)],
            FlowID: branchId,
            Type: "Branch",
          },
        ];
      });
    }
  }

  const closing = [
    ...(instruments[wording.instrument].split
      ? instrument.splitQuestions(add, roster)
      : []),
    add((qid) => essay(qid, "Overall", commentPrompts.overall)),
    add((qid) => essay(qid, "Closing", wording.question)),
    add((qid) => metaQuestion(qid)),
  ];
  const closingBlock = block(instrument.closingBlock, closing);

  // Flow IDs are numbered in flow order, so the elements are built in order.
  const embedded = {
    EmbeddedData: embeddedFields([
      "Team",
      "TeamSize",
      "SelfFloor",
      ...Array.from({ length: SLOTS }, (_, i) => memberField(i + 1)),
    ]),
    FlowID: flowId(),
    Type: "EmbeddedData",
  };
  const guardId = flowId();
  const guardFlow = {
    BranchLogic: isEmpty("Team"),
    Description: "New Branch",
    Flow: [standard(guardBlock), { FlowID: flowId(), Type: "EndSurvey" }],
    FlowID: guardId,
    Type: "Branch",
  };
  const introFlow = defaultBlock(introBlock);
  const ratings = ratingFlow.flatMap((make) => make());
  const closingFlow = standard(closingBlock);

  const { title } = wording;
  return finish({
    flow: [embedded, guardFlow, introFlow, ...ratings, closingFlow],
    metaDescription: instrument.summary,
    name: surveyName(label, title),
    now,
    title,
  });
}

/** The survey as .qsf file text. */
export function peerSurveyQsf(options) {
  return JSON.stringify(buildPeerSurvey(options));
}

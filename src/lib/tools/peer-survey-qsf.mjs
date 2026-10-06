// The peer evaluation survey as a Qualtrics .qsf, the JSON file Qualtrics
// imports as a new survey. Pure: no DOM, no I/O.
//
// Survey Flow, in order:
//   1. Embedded data: Team, TeamSize, SelfFloor, Team Member 1 to 9, declared
//      with no value so the contact list's values stand.
//   2. Guard: when Team is empty (not a personal link), one page telling the
//      respondent to use the personal link, then the end of the survey.
//   3. Intro and the roster question: choice 1 is "Yourself", choices 2 to 10
//      pipe Team Member 1 to 9, each shown only when its field is not empty.
//   4. Ratings, one page per displayed roster choice: the four criteria as a
//      forced radio matrix, an optional comment, and a hidden text entry whose
//      default value names the ratee, so the export says whom each page rated.
//      Two modes: "loop" loops one block over the roster's displayed choices
//      (Loop & Merge); "slots" writes one block per slot, each behind a branch
//      on its Team Member field, for when the loop fails the staff test.
//   5. The 100-point split, carried forward from the roster's displayed
//      choices, forced and totalling 100; then the optional comments, the
//      variant question, and the Meta Info question on the same page.
//
// The floor on the self share (SelfFloor) is stated directly above the split,
// on teams of three or more; teams of two see the review range instead. It is
// not validated: a question takes one validation type, and the split's is the
// total. The scorer raises a self share below the floor (#6).

import {
  anchors,
  commentPrompts,
  criteria,
  surveyText,
  variants,
} from "../../data/peer-evaluation.mjs";
import { SLOTS } from "./peer-contacts.mjs";

export const MODES = ["loop", "slots"];

/** Roster choice IDs: 1 is the respondent, i + 1 is Team Member i. */
const ROSTER_CHOICES = Array.from({ length: SLOTS + 1 }, (_, i) => i + 1);

/** Piped text for an embedded data field. */
const field = (name) => `\${e://Field/${encodeURIComponent(name)}}`;
const memberField = (slot) => `Team Member ${slot}`;

/** Piped text for loop field `n` of the current Loop & Merge iteration. */
const loopField = (n) => `\${lm://Field/${n}}`;

/** Who roster choice `id` is, as piped text. */
const identityPipe = (id) =>
  id === 1 ? field("RecipientEmail") : field(memberField(id - 1));

/**
 * A small seeded generator (Park and Miller's minimal standard), so a seed
 * gives the same IDs every time. The IDs only need to be unique in the file.
 */
function randomSource(seed) {
  const modulus = 2_147_483_647;
  let state = (Math.abs(Math.trunc(seed)) % (modulus - 1)) + 1;
  return () => {
    state = (state * 48_271) % modulus;
    return (state - 1) / (modulus - 1);
  };
}

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function idMaker(seed) {
  const random = randomSource(seed);
  const chars = (n, alphabet = ALPHABET) =>
    Array.from(
      { length: n },
      () => alphabet[Math.floor(random() * alphabet.length)]
    ).join("");
  return {
    id: (prefix) => `${prefix}_${chars(15)}`,
    uuid: () =>
      [8, 4, 4, 4, 12].map((n) => chars(n, "0123456789abcdef")).join("-"),
  };
}

/** How an export writes an unset timestamp. */
const UNSET = "0000-00-00 00:00:00";

const pad = (n) => String(n).padStart(2, "0");

/** Qualtrics's timestamp format, "YYYY-MM-DD HH:MM:SS". */
function timestamp(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Question text without markup, for the descriptions Qualtrics lists. */
function plain(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function description(html) {
  const text = plain(html);
  return text.length > 100 ? `${text.slice(0, 97)}...` : text;
}

const recodes = (ids) => Object.fromEntries(ids.map((id) => [id, String(id)]));

/** Logic on one embedded field: a branch condition, or display logic. */
function onField(name, operator, words) {
  return {
    0: {
      0: {
        _HiddenExpression: false,
        Description: `<span class="ConjDesc">If</span> <span class="LeftOpDesc">${name}</span> <span class="OpDesc">${words}</span> `,
        LeftOperand: name,
        LogicType: "EmbeddedField",
        Operator: operator,
        Type: "Expression",
      },
      Type: "If",
    },
    Type: "BooleanExpression",
  };
}

/** A comparison of an embedded field with a value. */
function fieldCompared(name, operator, words, value) {
  const logic = onField(name, operator, `${words} ${value}`);
  logic[0][0].RightOperand = String(value);
  return logic;
}

const isEmpty = (name) => onField(name, "Empty", "Is Empty");
const isNotEmpty = (name) => onField(name, "NotEmpty", "Is Not Empty");

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

const NO_VALIDATION = { Settings: { ForceResponse: "OFF", Type: "None" } };
const FORCED = {
  Settings: { ForceResponse: "ON", ForceResponseType: "ON", Type: "None" },
};

/** The fields every question payload carries. */
function question(qid, tag, type, selector, text, extra = {}) {
  return {
    Configuration: { QuestionDescriptionOption: "UseText" },
    DataExportTag: tag,
    DataVisibility: { Hidden: false, Private: false },
    DefaultChoices: false,
    GradingData: [],
    Language: [],
    NextAnswerId: 1,
    NextChoiceId: 1,
    QuestionDescription: description(text),
    QuestionID: qid,
    QuestionText: text,
    QuestionType: type,
    Selector: selector,
    Validation: NO_VALIDATION,
    ...extra,
  };
}

const descriptive = (qid, tag, text) =>
  question(qid, tag, "DB", "TB", text, {
    ChoiceOrder: [],
    Validation: { Settings: { Type: "None" } },
  });

const essay = (qid, tag, text) =>
  question(qid, tag, "TE", "ESTB", text, {
    Configuration: {
      InputHeight: 65,
      InputWidth: 600,
      QuestionDescriptionOption: "UseText",
    },
    SearchSource: { AllowFreeResponse: "false" },
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

function ratingQuestion(qid, tag, ratee) {
  const rows = criteria.map((_, i) => i + 1);
  const columns = anchors.map((_, i) => i + 1);
  return question(
    qid,
    tag,
    "Matrix",
    "Likert",
    surveyText.rating.replace("{ratee}", ratee),
    {
      AnswerOrder: columns,
      Answers: Object.fromEntries(
        anchors.map((text, i) => [i + 1, { Display: `${i + 1}: ${text}` }])
      ),
      ChoiceDataExportTags: false,
      ChoiceOrder: rows,
      Choices: Object.fromEntries(
        criteria.map((text, i) => [i + 1, { Display: text }])
      ),
      Configuration: {
        ChoiceColumnWidth: 25,
        MobileFirst: true,
        QuestionDescriptionOption: "UseText",
        RepeatHeaders: "none",
        TextPosition: "inline",
        WhiteSpace: "OFF",
      },
      NextAnswerId: columns.length + 1,
      NextChoiceId: rows.length + 1,
      RecodeValues: recodes(columns),
      SubSelector: "SingleAnswer",
      Validation: FORCED,
    }
  );
}

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

const META_CHOICES = [
  "Browser",
  "Version",
  "Operating System",
  "Screen Resolution",
  "Flash Version",
  "Java Support",
  "User Agent",
];

function metaQuestion(qid) {
  const ids = META_CHOICES.map((_, i) => i + 1);
  return question(qid, "Meta", "Meta", "Browser", "Browser Meta Info", {
    ChoiceOrder: ids,
    Choices: Object.fromEntries(
      META_CHOICES.map((text, i) => [i + 1, { Display: text, TextEntry: 1 }])
    ),
    NextChoiceId: ids.length + 1,
    Validation: { Settings: { Type: "None" } },
  });
}

/** The Survey Options payload, mirrored from a working survey. */
function surveyOptions(title) {
  return {
    AnonymizeResponse: "No",
    AutoConfirmStart: true,
    AvailableLanguages: { EN: [] },
    BackButton: "true",
    BallotBoxStuffingPrevention: "false",
    BallotBoxStuffingPreventionBehavior: null,
    BallotBoxStuffingPreventionMessage: null,
    BallotBoxStuffingPreventionMessageLibrary: null,
    BallotBoxStuffingPreventionURL: null,
    CollectGeoLocation: "false",
    ConfirmStart: true,
    EmailThankYou: "false",
    EOSMessage: null,
    EOSMessageLibrary: null,
    EOSRedirectURL: null,
    Footer: "",
    Header: "",
    InactiveMessage: null,
    InactiveMessageLibrary: null,
    InactiveSurvey: "DefaultMessage",
    IncludeSecurityFields: true,
    NewScoring: 1,
    NextButton: "",
    NoIndex: "Yes",
    PartialData: "+1 month",
    PartialDataCloseAfter: "LastActivity",
    PartialDeletion: null,
    PasswordProtection: "No",
    PreviousButton: "",
    ProgressBarDisplay: "None",
    RecaptchaV3: "true",
    RefererCheck: "No",
    RelevantID: "false",
    RelevantIDLockoutPeriod: "+30 days",
    ResponseSummary: "No",
    SaveAndContinue: "true",
    SecureResponseFiles: "true",
    ShowExportTags: "false",
    Skin: { brandingId: "6337647077", overrides: null, templateId: "*simple" },
    SkinLibrary: "oregonstate",
    SkinType: "component",
    // Qualtrics accepts "on", "DateRange", "None", or "". The dates are set
    // on the distribution, so the survey itself never expires.
    SurveyExpiration: "None",
    SurveyLinkCompletedMessage: null,
    SurveyLinkCompletedMessageLibrary: null,
    SurveyLinkExpirationMessage: null,
    SurveyLinkExpirationMessageLibrary: null,
    SurveyLinkExpirationMessageType: "DefaultMessage",
    SurveyMetaDescription:
      "Rate yourself and each teammate, then divide 100 points among the team.",
    // By invitation, as the real exports are: only a personal link opens it.
    // The empty-Team guard still catches a contact with no team.
    SurveyProtection: "ByInvitation",
    SurveyTermination: "DefaultMessage",
    SurveyTitle: title,
    ThankYouEmailMessage: null,
    ThankYouEmailMessageLibrary: null,
    UseCustomSurveyLinkCompletedMessage: null,
    ValidateMessage: "false",
    ValidationMessage: null,
    ValidationMessageLibrary: null,
  };
}

const blockOptions = {
  BlockLocking: "false",
  BlockVisibility: "Expanded",
  RandomizeQuestions: "false",
};

const questionsOf = (qids) =>
  qids.map((qid) => ({ QuestionID: qid, Type: "Question" }));

/**
 * Builds the survey as a .qsf object.
 *
 * Options: `variant` ("midterm" or "final"), `label` (course and term, put in
 * front of the survey name), `mode` ("loop" or "slots"), `now` (a Date, for
 * the file's timestamps), `seed` (a number, for the generated IDs).
 */
export function buildPeerSurvey({
  label = "",
  mode = "loop",
  now = new Date(),
  seed = now.getTime(),
  variant = "midterm",
} = {}) {
  const wording = variants[variant];
  if (!wording) {
    throw new Error(`Unknown variant "${variant}".`);
  }
  if (!MODES.includes(mode)) {
    throw new Error(`Unknown mode "${mode}".`);
  }
  const ids = idMaker(seed);
  const surveyId = ids.id("SV");
  const responseSet = ids.id("RS");

  const questions = [];
  let nextQid = 1;
  const add = (make) => {
    const qid = `QID${nextQid}`;
    nextQid += 1;
    questions.push(make(qid));
    return qid;
  };

  const intro = add((qid) => descriptive(qid, "Intro", surveyText.intro));
  const roster = add((qid) => rosterQuestion(qid));
  const guard = add((qid) => descriptive(qid, "Guard", surveyText.guard));

  const blocks = [];
  const block = (
    descriptionText,
    qids,
    { options = blockOptions, type = "Standard" } = {}
  ) => {
    const entry = {
      BlockElements: questionsOf(qids),
      Description: descriptionText,
      ID: ids.id("BL"),
      Options: options,
      Type: type,
    };
    if (entry.Type === "Standard") {
      entry.SubType = "";
    }
    blocks.push(entry);
    return entry.ID;
  };

  const introBlock = block("Intro", [intro, roster], { type: "Default" });
  blocks.push({
    BlockElements: [],
    Description: "Trash / Unused Questions",
    ID: ids.id("BL"),
    Type: "Trash",
  });
  const guardBlock = block("Guard", [guard]);

  let flowCount = 1;
  const flowId = () => {
    flowCount += 1;
    return `FL_${flowCount}`;
  };
  const standard = (id) => ({
    Autofill: [],
    FlowID: flowId(),
    ID: id,
    Type: "Standard",
  });

  const ratingFlow = [];
  if (mode === "loop") {
    const qids = [
      add((qid) => rateeQuestion(qid, "Ratee", loopField(2))),
      add((qid) => ratingQuestion(qid, "Rating", loopField(1))),
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
        add((qid) => ratingQuestion(qid, `S${id}_Rating`, ratee)),
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
    add((qid) => essay(qid, "Overall", commentPrompts.overall)),
    add((qid) => essay(qid, "Closing", wording.question)),
    add((qid) => metaQuestion(qid)),
  ];
  const closingBlock = block("Split and comments", closing);

  // Flow IDs are numbered in flow order, so the elements are built in order.
  const embedded = {
    EmbeddedData: [
      "Team",
      "TeamSize",
      "SelfFloor",
      ...Array.from({ length: SLOTS }, (_, i) => memberField(i + 1)),
    ].map((name) => ({
      AnalyzeText: false,
      DataVisibility: [],
      Description: name,
      Field: name,
      Type: "Recipient",
      VariableType: "String",
    })),
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
  const introFlow = {
    Autofill: [],
    FlowID: flowId(),
    ID: introBlock,
    Type: "Block",
  };
  const ratings = ratingFlow.flatMap((make) => make());
  const closingFlow = standard(closingBlock);

  const flow = {
    Flow: [embedded, guardFlow, introFlow, ...ratings, closingFlow],
    FlowID: "FL_1",
    Properties: { Count: flowCount },
    Type: "Root",
  };

  const { title } = wording;
  const element = (name, primary, secondary, tertiary, payload) => ({
    Element: name,
    Payload: payload,
    PrimaryAttribute: primary,
    SecondaryAttribute: secondary,
    SurveyID: surveyId,
    TertiaryAttribute: tertiary,
  });
  const stamp = timestamp(now);

  return {
    SurveyElements: [
      element("BL", "Survey Blocks", null, null, blocks),
      element("FL", "Survey Flow", null, null, flow),
      element("PL", "Preview Link", null, null, {
        PreviewID: ids.uuid(),
        PreviewType: "Brand",
      }),
      element("PROJ", "CORE", null, "1.1.0", {
        ProjectCategory: "CORE",
        SchemaVersion: "1.1.0",
      }),
      element(
        "QC",
        "Survey Question Count",
        String(questions.length),
        null,
        null
      ),
      element("RS", responseSet, null, null, null),
      element("SCO", "Scoring", null, null, {
        AutoScoringCategory: null,
        DefaultScoringCategory: null,
        ScoringCategories: [],
        ScoringCategoryGroups: [],
        ScoringSummaryAfterQuestions: 0,
        ScoringSummaryAfterSurvey: 0,
        ScoringSummaryCategory: null,
      }),
      element("SO", "Survey Options", null, null, surveyOptions(title)),
      ...questions.map((payload) =>
        element(
          "SQ",
          payload.QuestionID,
          payload.QuestionDescription,
          null,
          payload
        )
      ),
      element("STAT", "Survey Statistics", null, null, {
        ID: "Survey Statistics",
        MobileCompatible: true,
      }),
    ],
    SurveyEntry: {
      CreatorID: ids.id("UR"),
      Deleted: null,
      DivisionID: null,
      LastAccessed: UNSET,
      LastActivated: UNSET,
      LastModified: stamp,
      SurveyActiveResponseSet: responseSet,
      SurveyBrandID: "oregonstate",
      SurveyCreationDate: stamp,
      SurveyDescription: null,
      SurveyExpirationDate: UNSET,
      SurveyID: surveyId,
      SurveyLanguage: "EN",
      SurveyName: [label.trim(), title].filter(Boolean).join(" "),
      SurveyOwnerID: ids.id("UR"),
      SurveyStartDate: UNSET,
      SurveyStatus: "Inactive",
    },
  };
}

/** The survey as .qsf file text. */
export function peerSurveyQsf(options) {
  return JSON.stringify(buildPeerSurvey(options));
}

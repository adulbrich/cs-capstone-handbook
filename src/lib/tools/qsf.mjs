// The pieces every generated Qualtrics .qsf shares: seeded IDs, the question
// payloads, display and branch logic, the Survey Options, and the file
// around them. The peer survey (peer-survey-qsf.mjs) and the partner surveys
// (partner-survey-qsf.mjs) build on it. Pure: no DOM, no I/O.
//
// What made the first generated file import, kept for every survey:
// SecondaryAttribute equals QuestionDescription at most 100 characters, the
// SurveyEntry dates unset as "0000-00-00 00:00:00", SurveyExpiration "None",
// SurveyProtection "ByInvitation", and PartialData "+1 month".

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
export function plain(html) {
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

export const recodes = (ids) =>
  Object.fromEntries(ids.map((id) => [id, String(id)]));

/** Piped text for an embedded data field. */
export const field = (name) => `\${e://Field/${encodeURIComponent(name)}}`;

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
export function fieldCompared(name, operator, words, value) {
  const logic = onField(name, operator, `${words} ${value}`);
  logic[0][0].RightOperand = String(value);
  return logic;
}

export const isEmpty = (name) => onField(name, "Empty", "Is Empty");
export const isNotEmpty = (name) => onField(name, "NotEmpty", "Is Not Empty");

/**
 * Display logic: shown only when choice `choiceId` of multiple-choice
 * question `source` (a payload) is selected.
 */
export function shownWhenSelected(source, choiceId) {
  const locator = `q://${source.QuestionID}/SelectableChoice/${choiceId}`;
  return {
    0: {
      0: {
        ChoiceLocator: locator,
        Description: `<span class="ConjDesc">If</span> <span class="QuestionDesc">${source.QuestionDescription}</span> <span class="LeftOpDesc">${source.Choices[choiceId].Display}</span> <span class="OpDesc">Is Selected</span> `,
        LeftOperand: locator,
        LogicType: "Question",
        Operator: "Selected",
        QuestionID: source.QuestionID,
        QuestionIDFromLocator: source.QuestionID,
        QuestionIsInLoop: "no",
        Type: "Expression",
      },
      Type: "If",
    },
    inPage: false,
    Type: "BooleanExpression",
  };
}

const NO_VALIDATION = { Settings: { ForceResponse: "OFF", Type: "None" } };
export const FORCED = {
  Settings: { ForceResponse: "ON", ForceResponseType: "ON", Type: "None" },
};

/** The fields every question payload carries. */
export function question(qid, tag, type, selector, text, extra = {}) {
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

/** A text block: no answer, no export column. */
export const descriptive = (qid, tag, text) =>
  question(qid, tag, "DB", "TB", text, {
    ChoiceOrder: [],
    Validation: { Settings: { Type: "None" } },
  });

/** A multi-line text answer. */
export const essay = (qid, tag, text) =>
  question(qid, tag, "TE", "ESTB", text, {
    Configuration: {
      InputHeight: 65,
      InputWidth: 600,
      QuestionDescriptionOption: "UseText",
    },
    SearchSource: { AllowFreeResponse: "false" },
  });

/** A one-line text answer. */
export const singleLine = (qid, tag, text) =>
  question(qid, tag, "TE", "SL", text, {
    SearchSource: { AllowFreeResponse: "false" },
  });

/** One answer from a vertical list; choice i + 1 is `options[i]`. */
export function singleChoice(qid, tag, text, options) {
  const ids = options.map((_, i) => i + 1);
  return question(qid, tag, "MC", "SAVR", text, {
    ChoiceOrder: ids,
    Choices: Object.fromEntries(
      options.map((option, i) => [i + 1, { Display: option }])
    ),
    NextChoiceId: ids.length + 1,
    RecodeValues: recodes(ids),
    SubSelector: "TX",
  });
}

/**
 * A forced radio grid: one row per `rows` entry, one column per `columns`
 * entry, each given as display text. Row i + 1 exports as `<tag>_<i + 1>`.
 */
export function likertMatrix(qid, tag, text, rows, columns) {
  const rowIds = rows.map((_, i) => i + 1);
  const columnIds = columns.map((_, i) => i + 1);
  return question(qid, tag, "Matrix", "Likert", text, {
    AnswerOrder: columnIds,
    Answers: Object.fromEntries(
      columns.map((display, i) => [i + 1, { Display: display }])
    ),
    ChoiceDataExportTags: false,
    ChoiceOrder: rowIds,
    Choices: Object.fromEntries(
      rows.map((display, i) => [i + 1, { Display: display }])
    ),
    Configuration: {
      ChoiceColumnWidth: 25,
      MobileFirst: true,
      QuestionDescriptionOption: "UseText",
      RepeatHeaders: "none",
      TextPosition: "inline",
      WhiteSpace: "OFF",
    },
    NextAnswerId: columnIds.length + 1,
    NextChoiceId: rowIds.length + 1,
    RecodeValues: recodes(columnIds),
    SubSelector: "SingleAnswer",
    Validation: FORCED,
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

/** The hidden Meta Info question: browser and device, recorded silently. */
export function metaQuestion(qid) {
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
function surveyOptions(title, metaDescription) {
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
    SurveyMetaDescription: metaDescription,
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

export const blockOptions = {
  BlockLocking: "false",
  BlockVisibility: "Expanded",
  RandomizeQuestions: "false",
};

const questionsOf = (qids) =>
  qids.map((qid) => ({ QuestionID: qid, Type: "Question" }));

/** Embedded data declared with no value, so the contact list's values stand. */
export const embeddedFields = (names) =>
  names.map((name) => ({
    AnalyzeText: false,
    DataVisibility: [],
    Description: name,
    Field: name,
    Type: "Recipient",
    VariableType: "String",
  }));

/**
 * A survey under construction. `seed` fixes the generated IDs. Questions get
 * QID1, QID2, ... in the order `add` is called; flow IDs FL_2, FL_3, ... in
 * the order `flowId` is called, so build the flow in flow order. `finish`
 * wraps the questions, blocks, and flow into the .qsf object.
 */
export function createSurvey(seed) {
  const ids = idMaker(seed);
  const surveyId = ids.id("SV");
  const responseSet = ids.id("RS");

  const questions = [];
  const add = (make) => {
    const qid = `QID${questions.length + 1}`;
    questions.push(make(qid));
    return qid;
  };
  /** The payload of an added question, for logic that names it. */
  const payload = (qid) => questions.find((q) => q.QuestionID === qid);

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
  const trash = () => {
    blocks.push({
      BlockElements: [],
      Description: "Trash / Unused Questions",
      ID: ids.id("BL"),
      Type: "Trash",
    });
  };

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

  /**
   * The .qsf object. `flow` is the root's elements; `title` the survey
   * title; `name` the name Qualtrics lists it under; `now` a Date for the
   * timestamps; `metaDescription` the survey's one-line summary.
   */
  const finish = ({ flow, metaDescription, name, now, title }) => {
    const element = (elementName, primary, secondary, tertiary, content) => ({
      Element: elementName,
      Payload: content,
      PrimaryAttribute: primary,
      SecondaryAttribute: secondary,
      SurveyID: surveyId,
      TertiaryAttribute: tertiary,
    });
    const stamp = timestamp(now);
    return {
      SurveyElements: [
        element("BL", "Survey Blocks", null, null, blocks),
        element("FL", "Survey Flow", null, null, {
          Flow: flow,
          FlowID: "FL_1",
          Properties: { Count: flowCount },
          Type: "Root",
        }),
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
        element(
          "SO",
          "Survey Options",
          null,
          null,
          surveyOptions(title, metaDescription)
        ),
        ...questions.map((q) =>
          element("SQ", q.QuestionID, q.QuestionDescription, null, q)
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
        SurveyName: name,
        SurveyOwnerID: ids.id("UR"),
        SurveyStartDate: UNSET,
        SurveyStatus: "Inactive",
      },
    };
  };

  return { add, block, finish, flowId, payload, standard, trash };
}

/** "<label> <title>", or the title alone when there is no label. */
export const surveyName = (label, title) =>
  [label.trim(), title].filter(Boolean).join(" ");

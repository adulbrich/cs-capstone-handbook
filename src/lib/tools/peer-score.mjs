// Scores the peer evaluations as the Peer Evaluations page publishes them:
// the regular survey (its rubric's rated criteria and the 100-point split)
// and CATME (its rubric's dimensions, no split). Pure: no DOM, no I/O.
//
// Per student, from what the teammates answered, self excluded:
//   - each rated criterion: the mean rating received, 1 to 5 onto 50 to 100;
//   - the split (regular only): the mean share received, times N, divided by
//     5, clamped to [10, 40], through 0.65 + 0.0225x - 0.00025x^2, times 100;
//   - the score: the mean of those numbers.
// A student with no finished response scores 50. A self share below the
// floor is raised to it and the rater's other shares scaled to keep the
// total at 100; nothing is deducted. Flags queue a review and never change a
// score.

import { instruments } from "../../data/peer-evaluation.mjs";
import { selfFloor } from "./peer-contacts.mjs";
import { emailIn } from "./peer-export-columns.mjs";
import { ratedCriteria } from "./peer-survey-qsf.mjs";

/**
 * The rubric's peer criteria: `{ rated, distribution }`. `rated` are the
 * rated criteria (ratedCriteria: bands "Average of 1" to "Average of 5"), in
 * rubric order, one per rating on a loop page; `distribution` is the point
 * distribution, the one other criterion, on an instrument with a split, and
 * null on one without (CATME). Throws when the rubric has another shape.
 */
export function peerCriteria(rubric, instrument) {
  if (!Object.hasOwn(instruments, instrument)) {
    throw new Error(`Unknown peer instrument "${instrument}".`);
  }
  const rated = ratedCriteria(rubric);
  const titles = new Set(rated.map((c) => c.title));
  const others = rubric.criteria.filter((c) => !titles.has(c.title));
  const expected = instruments[instrument].split ? 1 : 0;
  if (others.length !== expected) {
    throw new Error(
      `The ${rubric.name} rubric has ${others.length} criteria besides the rated ones; the ${instrument} survey expects ${expected}${expected ? ", the point distribution" : ""}.`
    );
  }
  return { distribution: others[0] ?? null, rated };
}

/** True when the survey has a split: the one test of it, on peerCriteria's result. */
export const hasSplit = (peer) => peer.distribution !== null;

/** A result's status. */
export const STATUS = Object.freeze({
  didNotComplete: "did not complete",
  noRatings: "no ratings",
  scored: "scored",
});

/** Who roster choice `choice` is in `response`: its email, or "" for an empty slot. */
function emailOfChoice(response, choice) {
  if (choice === 1) {
    return response.email;
  }
  return response.members[choice - 2] ?? "";
}

/** What a student who did not complete the survey scores. */
export const NON_COMPLETION_SCORE = 50;
/** The normalized share is clamped to this range before the formula. */
export const SHARE_CLAMP = [10, 40];
/** On a team of two, a self share outside this range is flagged for review. */
export const PAIR_SELF_RANGE = [45, 55];
/** On a team of two, a received average below this is reviewed. */
export const PAIR_LOW_AVERAGE = 3;
/**
 * On a team of two, ratings of each other that differ by this much or more
 * (each rater's mean over the rated criteria) are reviewed. The page says
 * "diverge sharply" and names no number; this is the number.
 */
export const PAIR_DIVERGENCE = 1.5;

const TOLERANCE = 1e-6;

/** A 1 to 5 rating (or mean) on the 50 to 100 scale: 1 = 50, 5 = 100. */
export const toScale = (rating) => 50 + (rating - 1) * 12.5;

/** The distribution multiplier, 0.85 at x = 10 to 1.15 at x = 40. */
export const multiplier = (x) => 0.65 + 0.0225 * x - 0.000_25 * x * x;

const mean = (values) =>
  values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;

/** The distribution score from the mean share received on a team of N. */
export function distributionScore(meanShare, teamSize) {
  const normalized = (meanShare * teamSize) / 5;
  const clamped = Math.min(
    Math.max(normalized, SHARE_CLAMP[0]),
    SHARE_CLAMP[1]
  );
  const factor = multiplier(clamped);
  return { clamped, multiplier: factor, normalized, score: 100 * factor };
}

/**
 * Raises a self share (choice 1) below `floor` to the floor and scales the
 * other shares by (100 - floor) / (100 - self), so the total stays 100.
 * Returns `{ shares, factor }`; `factor` is 1 when nothing changed.
 */
export function rescaleSplit(shares, floor) {
  const self = shares.get(1) ?? 0;
  if (!(floor > 0 && self < floor)) {
    return { factor: 1, shares };
  }
  const factor = (100 - floor) / (100 - self);
  const scaled = new Map();
  for (const [choice, points] of shares) {
    scaled.set(choice, choice === 1 ? floor : points * factor);
  }
  scaled.set(1, floor);
  return { factor, shares: scaled };
}

/** Rounds for display and the CSV downloads. */
export const round = (value, places = 2) =>
  Math.round(value * 10 ** places) / 10 ** places;

/** Groups the roster into teams; who cannot be scored is reported. */
function groupTeams(students, report) {
  const teams = new Map();
  for (const student of students) {
    if (student.team === "") {
      report("warning", student.name, "In no group on the roster: not scored.");
      continue;
    }
    if (!teams.has(student.team)) {
      teams.set(student.team, []);
    }
    teams.get(student.team).push(student);
  }
  const byEmail = new Map();
  for (const [team, members] of teams) {
    if (members.length === 1) {
      report(
        "warning",
        members[0].name,
        `Alone on ${team}: no survey, not scored.`
      );
      continue;
    }
    for (const student of members) {
      byEmail.set(student.email, { student, team });
    }
  }
  return { byEmail, teams };
}

/** Warns where the survey's embedded data and the roster disagree; returns the floor. */
function checkEmbedded(ctx, response, rater) {
  const { name, team, teamSize } = rater;
  if (response.team !== team) {
    ctx.report(
      "warning",
      name,
      `The survey says team "${response.team}"; the roster says "${team}". Scored on the roster's team.`
    );
  }
  if (response.teamSize !== null && response.teamSize !== teamSize) {
    ctx.report(
      "warning",
      name,
      `The survey says TeamSize ${response.teamSize}; the roster has ${teamSize}. N = ${teamSize} is used.`
    );
  }
  // The floor is always computed from the roster's N; the survey's value
  // only tells the rater what they saw.
  const floor = selfFloor(teamSize);
  if (
    hasSplit(ctx.peer) &&
    response.selfFloor !== null &&
    response.selfFloor !== floor
  ) {
    ctx.report(
      "warning",
      name,
      `The survey showed SelfFloor ${response.selfFloor}; a team of ${teamSize} has ${floor}, which is used.`
    );
  }
  return floor;
}

/** The page's ratee, or "" after reporting why the page cannot be scored. */
function rateeOf(ctx, response, page, rater, rated) {
  const bySlot = emailOfChoice(response, page.choice);
  // Two independent readings of whom the page rated; both must agree.
  if (page.rateeAnswer !== null && emailIn(page.rateeAnswer) !== bySlot) {
    ctx.report(
      "error",
      rater.name,
      `Loop page ${page.prefix}: the ratee answer "${page.rateeAnswer}" and the loop position (${bySlot || "an empty slot"}) disagree. Page not scored.`
    );
    return "";
  }
  if (!rater.teamEmails.has(bySlot)) {
    ctx.report(
      "error",
      rater.name,
      `Loop page ${page.prefix} rates ${bySlot || "nobody"}, who is not on ${rater.team}. Page not scored.`
    );
    return "";
  }
  if (rated.has(bySlot)) {
    ctx.report(
      "error",
      rater.name,
      `Rated ${ctx.nameOf(bySlot)} twice; loop page ${page.prefix} not scored.`
    );
    return "";
  }
  return bySlot;
}

/** The page's ratings, each 1 to 5 or null after reporting it. */
function validRatings(ctx, page, rater, ratee) {
  return page.ratings.map((rating, c) => {
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      return rating;
    }
    ctx.report(
      "error",
      rater.name,
      rating === null
        ? `No rating of ${ctx.nameOf(ratee)} on criterion ${c + 1}.`
        : `Rating "${rating}" of ${ctx.nameOf(ratee)} on criterion ${c + 1} is not 1 to 5; left out.`
    );
    return null;
  });
}

/** Adds one rater's valid ratings of a teammate to what the teammate received. */
function credit(ctx, rater, ratee, valid) {
  const target = ctx.received.get(ratee);
  target.raters.add(rater.email);
  const given = valid.filter((rating) => rating !== null);
  for (const [c, rating] of valid.entries()) {
    if (rating !== null) {
      target.ratings[c].push(rating);
    }
  }
  if (rater.teamSize === 2 && given.length > 0) {
    ctx.pairMeans.set(rater.email, mean(given));
  }
}

/** Credits one response's rating pages to the ratees. */
function scorePages(ctx, response, rater, mine) {
  const rated = new Set();
  for (const page of response.iterations) {
    const ratee = rateeOf(ctx, response, page, rater, rated);
    if (ratee === "") {
      continue;
    }
    rated.add(ratee);
    if (page.comment !== "") {
      ctx.comments.push({
        question: "Comment",
        ratee: ctx.nameOf(ratee),
        rater: rater.name,
        team: rater.team,
        text: page.comment,
      });
    }
    const valid = validRatings(ctx, page, rater, ratee);
    if (ratee === rater.email) {
      mine.ratings = valid;
    } else {
      credit(ctx, rater, ratee, valid);
    }
  }
  for (const member of rater.members) {
    const { email } = member;
    if (!rated.has(email)) {
      ctx.report(
        "error",
        rater.name,
        `No scored ratings page for ${email === rater.email ? "themselves" : member.name}.`
      );
    }
  }
}

/** Credits one response: its ratings, its split, its comments. */
function scoreResponse(ctx, response) {
  const who = ctx.byEmail.get(response.email);
  if (!who) {
    ctx.report(
      "warning",
      response.email || `Export row ${response.row}`,
      "Responded but is not on a team of two or more on the roster: ignored."
    );
    return;
  }
  const members = ctx.teams.get(who.team);
  const rater = {
    email: response.email,
    members,
    name: who.student.name,
    team: who.team,
    teamEmails: new Set(members.map((m) => m.email)),
    teamSize: members.length,
  };
  const floor = checkEmbedded(ctx, response, rater);
  const mine = { ratings: null, share: null };
  ctx.own.set(rater.email, mine);
  scorePages(ctx, response, rater, mine);
  if (hasSplit(ctx.peer)) {
    scoreSplit(ctx, response, rater, mine, floor);
  }
  for (const [question, text] of Object.entries(response.open)) {
    if (text !== "") {
      ctx.comments.push({
        question,
        ratee: "",
        rater: rater.name,
        team: rater.team,
        text,
      });
    }
  }
}

/** The self-versus-peer gap, or null without both sides. */
function gapOf(mine, means, meanShare, teamSize) {
  if (!mine?.ratings || mine.ratings.includes(null) || means.includes(null)) {
    return null;
  }
  // No split (CATME), or a split left out: the ratings gap alone.
  const share =
    mine.share === null || meanShare === null
      ? null
      : ((mine.share - meanShare) * teamSize) / 5;
  return { ratings: mean(mine.ratings) - mean(means), share };
}

/** One student's result from what the teammates gave them. */
function buildResult(ctx, email, { student, team }) {
  const teamSize = ctx.teams.get(team).length;
  const got = ctx.received.get(email);
  const means = got.ratings.map(mean);
  const criterionScores = means.map((m) => (m === null ? null : toScale(m)));
  const meanShare = mean(got.shares);
  const distribution =
    meanShare === null ? null : distributionScore(meanShare, teamSize);
  let status = STATUS.scored;
  let total = null;
  if (!ctx.own.has(email)) {
    status = STATUS.didNotComplete;
    total = NON_COMPLETION_SCORE;
  } else if (
    criterionScores.includes(null) ||
    (hasSplit(ctx.peer) && distribution === null)
  ) {
    status = STATUS.noRatings;
    ctx.report(
      "error",
      student.name,
      "No teammate's ratings or shares to score from: no score. Decide by hand."
    );
  } else {
    total = mean(
      hasSplit(ctx.peer)
        ? [...criterionScores, distribution.score]
        : criterionScores
    );
  }
  return {
    criterionScores,
    distribution,
    gap: gapOf(ctx.own.get(email), means, meanShare, teamSize),
    meanShare,
    means,
    raters: got.raters.size,
    status,
    student,
    team,
    teamSize,
    total,
  };
}

/**
 * Scores every rostered student on a team of two or more.
 *
 * `students` is the parsed roster; `responses` are the responses that count
 * (parsePeerExport); `rubric` is the rubric they are scored against, whose
 * rated criteria (ratedCriteria) each loop page rates; `instrument` is
 * "regular" or "catme" (`instruments`), required. Returns `{ results, problems,
 * comments }`:
 *
 * - `results`, in roster order: `{ student, team, teamSize, status, raters,
 *   means, criterionScores, meanShare, distribution, total, gap }`. `status`
 *   is "scored", "did not complete" (total 50), or "no ratings" (total null:
 *   nobody's answers to score from). `means` are the rated criteria's mean
 *   ratings received, 1 to 5, in rubric order; `distribution` and
 *   `meanShare` are null without a split; `gap` is `{ ratings, share }`
 *   (`share` null without a split) or null.
 * - `problems`: `{ level, who, message }`, level "error" (data left out of
 *   the score), "warning", "review" (a flag; the score stands), or "note".
 * - `comments`: every comment, for the instructor only: `{ team, rater,
 *   ratee, question, text }`.
 */
export function scorePeers({ instrument, responses, rubric, students }) {
  const peer = peerCriteria(rubric, instrument);
  const { rated } = peer;
  const problems = [];
  const report = (level, who, message) =>
    problems.push({ level, message, who });
  const { byEmail, teams } = groupTeams(students, report);
  const ctx = {
    byEmail,
    comments: [],
    nameOf: (email) => byEmail.get(email)?.student.name ?? email,
    own: new Map(),
    /** rater -> mean of the ratings they gave, on teams of two. */
    pairMeans: new Map(),
    peer,
    received: new Map(
      [...byEmail.keys()].map((email) => [
        email,
        { raters: new Set(), ratings: rated.map(() => []), shares: [] },
      ])
    ),
    report,
    teams,
  };
  for (const response of responses) {
    scoreResponse(ctx, response);
  }
  const results = [...byEmail].map(([email, who]) =>
    buildResult(ctx, email, who)
  );
  corroboratePairs(ctx, results);
  return { comments: ctx.comments, problems, results };
}

/** Checks one response's split, rescales it, and credits the shares. */
function scoreSplit(ctx, response, rater, mine, floor) {
  const fail = (message) =>
    ctx.report("error", rater.name, `${message}; split not scored.`);
  const values = [...response.shares.values()];
  if (values.some((points) => !Number.isFinite(points) || points < 0)) {
    fail("The split holds a value that is not a number of points");
    return;
  }
  const total = values.reduce((sum, points) => sum + points, 0);
  if (Math.abs(total - 100) > TOLERANCE) {
    fail(`The split totals ${total}, not 100`);
    return;
  }
  const choiceOf = new Map();
  for (const [choice, points] of response.shares) {
    const email = emailOfChoice(response, choice);
    if (rater.teamEmails.has(email)) {
      choiceOf.set(email, choice);
    } else if (points !== 0) {
      fail(
        `The split gives ${points} to choice ${choice} (${email || "an empty slot"}), not on the team`
      );
      return;
    }
  }
  const raw = response.shares.get(1) ?? 0;
  mine.share = raw;
  const [low, high] = PAIR_SELF_RANGE;
  if (rater.teamSize === 2 && (raw < low || raw > high)) {
    ctx.report(
      "review",
      rater.name,
      `Team of two: gave themselves ${raw}, outside ${low} to ${high}.`
    );
  }
  const { factor, shares } = rescaleSplit(response.shares, floor);
  if (factor !== 1) {
    ctx.report(
      "note",
      rater.name,
      `Gave themselves ${raw}, below the floor of ${floor}: raised to ${floor}, teammates' shares scaled by ${round(factor, 4)}.`
    );
  }
  // A teammate with no points in a split that totals 100 got 0.
  for (const email of rater.teamEmails) {
    if (email !== rater.email) {
      const choice = choiceOf.get(email);
      ctx.received
        .get(email)
        .shares.push(choice === undefined ? 0 : (shares.get(choice) ?? 0));
    }
  }
}

/** The teams-of-two corroboration rule: flags, never a score change. */
function corroboratePairs({ byEmail, pairMeans, report }, results) {
  const done = new Set();
  for (const result of results) {
    if (result.teamSize !== 2 || result.status !== STATUS.scored) {
      continue;
    }
    const average = mean(result.means);
    if (average < PAIR_LOW_AVERAGE) {
      report(
        "review",
        result.student.name,
        `Team of two: the ratings received average ${round(average)}, below ${PAIR_LOW_AVERAGE}. Review against the repository and partner feedback before the score stands.`
      );
    }
    if (done.has(result.team)) {
      continue;
    }
    done.add(result.team);
    const [a, b] = [...byEmail]
      .filter(([, who]) => who.team === result.team)
      .map(([email]) => email);
    const ab = pairMeans.get(a);
    const ba = pairMeans.get(b);
    if (
      ab !== undefined &&
      ba !== undefined &&
      Math.abs(ab - ba) >= PAIR_DIVERGENCE
    ) {
      report(
        "review",
        result.team,
        `Team of two: the two rated each other ${round(ab)} and ${round(ba)} on average, ${PAIR_DIVERGENCE} or more apart. Review before the scores stand.`
      );
    }
  }
}

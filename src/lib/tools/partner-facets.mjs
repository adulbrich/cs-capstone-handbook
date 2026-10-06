// The End-of-Term Survey's facets (#446): the choices a partner picks for
// each one, the points each choice is worth, and the "What it looks like"
// list shown above it. The generator (partner-survey-qsf.mjs) writes the
// choices into the .qsf and the end-of-term scorer reads the same list back,
// so a label and its points have one source. Pure: no DOM, no I/O.
//
// Every point value comes from the term's rubric CSV, except the two
// between-anchor shares, which are the partner evaluation page's rule.

import { percentOf } from "./partner-scoring.mjs";

/**
 * The share of a facet's points a partner gives when the team sits between
 * two anchors, upper gap first. The rule is on
 * src/content/docs/assignments/project-partner-evaluation.mdx, "How the
 * scoring works": "A partner scores 90% or 70% when the team sits between
 * two anchors." partner-facets.test.mjs reads that sentence and fails if the
 * page and this list differ.
 */
export const BETWEEN_ANCHORS = [90, 70];

/** A three-anchor facet's anchors are named "<Top|Middle|Low> anchor (...)". */
const ANCHOR_NAME = /^(\w+) anchor\b/;

const descending = (criterion) =>
  [...criterion.ratings].sort((a, b) => b.points - a.points);

/** A rating's share of the criterion's points, in percent. */
const shareOf = (criterion, points) =>
  Math.round((points / criterion.maxPoints) * 10_000) / 100;

/**
 * Whether the criterion is scored on a ladder of its own (spring
 * Verification and Validation, six rungs) rather than on three anchors.
 */
export const isLadder = (criterion) => criterion.ratings.length !== 3;

/** The between choice's label, from the two anchors' names and the share. */
function betweenLabel(upper, lower, percent, criterion) {
  const words = [upper, lower].map((rating) => {
    const match = rating.name.match(ANCHOR_NAME);
    if (!match) {
      throw new Error(
        `${criterion.title}'s rating "${rating.name}" is not named "<word> anchor (...)", so its between choice has no label.`
      );
    }
    return match[1].toLowerCase();
  });
  return `Between the ${words[0]} and ${words[1]} anchors (${percent}% of the points)`;
}

/**
 * The choices for one facet, in the order the partner sees them, highest
 * first: `{ id, label, points, percent, anchor }`. `id` is the choice ID and
 * its recode; `label` the text the labels export carries; `anchor` the
 * rating, or null for a between choice. A three-anchor facet gets its
 * anchors with a between choice in each gap that holds a BETWEEN_ANCHORS
 * share; a ladder gets its rungs alone. Throws when a between share falls
 * outside every gap, so the page's rule and the CSV cannot drift apart.
 */
export function facetChoices(criterion) {
  const ratings = descending(criterion);
  const choices = [];
  const add = (label, points, anchor) =>
    choices.push({
      anchor,
      id: choices.length + 1,
      label,
      percent: shareOf(criterion, points),
      points,
    });
  const unused = new Set(isLadder(criterion) ? [] : BETWEEN_ANCHORS);
  for (const [i, rating] of ratings.entries()) {
    add(rating.name, rating.points, rating);
    const lower = ratings[i + 1];
    if (!lower) {
      break;
    }
    for (const percent of unused) {
      const points = percentOf(criterion.maxPoints, percent);
      if (points < rating.points && points > lower.points) {
        add(betweenLabel(rating, lower, percent, criterion), points, null);
        unused.delete(percent);
      }
    }
  }
  if (unused.size > 0) {
    throw new Error(
      `${criterion.title}: no gap between its anchors holds ${[...unused].join("% or ")}% of the points.`
    );
  }
  return choices;
}

/**
 * A ladder facet's custom-scale choice, last after the rungs: the partner
 * selects it and enters a share of the points. The export writes the share
 * in `<tag>_<id>_TEXT`. `min` and `max` are the lowest and highest rungs'
 * shares, the range the page gives a custom scale ("from 50% to 100% of the
 * facet's points"). Null for a three-anchor facet.
 */
export function customScaleChoice(criterion, label) {
  if (!isLadder(criterion)) {
    return null;
  }
  const ratings = descending(criterion);
  return {
    id: ratings.length + 1,
    label,
    max: shareOf(criterion, ratings[0].points),
    min: shareOf(criterion, ratings.at(-1).points),
  };
}

const HEADING = /^(#{2,6})\s+(.+?)\s*$/;
const LIST_HEAD = "**What it looks like**";
const BULLET = /^-\s+(.+)$/;
const LINE_BREAK = /\r?\n/;

/** Markdown inline text as Qualtrics HTML: bold kept, links as their text. */
const inline = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "$1");

/**
 * The "What it looks like" list under each `## <facet>` heading of the
 * partner evaluation page: a Map from heading text to its bullets, as HTML.
 * The list ends at the first line after its bullets that is not a bullet.
 */
export function facetGuidance(pageText) {
  const guidance = new Map();
  let heading = null;
  let bullets = null;
  for (const line of pageText.split(LINE_BREAK)) {
    const trimmed = line.trim();
    const match = trimmed.match(HEADING);
    if (match) {
      heading = match[1] === "##" ? match[2] : null;
      bullets = null;
      continue;
    }
    if (heading && trimmed === LIST_HEAD) {
      bullets = [];
      guidance.set(heading, bullets);
      continue;
    }
    if (!bullets) {
      continue;
    }
    const bullet = trimmed.match(BULLET);
    if (bullet) {
      bullets.push(inline(bullet[1]));
    } else if (trimmed !== "" || bullets.length > 0) {
      // Blank lines before the first bullet are skipped; anything else ends
      // the list.
      bullets = null;
    }
  }
  return guidance;
}

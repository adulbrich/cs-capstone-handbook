// The End-of-Term Survey's facets (#446): each facet's export tag, the
// choices a partner picks, the points each choice is worth, and the "What it
// looks like" list shown above it. The generator (partner-survey-qsf.mjs)
// writes the choices into the .qsf and the end-of-term scorer reads the same
// list back, so a label and its points have one source. Pure: no DOM, no I/O.
//
// Every point value comes from the term's rubric CSV. The between-anchor
// shares and the lists are read from the partner evaluation page,
// src/content/docs/assignments/project-partner-evaluation.mdx, by pageRules.

import { percentOf } from "./partner-scoring.mjs";
import { descending } from "./rubric-bands.mjs";

/** A three-anchor facet's anchors are named "<Top|Middle|Low> anchor (...)". */
const ANCHOR_NAME = /^(\w+) anchor\b/;

/** The page's between-anchor rule, the sentence the tools read. */
const BETWEEN_RULE =
  /A partner scores (\d+)% or (\d+)% when the team sits between two anchors\./;

/**
 * The shares of a facet's points a partner gives when the team sits between
 * two anchors, upper gap first, read from the page's "How the scoring works"
 * ("A partner scores 90% or 70% when the team sits between two anchors.").
 * Throws when the sentence is gone or reworded.
 */
export function betweenAnchors(pageText) {
  const match = pageText.match(BETWEEN_RULE);
  if (!match) {
    throw new Error(
      'The partner evaluation page has no "A partner scores N% or N% when the team sits between two anchors." sentence; the end-of-term choices cannot be built.'
    );
  }
  return [Number(match[1]), Number(match[2])];
}

const SPACES = /\s+/;
const NOT_LETTER = /[^A-Za-z]/g;

/** Tags that are not the title's first word. Keys are titles in lower case. */
const TAG_OVERRIDES = { "verification and validation": "VnV" };

/**
 * A facet's export tag, short and stable: the column its answer exports
 * under, so the scorer finds the facet by name, not by position. The title's
 * first word, letters only, unless TAG_OVERRIDES names it.
 */
export function facetTag(criterion) {
  const title = criterion.title.trim();
  return (
    TAG_OVERRIDES[title.toLowerCase()] ??
    title.split(SPACES)[0].replace(NOT_LETTER, "")
  );
}

/** A rating's share of the criterion's points, in percent. */
const shareOf = (criterion, points) =>
  Math.round((points / criterion.maxPoints) * 10_000) / 100;

/**
 * Whether the criterion is scored on a ladder of its own (spring
 * Verification and Validation, six rungs) rather than on three anchors. A
 * ladder has no between choices: its choices are its rungs, so its
 * custom-scale choice is rung count + 1.
 */
export const isLadder = (criterion) => criterion.ratings.length > 3;

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
 * anchors with a between choice in each gap that holds one of `between`
 * (betweenAnchors); a ladder gets its rungs alone. Throws when a between
 * share falls outside every gap, so the page's rule and the CSV cannot
 * drift apart.
 */
export function facetChoices(criterion, between) {
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
  const unused = new Set(isLadder(criterion) ? [] : between);
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
 * A ladder facet's custom-scale choice, after its rungs (`choices`, from
 * facetChoices): the partner selects it and enters a share of the points,
 * which the export writes in `<tag>_<id>_TEXT`. `min` and `max` are the
 * lowest and highest rungs' shares, the range the page gives a custom scale
 * ("from 50% to 100% of the facet's points"); the survey validates the entry
 * against them. Null for a three-anchor facet. Throws if a ladder's choices
 * hold anything but its rungs, since the ID would no longer be rungs + 1.
 */
export function customScaleChoice(criterion, choices) {
  if (!isLadder(criterion)) {
    return null;
  }
  if (
    choices.length !== criterion.ratings.length ||
    choices.some((choice) => !choice.anchor)
  ) {
    throw new Error(
      `${criterion.title} is a ladder, so its choices must be its ${criterion.ratings.length} rungs alone.`
    );
  }
  const ratings = descending(criterion);
  return {
    id: choices.length + 1,
    max: shareOf(criterion, ratings[0].points),
    min: shareOf(criterion, ratings.at(-1).points),
  };
}

const HEADING = /^(#{2,6})\s+(.+?)\s*$/;
const LIST_HEAD = "**What it looks like**";
const BULLET = /^-\s+(.+)$/;
const INDENTED = /^\s+\S/;
const LINE_BREAK = /\r?\n/;

/** Markdown inline text as Qualtrics HTML: bold kept, links as their text. */
const inline = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "$1");

/**
 * Reads one line into an open "What it looks like" list. `list` is
 * `{ bullets, afterBlank, heading }`. Returns false when the line ends the
 * list (a paragraph after a blank line), and throws on an unindented line
 * directly under a bullet or before the first one.
 */
function readListLine(list, line, index) {
  const trimmed = line.trim();
  const bullet = trimmed.match(BULLET);
  const { bullets } = list;
  if (bullet) {
    bullets.push(inline(bullet[1]));
  } else if (trimmed === "") {
    list.afterBlank = true;
    return true;
  } else if (bullets.length > 0 && INDENTED.test(line)) {
    bullets[bullets.length - 1] += ` ${inline(trimmed)}`;
  } else if (bullets.length > 0 && list.afterBlank) {
    return false;
  } else {
    throw new Error(
      `Line ${index + 1} of the partner evaluation page, under ${list.heading}'s "What it looks like" list, is neither a bullet nor an indented continuation: "${trimmed}".`
    );
  }
  list.afterBlank = false;
  return true;
}

/**
 * The "What it looks like" list under each `## <facet>` heading of the
 * partner evaluation page: a Map from heading text to its bullets, as HTML.
 * An indented line continues the bullet above it. A blank line followed by
 * a paragraph or a heading ends the list. An unindented line directly under
 * a bullet throws, since a reflow that puts one there would otherwise cut
 * the list short without a word.
 */
export function facetGuidance(pageText) {
  const guidance = new Map();
  let heading = null;
  let list = null;
  for (const [index, line] of pageText.split(LINE_BREAK).entries()) {
    const trimmed = line.trim();
    const match = trimmed.match(HEADING);
    if (match) {
      heading = match[1] === "##" ? match[2] : null;
      list = null;
    } else if (heading && trimmed === LIST_HEAD) {
      list = { afterBlank: false, bullets: [], heading };
      guidance.set(heading, list.bullets);
    } else if (list && !readListLine(list, line, index)) {
      list = null;
    }
  }
  return guidance;
}

/**
 * What the tools read from the partner evaluation page: `between`
 * (betweenAnchors) and `guidance` (facetGuidance), as a plain object keyed
 * by facet name, so it passes from the Astro page to the browser.
 */
export const pageRules = (pageText) => ({
  between: betweenAnchors(pageText),
  guidance: Object.fromEntries(facetGuidance(pageText)),
});

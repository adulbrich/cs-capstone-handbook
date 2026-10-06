import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseRubricCsv } from "../rubric-csv.mjs";
import {
  BETWEEN_ANCHORS,
  customScaleChoice,
  facetChoices,
  facetGuidance,
  isLadder,
} from "./partner-facets.mjs";
import { bandFor } from "./partner-scoring.mjs";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const PAGE = read(
  "src/content/docs/assignments/project-partner-evaluation.mdx"
);
const TERMS = ["fall", "winter", "spring"];
const rubrics = Object.fromEntries(
  TERMS.map((term) => {
    const path = `canvas/assignments/project-partner-evaluation/partner-final-${term}-rubric.csv`;
    return [term, parseRubricCsv(read(path), path)];
  })
);
const criteria = TERMS.flatMap((term) =>
  rubrics[term].criteria.map((criterion) => ({ criterion, term }))
);
const numbers = (text) =>
  [...text.matchAll(/(\d+)%/g)].map((m) => Number(m[1]));

test("the between-anchor shares are the page's rule", () => {
  const sentence = PAGE.match(
    /A partner scores ([^.]*) when the team sits between two anchors\./
  );
  assert.ok(sentence, "the page states the between-anchor rule");
  assert.deepEqual(numbers(sentence[1]), BETWEEN_ANCHORS);
});

test("every anchored facet offers the page's five shares, and the ladder adds its own rung", () => {
  const sentence = PAGE.match(
    /each scored at ([^;]*) of its points; spring Verification and Validation adds a (\d+)% rung/
  );
  assert.ok(sentence, "the page lists the shares a facet is scored at");
  const shares = numbers(sentence[1]);
  const rung = Number(sentence[2]);
  for (const { criterion, term } of criteria) {
    const percents = facetChoices(criterion).map((c) => c.percent);
    const expected = isLadder(criterion)
      ? [...shares, rung].sort((a, b) => b - a)
      : shares;
    assert.deepEqual(percents, expected, `${term} ${criterion.title}`);
  }
});

test("only spring Verification and Validation is a ladder; every other facet has three anchors at all, 80%, and half", () => {
  const ladders = criteria
    .filter(({ criterion }) => isLadder(criterion))
    .map(({ criterion, term }) => `${term} ${criterion.title}`);
  assert.deepEqual(ladders, ["spring Verification and Validation"]);
  for (const { criterion, term } of criteria) {
    if (isLadder(criterion)) {
      continue;
    }
    const anchors = facetChoices(criterion).filter((c) => c.anchor);
    assert.deepEqual(
      anchors.map((c) => c.percent),
      [100, 80, 50],
      `${term} ${criterion.title}`
    );
  }
});

test("anchor and rung choices are the CSV's rating names and points; between choices are labeled as such", () => {
  for (const { criterion, term } of criteria) {
    const choices = facetChoices(criterion);
    const names = new Set(criterion.ratings.map((r) => r.name));
    assert.deepEqual(
      choices.map((c) => c.id),
      choices.map((_, i) => i + 1)
    );
    const labels = choices.map((c) => c.label);
    assert.equal(new Set(labels).size, labels.length);
    for (const choice of choices) {
      if (choice.anchor) {
        assert.equal(choice.label, choice.anchor.name);
        assert.equal(choice.points, choice.anchor.points);
      } else {
        assert.ok(!names.has(choice.label), choice.label);
        assert.match(
          choice.label,
          /^Between the (top|middle) and (middle|low) anchors \((90|70)% of the points\)$/,
          `${term} ${criterion.title}`
        );
      }
      // The scorer names a between score after the highest rating at or
      // below it, so every choice resolves to a rating of the CSV.
      assert.ok(names.has(bandFor(criterion, choice.points).name));
    }
  }
});

test("spring Requirements between the middle and low anchors is 3.5, not 3", () => {
  const requirements = rubrics.spring.criteria.find(
    (c) => c.title === "Requirements and Specifications"
  );
  const choice = facetChoices(requirements).find((c) => c.percent === 70);
  assert.equal(choice.points, 3.5);
});

test("the ladder's custom scale runs from its lowest to its highest rung; anchored facets have none", () => {
  for (const { criterion, term } of criteria) {
    const custom = customScaleChoice(criterion);
    if (isLadder(criterion)) {
      assert.deepEqual(
        custom,
        { id: criterion.ratings.length + 1, max: 100, min: 50 },
        term
      );
    } else {
      assert.equal(custom, null, `${term} ${criterion.title}`);
    }
  }
});

test("a between share in no gap, or an anchor named another way, stops the build", () => {
  const criterion = {
    maxPoints: 10,
    ratings: [
      { description: "", name: "Top anchor (full points)", points: 10 },
      { description: "", name: "Middle anchor", points: 8 },
      { description: "", name: "Low anchor", points: 7.5 },
    ],
    title: "Narrow",
  };
  assert.throws(() => facetChoices(criterion), /Narrow: no gap .*70%/);
  const renamed = {
    ...criterion,
    ratings: [
      { description: "", name: "Excellent", points: 10 },
      { description: "", name: "Good", points: 8 },
      { description: "", name: "Weak", points: 5 },
    ],
  };
  assert.throws(() => facetChoices(renamed), /"Excellent" is not named/);
});

test("every facet of every term has its What it looks like list on the page", () => {
  const guidance = facetGuidance(PAGE);
  for (const { criterion, term } of criteria) {
    const bullets = guidance.get(criterion.title);
    assert.ok(bullets?.length > 0, `${term} ${criterion.title}`);
    for (const bullet of bullets) {
      assert.doesNotMatch(bullet, /^-|\]\(|\*\*/, bullet);
    }
  }
  assert.equal(guidance.get("Communication").length, 6);
  assert.equal(
    guidance.get("Reflection")[0],
    "The team can say, without being asked, what the last sprint taught them and what they changed because of it."
  );
});

test("facetGuidance stops each list at its end and turns inline Markdown into HTML", () => {
  const text = [
    "## Facet",
    "",
    "Intro.",
    "",
    "**What it looks like**",
    "",
    "- One **bold** item.",
    "- A [linked](/x/) item.",
    "",
    "After the list.",
    "",
    "- Not in the list.",
    "",
    "## Other",
    "",
    "- No list head, so no list.",
  ].join("\n");
  const guidance = facetGuidance(text);
  assert.deepEqual([...guidance.keys()], ["Facet"]);
  assert.deepEqual(guidance.get("Facet"), [
    "One <b>bold</b> item.",
    "A linked item.",
  ]);
});

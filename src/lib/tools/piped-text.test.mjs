import assert from "node:assert/strict";
import { test } from "node:test";
import { distributionEmail } from "../../data/peer-evaluation.mjs";
import { memberLabel } from "./peer-contacts.mjs";
import { escapeHtml, pipedSegments, pipeHtml } from "./piped-text.mjs";

test("escapeHtml escapes the five special characters", () => {
  assert.equal(
    escapeHtml(`<a href="x">'&'</a>`),
    "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
  );
});

test("pipeHtml fills embedded and loop fields, escaping the values", () => {
  assert.equal(
    pipeHtml("${lm://Field/2} ${e://Field/Team%20Member%201}", {
      loop: { 2: "<i>ok</i>" },
      values: {
        "Team Member 1": memberLabel({ email: "a@b.c", first: "A", last: "B" }),
      },
    }),
    "<i>ok</i> A B (a@b.c)"
  );
  assert.equal(
    pipeHtml("Team ${e://Field/Team}", { values: { Team: "<b>" } }),
    "Team &lt;b&gt;"
  );
  assert.equal(pipeHtml("${e://Field/Missing}|${lm://Field/3}"), "|");
  // A link is not a field: left as written.
  assert.equal(pipeHtml("${l://SurveyLink}"), "${l://SurveyLink}");
});

test("pipedSegments shows one recipient's values and each link's text", () => {
  const segments = pipedSegments(distributionEmail.body, {
    CloseDate: "Friday at 5:00 PM",
    Team: "Quad",
  });
  assert.ok(
    segments.some((s) => s.kind === "field" && s.text === "Friday at 5:00 PM")
  );
  const links = segments.filter((s) => s.kind === "link").map((s) => s.text);
  assert.deepEqual(links, ["Take the survey", "Unsubscribe"]);
  assert.ok(segments.some((s) => s.kind === "field" && s.text === "Quad"));
  assert.ok(!segments.some((s) => s.text.includes("${")));
  assert.deepEqual(pipedSegments("Hi ${e://Field/Missing}"), [
    { kind: "text", text: "Hi " },
    { kind: "field", text: "[Missing]" },
  ]);
  assert.deepEqual(pipedSegments("${l://OptOutLink}"), [
    { kind: "link", text: "OptOutLink" },
  ]);
});

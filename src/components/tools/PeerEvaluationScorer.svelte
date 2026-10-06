<script>
// Scores the peer evaluation export in the browser and writes the rubric
// assessment and the feedback as downloads. Nothing is uploaded: the files
// never leave the page.
import { download } from "../../lib/tools/download.mjs";
import { parsePeerExport } from "../../lib/tools/peer-export.mjs";
import { SURVEY_TYPE } from "../../lib/tools/peer-export-columns.mjs";
import {
  commentsCsv,
  detailsCsv,
  feedbackCsv,
  fillPeerAssessment,
  gapRows,
  peerCriteria,
  cell as show,
} from "../../lib/tools/peer-outputs.mjs";
import { STATUS, scorePeers } from "../../lib/tools/peer-score.mjs";
import { parseRoster } from "../../lib/tools/roster.mjs";
import { parseRubricExport } from "../../lib/tools/rubric-export.mjs";

/** The peer evaluation rubric, parsed at build time by the Astro page. */
let { rubric } = $props();

const files = $state({
  assessment: { name: "", text: "" },
  export: { name: "", text: "" },
  roster: { name: "", text: "" },
});
let includePreviews = $state(false);
let outcome = $state.raw(null);

const parsed = $derived.by(() => {
  if (files.export.text === "") {
    return null;
  }
  try {
    return parsePeerExport(files.export.text, { includePreviews, rubric });
  } catch (error) {
    return {
      problems: [error.message],
      responses: [],
      type: SURVEY_TYPE.unknown,
      warnings: [],
    };
  }
});

const TYPES = {
  [SURVEY_TYPE.catme]:
    "CATME (the spring end-of-term survey). CATME scoring is not available on this page yet.",
  [SURVEY_TYPE.regular]:
    "Regular survey: the four criteria and the 100-point split.",
  [SURVEY_TYPE.slots]:
    "Regular survey generated as one block per slot. This export shape is not scored here yet; the scorer reads the Loop & Merge export.",
  [SURVEY_TYPE.unknown]: "Not a peer evaluation export this page recognizes.",
};

const ready = $derived(
  parsed?.type === SURVEY_TYPE.regular &&
    parsed.problems.length === 0 &&
    files.roster.text !== "" &&
    files.assessment.text !== ""
);

function reader(key) {
  return async (event) => {
    const input = event.currentTarget;
    const [file] = input.files;
    if (!file) {
      return;
    }
    files[key] = { name: file.name, text: await file.text() };
    outcome = null;
    // Cleared so picking the same file again, after an edit, reads it again.
    input.value = "";
  };
}

function run() {
  try {
    const peer = peerCriteria(rubric);
    const students = parseRoster(files.roster.text);
    const scored = scorePeers({
      responses: parsed.responses,
      rubric,
      students,
    });
    const filled = fillPeerAssessment({
      results: scored.results,
      rubric,
      rubricExport: parseRubricExport(files.assessment.text),
    });
    outcome = { error: "", filled, parsed, peer, rubric, ...scored };
  } catch (error) {
    outcome = { error: error.message };
  }
}

const LEVELS = [
  ["error", "Errors: left out of the scores"],
  ["review", "Flags for review: the scores stand"],
  ["warning", "Warnings"],
  ["note", "Rescaled self shares"],
];

const byLevel = $derived(
  outcome?.problems
    ? Object.fromEntries(
        LEVELS.map(([level]) => [
          level,
          outcome.problems.filter((p) => p.level === level),
        ])
      )
    : {}
);

const notCompleted = $derived(
  outcome?.results?.filter((r) => r.status === STATUS.didNotComplete) ?? []
);
/** Who started and stopped, by email, with the last question they saw. */
const stoppedAt = $derived(
  new Map(
    (outcome?.parsed?.stopped ?? []).map((r) => [
      r.email,
      r.lastSeen || "an unknown question",
    ])
  )
);
const gaps = $derived(outcome?.results ? gapRows(outcome.results) : []);

const baseName = $derived(
  files.assessment.name.replace(/\.csv$/i, "") || "peer-evaluation"
);
</script>

<form class="scorer" onsubmit={(event) => event.preventDefault()}>
  <label>
    <span>1. Qualtrics export (CSV, labels: "Use choice text")</span>
    <input type="file" accept=".csv,text/csv" onchange={reader("export")} />
  </label>
  {#if parsed}
    <p class:problem={parsed.type !== SURVEY_TYPE.regular}>
      <strong>{files.export.name}:</strong>
      {TYPES[parsed.type]}
      {#if parsed.type === SURVEY_TYPE.regular}
        {parsed.responses.length} response rows.
      {/if}
    </p>
    {#if parsed.problems.length > 0}
      <div class="problem" role="alert">
        <pre>{parsed.problems.join("\n")}</pre>
      </div>
    {/if}
  {/if}

  <label>
    <span>2. Canvas roster with groups (CSV)</span>
    <input type="file" accept=".csv,text/csv" onchange={reader("roster")} />
  </label>
  {#if files.roster.name}<p>{files.roster.name}</p>{/if}

  <label>
    <span>3. Canvas rubric assessment export for the assignment (CSV)</span>
    <input
      type="file"
      accept=".csv,text/csv"
      onchange={reader("assessment")}
    />
  </label>
  {#if files.assessment.name}<p>{files.assessment.name}</p>{/if}

  <label class="inline">
    <input
      type="checkbox"
      bind:checked={includePreviews}
      onchange={() => {
        outcome = null;
      }}
    />
    Include survey previews and test responses (for the staff test only)
  </label>

  <div class="actions">
    <button type="button" onclick={run} disabled={!ready}>Run</button>
  </div>
</form>

{#if outcome?.error}
  <div class="problem" role="alert">
    <strong>Nothing scored.</strong>
    <pre>{outcome.error}</pre>
  </div>
{:else if outcome}
  <h3>Responses</h3>
  <p>
    {outcome.parsed.responses.length} counted (the latest finished response
    per student). Left out: {outcome.parsed.dropped.preview} previews,
    {outcome.parsed.dropped.unfinished} unfinished,
    {outcome.parsed.dropped.superseded} earlier submissions.
  </p>
  {#if notCompleted.length > 0}
    <p>Did not complete (scored 50):</p>
    <ul>
      {#each notCompleted as result, i (i)}
        <li>
          {result.student.name} ({result.student.email}), {result.team}
          {#if stoppedAt.has(result.student.email)}
            : started, stopped at {stoppedAt.get(result.student.email)}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {#if outcome.parsed.warnings.length > 0}
    <ul>
      {#each outcome.parsed.warnings as warning (warning)}<li>{warning}</li>{/each}
    </ul>
  {/if}

  {#each LEVELS as [level, heading] (level)}
    {#if byLevel[level].length > 0}
      <h3>{heading} ({byLevel[level].length})</h3>
      <ul class:problem={level === "error"}>
        {#each byLevel[level] as problem, i (i)}
          <li><strong>{problem.who}:</strong> {problem.message}</li>
        {/each}
      </ul>
    {/if}
  {/each}
  {#if outcome.filled.problems.length > 0}
    <h3>Rubric assessment ({outcome.filled.problems.length})</h3>
    <ul>
      {#each outcome.filled.problems as problem, i (i)}<li>{problem}</li>{/each}
    </ul>
  {/if}

  <div class="actions">
    <button
      type="button"
      onclick={() => download(`${baseName}-scored.csv`, outcome.filled.csv)}
    >
      Rubric assessment to import (.csv)
    </button>
    <button
      type="button"
      onclick={() =>
        download(
          "peer-evaluation-feedback.csv",
          feedbackCsv(outcome.results, outcome.rubric)
        )}
    >
      Feedback for students (.csv)
    </button>
    <button
      type="button"
      onclick={() =>
        download(
          "peer-evaluation-details.csv",
          detailsCsv(outcome.results, outcome.rubric)
        )}
    >
      Details, instructor only (.csv)
    </button>
    <button
      type="button"
      onclick={() =>
        download("peer-evaluation-comments.csv", commentsCsv(outcome.comments))}
    >
      Comments, instructor only (.csv)
    </button>
  </div>

  <h3>Scores</h3>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Team</th>
          <th>N</th>
          <th>Status</th>
          <th>Score</th>
          <th>Raters</th>
          {#each [...outcome.peer.rated, outcome.peer.distribution] as criterion (criterion.title)}
            <th>{criterion.title}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each outcome.results as result, i (i)}
          <tr>
            <td>{result.student.name}</td>
            <td>{result.team}</td>
            <td>{result.teamSize}</td>
            <td>{result.status}</td>
            <td>{show(result.total)}</td>
            <td>{result.raters}</td>
            {#each result.criterionScores as score, c (c)}
              <td>{show(score)}</td>
            {/each}
            <td>{show(result.distribution?.score)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h3>Self versus peers</h3>
  <p>
    Largest first. Ratings: the self rating's mean over the four criteria
    minus the mean received. Share: the self share minus the mean share
    received, times N, divided by 5. A queue for a look; no score changes.
  </p>
  <div class="table">
    <table>
      <thead>
        <tr><th>Student</th><th>Team</th><th>Ratings gap</th><th>Share gap</th></tr>
      </thead>
      <tbody>
        {#each gaps as row, i (i)}
          <tr>
            <td>{row.name}</td>
            <td>{row.team}</td>
            <td>{show(row.ratings)}</td>
            <td>{show(row.share)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .scorer {
    display: grid;
    gap: 1rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
  }
  label.inline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
  }
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--sl-color-accent);
    background: var(--sl-color-accent);
    color: var(--sl-color-black);
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .problem {
    border-left: 4px solid var(--sl-color-red);
    padding: 0.5rem 1rem;
    background: var(--sl-color-red-low);
  }
  .problem pre {
    white-space: pre-wrap;
    background: none;
    border: none;
    padding: 0;
  }
  .table {
    overflow-x: auto;
  }
  table {
    font-size: var(--sl-text-sm);
  }
</style>

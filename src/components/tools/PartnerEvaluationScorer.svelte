<script>
// Scores a project partner survey export in the browser and writes the
// rubric-assessment CSV and the concerns CSV as downloads. Nothing is
// uploaded: the files never leave the page. The rubrics, the A lower bound,
// and the between-anchor shares arrive parsed from the handbook's own files
// at build time.
import { toCsv } from "../../lib/tools/csv.mjs";
import { download } from "../../lib/tools/download.mjs";
import {
  detectSurvey,
  SURVEY_ORDER,
  SURVEYS,
  scorePartnerSurvey,
} from "../../lib/tools/partner-scoring.mjs";
import { parseQualtricsExport } from "../../lib/tools/qualtrics-export.mjs";
import { parseRoster } from "../../lib/tools/roster.mjs";
import {
  parseRubricExport,
  rubricExportCsv,
} from "../../lib/tools/rubric-export.mjs";

const { aBound, between, rubrics } = $props();

const INPUTS = [
  { key: "roster", label: "Roster with groups (CSV)", parse: parseRoster },
  {
    key: "rubricExport",
    label: "Rubric assessments export (CSV)",
    parse: parseRubricExport,
  },
  {
    key: "qualtrics",
    label: "Qualtrics responses, choice labels (CSV)",
    parse: parseQualtricsExport,
  },
];

// Deep state, so each parse below depends on its own file's text only.
const texts = $state({ qualtrics: "", roster: "", rubricExport: "" });
const names = $state({ qualtrics: "", roster: "", rubricExport: "" });
let surveyOverride = $state(null);
let runRequested = $state(false);
let choices = $state({});

/** One input parsed, or its error; null before a file is dropped. */
function parseInput(key) {
  const text = texts[key];
  if (text === "") {
    return null;
  }
  try {
    return { value: INPUTS.find((input) => input.key === key).parse(text) };
  } catch (error) {
    return { error: error.message };
  }
}

// Derived one by one, so dropping one file never re-parses the other two.
const parsedRoster = $derived(parseInput("roster"));
const parsedRubricExport = $derived(parseInput("rubricExport"));
const parsedQualtrics = $derived(parseInput("qualtrics"));
const parsed = $derived({
  qualtrics: parsedQualtrics,
  roster: parsedRoster,
  rubricExport: parsedRubricExport,
});

const ready = $derived(INPUTS.every(({ key }) => parsed[key]?.value));

const detected = $derived(
  parsed.qualtrics?.value ? detectSurvey(parsed.qualtrics.value, rubrics) : null
);

const survey = $derived(surveyOverride ?? detected?.kind ?? null);
const definition = $derived(survey ? SURVEYS[survey] : null);

const result = $derived.by(() => {
  if (!(runRequested && ready && definition?.supported)) {
    return null;
  }
  try {
    return scorePartnerSurvey({
      aBound,
      between,
      choices: { ...choices },
      qualtrics: parsed.qualtrics.value,
      roster: parsed.roster.value,
      rubric: rubrics[definition.rubric],
      rubricExport: parsed.rubricExport.value,
      survey,
    });
  } catch (error) {
    return { error: error.message };
  }
});

const scored = $derived(result && !result.error && !result.pending);

async function readFile(key, event) {
  const input = event.currentTarget;
  const [file] = input.files;
  if (!file) {
    return;
  }
  const text = await file.text();
  names[key] = file.name;
  texts[key] = text;
  if (key === "qualtrics") {
    surveyOverride = null;
    choices = {};
  }
  runRequested = false;
  // Cleared so picking the same file again, after an edit, reads it again.
  input.value = "";
}

function chooseSurvey(event) {
  surveyOverride = event.currentTarget.value;
  runRequested = false;
}

function downloadScores() {
  download(
    `partner-${survey}-rubric-assessments.csv`,
    rubricExportCsv(parsed.rubricExport.value.header, result.rows)
  );
}

function downloadConcerns() {
  download(
    `partner-${survey}-concerns.csv`,
    toCsv([result.concerns.header, ...result.concerns.rows])
  );
}
</script>

<form class="scorer" onsubmit={(event) => event.preventDefault()}>
  {#each INPUTS as input (input.key)}
    <label>
      <span>{input.label}</span>
      <input
        type="file"
        accept=".csv,text/csv"
        onchange={(event) => readFile(input.key, event)}
      />
      {#if parsed[input.key]?.error}
        <span class="problem" role="alert">{names[input.key]}: {parsed[input.key].error}</span>
      {:else if parsed[input.key]}
        <span class="ok">{names[input.key]} read.</span>
      {/if}
    </label>
  {/each}

  {#if detected}
    <label>
      <span>
        Survey: {detected.kind
          ? `detected ${SURVEYS[detected.kind].title}`
          : `not recognized (${detected.reason}), pick it`}
      </span>
      <select value={survey ?? ""} onchange={chooseSurvey}>
        <option value="" disabled>Pick the survey</option>
        {#each SURVEY_ORDER as key (key)}
          <option value={key}>{SURVEYS[key].title}</option>
        {/each}
      </select>
    </label>
  {/if}

  <div class="actions">
    <button
      type="button"
      onclick={() => (runRequested = true)}
      disabled={!(ready && definition?.supported)}
    >
      Run
    </button>
  </div>
</form>

{#if result?.error}
  <div class="problem" role="alert">
    <strong>Nothing scored.</strong>
    <pre>{result.error}</pre>
  </div>
{:else if result}
  {#if result.duplicates.length > 0}
    <h3>Teams with more than one finished response</h3>
    <p>Pick the response that counts for each team. The other one still goes to the concerns table.</p>
    {#each result.duplicates as duplicate (duplicate.team)}
      <fieldset class="duplicate">
        <legend>{duplicate.team}</legend>
        <div class="table">
          <table>
            <thead>
              <tr>
                <th scope="col">Counts</th>
                {#each duplicate.responses as response (response.ResponseId)}
                  <th scope="col">
                    <label class="inline">
                      <input
                        type="radio"
                        name={`choice-${duplicate.team}`}
                        value={response.ResponseId}
                        bind:group={choices[duplicate.team]}
                      />
                      Use this one
                    </label>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each result.compare as field (field.tag)}
                <tr>
                  <th scope="row">{field.label}</th>
                  {#each duplicate.responses as response (response.ResponseId)}
                    <td>{response[field.tag]}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </fieldset>
    {/each}
  {/if}

  {#if scored}
    {@const report = result.report}
    <h3>Validation report</h3>
    <ul>
      <li>
        {report.scored} students scored. Teams scored from a response:
        {report.responded}; at the no-response score ({aBound} of 100):
        {report.noResponse.length}.
      </li>
      <li>
        Responses dropped: {report.dropped.preview} previews,
        {report.dropped.unfinished} unfinished.
      </li>
      {#if report.noResponse.length > 0}
        <li>Teams with no finished response, scored at the no-response score: {report.noResponse.join(", ")}.</li>
      {/if}
      {#if report.unmatchedTeams.length > 0}
        <li>
          Responses whose Team is not a roster group, not scored:
          {report.unmatchedTeams
            .map((r) => `${r.team || "(empty)"} (${r.responseId})`)
            .join(", ")}.
        </li>
      {/if}
      {#if report.noTeam.length > 0}
        <li>
          Students in the rubric export with no team, left as exported:
          {report.noTeam.map((s) => `${s.name} (${s.id}), ${s.reason}`).join("; ")}.
        </li>
      {/if}
      {#if report.notInExport.length > 0}
        <li>
          Roster students on a team but not in the rubric export, so not in the
          download: {report.notInExport.map((s) => `${s.name} (${s.team})`).join("; ")}.
        </li>
      {/if}
    </ul>
    <div class="actions">
      <button type="button" onclick={downloadScores}>
        Download the rubric assessments (.csv)
      </button>
      <button
        type="button"
        onclick={downloadConcerns}
        disabled={result.concerns.rows.length === 0}
      >
        Download the concerns table (.csv, {result.concerns.rows.length}
        {result.concerns.rows.length === 1 ? "row" : "rows"})
      </button>
    </div>
  {/if}
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
  select {
    max-width: 24rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
  }
  fieldset {
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem 1rem;
  }
  .table {
    overflow-x: auto;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
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
  .ok {
    color: var(--sl-color-gray-3);
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
</style>

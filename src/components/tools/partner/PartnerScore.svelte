<script>
// Score: the Qualtrics export, the roster, the Canvas rubric export, then
// the results, the team scores to review and edit, the grades to import,
// and the concerns table. The page
// composes the pure modules under src/lib/tools/ and the wording in
// src/data/; everything it reads or makes stays in the browser. `rubrics`
// and `aBound` are read at build time (partner-rubrics.mjs), and `between`
// is its `rules.between`.
import {
  rosterText,
  savedText,
  scoreText as text,
} from "../../../data/partner-tools.mjs";
import { NO_FILE } from "../../../data/tools-text.mjs";
import { attempt } from "../../../lib/tools/attempt.mjs";
import { toCsv } from "../../../lib/tools/csv.mjs";
import { download } from "../../../lib/tools/download.mjs";
import {
  detectSurvey,
  SURVEY_ORDER,
  SURVEYS,
  scorePartnerSurvey,
  withEdit,
} from "../../../lib/tools/partner-scoring.mjs";
import { criteriaTable } from "../../../lib/tools/peer-score-tables.mjs";
import { parseQualtricsExport } from "../../../lib/tools/qualtrics-export.mjs";
import { parseRoster } from "../../../lib/tools/roster.mjs";
import {
  matchRubricExport,
  parseRubricExport,
  rubricExportCsv,
} from "../../../lib/tools/rubric-export.mjs";
import { tableFromCsv } from "../../../lib/tools/table-view.mjs";
import {
  PARTNER_STORE,
  SHARED_KEYS,
} from "../../../lib/tools/tool-storage.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import DataPreview from "../ui/DataPreview.svelte";
import Field from "../ui/Field.svelte";
import FileDrop from "../ui/FileDrop.svelte";
import SavedData from "../ui/SavedData.svelte";
import Step from "../ui/Step.svelte";
import Stepper from "../ui/Stepper.svelte";
import { PageSteps, ToolStorage } from "../ui/saved.svelte.js";
import PartnerRosterInput from "./PartnerRosterInput.svelte";
import PartnerRosterPreview from "./PartnerRosterPreview.svelte";
import PartnerTeamScores from "./PartnerTeamScores.svelte";

let { aBound, between, rubrics } = $props();

const STEPS = [
  "export",
  "roster",
  "rubric",
  "results",
  "teams",
  "grades",
  "concerns",
];

const storage = new ToolStorage(PARTNER_STORE);
const exported = storage.saved("score:export", null);
const roster = storage.saved(SHARED_KEYS.roster, null);
const rubricFile = storage.saved("score:rubric", null);
// The survey picked when the export is not recognized, and the response
// picked for each team that sent two: both belong to one export.
const picks = storage.saved("score:picks", { choices: {}, survey: null });
// The team score edits, by survey, then team: `{ cells, note }`, `cells` by
// criterion title (scorePartnerSurvey's overrides). A new export keeps them.
const edits = storage.saved("score:edits", {});
const steps = new PageSteps(storage, "score:steps", STEPS);

const parsed = $derived(
  exported.value
    ? attempt(() => parseQualtricsExport(exported.value.text))
    : null
);
const detected = $derived(
  parsed?.value ? detectSurvey(parsed.value, rubrics) : null
);
const survey = $derived(picks.value.survey ?? detected?.kind ?? null);
const definition = $derived(survey ? SURVEYS[survey] : null);
const rubric = $derived(definition ? rubrics[definition.rubric] : null);

const parsedRoster = $derived(
  roster.value ? attempt(() => parseRoster(roster.value.text)) : null
);

/** The rubric export, and its columns matched to the survey's rubric. */
const rubricExport = $derived(
  rubricFile.value
    ? attempt(() => {
        const value = parseRubricExport(rubricFile.value.text);
        return {
          pairs: rubric ? matchRubricExport(value, rubric) : null,
          value,
        };
      })
    : null
);
const pairs = $derived(rubricExport?.value?.pairs ?? null);

const outcome = $derived(
  parsed?.value && parsedRoster?.value && pairs
    ? attempt(() =>
        scorePartnerSurvey({
          aBound,
          between,
          choices: picks.value.choices,
          overrides: edits.value[survey] ?? {},
          qualtrics: parsed.value,
          roster: parsedRoster.value,
          rubric,
          rubricExport: rubricExport.value.value,
          survey,
        })
      )
    : null
);
const result = $derived(outcome?.value ?? null);
const scored = $derived(result && !result.pending ? result : null);

const counts = $derived(
  scored?.teamCounts ?? { edited: 0, notes: 0, review: 0 }
);

const gradesCsv = $derived(
  scored ? rubricExportCsv(rubricExport.value.value.header, scored.rows) : ""
);
const concernsCsv = $derived(
  scored ? toCsv([scored.concerns.header, ...scored.concerns.rows]) : ""
);

const baseName = $derived(
  rubricFile.value?.name.replace(/\.csv$/i, "") || `partner-${survey}`
);
const files = $derived({
  concerns: `${baseName}-concerns.csv`,
  scored: `${baseName}-scored.csv`,
});

const ready = $derived({
  concerns: Boolean(scored),
  export: Boolean(parsed?.value && definition),
  grades: Boolean(scored),
  results: Boolean(scored),
  roster: Boolean(parsedRoster?.value?.some((s) => s.team !== "")),
  rubric: Boolean(pairs),
  teams: Boolean(scored),
});
const summaries = $derived({
  concerns: text.concerns.summary(scored?.concerns.rows.length ?? 0),
  export: text.export.summary({
    file: exported.value?.name ?? NO_FILE,
    finished: parsed?.value?.responses.length ?? 0,
    survey: definition?.title ?? text.export.notPicked,
  }),
  grades: text.grades.summary({ file: files.scored, review: counts.review }),
  results: text.results.summary({
    responded: scored?.report.responded ?? 0,
    students: scored?.report.scored ?? 0,
  }),
  roster: text.roster.summary({
    file: roster.value?.name ?? NO_FILE,
    students: parsedRoster?.value?.length ?? 0,
  }),
  rubric: text.rubric.summary({
    criteria: pairs?.length ?? 0,
    file: rubricFile.value?.name ?? NO_FILE,
    students: rubricExport?.value?.value.students.length ?? 0,
  }),
  teams: text.teams.summary(counts),
});

/** A new export starts its picks over. */
function takeExport(file) {
  exported.set(file);
  picks.set({ choices: {}, survey: null });
}

const pickSurvey = (value) => picks.set({ choices: {}, survey: value || null });

/** Writes one cell's edit (null removes it) and the team note (withEdit). */
const saveEdit = (team, criterion, edit, note) =>
  edits.set({
    ...edits.value,
    [survey]: withEdit(edits.value[survey] ?? {}, {
      criterion,
      edit,
      note,
      team,
    }),
  });

const pickResponse = (team, responseId) =>
  picks.set({
    ...picks.value,
    choices: { ...picks.value.choices, [team]: responseId },
  });
</script>

<SavedData {storage} confirm={savedText.confirm} what={savedText.score} />

<Stepper label={text.label}>
  <Step
    {...steps.props("export", ready)}
    title={text.export.title}
    summary={summaries.export}
    waiting={text.export.waiting}
    usedIn={text.export.usedIn}
  >
    {#snippet source()}
      <ClickPath path={text.export.path} after={text.export.pathAfter} />
      <div class="not-content">
        <FileDrop
          label={text.export.drop}
          fileName={exported.value?.name ?? ""}
          onfile={takeExport}
        />
      </div>
    {/snippet}
    {#snippet preview()}
      {#if parsed?.error}
        <Callout title={text.export.error} variant="danger">
          <pre>{parsed.error}</pre>
        </Callout>
      {:else if parsed}
        <p>
          <strong>{text.export.detected}</strong>
          {detected.kind
            ? SURVEYS[detected.kind].title
            : text.export.notRecognized(detected.reason)}
        </p>
        {#if !detected.kind || picks.value.survey}
        <div class="not-content pick">
          <Field label={text.export.pickLabel} help={text.export.pickHelp}>
            {#snippet children({ describedby, id })}
              <select
                {id}
                aria-describedby={describedby}
                value={survey ?? ""}
                onchange={(event) => pickSurvey(event.currentTarget.value)}
              >
                <option value="" disabled>{text.export.pick}</option>
                {#each SURVEY_ORDER as key (key)}
                  <option value={key}>{SURVEYS[key].title}</option>
                {/each}
              </select>
            {/snippet}
          </Field>
        </div>
        {/if}
        <p>
          {text.export.counts({
            finished: parsed.value.responses.length,
            ...parsed.value.dropped,
          })}
        </p>
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("roster", ready)}
    title={rosterText.title}
    summary={summaries.roster}
    waiting={text.roster.waiting}
    usedIn={text.roster.usedIn}
  >
    {#snippet source()}
      <PartnerRosterInput parsed={parsedRoster} {roster} replace />
    {/snippet}
    {#snippet preview()}
      <PartnerRosterPreview parsed={parsedRoster} />
    {/snippet}
  </Step>

  <Step
    {...steps.props("rubric", ready)}
    title={text.rubric.title}
    summary={summaries.rubric}
    usedIn={text.rubric.usedIn}
  >
    {#snippet source()}
      <ClickPath path={text.rubric.path} after={text.rubric.pathAfter} />
      <div class="not-content">
        <FileDrop
          label={text.rubric.drop}
          fileName={rubricFile.value?.name ?? ""}
          onfile={(file) => rubricFile.set(file)}
        />
      </div>
    {/snippet}
    {#snippet preview()}
      {#if rubricExport?.error}
        <Callout title={text.rubric.error} variant="danger">
          <pre>{rubricExport.error}</pre>
        </Callout>
      {:else if rubricExport && !pairs}
        <p class="muted">{text.rubric.waitingExport}</p>
      {:else if pairs}
        <p>{text.rubric.count(rubricExport.value.value.students.length)}</p>
        <DataPreview
          title={text.rubric.matched}
          table={criteriaTable(rubricExport.value.value, pairs)}
        />
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("results", ready)}
    title={text.results.title}
    sourceTitle={text.whatItIs}
    summary={summaries.results}
    waiting={text.results.waiting}
  >
    {#snippet source()}
      <p>{text.results.what(aBound)}</p>
      {#if outcome?.error}
        <Callout title={text.results.error} variant="danger"><pre>{outcome.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if result?.duplicates.length > 0}
        <h4>{text.results.duplicates}</h4>
        <p class="muted">{text.results.duplicatesHow}</p>
        {#each result.duplicates as duplicate (duplicate.team)}
          <fieldset class="duplicate not-content">
            <legend>{duplicate.team}</legend>
            <div class="table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{text.results.field}</th>
                    {#each duplicate.responses as response (response.ResponseId)}
                      <th scope="col">
                        <label class="inline">
                          <input
                            type="radio"
                            name={`choice-${duplicate.team}`}
                            value={response.ResponseId}
                            checked={duplicate.chosen === response.ResponseId}
                            aria-label={text.results.pick(duplicate.team, response.ResponseId)}
                            onchange={() =>
                              pickResponse(duplicate.team, response.ResponseId)}
                          />
                          {text.results.pickShort}
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
        <h4>{text.results.report}</h4>
        <ul>
          {#each text.results.lines({ aBound, report: scored.report }) as line (line)}
            <li>{line}</li>
          {/each}
        </ul>
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("teams", ready)}
    title={text.teams.title}
    sourceTitle={text.whatItIs}
    summary={summaries.teams}
  >
    {#snippet source()}
      <p>{text.teams.what(SURVEYS.pulse.neutral)}</p>
    {/snippet}
    {#snippet preview()}
      {#if scored}
        {#if scored.unapplied.length > 0}
          <Callout title={text.teams.unapplied.title} variant="caution">
            <ul>
              {#each scored.unapplied as entry (`${entry.team}:${entry.criterion}`)}
                <li>{text.teams.unapplied.line(entry)}</li>
              {/each}
            </ul>
          </Callout>
        {/if}
        <p>{summaries.teams}</p>
        <PartnerTeamScores
          criteria={rubric.criteria}
          teams={scored.teams}
          onsave={saveEdit}
        />
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("grades", ready)}
    title={text.grades.title}
    sourceTitle={text.whatItIs}
    summary={summaries.grades}
  >
    {#snippet source()}
      <p>{text.grades.what}</p>
    {/snippet}
    {#snippet preview()}
      {#if counts.review > 0}
        <p>{text.grades.review(counts.review)}</p>
      {/if}
      {#if gradesCsv}
        <DataPreview
          title={text.grades.preview}
          table={tableFromCsv(gradesCsv)}
          marked={(row, column) => scored.editedColumns[row].includes(column)}
          markLabel={text.grades.edited}
        />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button onclick={() => download(files.scored, gradesCsv)} disabled={!gradesCsv}>
          {text.grades.download(files.scored)}
        </Button>
      </p>
      <ClickPath path={text.grades.path} after={text.grades.pathAfter} />
    {/snippet}
  </Step>

  <Step
    {...steps.props("concerns", ready)}
    title={text.concerns.title}
    sourceTitle={text.whatItIs}
    summary={summaries.concerns}
  >
    {#snippet source()}
      <p>{text.concerns.what}</p>
    {/snippet}
    {#snippet preview()}
      {#if scored?.concerns.rows.length > 0}
        <DataPreview title={text.concerns.title} table={tableFromCsv(concernsCsv)} />
      {:else if scored}
        <p class="muted">{text.concerns.none}</p>
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          variant="secondary"
          onclick={() => download(files.concerns, concernsCsv)}
          disabled={!scored?.concerns.rows.length}
        >
          {text.concerns.download(files.concerns)}
        </Button>
      </p>
      <p>{text.concerns.after}</p>
    {/snippet}
  </Step>
</Stepper>

<style>
  h4 {
    margin: 1rem 0 0;
    font-size: var(--sl-text-base);
  }
  .muted {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .pick {
    margin: 0.75rem 0;
  }
  .pick select {
    max-width: 100%;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-white);
    font: inherit;
  }
  .duplicate {
    margin: 0.75rem 0 0;
    padding: 0.5rem 1rem 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
  }
  .duplicate legend {
    padding: 0 0.25rem;
    font-weight: 600;
  }
  .table {
    overflow-x: auto;
  }
  .table table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--sl-text-sm);
  }
  .table th,
  .table td {
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid var(--sl-color-hairline-light);
    text-align: start;
    vertical-align: top;
  }
  .inline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
</style>

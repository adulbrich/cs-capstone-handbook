<script>
// Score: the Qualtrics export, the roster, the Canvas rubric export, then
// the results, the grades to import, and the instructor's comments. The
// page composes the pure modules under src/lib/tools/; everything it reads
// or makes stays in the browser. `rubrics` are the parsed rubrics by
// instrument (`{ regular, catme }`), read at build time by the Astro page.
import { toolText } from "../../../data/peer-evaluation.mjs";
import { download } from "../../../lib/tools/download.mjs";
import { parsePeerExport } from "../../../lib/tools/peer-export.mjs";
import { isScored } from "../../../lib/tools/peer-export-columns.mjs";
import {
  commentsCsv,
  detailsCsv,
  fillPeerAssessment,
} from "../../../lib/tools/peer-outputs.mjs";
import { rosterModel } from "../../../lib/tools/peer-roster.mjs";
import {
  NON_COMPLETION_SCORE,
  peerCriteria,
  STATUS,
  scorePeers,
} from "../../../lib/tools/peer-score.mjs";
import {
  criteriaTable,
  gapsTable,
  reportTable,
  responseCounts,
  stoppedTable,
} from "../../../lib/tools/peer-score-tables.mjs";
import {
  matchRubricExport,
  parseRubricExport,
} from "../../../lib/tools/rubric-export.mjs";
import { tableFromCsv } from "../../../lib/tools/table-view.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import DataPreview from "../ui/DataPreview.svelte";
import FileDrop from "../ui/FileDrop.svelte";
import Step from "../ui/Step.svelte";
import Stepper from "../ui/Stepper.svelte";
import RosterInput from "./RosterInput.svelte";
import RosterPreview from "./RosterPreview.svelte";
import SavedData from "./SavedData.svelte";
import { PageSteps, PeerStorage } from "./saved.svelte.js";

let { rubrics } = $props();

const STEPS = ["export", "roster", "rubric", "results", "grades", "comments"];

const storage = new PeerStorage();
const exported = storage.saved("score:export", null);
const roster = storage.saved("roster", null);
const added = storage.saved("added", []);
const rubricFile = storage.saved("score:rubric", null);
const options = storage.saved("score:options", { includePreviews: false });
const steps = new PageSteps(storage, "score:steps", STEPS);

const parsed = $derived.by(() => {
  if (!exported.value) {
    return null;
  }
  try {
    return parsePeerExport(exported.value.text, {
      includePreviews: options.value.includePreviews,
      rubrics,
    });
  } catch (error) {
    return { error: error.message };
  }
});
const scorable = $derived(
  Boolean(
    parsed &&
      !parsed.error &&
      isScored(parsed.type) &&
      parsed.problems.length === 0
  )
);

const model = $derived(rosterModel(roster.value, added.value));
const nameOf = $derived(
  new Map((model.students ?? []).map((s) => [s.email, s.name]))
);

const rubricExport = $derived.by(() => {
  if (!rubricFile.value) {
    return null;
  }
  try {
    const value = parseRubricExport(rubricFile.value.text);
    return {
      error: "",
      pairs: scorable ? matchRubricExport(value, parsed.rubric) : null,
      value,
    };
  } catch (error) {
    return { error: error.message, pairs: null, value: null };
  }
});

const outcome = $derived.by(() => {
  if (!(scorable && model.students && rubricExport?.pairs)) {
    return null;
  }
  try {
    const { instrument, rubric } = parsed;
    const scored = scorePeers({
      instrument,
      responses: parsed.responses,
      rubric,
      students: model.students,
    });
    const filled = fillPeerAssessment({
      instrument,
      results: scored.results,
      rubric,
      rubricExport: rubricExport.value,
    });
    return {
      error: "",
      filled,
      peer: peerCriteria(rubric, instrument),
      ...scored,
    };
  } catch (error) {
    return { error: error.message };
  }
});
const scored = $derived(Boolean(outcome && !outcome.error));

const counts = $derived(
  scorable ? responseCounts(parsed, options.value.includePreviews) : null
);
const stopped = $derived(
  scorable ? stoppedTable(parsed.stopped, nameOf) : null
);
const criteria = $derived(
  rubricExport?.pairs
    ? criteriaTable(rubricExport.value, rubricExport.pairs)
    : null
);
const report = $derived(
  scored ? reportTable(outcome.problems, outcome.filled.problems) : null
);
const gaps = $derived(scored ? gapsTable(outcome.results) : null);
const details = $derived(
  scored ? detailsCsv(outcome.results, outcome.peer) : ""
);
const notCompleted = $derived(
  scored
    ? outcome.results.filter((r) => r.status === STATUS.didNotComplete).length
    : 0
);
const comments = $derived(scored ? commentsCsv(outcome.comments) : "");

const baseName = $derived(
  rubricFile.value?.name.replace(/\.csv$/i, "") || "peer-evaluation"
);

const ready = $derived({
  comments: scored,
  export: scorable,
  grades: scored,
  results: scored,
  roster: Boolean(model.students && model.students.length > 0),
  rubric: Boolean(rubricExport?.pairs),
});
const view = $derived(steps.view(ready));
const stepProps = (id) => steps.props(id, view, ready);
const summaries = $derived({
  comments: `${outcome?.comments?.length ?? 0} comments, instructor only.`,
  export: `${exported.value?.name ?? "No file"}: ${parsed?.responses?.length ?? 0} finished responses.`,
  grades: `${baseName}-scored.csv${outcome?.filled?.otherSections ? `, and ${baseName}-other-sections.csv` : ""}.`,
  results: `${outcome?.results?.length ?? 0} students scored, ${report?.rows.length ?? 0} report lines.`,
  roster: `${roster.value?.name ?? "No file"}: ${model.students?.length ?? 0} students${added.value.length > 0 ? `, ${added.value.length} from another section` : ""}.`,
  rubric: `${rubricFile.value?.name ?? "No file"}: ${rubricExport?.value?.students.length ?? 0} students, ${rubricExport?.pairs?.length ?? 0} criteria matched.`,
});
</script>

<SavedData
  {storage}
  what="the three files, the students you added (the roster and added students are shared with the Prepare page), the preview setting, and each step's done box."
/>

<Stepper label="Score the peer evaluation">
  <Step
    {...stepProps("export")}
    title="Qualtrics export"
    summary={summaries.export}
    waiting="Drop a labels export of a regular or CATME peer survey."
  >
    {#snippet source()}
      <p>
        In the survey: <strong>Data &amp; Analysis</strong> ›
        <strong>Export &amp; Import</strong> › <strong>Export Data</strong> ›
        <strong>CSV</strong> › <strong>Export labels</strong>. A values export
        (numeric codes) is refused. Export after the links expire, and do not
        re-save the file in a spreadsheet.
      </p>
      <div class="drop not-content">
        <FileDrop
          label="Qualtrics responses, labels export (.csv)"
          fileName={exported.value?.name ?? ""}
          onfile={(file) => exported.set(file)}
        />
        <Checkbox
          checked={options.value.includePreviews}
          onchange={(event) =>
            options.set({ includePreviews: event.currentTarget.checked })}
        >
          Count survey previews and test responses (the staff test only)
        </Checkbox>
      </div>
    {/snippet}
    {#snippet preview()}
      {#if parsed?.error}
        <Callout title="This export cannot be scored" variant="danger">
          <pre>{parsed.error}</pre>
        </Callout>
      {:else if parsed}
        <p><strong>Detected:</strong> {toolText.surveyTypes[parsed.type]}</p>
        {#if parsed.problems.length > 0}
          <Callout title="The export's columns do not fit the survey" variant="danger">
            <pre>{parsed.problems.join("\n")}</pre>
          </Callout>
        {/if}
        {#if parsed.warnings.length > 0}
          <Callout title="Warnings" variant="caution">
            <ul>{#each parsed.warnings as warning (warning)}<li>{warning}</li>{/each}</ul>
          </Callout>
        {/if}
        {#if counts}
          <DataPreview title="Responses" table={counts} />
          <h4>Started without finishing</h4>
          {#if stopped.rows.length > 0}
            <DataPreview title="Started without finishing" table={stopped} />
          {:else}
            <p class="muted">Nobody.</p>
          {/if}
        {/if}
      {/if}
    {/snippet}
  </Step>

  <Step
    {...stepProps("roster")}
    title="Canvas roster"
    summary={summaries.roster}
  >
    {#snippet source()}
      <p>
        The roster saved on the Prepare page is used, with its added
        students. Drop the roster again only if the teams changed since the
        survey went out.
      </p>
      <RosterInput {added} {model} {roster} />
    {/snippet}
    {#snippet preview()}
      <RosterPreview {model} />
    {/snippet}
  </Step>

  <Step
    {...stepProps("rubric")}
    title="Canvas rubric export"
    summary={summaries.rubric}
  >
    {#snippet source()}
      <p>
        In Canvas: <strong>Grades</strong> › the assignment's
        <strong>Options</strong> menu › <strong>Bulk Download Rubrics</strong>,
        on the assignment this survey grades (midterm, end-of-term, or the
        spring CATME entry). It needs Enhanced Rubrics, and is not available
        on an anonymously graded assignment.
      </p>
      <div class="not-content">
        <FileDrop
          label="Canvas rubric export (.csv)"
          fileName={rubricFile.value?.name ?? ""}
          onfile={(file) => rubricFile.set(file)}
        />
      </div>
    {/snippet}
    {#snippet preview()}
      {#if rubricExport?.error}
        <Callout title="This rubric export does not fit" variant="danger">
          <pre>{rubricExport.error}</pre>
        </Callout>
      {:else if rubricExport && !scorable}
        <p class="muted">Read; it is matched to the rubric once step 1's export is scored.</p>
      {:else if criteria}
        <p>
          {rubricExport.value.students.length} students in the export; each
          rubric criterion matched to its columns:
        </p>
        <DataPreview title="Rubric criteria and export columns" table={criteria} />
      {/if}
    {/snippet}
  </Step>

  <Step
    {...stepProps("results")}
    title="Results"
    sourceTitle="What it is"
    summary={summaries.results}
  >
    {#snippet source()}
      <p>
        Each student scored from what their teammates gave them, as the Peer
        Evaluations page's Grade Calculation states. A student with no
        finished response scores {NON_COMPLETION_SCORE}
        ({notCompleted} this time). Flags for teams of two and rescaled
        splits never change a score.
      </p>
      {#if outcome?.error}
        <Callout title="Nothing scored" variant="danger"><pre>{outcome.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if report}
        <h4>Report</h4>
        {#if report.rows.length > 0}
          <DataPreview title="Report" table={report} />
        {:else}
          <p class="muted">Nothing to report.</p>
        {/if}
        <h4>Self versus peers</h4>
        <p class="muted">
          Largest first. Ratings: the self rating's mean minus the mean
          received. Share: the raw self share minus the mean share received,
          times N, divided by 5 (none on CATME). A queue for a look.
        </p>
        <DataPreview title="Self versus peers" table={gaps} />
        <h4>Scores and details</h4>
        <DataPreview title="Scores and details" table={tableFromCsv(details)} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p>Instructor only: nothing in this step goes to students.</p>
      <p class="not-content">
        <Button
          variant="secondary"
          onclick={() => download(`${baseName}-details.csv`, details)}
          disabled={!details}
        >
          Download {baseName}-details.csv
        </Button>
      </p>
    {/snippet}
  </Step>

  <Step
    {...stepProps("grades")}
    title="Grades"
    sourceTitle="What it is"
    summary={summaries.grades}
  >
    {#snippet source()}
      <p>
        The rubric export from step 3, filled in: each criterion's points and
        rating. These rubric scores are the anonymized feedback students
        receive; nothing else goes to students.
      </p>
    {/snippet}
    {#snippet preview()}
      {#if outcome?.filled}
        <DataPreview title="Rubric assessment to import" table={tableFromCsv(outcome.filled.csv)} />
        {#if outcome.filled.otherSections}
          <h4>Students from other sections</h4>
          <p>
            Scored like everyone, and their ratings count toward their
            teammates, but they are not in this course's rubric export. Their
            rows, Student Id left empty, are for whoever grades their section.
          </p>
          <DataPreview
            title="Students from other sections"
            table={tableFromCsv(outcome.filled.otherSections)}
          />
        {/if}
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() => download(`${baseName}-scored.csv`, outcome.filled.csv)}
          disabled={!outcome?.filled}
        >
          Download {baseName}-scored.csv
        </Button>
      </p>
      <p>
        In Canvas: <strong>Grades</strong> › the assignment's
        <strong>Options</strong> menu › <strong>Import Rubrics</strong>, on the
        same assignment.
      </p>
      {#if outcome?.filled?.otherSections}
        <p class="not-content">
          <Button
            variant="secondary"
            onclick={() =>
              download(`${baseName}-other-sections.csv`, outcome.filled.otherSections)}
          >
            Download {baseName}-other-sections.csv
          </Button>
        </p>
        <p>Send it to whoever grades those students' section.</p>
      {/if}
    {/snippet}
  </Step>

  <Step
    {...stepProps("comments")}
    title="Instructor-only comments"
    sourceTitle="What it is"
    summary={summaries.comments}
  >
    {#snippet source()}
      <p>
        Every comment students wrote, with who wrote it and about whom. For
        the instruction team only.
      </p>
    {/snippet}
    {#snippet preview()}
      {#if comments}
        <DataPreview title="Comments" table={tableFromCsv(comments)} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          variant="secondary"
          onclick={() => download(`${baseName}-comments.csv`, comments)}
          disabled={!comments}
        >
          Download {baseName}-comments.csv
        </Button>
      </p>
      <p>Keep it with the course records. It is never imported or sent to students.</p>
    {/snippet}
  </Step>
</Stepper>

<style>
  .drop {
    display: grid;
    gap: 0.75rem;
  }
  h4 {
    margin: 1rem 0 0;
    font-size: var(--sl-text-base);
  }
  .muted {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>

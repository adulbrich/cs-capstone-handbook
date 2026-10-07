<script>
// Score: the Qualtrics export, the roster, the Canvas rubric export, then
// the results, the grades to import, and the instructor's comments. The
// page composes the pure modules under src/lib/tools/ and the wording in
// src/data/; everything it reads or makes stays in the browser. `rubrics`
// are the parsed rubrics by instrument (`{ regular, catme }`), read at
// build time.
import {
  NO_FILE,
  rosterText,
  savedText,
  scoreText as text,
} from "../../../data/peer-tools.mjs";
import { attempt } from "../../../lib/tools/attempt.mjs";
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
import { SHARED_KEYS } from "../../../lib/tools/tool-storage.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import ClickPath from "../ui/ClickPath.svelte";
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
const roster = storage.saved(SHARED_KEYS.roster, null);
const added = storage.saved(SHARED_KEYS.added, []);
const rubricFile = storage.saved("score:rubric", null);
const options = storage.saved("score:options", { includePreviews: false });
const steps = new PageSteps(storage, "score:steps", STEPS);

/** The export as parsed, or `{ error }`; null with no file. */
const parsed = $derived.by(() => {
  if (!exported.value) {
    return null;
  }
  const { error, value } = attempt(() =>
    parsePeerExport(exported.value.text, {
      includePreviews: options.value.includePreviews,
      rubrics,
    })
  );
  return error ? { error } : value;
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

/** The rubric export, and its columns matched to the rubric once scorable. */
const rubricExport = $derived(
  rubricFile.value
    ? attempt(() => {
        const value = parseRubricExport(rubricFile.value.text);
        return {
          pairs: scorable ? matchRubricExport(value, parsed.rubric) : null,
          value,
        };
      })
    : null
);
const pairs = $derived(rubricExport?.value?.pairs ?? null);

const outcome = $derived(
  scorable && model.students && pairs
    ? attempt(() => {
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
          rubricExport: rubricExport.value.value,
        });
        return { filled, peer: peerCriteria(rubric, instrument), ...scored };
      })
    : null
);
const scored = $derived(outcome?.value ?? null);

const counts = $derived(
  scorable ? responseCounts(parsed, options.value.includePreviews) : null
);
const stopped = $derived(
  scorable ? stoppedTable(parsed.stopped, nameOf) : null
);
const criteria = $derived(
  pairs ? criteriaTable(rubricExport.value.value, pairs) : null
);
const report = $derived(
  scored ? reportTable(scored.problems, scored.filled.problems) : null
);
const gaps = $derived(scored ? gapsTable(scored.results) : null);
const details = $derived(scored ? detailsCsv(scored.results, scored.peer) : "");
const notCompleted = $derived(
  scored
    ? scored.results.filter((r) => r.status === STATUS.didNotComplete).length
    : 0
);
const comments = $derived(scored ? commentsCsv(scored.comments) : "");

const baseName = $derived(
  rubricFile.value?.name.replace(/\.csv$/i, "") || "peer-evaluation"
);
const files = $derived({
  comments: `${baseName}-comments.csv`,
  details: `${baseName}-details.csv`,
  other: `${baseName}-other-sections.csv`,
  scored: `${baseName}-scored.csv`,
});

const ready = $derived({
  comments: Boolean(scored),
  export: scorable,
  grades: Boolean(scored),
  results: Boolean(scored),
  roster: Boolean(model.students && model.students.length > 0),
  rubric: Boolean(pairs),
});
const summaries = $derived({
  comments: text.comments.summary(scored?.comments.length ?? 0),
  export: text.export.summary({
    file: exported.value?.name ?? NO_FILE,
    finished: parsed?.responses?.length ?? 0,
  }),
  grades: text.grades.summary({
    base: baseName,
    other: Boolean(scored?.filled.otherSections),
  }),
  results: text.results.summary({
    lines: report?.rows.length ?? 0,
    students: scored?.results.length ?? 0,
  }),
  roster: text.roster.summary({
    added: added.value.length,
    file: roster.value?.name ?? NO_FILE,
    students: model.students?.length ?? 0,
  }),
  rubric: text.rubric.summary({
    criteria: pairs?.length ?? 0,
    file: rubricFile.value?.name ?? NO_FILE,
    students: rubricExport?.value?.value.students.length ?? 0,
  }),
});
</script>

<SavedData {storage} what={savedText.score} />

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
      <div class="drop not-content">
        <FileDrop
          label={text.export.drop}
          fileName={exported.value?.name ?? ""}
          onfile={(file) => exported.set(file)}
        />
        <Checkbox
          checked={options.value.includePreviews}
          onchange={(event) =>
            options.set({ includePreviews: event.currentTarget.checked })}
        >
          {text.export.previews}
        </Checkbox>
      </div>
    {/snippet}
    {#snippet preview()}
      {#if parsed?.error}
        <Callout title={text.export.error} variant="danger">
          <pre>{parsed.error}</pre>
        </Callout>
      {:else if parsed}
        <p><strong>{text.export.detected}</strong> {text.surveyTypes[parsed.type]}</p>
        {#if parsed.problems.length > 0}
          <Callout title={text.export.problems} variant="danger">
            <pre>{parsed.problems.join("\n")}</pre>
          </Callout>
        {/if}
        {#if parsed.warnings.length > 0}
          <Callout title={text.export.warnings} variant="caution">
            <ul>{#each parsed.warnings as warning (warning)}<li>{warning}</li>{/each}</ul>
          </Callout>
        {/if}
        {#if counts}
          <DataPreview title={counts.header[0]} table={counts} />
          <h4>{text.export.stopped}</h4>
          {#if stopped.rows.length > 0}
            <DataPreview title={text.export.stopped} table={stopped} />
          {:else}
            <p class="muted">{text.export.nobody}</p>
          {/if}
        {/if}
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("roster", ready)}
    title={rosterText.title}
    summary={summaries.roster}
    usedIn={text.roster.usedIn}
  >
    {#snippet source()}
      <RosterInput {added} {model} {roster} replace />
    {/snippet}
    {#snippet preview()}
      <RosterPreview {model} />
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
      {:else if rubricExport && !scorable}
        <p class="muted">{text.rubric.waitingExport}</p>
      {:else if criteria}
        <p>{text.rubric.count(rubricExport.value.value.students.length)}</p>
        <DataPreview title={text.rubric.matched} table={criteria} />
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("results", ready)}
    title={text.results.title}
    sourceTitle={text.whatItIs}
    summary={summaries.results}
  >
    {#snippet source()}
      <p>{text.results.what({ notCompleted, score: NON_COMPLETION_SCORE })}</p>
      {#if outcome?.error}
        <Callout title={text.results.error} variant="danger"><pre>{outcome.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if scored}
        <h4>{text.results.report}</h4>
        {#if report.rows.length > 0}
          <DataPreview title={text.results.report} table={report} />
        {:else}
          <p class="muted">{text.results.nothing}</p>
        {/if}
        <h4>{text.results.gaps}</h4>
        <p class="muted">{text.results.gapsHow}</p>
        <DataPreview title={text.results.gaps} table={gaps} />
        <h4>{text.results.details}</h4>
        <DataPreview title={text.results.details} table={tableFromCsv(details)} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p>{text.results.after}</p>
      <p class="not-content">
        <Button
          variant="secondary"
          onclick={() => download(files.details, details)}
          disabled={!details}
        >
          {text.results.download(files.details)}
        </Button>
      </p>
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
      {#if scored}
        <DataPreview title={text.grades.preview} table={tableFromCsv(scored.filled.csv)} />
        {#if scored.filled.otherSections}
          <h4>{text.grades.other.title}</h4>
          <p>{text.grades.other.body}</p>
          <DataPreview
            title={text.grades.other.title}
            table={tableFromCsv(scored.filled.otherSections)}
          />
        {/if}
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() => download(files.scored, scored.filled.csv)}
          disabled={!scored}
        >
          {text.grades.download(files.scored)}
        </Button>
      </p>
      <ClickPath path={text.grades.path} after={text.grades.pathAfter} />
      {#if scored?.filled.otherSections}
        <p class="not-content">
          <Button
            variant="secondary"
            onclick={() => download(files.other, scored.filled.otherSections)}
          >
            {text.grades.download(files.other)}
          </Button>
        </p>
        <p>{text.grades.other.send}</p>
      {/if}
    {/snippet}
  </Step>

  <Step
    {...steps.props("comments", ready)}
    title={text.comments.title}
    sourceTitle={text.whatItIs}
    summary={summaries.comments}
  >
    {#snippet source()}
      <p>{text.comments.what}</p>
    {/snippet}
    {#snippet preview()}
      {#if comments}
        <DataPreview title={text.comments.title} table={tableFromCsv(comments)} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          variant="secondary"
          onclick={() => download(files.comments, comments)}
          disabled={!comments}
        >
          {text.comments.download(files.comments)}
        </Button>
      </p>
      <p>{text.comments.after}</p>
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

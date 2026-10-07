<script>
// Prepare: the roster, the survey, the contact list, the email, then send.
// The page composes the pure modules under src/lib/tools/ and the wording
// in src/data/; everything it reads or makes stays in the browser.
// `rubrics` are each variant's parsed rubric, read at build time.
import {
  distributionEmail,
  variantOrder,
  variants,
} from "../../../data/peer-evaluation.mjs";
import {
  NO_FILE,
  rosterText,
  savedText,
  prepareText as text,
} from "../../../data/peer-tools.mjs";
import { attempt } from "../../../lib/tools/attempt.mjs";
import { download } from "../../../lib/tools/download.mjs";
import { slug } from "../../../lib/tools/files.mjs";
import {
  buildContacts,
  contactsCsv,
  formatCloseDate,
} from "../../../lib/tools/peer-contacts.mjs";
import { rosterModel, surveyedCount } from "../../../lib/tools/peer-roster.mjs";
import { buildPeerSurvey } from "../../../lib/tools/peer-survey-qsf.mjs";
import { surveyName } from "../../../lib/tools/qsf.mjs";
import {
  respondentValues,
  surveyPages,
} from "../../../lib/tools/survey-pages.mjs";
import { tableFromCsv } from "../../../lib/tools/table-view.mjs";
import { defaultLabel } from "../../../lib/tools/term-label.mjs";
import { SHARED_KEYS } from "../../../lib/tools/tool-storage.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import CopyButton from "../ui/CopyButton.svelte";
import DataPreview from "../ui/DataPreview.svelte";
import EmailPreview from "../ui/EmailPreview.svelte";
import Field from "../ui/Field.svelte";
import RadioCards from "../ui/RadioCards.svelte";
import Step from "../ui/Step.svelte";
import Stepper from "../ui/Stepper.svelte";
import RosterInput from "./RosterInput.svelte";
import RosterPreview from "./RosterPreview.svelte";
import SavedData from "./SavedData.svelte";
import SurveyPreview from "./SurveyPreview.svelte";
import { PageSteps, PeerStorage } from "./saved.svelte.js";

let { rubrics } = $props();

const STEPS = ["roster", "survey", "contacts", "email", "send"];
const SEND = text.send.order;

const storage = new PeerStorage();
const roster = storage.saved(SHARED_KEYS.roster, null);
const added = storage.saved(SHARED_KEYS.added, []);
const settings = storage.saved("prepare:settings", {
  label: defaultLabel(),
  mode: "loop",
  variant: "midterm",
});
const steps = new PageSteps(storage, "prepare:steps", STEPS);
const sent = storage.saved("prepare:send", {});

let sampleEmail = $state("");

const model = $derived(rosterModel(roster.value, added.value));
/** The close date as every contact row and the email show it, or "". */
const closeAt = $derived(
  settings.value.closeDate ? new Date(settings.value.closeDate) : null
);
const closeDate = $derived(closeAt ? formatCloseDate(closeAt) : "");
const contacts = $derived(
  model.students && model.summary.oversized.length === 0
    ? attempt(() => buildContacts(model.students, { closeDate: closeAt })).value
    : null
);
const sample = $derived(
  contacts?.rows.find((row) => row.Email === sampleEmail) ?? contacts?.rows[0]
);

const variant = $derived(settings.value.variant);
const survey = $derived(
  attempt(() =>
    buildPeerSurvey({
      label: settings.value.label,
      mode: settings.value.mode,
      rubric: rubrics[variant],
      variant,
    })
  )
);
const pages = $derived(
  survey.value && sample
    ? surveyPages(survey.value, respondentValues(sample))
    : []
);
const contactTable = $derived(
  contacts ? tableFromCsv(contactsCsv(contacts.rows)) : null
);

const baseName = $derived(
  [slug(settings.value.label), "peer-evaluation", variant]
    .filter(Boolean)
    .join("-")
);
const files = $derived({
  contacts: `${baseName}-contact-list.csv`,
  survey: `${baseName}-qualtrics-survey.qsf`,
});

const hasContacts = $derived(Boolean(contacts && contacts.rows.length > 0));
const ready = $derived({
  contacts: Boolean(closeAt) && hasContacts,
  email: Boolean(closeAt),
  roster: hasContacts,
  send: SEND.every((key) => sent.value[key]),
  survey: Boolean(survey.value),
});

const summaries = $derived({
  contacts: text.contacts.summary({
    file: files.contacts,
    rows: contacts?.rows.length ?? 0,
  }),
  email: text.email.summary,
  roster: text.roster.summary({
    added: added.value.length,
    file: roster.value?.name ?? NO_FILE,
    ...(model.summary
      ? surveyedCount(model.summary)
      : { students: 0, teams: 0 }),
  }),
  send: text.send.summary,
  survey: text.survey.summary({
    mode: text.survey.modes[settings.value.mode].short,
    name: surveyName(settings.value.label, variants[variant].title),
    variant: variants[variant].label,
  }),
});

const setting = (key, value) =>
  settings.set({ ...settings.value, [key]: value });

const variantCards = variantOrder.map((key) => ({
  label: variants[key].label,
  lines: [variants[key].asks, variants[key].closes],
  value: key,
}));
const modeCards = Object.entries(text.survey.modes).map(
  ([value, { label, lines }]) => ({ label, lines, value })
);
</script>

<SavedData {storage} what={savedText.prepare} />

<Stepper label={text.label}>
  <Step
    {...steps.props("roster", ready)}
    title={rosterText.title}
    summary={summaries.roster}
    waiting={text.roster.waiting}
    usedIn={text.roster.usedIn}
  >
    {#snippet source()}
      <RosterInput {added} {model} {roster} />
    {/snippet}
    {#snippet preview()}
      <RosterPreview {model} />
    {/snippet}
  </Step>

  <Step
    {...steps.props("survey", ready)}
    title={text.survey.title}
    sourceTitle={text.whatItIs}
    summary={summaries.survey}
  >
    {#snippet source()}
      <p>{text.survey.what}</p>
      <div class="form not-content">
        <RadioCards
          legend={text.survey.variantLegend}
          name="variant"
          options={variantCards}
          value={variant}
          onchange={(event) => setting("variant", event.currentTarget.value)}
        />
        <Field label={text.survey.label.label} help={text.survey.label.help}>
          {#snippet children({ describedby, id })}
            <input
              {id}
              type="text"
              aria-describedby={describedby}
              value={settings.value.label}
              onchange={(event) => setting("label", event.currentTarget.value)}
            />
          {/snippet}
        </Field>
        <details class="advanced">
          <summary>{text.survey.advanced}</summary>
          <p>{text.survey.advancedWhen}</p>
          <RadioCards
            legend={text.survey.modesLegend}
            name="mode"
            options={modeCards}
            value={settings.value.mode}
            onchange={(event) => setting("mode", event.currentTarget.value)}
          />
        </details>
      </div>
      {#if survey.error}
        <Callout title={text.survey.error} variant="danger"><pre>{survey.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if contacts && sample}
        <div class="not-content sample">
          <Field label={text.survey.sample.label} help={text.survey.sample.help}>
            {#snippet children({ describedby, id })}
              <select
                {id}
                aria-describedby={describedby}
                value={sample.Email}
                onchange={(event) => {
                  sampleEmail = event.currentTarget.value;
                }}
              >
                {#each contacts.rows as row (row.Email)}
                  <option value={row.Email}>{text.survey.sample.option(row)}</option>
                {/each}
              </select>
            {/snippet}
          </Field>
        </div>
        <SurveyPreview {pages} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() =>
            download(files.survey, JSON.stringify(survey.value), "application/json")}
          disabled={!survey.value}
        >
          {text.survey.download(files.survey)}
        </Button>
      </p>
      <ClickPath path={text.survey.path} after={text.survey.pathAfter} />
    {/snippet}
  </Step>

  <Step
    {...steps.props("contacts", ready)}
    title={text.contacts.title}
    sourceTitle={text.whatItIs}
    summary={summaries.contacts}
    waiting={text.contacts.waiting}
  >
    {#snippet source()}
      <p>{text.contacts.what}</p>
      <div class="form not-content">
        <Field
          label={text.contacts.close.label}
          help={text.contacts.close.help}
          error={closeDate ? "" : text.contacts.close.missing}
        >
          {#snippet children({ describedby, id })}
            <input
              {id}
              type="datetime-local"
              aria-describedby={describedby}
              value={settings.value.closeDate ?? ""}
              onchange={(event) => setting("closeDate", event.currentTarget.value)}
            />
          {/snippet}
        </Field>
        {#if closeDate}<p class="muted">{closeDate}</p>{/if}
      </div>
    {/snippet}
    {#snippet preview()}
      {#if contactTable}
        <DataPreview title={text.contacts.title} table={contactTable} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() => download(files.contacts, contactsCsv(contacts.rows))}
          disabled={!(closeAt && contacts)}
        >
          {text.contacts.download(files.contacts)}
        </Button>
        {#if !closeAt}<span class="muted">{text.contacts.waiting}</span>{/if}
      </p>
      <ClickPath path={text.contacts.path} after={text.contacts.columns} />
    {/snippet}
  </Step>

  <Step
    {...steps.props("email", ready)}
    title={text.email.title}
    sourceTitle={text.whatItIs}
    summary={summaries.email}
    waiting={text.email.waiting}
  >
    {#snippet source()}
      <p>{text.email.what}</p>
    {/snippet}
    {#snippet preview()}
      {#if sample}
        <p class="muted">{text.email.as(sample.Email)}</p>
        <EmailPreview
          subject={distributionEmail.subject}
          body={distributionEmail.body}
          values={sample}
        />
      {/if}
    {/snippet}
    {#snippet destination()}
      <ClickPath path={text.email.path} after={text.email.pathAfter} />
      <p class="copies not-content">
        <CopyButton label={text.email.copySubject} text={distributionEmail.subject} disabled={!closeAt} />
        <CopyButton label={text.email.copyBody} text={distributionEmail.body} disabled={!closeAt} />
        {#if !closeAt}<span class="muted">{text.email.waiting}</span>{/if}
      </p>
    {/snippet}
  </Step>

  <Step
    {...steps.props("send", ready)}
    title={text.send.title}
    sourceTitle={text.send.sourceTitle}
    summary={summaries.send}
    waiting={text.send.waiting}
  >
    {#snippet source()}
      <ul class="checklist not-content">
        {#each SEND as key (key)}
          <li>
            <Checkbox
              checked={Boolean(sent.value[key])}
              onchange={(event) =>
                sent.set({ ...sent.value, [key]: event.currentTarget.checked })}
            >
              {text.send.checklist[key]}
            </Checkbox>
          </li>
        {/each}
      </ul>
      <p>{text.send.after}</p>
    {/snippet}
  </Step>
</Stepper>

<style>
  .form {
    display: grid;
    gap: 1.25rem;
    margin-top: 1rem;
  }
  .advanced summary {
    cursor: pointer;
    font-weight: 600;
  }
  .advanced summary:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .advanced p {
    margin: 0.5rem 0;
  }
  .sample {
    margin-bottom: 0.75rem;
  }
  .sample select {
    max-width: 100%;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-white);
    font: inherit;
  }
  .checklist {
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .checklist :global(label) {
    align-items: flex-start;
  }
  .copies {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .muted {
    margin: 0 0 0.5rem;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>

<script>
// Prepare: the roster, the partner sheet, the survey, the contact list, the
// email, then send. The page composes the pure modules under
// src/lib/tools/ and the wording in src/data/; everything it reads or makes
// stays in the browser. `rubrics` and `rules` are read at build time
// (partner-rubrics.mjs); `weights` and `pageUrl` from the partner
// evaluation page, by the Astro route.
import { distributionEmails } from "../../../data/partner-evaluation.mjs";
import {
  NO_FILE,
  rosterText,
  savedText,
  prepareText as text,
} from "../../../data/partner-tools.mjs";
import { parsePartnerSheet } from "../../../lib/partner-sheet.mjs";
import { attempt } from "../../../lib/tools/attempt.mjs";
import { download } from "../../../lib/tools/download.mjs";
import { slug } from "../../../lib/tools/files.mjs";
import {
  buildPartnerContacts,
  partnerContactsCsv,
} from "../../../lib/tools/partner-contacts.mjs";
import {
  buildPartnerSurvey,
  VARIANTS,
} from "../../../lib/tools/partner-survey-qsf.mjs";
import {
  noPartnerTable,
  partnersTable,
  rosterTeams,
  sharedTable,
} from "../../../lib/tools/partner-tables.mjs";
import { surveyName } from "../../../lib/tools/qsf.mjs";
import { parseRoster } from "../../../lib/tools/roster.mjs";
import {
  respondentValues,
  surveyPages,
} from "../../../lib/tools/survey-pages.mjs";
import { tableFromCsv } from "../../../lib/tools/table-view.mjs";
import {
  finalSurvey,
  labelFor,
  TERMS,
  termOf,
} from "../../../lib/tools/term-label.mjs";
import {
  PARTNER_STORE,
  SHARED_KEYS,
} from "../../../lib/tools/tool-storage.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import CopyButton from "../ui/CopyButton.svelte";
import DataPreview from "../ui/DataPreview.svelte";
import EmailPreview from "../ui/EmailPreview.svelte";
import Field from "../ui/Field.svelte";
import FileDrop from "../ui/FileDrop.svelte";
import RadioCards from "../ui/RadioCards.svelte";
import SavedData from "../ui/SavedData.svelte";
import Step from "../ui/Step.svelte";
import Stepper from "../ui/Stepper.svelte";
import SurveyPreview from "../ui/SurveyPreview.svelte";
import { PageSteps, ToolStorage } from "../ui/saved.svelte.js";
import PartnerRoster from "./PartnerRoster.svelte";

let { pageUrl, rubrics, rules, weights } = $props();

const STEPS = ["roster", "sheet", "survey", "contacts", "email", "send"];
const SEND = text.send.order;

const storage = new ToolStorage(PARTNER_STORE);
const roster = storage.saved(SHARED_KEYS.roster, null);
const sheet = storage.saved("prepare:sheet", null);
const startTerm = termOf(new Date());
const settings = storage.saved("prepare:settings", {
  closeDate: "",
  kind: "pulse",
  label: labelFor(startTerm),
  term: startTerm,
});
const steps = new PageSteps(storage, "prepare:steps", STEPS);
const sent = storage.saved("prepare:send", {});

let sampleIndex = $state(0);

const parsedRoster = $derived(
  roster.value ? attempt(() => parseRoster(roster.value.text)) : null
);
const parsedSheet = $derived(
  sheet.value ? attempt(() => parsePartnerSheet(sheet.value.text)) : null
);
const teams = $derived(
  parsedRoster?.value ? rosterTeams(parsedRoster.value) : null
);

const { kind, term } = $derived(settings.value);
const variant = $derived(kind === "pulse" ? "pulse" : finalSurvey(term));
const rubric = $derived(kind === "pulse" ? rubrics.pulse : rubrics[term]);
const { closeField, fields } = $derived(VARIANTS[variant]);
const email = $derived(distributionEmails[variant]);

/** The close date as partners read it: weekday, month, and day. */
const closeText = $derived(
  settings.value.closeDate
    ? new Date(`${settings.value.closeDate}T12:00:00`).toLocaleDateString(
        "en-US",
        { day: "numeric", month: "long", weekday: "long" }
      )
    : ""
);

const contacts = $derived(
  parsedRoster?.value && parsedSheet?.value
    ? attempt(() =>
        buildPartnerContacts(parsedRoster.value, parsedSheet.value, {
          [closeField]: closeText,
        })
      )
    : null
);
const rows = $derived(contacts?.value?.rows ?? []);
const sample = $derived(rows[sampleIndex] ?? rows[0]);

const survey = $derived(
  attempt(() =>
    buildPartnerSurvey({
      label: settings.value.label,
      pageUrl,
      rubric,
      rules,
      variant,
      weights,
    })
  )
);
const pages = $derived(
  survey.value && sample
    ? attempt(() => surveyPages(survey.value, respondentValues(sample)))
    : null
);
const contactsCsv = $derived(
  rows.length > 0 ? partnerContactsCsv(rows, fields) : ""
);

/** What the survey and its mailing list are called in Qualtrics. */
const name = $derived(
  surveyName(settings.value.label, VARIANTS[variant].title)
);
const baseName = $derived(
  [slug(settings.value.label), "partner", variant].filter(Boolean).join("-")
);
const files = $derived({
  contacts: `${baseName}-contact-list.csv`,
  survey: `${baseName}-qualtrics-survey.qsf`,
});

const ready = $derived({
  contacts: Boolean(closeText) && rows.length > 0,
  email: Boolean(closeText),
  roster: Boolean(teams && teams.teams > 0),
  send: SEND.every((key) => sent.value[key]),
  sheet: rows.length > 0,
  survey: Boolean(survey.value),
});

const summaries = $derived({
  contacts: text.contacts.summary({ file: files.contacts, rows: rows.length }),
  email: text.email.summary,
  roster: text.roster.summary({
    file: roster.value?.name ?? NO_FILE,
    students: parsedRoster?.value?.length ?? 0,
    teams: teams?.teams ?? 0,
  }),
  send: text.send.summary,
  sheet: text.sheet.summary({
    file: sheet.value?.name ?? NO_FILE,
    partners: new Set(rows.map((row) => row.Email)).size,
    teams: new Set(rows.map((row) => row.Team)).size,
  }),
  survey: text.survey.summary({
    kind: text.survey.kinds[kind].label,
    name,
    term: text.survey.terms[term],
  }),
});

const setting = (key, value) =>
  settings.set({ ...settings.value, [key]: value });

/** Picking a term resets the label to that term's. */
const pickTerm = (value) =>
  settings.set({ ...settings.value, label: labelFor(value), term: value });

const kindCards = ["pulse", "final"].map((value) => ({
  ...text.survey.kinds[value],
  value,
}));
const termCards = TERMS.map((value) => ({
  label: text.survey.terms[value],
  value,
}));
</script>

<SavedData {storage} confirm={savedText.confirm} what={savedText.prepare} />

<Stepper label={text.label}>
  <Step
    {...steps.props("roster", ready)}
    title={rosterText.title}
    summary={summaries.roster}
    waiting={text.roster.waiting}
    usedIn={text.roster.usedIn}
  >
    {#snippet source()}
      <PartnerRoster parsed={parsedRoster} {roster} />
    {/snippet}
    {#snippet preview()}
      <PartnerRoster parsed={parsedRoster} {roster} view="preview" />
    {/snippet}
  </Step>

  <Step
    {...steps.props("sheet", ready)}
    title={text.sheet.title}
    summary={summaries.sheet}
    waiting={text.sheet.waiting}
    usedIn={text.sheet.usedIn}
  >
    {#snippet source()}
      <p>{text.sheet.from}</p>
      <div class="not-content">
        <FileDrop
          label={text.sheet.drop}
          fileName={sheet.value?.name ?? ""}
          onfile={(file) => sheet.set(file)}
        />
      </div>
    {/snippet}
    {#snippet preview()}
      {#if parsedSheet?.error || contacts?.error}
        <Callout title={text.sheet.error} variant="danger">
          <pre>{parsedSheet?.error || contacts.error}</pre>
        </Callout>
      {:else if contacts?.value}
        {@const found = contacts.value}
        <p>{summaries.sheet}</p>
        {#if found.noPartner.length > 0}
          <Callout title={text.sheet.noPartner} variant="caution">
            <DataPreview title={text.sheet.noPartner} table={noPartnerTable(found.noPartner)} />
          </Callout>
        {/if}
        {#if found.notOnRoster.length > 0}
          <Callout title={text.sheet.notOnRoster.title} variant="caution">
            <p>{text.sheet.notOnRoster.body(found.notOnRoster)}</p>
          </Callout>
        {/if}
        {#if found.repeated.length > 0}
          <Callout title={text.sheet.repeated.title}>
            <p>{text.sheet.repeated.body(found.repeated)}</p>
          </Callout>
        {/if}
        {#if found.shared.length > 0}
          <Callout title={text.sheet.shared.title} variant="caution">
            <p>{text.sheet.shared.body}</p>
            <DataPreview title={text.sheet.shared.title} table={sharedTable(found.shared)} />
          </Callout>
        {/if}
        <h4>{text.sheet.partners}</h4>
        <DataPreview title={text.sheet.partners} table={partnersTable(rows)} />
      {/if}
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
          legend={text.survey.kindLegend}
          name="kind"
          options={kindCards}
          value={kind}
          onchange={(event) => setting("kind", event.currentTarget.value)}
        />
        <div>
          <RadioCards
            legend={text.survey.termLegend}
            name="term"
            options={termCards}
            value={term}
            onchange={(event) => pickTerm(event.currentTarget.value)}
          />
          <p class="muted help">{text.survey.termHelp}</p>
        </div>
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
      </div>
      {#if survey.error}
        <Callout title={text.survey.error} variant="danger"><pre>{survey.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if sample}
        <div class="not-content sample">
          <Field label={text.survey.sample.label} help={text.survey.sample.help}>
            {#snippet children({ describedby, id })}
              <select
                {id}
                aria-describedby={describedby}
                value={String(rows.indexOf(sample))}
                onchange={(event) => {
                  sampleIndex = Number(event.currentTarget.value);
                }}
              >
                {#each rows as row, i (i)}
                  <option value={String(i)}>{text.survey.sample.option(row)}</option>
                {/each}
              </select>
            {/snippet}
          </Field>
        </div>
        {#if pages?.error}
          <Callout title={text.survey.error} variant="danger"><pre>{pages.error}</pre></Callout>
        {:else if pages}
          <SurveyPreview pages={pages.value} />
        {/if}
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
      <p class="copies not-content">
        <span>{text.survey.name} <strong>{name}</strong>.</span>
        <CopyButton label={text.copyName} text={name} />
      </p>
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
      <p>{text.contacts.what(closeField)}</p>
      <div class="form not-content">
        <Field
          label={text.contacts.close.label}
          help={text.contacts.close.help}
          error={closeText ? "" : text.contacts.close.missing}
        >
          {#snippet children({ describedby, id })}
            <input
              {id}
              type="date"
              aria-describedby={describedby}
              value={settings.value.closeDate}
              onchange={(event) => setting("closeDate", event.currentTarget.value)}
            />
          {/snippet}
        </Field>
        {#if closeText}<p class="muted">{closeText}</p>{/if}
      </div>
    {/snippet}
    {#snippet preview()}
      {#if contactsCsv}
        <DataPreview title={text.contacts.title} table={tableFromCsv(contactsCsv)} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() => download(files.contacts, contactsCsv)}
          disabled={!(closeText && contactsCsv)}
        >
          {text.contacts.download(files.contacts)}
        </Button>
        {#if !closeText}<span class="muted">{text.contacts.waiting}</span>{/if}
      </p>
      <ClickPath path={text.contacts.path} after={text.contacts.columns(closeField)} />
      <p class="copies not-content">
        <span>{text.contacts.name} <strong>{name}</strong>.</span>
        <CopyButton label={text.copyName} text={name} />
      </p>
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
        <p class="muted">{text.email.as(sample)}</p>
        <EmailPreview subject={email.subject} body={email.body} values={sample} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <ClickPath path={text.email.path} after={text.email.pathAfter} />
      <p class="copies not-content">
        <CopyButton label={text.email.copySubject} text={email.subject} disabled={!closeText} />
        <CopyButton label={text.email.copyBody} text={email.body} disabled={!closeText} />
        {#if !closeText}<span class="muted">{text.email.waiting}</span>{/if}
      </p>
      <p>{text.email.send}</p>
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
  .copies {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  h4 {
    margin: 1rem 0 0;
    font-size: var(--sl-text-base);
  }
  .muted {
    margin: 0 0 0.5rem;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .help {
    margin-top: 0.5rem;
  }
</style>

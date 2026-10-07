<script>
// Prepare: the roster, the survey, the contact list, the email, then send.
// The page composes the pure modules under src/lib/tools/; everything it
// reads or makes stays in the browser. `rubrics` are each variant's parsed
// rubric, read at build time by the Astro page.
import {
  CLOSE_PLACEHOLDER,
  distributionEmail,
  toolText,
  variantOrder,
  variants,
} from "../../../data/peer-evaluation.mjs";
import { download } from "../../../lib/tools/download.mjs";
import { slug } from "../../../lib/tools/files.mjs";
import {
  buildContacts,
  CONTACT_COLUMNS,
  contactsCsv,
  MAX_TEAM_SIZE,
  SLOTS,
} from "../../../lib/tools/peer-contacts.mjs";
import { rosterModel } from "../../../lib/tools/peer-roster.mjs";
import { buildPeerSurvey } from "../../../lib/tools/peer-survey-qsf.mjs";
import { surveyName } from "../../../lib/tools/qsf.mjs";
import {
  respondentValues,
  surveyPages,
} from "../../../lib/tools/survey-pages.mjs";
import { tableFromCsv } from "../../../lib/tools/table-view.mjs";
import { defaultLabel } from "../../../lib/tools/term-label.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
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
const SEND = Object.keys(toolText.send);

const storage = new PeerStorage();
const roster = storage.saved("roster", null);
const added = storage.saved("added", []);
const settings = storage.saved("prepare:settings", {
  label: defaultLabel(),
  mode: "loop",
  variant: "midterm",
});
const steps = new PageSteps(storage, "prepare:steps", STEPS);
const sent = storage.saved("prepare:send", {});

let sampleEmail = $state("");

const model = $derived(rosterModel(roster.value, added.value));
const contacts = $derived.by(() => {
  if (!model.students || model.summary.oversized.length > 0) {
    return null;
  }
  try {
    return buildContacts(model.students);
  } catch {
    return null;
  }
});
const sample = $derived(
  contacts?.rows.find((row) => row.Email === sampleEmail) ?? contacts?.rows[0]
);

const variant = $derived(settings.value.variant);
const survey = $derived.by(() => {
  try {
    return {
      error: "",
      qsf: buildPeerSurvey({
        label: settings.value.label,
        mode: settings.value.mode,
        rubric: rubrics[variant],
        variant,
      }),
    };
  } catch (error) {
    return { error: error.message, qsf: null };
  }
});
const pages = $derived(
  survey.qsf && sample ? surveyPages(survey.qsf, respondentValues(sample)) : []
);
const contactTable = $derived(
  contacts ? tableFromCsv(contactsCsv(contacts.rows)) : null
);

const baseName = $derived(
  [slug(settings.value.label), "peer-evaluation", variant]
    .filter(Boolean)
    .join("-")
);

const ready = $derived({
  contacts: Boolean(contacts && contacts.rows.length > 0),
  email: true,
  roster: Boolean(contacts && contacts.rows.length > 0),
  send: SEND.every((key) => sent.value[key]),
  survey: Boolean(survey.qsf),
});
const view = $derived(steps.view(ready));
const stepProps = (id) => steps.props(id, view, ready);

const teamCount = $derived(
  contacts ? new Set(contacts.rows.map((row) => row.Team)).size : 0
);
const summaries = $derived({
  contacts: `${baseName}-contact-list.csv: ${contacts?.rows.length ?? 0} rows.`,
  email: "Subject and body ready to paste into the distribution.",
  roster: `${roster.value?.name ?? "No file"}: ${contacts?.rows.length ?? 0} students on ${teamCount} teams get the survey${added.value.length > 0 ? `, ${added.value.length} added from another section` : ""}.`,
  send: "Distribution set and sent.",
  survey: `${variants[variant].label}, ${settings.value.mode === "loop" ? "Loop & Merge" : "one block per teammate"}: "${surveyName(settings.value.label, variants[variant].title)}".`,
});

const setting = (key, value) =>
  settings.set({ ...settings.value, [key]: value });

const variantCards = variantOrder.map((key) => ({
  label: variants[key].label,
  lines: [variants[key].asks, variants[key].closes],
  value: key,
}));
const modeCards = Object.entries(toolText.modes).map(([value, mode]) => ({
  ...mode,
  value,
}));

function downloadSurvey() {
  download(
    `${baseName}-qualtrics-survey.qsf`,
    JSON.stringify(survey.qsf),
    "application/json"
  );
}
</script>

<SavedData
  {storage}
  what="the roster file and the students you added (shared with the Score page), the survey settings, the checklist, and each step's done box."
/>

<Stepper label="Prepare the peer evaluation">
  <Step
    {...stepProps("roster")}
    title="Canvas roster"
    summary={summaries.roster}
    waiting="Drop a roster with at least one team of two or more, and no team over {MAX_TEAM_SIZE}."
  >
    {#snippet source()}
      <RosterInput {added} {model} {roster} />
    {/snippet}
    {#snippet preview()}
      <RosterPreview {model} />
    {/snippet}
  </Step>

  <Step
    {...stepProps("survey")}
    title="Survey"
    sourceTitle="What it is"
    summary={summaries.survey}
  >
    {#snippet source()}
      <p>
        The Qualtrics survey, built from the rubric CSV under
        <code>canvas/assignments/peer-evaluation/</code> and the wording in
        <code>src/data/peer-evaluation.mjs</code>. It reads each student's
        team and teammates from the contact list (step 3).
      </p>
      <div class="form not-content">
        <RadioCards
          legend="Which survey"
          name="variant"
          options={variantCards}
          value={variant}
          onchange={(event) => setting("variant", event.currentTarget.value)}
        />
        <Field
          label="Label"
          help="Appears in Qualtrics as the start of the project name, before the survey title. Defaults to this term's label."
        >
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
          <summary>Advanced: how the rating pages are built</summary>
          <p>
            Use one block per teammate slot only when the Loop &amp; Merge
            survey fails to import or the staff test shows a wrong page.
          </p>
          <RadioCards
            legend="Rating pages"
            name="mode"
            options={modeCards}
            value={settings.value.mode}
            onchange={(event) => setting("mode", event.currentTarget.value)}
          />
        </details>
      </div>
      {#if survey.error}
        <Callout title="No survey" variant="danger"><pre>{survey.error}</pre></Callout>
      {/if}
    {/snippet}
    {#snippet preview()}
      {#if contacts && sample}
        <div class="not-content sample">
          <Field label="Show the survey as" help="Any student on the contact list; the survey adapts to their team.">
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
                  <option value={row.Email}>{row.Team}, team of {row.TeamSize}: {row.Email}</option>
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
        <Button onclick={downloadSurvey} disabled={!survey.qsf}>
          Download {baseName}-qualtrics-survey.qsf
        </Button>
      </p>
      <p>
        In Qualtrics: <strong>Catalog</strong> › <strong>Survey</strong> ›
        <strong>Get started</strong> › <strong>Import a QSF file</strong>, and
        choose this file.
      </p>
    {/snippet}
  </Step>

  <Step
    {...stepProps("contacts")}
    title="Contact list"
    sourceTitle="What it is"
    summary={summaries.contacts}
  >
    {#snippet source()}
      <p>
        One row per student who gets the survey: email, team, team size, the
        least they may give themselves in the split, and up to {SLOTS}
        teammates, which the survey shows. Built from step 1's roster,
        added students included.
      </p>
    {/snippet}
    {#snippet preview()}
      {#if contactTable}
        <DataPreview title="Contact list" table={contactTable} />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p class="not-content">
        <Button
          onclick={() => download(`${baseName}-contact-list.csv`, contactsCsv(contacts.rows))}
          disabled={!contacts}
        >
          Download {baseName}-contact-list.csv
        </Button>
      </p>
      <p>
        In Qualtrics: <strong>Directories</strong> › <strong>Segments &amp;
        lists</strong> › <strong>Lists</strong> › <strong>Create a list</strong>
        › <strong>Upload a File</strong>. Check that every column maps by its
        header: <code>Email</code>, <code>Team</code>, <code>TeamSize</code>,
        <code>SelfFloor</code>, and <code>Team Member 1</code> to
        <code>{CONTACT_COLUMNS.at(-1)}</code>.
      </p>
    {/snippet}
  </Step>

  <Step
    {...stepProps("email")}
    title="Distribution email"
    sourceTitle="What it is"
    summary={summaries.email}
  >
    {#snippet source()}
      <p>
        The email Qualtrics sends each student, with the student's team and
        their own survey link piped in. Replace
        <strong>{CLOSE_PLACEHOLDER}</strong> with when the links expire
        before you send it.
      </p>
    {/snippet}
    {#snippet preview()}
      {#if sample}
        <p class="muted">As {sample.Email} receives it.</p>
        <EmailPreview
          subject={distributionEmail.subject}
          body={distributionEmail.body}
          values={sample}
        />
      {/if}
    {/snippet}
    {#snippet destination()}
      <p>
        In the survey: <strong>Distributions</strong> › <strong>Emails</strong>
        › <strong>Send a message</strong>, to the list from step 3. Keep
        <strong>Individual links</strong> (the default), and paste the subject
        and the body.
      </p>
      <p class="copies not-content">
        <CopyButton label="Copy the subject" text={distributionEmail.subject} />
        <CopyButton label="Copy the body" text={distributionEmail.body} />
      </p>
    {/snippet}
  </Step>

  <Step
    {...stepProps("send")}
    title="Send and close"
    sourceTitle="Before you send"
    summary={summaries.send}
    waiting="Check every line first."
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
              {toolText.send[key]}
            </Checkbox>
          </li>
        {/each}
      </ul>
      <p>
        With automatic survey closure on, nothing needs closing by hand: when
        the links expire, Qualtrics records the responses still in progress.
        Then export the responses and score them on the Score page.
      </p>
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

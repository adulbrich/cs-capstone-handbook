<script>
// Writes a project partner survey (.qsf), the Midterm Pulse or a term's
// End-of-Term Survey, and its contact list as downloads. The roster and the
// partner sheet are read in the browser only: nothing is uploaded. The
// rubrics, the "What it looks like" lists, the weights, and the page address
// arrive from the handbook's own files at build time.

import { distributionEmails } from "../../data/partner-evaluation.mjs";
import { parsePartnerSheet } from "../../lib/partner-sheet.mjs";
import { download } from "../../lib/tools/download.mjs";
import { readPicked, slug } from "../../lib/tools/files.mjs";
import {
  buildPartnerContacts,
  partnerContactsCsv,
} from "../../lib/tools/partner-contacts.mjs";
import {
  partnerSurveyQsf,
  VARIANTS,
} from "../../lib/tools/partner-survey-qsf.mjs";
import { parseRoster } from "../../lib/tools/roster.mjs";
import { labelFor, termOf } from "../../lib/tools/term-label.mjs";

const { guidance, pageUrl, rubrics, weights } = $props();

/** The facets' lists by facet name, as buildPartnerSurvey reads them. */
const guidanceMap = $derived(new Map(Object.entries(guidance)));

const TERMS = ["fall", "winter", "spring"];

/** Which survey, "pulse" or "final", and its term, the current one first. */
let kind = $state("pulse");
let term = $state(termOf(new Date()));

const { rubric, variant } = $derived(
  kind === "pulse"
    ? { rubric: rubrics.pulse, variant: "pulse" }
    : { rubric: rubrics[term], variant: `final-${term}` }
);
const { closeField, fields } = $derived(VARIANTS[variant]);
const email = $derived(distributionEmails[variant]);

/** Which copy button was last used, for its "Copied" label. */
let copied = $state("");

async function copy(key, text) {
  await navigator.clipboard.writeText(text);
  copied = key;
}

const texts = $state({ roster: "", sheet: "" });
const names = $state({ roster: "", sheet: "" });
/** The term's label until edited; picking another term resets it. */
let label = $derived(labelFor(term));
let closeDate = $state("");

/** The close date as partners read it: weekday, month, and day. */
const closeText = $derived(
  closeDate === ""
    ? ""
    : new Date(`${closeDate}T12:00:00`).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        weekday: "long",
      })
);

const survey = $derived.by(() => {
  try {
    return {
      text: partnerSurveyQsf({
        guidance: guidanceMap,
        label,
        pageUrl,
        rubric,
        variant,
        weights,
      }),
    };
  } catch (error) {
    return { error: error.message };
  }
});

const contacts = $derived.by(() => {
  if (texts.roster === "" || texts.sheet === "") {
    return null;
  }
  try {
    return buildPartnerContacts(
      parseRoster(texts.roster),
      parsePartnerSheet(texts.sheet),
      { [closeField]: closeText }
    );
  } catch (error) {
    return { error: error.message };
  }
});

const teamCount = $derived(
  contacts?.rows ? new Set(contacts.rows.map((row) => row.Team)).size : 0
);

function reader(key) {
  return async (event) => {
    const picked = await readPicked(event);
    if (picked) {
      names[key] = picked.name;
      texts[key] = picked.text;
    }
  };
}

const baseName = $derived(
  [slug(label), "partner", variant].filter(Boolean).join("-")
);

function downloadSurvey() {
  download(`${baseName}-qualtrics-survey.qsf`, survey.text, "application/json");
}

function downloadContacts() {
  download(
    `${baseName}-contact-list.csv`,
    partnerContactsCsv(contacts.rows, fields)
  );
}
</script>

<form class="generator" onsubmit={(event) => event.preventDefault()}>
  <label>
    <span>Survey</span>
    <select bind:value={kind}>
      <option value="pulse">Midterm Pulse (every term)</option>
      <option value="final">End-of-Term Survey</option>
    </select>
  </label>
  <label>
    <span>Term: names the survey, and the End-of-Term Survey sets it as its <code>Term</code> field</span>
    <select bind:value={term}>
      {#each TERMS as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>
  <label>
    <span>Roster with groups (CSV)</span>
    <input type="file" accept=".csv,text/csv" onchange={reader("roster")} />
  </label>
  <label>
    <span>Partner sheet (CSV)</span>
    <input type="file" accept=".csv,text/csv" onchange={reader("sheet")} />
  </label>
  <label>
    <span>Course and term, put in front of the survey name</span>
    <input type="text" bind:value={label} />
  </label>
  <label>
    <span>Close date, shown to partners in the survey as <code>{closeField}</code></span>
    <input type="date" bind:value={closeDate} />
  </label>
</form>

{#if survey.error}
  <div class="problem" role="alert">
    <strong>The survey cannot be generated.</strong>
    <pre>{survey.error}</pre>
  </div>
{/if}

{#if contacts?.error}
  <div class="problem" role="alert">
    <strong>No contact list.</strong>
    <pre>{contacts.error}</pre>
  </div>
{:else if contacts}
  <p>
    {names.roster} and {names.sheet}: {contacts.rows.length}
    {contacts.rows.length === 1 ? "partner" : "partners"} on {teamCount}
    {teamCount === 1 ? "team" : "teams"} get the survey.
  </p>
  {#if contacts.noPartner.length > 0}
    <p>Roster teams that get no survey:</p>
    <ul>
      {#each contacts.noPartner as entry (entry.team)}
        <li>{entry.team}: {entry.reason}</li>
      {/each}
    </ul>
  {/if}
  {#if contacts.notOnRoster.length > 0}
    <p>Teams in the partner sheet with no roster group, left out:</p>
    <ul>
      {#each contacts.notOnRoster as team (team)}
        <li>{team}</li>
      {/each}
    </ul>
  {/if}
  {#if contacts.repeated.length > 0}
    <p>Teams the partner sheet lists on more than one row; every row's addresses get the survey:</p>
    <ul>
      {#each contacts.repeated as team, i (`${team}-${i}`)}
        <li>{team}</li>
      {/each}
    </ul>
  {/if}
  {#if contacts.shared.length > 0}
    <p>
      Partners with more than one team, one row per team. Qualtrics may merge
      contacts that share an email; after importing, check that the mailing
      list kept one contact per row, each with its own Team.
    </p>
    <ul>
      {#each contacts.shared as entry (entry.email)}
        <li>{entry.email}: {entry.teams.join(", ")}</li>
      {/each}
    </ul>
  {/if}
{/if}

<div class="actions">
  <button type="button" onclick={downloadSurvey} disabled={!survey.text}>
    Download the survey (.qsf) for Create project, From a file
  </button>
  <button
    type="button"
    onclick={downloadContacts}
    disabled={!contacts?.rows?.length || closeText === ""}
  >
    Download the contact list (.csv) for Directory, mailing list
  </button>
</div>
{#if contacts?.rows?.length && closeText === ""}
  <p class="hint">Pick the close date to download the contact list.</p>
{/if}

<h3>Distribution email</h3>
<p>
  Paste these into the distribution's email. Send by email to the mailing
  list; each partner email and team pair gets its own message.
</p>
<div class="email">
  <div class="copy-row">
    <strong>Subject</strong>
    <button type="button" onclick={() => copy("subject", email.subject)}>
      {copied === "subject" ? "Copied" : "Copy the subject"}
    </button>
  </div>
  <pre>{email.subject}</pre>
  <div class="copy-row">
    <strong>Body</strong>
    <button type="button" onclick={() => copy("body", email.body)}>
      {copied === "body" ? "Copied" : "Copy the body"}
    </button>
  </div>
  <pre>{email.body}</pre>
</div>

<style>
  .generator {
    display: grid;
    gap: 1rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
  }
  input[type="text"],
  input[type="date"],
  select {
    max-width: 24rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
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
  .copy-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  .email pre {
    white-space: pre-wrap;
  }
  .hint {
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

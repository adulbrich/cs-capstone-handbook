<script>
// Writes the project partner survey (.qsf) and its contact list as
// downloads. The roster and the partner sheet are read in the browser only:
// nothing is uploaded. The rubric, the weights, and the page address arrive
// from the handbook's own files at build time.
import { download } from "../../lib/tools/download.mjs";
import {
  buildPartnerContacts,
  parsePartnerSheet,
  partnerContactsCsv,
} from "../../lib/tools/partner-contacts.mjs";
import {
  partnerSurveyQsf,
  VARIANTS,
} from "../../lib/tools/partner-survey-qsf.mjs";
import { parseRoster } from "../../lib/tools/roster.mjs";
import { defaultLabel } from "../../lib/tools/term-label.mjs";

const { pageUrl, rubric, weights } = $props();

/** The one variant so far; the end-of-term surveys add theirs (#446). */
const variant = "pulse";
const { fields } = VARIANTS[variant];

const texts = $state({ roster: "", sheet: "" });
const names = $state({ roster: "", sheet: "" });
let label = $state(defaultLabel());
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
      text: partnerSurveyQsf({ label, pageUrl, rubric, variant, weights }),
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
      { MidtermCloseDate: closeText }
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
    const input = event.currentTarget;
    const [file] = input.files;
    if (!file) {
      return;
    }
    names[key] = file.name;
    texts[key] = await file.text();
    // Cleared so picking the same file again, after an edit, reads it again.
    input.value = "";
  };
}

const slug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
    <span>Close date, shown to partners in the survey</span>
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
    <p>Teams the partner sheet lists twice; the first row is used:</p>
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
  input[type="date"] {
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

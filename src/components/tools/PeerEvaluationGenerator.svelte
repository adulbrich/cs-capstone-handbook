<script>
// Reads the roster in the browser and writes the survey and the contact
// list as downloads. Nothing is uploaded: the file never leaves the page.
import { variants } from "../../data/peer-evaluation.mjs";
import { buildContacts, contactsCsv } from "../../lib/tools/peer-contacts.mjs";
import { peerSurveyQsf } from "../../lib/tools/peer-survey-qsf.mjs";
import { parseRoster } from "../../lib/tools/roster.mjs";
import { defaultLabel } from "../../lib/tools/term-label.mjs";

let rosterText = $state.raw("");
let fileName = $state("");
let variant = $state("midterm");
let label = $state(defaultLabel());
let mode = $state("loop");

const result = $derived.by(() => {
  if (rosterText === "") {
    return null;
  }
  try {
    return { ...buildContacts(parseRoster(rosterText)), error: "" };
  } catch (error) {
    return { error: error.message, excluded: [], rows: [] };
  }
});

const teamCount = $derived(
  result ? new Set(result.rows.map((row) => row.Team)).size : 0
);

async function readRoster(event) {
  const input = event.currentTarget;
  const [file] = input.files;
  if (!file) {
    return;
  }
  fileName = file.name;
  rosterText = await file.text();
  // Cleared so picking the same file again, after an edit, reads it again.
  input.value = "";
}

const slug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const baseName = $derived(
  [slug(label), "peer-evaluation", variant].filter(Boolean).join("-")
);

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked later: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSurvey() {
  download(
    `${baseName}.qsf`,
    peerSurveyQsf({ label, mode, variant }),
    "application/json"
  );
}

function downloadContacts() {
  download(
    `${baseName}-contacts.csv`,
    contactsCsv(result.rows),
    "text/csv;charset=utf-8"
  );
}
</script>

<form class="generator" onsubmit={(event) => event.preventDefault()}>
  <label>
    <span>Roster with groups (CSV)</span>
    <input type="file" accept=".csv,text/csv" onchange={readRoster} />
  </label>

  <fieldset>
    <legend>Survey</legend>
    {#each ["midterm", "final"] as key (key)}
      <label class="inline">
        <input type="radio" name="variant" value={key} bind:group={variant} />
        {variants[key].title}
      </label>
    {/each}
  </fieldset>

  <label>
    <span>Course and term, put in front of the survey name</span>
    <input type="text" bind:value={label} />
  </label>

  <fieldset>
    <legend>Rating pages</legend>
    <label class="inline">
      <input type="radio" name="mode" value="loop" bind:group={mode} />
      Loop &amp; Merge over the roster (default)
    </label>
    <label class="inline">
      <input type="radio" name="mode" value="slots" bind:group={mode} />
      One block per teammate slot (fallback if the loop fails to import or test)
    </label>
  </fieldset>
</form>

{#if result?.error}
  <div class="problem" role="alert">
    <strong>Nothing generated.</strong>
    <pre>{result.error}</pre>
  </div>
{:else if result}
  <p>
    {fileName}: {result.rows.length} students on {teamCount}
    {teamCount === 1 ? "team" : "teams"} get the survey.
  </p>
  {#if result.excluded.length > 0}
    <p>Left out of the contact list, so they get no survey:</p>
    <ul>
      {#each result.excluded as student (student.email)}
        <li>{student.name} ({student.email}): {student.reason}</li>
      {/each}
    </ul>
  {/if}
  <div class="actions">
    <button type="button" onclick={downloadSurvey}>Download the survey (.qsf)</button>
    <button
      type="button"
      onclick={downloadContacts}
      disabled={result.rows.length === 0}
    >
      Download the contact list (.csv)
    </button>
  </div>
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
  label.inline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  fieldset {
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    padding: 0.5rem 1rem 1rem;
  }
  input[type="text"] {
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
</style>

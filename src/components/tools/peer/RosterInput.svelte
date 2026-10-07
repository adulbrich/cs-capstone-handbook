<script>
// The Canvas roster: where it comes from, the drop zone, and the students
// added because they are enrolled in another section. Shared by the Prepare
// and Score pages, which save the same roster. `roster` and `added` are
// saved values (saved.svelte.js); `model` is rosterModel's result.
import { addedStudentProblems } from "../../../lib/tools/peer-roster.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Field from "../ui/Field.svelte";
import FileDrop from "../ui/FileDrop.svelte";

let { added, model, roster } = $props();

const blank = { email: "", name: "", team: "" };
let entry = $state({ ...blank });
let problems = $state([]);

const teamNames = $derived(model.summary?.teams.map((t) => t.team) ?? []);

function add(event) {
  event.preventDefault();
  problems = addedStudentProblems(entry, model.students ?? []);
  if (problems.length > 0) {
    return;
  }
  added.set([
    ...added.value,
    {
      email: entry.email.trim(),
      name: entry.name.trim(),
      team: entry.team.trim(),
    },
  ]);
  entry = { ...blank };
}

function remove(email) {
  added.set(added.value.filter((student) => student.email !== email));
}
</script>

<p>
  In Canvas: <strong>People</strong> › the group set's tab › the group set's
  options menu (three lines) › <strong>Download Course Roster CSV</strong>.
  The file has <code>name</code>, <code>login_id</code>, and
  <code>group_name</code> among its columns.
</p>

<div class="not-content">
  <FileDrop
    label="Canvas roster with groups (.csv)"
    fileName={roster.value?.name ?? ""}
    onfile={(file) => roster.set(file)}
  />
</div>

{#if model.error}
  <Callout title="This roster cannot be read" variant="danger">
    <pre>{model.error}</pre>
  </Callout>
{/if}

<Callout title="Teammates in another section" variant="caution">
  <p>
    A teammate enrolled in another section is not in this roster. Add them
    here, or they get no survey and nobody rates them. Added students are
    saved with the roster and marked in the preview.
  </p>
</Callout>

<form class="add not-content" onsubmit={add} aria-label="Add a student from another section">
  <Field label="Name" help="As Canvas shows it: Last, First.">
    {#snippet children({ describedby, id })}
      <input {id} type="text" aria-describedby={describedby} bind:value={entry.name} autocomplete="off" />
    {/snippet}
  </Field>
  <Field label="Email" help="Their login, the address the survey goes to.">
    {#snippet children({ describedby, id })}
      <input {id} type="email" aria-describedby={describedby} bind:value={entry.email} autocomplete="off" />
    {/snippet}
  </Field>
  <Field label="Team" help="Spelled exactly as the team in the roster.">
    {#snippet children({ describedby, id })}
      <input
        {id}
        type="text"
        list="{id}-teams"
        aria-describedby={describedby}
        bind:value={entry.team}
        autocomplete="off"
      />
      <datalist id="{id}-teams">
        {#each teamNames as team (team)}<option value={team}></option>{/each}
      </datalist>
    {/snippet}
  </Field>
  <div>
    <Button type="submit" variant="secondary">Add the student</Button>
  </div>
  {#if problems.length > 0}
    <ul class="problems" role="alert">
      {#each problems as problem (problem)}<li>{problem}</li>{/each}
    </ul>
  {/if}
</form>

{#if added.value.length > 0}
  <table class="added">
    <caption>Added from another section</caption>
    <thead>
      <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Team</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr>
    </thead>
    <tbody>
      {#each added.value as student (student.email)}
        <tr>
          <td>{student.name}</td>
          <td>{student.email}</td>
          <td>{student.team}</td>
          <td class="not-content">
            <Button variant="link" onclick={() => remove(student.email)} aria-label="Remove {student.name}">
              Remove
            </Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
{#if model.skipped.length > 0}
  <Callout title="Already in the roster" variant="note">
    <p>
      Now in the roster, so the added entry is ignored:
      {model.skipped.map((s) => s.email).join(", ")}. Remove it above.
    </p>
  </Callout>
{/if}

<style>
  .add {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    align-items: end;
    gap: 0.75rem 1rem;
    margin-top: 1rem;
  }
  .problems {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--sl-color-red-high);
    font-size: var(--sl-text-sm);
  }
  .added {
    margin-top: 1rem;
    font-size: var(--sl-text-sm);
  }
  .added caption {
    text-align: start;
    font-weight: 600;
    padding-bottom: 0.25rem;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>

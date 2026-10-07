<script>
// The Canvas roster: where it comes from, the drop zone, and the students
// added because they are enrolled in another section. Shared by the Prepare
// and Score pages, which save the same roster. `roster` and `added` are
// saved values (saved.svelte.js); `model` is rosterModel's result; `replace`
// adds the Score page's Replace action. The wording is in
// src/data/peer-tools.mjs.
import { rosterText as text } from "../../../data/peer-tools.mjs";
import { checkAddedStudent } from "../../../lib/tools/peer-roster.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import Field from "../ui/Field.svelte";
import FileDrop from "../ui/FileDrop.svelte";

let { added, model, replace = false, roster } = $props();

const blank = { email: "", name: "", team: "" };
let entry = $state({ ...blank });
let newTeam = $state(false);
let check = $state({ problems: [], suggestions: [] });

const teamNames = $derived(model.summary?.teams.map((t) => t.team) ?? []);

function add(event) {
  event.preventDefault();
  check = checkAddedStudent(entry, model.students ?? [], { newTeam });
  if (check.problems.length > 0) {
    return;
  }
  added.set([...added.value, check.entry]);
  entry = { ...blank };
  newTeam = false;
}

function pick(team) {
  entry.team = team;
  check = { problems: [], suggestions: [] };
}

function remove(email) {
  added.set(added.value.filter((student) => student.email !== email));
}
</script>

{#if replace}<p>{text.scoreIntro}</p>{/if}
<ClickPath path={text.path} after={text.columns} />

<div class="not-content">
  <FileDrop
    label={text.drop}
    fileName={roster.value?.name ?? ""}
    action={replace && roster.value ? text.replace : ""}
    onfile={(file) => roster.set(file)}
  />
  {#if replace && roster.value}<p class="note">{text.replaceNote}</p>{/if}
</div>

{#if model.error}
  <Callout title={text.unreadable} variant="danger">
    <pre>{model.error}</pre>
  </Callout>
{/if}

<Callout title={text.other.title} variant="caution">
  <p>{text.other.body}</p>
</Callout>

<form class="add not-content" onsubmit={add} aria-label={text.form.label}>
  <Field label={text.form.name.label} help={text.form.name.help}>
    {#snippet children({ describedby, id })}
      <input {id} type="text" aria-describedby={describedby} bind:value={entry.name} autocomplete="off" />
    {/snippet}
  </Field>
  <Field label={text.form.email.label} help={text.form.email.help}>
    {#snippet children({ describedby, id })}
      <input {id} type="email" aria-describedby={describedby} bind:value={entry.email} autocomplete="off" />
    {/snippet}
  </Field>
  <Field label={text.form.team.label} help={text.form.team.help}>
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
    <Button type="submit" variant="secondary">{text.form.add}</Button>
  </div>
  {#if check.problems.length > 0}
    <div class="problems" role="alert">
      <ul>
        {#each check.problems as problem (problem)}<li>{problem}</li>{/each}
      </ul>
      {#if check.suggestions.length > 0}
        <p class="suggestions">
          {#each check.suggestions as team (team)}
            <Button variant="secondary" onclick={() => pick(team)}>{team}</Button>
          {/each}
        </p>
        <Checkbox checked={newTeam} onchange={(event) => {
          newTeam = event.currentTarget.checked;
        }}>
          {text.form.newTeam}
        </Checkbox>
      {/if}
    </div>
  {/if}
</form>

{#if added.value.length > 0}
  <table class="added">
    <caption>{text.added}</caption>
    <thead>
      <tr>
        <th scope="col">{text.form.name.label}</th>
        <th scope="col">{text.form.email.label}</th>
        <th scope="col">{text.form.team.label}</th>
        <th scope="col"><span class="visually-hidden">{text.remove("")}</span></th>
      </tr>
    </thead>
    <tbody>
      {#each added.value as student (student.email)}
        <tr>
          <td>{student.name}</td>
          <td>{student.email}</td>
          <td>{student.team}</td>
          <td class="not-content">
            <Button variant="link" onclick={() => remove(student.email)} aria-label={text.remove(student.name)}>
              {text.remove("")}
            </Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
{#if model.skipped.length > 0}
  <Callout title={text.skippedTitle} variant="note">
    <p>{text.skipped(model.skipped.map((s) => s.email))}</p>
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
    display: grid;
    gap: 0.5rem;
    font-size: var(--sl-text-sm);
  }
  .problems ul {
    margin: 0;
    color: var(--sl-color-red-high);
  }
  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
  }
  .note {
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
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

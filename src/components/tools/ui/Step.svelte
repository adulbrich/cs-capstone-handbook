<script>
// One step of a <Stepper>: where its input comes from (or what its output
// is), a preview, where it goes, and a Done box. `status` and `open` come
// from stepView (src/lib/tools/steps.mjs): a locked step shows only its
// title, a done step its one-line `summary` and an Edit button. The heading
// takes focus (`step-<id>`), so a page can move the reader to a step that
// just opened. `ready` false disables Done, with `waiting` saying why. An
// input step names the later steps that consume it in `usedIn`.
import { STEP } from "../../../lib/tools/steps.mjs";
import Button from "./Button.svelte";
import Checkbox from "./Checkbox.svelte";

let {
  destination,
  done = false,
  id,
  number,
  oncollapse,
  ondone,
  onedit,
  open,
  preview,
  ready = true,
  source,
  sourceTitle = "Where it comes from",
  status,
  summary = "",
  title,
  usedIn = "",
  waiting = "",
} = $props();
</script>

<li
  class={["step", status]}
  data-number={number}
  aria-current={status === STEP.current ? "step" : undefined}
>
  <h2 class="title" id="step-{id}" tabindex="-1">
    <span class="visually-hidden">Step {number}:</span>
    {title}
    {#if status === STEP.done}<span class="visually-hidden">(done)</span>{/if}
  </h2>

  {#if status === STEP.locked}
    <p class="muted">Opens when step {number - 1} is done.</p>
  {:else if !open}
    <p class="summary not-content">
      <span>{summary}</span>
      <Button variant="link" onclick={onedit} aria-label="Edit step {number}, {title}">
        Edit
      </Button>
    </p>
  {:else}
    {#if source}
      <section class="part">
        <h3>{sourceTitle}</h3>
        {@render source()}
      </section>
    {/if}
    {#if preview}
      <section class="part">
        <h3>Preview</h3>
        {@render preview()}
      </section>
    {/if}
    {#if destination || usedIn}
      <section class="part">
        <h3>Where it goes</h3>
        {#if usedIn}<p><strong>Used in:</strong> {usedIn}</p>{/if}
        {@render destination?.()}
      </section>
    {/if}
    <div class="finish not-content">
      <Checkbox
        checked={done}
        disabled={!ready}
        onchange={(event) => ondone(event.currentTarget.checked)}
      >
        Done with step {number}
      </Checkbox>
      {#if done}
        <Button variant="secondary" onclick={oncollapse}>Close</Button>
      {/if}
      {#if !ready && waiting}<span class="muted">{waiting}</span>{/if}
    </div>
  {/if}
</li>

<style>
  /* The bullet and guideline, after Starlight's .sl-steps. */
  .step {
    --bullet-size: calc(var(--sl-line-height) * 1rem);
    --bullet-margin: 0.375rem;
    position: relative;
    min-width: 0;
    margin: 0;
    padding-inline-start: calc(var(--bullet-size) + 1rem);
    padding-bottom: 1.5rem;
    min-height: calc(var(--bullet-size) + var(--bullet-margin));
  }
  .step::before {
    content: attr(data-number);
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: var(--bullet-size);
    height: var(--bullet-size);
    line-height: var(--bullet-size);
    font-size: var(--sl-text-xs);
    font-weight: 600;
    text-align: center;
    color: var(--sl-color-white);
    background-color: var(--sl-color-gray-6);
    border-radius: 99rem;
    box-shadow: inset 0 0 0 1px var(--sl-color-gray-5);
  }
  .step::after {
    content: "";
    position: absolute;
    top: calc(var(--bullet-size) + var(--bullet-margin));
    bottom: var(--bullet-margin);
    inset-inline-start: calc((var(--bullet-size) - 1px) / 2);
    width: 1px;
    background-color: var(--sl-color-hairline-light);
  }
  .step:last-child::after {
    display: none;
  }
  .current::before {
    box-shadow: inset 0 0 0 2px var(--sl-color-text-accent);
  }
  .done::before {
    color: var(--sl-color-black);
    background-color: var(--sl-color-text-accent);
    box-shadow: none;
  }
  .locked {
    color: var(--sl-color-gray-3);
  }
  .title {
    margin: 0;
    font-size: var(--sl-text-h4);
    line-height: var(--sl-line-height);
  }
  .locked .title {
    color: var(--sl-color-gray-3);
  }
  .title:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .part {
    margin-top: 1rem;
  }
  .part h3 {
    margin: 0 0 0.5rem;
    font-size: var(--sl-text-sm);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sl-color-gray-2);
  }
  .summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem;
    margin: 0.25rem 0 0;
    color: var(--sl-color-gray-2);
  }
  .finish {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-hairline-light);
  }
  .muted {
    margin: 0.25rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-3);
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

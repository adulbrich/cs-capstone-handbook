<script>
// Print Defense Scoresheets: the roster, then the term, the assessor, and
// the teams, then the print, beside a preview of the first team picked.
// The roster is read in the browser and never uploaded or kept. Each page
// is drawn by the same component three times: scaled in the preview, full
// size in a hidden copy that measures whether the live sheet fits one
// page, and in the print copy under <body> that sheets.css prints alone.
// `sheet` and `session` are read from the rubric and the defense page at
// build time (defense-rubric.mjs).
import { tick } from "svelte";
import {
  previewText,
  printText,
  rosterText,
  sessionText,
} from "../../../data/defense-scoresheets.mjs";
import { attempt } from "../../../lib/tools/attempt.mjs";
import {
  FIT_SCALES,
  fullName,
  pageCounts,
  printPages,
  sessionTeams,
} from "../../../lib/tools/defense-sheets.mjs";
import { parseRoster } from "../../../lib/tools/roster.mjs";
import { TERMS, termOf } from "../../../lib/tools/term-label.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Checkbox from "../ui/Checkbox.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import Field from "../ui/Field.svelte";
import FileDrop from "../ui/FileDrop.svelte";
import Cover from "./Cover.svelte";
import { fitPage } from "./fit.js";
import LiveSheet from "./LiveSheet.svelte";
import "./sheets.css";

let { session, sheet } = $props();

/** The roster file, `{ name, text }`, or null before one is added. */
let roster = $state.raw(null);
let term = $state(termOf(new Date()));
let assessor = $state("");
/** The team names picked; "" is the students in no group. */
let selected = $state.raw(new Set());
let blankSheets = $state(false);
/** The live sheet's scale that fits one page, or null when none does. */
let fit = $state(1);
let measurer = $state();
let thumbWidth = $state(0);

const read = $derived(
  roster
    ? attempt(() => sessionTeams(parseRoster(roster.text)))
    : { error: "", value: null }
);
const teams = $derived(read.value ?? []);
const summary = $derived({
  noTeam: teams.find((t) => t.noTeam)?.members.length ?? 0,
  students: teams.reduce((sum, t) => sum + t.members.length, 0),
  teams: teams.filter((t) => !t.noTeam).length,
});
const termLabel = $derived(sessionText.terms[term]);
const pages = $derived(printPages(teams, { blankSheets, selected }));
const counts = $derived(pageCounts(pages));
const allPicked = $derived(
  teams.length > 0 && teams.every((t) => selected.has(t.team))
);
const somePicked = $derived(teams.some((t) => selected.has(t.team)));
const previewTeam = $derived(teams.find((t) => selected.has(t.team)) ?? null);
const previewCount = $derived(
  pages.filter((p) => p.team === previewTeam).length
);
/** What makes a sheet longest: the longest name and team picked. */
const longest = $derived.by(() => {
  const named = pages.filter((p) => p.student);
  const widest = (values) =>
    values.reduce((a, b) => (b.length > a.length ? b : a), "");
  return {
    name: widest(named.map((p) => fullName(p.student))),
    team: widest(pages.map((p) => p.team.team)),
  };
});
const scale = $derived(fit ?? FIT_SCALES.at(-1));
const thumbScale = $derived(thumbWidth > 0 ? thumbWidth / (8.5 * 96) : 0);
const teamName = (team) => (team.noTeam ? sessionText.noTeam : team.team);

function takeRoster(file) {
  roster = file;
  selected = new Set();
}

function pick(team, on) {
  const next = new Set(selected);
  if (on) {
    next.add(team);
  } else {
    next.delete(team);
  }
  selected = next;
}

function pickAll(on) {
  selected = on ? new Set(teams.map((t) => t.team)) : new Set();
}

/** The Select all box shows "some" when some teams, not all, are picked. */
function partly(node) {
  node.indeterminate = somePicked && !allPicked;
}

/** Steps the measuring copy's type down until it fits one page. */
function measure() {
  const node = measurer?.querySelector(".ds-page");
  if (!node) {
    return;
  }
  fit = fitPage(node);
  node.style.removeProperty("--ds-scale");
}

/** What the measuring copy prints that can change its height. */
const measured = $derived(
  [longest.name, longest.team, assessor, termLabel].join("\n")
);

// Measured again whenever `measured` changes, once the copy has redrawn
// (a later change wins), and once the fonts are in.
$effect(() => {
  const what = measured;
  tick().then(() => {
    if (what === measured) {
      measure();
    }
  });
});
$effect(() => {
  document.fonts?.ready.then(measure);
});

/** Prints. The PDF's file name is the document title, as Save as PDF suggests it. */
function print() {
  const before = document.title;
  document.title = printText.documentTitle(termLabel);
  window.addEventListener(
    "afterprint",
    () => {
      document.title = before;
    },
    { once: true }
  );
  window.print();
}

/** The print copy lives under <body>, so sheets.css can print it alone. */
function toBody(node) {
  document.body.append(node);
  return () => node.remove();
}
</script>

<div class="tool not-content">
  <ol class="steps">
    <li class="step" data-number="1">
      <h2>{rosterText.title}</h2>
      <div class="lead"><ClickPath path={rosterText.path} after={rosterText.columns} /></div>
      <FileDrop label={rosterText.drop} fileName={roster?.name ?? ""} onfile={takeRoster} />
      {#if read.error}
        <Callout title={rosterText.unreadable} variant="danger">
          <pre>{read.error}</pre>
        </Callout>
      {:else if read.value}
        <p class="status" role="status">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
          <span><span class="mono">{roster.name}</span>: {rosterText.read(summary)}</span>
        </p>
      {/if}
    </li>

    <li class="step" data-number="2">
      <h2>{sessionText.title}</h2>
      <fieldset class="terms">
        <legend>{sessionText.term}</legend>
        <div class="pills">
          {#each TERMS as option (option)}
            <label class={["pill", { on: term === option }]}>
              <input type="radio" name="defense-term" value={option} bind:group={term} />
              {sessionText.terms[option]}
            </label>
          {/each}
        </div>
      </fieldset>

      <div class="assessor">
        <Field label={sessionText.assessor} help={sessionText.assessorHelp}>
          {#snippet children({ describedby, id })}
            <input {id} type="text" autocomplete="name" aria-describedby={describedby} bind:value={assessor} />
          {/snippet}
        </Field>
      </div>

      <fieldset class="teams">
        <legend>
          {sessionText.teams}
          {#if teams.length > 0}<span class="muted">({sessionText.picked(selected.size, teams.length)})</span>{/if}
        </legend>
        {#if teams.length === 0}
          <p class="muted">{sessionText.empty}</p>
        {:else}
          <ul class="team-list">
            <li class="all">
              <label>
                <input type="checkbox" checked={allPicked} {@attach partly} onchange={(event) => pickAll(event.currentTarget.checked)} />
                <span>{sessionText.all}</span>
              </label>
            </li>
            {#each teams as team (team.team)}
              <li>
                <label>
                  <input type="checkbox" checked={selected.has(team.team)} onchange={(event) => pick(team.team, event.currentTarget.checked)} />
                  <span class="name">{teamName(team)}</span>
                  <span class="muted">{sessionText.members(team.members.length)}</span>
                </label>
              </li>
            {/each}
          </ul>
        {/if}
      </fieldset>
    </li>

    <li class={["step", { locked: pages.length === 0 }]} data-number="3">
      <h2>{printText.title}</h2>
      {#if pages.length === 0}
        <p class="lead">{printText.none}</p>
      {:else}
        <p class="lead">{printText.summary(counts)} {printText.oneSided}</p>
      {/if}
      {#if fit === null}
        <Callout title={printText.overflow.title} variant="caution">
          <p>{printText.overflow.body}</p>
        </Callout>
      {/if}
      <div class="print-row">
        <Button disabled={pages.length === 0} onclick={print}>{printText.button}</Button>
        <Checkbox checked={blankSheets} onchange={(event) => {
          blankSheets = event.currentTarget.checked;
        }}>
          {printText.blank}
        </Checkbox>
      </div>
    </li>
  </ol>

  <aside class="preview" aria-labelledby="defense-preview">
    <h2 id="defense-preview">
      {previewTeam ? previewText.heading(teamName(previewTeam)) : previewText.headingEmpty}
    </h2>
    {#if previewTeam}
      <div class="thumbs">
        <figure>
          <div class="thumb" bind:clientWidth={thumbWidth}>
            {#if thumbScale > 0}
              <div class="paper" aria-hidden="true" inert style:transform="scale({thumbScale})">
                <Cover {assessor} {session} team={previewTeam} term={termLabel} />
              </div>
            {/if}
          </div>
          <figcaption>{previewText.cover}</figcaption>
        </figure>
        <figure>
          <div class="thumb">
            {#if thumbScale > 0}
              <div class="paper" aria-hidden="true" inert style:transform="scale({thumbScale})">
                <LiveSheet {assessor} overflow={fit === null} {scale} {sheet} student={previewTeam.members[0]} team={previewTeam} term={termLabel} />
              </div>
            {/if}
          </div>
          <figcaption>{previewText.sheet(fullName(previewTeam.members[0]))}</figcaption>
        </figure>
      </div>
      <p class="muted">{previewText.shown(2, previewCount)}</p>
    {:else}
      <p class="muted">{previewText.empty}</p>
    {/if}
  </aside>
</div>

<!-- The longest live sheet picked, laid out unseen at full size, for measure(). -->
<div class="measurer not-content" aria-hidden="true" inert bind:this={measurer}>
  <LiveSheet
    {assessor}
    {sheet}
    student={longest.name ? { first: longest.name, last: "" } : null}
    team={{ members: [], noTeam: longest.team === "", team: longest.team }}
    term={termLabel}
  />
</div>

<div class="print-holder">
  <div class="ds-print" {@attach toBody}>
    {#each pages as page (page.id)}
      {#if page.kind === "cover"}
        <Cover {assessor} {session} team={page.team} term={termLabel} />
      {:else}
        <LiveSheet {assessor} overflow={fit === null} {scale} {sheet} student={page.student} team={page.team} term={termLabel} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .tool {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    align-items: flex-start;
    margin-top: 2rem;
  }
  .steps {
    flex: 999 1 30rem;
    min-width: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .preview {
    flex: 1 1 22rem;
    min-width: 0;
  }
  @media (min-width: 72rem) {
    .preview {
      position: sticky;
      inset-block-start: calc(var(--sl-nav-height) + 1rem);
    }
  }

  /* The bullet and guideline, as the submission PDF builder draws them. */
  .step {
    --bullet-size: 2rem;
    position: relative;
    padding-inline-start: calc(var(--bullet-size) + 1.25rem);
    padding-bottom: 2.25rem;
  }
  .step::before {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: var(--bullet-size);
    height: var(--bullet-size);
    font-size: var(--sl-text-sm);
    font-weight: 700;
    line-height: var(--bullet-size);
    color: var(--sl-color-black);
    text-align: center;
    content: attr(data-number);
    background: var(--sl-color-text-accent);
    border-radius: 99rem;
  }
  .step::after {
    position: absolute;
    inset-block: calc(var(--bullet-size) + 0.5rem) 0.5rem;
    inset-inline-start: calc((var(--bullet-size) - 1px) / 2);
    width: 1px;
    content: "";
    background: var(--sl-color-hairline-light);
  }
  .step:last-child {
    padding-bottom: 0;
  }
  .step:last-child::after {
    display: none;
  }
  .locked::before {
    color: var(--sl-color-gray-2);
    background: var(--sl-color-gray-5);
  }
  h2 {
    margin: 0;
    font-size: var(--sl-text-h4);
    line-height: 2rem;
    color: var(--sl-color-white);
  }
  .lead {
    margin: 0.25rem 0 1rem;
    color: var(--sl-color-gray-2);
  }
  .muted {
    font-size: var(--sl-text-sm);
    font-weight: 400;
    color: var(--sl-color-gray-2);
  }
  .mono {
    font-family: var(--__sl-font-mono, ui-monospace, monospace);
    overflow-wrap: anywhere;
  }
  .status {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.75rem 1rem;
    margin: 1rem 0 0;
    color: var(--sl-color-white);
    background: var(--sl-color-green-low);
    border: 1px solid var(--sl-color-green);
    border-radius: 0.5rem;
  }
  .status svg {
    flex: none;
    margin-top: 0.15rem;
    color: var(--sl-color-green-high);
  }

  fieldset {
    padding: 0;
    margin: 0;
    border: 0;
  }
  legend {
    padding: 0;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .terms {
    margin-top: 0.75rem;
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pill {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    min-height: 2.75rem;
    padding: 0 1rem;
    cursor: pointer;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.375rem;
  }
  .pill.on {
    background: var(--sl-color-accent-low);
    border-color: var(--sl-color-text-accent);
  }
  .pill:focus-within {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .assessor {
    margin-top: 1.25rem;
  }
  .assessor :global(input) {
    box-sizing: border-box;
    width: 100%;
    min-height: 2.75rem;
  }
  .teams {
    margin-top: 1.25rem;
  }
  .team-list {
    padding: 0;
    margin: 0;
    overflow: hidden;
    list-style: none;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
  }
  .team-list li + li {
    border-top: 1px solid var(--sl-color-gray-5);
  }
  .team-list label {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-height: 2.75rem;
    padding: 0.4rem 1rem;
    cursor: pointer;
  }
  .team-list input {
    flex: none;
    width: 1.1rem;
    height: 1.1rem;
    margin: 0;
  }
  .team-list .name {
    flex: 1;
    min-width: 0;
  }
  .all {
    font-weight: 600;
    background: var(--sl-color-gray-6);
  }
  .print-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
    align-items: center;
  }

  .preview h2 {
    font-size: var(--sl-text-base);
    color: var(--sl-color-gray-2);
  }
  .thumbs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  figure {
    display: grid;
    gap: 0.4rem;
    margin: 0;
  }
  figcaption {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .thumb {
    position: relative;
    aspect-ratio: 8.5 / 11;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 3px;
    box-shadow: 0 1px 3px rgb(28 25 23 / 0.15);
  }
  .paper {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }
  .preview > .muted {
    margin: 0.75rem 0 0;
  }
  .measurer {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: -200vw;
    visibility: hidden;
    pointer-events: none;
  }
  .print-holder {
    display: contents;
  }
</style>

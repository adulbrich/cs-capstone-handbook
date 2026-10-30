<script>
// The Team scores grid (#611): one row per scored team, one cell per
// criterion, then the team's total and a team-note marker. A cell opens an
// editor under its team's row: the answer as given, the score choices, the
// comment the team reads, and the team note. `teams` is scorePartnerSurvey's
// `teams`, `criteria` the survey rubric's criteria in the same order.
// `onsave(team, criterion, edit, note)` writes one cell's edit (null removes
// it) and the team note; `onrevert(team, criterion)` removes the cell's edit.
// Every string comes from scoreText.teams.
import { tick } from "svelte";
import { scoreText } from "../../../data/partner-tools.mjs";
import { descending, ratingFor } from "../../../lib/tools/rubric-bands.mjs";
import Button from "../ui/Button.svelte";
import Field from "../ui/Field.svelte";

const text = scoreText.teams;

let { criteria, onrevert, onsave, teams } = $props();
const uid = $props.id();

/** The open cell, `{ team, index }`, and the editor's draft of it. */
let open = $state(null);
let draft = $state(null);

const cellId = (t, c) => `${uid}-cell-${t}-${c}`;
const editorId = `${uid}-editor`;

const openEntry = $derived(
  open ? teams.find((entry) => entry.team === open.team) : null
);
const openCell = $derived(openEntry?.cells[open.index] ?? null);
const openCriterion = $derived(open ? criteria[open.index] : null);
const others = $derived(
  openCriterion && openCell
    ? descending(openCriterion).filter(
        (r) => r.points !== openCell.answered.points
      )
    : []
);

/** The draft's points, or null when it keeps the answer's; NaN when invalid. */
const draftPoints = $derived.by(() => {
  if (!draft || draft.choice === "keep") {
    return null;
  }
  if (draft.choice === "custom") {
    const value =
      draft.custom.trim() === "" ? Number.NaN : Number(draft.custom);
    return Number.isFinite(value) &&
      value >= 0 &&
      value <= openCriterion.maxPoints
      ? value
      : Number.NaN;
  }
  return others.find((r) => r.name === draft.choice)?.points ?? Number.NaN;
});
const invalid = $derived(Number.isNaN(draftPoints));
const pointsError = $derived(draft?.choice === "custom" && invalid);

/** A draft from the cell as it stands: its edit, or its answer. */
function draftOf(entry, cell, criterion) {
  const { answered, final } = cell;
  const rating = descending(criterion).find((r) => r.points === final.points);
  let choice = "keep";
  if (final.points !== answered.points) {
    choice = rating ? rating.name : "custom";
  }
  return {
    choice,
    comment: final.comment,
    custom: choice === "custom" ? String(final.points) : "",
    note: entry.note,
  };
}

async function focus(id) {
  await tick();
  document.getElementById(id)?.focus();
}

function toggle(t, c) {
  const entry = teams[t];
  if (open?.team === entry.team && open.index === c) {
    close();
    return;
  }
  open = { index: c, team: entry.team, teamIndex: t };
  draft = draftOf(entry, entry.cells[c], criteria[c]);
  focus(`${editorId}-title`);
}

function close() {
  const back = open && cellId(open.teamIndex, open.index);
  open = null;
  draft = null;
  if (back) {
    focus(back);
  }
}

/**
 * Saves the draft: points and a comment equal to the answer's are kept as
 * null. A cell that changes nothing has no edit, unless it is a neutral
 * answer, whose kept edit is the reviewed mark.
 */
function save(event) {
  event.preventDefault();
  if (invalid) {
    return;
  }
  const { answered, criterion, neutral } = openCell;
  const points =
    draftPoints === null || draftPoints === answered.points
      ? null
      : draftPoints;
  const said = draft.comment.trim();
  const comment = said === answered.comment ? null : said;
  const edit =
    points === null && comment === null && !neutral
      ? null
      : { against: answered, comment, points };
  onsave(open.team, criterion, edit, draft.note.trim());
  close();
}

function revert() {
  onrevert(open.team, openCell.criterion);
  close();
}

function closeOnEscape(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
  }
}
</script>

<div class="not-content teams">
  <div class="scroll-x">
    <table>
      <caption class="visually-hidden">{text.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{text.teamColumn}</th>
          {#each criteria as criterion (criterion.title)}
            <th scope="col">{criterion.title}</th>
          {/each}
          <th scope="col">{text.totalColumn}</th>
          <th scope="col">{text.noteColumn}</th>
        </tr>
      </thead>
      <tbody>
        {#each teams as entry, t (entry.team)}
          <tr>
            <th scope="row">{entry.team}</th>
            {#each entry.cells as cell, c (cell.criterion)}
              {@const expanded = open?.team === entry.team && open.index === c}
              <td class={{ review: cell.review }}>
                <button
                  type="button"
                  class={["cell", { expanded }]}
                  id={cellId(t, c)}
                  aria-expanded={expanded}
                  aria-controls={expanded ? editorId : undefined}
                  onclick={() => toggle(t, c)}
                >
                  <span class="visually-hidden">{text.open(entry.team, cell.criterion)}:</span>
                  <span class="points">
                    {#if cell.final.points !== cell.answered.points}
                      <span class="visually-hidden">{text.was}</span> <s>{cell.answered.points}</s>
                      <span class="visually-hidden">{text.now}</span>
                    {/if}
                    {cell.final.points}
                  </span>
                  <span class="rating">{cell.final.rating}</span>
                  <span class="marks">
                    {#if entry.responded && cell.answered.comment !== ""}
                      <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M2 2.5h12v8.5H6.5L3.5 14v-3H2z" />
                      </svg>
                      <span class="visually-hidden">{text.hasComment}</span>
                    {/if}
                    {#if cell.review}
                      <span class="mark to-review">{text.review}</span>
                    {:else if cell.edited}
                      <span class="mark edited">{text.edited}</span>
                    {:else if cell.reviewed}
                      <span class="mark reviewed">{text.reviewed}</span>
                    {/if}
                  </span>
                </button>
              </td>
            {/each}
            <td class="total">{entry.total}</td>
            <td>
              {#if entry.note}
                <svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M3.5 1.5h6l3 3v10h-9z M5.5 7.5h5 M5.5 10.5h5" />
                </svg>
                <span class="visually-hidden">{text.noted}</span>
              {/if}
            </td>
          </tr>
          {#if openEntry?.team === entry.team && openCell}
            <tr class="editor-row">
              <td colspan={criteria.length + 3}>
                {@render editor(openEntry, openCell, openCriterion)}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#snippet answer(score, comment, responded)}
  <dd>
    {#if !responded}{text.noResponse}{/if}
    {text.scoreLine(score)}
  </dd>
  <dt>{text.partnerComment}</dt>
  <dd class="said">{comment || text.noComment}</dd>
{/snippet}

{#snippet editor(entry, cell, criterion)}
  <!-- Escape closes the editor and returns focus to its cell. -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <section
    class="editor"
    id={editorId}
    aria-labelledby="{editorId}-title"
    onkeydown={closeOnEscape}
  >
    <h4 id="{editorId}-title" tabindex="-1">{text.editor(entry.team, cell.criterion)}</h4>
    {#if cell.stale}
      <p class="changed">{text.changed}</p>
      <dl>
        <dt>{text.against}</dt>
        {@render answer(cell.against, cell.against.comment, true)}
      </dl>
    {/if}
    <dl>
      <dt>{text.answer}</dt>
      {@render answer(cell.answered, cell.answered.comment, entry.responded)}
    </dl>
    <form onsubmit={save}>
      <fieldset class="choices">
        <legend>{text.score.legend}</legend>
        <label class="option">
          <input
            type="radio"
            name="{editorId}-score"
            checked={draft.choice === "keep"}
            onchange={() => (draft.choice = "keep")}
          />
          {text.score.keep(cell.answered)}
        </label>
        {#each others as rating (rating.name)}
          <label class="option">
            <input
              type="radio"
              name="{editorId}-score"
              checked={draft.choice === rating.name}
              onchange={() => (draft.choice = rating.name)}
            />
            {text.score.rating({ points: rating.points, rating: rating.name })}
          </label>
        {/each}
        <div class="option custom">
          <label>
            <input
              type="radio"
              name="{editorId}-score"
              checked={draft.choice === "custom"}
              onchange={() => (draft.choice = "custom")}
            />
            {text.score.custom}
          </label>
          <input
            type="number"
            min="0"
            max={criterion.maxPoints}
            step="any"
            inputmode="decimal"
            aria-label={text.score.custom}
            aria-describedby={pointsError
              ? `${editorId}-points-help ${editorId}-points-error`
              : `${editorId}-points-help`}
            aria-invalid={pointsError}
            value={draft.custom}
            onfocus={() => (draft.choice = "custom")}
            oninput={(event) => (draft.custom = event.currentTarget.value)}
          />
        </div>
        <p class="help" id="{editorId}-points-help">
          {text.score.customHelp(criterion.maxPoints)}
          {#if draft.choice === "custom" && !invalid}
            {text.score.named(ratingFor(criterion, draftPoints))}
          {/if}
        </p>
        {#if pointsError}
          <p class="error" id="{editorId}-points-error">
            {text.score.customError(criterion.maxPoints)}
          </p>
        {/if}
      </fieldset>

      <Field label={text.comment.label} help={text.comment.help}>
        {#snippet children({ describedby, id })}
          <textarea
            {id}
            aria-describedby={describedby}
            rows="3"
            value={draft.comment}
            oninput={(event) => (draft.comment = event.currentTarget.value)}
          ></textarea>
        {/snippet}
      </Field>
      <p class="reset">
        <Button
          variant="link"
          disabled={draft.comment.trim() === cell.answered.comment}
          onclick={() => (draft.comment = cell.answered.comment)}
        >
          {text.comment.reset(entry.responded)}
        </Button>
      </p>

      <Field label={text.note.label} help={text.note.help}>
        {#snippet children({ describedby, id })}
          <textarea
            {id}
            aria-describedby={describedby}
            rows="2"
            value={draft.note}
            oninput={(event) => (draft.note = event.currentTarget.value)}
          ></textarea>
        {/snippet}
      </Field>

      <div class="actions">
        <Button type="submit" disabled={invalid}>{text.save}</Button>
        {#if cell.against}
          <Button variant="secondary" onclick={revert}>{text.revert}</Button>
        {/if}
        <Button variant="secondary" onclick={close}>{text.close}</Button>
      </div>
    </form>
  </section>
{/snippet}

<style>
  .teams {
    margin-top: 0.5rem;
  }
  /* A wide grid scrolls inside its own box, never the page; the editor
     stays at the box's width (cqi) wherever the grid is scrolled. */
  .scroll-x {
    max-width: 100%;
    overflow-x: auto;
    container-type: inline-size;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--sl-text-sm);
  }
  /* Words stay whole: a long one widens its column and the grid scrolls. */
  th,
  td {
    padding: 0.35rem 0.4rem;
    border-bottom: 1px solid var(--sl-color-hairline-light);
    overflow-wrap: normal;
    word-break: normal;
    text-align: start;
    vertical-align: top;
  }
  thead th {
    color: var(--sl-color-white);
    vertical-align: bottom;
  }
  tbody th {
    font-weight: 600;
  }
  .total {
    font-variant-numeric: tabular-nums;
  }
  td.review {
    background: var(--sl-color-orange-low);
  }
  .cell {
    display: grid;
    gap: 0.1rem;
    width: 100%;
    min-width: 6rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.375rem;
    background: transparent;
    color: var(--sl-color-white);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cell:hover {
    border-color: var(--sl-color-text-accent);
  }
  .cell.expanded {
    border-color: var(--sl-color-text-accent);
    background: var(--sl-color-accent-low);
  }
  .review .cell {
    border-color: var(--sl-color-orange);
  }
  .cell:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .points {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .points s {
    font-weight: 400;
    color: var(--sl-color-gray-3);
  }
  .rating {
    color: var(--sl-color-gray-2);
  }
  .marks {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    min-height: 1.1rem;
  }
  .icon {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  .mark {
    padding: 0 0.35rem;
    border: 1px solid;
    border-radius: 0.25rem;
    font-size: var(--sl-text-xs);
    line-height: 1.4;
  }
  .to-review {
    border-color: var(--sl-color-orange);
    color: var(--sl-color-orange-high);
  }
  .edited {
    border-color: var(--sl-color-text-accent);
    color: var(--sl-color-text-accent);
  }
  .reviewed {
    border-color: var(--sl-color-green);
    color: var(--sl-color-green-high);
  }
  .editor-row > td {
    padding: 0.5rem 0 1rem;
  }
  .editor {
    position: sticky;
    inset-inline-start: 0;
    box-sizing: border-box;
    display: grid;
    gap: 0.75rem;
    max-width: min(44rem, 100cqi);
    padding: 0.75rem 1rem 1rem;
    border: 1px solid var(--sl-color-text-accent);
    border-radius: 0.5rem;
    font-size: var(--sl-text-sm);
  }
  .editor h4 {
    margin: 0;
    font-size: var(--sl-text-base);
    color: var(--sl-color-white);
  }
  .editor h4:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .changed {
    margin: 0;
    padding: 0.35rem 0.6rem;
    border-inline-start: 3px solid var(--sl-color-orange);
    background: var(--sl-color-orange-low);
    color: var(--sl-color-orange-high);
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.25rem 0.75rem;
    margin: 0;
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin: 0;
  }
  .said {
    white-space: pre-wrap;
  }
  form {
    display: grid;
    gap: 0.75rem;
  }
  .choices {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    border: 0;
  }
  legend {
    margin-bottom: 0.25rem;
    padding: 0;
    font-weight: 600;
  }
  .option,
  .custom label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .custom {
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }
  input[type="number"],
  textarea {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-white);
    font: inherit;
  }
  input[type="number"] {
    width: 7rem;
  }
  input[aria-invalid="true"] {
    border-color: var(--sl-color-red);
  }
  textarea {
    width: 100%;
    resize: vertical;
  }
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 1px;
  }
  .help,
  .error,
  .reset {
    margin: 0;
    font-size: var(--sl-text-sm);
  }
  .help {
    color: var(--sl-color-gray-2);
  }
  .error {
    color: var(--sl-color-red-high);
  }
  .reset {
    margin-top: -0.5rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
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

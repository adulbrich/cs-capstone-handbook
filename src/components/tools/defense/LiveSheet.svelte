<script>
// One student's live sheet, the same in the preview, the measuring copy,
// and on paper: the name, team, assessor, and total; the banner with the
// tick rule, the points, and the Missing rule; then each criterion's
// question, its items to tick, its red flags, its band row, and a notes
// line. The rubric's text comes from `sheet` (liveSheet in
// defense-sheets.mjs), word for word. `student` null is a blank sheet with
// the name written in. Each criterion's two columns share the width by
// their text (columnShares). `scale` steps the type down to fit one page, and
// `overflow` lets a sheet that fits at no scale run onto a second page.
import { sheetText as text } from "../../../data/defense-scoresheets.mjs";
import {
  bandRow,
  columnShares,
  fullName,
} from "../../../lib/tools/defense-sheets.mjs";

let {
  assessor = "",
  overflow = false,
  scale,
  sheet,
  student = null,
  team,
  term,
} = $props();

const bands = $derived(bandRow(sheet.rule));
/** Each criterion's items and red flags columns, sized by their text. */
const columns = $derived(
  sheet.criteria.map((criterion) => {
    const [items, flags] = columnShares(criterion);
    return `minmax(0, ${items}fr) minmax(0, ${flags}fr)`;
  })
);
</script>

<article class={["ds-page", "ds-sheet", { "ds-overflow": overflow }]} style:--ds-scale={scale}>
  <header class="ds-head">
    <div class="ds-title">
      <span class="ds-eyebrow">{text.eyebrow}</span>
      <h1>
        {#if student}{fullName(student)}{:else}<span class="ds-blank ds-blank-name"></span>{/if}
      </h1>
    </div>
    <div class="ds-side">
      <div class="ds-who">
        {#if team.noTeam}<span class="ds-blank"></span>{text.teamBlank(term)}{:else}{text.team(team.team, term)}{/if}<br />
        {text.assessor}: {#if assessor}{assessor}{:else}<span class="ds-blank"></span>{/if}
      </div>
      <div class="ds-total">
        <span class="ds-total-label">{text.total}</span>
        <span class="ds-total-value"><span class="ds-blank ds-blank-total"></span> / {sheet.total}</span>
      </div>
    </div>
  </header>

  <div class="ds-line">
    <span class="ds-label">{text.artifact}</span>
    <span class="ds-fill"></span>
    <span class="ds-label">{text.sprint}</span>
    <span class="ds-fill ds-short"></span>
    <span><span class="ds-label">{text.record}:</span> {text.recordChoices}</span>
    <span><span class="ds-label">{text.followUp}:</span> {text.yesNo}</span>
  </div>

  <div class="ds-banner">
    <strong>{text.tick(sheet.rule)}</strong>
    <span>{text.points(sheet.rule)}</span>
    <span>{text.missing(sheet.rule)}</span>
  </div>

  {#each sheet.criteria as criterion, i (criterion.title)}
    <section class="ds-criterion">
      <div class="ds-criterion-head">
        <h2>
          <span class="ds-number">{i + 1}</span>
          {criterion.title}
          {#if criterion.tags.length > 0}<span class="ds-tags">{criterion.tags.join(", ")}</span>{/if}
        </h2>
        <span class="ds-bands">
          {#each bands as band (band.key)}<span class="ds-band">{text.band(band.key, band.points)}</span>{/each}
        </span>
      </div>
      <p class="ds-question">{criterion.question}</p>
      <div class="ds-lists" style:grid-template-columns={columns[i]}>
        <ul class="ds-items">
          {#each criterion.items as item (item.label)}
            <li>
              <span class="ds-box"></span>
              <span><b>{item.label}:</b> <span class="ds-text">{item.text}</span></span>
            </li>
          {/each}
        </ul>
        <div class="ds-flags">
          <span class="ds-flags-title">{text.flags}</span>
          <ul>
            {#each criterion.flags as flag (flag.label)}
              <li>
                <svg class="ds-cross" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
                <span><b>{flag.label}:</b> {flag.text}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="ds-notes">
        <span class="ds-label">{text.notes}</span>
        <span class="ds-fill"></span>
      </div>
    </section>
  {/each}
</article>

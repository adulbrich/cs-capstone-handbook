<script>
// One team's session cover, the same in the preview and on paper: the team,
// the term and session length, the assessor, room, and start time, the
// protocol checklist, the session table, the absence and follow-up rules,
// and lined space for notes. The table has a row per student, then a blank
// one, and its Order column is empty: the speaking order is drawn at the
// start of the session and never printed (coverRows in defense-sheets.mjs).
import { coverText as text } from "../../../data/defense-scoresheets.mjs";
import {
  coverRows,
  sessionMinutes,
} from "../../../lib/tools/defense-sheets.mjs";

let { assessor = "", session, team, term } = $props();

const rows = $derived(coverRows(team));
const minutes = $derived(sessionMinutes(team.members.length, session));
</script>

<article class="ds-page ds-cover">
  <header class="ds-head">
    <div class="ds-title">
      <span class="ds-eyebrow">{text.eyebrow}</span>
      <h1>
        {#if team.noTeam}<span class="ds-blank ds-blank-team"></span>{:else}{team.team}{/if}
      </h1>
    </div>
    <div class="ds-side">
      {term}<br />
      {text.length(team.members.length, minutes)}
    </div>
  </header>

  <div class="ds-fields">
    <div>
      <span class="ds-label">{text.assessor}</span>
      <span class="ds-value">{assessor}</span>
    </div>
    <div>
      <span class="ds-label">{text.room}</span>
      <span class="ds-value"></span>
    </div>
    <div>
      <span class="ds-label">{text.start}</span>
      <span class="ds-value"></span>
    </div>
  </div>

  <div class="ds-checklist">
    <strong>{text.checklistTitle}</strong>
    <ul>
      {#each text.checklist as line (line)}
        <li><span class="ds-box"></span><span>{line}</span></li>
      {/each}
    </ul>
  </div>

  <table class="ds-table">
    <caption>{text.tableTitle}</caption>
    <thead>
      <tr>
        <th scope="col" class="ds-student">{text.columns.student}</th>
        <th scope="col" class="ds-narrow">{text.columns.order}</th>
        <th scope="col">{text.columns.artifact}</th>
        <th scope="col">{text.columns.question}</th>
        <th scope="col" class="ds-narrow">{text.columns.sprint}</th>
        <th scope="col" class="ds-yesno">{text.columns.followUp}</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <tr>
          <th scope="row" class={{ "ds-unlisted": row.name === "" }}>{row.name || text.notOnRoster}</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="ds-yesno">{text.yesNo}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="ds-rules">
    <span>{text.absent}</span>
    <span>{text.followUp}</span>
  </div>

  <div class="ds-session-notes">
    <strong>{text.notes}</strong>
    <div class="ds-ruled"></div>
  </div>

  <footer class="ds-foot">
    <span>{text.entered}</span>
    <span>{text.footer(team.team)}</span>
  </footer>
</article>

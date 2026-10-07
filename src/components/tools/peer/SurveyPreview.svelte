<script>
// The survey's pages as one student sees them, from surveyPages
// (src/lib/tools/survey-pages.mjs), which reads the same object the .qsf is
// written from. The answers are drawn disabled: it is a picture, not a
// form. Question HTML comes from the survey's own wording with every piped
// value escaped.
let { pages } = $props();
</script>

<!-- A scrolling region takes focus so the keyboard can scroll it. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="survey" role="region" aria-label="Survey preview" tabindex="0">
  {#each pages as page, p (p)}
    <section class="page" aria-label="Page {p + 1} of {pages.length}">
      <p class="page-title">Page {p + 1} of {pages.length}: {@html page.title}</p>
      {#each page.questions as question, q (q)}
        <div class="question">
          <div class="text">
            {@html question.html}{#if question.forced}<span class="forced" title="Required"> *</span>{/if}
          </div>
          {#if question.kind === "single" || question.kind === "multiple"}
            <ul class="choices">
              {#each question.choices as choice (choice.id)}
                <li>
                  <input
                    type={question.kind === "single" ? "radio" : "checkbox"}
                    disabled
                    aria-hidden="true"
                  />
                  <span>{@html choice.html}</span>
                </li>
              {/each}
            </ul>
          {:else if question.kind === "matrix"}
            <div class="matrix">
              <table>
                <thead>
                  <tr>
                    <th scope="col"><span class="visually-hidden">Criterion</span></th>
                    {#each question.columns as column, c (c)}<th scope="col">{column}</th>{/each}
                  </tr>
                </thead>
                <tbody>
                  {#each question.rows as row, r (r)}
                    <tr>
                      <th scope="row">{row}</th>
                      {#each question.columns as _, c (c)}
                        <td><input type="radio" disabled aria-hidden="true" /></td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else if question.kind === "essay"}
            <textarea disabled rows="3" aria-hidden="true"></textarea>
          {:else if question.kind === "line"}
            <input type="text" disabled aria-hidden="true" />
          {:else if question.kind === "split"}
            <ul class="split">
              {#each question.choices as choice (choice.id)}
                <li>
                  <span>{@html choice.html}</span>
                  <input type="text" disabled size="4" aria-hidden="true" />
                </li>
              {/each}
              <li class="total"><span>Total</span><span>{question.total}</span></li>
            </ul>
          {/if}
        </div>
      {/each}
    </section>
  {/each}
</div>

<style>
  .survey {
    display: grid;
    gap: 1rem;
    max-height: 40rem;
    overflow: auto;
    padding: 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    background: var(--sl-color-gray-7, var(--sl-color-bg));
  }
  .survey:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .page {
    margin: 0;
    padding: 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.375rem;
    background: var(--sl-color-bg);
  }
  .page-title {
    margin: 0 0 0.5rem;
    font-size: var(--sl-text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sl-color-gray-3);
  }
  .question {
    margin-top: 1rem;
  }
  .question:first-of-type {
    margin-top: 0;
  }
  .text {
    margin-bottom: 0.5rem;
  }
  .forced {
    color: var(--sl-color-red-high);
  }
  .choices,
  .split {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .choices li {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    margin: 0;
  }
  .split li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    max-width: 32rem;
    margin: 0;
  }
  .split .total {
    border-top: 1px solid var(--sl-color-gray-5);
    padding-top: 0.25rem;
    font-weight: 600;
  }
  .matrix {
    overflow-x: auto;
  }
  .matrix table {
    display: table;
    width: 100%;
    margin: 0;
    font-size: var(--sl-text-xs);
  }
  .matrix thead th {
    min-width: 6rem;
    overflow-wrap: normal;
    word-break: normal;
  }
  .matrix td {
    text-align: center;
  }
  textarea,
  input[type="text"] {
    width: 100%;
    max-width: 32rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.25rem;
    background: transparent;
  }
  .split input[type="text"] {
    width: 4rem;
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

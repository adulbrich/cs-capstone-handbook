<script>
// A choice of one, as cards: a <fieldset> and <legend> around native
// radios, so the arrow keys move between them and a screen reader names the
// group. Each option is `{ value, label, lines }`, `lines` the sentences
// under its label.
let { legend, name, onchange, options, value = $bindable() } = $props();
</script>

<fieldset class="cards">
  <legend>{legend}</legend>
  {#each options as option (option.value)}
    <label class="card">
      <input type="radio" {name} value={option.value} bind:group={value} {onchange} />
      <span class="text">
        <span class="title">{option.label}</span>
        {#each option.lines ?? [] as line (line)}
          <span class="line">{line}</span>
        {/each}
      </span>
    </label>
  {/each}
</fieldset>

<style>
  .cards {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }
  legend {
    margin-bottom: 0.5rem;
    padding: 0;
    font-weight: 600;
  }
  .card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    cursor: pointer;
  }
  .card:has(input:checked) {
    border-color: var(--sl-color-text-accent);
    background: var(--sl-color-accent-low);
  }
  .card:has(input:focus-visible) {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  input {
    margin: 0.3rem 0 0;
  }
  .text {
    display: grid;
    gap: 0.15rem;
  }
  .title {
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .line {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>

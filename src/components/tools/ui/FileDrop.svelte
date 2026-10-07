<script>
// A file input inside a drop zone. The <label> wraps a native
// <input type="file">, so the keyboard reaches it with Tab and opens it with
// Enter or Space, and a file dropped anywhere on the zone is read the same
// way. The file is read in the browser and handed to `onfile` as
// `{ name, text }`; nothing is uploaded. `fileName` is the file in use.
let { accept = ".csv,text/csv", fileName = "", label, onfile } = $props();
let dragging = $state(false);
let error = $state("");

async function take(file) {
  if (!file) {
    return;
  }
  try {
    onfile({ name: file.name, text: await file.text() });
    error = "";
  } catch {
    error = `${file.name} could not be read as text.`;
  }
}

async function picked(event) {
  const input = event.currentTarget;
  await take(input.files?.[0]);
  // Cleared, so picking the same file again after an edit reads it again.
  input.value = "";
}

function dropped(event) {
  event.preventDefault();
  dragging = false;
  take(event.dataTransfer?.files?.[0]);
}
</script>

<label
  class={["drop", { dragging, loaded: fileName !== "" }]}
  ondragenter={(event) => {
    event.preventDefault();
    dragging = true;
  }}
  ondragover={(event) => event.preventDefault()}
  ondragleave={() => {
    dragging = false;
  }}
  ondrop={dropped}
>
  <span class="label">{label}</span>
  <span class="hint">
    {#if fileName}
      In use: <strong>{fileName}</strong>. Drop or choose another file to
      replace it.
    {:else}
      Drop the file here, or choose it.
    {/if}
  </span>
  <input type="file" {accept} onchange={picked} />
  {#if error}<span class="error" role="alert">{error}</span>{/if}
</label>

<style>
  .drop {
    display: grid;
    gap: 0.4rem;
    padding: 1rem;
    border: 2px dashed var(--sl-color-gray-4);
    border-radius: 0.5rem;
    background: var(--sl-color-gray-7, var(--sl-color-bg));
    cursor: pointer;
  }
  .drop:focus-within {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .dragging {
    border-color: var(--sl-color-text-accent);
    background: var(--sl-color-accent-low);
  }
  .loaded {
    border-style: solid;
  }
  .label {
    font-weight: 600;
  }
  .hint {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  input {
    font: inherit;
    font-size: var(--sl-text-sm);
  }
  .error {
    color: var(--sl-color-red-high);
    font-size: var(--sl-text-sm);
  }
</style>

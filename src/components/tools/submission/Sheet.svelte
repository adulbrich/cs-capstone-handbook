<script>
// One printed sheet: the cover lines when it is the first (the title, the
// date the PDF is made, the project, the authors, any more lines the
// student wrote in Markdown), then a file's
// HTML, already sanitized by render.js. The preview and the print copy both
// draw it, so what the preview shows is what prints. `copy` names this copy,
// which gives its diagrams ids of their own (copyIds in render.js).
import { copyIds } from "./render.js";

let { copy, cover = null, html = "" } = $props();
</script>

<div class="submission-doc">
  {#if cover}
    <header class="cover">
      <h1>{cover.title}</h1>
      <p>{cover.date}</p>
      <p>{cover.project}</p>
      <p>{cover.authors}</p>
      {#if cover.more}
        <div class="more">{@html copyIds(cover.more, copy)}</div>
      {/if}
    </header>
  {/if}
  <!-- Sanitized with DOMPurify in render.js; the diagrams are Mermaid's own strict output. -->
  {@html copyIds(html, copy)}
</div>

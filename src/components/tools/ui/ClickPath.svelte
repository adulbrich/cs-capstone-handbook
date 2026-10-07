<script>
// Where to click, as "In Canvas: People › ... › Download Course Roster CSV",
// each click in bold. `path` is `{ app, steps }` (src/data/click-paths.mjs);
// `after` continues the sentence, its punctuation included.
let { after = ".", path } = $props();
</script>

<p>
  In {path.app}:
  {#each path.steps as step, i (step)}{#if i > 0}{" › "}{/if}<strong
      >{step}</strong
    >{/each}{after}
</p>

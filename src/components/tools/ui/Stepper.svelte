<script>
// The numbered list of steps. Each child is a <Step>, which draws its own
// bullet and guideline; the look is copied from Starlight's `.sl-steps`
// (Steps.astro), which ships only on pages that use <Steps> and is not
// public API, so recheck it after a Starlight upgrade.
let { children, label } = $props();
</script>

<ol class="stepper" aria-label={label}>
  {@render children()}
</ol>

<style>
  .stepper {
    list-style: none;
    margin: 1.5rem 0 0;
    padding-inline-start: 0;
  }
</style>

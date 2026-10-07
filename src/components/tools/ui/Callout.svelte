<script>
// A note, tip, caution, or error, drawn with Starlight's own aside classes
// so it matches the asides on the handbook pages. `.starlight-aside` is not
// public Starlight API: recheck the tools pages after a Starlight upgrade.
// A "danger" callout is an alert, announced when it appears.
let { children, title, variant = "note" } = $props();
</script>

<aside
  class={["starlight-aside", `starlight-aside--${variant}`, "callout"]}
  aria-label={title}
  role={variant === "danger" ? "alert" : undefined}
>
  <p class="starlight-aside__title">{title}</p>
  <div class="starlight-aside__content">{@render children()}</div>
</aside>

<style>
  .callout {
    margin-block: 1rem 0;
  }
  .callout :global(pre) {
    white-space: pre-wrap;
    background: none;
    border: 0;
    padding: 0;
  }
</style>

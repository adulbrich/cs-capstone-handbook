// Inlined into every page's <head> by astro.config.mjs, for the tabs synced
// on `syncKey="terms"`: the Schedule (introduction/schedule.mdx) and the
// partner evaluation rubrics (assignments/project-partner-evaluation.mdx).
// Their tab labels must stay exactly Fall, Winter, Spring.
(() => {
  // Starlight 0.42 restores synced tabs from this localStorage key before
  // first paint (user-components/Tabs.astro); the value is the tab label.
  const storedTerm = "starlight-synced-tabs__terms";
  // sessionStorage is per browser tab, so each new tab opens on the current
  // term, and a term the reader picks holds for the rest of that tab.
  const defaulted = "handbook-term-defaulted";

  // The current term from the month alone, so no date is ever written down
  // (AGENTS.md, hard rule 5). getMonth() is 0-based: January to March is
  // winter, April to June spring, July to December fall.
  const currentTerm = () => {
    const month = new Date().getMonth();
    if (month < 3) {
      return "Winter";
    }
    return month < 6 ? "Spring" : "Fall";
  };

  try {
    if (!sessionStorage.getItem(defaulted)) {
      localStorage.setItem(storedTerm, currentTerm());
      sessionStorage.setItem(defaulted, "true");
    }
  } catch {
    // Storage blocked: the first tab (Fall) shows, as without this script.
  }

  // A link into another term's panel, such as a search hit on "Week 3" in
  // winter, opens that tab before scrolling; a hidden heading has no place
  // to scroll to.
  const revealTarget = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    const panel = target?.closest('[role="tabpanel"]');
    if (!panel?.hidden) {
      return;
    }
    const tabs = panel.parentElement;
    const index = [
      ...tabs.querySelectorAll(':scope > [role="tabpanel"]'),
    ].indexOf(panel);
    tabs.querySelectorAll('[role="tab"]')[index]?.click();
    target.scrollIntoView();
  };
  addEventListener("DOMContentLoaded", revealTarget);
  addEventListener("hashchange", revealTarget);
})();

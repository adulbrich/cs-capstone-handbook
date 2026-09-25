// Inlined into every page's <head> by astro.config.mjs, for the tabs synced
// on `syncKey="terms"`: the Schedule (introduction/schedule.mdx) and the
// partner evaluation rubrics (assignments/project-partner-evaluation.mdx).
// Their tab labels must stay exactly Fall, Winter, Spring.
(() => {
  // Starlight 0.42 restores synced tabs from this localStorage key before
  // first paint (user-components/Tabs.astro); the value is the tab label.
  const termKey = "starlight-synced-tabs__terms";
  // sessionStorage is per browser tab, so each new tab opens on the current
  // term, and a term the reader picks holds for the rest of that tab.
  const defaultedKey = "handbook-term-defaulted";

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
    if (!sessionStorage.getItem(defaultedKey)) {
      localStorage.setItem(termKey, currentTerm());
      sessionStorage.setItem(defaultedKey, "true");
    }
  } catch {
    // Storage blocked: the first tab (Fall) shows, as without this script.
  }

  // A link into another term's panel, such as a search hit on "Week 3" in
  // winter, opens that tab before scrolling; a hidden heading has no place
  // to scroll to. Clicking the tab runs Starlight's own switch, so following
  // the link counts as picking that term for the rest of the browser tab.
  const revealTarget = () => {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = id ? document.getElementById(id) : null;
    const panel = target?.closest('[role="tabpanel"]');
    if (!panel?.hidden) {
      return;
    }
    const tabSet = panel.parentElement;
    const index = [
      ...tabSet.querySelectorAll(':scope > [role="tabpanel"]'),
    ].indexOf(panel);
    tabSet.querySelectorAll('[role="tab"]')[index]?.click();
    target.scrollIntoView();
  };
  addEventListener("DOMContentLoaded", revealTarget);
  addEventListener("hashchange", revealTarget);
})();

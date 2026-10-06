// The Activities sidebar group, listed page by page. Read by
// `astro.config.mjs`, which renders it, and by
// `scripts/validate-sidebar.mjs`, which fails when a page under
// `src/content/docs/activities/` is missing from it or listed twice. An
// explicit list ignores `sidebar.order`, so a new activity page appears in
// the sidebar only once it is added here.
//
// One flat list: the project pages in the order a project first needs them,
// then the two pages about the student rather than the project. Each label
// comes from the page title.

/** Activity pages, in sidebar order. */
const PAGES = [
  "introduction",
  "team-and-workflow",
  "planning-and-risk",
  "requirements",
  "working-with-users",
  "ideation",
  "research-methods",
  "technical-design",
  "interaction-design",
  "testing-release-and-handoff",
  "presenting",
  "learning-and-reflection",
  "career",
];

/** The Activities group as Starlight's sidebar config takes it. */
export const activitiesSidebar = {
  items: PAGES.map((page) => ({ slug: `activities/${page}` })),
  label: "Activities",
};

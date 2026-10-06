// The Activities sidebar group, listed page by page. Read by
// `astro.config.mjs`, which renders it, and by
// `scripts/validate-sidebar.mjs`, which fails when a page under
// `src/content/docs/activities/` is missing from it or listed twice. An
// explicit list ignores `sidebar.order`, so a new activity page appears in
// the sidebar only once it is added here.
//
// Project practice is in first-use order; Growth holds the two pages about
// the student rather than the project. Each label comes from the page title.

/** Project-practice pages, in the order a project first needs them. */
const PROJECT_PRACTICE = [
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
];

/** Growth pages. */
const GROWTH = ["learning-and-reflection", "career"];

const item = (page) => ({ slug: `activities/${page}` });

/** The Activities group as Starlight's sidebar config takes it. */
export const activitiesSidebar = {
  items: [
    item("introduction"),
    { items: PROJECT_PRACTICE.map(item), label: "Project practice" },
    { items: GROWTH.map(item), label: "Growth" },
  ],
  label: "Activities",
};

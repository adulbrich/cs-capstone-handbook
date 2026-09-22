/**
 * External destinations the handbook links to more than once. One edit here
 * moves every call site; pages import `portal` and never hold the URL.
 */
export const portal = {
  /** Browse the published project catalog. */
  browse: "https://capstone.eecs.oregonstate.edu/projects",
  /** The project portal home: catalog, proposals, archived projects. */
  home: "https://capstone.eecs.oregonstate.edu/",
  /** The hardware inventory teams borrow from. */
  inventory: "https://capstone.eecs.oregonstate.edu/inventory",
  /** Propose a project. */
  submit: "https://capstone.eecs.oregonstate.edu/projects/new",
} as const;

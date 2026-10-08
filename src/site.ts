/**
 * External destinations the handbook links to more than once. One edit here
 * moves every call site; pages import `portal` and never hold the URL.
 */
export const portal = {
  /** Browse the published project catalog. */
  browse: "https://capstone.eecs.oregonstate.edu/projects",
  /** The catalog with the CS 46x program selected, for the week 0 deck. */
  browseCs46x:
    "https://capstone.eecs.oregonstate.edu/projects?program=33e81dca-7f86-431e-a0c1-6d649bcb9d9b",
  /** The project portal home: catalog, proposals, archived projects. */
  home: "https://capstone.eecs.oregonstate.edu/",
  /** The hardware inventory teams borrow from. */
  inventory: "https://capstone.eecs.oregonstate.edu/inventory",
  /** Propose a project. */
  submit: "https://capstone.eecs.oregonstate.edu/projects/new",
} as const;

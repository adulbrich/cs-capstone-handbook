// Which assignments each activity prepares, and which activities run as
// workshops, read from the assignment pages. Shared by
// `src/components/ActivityMeta.astro`, which renders an activity's badge line
// from it, and `scripts/validate-activities.mjs`, which computes tiers from
// it, so the badge a student sees and the tier the validator checks are the
// same fact read once.
//
// The functions take raw MDX: the component passes the docs collection's
// `entry.body`, the validator the files it reads with `fs`.

/** The section on an assignment page that links the activities it needs. */
export const PREP_HEADING = "Activities That Prepare This";

/** The page whose `### Workshop N:` sections name the workshop activities. */
export const WORKSHOP_PAGE_ID = "assignments/workshop-activities";

/** The values an activity's `effort` may take, smallest first. */
export const EFFORT_SCALE = [
  "15 min",
  "30 min",
  "1 h",
  "1 to 2 h",
  "Half day",
  "Multi-day",
  "Ongoing",
];

/** A link to an activity: its page, then its heading's anchor. */
export const ACTIVITY_LINK_RE = /\/activities\/([a-z-]+)\/#([\w-]+)/g;

// The assignment page heads its term sections "## Fall", "## Winter",
// "## Spring", and each workshop under them "### Workshop N: Title".
const TERM_HEADING_RE = /^## (Fall|Winter|Spring)\b/;
const WORKSHOP_HEADING_RE = /^### (Workshop (\d+): .+)$/;
const SLUG_DROP_RE = /[^\p{L}\p{M}\p{N}\p{Pc} -]/gu;

/**
 * A heading's anchor, as github-slugger (and so Starlight) derives it:
 * lowercased, punctuation dropped, and each space a hyphen. Runs of hyphens
 * are kept, so "Is / Is-Not" is `is--is-not`.
 */
export function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(SLUG_DROP_RE, "")
    .replace(/ /g, "-");
}

/** The anchor every Prepares badge links on its assignment page. */
export const PREP_ANCHOR = slugify(PREP_HEADING);

/** An activity's key: `page#anchor`, as `requirements#lean-canvas`. */
export const activityKey = (page, anchor) => `${page}#${anchor}`;

/**
 * The keys of the activities an assignment's "Activities That Prepare This"
 * section links, in order, without repeats. The section ends at the next
 * `## ` heading; a page without the section prepares nothing.
 */
export function preparedActivities(body) {
  const lines = body.split("\n");
  const start = lines.indexOf(`## ${PREP_HEADING}`);
  if (start === -1) {
    return [];
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  const section = rest.slice(0, end === -1 ? undefined : end).join("\n");
  const keys = new Set();
  for (const m of section.matchAll(ACTIVITY_LINK_RE)) {
    keys.add(activityKey(m[1], m[2]));
  }
  return [...keys];
}

/**
 * The workshops on the workshop assignment page, in page order: the term,
 * the number within it, the `###` heading and its anchor, and the key of
 * the activity the section's first activity link names.
 */
export function workshopEntries(source) {
  const entries = [];
  let term = null;
  let open = null;
  for (const line of source.split("\n")) {
    if (line.startsWith("## ")) {
      term = line.match(TERM_HEADING_RE)?.[1].toLowerCase() ?? null;
      open = null;
      continue;
    }
    const heading = line.match(WORKSHOP_HEADING_RE);
    if (heading) {
      open = term
        ? {
            heading: heading[1],
            n: Number(heading[2]),
            slug: slugify(heading[1]),
            term,
          }
        : null;
      continue;
    }
    const [link] = line.matchAll(ACTIVITY_LINK_RE);
    if (!(open && link)) {
      continue;
    }
    entries.push({ ...open, key: activityKey(link[1], link[2]) });
    open = null; // only the section's first link names its activity
  }
  return entries;
}

/**
 * What the assignment pages say about each activity they name, keyed by
 * activity key: its workshop entry, if any, and the assignments whose
 * "Activities That Prepare This" section links it, in `order`, then title.
 *
 * `assignments` is `{ id, title, order, body }` per assignment page, `id`
 * being the docs id (`assignments/rfc`); `workshopSource` is the workshop
 * page's MDX.
 */
export function buildActivityIndex({ assignments, workshopSource }) {
  const index = new Map();
  const at = (key) => {
    if (!index.has(key)) {
      index.set(key, { prepares: [], workshop: null });
    }
    return index.get(key);
  };
  const ordered = [...assignments].sort(
    (a, b) =>
      (a.order ?? Number.POSITIVE_INFINITY) -
        (b.order ?? Number.POSITIVE_INFINITY) || a.title.localeCompare(b.title)
  );
  for (const { id, title, body } of ordered) {
    for (const key of preparedActivities(body)) {
      at(key).prepares.push({ id, title });
    }
  }
  for (const entry of workshopEntries(workshopSource)) {
    at(entry.key).workshop = entry;
  }
  return index;
}

/**
 * An activity's tier, from its index entry: Workshop when the workshop page
 * names it, Recommended when an assignment prepares from it, Library
 * otherwise. A workshop that assignments also link stays Workshop.
 */
export function tierOf(entry) {
  if (entry?.workshop) {
    return "Workshop";
  }
  return entry?.prepares.length ? "Recommended" : "Library";
}

// One index per build: every activity on every page asks for the same one.
// The signature is the caller's cheap fingerprint of its inputs (the docs
// entries' digests), so the dev server rebuilds it when an assignment changes.
let cached = null;

/** `buildActivityIndex(input())`, computed once per `signature`. */
export function cachedActivityIndex(signature, input) {
  if (cached?.signature !== signature) {
    cached = { index: buildActivityIndex(input()), signature };
  }
  return cached.index;
}

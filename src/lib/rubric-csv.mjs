/**
 * The one parser for a Canvas rubric CSV (#144).
 *
 * `RubricTable.astro` renders these files and `scripts/validate-outcomes.mjs`
 * reconciles them against each page's frontmatter. Both used to walk the
 * format themselves, which is how they came to disagree about stripping `\r`
 * and about what counts as an outcome tag. One parser, imported by both.
 *
 * The format is Canvas's own rubric import template
 * (`canvas/assignments/_template/import_rubric_template.csv`): RFC 4180 CSV,
 * one header row, then one row per criterion:
 *
 *   0: Rubric Name, identical on every row; one file holds one rubric
 *   1: Criteria Name, with its outcome tags in brackets ("Blameless [SO4]")
 *   2: Criteria Description, or empty
 *   3: Criteria Enable Range ("true"/"false"); Canvas reads it, the handbook
 *      does not
 *   4+: repeating rating groups of three (name, description, points)
 *
 * Rows may be ragged, as in Canvas's template: a pass/fail criterion stops
 * after two groups while the header names as many as the widest row. Reading
 * the groups as a repeating triple rather than a fixed count is what lets one
 * parser serve every shape in this repository, including `defense`, which
 * carries a fourth `Missing` band.
 */

/** The outcome IDs the accreditation record recognises. Nothing else is a tag. */
export const OUTCOME_TAG_RE = /^(SO[1-6]|L(07|08|09|10))$/;

export const CRITERION_HEADER = [
  "Rubric Name",
  "Criteria Name",
  "Criteria Description",
  "Criteria Enable Range",
];
export const RATING_HEADER = [
  "Rating Name",
  "Rating Description",
  "Rating Points",
];

const TRAILING_BRACKET_RE = /\s*\[([^\]]+)\]\s*$/;
const FIRST_RATING = CRITERION_HEADER.length;
const RATING_GROUP_WIDTH = RATING_HEADER.length;

/**
 * RFC 4180 records: commas separate fields, a quoted field may hold commas,
 * newlines, and `""` for a literal quote. Band descriptions quote student
 * phrasing ("we worked well together"), so a `split(",")` would shift every
 * column after the first quoted comma and still parse.
 */
export function readCsvRecords(text, sourceLabel) {
  const records = [];
  let record = [];
  let field = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' && field === "") {
      [field, i] = readQuoted(text, i + 1, sourceLabel);
      continue;
    }
    if (ch === '"') {
      throw new Error(
        `rubric CSV ${sourceLabel} record ${records.length + 1}: a quote inside an unquoted field. Quote the whole field and double the inner quote ("say ""this""").`
      );
    }
    if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
      if (ch === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
    } else {
      field += ch;
    }
    i += 1;
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  // A blank line is one empty field, not a criterion.
  return records.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** A quoted field's value from just past its opening quote, and where it ends. */
function readQuoted(text, start, sourceLabel) {
  let value = "";
  let i = start;
  while (i < text.length) {
    if (text[i] !== '"') {
      value += text[i];
      i += 1;
    } else if (text[i + 1] === '"') {
      value += '"';
      i += 2;
    } else {
      return [value, i + 1];
    }
  }
  throw new Error(
    `rubric CSV ${sourceLabel}: a quoted field never closes, so every row after it is swallowed.`
  );
}

/** The bracketed tag list on a criterion title, or null when there is none. */
function readTags(rawTitle) {
  const bracket = rawTitle.match(TRAILING_BRACKET_RE);
  if (!bracket) {
    return null;
  }
  const candidates = bracket[1].split(",").map((tag) => tag.trim());
  // Only outcome IDs are tags. A trailing bracket holding anything else stays
  // part of the title rather than being published to students as
  // accreditation evidence that does not exist.
  return candidates.every((tag) => OUTCOME_TAG_RE.test(tag))
    ? candidates
    : null;
}

/** The repeating three-field rating groups, in order. */
function readRatings(cells, row, sourceLabel) {
  const ratings = [];
  for (let i = FIRST_RATING; i < cells.length; i += RATING_GROUP_WIDTH) {
    const name = (cells[i] ?? "").trim();
    const description = (cells[i + 1] ?? "").trim();
    const rawPoints = (cells[i + 2] ?? "").trim();
    // Stop at the first wholly empty group, testing the raw points cell rather
    // than Number(): `Number("")` is 0, which is finite, so a trailing comma
    // run would otherwise be pushed as a nameless zero-point band and rendered.
    if (!(rawPoints || name || description)) {
      break;
    }
    // A band that exists must carry a number. An empty cell is the likeliest
    // typo and the most dangerous: `Number("")` is 0, so it would parse as a
    // zero-point band, and in any band but the top one the rubric would still
    // total 100 with nothing to catch it.
    const points = Number(rawPoints);
    if (rawPoints === "" || !Number.isFinite(points) || points < 0) {
      throw new Error(
        `rubric CSV ${sourceLabel} row ${row}, band "${name || "(unnamed)"}": points cell is "${rawPoints}", which is not a points value. Every band with a name or a description needs one.`
      );
    }
    ratings.push({ description, name, points });
  }
  return ratings;
}

/**
 * The header is the only thing that says which column is which. A file saved
 * from a spreadsheet with a column inserted or dropped would otherwise parse
 * into the wrong slots and still total 100.
 */
function checkHeader(header, widest, sourceLabel) {
  const groups = (header.length - FIRST_RATING) / RATING_GROUP_WIDTH;
  const expected = [
    ...CRITERION_HEADER,
    ...Array.from({ length: Math.max(groups, 0) }, () => RATING_HEADER).flat(),
  ];
  const actual = header.map((cell) => cell.trim());
  if (
    !Number.isInteger(groups) ||
    groups < 1 ||
    actual.some((cell, i) => cell !== expected[i])
  ) {
    throw new Error(
      `rubric CSV ${sourceLabel}: the header is not Canvas's rubric import header ("${CRITERION_HEADER.join(",")}" then repeating "${RATING_HEADER.join(",")}"). Got "${actual.join(",")}".`
    );
  }
  if (widest > header.length) {
    throw new Error(
      `rubric CSV ${sourceLabel}: a row has ${widest} fields but the header names only ${header.length}. Add a rating group to the header.`
    );
  }
}

function parseRow(cells, row, sourceLabel) {
  // A stray comma in an unquoted field shifts every rating group after it and
  // is otherwise silent: the row still parses, just into the wrong columns.
  const ratingCells = cells.length - FIRST_RATING;
  if (ratingCells < RATING_GROUP_WIDTH || ratingCells % RATING_GROUP_WIDTH) {
    throw new Error(
      `rubric CSV ${sourceLabel} row ${row}: ${cells.length} fields, which is not ${FIRST_RATING} plus a whole number of ${RATING_GROUP_WIDTH}-field rating groups. An unquoted comma inside a field will do this.`
    );
  }

  const rawTitle = cells[1].trim();
  const tags = readTags(rawTitle);
  const ratings = readRatings(cells, row, sourceLabel);

  if (ratings.length === 0) {
    throw new Error(
      `rubric CSV ${sourceLabel} row ${row}: no rating bands. A criterion nothing can be scored against is not a criterion.`
    );
  }

  return {
    description: cells[2].trim(),
    maxPoints: Math.max(...ratings.map((r) => r.points)),
    ratings,
    tags: tags ?? [],
    title: tags ? rawTitle.replace(TRAILING_BRACKET_RE, "") : rawTitle,
  };
}

/**
 * @param {string} csvText raw file contents
 * @param {string} sourceLabel repository-relative path, for error messages
 * @returns {{name: string,
 *            criteria: {title: string, tags: string[], description: string,
 *              ratings: {points: number, name: string, description: string}[],
 *              maxPoints: number}[]}}
 */
export function parseRubricCsv(csvText, sourceLabel) {
  if (!csvText?.trim()) {
    throw new Error(`rubric CSV ${sourceLabel} is empty or missing.`);
  }
  const [header, ...rows] = readCsvRecords(csvText, sourceLabel);
  checkHeader(header, Math.max(0, ...rows.map((r) => r.length)), sourceLabel);
  if (rows.length === 0) {
    throw new Error(`rubric CSV ${sourceLabel}: a header and no criteria.`);
  }

  // One file is one rubric. Canvas groups rows by this column, so a second
  // name would import as a second rubric the page never renders.
  const name = rows[0][0].trim();
  if (!name) {
    throw new Error(`rubric CSV ${sourceLabel} row 1: no Rubric Name.`);
  }
  rows.forEach((cells, index) => {
    if (cells[0].trim() !== name) {
      throw new Error(
        `rubric CSV ${sourceLabel} row ${index + 1}: Rubric Name "${cells[0].trim()}" differs from row 1's "${name}". One file holds one rubric.`
      );
    }
  });

  return {
    criteria: rows.map((cells, index) =>
      parseRow(cells, index + 1, sourceLabel)
    ),
    name,
  };
}

/** Each criterion's highest band, summed. */
export function rubricTotal(criteria) {
  return criteria.reduce((sum, c) => sum + c.maxPoints, 0);
}

/** Outcome tag -> how many criteria carry it. */
export function rubricTagCounts(criteria) {
  const counts = {};
  for (const c of criteria) {
    for (const tag of c.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

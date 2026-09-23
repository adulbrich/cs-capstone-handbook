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

const CRITERION_HEADER = [
  "Rubric Name",
  "Criteria Name",
  "Criteria Description",
  "Criteria Enable Range",
];
const RATING_HEADER = ["Rating Name", "Rating Description", "Rating Points"];

const TRAILING_BRACKET_RE = /\s*\[([^\]]+)\]\s*$/;
const FIELD_END = new Set([",", "\r", "\n"]);
const FIRST_RATING = CRITERION_HEADER.length;
const RATING_GROUP_WIDTH = RATING_HEADER.length;

/**
 * RFC 4180 records, each with the file line it starts on: commas separate
 * fields, a quoted field may hold commas, newlines, and `""` for a literal
 * quote. Band descriptions quote student phrasing ("we worked well
 * together"), so a `split(",")` would shift every column after the first
 * quoted comma and still parse. `check-prose` reads the fields through this
 * too, so the CSV quoting is not mistaken for a cited phrase.
 *
 * @returns {{cells: string[], line: number}[]}
 */
export function readCsvRecords(text, sourceLabel) {
  const records = [];
  let cells = [];
  let field = "";
  let line = 1;
  let start = 1;
  const endRecord = () => {
    cells.push(field);
    records.push({ cells, line: start });
    cells = [];
    field = "";
  };
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') {
      const quoted = readQuoted(text, i, field, sourceLabel, line);
      field = quoted.value;
      line += quoted.newlines;
      i = quoted.next;
      continue;
    }
    if (ch === ",") {
      cells.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      endRecord();
      if (ch === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      line += 1;
      start = line;
    } else {
      field += ch;
    }
    i += 1;
  }
  if (field !== "" || cells.length > 0) {
    endRecord();
  }
  // A blank line is one empty field, not a criterion.
  return records.filter((r) => r.cells.some((cell) => cell.trim() !== ""));
}

/**
 * The quoted field whose opening quote is at `quoteAt`: its value, the
 * newlines inside it, and where the text after it starts. The quotes must
 * wrap the whole field, so `before` (what the field held when the quote
 * arrived) must be empty and a field separator must follow the close.
 */
function readQuoted(text, quoteAt, before, sourceLabel, line) {
  if (before !== "") {
    throw new Error(
      `rubric CSV ${sourceLabel} line ${line}: a quote inside an unquoted field. Quote the whole field and double the inner quote ("say ""this""").`
    );
  }
  let value = "";
  let i = quoteAt + 1;
  while (i < text.length) {
    if (text[i] !== '"') {
      value += text[i];
      i += 1;
    } else if (text[i + 1] === '"') {
      value += '"';
      i += 2;
    } else {
      const newlines = value.split("\n").length - 1;
      if (i + 1 < text.length && !FIELD_END.has(text[i + 1])) {
        throw new Error(
          `rubric CSV ${sourceLabel} line ${line + newlines}: text after a closing quote. The whole field goes inside the quotes.`
        );
      }
      return { newlines, next: i + 1, value };
    }
  }
  throw new Error(
    `rubric CSV ${sourceLabel} line ${line}: a quoted field never closes, so every row after it is swallowed.`
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
function readRatings(cells, line, sourceLabel) {
  const ratings = [];
  for (let i = FIRST_RATING; i < cells.length; i += RATING_GROUP_WIDTH) {
    const name = (cells[i] ?? "").trim();
    const description = (cells[i + 1] ?? "").trim();
    const rawPoints = (cells[i + 2] ?? "").trim();
    // Stop at the first wholly empty group, testing the raw points cell rather
    // than Number(): `Number("")` is 0, which is finite, so a trailing comma
    // run would otherwise be pushed as a nameless zero-point band and rendered.
    // Only a trailing run: a band after the gap would be dropped, and unless
    // it was the top band the rubric would still total 100.
    if (!(rawPoints || name || description)) {
      if (cells.slice(i).some((cell) => cell.trim() !== "")) {
        throw new Error(
          `rubric CSV ${sourceLabel} line ${line}: an empty rating group before a filled one. Move the bands after it left.`
        );
      }
      break;
    }
    // A band that exists must carry a number. An empty cell is the likeliest
    // typo and the most dangerous: `Number("")` is 0, so it would parse as a
    // zero-point band, and in any band but the top one the rubric would still
    // total 100 with nothing to catch it.
    const points = Number(rawPoints);
    if (rawPoints === "" || !Number.isFinite(points) || points < 0) {
      throw new Error(
        `rubric CSV ${sourceLabel} line ${line}, band "${name || "(unnamed)"}": points cell is "${rawPoints}", which is not a points value. Every band with a name or a description needs one.`
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

function parseRow({ cells, line }, sourceLabel) {
  // A stray comma in an unquoted field shifts every rating group after it and
  // is otherwise silent: the row still parses, just into the wrong columns.
  const ratingCells = cells.length - FIRST_RATING;
  if (ratingCells < RATING_GROUP_WIDTH || ratingCells % RATING_GROUP_WIDTH) {
    throw new Error(
      `rubric CSV ${sourceLabel} line ${line}: ${cells.length} fields, which is not ${FIRST_RATING} plus a whole number of ${RATING_GROUP_WIDTH}-field rating groups. An unquoted comma inside a field will do this.`
    );
  }

  const rawTitle = cells[1].trim();
  const tags = readTags(rawTitle);
  const ratings = readRatings(cells, line, sourceLabel);

  if (ratings.length === 0) {
    throw new Error(
      `rubric CSV ${sourceLabel} line ${line}: no rating bands. A criterion nothing can be scored against is not a criterion.`
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
  checkHeader(
    header.cells,
    Math.max(0, ...rows.map((r) => r.cells.length)),
    sourceLabel
  );
  if (rows.length === 0) {
    throw new Error(`rubric CSV ${sourceLabel}: a header and no criteria.`);
  }

  // One file is one rubric. Canvas groups rows by this column, so a second
  // name would import as a second rubric the page never renders.
  const name = rows[0].cells[0].trim();
  if (!name) {
    throw new Error(
      `rubric CSV ${sourceLabel} line ${rows[0].line}: no Rubric Name.`
    );
  }
  for (const { cells, line } of rows) {
    if (cells[0].trim() !== name) {
      throw new Error(
        `rubric CSV ${sourceLabel} line ${line}: Rubric Name "${cells[0].trim()}" differs from the first criterion's "${name}". One file holds one rubric.`
      );
    }
  }

  return {
    criteria: rows.map((row) => parseRow(row, sourceLabel)),
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

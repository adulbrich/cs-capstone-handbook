import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseRubricCsv } from "../rubric-csv.mjs";

// The two peer evaluation rubrics are published instruments, kept word for
// word (AGENTS.md, hard rule 8): the per-term scale follows Gardner et al.,
// and CATME is Appendix B of Ohland et al. 2012 (#497). Each hash covers a
// rubric's wording: its name, its criteria's titles, tags and descriptions,
// and every rating's name and description. Points are left out, so a weight
// change still passes. A failure here is a wording edit: revert it rather
// than updating the hash, unless the instructor has changed the instrument.
const PINNED = {
  "catme-rubric.csv":
    "0a4ad07dba44713e820f42999ce5df8a15aefc431f375d2348f13988b52a89e5",
  "peer-evaluation-rubric.csv":
    "ed26b376d5bcd32a075917345b88099ddf659c2087ad9cec835a456711e75f0b",
};

const wording = (file) => {
  const { name, criteria } = parseRubricCsv(
    readFileSync(
      new URL(
        `../../../canvas/assignments/peer-evaluation/${file}`,
        import.meta.url
      ),
      "utf8"
    ),
    file
  );
  return JSON.stringify({
    criteria: criteria.map(({ description, ratings, tags, title }) => ({
      description,
      ratings: ratings.map((rating) => ({
        description: rating.description,
        name: rating.name,
      })),
      tags,
      title,
    })),
    name,
  });
};

test("the published instruments keep their wording", () => {
  for (const [file, hash] of Object.entries(PINNED)) {
    assert.equal(
      createHash("sha256").update(wording(file)).digest("hex"),
      hash,
      file
    );
  }
});

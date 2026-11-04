import assert from "node:assert/strict";
import { test } from "node:test";
import { kindOf, resolveImage, segments } from "./submission-images.mjs";
import { readMarkdown, stripFrontMatter } from "./submission-markdown.mjs";
import {
  blankCover,
  COVER_PLACE,
  canSave,
  coverLines,
  coverProblems,
  fileProblems,
  fromSaved,
  hasSaved,
  numberPages,
  PAPER,
  pageStarts,
  sheets,
  submissionChecks,
  titleFromSearch,
  toSaved,
} from "./submission-pdf.mjs";

// An invented charter: two sections, a table, a diagram, a code block, and
// three images, one with no alt text.
const CHARTER = `# Team Charter

## Roles

| Role | Owner |
|---|---|
| Lead | Sam |

![Who owns what](img/raci.png)

## Review Flow

\`\`\`mermaid
flowchart LR
  A --> B
\`\`\`

![](img/flow.png)

\`\`\`sh
npm test
\`\`\`

<img src="img/team.svg" alt="The team">
`;

const COMPLETE = {
  authors: [
    { email: "lovelaca@example.edu", name: "Ada Lovelace" },
    { email: "hopperg@example.edu", name: "Grace Hopper" },
  ],
  projectId: "7",
  projectName: "Tide Pool Census",
  title: "Team Charter",
};

const BLANK = {
  email: "[email]",
  name: "[name]",
  projectId: "[ID]",
  projectName: "[project name]",
  title: "[Document title]",
};

test("a Markdown file renders as GitHub-flavored HTML with diagrams held aside", () => {
  const read = readMarkdown(CHARTER);
  assert.match(read.html, /<table>/);
  assert.match(read.html, /<th>Role<\/th>/);
  assert.match(read.html, /<div class="diagram" data-diagram="0"><\/div>/);
  assert.doesNotMatch(read.html, /flowchart/);
  assert.match(read.html, /<code class="language-sh">npm test/);
  assert.deepEqual(read.diagrams, [
    { line: 13, source: "flowchart LR\n  A --> B" },
  ]);
  assert.deepEqual(read.counts, {
    code: 1,
    diagrams: 1,
    images: 3,
    sections: 2,
    tables: 1,
  });
});

test("every image is found with its line and alt text, Markdown or <img>", () => {
  assert.deepEqual(readMarkdown(CHARTER).images, [
    { alt: "Who owns what", line: 9, src: "img/raci.png" },
    { alt: "", line: 18, src: "img/flow.png" },
    { alt: "The team", line: 24, src: "img/team.svg" },
  ]);
  assert.deepEqual(
    readMarkdown("Text\n\n- one\n- two ![  ](a.png) and ![b](b.png)\n").images,
    [
      { alt: "", line: 4, src: "a.png" },
      { alt: "b", line: 4, src: "b.png" },
    ]
  );
  assert.deepEqual(readMarkdown("<img src='x.png'>\n").images, [
    { alt: "", line: 1, src: "x.png" },
  ]);
});

test("front matter is dropped and the line numbers still match the file", () => {
  const text = "---\ntitle: Design\n---\n# Design\n\n![](d.png)\n";
  assert.equal(stripFrontMatter(text), "\n\n\n# Design\n\n![](d.png)\n");
  const read = readMarkdown(text);
  assert.doesNotMatch(read.html, /title: Design/);
  assert.equal(read.images[0].line, 6);
  assert.equal(
    stripFrontMatter("# No front matter\n---\n"),
    "# No front matter\n---\n"
  );
});

test("a Windows line ending reads the same as a Unix one", () => {
  assert.deepEqual(
    readMarkdown("# A\r\n\r\n![](a.png)\r\n").images,
    readMarkdown("# A\n\n![](a.png)\n").images
  );
});

test("the builder takes Markdown and images by extension, any case", () => {
  assert.equal(kindOf("docs/README.md"), "markdown");
  assert.equal(kindOf("notes.MARKDOWN"), "markdown");
  assert.equal(kindOf("img/Team.JPG"), "image");
  assert.equal(kindOf("flow.svg"), "image");
  assert.equal(kindOf("report.pdf"), null);
  assert.equal(kindOf(".md"), null);
  assert.equal(kindOf("Makefile"), null);
});

test("paths resolve . and .., and never climb past the top", () => {
  assert.deepEqual(segments("./docs/../img//a.png"), ["img", "a.png"]);
  assert.deepEqual(segments("../../a.png"), ["a.png"]);
});

test("an image link finds its file however the files were added", () => {
  // Chosen in the file picker: bare names.
  assert.equal(
    resolveImage("img/raci.png", "charter.md", ["raci.png"]),
    "raci.png"
  );
  // Dropped as a folder: the path inside it.
  assert.equal(
    resolveImage("img/raci.png", "team-docs/charter.md", [
      "team-docs/img/raci.png",
    ]),
    "team-docs/img/raci.png"
  );
  // The Markdown chosen alone, its images dropped as a folder.
  assert.equal(
    resolveImage("./img/raci.png", "charter.md", ["team-docs/img/raci.png"]),
    "team-docs/img/raci.png"
  );
  assert.equal(
    resolveImage("../img/a%20b.png?raw=1#x", "docs/design.md", ["img/a b.png"]),
    "img/a b.png"
  );
  assert.equal(
    resolveImage("/docs/img/a.png", "docs/design.md", ["repo/docs/img/a.png"]),
    "repo/docs/img/a.png"
  );
});

test("an image link never takes a file from another folder", () => {
  assert.equal(
    resolveImage("img/raci.png", "team-docs/charter.md", ["other/raci.png"]),
    null
  );
  assert.equal(resolveImage("raci.png", "charter.md", []), null);
  assert.equal(resolveImage("  ", "charter.md", ["raci.png"]), null);
  // The longest match wins over a bare name.
  assert.equal(
    resolveImage("img/a.png", "docs/x.md", ["a.png", "docs/img/a.png"]),
    "docs/img/a.png"
  );
});

test("a file's problems: images not added and images with no alt text", () => {
  const { images } = readMarkdown(
    `${CHARTER}\n![Logo](https://example.edu/logo.png)\n`
  );
  assert.deepEqual(
    fileProblems(images, "charter.md", ["flow.png", "team.svg"]),
    {
      missing: [{ line: 9, src: "img/raci.png" }],
      noAlt: [{ line: 18, src: "img/flow.png" }],
    }
  );
});

test("the title comes from the link's title parameter, trimmed", () => {
  assert.equal(titleFromSearch("?title=Team%20Charter"), "Team Charter");
  assert.equal(titleFromSearch("?title=+RFC+&x=1"), "RFC");
  assert.equal(titleFromSearch(""), "");
  assert.equal(titleFromSearch("?other=1"), "");
});

test("the saved project and authors survive anything storage hands back", () => {
  assert.deepEqual(fromSaved(null), {
    authors: [{ email: "", name: "" }],
    projectId: "",
    projectName: "",
  });
  assert.deepEqual(
    fromSaved({ authors: [{ name: 5 }, null], projectId: "7", title: "x" }),
    {
      authors: [
        { email: "", name: "" },
        { email: "", name: "" },
      ],
      projectId: "7",
      projectName: "",
    }
  );
  assert.deepEqual(fromSaved(toSaved(COMPLETE)), {
    authors: COMPLETE.authors,
    projectId: "7",
    projectName: "Tide Pool Census",
  });
  assert.equal("title" in toSaved(COMPLETE), false);
  assert.equal(hasSaved(blankCover("Team Charter")), false);
  assert.equal(hasSaved({ ...blankCover(), projectId: " 7 " }), true);
});

test("the cover lines read as Submitting Your Work shows them", () => {
  assert.deepEqual(coverLines(COMPLETE, BLANK), {
    authors:
      "Ada Lovelace <lovelaca@example.edu>, Grace Hopper <hopperg@example.edu>",
    project: "Project 7: Tide Pool Census",
    title: "Team Charter",
  });
  assert.deepEqual(coverLines(blankCover(), BLANK), {
    authors: "[name] <[email]>",
    project: "Project [ID]: [project name]",
    title: "[Document title]",
  });
});

test("incomplete cover lines name each gap, author by author", () => {
  assert.deepEqual(coverProblems(COMPLETE), []);
  assert.deepEqual(
    coverProblems({
      authors: [
        { email: "not-an-email", name: "Ada" },
        { email: "", name: " " },
      ],
      projectId: "",
      projectName: "x",
      title: " ",
    }),
    [
      { field: "title" },
      { field: "projectId" },
      { author: 1, field: "emailFormat" },
      { author: 2, field: "name" },
      { author: 2, field: "email" },
    ]
  );
  assert.deepEqual(coverProblems({ ...COMPLETE, authors: [] }), [
    { field: "authors" },
  ]);
});

test("the checks pass a clean submission and flag each problem", () => {
  const clean = { diagrams: 1, failed: [], missing: [], noAlt: [] };
  const ok = submissionChecks(COMPLETE, [
    { ...clean, name: "charter.md" },
    { ...clean, diagrams: 0, name: "AGENTS.md" },
  ]);
  assert.deepEqual(
    ok.map((check) => [check.id, check.ok]),
    [
      ["cover", true],
      ["files", true],
      ["images", true],
      ["alt", true],
      ["diagrams", true],
    ]
  );
  assert.deepEqual(ok[1].names, ["charter.md", "AGENTS.md"]);
  assert.equal(ok[4].count, 1);
  assert.equal(canSave(ok), true);

  const bad = submissionChecks({ ...COMPLETE, projectName: "" }, [
    {
      diagrams: 1,
      failed: [{ line: 13, message: "Parse error" }],
      missing: [{ line: 9, src: "img/raci.png" }],
      name: "charter.md",
      noAlt: [{ line: 18, src: "img/flow.png" }],
    },
  ]);
  assert.deepEqual(
    bad.filter((check) => !check.ok).map((check) => check.id),
    ["cover", "images", "alt", "diagrams"]
  );
  assert.deepEqual(bad[2].missing, [
    { file: "charter.md", line: 9, src: "img/raci.png" },
  ]);
  assert.deepEqual(bad[4].failed, [
    { file: "charter.md", line: 13, message: "Parse error" },
  ]);
  assert.equal(canSave(bad), false);
});

test("warnings never stop the save; no file or bad cover lines do", () => {
  const warned = submissionChecks(COMPLETE, [
    {
      diagrams: 0,
      failed: [],
      missing: [{ line: 1, src: "a.png" }],
      name: "a.md",
      noAlt: [],
    },
  ]);
  assert.equal(canSave(warned), true);
  assert.equal(canSave(submissionChecks(COMPLETE, [])), false);
});

test("the papers are US Letter and A4 with a 0.75-inch margin", () => {
  assert.equal(PAPER.letter.width, 816);
  assert.equal(PAPER.letter.contentHeight, 912);
  assert.equal(PAPER.letter.contentWidth, 672);
  assert.ok(Math.abs(PAPER.a4.height - 1122.52) < 0.01);
  assert.ok(Math.abs(PAPER.a4.contentWidth - 649.7) < 0.01);
});

test("each file starts a sheet; the cover lines go on top or on their own", () => {
  assert.deepEqual(sheets(COVER_PLACE.top, 2), [
    { coverOnly: false, coverTop: true, file: 0, id: "file-0" },
    { coverOnly: false, coverTop: false, file: 1, id: "file-1" },
  ]);
  assert.deepEqual(sheets(COVER_PLACE.page, 1), [
    { coverOnly: true, coverTop: false, file: null, id: "cover" },
    { coverOnly: false, coverTop: false, file: 0, id: "file-0" },
  ]);
  assert.deepEqual(sheets(COVER_PLACE.page, 0), [
    { coverOnly: true, coverTop: false, file: null, id: "cover" },
  ]);
});

test("pages number on across sheets, a sheet at least one page", () => {
  assert.deepEqual(numberPages([1, 3, 0, 2]), {
    firsts: [1, 2, 5, 6],
    total: 7,
  });
  assert.deepEqual(numberPages([]), { firsts: [], total: 0 });
});

test("a part that does not fit moves to the next page whole", () => {
  const block = (top, bottom, keepWithNext = false) => ({
    bottom,
    keepWithNext,
    top,
  });
  // Everything fits on one page.
  assert.deepEqual(pageStarts([block(0, 50), block(60, 100)], 100), [0]);
  // The second part would cross the edge, so its page starts at its top.
  assert.deepEqual(pageStarts([block(0, 70), block(75, 130)], 100), [0, 75]);
  // A heading right before it goes with it.
  assert.deepEqual(
    pageStarts([block(0, 60), block(65, 75, true), block(80, 130)], 100),
    [0, 65]
  );
  // A part taller than a page is cut at each page edge, where it stands.
  assert.deepEqual(pageStarts([block(0, 250)], 100), [0, 100, 200]);
  assert.deepEqual(
    pageStarts([block(0, 40), block(50, 260)], 100),
    [0, 100, 200]
  );
  assert.deepEqual(pageStarts([], 100), [0]);
});

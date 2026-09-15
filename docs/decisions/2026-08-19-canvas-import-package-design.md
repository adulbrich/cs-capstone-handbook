# Design: Canvas Import Package

Date: 2026-08-19
Branch: `revision-fall-2026`
Status: design record, not yet implemented (#5). Section 4 resolved; no open decisions remain.
Companion documents: `AGENTS.md` (repository rules), `canvas/assignments/assignment-readme.md` (the Canvas mirror it replaces)

## 1. Why

Getting a term's worth of course design into Canvas is currently four manual jobs per assignment: paste the HTML body, run the browser extension to import the rubric, attach the rubric to the assignment, and set the due date, points, group, and submission type by hand. Times fourteen assignments, times three courses. Nothing checks that what landed in Canvas matches the handbook, and `canvas/assignments/assignment-readme.md` carries hand-written prose saying which files need re-importing, which is itself a fact stated in two places.

Canvas can import a whole course from a single `.imscc` package. This design generates that package from the repository, so the handbook stays the source of truth all the way into Canvas rather than up to the edge of it.

## 2. What the format actually is, verified

Everything in this section was verified against a real export of `SENIOR SOFTWARE ENGIN PROJECT (CS_461_001_F2025)`, not from documentation. Re-verify against a fresh export if Canvas changes.

The package is **Canvas-flavored IMS Common Cartridge 1.1**. It is a zip with `.imscc` extension containing:

```
imsmanifest.xml                     # resource index, CC 1.1 namespaces
course_settings/
  canvas_export.txt                 # marker file; presence is the flag
  course_settings.xml               # course name, weighting scheme, grading standard ref
  assignment_groups.xml             # groups and their percentage weights
  rubrics.xml                       # every rubric, with criteria and ratings
  grading_standards.xml             # the letter scale
  late_policy.xml                   # automatic deduction settings
  syllabus.html                     # syllabus body
  files_meta.xml, media_tracks.xml, context.xml
g<32-hex>/                          # one directory per assignment
  assignment_settings.xml
  <slug>.html                       # the assignment body
web_resources/                      # uploaded files
wiki_content/                       # pages
non_cc_assessments/                 # quizzes (QTI)
lti_resource_links/
```

### Facts that matter, with evidence

**Rubric associations survive.** This was the open question that decided whether the package is worth building. It does. From a real `assignment_settings.xml`:

```xml
<rubric_identifierref>ga7685b6140d52b36d78902c8101f2e66</rubric_identifierref>
<rubric_use_for_grading>true</rubric_use_for_grading>
<rubric_hide_points>false</rubric_hide_points>
```

Extracting every `rubric_identifierref` and every `rubric identifier` from the export gave 12 references against 12 rubrics with **zero dangling**. The package therefore replaces both the HTML paste and the browser extension, including the attach step.

Third-party guidance claiming rubric attachment cannot be encoded in IMSCC is describing *plain* Common Cartridge. It does not apply here: the `course_settings/canvas_export.txt` marker tells Canvas to treat the Canvas-specific files as the source of truth rather than performing a generic CC import.

**Identifiers are `g` plus 32 lowercase hex characters.** Canvas generates these as MD5. Human-readable identifiers are reported to cause silent import failures. Generate them deterministically (for example, MD5 of a stable key such as `cs461:assignment:rfc`) so that regenerating the package twice produces the same identifiers and re-importing updates rather than duplicates.

**`imsmanifest.xml` does not need to be the first zip entry.** Widely repeated guidance says it must be. Canvas's own export places it at entry 155 of 177. Do not build the packager around this constraint.

**The Canvas namespace is `http://canvas.instructure.com/xsd/cccv1p0`** for every Canvas-specific file. The manifest uses the standard CC 1.1 namespaces.

**Assignment bodies are complete HTML documents**, not fragments:

```html
<html>
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Assignment: Progress Report: Sprint 1</title></head>
<body>...</body>
</html>
```

**`assignment_settings.xml` carries** title, `due_at`, `points_possible`, `assignment_group_identifierref`, `submission_types`, `allowed_extensions`, `has_group_category` and `group_category`, `grade_group_students_individually`, `workflow_state` (published or unpublished), `omit_from_final_grade`, and the rubric fields above.

## 3. What the package will contain, and where each piece comes from

The rule: the package carries **handbook content**. Everything that is course-instance state stays in Canvas and survives course copy.

| # | Package artifact | Generated from |
|---|---|---|
| 1 | `g<hash>/<slug>.html`, one per assignment | `dist/assignments/<slug>/index.html`, the local build (§4) |
| 2 | `g<hash>/assignment_settings.xml` | `assignment` frontmatter (`level`, `terms`, `weight`) plus the term calendar (§5) |
| 3 | `course_settings/rubrics.xml` | `canvas/assignments/*/​*-rubric-details.tsv` |
| 4 | rubric associations, inside each `assignment_settings.xml` | the directory-to-page map already in `scripts/validate-outcomes.mjs` |
| 5 | `course_settings/assignment_groups.xml` | the four 25% components in `assignments/introduction.mdx` |
| 6 | `course_settings/syllabus.html` | `canvas/syllabus/cs46N.html` |
| 7 | `course_settings/grading_standards.xml` | the letter table in `learning-objectives/grading.mdx` |
| 8 | `course_settings/late_policy.xml` | fixed: all automatic deductions disabled (see below) |
| 9 | `imsmanifest.xml`, `canvas_export.txt`, `course_settings.xml` | generated plumbing |

### Explicitly out of scope

Announcements and discussion topics (20 in the sample, all term-specific: dated speaker sessions, survey reminders), LTI tool links (22), uploaded files and `web_resources/`, course name and term dates, home page and tab configuration. These change every term for reasons unrelated to course design. Course copy already handles them.

Also out of scope because the course does not have them: **quizzes** (confirmed: Capstone has none, and `non_cc_assessments/` was empty in the export), **pages** (`wiki_content/` empty), and **modules** (`course_settings/module_meta.xml` absent entirely).

### Two facts this surfaces that were not previously tracked

**The letter scale is a third location, and Canvas holds an older version.** The F2025 course's `grading_standards.xml` reads:

```
A 94 | A- 90 | B+ 85 | B 80 | B- 75 | C 70 | D 60 | F 0
```

`learning-objectives/grading.mdx` reads:

```
A 93 | A- 90 | B+ 87 | B 83 | B- 80 | C+ 77 | C 73 | C- 70 | D+ 67 | D 60 | F <60
```

Every band except A- and D differs, and C+, C-, and D+ do not exist in Canvas at all. This is expected rather than rot: `IMPLEMENTED.md` decision 1 records that the revision changed the scale deliberately, and the revision has not reached Canvas. The point is that the letter scale is a canonical handbook fact living as a hand-edited Canvas course setting with no artifact in the repository and no line on any checklist, and it determines every final grade. Generating item 7 fixes that permanently.

**The late policy looks like drift and is not.** Canvas has every automatic deduction disabled. The handbook policy is "work up to 48 hours late loses one rubric band on each criterion", which graders apply by hand. An automatic percentage deduction would double-penalize. Canvas is correct; item 8 generates the disabled state so it stays deliberate rather than accidental.

## 4. The assignment body

**Decided 2026-08-19: the Canvas body carries the full page content, generated from the local build, with a note at the top linking to the production page.**

### Why not a stub

The stub option (submission mechanics plus a link) was considered and rejected. It costs Canvas search, leaves a stub during a handbook outage, and makes students click out to read what is due. Those costs are real and the transform that avoids them turns out to be small, for reasons the next section measures.

### Why not PDF export

`adulbrich/engr103` solves the same problem with PDFs: `scripts/generate-pdfs.sh` drives Puppeteer over the production site and `print.js` prints each page. That pipeline exists for one reason, visible in its own code: it waits up to 30 seconds for `.mermaid` divs to grow an `<svg>`, because mermaid renders client-side and only a real browser can capture it.

This handbook does not have that problem:

| Section | Pages using mermaid |
|---|---|
| `assignments/` | **0** |
| `guides/` | **0** |
| `activities/` | 1 |
| everything else | 0 |

Across all 17 assignment pages, exactly one (`introduction.mdx`) contains code blocks, and none use `Badge`. The formatting a PDF preserves is formatting these pages do not use.

Generated HTML is also the **more** accessible option here, not a compromise. Semantic headings, tables, and lists land natively in Canvas and get Canvas's own screen-reader handling, with no PDF tagging to get wrong. `AssignmentMeta` already renders a real `<dl>` and asides render as real `<aside>` elements; both read correctly unstyled.

The PDF path stays available if the one mermaid-bearing activity page ever needs to go into Canvas. It is not needed for assignments.

### Source: the local build, not the production site

Extract from `dist/assignments/<slug>/index.html`. It is the same artifact production serves, so scraping the live site adds a network dependency, a deploy wait, and a Puppeteer install while producing the same bytes. Building locally runs offline, runs in CI, and is already gated by `npm run build`.

### The transform, with the details verified against the built output

1. **Extract** the contents of `<div class="sl-markdown-content">`. Confirmed present in the built pages; it is the content wrapper Starlight emits. Discard nav, sidebar, table of contents, footer, and edit links.

2. **Flatten tabs.** `project-partner-evaluation.mdx` is the only page using them, rendering 4 `role="tablist"` groups inside a `<starlight-tabs>` custom element. These are interactive and inert in Canvas. Emit each tab panel as a sequential `<h3>` section titled by its tab label.

3. **Keep MathML, drop the visual span.** `peer-evaluations.mdx` is the only page using `<Latex>`. The build emits both `katex-mathml` (containing real `<math>`) and `katex-html` (the visual rendering, which needs KaTeX's stylesheet that Canvas will not load). Keep the MathML, drop `katex-html`. Canvas then renders native, screen-reader-friendly math with no CSS at all.

4. **Rewrite links to absolute.** Root-relative hrefs (`/assignments/rfc/`) resolve against `https://capstone.alexulbrich.com`.

5. **Prepend the source note**, linking to the production page and saying the handbook is authoritative.

6. **Inline any styling that matters.** Canvas strips `<style>` blocks but permits inline `style=` attributes, which is how the existing hand-written Canvas HTML draws its blue submission badge. Use this sparingly, for the assignment-meta block and asides. Everything must remain readable with all styling removed.

7. **Wrap** in the full `<html><head><title>Assignment: ...</title></head><body>` document Canvas exports use (see §2).

A guard belongs in `validate-canvas` (§9): fail if a page introduces mermaid, a tab group, or a component the transform does not handle, rather than silently shipping a broken body.

## 5. New input the repository needs

Assignment due dates exist in the handbook as week numbers ("Week 2"), not dates. Canvas needs `due_at` as a timestamp.

Add `canvas/term-calendar.yml`:

```yaml
cs461:
  term: Fall 2026
  week1_monday: 2026-09-21
  due_time: "23:59"
cs462:
  ...
```

Due dates compute as `week1_monday + (week - 1) * 7 days`, adjusted to the weekday the handbook states. This also gives `IMPLEMENTED.md` open item 5 ("week numbers assume the standard term calendar; verify against the actual academic calendar before publishing") a real home instead of a warning.

## 6. Deletions this enables

- `canvas/assignments/**/*.html`, all 18. Superseded by the generated bodies in §4; already 72 percent dead or missing (13 sit in deprecated directories, 8 live assignments have none at all, and the survivors describe sections the revision deleted).
- `canvas/assignments/**/*-rubrics.md`, the prose rubric copies. The TSV is the machine-readable source and the handbook is the human-readable one.
- The hand-maintained "these files need re-importing" prose in `canvas/assignments/assignment-readme.md`, replaced by regeneration.

`canvas/assignments/*/​*-rubric-details.tsv` stays. It is the rubric source and `validate-outcomes.mjs` already reconciles it against the handbook.

Deprecated directories, the stale `*-assignment.html` bodies and the `*-rubrics.md` copies were removed 2026-09-13 per #30 (decided 2026-09-11), ahead of the generator; their content is recorded in the deprecation table in `assignment-readme.md` and in git history. The four-skills spec §11.5 says the same.

## 7. Syllabi

Keep `canvas/syllabus/cs46N.html` as hand-maintained files. They are genuinely hybrid: of 20 sections, 9 are OSU institutional boilerplate with no handbook home and no business having one (Student Conduct, Academic Calendar, Disabilities Statement, Student Bill of Rights, Reach Out for Success, Student Evaluation of Courses, Sick Policy, Emergencies, Attendance), while 6 restate handbook facts (Course Learning Outcomes and ABET, Grade Components, Grading Details, Late Assignments, AI Policy).

Mark the handbook-derived regions with sentinel comments the build fills:

```html
<!-- generated:grade-components -->
...
<!-- /generated:grade-components -->
```

Boilerplate stays hand-edited. This removes the syllabi from the list of weight locations the validator cannot see, leaving only `assignment-readme.md`, which §6 deletes.

## 8. Interface

```sh
npm run canvas:build          # writes dist-canvas/cs461.imscc, cs462, cs463
npm run canvas:build -- --course cs461
```

One package per course. The generator is a script under `scripts/`, consistent with the three existing validators, and reuses the directory-to-page map already in `validate-outcomes.mjs` rather than restating it.

## 9. Validation

A generated package that imports "successfully" while missing content is the failure mode to design against. Before writing the zip, assert:

- every rubric referenced by an assignment exists in `rubrics.xml` (the check already written ad hoc during this investigation)
- every assignment belongs to an assignment group that exists
- assignment group weights sum to 100
- every identifier matches `^g[0-9a-f]{32}$`
- every file referenced in `imsmanifest.xml` exists in the package, and every file in the package is referenced
- rubric point totals match the handbook, reusing `validate-outcomes.mjs` logic rather than duplicating it

Add `npm run validate:canvas` and wire it into CI and pre-commit alongside the other three.

**Round-trip test, the only honest one:** build a package, import it into an empty sandbox course, export that course, and diff the two packages. Anything Canvas silently dropped shows up as a difference. Do this once manually before trusting the generator, and record the result here.

## 10. Import safety

Canvas imports are **additive**. Importing the same package twice into a live course creates duplicate assignments.

The procedure: import into a fresh sandbox course, verify, then copy forward into the live course. Never import a generated package directly into a course with student submissions in it. The stable-identifier scheme in §2 is what makes re-import into the *same* course update rather than duplicate, but this has not been tested and should not be relied on until the round-trip test in §9 is done.

## 11. Sequencing

1. Term calendar file and due-date computation (§5). Small, unblocks `assignment_settings.xml`.
2. `rubrics.xml` from the TSVs, plus the association wiring (§3 items 3 and 4). The highest-value half: this is what the browser extension does today.
3. Assignment settings, groups, grading standard, late policy (§3 items 2, 5, 7, 8).
4. Manifest and packaging (§3 item 9), then the round-trip test (§9).
5. Assignment bodies (§4): extract, transform, wrap.
6. Syllabus sentinels (§7).
7. Deletions (§6), last, once the generator demonstrably replaces what is being deleted.

Steps 1 through 4 produce a package that carries every rubric with its association, which is most of the manual work, without touching assignment prose at all. Step 5 is independent of them and can be built in either order.

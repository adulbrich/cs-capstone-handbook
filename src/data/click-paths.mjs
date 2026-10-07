// Where the instructor tools' files come from and go, as Canvas and
// Qualtrics name each click today. One home per path: the pages show them,
// and an error that sends the instructor back (a values export) reads the
// same one. Edit a path here when the vendor renames a menu.

/** Each path: the app it starts in, then each click in order. */
export const clickPaths = {
  canvasRoster: {
    app: "Canvas",
    steps: [
      "People",
      "the group set's tab",
      "the group set's options menu (three lines)",
      "Download Course Roster CSV",
    ],
  },
  canvasRubricExport: {
    app: "Canvas",
    steps: ["Grades", "the assignment's Options menu", "Bulk Download Rubrics"],
  },
  canvasRubricImport: {
    app: "Canvas",
    steps: ["Grades", "the assignment's Options menu", "Import Rubrics"],
  },
  qualtricsEmail: {
    app: "the survey",
    steps: ["Distributions", "Emails", "Send a message"],
  },
  qualtricsImport: {
    app: "Qualtrics",
    steps: ["Catalog", "Survey", "Get started", "Import a QSF file"],
  },
  qualtricsLabelsExport: {
    app: "the survey",
    steps: [
      "Data & Analysis",
      "Export & Import",
      "Export Data",
      "CSV",
      "Export labels",
    ],
  },
  qualtricsList: {
    app: "Qualtrics",
    steps: [
      "Directories",
      "Segments & lists",
      "Lists",
      "Create a list",
      "Upload a File",
    ],
  },
};

/** A path as one line of text: "Data & Analysis › Export & Import › ...". */
export const pathSteps = ({ steps }) => steps.join(" › ");

library(data.table)
library(stringr)
library(ggplot2)

filename_input_qualtrics <- "data/2025-11-05-project-partner-midterm-survey.csv"
output_feedback_filename <- "data/2025-11-05-project-partner-midterm-feedback.csv"
output_score_filename <- "data/2025-11-05-project-partner-midterm-scores.csv"

# Canvas points for the Midterm Pulse entry (project-partner-evaluation.mdx).
canvas_points <- 100

# Needs the Qualtrics export with choice text ("Strongly agree"), not numeric
# values: the answers are mapped by label below.

input_qualtrics <- fread(filename_input_qualtrics, header = TRUE)

# Extract question labels from the first row
labels <- data.table(
  question_id = colnames(input_qualtrics),
  question_label = as.list(input_qualtrics[1, ])
)

# Remove the first two rows (metadata)
input_qualtrics <- input_qualtrics[-1, ]
input_qualtrics <- input_qualtrics[-1, ]

# Filter out duplicate submissions, keeping only the latest submission per team
input_qualtrics[, RecordedDateParsed := as.POSIXct(RecordedDate,
                                                   format = "%Y-%m-%d %H:%M:%S",
                                                   tz = "UTC")
]
setorder(input_qualtrics, RecipientEmail, -RecordedDateParsed)
input_qualtrics <- input_qualtrics[!duplicated(Team)]
input_qualtrics[, RecordedDateParsed := NULL]

# Clean up columns
input_qualtrics[, StartDate := NULL]
input_qualtrics[, EndDate := NULL]
input_qualtrics[, Status := NULL]
input_qualtrics[, IPAddress := NULL]
input_qualtrics[, Progress := NULL]
input_qualtrics[, `Duration (in seconds)` := NULL]
input_qualtrics[, Finished := NULL]
input_qualtrics[, RecordedDate := NULL]
input_qualtrics[, ResponseId := NULL]
input_qualtrics[, ExternalReference := NULL]
input_qualtrics[, LocationLatitude := NULL]
input_qualtrics[, LocationLongitude := NULL]
input_qualtrics[, DistributionChannel := NULL]
input_qualtrics[, UserLanguage := NULL]
input_qualtrics[, RecipientLastName := NULL]
input_qualtrics[, RecipientFirstName := NULL]

# Export feedback data with question labels
output_feedback <- input_qualtrics
output_feedback <- output_feedback[(Q3 != "" | `Q2 Names` != "" | `Q2 Comments` != ""), ]
output_feedback <- output_feedback[, .(RecipientEmail, Team, `Q2 Names`, `Q2 Comments`, Q3)]

fwrite(output_feedback, output_feedback_filename, row.names = FALSE)

# Likert scale: the Midterm Pulse rubric on the handbook's partner evaluation
# page (#264). Every answer earns at least 50, like the facet anchors.
likert_scale <- list(
  "50"  = "Strongly disagree",
  "70"  = "Somewhat disagree",
  "80"  = "Neither agree nor disagree",
  "90"  = "Somewhat agree",
  "100" = "Strongly agree"
)
likert_map <- setNames(
  as.numeric(names(likert_scale)),
  unlist(likert_scale, use.names = FALSE)
)
q1_cols <- paste0("Q1_", 1:4)
q1_numeric_cols <- paste0(q1_cols, "_numeric")

input_qualtrics[,
  (q1_numeric_cols) := lapply(.SD, function(value) likert_map[value]),
  .SDcols = q1_cols
]

# An answer that maps to nothing (a values export, a relabeled choice)
# would otherwise drop silently out of the mean.
unmapped <- 0
for (i in seq_along(q1_cols)) {
  raw <- input_qualtrics[[q1_cols[i]]]
  unmapped <- unmapped +
    sum(!is.na(raw) & raw != "" & is.na(input_qualtrics[[q1_numeric_cols[i]]]))
}
if (unmapped > 0) {
  stop(unmapped, " answer(s) match no label in likert_scale; check the export")
}

# A team whose partner opened the survey but answered none of the four
# items has no pulse score: treat it as unanswered and enter it by hand.
unanswered <- input_qualtrics[
  rowSums(!is.na(input_qualtrics[, ..q1_numeric_cols])) == 0, Team
]
if (length(unanswered) > 0) {
  cat("No pulse answers, enter by hand at the A lower bound:",
      paste(unanswered, collapse = ", "), "\n")
}
input_qualtrics <- input_qualtrics[!(Team %in% unanswered)]

# Each of the four items is worth a quarter of the pulse (#307), so the score
# is their sum divided by four, out of 100. Every item is required in
# Qualtrics; one left blank anyway scores nothing, as in the rubric.
# Qualtrics' own SC0 score uses the survey's scoring weights, not this scale,
# so it is not compared here.
input_qualtrics[,
  ProjectPartnerMidtermScore := rowSums(.SD, na.rm = TRUE) / length(q1_cols),
  .SDcols = q1_numeric_cols
]

input_qualtrics[, CanvasScore := ProjectPartnerMidtermScore * canvas_points / 100]

# Teams whose partner never answered are not in this export: enter them by
# hand at the A lower bound on the grading scale (learning-objectives/
# grading.mdx), scaled to canvas_points, never as a zero or a blank.

# Prepare final output
output <- input_qualtrics[,
  .(Team,
    `Responsiveness` = Q1_1_numeric,
    `Professionalism` = Q1_2_numeric,
    `Delivery Quality` = Q1_3_numeric,
    `Score (/100)` = ProjectPartnerMidtermScore,
    `Canvas score` = CanvasScore,
    Comment = str_c("Responsiveness", Q1_1_numeric,
                    "Professionalism", Q1_2_numeric,
                    "Delivery Quality", Q1_3_numeric,
                    "Scores out of 100.", sep = "\n")
  )
]
output[`Score (/100)` == 100, Comment := ""]
setorderv(output, "Team")

fwrite(output, output_score_filename, row.names = FALSE)

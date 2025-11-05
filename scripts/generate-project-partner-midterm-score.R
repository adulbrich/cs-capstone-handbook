library(data.table)
library(stringr)
library(ggplot2)

filename_input_qualtrics <- "data/2025-11-05-project-partner-midterm-survey.csv"
output_feedback_filename <- "data/2025-11-05-project-partner-midterm-feedback.csv"
output_score_filename <- "data/2025-11-05-project-partner-midterm-scores.csv"

input_qualtrics <- fread(input_filename_qualtrics, header = TRUE)

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
output_feedback <- output_feedback[Q3 != "", ]
output_feedback <- output_feedback[, .(RecipientEmail, Team, Q3)]

fwrite(output_feedback, output_feedback_filename, row.names = FALSE)

# Likert scale definition
likert_scale <- list(
  "0"   = "Strongly disagree",
  "25"  = "Somewhat disagree",
  "50"  = "Neither agree nor disagree",
  "75"  = "Somewhat agree",
  "100" = "Strongly agree"
)
likert_map <- setNames(
  as.numeric(names(likert_scale)),
  unlist(likert_scale, use.names = FALSE)
)
q1_cols <- paste0("Q1_", 1:3)
q1_numeric_cols <- paste0(q1_cols, "_numeric")

input_qualtrics[,
  (q1_numeric_cols) := lapply(.SD, function(value) likert_map[value]),
  .SDcols = q1_cols
]
input_qualtrics[,
  Q1_total := rowSums(.SD, na.rm = TRUE),
  .SDcols = q1_numeric_cols
]

input_qualtrics[, SC0 := as.numeric(SC0)]
input_qualtrics[, Score_Check := Q1_total - SC0]

cat("Number of rows with score check mismatch:",
    nrow(input_qualtrics[Score_Check != 0, ]), "\n")

input_qualtrics[, ProjectPartnerMidtermScore := Q1_total / 12]

# Prepare final output
output <- input_qualtrics[,
  .(Team,
    `Responsiveness` = Q1_1_numeric,
    `Professionalism` = Q1_2_numeric,
    `Delivery Quality` = Q1_3_numeric,
    `Total (/300)` = Q1_total,
    `Total (/25)` = ProjectPartnerMidtermScore,
    Comment = str_c("Responsiveness", Q1_1_numeric,
                    "Professionalism", Q1_2_numeric,
                    "Delivery Quality", Q1_3_numeric,
                    "Scores out of 100.", sep = "\n")
  )
]
output[`Total (/25)` == 25, Comment := ""]
setorderv(output, "Team")

fwrite(output, output_score_filename, row.names = FALSE)

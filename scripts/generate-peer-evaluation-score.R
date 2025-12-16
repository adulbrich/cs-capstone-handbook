library(data.table)
library(stringr)
library(ggplot2)

# Go to Qualtrics, select the project, and click the Data & Analysis tab.
# Click on the Export & Import tab, and select Export Data.
# Select the CSV format, check Download all fields, Export labels, and click Download.

# !!! change assignment name and ID in gradebook at the bottom !!!
# !!! change filenames below !!!

filename_groups <- "data/2025-10-27-project-groups.csv"
gradebook_filename <- "data/2025-12-10T1033_Grades-SENIOR_SOFTWARE_ENGIN_PROJECT_(CS_461_001_F2025).csv"
gradebook_updated_filename <- "data/2025-12-10T1033_Grades-SENIOR_SOFTWARE_ENGIN_PROJECT_(CS_461_001_F2025)-updated.csv"

team_sizes <- fread(filename_groups, header = TRUE)
team_sizes <- team_sizes[, .(n = .N), by = group_name]
setnames(team_sizes, "group_name", "Team")

filename <- "data/2025-12-15-peer-review-survey-results.csv"

output_filename <- "data/2025-12-15-peer-review-survey-output.csv"
output_email_filename <- "data/2025-12-15-peer-review-survey-emails.csv"
output_email_subject <- "CS461 Final Peer Review Results"

dt <- fread(filename, header = TRUE)

labels <- data.table(
  question_id = colnames(dt),
  question_label = as.list(dt[1, ])
)
dt <- dt[-1, ]
dt <- dt[-1, ]

# keep only the latest submission per student
dt[,
  RecordedDateParsed := as.POSIXct(
    RecordedDate,
    format = "%Y-%m-%d %H:%M:%S",
    tz = "UTC"
  )
]
setorder(dt, RecipientEmail, -RecordedDateParsed)
dt <- dt[!duplicated(RecipientEmail)]
dt[, RecordedDateParsed := NULL]

# clean up columns
dt[, StartDate := NULL]
dt[, EndDate := NULL]
dt[, Status := NULL]
dt[, IPAddress := NULL]
dt[, Progress := NULL]
dt[, `Duration (in seconds)` := NULL]
dt[, Finished := NULL]
dt[, RecordedDate := NULL]
dt[, ResponseId := NULL]
dt[, ExternalReference := NULL]
dt[, LocationLatitude := NULL]
dt[, LocationLongitude := NULL]
dt[, DistributionChannel := NULL]
dt[, UserLanguage := NULL]

# add team size
dt <- merge(dt, team_sizes, by = "Team")

### Question 2
# X goes from 1 to 9, 1 is self, 2-9 are team members

# Does the member do an appropriate quantity of work?
# labels[,Q2_X_1]

# How about the quality of the member's work?
# labels[,Q2_X_2]

# Rate the member's attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).
# labels[,Q2_X_3]

# Rate the overall value of the member's technical contribution.
# labels[,Q2_X_4]

### Question 3
# Take 100 points, and divide them among the N team members, including yourself. Give points based on your opinion of what proportion of the credit each member deserves. You may consider quality and quantity of contributions, team-player attitude, and/or any aspects that you feel are relevant. You must give yourself at least 100/N points, whether you honestly feel you deserve them or not. (This is to avoid an unrealistic “self-incrimination” requirement.)
# X goes from 1 to 9, 1 is self, 2-9 are team members
# labels[,Q3_X]

output <- dt[, .(
  Name = str_c(RecipientLastName, ", ", RecipientFirstName),
  Email = RecipientEmail,
  Team,
  n,
  `Team Member 1`,
  `Team Member 2`,
  `Team Member 3`,
  `Team Member 4`,
  `Team Member 5`
)]
# need to make sure results are unique

## DATA VALIDATION

# Students who did give themselves less than 100/N points
check_q3_min <- dt[Q3_1 < floor(100 / n) & n > 2, ]

# Students that did not allocate exactly 100 points to their team members
q3_cols <- paste0("Q3_", 1:6)
q3_matrix <- as.matrix(dt[, ..q3_cols])
dt[,
  Q3_check := vapply(
    seq_len(.N),
    function(row_idx) {
      limit <- min(n[row_idx], ncol(q3_matrix))
      if (is.na(limit) || limit < 1) {
        return(NA_real_)
      }
      sum(as.numeric(q3_matrix[row_idx, seq_len(limit)]), na.rm = TRUE)
    },
    numeric(1)
  )
]
check_q3_sum <- dt[Q3_check < 99, ]

# Students that did not allocate 1-5 points to each team member
q2_cols <- paste0("Q2_", rep(1:6, each = 4), "_", rep(1:4, times = 6))
q2_matrix <- as.matrix(dt[, ..q2_cols])
q2_col_groups <- split(seq_along(q2_cols), rep(seq_len(6), each = 4))
dt[,
  Q2_invalid := vapply(
    seq_len(.N),
    function(row_idx) {
      limit <- min(n[row_idx], length(q2_col_groups))
      if (is.na(limit) || limit < 1) {
        return(FALSE)
      }
      cols_to_check <- unlist(q2_col_groups[seq_len(limit)], use.names = FALSE)
      values <- suppressWarnings(as.numeric(q2_matrix[row_idx, cols_to_check]))
      if (anyNA(values)) {
        return(TRUE)
      }
      any(values < 1 | values > 5)
    },
    logical(1)
  )
]
check_q2_range <- dt[Q2_invalid == TRUE]

## SCORE CALCULATION
for (i in 1:nrow(output)) {
  # i <- 1
  team <- output[i, Team]
  email <- output[i, Email]
  results <- dt[Team == team & RecipientEmail != email, ]
  q21 <- c()
  q22 <- c()
  q23 <- c()
  q24 <- c()
  q3 <- c()
  if (nrow(results) == 0) {
    # if no results, just add NA
    output[i, Q21 := list(NA)]
    output[i, Q22 := list(NA)]
    output[i, Q23 := list(NA)]
    output[i, Q24 := list(NA)]
    output[i, Q3 := list(NA)]
    next
  }
  for (j in 1:nrow(results)) {
    # j <- 1
    # find which team member X this is and add one (because first entry is self)
    x <- as.numeric(str_extract(
      colnames(results)[which(results[j, ] == email)],
      "\\d"
    )) +
      1
    if (length(x) == 0) {
      q21 <- c(q21, NA)
      q22 <- c(q22, NA)
      q23 <- c(q23, NA)
      q24 <- c(q24, NA)
      q3 <- c(q3, NA)
      next
    }
    q21 <- c(q21, results[j, get(str_c("Q2_", x, "_1"))])
    q22 <- c(q22, results[j, get(str_c("Q2_", x, "_2"))])
    q23 <- c(q23, results[j, get(str_c("Q2_", x, "_3"))])
    q24 <- c(q24, results[j, get(str_c("Q2_", x, "_4"))])
    q3 <- c(q3, results[j, get(str_c("Q3_", x))])
  }
  output[i, Q21 := list(q21)]
  output[i, Q22 := list(q22)]
  output[i, Q23 := list(q23)]
  output[i, Q24 := list(q24)]
  output[i, Q3 := list(q3)]
}

output[
  !is.na(Q21),
  Q21_mean := sapply(Q21, function(x) {
    mean(as.numeric(unlist(x)), na.rm = TRUE)
  }),
  by = Email
]
output[
  !is.na(Q22),
  Q22_mean := sapply(Q22, function(x) {
    mean(as.numeric(unlist(x)), na.rm = TRUE)
  }),
  by = Email
]
output[
  !is.na(Q23),
  Q23_mean := sapply(Q23, function(x) {
    mean(as.numeric(unlist(x)), na.rm = TRUE)
  }),
  by = Email
]
output[
  !is.na(Q24),
  Q24_mean := sapply(Q24, function(x) {
    mean(as.numeric(unlist(x)), na.rm = TRUE)
  }),
  by = Email
]
output[
  !is.na(Q3),
  Q3_mean := sapply(Q3, function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)),
  by = Email
]

output[!is.na(Q21), Q21_normalized := (Q21_mean * 12.5) + 37.5]
output[!is.na(Q22), Q22_normalized := (Q22_mean * 12.5) + 37.5]
output[!is.na(Q23), Q23_normalized := (Q23_mean * 12.5) + 37.5]
output[!is.na(Q24), Q24_normalized := (Q24_mean * 12.5) + 37.5]
output[!is.na(Q3), Q3_normalized := Q3_mean * n]

output[, Q3_shifted := Q3_normalized / 5]
output[Q3_shifted < 10, Q3_shifted := 10]
output[Q3_shifted > 40, Q3_shifted := 40]
output[,
  Q3_shifted := (0.65 + (0.0225 * Q3_shifted) - (0.00025 * Q3_shifted^2)) * 100
]

output[,
  PeerEvaluationScore := (Q21_normalized +
    Q22_normalized +
    Q23_normalized +
    Q24_normalized +
    Q3_shifted) /
    5
]

output[, PeerEvaluationScore_Correction := PeerEvaluationScore]
output[
  (Email %in% check_q2_range$RecipientEmail),
  PeerEvaluationScore_Correction := PeerEvaluationScore_Correction - 8
]
output[
  (Email %in% check_q3_min$RecipientEmail),
  PeerEvaluationScore_Correction := PeerEvaluationScore_Correction - 8
]
output[
  (Email %in% check_q3_sum$RecipientEmail),
  PeerEvaluationScore_Correction := PeerEvaluationScore_Correction - 8
]

# Plot the original vs shifted distribution
ggplot() +
  # Original distribution
  geom_histogram(
    data = output,
    aes(x = Q3_normalized, fill = "Original"),
    bins = 20,
    alpha = 0.5
  ) +
  # Shifted distribution
  geom_histogram(
    data = output,
    aes(x = Q3_shifted, fill = "Shifted"),
    bins = 20,
    alpha = 0.5
  ) +
  scale_fill_manual(values = c("Original" = "#4285F4", "Shifted" = "#DB4437")) +
  labs(
    title = "Distribution of Peer Evaluation Scores",
    subtitle = "Original vs Shifted (min = 50) distribution",
    x = "Peer Evaluation Score",
    y = "Count",
    fill = "Distribution",
    caption = "Data from Qualtrics Team Peer Review Survey"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold"),
    axis.title = element_text(face = "bold"),
    legend.position = "top"
  )

## Looking at the distribution of Q3_normalized
# Warning message:
# The dot-dot notation (`..count..`) was deprecated in ggplot2 3.4.0.
# ℹ Please use `after_stat(count)` instead.
# This warning is displayed once every 8 hours.
ggplot(output, aes(x = Q3_normalized)) +
  geom_histogram(bins = 20, fill = "#4285F4", color = "white", alpha = 0.8) +
  geom_density(aes(y = ..count.. * 0.8), color = "#DB4437", linewidth = 1) +
  geom_rug(alpha = 0.5, color = "#0F9D58") +
  labs(
    title = "Distribution of Peer Evaluation Scores",
    subtitle = "Based on point allocation among team members (Q3)",
    x = "Peer Evaluation Score",
    y = "Count",
    caption = "Data from Qualtrics Team Peer Review Survey"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold"),
    axis.title = element_text(face = "bold")
  )

fwrite(output, output_filename, row.names = FALSE)

## Format for sending emails

output_emails <- output[, .(
  Email,
  Subject = output_email_subject,
  Body = "",
  Q21 = Q21_normalized,
  Q22 = Q22_normalized,
  Q23 = Q23_normalized,
  Q24 = Q24_normalized,
  Q3 = Q3_shifted,
  Total = PeerEvaluationScore,
  Total_Corrected = PeerEvaluationScore_Correction
)]

fwrite(output_emails, output_email_filename, row.names = FALSE)
# after creating the email file, open it in Excel and add the body of the email
# =CONCAT("Does the member do an appropriate quantity of work?",CHAR(10), ROUND(D2,2),CHAR(10),CHAR(10),"How about the quality of the member's work? ",CHAR(10),ROUND(E2,2),CHAR(10),CHAR(10),"Rate the member's attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).",CHAR(10),ROUND(F2,2),CHAR(10),CHAR(10),"Rate the overall value of the member's technical contribution.",CHAR(10),ROUND(G2,2),CHAR(10),CHAR(10),"Overall Contribution",CHAR(10),ROUND(H2,2),CHAR(10),CHAR(10),"Total Score (mean of above scores)",CHAR(10),ROUND(I2,2))
# then save it as an XLSM file and add a new VBA module (see `./send-emails-macos.vba`)

# merge with gradebook

gradebook <- fread(gradebook_filename, header = TRUE)

output[, `SIS Login ID` := Email]

gradebook <- merge(
  gradebook,
  # output[, .(`SIS Login ID`, PeerEvaluationScore_Correction)],
  output[, .(`SIS Login ID`, PeerEvaluationScore)],
  by = "SIS Login ID",
  all.x = TRUE
)

# gradebook[,
#   `Final Peer Evaluation Survey (10265726)` := PeerEvaluationScore_Correction /
#     4
# ]
gradebook[,
  `Final Peer Evaluation Survey (10265726)` := PeerEvaluationScore
]
gradebook[, PeerEvaluationScore := NULL]

gradebook[
  is.na(`Final Peer Evaluation Survey (10265726)`),
  # `Final Peer Evaluation Survey (10265726)` := 12.5
  `Final Peer Evaluation Survey (10265726)` := 50
]

# re-order columns to have the new score at the end
# Student
# ID
# SIS User ID
# SIS Login ID
# Section
# Final Peer Evaluation Survey (10265726)
gradebook <- gradebook[, .(
  Student,
  ID,
  `SIS User ID`,
  `SIS Login ID`,
  Section,
  `Final Peer Evaluation Survey (10265726)`
)]

fwrite(gradebook, gradebook_updated_filename, row.names = FALSE)

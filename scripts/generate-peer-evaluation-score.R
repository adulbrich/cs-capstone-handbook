library(data.table)
library(stringr)
library(ggplot2)

# Go to Qualtrics, select the project, and click the Data & Analysis tab.
# Click on the Export & Import tab, and select Export Data.
# Select the CSV format, check Download all fields, Export labels, and click Download.

filename_groups <- "data/2025-04-10-project-groups.csv"

team_sizes <- fread(filename_groups, header = TRUE)
team_sizes <- team_sizes[, .(n = .N), by = group_name]
setnames(team_sizes, "group_name", "Team")

filename <- "data/2025-05-05-peer-review-survey.csv"

dt <- fread(filename, header = TRUE)

labels <- data.table(question_id = colnames(dt), question_label=as.list(dt[1,]))
dt <- dt[-1,]
dt <- dt[-1,]

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

# How about the quality of the member’s work?
# labels[,Q2_X_2]

# Rate the member’s attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).
# labels[,Q2_X_3]

# Rate the overall value of the member’s technical contribution.
# labels[,Q2_X_4]

### Question 3
# Take 100 points, and divide them among the N team members, including yourself. Give points based on your opinion of what proportion of the credit each member deserves. You may consider quality and quantity of contributions, team-player attitude, and/or any aspects that you feel are relevant. You must give yourself at least 100/N points, whether you honestly feel you deserve them or not. (This is to avoid an unrealistic “self-incrimination” requirement.)
# X goes from 1 to 9, 1 is self, 2-9 are team members
# labels[,Q3_X]

output <- dt[, .(Name = str_c(RecipientLastName, ", " , RecipientFirstName),Email=RecipientEmail, Team, n, `Team Member 1`, `Team Member 2`, `Team Member 3`,`Team Member 4`,`Team Member 5`,`Team Member 6`,`Team Member 7`,`Team Member 8`)]
# need to make sure results are unique

# TODO: need to check that self was at least 100/N because otherwise it boosts the other scores
for (i in 1:nrow(output)) {
    # i <- 1
   team <- output[i, Team]
   email <- output[i, Email]
   results <- dt[Team == team & RecipientEmail != email,]
   q21 <- c()
   q22 <- c()
   q23 <- c()
   q24 <- c()
   q3  <- c()
   if (nrow(results) == 0) {
       # if no results, just add NA
       output[i, Q21 := list(NA)]
       output[i, Q22 := list(NA)]
       output[i, Q23 := list(NA)]
       output[i, Q24 := list(NA)]
       output[i, Q3  := list(NA)]
       next
   }
   for (j in 1:nrow(results)) {
       # j <- 1
       # find which team member X this is and add one (because first entry is self)
       x <- as.numeric(str_extract(colnames(results)[which(results[j,] == email)], "\\d")) + 1
       if (length(x) == 0) {
           q21 <- c(q21, NA)
           q22 <- c(q22, NA)
           q23 <- c(q23, NA)
           q24 <- c(q24, NA)
           q3  <- c(q3,  NA)
           next
       }
       q21 <- c(q21, results[j, get(str_c("Q2_",x,"_1"))])
       q22 <- c(q22, results[j, get(str_c("Q2_",x,"_2"))])
       q23 <- c(q23, results[j, get(str_c("Q2_",x,"_3"))])
       q24 <- c(q24, results[j, get(str_c("Q2_",x,"_4"))])
       q3  <- c(q3,  results[j, get(str_c("Q3_",x))])
   }
   output[i, Q21 := list(q21)]
   output[i, Q22 := list(q22)]
   output[i, Q23 := list(q23)]
   output[i, Q24 := list(q24)]
   output[i, Q3  := list(q3 )]
}

output[!is.na(Q21), Q21_mean := sapply(Q21, function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)), by = Email]
output[!is.na(Q22), Q22_mean := sapply(Q22, function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)), by = Email]
output[!is.na(Q23), Q23_mean := sapply(Q23, function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)), by = Email]
output[!is.na(Q24), Q24_mean := sapply(Q24, function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)), by = Email]
output[!is.na(Q3) , Q3_mean  := sapply(Q3 , function(x) mean(as.numeric(unlist(x)), na.rm = TRUE)), by = Email]

output[!is.na(Q21), Q21_normalized := (Q21_mean * 50 / 3) + (100 / 3)]
output[!is.na(Q22), Q22_normalized := (Q22_mean * 50 / 3) + (100 / 3)]
output[!is.na(Q23), Q23_normalized := (Q23_mean * 50 / 3) + (100 / 3)]
output[!is.na(Q24), Q24_normalized := (Q24_mean * 50 / 3) + (100 / 3)]
output[!is.na(Q3) , Q3_normalized   := Q3_mean * n]

output <- output[Email != "saucierd@oregonstate.edu"]

output[, Q3_shifted := Q3_normalized / 4]
output[Q3_shifted < 10, Q3_shifted := 10]
output[Q3_shifted > 40, Q3_shifted := 40]
output[, Q3_shifted := (0.65 + (0.0225 * Q3_shifted) - (0.00025 * Q3_shifted ^ 2)) * 100]

output[, PeerEvaluationScore := (Q21_normalized + Q22_normalized + Q23_normalized + Q24_normalized + Q3_shifted) / 5]

# Plot the original vs shifted distribution
ggplot() +
  # Original distribution
  geom_histogram(data = output, aes(x = Q3_normalized, fill = "Original"), 
                 bins = 20, alpha = 0.5) +
  # Shifted distribution
  geom_histogram(data = output, aes(x = Q3_shifted, fill = "Shifted"), 
                 bins = 20, alpha = 0.5) +
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

fwrite(output, "data/2025-05-05-peer-review-survey-output.csv", row.names = FALSE)

## Format for sending emails

output_emails <- output[, .(Email, Subject = "CS463 Peer Review Results", Body="", Q21 = Q21_normalized, Q22 = Q22_normalized, Q23 = Q23_normalized, Q24 = Q24_normalized, Q3 = Q3_shifted, Total = PeerEvaluationScore)]

fwrite(output_emails, "data/2025-05-05-peer-review-survey-emails.csv", row.names = FALSE)
# after creating the email file, open it in Excel and add the body of the email
# =CONCAT("Does the member do an appropriate quantity of work?",CHAR(10), ROUND(D2,2),CHAR(10),CHAR(10),"How about the quality of the member’s work? ",CHAR(10),ROUND(E2,2),CHAR(10),CHAR(10),"Rate the member’s attitude as a team player (eager to do assigned work, communicated with others, kept appointments, etc.).",CHAR(10),ROUND(F2,2),CHAR(10),CHAR(10),"Rate the overall value of the member’s technical contribution.",CHAR(10),ROUND(G2,2),CHAR(10),CHAR(10),"Overall Contribution",CHAR(10),ROUND(H2,2),CHAR(10),CHAR(10),"Total Score (mean of above scores)",CHAR(10),ROUND(I2,2))
# then save it as an XLSM file and add a new VBA module (see `./send-emails-macos.vba`)


# merge with gradebook

gradebook <- fread("data/2025-06-16T1035_Grades-SOFTWARE_ENGINEERING_PROJECT_(CS_463_001_S2025).csv", header = TRUE)

gradebook[,`Mid-Term Peer Review (Qualtrics Survey) (10083801)` := as.numeric(`Mid-Term Peer Review (Qualtrics Survey) (10083801)`)]
gradebook[,`Mid-Term Peer Review (Qualtrics Survey) (10083801)` := 0]
gradebook[`SIS Login ID` %in% dt$RecipientEmail, `Mid-Term Peer Review (Qualtrics Survey) (10083801)` := 3.0]

fwrite(gradebook, "data/2025-06-16T1035_Grades-SOFTWARE_ENGINEERING_PROJECT_(CS_463_001_S2025)-updated.csv", row.names = FALSE)

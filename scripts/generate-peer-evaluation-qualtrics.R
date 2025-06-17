# This script is designed for the Qualtrics Team Peer Review Survey from Spring 2025.
# This scripts takes the projects from Canvas with the following fields:
# - name,
# - canvas_user_id,
# - user_id,
# - login_id,
# - sections,
# - group_name,
# - canvas_group_id,
# - group_id
# And creates a Qualtrics contact list with the following fields:
# - Email,
# - First Name,
# - Last Name,
# - Team,
# - Team Member i, with i = 1, 2, ..., n (n being the largest team size)

# Packages
library(data.table)
library(stringr)

filename <- "data/2025-04-10-project-groups.csv"

dt <- fread(filename, header = TRUE)

# Qualtrics Contact List Fields
# - Email --> login_id
# - First Name --> second part of name (after comma)
# - Last Name --> first part of name (before comma)
# - Team --> group_name
# - Team Member i --> loop through group names and exclude current student

# TODO
# - figure out largest team --> size n
# - create n columns for team members 1 through n

contacts <- dt[,.(Email = login_id, `First Name` = str_extract(name, "(?<=,).+$"), `Last Name` = str_extract(name, "^.+(?=,)"), Team = group_name)]

max_n <- max(dt[, .N, by = group_name]$N)-1

# Create columns for team members (excluding self)
for (i in 1:max_n) {
  # Initialize the new column with empty strings
  contacts[, paste0("Team Member ", i) := ""]
}

# Populate team member columns for each student
for (i in 1:nrow(contacts)) {
  # Get current student's email and team
  current_email <- contacts[i, Email]
  current_team <- contacts[i, Team]
  
  # Get all team members except the current student
  team_members <- dt[group_name == current_team & login_id != current_email, login_id]
  
  # Fill in team member columns for this student
  if (length(team_members) > 0) {
    for (j in 1:length(team_members)) {
        contacts[i, paste0("Team Member ", j) := team_members[j]]
    }
  }
}

fwrite(contacts, "data/qualtrics-team-peer-review-2025.csv", row.names = FALSE)

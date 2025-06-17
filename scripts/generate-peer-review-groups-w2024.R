# This script is designed for the Canvas Course Rooster that contains groups.

# Packages
library(data.table)

filename <- "data/2024-12-16-course-rooster.csv"

# Read the CSV file, skipping the label row and the third row
dt <- fread(filename, header = TRUE) 

# Shuffle the data
set.seed(123)  # For reproducibility
dt <- dt[sample(.N)]

n_students <- nrow(dt)
n_groups <- length(unique(dt$group_name))

s_pr_groups <- 4
n_pr_groups <- floor(n_students / s_pr_groups)


# Function to interleave rows from each group
# TODO: to be improved because one group is so big that it duplicates anyway at the end
interleave_groups <- function(data, column_name) {
  split_data <- split(data, data[[column_name]])
  group_sizes <- sapply(split_data, nrow)
  split_data <- split_data[order(-group_sizes)]
  max_length <- max(sapply(split_data, nrow))
  interleaved_data <- rbindlist(lapply(1:max_length, function(i) {
    rbindlist(lapply(split_data, function(group) {
      if (i <= nrow(group)) {
        return(group[i])
      } else {
        return(NULL)
      }
    }))
  }))
  return(interleaved_data)
}

# Interleave the data
temp <- interleave_groups(dt, "group_name")

if (n_students %% s_pr_groups == 0) {
  s_pr_groups <- rep(s_pr_groups, n_pr_groups)
} else {
  s_pr_groups <- c(rep(s_pr_groups, n_pr_groups-1), s_pr_groups+1)
}

temp <- dt[, .(login_id, group_name)]
pr_groups <- data.table()
pr_group_id <- 1

for (i in s_pr_groups) {
  
  group <- temp[1:i,]

  if (length(unique(group$group_name)) == i) {
    pr_groups <- rbind(pr_groups, cbind(pr_group_id))
    pr_group_id <- pr_group_id + 1
  } else {
    temp <- temp[sample(.N)]
  }
  
  temp <- temp[-(1:i)]

}

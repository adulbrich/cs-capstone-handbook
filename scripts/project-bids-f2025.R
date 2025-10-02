library(data.table)

# load project bids from Qualtrics survey export
bids <- fread("data/2025-09-30-project-bids.csv")
setnames(bids, "Recipient Last Name", "name")
bids <- bids[name != "", ]

# load current teams (pre-approved projects)
current_teams <- fread("data/2025-09-30-current-teams.csv")
current_teams <- current_teams[group_name != "", ]

# manual overal check
overlap <- merge(bids, current_teams, by = "name")
fwrite(overlap, "data/2025-09-30-bids-current-teams-overlap.csv")

# remove current team members from bids
bids <- bids[!name %in% current_teams$name, ]

bids[, `Recipient Email` := NULL]
bids[, `External Data Reference` := NULL]

# separate qualitative answers
custom_cols <- c(
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 1",
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 2",
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 3",
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 4",
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 5",
  "Write a compelling reason for each choice. This statement will act as a tie breaker between people with similar preferences. - reason for choice 6",
  "Sometimes we have important projects that are overlooked by students in the bidding survey. We often ask for volunteers to switch projects. Would you like to be contacted about one of these projects? - Selected Choice",
  "Sometimes we have important projects that are overlooked by students in the bidding survey. We often ask for volunteers to switch projects. Would you like to be contacted about one of these projects? - it depends; see: - Text",
  "Select as many of the following as applies to you: - Selected Choice",
  "Select as many of the following as applies to you: - I'm the following CS track: - Text",
  "List the name of one person in class you'd prefer not to work with (Optional).",
  "Is there anything else you'd like to share with the instructors of the course?"
)
existing_custom_cols <- intersect(custom_cols, names(bids))
missing_custom_cols <- setdiff(custom_cols, names(bids))
if (length(missing_custom_cols) > 0) {
  warning(sprintf(
    "Missing %d custom columns in bids: %s",
    length(missing_custom_cols),
    paste(missing_custom_cols, collapse = "; ")
  ))
}

# identify project columns (all non-name, non-custom fields)
project_cols <- setdiff(names(bids), c("name", custom_cols))

# coerce project rank columns to numeric (quietly)
suppressWarnings(
  bids[, (project_cols) := lapply(.SD, as.numeric), .SDcols = project_cols]
)

# derive ordered project choices per row from ranks 1..6
bids[, paste0("choice_", 1:6) := {
  rvals <- unlist(.SD, use.names = FALSE)
  pnames <- names(.SD)
  pos <- match(1:6, rvals)
  ch <- ifelse(is.na(pos), NA_character_, pnames[pos])
  as.list(ch)
}, .SDcols = project_cols, by = .I]

# save project choices with justifications
qualitative_answers <- bids[, c("name", existing_custom_cols, paste0("choice_", 1:6)), with = FALSE]
setcolorder(qualitative_answers, c("name", paste0("choice_", 1:6)))
fwrite(qualitative_answers, "data/2025-09-30-bids-qualitative-answers.csv")

# project choices without justifications
project_choices <- bids[, c("name", project_cols, paste0("choice_", 1:6)), with = FALSE]
setcolorder(project_choices, c("name", paste0("choice_", 1:6)))
fwrite(project_choices, "data/2025-09-30-bids-project-choices.csv")

# list of all projects and the number of bids on each (any rank 1–6)
proj_long <- melt(
  bids[, c("name", project_cols), with = FALSE],
  id.vars = "name",
  variable.name = "project",
  value.name = "rank",
  variable.factor = FALSE
)

# count bids per project (exclude NA ranks), then include projects with zero bids
counts <- proj_long[!is.na(rank), .N, by = project]
all_projects <- data.table(project = project_cols)

project_bid_counts <- merge(all_projects, counts, by = "project", all.x = TRUE)
project_bid_counts[is.na(N), N := 0L]
setnames(project_bid_counts, "N", "bids")
setorder(project_bid_counts, -bids, project)

fwrite(project_bid_counts, "data/2025-09-30-project-bids-counts.csv")


suppressPackageStartupMessages({
  if (!requireNamespace("ompr", quietly = TRUE) ||
      !requireNamespace("ompr.roi", quietly = TRUE) ||
      !requireNamespace("ROI.plugin.glpk", quietly = TRUE)) {
    stop("Please install required packages: install.packages(c('ompr','ompr.roi','ROI.plugin.glpk'))")
  }
  library(ompr)
  library(ompr.roi)
  library(ROI.plugin.glpk)
})

students <- unique(bids$name)

# Configure team counts per project:
# - Default: 1 team
# - Special: up to 2 teams
# - Dropped: 0 teams
all_projects_vec <- project_cols
max_teams <- setNames(rep(1L, length(all_projects_vec)), all_projects_vec)

special_two <- intersect(c("Low-Level Game Technology","VRyu"), names(max_teams))
max_teams[special_two] <- 2L

# Drop some projects completely
for (p in c(
  "TinyLines",
  "Enhancing Localized Deformation Analysis in Materials Science Using AI/ML",
  "AI-Enhanced Neurofeedback Calibration",
  "Mars Rover Autonomy Capstone",
  "LLM-DRIVEN MIGRATION OF LEGACY�",
  "MARS Rover Simulation Team",
  "Digiclips",
  "Empowering Instructors with AI-Enhanced Teaching Tools",
  "(NVIDIA) Genomic Analysis and Design with Deep Learning",
  "High-Level Waste Glass App (PNNL Contractor)",
  "OWASP for GenAI",
  "Securing Agent-to-Agent Communication in Generative AI Systems"
)) {
  if (p %in% names(max_teams)) max_teams[p] <- 0L
}

# Build team slots (one row per potential team)
slots_dt <- data.table(project = character(), slot = integer())
for (p in names(max_teams)) {
  mt <- max_teams[[p]]
  if (mt > 0L) {
    slots_dt <- rbind(slots_dt, data.table(project = p, slot = seq_len(mt)))
  }
}
if (nrow(slots_dt) == 0L) stop("No team slots available after applying project constraints.")
slots_dt[, k := .I]

# Per-slot capacity (defaults 3..5), with overrides
min_cap <- rep(3L, nrow(slots_dt))
max_cap <- rep(5L, nrow(slots_dt))

vryu_idx <- slots_dt[project == "VRyu", k]
if (length(vryu_idx)) {
  min_cap[vryu_idx] <- 3L
  max_cap[vryu_idx] <- 3L
}

sky_idx <- slots_dt[project == "Skyborn Pirate Game (Working Title)", k]
if (length(sky_idx)) {
  min_cap[sky_idx] <- 1L
  max_cap[sky_idx] <- 1L
}

emotion_idx <- slots_dt[project == "Emotion-Based Control System for Drone Swarm Choreography", k]
if (length(emotion_idx)) {
  min_cap[emotion_idx] <- 2L
  max_cap[emotion_idx] <- 3L
}

guardianly_idx <- slots_dt[project == "Guardianly", k]
if (length(guardianly_idx)) {
  min_cap[guardianly_idx] <- 2L
  max_cap[guardianly_idx] <- 3L
}

ha_idx <- slots_dt[project == "LLM-Powered Conversational Agent for Home Assistant", k]
if (length(ha_idx)) {
  min_cap[ha_idx] <- 2L
  max_cap[ha_idx] <- 3L
}

college_idx <- slots_dt[project == "AI Scholarship Agent: CollegeAppAssist", k]
if (length(college_idx)) {
  min_cap[college_idx] <- 3L
  max_cap[college_idx] <- 4L
}

# Build long preferences and weights
pref <- melt(
  bids[, c("name", project_cols), with = FALSE],
  id.vars = "name",
  variable.name = "project",
  value.name = "rank",
  variable.factor = FALSE
)

# Map ranks (1..6) to weights; NA/unranked -> 0
rank_to_weight <- function(r) {
  r <- as.integer(r)
  w <- integer(length(r))
  w[r == 1L] <- 100L
  w[r == 2L] <- 85L
  w[r == 3L] <- 75L
  w[r == 4L] <- 70L
  w[r == 5L] <- 0L
  w[r == 6L] <- 0L
  w[is.na(r)] <- 0L
  w
}

# Keep only projects that have team slots
pref <- pref[project %in% unique(slots_dt$project)]

pref[, weight := rank_to_weight(rank)]

# Deprioritize "Meal Planning Web App" (scale down weights)
pref[project == "Meal Planning Web App", weight := as.integer(round(weight * 0.25))]

# Expand weights to team slots (each project slot inherits project weight)
pref_slots <- merge(pref, slots_dt[, .(project, k)], by = "project", allow.cartesian = TRUE)

# Index students
student_index <- data.table(name = students)[, i := .I]
n_students <- nrow(student_index)
n_slots <- nrow(slots_dt)

# Weight matrix W[i, k]
pref_idx <- merge(pref_slots, student_index, by = "name")
W <- matrix(0, nrow = n_students, ncol = n_slots)
if (nrow(pref_idx)) W[cbind(pref_idx$i, pref_idx$k)] <- pref_idx$weight

# Eligibility: only allow assignments to projects the student ranked (1..6)
E <- matrix(0L, nrow = n_students, ncol = n_slots)
if (nrow(pref_idx)) {
  elig_idx <- pref_idx[!is.na(rank) & rank %in% 1:6, .(i, k)]
  if (nrow(elig_idx)) E[cbind(elig_idx$i, elig_idx$k)] <- 1L
}
no_elig <- which(rowSums(E) == 0L)
if (length(no_elig)) {
  warning(sprintf(
    "Some students have no eligible ranked projects after constraints: %s",
    paste(student_index$name[no_elig], collapse = "; ")
  ))
}

# Capacity sanity check (max capacity must cover all students)
max_capacity <- sum(max_cap) # account for per-slot caps
if (n_students > max_capacity) {
  warning(sprintf(
    "Infeasible: %d students but max capacity is %d (need more teams or larger caps).",
    n_students, max_capacity
  ))
}

# Build the model
model <- MIPModel() |>
  add_variable(y[i, k], i = 1:n_students, k = 1:n_slots, type = "binary") |>
  add_variable(a[k], k = 1:n_slots, type = "binary") |>
  set_objective(sum_expr(W[i, k] * y[i, k], i = 1:n_students, k = 1:n_slots), "max") |>
  add_constraint(sum_expr(y[i, k], k = 1:n_slots) == 1, i = 1:n_students) |>
  add_constraint(y[i, k] <= E[i, k], i = 1:n_students, k = 1:n_slots) |>
  add_constraint(sum_expr(y[i, k], i = 1:n_students) >= min_cap[k] * a[k], k = 1:n_slots) |>
  add_constraint(sum_expr(y[i, k], i = 1:n_students) <= max_cap[k] * a[k], k = 1:n_slots)

# Enforce at least one team per project when feasible from rankings
proj_slot_map <- slots_dt[, .(k_list = list(k)), by = project]

# Minimum headcount required to activate any slot for each project (scalar)
proj_req <- proj_slot_map[, .(
  project,
  k_list,
  min_needed = as.integer(sapply(k_list, function(idx) min(min_cap[idx])))
)]

elig_by_project <- pref[!is.na(rank) & rank %in% 1:6, .(eligible_students = uniqueN(name)), by = project]
proj_req <- merge(proj_req, elig_by_project, by = "project", all.x = TRUE)
proj_req[is.na(eligible_students), eligible_students := 0L]

enforceable <- proj_req[eligible_students >= min_needed]
not_enforceable <- setdiff(proj_req$project, enforceable$project)
if (length(not_enforceable)) {
  warning(sprintf(
    "Cannot guarantee assignment for %d project(s) due to insufficient eligible students: %s",
    length(not_enforceable), paste(not_enforceable, collapse = "; ")
  ))
}

for (kk in enforceable$k_list) {
  model <- model |>
    add_constraint(sum_expr(a[k], k = unlist(kk)) >= 1)
}

# Force exactly two VRyu teams active (each exactly 3 due to caps)
if (length(vryu_idx)) {
  model <- model |>
    add_constraint(sum_expr(a[k], k = vryu_idx) == 2)
}

solution <- solve_model(model, with_ROI(solver = "glpk", verbose = TRUE))
assign_y <- as.data.table(get_solution(solution, y[i, k]))
assign_y <- assign_y[value > 0.5]

if (nrow(assign_y) != n_students) {
  warning("Some students may be unassigned; check solver status/capacity.")
}

# Build assignment table: name, project, team (slot within project), and original rank
assignments <- merge(assign_y[, .(i, k)], student_index[, .(i, name)], by = "i", all.x = TRUE)
assignments <- merge(assignments, slots_dt[, .(k, project, team = slot)], by = "k", all.x = TRUE)

rank_lookup <- pref[, .(name, project, rank)]
assignments <- merge(assignments, rank_lookup, by = c("name", "project"), all.x = TRUE)

setorder(assignments, project, team, name)

# Write outputs
fwrite(assignments[, .(name, project, team, rank)], "data/2025-09-30-team-assignments.csv")

team_sizes <- assignments[, .N, by = .(project, team)][order(project, team)]
fwrite(team_sizes, "data/2025-09-30-team-sizes.csv")

# Unassigned students (not present in assignments)
assigned_students <- unique(assignments$name)
unassigned_students <- data.table(name = setdiff(students, assigned_students))
fwrite(unassigned_students, "data/2025-09-30-unassigned-students.csv")

# Projects with no teams formed (had slots but no assignments)
projects_with_slots <- unique(slots_dt$project)
projects_without_teams <- data.table(project = setdiff(projects_with_slots, unique(assignments$project)))
fwrite(projects_without_teams, "data/2025-09-30-projects-without-teams.csv")

# Choice satisfaction (counts and percentages by rank 1..6)
n_assigned <- uniqueN(assignments$name)
n_total <- length(students)

rank_labels <- c("first", "second", "third", "fourth", "fifth", "sixth")

rank_dist <- assignments[!is.na(rank), .(count = .N), by = rank]
rank_dist <- rank_dist[CJ(rank = 1:6, unique = TRUE), on = "rank"]
rank_dist[is.na(count), count := 0L][order(rank)]
rank_dist[, label := rank_labels[rank]]
rank_dist[, pct_assigned := if (n_assigned > 0) round(100 * count / n_assigned, 1) else NA_real_]
rank_dist[, pct_all := if (n_total > 0) round(100 * count / n_total, 1) else NA_real_]

setcolorder(rank_dist, c("rank", "label", "count", "pct_assigned", "pct_all"))
fwrite(rank_dist, "data/2025-09-30-choice-satisfaction.csv")

# Optional: console summary
cat("Choice satisfaction (assigned-only %):\n")
for (r in 1:6) {
  row <- rank_dist[rank == r]
  cat(sprintf("  %s: %d (%.1f%%)\n", row$label, row$count, row$pct_assigned))
}

# Optional: quick console summary
cat(sprintf("Assigned %d students across %d active teams.\n",
            n_students, nrow(team_sizes)))
cat(sprintf("Unassigned students: %d | Projects without teams: %d\n",
            nrow(unassigned_students), nrow(projects_without_teams)))


students_all <- fread("data/2025-10-01-students.csv")
setnames(students_all, "Login ID", "email")

setnames(current_teams, "login_id", "email")

bids <- fread("data/2025-09-30-project-bids.csv")
setnames(bids, "Recipient Last Name", "name")
bids <- bids[name != "", ]
setnames(bids, "Recipient Email", "email")


taken_emails <- unique(c(bids$email, current_teams$email))
students_remaining <- unique(students_all[!(email %chin% taken_emails), .(email)])

# Save result
fwrite(students_remaining, "data/2025-10-01-students-unresponsive-emails.csv")

cat(sprintf(
  "Unresponsive (emails only): %d remaining of %d in roster\n",
  nrow(students_remaining), nrow(unique(students_all[, .(email)]))
))
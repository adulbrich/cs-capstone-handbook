# This scripts computes the project partner end-of-term survey scores.
# It is based on the weights defined for each course (CS461, CS462, CS463).

# Packages
library(data.table)
library(stringr)

# Export from Qualtrics as CSV (values, not labels)
filename_input <- "data/2025-12-11-pp-survey-values.csv"

# Comment/Uncomment based on course/term
course_id <- "CS461"
#course_id <- "CS462"
#course_id <- "CS463"

# Weights for each facet by course
# Must align with https://capstone.alexulbrich.com/project-evaluation/breakdown/#project-partner-assessment-facets
facet_weights <- data.table(
    Facet = c(
        "Reflection",
        "Requirements",
        "Design",
        "Verification",
        "Teamwork",
        "Communication"
    ),
    CS461 = c(15, 40, 15, 5, 15, 10),
    CS462 = c(15, 15, 40, 10, 10, 10),
    CS463 = c(15, 5, 20, 40, 10, 10)
)

# Output filenames
filename_output <- str_c(str_remove(filename_input, ".csv"), "-GRADES.csv")
filename_comments_output <- str_c(
    str_remove(filename_input, ".csv"),
    "-COMMENTS.csv"
)

# Read the CSV file, skipping the label row and the third row
dt <- fread(filename_input, header = TRUE)
dt <- dt[Status == 0 & Finished == 1, ]

### Q1: Rate the team's ability to critically analyze learnings and project experiences. (Reflection facet)

coeff <- facet_weights[Facet == "Reflection", get(course_id)] / 100

dt[Q1 == 1, Reflection := coeff * 100]
dt[Q1 == 2, Reflection := coeff * 90]
dt[Q1 == 3, Reflection := coeff * 80]
dt[Q1 == 4, Reflection := coeff * 70]
dt[Q1 == 5, Reflection := coeff * 50]

### Q2: Rate the team's ability to gather, document, and prioritize project requirements. (Requirements and Specifications facet)

coeff <- facet_weights[Facet == "Requirements", get(course_id)] / 100

dt[Q2 == 1, Requirements := coeff * 100]
dt[Q2 == 2, Requirements := coeff * 90]
dt[Q2 == 3, Requirements := coeff * 80]
dt[Q2 == 4, Requirements := coeff * 70]
dt[Q2 == 5, Requirements := coeff * 50]

### Q3: Rate the team's ability to ship a functional project. (Design, Implementation, and Deployment facet)

coeff <- facet_weights[Facet == "Design", get(course_id)] / 100

dt[Q3 == 1, Design := coeff * 100]
dt[Q3 == 2, Design := coeff * 90]
dt[Q3 == 3, Design := coeff * 80]
dt[Q3 == 4, Design := coeff * 70]
dt[Q3 == 5, Design := coeff * 50]

### Q4: Rate the team's ability to work together and move the project forward. (Teamwork facet)

coeff <- facet_weights[Facet == "Teamwork", get(course_id)] / 100

dt[Q4 == 1, Teamwork := coeff * 100]
dt[Q4 == 2, Teamwork := coeff * 90]
dt[Q4 == 3, Teamwork := coeff * 80]
dt[Q4 == 4, Teamwork := coeff * 70]
dt[Q4 == 5, Teamwork := coeff * 50]

### Q5: Rate the team's ability to communicate and present their work with reference to context and audience. (Communication facet)

coeff <- facet_weights[Facet == "Communication", get(course_id)] / 100

dt[Q5 == 1, Communication := coeff * 100]
dt[Q5 == 2, Communication := coeff * 90]
dt[Q5 == 3, Communication := coeff * 80]
dt[Q5 == 4, Communication := coeff * 70]
dt[Q5 == 5, Communication := coeff * 50]

### Q6L Outcome

coeff <- facet_weights[Facet == "Verification", get(course_id)] / 100

if (course_id == "CS461" || course_id == "CS462") {
    ### Q6: Rate the team's ability to verify and validate their work with reference to expectations set with you, the project partner or mentor. (Verification and Validation facet)

    dt[Q6 == 1, Verification := coeff * 100]
    dt[Q6 == 2, Verification := coeff * 90]
    dt[Q6 == 3, Verification := coeff * 80]
    dt[Q6 == 4, Verification := coeff * 70]
    dt[Q6 == 5, Verification := coeff * 50]
} else {
    # Q6: What type of project is the team working on? This will change the way you evaluate its outcome. Unsure? Check the description of our categories.
    # Option 1: Free and Open-Source Software (FOSS)
    # Option 2: Research
    # Option 3: Consultancy
    # Option 6: New Product or Game

    dt[Q6 == 1, Q6_Consolidated := `Q6 FOSS`]
    dt[Q6 == 2, Q6_Consolidated := `Q6 Research`]
    dt[Q6 == 3, Q6_Consolidated := `Q6 Consultant`]
    dt[Q6 == 6, Q6_Consolidated := `Q6 New Product`]

    dt[Q6_Consolidated == 1, Verification := coeff * 100]
    dt[Q6_Consolidated == 2, Verification := coeff * 90]
    dt[Q6_Consolidated == 3, Verification := coeff * 80]
    dt[Q6_Consolidated == 4, Verification := coeff * 70]
    dt[Q6_Consolidated == 5, Verification := coeff * 50]
}

# Team Total Score Output
dt[,
    Total := Reflection +
        Requirements +
        Design +
        Teamwork +
        Communication +
        Verification
]

# Write Scores to CSV
fwrite(
    dt[, .(
        Team,
        ProjectPartner = RecipientEmail,
        Reflection,
        Requirements,
        Design,
        Verification,
        Teamwork,
        Communication,
        Total,
        IndividualStudents = `Q7 Names`,
        IndividualNotes = `Q7 Comments`,
        GeneralNotes = Q9
    )],
    filename_output,
    row.names = FALSE
)

# Individual Scores
# Q7: Do you have any specific concerns with one or more students on your team?

individual_concerns <- dt[Q7 == 1, .()]

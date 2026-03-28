# This script is designed for the Qualtrics Project Partner Survey of Winter 2026.

# Packages
library(data.table)
library(stringr)

filename <- "data/2026-03-23-pp-survey-values.csv"

# Read the CSV file, skipping the label row and the third row
dt <- fread(filename, header = TRUE) # Skip label and third row

dt <- dt[Status == 0 & Finished == 1, ]

# Q1: Rate the team's ability to critically analyze learnings and project experiences. (Reflection facet)

dt[Q1 == 1, Reflection := 15]
dt[Q1 == 2, Reflection := 13.5]
dt[Q1 == 3, Reflection := 12]
dt[Q1 == 4, Reflection := 10.5]
dt[Q1 == 5, Reflection := 7.5]

# Q2: Rate the team's ability to gather, document, and prioritize project requirements. (Requirements and Specifications facet)

dt[Q2 == 1, Requirements := 15]
dt[Q2 == 2, Requirements := 13.5]
dt[Q2 == 3, Requirements := 12]
dt[Q2 == 4, Requirements := 10.5]
dt[Q2 == 5, Requirements := 7.5]

# Q3: Rate the team's ability to ship a functional project. (Design, Implementation, and Deployment facet)

dt[Q3 == 1, Design := 40]
dt[Q3 == 2, Design := 36]
dt[Q3 == 3, Design := 32]
dt[Q3 == 4, Design := 28]
dt[Q3 == 5, Design := 20]

# Q4: Rate the team's ability to work together and move the project forward. (Teamwork facet)

dt[Q4 == 1, Teamwork := 10]
dt[Q4 == 2, Teamwork := 9]
dt[Q4 == 3, Teamwork := 8]
dt[Q4 == 4, Teamwork := 7]
dt[Q4 == 5, Teamwork := 5]

# Q5: Rate the team's ability to communicate and present their work with reference to context and audience. (Communication facet)

dt[Q5 == 1, Communication := 10]
dt[Q5 == 2, Communication := 9]
dt[Q5 == 3, Communication := 8]
dt[Q5 == 4, Communication := 7]
dt[Q5 == 5, Communication := 5]

# Q6: Rate the team's ability to verify and validate their work with reference to expectations set with you, the project partner or mentor. (Verification and Validation facet)
dt[Q6 == 1, Verification := 10]
dt[Q6 == 2, Verification := 9]
dt[Q6 == 3, Verification := 8]
dt[Q6 == 4, Verification := 7]
dt[Q6 == 5, Verification := 5]
# TODO BUG: some answers have the value 6 instead of 1-5, need to investigate and clean those up

# Team Score Output
dt[,
    Total := Reflection +
        Requirements +
        Design +
        Teamwork +
        Communication +
        Verification
]
# dt[,.(Team=Q16, Name=Q17, Reflection, Requirements, Design, Teamwork, Communication, Verification, Total,IndividualStudents=`Q7 Names`, IndividualNotes=`Q7 Comments`, GeneralNotes=Q8)]
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
    "data/2026-03-23-pp-survey-processed.csv",
    row.names = FALSE
)

# Individual Scores
# Q7: Do you have any specific concerns with one or more students on your team?

individual_concerns <- dt[Q7 == 1, .()]

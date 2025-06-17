# This script is designed for the Qualtrics Project Partner Survey of Fall 2024.

# Packages
library(data.table)

filename <- "data/2024-12-13-pp-survey-values.csv"

# Read the CSV file, skipping the label row and the third row
dt <- fread(filename, header = TRUE)  # Skip label and third row

dt <- dt[Status == 0 & Finished == 1, ]

# Q1: Rate the team's ability to critically analyze learnings and project experiences. (Reflection facet)

dt[Q1 == 1, Reflection := 15]
dt[Q1 == 2, Reflection := 13.5]
dt[Q1 == 3, Reflection := 12]
dt[Q1 == 4, Reflection := 10.5]
dt[Q1 == 5, Reflection := 7.5]

# Q2: Rate the team's ability to gather, document, and prioritize project requirements. (Requirements and Specifications facet)

dt[Q2 == 1, Requirements := 40]
dt[Q2 == 2, Requirements := 36]
dt[Q2 == 3, Requirements := 32]
dt[Q2 == 4, Requirements := 28]
dt[Q2 == 5, Requirements := 20]

# Q3: Rate the team's ability to ship a functional project. (Design, Implementation, and Deployment facet)

dt[Q3 == 1, Design := 15]
dt[Q3 == 2, Design := 13.5]
dt[Q3 == 3, Design := 12]
dt[Q3 == 4, Design := 10.5]
dt[Q3 == 5, Design := 7.5]

# Q4: Rate the team's ability to work together and move the project forward. (Teamwork facet)

dt[Q4 == 1, Teamwork := 15]
dt[Q4 == 2, Teamwork := 13.5]
dt[Q4 == 3, Teamwork := 12]
dt[Q4 == 4, Teamwork := 10.5]
dt[Q4 == 5, Teamwork := 7.5]

# Q5: Rate the team's ability to communicate and present their work with reference to context and audience. (Communication facet)

dt[Q5 == 1, Communication := 10]
dt[Q5 == 2, Communication := 9]
dt[Q5 == 3, Communication := 8]
dt[Q5 == 4, Communication := 7]
dt[Q5 == 5, Communication := 5]

# Q6: What type of project is the team working on? This will change the way you evaluate its outcome. Unsure? Check the description of our categories.
# Option 1: Free and Open-Source Software (FOSS)
# Option 2: Research
# Option 3: Consultancy
# Option 6: New Product or Game

dt[Q6 == 1, Q6_Consolidated := `Q6 FOSS`]
dt[Q6 == 2, Q6_Consolidated := `Q6 Research`]
dt[Q6 == 3, Q6_Consolidated := `Q6 Consultant`]
dt[Q6 == 6, Q6_Consolidated := `Q6 New Product`]

dt[Q6_Consolidated == 1, Verification := 5]
dt[Q6_Consolidated == 2, Verification := 4.5]
dt[Q6_Consolidated == 3, Verification := 4]
dt[Q6_Consolidated == 4, Verification := 3.5]
dt[Q6_Consolidated == 5, Verification := 2.5]

# Team Score Output
dt[, Total := Reflection + Requirements + Design + Teamwork + Communication + Verification]
# dt[,.(Team=Q16, Name=Q17, Reflection, Requirements, Design, Teamwork, Communication, Verification, Total,IndividualStudents=`Q7 Names`, IndividualNotes=`Q7 Comments`, GeneralNotes=Q8)]
fwrite(dt[,.(Team=Q16, Name=Q17, Reflection, Requirements, Design, Teamwork, Communication, Verification, Total,IndividualStudents=`Q7 Names`, IndividualNotes=`Q7 Comments`, GeneralNotes=Q8)], "data/2024-12-13-pp-survey-processed.csv", row.names = FALSE)

# Individual Scores
# Q7: Do you have any specific concerns with one or more students on your team?

individual_concerns <- dt[Q7 == 1, .()]
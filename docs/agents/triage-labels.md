# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                                          |
| -------------------------- | -------------------- | ---------------------------------------------------------------- |
| `needs-triage`             | `needs-triage`       | Not yet triaged                                                  |
| `needs-info`               | `needs-info`         | Blocked on information from the reporter or maintainer           |
| `ready-for-agent`          | `ready-for-agent`    | Scoped tightly enough for an agent to finish in one session      |
| `ready-for-human`          | `ready-for-human`    | Needs a human: judgment, access, or an out-of-repo system        |
| `wontfix`                  | none: close as not planned | Will not be actioned                                       |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

The first four labels exist on GitHub with the descriptions above. For `wontfix`, close the issue with `gh issue close <n> --reason "not planned"` and apply no label.

## Priority

Every actionable issue carries one priority label, the same three the Task form offers:

| Label | Meaning |
| --- | --- |
| `p0-now` | Blocks the running term |
| `p1-next` | The current review cycle |
| `p2-later` | Waits |

`founders` marks course-design issues read against Graham's "How Universities Should Prepare Founders".

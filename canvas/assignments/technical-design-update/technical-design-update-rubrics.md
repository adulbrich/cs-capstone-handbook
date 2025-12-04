# Technical Design Update - Rubrics

## Change Log Quality and Traceability (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Clear, high-level entries documenting each revision with date, version/tag, sections changed, concise summary of edits, rationale/drivers, and named authors/subteam. Entries are precise and meaningful, showing how the document evolved.
- **Meets Expectations** (12 to >3.0 pts): Includes basic entries covering date, sections changed, and brief rationale. Authors included but minimally detailed. Changes understandable but lacking consistency.
- **Does Not Meet Expectations** (3 to >0 pts): Missing, incomplete, or unclear change log; no authors; entries too vague.

## System context and high-level architecture (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Clear, coherent system context and architecture (e.g., C4 level 1–2) with external actors, containers/components, connectors/protocols labeled. Boundaries and deployment assumptions stated. At least one well-labeled diagram with figure number, caption, and alt text.
- **Meets Expectations** (12 to >3.0 pts): Includes context and high-level architecture with major components and connectors. Data/control flow generally clear; some boundaries or deployment assumptions may be implied.
- **Does Not Meet Expectations** (3 to >0 pts): No cohesive system view or diagrams are missing, confusing, or inconsistent.

## Interfaces/APIs and data contracts (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Key interfaces/APIs identified with formal or well-structured contracts (OpenAPI/Proto/JSON schemas). Example requests/responses and common errors provided. Auth and versioning strategy explicit. Attached schema/spec files referenced.
- **Meets Expectations** (12 to >3.0 pts): Lists main interfaces/APIs with basic I/O descriptions and some schema details or examples. Mentions error handling and either auth or versioning.
- **Does Not Meet Expectations** (3 to >0 pts): Interfaces vague or incomplete; little schema detail or examples; error handling, auth, and versioning omitted.

## Component design and responsibilities (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Clear decomposition into components/services with responsibilities and boundaries. Shows how components relate to interfaces/APIs and key dependencies. Notes performance/scalability/ops considerations and 1–2 technical/integration risks linked to the risk register.
- **Meets Expectations** (12 to >3.0 pts): Describes main components and responsibilities with basic interfaces and dependencies. Some operational considerations mentioned. Component-specific risks present but loosely tied to register.
- **Does Not Meet Expectations** (3 to >0 pts): Component structure unclear or inconsistent; responsibilities and dependencies vague; little attention to performance or ops. Risks absent or generic.

## Technical and integration risk register (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Prioritized Technical & Integration Risk Register with at least five well-articulated project-specific risks (impact, likelihood, mitigation/acceptance). Risks consolidated and re-ranked into a system-level view with links to affected requirements/components/ADRs.
- **Meets Expectations** (12 to >3.0 pts): At least three relevant technical/integration risks with impact/likelihood and basic mitigation plans. Prioritization may be partial; links to requirements/components/ADRs may be incomplete.
- **Does Not Meet Expectations** (3 to >0 pts): Risk list missing, generic, or dominated by non-technical risks; little impact/likelihood assessment or mitigation provided.

## Design decisions and ADR linkage (15 pts)

- **Exceeds Expectations** (15 to >12.0 pts): Key design decisions documented with context, alternatives, rationale, and consequences. Links to ADRs or decision notes with clear status and PR/issue links showing adoption.
- **Meets Expectations** (12 to >3.0 pts): Lists key decisions with brief context and rationale and at least one ADR reference. Status or implementation links may be partial.
- **Does Not Meet Expectations** (3 to >0 pts): Important decisions undocumented or implied; no ADRs referenced; rationale and consequences unclear.

## Visual clarity and traceability (10 pts)

- **Exceeds Expectations** (10 to >8.0 pts): Diagrams legible and consistently styled with figure numbers, captions, and alt text. Naming/notation align between diagrams, text, and code. Includes traceability aid mapping risks, requirements, components, and ADRs.
- **Meets Expectations** (8 to >2.0 pts): Diagrams generally readable and labeled; cross-references exist. Some traceability present but may be partial.
- **Does Not Meet Expectations** (2 to >0 pts): Diagrams illegible, unlabeled, or missing; little or no traceability between risks, requirements, components, and decisions.

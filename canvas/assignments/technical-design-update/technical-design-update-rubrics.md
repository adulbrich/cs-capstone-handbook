# Technical Design Update - Rubrics

## Change log: present and usable (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Change log is present and contains the required information (date, version, sections changed, summary of changes, reason, authors).
- **Meets Expectations** (4 to >1.0 pts): Change log is present but inconsistent.
- **Does Not Meet Expectations** (1.0 to >0 pts): Change log missing.

## Architecture: system context and components/connectors (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Clear system context (e.g., C4 L1–L2) with actors, containers/components, and labeled connectors/protocols.
- **Meets Expectations** (4 to >1.0 pts): Major components/connectors shown; some labeling or clarity gaps.
- **Does Not Meet Expectations** (1.0 to >0 pts): No cohesive system view.

## Architecture: boundaries and deployment assumptions (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Boundaries and deployment assumptions are stated explicitly and match the described architecture.
- **Meets Expectations** (4 to >1.0 pts): Some boundaries/assumptions are implied but not fully stated.
- **Does Not Meet Expectations** (1.0 to >0 pts): Boundaries/assumptions missing.

## Architecture: diagram accessibility and labeling (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): At least one well-labeled diagram with figure number, caption, and alt text.
- **Meets Expectations** (3.2 to >0.8 pts): Diagram exists but figure/caption/alt text is incomplete.
- **Does Not Meet Expectations** (0.8 to >0 pts): Diagrams missing or unusable.

## Interfaces/APIs and data contracts: inventory and coverage (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Key interfaces/APIs are identified with clear ownership/scope.
- **Meets Expectations** (4 to >1.0 pts): Lists main interfaces but coverage is incomplete.
- **Does Not Meet Expectations** (1.0 to >0 pts): Interfaces vague or missing.

## Interfaces/APIs and data contracts: contracts and examples (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Contracts are formal or well-structured (OpenAPI/Proto/JSON Schema) with example requests/responses and common errors.
- **Meets Expectations** (4.8 to >1.0 pts): Basic I/O descriptions and some schema details or examples.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little schema detail and no useful examples.

## Interfaces/APIs and data contracts: auth, versioning, and error handling (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Auth and versioning strategy explicit; error handling conventions are clear.
- **Meets Expectations** (3.2 to >0.8 pts): Mentions error handling and either auth or versioning.
- **Does Not Meet Expectations** (0.8 to >0 pts): Auth/versioning/error handling omitted.

## Component design and responsibilities: decomposition and responsibilities (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Clear decomposition into components/services with responsibilities and boundaries.
- **Meets Expectations** (4.8 to >1.0 pts): Main components described but responsibilities/boundaries may be fuzzy.
- **Does Not Meet Expectations** (1.0 to >0 pts): Component structure unclear or inconsistent.

## Component design and responsibilities: dependencies and ops considerations (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Shows how components relate to interfaces/APIs and key dependencies; includes performance/scalability/ops considerations.
- **Meets Expectations** (4 to >1.0 pts): Dependencies mentioned; ops considerations are light.
- **Does Not Meet Expectations** (1.0 to >0 pts): Dependencies/ops largely omitted.

## Component design and responsibilities: component-specific risks linked (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): 1–2 technical/integration risks are tied to components and linked to the risk register.
- **Meets Expectations** (3.2 to >0.8 pts): Risks present but loosely tied.
- **Does Not Meet Expectations** (0.8 to >0 pts): Risks absent or generic.

## Technical and integration risk register: quantity and specificity (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Prioritized register with at least five project-specific technical/integration risks.
- **Meets Expectations** (4 to >1.0 pts): At least three relevant risks.
- **Does Not Meet Expectations** (1.0 to >0 pts): Risk list missing or generic.

## Technical and integration risk register: impact/likelihood and mitigation (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Each risk includes impact, likelihood, and mitigation/acceptance.
- **Meets Expectations** (4 to >1.0 pts): Basic mitigation exists but impact/likelihood is uneven.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little impact/likelihood assessment or mitigation.

## Technical and integration risk register: linkage and system-level consolidation (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Risks consolidated and re-ranked into a system-level view with links to affected requirements/components/ADRs.
- **Meets Expectations** (3.2 to >0.8 pts): Some links exist but consolidation/prioritization is partial.
- **Does Not Meet Expectations** (0.8 to >0 pts): No linkage.

## Decisions: decision documentation quality (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Key decisions documented with clear context and intended outcomes.
- **Meets Expectations** (4 to >1.0 pts): Decisions listed with brief context.
- **Does Not Meet Expectations** (1.0 to >0 pts): Important decisions undocumented or implied.

## Decisions: alternatives, rationale, and consequences (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Includes alternatives considered, rationale, and consequences/tradeoffs.
- **Meets Expectations** (4 to >1.0 pts): Some rationale provided; alternatives/tradeoffs light.
- **Does Not Meet Expectations** (1.0 to >0 pts): Rationale and consequences unclear.

## Decisions: ADR linkage and adoption evidence (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Links to ADRs/decision notes with clear status and PR/issue links showing adoption.
- **Meets Expectations** (3.2 to >0.8 pts): At least one ADR reference; implementation links partial.
- **Does Not Meet Expectations** (0.8 to >0 pts): No ADRs referenced.

## Visual clarity: diagram readability and consistency (3 pts)

- **Exceeds Expectations** (3 to >2.4 pts): Diagrams legible and consistently labeled; naming/notation align between diagrams, text, and code.
- **Meets Expectations** (2.4 to >0.6 pts): Diagrams generally readable; minor labeling inconsistencies.
- **Does Not Meet Expectations** (0.6 to >0 pts): Diagrams illegible, unlabeled, or missing.

## Traceability: mapping across artifacts (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Includes traceability aid mapping risks, requirements, components, and ADRs.
- **Meets Expectations** (4 to >1.0 pts): Some traceability exists but is partial.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little or no traceability.

## Writing: structure and readability (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Concise, well-structured, polished; uses clear headings and bullets; stays close to the expected core length (~3–8 pages) while still being complete; figures/tables improve skimmability and understanding.
- **Meets Expectations** (4 to >1.0 pts): Mostly clear with some structure; minor readability issues or slightly off-target length.
- **Does Not Meet Expectations** (1.0 to >0 pts): Hard to read; poorly structured.

## Writing: professionalism and clarity (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Professional tone; claims are precise and easy to follow; interfaces, risks, and decisions use consistent formatting and are written in verifiable language (reader can tell what is being asserted and what evidence/artifact supports it).
- **Meets Expectations** (4 to >1.0 pts): Generally clear; occasional ambiguity, inconsistent formatting, or awkward wording.
- **Does Not Meet Expectations** (1.0 to >0 pts): Unclear or unprofessional tone; inconsistent or confusing formatting and claims.

## Writing: accessibility (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Figures/tables are legible with short captions; link text is descriptive; private links include lightweight screenshots/snippets so graders can evaluate. (Required architecture diagram alt-text/caption expectations are assessed in the architecture diagram rubric items.)
- **Meets Expectations** (4 to >1.0 pts): Some accessibility practices are used; minor gaps (e.g., missing some captions, vague link text, or limited evidence for private links).
- **Does Not Meet Expectations** (1.0 to >0 pts): Inaccessible formatting or evidence not evaluable (e.g., illegible figures, vague links, or private links with no accessible backup).

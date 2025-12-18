# Technical Design Update - Rubrics

## Change log: completeness (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Each revision includes date, version/tag, and specific sections changed.
- **Meets Expectations** (4.8 to >1.0 pts): Most entries include date and sections changed; some details missing.
- **Does Not Meet Expectations** (1.0 to >0 pts): Missing, incomplete, or unclear change log.

## Change log: meaningful summary and rationale (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Entries include concise summaries and clear rationale/drivers that show how the document evolved.
- **Meets Expectations** (4 to >1.0 pts): Changes understandable but rationale is inconsistent or light.
- **Does Not Meet Expectations** (1.0 to >0 pts): Entries too vague to understand why changes were made.

## Change log: authorship and traceability (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Authors/subteam are named and traceability to issues/PRs/decisions is included where relevant.
- **Meets Expectations** (3.2 to >0.8 pts): Authors included but traceability is partial.
- **Does Not Meet Expectations** (0.8 to >0 pts): No authors and/or no traceability.

## Architecture: system context and components/connectors (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Clear system context (e.g., C4 L1–L2) with actors, containers/components, and labeled connectors/protocols.
- **Meets Expectations** (4.8 to >1.0 pts): Major components/connectors shown; some labeling or clarity gaps.
- **Does Not Meet Expectations** (1.0 to >0 pts): No cohesive system view.

## Architecture: boundaries and deployment assumptions (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Boundaries and deployment assumptions are stated explicitly and match the described architecture.
- **Meets Expectations** (4 to >1.0 pts): Some boundaries/assumptions are implied but not fully stated.
- **Does Not Meet Expectations** (1.0 to >0 pts): Boundaries/assumptions missing.

## Architecture: diagram accessibility and labeling (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): At least one well-labeled diagram with figure number, caption, and alt text.
- **Meets Expectations** (3.2 to >0.8 pts): Diagram exists but figure/caption/alt text is incomplete.
- **Does Not Meet Expectations** (0.8 to >0 pts): Diagrams missing or unusable.

## Interfaces: inventory and coverage (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Key interfaces/APIs are identified with clear ownership/scope.
- **Meets Expectations** (4 to >1.0 pts): Lists main interfaces but coverage is incomplete.
- **Does Not Meet Expectations** (1.0 to >0 pts): Interfaces vague or missing.

## Interfaces: contracts and examples (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Contracts are formal or well-structured (OpenAPI/Proto/JSON Schema) with example requests/responses and common errors.
- **Meets Expectations** (4.8 to >1.0 pts): Basic I/O descriptions and some schema details or examples.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little schema detail and no useful examples.

## Interfaces: auth, versioning, and error handling (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Auth and versioning strategy explicit; error handling conventions are clear.
- **Meets Expectations** (3.2 to >0.8 pts): Mentions error handling and either auth or versioning.
- **Does Not Meet Expectations** (0.8 to >0 pts): Auth/versioning/error handling omitted.

## Components: decomposition and responsibilities (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Clear decomposition into components/services with responsibilities and boundaries.
- **Meets Expectations** (4.8 to >1.0 pts): Main components described but responsibilities/boundaries may be fuzzy.
- **Does Not Meet Expectations** (1.0 to >0 pts): Component structure unclear or inconsistent.

## Components: dependencies and ops considerations (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Shows how components relate to interfaces/APIs and key dependencies; includes performance/scalability/ops considerations.
- **Meets Expectations** (4 to >1.0 pts): Dependencies mentioned; ops considerations are light.
- **Does Not Meet Expectations** (1.0 to >0 pts): Dependencies/ops largely omitted.

## Components: component-specific risks linked (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): 1–2 technical/integration risks are tied to components and linked to the risk register.
- **Meets Expectations** (3.2 to >0.8 pts): Risks present but loosely tied.
- **Does Not Meet Expectations** (0.8 to >0 pts): Risks absent or generic.

## Risk register: quantity and specificity (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Prioritized register with at least five project-specific technical/integration risks.
- **Meets Expectations** (4.8 to >1.0 pts): At least three relevant risks.
- **Does Not Meet Expectations** (1.0 to >0 pts): Risk list missing or generic.

## Risk register: impact/likelihood and mitigation (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Each risk includes impact, likelihood, and mitigation/acceptance.
- **Meets Expectations** (4 to >1.0 pts): Basic mitigation exists but impact/likelihood is uneven.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little impact/likelihood assessment or mitigation.

## Risk register: linkage and system-level consolidation (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Risks consolidated and re-ranked into a system-level view with links to affected requirements/components/ADRs.
- **Meets Expectations** (3.2 to >0.8 pts): Some links exist but consolidation/prioritization is partial.
- **Does Not Meet Expectations** (0.8 to >0 pts): No linkage.

## Decisions: decision documentation quality (6 pts)

- **Exceeds Expectations** (6 to >4.8 pts): Key decisions documented with clear context and intended outcomes.
- **Meets Expectations** (4.8 to >1.0 pts): Decisions listed with brief context.
- **Does Not Meet Expectations** (1.0 to >0 pts): Important decisions undocumented or implied.

## Decisions: alternatives, rationale, and consequences (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Includes alternatives considered, rationale, and consequences/tradeoffs.
- **Meets Expectations** (4 to >1.0 pts): Some rationale provided; alternatives/tradeoffs light.
- **Does Not Meet Expectations** (1.0 to >0 pts): Rationale and consequences unclear.

## Decisions: ADR linkage and adoption evidence (4 pts)

- **Exceeds Expectations** (4 to >3.2 pts): Links to ADRs/decision notes with clear status and PR/issue links showing adoption.
- **Meets Expectations** (3.2 to >0.8 pts): At least one ADR reference; implementation links partial.
- **Does Not Meet Expectations** (0.8 to >0 pts): No ADRs referenced.

## Visual clarity: diagram readability and consistency (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Diagrams legible and consistently labeled; naming/notation align between diagrams, text, and code.
- **Meets Expectations** (4 to >1.0 pts): Diagrams generally readable; minor labeling inconsistencies.
- **Does Not Meet Expectations** (1.0 to >0 pts): Diagrams illegible, unlabeled, or missing.

## Traceability: mapping across artifacts (5 pts)

- **Exceeds Expectations** (5 to >4.0 pts): Includes traceability aid mapping risks, requirements, components, and ADRs.
- **Meets Expectations** (4 to >1.0 pts): Some traceability exists but is partial.
- **Does Not Meet Expectations** (1.0 to >0 pts): Little or no traceability.

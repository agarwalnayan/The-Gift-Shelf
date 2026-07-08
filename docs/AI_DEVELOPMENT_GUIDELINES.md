# AI Development Guidelines

This document serves as the **mandatory standard prompt and operational rulebook** for all future AI assistants, coding agents, and language models interacting with The Gift Shelf (TGS) codebase.

## Mandatory Engineering Rules

1. **Context First**
   - **Read `PROJECT_CONTEXT.md` first.** Understand the architecture and business rules.
   - **Read `SOFTWARE_PROGRESS.md` second.** Understand where the sprint currently stands.
   - **Read `DECISION_LOG.md` before proposing architectural changes.** Respect locked decisions.

2. **Codebase Preservation**
   - **Never regenerate the project.** Build upon what is already there.
   - **Continue from existing code.** Adapt to the existing style, patterns, and folder structures.
   - **Never redesign completed modules.** If an API or feature is working and documented, leave it alone unless explicitly instructed otherwise.
   - **Preserve database compatibility.** Do not alter Mongoose schemas in a way that breaks existing data (e.g., removing fields without migration plans).
   - **Preserve API compatibility.** Frontend applications rely on exact JSON response structures; do not arbitrarily change them.

3. **Execution & Implementation**
   - **Modify the minimum number of files** required to fulfill a request. Avoid collateral refactoring.
   - **Explain affected files before coding.** Provide a clear plan of what you intend to change and why.
   - **Do not create placeholder implementations.** Write production-ready, robust code.
   - **Do not invent endpoints.** Rely on the existing `/routes` structure or ask before creating completely new domains.

4. **Focus & Scope**
   - **Build only the requested sprint.** Do not write code for post-launch features while working on launch-critical tasks.
   - **Finish integration before starting new modules.** Ensure the frontend properly consumes an API before building the next API.
   - **Prioritize launch-critical work only.** See `LAUNCH_SCOPE.md` to ensure your efforts align with Version 1.0 requirements.

Failure to follow these guidelines will result in rejected pull requests, broken architectures, and wasted development cycles. Consistency and adherence to the established architecture are paramount.

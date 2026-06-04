
# Project Coding Guidelines

# High Priority
- Never run any powershell / or any other scripts to capture screen shots.
- This is my company laptop and as per the company rules, Codex / ChatGpt / Claude / Gemini Or any other AI Agent as external agents and the screen captures you do as potencially hacking type. So please don't take screen shots in any circumstances.
- Also please don't run any scripts to change anything apart from the content inside unity-local folder.
- Donot add corrupted/non-ASCII section-divider symbols in comments or in any places. Always Keep the comments readable using simple ASCII text. Do not change any component logic, imports, API calls, template, service, or mock files while handling ASCII Text...

# Command Execution Rules
- NEVER use Bash, PowerShell, or any shell tool to run npm, ng, node, or any terminal commands.
- The user runs ALL commands themselves. Only tell the user what command to run — do not execute it.
- Never run builds. The user will run the build and report back if something goes wrong.

# Project Scope
- Primary work is inside uldb/ngx-unity/ only.
- Do not touch anything outside the unity-local folder.

# Dev Environment
- Angular 12.2.0, TypeScript 4.3.5, RxJS 6.6
- Node 14.17.6 — auto-configured via .bashrc when inside the unity-local folder.
- Plain npm install works. Do NOT suggest --legacy-peer-deps or any extra install flags.
- Do not modify the portable node setup.
- 3-tier local architecture:
  - Browser -> localhost:8091 (Proxy)
  - Proxy /customer/* -> localhost:3001 (Mock API -- Express + JSON files)
  - Proxy /* -> localhost:8090 (Angular static server)
- Proxy configs must remain in tools/proxy. Do not move or duplicate them.

## General
- Use existing project patterns. Do NOT introduce new abstractions unless explicitly requested.
- Keep changes small and scoped.
- Do not rename variables/functions unless required.
- Avoid clever code when straightforward code is enough.

## Angular
- Do not restructure or reorganize component logic unless explicitly asked.
- Do NOT add new shared helpers unless the same logic is needed in at least 2 places.
- Only modify HTML templates when the task explicitly requires it. Do not refactor templates unnecessarily.
- Keep service API mappings close to existing service style.
- ALWAYS follow existing naming conventions exactly. Do NOT invent new naming patterns for variables, methods, functions, constants, or enums.
- OnDestroy support variable should always be ngUnsubscribe. Don't take it as destroy$ or any other.
- Always declare interfaces with export keyword and import where ever is needed.

## SCSS
- NEVER write a custom CSS class if a Bootstrap utility class can achieve the same result.
- GRID IS STRICTLY BOOTSTRAP ONLY:
  - Multi-column layouts must use row + col-* (col-4, col-md-6, col-lg-3 etc.)
  - Side-by-side / flex layouts must use d-flex, justify-content-*, align-items-*, flex-wrap etc.
  - NEVER write custom CSS for display:flex, display:grid, float, or width percentages for layout.
- Before writing any custom SCSS, check if these Bootstrap utilities cover it:
  d-flex, p-*, m-*, text-*, fw-*, w-*, h-*, border-*, rounded,
  justify-content-*, align-items-*, flex-*, row, col-*
- Custom SCSS is ONLY allowed when Bootstrap utilities genuinely cannot achieve the result
  (e.g., specific pixel overrides, pseudo-elements, animations, hover effects).
- For paddings, margins, widths, colors - use existing Bootstrap utility patterns.
- Do not redesign UI unless requested.
- Use existing global classes as priority; if explicitly needed prefer scoped class changes.
- Avoid global style changes unless necessary.

## Mock Data
- Do not move mock APIs inside Angular apps.
- Keep mock file names aligned with endpoint names.
- Do NOT modify the API response shape. Preserve it exactly as-is.
- New mock endpoints go in tools/mock-api/customer/ matching the URL path structure.
- ALWAYS extend the mock server for missing data. Never add Angular-side workarounds to compensate for missing mock endpoints.

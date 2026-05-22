
# Project Coding Guidelines

## General
- Prefer existing project patterns over new abstractions.
- Keep changes small and scoped.
- Do not rename variables/functions unless required.
- Avoid clever code when straightforward code is enough.

## Angular
- Keep component logic readable and explicit.
- Avoid adding new shared helpers unless reused in multiple places.
- Prefer template changes only when needed.
- Keep service API mappings close to existing service style.
- Consider existing naming conventions while adding new varibales / methods / functions / constants / enums.
- OnDestroy support variable should always be ngUnsubscribe. Don't take it as destroy$ or any other.

## SCSS
- Mostly use bootstrap suported css unless it is explicitly needed.
- For paddings, margins, widths, colors - use existing patterns.
- Tyy to availd writing new css until & unless explicitly needed.
- Do not redesign UI unless requested.
- Use existing global classes as priority and if explicitly needed prefer scoped class changes.
- Avoid global style changes unless necessary.
- Keep spacing values simple and easy to tweak.

## Mock Data
- Do not move mock APIs inside Angular apps.
- Keep mock file names aligned with endpoint names.
- Preserve API response shape as much as possible.


# Project Build Guidelines
- Never run build for your side. I will be running and update you if something goes wrong.

# Rules for code suggestions:
- Do not move mock APIs inside Angular apps.
- Do not modify portable node setup.
- Proxy configs must remain in tools/proxy.
- Prefer extending mock server instead of adding workarounds in Angular.
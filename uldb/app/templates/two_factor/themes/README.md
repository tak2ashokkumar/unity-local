# Domain-driven login pages

The login page is chosen by request host. The main login page checks the
domain and loads a single self-contained portal page (its own styles +
template in ONE file). The real two_factor auth flow is unchanged, so every
page logs in identically.

## How it fits together

```
two_factor/core/login.html     MAIN page: checks domain, loads the portal page
  -> _base_login.html -> _base.html   outer shell + head assets (unchanged)

login_branding.py (templatetag)
  LOGIN_THEMES        theme id -> { template, brand, title, ... }
  DOMAIN_THEME_MAP    host -> theme id   (unmapped host -> 'default')
  {% login_theme request as theme %}

themes/_cerne.html       ONE file: Cerne styles + template
themes/_cerne-play.html  ONE file: Cerne Playground styles + template
```

A theme whose `template` is `None` renders the DEFAULT page (the original
markup in `core/login.html`, untouched).

Each portal page carries its own `<style>` inline and renders the real login
form with `{% include "two_factor/_wizard_forms.html" %}` (the two_factor
field renderer) plus its own Forgot-Password modal and, if `azure` is set,
the Azure AD button - so the file is fully self-contained.

## Current map

| Host              | Theme      | File                |
|-------------------|------------|---------------------|
| (anything else)   | default    | core/login.html     |
| cerne.unityone.ai | cerne      | `_cerne.html`       |
| play.unityone.ai  | cerne-play | `_cerne-play.html`  |

## Add a new portal login (plug and play)

1. Add a theme entry to `LOGIN_THEMES` in `login_branding.py` pointing
   `template` at the new single file, with `brand` logo, `title`, and any
   flags (e.g. `azure`, `links`, `assets`).
2. Map the host in `DOMAIN_THEME_MAP`.
3. Create the one theme file in this folder (styles + template). Render the
   login form with `{% include "two_factor/_wizard_forms.html" %}` so auth
   keeps working.
4. Put any images under `static/images/login/` and reference them from the
   theme config (`assets`) so the file stays lean.

Nothing in the two_factor view or the shared shell changes.

## Local preview

Domain switching cannot trigger on localhost, so when `DEBUG` is on you can
force a page with a query param:

```
http://localhost:8091/account/login/?login_theme=cerne
http://localhost:8091/account/login/?login_theme=cerne-play
http://localhost:8091/account/login/?login_theme=default
```

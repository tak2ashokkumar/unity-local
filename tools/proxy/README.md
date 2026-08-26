# Proxy - environments and sessions

`server.js` is the single place that decides where every front end gets its data:

| Environment | Backend                              | Session file            |
|-------------|--------------------------------------|-------------------------|
| `mock`      | http://localhost:3001 (local mock)   | none needed             |
| `sf`        | https://unity.unitedlayer.com        | `.cookie-sf`            |
| `ams`       | http://unity-ams.unitedlayer.com     | `.cookie-ams`           |
| `play`      | https://play.unityone.ai             | `.cookie-play`          |
| `alpha`     | https://alpha.unityone.ai            | `.cookie-alpha`         |

Pick one with the matching dev.sh alias (`mock-admin`, `sf-unity`, `play-mtp`, ...).
Never set `API_ENV` by hand.

One proxy process serves all three front ends at once:

    http://localhost:8091          ngx-unity
    http://localhost:8091/admin    admin panel
    http://localhost:8061          ngx-mtp

## Creating a session file (only for live environments)

These files are NOT in the repo and are gitignored - each one holds a live login, so
you create them yourself. They are never committed, printed or logged.

1. In Chrome, sign in to the environment you want (e.g. https://unity.unitedlayer.com).
2. Open DevTools (F12) -> **Application** tab -> Storage -> **Cookies** -> pick that site.
3. Copy the **Value** of two cookies: `sessionid` and `csrftoken`.
4. Create `tools/proxy/.cookie-<env>` containing ONE line in this format:

       sessionid=PASTE_SESSIONID_HERE; csrftoken=PASTE_CSRFTOKEN_HERE

   For the SF system that file is `tools/proxy/.cookie-sf`.
   (`prod` is still accepted as an alias for `sf`.)
5. Save. The file is re-read on every request, so refreshing an expired session does
   NOT need a proxy restart - just paste the new values and save.

Alternative: set the `ADMIN_COOKIE` environment variable to the same one-line string.
It takes precedence over the file.

## Checking what is active

    GET http://localhost:8091/__admin_env

returns `{ env, label, apiTarget, live, authenticated }`. The React admin also shows a
red LIVE banner whenever `live` is true.

Common answers:

| Symptom                                   | Meaning                                        |
|-------------------------------------------|------------------------------------------------|
| `401` + "session cookie is missing/expired" | no session file, or it expired - redo the steps |
| `403 Authentication credentials were not provided` | same - the backend saw an anonymous request |
| `502 ... (ETIMEDOUT)`                      | that host is unreachable from here (VPN?)      |

## Why a proxy at all

The browser cannot call these backends directly: `django-cors-headers` is disabled
server-side (no `Access-Control-Allow-Origin` is ever sent) and the Django session
cookie is `SameSite=Lax`, so it is not sent on cross-site requests. Proxying server-side
sidesteps both, and lets the proxy add the `X-CSRFToken` / `Origin` / `Referer` headers
that DRF's SessionAuthentication requires for writes.

**Writes on a live environment change real records.** See the write-safety rule in
`CLAUDE.md`.

# Backend Follow-up: Impersonation from MTP portal shares ONE session across the whole domain

Status: Open - needs backend / infra (Django + cookie scope)
Area: Multi-tenant portal impersonation ("Manage Tenant")
Owning layer: Backend (django-hijack + session cookie scope / reverse-proxy), NOT the ngx-mtp Angular app
Reported by: Ashok Kumar
Environment confirmed: LIVE sf -> https://cerne.unityone.ai (GET /__admin_env => { env: "sf", live: true, authenticated: true })
Verification method: read-only GETs through the local proxy (no writes performed)

---

## 1. Summary

Impersonating a tenant from the multi-tenant (MSP) portal uses one Django session,
identified by a single `sessionid` cookie that is scoped to the parent domain
`.cerne.unityone.ai`. That one cookie is shared by the MSP portal AND every tenant
subdomain. Because hijacking rotates / overwrites that single shared cookie, two
things break:

1. Starting an impersonation (subdomain) expires / replaces the MSP portal session.
2. Impersonating two tenants at the same time collapses both tabs onto a single
   tenant (the second one "becomes" the first).

Neither symptom is fixable in the Angular front end. The front end only calls
`window.open(...)`; it cannot set or scope the `Domain` attribute of the Django
session cookie.

---

## 2. How impersonation works today (confirmed)

Front end entry point - `impersonateTenant()`:
`uldb/ngx-mtp/src/app/mtp-tenants-mgmt/mtp-tenants-mgmt.component.ts:347`

```ts
impersonateTenant(tenant: TenantByGroupType) {
  if (tenant.absolute_url) {
    window.open(tenant.absolute_url, "_blank");
  } else {
    let impersonateUrl = `${window.location.protocol}//${window.location.host}/managed-base/?user=${tenant.user_uuid}`;
    window.open(impersonateUrl, "_blank");
  }
}
```

Backend mechanism: django-hijack
- `MTP_IMPERSONATE_USER = /hijack/<userId>/`
- `STOP_IMPERSONATING  = hijack/release-hijack/`
- (`uldb/ngx-mtp/src/app/shared/api-endpoint.const.ts:9` and `:133`)

Single global impersonation state in the UI (one session assumption):
- `user.isImpersonated` flag + single "Stop Impersonating" action
  (`uldb/ngx-mtp/src/app/app-main/app-main.component.html:35,46`;
   `uldb/ngx-mtp/src/app/app-level.service.ts:122`).

Observed redirect chain (from reporter):
```
MSP portal:   https://cerne.unityone.ai/msp
click Manage Tenant for user 7dd93f2a-c64b-4502-b9f7-74776f5cfedb
  -> https://cerne.unityone.ai/managed-base/?user=7dd93f2a-...
  -> https://7dd93f2a-c64b-4502-b9f7-74776f5cfedb.cerne.unityone.ai/managed-tenant-base/?user=7dd93f2a-...
  -> https://7dd93f2a-c64b-4502-b9f7-74776f5cfedb.cerne.unityone.ai/main#/   (single-tenant portal)
```
Note: the impersonation SUBDOMAIN label equals the tenant's `user_uuid`.
So each tenant already gets its own distinct subdomain/origin.

---

## 3. Live evidence (sf = cerne.unityone.ai)

Tenant groups: `GET /customer/mtp/mtpgroup/`
- `1UnityDemo-SF` = ca006ae2-3e27-4feb-b980-9c6e973cea45
- `2UnityDemo-EU` = b3e43e2d-d8bd-486e-82c4-10a33115b258

Tenant list: `GET /customer/mtp/mtpgroup/<uuid>/get_tenant_list/`
(fields trimmed to name / user_uuid / absolute_url):

| Tenant             | user_uuid                              | absolute_url |
|--------------------|----------------------------------------|--------------|
| UnityOne Demo      | 2f164f2f-a48f-4fbd-b674-2cb54e8da478   | null         |
| UnitedLayer Sales  | 7dd93f2a-c64b-4502-b9f7-74776f5cfedb   | null         |
| UPC Demo           | 4635d906-70e5-480a-885e-a788fb27329a   | null         |
| UPC Demo Backup    | 1f58349f-611c-4cad-a8a9-0fe1b4d0242b   | null         |
| Tenant3- EU        | d5de7cb8-345b-4f29-b334-75014c8f8989   | null         |

Key finding: `absolute_url` is `null` for EVERY live tenant, so the front end always
takes the `/managed-base/?user=<user_uuid>` fallback branch, which is what redirects
to the `<user_uuid>.cerne.unityone.ai` subdomain.

---

## 4. Root cause

The Django session cookie (`sessionid`) is scoped to the PARENT domain
`.cerne.unityone.ai` (i.e. `SESSION_COOKIE_DOMAIN = ".cerne.unityone.ai"` or
equivalent). A parent-domain cookie is sent to, and can be overwritten by, the parent
domain and ALL of its subdomains. There is therefore effectively ONE browser session
for the entire `*.cerne.unityone.ai` tree.

### Symptom 1 - MSP session expires when a tenant subdomain starts
django-hijack logs in as the target user, which rotates the Django session key
(session-fixation protection re-issues `sessionid`). Because the cookie is the shared
parent-domain cookie, the rotated value overwrites the exact cookie the MSP portal was
using. The MSP tab's prior session key is now invalid -> MSP portal reads as
logged out / "session expired".

### Symptom 2 - two simultaneous impersonations collapse to one tenant
Each tenant opens its own subdomain, BUT every subdomain reads/writes the same shared
parent-domain `sessionid`. There is only one session object.
- Impersonate A -> shared session = hijacked-as-A.
- Impersonate B (around the same time) -> django-hijack blocks a second hijack while
  one is already active (release required first). B's subdomain then loads under the
  still-active A session -> B tab shows A. (If re-hijack were allowed instead, the one
  shared session flips to B and A's tab also becomes B on its next request.)
- Matches the reported behaviour: "the second loaded one is changing to the first one."

Because each tenant already has a unique subdomain, the ONLY reason concurrent
impersonations do not work independently is the shared (parent-domain-scoped) cookie.

---

## 5. Recommended fix (backend / infra)

Make the session cookie NOT shared across the domain tree. Preferred:

1. Give each impersonated subdomain a HOST-ONLY session cookie.
   - Do not set `SESSION_COOKIE_DOMAIN` to the shared parent `.cerne.unityone.ai` for
     the tenant-subdomain app; let it default to the exact host so
     `7dd93f2a-....cerne.unityone.ai` keeps its own `sessionid`, separate from the MSP
     portal and from every other tenant subdomain.
   - This fixes BOTH symptoms at once: the MSP portal keeps its own cookie (symptom 1),
     and each tenant subdomain owns an independent session (symptom 2).

Alternatives / belt-and-suspenders:
2. Use a distinct session cookie name for the impersonated single-tenant app vs the MSP
   portal, so they cannot overwrite each other.
3. Move impersonation to a per-tab / token-based session instead of a shared cookie.

Cross-check during the fix:
- `SESSION_COOKIE_DOMAIN`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_SAMESITE` for both the
  MSP app and the tenant-subdomain app.
- The reverse proxy / wildcard-subdomain config that performs the
  `/managed-base -> <user_uuid>.cerne.unityone.ai/managed-tenant-base` rewrite.
- django-hijack's "already hijacked" guard behaviour under the new cookie scope.

---

## 6. Front-end note (ngx-mtp) - cannot fix the root cause

- The front end only opens a URL; it cannot control cookie `Domain` scope, so this is
  not resolvable in ngx-mtp.
- Possible UX-only mitigations (do NOT resolve the architecture): enforce a single
  active impersonation at a time, or route "Manage Tenant" through release-then-hijack.
- Housekeeping noticed while tracing (separate from this bug):
  - Dead code: `MtpTenantsMgmtDetailsService.impersonate(userId)` (POST /hijack/<id>/)
    plus the commented-out Impersonate button in the details template are unused; the
    only live path is `impersonateTenant()` in the list component.

---

## 7. One remaining confirmation (quick, read-only)

To nail the cookie scope beyond inference, in the reporter's real browser:
1. Start one impersonation.
2. DevTools -> Application -> Cookies.
3. Inspect `sessionid` on both `cerne.unityone.ai` and
   `<user_uuid>.cerne.unityone.ai` and read its `Domain` column.
   - `Domain = .cerne.unityone.ai` (leading dot / parent) => confirms this root cause.
   - `Domain = <user_uuid>.cerne.unityone.ai` (host-only) => the sharing is happening
     elsewhere and needs a different look.
This is read-only; do not perform it on production without the usual approval.

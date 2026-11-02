# DNS diagnosis — 2026-11-01

## Current state

- `sportixpartners.com` is registered with Manus and its DNS is managed through Global Domain Group nameservers:
  - `ns1.globaldomaingroup.com`
  - `ns2.globaldomaingroup.com`
- The SPORTIX website currently has the apex custom domain `sportixpartners.com` connected in Manus.
- The existing `www` DNS record is a CNAME to `sportix-app.netlify.app` with a 1-minute TTL. This is an obsolete Netlify destination and prevented Manus from creating a `www` subdomain.
- Manus domain connection returned the exact error: `host 'www' has CNAME record, cannot add other record types`.

## Intended remediation

1. Delete only the obsolete `www` CNAME pointing to `sportix-app.netlify.app`.
2. Add `www` as a subdomain of the Manus-registered `sportixpartners.com` domain in the SPORTIX website’s Domains settings.
3. Let Manus create the required DNS target and provision HTTPS.
4. Set `www.sportixpartners.com` as primary if the Domains interface presents a primary-domain choice.
5. Verify public DNS, TLS certificate, redirect behaviour, and NDA email URL reachability.

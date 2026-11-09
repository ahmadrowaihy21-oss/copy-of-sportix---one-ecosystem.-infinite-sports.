# Email readiness — 9 November 2026

The default test suite is deterministic and does not use live Resend credentials.
Run `pnpm test` for local behavior and `pnpm test:email:live` explicitly for the
existing read-only provider checks. The live command fails when configuration is
missing; it does not silently skip readiness checks.

Required server-only environment variables:

- `RESEND_API_KEY`: valid Resend key for the intended deployment.
- `CONTACT_SENDER_EMAIL`: mailbox or `SPORTIX <mailbox>` on a verified sender domain.
- `CONTACT_RECIPIENT_EMAIL`: intended inquiry recipient.

Never put keys in VITE variables, source control, screenshots, or documentation.
For Netlify deployments, runtime variables require Functions scope and redeploy.
The repository uses a persistent Express server; do not deploy only dist/public
and assume the authentication/email API is running.

Local evidence: baseline 72 pass / 4 fail / 3 skipped; changed suite 91 pass.
TypeScript check and production build passed. The 18 new behavior checks cover
provider rejection, timeout, malformed/null/empty acceptance IDs, and bounded
requests across inquiries, verification and password reset. A provider acceptance
ID is not evidence of inbox delivery. No test email was sent by this change.

Live checks: six configuration checks fail in this workspace without configuration.
These legacy checks use GET /domains and require a key allowed to list domains;
a sending-only key may be valid for sending but fail that diagnostic. Passing the
command is not a complete delivery test or proof the sender domain is verified.

Before marking production ready, use the actual running backend and its intended
secret store: verify domain, send to an owned test mailbox, confirm receipt, then
exercise registration, one-time verification, login/logout, password reset,
expired/reused codes, and forbidden admin access. Record deployment ID, timestamp,
provider ID and delivery evidence without copying OTPs or secrets.

This branch is not a production deployment, SAP/Oracle/SkillCorner integration,
or a complete SPORTIX ecosystem implementation.

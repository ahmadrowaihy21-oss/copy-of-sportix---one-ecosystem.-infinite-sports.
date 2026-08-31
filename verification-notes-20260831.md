# Verification notes — 2026-08-31

- The preview root opened an authenticated administrator session in My Browser, so the public Individual Access visual state was not available in that session.
- `/partner-access` rendered the Partner Gateway with separate `LOG IN` and `SIGN UP` actions.
- No NDA wording or NDA acceptance control appeared in the Partner Gateway landing state.
- Follow-up verification is needed for the registration form fields, password recovery link, and email OTP state.

- The Partner Gateway landing state still shows separate LOG IN and SIGN UP buttons. Two click attempts on SIGN UP timed out in the connected browser extension, so form interaction will be verified through source-level tests and a later browser refresh if needed.

- Keyboard focus reached the Partner Gateway controls, confirming the SIGN UP action is in the rendered DOM and keyboard navigation is available. The connected extension timed out again when activating it, so the registration and recovery UI are covered by source-level Vitest tests.

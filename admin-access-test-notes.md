# Admin Access Test Notes

- The project owner’s Manus session reached `/admin/memberships` and loaded protected membership data.
- The owner-facing home page displayed the **Control Room** entry point.
- The administrator could view a verified pending applicant’s organisation, registration profile, verification state, access-level selector, and approval/rejection controls.
- An approval action on the demo applicant completed successfully and changed its membership status to `approved`.
- The original Active filter omitted `approved` records. The query has been corrected to return both `approved` and legacy `active` records; focused automated checks passed.
- The demo applicant was reset to `pending_approval` to complete a controlled rejection test.
- The administrator page was reloaded after a transient browser-rendering interruption; protected Control Room content continued to be available.
- The pending applicant was visible again to the authenticated project owner after the connection recovered, ready for the authorised rejection check.
- A transient browser-extension timeout occurred while reopening the applicant detail; the test will resume from the same protected route without touching non-demo accounts.
- A later refresh returned the owner browser to the Control Room sign-in state, so the final check includes re-establishing the Manus administrative session before resuming the demo-only rejection test.
- The owner session again loaded the pending applicant’s protected detail view, including verified email, organisation details, access-level choices, and the live approval and rejection actions.
- The authorised **Reject** action completed for the demo applicant and removed it from the pending-approval view; the next check verifies the rejected-record filter before resetting the demo account.
- The Rejected filter was selected after the decision; a transient browser-extension timeout delayed the rendered confirmation, so database state is checked before the final reset.
- After the Hooks fix, the owner session reached the private Contact Inquiries dashboard without the former React render error; the dashboard rendered its protected layout and zero-record state before a later extension timeout.
- The partner gateway now exposes a separate `PROJECT ADMIN? SIGN IN WITH MANUS` action. Its component test confirmed it invokes only the Manus sign-in flow and does not send the project owner through partner-password authentication.
- The targeted test suite, TypeScript check, and production build passed. Two subsequent owner-browser inspection attempts timed out, so the visual follow-up remains available to the owner through the new explicit action.

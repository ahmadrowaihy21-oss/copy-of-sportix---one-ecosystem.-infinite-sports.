import type { Express } from "express";
import { parse as parseCookie } from "cookie";
import { getActivePartnerSession, getPartnerNdaApplicationForAccountId } from "./db";
import { PARTNER_SESSION_COOKIE, hashPartnerSessionToken } from "./partnerAuth";
import { sdk } from "./_core/sdk";

const protectedPartnerPaths = new Set(["/", "/profile", "/opportunity", "/go-sportix", "/marketplace", "/marketplace/cart", "/marketplace/checkout"]);

export function partnerPendingRoute(status: string) {
  return status === "pending_nda" ? "/partner-access/nda" : "/partner-access/pending";
}

export function registerPartnerAccessGuard(app: Express) {
  app.use(async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/admin/")) {
      try {
        const user = await sdk.authenticateRequest(req);
        if (user.role === "admin") return next();
      } catch {
        // The redirect below sends unauthenticated email-link visitors to the admin login screen.
      }
      const returnTo = `${req.path}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
      res.redirect(302, `/admin/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!protectedPartnerPaths.has(req.path)) return next();
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.role === "admin") return next();
    } catch {
      // A valid partner session is checked below; ordinary Manus users do not bypass approval.
    }
    const partnerToken = parseCookie(req.headers.cookie ?? "")[PARTNER_SESSION_COOKIE];
    const session = partnerToken ? await getActivePartnerSession(hashPartnerSessionToken(partnerToken)).catch(() => null) : null;
    if (!session) {
      res.redirect(302, "/partner-access");
      return;
    }
    if (session.account.status !== "approved") {
      res.redirect(302, partnerPendingRoute(session.account.status));
      return;
    }
    const ndaApplication = await getPartnerNdaApplicationForAccountId(session.account.id).catch(() => null);
    if (!ndaApplication || ndaApplication.ndaStatus !== "approved" || ndaApplication.accountStatus !== "approved" || ndaApplication.accessStatus !== "granted") {
      res.redirect(302, "/partner-access/pending");
      return;
    }
    next();
  });
}

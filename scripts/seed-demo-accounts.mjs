import { eq } from "drizzle-orm";
import { partnerAccounts, users } from "../drizzle/schema.ts";
import { getDb } from "../server/db.ts";
import { DEMO_ADMINISTRATOR_NAME, DEMO_APPLICANT_EMAIL, DEMO_PARTNER_EMAIL, createApprovedDemoPartner, createPendingDemoApplicant } from "../server/demoAccounts.ts";
import { ENV } from "../server/_core/env.ts";
import { hashPartnerPassword } from "../server/partnerAuth.ts";

const password = process.argv[2];

if (!password || password.length < 12) {
  throw new Error("Supply a demo partner password of at least 12 characters.");
}

if (!ENV.ownerOpenId) {
  throw new Error("OWNER_OPEN_ID is required to prepare the project administrator account.");
}

const db = await getDb();
if (!db) {
  throw new Error("The database connection is not available.");
}

const now = new Date();
await db
  .insert(users)
  .values({
    openId: ENV.ownerOpenId,
    name: DEMO_ADMINISTRATOR_NAME,
    loginMethod: "manus",
    role: "admin",
    lastSignedIn: now,
  })
  .onDuplicateKeyUpdate({
    set: { role: "admin", lastSignedIn: now },
  });

const partner = createApprovedDemoPartner(await hashPartnerPassword(password));
await db
  .insert(partnerAccounts)
  .values(partner)
  .onDuplicateKeyUpdate({
    set: {
      fullName: partner.fullName,
      passwordHash: partner.passwordHash,
      companyName: partner.companyName,
      jobTitle: partner.jobTitle,
      age: partner.age,
      gender: partner.gender,
      weeklySportFrequency: partner.weeklySportFrequency,
      currentSports: partner.currentSports,
      aspirationalSport: partner.aspirationalSport,
      sportsChallenges: partner.sportsChallenges,
      sportsSolutionIdea: partner.sportsSolutionIdea,
      status: "approved",
      emailVerified: true,
      emailVerifiedAt: now,
      verificationMethod: "test_seed",
      verificationStatus: "verified",
      accessLevel: "level_1",
    },
  });

const applicant = createPendingDemoApplicant(await hashPartnerPassword(password));
await db
  .insert(partnerAccounts)
  .values(applicant)
  .onDuplicateKeyUpdate({
    set: {
      fullName: applicant.fullName,
      passwordHash: applicant.passwordHash,
      companyName: applicant.companyName,
      jobTitle: applicant.jobTitle,
      age: applicant.age,
      gender: applicant.gender,
      weeklySportFrequency: applicant.weeklySportFrequency,
      currentSports: applicant.currentSports,
      aspirationalSport: applicant.aspirationalSport,
      sportsChallenges: applicant.sportsChallenges,
      sportsSolutionIdea: applicant.sportsSolutionIdea,
      status: "pending_approval",
      emailVerified: true,
      emailVerifiedAt: now,
      verificationMethod: "test_seed",
      verificationStatus: "verified",
      accessLevel: "level_1",
    },
  });

const [administrator] = await db.select({ role: users.role }).from(users).where(eq(users.openId, ENV.ownerOpenId)).limit(1);
const [demoPartner] = await db.select({ email: partnerAccounts.email, status: partnerAccounts.status, emailVerified: partnerAccounts.emailVerified, accessLevel: partnerAccounts.accessLevel }).from(partnerAccounts).where(eq(partnerAccounts.email, DEMO_PARTNER_EMAIL)).limit(1);
const [demoApplicant] = await db.select({ email: partnerAccounts.email, status: partnerAccounts.status, emailVerified: partnerAccounts.emailVerified }).from(partnerAccounts).where(eq(partnerAccounts.email, DEMO_APPLICANT_EMAIL)).limit(1);

if (administrator?.role !== "admin" || demoPartner?.status !== "approved" || !demoPartner.emailVerified || demoPartner.accessLevel !== "level_1" || demoApplicant?.status !== "pending_approval" || !demoApplicant.emailVerified) {
  throw new Error("Demo-account verification failed.");
}

console.log(JSON.stringify({ administratorRole: administrator.role, partnerEmail: demoPartner.email, partnerStatus: demoPartner.status, partnerAccessLevel: demoPartner.accessLevel, applicantEmail: demoApplicant.email, applicantStatus: demoApplicant.status }));

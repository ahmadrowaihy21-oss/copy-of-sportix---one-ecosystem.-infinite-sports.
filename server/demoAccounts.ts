import type { InsertPartnerAccount } from "../drizzle/schema";

export const DEMO_PARTNER_EMAIL = "demo.partner@sportix.test";
export const DEMO_PARTNER_NAME = "SPORTIX Demo Partner";
export const DEMO_APPLICANT_EMAIL = "demo.applicant@sportix.test";
export const DEMO_APPLICANT_NAME = "SPORTIX Demo Applicant";
export const DEMO_ADMINISTRATOR_NAME = "SPORTIX Project Administrator";

export function createApprovedDemoPartner(passwordHash: string): InsertPartnerAccount {
  return {
    fullName: DEMO_PARTNER_NAME,
    email: DEMO_PARTNER_EMAIL,
    passwordHash,
    companyName: "SPORTIX Test Organisation",
    jobTitle: "Demo Partner",
    age: 28,
    gender: "male",
    weeklySportFrequency: "3-4",
    currentSports: "Football and strength training",
    aspirationalSport: "Cycling",
    sportsChallenges: "Testing the SPORTIX partner access journey.",
    sportsSolutionIdea: "Use SPORTIX to coordinate community sport opportunities.",
    status: "approved",
    emailVerified: true,
    emailVerifiedAt: new Date(),
    verificationMethod: "test_seed",
    verificationStatus: "verified",
    accessLevel: "level_1",
  };
}

export function createPendingDemoApplicant(passwordHash: string): InsertPartnerAccount {
  return {
    ...createApprovedDemoPartner(passwordHash),
    fullName: DEMO_APPLICANT_NAME,
    email: DEMO_APPLICANT_EMAIL,
    companyName: "SPORTIX Applicant Organisation",
    jobTitle: "Membership Applicant",
    status: "pending_approval",
    accessLevel: "level_1",
  };
}

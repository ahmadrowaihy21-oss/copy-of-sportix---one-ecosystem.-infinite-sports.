export function canBypassPartnerGateway(role: "admin" | "user" | null | undefined): boolean {
  return role === "admin";
}

export function canEnterApprovedUserSpace(
  role: "admin" | "user" | null | undefined,
  accessStatus: "pending" | "approved" | "rejected" | "suspended" | null | undefined,
): boolean {
  return role === "user" && accessStatus === "approved";
}

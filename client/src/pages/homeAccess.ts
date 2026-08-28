export function canBypassPartnerGateway(role: "admin" | "user" | null | undefined): boolean {
  return role === "admin";
}

export function canEnterRegisteredUserSpace(
  role: "admin" | "user" | null | undefined,
): boolean {
  return role === "user";
}

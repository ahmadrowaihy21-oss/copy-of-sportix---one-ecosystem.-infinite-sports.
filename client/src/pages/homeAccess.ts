export function canBypassPartnerGateway(role: "admin" | "user" | null | undefined): boolean {
  return role === "admin";
}

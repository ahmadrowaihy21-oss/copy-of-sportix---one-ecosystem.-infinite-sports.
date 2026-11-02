export function isPartnerGatewayPath(location: string): boolean {
  return location === "/partner-access";
}

export function isAdminPath(location: string): boolean {
  return location.startsWith("/admin/");
}
